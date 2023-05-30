<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusquedaCalendarios" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="calendarios"
          exported-file-name="Calendarios"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearCalendarioModal
      :show="isModalCrearActivo"
      @cerrar="handleCierreModalCrud"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />

    <EditarCalendarioModal
      :show="isModalEditarActivo"
      @cerrar="handleCierreModalCrud"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :calendarioSeleccionado="calendarioSeleccionado"
    />

    <VerDetalleCalendarioModal
      :show="isModalVerDetalleActivo"
      @cerrar="handleCierreModalCrud"
      :calendarioSeleccionado="calendarioSeleccionado"
    />

    <Confirmation
      :show="isConfirmacionEliminarActivo"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              <v-card-text v-if="eliminaIndividual">{{
                tituloEliminar
              }}</v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaIndividual">{{
              mensajeEliminaIndividual
            }}</v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              depressed
              small
              @click="dialogErrorAsoc = false"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import { fetchCalendarios } from '@/pantallas/Calendarios/fetchCalendarios';
import { Calendario as CalendarioType } from '@/pantallas/Calendarios/Calendario';
import CrearCalendarioModal from '@/pantallas/Calendarios/CrearCalendarioModal.vue';

import { eliminarCalendario } from '@/pantallas/Calendarios/eliminarCalendario';

import EditarCalendarioModal from '@/pantallas/Calendarios/EditarCalendarioModal.vue';
import VerDetalleCalendarioModal from '@/pantallas/Calendarios/VerDetalleCalendarioModal.vue';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearCalendarioModal,
    EditarCalendarioModal,
    VerDetalleCalendarioModal,
  },
})
export default class Calendarios extends ComponenteBase {
  /* ComponenteBase */
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);

  readonly funcionalidad: Funcionalidades = Funcionalidades.Calendarios;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombreCalendario',
        hide: true,
        suppressToolPanel: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombreCalendario',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
      },
      creadoPorColumnDefs('usuarioCreador'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModifica'),
      {
        ...fechaModificacionColumnDefs('fechaModificacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
    ].map(x => ({
      width: 200,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassCalendarios,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  calendarios: CalendarioType[] = [];
  calendarioSeleccionado: CalendarioType = null;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVerDetalle: boolean = false;
  busquedaGrillaCalendarios: string = '';

  modalCrudActivo: OperacionesCrud = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  tituloEliminar: any = '';

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassCalendarios(node: RowNode): boolean {
    if (
      this.calendarios.length > 0 &&
      this.busquedaGrillaCalendarios.length > 1
    ) {
      let busqueda = this.busquedaGrillaCalendarios;

      return (
        node.data.nombreCalendario.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreador.toLowerCase().includes(busqueda) ||
        node.data.usuarioModifica.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaCreacion)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaModificacion)
          .format('DD/MM/YYYY')
          .includes(busqueda)
      );
    }

    return true;
  }

  /* event handlers */

  handleBusquedaCalendarios(consulta: string) {
    this.busquedaGrillaCalendarios = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.calendarios = (await this.fetchCalendarios()) || [];
    this.gridApi.setRowData(this.calendarios);
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.calendarioSeleccionado = params.data;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.calendarioSeleccionado = params.data;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.calendarioSeleccionado = params.data;
    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Calendario',
      nombreEntidad: self.calendarioSeleccionado.nombreCalendario,
    });
    const totalAsociados = self.calendarioSeleccionado.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Calendario',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Calendario: ' + self.calendarioSeleccionado.nombreCalendario;
      this.modalCrudActivo = OperacionesCrud.eliminar;
    } else {
      this.mensajeEliminaIndividual =
        'El Calendario tiene ' +
        (totalAsociados > 1
          ? 'asociaciones activas, '
          : 'una asociación activa, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
    }
  }

  handleCierreModalCrud() {
    this.modalCrudActivo = null;
  }

  handleCierreModalBtnGuardar() {
    this.modalCrudActivo = null;
    this.recargarCalendarios();
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.handleCierreModalCrud();
    if (!isConfirmado) {
      return;
    }
    await this.eliminarCalendario(this.calendarioSeleccionado);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { calendarioSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Calendario',
      nombreEntidad: calendarioSeleccionado
        ? calendarioSeleccionado.nombreCalendario
        : '',
    });
  }

  /* tabla */
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }

  async recargarCalendarios() {
    this.calendarios = (await this.fetchCalendarios()) || [];
    this.gridApi.setRowData(this.calendarios);
  }

  /* util */

  fetchCalendarios() {
    this.loadingService.showLoading();
    return fetchCalendarios()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los calendarios. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarCalendario(calendario: CalendarioType) {
    this.loadingService.showLoading();
    return eliminarCalendario(calendario)
      .then(() => {
        this.recargarCalendarios();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            nombre: this.calendarioSeleccionado.nombreCalendario,
            entidad: 'El Calendario',
            eliminadaO: 'eliminado',
          })
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el calendario: ${calendario.nombreCalendario}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  /* Getters*/
  get isModalCrearActivo() {
    return this.modalCrudActivo === OperacionesCrud.crear;
  }

  get isModalEditarActivo() {
    return this.modalCrudActivo === OperacionesCrud.editar;
  }

  get isModalVerDetalleActivo() {
    return this.modalCrudActivo === OperacionesCrud.consultar;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }
}
</script>

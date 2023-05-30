<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusqueda" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="tiposDispositivo"
          exported-file-name="TipoDeDispositivo"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="TipoDispositivo"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar($event)"
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
              <v-card-text v-if="eliminaIndividual">
                {{ tituloEliminar }}
              </v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaMasivo">
              {{ mensajeEliminaMasivo }}
            </v-card-text>
            <v-card-text v-if="eliminaIndividual">
              {{ mensajeEliminaIndividual }}
            </v-card-text>
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

    <CrearTipoDispositivoModal
      v-if="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />

    <EditarTipoDispositivoModal
      v-if="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :tipoSeleccionado="tipoSeleccionado"
    />

    <VerDetalleTipoDispositivoModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :tipoSeleccionado="tipoSeleccionado"
    />
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
import { fetchTiposDispositivo } from '@/pantallas/TipoDispositivo/fetchTiposDeDispositivos';
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
import { TipoDispositivo as TipoDispositivoType } from '@/pantallas/TipoDispositivo/TipoDispositivo';
import { eliminarTipoDispositivo } from '@/pantallas/TipoDispositivo/eliminarTipoDispositivo';
import CrearTipoDispositivoModal from '@/pantallas/TipoDispositivo/CrearTipoDispositivoModal.vue';
import EditarTipoDispositivoModal from '@/pantallas/TipoDispositivo/EditarTipoDispositivoModal.vue';
import VerDetalleTipoDispositivoModal from '@/pantallas/TipoDispositivo/VerDetalleTipoDispositivoModal.vue';
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
    CrearTipoDispositivoModal,
    EditarTipoDispositivoModal,
    VerDetalleTipoDispositivoModal,
  },
})
export default class TipoDispositivo extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoDeDispositivo;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Marca',
        field: 'marca',
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
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
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassTipoDispositivo,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  tiposDispositivo: TipoDispositivoType[] = [];
  tipoSeleccionado: TipoDispositivoType = null;
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVerDetalle: boolean = false;
  busquedaGrilla: string = '';

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  eliminaMasivo: Boolean = false;
  tituloEliminar: any = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassTipoDispositivo(node: RowNode): boolean {
    if (this.tiposDispositivo.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.marca.toLowerCase().includes(busqueda) ||
        node.data.modelo.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
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

  handleBusqueda(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.tiposDispositivo = (await this.fetchTipos()) || [];
    this.gridApi.setRowData(this.tiposDispositivo);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.recargarTipos();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.tipoSeleccionado = params.data;
    this.mostrarModalVerDetalle = true;
  }

  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.tipoSeleccionado = params.data;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.tipoSeleccionado = params.data;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Tipo de Dispositivo',
      nombreEntidad: this.tipoSeleccionado.nombre,
    });
    if (this.tipoSeleccionado.totalAsociados > 0) {
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
      this.mensajeEliminaIndividual =
        'El Tipo de Dispositivo está asociado a ' +
        (this.tipoSeleccionado.totalAsociados > 1
          ? this.tipoSeleccionado.totalAsociados
          : 'un') +
        (this.tipoSeleccionado.totalAsociados > 1
          ? ' Dispositivos'
          : ' Dispositivo') +
        ', por está razón no se podrá realizar la eliminación';
      this.eliminaMasivo = false;
    } else {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Tipo de Dispositivo',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Tipo: ' + this.tipoSeleccionado.id;
      this.dialogEliminar = true;
    }
    this.mostrarConfirmacionEliminar = true;
    this.mostrarConfirmacionEliminar = true;
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    this.dialogEliminar = false;
    this.dialogErrorAsoc = false;
    if (!isConfirmado) {
      return;
    }
    await this.eliminarTipo(this.tipoSeleccionado);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { tipoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'El Tipo de Dispositivo ',
      nombreEntidad: tipoSeleccionado ? tipoSeleccionado.nombre : '',
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

  async recargarTipos() {
    this.tiposDispositivo = (await this.fetchTipos()) || [];
    this.gridApi.setRowData(this.tiposDispositivo);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  /* util */

  fetchTipos() {
    this.loadingService.showLoading();
    return fetchTiposDispositivo()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de dispositivos. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarTipo(tipo: TipoDispositivoType) {
    this.loadingService.showLoading();
    return eliminarTipoDispositivo(tipo)
      .then(() => {
        this.recargarTipos();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            nombre: this.tipoSeleccionado.nombre,
            entidad: 'El Tipo de Dispositivo',
            eliminadaO: 'eliminado',
          })
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el Tipo de Dispositivo: ${tipo.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }
}
</script>

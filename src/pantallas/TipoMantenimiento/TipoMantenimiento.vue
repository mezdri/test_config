<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="funcionFiltrar" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="lstTipoMantenimiento"
          exported-file-name="TiposDeMantenimiento"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <div class="gridcard rounded-card">
      <MantenedorGridTodos
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
        @gridOptionsEnriched="enrichedGridOptions = $event"
      />
    </div>
    <CrearTipoMantenimientoModal
      :show="mostrarModalCrear"
      @cerrar="handleCierreModalCrear"
    />
    <VerTipoMantenimientoModal
      :show="mostrarModalVer"
      :tipoMantenimientoSeleccionado="tipoMantenimientoSeleccionado"
      @cerrar="handleCierreModalVer"
    />
    <EditarTipoMantenimientoModal
      :show="mostrarModalEditar"
      :tipoMantenimientoSeleccionado="tipoMantenimientoSeleccionado"
      @cerrar="handleCierreModalEditar"
    />
    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Tipo de Mantenimiento',
        })
      "
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
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

import { LoadingService } from '@/services/loadingService';

import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';

import { TipoMantenimiento as TipoMantenimientoType } from '@/pantallas/TipoMantenimiento/TipoMantenimiento';
import { fetchTipoMantenimiento } from '@/pantallas/TipoMantenimiento/fetchTipoMantenimiento';
import { eliminarTipoMantenimiento } from '@/pantallas/TipoMantenimiento/eliminarTipoMantenimiento';

import CrearTipoMantenimientoModal from '@/pantallas/TipoMantenimiento/CrearTipoMantenimientoModal.vue';
import VerTipoMantenimientoModal from '@/pantallas/TipoMantenimiento/VerTipoMantenimientoModal.vue';
import EditarTipoMantenimientoModal from '@/pantallas/TipoMantenimiento/EditarTipoMantenimientoModal.vue';

import { EstadoEntidad, CategoriaTipoMantenimiento } from '@/config/enums';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import moment from 'moment';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearTipoMantenimientoModal,
    VerTipoMantenimientoModal,
    EditarTipoMantenimientoModal,
  },
})
export default class TipoMantenimiento extends ComponenteBase {
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

  readonly acciones: Accion[] = [
    'Crear - Información General',
    'Editar - Información General',
    'Ver Detalle - Información General',
    'Consultar',
    'Eliminar',
    'Exportar',
  ];

  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoMantenimiento;

  /* state */

  lstTipoMantenimiento: TipoMantenimientoType[] = [];
  tipoMantenimientoSeleccionado: TipoMantenimientoType = null;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVer: boolean = false;
  permisoAccion: PermisoAccion = null;

  /*Eliminar*/
  dialogEliminar: boolean = false;
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  tituloEliminar: any = '';

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Categoría',
        field: 'categoriaTipoMantenimientoTxt',
        width: 150,
        minWidth: 80,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        width: 150,
        minWidth: 80,
      },
      creadoPorColumnDefs('usuarioCreador'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModificacion'),
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
    doesExternalFilterPass: this.doesExternalFilterPass,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    if (
      this.lstTipoMantenimiento.length > 0 &&
      this.busquedaGrilla.length > 1
    ) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.categoriaTipoMantenimientoTxt
          .toLowerCase()
          .includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreador.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacion.toLowerCase().includes(busqueda) ||
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

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { tipoMantenimientoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Tipo de Mantenimiento',
      nombreEntidad: tipoMantenimientoSeleccionado
        ? tipoMantenimientoSeleccionado.nombre
        : '',
    });
  }

  /* util */

  fetchTipoMantenimiento() {
    this.loadingService.showLoading();
    return fetchTipoMantenimiento()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de mantenimiento',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarTipoMantenimiento(tipoMantenimiento: TipoMantenimientoType) {
    this.loadingService.showLoading();
    return eliminarTipoMantenimiento(tipoMantenimiento)
      .then(() => {
        this.buscarTipoMantenimiento();
        this.$snotify.success(
          'El Tipo de Mantenimiento ' +
            tipoMantenimiento.nombre +
            ' ha sido eliminado de forma exitosa',
          {
            timeout: 3000,
          }
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el tipo de mantenimiento: ${tipoMantenimiento.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async buscarTipoMantenimiento() {
    this.lstTipoMantenimiento = (await this.fetchTipoMantenimiento()) || [];
    this.gridApi.setRowData(this.lstTipoMantenimiento);
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

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.buscarTipoMantenimiento();
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModalCrear() {
    this.mostrarModalCrear = false;
    this.buscarTipoMantenimiento();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.tipoMantenimientoSeleccionado = params.data;
    this.mostrarModalVer = true;
  }

  handleCierreModalVer() {
    this.mostrarModalVer = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.tipoMantenimientoSeleccionado = params.data;
    this.mostrarModalEditar = true;
  }

  handleCierreModalEditar() {
    this.mostrarModalEditar = false;
    this.buscarTipoMantenimiento();
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.tipoMantenimientoSeleccionado = params.data;
    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Tipo de Mantenimiento',
      nombreEntidad: self.tipoMantenimientoSeleccionado.nombre,
    });
    const totalAsociados = self.tipoMantenimientoSeleccionado.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Tipo de Mantenimiento',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Tipo de Mantenimiento: ' +
        self.tipoMantenimientoSeleccionado.nombre;
      this.dialogEliminar = true;
      //this.modalCrudActivo = OperacionesCrud.eliminar;
    } else {
      this.mensajeEliminaIndividual =
        'El Tipo de Mantenimiento tiene ' +
        (totalAsociados > 1
          ? 'asociaciones activas, '
          : 'una asociación activa, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
    }
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.dialogEliminar = false;
    if (isConfirmado) {
      this.eliminarTipoMantenimiento(this.tipoMantenimientoSeleccionado);
    }
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
}
</script>

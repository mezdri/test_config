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
          :row-data="talleres"
          exported-file-name="Talleres"
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

    <CrearTallerModal
      v-if="mostrarModalCrear"
      @cerrar="handleCierreModalCrear"
    />

    <EditarTallerModal
      v-if="mostrarModalEditar"
      @cerrar="handleCierreModalEditar"
      :tallerSeleccionado="tallerSeleccionado"
    />

    <VerTallerModal
      v-if="mostrarModalVer"
      @cerrar="handleCierreModalVer"
      :tallerSeleccionado="tallerSeleccionado"
    />

    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Taller',
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
              <v-card-text v-if="eliminaIndividual">
                {{ tituloEliminar }}
              </v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
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

import { Taller as TallerType } from '@/pantallas/Taller/Taller';
import { fetchTalleres } from '@/pantallas/Taller/fetchTalleres';
import { eliminarTalleres } from '@/pantallas/Taller/eliminarTalleres';

import CrearTallerModal from '@/pantallas/Taller/CrearTallerModal.vue';
import EditarTallerModal from '@/pantallas/Taller/EditarTallerModal.vue';
import VerTallerModal from '@/pantallas/Taller/VerTallerModal.vue';

import { EstadoEntidad } from '@/config/enums';
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
    CrearTallerModal,
    EditarTallerModal,
    VerTallerModal,
  },
})
export default class PerfilesTransversal extends ComponenteBase {
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.Talleres;

  /* state */
  talleres: TallerType[] = [];
  tallerSeleccionado: TallerType = null;
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVer: boolean = false;
  permisoAccion: PermisoAccion = null;

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  tituloEliminar: any = '';
  dialogEliminar: boolean = false;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre o Razón Social',
        field: 'nombre',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Rut',
        field: 'rut',
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        width: 170,
        minWidth: 80,
      },
      creadoPorColumnDefs('usuarioCreacion'),
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
    if (this.talleres.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        node.data.rut.toLowerCase().includes(busqueda) ||
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
    const { tallerSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Taller',
      nombreEntidad: tallerSeleccionado ? tallerSeleccionado.nombre : '',
    });
  }

  /* util */

  fetchTalleres() {
    this.loadingService.showLoading();
    return fetchTalleres()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los talleres',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarTalleres(taller: TallerType) {
    this.loadingService.showLoading();
    return eliminarTalleres(taller)
      .then(() => {
        this.buscarTalleres();
        this.$snotify.success(
          'El Taller ' + taller.nombre + ' ha sido eliminado de forma exitosa',
          {
            timeout: 3000,
          }
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el taller: ${taller.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async buscarTalleres() {
    this.talleres = (await this.fetchTalleres()) || [];
    this.gridApi.setRowData(this.talleres);
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
    this.buscarTalleres();
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
    this.mostrarModalEditar = false;
    this.mostrarModalVer = false;
  }

  handleCierreModalCrear() {
    this.mostrarModalCrear = false;
    this.buscarTalleres();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.tallerSeleccionado = params.data;
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.mostrarModalVer = true;
  }

  handleCierreModalVer() {
    this.mostrarModalVer = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.tallerSeleccionado = params.data;
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = true;
    this.mostrarModalVer = false;
  }

  handleCierreModalEditar() {
    this.mostrarModalEditar = false;
    this.buscarTalleres();
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.tallerSeleccionado = params.data;
    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Taller',
      nombreEntidad: self.tallerSeleccionado.nombre,
    });
    const totalAsociados = self.tallerSeleccionado.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Taller',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Taller: ' + self.tallerSeleccionado.nombre;
      this.dialogEliminar = true;
    } else {
      this.mensajeEliminaIndividual =
        'El Taller tiene ' +
        (totalAsociados > 1
          ? 'asociaciones activas, '
          : 'una asociación activa, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
    }
  }
  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    this.dialogEliminar = false;
    if (isConfirmado) {
      this.eliminarTalleres(this.tallerSeleccionado);
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
<style>
.Bbisabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>

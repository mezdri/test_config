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
          :row-data="lstRecalibracion"
          exported-file-name="RecalibrarOdometro"
        />
      </template>
      <template v-slot:derecha>
        <RecalibrarButton
          :permisoAccion="accionCrear"
          @click="handleCrearClick()"
        />
      </template>
    </CabeceraTabla>
    <div class="gridcard rounded-card">
      <MantenedorGridTodos
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
        @gridOptionsEnriched="enrichedGridOptions = $event"
      />
    </div>
    <Confirmation
      :show="mostrarConfirmacionEliminar"
      :titulo="'Eliminar Recalibración Odómetro'"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'la Recalibración Odómetro',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>
    <CrearCalibrarModal
      v-if="mostrarModalCrear"
      :objeto="objeto"
      @cerrar="handleCierreModalCrearEditar"
    />
    <EditarCalibrarModal
      v-if="mostrarModalEditar"
      :objeto="objeto"
      @cerrar="handleCierreModalCrearEditar"
      :calibracionSeleccionada="calibracionSeleccionada"
    />
    <VerCalibrarModal
      v-if="mostrarModalVer"
      :objeto="objeto"
      @cerrar="handleCierreModalVer"
      :calibracionSeleccionada="calibracionSeleccionada"
    />
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
} from 'ag-grid-community';
import {
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
import RecalibrarButton from '@/reusable/Grid/RecalibrarButton.vue';

import { CalibracionVehiculo } from '@/pantallas/CalibracionVehiculo/CalibracionVehiculo';
import { fetchCalibracion } from '@/pantallas/CalibracionVehiculo/Services/fetchCalibracion';
import { fetchByIdCalibracion } from '@/pantallas/CalibracionVehiculo/Services/fetchByIdCalibracion';
import { eliminarCalibracion } from '@/pantallas/CalibracionVehiculo/Services/eliminarCalibracion';

import CrearCalibrarModal from '@/pantallas/CalibracionVehiculo/CrearCalibrarModal.vue';
import VerCalibrarModal from '@/pantallas/CalibracionVehiculo/VerCalibrarModal.vue';
import EditarCalibrarModal from '@/pantallas/CalibracionVehiculo/EditarCalibrarModal.vue';

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
    RecalibrarButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearCalibrarModal,
    VerCalibrarModal,
    EditarCalibrarModal,
  },
})
export default class RecalibrarOdometro extends ComponenteBase {
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 86,
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.Odometro;

  /* state */

  lstRecalibracion: CalibracionVehiculo[] = [];
  calibracionSeleccionada: CalibracionVehiculo = null;
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVer: boolean = false;
  objeto: string = 'odometro';

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Unidad',
        field: 'unidadVehiculo',
      },
      {
        headerName: 'Odómetro',
        field: 'odometro',
      },
      {
        headerName: 'Odómetro Plataforma',
        field: 'odometroPlataforma',
      },
      creadoPorColumnDefs('usuarioCreador'),
      {
        ...fechaCreacionColumnDefs('fechaCreacionTxt'),
      },
      modificadoPorColumnDefs('usuarioModificacion'),
      {
        ...fechaModificacionColumnDefs('fechaModificacionTxt'),
      },
    ],
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    if (this.lstRecalibracion.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.unidadVehiculo.toLowerCase().includes(busqueda) ||
        node.data.odometro.toString().includes(busqueda) ||
        node.data.odometroPlataforma.toString().includes(busqueda) ||
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

  /* util */

  fetchRecalibracion() {
    this.loadingService.showLoading();
    return fetchCalibracion(this.objeto)
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las recalibraciones',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchByIdRecalibracion(id: number) {
    this.loadingService.showLoading();
    return fetchByIdCalibracion(id)
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener la Recalibración Odómetro',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarRecalibracion(recalibracion: CalibracionVehiculo) {
    this.loadingService.showLoading();
    return eliminarCalibracion(recalibracion.id)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar eliminar la Recalibración Odómetro',
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.$snotify.success(
          'La Recalibración Odómetro ha sido eliminada de forma exitosa',
          {
            timeout: 3000,
          }
        );
        this.loadingService.hideLoading();
        this.buscarRecalibracion();
      });
  }

  async buscarRecalibracion() {
    this.lstRecalibracion = (await this.fetchRecalibracion()) || [];
    this.gridApi.setRowData(this.lstRecalibracion);
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.buscarRecalibracion();
  }

  handleCierreModalCrearEditar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.buscarRecalibracion();
  }

  handleCierreModalVer() {
    this.mostrarModalVer = false;
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  async handleEditarClick(params: ICellRendererParams) {
    this.calibracionSeleccionada =
      (await this.fetchByIdRecalibracion(params.data.id)) || null;
    this.mostrarModalEditar = true;
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.calibracionSeleccionada =
      (await this.fetchByIdRecalibracion(params.data.id)) || null;
    this.mostrarModalVer = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.calibracionSeleccionada = params.data;
    this.mostrarConfirmacionEliminar = true;
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    if (isConfirmado) {
      this.eliminarRecalibracion(this.calibracionSeleccionada);
    }
  }
}
</script>

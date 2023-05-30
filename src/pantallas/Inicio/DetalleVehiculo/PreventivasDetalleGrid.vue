<template>
  <div>
    <ag-grid-vue
      style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
      class="ag-theme-material"
      :columnDefs="columnDefsPreventivas"
      :rowData="preventivasRespaldo"
      rowSelection="multiple"
      rowMultiSelectWithClick="false"
      pagination="true"
      paginationPageSize="10"
      suppressRowClickSelection="true"
      rowHeight="35"
      headerHeight="45"
      :sideBar="sideBar"
      :localeText="localeText"
      :onGridReady="onGridReadyPreventivas"
      key="gridPreventiva"
      :suppressCsvExport="true"
      :suppressExcelExport="true"
      :processCellForClipboard="procesarFecha"
    ></ag-grid-vue>
    <VerDetallePlanPreventivoModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :planSeleccionado="planSeleccionado"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from '@/store';
import moment from 'moment';
import config from '@/config/index';
import { Component, Prop, Watch } from 'vue-property-decorator';
const { AgGridVue } = require('ag-grid-vue');
const jsts = require('jsts');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellClickedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';
import VerDetallePlanPreventivoModal from '@/pantallas/HistoricoMantenimiento/VerDetallePlanPreventivoModal.vue';
import {
  fetchHistoricosPreventivo,
  HistoricoPreventivo,
  HistoricosPreventivoList,
} from '@/pantallas/HistoricoMantenimiento/fetchHistoricoPreventivo';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    VerDetallePlanPreventivoModal,
  },
})
export default class PreventivasDetalleGrid extends Vue {
  vehiculo: Vehiculo;

  $snotify: any;
  clienteId: number = config.getClienteSesion();
  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;

  tabModel: string = '3';
  columnDefsPreventivas: any = [];
  preventivasRespaldo: any[] = [];
  gridApiA: GridApi;
  columnApiA: ColumnApi;
  usuario: any = this.$store.state.user;
  mostrarModalVerDetalle: boolean = false;
  planSeleccionado: HistoricosPreventivoList = null;
  historicoPreventivo: HistoricoPreventivo = null;

  /*Grid */

  onGridReadyPreventivas(params: GridReadyEvent) {
    this.gridApiA = params.api;
    this.columnApiA = params.columnApi;
  }

  createPlanDetalle(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'VER DETALLE';
    eSpan.id = params.data.id;
    eSpan.style.cssText = 'cursor:pointer;color:#000000;font-size: 13px;';
    eSpan.title = 'Ver Detalle';

    eSpan.addEventListener('click', () => {
      this.handleMostrarDetalle(params.data);
    });
    return eSpan;
  }

  async cargaPreventivas() {
    if (this.tabModel === '3') {
      this.gridApiA.setRowData([]);
      this.gridApiA.showLoadingOverlay();
      try {
        this.historicoPreventivo =
          (await this.fetchPlanes(this.vehiculo.id)) || [];
        this.preventivasRespaldo = this.historicoPreventivo.preventivosHistoricos;
      } catch {
        this.gridApiA.showNoRowsOverlay();
      }
    }
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  procesarFecha(params: any) {
    return params.value instanceof moment
      ? this.formatFecha(params.value as moment.Moment)
      : params.value;
  }

  /*Handles */

  handleAbrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    this.vehiculo = vehiculo;
    this.cargaPreventivas();
  }

  handleMostrarDetalle(mantenimientoPreventivo: HistoricosPreventivoList) {
    this.planSeleccionado = mantenimientoPreventivo;
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.mostrarModalVerDetalle = true;
  }

  handleCierreModalVerDetalle() {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.mostrarModalVerDetalle = false;
  }
  /*Util*/
  fetchPlanes(id: number) {
    return fetchHistoricosPreventivo(id)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el histórico de mantenimientos preventivos. ',
          { timeout: 3000 }
        )
      )
      .finally();
  }

  /*Lifecycle */

  beforeMount() {
    this.columnDefsPreventivas = [
      {
        headerName: 'Código',
        field: 'idPlanMantenimiento',
        lockPinned: true,
        rowDrag: true,
        width: 130,
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        hide: true,
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre Plan',
        field: 'planMantenimientoText',
        lockPinned: true,
        rowDrag: true,
        lockVisible: true,
        width: 200,
        minWidth: 10,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Pauta',
        field: 'pautaActividadMantText',
        lockPinned: true,
        rowDrag: true,
        width: 130,
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'planMantenimientoEstadoText',
        lockPinned: true,
        rowDrag: true,
        width: 130,
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Realización',
        field: 'fechaRealizacion',
        lockPinned: true,
        rowDrag: true,
        width: 200,
        minWidth: 100,
        enablePivot: true,
        resizable: true,
        sortable: true,
        valueFormatter: this.fechaValueFormatter,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Ver Detalle',
        field: '',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: this.createPlanDetalle,
      },
    ];
  }

  mounted() {
    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);
  }
}
</script>

<template>
  <div>
    <ag-grid-vue
      style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
      class="ag-theme-material"
      :columnDefs="columnDefsCorrectivas"
      :rowData="correctivasRespaldo"
      rowSelection="multiple"
      rowMultiSelectWithClick="false"
      pagination="true"
      paginationPageSize="10"
      suppressRowClickSelection="true"
      rowHeight="35"
      headerHeight="45"
      :sideBar="sideBar"
      :localeText="localeText"
      :onGridReady="onGridReadyCorrectivas"
      key="gridCorrectiva"
      :suppressCsvExport="true"
      :suppressExcelExport="true"
      :processCellForClipboard="procesarFecha"
    ></ag-grid-vue>
    <VerDetalleMantenimientoCorrectivoModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :correctivoSeleccionado="correctivoSeleccionado"
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
import { fetchHistoricosCorrectivo } from '@/pantallas/HistoricoMantenimiento/fetchHistoricoCorrectivo';
import { fetchMantenimientoCorrectivoDetalle } from '@/pantallas/Correctivas/Data/fetchMantenimientoCorrectivoDetalle';
import VerDetalleMantenimientoCorrectivoModal from '@/pantallas/HistoricoMantenimiento/VerDetalleMantenimientoCorrectivoModal.vue';
import { Correctiva } from '@/pantallas/Correctivas/Data/Correctiva';
import {
  HistoricosCorrectivosList,
  HistoricoCorrectivo,
} from '@/pantallas/HistoricoMantenimiento/HistoricoCorrectivo';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    VerDetalleMantenimientoCorrectivoModal,
  },
})
export default class CorrectivasDetalleGrid extends Vue {
  @Prop({ default: '' }) tabModel: string;
  vehiculo: Vehiculo;

  $snotify: any;
  clienteId: number = config.getClienteSesion();
  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;

  columnDefsCorrectivas: any = [];
  correctivasRespaldo: any[] = [];
  gridApiA: GridApi;
  columnApiA: ColumnApi;
  usuario: any = this.$store.state.user;
  correctivasVehiculo: HistoricoCorrectivo = null;
  correctivoSeleccionado: Correctiva = null;
  mostrarModalVerDetalle: boolean = false;

  /*Grid */

  onGridReadyCorrectivas(params: GridReadyEvent) {
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
      this.habldeMostrarDetalle(params.data);
    });
    return eSpan;
  }

  @Watch('tabModel', { deep: true, immediate: true })
  handleTabModel() {
    if (this.tabModel === 'tab-5') {
      this.cargaCorrectivas();
    }
  }

  async cargaCorrectivas() {
    this.gridApiA.setRowData([]);
    this.gridApiA.showLoadingOverlay();
    try {
      this.correctivasVehiculo =
        (await this.fetchCorrectivasVehiculo(this.vehiculo.id)) || null;
      if (this.correctivasVehiculo) {
        this.correctivasRespaldo =
          this.correctivasVehiculo.correctivosHistoricos || [];
      }
    } catch {
      this.gridApiA.showNoRowsOverlay();
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
    //this.cargaCorrectivas();
  }

  async habldeMostrarDetalle(mantenimientoCorrectivo: any) {
    this.correctivoSeleccionado =
      (await this.fetchCorrectivasDetalle(mantenimientoCorrectivo.id)) || null;
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.mostrarModalVerDetalle = true;
  }

  handleCierreModalVerDetalle() {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.mostrarModalVerDetalle = false;
  }

  /* Util */

  fetchCorrectivasVehiculo(idVehiculo: number) {
    return fetchHistoricosCorrectivo(idVehiculo)
      .catch()
      .finally();
  }

  fetchCorrectivasDetalle(idVehiculo: number) {
    return fetchMantenimientoCorrectivoDetalle(idVehiculo)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el mantenimiento correctivo. ',
          { timeout: 3000 }
        )
      )
      .finally();
  }

  /*Lifecycle */

  beforeMount() {
    this.columnDefsCorrectivas = [
      {
        headerName: 'Código',
        field: 'id',
        lockPinned: true,
        rowDrag: true,
        width: 130,
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        rowDrag: true,
        width: 200,
        minWidth: 100,
        lockVisible: true,
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

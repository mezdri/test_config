<template>
  <div>
    <div id="headerDiv">
      <div>
        <div id="headDiv">
          <v-select
            style="min-width: 20vh; margin-right: 5%;"
            v-model="dateValue"
            item-text="label"
            item-value="value"
            :items="dateOptions"
            prepend-icon="event"
            attach
            chips
            label="Fecha relativa"
          >
          </v-select>
          <v-combobox
            style="min-width: 24vh; margin-right: 5%;"
            multiple
            v-model="patentValues"
            append-icon
            label="Búsqueda por patentes"
            chips
            deletable-chips
            :search-input.sync="search"
            @keyup.tab="updateTags"
          >
          </v-combobox>
          <div>
            <v-btn color="#27488E" fab small dark @click="filterActivities">
              <v-icon>search</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
    <div id="bodyDiv">
      <v-layout>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointAlert = true"
            @mouseleave="mousePointAlert = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Alertas</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointAlert"
                  type="alertGraph"
                  @point="mousePointAlert = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <barComp ref="barRefAlert" :height="280" />
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointAlertDetail = true"
            @mouseleave="mousePointAlertDetail = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Alertas Detalle</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointAlertDetail"
                  type="alertGraphDetail"
                  @point="mousePointAlertDetail = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div class="gridDivClass">
              <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-material"
                :columnDefs="columnDefsAlert"
                :rowData="rowDataAlert"
                :gridOptions="gridOptionAlert"
              ></ag-grid-vue>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointSpeed = true"
            @mouseleave="mousePointSpeed = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Velocidad Máxima</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointSpeed"
                  type="speed"
                  @point="mousePointSpeed = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div style="width:100%;">
              <barComp ref="barRefSpeed" :height="280" />
            </div>
            <div class="bottomDateClass">
              Fecha
            </div>
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointSpeedDetail = true"
            @mouseleave="mousePointSpeedDetail = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Velocidad Máxima Detalle</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointSpeedDetail"
                  type="speedDetail"
                  @point="mousePointSpeedDetail = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div class="gridDivClass">
              <ag-grid-vue
                style="width: 100%; height: 100%"
                class="ag-theme-material"
                :columnDefs="columnDefsSpeed"
                :rowData="rowDataSpeed"
                :gridOptions="gridOptionSpeed"
              ></ag-grid-vue>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointDistance = true"
            @mouseleave="mousePointDistance = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Kilómetros Recorridos</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointDistance"
                  type="distance"
                  @point="mousePointDistance = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <barComp :height="280" ref="barRefDistance" />
            <div class="bottomDateClass">
              Fecha
            </div>
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointDistanceDetail = true"
            @mouseleave="mousePointDistanceDetail = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Kilómetros Recorridos Detalle</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointDistanceDetail"
                  type="distanceDetail"
                  @point="mousePointDistanceDetail = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div class="gridDivClass">
              <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-material"
                :columnDefs="columnDefsDistance"
                :rowData="rowDataDistance"
                :gridOptions="gridOptionDistance"
              ></ag-grid-vue>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointTime = true"
            @mouseleave="mousePointTime = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Tiempo de Uso</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointTime"
                  type="useTime"
                  @point="mousePointTime = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <barComp :height="280" ref="barRefTime" />
            <div class="bottomDateClass">
              Fecha
            </div>
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointTimeDetail = true"
            @mouseleave="mousePointTimeDetail = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Tiempo de Uso Detalle</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointTimeDetail"
                  type="useTimeDetail"
                  @point="mousePointTimeDetail = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div class="gridDivClass">
              <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-material"
                :columnDefs="columnDefsTime"
                :rowData="rowDataTime"
                :gridOptions="gridOptionTime"
              ></ag-grid-vue>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointIgnition = true"
            @mouseleave="mousePointIgnition = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Ignición ON / OFF</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointIgnition"
                  type="ignition"
                  @point="mousePointIgnition = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <lineComp :height="280" ref="lineRefIgnicion" />
            <div class="bottomDateClass">
              Fecha
            </div>
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointIgnitionDetail = true"
            @mouseleave="mousePointIgnitionDetail = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Ignición ON / OFF Detalle</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointIgnitionDetail"
                  type="ignitionDetail"
                  @point="mousePointIgnitionDetail = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div class="gridDivClass">
              <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-material"
                :columnDefs="columnDefsIgnition"
                :rowData="rowDataIgnition"
                :gridOptions="gridOptionIgnition"
                suppressCopyRowsToClipboard="true"
              ></ag-grid-vue>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script lang="ts">
import config from '@/config/index';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import { Bar, Line, Doughnut, Radar } from 'vue-chartjs';
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import { LoadingService } from '@/services/loadingService';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import ExportMenu from '@/pantallas/Dashboard/ExportMenu.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  exportCsv,
  exportExcel,
  exportJson,
} from '@/pantallas/Dashboard/ExportFile';
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
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

class Graphic {
  labels: string[];
  values: number[];
  patents: string[];
  constructor(labels: string[], values: number[], patents: string[]) {
    this.labels = labels;
    this.values = values;
    this.patents = patents;
  }
  clear() {
    this.labels = [];
    this.values = [];
    this.patents = [];
  }
}

@Component({
  components: {
    barComp: Bar,
    lineComp: Line,
    doughnutComp: Doughnut,
    radarComp: Radar,
    'ag-grid-vue': AgGridVue,
    exportMenu: ExportMenu,
  },
})
export default class DashboardOs extends Vue {
  readonly loadingService = new LoadingService();
  @Prop() load: boolean;

  // State
  types: string[] = [
    'alertGraph',
    'alertGraphDetail',
    'maxSpeed',
    'maxSpeedDetail',
    'kilometersTraveled',
    'kilometersTraveledDetail',
    'useTime',
    'useTimeDetail',
    'ignitionGraph',
    'ignitionGraphDetail',
  ];
  gridOptionSpeed: GridOptions;
  gridOptionDistance: GridOptions;
  gridOptionTime: GridOptions;
  gridOptionIgnition: GridOptions;
  gridOptionAlert: GridOptions;
  sideBar: any = config.agGridDefaultConfig;

  // Pointers
  mousePointAlert: boolean = false;
  mousePointAlertDetail: boolean = false;
  mousePointSpeed: boolean = false;
  mousePointSpeedDetail: boolean = false;
  mousePointDistance: boolean = false;
  mousePointDistanceDetail: boolean = false;
  mousePointTime: boolean = false;
  mousePointTimeDetail: boolean = false;
  mousePointIgnition: boolean = false;
  mousePointIgnitionDetail: boolean = false;

  // Grid
  columnDefsSpeed: any = [];
  columnDefsDistance: any = [];
  columnDefsTime: any = [];
  columnDefsIgnition: any = [];
  columnDefsAlert: any = [];
  rowDataSpeed: [] = [];
  rowDataDistance: [] = [];
  rowDataTime: [] = [];
  rowDataIgnition: [] = [];
  rowDataAlert: [] = [];

  oldPatentValues: string[] = [];
  patentValues: string[] = [];
  oldDateValue: any = '7';
  dateValue: any = '7';
  dateOptions: any = [
    { label: 'Hoy', value: 'now' },
    { label: 'Ayer', value: '1' },
    { label: 'últimos 7 días', value: '7' },
    { label: 'últimos 30 días', value: '30' },
    { label: 'Esta semana', value: 'currentWeek' },
    { label: 'Este mes', value: 'currentMonth' },
    { label: 'Este año', value: 'currentYear' },
    { label: 'última semana', value: 'lastWeek' },
    { label: 'último mes', value: 'lastMonth' },
    { label: 'último año', value: 'lastYear' },
  ];
  search: any = '';

  // Graphics
  speedGraphic: any = [];
  distanceGraphic: [] = [];
  timeGraphic: [] = [];
  alertGraphic: [] = [];
  ignitionGraphic: [] = [];
  pluginOptions: any = {
    datalabels: {
      anchor: 'end',
      align: 'end',
      padding: -3,
      formatter: (val: any) => `${val}`,
      labels: {
        value: {
          color: 'black',
        },
      },
    },
  };
  pluginOptionsTime: any = {
    datalabels: {
      anchor: 'end',
      align: 'end',
      padding: -3,
      formatter: (val: any) => `${val}`,
      labels: {
        value: {
          color: 'black',
        },
      },
    },
  };

  constructor() {
    super();
    this.gridOptionSpeed = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5,
      cacheBlockSize: 1000,
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCopyRowsToClipboard: true,
      sideBar: this.sideBar,
      blockLoadDebounceMillis: 350,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
    };
    this.gridOptionDistance = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5,
      cacheBlockSize: 1000,
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCopyRowsToClipboard: true,
      sideBar: this.sideBar,
      blockLoadDebounceMillis: 350,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
    };
    this.gridOptionTime = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5,
      cacheBlockSize: 1000,
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCopyRowsToClipboard: true,
      sideBar: this.sideBar,
      blockLoadDebounceMillis: 350,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
    };
    this.gridOptionIgnition = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5,
      cacheBlockSize: 1000,
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCopyRowsToClipboard: true,
      sideBar: this.sideBar,
      blockLoadDebounceMillis: 350,
      columnTypes: {
        Fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
    };
    this.gridOptionAlert = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5,
      cacheBlockSize: 1000,
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCopyRowsToClipboard: true,
      sideBar: this.sideBar,
      blockLoadDebounceMillis: 350,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
    };
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  filterActivities() {
    var self = this;
    setTimeout(() => {
      self.loadGraphicFetch();
      self.oldDateValue = self.dateValue;
      self.oldPatentValues = self.patentValues;
    }, 500);
    // if (
    //   JSON.stringify(this.oldDateValue) !== JSON.stringify(this.dateValue) ||
    //   this.oldPatentValues.toString() !== this.patentValues.toString()
    // ) {
    //   this.loadGraphicFetch();
    //   this.oldDateValue = this.dateValue;
    //   this.oldPatentValues = this.patentValues;
    // }
  }

  loadGraphicFetch() {
    this.clearGraphics();
    this.$emit('notifyLoad', false);
    this.loadingService.showLoading('Por favor espere...', 'dashboardOs');
    let model = {
      nameId: this.getUserID(),
      clienteId: this.getClientID(),
      date: this.dateValue,
      patents: this.patentValues.toString(),
    };
    let i = 0;
    for (var x of this.types) {
      x = 'graficos_track3/' + x;
      this.fetchDashboard(model, x, i);
      i++;
    }
  }

  exportData(type: string, extension: string) {
    var exportData: {}[] = [];
    switch (type) {
      case 'speed':
        exportData = this.speedGraphic.map((item: any) => {
          return {
            Fecha: item.fecha,
            'Max Velocidad': item.velocidad,
          };
        });
        break;
      case 'speedDetail':
        exportData = this.rowDataSpeed.map((item: any) => {
          return {
            Fecha: item.fecha,
            Patente: item.patente,
            'Max Velocidad': item.velocidad,
          };
        });
        break;
      case 'distance':
        exportData = this.distanceGraphic.map((item: any) => {
          return {
            Fecha: item.fecha,
            'Kilómetros Recorridos': item.distancia,
          };
        });
        break;
      case 'distanceDetail':
        exportData = this.rowDataDistance.map((item: any) => {
          return {
            Fecha: item.fecha,
            Patente: item.patente,
            'Kilómetros Recorridos': item.distancia,
          };
        });
        break;
      case 'useTime':
        exportData = this.timeGraphic.map((item: any) => {
          return {
            Fecha: item.fecha,
            Minutos: item.total,
          };
        });
        break;
      case 'useTimeDetail':
        exportData = this.rowDataTime.map((item: any) => {
          return {
            Fecha: item.fecha,
            Patente: item.patente,
            Minutos: item.minutos,
          };
        });
        break;
      case 'ignition':
        exportData = this.ignitionGraphic.map((item: any) => {
          return {
            Fecha: item.fecha,
            'Con Contacto': item.totalconexion,
            'Sin Contacto ': item.sinconexion,
          };
        });
        break;
      case 'ignitionDetail':
        exportData = this.rowDataIgnition.map((item: any) => {
          return {
            Fecha: item.fecha,
            Patente: item.patente,
            Evento: item.evento,
            'Nro Eventos': item.count,
          };
        });
        break;
      case 'alertGraph':
        exportData = this.alertGraphic.map((item: any) => {
          return {
            'Nombre Alerta': item.nombrealerta,
            Total: item.total,
          };
        });
        break;
      case 'alertGraphDetail':
        exportData = this.rowDataAlert.map((item: any) => {
          return {
            'Nombre Alerta': item.alerta,
            'Tipo Alerta': item.tipo,
            Patente: item.unidad,
            Total: item.total,
          };
        });
        break;
    }
    switch (extension) {
      case 'csv':
        exportCsv(exportData, type);
        break;
      case 'xlsx':
        exportExcel(exportData, type);
        break;
      case 'json':
        exportJson(exportData, type);
        break;
    }
  }

  async fetchDashboard(body: any, path: any, i: any) {
    return fetchDashboard(body, path)
      .then(response => {
        if (response.data.MENSAJE_RESPUESTA != 'Sin datos') {
          this.fillData(
            response.data.graficos.type,
            response.data.graficos.data
          );
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        if (i == 9) {
          this.loadingService.hideLoading('dashboardOs');
          this.$emit('notifyLoad', true);
        }
      });
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
  }

  getUserID(): number {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return parseInt(id);
  }

  getForListBar(
    data: [],
    labelName: string,
    valueName: string,
    graphRef: string
  ) {
    var labels: any = [];
    var values: any = [];
    for (var item of data) {
      labels.push(item[labelName]);
      values.push(this.formatParseInt(item[valueName]));
    }
    return { labels: labels, values: values, ref: graphRef };
  }

  getForListLine(
    data: [],
    labelName: string,
    valueName: string,
    valueName2: string,
    graphRef: string
  ) {
    var labels: any = [];
    var values: any = [];
    var values2: any = [];
    for (var item of data) {
      labels.push(item[labelName]);
      values.push(parseInt(item[valueName]));
      values2.push(parseInt(item[valueName2]));
    }
    return { labels: labels, values: values, values2: values2, ref: graphRef };
  }

  fillData(type: any, data: any) {
    switch (type) {
      case 'speed':
        this.speedGraphic = data;
        break;
      case 'speedDetail':
        this.rowDataSpeed = data;
        break;
      case 'distance':
        this.distanceGraphic = data;
        break;
      case 'distanceDetail':
        this.rowDataDistance = data;
        break;
      case 'useTime':
        this.timeGraphic = data;
        break;
      case 'useTimeDetail':
        this.rowDataTime = data;
        break;
      case 'ignition':
        this.ignitionGraphic = data;
        break;
      case 'ignitionDetail':
        this.rowDataIgnition = data;
        break;
      case 'alertGraph':
        this.alertGraphic = data;
        break;
      case 'alertGraphDetail':
        this.rowDataAlert = data;
        break;
    }
  }

  beforeMount() {
    this.mountGrid();
  }

  @Watch('speedGraphic')
  onSpeedChanged(value: string, oldValue: string) {
    this.mountGraphicSpeed();
  }
  @Watch('distanceGraphic')
  onDistanceChanged(value: string, oldValue: string) {
    this.mountGraphicDistance();
  }
  @Watch('timeGraphic')
  onTimeChanged(value: string, oldValue: string) {
    this.mountGraphicTime();
  }
  @Watch('ignitionGraphic')
  onIgnitionChanged(value: string, oldValue: string) {
    this.mountGraphicIgnition();
  }
  @Watch('alertGraphic')
  onAlertChanged(value: string, oldValue: string) {
    this.mountGraphicAlert();
  }

  @Watch('load')
  onLoadChanged(value: boolean, oldValue: boolean) {
    this.mountGraphicAlert();
    this.mountGraphicSpeed();
    this.mountGraphicDistance();
    this.mountGraphicTime();
    this.mountGraphicIgnition();
  }
  mountGrid() {
    this.columnDefsSpeed = [
      { field: 'fecha', sortable: true, headerName: 'Fecha' },
      { field: 'patente', sortable: true, headerName: 'Patente' },
      { field: 'velocidad', sortable: true, headerName: 'Máxima Velocidad' },
    ];
    this.columnDefsDistance = [
      { field: 'fecha', sortable: true, headerName: 'Fecha' },
      { field: 'patente', sortable: true, headerName: 'Patente' },
      {
        field: 'distancia',
        sortable: true,
        headerName: 'Kilómetros Recorridos',
      },
    ];
    this.columnDefsTime = [
      { field: 'fecha', sortable: true, headerName: 'Fecha' },
      { field: 'patente', sortable: true, headerName: 'Patente' },
      { field: 'minutos', sortable: true, headerName: 'Minutos' },
    ];
    this.columnDefsIgnition = [
      { field: 'fecha', sortable: true, headerName: 'Fecha' },
      { field: 'patente', sortable: true, headerName: 'Patente' },
      { field: 'evento', sortable: true, headerName: 'Evento' },
      { field: 'count', sortable: true, headerName: 'Nro Eventos' },
    ];
    this.columnDefsAlert = [
      { field: 'alerta', sortable: true, headerName: 'Nombre alerta' },
      { field: 'tipo', sortable: true, headerName: 'Tipo alerta' },
      { field: 'unidad', sortable: true, headerName: 'Unidad' },
      { field: 'total', sortable: true, headerName: 'Total' },
    ];
  }

  updateTags() {
    this.$nextTick(() => {
      this.patentValues.push(...this.search.split(','));
      this.$nextTick(() => {
        this.search = '';
      });
    });
  }

  formatDate(list: any) {
    return list.map(function(num: any) {
      return num.split(' ')[0];
    });
  }

  formatParseInt(number: string) {
    return number.split('.')[0];
  }

  mountGraphicIgnition() {
    var data = this.getForListLine(
      this.ignitionGraphic,
      'fecha',
      'totalconexion',
      'sinconexion',
      'Ignición'
    );
    (this.$refs.lineRefIgnicion as Line).renderChart(
      {
        labels: this.formatDate(data.labels),
        datasets: [
          {
            label: 'Con Contacto',
            data: data.values,
            borderColor: '#00FF00',
            fill: false,
          },
          {
            label: 'Sin Contacto',
            data: data.values2,
            borderColor: '#ff0000',
            fill: false,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: this.pluginOptions,
      }
    );
  }
  mountGraphicSpeed() {
    var data = this.getForListBar(
      this.speedGraphic,
      'fecha',
      'velocidad',
      'Velocidad Máxima'
    );
    (this.$refs.barRefSpeed as Bar).renderChart(
      {
        labels: this.formatDate(data.labels),
        datasets: [
          {
            label: data.ref,
            data: data.values,
            backgroundColor: '#d49231',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: this.pluginOptions,
      }
    );
  }
  mountGraphicDistance() {
    var data = this.getForListBar(
      this.distanceGraphic,
      'fecha',
      'distancia',
      'Kilómetros Recorridos'
    );
    (this.$refs.barRefDistance as Bar).renderChart(
      {
        labels: this.formatDate(data.labels),
        datasets: [
          {
            label: data.ref,
            data: data.values,
            backgroundColor: '#e3e312',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: this.pluginOptions,
      }
    );
  }
  mountGraphicTime() {
    var data = this.getForListBar(
      this.timeGraphic,
      'fecha',
      'total',
      'Tiempo de Uso (minutos)'
    );
    (this.$refs.barRefTime as Bar).renderChart(
      {
        labels: this.formatDate(data.labels),
        datasets: [
          {
            label: data.ref,
            data: data.values,
            backgroundColor: '#2a84de',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: this.pluginOptionsTime,
      }
    );
  }
  mountGraphicAlert() {
    var data = this.getForListBar(
      this.alertGraphic,
      'nombrealerta',
      'total',
      'Alerta'
    );
    (this.$refs.barRefAlert as Bar).renderChart(
      {
        labels: data.labels,
        datasets: [
          {
            label: data.ref,
            data: data.values,
            backgroundColor: '#e3abdb',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: this.pluginOptions,
      }
    );
  }

  created(): void {}

  mounted(): void {
    this.loadGraphicFetch();
    this.mountGrid();
    (this.$refs.barRefAlert as Bar).addPlugin(ChartDataLabels);
    (this.$refs.barRefSpeed as Bar).addPlugin(ChartDataLabels);
    (this.$refs.barRefDistance as Bar).addPlugin(ChartDataLabels);
    (this.$refs.barRefTime as Bar).addPlugin(ChartDataLabels);
    (this.$refs.lineRefIgnicion as Line).addPlugin(ChartDataLabels);
  }

  clearGraphics() {
    this.alertGraphic = [];
    this.mountGraphicAlert();
    this.speedGraphic = [];
    this.mountGraphicSpeed();
    this.distanceGraphic = [];
    this.mountGraphicDistance();
    this.timeGraphic = [];
    this.mountGraphicTime();
    this.ignitionGraphic = [];
    this.mountGraphicIgnition();
    this.rowDataSpeed = [];
    this.rowDataDistance = [];
    this.rowDataTime = [];
    this.rowDataIgnition = [];
    this.rowDataAlert = [];
  }
}
</script>
<style scoped>
#headerDiv {
  height: 9vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
#headDiv {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
#bodyDiv {
  height: 100%;
  margin-bottom: 50px;
}
.idCard {
  height: 100%;
  max-height: 100%;
}
.idcardTitle {
  font-size: medium;
  width: 100%;
  max-height: 54px;
  display: flex;
}
.exportButton {
  margin-left: auto;
  margin-right: 0;
  padding: 10px;
}
.titleCards {
  padding: 17px;
  font-weight: 500;
}
.gridDivClass {
  height: 310px;
  width: 100%;
  display: flex;
}
.bottomDateClass {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}
</style>

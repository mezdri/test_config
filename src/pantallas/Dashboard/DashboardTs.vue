<template>
  <div>
    <div id="headerDiv">
      <div id="headDiv">
        <v-combobox
          style="min-width: 20vh; padding-right: 5%;"
          multiple
          v-model="fleetsSelected"
          :items="fleets"
          item-text="nombre"
          item-value="fleets.nombre"
          append-icon
          label="Búsqueda por flotas"
          chips
          deletable-chips
          :search-input.sync="search"
          @keyup.tab="updateTags"
        >
        </v-combobox>
        <div>
          <v-btn color="#27488E" fab small dark @click="filterFleets">
            <v-icon>search</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <div id="bodyDiv">
      <v-layout>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointTransmission = true"
            @mouseleave="mousePointTransmission = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Estado de Transmisión</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointTransmission"
                  type="transmission"
                  @point="mousePointTransmission = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div style="height: 310px; width: 100%; display:flex;">
              <div
                style="height: 100%; width: 50%; display:flex; align-items: center; justify-content: center;"
              >
                <div>
                  <div
                    style="display: flex; align-items: center; justify-content: center;"
                  >
                    <h3 style="padding-right: 10px;">Total:</h3>
                    <h3>{{ total }}</h3>
                  </div>
                  <div style="display: flex;">
                    <v-icon color="#8dd0b3">circle</v-icon>
                    <h3 style="padding-right: 13px; padding-left: 5px;">
                      Vehículos en Línea
                    </h3>
                    <h3>{{ inLinePercent }}%</h3>
                  </div>
                  <div style="display: flex;">
                    <v-icon color="#f44924">circle</v-icon>
                    <h3 style="padding-right: 13px; padding-left: 5px;">
                      Vehículos Fuera de Línea
                    </h3>
                    <h3>{{ offLinePercent }}%</h3>
                  </div>
                </div>
              </div>
              <div style="height: 100%; width: 50%;">
                <doughnutComp :height="280" ref="doughnutCompRef" />
              </div>
            </div>
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card
            class="idCard"
            @mouseover="mousePointTransmissionDetail = true"
            @mouseleave="mousePointTransmissionDetail = false"
          >
            <div class="idcardTitle">
              <p class="titleCards">Estado de Transmisión Detalle</p>
              <div class="exportButton">
                <exportMenu
                  v-show="mousePointTransmissionDetail"
                  type="transmissionDetail"
                  @point="mousePointTransmissionDetail = true"
                  @exportData="exportData"
                />
              </div>
            </div>
            <div style="height: 310px; width: 100%; display:flex;">
              <ag-grid-vue
                style="width: 100%; height: 100%;"
                class="ag-theme-material"
                :columnDefs="columnDefsTransmission"
                :rowData="rowDataTransmission"
                :gridOptions="gridOptionTransmission"
              ></ag-grid-vue>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import config from '@/config/index';
import { Bar, Line, Doughnut, Radar } from 'vue-chartjs';
import { AxiosVue } from '@/AxiosVue';
import { EstadoEntidad, ServicioProxy, TipoRol } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
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

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    doughnutComp: Doughnut,
    exportMenu: ExportMenu,
  },
})
export default class DashboardOs extends Vue {
  readonly loadingService = new LoadingService();
  @Prop() load: boolean;
  @Prop() loadOperation: boolean;
  //Fetch
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  readonly controllerFlota: string = 'flota';

  // State
  oldFleetsSelected: string[] = [];
  fleetsSelected: string[] = [];
  search: any = '';
  fleets: string[] = [];
  sideBar: any = config.agGridDefaultConfig;
  inLinePercent: string = '0';
  offLinePercent: string = '0';
  total: string = '0';
  stopLoading: boolean = false;

  // Pointss
  mousePointTransmission: Boolean = false;
  mousePointTransmissionDetail: Boolean = false;

  // Grid
  columnDefsTransmission: any = [
    { field: 'patente', sortable: true, headerName: 'Patente' },
    { field: 'fecha', sortable: true, headerName: 'Fecha actividad' },
    { field: 'ubicacion', sortable: true },
    { field: 'flota', sortable: true },
    { field: 'latitud', sortable: true },
    { field: 'longitud', sortable: true },
    { field: 'dias', sortable: true, headerName: 'Días sin Transmisión' },
  ];
  rowDataTransmission: [] = [];
  gridOptionTransmission: GridOptions;

  // Graphics
  transmissionGraphic: [] = [];

  constructor() {
    super();

    this.gridOptionTransmission = {
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
  @Watch('load')
  onLoadChanged(value: boolean, oldValue: boolean) {
    this.mountGraphicTransmission();
  }

  percents(type: string) {
    let list: any = this.transmissionGraphic;
    if (list[0].enlinea != '' && list[0].fueralinea != '') {
      let inLine: number = parseInt(list[0].enlinea);
      let offLine: number = parseInt(list[0].fueralinea);
      if (type == 'inLine') {
        let sum = (inLine * 100) / (inLine + offLine);
        return (Math.round((sum + Number.EPSILON) * 100) / 100).toFixed(0);
      } else {
        let sum = (offLine * 100) / (inLine + offLine);
        return (Math.round((sum + Number.EPSILON) * 100) / 100).toFixed(0);
      }
    } else {
      return 0;
    }
  }

  sumTotal() {
    let list: any = this.transmissionGraphic;
    if (list[0].enlinea != '' && list[0].fueralinea != '') {
      let inLine: number = parseInt(list[0].enlinea);
      let offLine: number = parseInt(list[0].fueralinea);
      let sum = inLine + offLine;
      return sum;
    } else {
      return 0;
    }
  }

  exportData(type: string, extension: string) {
    var exportData: {}[] = [];
    switch (type) {
      case 'transmission':
        exportData = this.transmissionGraphic.map((item: any) => {
          return {
            'En linea': item.enlinea,
            'Fuera de linea': item.fueralinea,
          };
        });
        break;
      case 'transmissionDetail':
        exportData = this.rowDataTransmission;
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

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  filterFleets() {
    var self = this;
    setTimeout(() => {
      self.loadGraphicFetch();
    }, 500);
    // if (
    //   JSON.stringify(this.oldFleetsSelected) !==
    //   JSON.stringify(this.fleetsSelected)
    // ) {
    //   this.loadGraphicFetch();
    // }
  }

  updateTags() {
    this.$nextTick(() => {
      this.fleetsSelected.push(...this.search.split(','));
      this.$nextTick(() => {
        this.search = '';
      });
    });
  }

  async getFleets(): Promise<void> {
    try {
      var user = this.getUserID();
      var client = this.getClientID();
      const response = await this.axiosVehiculo.http.get(
        `${'flota'}/${user}/${client}/usuarioflotacliente/`
      );
      this.fleets = response.data;
    } catch (error) {
      console.log(error);
    }
  }

  created(): void {
    this.getFleets();
  }

  mounted(): void {
    this.loadGraphicFetch();
    (this.$refs.doughnutCompRef as Doughnut).addPlugin(ChartDataLabels);
  }

  extractName(fleets: any) {
    var returnNames: string[] = [];
    for (let item of fleets) {
      returnNames.push(item['nombre']);
    }
    return returnNames;
  }

  loadGraphicFetch() {
    this.transmissionGraphic = [];
    this.rowDataTransmission = [];
    let model = {
      nameId: this.getUserID(),
      clienteId: this.getClientID(),
      date: '',
      patents: '',
      fleets: this.extractName(this.fleetsSelected),
    };
    this.loadingService.showLoading('Por favor espere...', 'dashboardTs');
    this.fetchDashboard(model, 'graficos_track3/transmissionGraph', 0);
    this.fetchDashboard(model, 'graficos_track3/transmissionGraphDetail', 1);
  }

  @Watch('transmissionGraphic')
  onTransmissionChanged(value: string, oldValue: string) {
    this.mountGraphicTransmission();
  }

  async fetchDashboard(body: any, path: any, i: any) {
    return fetchDashboard(body, path)
      .then(response => {
        if (response.data.MENSAJE_RESPUESTA != 'Sin datos') {
          switch (response.data.graficos.type) {
            case 'transmissionGraph':
              this.transmissionGraphic = response.data.graficos.data;
              this.inLinePercent = this.percents('inLine').toString();
              this.offLinePercent = this.percents('offLine').toString();
              this.total = this.sumTotal().toString();
              break;
            case 'transmissionGraphDetail':
              this.rowDataTransmission = response.data.graficos.data;
              break;
          }
        } else {
          this.inLinePercent = '0';
          this.offLinePercent = '0';
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        if (i == 1) {
          this.oldFleetsSelected = this.fleetsSelected;
          this.loadingService.hideLoading('dashboardTs');
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

  formatGraphicTransmission(data: []) {
    var labels: any = ['en línea', 'fuera de línea'];
    var values: any = [];
    for (var item of data) {
      values.push(item['enlinea']);
      values.push(item['fueralinea']);
    }
    return { labels: labels, values: values };
  }

  mountGraphicTransmission() {
    var data = this.formatGraphicTransmission(this.transmissionGraphic);
    (this.$refs.doughnutCompRef as Doughnut).renderChart(
      {
        labels: data.labels,
        datasets: [
          {
            label: 'Transmisión',
            data: data.values,
            backgroundColor: ['#8dd0b3', '#f44924'],
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            formatter: (value, ctx) => {
              let datasets: any = ctx.chart.data.datasets;
              let percentage = '0';
              if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                let sum: any = datasets[0].data.reduce(
                  (a: any, b: any) => parseFloat(a) + parseFloat(b),
                  0
                );
                percentage = Math.round((value / sum) * 100) + '%';
                return percentage;
              } else {
                return percentage;
              }
            },
            color: '#fff',
          },
        },
      }
    );
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
  display: flex;
  height: 65%;
  align-items: center;
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
.titleCards {
  padding: 17px;
  font-weight: 500;
}
.exportButton {
  margin-left: auto;
  margin-right: 0;
  padding: 10px;
}
</style>

<template>
  <div>
    <div id="headerDiv">
      <div id="headDiv">
        <v-combobox
          style="min-width: 22vh; margin-right: 30px;"
          multiple
          v-model="fleetsSelected"
          :items="fleets"
          item-text="nombre"
          append-icon
          label="Búsqueda por flotas"
          chips
          deletable-chips
          :search-input.sync="searchFleets"
          @keyup.tab="updateTagsFleets"
        >
        </v-combobox>
        <div @click="dateStartDialog = true">
          <v-combobox
            style="max-width: 22vh; margin-right: 30px;"
            v-model="dateStartSelected"
            label="Fecha inicial"
            chips
            readonly
            prepend-icon="event"
            deletable-chips
          ></v-combobox>
        </div>
        <div @click="dateEndDialog = true">
          <v-combobox
            style="max-width: 22vh; margin-right: 30px;"
            v-model="dateEndSelected"
            label="Fecha final"
            prepend-icon="event"
            chips
            readonly
            deletable-chips
          >
          </v-combobox>
        </div>
        <v-dialog v-model="dateStartDialog" max-width="290">
          <v-date-picker
            range
            v-model="dateStartSelected"
            @change="dateStartDialog = false"
            :events="dateEndArray"
            event-color="#27488E"
            :max="dateEndSelected"
            :allowed-dates="allowedDates"
          ></v-date-picker>
        </v-dialog>
        <v-dialog v-model="dateEndDialog" max-width="290">
          <v-date-picker
            range
            v-model="dateEndSelected"
            @change="dateEndDialog = false"
            :events="dateStartArray"
            event-color="#27488E"
            :min="dateStartSelected"
            :allowed-dates="allowedDates"
          ></v-date-picker>
        </v-dialog>
        <v-combobox
          style="min-width: 24vh; margin-right: 30px;"
          multiple
          v-model="patentValues"
          label="Búsqueda por patentes"
          chips
          deletable-chips
          :search-input.sync="searchPatents"
          @keyup.tab="updateTagsPatents"
        >
        </v-combobox>
        <div>
          <v-btn color="#27488E" fab small dark @click="valideChanges">
            <v-icon>search</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <div id="bodyDiv">
      <v-card
        class="idCard"
        @mouseover="mousePointKilometer = true"
        @mouseleave="mousePointKilometer = false"
      >
        <div class="idcardTitle">
          <p class="titleCards">Informe Kilometraje Compartir</p>
          <div class="exportButton">
            <exportMenu
              v-show="mousePointKilometer"
              type="kilometer"
              @point="mousePointKilometer = true"
              @exportData="exportData"
            />
          </div>
        </div>
        <ag-grid-vue
          style="width: 100%; height: 57.1vh;"
          class="ag-theme-material"
          :columnDefs="columnDefsKilometer"
          :rowData="rowDataKilometer"
          :gridOptions="gridOptionKilometer"
        ></ag-grid-vue>
      </v-card>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad, ServicioProxy, TipoRol } from '@/config/enums';
import config from '@/config/index';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import ExportMenu from '@/pantallas/Dashboard/ExportMenu.vue';
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
import {
  exportCsv,
  exportExcel,
  exportJson,
} from '@/pantallas/Dashboard/ExportFile';
import moment from 'moment';

const { AgGridVue } = require('ag-grid-vue');

@Component({ components: { 'ag-grid-vue': AgGridVue, exportMenu: ExportMenu } })
export default class DashboardKi extends Vue {
  // Fetch
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  readonly controllerFlota: string = 'flota';
  @Prop() loadOperation: boolean;

  // Point
  mousePointKilometer: Boolean = true;

  // State
  readonly loadingService = new LoadingService();
  dateString: any = new Date();
  searchPatents: any = '';
  searchFleets: any = '';
  searchDate: any = '';
  fleetsValues: any = [];
  oldPatentValues: any = [];
  patentValues: any = [];
  fleets: [] = [];
  oldFleetsSelected: [] = [];
  fleetsSelected: [] = [];
  oldDateStart: any = null;
  dateStartSelected: any = null;
  dateStartArray: string[] = [];
  dateStart: string = '';
  dateEnd: string = '';
  oldDateEnd: any = null;
  dateEndSelected: any = null;
  dateEndArray: string[] = [];
  intervalDate: any = [];
  dateStartDialog: Boolean = false;
  dateEndDialog: Boolean = false;
  sideBar: any = config.agGridDefaultConfig;
  stopLoading: boolean = false;
  lastYear: Number = new Date().getFullYear() - 1;
  nextYear: Number = new Date().getFullYear() + 1;
  allowedDates = (val: any) =>
    new Date(val).getFullYear() >= this.lastYear &&
    new Date(val).getFullYear() <= this.nextYear;

  // Grid
  columnDefsKilometer: any = [
    { field: 'patente', sortable: true },
    { field: 'flota', sortable: true },
    { field: 'fecha', sortable: true, headerName: 'Mes' },
    {
      field: 'distancia_recorrida',
      sortable: true,
      headerName: 'Kilómetros Recorridos',
    },
    { field: 'conductor', sortable: true },
  ];
  rowDataKilometer: [] = [];
  gridOptionKilometer: GridOptions;

  constructor() {
    super();
    this.gridOptionKilometer = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 9,
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

  @Watch('dateStartSelected')
  onDateStartChanged(value: string, oldValue: string) {
    this.dateStartArray = [value];
  }
  @Watch('dateEndSelected')
  onDateEndChanged(value: string, oldValue: string) {
    this.dateEndArray = [value];
  }

  updateTagsFleets() {
    this.$nextTick(() => {
      this.fleetsValues.push(...this.searchFleets.split(','));
      this.$nextTick(() => {
        this.searchFleets = '';
      });
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

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  valideChanges() {
    var self = this;
    setTimeout(() => {
      self.loadGraphicFetch();
    }, 500);
    // if (
    //   JSON.stringify(this.oldFleetsSelected) !==
    //     JSON.stringify(this.fleetsSelected) ||
    //   JSON.stringify(this.patentValues) !==
    //     JSON.stringify(this.oldPatentValues) ||
    //   this.oldDateStart != this.dateStartSelected ||
    //   this.oldDateEnd != this.dateEndSelected
    // ) {
    //   this.loadGraphicFetch();
    // }
  }

  exportData(type: string, extension: string) {
    let exportData: {}[] = this.rowDataKilometer.map((item: any) => {
      return {
        patente: item.patente,
        flota: item.flota,
        fecha: item.fecha,
        'kilometros recorridos': item.distancia_recorrida,
      };
    });
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

  deleteKeys(data: any) {
    delete data[0]['STATUS'];
    delete data[0]['TOTAL_REGISTROS'];
    return data;
  }

  updateTagsPatents() {
    this.$nextTick(() => {
      this.patentValues.push(...this.searchPatents.split(','));
      this.$nextTick(() => {
        this.searchPatents = '';
      });
    });
  }

  async fetchDashboard(body: any, path: any, i: any) {
    return fetchDashboard(body, path)
      .then(response => {
        if (response.data.MENSAJE_RESPUESTA != 'Sin datos') {
          this.rowDataKilometer = response.data.graficos.data;
        }
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        this.loadingService.hideLoading('dashboardKi');
        this.oldFleetsSelected = this.fleetsSelected;
        this.oldPatentValues = this.patentValues;
        this.oldDateStart = this.dateStartSelected;
        this.oldDateEnd = this.dateEndSelected;
      });
  }

  loadGraphicFetch() {
    this.rowDataKilometer = [];
    this.loadingService.showLoading('Por favor espere...', 'dashboardKi');
    let model = {
      nameId: this.getUserID(),
      clienteId: this.getClientID(),
      date: this.dateStartSelected + '/' + this.dateEndSelected,
      patents: this.patentValues,
      fleets: this.extractName(this.fleetsSelected),
    };
    this.fetchDashboard(model, 'graficos_track3/kilometerGraphDetail', 0);
  }

  extractName(fleets: any) {
    var returnNames: string[] = [];
    for (let item of fleets) {
      returnNames.push(item['nombre']);
    }
    return returnNames;
  }

  created(): void {
    this.getFleets();
  }

  mounted(): void {
    let today = new Date();
    this.dateEndSelected =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1 < 10
        ? '0' + (today.getMonth() + 1).toString()
        : (today.getMonth() + 1).toString()) +
      '-' +
      today.getDate();
    today.setDate(today.getDate() - 1);
    this.dateStartSelected =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1 < 10
        ? '0' + (today.getMonth() + 1).toString()
        : (today.getMonth() + 1).toString()) +
      '-' +
      today.getDate();
    this.loadGraphicFetch();
  }

  async getFleets(): Promise<void> {
    var user = this.getUserID();
    var client = this.getClientID();
    try {
      const response = await this.axiosVehiculo.http.get(
        `${'flota'}/${user}/${client}/usuarioflotacliente/`
      );
      this.fleets = response.data;
    } catch (error) {
      console.log(error);
    }
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
  height: 60vh;
}
.idCard {
  height: 106%;
  max-height: 106%;
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

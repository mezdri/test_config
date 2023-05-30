<template>
  <v-dialog v-model="dialog" persistent fullscreen hide-overlay>
    <v-card>
      <div id="mainDiv">
        <div id="headerDialog">
          <div style="margin-left: 2%">
            <h2 class="textstyle">Activar - Desactivar Conductores</h2>
          </div>
          <div style="margin-left: auto; margin-right: 0;">
            <v-btn icon dark @click="closeDialog">
              <v-icon>close</v-icon>
            </v-btn>
          </div>
        </div>
        <div id="bodyDialog">
          <div id="centerBodyDialog">
            <div style="height: 90%; display:flex">
              <div style="height: 100%; width: 50%">
                <!-- Div derecho list -->
                <v-card style="height: 100%; width: 95%">
                  <div style="height: 10%; text-align: -webkit-center;">
                    <v-text-field
                      label="Buscar activados..."
                      single-line
                      hide-details
                      @input="searchActiveDrivers"
                      style="width: 80%"
                    ></v-text-field>
                  </div>
                  <div style="height: 80%">
                    <v-subheader>ACTIVADOS</v-subheader>
                    <div
                      class="gridcard rounded-card"
                      style="width: 100%; height: 90%"
                    >
                      <ag-grid-vue
                        :gridOptions="gridOptionsActived"
                        style="width: 100%; height: 100%"
                        class="ag-theme-material"
                      ></ag-grid-vue>
                    </div>
                  </div>
                  <div
                    style="height: 10%; display: flex;align-items: center;justify-content: center;"
                  >
                    <v-btn
                      color="#27488e"
                      style="color: white"
                      :disabled="selectedRowsActived"
                      @click="deactivateDrivers"
                      >Pasar a desactivados<v-icon right>
                        arrow_forward
                      </v-icon></v-btn
                    >
                  </div>
                </v-card>
              </div>
              <div style="height: 100%; width: 50%">
                <!-- Div izquierdo list -->
                <v-card style="height: 100%; width: 95%">
                  <div style="height: 10%; text-align: -webkit-center;">
                    <v-text-field
                      label="Buscar desactivados..."
                      single-line
                      hide-details
                      @input="searchDeactiveDrivers"
                      style="width: 80%"
                    ></v-text-field>
                  </div>
                  <div style="height: 80%">
                    <v-subheader>DESACTIVADOS</v-subheader>
                    <div
                      class="gridcard rounded-card"
                      style="width: 100%; height: 90%"
                    >
                      <ag-grid-vue
                        :gridOptions="gridOptionsDeactived"
                        style="width: 100%; height: 100%"
                        class="ag-theme-material"
                      ></ag-grid-vue>
                    </div>
                  </div>
                  <div
                    style="height: 10%; display: flex;align-items: center;justify-content: center;"
                  >
                    <v-btn
                      color="#27488e"
                      style="color: white"
                      :disabled="selectedRowsDeactived"
                      @click="activateDrivers"
                      ><v-icon left> arrow_back </v-icon>Pasar a
                      activados</v-btn
                    >
                  </div>
                </v-card>
              </div>
            </div>
            <!-- <div style="height: 10%">
              down
            </div> -->
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
const { AgGridVue } = require('ag-grid-vue');
import config from '@/config/index';

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

@Component({
  components: { 'ag-grid-vue': AgGridVue },
})
export default class EditorConductoresCopiloto extends Vue {
  readonly conductorController: string = 'Conductor';
  @Prop({ default: false }) dialog: boolean;
  @Prop({ default: [] }) drivers: any[];
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  $snotify: any;
  selectedActived: any = '';
  baseListDisabled: any[] = [];
  listDisabled: any[] = [];
  loadingService = new LoadingService();

  localeText: any = {};
  columnDefs: Array<ColDef> = [];
  //Actived
  gridOptionsActived: GridOptions;
  gridApiActived: GridApi;
  columnApiActived: ColumnApi;
  selectedRowsActived: boolean = true;

  //Deactived
  gridOptionsDeactived: GridOptions;
  gridApiDeactived: GridApi;
  columnApiDeactived: ColumnApi;
  selectedRowsDeactived: boolean = true;

  sideBar: any = {};
  baseListActived: any[] = [];
  listActived: any[] = [];

  mounted() {
    // this.driversHandler.map((driver: any, index: any) => {
    //   return (driver.index = index);
    // });
    // this.baseListActived = this.driversHandler;
    // this.baseListDisabled = this.driversHandler;
    // this.generateLists();
  }

  @Watch('drivers')
  async onDriversChanged() {
    this.selectedRowsActived = true;
    this.selectedRowsDeactived = true;
    const driversActived = this.driversCondition(true);
    const driversDeactived = this.driversCondition(false);
    this.gridApiActived.setRowData(driversActived || []);
    this.gridApiDeactived.setRowData(driversDeactived || []);
  }

  @Watch('dialog')
  async onDialogChanged() {
    this.selectedRowsActived = true;
    this.selectedRowsDeactived = true;
    const driversActived = this.driversCondition(true);
    const driversDeactived = this.driversCondition(false);
    this.gridApiActived.setRowData(driversActived || []);
    this.gridApiDeactived.setRowData(driversDeactived || []);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  async onGridReadyActived(params: GridReadyEvent) {
    this.gridApiActived = params.api;
    this.columnApiActived = params.columnApi;
    const drivers = this.driversCondition(true);
    this.gridApiActived.setRowData(drivers || []);
  }

  async onGridReadyDeactived(params: GridReadyEvent) {
    this.gridApiDeactived = params.api;
    this.columnApiDeactived = params.columnApi;
    const drivers = this.driversCondition(false);
    this.gridApiDeactived.setRowData(drivers || []);
  }

  driversCondition(state: boolean) {
    return this.drivers.filter((driver: any) => driver.estadoCopiloto == state);
  }

  closeDialog() {
    InformeEventBus.$emit('closeDialog');
  }

  searchActiveDrivers(input: string) {
    this.gridApiActived.setQuickFilter(input);
  }
  searchDeactiveDrivers(input: string) {
    this.gridApiDeactived.setQuickFilter(input);
  }

  async deactivateDrivers() {
    const drivers = this.gridApiActived.getSelectedRows();
    InformeEventBus.$emit('deactivateDrivers', drivers);
  }

  async activateDrivers() {
    const drivers = this.gridApiDeactived.getSelectedRows();
    InformeEventBus.$emit('activateDrivers', drivers);
  }

  onSelectionRowActived(event: any) {
    const drivers: any[] = this.gridApiActived.getSelectedRows();
    this.selectedRowsActived = drivers.length == 0 ? true : false;
  }
  onSelectionRowDeactived(event: any) {
    const drivers: any[] = this.gridApiDeactived.getSelectedRows();
    this.selectedRowsDeactived = drivers.length == 0 ? true : false;
  }

  constructor() {
    super();
    this.localeText = config.agGridTextos;
    this.sideBar = config.agGridDefaultConfig;

    this.columnDefs = [
      {
        headerName: '',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        autoHeight: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        suppressMenu: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        autoHeight: true,
        sortable: true,
        resizable: true,
        width: 250,
        minWidth: 250,
        lockPinned: true,
      },
    ];

    this.gridOptionsActived = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReadyActived,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      onSelectionChanged: this.onSelectionRowActived,
      //onRowSelected: this.onSelectionRow,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      // onDragStopped: this.onDragStoppedEvent,
      // onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {},
      suppressCsvExport: true,
      suppressExcelExport: true,
    };

    this.gridOptionsDeactived = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReadyDeactived,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      onSelectionChanged: this.onSelectionRowDeactived,
      // onRowSelected: this.onSelectionRow,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      // onDragStopped: this.onDragStoppedEvent,
      // onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {},
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }
}
</script>
<style scoped>
.v-list {
  height: 90%; /* or any height you want */
  overflow-y: auto;
}
#mainDiv {
  height: 100vh;
  width: 100%;
}
#headerDialog {
  display: flex;
  align-items: center;
  height: 6%;
  background: #27488e;
}
#bodyDialog {
  height: 94%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#centerBodyDialog {
  height: 85%;
  width: 75%;
}
.idItemCard {
  cursor: pointer;
  font-size: 18px;
  font-weight: 200;
  height: 45px;
  width: 100%;
  margin-top: 10px;
  margin-left: 12px;
  margin-right: 12px;
  text-align: -webkit-center;
}
.idItemCard:hover {
  border: 2px solid black;
}

.textstyle {
  font-family: 'Asap', sans-serif;
  color: white;
  font-weight: 300;
}
</style>

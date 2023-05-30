<template>
  <v-container fluid grid-list-md>
    <v-flex>
      <div class="headerDiv">
        <div style="width: 50%">
          <v-text-field
            v-model="searchInput"
            label="Buscar..."
            single-line
            hide-details
            style="width: 100%"
            @input="handleSearch"
          />
        </div>
        <div
          style="width: 50%; display: flex; align-items: flex-end; justify-content: end"
        >
          <v-btn
            color="#ffe800"
            depressed
            small
            @click="dialogEdit = true"
            style="margin: 10px; height: 4vh; width: 9vw; position: right "
          >
            <span
              style="color: black; font-family: Asap, sans-serif; font-weight: 500;"
              >Editar Estado</span
            ></v-btn
          >
        </div>
      </div>
      <v-divider></v-divider>
      <div class="gridcard rounded-card">
        <ag-grid-vue
          style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        ></ag-grid-vue>
      </div>
    </v-flex>
    <editComponent :dialog="dialogEdit" :drivers="conductores" />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
const { AgGridVue } = require('ag-grid-vue');
import config from '@/config/index';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { IConductor } from '@/interfaces/Conductores';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import EditorConductoresCopiloto from '@/pantallas/CopilotoVirtual/Conductores/EditorConductoresCopiloto.vue';
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
import HandleErrors from '@/config/handleErrors';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    editComponent: EditorConductoresCopiloto,
  },
})
export default class CopilotoConductores extends Vue {
  readonly conductorController: string = 'Conductor';
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  gridOptions: GridOptions;
  localeText: any = {};
  sideBar: any = {};
  loadingService = new LoadingService();
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  muestraBarraBotones: boolean = false;
  inUse: boolean = false;
  haveChange: Boolean = false;
  driversChangedList: {}[] = [];
  valCheck: any[] = [];
  countStartChanges: number = 0;
  clienteId: number = config.getClienteSesion();
  conductores: any[] = [];
  handleErrors: HandleErrors = new HandleErrors();
  $snotify: any;

  searchInput: string = '';
  dialogEdit: boolean = false;

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.chargeDrivers();
  }

  handleSearch(event: string) {
    this.gridApi.setQuickFilter(event);
  }

  async getDrivers() {
    try {
      this.loadingService.showLoading();
      const response: any = await this.axiosVehiculo.http
        .get(`${this.conductorController}/ConductoresCopiloto`)
        .finally(() => {
          this.loadingService.hideLoading();
        });
      this.conductores = JSON.parse(JSON.stringify(response.data));
      this.loadingService.hideLoading();
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  async chargeDrivers() {
    await this.getDrivers();
    this.gridApi.setRowData(this.conductores || []);
  }

  async created() {
    await this.initialize();

    InformeEventBus.$on('closeDialog', () => {
      this.dialogEdit = false;
    });

    InformeEventBus.$on('deactivateDrivers', (drivers: any[]) => {
      const driversMap = drivers.map((driver: any) => {
        return {
          ConductorId: driver.conductorId,
          Estado: false,
          Rut: driver.rut,
        };
      });
      this.updateDrivers(driversMap);
    });

    InformeEventBus.$on('activateDrivers', (drivers: any[]) => {
      const driversMap = drivers.map((driver: any) => {
        return {
          ConductorId: driver.conductorId,
          Estado: true,
          Rut: driver.rut,
        };
      });
      this.updateDrivers(driversMap);
    });
  }

  async initialize() {
    //await this.obtenerConductores();
  }

  async updateDrivers(drivers: any[]) {
    try {
      this.loadingService.showLoading();
      await this.axiosVehiculo.http
        .post(`${this.conductorController}/putConductorSimple`, drivers)
        .then(() => {
          this.$snotify.success(
            drivers.length == 1
              ? 'El estado del conductor se ha guardado con éxito'
              : 'El estado de los conductores se ha guardado con éxito'
          );
        })
        .catch(() => {
          this.$snotify.error(
            drivers.length == 1
              ? 'Hubo un error al guardar el estado del conductor'
              : 'Hubo un error al guardar el estado de los conductores'
          );
        })
        .finally(() => {
          // this.loadingService.hideLoading();
          this.chargeDrivers();
          this.gridApi.refreshCells({ force: true });
        });
    } catch (error) {
      console.log(error);
    }
  }

  // cancelUpdates(): any {
  //   this.newConductores = JSON.parse(JSON.stringify(this.conductores));
  //   this.runCheckBox();
  //   this.driversChangedBool = true;
  // }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows(); //Ordenamiento + Seleccion
  }

  getRowDriver(idDriver: number): number {
    var rowId: number = -1;
    for (var i = 0; i < this.conductores.length; i++) {
      if (idDriver == this.conductores[i].conductorId) {
        rowId = i;
        break;
      }
    }
    return rowId;
  }

  onSelectionRow(row: any) {
    // const rowId = this.getRowDriver(row.data.conductorId);
    // if (this.countStartChanges > 0) {
    //   this.countStartChanges--;
    // } else {
    //   this.newConductores[rowId].estadoCopiloto = this.newConductores[rowId]
    //     .estadoCopiloto
    //     ? false
    //     : true;
    //   this.resetButtons();
    // }
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  constructor() {
    super();

    this.localeText = config.agGridTextos;
    this.sideBar = config.agGridDefaultConfig;

    this.columnDefs = [
      // {
      //   headerName: '',
      //   width: 70,
      //   minWidth: 70,
      //   pinned: 'left',
      //   checkboxSelection: true,
      //   headerCheckboxSelection: true,
      //   // cellRenderer: (r: any) => {
      //   //   this.inUse = false;
      //   //   return r.node.setSelected(r.value);
      //   // },
      //   suppressMenu: true,
      //   filter: false,
      //   suppressMovable: true,
      //   lockVisible: true,
      // },
      {
        headerName: 'Estado copiloto',
        field: 'estadoCopiloto',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: (params: any) => {
          return params.value === true ? 'Activado' : 'Desactivado';
        },
      },
      {
        headerName: 'Id',
        field: 'conductorId',
        hide: true,
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        sortable: true,
        resizable: true,
        minWidth: 80,
        width: 150,
        lockPinned: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        resizable: true,
        width: 250,
        minWidth: 80,
        lockPinned: true,
        // cellRenderer: (params: any) => {
        //   return `${params.data.nombre} ${params.data.apellidoPaterno} ${params.data.apellidoMaterno}`;
        // },
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        sortable: true,
        resizable: true,
        width: 250,
        minWidth: 80,
        lockPinned: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      onSelectionChanged: this.onSelectionChanged,
      onRowSelected: this.onSelectionRow,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onDragStopped: this.onDragStoppedEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }
}
</script>

<style scoped>
.headerDiv {
  display: flex;
  width: 100%;
  margin-bottom: 3px;
}
/* #custom-disabled.v-btn--disabled{
  background-color: #ececec !important;
} */
</style>

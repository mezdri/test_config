<template>
  <div id="containerSendCommandSMS">
    <v-layout row wrap style="padding-right:0px; margin-top: 15px">
      <v-flex sm12 md12 layout wrap>
        <v-flex sm3 md3>
          <v-text-field
            v-model="searchVehicle"
            label="Ingrese la patente a buscar..."
            single-line
            hide-details
            @keypress.enter="get_vehicles"
            @blur="get_vehicles"
          ></v-text-field>
        </v-flex>
        <v-flex
          sm3
          md3
          style="display: flex; justify-content: flex-start; align-items: end;"
        >
          <v-btn
            color="primary"
            flat
            icon
            small
            style="margin: 0px !important;"
            @click="get_vehicles"
          >
            <v-icon color="black">search</v-icon>
          </v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
    <div style="margin-top: 20px;">
      <v-card style="width: 100%; ">
        <MantenedorGrid
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :grid-options="gridOptions"
        />
      </v-card>
    </div>
    <EnvioComandosModal
      :modalType="modalType"
      :show="modalDialog"
      :params="selectedRow"
      @cerrar="handleCloseModalSendCommand"
    />
    <MapComponent
      :openDialog="openDialog"
      :event="currentEvent"
      @closeMap="handleCloseMap"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
const { AgGridVue } = require('ag-grid-vue');
import MapComponent from '@/pantallas/Camaras/MapComponent.vue';
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
import { fetchSMS } from '@/pantallas/TorreControl/fetchSMS';
import { LoadingService } from '@/services/loadingService';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Funcionalidades } from '@/config/funcionalidades';
import {
  codigoAccionesMenuItem as cami,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import store from '@/store';
import MenuItemSMS from '@/components/MenuItemSMS.vue';
import { actionsEvent } from '@/setup';
import EnvioComandosModal from '@/pantallas/TorreControl/EnvioComandosSMS/EnvioComandosModal.vue';

@Component({
  components: {
    MantenedorGrid: AgGridVue,
    MenuItemSMS,
    EnvioComandosModal,
    MapComponent,
  },
})
export default class EnvioComandosSMS extends ComponenteBase {
  // Perfilación
  readonly codigoAccionesMenuItem = Object.values(cami);
  readonly funcionalidad: Funcionalidades = Funcionalidades.EnvioComandosSMS;

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEnviarComando: PermisoAccion = {
    accionCodigo: 95,
    visible: false,
  };

  accionVerDetalle: PermisoAccion = {
    accionCodigo: 4,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEnviarComando,
    this.accionVerDetalle,
  ];

  // State
  modalDialog: boolean = false;
  modalType: string = '';
  selectedRow: any = {};
  searchVehicle: string = '';
  currentEvent: any = {};
  openDialog: boolean = false;
  columnApi: any = null;
  gridApi: GridApi = null;
  //@ts-ignore
  $snotify: any;
  loadingService = new LoadingService();
  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'id',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Marca',
        field: 'marca',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Patente',
        field: 'patente',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Última actividad',
        field: 'ultima_actividad',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Ubicación',
        sortable: true,
        resizable: true,
        minWidth: 80,
        cellStyle: {
          cursor: 'pointer',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'flex-start',
        },
        onCellClicked: this.renderMap,
        cellRenderer: params => {
          return params.data.latitud != '-1' &&
            params.data.longitud != '-1' &&
            params.data.latitud != '0' &&
            params.data.longitud != '0' &&
            params.data.latitud != null &&
            params.data.longitud != null
            ? '<i class="material-icons" id="iconMap" title="Ver Mapa" style="margin-top: 60%; color: #27488e" >map</i>'
            : '';
        },
        cellClass: 'cellClassAggrid',
      },
      {
        headerName: 'Acciones',
        width: 120,
        minWidth: 120,
        sortable: false,
        resizable: false,
        filter: false,
        enablePivot: false,
        field: 'id',
        cellRendererFramework: MenuItemSMS,
        cellRendererParams: (params: any) => {
          const funcionalidad = Funcionalidades.EnvioComandosSMS;
          let codigoAccionesMenuItem = Object.values(cami);
          return {
            funcionalidad,
            codigoAccionesMenuItem,
            usuario: store.state.user,
            data: params.data,
          };
        },
        colId: 'params',
        rowDrag: false,
        pinned: 'right',
        lockVisible: true,
        suppressMovable: true,
        getQuickFilterText: () => '',
        cellStyle: { textAlign: 'center' },
      },
    ],
    rowSelection: 'multiple',
    pagination: true,
    paginationPageSize: 50,
    cacheBlockSize: 10000,
    paginationAutoPageSize: false,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
    onGridReady: this.handleGridReady,
    suppressCsvExport: false,
    onGridSizeChanged: (event: any) => {
      event.api.sizeColumnsToFit();
    },
  };

  constructor() {
    super();
    actionsEvent.onEnviarComando(this.handleSendCommandModal);
    actionsEvent.onVerDetalle(this.handleCheckDetailModal);
  }

  handleCloseMap() {
    this.openDialog = false;
  }

  renderMap(event: any) {
    var lat = event.data.latitud != null ? event.data.latitud : -28.851947;

    var lon: number =
      event.data.longitud != null ? event.data.longitud : -70.035511;

    var data = {
      latitud: lat,
      longitud: lon,
      fecha: event.data.ultima_actividad,
    };

    this.currentEvent = data;
    this.openDialog = true;
  }

  handleSendCommandModal(params: ICellRendererParams) {
    this.selectedRow = params.data;
    this.modalType = 'send';
    this.modalDialog = true;
  }

  handleCheckDetailModal(params: ICellRendererParams) {
    this.selectedRow = params.data;
    this.modalType = 'detail';
    this.modalDialog = true;
  }

  handleCloseModalSendCommand() {
    this.modalDialog = false;
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
    //this.get_vehicles();
  }

  async get_vehicles() {
    this.loadingService.showLoading();
    const body = {
      id_usuario: (408).toString(), //this.getUserID().toString(),
      id_cliente: this.getClientID().toString(),
      patente: this.searchVehicle,
    };
    fetchSMS(body, 'get_patents')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener los vehículos'
          );
        } else {
          this.gridApi.setRowData(response.data.data);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de los vehículos [get_patents]'
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
}
</script>
<style scoped>
#descriptionActiveContainer {
  height: 3%;
}
</style>

<template>
  <div id="containerDiv">
    <CortaCorrienteModal
      :show="showModal"
      :selectedAction="selectedAction"
      :loadData="currentRow"
      @closeModal="handleCloseModal"
    />
    <app-confirmacion
      :show="handleDeleteVal"
      titulo="Eliminación Corta Corriente"
      :mensaje="$t(deleteMessage)"
      :textoBtnSi="$t('mensajes.mensajesInformes.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesInformes.btnCancelarGeneracion')"
      @modalConfirmationEmit="deleteReg($event)"
    ></app-confirmacion>
    <div id="headerDiv">
      <div class="section">
        <v-text-field
          style="margin-left: 1%; height: max-content;"
          v-model="searchInput"
          @input="searchData"
          label="Buscar..."
        ></v-text-field>
      </div>
      <div class="section"></div>
      <div class="section" style="justify-content: flex-end;">
        <v-btn style="height: 48px;" color="#ffe800" @click="handleCreate">
          <v-icon
            dark
            left
            style="font-size: 160%; margin-right: 7% !important;"
            >add_circle_outline</v-icon
          >
          <span style="font-size: 1.5vmin;">Crear </span>
        </v-btn>
      </div>
    </div>
    <div id="bodyDiv">
      <v-card style="width: 100%; ">
        <GridComponent
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        ></GridComponent>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
const { AgGridVue } = require('ag-grid-vue');
import { Vue, Component } from 'vue-property-decorator';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import MenuItem from '@/components/MenuItem.vue';
import { LoadingService } from '@/services/loadingService';
import CortaCorrienteModal from './CortaCorrienteModal.vue';
import store from '@/store';
import Confirmation from '@/components/Confirmation.vue';
import {
  codigoAccionesMenuItem as cami,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { actionsEvent } from '@/setup';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

@Component({
  components: {
    GridComponent: AgGridVue,
    CortaCorrienteModal,
    'app-confirmacion': Confirmation,
  },
})
export default class CortaCorriente extends ComponenteBase {
  axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
  readonly codigoAccionesMenuItem = Object.values(cami);
  readonly funcionalidad: Funcionalidades = Funcionalidades.CortaCorriente;
  readonly urlPg: string = 'Metabase/PostgenericA/track_corta_corriente/';

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };
  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };
  accionVerDetalle: PermisoAccion = {
    accionCodigo: 4,
    visible: false,
  };
  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEditar,
    this.accionVerDetalle,
    this.accionEliminar,
  ];

  // State
  loadingService = new LoadingService();
  searchInput: string = '';
  gridOptions: GridOptions;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  showModal: boolean = false;
  selectedAction: string = '';
  localeText: any = {};
  currentRow: any = {};
  handleDeleteVal: boolean = false;
  deleteMessage: string = '';
  //@ts-ignore
  $snotify: any;

  // Functions
  searchData() {
    this.gridApi.setQuickFilter(this.searchInput);
    this.gridApi.setDomLayout('autoHeight');
  }

  constructor() {
    super();
    let funcionalidad = this.funcionalidad;
    let codigoAccionesMenuItem = Object.values(cami);
    actionsEvent.onVerDetalle(this.handleSeeDetail);
    actionsEvent.onEditar(this.handleEdit);
    actionsEvent.onEliminar(this.handleDelete);
    this.columnDefs = [
      {
        headerName: 'id',
        field: 'id',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Tipo Corta Corriente',
        field: 'tipo',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Sitio',
        field: 'nomzona',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Total Vehículos',
        field: 'count_jvehiculo',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechacreacion',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Usuario Creador',
        field: 'nomusuariocreador',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Fecha Modificacion',
        field: 'fechamodificacion',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Usuario Modificador',
        field: 'nomusuariomodificacion',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
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
        cellRendererFramework: MenuItem,
        cellRendererParams: (params: any) => {
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
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      onGridSizeChanged: event => {
        event.api.sizeColumnsToFit();
      },
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      isExternalFilterPresent: () => {
        return true;
      },
      doesExternalFilterPass: () => {
        return true;
      },
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      blockLoadDebounceMillis: 350,
      columnTypes: {},
      suppressCsvExport: false,
      suppressExcelExport: true,
    };
  }

  mounted() {
    this.getCortaCorriente();
  }

  handleCloseModal() {
    this.currentRow = {};
    this.showModal = false;
    this.getCortaCorriente();
  }

  handleSeeDetail(params: any) {
    this.currentRow = params.data;
    this.selectedAction = 'detail';
    this.showModal = true;
  }
  handleDelete(params: any) {
    this.currentRow = params.data;
    console.log(params);
    this.deleteMessage = `Desea Eliminar El Corta Corriente Del Sitio: ${params.data.nomzona}`;
    this.handleDeleteVal = true;
  }
  handleEdit(params: any) {
    this.currentRow = params.data;
    this.selectedAction = 'edit';
    this.showModal = true;
  }
  handleCreate() {
    this.currentRow = {};
    this.selectedAction = 'create';
    this.showModal = true;
  }

  deleteReg(val: boolean) {
    this.handleDeleteVal = false;
    if (val) {
      let body: any = {
        clienteid: this.getClientID().toString(),
        usuarioid: this.getUserID().toString(),
        idcortacorriente: this.currentRow.id,
      };
      this.loadingService.showLoading();
      this.axios.http
        .post(this.urlPg + 'del_corta_corriente_id', body)
        .then((response: any) => {
          if (response.data.CODIGO_RESPUESTA == '1') {
            this.$snotify.success(response.data.msg, {
              timeout: 3000,
            });
            this.getCortaCorriente();
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
          }
        })
        .catch((error: any) => {
          console.log(error);
          this.$snotify.error('Error al Obtener los Corta Corrientes');
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  async getCortaCorriente() {
    let body: any = { clienteid: this.getClientID().toString() };
    this.loadingService.showLoading();
    this.axios.http
      .post(this.urlPg + 'get_corta_corriente_cliente', body)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.gridApi.setRowData(response.data.data);
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al Obtener los Corta Corrientes');
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
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
#containerDiv {
  /* height: 100%; */
  width: 100%;
}
#headerDiv {
  height: 10vh;
  display: flex;
  align-items: flex-end;
  width: 100%;
  padding-bottom: 15px;
}
.section {
  height: 100%;
  width: 33%;
  display: flex;
  align-items: flex-end;
}
#bodyDiv {
  /* height: 70%; */
  width: 100%;
}
</style>

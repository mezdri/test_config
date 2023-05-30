<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Clientes</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            @input="onFilterTextBoxChanged"
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md6>
        <div align="right" style="padding-top:15px">
          <v-btn
            v-if="accionExportar.visible"
            flat
            small
            color="primary"
            @click="exportar()"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-divider></v-divider>
    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>

    <app-cliente-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :cliente="editedItem"
      v-on:modalAsociacionEmit="clienteModalCallback($event)"
    ></app-cliente-modal-edicion>
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import { EstadoEntidad } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import store from '@/store';
import { LoadingService } from '@/services/loadingService';
import { IClientes } from '@/interfaces/Clientes';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  RowNode,
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-cliente-modal-edicion': () =>
      import('@/components/plataforma/ClienteModalEdicion.vue'),
  },
})
export default class Cliente extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Clientes;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  controller: string = 'Cliente';
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  gridOptions: GridOptions;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);

  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

  $snotify: any;

  selected: any = [];
  validForm: Boolean = true;
  date: any = null;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;

  search: string = '';
  editedIndex: number = -1;

  dictionaryFormErrors: any = {};
  serverSide: any;
  handleErrors: HandleErrors = new HandleErrors();
  loadingService = new LoadingService();
  paramsExportar: any; //Parametros para Exportar

  editedItem: IClientes = {};

  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };

    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        suppressMenu: true,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'center', 'pointer-events': 'none' },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        resizable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
        lockPinned: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        width: 400,
        minWidth: 80,
        resizable: true,
        sortable: true,
        lockPinned: true,
      },
      {
        headerName: 'Giro',
        field: 'giro',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        rowDrag: true,
        width: 229,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
        rowDrag: true,
        width: 229,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Calle',
        field: 'calle',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Comuna',
        field: 'comuna',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Provincia',
        field: 'provincia',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Región',
        field: 'region',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Teléfono 1',
        field: 'telefono1',
        rowDrag: true,
        width: 229,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Teléfono 2',
        field: 'telefono2',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Acceso Usuarios',
        field: 'accesoUsuariosTxt',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Recepción Actividades',
        field: 'recepcionActividadesTxt',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Sincronización CRM',
        field: 'sincronizarCrmTxt',
        lockPinned: true,
        width: 229,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        filter: false,
        suppressMovable: true,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 5, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      localeText: this.localeText,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onGridReady: this.onGridReady,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  mounted() {
    eventBus.changeTitlePage('Clientes');

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Editar || data.action == Accion.VerDetalle) {
        //Editar
        if (data.action == Accion.Editar) {
          this.modalEsEdicion = true;
        } else {
          this.modalEsEdicion = false;
        }

        this.editedIndex = data.id;
        let item: any = null;

        this.gridApi.forEachNode((rowNode: RowNode) => {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            return true;
          }
        });

        if (item !== null) {
          this.editedItem = item;
          this.showModalEdit = true;
        }
      }
    });
  }

  onFilterTextBoxChanged() {
    if (this.search.length >= 2) {
      this.gridApi.onFilterChanged();
    } else if (this.search.length === 0) {
      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.loadingService.showLoading();
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.serverSide = {
        getRows(params: any): void {
          params.request.search = self.search;
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          self.paramsExportar = params; //Parametros al Exportar

          self.axiosCliente
            .http(`${self.controller}/grid`, { params: params.request })
            .then(clientes => {
              if (clientes.data.data.length === 0) {
                // self.gridApi.setRowData([{}]);
                params.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                params.successCallback(
                  clientes.data.data,
                  clientes.data.lastRow
                );
                self.gridApi.hideOverlay();
              }
              //self.gridApi.sizeColumnsToFit();
              self.loadingService.hideLoading();
            })
            .catch(err => {
              params.failCallback();
              self.loadingService.hideLoading();
            });
        },
      };

      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
  }

  gpsModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosCliente
        .http(`${this.controller}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Clientes.csv',
            respServer.data.data,
            this.columnDefs
          );
          this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
        })
        .catch(err => {
          if (!err.response) {
            this.$snotify.error('Ocurrió un error al exportar.');
          }
        });
    } else {
      this.$snotify.warning('No existen datos para exportar.');
    }
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }

  clienteModalCallback(val: boolean) {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 0);
  }
}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-divider></v-divider>

    <v-layout row wrap style="padding-right: 0px">
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

      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
        <div align="right" style="padding-top: 15px">
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

      <v-flex xs12 sm6 md2 style="padding-right: 0px">
        <div align="right" style="padding-top: 6px; padding-right: 0px">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            @click="handleCrearClick()"
            style="padding-right: 20px"
          >
            <v-icon dark style="color=black" left>add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <app-comando-velocidad-modal-nuevo
      :show="mostrarModalCrear"
      v-on:modalAsociacionEmit="handleCierreModal()"
    ></app-comando-velocidad-modal-nuevo>
    <v-layout
      row
      wrap
      v-show="muestraBarraBotones"
      class="animated fadeIn fast"
    >
    </v-layout>

    <v-divider></v-divider>
    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
  </v-container>
</template>

<script lang="ts">
import store from '@/store';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';

import {
  IVehiculo,
  ITipoPeaje,
  ITipoCombustible,
  ITipoTransmision,
} from '@/interfaces/Vehiculos';

import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';

import ComandoVelocidadNuevo from '@/pantallas/ComandoVelocidad/ComandoVelocidadNuevo.vue';

import ImportFile from '@/components/ImportFile.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-comando-velocidad-modal-nuevo': ComandoVelocidadNuevo,
    'app-import': ImportFile,
  },
})
export default class CertificadoEmision extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.ComandoVelocidad;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionAsociarFlota: PermisoAccion = {
    accionCodigo: 38,
    visible: false,
  };

  accionAsociarEtiqueta: PermisoAccion = {
    accionCodigo: 49,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionAsociarFlota,
    this.accionAsociarEtiqueta,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);

  readonly controllerVehiculo: string = 'VelocidadMaxima';
  readonly controllerGpsVehiculo: string = 'GpsVehiculo';
  readonly controllerCompartirInformacion: string = 'CompartirInformacion';

  clienteId: number = config.getClienteSesion();
  tabModel: string = 'tab-1';
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  rowData: any = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  detailCellRendererParams: any = null;
  muestraBarraBotones: boolean = false;
  loadingService = new LoadingService();
  showAdvertenciaVehiculoCompartido: boolean = false;
  msgAdvertenciaVehiculoCompartido: string = '';
  eliminiarMasivoCompartidos: boolean = false;
  chequearPermisosBtnCrear: boolean = true;

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  gridOptions: GridOptions;

  showModalAsociarEtiquetas: boolean = false;
  showModalAsociarFlotas: boolean = false;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;

  $snotify: any;
  vehiculos: IVehiculo[] = [];

  showModalCambioEstado: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];
  dataVehiculos: IVehiculo[] = [];
  valUnidad: String = '';

  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;

  TipoPeaje: ITipoPeaje[] = [];
  TipoCombustible: ITipoCombustible[] = [];
  TipoTransmision: ITipoTransmision[] = [];

  search: String = '';
  editedIndex: number = -1;
  editedItem: IVehiculo = {};
  defaultItem: IVehiculo = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  showTabFlotas: boolean = true;
  serverSide: any;

  titleEliminarItem: any = '';
  mensajeMasivo: any = '';

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  eliminarAsociacosMsj: string = '';
  showEliminarAsociadosModal: boolean = false;
  showEliminarAsociadosGPSModal: boolean = false;
  cantidadGPS: number = 0;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  eliminandoVehiculoCompartido: boolean = false;
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  compartirTipo: number = 0;
  compartirId: number = 0;

  //
  mostrarModalCrear: boolean = false;

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
        checkboxSelection: false,
        suppressMenu: true,
        filter: true,
        suppressMovable: true,
        resizable: false,
        sortable: false,
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Agregar Etiqueta') === false &&
          this.chequearPermiso('Asociar Flota') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
      },
      {
        headerName: 'Vehiculo Id',
        field: 'vehiculoId',
        resizable: true,
        sortable: true,
        hide: true,
        width: 10,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
        resizable: true,
        sortable: true,
        width: 100,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Flota',
        field: 'flota',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Marca Gps',
        field: 'marcaGps',
        width: 120,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Modelo Gps',
        field: 'modeloGps',
        width: 120,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
        width: 150,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Fecha Solicitud',
        field: 'fechaSolicitudTxt',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Fecha Respuesta',
        field: 'fechaRespuestaTxt',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Tipo Solicitud',
        field: 'solicitudTxt',
        width: 160,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'IMEI GPS',
        field: 'imei',
        resizable: true,
        width: 160,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
    ];

    //Grilla Etiquetas
    this.detailCellRendererParams = {
      detailGridOptions: {
        localeText: this.localeText,
        suppressCsvExport: true,
        suppressExcelExport: true,
        columnDefs: [
          {
            headerName: 'Etiquetas',
            field: 'nombre',
            resizable: true,
            sortable: false,
            suppressMenu: true,
            filter: false,
            suppressMovable: true,
          },
        ],
      },
      getDetailRowData: (params: any) => {
        params.successCallback(params.data.etiquetas);
      },
    };

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      onSelectionChanged: this.onSelectionChanged,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      // onDragStopped: this.onDragStoppedEvent,
      // onColumnVisible: this.onColumnVisibleEvent,
      // onColumnPinned: this.onColumnPinnedEvent,
      masterDetail: true,
      detailCellRendererParams: this.detailCellRendererParams,
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

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  async created() {}

  onFilterTextBoxChanged() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.search.length >= 2) {
        self.gridApi.onFilterChanged();
      } else if (self.search.length === 0) {
        self.gridApi.setServerSideDatasource(self.serverSide);
      }
      clearInterval(self.intervalo);
    }, 500);
  }

  onGridReady(params: GridReadyEvent) {
    this.loadingService.showLoading();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.ServerSideControler();
    });
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows();
  }

  // closeModal(val: Boolean) {
  //   this.dialogEliminar = val;
  //   this.dialogConfirmEliminarSeleccionadas = val;
  //   this.showModalAsociarEtiquetas = false;
  //   this.showModalAsociarFlotas = false;
  // }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosVehiculo.http
        .get(
          `${this.controllerVehiculo}/${this.clienteId}/GetVelocidadMaximaGrilla`,
          {
            // params: this.paramsExportar.request,
          }
        )
        .then(respServer => {
          config.crearArchivoCsv(
            'ComandoVelocidadEnviados.csv',
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

  ServerSideRefresh() {
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  ServerSideControler() {
    const self = this;
    this.serverSide = {
      getRows(params: any): void {
        params.request.search = self.search;
        params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
        self.paramsExportar = params; //Parametros al Exportar

        const idFilasSeleccionadas = self.gridApi
          .getSelectedRows()
          .map(x => x.id);
        self.axiosVehiculo.http
          .get(
            `${self.controllerVehiculo}/${self.clienteId}/GetVelocidadMaximaGrilla`,
            {
              params: null, //params.request,
            }
          )
          .then(vehiculo => {
            if (vehiculo.data.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              params.successCallback(vehiculo.data.data, vehiculo.data.lastRow);
              self.gridApi.forEachNode(node => {
                node.setSelected(false);
              });

              self.gridApi.forEachNode(node => {
                let existe = idFilasSeleccionadas.find(
                  (x: any) => x === node.data.id
                );
                if (existe !== null && existe !== undefined) {
                  node.setSelected(true);
                }
              });
              self.gridApi.hideOverlay();
            }
            self.loadingService.hideLoading();
          })
          .catch(err => {
            params.failCallback();
            self.loadingService.hideLoading();
          });
      },
    };

    this.ServerSideRefresh();
  }

  getValorCelda(itemEntidadId: number, nombreColumna: string) {
    if (this.gridApi !== undefined) {
      let item: any = null;
      let res: any = '';

      this.gridApi.forEachNode((rowNode: RowNode) => {
        if (itemEntidadId == rowNode.data.id) {
          item = rowNode.data;
        }
      });

      if (item != null) {
        res = item[nombreColumna];
      }

      return res;
    }

    return '';
  }
  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModal() {
    this.mostrarModalCrear = false;
  }
}
</script>

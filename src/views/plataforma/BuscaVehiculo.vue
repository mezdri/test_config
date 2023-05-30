<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Buscar Vehículos</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:0px">
      <v-flex xs10 sm4 md4>
        <div align="left">
          <v-text-field
            v-model="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <div class="text-xs-center">
          <v-btn flat icon small @click="onFilterTextBoxChanged">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small :disabled="btnDisabled" @click="clearFilters">
            <v-icon>clear</v-icon>
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
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import store from '@/store';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import IconoCompartido from '@/components/IconoCompartido.vue';
import { Component } from 'vue-property-decorator';

import {
  IVehiculo,
  ITipoPeaje,
  ITipoCombustible,
  ITipoTransmision,
} from '@/interfaces/Vehiculos';

import { eventBus, actionsEvent } from '@/setup';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import {
  EstadoEntidad,
  Accion,
  TipoCompartir,
  EstadoCompartirInformacion,
} from '@/config/enums';
import AsociarFlotaAVehiculos from '@/components/plataforma/AsociarFlotaAVehiculos.vue';
import AsociarEtiquetaVehiculos from '@/components/plataforma/AsociarEtiquetaVehiculos.vue';
import VehiculosModalNuevo from '@/components/plataforma/VehiculosModalNuevo.vue';
import VehiculosModalEdicion from '@/components/plataforma/VehiculosModalEdicion.vue';
import ImportFile from '@/components/ImportFile.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import Vue from 'vue';
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
    'app-icono-compartido': IconoCompartido,
  },
})
export default class BuscaVehiculo extends Vue {
  readonly funcionalidad: Funcionalidades = Funcionalidades.BuscaVehiculo;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);

  readonly controllerVehiculo: string = 'vehiculo';
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
        headerName: 'Código',
        field: 'id',
        resizable: true,
        hide: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: '',
        cellRendererFramework: 'app-icono-compartido',
        colId: 'esCompartido',
        width: 73,
        minWidth: 50,
        suppressMenu: true,
        filter: false,
        resizable: false,
        lockPinned: true,
        lockVisible: true,
        cellStyle: { padding: 0 },
      },
      {
        headerName: 'VIN',
        field: 'vin',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Cliente',
        field: 'cliente',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
        width: 170,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
        width: 170,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Tipo Peaje',
        field: 'tipoPeaje',
        width: 200,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Año',
        field: 'ano',
        resizable: true,
        lockPinned: true,
        width: 150,
        minWidth: 80,
      },
      {
        headerName: 'Tipo Combustible',
        field: 'tipoCombustible',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Tipo Transmisión',
        field: 'tipoTransmision',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Nro. Motor',
        field: 'numeroMotor',
        resizable: true,
        width: 160,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Nro. Serie',
        field: 'numeroSerie',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Marca GPS',
        field: 'marcaGps',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Modelo GPS',
        field: 'modeloGps',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'IMEI GPS',
        field: 'imei',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Nro. SIM',
        field: 'numeroSim',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Tipo SIM',
        field: 'tipoSim',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Cía. Telecomunicaciones',
        field: 'ciaTelecomunicaciones',
        resizable: true,
        width: 230,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Flota',
        field: 'flota',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Conductor',
        field: 'nombreConductor',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 170,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        width: 170,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 180,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
    ];

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
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      masterDetail: true,
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

  mounted() {
    eventBus.changeTitlePage('Buscar Vehiculos');
  }

  async created() {}

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  clearFilters() {
    const self = this;
    this.search = '';
    this.onFilterTextBoxChanged();
    this.ServerSideRefresh();
  }

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

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows();
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.dialogConfirmEliminarSeleccionadas = val;
    this.showModalAsociarEtiquetas = false;
    this.showModalAsociarFlotas = false;
  }

  vehiculoModalCallback(val: boolean) {
    this.muestraBarraBotones = false;

    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;
    this.showModalAsociarEtiquetas = val;
    this.showModalAsociarFlotas = val;

    setTimeout(() => {
      this.ServerSideRefresh();
    }, 0);
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosVehiculo.http
        .get(`${this.controllerVehiculo}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Vehiculos.csv',
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
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  ServerSideControler() {
    const self = this;
    this.serverSide = {
      getRows(params: any): void {
        params.request.search = self.search;
        params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
        self.paramsExportar = params; //Parametros al Exportar
        self.axiosVehiculo.http
          .get(`${self.controllerVehiculo}/gridBusquedaGlobal`, {
            params: params.request,
          })
          .then(vehiculo => {
            if (vehiculo.data.data == null) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              params.successCallback(vehiculo.data.data, vehiculo.data.lastRow);
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

  validarEsCompartido() {
    this.axiosVehiculo.http
      .get(
        `${this.controllerVehiculo}/${this.editedIndex}/${this.clienteId}/vehiculoEsCompartido`
      )
      .then(resVeh => {
        resVeh.data = resVeh.data.filter((x: any) => x.id === this.editedIndex);

        if (resVeh.data.length > 0) {
          this.msgAdvertenciaVehiculoCompartido =
            'El Vehículo se encuentra actualmente compartido con ' +
            (resVeh.data.length === 1 ? 'el Cliente ' : 'los Clientes ');

          resVeh.data.forEach((v: any, index: number) => {
            if (index === resVeh.data.length - 1) {
              this.msgAdvertenciaVehiculoCompartido +=
                v.compartidoPor +
                ', por lo que si elimina el Vehículo ' +
                (resVeh.data.length === 1
                  ? 'el Cliente dejará'
                  : 'los Clientes dejarán') +
                ' de recibir información ¿Desea continuar?';
            } else if (index < resVeh.data.length - 1) {
              this.msgAdvertenciaVehiculoCompartido += v.compartidoPor + ', ';
            }
          });

          this.compartirId = resVeh.data[0].compartirId;
          this.compartirTipo = resVeh.data[0].compartirTipo;
          this.dialogEliminar = false;
          this.eliminandoVehiculoCompartido = true;
          this.showAdvertenciaVehiculoCompartido = true;
        } else {
          this.dialogEliminar = true;
          this.eliminandoVehiculoCompartido = false;
          this.showAdvertenciaVehiculoCompartido = false;
        }
      });
  }
}
</script>

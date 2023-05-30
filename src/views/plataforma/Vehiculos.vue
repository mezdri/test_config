<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Vehículos</v-tab>
      <v-tab v-if="showTabFlotas" :href="`#tab-2`" to="/flotas">Flotas</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:0px">
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
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            @click="(editedItem = {}), (showModalNew = true)"
            style="padding-right:20px;"
          >
            <v-icon dark style="color=black" left>add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <v-layout
      row
      wrap
      v-show="muestraBarraBotones"
      class="animated fadeIn fast"
    >
      <div>
        <v-flex md2>
          <v-btn
            v-if="accionAsociarFlota.visible"
            flat
            small
            class="btn-barra"
            @click="AsociarFlotaModal()"
          >
            <v-icon>swap_vert</v-icon>&nbsp;&nbsp;Asociar Flota
          </v-btn>
        </v-flex>
      </div>

      <div>
        <v-flex md2>
          <v-btn
            v-if="accionAsociarEtiqueta.visible"
            flat
            small
            class="btn-barra"
            @click="AsociarEtiquetaModal()"
          >
            <v-icon>label</v-icon>&nbsp;&nbsp;Agregar Etiqueta
          </v-btn>
        </v-flex>
      </div>

      <!-- <div data-permiso="Eliminar">
                <v-flex md3>
                    <v-btn
                            data-permiso="Eliminar"
                            flat
                            small
                            class="btn-barra"
                            @click="eliminarMasivoConfirm"
                    >
                        <v-icon>delete</v-icon>&nbsp;&nbsp;Eliminar Seleccionadas
                    </v-btn>
                </v-flex>
      </div>-->
    </v-layout>

    <v-divider></v-divider>
    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
    <!-- CONFIRMACION ELIMINACION ITEM VEHICULO -->
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="titleEliminarItem"
      :mensaje="$t('mensajes.crud.eliminar.mensaje', { entidad: 'Vehículo' })"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmEliminarSeleccionadas"
      :titulo="
        $t('mensajes.crud.eliminarMasivo.titulo', { entidad: 'Vehículo(s)' })
      "
      :mensaje="mensajeMasivo"
      v-on:modalConfirmationEmit="confirmCallbackEliminarSeleccionadas($event)"
      :textoBtnSi="$t('mensajes.crud.eliminarMasivo.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminarMasivo.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="showAdvertenciaVehiculoCompartido"
      :titulo="titleEliminarItem"
      :mensaje="msgAdvertenciaVehiculoCompartido"
      v-on:modalConfirmationEmit="confirmCallbackVehiculoCompartido($event)"
      :textoBtnSi="$t('mensajes.crud.sinSeleccion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.sinSeleccion.btnCancelar')"
    ></app-confirmacion>
    <app-vehiculos-modal-nuevo
      :show="showModalNew"
      :vehiculos="editedItem"
      v-on:modalAsociacionEmit="vehiculoModalCallback($event)"
    ></app-vehiculos-modal-nuevo>
    <app-vehiculos-modal-edicion
      :show="showModalEdit"
      :vehiculos="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="vehiculoModalCallback($event)"
    ></app-vehiculos-modal-edicion>
    <app-asociar-modal-etiquetas
      :show="showModalAsociarEtiquetas"
      :data="dataVehiculos"
      v-on:modalAsociacionEtiquetaEmit="vehiculoModalCallback($event)"
    ></app-asociar-modal-etiquetas>
    <app-asociar-modal-flotas
      :show="showModalAsociarFlotas"
      :vehiculos="dataVehiculos"
      v-on:modalAsociacionFlotaEmit="vehiculoModalCallback($event)"
    ></app-asociar-modal-flotas>

    <div class="text-xs-center">
      <v-dialog v-model="showEliminarAsociadosModal" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="showEliminarAsociadosModal = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Eliminar Vehículo (s)</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>{{ eliminarAsociacosMsj }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              small
              color="primary"
              @click="showEliminarAsociadosModal = false"
              >Aceptar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text-xs-center">
      <v-dialog
        v-model="showEliminarAsociadosGPSModal"
        persistent
        max-width="480"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Eliminar Vehículo: {{ valUnidad }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <span v-if="cantidadGPS === 1">
              El Vehículo tiene un GPS asociado, por esta razón no se podrá
              realizar la eliminación.
            </span>
            <span v-if="cantidadGPS > 1">
              El Vehículo tiene {{ cantidadGPS }} GPSs asociados, por esta razón
              no se podrá realizar la eliminación.
            </span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              small
              color="primary"
              @click="showEliminarAsociadosGPSModal = false"
              >Aceptar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
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
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-vehiculos-modal-nuevo': VehiculosModalNuevo,
    'app-vehiculos-modal-edicion': VehiculosModalEdicion,
    'app-asociar-modal-etiquetas': AsociarEtiquetaVehiculos,
    'app-asociar-modal-flotas': AsociarFlotaAVehiculos,
    'app-import': ImportFile,
    'app-icono-compartido': IconoCompartido,
  },
})
export default class Vehiculos extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Vehiculos;
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
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        hide: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
        resizable: true,
        sortable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: 'agGroupCellRenderer',
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
        sortable: true,
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
        sortable: true,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
        width: 170,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
        width: 170,
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
        headerName: 'Tipo Peaje',
        field: 'tipoPeaje',
        width: 200,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Año',
        field: 'ano',
        resizable: true,
        sortable: true,
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
        sortable: true,
      },
      {
        headerName: 'Tipo Transmisión',
        field: 'tipoTransmision',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Nro. Motor',
        field: 'numeroMotor',
        resizable: true,
        width: 160,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Nro. Serie',
        field: 'numeroSerie',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Marca GPS',
        field: 'marcaGps',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Modelo GPS',
        field: 'modeloGps',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'IMEI GPS',
        field: 'imei',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Nro. SIM',
        field: 'numeroSim',
        resizable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Tipo SIM',
        field: 'tipoSim',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Cía. Telecomunicaciones',
        field: 'ciaTelecomunicaciones',
        resizable: true,
        width: 230,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Flota',
        field: 'flota',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Conductor',
        field: 'nombreConductor',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 170,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        sortable: true,
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
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
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
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
        suppressMovable: true,
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
        /*onFirstDataRendered(params: any) {
          params.api.sizeColumnsToFit();
        },*/
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
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
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

  mounted() {
    eventBus.changeTitlePage('Vehiculos');
    this.showTabFlotas = config.chequeaPermisosTabs(
      Funcionalidades.Flotas,
      config.getClienteSesion()
    );
  }

  async created() {
    await this.initialize();
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
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

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      this.loadingService.showLoading();

      try {
        //1. Si se elimina Vehículo compartido en Flota, se debe notificar por correo que se ha removido de la Flota
        if (this.eliminandoVehiculoCompartido) {
          if (this.compartirTipo === TipoCompartir.Flota) {
            const id_Flota = config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'flotaId'
            );
            let vehiculosId: number[] = [];
            vehiculosId.push(this.editedIndex);
            await this.enviarCorreoRemover(vehiculosId, id_Flota);
          } else {
            await this.enviarCorreoDejarDeCompartir();
          }
        }
        //---

        //3. Se elimina Vehículo
        const res = await this.axiosVehiculo.http.delete(
          `${this.controllerVehiculo}/${this.editedIndex}`
        );
        //---

        //4. Se notifica el borrado exitoso y se actualiza la grilla
        this.loadingService.hideLoading();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Vehículo',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'unidad'
            ),
            eliminadaO: 'eliminado',
          })
        );

        setTimeout(() => {
          this.ServerSideRefresh();
        }, 0);
        //---
      } catch (e) {
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'Vehículo',
                nombre: config.getValorCelda(
                  this.gridApi,
                  this.editedIndex,
                  'unidad'
                ),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'Vehículo',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'unidad'
              ),
            })
          );
        }
      }
    }
  }

  async enviarCorreoRemover(vehiculosIds: number[], flotaId: number) {
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: '',
      url: '',
      idEntidad: flotaId,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: 0,
      compartirInformacionId: 0,
      vehiculosIds: vehiculosIds,
    };

    const res: any = await this.axiosAuth.http.post(
      `Email/RemoverVehiculos`,
      modelEmail
    );
  }

  async enviarCorreoDejarDeCompartir() {
    let model: any = {
      Id: this.compartirId,
      Descripcion: '',
      Estado: EstadoEntidad.Inactivo,
      FechaFinAsociacion: new Date(),
      EstadoCompartirInformacion: EstadoCompartirInformacion.DejarDeCompartir,
    };

    let arr: any[] = window.location.pathname.split('/');
    let url: string =
      arr.length >= 3
        ? window.location.origin + '/' + arr[1]
        : window.location.origin;
    let modelEmail: any = {
      encodeIdUsuario: '',
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: url,
      url: '',
      idEntidad: 0,
      clienteUsuariosId: 0,
      funcionalidad:
        this.compartirTipo === TipoCompartir.Flota
          ? TipoCompartir.Flota
          : TipoCompartir.Vehículo,
      identificadorId: 0,
      compartirInformacionId: this.compartirId,
    };

    const res: any = await this.axiosVehiculo.http.put(
      `${this.controllerCompartirInformacion}`,
      model
    );

    const resCorreo: any = await this.axiosAuth.http.post(
      `Email/DejarDeCompartir`,
      modelEmail
    );
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

  async obtenerVehiculos() {
    try {
      const response = await this.axiosVehiculo.http.get(
        this.controllerVehiculo
      );
      this.vehiculos = response.data;
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

  async confirmCallbackVehiculoCompartido(val: boolean) {
    this.showAdvertenciaVehiculoCompartido = false;
    if (val) {
      //if (!this.eliminiarMasivoCompartidos) {
      await this.deleteItemCallback(val);
      /*} else {
        await this.eliminarSeleccionadas();
      }*/
    }
  }

  async initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        //Eliminar Vehículo
        this.editedIndex = data.id;
        this.titleEliminarItem = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Vehículo',
          nombreEntidad: this.getValorCelda(data.id, 'unidad'),
        });
        this.valUnidad = this.getValorCelda(data.id, 'unidad');

        //1. Validar que el Vehículo no tenga GPS ni sea compartido
        this.validarGpsVehiculo();
      } else if (
        data.action === Accion.Editar ||
        data.action === Accion.VerDetalle
      ) {
        //Editar

        this.modalEsEdicion = data.action == Accion.Editar;
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
          .get(`${self.controllerVehiculo}/${self.clienteId}/grid`, {
            params: params.request,
          })
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

  AsociarFlotaModal() {
    this.dataVehiculos = [];
    const data = this.gridApi.getSelectedNodes();

    for (let i = 0; i <= data.length - 1; i++) {
      this.dataVehiculos.push(data[i].data);
    }

    this.showModalAsociarFlotas = true;
  }

  AsociarEtiquetaModal() {
    this.dataVehiculos = [];
    const data = this.gridApi.getSelectedNodes();

    for (let i = 0; i <= data.length - 1; i++) {
      this.dataVehiculos.push(data[i].data);
    }
    this.showModalAsociarEtiquetas = true;
  }

  async eliminarSeleccionadas() {
    if (this.gridApi.getSelectedNodes().length > 0) {
      const items = this.gridApi.getSelectedNodes();
      this.loadingService.showLoading();

      for (let i = 0; i <= items.length - 1; i++) {
        try {
          const resVC: any = this.axiosVehiculo.http.get(
            `${this.controllerVehiculo}/${items[i].data.id}/${this.clienteId}/vehiculoEsCompartido`
          );
          resVC.data = resVC.data.filter((x: any) => x.id === items[i].data.id);

          if (resVC.data.length > 0) {
            //vehiculo compartido
            let vehiculosId: number[] = [];
            vehiculosId.push(this.editedIndex);
            let id_Flota = config.getValorCelda(
              this.gridApi,
              items[i].data.id,
              'flotaId'
            );

            await this.enviarCorreoRemover(vehiculosId, id_Flota);
          }

          await this.axiosVehiculo.http.delete(
            `${this.controllerVehiculo}/${items[i].data.id}`
          );
        } catch (e) {
          if (e.response !== undefined) {
            if (e.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    items.length > 1
                      ? 'los ' + items.length + ' Vehículos'
                      : 'El Vehículo',
                  eliminadaOs:
                    items.length > 1 ? 'seleccionados' : 'seleccionado',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'los ' + items.length + ' Vehículos'
                    : 'El Vehículo',
                eliminadaOs:
                  items.length > 1 ? 'seleccionados' : 'seleccionado',
              })
            );
          }
        }
      }

      try {
        this.loadingService.hideLoading();
        this.muestraBarraBotones = false;
        let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
          los_cantidad_entidad_seleccionados:
            items.length > 1
              ? 'Los ' + items.length + ' Vehículos seleccionados'
              : 'El Vehículo seleccionado',
          eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
        });

        if (items.length === 1) {
          msj = msj.toString().replace('han', 'ha');
        }

        this.$snotify.success(msj);
        this.ServerSideRefresh();
      } catch (e) {
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'los ' + items.length + ' Vehículos'
                    : 'El Vehículo',
                eliminadaOs:
                  items.length > 1 ? 'seleccionados' : 'seleccionado',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'los ' + items.length + ' Vehículos'
                  : 'El Vehículo',
              eliminadaOs: items.length > 1 ? 'seleccionados' : 'seleccionado',
            })
          );
        }
      }
    }
  }

  async confirmCallbackEliminarSeleccionadas(
    aceptado: boolean,
    close: boolean = false
  ) {
    this.dialogConfirmEliminarSeleccionadas = false;

    if (aceptado) {
      //Eliminación
      await this.eliminarSeleccionadas();
    } else {
      this.gridApi.deselectAll();
    }
  }

  async eliminarMasivoConfirm() {
    //recupera data vehiculo compartido y despliega modal de advertencia cambio por vehiculo compartido
    let cantidad: number = 0;
    let mandante: string = '';
    let patentesCompartidos: string = '';

    this.eliminiarMasivoCompartidos = false;
    const data = this.gridApi.getSelectedNodes();

    ///valida que los vehiculos seleccionados no sean compartidos (solo propios)
    let puedeContinuar: boolean = true;
    let mensaje: string = '';
    for (let i: number = 0; i <= data.length - 1; i++) {
      if (data[i].data.esCompartido === true) {
        puedeContinuar = false;
        if (i === data.length - 1) {
          mensaje += `${
            data[i].data.patente !== null && data[i].data.patente !== undefined
              ? data[i].data.patente
              : data[i].data.vin
          }`;
        } else {
          mensaje += `${
            data[i].data.patente !== null && data[i].data.patente !== undefined
              ? data[i].data.patente
              : data[i].data.vin
          }, `;
        }
      }
    }
    if (!puedeContinuar) {
      this.eliminarAsociacosMsj = `No es posible eliminar vehículos que le han sido compartidos (${mensaje})`;
      this.showEliminarAsociadosModal = true;
      return;
    }

    for (let i: number = 0; i <= data.length - 1; i++) {
      let response: any = await this.axiosVehiculo.http.get(
        `${this.controllerVehiculo}/${data[i].data.id}/${this.clienteId}/vehiculoEsCompartido`
      );
      if (response.data.length > 0) {
        let v: any = response.data.find(
          (x: any) => x.patente === data[i].data.patente
        );
        if (v !== undefined) {
          patentesCompartidos += `${v.patente}, `;
          mandante = v.compartidoPor;
          cantidad += 1;
        }
      }
    }

    if (cantidad > 0) {
      //vehiculos compartidos
      this.eliminiarMasivoCompartidos = true;
      this.titleEliminarItem = 'Eliminar Vehículos';

      if (cantidad === data.length) {
        this.msgAdvertenciaVehiculoCompartido =
          cantidad > 1
            ? `Los vehículos (${patentesCompartidos
                .toString()
                .substring(
                  0,
                  patentesCompartidos.length - 2
                )}) se encuentran actualmente en una Flota compartida,
                                                            por lo que si elimina los vehículos el/los clientes dejarán de recibir información, ¿Desea continuar?`
            : `El vehículo seleccionado se encuentra actualmente en una Flota compartida con el cliente ${mandante}, por lo que si elimina el vehículo el/los clientes
                                                            dejarán de recibir información, ¿Desea continuar?`;
      } else if (cantidad > 1) {
        this.msgAdvertenciaVehiculoCompartido = `Los vehículos (${patentesCompartidos
          .toString()
          .substring(
            0,
            patentesCompartidos.length - 2
          )}) se encuentran actualmente en una Flota compartida,
                                                            por lo que si elimina los vehículos el/los clientes dejarán de recibir información, ¿Desea continuar?`;
      } else if (cantidad === 1) {
        this.msgAdvertenciaVehiculoCompartido = `El vehículo (${patentesCompartidos
          .toString()
          .substring(
            0,
            patentesCompartidos.length - 2
          )}) se encuentra actualmente en una Flota compartida,
                                                            por lo que si elimina los vehículos el/los clientes dejarán de recibir información, ¿Desea continuar?`;
      }

      this.showAdvertenciaVehiculoCompartido = true;
    } else {
      this.mensajeMasivo = this.$t('mensajes.crud.eliminarMasivo.mensaje', {
        los_cantidad_entidad_seleccionados:
          this.gridApi.getSelectedNodes().length > 1
            ? 'los ' +
              this.gridApi.getSelectedNodes().length +
              ' Vehículos seleccionados'
            : 'el Vehículo seleccionado',
      });

      this.dialogConfirmEliminarSeleccionadas = true;
    }
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

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }

  validarGpsVehiculo() {
    this.axiosGps.http
      .get(`${this.controllerGpsVehiculo}/${this.editedIndex}/gpss/`)
      .then(response => {
        this.cantidadGPS = response.data.length;
        if (response.data.length > 0) {
          this.dialogEliminar = false;
          this.showEliminarAsociadosGPSModal = true;
        } else {
          this.showEliminarAsociadosGPSModal = false;
          this.validarEsCompartido();
        }
      });
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

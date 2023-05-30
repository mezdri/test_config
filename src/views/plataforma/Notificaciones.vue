<template>
  <v-container fluid grid-list-md>
    <v-tabs
      left
      v-model="tabModel"
      @change="cargaNotificaciones()"
      color="transparent"
    >
      <v-tab href="#0">Activas</v-tab>
      <v-tab href="#1">Todas</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-form ref="form" v-model="validForm" lazy-validation>
      <v-layout>
        <v-flex xs12 md8 lg8 v-if="tabModel === '0'" style="padding-top: 22px">
          <h2 class="h2_title">Notificaciones Activas</h2>
        </v-flex>
        <v-flex xs12 md8 lg8 v-if="tabModel === '1'" style="padding-top: 22px">
          <h2 class="h2_title">Todas las Notificaciones</h2>
        </v-flex>
        <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
          <v-autocomplete
            v-model="buscarAlertaMes"
            label="Filtrar por Mes"
            :items="meses"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
          <v-text-field
            v-model="buscarAlertaAnio"
            label="Filtrar por Año"
            type="text"
            v-validate="'numeric|max:4|min_value:0|integer'"
            :error-messages="errors.collect('anio')"
            data-vv-name="anio"
            :counter="4"
          ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md1 v-if="tabModel === '1'">
          <div class="text-xs-center" style="padding-top=10px">
            <v-btn flat icon small :disabled="!validForm">
              <v-icon @click="onFilterTextBoxChanged">search</v-icon>
            </v-btn>
            <v-btn flat icon small>
              <v-icon @click="clearFilters">clear</v-icon>
            </v-btn>
          </div>
        </v-flex>
      </v-layout>
      <v-divider></v-divider>
      <v-flex md12>
        <div class="gridcard rounded-card">
          <ag-grid-vue
            style="width: 100%; height: 400px; font-family: 'Asap', sans-serif"
            class="ag-theme-material"
            :gridOptions="gridOptions"
          ></ag-grid-vue>
        </div>
      </v-flex>
    </v-form>
    <ContactosNotificados
      :show="muestraNotificados"
      v-on:modalAsociacionEmit="notificadosModalCallback($event)"
      :id="idNotificacion"
    ></ContactosNotificados>
    <DetalleNotificacion
      :show="muestraDetalleNotificacion"
      v-on:modalDetalleEmit="detallesModalCallback($event)"
      :id="idNotificacion"
    ></DetalleNotificacion>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';

import { IEtiqueta } from '@/interfaces/Etiquetas';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { ITipoActividad } from '@/interfaces/TipoActividad';
import { ServicioProxy, HomeFiltros } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import moment, { Duration } from 'moment';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { Validator } from 'vee-validate';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import store from '@/store';
import ContactosNotificados from '@/components/plataforma/ContactosNotificados.vue';
import DetalleNotificacion from '@/components/plataforma/DetalleNotificacion.vue';
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
    ContactosNotificados,
    DetalleNotificacion,
  },
})
export default class Notificaciones extends ComponenteBaseStepper {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Notificaciones;
  permisosActuales: PermisoAccionVm[] = [];

  permisosTotales: PermisoAccionVm[] = [];

  //Variables globales
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  tabModel: string = '0';

  columnDefsAlertas: Array<ColDef> = [];
  gridOptions: GridOptions;
  sideBar: any = config.agGridDefaultConfig; //
  localeText: any = config.agGridTextos; //
  alertasRespaldo: any[] = [];
  buscarAlertaMes: string = '';
  buscarAlertaAnio: string = '';
  isNoData: boolean = false;
  dictionaryFormErrors: any = {};
  validForm: boolean = false;
  usuarioId: number = store.state.userId;
  filtroMes: string = '';
  filtroAnio: string = '';

  gridApi: GridApi;
  columnApi: ColumnApi;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  serverSide: any;
  $snotify: any;
  muestraNotificados: boolean = false;
  muestraDetalleNotificacion: boolean = false;
  idNotificacion: number = 0;

  //AXIOS
  axiosNotificacion: AxiosVue = new AxiosVue(ServicioProxy.Notificacion);

  meses: any[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  mounted() {
    this.tabModel = '0';
    this.initialize();
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        anio: {
          max: () => '* Formato de Año inválido.',
          min_value: () => '* Formato de Año inválido.',
          integer: () => '* Formato de Año inválido.',
          numeric: () => '* Formato de Año inválido.',
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  constructor() {
    super();
    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };

    this.columnDefsAlertas = [
      {
        headerName: 'Color de Tipificación',
        field: 'color',
        width: 200,
        minWidth: 200,
        filter: false,
        suppressMovable: true,
        sortable: false,
        resizable: true,
        enablePivot: false,
        lockVisible: true,
        pinned: 'left',
        lockPosition: true,
        cellRenderer: this.createIconC,
      },
      {
        headerName: 'Fecha/Hora',
        field: 'fechaInicio',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockPinned: true,
        width: 300,
        minWidth: 300,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Mensaje',
        field: 'mensaje',
        lockPinned: true,
        width: 250,
        minWidth: 250,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Contactos Notificados',
        field: '',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: this.createContactosBtn,
      },
      {
        headerName: 'Detalle Notificación',
        field: '',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: this.createDetalleBtn,
      },
      {
        headerName: 'Mapa',
        field: 'mapa',
        suppressMovable: true,
        minWidth: 80,
        width: 150,
        enablePivot: true,
        resizable: true,
        lockVisible: true,
        pinned: 'right',
        cellRenderer: this.createMapaBtn,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefsAlertas,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
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

    this.tabModel = '0';
  }

  /*Grilla */
  onGridReady(params: GridReadyEvent) {
    this.loadingService.showLoading();
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.closeToolPanel();

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.serverSide = {
        getRows(params: any): void {
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          params.request.tipo = self.tabModel;
          params.request.mes = self.buscarAlertaMes;
          params.request.ano = self.buscarAlertaAnio;
          if (self.tabModel == '0') {
            params.request.mes = '';
            params.request.ano = '';
          }
          params.request.clienteId = self.clienteId;
          self.axiosNotificacion.http
            .post(`Notificacion/grid`, params.request)
            .then(gps => {
              if (gps.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                self.gridApi.hideOverlay();
                params.successCallback(gps.data.data, gps.data.lastRow);
              }
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

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
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

  onFilterTextBoxChanged() {
    let flagMes: boolean = this.validaNulo(this.buscarAlertaMes);
    let flagA: boolean = this.validaNulo(this.buscarAlertaAnio);
    if (flagMes || flagA) {
      this.gridApi.onFilterChanged();
    } else if (!flagMes && !flagA) {
      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }

  clearFilters() {
    this.buscarAlertaMes = '';
    this.buscarAlertaAnio = '';
    this.loadingService.showLoading();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  validaNulo(item: any): boolean {
    if (item !== null && item !== undefined) return true;
    else return false;
  }

  createFechaIcon(params: any) {
    if (params.data !== undefined) {
      var newFecha = new Date(params.data.fechaTermino);
      if (newFecha.getFullYear() !== 1900) {
        return moment(String(newFecha)).format('DD/MM/YYYY HH:mm:ss');
      } else {
        return '';
      }
    }
  }

  async cargaNotificaciones() {
    this.clienteId = config.getClienteSesion();
    let cont = 0;
    this.loadingService.showLoading();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  createIconC(params: any) {
    if (params.data.color !== undefined) {
      var eSpan = document.createElement('i');
      eSpan.className = 'material-icons';
      eSpan.id = params.data.id;
      eSpan.innerHTML = 'fiber_manual_record';
      let color = params.data.color;
      if (color === 'Roja') {
        eSpan.title = 'Roja';
        eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 40px;';
      } else if (color === 'Verde') {
        eSpan.title = 'Verde';
        eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 40px;';
      } else {
        eSpan.title = 'Amarilla';
        eSpan.style.cssText = 'cursor:pointer;color:yellow;font-size: 40px;';
      }
      return eSpan;
    }
  }

  createMapaBtn(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'map';
    eSpan.className = 'material-icons';
    eSpan.id = params.data.id;
    eSpan.style.cssText =
      'cursor:pointer;color:#27488E;font-size: 25px;padding-top:10px;';
    eSpan.title = 'Ver Mapa';

    eSpan.addEventListener('click', () => {
      var latitud = params.data.latitudInicioExceso;
      var longitud = params.data.longitudInicioExceso;
      this.openDetalle(latitud, longitud);
    });
    return eSpan;
  }

  createContactosBtn(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'VER >';
    eSpan.id = params.data.id;
    eSpan.style.cssText = 'cursor:pointer;color:#000000;font-size: 13px;';
    eSpan.title = 'Ver Contactos Notificados';

    eSpan.addEventListener('click', () => {
      this.mostrarNotificados(params.data.id);
    });
    return eSpan;
  }

  mostrarNotificados(idNotificacion: number) {
    this.muestraNotificados = true;
    this.idNotificacion = idNotificacion;
  }

  notificadosModalCallback() {
    this.muestraNotificados = false;
  }

  createDetalleBtn(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'VER >';
    eSpan.id = 'det' + params.data.id;
    eSpan.style.cssText = 'cursor:pointer;color:#000000;font-size: 13px;';
    eSpan.title = 'Ver Detalle Notificación';

    eSpan.addEventListener('click', () => {
      this.mostrarDelletaNotificacion(params.data.id);
    });
    return eSpan;
  }

  mostrarDelletaNotificacion(idNotificacion: number) {
    this.muestraDetalleNotificacion = true;
    this.idNotificacion = idNotificacion;
  }

  detallesModalCallback() {
    this.muestraDetalleNotificacion = false;
  }

  openDetalle(latitud: string, longitud: string) {
    var link =
      'https://www.google.com/maps/search/?api=1&query=' +
      latitud +
      ',' +
      longitud;
    window.open(link, '_blank');
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

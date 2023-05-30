<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivE">
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="close()">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Notificaciones</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-container
          fluid
          grid-list-md
          style="background-color: rgb(250, 250, 250)"
        >
          <v-tabs
            left
            v-model="tabModel"
            @change="cargaNotificaciones()"
            color="transparent"
            style="background-color: rgb(250, 250, 250)"
          >
            <v-tab href="#0">Activas</v-tab>
            <v-tab href="#1">Todas</v-tab>
          </v-tabs>
          <v-divider></v-divider>
          <v-form ref="form" v-model="validForm" lazy-validation>
            <v-layout>
              <v-flex>
                <v-flex
                  xs12
                  md8
                  lg8
                  v-if="tabModel === '0'"
                  style="padding-top: 22px"
                >
                  <h2 class="h2_title">Notificaciones Activas</h2>
                </v-flex>
                <v-flex
                  xs12
                  md8
                  lg8
                  v-if="tabModel === '1'"
                  style="padding-top: 22px"
                >
                  <h2 class="h2_title">Todas las Notificaciones</h2>
                </v-flex>
                <div style="display:flex ">
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <v-autocomplete
                      v-model="alertaNombre"
                      label="Nombre de alerta"
                      :items="buscarAlerta"
                      item-text="nombre"
                      item-value="nombre"
                      no-data-text="Sin resultados"
                      dense
                      multiple
                      small-chips
                    >
                      <template v-slot:prepend-item>
                        <v-list-tile
                          ><v-checkbox
                            v-model="checkAllAlerta"
                            label="Seleccionar todos"
                            @change="selectAllAlerta()"
                          ></v-checkbox
                        ></v-list-tile>
                        <v-divider></v-divider>
                      </template>
                      <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index === 0">
                          <span>{{ item.nombre }}</span>
                        </v-chip>
                        <span
                          v-if="index === 1"
                          class="grey--text text-caption"
                          style="font-size: 0.75em"
                        >
                          (+{{ alertaNombre.length - 1 }})
                        </span>
                      </template>
                    </v-autocomplete>
                  </v-flex>
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <v-autocomplete
                      v-model="alertaColor"
                      label="Color de tipicacion"
                      :items="Colores"
                      no-data-text="Sin resultados"
                      dense
                      multiple
                      small-chips
                    >
                      <template v-slot:prepend-item>
                        <v-list-tile
                          ><v-checkbox
                            v-model="checkAllColor"
                            label="Seleccionar todos"
                            @change="selectAllColor()"
                          ></v-checkbox
                        ></v-list-tile>
                        <v-divider></v-divider>
                      </template>
                      <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index === 0">
                          <span>{{ item }}</span>
                        </v-chip>
                        <span
                          v-if="index === 1"
                          class="grey--text text-caption"
                          style="font-size: 0.75em"
                        >
                          (+{{ alertaColor.length - 1 }})
                        </span>
                      </template>
                    </v-autocomplete>
                  </v-flex>
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <v-autocomplete
                      v-model="buscarAlertaPatente"
                      label="Unidad"
                      :items="Vehiculo"
                      item-text="unidad"
                      item-value="id"
                      no-data-text="Sin resultados"
                      dense
                      multiple
                      small-chips
                    >
                      <template v-slot:prepend-item>
                        <v-list-tile
                          ><v-checkbox
                            v-model="checkAll"
                            label="Seleccionar todos"
                            @change="selectAll()"
                          ></v-checkbox
                        ></v-list-tile>
                        <v-divider></v-divider>
                      </template>
                      <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index === 0">
                          <span>{{ item.unidad }}</span>
                        </v-chip>
                        <span
                          v-if="index === 1"
                          class="grey--text text-caption"
                          style="font-size: 0.75em"
                        >
                          (+{{ buscarAlertaPatente.length - 1 }})
                        </span>
                      </template>
                    </v-autocomplete>
                  </v-flex>
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <DatePicker v-model="fechaDesde" label="Desde" />
                  </v-flex>
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <TimePicker v-model="horaDesde" label="Hora Desde" />
                  </v-flex>
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <DatePicker v-model="fechaHasta" label="Hasta" />
                  </v-flex>
                  <v-flex xs12 md2 lg2 v-if="tabModel === '1'">
                    <TimePicker v-model="horaHasta" label="Hora Hasta" />
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
                </div>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <v-flex md12>
              <div class="gridcard rounded-card">
                <ag-grid-vue
                  style="
                    width: 100%;
                    height: 400px;
                    font-family: 'Asap', sans-serif;
                  "
                  class="ag-theme-material"
                  :gridOptions="gridOptions"
                ></ag-grid-vue>
              </div>
            </v-flex>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>
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
  </v-layout>
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
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { fetchAlertas } from '@/pantallas/Alertas/Services/fetchAlertas';
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
    DatePicker,
    TimePicker,
  },
})
export default class NotificacionesAlertasModal extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  etiquetas!: IEtiqueta;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Notificaciones;
  permisosActuales: PermisoAccionVm[] = [];

  permisosTotales: PermisoAccionVm[] = [];

  //Variables globales
  dialog: boolean = false;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  tabModel: string = '1';

  columnDefsAlertas: Array<ColDef> = [];
  gridOptions: GridOptions;
  sideBar: any = config.agGridDefaultConfig; //
  localeText: any = config.agGridTextos; //
  alertasRespaldo: any[] = [];
  buscarAlertaMes: string = '';
  buscarAlertaAnio: string = '';
  buscarAlertaPatente: string[] = [];
  alertaNombre: string[] = [];
  buscarAlerta: any[] = [];
  fechaDesde: string = '';
  fechaHasta: string = '';
  horaDesde: string = '';
  horaHasta: string = '';
  Vehiculo: string[] = [];
  Colores: string[] = ['Roja', 'Amarilla', 'Verde'];
  alertaColor: string[] = [];
  isNoData: boolean = false;
  dictionaryFormErrors: any = {};
  validForm: boolean = false;
  usuarioId: number = store.state.userId;
  filtroMes: string = '';
  filtroAnio: string = '';
  checkAll: boolean = false;
  checkAllColor: boolean = false;
  checkAllAlerta: boolean = false;

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
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  close() {
    this.dialog = false;
    this.$emit('modalAsociacionEmit', false);
  }

  mounted() {
    this.tabModel = '1';
    this.initialize();
  }

  async getVehiculos(): Promise<void> {
    try {
      const response = await this.axiosVehiculo.http.get(
        `Vehiculo/${this.clienteId}/vehiculosCliente`
      );
      this.Vehiculo = response.data;
    } catch (error) {
      console.log(error);
    }
  }

  selectAll() {
    if (this.checkAll === true) {
      this.Vehiculo.forEach((x: any) => {
        const existe: boolean = this.buscarAlertaPatente.some(a => a === x.id);
        if (existe === false) {
          this.buscarAlertaPatente.push(x.id);
        }
      });
    } else {
      this.buscarAlertaPatente = [];
    }
  }
  selectAllColor() {
    if (this.checkAllColor === true) {
      this.Colores.forEach((x: any) => {
        const existe: boolean = this.alertaColor.some(a => a === x);
        if (existe === false) {
          this.alertaColor.push(x);
        }
      });
    } else {
      this.alertaColor = [];
    }
  }
  selectAllAlerta() {
    if (this.checkAllAlerta === true) {
      this.buscarAlerta.forEach((x: any) => {
        const existe: boolean = this.alertaNombre.some(a => a === x);
        if (existe === false) {
          this.alertaNombre.push(x.nombre);
        }
      });
    } else {
      this.alertaNombre = [];
    }
  }

  async fetchAlertas() {
    this.loadingService.showLoading();
    return fetchAlertas()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Alertas',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
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

  onGridReadyAlertas(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
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
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre de Alerta',
        field: 'alertaNombre',
        lockPinned: true,
        width: 200,
        minWidth: 80,
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
        minWidth: 80,
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
        lockVisible: true,
        cellRenderer: this.createContactosBtn,
      },
      {
        headerName: 'Detalle Notificación',
        field: '',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        pivotIndex: 6,
        resizable: true,
        lockVisible: true,
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
      cacheBlockSize: 5, //Solución Paginación
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

  //////////////////////////////////////
  ///Grilla
  onGridReady(params: GridReadyEvent) {
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
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          params.request.tipo = self.tabModel;
          params.request.mes = self.buscarAlertaMes;
          params.request.ano = self.buscarAlertaAnio;
          params.request.unidad = self.buscarAlertaPatente;
          params.request.color = self.alertaColor;
          params.request.alertaNombre = self.alertaNombre;
          params.request.fechaInicio =
            moment(self.fechaDesde).format('YYYY-MM-DD ') +
            moment(self.horaDesde).format('HH:mm:ss');
          params.request.fechaFin =
            moment(self.fechaHasta).format('YYYY-MM-DD ') +
            moment(self.horaHasta).format('HH:mm:ss');
          if (self.tabModel == '0') {
            params.request.mes = '';
            params.request.ano = '';
            params.request.fechaInicio = '';
            params.request.fechaFin = '';
            params.request.horaInicio = '';
            params.request.horaFin = '';
            params.request.unidad = [];
            params.request.alertaNombre = [];
            params.request.color = [];
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
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.horaDesde = '';
    this.horaHasta = '';
    this.buscarAlertaPatente = [];
    this.alertaNombre = [];
    this.alertaColor = [];
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

  @Watch('show')
  async onPropertyChangedS(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.tabModel = '0';
    this.clienteId = config.getClienteSesion();
    this.buscarAlertaMes = '';
    this.buscarAlertaAnio = '';
    this.buscarAlertaPatente = [];
    this.alertaColor = [];
    this.alertaNombre = [];
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.horaDesde = '';
    this.horaHasta = '';
    this.getVehiculos();
    this.buscarAlerta = await this.fetchAlertas();

    if (value) {
      this.loadingService.showLoading();
      this.gridApi.setServerSideDatasource(this.serverSide);
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
  createDetalleBtn(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'VER >';
    eSpan.id = params.data.id;
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

  mostrarNotificados(idNotificacion: number) {
    this.muestraNotificados = true;
    this.idNotificacion = idNotificacion;
  }

  notificadosModalCallback() {
    this.muestraNotificados = false;
  }

  openDetalle(latitud: string, longitud: string) {
    var link =
      'https://www.google.com/maps/search/?api=1&query=' +
      latitud +
      ',' +
      longitud;
    window.open(link, '_blank');
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

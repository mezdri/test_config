<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Auditoría</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs12 sm6 md2>
        <v-autocomplete
          :items="eventos"
          v-model="filtroGrillaEvento"
          label="Evento"
          item-value="id"
          item-text="nombre"
          :error-messages="errors.collect('evento')"
          data-vv-name="evento"
          no-data-text="Sin resultados"
          autocomplete
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu
          :close-on-content-click="false"
          v-model="menuDatePickerFechaD"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="computedDateFormattedFechaD"
            label="Fecha Desde"
            persistent-hint
            prepend-icon="event"
            v-validate="''"
            :error-messages="errors.collect('fechaDesde')"
            data-vv-name="fechaDesde"
            readonly
          ></v-text-field>
          <v-date-picker
            v-model="filtroGrillaFechaD"
            first-day-of-week="1"
            locale="es-cl"
            scrollable
            :max="maxDate"
            :key="keyDatePickers"
            @input="menuDatePickerFechaD = false"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu
          :close-on-content-click="false"
          v-model="menuDatePickerFechaH"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="computedDateFormattedFechaH"
            label="Fecha Hasta"
            persistent-hint
            prepend-icon="event"
            v-validate="''"
            :error-messages="errors.collect('fechaHasta')"
            data-vv-name="fechaHasta"
            readonly
          ></v-text-field>
          <v-date-picker
            v-model="filtroGrillaFechaH"
            first-day-of-week="1"
            locale="es-cl"
            scrollable
            :min="minDate"
            :key="keyDatePickers"
            @input="menuDatePickerFechaH = false"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-autocomplete
          :items="usuarios"
          v-model="filtroGrillaUsuario"
          label="Usuario"
          item-value="id"
          item-text="nombreCompleto"
          :error-messages="errors.collect('usuario')"
          data-vv-name="usuario"
          no-data-text="Sin resultados"
          autocomplete
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md2>
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
      <v-flex xs12 sm6 md1>
        <div align="right" style="padding-top:15px">
          <v-btn
            flat
            small
            v-if="accionExportar.visible"
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

    <div class="gridcard rounded-card" style="margin-top:10px">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>

    <!-- VALIDA NÚMERO DE REGISTROS -->
    <div class="text-xs-center">
      <v-dialog v-model="showCantidadRegistros" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Consultar Auditoría</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text
              >No es posible obtener la información solicitada. Ha sobrepasado
              el límite de registros, considere limitar el periodo de
              consulta.</v-card-text
            >
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="confirmCallbackCantidadRegistros(true)"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Component } from 'vue-property-decorator';
import { EstadoAuditoria } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { EventosService } from '@/services/eventosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  AgGridEvent,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
} from 'ag-grid-community';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import store from '@/store';
import config from '@/config/index';
import { LoadingService } from '@/services/loadingService';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
  },
})
export default class Auditoria extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Auditoria;
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

  controller: string = 'Auditoria';
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  gridOptions: GridOptions;
  serverSide: any;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  dformat: any = '';

  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  search: string = '';
  usuarioId: number = store.state.userId;
  $snotify: any;
  readonly controllerUsuario: string = 'usuario';

  //FILTROS AUDITORIA
  eventosServices: EventosService = new EventosService();
  eventos: EstadoInterface[] = this.eventosServices.getEventos();
  usuarios: UsuariosInterface[] = [];
  filtroGrillaEvento: any = null;
  filtroGrillaUsuario: any = null;
  filtroGrillaFechaD = moment(new Date())
    .add(-7, 'days')
    .toISOString()
    .substr(0, 10);
  filtroGrillaFechaH: any = new Date().toISOString().substr(0, 10);
  menuDatePickerFechaD: boolean = false;
  menuDatePickerFechaH: boolean = false;
  keyDatePickers: number = 0;
  limpiarGrilla: boolean = true;
  btnDisabled: boolean = false;
  //---

  paramsExportar: any; //Parametros para Exportar
  showCantidadRegistros: boolean = false;

  loadingService = new LoadingService();

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
        //suppressMenu: true,
        enablePivot: false,
        sortable: false,
        width: 200,
        minWidth: 80,
        resizable: true,
        hide: true,
        lockPinned: true,
      },
      {
        headerName: 'Entidad',
        field: 'entidad',
        width: 200,
        minWidth: 80,
        filter: false,
        suppressMovable: true,
        resizable: true,
        sortable: false,
        enablePivot: false,
        pinned: 'left',
        lockVisible: true,
        rowDrag: false,
      },
      {
        headerName: 'Usuario',
        field: 'usuario',
        sortable: false,
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
      },
      {
        headerName: 'Evento',
        field: 'eventoTxt',
        sortable: false,
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        /*cellRenderer: (r: any) => {
          return EstadoAuditoria[r.data.evento];
        },*/
      },
      {
        headerName: 'Detalle',
        field: 'detalle',
        sortable: false,
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
      },
      {
        headerName: 'Fecha',
        field: 'fechaTxt',
        lockPinned: true,
        /*cellRenderer: (r: any) => {
          return this.formatDateTime(r.value);
        },*/
        sortable: false,
        resizable: true,
        width: 200,
        minWidth: 80,
      },
      /*{
        headerName: "Acciones",
        width: 120,
        minWidth: 120,
        filter: false,
        suppressMovable: true,
        resizable: false,
        sortable: false,
        enablePivot: false,
        pinned: "right",
        lockVisible: true,
        rowDrag: false
      }*/
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
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      blockLoadDebounceMillis: 350,
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  async created() {
    this.limpiarGrilla = true;
    this.keyDatePickers += 1;
    await this.getUsuarios();
  }

  onFilterTextBoxChanged() {
    let flagEvento: boolean = this.validaNulo(this.filtroGrillaEvento);
    let flagFechaD: boolean = this.validaNulo(this.filtroGrillaFechaD);
    let flagFechaH: boolean = this.validaNulo(this.filtroGrillaFechaH);
    let flagUsuario: boolean = this.validaNulo(this.filtroGrillaUsuario);

    /*//Limitar la Búsqueda a una Semana
    let fechaD: any = moment(this.filtroGrillaFechaD);
    let fechaH: any = moment(this.filtroGrillaFechaH);
    let numDias: number = fechaH.diff(fechaD, 'days');
    if (numDias > 7) {
      this.$snotify.warning('El rango de fechas no puede ser mayor a X días');
      return;
    }
    //---*/

    if (
      this.search.length >= 2 ||
      flagEvento ||
      flagFechaD ||
      flagFechaH ||
      flagUsuario
    ) {
      this.gridApi.onFilterChanged();
    } else if (
      this.search.length === 0 &&
      !flagEvento &&
      !flagFechaD &&
      !flagFechaH &&
      !flagUsuario
    ) {
      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }

  validaNulo(item: any): boolean {
    if (item !== null && item !== undefined) return true;
    else return false;
  }

  clearFilters() {
    this.btnDisabled = true;
    this.search = '';
    this.filtroGrillaEvento = null;
    this.filtroGrillaUsuario = null;
    this.filtroGrillaFechaD = moment(new Date())
      .add(-7, 'days')
      .toISOString()
      .substr(0, 10);
    this.filtroGrillaFechaH = new Date().toISOString().substr(0, 10);
    this.menuDatePickerFechaD = false;
    this.menuDatePickerFechaH = false;
    this.limpiarGrilla = true;
    this.gridApi.showNoRowsOverlay();
    //this.gridApi.sizeColumnsToFit();
    this.gridApi.setServerSideDatasource(this.serverSide);
    setTimeout(() => {
      this.btnDisabled = false;
    }, 3000);
    //this.onFilterTextBoxChanged();
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

  //Cambia Propiedad de Filtro en Grilla
  changeSortingProperty(val: boolean) {
    const columns = this.columnDefs.filter((column: ColDef) => {
      return column.headerName !== '' && column.headerName !== 'Acciones';
    });
    columns.forEach((item: any) => {
      item.sortable = val;
    });
  }
  //---

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
          params.request.clienteId = config.getClienteSesion();
          params.request.estadoEntidad = self.filtroGrillaEvento;
          params.request.fechaDesde = self.filtroGrillaFechaD;
          params.request.fechaHasta = self.filtroGrillaFechaH;
          params.request.usuarioId = self.filtroGrillaUsuario;
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          self.paramsExportar = params; //Parametros al Exportar

          self.axios.http
            .post(`${self.controller}/grid`, params.request)
            .then(log => {
              if (log.data.data.length === 0 || self.limpiarGrilla) {
                self.changeSortingProperty(false); //Cambia Propiedad de Filtro en Grilla
                self.gridApi.setColumnDefs(self.columnDefs); //Cambia Propiedad de Filtro en Grilla
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
                self.limpiarGrilla = false;
              } else {
                if (log.data.lastRow > 5000) {
                  self.changeSortingProperty(false); //Cambia Propiedad de Filtro en Grilla
                  self.gridApi.setColumnDefs(self.columnDefs); //Cambia Propiedad de Filtro en Grilla
                  self.gridApi.showNoRowsOverlay();
                  params.successCallback([{}], 0);
                  self.limpiarGrilla = false;
                  self.showCantidadRegistros = true; //Mostrar modal de cantidad de registros
                } else {
                  self.changeSortingProperty(true); //Cambia Propiedad de Filtro en Grilla
                  self.gridApi.setColumnDefs(self.columnDefs); //Cambia Propiedad de Filtro en Grilla
                  self.gridApi.hideOverlay();
                  params.successCallback(log.data.data, log.data.lastRow);
                }
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

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }

  async getUsuarios() {
    const loadingKey = 'getUsuarios';
    const clientSession: any = config.getClienteSesion();
    try {
      this.loadingService.showLoading(undefined, loadingKey);
      const response = await this.axios.http.get(
        `Usuario/${this.usuarioId}/${clientSession}/getUsuariosAuditoria`
      );
      this.usuarios = response.data;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener lista de Usuarios');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener lista de Usuarios');
      }
    } finally {
      this.loadingService.hideLoading(loadingKey);
    }
  }

  get computedDateFormattedFechaD() {
    return this.formatDate(this.filtroGrillaFechaD);
  }

  get computedDateFormattedFechaH() {
    return this.formatDate(this.filtroGrillaFechaH);
  }

  get minDate() {
    return this.filtroGrillaFechaD;
  }

  get maxDate() {
    return this.filtroGrillaFechaH;
  }

  formatDateTime(fecha: Date): string {
    if (!fecha) return null;
    return moment(fecha).format('DD/MM/YYYY HH:mm:ss');
  }

  formatDate(fecha: String): string {
    if (!fecha) return null;
    const [year, month, day] = fecha.toString().split('-');
    return `${day}/${month}/${year}`;
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.loadingService.showLoading();
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axios.http
        .post(`${this.controller}/grid`, this.paramsExportar.request)
        .then(respServer => {
          config.crearArchivoCsv(
            'Auditoria.csv',
            respServer.data.data,
            this.columnDefs
          );
          this.loadingService.hideLoading();
          this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
        })
        .catch(err => {
          this.loadingService.hideLoading();
          if (!err.response) {
            this.$snotify.error('Ocurrió un error al exportar.');
          }
        });
    } else {
      this.loadingService.hideLoading();
      this.$snotify.warning('No existen datos para exportar.');
    }
  }

  confirmCallbackCantidadRegistros(val: boolean) {
    this.showCantidadRegistros = false;
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>

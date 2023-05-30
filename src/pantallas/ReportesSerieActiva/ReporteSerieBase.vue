<template>
  <div class="resportesserie">
    <div class="flex sm10 md10">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.ubicacion.value"
                :label="formFields.ubicacion.label"
                :items="ubicacionlist"
                item-text="tipoubicaname"
                item-value="tipoubicaid"
                clearable
                required
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.requerimiento.value"
                :label="formFields.requerimiento.label"
                :items="requermientoslist"
                item-text="asigrequerimiento"
                item-value="asigrequerimiento"
                @change="datos_requerimientos"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <DatePicker
                :label="formFields.fechaInicio.label"
                :error-messages="errors.collect(formFields.fechaInicio.id)"
                :id="formFields.fechaInicio.id"
                v-model="formFields.fechaInicio.value"
                :max="fechaMaximaInicio.format('YYYY-MM-DD')"
              />
            </v-flex>
            <v-flex sm3 md3>
              <DatePicker
                :label="formFields.fechaFin.label"
                :error-messages="errors.collect(formFields.fechaFin.id)"
                :id="formFields.fechaFin.id"
                v-model="formFields.fechaFin.value"
                :max="fechaMaximaInicio.format('YYYY-MM-DD')"
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-if="length_FLOTA != 1"
                v-model="formFields.flota.value"
                :label="formFields.flota.label"
                :items="flotalist"
                item-text="__nom_flota"
                item-value="asigcrm_flota"
                clearable
              />

              <v-text-field
                v-if="length_FLOTA == 1"
                :label="formFields.flota.label"
                v-model="formFields.flota.value"
                disabled
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-if="length_RUT != 1"
                v-model="formFields.rut.value"
                :label="formFields.rut.label"
                :items="crm_rutlist"
                item-text="asigcrm_rutcli"
                item-value="asigcrm_rutcli"
                clearable
              />
              <v-text-field
                v-if="length_RUT == 1"
                :label="formFields.rut.label"
                v-model="formFields.rut.value"
                disabled
              />
            </v-flex>

            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.TipoEquipo.value"
                :label="formFields.TipoEquipo.label"
                :items="equiposlist"
                item-text="tipoeqname"
                item-value="tipoeqid"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-text-field
                v-model="formFields.equiposerie.value"
                :label="formFields.equiposerie.label"
                clearable
              />
            </v-flex>

            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.estado.value"
                :label="formFields.estado.label"
                :items="estadolist"
                item-text="configvalor"
                item-value="configid"
                clearable
              />
            </v-flex>

            <v-flex sm4 md4>
              <div class="text-sm-center botones-filtros">
                <v-btn @click="handleBuscarClick">
                  <v-icon>search</v-icon>Filtrar
                </v-btn>
                <v-btn @click="clearFilters">
                  <v-icon>clear</v-icon>Limpiar
                </v-btn>
                <v-btn flat small color="primary" @click="btn_exportar">
                  <v-icon class="importExportBtnIcon">cloud_download</v-icon
                  >&nbsp;&nbsp;
                  <span class="importExportBtnTexto">Exportar<br />CSV</span>
                </v-btn>
              </div>
            </v-flex>
          </v-flex>
        </v-flex>
        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>

    <div class="gridcard rounded-card">
      <MantenedorGrid
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
      />
    </div>
    <div v-if="showReporteGenerado" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Reporte Solicitado</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporte()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <v-flex sm12 md12>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">{{ texto_reporte }}</p>
              </div>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">
                  Puede ver sus reportes en el menú
                  <router-link
                    active-class="router-link-active"
                    style="cursor: pointer; font-size: 13px"
                    to="/conecta-reportes"
                    >Informes</router-link
                  >
                </p>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alertas/WidgetAlerta.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import { GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import moment from 'moment';
import showImage from '@/pantallas/Camaras/Alertas/showImage.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';

import { PermisoAccion } from '@/views/base/VariablesPermisos';

@Component({
  components: {
    MantenedorGrid,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    WidgetAlerta,
    showImage,
    FormFieldsContainer,
    DatePicker,
  },
})
export default class ReportesSerieBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReporteSerieActiva;
  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;
  reporteSeleccionado: Number = null;
  serieNumeroSeleccionado: string = null;
  tipoEquipoSeleccionado: string = null;
  serieactivanroSeleccionado: string = null;
  showReporteGenerado: boolean = false;
  tipoeqid: any = '';
  pagina: number = 1;
  length_FLOTA: number = 2;
  length_RUT: number = 2;
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  texto_reporte: string = '';
  ordesList: any[] = [];
  equiposlist: any[] = [];
  requermientoslist: any[] = [];
  flotalist: any[] = [];
  racklist: any[] = [];
  bloquelist: any[] = [];
  crm_rutlist: any = [];
  ubicacionlist: any = [];
  estadolist: any = [];
  showModalMostrar: boolean = false;
  usuarioID: any = '';
  hashpaginacion: string = '';
  rowcount: number = 0;
  total_registros: number = 0;
  cant_regs_pag: number = 25;

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { '': '' },
      'ReportesSerieEstadia/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.equiposlist = data.data.EQUIPOS;
          self.requermientoslist = data.data.REQUERIMIENTOS;
          self.flotalist = data.data.FLOTA;
          self.racklist = data.data.RACK;
          self.bloquelist = data.data.BLOQUE;
          self.crm_rutlist = data.data.CRM_RUT;
          self.ubicacionlist = data.data.UBICACION;
          self.estadolist = data.data.ESTADO;
          self.length_FLOTA = data.data.FLOTA.length;
          self.length_RUT = data.data.CRM_RUT.length;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  async datos_requerimientos() {
    let body: any = this.filtros2body();
    if (body.requerimiento == '') {
      this.getEquipos();
      this.formFields.flota.value = undefined;
      this.formFields.rut.value = undefined;
    } else {
      this.loadingService.showLoading();
      return fetchReportesSerie(
        { requerimiento: body.requerimiento },
        'ReportesSerie/change_requerimiento'
      )
        .then((data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            this.formFields.flota.value = data.data.FLOTA[0].asigcrm_flota;
            this.formFields.flota.value = data.data.FLOTA[0].__nom_flota;
            this.formFields.rut.value = data.data.CRM_RUT[0].asigcrm_rutcli;
            this.length_FLOTA = data.data.FLOTA.length;
            this.length_RUT = data.data.CRM_RUT.length;
          } else {
            return;
          }
        })
        .catch((error: any) => {
          this.$snotify.error('Ocurrió un error', { timeout: 3000 });
        })
        .finally(() => {
          this.loadingService.hideLoading();
          return null;
        });
    }
  }
  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.gridApi = event.api;
    this.gridApi.setDomLayout('autoHeight');
    this.columnApi = event.columnApi;
    this.gridEvent = event;
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    let self = this;
    this.serverSide = {
      getRows(event: any): void {
        event.request.paginationSize = self.gridOptions.cacheBlockSize;
        self.pagina = Math.ceil(
          event.request.startRow / self.cant_regs_pag + 1
        );
        let body: any = self.filtros2body();
        body.pagina = self.pagina;

        fetchReportesSerie(
          {
            estado: body.estado,
            requerimiento: body.requerimiento,
            serienumero: body.serienumero,
            flota: body.flota,
            rut: body.rut,
            TipoEquipo: body.TipoEquipo,
            rack: body.rack,
            Bloque: body.Bloque,
            pagina: body.pagina,
            ubicacion: body.ubicacion,
            dateStart: body.dateStart,
            dateEnd: body.dateEnd,
          },
          'ReportesSerieEstadia/get_filtered_rs'
        )
          .then((response: any) => {
            console.log(response.data.data.LISTA);
            if (response.data.CODIGO_RESPUESTA == '1') {
              if (body.ubicacion == '') {
                self.$snotify.error('El campo ubicación en requerido', {
                  timeout: 3000,
                });
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else if (body.dateStart == '') {
                self.$snotify.error('El campo Fecha Inicio en requerido', {
                  timeout: 3000,
                });
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else if (body.dateEnd == '') {
                self.$snotify.error('El campo Fecha Fin en requerido', {
                  timeout: 3000,
                });
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else if (response.data.data.length === 0) {
                self.$snotify.error('Sin registros', { timeout: 3000 });
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                console.log(response.data.data.LISTA);
                event.successCallback(
                  response.data.data.LISTA,
                  Number(response.data.cant_regs_pag.TOTAL_REGISTROS)
                );
                self.gridApi.hideOverlay();
                self.autoSizeAll(true);
              }
            } else {
              event.successCallback([{}], 0);
              self.$snotify.error(response.data.MENSAJE_RESPUESTA, {
                timeout: 3000,
              });
            }
          })
          .catch((error: any) => {
            event.successCallback([{}], 0);
            self.$snotify.error('Sin Registros', {
              timeout: 3000,
            });
          })
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
          });
      },
    };
    this.getEquipos();
    this.clearFilters();
  }
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Equipo Serie',
        field: 'Equipo Serie',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Tipo de Equipo',
        field: 'Tipo de Equipo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'IMEI',
        field: 'IMEI',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },

      {
        headerName: 'Compra Número',
        field: 'Compra Numero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha de Compra',
        field: 'Fecha de Compra',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Número de Activación',
        field: 'Número de Activación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'EPC',
        field: 'EPC',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha Preparación',
        field: 'Fecha Preparación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Requerimiento Preparación',
        field: 'Requerimiento Preparación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'CRM Flota Preparación',
        field: 'CRM Flota Preparación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'RUT Cliente Preparación',
        field: 'CRM RUT Preparación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Razón Social Preparación',
        field: 'CRM Cliente Preparación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Modalidad',
        field: 'Modalidad',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Plataforma',
        field: 'Plataforma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Id de Equipo en Plataforma',
        field: 'Id de Equipo en Plataforma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Estado en Plataforma',
        field: 'enplat',
        cellStyle: { textAlign: 'center' },
        resizable: true,
        width: 140,
        cellRenderer: params => {
          if (!params.value) return '';
          if (params.data.enplat == 'S') {
            var html = '<input type="checkbox" checked disabled>';
            return html;
          } else {
            return '<input type="checkbox" disabled>';
          }
        },
      },
      {
        headerName: 'Fecha de Ingreso en Plataforma',
        field: 'Fecha de Ingreso en Plataforma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'SIM Serie Número',
        field: 'SIM Serie Número',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Estado de la SIM',
        field: 'Estado de la SIM',
        cellStyle: { textAlign: 'center' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Prefijo',
        field: 'Prefijo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Número del Móvil',
        field: 'Número del Movil',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Telco',
        field: 'Telco',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Plan',
        field: 'Plan',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'APN',
        field: 'APN',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha de Instalación',
        field: 'Fecha de Instalación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Patente',
        field: 'Patente',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'RUT de Instalación',
        field: 'RUT de Instalacion',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha Desinstalación',
        field: 'Fecha Desinstalación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Observación de Desinstalación',
        field: 'Observacion de Desinstalación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Ubicación',
        field: 'Ubicación Actual',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Fecha de Ingreso',
        field: 'Fecha de Ingerso',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Fecha de Egreso',
        field: 'Fecha de Egreso',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Tipo de Operación',
        field: 'Tipo de Operación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },

      {
        headerName: 'Número de Operación',
        field: 'Número de Operación',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Días de Estadía',
        field: 'Días de Estadía',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
    ],

    pagination: true,
    paginationPageSize: this.cant_regs_pag,
    cacheBlockSize: this.cant_regs_pag,
    paginationAutoPageSize: false,
    rowModelType: 'serverSide',
    serverSideDatasource: this.serverSide,
    onGridReady: this.handleGridReady,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
  };

  formFields: FormFieldDefMap = {
    ubicacion: {
      label: 'Ubicación',
      id: 'tipoubicaid',
      value: 'tipoubicaname',
    },
    requerimiento: {
      label: 'Requerimiento',
      id: 'asigrequerimiento',
      value: 'asigrequerimiento',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: moment().subtract(1, 'month'),
    },
    fechaFin: {
      label: 'Fecha Fin',
      id: 'fechaFin',
      value: moment(),
    },
    flota: {
      label: 'Flota',
      id: '__nom_flota',
      value: 'asigcrm_flota',
    },
    rut: {
      label: 'Rut Cliente',
      id: 'asigcrm_rutcli',
      value: 'asigcrm_rutcli',
    },
    TipoEquipo: {
      label: 'Tipo Equipo',
      id: 'tipoeqid',
      value: 'tipoeqname',
    },
    rack: {
      label: 'Rack',
      id: 'moviserierack',
      value: 'moviserierack',
    },
    Bloque: {
      label: 'Bloque',
      id: 'moviseriebloque',
      value: 'moviseriebloque',
    },
    estado: {
      label: 'Estado SIM',
      id: 'configvalor',
      value: 'configid',
    },
    equiposerie: {
      label: 'Equipo Serie',
      id: '',
      value: '',
    },
  };

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }
  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }
  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }
  get fechaMinimaInicio() {
    let fechaIni = this.formFields.fechaInicio.value;
    return fechaIni as moment.Moment;
  }
  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }
  get fechaMaximaInicio() {
    //let fechaMax = this.formFields.fechaInicio.value;

    return moment(this.fechaMaxima) as moment.Moment;
    //return fechaMax as moment.Moment;
  }
  async clearFilters() {
    this.formFields.requerimiento.value = undefined;
    this.formFields.flota.value = undefined;
    this.formFields.rut.value = undefined;
    this.formFields.ubicacion.value = undefined;
    this.formFields.TipoEquipo.value = undefined;
    this.formFields.rack.value = undefined;
    this.formFields.Bloque.value = undefined;
    this.formFields.estado.value = undefined;
    this.getEquipos();
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

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

  filtroRequerimiento(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
  }
  async fetchRequermientosWidgets() {
    this.loadingService.showLoading();
  }
  filtros2body() {
    let body: any = {};
    body.requerimiento = this.formFields.requerimiento.value
      ? this.formFields.requerimiento.value
      : '';
    body.flota = this.formFields.flota.value ? this.formFields.flota.value : '';
    body.rut = this.formFields.rut.value ? this.formFields.rut.value : '';
    body.TipoEquipo = this.formFields.TipoEquipo.value
      ? this.formFields.TipoEquipo.value
      : '';
    body.rack = this.formFields.rack.value ? this.formFields.rack.value : '';
    body.Bloque = this.formFields.Bloque.value
      ? this.formFields.Bloque.value
      : '';
    body.estado = this.formFields.estado.value
      ? this.formFields.estado.value
      : '';
    body.ubicacion = this.formFields.ubicacion.value
      ? this.formFields.ubicacion.value
      : '';
    body.dateStart = this.formFields.fechaInicio.value
      ? this.formFields.fechaInicio.value
      : '';
    body.dateEnd = this.formFields.fechaFin.value
      ? this.formFields.fechaFin.value
      : '';
    body.serienumero = this.formFields.equiposerie.value
      ? this.formFields.equiposerie.value
      : '';
    return body;
  }
  async btn_exportar() {
    let body: any = this.filtros2body();
    (body.extension = 'csv'),
      this.loadingService.showLoading(undefined, 'btn_exportar');
    return fetchReportesSerie(
      {
        body: body,
        clienteDefecto: JSON.parse(localStorage.getItem('user')).clienteDefecto,
        user_id: JSON.parse(localStorage.getItem('user')).id,
        tipo_alerta: 'CONECTA_REPORTES_SERIE',
      },
      'ReportesSerieEstadia/exportar'
    )
      .then((data: any) => {
        this.showReporteGenerado = true;
        this.loadingService.hideLoading('btn_exportar');
        this.texto_reporte = data.data.MENSAJE_RESPUESTA;
        return data.data;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }
  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
  }
}
</script>
<style scope>
.reportesSerieActiva
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.reportesSerieActiva div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.reportesSerieActiva
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.resportesserie .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>

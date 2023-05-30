<template>
  <div class="resportesserie">
    <div class="flex sm10 md10">
      <FormFieldsContainer @resultadoBusqueda="filtroRequerimiento">
        <v-flex sm10 md10 layout wrap>
          <v-flex sm12 md12 layout wrap>
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
              <v-autocomplete
                v-if="length_FLOTA != 1"
                v-model="formFields.flota.value"
                :label="formFields.flota.label"
                :items="flotalist"
                item-text="asigcrm_flota"
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
              <v-text-field
                v-model="formFields.simserie.value"
                :label="formFields.simserie.label"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.rack.value"
                :label="formFields.rack.label"
                :items="racklist"
                item-text="moviserierack"
                item-value="moviserierack"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.Bloque.value"
                :label="formFields.Bloque.label"
                :items="bloquelist"
                item-text="moviseriebloque"
                item-value="moviseriebloque"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <div class="text-sm-center botones-filtros">
                <v-btn @click="handleBuscarClick">
                  <v-icon>search</v-icon>Filtrar
                </v-btn>
                <v-btn @click="clearFilters">
                  <v-icon>clear</v-icon>Limpiar
                </v-btn>
              </div>
            </v-flex>
          </v-flex>
          <v-flex sm4 md4>
            <v-text-field
              style="margin-right:5px;"
              label="Buscar..."
              append-icon="search"
              v-model="filtrobusquedagrilla"
              @input="searchData"
            ></v-text-field>
          </v-flex>
        </v-flex>
        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
    <VerDetalleModal
      v-if="mostrarModalVerDetalle"
      :reporte_Seleccionado="reporteSeleccionado"
      :serieNumeroSeleccionado="serieNumeroSeleccionado"
      :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
      :serieactivanroSeleccionado="serieactivanroSeleccionado"
      @cerrar="handleCierreModalVerDetalle"
    />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import VerDetalleModal from './VerDetalleModal.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alertas/WidgetAlerta.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  RowNode,
  ICellRendererParams,
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import moment from 'moment';
import showImage from '@/pantallas/Camaras/Alertas/showImage.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';

import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { Accion } from '@/config/enums';

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    VerDetalleModal,
    WidgetAlerta,
    showImage,
    FormFieldsContainer,
  },
})
export default class ReportesSerieBase extends ComponenteBase {
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;

  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  mostrarModalVerDetalle: boolean = false;

  //MsResponseData: MsResponseData = null;
  //MsResponseDataWidget: MsResponseDataWidget = null;
  reporteSeleccionado: Number = null;
  serieNumeroSeleccionado: string = null;
  tipoEquipoSeleccionado: string = null;
  serieactivanroSeleccionado: string = null;
  tipoeqid: any = '';
  length_FLOTA: number = 2;
  length_RUT: number = 2;
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  showReporteGenerado: boolean = false;
  texto_reporte: string = '';
  ordesList: any[] = [];
  equiposlist: any[] = [];
  requermientoslist: any[] = [];
  flotalist: any[] = [];
  racklist: any[] = [];
  bloquelist: any[] = [];
  crm_rutlist: any = [];
  showModalMostrar: boolean = false;
  usuarioID: any = '';

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
  async getReportes(usuarioID: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ usuarioID: usuarioID }, 'ReportesSerie')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
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

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'ReportesSerie/get_grilla_filters')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.equiposlist = data.data.EQUIPOS;
          self.requermientoslist = data.data.REQUERIMIENTOS;
          self.flotalist = data.data.FLOTA;
          self.racklist = data.data.RACK;
          self.bloquelist = data.data.BLOQUE;
          self.crm_rutlist = data.data.CRM_RUT;
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

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'asignumero',
        field: 'asignumero',
        lockVisible: true,
        hide: true,
      },
      {
        headerName: 'Equipo Serie',
        field: 'serienumero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Tipo de Equipo',
        field: 'tipoeqname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'IMEI',
        field: 'imei',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Nº Serie Activa',
        field: 'serieactivaNro',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'EPC',
        field: 'epc',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha Preparación',
        field: 'serieactivafecha_alta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha Desintalación',
        field: 'serieactivafecha_baja',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Requerimiento',
        field: 'asigrequerimiento',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'CRM Flota',
        field: 'asigcrm_flota',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'RUT Cliente',
        field: 'asigcrm_rutcli',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },

      {
        headerName: 'Razón Social',
        field: 'asigcrm_cliente',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },

      {
        headerName: 'Modalidad',
        field: 'modalidad',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Plataforma',
        field: 'plataforma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'ID Plataforma',
        field: 'serieactivaid_dispositivo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Estado en Plataforma',
        field: 'serieactivaplata_ingresada',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
        cellRenderer: params => {
          if (!params.value) return '';
          if (params.data.serieactivaplata_ingresada == 'S') {
            var html = '<input type="checkbox" checked disabled>';
            return html;
          } else {
            return '<input type="checkbox" disabled>';
          }
        },
      },

      {
        headerName: 'SIM Número',
        field: 'simserienumero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 100,
      },
      {
        headerName: 'SIM Estado',
        field: 'configvalor',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Ubicación',
        field: 'tipoubicaname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Fecha Ingreso',
        field: 'movifecha_alta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
        },
      },
      {
        headerName: 'Rack',
        field: 'moviserierack',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Bloque',
        field: 'moviseriebloque',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Días de Estadía',
        field: 'diasestadia',
        cellStyle: { textAlign: 'center' },
        resizable: true,
        width: 140,
        valueFormatter: function(params) {
          let arr = params.value.substring(0, params.value.indexOf(' '));
          return arr;
        },
      },
    ],

    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };

  formFields: FormFieldDefMap = {
    requerimiento: {
      label: 'Requerimiento',
      id: 'asigrequerimiento',
      value: 'asigrequerimiento',
    },
    flota: {
      label: 'Flota',
      id: 'asigcrm_flota',
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
    equiposerie: {
      label: 'Equipo Serie',
      id: '',
      value: '',
    },
    simserie: {
      label: 'SIM Serie',
      id: '',
      value: '',
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
  };

  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }

  async clearFilters() {
    this.formFields.requerimiento.value = undefined;
    this.formFields.flota.value = undefined;
    this.formFields.rut.value = undefined;
    this.formFields.TipoEquipo.value = undefined;
    this.formFields.rack.value = undefined;
    this.formFields.Bloque.value = undefined;
    this.formFields.equiposerie.value = undefined;
    this.formFields.simserie.value = undefined;
    this.getEquipos();
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi.setRowData(this.ordesList);
  }
  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.getEquipos();
    this.clearFilters();
  }

  //Busca dentro del resultado de la grilla
  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar];

  constructor() {
    super();
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.reporteSeleccionado = params.data.asignumero;
    this.serieNumeroSeleccionado = params.data.serienumero;
    this.tipoEquipoSeleccionado = params.data.tipoeqid;
    this.serieactivanroSeleccionado = params.data.serieactivanro;
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
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
    body.serienumero = this.formFields.equiposerie.value
      ? this.formFields.equiposerie.value
      : '';
    body.simserienumero = this.formFields.simserie.value
      ? this.formFields.simserie.value
      : '';
    return body;
  }
  async buscarRequerimientosWidgets() {
    let response: any = (await this.fetchRequermientosWidgets()) || null;
    if (response !== null) {
      if (response.data.CODIGO_RESPUESTA == '1') {
        if (response.data.data.length === 0) {
          this.ordesList = [];
        } else {
          this.ordesList = response;
        }
      } else {
        this.ordesList = [];
        this.$snotify.error(response.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      }
    }
  }

  filtroRequerimiento(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
    if (loadWidget) {
      this.buscarRequerimientosWidgets();
    }
  }
  async fetchRequermientosWidgets() {
    let body: any = this.filtros2body();
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        usuarioID: this.usuarioID,
        requerimiento: body.requerimiento,
        flota: body.flota,
        rut: body.rut,
        TipoEquipo: body.TipoEquipo,
        rack: body.rack,
        bloque: body.Bloque,
        simserienumero: body.simserienumero,
        serienumero: body.serienumero,
      },
      'ReportesSerie/get_filtered_rs'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.gridApi.setRowData(data.data.data.LISTA);
          return data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.gridApi.setRowData((this.ordesList = []));
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
}
</script>
<style scope>
.reportesSerieConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.reportesSerieConecta
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1) {
  display: none;
}
.reportesSerieConecta
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

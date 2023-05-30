<template>
  <div class="resportesserie">
    <div class="flex sm10 md10">
      <FormFieldsContainer @resultadoBusqueda="filtroRequerimiento">
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.requerimiento.value"
                :label="formFields.requerimiento.label"
                :items="requermientoslist"
                item-text="asigrequerimiento"
                item-value="asigrequerimiento"
                clearable
              />
            </v-flex>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.tecnico.value"
                :label="formFields.tecnico.label"
                :items="tecnicolist"
                item-text="tecniconame"
                item-value="tecnicoid"
                clearable
              />
            </v-flex>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.localidad.value"
                :label="formFields.localidad.label"
                :items="localidadlist"
                item-text="locaname"
                item-value="locaid"
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
  filtro: any;
  mostrarModalVerDetalle: boolean = false;
  reporteSeleccionado: Number = null;
  serieNumeroSeleccionado: string = null;
  tipoEquipoSeleccionado: string = null;
  serieactivanroSeleccionado: string = null;
  tipoeqid: any = '';
  pagina: number = 1;
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  showReporteGenerado: boolean = false;
  texto_reporte: string = '';
  ordesList: any[] = [];
  tecnicolist: any[] = [];
  requermientoslist: any[] = [];
  localidadlist: any = [];
  showModalMostrar: boolean = false;
  usuarioID: any = '';

  async getReportes() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'equipo_stock_terreno')
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
    return fetchReportesSerie(
      { '': '' },
      'equipo_stock_terreno/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.tecnicolist = data.data.TECNICO;
          self.requermientoslist = data.data.REQUERIMIENTOS;
          self.localidadlist = data.data.LOCALIDAD;
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
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        hide: true,
        lockVisible: true,
      },
      {
        headerName: 'Técnico',
        field: 'tecniconame',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Localidad',
        field: 'locaname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Nombre de Ubicación',
        field: 'tipoubicaname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Equipo Serie Número',
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
        headerName: 'Nº de Activación',
        field: 'serieactivanro',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha de Preparación',
        field: 'serieactivafecha_alta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
        },
      },
      {
        headerName: 'Requerimiento Preparación',
        field: 'asigrequerimiento',
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
        headerName: 'Plataforma',
        field: 'plataforma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },

      {
        headerName: 'Id Equipo en Plataforma',
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
          if (!params.value) return 'ERROR';
          if (params.data.serieactivaplata_ingresada == 'S') {
            var html = '<input type="checkbox" checked disabled>';
            return html;
          } else {
            return '<input type="checkbox" disabled>';
          }
        },
      },
      {
        headerName: 'Sim Serie Número',
        field: 'simserienumero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 100,
      },
      {
        headerName: 'SIM Estado',
        field: 'simestado',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Fecha Envío',
        field: 'movifecha_alta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
        },
      },

      {
        headerName: 'Autor Movimiento',
        field: 'nombre_movimiento',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Número de Movimiento',
        field: 'moviopera_numero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Fecha de Recepción',
        field: 'movifecha_recibe',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
        },
      },
      {
        headerName: 'Receptor',
        field: 'receptor',
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
    tecnico: {
      label: 'Técnico',
      id: 'tecnicoid',
      value: 'tecniconame',
    },
    localidad: {
      label: 'Localidad',
      id: 'locaid',
      value: 'locaname',
    },
  };

  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }

  async clearFilters() {
    this.formFields.requerimiento.value = undefined;
    this.formFields.localidad.value = undefined;
    this.formFields.tecnico.value = undefined;
    this.ordesList = await this.getReportes();
    this.gridApi.setRowData(this.ordesList);
  }
  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.ordesList = await this.getReportes();
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
  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];

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

  filtros2body() {
    let body: any = {};
    body.requerimiento = this.formFields.requerimiento.value
      ? this.formFields.requerimiento.value
      : '';
    body.tecnico = this.formFields.tecnico.value
      ? this.formFields.tecnico.value
      : '';
    body.localidad = this.formFields.localidad.value
      ? this.formFields.localidad.value
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
        requerimiento: body.requerimiento,
        localidad: body.localidad,
        tecnico: body.tecnico,
      },
      'equipo_stock_terreno/get_filtered_rs'
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
  async btn_exportar() {
    let body: any = this.filtros2body();
    body.extension = 'csv';
    this.loadingService.showLoading(undefined, 'btn_exportar');
    return fetchReportesSerie(
      {
        body: body,
        clienteDefecto: JSON.parse(localStorage.getItem('user')).clienteDefecto,
        user_id: JSON.parse(localStorage.getItem('user')).id,
        tipo_alerta: 'REPORTE EQUIPOS STOCK EN TERRENO',
      },
      'equipo_stock_terreno/exportar'
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
.EquiposEnTerrenoConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.EquiposEnTerrenoConecta
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1) {
  display: none;
}
.EquiposEnTerrenoConecta
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

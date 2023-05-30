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
              <v-text-field
                v-model="formFields.simnumero.value"
                :label="formFields.simnumero.label"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-text-field
                v-model="formFields.serienumero.value"
                :label="formFields.serienumero.label"
                clearable
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.telco.value"
                :label="formFields.telco.label"
                :items="telconamelist"
                item-text="telconame"
                item-value="telcoid"
                clearable
                @change="getPlanOptions"
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-if="formFields.telco.value"
                v-model="formFields.telcoplan.value"
                :label="formFields.telcoplan.label"
                :items="telcoplannamelist"
                item-text="telcoplanname"
                item-value="telcoplanid"
                clearable
                required
              />
              <v-text-field
                v-if="!formFields.telco.value"
                v-model="formFields.telcoplan.value"
                :label="formFields.telcoplan.label"
                :items="telcoplannamelist"
                item-text="telcoplanname"
                item-value="telcoplanid"
                disabled
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.tipoSIM.value"
                :label="formFields.tipoSIM.label"
                :items="tiposim"
                item-text="tipo_sim"
                item-value="id"
                clearable
                required
              />
            </v-flex>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.simestado.value"
                :label="formFields.simestado.label"
                :items="simestadolist"
                item-text="configvalor"
                item-value="configid"
                clearable
                required
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

    <div class="gridcard rounded-card inventario-sim">
      <MantenedorGridSinCodigo
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
    <VerEditarModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :serieNumeroSeleccionado="serieNumeroSeleccionado"
      :simestadolistSeleccionado="simestadolistSeleccionado"
    />
    <!-- ASI SE PASAN DATOS AL MODAL ===>   :reporte_Seleccionado="reporteSeleccionado"
      :serieNumeroSeleccionado="serieNumeroSeleccionado"
      :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
      :serieactivanroSeleccionado="serieactivanroSeleccionado" -->
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
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
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import VerEditarModal from './VerEditarModal.vue';

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    WidgetAlerta,
    showImage,
    FormFieldsContainer,
    DatePicker,
    VerEditarModal,
  },
})
export default class InventarioSimBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.SimRegistros;
  mostrarModalVerDetalle: boolean = false;
  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;

  //MsResponseData: MsResponseData = null;
  //MsResponseDataWidget: MsResponseDataWidget = null;
  reporteSeleccionado: Number = null;
  serieNumeroSeleccionado: any[] = [];
  simestadolistSeleccionado: string = null;
  serieactivanroSeleccionado: string = null;
  showReporteGenerado: boolean = false;
  tipoeqid: any = '';
  pagina: number = 1;
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  texto_reporte: string = '';
  ordesList: any[] = [];
  telconamelist: any[] = [];
  telcoplannamelist: any[] = [];
  tiposim: any[] = [];
  simestadolist: any[] = [];
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
      'conecta_inventario_sim/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.ubicacionlist = data.data.UBICACION;
          self.telconamelist = data.data.TELCONAME;
          self.telcoplannamelist = data.data.TELCOPLANNAME;
          self.simestadolist = data.data.SIMESTADO;
          self.tiposim = data.data.TIPO;
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
            simestado: body.simestado,
            ubicacion: body.ubicacion,
            telconame: body.telconame,
            telco: body.telco,
            pagina: body.pagina,
            simnumero: body.simnumero,
            serienumero: body.serienumero,
            tiposimid: body.tiposimid,
          },
          'conecta_inventario_sim/get_filtered_rs'
        )
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              if (response.data.data.length === 0) {
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
                self.$snotify.error('Sin registros', { timeout: 3000 });
              } else {
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
            self.$snotify.error('Ocurrió un error. Intente nuevamente.', {
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
        headerName: 'Sim Número',
        field: 'simserienumero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Telco',
        field: 'telconame',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },

      {
        headerName: 'Plan',
        field: 'telcoplanname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Tamaño',
        field: 'simtamanio',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Tipo SIM',
        field: 'tiposimname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'APN',
        field: 'simapn',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Prefijo',
        field: 'simprefijo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Número',
        field: 'simmovil',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'SIM Estado',
        field: 'configvalor',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
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
        width: 135,
      },
      {
        headerName: 'Plataforma',
        field: 'plataforma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },

      {
        headerName: 'Plataforma Estado',
        field: 'serieactivaplata_ingresada',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
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
        headerName: 'Ubicación',
        field: 'tipoubicaname',
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
      id: '',
      value: '',
    },
    telco: {
      label: 'Telco',
      id: '',
      value: '',
    },
    telcoplan: {
      label: 'Telco Plan',
      id: '',
      value: '',
    },
    simestado: {
      label: 'Estado SIM',
      id: '',
      value: '',
    },
    simnumero: {
      label: 'SIM Serie Número',
      id: '',
      value: '',
    },
    serienumero: {
      label: 'Equipo Serie Número',
      id: '',
      value: '',
    },
    tipoSIM: {
      label: 'Tipo SIM',
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
    this.formFields.ubicacion.value = undefined;
    this.formFields.telco.value = undefined;
    this.formFields.telcoplan.value = undefined;
    this.formFields.simestado.value = undefined;
    this.formFields.simnumero.value = undefined;
    this.formFields.serienumero.value = undefined;
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
    visible: true,
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
    body.ubicacion = this.formFields.ubicacion.value
      ? this.formFields.ubicacion.value
      : '';
    body.telconame = this.formFields.telco.value
      ? this.formFields.telco.value
      : '';
    body.telco = this.formFields.telcoplan.value
      ? this.formFields.telcoplan.value
      : '';
    body.simestado = this.formFields.simestado.value
      ? this.formFields.simestado.value
      : '';
    body.simnumero = this.formFields.simnumero.value
      ? this.formFields.simnumero.value
      : '';
    body.serienumero = this.formFields.serienumero.value
      ? this.formFields.serienumero.value
      : '';
    body.tiposimid = this.formFields.tipoSIM.value
      ? this.formFields.tipoSIM.value
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
      'conecta_inventario_sim/exportar'
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
  constructor() {
    super();
    actionsEvent.onEditar(this.handleVerDetalleClick);
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.serieNumeroSeleccionado = params.data.simserienumero;
    /*     this.simestadolistSeleccionado = this.simestadolist */
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
    this.handleBuscarClick();
  }

  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }
  getPlanOptions() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { telcoid: this.formFields.telco.value },
      'conecta_inventario_sim/tomar_plan'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.telcoplannamelist = data.data.TELCOPLANNAME;
        } else {
          return;
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
.InventarioSimConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.InventarioSimConecta
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1) {
  display: none;
}
.InventarioSimConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}

.inventario-sim {
  width: 90%;
}
</style>

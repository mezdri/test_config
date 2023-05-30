<template>
  <div class="resportesserie">
    <div class="flex sm12 md12">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.plataforma.value"
                :label="formFields.plataforma.label"
                :items="plataformaList"
                item-text="producto"
                item-value="configid_producto"
                clearable
                required
              />
            </v-flex>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.producto.value"
                :label="formFields.producto.label"
                :items="porductoList"
                item-text="configvalor_clase"
                item-value="configid_clase"
                clearable
                required
              />
            </v-flex>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.tipoequipo.value"
                :label="formFields.tipoequipo.label"
                :items="tipoEquipoList"
                item-text="tipoeqname"
                item-value="tipoeqid"
                clearable
                required
              />
            </v-flex>
            <v-flex sm2 md2>
              <div class="text-sm-center botones-filtros">
                <v-btn @click="handleBuscarClick">
                  <v-icon>search</v-icon>Filtrar
                </v-btn>
                <v-btn @click="clearFilters">
                  <v-icon>clear</v-icon>Limpiar
                </v-btn>
              </div>
            </v-flex>
            <v-flex sm1 md1 align="rigth"> </v-flex>
            <v-flex sm1 md1 align="rigth"
              ><div class="text-sm-center botones-filtros">
                <v-btn
                  v-if="accionExportar.visible"
                  flat
                  small
                  color="primary"
                  @click="btn_exportar"
                >
                  <v-icon class="importExportBtnIcon">cloud_download</v-icon
                  >&nbsp;&nbsp;
                  <span class="importExportBtnTexto">Exportar<br />CSV</span>
                </v-btn>
              </div>
            </v-flex>
            <v-flex sm1 md1 align="rigth">
              <v-btn
                style="padding-right:20px; padding-right: 20px; display: block; margin: 0 0 0 auto; margin-top: 15px"
                color="#ffe800"
                @click="crear_equipo"
              >
                <v-icon dark left style="color: black;"
                  >add_circle_outline</v-icon
                >
                <span style="color: black;">Crear</span>
              </v-btn>
            </v-flex>
          </v-flex>
        </v-flex>

        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>

    <div class="gridcard rounded-card">
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
    <VerCrearModal v-if="dialog" @cerrarCrear="handleCierreModalCrear" />
    <VerEditarModal
      v-if="dialog2"
      @cerrarCrear="handleCierreModalCrear"
      :codigoEquipo="codigoEquipo"
    />
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
import VerCrearModal from './VerCrearModal.vue';
import VerEditarModal from './VerEditarModal.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { params } from '@/pantallas/Facturacion/fetchFacturaciones';

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    FormFieldsContainer,
    DatePicker,
    VerCrearModal,
    VerEditarModal,
  },
})
export default class TiposProductoBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.TiposProducto;
  porductoList: any = [];
  plataformaList: any = [];
  tipoEquipoList: any = [];
  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;
  showReporteGenerado: boolean = false;
  tipoeqid: any = '';
  pagina: number = 1;
  columnApi: any = null;
  gridApi: GridApi = null;
  dialog: boolean = false;
  dialog2: boolean = false;
  texto_reporte: string = '';
  usuarioID: any = '';
  ordesList: any;
  codigoEquipo: any = '';

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'tipoproductoid',
        field: 'tipoeqid',
        cellStyle: { textAlign: 'left' },
        lockVisible: true,
        width: 140,
        hide: true,
      },
      {
        headerName: 'Código Producto',
        field: 'tipoprodcod_producto',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Código INET',
        field: 'tipoprodcod_inet',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Descripción Corta',
        field: 'tipoproddesc_corta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Descripción Larga',
        field: 'tipoproddesc_larga',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Nombre Producto CRM',
        field: 'tipoprodnombre_crm',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Cuenta Ingreso',
        field: 'tipoprodcuenta_ingreso',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Cuenta Costo',
        field: 'tipoprodcuenta_costo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Clase',
        field: 'clase',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Plataforma',
        field: 'producto',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Tipo de Equipo',
        field: 'tipoeqname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Estado',
        field: 'tipoprodestado',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        cellRenderer: params => {
          if (params.data.tipoprodestado == 't') {
            return (
              '<i class="material-icons" title="Anulado" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(255, 58, 58)"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Dado de baja' +
              '</a>'
            );
          } else {
            return (
              '<i class="material-icons" title="Vigente" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: #26FF26"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Vigente' +
              '</a>'
            );
          }
        },
      },
    ],

    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { '': '' },
      'conecta_matriz_producto_comercial/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.porductoList = data.data.PRODUCTO;
          self.plataformaList = data.data.PLATAFORMA;
          self.tipoEquipoList = data.data.TIPO_EQUIPO;
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
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.getEquipos();
    this.clearFilters();
  }

  async getReportes(usuarioID: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { usuarioID: usuarioID },
      'conecta_matriz_producto_comercial'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          console.log(data.data.data.LISTA);
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
  formFields: FormFieldDefMap = {
    plataforma: {
      label: 'Plataforma',
      id: '',
      value: '',
    },
    producto: {
      label: 'Clase Producto',
      id: '',
      value: '',
    },
    tipoequipo: {
      label: 'Tipo de Equipo',
      id: '',
      value: '',
    },
  };

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
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
    this.formFields.plataforma.value = undefined;
    this.formFields.producto.value = undefined;
    this.formFields.tipoequipo.value = undefined;

    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi.setRowData(this.ordesList);
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };
  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEditar,
    this.accionExportar,
  ];
  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditarClick);
  }

  handleEditarClick(params: ICellRendererParams) {
    this.codigoEquipo = params.data;
    this.dialog2 = true;
  }
  async handleBuscarClick() {
    let self = this;
    this.loadingService.showLoading();
    if (self.formFields.plataforma.value == undefined) {
      self.formFields.plataforma.value = '';
    }
    if (self.formFields.producto.value == undefined) {
      self.formFields.producto.value = '';
    }
    if (self.formFields.tipoequipo.value == undefined) {
      self.formFields.tipoequipo.value = '';
    }
    return fetchReportesSerie(
      {
        PLATAFORMA: self.formFields.plataforma.value,
        PRODUCTO: self.formFields.producto.value,
        EQUIPO: self.formFields.tipoequipo.value,
      },
      'conecta_matriz_producto_comercial/get_filtered_rs'
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

  crear_equipo() {
    this.dialog = true;
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
        tipo_alerta: 'Reporte Tipo de Producto',
      },
      'conecta_matriz_producto_comercial/exportar'
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
  filtros2body() {
    let body: any = {};
    if (this.formFields.plataforma.value == undefined) {
      this.formFields.plataforma.value = '';
    }
    if (this.formFields.producto.value == undefined) {
      this.formFields.producto.value = '';
    }
    if (this.formFields.tipoequipo.value == undefined) {
      this.formFields.tipoequipo.value = '';
    }
    body.plataforma = this.formFields.plataforma.value
      ? this.formFields.plataforma.value
      : '';
    body.producto = this.formFields.producto.value
      ? this.formFields.producto.value
      : '';
    body.equipo = this.formFields.tipoequipo.value
      ? this.formFields.tipoequipo.value
      : '';

    return body;
  }
  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
  }
  async handleCierreModalCrear() {
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi.setRowData(this.ordesList);
    this.dialog = false;
    this.dialog2 = false;
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

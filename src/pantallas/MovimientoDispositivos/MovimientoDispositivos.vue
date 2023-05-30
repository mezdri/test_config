<template>
  <v-container fluid grid-list-md>
    <v-tabs>
      <v-tab>Movimientos de Dispositivos</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <div align="left">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex xs3 sm3 md3>
            <DatePicker
              :label="formFields.dateStart.label"
              v-model="formFields.dateStart.value"
              v-validate="'required'"
              data-vv-name="fechaInicioRequerida"
              :error-messages="errors.collect('fechaInicioRequerida')"
              required
            />
          </v-flex>
          <v-flex xs3 sm3 md3>
            <DatePicker
              :label="formFields.dateEnd.label"
              v-model="formFields.dateEnd.value"
              v-validate="'required'"
              data-vv-name="fechaFinRequerida"
              :error-messages="errors.collect('fechaFinRequerida')"
              required
            />
          </v-flex>
          <v-flex xs2 sm2 md2>
            <v-autocomplete
              :label="formFields.destino.label"
              v-model="formFields.destino.value"
              :items="destinos"
              item-text="tipoubicaname"
              item-value="tipoubicaid"
              clearable
            ></v-autocomplete>
          </v-flex>
          <v-flex xs2 sm2 md2>
            <v-autocomplete
              :label="formFields.estado.label"
              v-model="formFields.estado.value"
              :items="estados"
              item-text="configvalor"
              item-value="configid"
              clearable
            ></v-autocomplete>
          </v-flex>
          <v-flex xs2 sm2 md2>
            <div class="text-sm-center botones-filtros mt-1">
              <v-btn @click="filtrar()">
                <v-icon color="#27488e">search</v-icon>Filtrar
              </v-btn>
              <v-btn @click="clearFilters()">
                <v-icon color="#27488e">clear</v-icon>Limpiar</v-btn
              >
            </div>
          </v-flex>
        </v-flex>
      </FormFieldsContainer>
    </div>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right: 10px">
      <v-flex xs4 sm4 md4
        ><v-text-field
          label="Buscar"
          @keyup="gridApi.setQuickFilter(filtro)"
          v-model="filtro"
          @click:clear="gridApi.setQuickFilter('')"
          clearable
          outlined
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 md6> </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right: 0px">
        <div align="right" style="padding-top: 6px; padding-right: 0px">
          <v-btn
            v-if="accionCrear.visible"
            style="padding-right: 20px"
            color="#ffe800"
            @click="showModalNew = true"
          >
            <v-icon dark left style="color: black">add_circle_outline</v-icon>
            <span style="color: black">Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-divider></v-divider>

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
                <p style="margin-top: 40px">{{ texto_reporte }}</p>
              </div>
              <div class="text-sm-center">
                <p style="margin-top: 40px">
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
    <div class="gridcard rounded-card">
      <AgGridVue
        :gridOptions="gridOptions"
        class="ag-theme-material"
        style="height: 100% !important"
      >
      </AgGridVue>
    </div>
    <CrearMovimiento
      v-if="showModalNew"
      :estado="estados"
      :nuevoCodigo="valorMax"
      :anuladoId="anuladoId"
      :destinos="destinos"
      :usuarioActivo="usuarioActivo"
      :operaciones="operaciones"
      :despachos="despachos"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:datoCreado="datoNuevo($event)"
    >
    </CrearMovimiento>

    <EditarMovimiento
      v-if="showModalEdit"
      :anuladoId="anuladoId"
      :recibidoId="recibidoId"
      :destinos="destinos"
      :esEdicion="true"
      :accion="editedItem"
      :edited="editedItem"
      :operaciones="operaciones"
      :usuarioActivo="usuarioActivo"
      :estado="estados"
      :despachos="despachos"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:datoEditado="datoEditado($event)"
    ></EditarMovimiento>
  </v-container>
</template>
<script lang="ts">
import CrearMovimiento from './CrearMovimiento.vue';
import EditarMovimiento from './EditarMovimiento.vue';

import DatePicker from '@/reusable/Form/DatePicker.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

import moment from 'moment';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import { Component, Watch } from 'vue-property-decorator';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { eventBus, actionsEvent } from '@/setup';
import { Accion } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import Confirmation from '../../components/Confirmation.vue';
import HandleErrors from '../../config/handleErrors';
import store from '@/store';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchMovimientos } from './fetchMovimientos';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    MantenedorGridSinCodigo,
    CrearMovimiento,
    EditarMovimiento,
    DatePicker,
    'app-confirmacion': Confirmation,
    FormFieldsContainer,
    AgGridVue,
  },
})
export default class MovimientoDispositivos extends ComponenteBase {
  ordesList: any[] = [];
  consulta: any = {
    dateStart: moment()
      .subtract(1, 'month')
      .startOf('day')
      .format('YYYY/MM/DD HH:mm'),
    dateEnd: moment()
      .endOf('day')
      .format('YYYY/MM/DD HH:mm'),
  };

  funcionalidad: Funcionalidades = Funcionalidades.MovimientoDispositivos;
  usuario = JSON.parse(localStorage.getItem('user')).id;
  filtro: string = '';
  texto_reporte: string = '';
  showReporteGenerado: boolean = false;
  closeReporte() {
    this.showReporteGenerado = false;
  }

  async getMovimientos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      {
        userId: this.usuario,
        destino: this.consulta.destino ? this.consulta.destino : '',
        estado: this.consulta.estado ? this.consulta.estado : '',
        dateStart: this.consulta.dateStart,
        dateEnd: this.consulta.dateEnd,
      },
      'conectaMoviDispositivos/inicio'
    )
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

  usuarioActivo: any = {};

  async getUsuario() {
    let self = this;
    let user = JSON.parse(localStorage.getItem('user')).id;
    return fetchMovimientos(
      { userId: user },
      'conectaMoviDispositivos/getUsuario'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.usuarioActivo = data.data.data;
          return null;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
  }

  despaAnterior: number;

  async getCodigo() {
    let self = this;
    return fetchMovimientos({ '': '' }, 'conectaMoviDispositivos/getCodigo')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.despaAnterior = parseInt(data.data.data.ult_movinumero);
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
  }

  destinos: any = [];
  estados: any = [];
  operaciones: any = [];
  despachos: any = [];
  anuladoId: number;
  recibidoId: number;

  async getFilter() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos({ '': '' }, 'conectaMoviDispositivos/getFilter')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.destinos = data.data.DESTINO;
          this.estados = data.data.ESTADO;
          this.operaciones = data.data.OPERACIONES;
          this.despachos = data.data.DESPACHOS;
          this.anuladoId = data.data.MOVIESTADOS[0].moviestado_anulado;
          this.recibidoId = data.data.MOVIESTADOS[0].moviestado_recibido;
          return;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
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

  valorMax: number;
  codigosList: any[] = [];

  async datoEditado(dato: boolean) {
    if (dato) {
      this.ordesList = await this.getMovimientos();
      this.gridApi.setRowData(this.ordesList);
    }
  }

  async datoNuevo(dato: any) {
    this.ordesList = await this.getMovimientos();
    this.gridApi.setRowData(this.ordesList);
    await this.getCodigo();
    this.valorMax = this.despaAnterior + 1;
  }

  async handleGridReady(event: GridReadyEvent) {
    this.getUsuario();
    this.ordesList = await this.getMovimientos();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    await this.getFilter();
    await this.getCodigo();
    this.valorMax = this.despaAnterior + 1;
  }

  async filtrar() {
    this.ordesList = [];
    this.gridApi.setRowData(this.ordesList);
    this.consulta = {
      destino: this.formFields.destino.value,
      estado: this.formFields.estado.value,
      dateStart: moment(this.formFields.dateStart.value.toString())
        .startOf('day')
        .format('YYYY/MM/DD HH:mm'),
      dateEnd: moment(this.formFields.dateEnd.value.toString())
        .endOf('day')
        .format('YYYY/MM/DD HH:mm'),
    };
    this.ordesList = await this.getMovimientos();
    this.gridApi.setRowData(this.ordesList);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  onSelectionChanged(params: any) {}

  showModalNew = false;
  pasoActivoIndex = 1;
  pasoActivoEditar = 1;

  clearFilters() {
    this.formFields.destino.value = '';
    this.formFields.estado.value = '';
    this.formFields.dateStart.value = moment().subtract(1, 'month');
    this.formFields.dateEnd.value = moment();
  }

  formFields: FormFieldDefMap = {
    estado: {
      label: 'Estado',
      value: '',
      id: '',
    },
    destino: {
      label: 'Destino',
      value: '',
      id: '',
    },
    dateStart: {
      label: 'Fecha Envío Desde',
      value: moment().subtract(1, 'month'),
      id: '',
    },
    dateEnd: {
      label: 'Fecha Envío Hasta',
      value: moment(),
      id: '',
    },
  };

  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: true,
  };

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };
  VerPdf: PermisoAccion = {
    accionCodigo: 89,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEditar,
    this.VerPdf,
  ];

  // Globales

  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;

  loadingService = new LoadingService();

  handleErrors: HandleErrors = new HandleErrors();

  // Controller
  readonly controller: string = 'funcionalidad';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  // Grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  serverSide: any;

  // Interfaces
  editedItem: IFuncionalidad = {};
  funcionalidades: Array<IFuncionalidad> = [];

  //vuex
  usuarioId: number = store.state.userId;

  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

  dateFormatter(params: any) {
    return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
  }

  constructor() {
    super();
    this.columnDefs = [
      {
        headerName: 'Movimiento',
        field: 'movinumero',
        resizable: true,
        sortable: true,
        hide: false,
        minWidth: 130,
        width: 130,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Creación',
        field: 'movifecha_alta',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 170,
        lockPinned: true,
        valueFormatter: this.dateFormatter,
      },
      {
        headerName: 'Usuario',
        field: 'nombre',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 200,
        lockPinned: true,
      },
      {
        headerName: 'Operación',
        field: 'configvalor',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Destino',
        field: 'tipoubicaname',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        width: 150,
        minWidth: 150,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Observación',
        field: 'moviobs',
        sortable: true,
        resizable: true,
        width: 270,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Número Orden Despacho',
        field: 'despaseguimiento',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Caja Número',
        field: 'movicajanro',
        width: 180,
        minWidth: 180,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Fecha Recibe',
        field: 'movifecha_recibe',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 200,
        lockPinned: true,
        valueFormatter: this.dateFormatter,
      },
      makeAccionesColumnDef(this.funcionalidad),
    ];

    this.gridOptions = {
      localeText: {
        noRowsToShow: 'No se han encontrado movimientos',
      },
      pagination: true,
      paginationPageSize: 30, //Solución Paginación
      //cacheBlockSize: 50, //Solución Paginación
      //paginationAutoPageSize: false,
      rowModelType: 'normal',
      columnDefs: this.columnDefs,

      //rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      rowSelection: 'single',
      columnTypes: {
        fecha: {
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
      onGridReady: this.handleGridReady,
      onModelUpdated: this.onModelUpdated,
      onSelectionChanged: this.onSelectionChanged,

      processCellForClipboard: ({ value }) => {
        return value instanceof moment
          ? this.formatFecha(value as moment.Moment)
          : value;
      },
      onGridSizeChanged: event => {
        //event.api.sizeColumnsToFit();
      },
    };
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  created() {
    this.initialize();
  }
  clienteDefecto = JSON.parse(localStorage.getItem('user')).clienteDefecto;
  async verPdf() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      {
        user_id: this.usuario,
        movimiento: this.editedItem,
        clienteDefecto: this.clienteDefecto,
      },
      'conectaMoviDispositivos/exportar_pdf'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
          return;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
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

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.MovimientoDispositivos) {
        if (data.action === Accion.Editar) {
          this.editedItem = null;
          // Editar - Ver Detalle
          this.modalEsEdicion = data.action == Accion.Editar;

          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            this.showModalEdit = true;
            this.editedItem = data.cellRendererParams.data.movinumero;
          }
        } else if (data.action === Accion.VerPdf) {
          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            this.editedItem = data.cellRendererParams.data.movinumero;
          }
          this.verPdf();
        }
      }
    });
  }
  moduloModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;
  }
}
</script>

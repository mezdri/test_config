<template>
  <v-container fluid grid-list-md>
    <v-tabs>
      <v-tab>Despacho</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <div align="left">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-autocomplete
              clearable
              :label="formFields.orden.label"
              v-model="formFields.orden.value"
              :items="ordenList"
              item-text="despaseguimiento"
              item-value="despaseguimiento"
            ></v-autocomplete>
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              clearable
              v-model="formFields.tecnico.value"
              :label="formFields.tecnico.label"
              :items="tecnico"
              item-text="tecniconame"
              item-value="tecnicoid"
            ></v-autocomplete>
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              clearable
              v-model="formFields.coordinador.value"
              :label="formFields.coordinador.label"
              :items="coordinador"
              item-text="coorname"
              item-value="coorid"
            ></v-autocomplete>
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              clearable
              v-model="formFields.localidad.value"
              :label="formFields.localidad.label"
              :items="localidad"
              item-text="locaname"
              item-value="locaid"
            ></v-autocomplete>
          </v-flex>
        </v-flex>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-autocomplete
              clearable
              v-model="formFields.courier.value"
              :label="formFields.courier.label"
              :items="courrier"
              item-text="configvalor"
              item-value="configid"
            ></v-autocomplete>
          </v-flex>
          <v-flex xm3 sm3 md3>
            <DatePicker
              :label="formFields.dateStart.label"
              v-model="formFields.dateStart.value"
              v-validate="'required'"
              data-vv-name="fechaInicioRequerida"
              :error-messages="errors.collect('fechaInicioRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3>
            <DatePicker
              :label="formFields.dateEnd.label"
              v-model="formFields.dateEnd.value"
              v-validate="'required'"
              data-vv-name="fechaFinRequerida"
              :error-messages="errors.collect('fechaFinRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3>
            <div class="text-sm-center botones-filtros">
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
      <v-flex xs2 sm2 md2> </v-flex>
      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
      </v-flex>

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
    <div class="gridcard rounded-card despacho">
      <MantenedorGridSinCodigo
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif"
        class="ag-theme-material"
        :gridOptions="gridOptions"
        :funcionalidadId="funcionalidad"
      >
      </MantenedorGridSinCodigo>
    </div>

    <FormCrearDespacho
      :nuevoCodigo="valorMax"
      v-if="showModalNew"
      :courrierList="courrier"
      :usuarioActivo="usuarioActivo"
      :tecnicoList="tecnico"
      :localidadList="localidad"
      :coordinadorList="coordinador"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:datoCreado="datoNuevo($event)"
    >
    </FormCrearDespacho>

    <EditarDespacho
      v-if="showModalEdit"
      :esEdicion="modalEsEdicion"
      :courrierList="courrier"
      :accion="editedItem"
      :edited="editedItem"
      :tecnicoList="tecnico"
      :localidadList="localidad"
      :coordinadorList="coordinador"
      :usuarioActivo="usuarioActivo"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:datoEditado="datoEditado($event)"
    ></EditarDespacho>
  </v-container>
</template>
<script lang="ts">
import FormCrearDespacho from './FormCrear.vue';
import EditarDespacho from './EditarDespacho.vue';

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
import { fetchDespacho } from './fetchDespacho';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FormCrearDespacho,
    EditarDespacho,
    DatePicker,
    'app-confirmacion': Confirmation,
    FormFieldsContainer,
  },
})
export default class Despacho extends ComponenteBase {
  ordesList: any[] = [];
  filtro: string = '';
  consulta: any = {
    orden: '',
    tecnico: '',
    coordinador: '',
    localidad: '',
    courier: '',
    dateStart: moment()
      .subtract(1, 'month')
      .format('YYYY/MM/DD'),
    dateEnd: moment().format('YYYY/MM/DD'),
  };
  funcionalidad: Funcionalidades = Funcionalidades.Despacho;

  async getDespacho() {
    let self = this;
    this.loadingService.showLoading();
    return fetchDespacho(
      {
        orden: this.consulta.orden ? this.consulta.orden : '',
        tecnico: this.consulta.tecnico ? this.consulta.tecnico : '',
        coordinador: this.consulta.coordinador ? this.consulta.coordinador : '',
        localidad: this.consulta.localidad ? this.consulta.localidad : '',
        courier: this.consulta.courier ? this.consulta.courier : '',
        dateStart: this.consulta.dateStart ? this.consulta.dateStart : '',
        dateEnd: this.consulta.dateEnd ? this.consulta.dateEnd : '',
      },
      'conectaDespacho/inicio'
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

    return fetchDespacho({ userId: user }, 'conectaDespacho/getUsuario')
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

  ordenList: any[] = [];
  tecnico: any[] = [];
  coordinador: any[] = [];
  localidad: any[] = [];
  courrier: any[] = [];

  async getFiltros() {
    let self = this;
    return fetchDespacho({ '': '' }, 'conectaDespacho/getFilter')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordenList = data.data.ORDEN;
          this.tecnico = data.data.TECNICO;
          this.coordinador = data.data.COORDINADOR;
          this.localidad = data.data.LOCALIDAD;
          this.courrier = data.data.CURRIER;
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
    return fetchDespacho({ '': '' }, 'conectaDespacho/getCodigo')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.despaAnterior = parseInt(data.data.data.ult_despanumero);
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
  }

  valorMax: number;
  codigosList: any[] = [];

  async datoEditado(dato: boolean) {
    if (dato) {
      this.ordesList = await this.getDespacho();
      this.gridApi.setRowData(this.ordesList);
    }
  }

  async datoNuevo(dato: any) {
    this.ordesList = await this.getDespacho();
    this.gridApi.setRowData(this.ordesList);
    await this.getCodigo();
    this.valorMax = this.despaAnterior + 1;
    this.getFiltros();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.getUsuario();
    this.ordesList = await this.getDespacho();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.getFiltros();
    await this.getCodigo();
    this.valorMax = this.despaAnterior + 1;
  }

  async filtrar() {
    this.ordesList = [];
    this.gridApi.setRowData(this.ordesList);
    this.consulta = {
      orden: this.formFields.orden.value,
      tecnico: this.formFields.tecnico.value,
      coordinador: this.formFields.coordinador.value,
      localidad: this.formFields.localidad.value,
      courier: this.formFields.courier.value,
      dateStart: moment(this.formFields.dateStart.value.toString()).format(
        'YYYY/MM/DD'
      ),
      dateEnd: moment(this.formFields.dateEnd.value.toString()).format(
        'YYYY/MM/DD'
      ),
    };
    this.ordesList = await this.getDespacho();
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
    this.formFields.orden.value = '';
    this.formFields.tecnico.value = '';
    this.formFields.coordinador.value = '';
    this.formFields.localidad.value = '';
    this.formFields.courier.value = '';
    this.formFields.dateStart.value = moment().subtract(1, 'month');
    this.formFields.dateEnd.value = moment();
  }

  formFields: FormFieldDefMap = {
    orden: {
      label: 'Orden de Seguimiento',
      id: 'despaseguimiento',
      value: '',
    },
    tecnico: {
      label: 'Técnico',
      id: 'tecnicoid',
      value: '',
    },
    coordinador: {
      label: 'Coordinador',
      id: 'coorid',
      value: '',
    },
    localidad: {
      label: 'Localidad',
      id: 'locaid',
      value: '',
    },
    courier: {
      label: 'Courier',
      id: 'configid',
      value: '',
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
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.accionCrear];

  // Globales
  tabModel: string = 'tab-3';
  muestraBarraBotones: boolean = false;
  registrosAsociar: any = [];
  rowsPerPageItems: any = [];
  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  showTabPerfiles: boolean = true;
  showTabRoles: boolean = true;
  loadingService = new LoadingService();
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  chequearPermisosBtnCrear: boolean = true;
  editedIndex: number = -1;
  nombreModulo: string = '';
  handleErrors: HandleErrors = new HandleErrors();
  AccionesPerfilesAsociados: number = 0;

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
    return moment(params.value).format('YYYY/MM/DD');
  }

  constructor() {
    super();
    this.columnDefs = [
      {
        headerName: 'Código',
        field: 'despanumero',
        resizable: true,
        sortable: true,
        hide: false,
        minWidth: 100,
        width: 120,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Envío',
        field: 'despafecha_envia',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 200,
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
        headerName: 'Courier',
        field: 'configvalor',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Orden Seguimiento',
        field: 'despaseguimiento',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Localidad',
        field: 'locaname',
        sortable: true,
        resizable: true,
        width: 270,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Coordinador',
        field: 'coorname',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Técnico',
        field: 'tecniconame',
        resizable: true,
        width: 200,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'case',
        resizable: true,
        width: 130,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
    ];

    this.gridOptions = {
      pagination: true,
      paginationPageSize: 6, //Solución Paginación
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

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.Despacho) {
        if (
          data.action === Accion.Editar ||
          data.action === Accion.VerDetalle
        ) {
          this.editedItem = null;
          // Editar - Ver Detalle
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
            this.showModalEdit = true;
            this.editedItem = data.cellRendererParams.data.despanumero;
          }
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

<style>
#app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div.gridcard.rounded-card.despacho
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-header.ag-pivot-off
  > div.ag-pinned-left-header {
  display: none;
}
#app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div.gridcard.rounded-card.despacho
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-body-viewport.ag-row-no-animation.ag-layout-auto-height
  > div.ag-pinned-left-cols-container {
  display: none;
}
#app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div.gridcard.rounded-card.despacho
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-body-horizontal-scroll
  > div.ag-horizontal-left-spacer {
  display: none;
}
</style>

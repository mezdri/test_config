<template>
  <v-container fluid grid-list-md class="recepcionEquipos">
    <v-tabs>
      <v-tab>Recepción de Equipos</v-tab>
    </v-tabs>
    <v-divider></v-divider>
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
        <v-flex xs3 sm3 md3>
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
      <v-flex xs12 sm6 :md6="accionCrear.visible"> </v-flex>

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
    <div class="gridcard rounded-card proveedores">
      <MantenedorGridSinCodigo
        class="ag-theme-material"
        :gridOptions="gridOptions"
        :funcionalidadId="funcionalidad"
      />
    </div>
    <Movimiento
      v-if="showModal"
      :esEdicion="modalEsEdicion"
      :edited="editedItem"
      :usuarioActivo="usuarioActivo"
      :estados="estados"
      :recibido="recibido"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:actualizar="getFiltrados()"
    />
  </v-container>
</template>
<script lang="ts">
import DatePicker from '@/reusable/Form/DatePicker.vue';

import moment from 'moment';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import { Component } from 'vue-property-decorator';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { Accion } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import store from '@/store';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Movimiento from './Acciones/Movimiento.vue';

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
import { fetchRecepcion } from './fetchRecepcion';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Console } from 'console';

@Component({
  components: {
    MantenedorGridSinCodigo,
    DatePicker,
    Confirmation,
    FormFieldsContainer,
    Movimiento,
  },
})
export default class RecepcionEquipos extends ComponenteBase {
  dialogConfirmacionClose: boolean = false;
  filtro: string = '';
  ordesList: any[] = [];
  showModal: boolean = false;

  funcionalidad: Funcionalidades = Funcionalidades.RecepcionEquipos;

  formFields: FormFieldDefMap = {
    estado: {
      label: 'Estado',
      value: '',
      id: '',
    },
    dateStart: {
      label: 'Fecha Envío Desde',
      value: moment()
        .subtract(1, 'month')
        .startOf('day'),
      id: '',
    },
    dateEnd: {
      label: 'Fecha Envío Hasta',
      value: moment().endOf('day'),
      id: '',
    },
  };

  async filtrar() {
    this.gridApi.setRowData([]);
    this.ordesList = await this.getFiltrados();
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }

  clearFilters() {
    this.formFields.estado.value = this.enviado;
    this.formFields.dateStart.value = moment()
      .subtract(1, 'months')
      .startOf('day');
    this.formFields.dateEnd.value = moment().endOf('day');
  }

  async getFiltrados() {
    let self = this;
    this.loadingService.showLoading();
    return fetchRecepcion(
      {
        usuarioId: JSON.parse(localStorage.getItem('user')).id,
        fechaInicio: moment(this.formFields.dateStart.value.toString())
          .startOf('day')
          .format('YYYY/MM/DD HH:mm'),
        fechafin: moment(this.formFields.dateEnd.value.toString())
          .endOf('day')
          .format('YYYY/MM/DD HH:mm'),
        estado: this.formFields.estado.value
          ? this.formFields.estado.value
          : '',
      },
      'conecta_recepcion_equipos/filtrar'
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

  async getMovimientos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchRecepcion(
      {
        usuarioId: JSON.parse(localStorage.getItem('user')).id,
        fechaInicio: moment(this.formFields.dateStart.value.toString())
          .startOf('day')
          .format('YYYY/MM/DD HH:mm'),
        fechafin: moment(this.formFields.dateEnd.value.toString())
          .endOf('day')
          .format('YYYY/MM/DD HH:mm'),
      },
      'conecta_recepcion_equipos/inicio'
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

  estados: any = [];
  enviado: number;
  recibido: number;
  async getFilter() {
    let self = this;
    return fetchRecepcion({ '': '' }, 'conecta_recepcion_equipos/get_filter')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.estados = data.data.ESTADO;
          this.formFields.estado.value = data.data.ENVIADO[0].configid;
          this.enviado = data.data.ENVIADO[0].configid;
          this.recibido = data.data.RECIBIDO[0].configid;
          return null;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
  }

  usuarioActivo: any = {};
  async getUsuario() {
    let self = this;
    let user = JSON.parse(localStorage.getItem('user')).id;

    return fetchRecepcion(
      { userId: user },
      'conecta_recepcion_equipos/get_usuario'
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

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getMovimientos();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
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

  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };

  accionVerDetalle: PermisoAccion = {
    accionCodigo: 4,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEditar,
    this.accionVerDetalle,
  ];

  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  loadingService = new LoadingService();
  editedIndex: number = -1;
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
  serverSide: any;

  // Interfaces
  editedItem: IFuncionalidad = {};
  funcionalidades: Array<IFuncionalidad> = [];

  //vuex
  usuarioId: number = store.state.userId;

  // Componentes
  //showModalNew: boolean = false;
  modalEsEdicion: boolean = false;

  dateFormatter(params: any) {
    return params && params.movifecha_recibe != ''
      ? moment(params.value).format('YYYY/MM/DD')
      : '';
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
        minWidth: 150,
        width: 150,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Origen',
        field: 'tipoubicaname',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 200,
        lockPinned: true,
      },
      {
        headerName: 'Fecha Alta',
        field: 'movifecha_alta',
        resizable: true,
        sortable: true,
        width: 150,
        minWidth: 150,
        lockPinned: true,
        valueFormatter: this.dateFormatter,
      },
      {
        headerName: 'Usuario',
        field: 'full_name',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Operación',
        field: 'operacion',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        resizable: true,
        width: 200,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Observación',
        field: 'moviobs',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Número Orden Despacho',
        field: 'despaseguimiento',
        resizable: true,
        width: 220,
        minWidth: 220,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Caja Número',
        field: 'movicajanro',
        resizable: true,
        width: 180,
        minWidth: 180,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Fecha Recibe',
        field: 'movifecha_recibe',
        resizable: true,
        width: 180,
        minWidth: 180,
        lockPinned: true,
        sortable: true,
        valueFormatter: this.dateFormatter,
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
          //cellRenderer: this.fechaFilter,
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

  mounted() {
    this.getFilter();
    this.getUsuario();
  }

  created() {
    this.initialize();
  }

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.RecepcionEquipos) {
        if (data.action === Accion.VerDetalle) {
          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            this.showModal = true;
            this.editedItem = data.cellRendererParams.data.movinumero;
          }
        } else if (data.action === Accion.Editar) {
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
            this.showModal = true;
            this.editedItem = data.cellRendererParams.data.movinumero;
          }
        }
      }
    });
  }

  moduloModalCallback(val: boolean) {
    this.showModal = val;
    this.modalEsEdicion = val;
    this.filtrar();
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
  }
}
</script>

<style>
.recepcionEquipos .estilo-grilla {
  height: 100% !important;
}
</style>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Configurar Landing</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding:0px">
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
        <div align="right" style="padding-top:15px;">
          <v-btn
            v-if="accionExportar.visible"
            flat
            small
            color="primary"
            style="padding-right: 20px;"
            @click="exportar()"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar</span>
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            style="padding-right:0px;"
            @click="
              (editedItem = {}),
                (showModalNew = true),
                (editedVerDetalle = false)
            "
          >
            <v-icon dark left style="margin-right: 0px; padding-left:0px;"
              >add_circle_outline</v-icon
            >
            <span style="padding-right:7px;">Crear Configuración</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <v-divider></v-divider>

    <div class="gridcard rounded-card">
      <MantenedorGrid
        :grid-options="gridOptions"
        :row-data="datos"
        class="ag-theme-material estilo-grilla"
      />
    </div>

    <app-nueva-cl
      :show="showModalNew"
      :_id="editedIndex"
      :modalEsVerDetalle="editedVerDetalle"
      v-on:modalAsociacionEmit="ConfigurarModalCallback($event)"
    ></app-nueva-cl>
    <app-edit-cl
      :show="showModalEdit"
      :esEdicion="esEdicion"
      :configuracion="configuracion"
      v-on:modalAsociacionEmit="ConfigurarModalCallback($event)"
    ></app-edit-cl>
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="'Eliminar Configuracion'"
      :mensaje="'¿Estas Seguro que desas eliminar la Configuración?'"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import config from '@/config/index';
import store from '@/store';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { AxiosVue } from '@/AxiosVue';
import {
  ServicioProxy,
  EstadoCompartirInformacion,
  TipoCompartir,
} from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { FlotaInterface } from '@/interfaces/Flota';
import { actionsEvent } from '@/setup';
import { EstadoEntidad, Accion } from '@/config/enums';
import CompartirInformacionModalNuevo from '@/components/plataforma/CompartirInformacionModalNuevo.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { LoadingService } from '@/services/loadingService';
import ConfigurarLandingModalNuevo from '@/pantallas/ConfigurarLanding/ConfigurarLandingModalNuevo.vue';
import ConfigurarLandingModalEdicion from '@/pantallas/ConfigurarLanding/ConfigurarLandingModalEdicion.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');
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
  ICellRendererParams,
} from 'ag-grid-community';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard'; // contiene la ruta base
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    MenuItem,
    'app-confirmacion': Confirmation,
    'app-nueva-cl': ConfigurarLandingModalNuevo,
    'app-edit-cl': ConfigurarLandingModalEdicion,
    MantenedorGrid,
  },
})
export default class ConfigurarLanding extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.ConfigurarLanding;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly controller: string = 'CompartirInformacion';

  tabModel: string = 'tab-1';
  modalEsVerDetalle: boolean = false;
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  serverSide: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;

  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();
  dialogDejarCompartir: boolean = false;
  dialogIngresarMotivo: boolean = false;
  motivoDejarCompartirModel: string = '';
  validFormMotivo: boolean = false;
  nombreMandante: string = '';
  chequearPermisosBtnCrear: boolean = true;

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  esEdicion: boolean = false;

  muestraBarraBotones: boolean = false;

  configuracion: any = null;

  search: string = '';
  flotas: FlotaInterface[] = [];
  dialogEliminar: Boolean = false;
  elminarId: number = 0;
  editedIndex: number = -1;
  editedItem: FlotaInterface = {};
  defaultItem: FlotaInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculos: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  clienteId: number = config.getClienteSesion();
  intervalo: any; //Intervalo para el buscador
  paramsExportar: any; //Parametros para Exportar
  editedVerDetalle: boolean = false;

  datos: any = [];

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);

    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        suppressMenu: true,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left', 'pointer-events': 'none' },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        hide: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo',
        field: 'tipo',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 145,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Título',
        field: 'titulo',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 163,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Contenido',
        field: 'mensaje',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'URL',
        field: 'url',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },

      {
        headerName: 'Fecha Inicio',
        field: 'fecha_inicio',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 163,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Expiración',
        field: 'fecha_fin',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },

      {
        headerName: 'Fecha Creación',
        field: 'fecha_creacion',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },

      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: MenuItem,
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
        filter: false,
        suppressMovable: true,
      },
    ];

    this.gridOptions = {
      columnDefs: this.columnDefs,
      onGridReady: this.handleGridReady,
    };

    this.initialize();
  }
  handleVerDetalleClick(params: ICellRendererParams) {
    this.configuracion = null;
    this.configuracion = params.data;
    this.esEdicion = false;
    this.showModalEdit = true;
  }
  handleEliminarClick(params: ICellRendererParams) {
    this.dialogEliminar = true;
    this.elminarId = params.data.id;
  }
  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;

    if (val) {
      await fetchDashboard({ id: this.elminarId }, 'pantalla/delete').then(
        async (r: any) => {
          if (r.data.CODIGO_RESPUESTA == 1) {
            await this.getrows();
            this.$snotify.success(
              this.$t('mensajes.mensajesExito.eliminar', {
                entidad: 'Configuración',
                eliminadaO: 'eliminada',
              })
            );
          }
        }
      );
    }
  }

  handleEditarClick(params: ICellRendererParams) {
    this.configuracion = null;
    this.configuracion = params.data;
    this.esEdicion = true;
    this.showModalEdit = true;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }
  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    await this.getrows();

    //this.gridApi.setRowData(this.datos.data);
  }
  async getrows() {
    await fetchDashboard(
      { type: 'mensaje', ALL: 'SI' },
      'pantalla/get_pantallas'
    ).then((x: any) => (this.datos = x.data.data));
  }
  async closeModal(val: Boolean) {
    await this.getrows();
    this.dialogEliminar = val;
    this.showModalNew = false;
  }
  async ConfigurarModalCallback(val: boolean) {
    await this.getrows();
    this.muestraBarraBotones = false;
    this.esEdicion = val;
    this.showModalNew = val;
    this.showModalEdit = val;
  }

  exportar() {}

  initialize() {}
}
</script>

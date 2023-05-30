<template>
  <v-container fluid v-show="mostrarSim">
    <div align="left">
      <v-flex>
        <h2 class="h2_title" style="margin-top: 12px !important">SIM</h2>
      </v-flex>
    </div>
    <v-divider></v-divider>
    <div class="gridcard rounded-card">
      <v-layout row wrap class="ml-5">
        <v-flex xs4 sm4 md4
          ><v-text-field
            label="Buscar"
            @keyup="gridApi.setQuickFilter(filtro)"
            v-model="filtro"
            outlined
          ></v-text-field>
        </v-flex>
        <v-flex xs2 sm2 md5> </v-flex>
        <v-flex xs3 sm3 md3>
          <div align="right" style="padding-top: 6px">
            <v-btn
              style="padding-right: 20px"
              @click="cargarDispositivosSim()"
              color="#ffe800"
            >
              <v-icon dark left style="color: black">add_circle_outline</v-icon>
              <span style="color: black">Agregar Dispositivos</span>
            </v-btn>
          </div>
        </v-flex>
      </v-layout>
      <div class="gridcard rounded-card">
        <AgGridVue
          style="font-family: 'Asap', sans-serif"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        />
      </div>
      <TablaSimTodos
        ref="tablaSimTodos"
        :DispositivosTotalesSim="DispositivosTotalesSim"
        v-on:DispositivosTotalesSim="cerrarModal()"
        :usuarioActivo="usuarioActivo"
        :dataSelected="simsSelected"
        v-on:selected="cargarSelected($event)"
      />
    </div>
  </v-container>
</template>
<script lang="ts">
import moment from 'moment';
import TablaSimTodos from './TablaSimTodos.vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import { Component, Prop } from 'vue-property-decorator';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { actionsEvent } from '@/setup';
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
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
const { AgGridVue } = require('ag-grid-vue');

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

@Component({
  components: {
    MantenedorGridSinCodigo,
    TablaSimTodos,
    AgGridVue,
  },
})
export default class TablaSim extends ComponenteBase {
  @Prop({ required: true }) usuarioActivo: any;
  @Prop({ default: false }) mostrarSim: boolean;
  @Prop({ required: true }) nuevoCodigo: number;
  filtro: string = '';
  ordesList: any[] = [];
  DispositivosTotalesSim: boolean = false;
  funcionalidad: Funcionalidades = Funcionalidades.MovimientoDispositivosSim;
  usuario = JSON.parse(localStorage.getItem('user')).id;

  simTodos: any;

  mounted() {
    this.simTodos = this.$refs.tablaSimTodos;
  }

  simsSelected: any = [];
  cargarSelected(data: any) {
    this.simsSelected = data;
    this.gridApi.setRowData(this.simsSelected);
    this.gridApi.setDomLayout('autoHeight');
  }

  async postSim(data: any, destino: number) {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      { sims: data, destino: destino },
      'conectaMoviDispositivos/insertar_sim'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data;
        } else {
          //self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return false;
        }
      })
      .catch((error: any) => {
        self.$snotify.error(
          'Ocurrió un error con los dispositivos no seriados',
          { timeout: 3000 }
        );
        return false;
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  async guardarSims(destino: number) {
    if (this.simsSelected.length > 0) {
      let sims = this.simsSelected.map((e: any) => ({
        movinumero: this.nuevoCodigo,
        simserienumero: e.simserienumero,
      }));
      //console.log(sims);
      await this.postSim(sims, destino);
    }
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  cerrarModal() {
    this.DispositivosTotalesSim = false;
  }

  cargarDispositivosSim() {
    this.DispositivosTotalesSim = true;
    this.simTodos.recargarSelected();
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
    visible: true,
  };

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEditar,
  ];

  // Globales

  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  loadingService = new LoadingService();
  intervalo: any; //Intervalo para el buscador
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
    return moment(params.value).format('MM/DD/YYYY');
  }

  constructor() {
    super();
    this.columnDefs = [
      {
        headerName: 'SIM Número',
        field: 'simserienumero',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 400,
        width: 400,
        lockPinned: true,
      },
      {
        headerName: 'Telco',
        field: 'telconame',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 300,
        width: 300,
        lockPinned: true,
      },
      {
        headerName: 'Móvil',
        field: 'simmovil',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 300,
        width: 300,
        lockPinned: true,
      },
      {
        headerName: 'Estado',
        field: 'configvalor',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 300,
        minWidth: 300,
        lockPinned: true,
      },
      makeAccionesColumnDef(this.funcionalidad),
    ];

    this.gridOptions = {
      localeText: { noRowsToShow: 'No se han seleccionado dispositivos sim' },
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

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.MovimientoDispositivosSim) {
        if (data.action === Accion.Eliminar) {
          this.editedItem = null;
          // Editar - Ver Detalle
          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            let indexDelete = this.simsSelected.indexOf(
              data.cellRendererParams.data
            );
            this.simsSelected.splice(indexDelete, 1);
            this.gridApi.setRowData(this.simsSelected);
            this.gridApi.setDomLayout('autoHeight');
          }
        }
      }
    });
  }
}
</script>

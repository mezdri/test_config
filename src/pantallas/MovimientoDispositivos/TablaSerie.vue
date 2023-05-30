<template>
  <v-container fluid v-show="mostrarSerie">
    <div align="left">
      <v-flex>
        <h2 class="h2_title" style="margin-top: 12px !important">
          Equipos Seriados
        </h2>
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
              @click="cargarDispositivosTodos()"
              color="#ffe800"
            >
              <v-icon dark left style="color: black">add_circle_outline</v-icon>
              <span style="color: black">Agregar Dispositivos</span>
            </v-btn>
          </div>
        </v-flex>
      </v-layout>
      <v-divider></v-divider>
      <div class="tablaSeriadosSelected">
        <AgGridVue
          style="font-family: 'Asap', sans-serif"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        />
      </div>
      <TablaSeriesTodos
        ref="TablaSeriesTotales"
        v-on:DispositivosTotales="cerrarModal()"
        v-on:selected="cargarSeriados($event)"
        :DispositivosTotales="DispositivosTotales"
        :dataSelected="dataSelected"
        :nuevoCodigo="nuevoCodigo"
      />
    </div>
  </v-container>
</template>
<script lang="ts">
import moment from 'moment';
import TablaSeriesTodos from './TablaSeriesTodos.vue';
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
    TablaSeriesTodos,
    AgGridVue,
  },
})
export default class TablaSerie extends ComponenteBase {
  @Prop({ required: true }) nuevoCodigo: number;
  @Prop({ default: false }) mostrarSerie: boolean;
  TablaSeriesTotales: any;
  selected: any;
  DispositivosTotales: boolean = false;
  filtro: string = '';
  ordesList: any[] = [];

  funcionalidad: Funcionalidades =
    Funcionalidades.MovimientoDispositivosSeriados;
  usuario = JSON.parse(localStorage.getItem('user')).id;

  mounted() {
    this.TablaSeriesTotales = this.$refs.TablaSeriesTotales;
  }

  cerrarModal() {
    this.DispositivosTotales = false;
  }
  dataSelected: any = [];

  async postEquiposSeriados(data: any, destino: number) {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      { seriados: data, destino: destino },
      'conectaMoviDispositivos/insertar_seriados'
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
        self.$snotify.error('Ocurrió un error con los dispositivos seriados', {
          timeout: 3000,
        });
        return false;
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async guardarSeriados(destino: number) {
    if (this.dataSelected.length > 0) {
      let seriados = this.dataSelected.map((e: any) => ({
        movinumero: this.nuevoCodigo,
        serienumero: e.serienumero,
        tipoeqid: e.tipoeqid,
        rack: e.rack ? e.rack : '',
        bloque: e.bloque ? e.bloque : '',
      }));
      //console.log(seriados);
      await this.postEquiposSeriados(seriados, destino);
    }
  }

  cargarSeriados(data: any) {
    this.dataSelected = data;
    this.gridApi.setRowData(this.dataSelected);
    this.gridApi.setDomLayout('autoHeight');
  }

  cargarDispositivosTodos() {
    this.TablaSeriesTotales.recargarSelected();
    this.DispositivosTotales = true;
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    //const updateData = (data: any) => this.gridApi.setRowData(data);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }
  onSelectionChanged() {}
  accionesTotales: PermisoAccion[] = [];

  // Globales

  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
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
    return moment(params.value).format('MM/DD/YYYY');
  }
  constructor() {
    super();
  }

  readonly gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 30, //Solución Paginación
    //cacheBlockSize: 50, //Solución Paginación
    //paginationAutoPageSize: false,
    rowModelType: 'normal',
    singleClickEdit: true,
    localeText: {
      noRowsToShow: 'No se han seleccionado dispositivos seriados',
    },
    columnDefs: [
      {
        headerName: 'Serie Número',
        field: 'serienumero',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 200,
        width: 200,
        lockPinned: true,
      },
      {
        headerName: 'Equipo',
        field: 'tipoeqname',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 400,
        minWidth: 400,
        lockPinned: true,
      },
      {
        headerName: 'Rack',
        field: 'rack',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 400,
        minWidth: 400,
        lockPinned: true,
      },
      {
        headerName: 'Bloque',
        field: 'bloque',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 340,
        minWidth: 340,
        lockPinned: true,
      },
      makeAccionesColumnDef(this.funcionalidad),
    ],
    //rowModelType: 'serverSide',
    serverSideDatasource: this.serverSide,
    rowSelection: 'multiple',
    columnTypes: {
      fecha: {
        sortable: true,
        resizable: true,
        filter: false,
      },
    },
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    onSelectionChanged: this.onSelectionChanged,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
    onGridSizeChanged: event => {
      event.api.sizeColumnsToFit();
    },
  };

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  created() {
    this.initialize();
  }

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (
        this.funcionalidad === Funcionalidades.MovimientoDispositivosSeriados
      ) {
        if (data.action === Accion.Eliminar) {
          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            let indexDelete = this.dataSelected.indexOf(
              data.cellRendererParams.data
            );
            this.dataSelected.splice(indexDelete, 1);
            this.gridApi.setRowData(this.dataSelected);
            this.gridApi.setDomLayout('autoHeight');
          }
        }
      }
    });
  }
}
</script>

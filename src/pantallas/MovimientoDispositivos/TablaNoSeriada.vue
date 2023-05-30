<template>
  <v-container fluid v-show="mostrarNoSerie">
    <div align="left">
      <v-flex>
        <h2 class="h2_title" style="margin-top: 12px !important">
          Equipos No Seriados
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
              color="#ffe800"
              @click="agregarNoSeriados()"
            >
              <v-icon dark left style="color: black">add_circle_outline</v-icon>
              <span style="color: black">Agregar Dispositivos</span>
            </v-btn>
          </div>
        </v-flex>
      </v-layout>
      <div class="gridcard rounded-card">
        <AgGridVue
          style="font-family: 'Asap' sans-serif"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        />
      </div>

      <TablaNoSeriadaTodos
        v-on:DispositivosNoSeriadosTotales="cerrarModal()"
        :DispositivosNoSeriadosTotales="DispositivosNoSeriadosTotales"
        v-on:selected="cargarNoSeriados($event)"
        :dataSelected="seleccionados"
        ref="NoSeriadosTodos"
      />
    </div>
  </v-container>
</template>
<script lang="ts">
import moment from 'moment';
import TablaNoSeriadaTodos from './TablaNoSeriadaTodos.vue';
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
    TablaNoSeriadaTodos,
    AgGridVue,
  },
})
export default class TablaSerie extends ComponenteBase {
  @Prop({ required: true }) nuevoCodigo: number;
  @Prop({ default: false }) mostrarNoSerie: boolean;
  DispositivosNoSeriadosTotales: boolean = false;
  filtro: string = '';
  ordesList: any[] = [];

  funcionalidad: Funcionalidades =
    Funcionalidades.MovimientoDispositivosNoSeriados;
  usuario = JSON.parse(localStorage.getItem('user')).id;
  noSeriadosTotales: any;

  mounted() {
    this.noSeriadosTotales = this.$refs.NoSeriadosTodos;
  }

  agregarNoSeriados() {
    this.noSeriadosTotales.recargarSelected();
    this.DispositivosNoSeriadosTotales = true;
  }

  cerrarModal() {
    this.DispositivosNoSeriadosTotales = false;
  }

  seleccionados: any = [];
  cargarNoSeriados(data: any) {
    this.seleccionados = data;
    this.gridApi.setRowData(this.seleccionados);
    this.gridApi.setDomLayout('autoHeight');
  }

  async postEquiposNoSeriados(data: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      { noSeriados: data },
      'conectaMoviDispositivos/insertar_no_seriados'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data;
        } else {
          //self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error(
          'Ocurrió un error con los dispositivos no seriados',
          { timeout: 3000 }
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async guardarNoSeriados() {
    if (this.seleccionados.length > 0) {
      let noSeleccionados = this.seleccionados.map((e: any) => ({
        movinumero: this.nuevoCodigo,
        serienumero: e.id,
        linea: e.asigdeta_linea,
        cantidad: e.asigdeta_cant,
        rack: e.rack ? e.rack : '',
        bloque: e.bloque ? e.bloque : '',
      }));
      console.log(noSeleccionados);
      await this.postEquiposNoSeriados(noSeleccionados);
    }
  }

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = [];
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
  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;

  loadingService = new LoadingService();

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
        headerName: 'Asignación',
        field: 'asignumero',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 150,
        width: 150,
        lockPinned: true,
      },
      {
        headerName: 'Línea',
        field: 'asigdeta_linea',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 100,
        minWidth: 100,
        lockPinned: true,
      },
      {
        headerName: 'Equipo',
        field: 'tipoeqname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        sortable: false,
        width: 400,
        minWidth: 400,
        lockPinned: true,
      },
      {
        headerName: 'Cantidad',
        field: 'asigdeta_cant',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 200,
        minWidth: 200,
        lockPinned: true,
      },
      {
        headerName: 'Rack',
        field: 'rack',
        resizable: false,
        cellStyle: { textAlign: 'left' },
        sortable: false,
        width: 300,
        minWidth: 300,
        lockPinned: true,
      },
      {
        headerName: 'Bloque',
        field: 'bloque',
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
      localeText: {
        noRowsToShow: 'No se han seleccionado dispositivos no seriados',
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

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (
        this.funcionalidad === Funcionalidades.MovimientoDispositivosNoSeriados
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
            let indexDelete = this.seleccionados.indexOf(
              data.cellRendererParams.data
            );
            this.seleccionados.splice(indexDelete, 1);
            this.gridApi.setRowData(this.seleccionados);
            this.gridApi.setDomLayout('autoHeight');
          }
        }
      }
    });
  }
}
</script>

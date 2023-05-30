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
        <v-flex xs3 sm3 md3> </v-flex>
      </v-layout>
      <div class="simSelected">
        <MantenedorGrid
          style="font-family: 'Asap', sans-serif"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        />
      </div>
    </div>
  </v-container>
</template>
<script lang="ts">
import moment from 'moment';
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
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchRecepcion } from '../fetchRecepcion';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';

@Component({
  components: {
    MantenedorGrid,
  },
})
export default class DispositivosSim extends ComponenteBase {
  @Prop({ default: false }) mostrarSim: boolean;
  @Prop({ required: true }) codigo: number;
  filtro: string = '';
  ordesList: any[] = [];

  funcionalidad: Funcionalidades =
    Funcionalidades.MovimientoDispositivosSeriados;
  usuario = JSON.parse(localStorage.getItem('user')).id;

  async getSimsSelected() {
    let self = this;
    this.loadingService.showLoading();
    return fetchRecepcion(
      { movimiento: this.codigo },
      'conectaMoviDispositivos/get_sims_selected'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
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

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getSimsSelected();
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
        minWidth: 450,
        width: 450,
        lockPinned: true,
      },
      {
        headerName: 'Telco',
        field: 'telconame',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 400,
        width: 400,
        lockPinned: true,
      },
      {
        headerName: 'Móvil',
        field: 'simmovil',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 350,
        width: 350,
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
    ];

    this.gridOptions = {
      pagination: true,
      paginationPageSize: 30,
      rowModelType: 'normal',
      columnDefs: this.columnDefs,
      serverSideDatasource: this.serverSide,
      rowSelection: 'single',
      localeText: { noRowsToShow: 'No se han seleccionado dispositivos sim' },
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
}
</script>

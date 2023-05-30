<template>
  <v-dialog v-model="DispositivosNoSeriadosTotales" persistent>
    <v-container fluid white>
      <div class="">
        <v-layout row wrap>
          <v-flex xs4 sm4 md4
            ><v-text-field
              label="Buscar"
              @keyup="gridApi.setQuickFilter(filtro)"
              v-model="filtro"
              outlined
            ></v-text-field>
          </v-flex>
        </v-layout>
        <div class="gridcard rounded-card">
          <AgGridVue
            style="font-family: 'Asap', sans-serif;"
            class="ag-theme-material"
            :gridOptions="gridOptions"
          />
        </div>
        <v-layout row wrap class="mt-3">
          <v-flex xs8 sm8 md9></v-flex>
          <v-flex xs4 sm4 md3 style="text-align: end">
            <v-btn class="btn-volver white--text" @click="cerrarModal()"
              >Cancelar</v-btn
            >
            <v-btn class="btn-grabar white--text" @click="guardar()"
              >Guardar</v-btn
            >
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </v-dialog>
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
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchMovimientos } from './fetchMovimientos';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Dispositivo from '../Dispositivos/Dispositivo.vue';
import { forEach } from 'lodash';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    MantenedorGrid,
    AgGridVue,
  },
})
export default class TablaNoSeriadaTodos extends ComponenteBase {
  @Prop({ default: false }) dataSelected: any;
  @Prop({ default: false }) DispositivosNoSeriadosTotales: boolean;
  accionesTotales: PermisoAccion[];
  filtro: string = '';
  ordesList: any[] = [];

  funcionalidad: Funcionalidades =
    Funcionalidades.MovimientoDispositivosNoSeriados;
  usuario = JSON.parse(localStorage.getItem('user')).id;

  cerrarModal() {
    this.$emit('DispositivosNoSeriadosTotales', false);
  }

  recargarSelected() {
    let selecteds = this.dataSelected ? this.dataSelected : [];
    this.gridApi.forEachNode(function(node) {
      node.setSelected(selecteds.includes(node.data));
    });
  }

  mounted() {}
  noSeriadasSelected: any;

  guardar() {
    this.noSeriadasSelected = this.selectedRows;
    this.$emit('selected', this.noSeriadasSelected);
    this.$emit('DispositivosNoSeriadosTotales', false);
  }

  async getNoSeriados() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos({ '': '' }, 'conectaMoviDispositivos/getNoSeriados')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
        } else {
          //self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
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
    this.ordesList = await this.getNoSeriados();
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

  selectedRows: any = [];

  onSelectionChanged(params: any) {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  // Globales
  search: string = '';
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
    return moment(params.value).format('MM/DD/YYYY');
  }

  constructor() {
    super();
    this.columnDefs = [
      {
        minWidth: 55,
        width: 55,
        checkboxSelection: true,
      },
      {
        headerName: 'Tipo de equipo',
        field: 'tipoeqname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        sortable: false,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Asignación',
        field: 'asignumero',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 200,
        width: 200,
      },
      {
        headerName: 'Línea',
        field: 'asigdeta_linea',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 200,
        width: 200,
      },
      {
        headerName: 'Cantidad',
        field: 'asigdeta_cant',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 200,
        width: 200,
      },
      {
        headerName: 'Observación',
        field: 'asigdeta_obs',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        minWidth: 200,
        width: 200,
      },
      {
        headerName: 'Requerimiento',
        field: 'asigrequerimiento',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 200,
        minWidth: 200,
      },
    ];

    this.gridOptions = {
      localeText: {
        noRowsToShow:
          'No hay dispositivos no seriados disponibles en tu ubicación',
      },
      pagination: true,
      paginationPageSize: 10, //Solución Paginación
      //cacheBlockSize: 50, //Solución Paginación
      //paginationAutoPageSize: false,
      rowModelType: 'normal',
      columnDefs: this.columnDefs,
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
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  created() {
    this.initialize();
  }

  initialize() {}
  moduloModalCallback(val: boolean) {
    this.showModalEdit = val;
  }
}
</script>

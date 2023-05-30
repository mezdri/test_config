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
        <v-flex xs3 sm3 md3> </v-flex>
      </v-layout>
      <v-divider></v-divider>
      <div class="DispositivosNoSeriados">
        <AgGridVue
          v-if="esEdicion"
          class="ag-theme-material"
          :gridOptions="gridOptions"
          :funcionalidadId="funcionalidad"
        />
        <MantenedorGrid
          v-else
          style="font-family: 'Asap', sans-serif"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        />
      </div>
      <ModalEdicion
        :tipo="'noseriado'"
        :edited="editedItem"
        :codigo="codigo"
        :modalEsEdicion="modalEdicion"
        ref="modal"
        v-on:cerrarModal="modalEdicion = $event"
        v-on:actualizarTabla="actualizarDatos($event)"
      />
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
import Confirmation from '@/components/Confirmation.vue';
import HandleErrors from '@/config/handleErrors';
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
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchRecepcion } from '../fetchRecepcion';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Dispositivo from '../Dispositivos/Dispositivo.vue';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import ModalEdicion from './ModalEdicion.vue';

@Component({
  components: {
    MantenedorGrid,
    MantenedorGridSinCodigo,
    ModalEdicion,
    AgGridVue,
  },
})
export default class DispositivosNoSeriadosEdicion extends ComponenteBase {
  @Prop({ default: false }) esEdicion: boolean;
  @Prop({ required: true }) codigo: number;
  @Prop({ default: false }) mostrarNoSerie: boolean;
  filtro: string = '';
  modalEdicion: boolean = false;
  selected: any;
  ordesList: any[] = [];

  funcionalidad: Funcionalidades = Funcionalidades.TablasRecepcionEquipos;
  usuario = JSON.parse(localStorage.getItem('user')).id;

  modal: any;
  mounted() {
    this.modal = this.$refs.modal;
  }

  async getNoSeriadosSelected() {
    let self = this;
    this.loadingService.showLoading();
    return fetchRecepcion(
      { movimiento: this.codigo },
      'conectaMoviDispositivos/get_no_seriados_selected'
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

  async actualizarDatos(data: boolean) {
    this.ordesList = await this.getNoSeriadosSelected();
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.modalEdicion = false;
  }

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getNoSeriadosSelected();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }
  onSelectionChanged() {}
  accionesTotales: PermisoAccion[] = [];

  // Globales
  search: string = '';
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

  funcionalidades: Array<IFuncionalidad> = [];

  //vuex
  usuarioId: number = store.state.userId;

  dateFormatter(params: any) {
    return moment(params.value).format('MM/DD/YYYY');
  }
  constructor() {
    super();
  }

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 30,
    rowModelType: 'normal',
    singleClickEdit: true,
    localeText: {
      noRowsToShow: 'No se han seleccionado dispositivos no seriados',
    },
    columnDefs: [
      {
        headerName: 'Asignación',
        field: 'asigrequerimiento',
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
        field: 'movinoseriecant',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 200,
        minWidth: 200,
        lockPinned: true,
      },
      {
        headerName: 'Rack',
        field: 'movinoserierack',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 300,
        minWidth: 300,
        lockPinned: true,
      },
      {
        headerName: 'Bloque',
        field: 'movinoseriebloque',
        cellStyle: { textAlign: 'left' },
        resizable: false,
        sortable: false,
        width: 300,
        minWidth: 300,
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
  editedItem: any;
  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.TablasRecepcionEquipos) {
        if (data.action === Accion.Editar) {
          this.editedItem = null;
          // Editar - Ver Detalle
          //this.modalEsEdicion = data.action == Accion.Editar;
          //this.editedIndex = data.id;

          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            //this.showModalEdit = true;
            this.editedItem = data.cellRendererParams.data.asigdeta_linea;
            this.modal.cargarInfo(this.editedItem);
            this.modalEdicion = true;
          }
        }
      }
    });
  }
}
</script>

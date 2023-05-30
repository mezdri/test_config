<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-2`">Ramplas</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:0px">
      <v-flex sm10 md10 layout wrap>
        <v-flex sm2.5 md2.5>
          <!-- <DateComponent
            :label="formFields.dateStart.label"
            class="tfClass"
            v-model="formFields.dateStart.value"
            v-validate="'required'"
            data-vv-name="fechaFinRequerida"
            :error-messages="errors.collect('fechaFinRequerida')"
            @input="onTimeStartChanged"
            :min="formFields.dateStart.min"
            :max="formFields.dateStart.max"
            required
          /> -->
          <DateComponent
            :label="formFields.dateStart.label"
            class="tfClass"
            v-model="formFields.dateStart.value"
            v-validate="'required'"
            data-vv-name="fechaFinRequerida"
            :error-messages="errors.collect('fechaFinRequerida')"
            required
          />
        </v-flex>
        <v-flex sm2.5 md2.5>
          <TimeComponent
            :label="formFields.timeStart.label"
            class="tfClass"
            v-model="formFields.timeStart.value"
            v-validate="'required'"
            data-vv-name="horaFinRequerida"
            :error-messages="errors.collect('horaFinRequerida')"
            required
          />
        </v-flex>
        <v-flex sm2.5 md2.5>
          <!-- <DateComponent
            :label="formFields.dateEnd.label"
            class="tfClass"
            v-model="formFields.dateEnd.value"
            v-validate="'required'"
            data-vv-name="fechaFinRequerida"
            :error-messages="errors.collect('fechaFinRequerida')"
            required
            @input="onTimeEndChanged"
            :min="formFields.dateEnd.min"
            :max="formFields.dateEnd.max"
          /> -->
          <DateComponent
            :label="formFields.dateEnd.label"
            class="tfClass"
            v-model="formFields.dateEnd.value"
            v-validate="'required'"
            data-vv-name="fechaFinRequerida"
            :error-messages="errors.collect('fechaFinRequerida')"
            required
          />
        </v-flex>
        <v-flex sm2.5 md2.5>
          <TimeComponent
            :label="formFields.timeEnd.label"
            class="tfClass"
            v-model="formFields.timeEnd.value"
            v-validate="'required'"
            data-vv-name="horaFinRequerida"
            :error-messages="errors.collect('horaFinRequerida')"
            required
          />
        </v-flex>
        <v-flex
          sm2.5
          md2.5
          style="display: flex; justify-content: flex-start; align-items: center;"
        >
          <div class="text-xs-center">
            <v-btn flat icon small @click="filter_pareo()">
              <v-icon>search</v-icon>
            </v-btn>
            <v-btn flat icon small @click="reset_filters()">
              <v-icon>clear</v-icon>
            </v-btn>
          </div>
        </v-flex>
      </v-flex>
    </v-layout>
    <v-layout row wrap style="padding-right:0px">
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            @input="onFilterTextBoxChanged"
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6>
        <div align="right" style="padding-top:15px">
          <v-btn
            id="btnExportCsv"
            flat
            small
            color="primary"
            @click="onBtnExport"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar<br />CSV</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-divider></v-divider>
    <div id="gridContainer">
      <v-card style="width: 100%; height: 100%; ">
        <GridComponent
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        ></GridComponent
      ></v-card>
    </div>
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
  </v-container>
</template>

<script lang="ts">
const { AgGridVue } = require('ag-grid-vue');
import moment from 'moment';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import HandleErrors from '@/config/handleErrors';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { eventBus, actionsEvent } from '@/setup';
import { EstadoEntidad } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import store from '@/store';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowSelectedEvent,
  CellValueChangedEvent,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';

import { ComponenteBase } from '@/views/base/ComponenteBase';
import { fetchDashboard } from '../Dashboard/fetchDashboard';
import { fetchDashboardA } from '../Dashboard/fetchDashboardA';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import ExportarAgGridButton from '../../reusable/Grid/ExportarAgGridButton.vue';

@Component({
  components: {
    GridComponent: AgGridVue,
    MantenedorGrid,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    ExportarAgGridButton,
    DateComponent: DatePicker,
    TimeComponent: TimePicker,
  },
})
export default class Ramplas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Ramplas;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];
  tabModel: string = 'tab-2';
  dateString = new Date();
  modalEsEdicion: boolean = false;
  localeText: any = {};
  gridApi: GridApi;
  columnApi: ColumnApi;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();
  enrichedGridOptions: GridOptions = null;
  formFields: { dateStart: any; timeStart: any; dateEnd: any; timeEnd: any } = {
    dateStart: {
      label: 'Fecha Inicio',
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
      min: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      )
        .subtract(3, 'months')
        .format('YYYY-MM-DD')
        .toString(),
      max: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      )
        .add(3, 'months')
        .format('YYYY-MM-DD')
        .toString(),
    },
    timeStart: {
      label: 'Hora Inicio',
      value: moment('00:00', 'HHmm'),
    },
    dateEnd: {
      label: 'Fecha Fin',
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
      min: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      )
        .subtract(3, 'months')
        .format('YYYY-MM-DD')
        .toString(),
      max: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      )
        .add(3, 'months')
        .format('YYYY-MM-DD')
        .toString(),
    },
    timeEnd: {
      label: 'Hora Fin',
      value: moment('23:59', 'HHmm'),
    },
  };

  sideBar = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  showConfigVista: boolean = false;
  dialogNoPuedeEliminar: boolean = false;
  mensajeEliminar: any = '';
  deleteMasivo: boolean = false;
  vehiculosAsociadosFlotas: any = [];
  cantidadVehiculosEliminaMasivo: number = 0;
  dialogEliminacionMasivaValida: boolean = false;
  dialogConfirmaEliminar: boolean = false;
  showModalCambioEstado: boolean = false;
  muestraBarraBotones: boolean = false;
  clienteId: number = config.getClienteSesion();

  $snotify: any;
  search: string = '';
  //modal eliminar
  tituloEliminar: any = '';
  dialogEliminar: Boolean = false;
  editedIndex: number = -1;
  editedItem: any = {};
  defaultItem: any = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  columnDefs: Array<ColDef> = [];
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  ramplas: any = null;
  columnfieldId: any = 'cod_vehiculo';

  gridOptions: GridOptions = {
    paginationPageSize: 50, //Solución Paginación
    cacheBlockSize: 50,
    columnDefs: [
      {
        headerName: 'Rampla',
        field: 'nom_rampla',
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Transportista',
        field: 'nom_transportista',
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Tracto',
        field: 'nom_tracto',
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Planta',
        field: 'nom_planta',
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'nom_estado',
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: false,
        cellRenderer: this.formatSemaforo,
      },
      {
        headerName: 'Fecha Inicio Pareo',
        field: 'inicio_pareo',
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        sort: 'desc',
      },
      {
        headerName: 'Fecha Fin Pareo',
        field: 'fin_pareo',
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
    ],
    rowSelection: 'multiple',
    pagination: true,
    paginationAutoPageSize: false,
    onGridReady: this.handleGridReady,
    localeText: this.localeText,
    onGridSizeChanged: (event: any) => {
      event.api.sizeColumnsToFit();
    },
    suppressCsvExport: false,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
    //onCellValueChanged: this.onCellValueChanged,
    singleClickEdit: true,
  };

  onBtnExport() {
    var columnKeys: string[] = [
      'nom_rampla',
      'nom_transportista',
      'nom_tracto',
      'nom_planta',
      'nom_estado',
      'inicio_pareo',
      'fin_pareo',
    ];
    console.log(this.gridOptions);
    this.gridOptions.api.exportDataAsCsv({
      suppressQuotes: true,
      columnKeys: columnKeys,
      fileName: 'ramplas_pareos_ela',
    });
  }

  onTimeStartChanged(value: any) {
    var newDate = this.formFields.dateStart.value.clone();
    newDate = newDate.add(3, 'months');
    this.formFields.dateEnd.max = newDate.format('YYYY-MM-DD').toString();
    if (this.formFields.dateEnd.value.isAfter(newDate)) {
      this.formFields.dateEnd.value = newDate;
    }
  }

  onTimeEndChanged(value: any) {
    var newDate = this.formFields.dateEnd.value.clone();
    newDate = newDate.subtract(3, 'months');
    this.formFields.dateStart.min = newDate.format('YYYY-MM-DD').toString();
    if (newDate.isAfter(this.formFields.dateStart.value)) {
      this.formFields.dateStart.value = newDate;
    }
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    const self = this;
    this.columnApi = event.columnApi;
    this.get_pareo();
    //await this.fetchRamplas();
    // this.agGridUtil = new AgGridUtil(
    //   this.gridApi,
    //   this.columnApi,
    //   this.estadoGrillaVm
    // );
  }

  reset_filters() {
    this.dateString = new Date();
    this.formFields = {
      dateStart: {
        label: 'Fecha Inicio',
        value: moment(
          this.dateString.getFullYear() +
            '-' +
            (this.dateString.getMonth() + 1).toString() +
            '-' +
            this.dateString.getDate()
        ),
      },
      timeStart: {
        label: 'Hora Inicio',
        value: moment('00:00', 'HHmm'),
      },
      dateEnd: {
        label: 'Fecha Fin',
        value: moment(
          this.dateString.getFullYear() +
            '-' +
            (this.dateString.getMonth() + 1).toString() +
            '-' +
            this.dateString.getDate()
        ),
      },
      timeEnd: {
        label: 'Hora Fin',
        value: moment('23:59', 'HHmm'),
      },
    };
  }

  onCellValueChanged({ data, oldValue, newValue }: CellValueChangedEvent) {
    //if (oldValue !== newValue) this.onChangeGrid(data, newValue);
  }

  mounted() {}

  filter_pareo() {
    var newDate = this.formFields.dateEnd.value.clone();
    newDate = newDate.subtract(3, 'months');

    if (newDate.isAfter(this.formFields.dateStart.value)) {
      this.$snotify.error('Supera el máximo de búsqueda (3 meses)');
      return;
    }
    this.get_pareo();
  }

  async get_pareo() {
    this.loadingService.showLoading();
    const date_start = moment(this.formFields.dateStart.value.toString())
      .format('YYYY-MM-DD')
      .toString();
    const time_start =
      moment(this.formFields.timeStart.value.toString())
        .format('HH:mm')
        .toString() + ':00';
    const date_end = moment(this.formFields.dateEnd.value.toString())
      .format('YYYY-MM-DD')
      .toString();
    const time_end =
      moment(this.formFields.timeEnd.value.toString())
        .format('HH:mm')
        .toString() + ':00';

    let params = {
      fechaDesde: date_start + ' ' + time_start,
      fechaHasta: date_end + ' ' + time_end,
      clienteId: this.getClientID().toString(),
    };
    var postCarga = await this.postRamplaTracto(params).then((x: any) => {
      if (x.data.CODIGO_RESPUESTA == '1') {
        this.gridApi.setRowData(x.data.data);
      } else {
        this.$snotify.error(x.data.MENSAJE_RESPUESTA);
      }
    });
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDomLayout('autoHeight');
    this.loadingService.hideLoading();
  }

  getUserID(): number {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return parseInt(id);
  }

  postRamplaTracto(params: any) {
    let path = 'rampla_ela/get_all_pareo';
    var r = fetchDashboard(params, path);
    return r;
  }

  editCell(params: any) {
    if (params.data.est_cosechadora != 1) {
      return true;
    } else {
      return false;
    }
  }

  formatSemaforo(params: ValueFormatterParams) {
    return params.data.nom_estado.toLowerCase() == 'pareo activo'
      ? `<div style="display: flex;"> <i class="material-icons" title="${params.data.nom_estado}" style="width: 24px; height: 24px;margin-top: 6%;  border-radius: 50%; background: rgb(38 151 57 / 60%)"></i><a class="colora" style="margin-left:4%; color:black ";">${params.data.nom_estado}</a></div>`
      : params.data.nom_estado.toLowerCase() == 'pareo terminado'
      ? `<div style="display: flex;"><i class="material-icons" title="${params.data.nom_estado}" style="width: 24px; height: 24px;margin-top: 6%;  border-radius: 50%; background: rgba(26, 66, 138, 0.8)"></i><a class="colora" style="margin-left:4%; color:black;">${params.data.nom_estado}</a></div>`
      : `<div style="display: flex;"> <i class="material-icons" title="${params.data.nom_estado}" style="width: 24px; height: 24px;margin-top: 6%;  border-radius: 50%; background: rgba(121, 121, 121, 0.4)"></i><a class="colora" style="margin-left:4%; color:black;">${params.data.nom_estado}</a></div>`;
  }

  formatLista(params: ValueFormatterParams) {
    if (params.data.est_cosechadora != 1) {
      return `<div style="display: flex;">${
        params.value != null ? params.value : ''
      }
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
    } else {
      return '';
    }
  }

  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.search);
  }

  fetchRamplas(): [] {
    let path = 'rampla/fetch_all';
    let body = { clienteId: this.clienteId };
    var r = fetchDashboard(body, path)
      .then((x: any) => {
        this.ramplas = x.data.data;
        this.gridOptions.columnDefs.forEach((c: any) => {
          var aux: any = [];
          if (this.ramplas.length > 0) {
            if (c.headerName == 'tractopareoNombre') {
              this.ramplas.forEach((x: any, index: number) => {
                x.tractodisponible.map(({ patente }: any) => aux.push(patente));
              });
            }
          }
        });
      })
      .catch();
    {
      console.log('error');
      return [];
    }
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    this.deleteMasivo = false;

    this.eliminarItem;
  }

  async eliminarItem() {
    //codigo para delete
  }

  exportar() {}

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
}
</script>

<style scoped>
.colora {
  color: rgba(0, 0, 0, 0.87) rtant;
}
#gridComponent {
  width: 100%;
  height: 100% !important;
  font-family: 'Asap', sans-serif;
}
#gridContainer {
  -height: 62vh !important;
  -background: green;
}
</style>

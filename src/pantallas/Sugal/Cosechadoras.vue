<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Cosechadoras</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs12 sm6 md2>
        <v-menu
          :close-on-content-click="false"
          v-model="menuDatePickerFechaD"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="computedDateFormattedFechaD"
            label="Fecha Inicio"
            persistent-hint
            prepend-icon="event"
            v-validate="''"
            :error-messages="errors.collect('fechaDesde')"
            data-vv-name="fechaDesde"
            readonly
          ></v-text-field>
          <v-date-picker
            v-model="filtroGrillaFechaD"
            first-day-of-week="1"
            locale="es-cl"
            scrollable
            :min_x="minDate"
            @input="menuDatePickerFechaD = false"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu
          ref="horainicio"
          :close-on-content-click="false"
          v-model="menu1"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="time1"
            label="Hora Inicio"
            prepend-icon="alarm"
            @change="$refs.horainicio.save(time1)"
          ></v-text-field>
          <v-time-picker
            v-if="menu1"
            v-model="time1"
            full-width
            locale="es-cl"
            @click:minute="$refs.horainicio.save(time1)"
          ></v-time-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu
          :close-on-content-click="false"
          v-model="menuDatePickerFechaH"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="computedDateFormattedFechaH"
            label="Fecha Fin"
            persistent-hint
            prepend-icon="event"
            v-validate="''"
            :error-messages="errors.collect('fechaHasta')"
            data-vv-name="fechaHasta"
            @change="$refs.horainicio.save(time1)"
            readonly
          ></v-text-field>
          <v-date-picker
            v-model="filtroGrillaFechaH"
            first-day-of-week="1"
            locale="es-cl"
            scrollable
            :max_x="maxDate"
            @input="menuDatePickerFechaH = false"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu
          ref="horafin"
          :close-on-content-click="false"
          v-model="menu2"
          :nudge-right="40"
          :return-value.sync="time2"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="time2"
            label="Hora Fin"
            prepend-icon="alarm"
            @change="$refs.horafin.save(time2)"
          ></v-text-field>
          <v-time-picker
            v-model="time2"
            full-width
            locale="es-cl"
            @click:minute="$refs.horafin.save(time2)"
          ></v-time-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <div align="left">
          <v-text-field
            v-model="search"
            label="Buscar..."
            single-line
            hide-details
            @input="onFilterTextBoxChanged"
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <div class="text-xs-center">
          <v-btn flat icon small @click="findbyFecha">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small :disabled="btnDisabled" @click="clearFilters">
            <v-icon>clear</v-icon>
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md1></v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex md12>
        <MantenedorGrid
          :grid-options="gridOptions"
          :row-data="maquinasFilter"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowSelectedEvent,
  CellValueChangedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import store from '@/store';
import config from '@/config/index';
import { LoadingService } from '@/services/loadingService';
const { AgGridVue } = require('ag-grid-vue');
import { fetchEstadoCargas } from './fetchEstadoCargas';
import { fetchListaEstadoCosechadorasV2 } from './fetchListaEstadoCosechadorasV2';
import { postActualizaEstadoCosechadora } from './postActualizaEstadoCosechadora';
import { fetchCausasInhabilitacion } from './fetchCausasInhabilitacion';

@Component({
  components: {
    MantenedorGrid,
    AgGridVue,
  },
})
export default class Cosechadoras extends Vue {
  lstCausas: any = {};
  lstCausasCompleta: any = {};

  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  serverSide: any;
  dformat: any = '';

  search: string = '';
  $snotify: any;

  //FILTROS AUDITORIA
  filtroGrillaFechaD = moment(new Date())
    .toISOString()
    .substr(0, 10);
  filtroGrillaFechaH: any = new Date().toISOString().substr(0, 10);
  menuDatePickerFechaD: boolean = false;
  menuDatePickerFechaH: boolean = false;
  time1: any = moment()
    .utc()
    .hour(0)
    .minute(0)
    .toISOString()
    .substr(11, 5);
  time2: any = moment()
    .utc()
    .hour(23)
    .minute(59)
    .toISOString()
    .substr(11, 5);
  menu1: boolean = false;
  menu2: boolean = false;
  btnDisabled: boolean = false;
  maquinas: any = null;
  maquinasFilter: any = null;
  loadingService = new LoadingService();

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Pds',
        field: 'pds',
        width: 200,
        minWidth: 80,
        filter: false,
        resizable: true,
        pinned: 'left',
        rowDrag: false,
      },
      {
        headerName: 'Marca',
        field: 'marca',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
      },
      {
        headerName: 'Cosechadora',
        field: 'patente',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
      },
      {
        headerName: 'Activo',
        field: 'est_cosechadoraSN',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Fundo Origen',
        field: 'nomsitiocliente',
        cellEditor: 'agRichSelectCellEditor',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Vel. Actual',
        field: 'velocidad',
        type: 'valueColumn',
      },
      {
        headerName: 'Duración hh:mm:ss',
        field: 'nro_tiempo_hms',
        cellEditor: 'agRichSelectCellEditor',
        sort: 'desc',
      },
      {
        headerName: 'Fecha-Hora Inicio',
        field: 'fec_hora_inicio',
        valueFormatter: this.dateTimeFormatter,
      },
      {
        headerName: 'Fecha-Hora Término',
        field: 'fec_hora_fin',
        valueFormatter: this.dateTimeFormatter,
      },
      {
        headerName: 'Causa',
        field: 'nom_causa',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        width: 200,
        minWidth: 200,
        cellRenderer: this.formatLista,
        cellEditorParams: {
          values: [],
        },
        singleClickEdit: true,
      },
    ],

    onGridReady: this.handleGridReady,
    onCellValueChanged: this.onCellValueChanged,
    singleClickEdit: true,
  };

  constructor() {
    super();
  }
  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
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

  editCell(params: any) {
    if (params.data.est_cosechadora != 1) {
      return true;
    } else {
      return false;
    }
  }

  onCellValueChanged({ colDef, data }: CellValueChangedEvent) {
    let existe = this.lstCausasCompleta.find(
      (x: any) => x.nom_causa == data.nom_causa[0]
    );

    if (existe != null) {
      this.llamarPost(existe.cod_causa, data);
    }
  }

  async getListCausas() {
    var result = await fetchCausasInhabilitacion().then(
      (x: any) => x.data.causas
    );
    this.lstCausas = result.map((x: any) =>
      Object.values({ values: x.nom_causa })
    );
    this.lstCausasCompleta = result;

    this.gridOptions.columnDefs.forEach((c: any) => {
      if (c.headerName == 'Causa') {
        c.cellEditorParams.values = Object.values(this.lstCausas);
      }
    });
  }

  async initialize() {
    await this.getListCausas();
  }

  async findbyFecha() {
    this.gridApi.showLoadingOverlay();
    const format1 = 'YYYY-MM-DD HH:mm';
    let fechaInicio = new Date(this.filtroGrillaFechaD + ' ' + this.time1);
    let fechaFin = new Date(this.filtroGrillaFechaH + ' ' + this.time2);

    let a = moment(fechaInicio).format(format1);
    let b = moment(fechaFin).format(format1);
    this.maquinas = await fetchListaEstadoCosechadorasV2(a, b).then(
      (x: any) => x.data.estadocosechadora
    );
    this.maquinasFilter = this.maquinas;
  }

  async created() {
    const format1 = 'YYYY-MM-DD HH:mm';
    var fechaDesde = new Date().setHours(0, 0);
    var fechaHasta = new Date().setHours(23, 59);

    var dateTime1 = moment(fechaDesde).format(format1);
    var dateTime2 = moment(fechaHasta).format(format1);
    this.maquinas = await fetchListaEstadoCosechadorasV2(
      dateTime1,
      dateTime2
    ).then((x: any) => x.data.estadocosechadora);
    this.maquinasFilter = this.maquinas;
  }

  onRowSelectedAccion(event: RowSelectedEvent) {
    let seleccionado = event.node;
  }
  getRowNodeIdAccion(accionesEditar: any) {
    if (!accionesEditar) {
      return;
    }
    return accionesEditar.id;
  }

  filterDate() {
    let fechaInicio = new Date(this.filtroGrillaFechaD + ' ' + this.time1);
    let fechaFin = new Date(this.filtroGrillaFechaH + ' ' + this.time2);
    let maquinasFiltered: Array<Object> = [];
    this.maquinasFilter = this.maquinas;
    this.maquinasFilter.forEach((x: any) => {
      let fechaCargaInicio = new Date(x.fec_hora_inicio);
      let fechaCargaFin = new Date(x.fec_hora_fin);
      if (fechaInicio <= fechaCargaInicio && fechaFin >= fechaCargaFin) {
        maquinasFiltered.push(x);
      }
    });
    this.maquinasFilter = maquinasFiltered;
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.search);
  }

  createCheckboxCellSubAccion(params: any) {
    var selectList = document.createElement('select');
    selectList.setAttribute('selected', 'selected');

    let eCheck = document.createElement('select');
    eCheck.setAttribute('id', 'btnLSubAccionPrincN' + params.data.id);

    eCheck.innerHTML =
      '<div class="v-input--selection-controls__input"><div class="v-input--selection-controls__ripple"></div><i aria-hidden="true" class="v-icon material-icons theme--light">check_box_outline_blank</i></div>';

    eCheck.addEventListener('click', () => {});
    return selectList;
  }

  async mounted() {
    this.initialize();
  }

  validaNulo(item: any): boolean {
    if (item !== null && item !== undefined) return true;
    else return false;
  }

  llamarPost(cod_causa: any, params: any) {
    let cosechadora = {
      est_cosechadora: params.est_cosechadora,
      cod_causa: cod_causa,
      id_cosechadora: params.id_cosechadora,
      id_usuario: (
        this.$store.state.name +
        ' ' +
        this.$store.state.lastname
      ).toString(),
    };

    var postCoshechadoras = postActualizaEstadoCosechadora(cosechadora).then(
      (x: any) => {
        if (x.data.CODIGO_RESPUESTA == 1) {
          this.$snotify.success('Registro actualizado Exitosamente');
        } else {
          this.$snotify.error('Error al actualizar Registro');
        }
      }
    );
  }
  clearFilters() {
    this.maquinasFilter = this.maquinas;
    this.btnDisabled = true;
    this.search = '';
    this.onFilterTextBoxChanged();
    this.filtroGrillaFechaD = moment(new Date())
      .toISOString()
      .substr(0, 10);
    this.filtroGrillaFechaH = new Date().toISOString().substr(0, 10);
    this.menuDatePickerFechaD = false;
    this.menuDatePickerFechaH = false;
    this.time1 = moment()
      .utc()
      .hour(0)
      .minute(0)
      .toISOString()
      .substr(11, 5);
    this.time2 = moment()
      .utc()
      .hour(23)
      .minute(59)
      .toISOString()
      .substr(11, 5);
    setTimeout(() => {
      this.btnDisabled = false;
    }, 1200);
    this.findbyFecha();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  //Cambia Propiedad de Filtro en Grilla
  //---

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  get computedDateFormattedFechaD() {
    return this.formatDate(this.filtroGrillaFechaD);
  }

  get computedDateFormattedFechaH() {
    return this.formatDate(this.filtroGrillaFechaH);
  }

  get minDate() {
    return this.filtroGrillaFechaD;
  }

  get maxDate() {
    return this.filtroGrillaFechaH;
  }

  dateTimeFormatter(params: any) {
    if (!params.value) return null;
    return moment(params.value).format('DD/MM/YYYY HH:mm');
  }

  formatDate(fecha: String): string {
    if (!fecha) return null;
    const [year, month, day] = fecha.toString().split('-');
    return `${day}/${month}/${year}`;
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>

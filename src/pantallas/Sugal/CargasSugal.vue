<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Cargas</v-tab>
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
          :return-value.sync="time1"
          transition="scale-transition"
          offset-y
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
            @click:minute="$refs.horainicio.save(time1)"
            @blur="horainicio = time1"
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
          :row-data="cargasFilter"
          class="ag-theme-material estilo-grilla"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import store from '@/store';
import config from '@/config/index';

import { LoadingService } from '@/services/loadingService';
import { fetchEstadoCargasV2 } from './fetchEstadoCargasV2';
import { postActualizaMaeCarga } from './postActualizaMaeCarga';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { AgGridVue } from 'ag-grid-vue';
@Component({
  components: {
    MantenedorGrid,
    AgGridVue,
  },
})
export default class CargasSugal extends Vue {
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  search: string = '';
  $snotify: any;

  //FILTROS
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
  cargas: any = null;
  cargasFilter: any = null;
  loadingService = new LoadingService();

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Patente',
        field: 'patente',
      },
      {
        headerName: 'Cosechadora (Tiempo Operación)',
        field: 'patente_cosechadora',
        editable: this.editCellGeneric,
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: this.formatListaGeneric,

        cellEditorParams: (x: any) => {
          if (x.data != null) {
            var cosechadoras = x.data.lista_cosechadora;
            var patentes = cosechadoras.map(
              (x: any) => x.patente + ' (' + x.tiempo_operacion + ')'
            );
            return {
              values: patentes,
            };
          } else {
            return { values: [] };
          }
        },
      },
      {
        headerName: 'Fundo Origen',
        field: 'nomsitiocliente',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Estado Carga',
        field: 'nom_estado_carga',
        editable: this.editCellGeneric,
        cellRenderer: this.formaListaEstadoCarga,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values: ['Positiva', 'Negativa'],
        },
      },
      {
        headerName: 'Fecha-Hora Inicio',
        field: 'fec_hora_entrada',
        valueFormatter: this.dateTimeFormatter,
      },
      {
        headerName: 'Fecha-Hora Término',
        field: 'fec_hora_salida',
        valueFormatter: this.dateTimeFormatter,
      },
      {
        headerName: 'Tiempo en Fundo',
        field: 'tiempo_fundo',
      },
      {
        headerName: 'Planta Destino',
        field: 'nom_planta',
        editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: this.formatLista,
        cellEditorParams: {
          values: [],
        },
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
    this.columnApi = event.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onCellValueChanged({ data, oldValue, newValue }: CellValueChangedEvent) {
    if (oldValue !== newValue) this.onChangeGrid(data);
  }
  async findbyFecha() {
    this.gridApi.showLoadingOverlay();
    const format1 = 'YYYY-MM-DD HH:mm';
    let fechaInicio = new Date(this.filtroGrillaFechaD + ' ' + this.time1);
    let fechaFin = new Date(this.filtroGrillaFechaH + ' ' + this.time2);

    let a = moment(fechaInicio).format(format1);
    let b = moment(fechaFin).format(format1);

    try {
      this.cargas = await fetchEstadoCargasV2(a, b).then(
        (x: any) => x.data.cargas
      );
      this.cargasFilter = this.cargas;
      this.gridOptions.columnDefs.forEach((c: any) => {
        var aux: any = [];
        if (this.cargas.length > 0) {
          if (c.headerName == 'Cosechadora') {
            this.cargas.forEach((x: any, index: number) => {
              x.lista_cosechadora.map(({ patente }: any) => aux.push(patente));
            });
          } else if (c.headerName == 'Planta Destino') {
            c.cellEditorParams.values = this.cargas[0].lista_plantas.map(
              ({ nom_planta }: any) => nom_planta
            );
          }
        }
      });
    } catch {
      this.gridApi.hideOverlay();
    } finally {
      this.gridApi.hideOverlay();
    }
  }

  onChangeGrid(data: any) {
    this.updateCarga(data);
  }

  async updateCarga(data: any) {
    this.gridApi.refreshCells({ force: true });
    let est_carga = data.nom_estado_carga === 'Positiva' ? 1 : 2;
    let planta = data.lista_plantas.find(
      (x: any) => x.nom_planta === data.nom_planta
    );
    var patenteSplit = data.patente_cosechadora.split(' ');
    let cosechadora = data.lista_cosechadora.find(
      (x: any) => x.patente === patenteSplit[0]
    );
    let params = {
      cod_planta: planta.cod_planta,
      est_carga: est_carga,
      cod_cosechadora: cosechadora.cod_cosechadora,
      id_carga: data.id_carga,
      id_usuario: (
        this.$store.state.name +
        ' ' +
        this.$store.state.lastname
      ).toString(),
    };
    var postCarga = await postActualizaMaeCarga(params).then((x: any) => {
      if (x.data.CODIGO_RESPUESTA == 1) {
        this.$snotify.success('Registro actualizado Exitosamente');
      } else {
        this.$snotify.error('Error al actualizar Registro');
      }
    });
  }

  formatLista(params: ValueFormatterParams) {
    return `<div style="display: flex;">${
      params.value != null ? params.value : ''
    }
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
  }
  formatListaGeneric(params: ValueFormatterParams) {
    if (params.data.nom_planta != null) {
      var salida = '';
      if (params.value == null || params.value == '') {
        salida = '';
      } else {
        params.data.lista_cosechadora.forEach((x: any) => {
          let patenteSplit = params.value.split(' ');
          if (patenteSplit.length > 1) {
            if (x.patente == patenteSplit[0]) {
              salida = x.patente + ' (' + x.tiempo_operacion + ')';
            }
          } else {
            if (x.patente == params.value) {
              salida = x.patente + ' (' + x.tiempo_operacion + ')';
            }
          }
        });
      }
      return `<div style="display: flex;">${salida}
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
    } else {
      return params.value;
    }
  }
  formaListaEstadoCarga(params: ValueFormatterParams) {
    if (params.data.nom_planta != null) {
      return `<div style="display: flex;">${
        params.value != null ? params.value : ''
      }
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
    } else {
      return params.value;
    }
  }

  editCellGeneric(params: any) {
    if (params.data.nom_planta != null) {
      return true;
    } else {
      return false;
    }
  }

  async created() {
    const format1 = 'YYYY-MM-DD HH:mm';
    var fechaDesde = new Date().setHours(0, 0);
    var fechaHasta = new Date().setHours(23, 59);

    var dateTime1 = moment(fechaDesde).format(format1);
    var dateTime2 = moment(fechaHasta).format(format1);

    this.cargas = await fetchEstadoCargasV2(dateTime1, dateTime2).then(
      (x: any) => x.data.cargas
    );
    /* para poner una planta destino por defecto
    this.cargas.forEach((c: any) => {
      if (c.nom_planta == null) {
        c.nom_planta = c.lista_plantas[0].nom_planta;
      }
    });
    */
    this.cargasFilter = this.cargas;
    this.gridOptions.columnDefs.forEach((c: any) => {
      var aux: any = [];
      if (this.cargas.length > 0) {
        if (c.headerName == 'Cosechadora') {
          this.cargas.forEach((x: any, index: number) => {
            x.lista_cosechadora.map(({ patente }: any) => aux.push(patente));
          });
        } else if (c.headerName == 'Planta Destino') {
          c.cellEditorParams.values = this.cargas[0].lista_plantas.map(
            ({ nom_planta }: any) => nom_planta
          );
        }
      }
    });
  }

  filterDate() {
    let fechaInicio = new Date(this.filtroGrillaFechaD + ' ' + this.time1);
    let fechaFin = new Date(this.filtroGrillaFechaH + ' ' + this.time2);
    let cargasFiltered: Array<Object> = [];
    this.cargasFilter = this.cargas;
    this.cargasFilter.forEach((x: any) => {
      let fechaCargaInicio = new Date(x.fec_hora_entrada);
      let fechaCargaFin = new Date(x.fec_hora_salida);
      if (fechaCargaFin >= fechaInicio && fechaCargaFin <= fechaFin) {
        cargasFiltered.push(x);
      }
    });
    this.cargasFilter = cargasFiltered;
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.search);
  }

  clearFilters() {
    this.cargasFilter = this.cargas;
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

  formatDate(fecha: String): string {
    if (!fecha) return null;
    const [year, month, day] = fecha.toString().split('-');
    return `${day}/${month}/${year}`;
  }

  dateTimeFormatter(data: any) {
    if (!data.value) return null;
    return moment(data.value).format('DD/MM/YYYY HH:mm');
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>

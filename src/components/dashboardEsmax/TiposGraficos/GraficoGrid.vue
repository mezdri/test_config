<template>
  <div>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs6 sm6 md6>
        <div align="left">
          <v-text-field
            v-model="buscarGrid"
            label="Buscar..."
            @input="onFilterTextBoxChangedGrid"
          ></v-text-field>
        </div>
      </v-flex>
      <template>
        <ExportarButton @click="exportar()" />
      </template>
    </v-layout>
    <v-divider></v-divider>
    <ag-grid-vue
      style="width: 100%; height: 400px; font-family: 'Asap', sans-serif"
      :pagination="true"
      paginationPageSize="10"
      class="ag-theme-material"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :onGridReady="onGridReadys"
      rowSelection="multiple"
    ></ag-grid-vue>
    <!-- @row-selected="onRowSelected"
      @grid-ready="onGridReady" -->
    <div v-show="!show" class="ma-3">
      Sin Data ...
    </div>
  </div>
</template>

<script lang="ts">
import { Bar } from 'vue-chartjs';
import Chart from 'vue-chartjs';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AgGridVue } from 'ag-grid-vue';
import { ExcelExportParams, GridApi, GridReadyEvent } from 'ag-grid-community';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import moment from 'moment';
import 'moment/locale/es';
import ExportarButton from '../../../reusable/Grid/ExportarButton.vue';

@Component({
  components: {
    barComp: Bar,
    AgGridVue,
    ExportarButton,
  },
})
export default class GraficoGrid extends Vue {
  @Prop({ default: [] }) dataInicial!: any;
  showGrafico: boolean = false;
  rowData: any[] = [];
  columnDefs: any[] = [];
  show = false;
  buscarGrid: string = '';
  gridApi: GridApi;
  dateName: string = moment().format('MM-D HH.mm');
  accionExportar: PermisoAccion = {
    accionCodigo: 103,
    visible: true,
  };
  ortographyDict: any = {
    ULTIMA: 'ÚLTIMA',
    VEHICULO: 'VEHÍCULO',
    DETENCION: 'DETENCIÓN',
    UBICACION: 'UBICACIÓN',
  };

  mounted() {
    if (this.dataInicial.total_registros) {
      this.show = true;
      this.showGrafico = true;
      let labels = Object.keys(this.dataInicial.data[0]);
      labels.forEach(element => {
        let header = element.replace('_', ' ').toUpperCase();
        this.columnDefs = [
          ...this.columnDefs,
          {
            headerName: this.valideText(header),
            field: element,
            sortable: true,
            resizable: true,
          },
        ];
      });
      this.rowData = this.dataInicial.data;
    } else {
      this.show = false;
    }
  }
  valideText(text: string): string {
    let returnText: string = '';
    let array: string[] = text.split(' ');
    for (let word of array) {
      returnText += this.ortographyDict[word]
        ? this.ortographyDict[word]
        : word;
      returnText += ' ';
    }
    return returnText;
  }
  onFilterTextBoxChangedGrid() {
    this.gridApi.setQuickFilter(this.buscarGrid);
  }
  onGridReadys(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  exportar() {
    this.gridApi.exportDataAsExcel();
  }
}
</script>

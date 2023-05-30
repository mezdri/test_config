<template>
  <v-container v-show="show">
    <v-layout row wrap class="mb-4">
      <div align="left">
        <v-flex md12>
          <h2 class="h2_title">Resumen de asignaciones</h2>
        </v-flex>
      </div>
    </v-layout>
    <v-divider></v-divider>
    <ag-grid-vue
      style="width: 100%; height: 400px; font-family: 'Asap', sans-serif"
      class="ag-theme-material"
      :columnDefs="columnDefs"
      :rowData="rowData"
      rowSelection="multiple"
      :suppressRowClickSelection="true"
    ></ag-grid-vue>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { AgGridVue } from 'ag-grid-vue';
import { asociacionEventBus } from '@/setup';

@Component({
  components: {
    AgGridVue,
  },
})
export default class GridResumen extends Vue {
  columnDefs: any[] = [];
  show: boolean = false;
  rowData: any[] = [];
  showData: any[] = [];
  rowSelection: any[] = [];
  rows: any[] = [
    {
      rut_transportista: '903200006',
      nom_transportista: 'COMPAÑIA ELECTRO METALURGICA S.A.',
      cod_grupovehiculo: '2654323',
      plataforma: 'NAVMAN',
      cod_flota: '-1',
      cod_vehiculo: '-1',
      id: '27',
      flota: 'TODAS',
      grupo: 'ELECMETAL',
      vehiculo: 'TODOS',
    },
  ];
  mounted() {
    this.columnDefs = [
      {
        headerName: 'Check',
        field: 'check',
        minWidth: 180,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      { field: 'patente' },
      { field: 'grupo' },
      { field: 'flota' },
      { field: 'transportista' },
    ];
    this.getRowData();
    asociacionEventBus.$on(
      'asignacionVehiculoTransportista',
      (selecciones: any) => {
        selecciones.map((seleccion: any) => {
          this.rowData = [...this.rowData, seleccion];
        });
      }
    );
  }

  getRowData() {
    this.rows.map(row => {
      let auxRow = {
        patente: row.vehiculo, // ! hay que obtener la patente de alguna forma
        grupo: row.grupo,
        flota: row.flota,
        transportista: row.nom_transportista,
      };
      this.rowData = [...this.rowData, auxRow];
    });
    console.log(this.rowData);
  }
}
</script>

<template>
  <v-container v-show="show">
    <div class="mx-3">
      <v-text-field
        @input="onFilterTextBoxChanged"
        v-model="search"
        append-icon="search"
        label="Buscar patente..."
        single-line
        hide-details
      ></v-text-field>
    </div>
    <v-divider></v-divider>
    <ag-grid-vue
      style="width: auto; height: 200px"
      class="ag-theme-material"
      :columnDefs="columnDefs"
      :rowData="rowData"
      rowSelection="multiple"
      @row-selected="onRowSelected"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
    <!-- :suppressRowClickSelection="true" -->
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AgGridVue } from 'ag-grid-vue';
import { asociacionEventBus } from '@/setup';

import {
  fetchVehiculos,
  Vehiculo,
} from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
@Component({
  components: {
    AgGridVue,
  },
})
export default class GridSeleccion extends Vue {
  show = false;
  gridApi: any = null;
  columnApi: any = null;
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  plataforma: number = null;
  columnDefs: any[] = [];
  rowData: any[] = [];
  showData: any[] = [];
  rowSelection: any[] = [];
  vehiculos: any[] = [];
  snotify: any;
  elementosSeleccionados: number = null;
  search: string = '';
  intervalo: any; //
  patentes: any = [];

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
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.api;
    console.log(this.gridApi.getSelectedNodes());
  }

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
      { field: 'patente', headerName: 'Patente' },
    ];
    asociacionEventBus.$on(
      'PatenteSeleccion',
      (patente: any, plataformaKey: number) => {
        this.plataforma = plataformaKey;
        if (this.plataforma === 2) this.show = true;
        if (patente) this.rowData = [...this.rowData, { patente: patente }];

        // seleccion
        //   ? this.getVehiculosPlataforma(seleccion, plataformaKey)
        //   : (this.rowData = []);
      }
    );
  }
  async validar() {
    let resultado: any;
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map((node: any) => node.data);
    selectedData.length != 0 ? (resultado = true) : (resultado = false);
    asociacionEventBus.$emit('validacionComponente', resultado);
    return resultado;
  }
  onRowSelected(event: any) {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map((node: any) => node.data);

    asociacionEventBus.$emit(
      'seleccionPlataformaAsignacionVehiculo',
      selectedData,
      this.plataforma
    );
    let valido;
    selectedData.length != 0 ? (valido = true) : (valido = false);
    console.log('se retorna valido', valido);
    asociacionEventBus.$emit('validacionComponente', valido);
  }
  async getVehiculosPlataforma(seleccion: any, plataformaKey: number) {
    this.elementosSeleccionados = seleccion;
    this.vehiculos = [];

    this.rowData = this.vehiculos;
  }

  //   fetchVehiculosFlota(plataforma: number): any {
  //     return new Promise((resolve, reject) => {
  //       this.axiosVehiculo.http
  //         .get('flota/' + plataforma + '/vehiculo/')
  //         .then((res) => {
  //           res.data ? resolve(this.getRowData(res.data)) : reject();
  //         });
  //     });
  //   }

  //   getRowData(vehiculos: any[]) {
  //     let composicion: any = [];
  //     vehiculos.map((rows: any) => {
  //       composicion = [
  //         ...composicion,
  //         {
  //           unidad: rows.unidad,
  //           codigo: rows.id,
  //           imei: rows.imei,
  //           estado: rows.estado,
  //           patente: rows.patente,
  //         },
  //       ];
  //     });
  //     return composicion;
  //   }
  onFilterTextBoxChanged() {
    if (this.search === null) this.search = '';
    this.gridApi.setQuickFilter(this.search.length > 1 ? this.search : '');
  }
}
</script>

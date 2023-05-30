<template>
  <div>
    <v-card style="width: 100%; margin-top: 1% ">
      <GridComponent
        id="gridComponent"
        ref="gridComponent"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></GridComponent>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue';
import MedioAmbienteInstance from '@/pantallas/MedioAmbiente/comunes/Instances';
import config from '@/config/index';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Funcionalidades } from '@/config/funcionalidades';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { HuellaCarbonoService } from '@/pantallas/MedioAmbiente/HuellaCarbono/HuellaCarbonoService';

@Component({
  name: 'Datatables',
  components: {
    GridComponent: AgGridVue,
  },
})
export default class Datatables extends Vue {
  @Prop({ default: [] }) headers!: any[];
  @Prop({ default: [] }) dataTable!: any[];
  name: 'Datatables';
  readonly funcionalidad: Funcionalidades = Funcionalidades.MedioAmbiente;
  gridOptions: GridOptions;
  localeText: any = config.agGridTextos;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  serverSide: any;
  columnApi: ColumnApi;
  $notify: any;
  search: string = '';
  huellaCarbonoService = new HuellaCarbonoService();

  readonly lenHeaders = this.headers.length;

  rowsPerPageItems = [
    10,
    25,
    50,
    100,
    { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 },
  ];
  pagination = {
    sortBy: 'marca',
    page: 0,
    rowsPerPage: 25,
    totalItems: this.dataTable.length,
  };

  constructor() {
    super();

    this.gridOptions = {
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 50, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      onGridSizeChanged: event => {
        event.api.sizeColumnsToFit();
      },
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      onGridReady: this.onGridReady,
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      blockLoadDebounceMillis: 350,
      columnTypes: {},
      suppressCsvExport: false,
      suppressExcelExport: true,
    };
  }

  async onGridReady(event: GridReadyEvent) {
    let self = this;
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    let lastColumn: any = this.headers.slice(-1);
    if (lastColumn[0].headerName != 'Acciones')
      this.headers.push(makeAccionesColumnDef(this.funcionalidad));

    this.serverSide = {
      async getRows(params: any): Promise<any> {
        params.request.search = self.search;
        params.request.paginationSize = self.gridOptions.cacheBlockSize;
        var body: any = {};

        body = Object.assign({}, body, params.request);

        const axiosResponse: AxiosResponse<
          MSResponse<any>
        > = await self.huellaCarbonoService.get_data_general(
          localStorage.getItem('clienteDefecto'),
          body
        );
        this.isLoading = false;
        const msResponse: any = axiosResponse.data;
        if (msResponse.CODIGO_RESPUESTA == '1') {
          // self.dataTable = msResponse.data;
          params.successCallback(msResponse.data, msResponse.total);
        }
      },
    };
    MedioAmbienteInstance.$on('onFilterChanged', function(search: string) {
      self.search = search;
      self.gridApi.onFilterChanged();
      self.gridApi.setDomLayout('autoHeight');
    });
    MedioAmbienteInstance.$on('setServerSideDatasource', function() {
      self.search = '';
      self.gridApi.setServerSideDatasource(self.serverSide);
    });
    this.gridOptions.api.setColumnDefs(this.headers);
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.gridApi.setDomLayout('autoHeight');
  }
}
</script>

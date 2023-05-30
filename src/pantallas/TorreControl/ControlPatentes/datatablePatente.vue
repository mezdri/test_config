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
import { LoadingService } from '@/services/loadingService';
import {
  ColDef,
  ColumnApi,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';
import config from '@/config/index';
import { PatentesService } from '@/pantallas/TorreControl/ControlPatentes/patentesService';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';

@Component({
  name: 'Datatables',
  components: {
    GridComponent: AgGridVue,
  },
})
export default class DatatablePatente extends Vue {
  @Prop({ default: [] }) headers!: any[];
  @Prop({ default: [] }) dataTable!: any[];
  loadingService = new LoadingService();
  name: 'Datatables';
  gridOptions: GridOptions;
  patentesServices = new PatentesService();
  localeText: any = config.agGridTextos;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  serverSide: any;
  columnApi: ColumnApi;
  $snotify: any;
  search: string = '';
  widgetFilter: any = 0;
  widgets: { title: string; value: any; key: any }[] = [];

  rowsPerPageItems = [
    10,
    25,
    50,
    100,
    { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 },
  ];
  pagination = {
    sortBy: 'nom_flota',
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
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      onGridReady: this.onGridReady,
      onCellClicked: (event: any) => {
        let data = event.data;
        if (data.patente) {
          this.selectRow(
            `/Torre-Control/dispositivos/${data.avl}/${data.patente}`
          );
        } else {
          this.$snotify.warning('Vehículo sin Patente');
        }
      },
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      blockLoadDebounceMillis: 350,
      columnTypes: {},
      suppressCsvExport: false,
      suppressExcelExport: true,
    };
  }

  async onGridReady(params: GridReadyEvent) {
    var self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.serverSide = {
      async getRows(params: any): Promise<any> {
        params.request.search = self.search;
        params.request.widgetFilter = self.widgetFilter;
        params.request.widgets = self.widgets;
        params.request.paginationSize = self.gridOptions.cacheBlockSize;
        var body: any = {};

        body = Object.assign({}, body, params.request);

        const axiosResponse: AxiosResponse<
          MSResponse<any>
        > = await self.patentesServices.getDataCuadratura(
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
    TorreControlInstance.$off('loadDataCuadratura');
    TorreControlInstance.$off('onFilterChanged');
    TorreControlInstance.$off('setServerSideDatasource');
    TorreControlInstance.$off('filtroWidgets');
    TorreControlInstance.$on('loadDataCuadratura', function() {
      self.gridApi.setServerSideDatasource(self.serverSide);
      self.gridApi.setDomLayout('autoHeight');
    });
    TorreControlInstance.$on('onFilterChanged', function(search: string) {
      self.search = search;
      self.gridApi.onFilterChanged();
      self.gridApi.setDomLayout('autoHeight');
    });
    TorreControlInstance.$on('setServerSideDatasource', function() {
      self.search = '';
      self.gridApi.setServerSideDatasource(self.serverSide);
    });
    TorreControlInstance.$on('filtroWidgets', (tipo: any, listWidgets: any) => {
      self.widgetFilter = tipo;
      self.widgets = listWidgets;
      self.gridApi.onFilterChanged();
      self.gridApi.setDomLayout('autoHeight');
    });
    if (this.headers.length > 2) this.gridApi.setColumnDefs(this.headers);
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.gridApi.setDomLayout('autoHeight');
  }

  selectRow(uri: string) {
    console.log(uri);
    this.$router.push(uri);
  }

  @Watch('headers')
  async watchHeaders() {
    this.gridApi.setColumnDefs(this.headers);
    this.gridApi.refreshHeader();
    this.gridApi.setDomLayout('autoHeight');
  }

  @Watch('dataTable')
  async watchDataTable() {
    this.gridApi.setRowData(this.dataTable);
  }
}
</script>

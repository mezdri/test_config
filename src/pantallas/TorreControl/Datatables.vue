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

@Component({
  name: 'Datatables',
  components: {
    GridComponent: AgGridVue,
  },
})
export default class Datatables extends Vue {
  @Prop({ default: [] }) headers!: any[];
  @Prop({ default: [] }) dataTable!: any[];
  loadingService = new LoadingService();
  patentesServices = new PatentesService();
  name: 'Datatables';
  gridOptions: GridOptions;
  localeText: any = config.agGridTextos;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  serverSide: any;
  columnApi: ColumnApi;
  clientId: any = '';
  responseLink: any;
  $notify: any;
  $snotify: any;

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
    this.clientId = localStorage.getItem('clienteDefecto');
    this.gridOptions = {
      rowSelection: 'single',
      pagination: true,
      paginationPageSize: 50,
      cacheBlockSize: 10000,
      localeText: this.localeText,
      paginationAutoPageSize: false,
      columnDefs: this.columnDefs,
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      onGridReady: this.handleGridReady,
      onSelectionChanged: this.onSelectionChanged,
      suppressCsvExport: false,
      onGridSizeChanged: (event: any) => {
        event.api.sizeColumnsToFit();
      },
    };
  }

  async handleGridReady(event: GridReadyEvent) {
    let _self = this;
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.gridOptions.api.setColumnDefs(this.headers);
    let url = new URL(window.location.href);
    let modulo = url.pathname.split('/')[2];
    TorreControlInstance.$off('dataTable');
    TorreControlInstance.$on('dataTable', function(dataTable: any) {
      _self.loadingService.showLoading();
      _self.gridApi.setRowData(dataTable);
      _self.gridApi.setDomLayout('autoHeight');
      _self.loadingService.hideLoading();
    });
    TorreControlInstance.$off('searchSimple');
    TorreControlInstance.$on('searchSimple', (search: string) => {
      _self.gridApi.setQuickFilter(search);
    });
    TorreControlInstance.$off('exportCsv');
    if (modulo == 'dispositivos') {
      TorreControlInstance.$on('exportCsv', (patente: string) => {
        this.gridOptions.api.exportDataAsCsv({
          suppressQuotes: true,
          columnKeys: [
            'cod_vehiculo',
            '__nom_flota',
            '__desc_grupo_vehiculo',
            'id_dispositivo',
            'tipo_dispositivo',
            'marca',
            'fecha_ult_evento',
            'estado_exp',
          ],
          fileName: `Export_${modulo}_${patente}`,
        });
      });
    } else if (modulo == 'dashboard') {
      TorreControlInstance.$off('exportFlota');
      TorreControlInstance.$on('exportFlota', (search: any) => {
        _self.loadingService.showLoading();
        let body = {
          application: 'TC_INFORME_GENERADO',
          id_cliente: this.clientId,
          headers: this.headers,
          exportOption: true,
          extension: 'excel',
          search: search,
          dataTable: this.dataTable,
        };
        _self.patentesServices
          .exportCuadratura(
            this.clientId,
            JSON.parse(localStorage.getItem('user')).id,
            body
          )
          .then((data: any) => {
            if (data.data.CODIGO_RESPUESTA == '1') {
              this.$snotify.success('Reporte Generado.', {
                timeout: 3000,
              });
              _self.responseLink = data.data;
            } else {
              this.$snotify.error(data.data.MENSAJE_RESPUESTA, {
                timeout: 3000,
              });
              return false;
            }
          })
          .catch((error: any) => {
            console.log(error);
            this.$snotify.error('Ocurrió un error. Intente nuevamente.', {
              timeout: 3000,
            });
          })
          .finally(() => {
            this.loadingService.hideLoading();
            if (_self.responseLink.hasOwnProperty('link')) {
              window.open(_self.responseLink.link, '_blank');
            }
          });
      });
    } else {
      TorreControlInstance.$on('exportCsv', () => {
        this.gridOptions.api.exportDataAsCsv({
          suppressQuotes: true,
          fileName: `Export_${modulo}`,
        });
      });
    }
  }

  async onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows[0].uri) this.$router.push(`${selectedRows[0].uri}`);
  }
}
</script>
<!--Torre-Control/vehiculos/-->

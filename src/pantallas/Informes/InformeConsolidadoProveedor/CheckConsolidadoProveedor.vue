<template>
  <div align="left" style="margin-top: 1%">
    <v-divider></v-divider>
    <v-flex>
      <div style="font-size: 22px; margin-top: 1%">Proveedores</div>
      <v-card style="margin-top: 1%">
        <ag-grid-vue
          class="ag-theme-material estilo-grilla"
          :grid-options="gridOptions"
      /></v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { AgGridVue } from 'ag-grid-vue';
import { fetch as fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import {
  GridOptions,
  ColDef,
  GridReadyEvent,
  SortChangedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  GridApi,
  ColumnApi,
  ModelUpdatedEvent,
  RowDataChangedEvent,
  ValueFormatterParams,
  DisplayedColumnsChangedEvent,
  SelectionChangedEvent,
  RowNode,
} from 'ag-grid-community';

@Component({
  components: {
    FormFieldsContainer,
    'ag-grid-vue': AgGridVue,
  },
})
export default class CheckConsolidadoProveedor extends Vue {
  gridOptions: GridOptions;
  columnDefs: any;
  localeText: any = {};
  gridApi: GridApi;
  columnApi: ColumnApi;
  proveedores: any[] = [];

  constructor() {
    super();
    this.columnDefs = [
      {
        headerName: '',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        autoHeight: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        suppressMenu: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
      },
      {
        headerName: 'id',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Rut',
        field: 'rut',
      },
      {
        headerName: 'Nombre o Razón Social',
        field: 'nombre',
      },
      {
        headerName: 'Giro',
        field: 'giroText',
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 5, //Solución Paginación //Ordenamiento + Selección
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      onSelectionChanged: this.onSelectionChanged,
      //   onRowSelected: this.onSelectionChanged,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      //   onDragStopped: this.onDragStoppedEvent,
      //   onColumnPinned: this.onColumnPinnedEvent,
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.proveedores = (await this.fetchProveedor()) || [];
    this.gridApi.setRowData(this.proveedores);
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    InformeEventBus.$emit(
      'selectionProveedor',
      event.api.getSelectedRows().map((x: any) => {
        return x.id;
      })
    );
  }

  fetchProveedor() {
    return fetchProveedoresGps()
      .catch(error => {
        if (error.response.status != 404) {
          console.log('404 fetchProveedor');
        }
      })
      .finally(() => {});
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }
}
</script>

<style scoped>
.estilo-grilla {
  width: 100%;
  height: 400px;
  font-family: 'Asap', sans-serif;
}
</style>

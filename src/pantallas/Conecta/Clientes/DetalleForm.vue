<template>
  <div class="clientesConectaDetalle">
    <div
      class="gridcard rounded-card"
      style="padding: 2rem; background-color: white;"
    >
      <v-flex sm4 md4>
        <v-text-field
          v-model="search"
          label="Buscar..."
          single-line
          @input="onFilterTextBoxChanged"
        ></v-text-field>
      </v-flex>
      <ag-grid-vue
        style="font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
  </div>
</template>

<script lang="ts">
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
//import FiltrosBusqueda from '@/pantallas/Conecta/Clientes/FiltrosBusquedaDetalle.vue';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  ColGroupDef,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
//import {
//  FormFieldDefMap,
//  emitFormChangeEvent,
//} from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors'; //
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  fetchVehiculos,
  MsResponseData,
} from '@/pantallas/Conecta/Clientes/fetchData';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    //FiltrosBusqueda,
  },
})
export default class DetalleForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ required: false }) detalleSeleccionado: any;
  loadingService = new LoadingService();
  readonly $snotify: Snotify;

  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;

  gridApi: GridApi = null;
  serverSide: any;
  gridOptions: GridOptions;
  columnDefs: Array<ColDef | ColGroupDef> = [];
  columnApi: ColumnApi;
  search: string;

  constructor() {
    super();
    this.columnDefs = [
      {
        headerName: 'Cod Vehículo',
        field: 'cod_vehiculo',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Cod Flota',
        field: 'cod_flota',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'rego',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'SIM',
        field: 'numsim',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Teléfono AVL',
        field: 'telefonoavl',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Desc. Tipo Vehículo',
        field: 'descripcion_tipo_vehiculo',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Desc. Grupo Vehículo',
        field: 'descripcion_grupo_vehiculo',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Ingreso',
        field: 'fecha_ingreso',
        cellStyle: { textAlign: 'left' },
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
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      // onSelectionChanged: this.onSelectionChanged,
      // onRowSelected: this.onSelectionRow,
      // isExternalFilterPresent: this.isExternalFilterPresent,
      // doesExternalFilterPass: this.doesExternalFilterPass, FILTROS!!!!
      blockLoadDebounceMillis: 350,
      //   onDragStopped: this.onDragStoppedEvent,
      //   onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {
        medalColumn: { width: 150, columnGroupShow: 'open', filter: false },
        // fecha: {
        //   cellRenderer: this.fechaFilter,
        //   sortable: true,
        //   resizable: true,
        //   filter: false,
        // },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    const self = this;
    this.loadingService.showLoading();
    this.serverSide = {
      getRows(params: any): void {
        fetchVehiculos(self.search, self.detalleSeleccionado.rut)
          .then((response: any) => {
            if (response.data.length == 0) {
              params.successCallback([{}], 0);
              self.gridApi.showNoRowsOverlay();
            } else {
              params.successCallback(response.data, response.data.length);
              self.gridApi.hideOverlay();
            }
            console.log('data');
            console.log(response.data);
            //self.gridApi.sizeColumnsToFit();
            self.loadingService.hideLoading();
          })
          .catch((error: any) => {})
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
            self.loadingService.hideLoading();
          });
      },
    };
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  @Watch('detalleSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    if (!this.detalleSeleccionado) {
      return;
    }
  }

  clearForm() {
    //this.formFields.rut.value='';
  }

  onFilterTextBoxChanged() {
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }
}
</script>
<style></style>

<template>
  <div class="clientesConecta">
    <v-flex sm12 md12>
      <FormularioFlota @resultadoBusqueda="filtroForm" @clear="clearForm" />
    </v-flex>
    <div class="gridcard rounded-card">
      <!--MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      /-->
    </div>
    <!--VerDetalleModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :detalleSeleccionado="detalleSeleccionado"
    /-->
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FormularioFlota from '@/pantallas/Conecta/CuadraturaFlotas/FormularioFlota.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
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
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors'; //
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
/*import { 
  fetchClientes,
  MsResponseData,
} from '@/pantallas/Conecta/Clientes/fetchData';
import VerDetalleModal from '@/pantallas/Conecta/Clientes/VerDetalleModal.vue';
*/
@Component({
  components: {
    //MantenedorGridSinCodigo,
    FormularioFlota,
    //VerDetalleModal,
  },
})
export default class CuadraturaFlotas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.CuadraturaFlotas;
  loadingService = new LoadingService();

  requestsStart: number = 0;
  detalleSeleccionado: any = null;
  mostrarModalVerDetalle: boolean = false;

  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'RUT',
        field: 'rut',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Razón Social',
        field: 'nombre',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Giro',
        field: 'giro',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estado',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'ID',
        field: 'id',
        cellStyle: { textAlign: 'left' },
      },
    ].map(x => ({
      width: 250,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    //this.buscarClientes('','');
  }
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }
  accionesTotales: PermisoAccion[] = [];

  showLoading() {
    this.requestsStart += 1;
    if (this.requestsStart == 1) {
      this.loadingService.showLoading();
    }
  }
  hideLoading() {
    this.requestsStart -= 1;
    if (this.requestsStart == 0) {
      this.loadingService.hideLoading();
    }
  }

  /*fetchClientes(
    id: string,
    rut: string,
  ) {
    this.showLoading();
    return fetchClientes(
      id,
      rut,
    )
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  async buscarClientes(
    id: string,
    rut: string,
  ) {
    this.MsResponseData =
      (await this.fetchClientes(
        id,
        rut,
      )) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.gridApi.setRowData(this.MsResponseData.data);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }
*/

  filtroForm(filtros: any) {
    //this.buscarClientes('',filtros.rut.value);
  }

  clearForm() {}

  constructor() {
    super();
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

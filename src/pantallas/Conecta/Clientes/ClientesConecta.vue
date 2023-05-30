<template>
  <div class="clientesConecta">
    <v-dialog v-model="showInfoDialog" width="500">
      <v-toolbar dark color="primary">
        <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
          >Aplicaciones {{ infoTypeReport }}</v-toolbar-title
        >
      </v-toolbar>
      <v-card max-height="300" id="bodyDialogInfo">
        <div style="margin-left: 20px;">
          <div v-for="item in infoItems" :key="item.index" class="itemInfoDiv">
            <li>
              <!-- <strong style="margin-right: 7px">{{ item.key }}: </strong> -->
              {{ item.value }}
            </li>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-flex sm12 md12>
      <FiltrosBusqueda @resultadoBusqueda="filtroForm" @clear="clearForm" />
    </v-flex>
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
    <VerDetalleModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :detalleSeleccionado="detalleSeleccionado"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Conecta/Clientes/FiltrosBusqueda.vue';
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
import {
  fetchClientes,
  MsResponseData,
} from '@/pantallas/Conecta/Clientes/fetchData';
import VerDetalleModal from '@/pantallas/Conecta/Clientes/VerDetalleModal.vue';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FiltrosBusqueda,
    VerDetalleModal,
  },
})
export default class ClientesConecta extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.ClientesConecta;
  loadingService = new LoadingService();

  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;
  detalleSeleccionado: any = null;
  mostrarModalVerDetalle: boolean = false;
  infoItems: any[] = [];
  infoTypeReport: string = '';
  showInfoDialog: boolean = false;

  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
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
      {
        headerName: 'Aplicaciones',
        field: 'aplicaciones',
        cellStyle: { textAlign: 'left' },
        type: 'medalColumn',
        tooltipField: 'country',
        cellRenderer: () => {
          return '<i class="material-icons" id="5545" title="Ver Filtros" style="width: 28px; height: 28px; margin-top: 10%" >info_outlined</i>';
        },
        onCellClicked: this.handleClickInfo,
        columnGroupShow: 'closed',
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
    this.buscarClientes('', '');
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

  fetchClientes(id: string, rut: string) {
    this.showLoading();
    return fetchClientes(id, rut)
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

  async buscarClientes(id: string, rut: string) {
    this.MsResponseData = (await this.fetchClientes(id, rut)) || null;
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

  handleClickInfo(event: any) {
    var itemsInfo: any[] = [];
    if (event.value != '' && event.value != undefined && event.value != null) {
      for (var key in event.value) {
        if (event.value.hasOwnProperty(key)) {
          itemsInfo.push({ key: key, value: event.value[key].appname });
        }
      }
    }
    if (itemsInfo.length == 0) {
      itemsInfo.push({ key: 1, value: 'Sin Aplicaciones' });
    }
    this.infoItems = itemsInfo;
    this.infoTypeReport = event.data.nombre_reporte;
    this.showInfoDialog = true;
  }

  filtroForm(filtros: any) {
    this.buscarClientes('', filtros.rut.value);
  }
  handleVerDetalleClick(params: ICellRendererParams) {
    this.detalleSeleccionado = params.data;
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
    this.buscarClientes('', '');
  }
  clearForm() {
    this.buscarClientes('', '');
  }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleVerDetalleClick);
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
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

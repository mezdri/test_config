<template>
  <div class="tarifas">
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
    <v-flex sm12 md12 style="width: 30%;">
      <v-text-field
        v-model="buscarPeaje"
        label="Buscar..."
        @input="onFilterPeajes"
        @keydown="preventEnter"
      ></v-text-field>
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
      :peajeSeleccionado="peajeSeleccionado"
      :verDetalle="verDetalle"
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
  fetchRutas,
  fetchTarifas,
  MsResponseData,
} from '@/pantallas/Peajes/Mantencion/fetchData';
import VerDetalleModal from '@/pantallas/Peajes/Mantencion/VerDetalleModal.vue';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FiltrosBusqueda,
    VerDetalleModal,
  },
})
export default class TarifasPantalla extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.TarifasPeajes;
  loadingService = new LoadingService();

  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;
  detalleSeleccionado: any = null;
  peajeSeleccionado: number = 0;
  mostrarModalVerDetalle: boolean = false;
  infoItems: any[] = [];
  infoTypeReport: string = '';
  showInfoDialog: boolean = false;
  verDetalle: boolean = false;
  buscarPeaje: string = '';

  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id_ruta',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Ruta',
        field: 'nom_ruta',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Ingreso',
        field: 'fec_ingreso',
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Aplicaciones',
      //   field: 'aplicaciones',
      //   cellStyle: { textAlign: 'left' },
      //   type: 'medalColumn',
      //   tooltipField: 'country',
      //   cellRenderer: () => {
      //     return '<i class="material-icons" id="5545" title="Ver Filtros" style="width: 28px; height: 28px; margin-top: 10%" >info_outlined</i>';
      //   },
      //   onCellClicked: this.handleClickInfo,
      //   columnGroupShow: 'closed',
      // },
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
    this.buscarRutas('', '');
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

  fetchRutas(id: string, rut: string) {
    this.showLoading();
    return fetchRutas(id, rut)
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

  async buscarRutas(id: string, rut: string) {
    this.MsResponseData = (await this.fetchRutas(id, rut)) || null;
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

  onFilterPeajes() {
    if (this.buscarPeaje.length > 1) {
      this.gridApi.setQuickFilter(this.buscarPeaje);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  preventEnter(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  filtroForm(filtros: any) {
    this.buscarRutas('', filtros.rut.value);
  }
  handleVerDetalleClick(params: ICellRendererParams) {
    this.verDetalle = true;
    this.detalleSeleccionado = params.data;
    this.detalleSeleccionado = this.detalleSeleccionado.id_ruta;
    this.mostrarModalVerDetalle = true;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.verDetalle = false;
    this.detalleSeleccionado = params.data;
    this.detalleSeleccionado = this.detalleSeleccionado.id_ruta;
    this.mostrarModalVerDetalle = true;
  }

  async buscarTarifas(id: number) {
    this.MsResponseData = (await this.fetchTarifas(id)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.detalleSeleccionado = this.MsResponseData.data;
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

  fetchTarifas(id_peaje: number) {
    this.showLoading();
    return fetchTarifas(id_peaje)
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

  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
    this.buscarRutas('', '');
  }
  clearForm() {
    this.buscarRutas('', '');
  }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditarClick);
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
<style scoped>
::v-deep .gridcard div.parent .v-card {
  display: none !important;
}

::v-deep .ag-root-wrapper-body.ag-layout-normal {
  height: auto !important;
}
</style>

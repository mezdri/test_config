<template>
  <div>
    <v-flex sm12 md12>
      <BuscadorFacturacion
        :listaTipoDocumentos="lstDocumentos"
        :listaEstados="lstEstados"
        @resultadoBusqueda="filtroFacturacion"
        @clear="facturaInicial"
      />
    </v-flex>
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
    <VerFacturaModal
      :show="mostrarModalVer"
      @cerrar="handleCierreModalVer"
      :facturaSeleccionada="facturaSeleccionada"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { AxiosVue } from '@/AxiosVue';

const { AgGridVue } = require('ag-grid-vue');
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
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';
import BuscadorFacturacion from '@/pantallas/Facturacion/BuscadorFacturacion.vue';
// import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';

import { Proveedor } from '@/pantallas/Proveedor/Proveedor'; //borrar
import { Solicitud } from '@/pantallas/Solicitudes/Solicitud';
import {
  fetchFacturaciones,
  Factura,
} from '@/pantallas/Facturacion/fetchFacturaciones';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import VerFacturaModal from '@/pantallas/Facturacion/VerFacturaModal.vue';

import { EstadoEntidad } from '@/config/enums';
import moment from 'moment';
import { ServicioProxy } from '@/config/enums';

import {
  TipoDocumento,
  fetchTipoDocumentos,
} from '@/pantallas/Facturacion/fetchTipoDocumento';
import {
  TipoEstado,
  fetchTipoEstados,
} from '@/pantallas/Facturacion/fetchEstados';

@Component({
  components: {
    Confirmation,
    BuscadorFacturacion,
    CrearButton,
    CabeceraTabla,
    MantenedorGrid,
    VerFacturaModal,
    MantenedorGridSinCodigo,
  },
})
export default class Facturaciones extends ComponenteBase {
  /* ComponenteBase */
  axios: AxiosVue = new AxiosVue(ServicioProxy.Comercial);
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly acciones: Accion[] = [
    'Ver Detalle - Detalle Factura',
    'Consultar',
    'Imprimir',
    'Descargar',
  ];

  readonly funcionalidad: Funcionalidades = Funcionalidades.Facturacion;

  /* state */

  facturaciones: Factura[] = null;
  facturacionesInicio: Factura[] = null;
  facturaSeleccionada: Factura = null;
  mostrarModalVer: boolean = false;
  nombreArchivo: string = '';
  handleErrors: HandleErrors = new HandleErrors();

  lstDocumentos: TipoDocumento[] = [];
  lstEstados: TipoEstado[] = [];

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Tipo de Documento',
        field: 'tipoDocumento',
      },
      {
        headerName: 'Nro. de Documento',
        field: 'folio',
        cellStyle: { textAlign: 'right', 'padding-right': '57px' },
      },
      {
        headerName: 'Fecha de Emisión',
        field: 'fechaEmisionText',
        cellStyle: { textAlign: 'right', 'padding-right': '70px' },
      },
      {
        headerName: 'Condición de Pago',
        field: 'condicionDePago',
      },
      {
        headerName: 'Fecha de Vencimiento',
        field: 'fechaVencimientoText',
        cellStyle: { textAlign: 'right', 'padding-right': '47px' },
      },
      {
        headerName: 'Estado',
        field: 'estado',
      },
    ].map(x => ({
      width: 200,
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

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onDescargar(this.handleDescargarClick);
  }

  /* util */

  fetchFacturaciones(
    tipoDocumento: string,
    numero: string,
    condicionPago: string,
    fechaInicioEmision: string,
    fechaFinEmision: string,
    estado: string
  ) {
    this.loadingService.showLoading();
    return fetchFacturaciones(
      tipoDocumento,
      numero,
      condicionPago,
      fechaInicioEmision,
      fechaFinEmision,
      estado
    )
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async buscarFactura(
    tipoDocumento: string,
    numero: string,
    condicionPago: string,
    fechaInicioEmision: string,
    fechaFinEmision: string,
    estado: string
  ) {
    this.facturaciones =
      (await this.fetchFacturaciones(
        tipoDocumento,
        numero,
        condicionPago,
        fechaInicioEmision,
        fechaFinEmision,
        estado
      )) || [];
    this.gridApi.setRowData(this.facturaciones);
  }

  async facturaInicial() {
    this.facturacionesInicio =
      (await this.fetchFacturaciones(null, null, null, null, null, null)) || [];
    this.gridApi.setRowData(this.facturacionesInicio);
  }

  /* tabla */

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }
  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.getEstados();
    this.getDocumentos();
    //this.buscarFactura('', '', '', '', '', '');
    this.facturaInicial();
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.facturaSeleccionada = params.data;
    this.mostrarModalVer = true;
  }

  async handleDescargarClick(params: ICellRendererParams) {
    let titulo =
      'Detalle' + params.data.tipoDocumento + '' + params.data.folio + '.pdf';
    try {
      this.loadingService.showLoading();
      await this.axios.http
        .get(`Comercial/DescargaPdf/` + params.data.folio, {
          responseType: 'arraybuffer',
        })
        .then(res => {
          var file = new Blob([res.data], { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          var fileLink = document.createElement('a');
          fileLink.href = fileURL;
          fileLink.setAttribute('download', titulo);
          document.body.appendChild(fileLink);

          fileLink.click();
          this.$snotify.success(this.$t('mensajes.mensajesExito.descargar'));
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.handleErrors.showError(error);
            }
          } else {
            this.handleErrors.showError(error);
          }
        });
    } catch (error) {
      this.$snotify.error('Ha ocurrido un error al exportar');
    } finally {
      this.loadingService.hideLoading();
    }

    // return this.axios.http.get(`Comercial/DescargaPdf/` + params.data.numero);
  }

  handleCierreModalVer() {
    this.mostrarModalVer = false;
  }

  filtroFacturacion(filtros: any) {
    let documento = '';
    if (filtros.tipoDocumento.value == '2') {
      documento = 'NotaDeCredito';
    } else if (filtros.tipoDocumento.value == '1') {
      documento = 'Factura';
    } else {
      documento = filtros.tipoDocumento.value;
    }
    'Nota Crédito';
    let fechaInicioEmision = moment(filtros.fechaInicio.value).format('L');
    let fechaFinEmision = moment(filtros.fechaTermino.value).format('L');
    this.buscarFactura(
      documento,
      filtros.nroDcto.value,
      '',
      fechaInicioEmision,
      fechaFinEmision,
      filtros.estado.value
    );
  }

  //Funcion que exporta el blob recibido con el nombre especificado
  exportar(blob: any, fileName: any) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement('a');
    //anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  async getDocumentos() {
    this.lstDocumentos = (await this.cargarDocumentos()) || [];
  }

  cargarDocumentos() {
    this.loadingService.showLoading();
    return fetchTipoDocumentos()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Giros',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async getEstados() {
    this.lstEstados = (await this.cargarEstados()) || [];
  }

  cargarEstados() {
    this.loadingService.showLoading();
    return fetchTipoEstados()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Giros',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
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

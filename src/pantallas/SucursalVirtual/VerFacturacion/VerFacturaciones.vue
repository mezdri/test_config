<template>
  <div class="ver-facturaciones">
    <WidgetUser />
    <v-flex sm12 md12 layout wrap>
      <FiltrosBusqueda
        :listaTipoDocumentos="lstTipoDTE"
        :listaEstados="lstEstados"
        @resultadoBusqueda="filtroFacturacion"
        @clear="facturaInicial"
      />
      <v-flex sm1 md1 v-if="facturaciones != null">
        <div align="right" style="">
          <v-btn flat small color="primary" @click="exportar('csv')">
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar CSV</span>
          </v-btn>
        </div>
      </v-flex>
      <v-flex sm1 md1 v-if="facturaciones != null">
        <div align="right" style="">
          <button color="" @click="pagarServipag()">
            <img
              style="border-radius: 5px;border: 1px solid #77868d;width: 100px;"
              src="../../../assets/servipag2.png"
            />
          </button>
        </div>
      </v-flex>
    </v-flex>
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/SucursalVirtual/VerFacturacion/FiltrosBusqueda.vue';
import showRefs from '@/pantallas/SucursalVirtual/VerFacturacion/showRefs.vue';
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
  dowloadDocs,
  fetchDte,
  Factura,
  MsResponseData,
  parseFactura,
} from '@/pantallas/SucursalVirtual/VerFacturacion/fetchDte';

import {
  TipoDte,
  fetchTipoDte,
} from '@/pantallas/SucursalVirtual/VerFacturacion/fetchTipoDte';

import {
  TipoEstado,
  fetchTipoEstados,
} from '@/pantallas/SucursalVirtual/VerFacturacion/fetchEstados';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import WidgetUser from '@/pantallas/SucursalVirtual/WidgetUser.vue';
import { requestMS } from '@/pantallas/SucursalVirtual/VerFacturacion/requestMS';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FiltrosBusqueda,
    WidgetUser,
    showRefs,
  },
})
export default class VerFacturaciones extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.VerFacturacion;

  lstTipoDTE: TipoDte[] = [];
  lstEstados: TipoEstado[] = [];
  columnApi: any = null;

  MsResponseData: MsResponseData = null;
  facturaciones: Factura[] = null;

  requestsStart: number = 0;

  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nº Documento',
        field: 'folio',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Documento',
        field: 'tipoDte',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Monto sin IVA',
        field: 'montoNeto',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Valor IVA',
        field: 'montoIva',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Monto Total',
        field: 'montoTotal',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Emisión',
        field: 'fechaEmision',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Vencimiento',
        field: 'fechaVencimiento',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado SII',
        field: 'estadoSii',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado Pago',
        field: 'estadoPago',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Referencias',
        cellRendererFramework: showRefs,
        field: 'referencias_link',
      },
      {
        headerName: 'urlDetallePdf',
        headerClass: 'hide hideuri',
        field: 'urlDetallePdf',
        cellStyle: { display: 'none', width: '0px!important' },
        hide: true,
      },
      {
        headerName: 'uri',
        headerClass: 'hide hideuri',
        field: 'uriPdf',
        cellStyle: { display: 'none', width: '0px!important' },
        hide: true,
      },
      {
        headerName: 'referencias',
        headerClass: 'hide hideuri',
        field: 'referencias',
        cellStyle: { display: 'none', width: '0px!important' },
        hide: true,
      },
    ].map(x => ({
      width: 150,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 25,
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
    this.columnApi = event.columnApi;
    this.getEstados();
    this.getTipoDTE();
    this.buscarFactura(
      '',
      '',
      '',
      '',
      '',
      '10',
      localStorage.getItem('clienteDefecto')
    );
    //this.facturaInicial();
  }

  exportar(tipo: string) {
    let header =
      'Nro Documento;Tipo Documento;Monto sin IVA;Valor IVA; Monto Total; Fecha Emisión; Fecha Vencimiento;Estado SII; Estado Pago; Referencias; Url Documento; Url Detalle;\r\n';
    let body = '';
    this.facturaciones.forEach(v => {
      body += v.folio + ';';
      body += v.tipoDte + ';';
      body += v.montoNeto + ';';
      body += v.montoIva + ';';
      body += v.montoTotal + ';';
      body += v.fechaEmision + ';';
      body += v.fechaVencimiento + ';';
      body += v.estadoSii + ';';
      body += v.estadoPago + ';';
      body += JSON.parse(v.referencias).join(' ') + ';';
      body += v.uriPdf + ';';
      body += v.urlDetallePdf + ';\r\n';
    });
    let csvContent = 'data:text/csv;charset=utf-8,' + header + body;
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'documentos.csv');
    link.classList.add('urldownload');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

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

  async facturaInicial() {
    //this.facturacionesInicio =
    //  (await this.fetchDte(null, null, null, null, null, null)) || [];
    //this.gridApi.setRowData(this.facturacionesInicio);
  }

  fetchDte(
    folio: string,
    tipoDTE: string,
    fechaInicioEmision: string,
    fechaFinEmision: string,
    estado: string,
    cantidadRegistros: string,
    clienteDefecto: string
  ) {
    this.showLoading();
    return fetchDte(
      folio,
      tipoDTE,
      fechaInicioEmision,
      fechaFinEmision,
      estado,
      cantidadRegistros,
      clienteDefecto
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

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }

  async buscarFactura(
    folio: string,
    tipoDTE: string,
    fechaInicioEmision: string,
    fechaFinEmision: string,
    estado: string,
    cantidadRegistros: string,
    clienteDefecto: string
  ) {
    this.MsResponseData =
      (await this.fetchDte(
        folio,
        tipoDTE,
        fechaInicioEmision,
        fechaFinEmision,
        estado,
        cantidadRegistros,
        clienteDefecto
      )) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.facturaciones = this.MsResponseData.data.map(parseFactura);
          this.gridApi.setRowData(this.facturaciones);
          this.gridApi.setDomLayout('autoHeight');
          this.autoSizeAll(true);
        } else {
          this.facturaciones = null;
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.facturaciones = null;
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  filtroFacturacion(filtros: any) {
    let documento = '';
    if (filtros.tipoDTE.value == '2') {
      documento = '61';
    } else if (filtros.tipoDTE.value == '1') {
      documento = '33';
    } else {
      documento = filtros.tipoDTE.value;
    }
    let cr = '';
    if (filtros.cantidadRegistros.value == '') {
      cr = '10';
    } else {
      cr = filtros.cantidadRegistros.value;
    }
    'Nota Crédito';
    let fechaInicioEmision = moment(filtros.fechaDesde.value).format('YYYYMM');
    let fechaFinEmision = moment(filtros.fechaHasta.value).format('YYYYMM');
    let clienteDefecto = localStorage.getItem('clienteDefecto');
    this.gridApi.setRowData([]);
    this.buscarFactura(
      filtros.folio.value,
      documento,
      fechaInicioEmision,
      fechaFinEmision,
      filtros.estado.value,
      cr,
      clienteDefecto
    );
  }

  async getTipoDTE() {
    this.lstTipoDTE = (await this.cargarTipoDTE()) || [];
  }

  cargarTipoDTE() {
    this.showLoading();
    return fetchTipoDte()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Giros',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.hideLoading());
  }

  async getEstados() {
    this.lstEstados = (await this.cargarEstados()) || [];
    this.lstEstados.unshift({ id: 0, nombre: 'Todas' });
  }

  cargarEstados() {
    this.showLoading();
    return fetchTipoEstados()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Giros',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.hideLoading());
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  accionVerPdf: PermisoAccion = {
    accionCodigo: 89,
    visible: false,
  };
  accionVerDetalle: PermisoAccion = {
    accionCodigo: 4,
    visible: false,
  };
  accionDescargar: PermisoAccion = {
    accionCodigo: 10,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionVerPdf, this.accionDescargar];

  handleVerDetalleClick(params: ICellRendererParams) {
    if (params.data.urlDetallePdf == '') {
      this.$snotify.error('Documento sin detalle disponible', {
        timeout: 3000,
      });
    } else {
      window.open(params.data.urlDetallePdf, '_blank');
    }
  }
  handleDescargarClick(params: ICellRendererParams) {
    this.showLoading();
    let refs: string[] = [];
    if (params.data.referencias != '') {
      refs = JSON.parse(params.data.referencias);
    }
    dowloadDocs([params.data.uriPdf, params.data.urlDetallePdf].concat(refs))
      .then(response => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          let encodedUri = response.data.zipb64;
          let link = document.createElement('a');
          link.setAttribute('href', 'data:text/plain;base64,' + encodedUri);
          link.setAttribute('download', 'documentos.zip');
          link.classList.add('urldownload');
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          this.$snotify.error('Error: ' + response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar descargar los documentos',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.hideLoading());
  }

  constructor() {
    super();
    actionsEvent.onVerPdf(this.handleVerPdfClick);
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onDescargar(this.handleDescargarClick);
    actionsEvent.onVerReferencia(this.handleVerReferenciaClick);
  }

  async handleVerPdfClick(params: ICellRendererParams) {
    window.open(params.data.uriPdf, '_blank');
  }

  async handleVerReferenciaClick(params: ICellRendererParams) {
    if (params.data.referencias == '') {
      this.$snotify.error('Este documento no contiene referencias', {
        timeout: 3000,
      });
      return false;
    }
    let arrayRefs = JSON.parse(params.data.referencias);
    arrayRefs.forEach((v: string) => {
      window.open(v, '_blank');
    });
  }

  pagarServipag(params: ICellRendererParams) {
    let dataSeleccionada = this.gridApi.getSelectedNodes();
    let lista: any[] = [];
    let that = this;
    dataSeleccionada.forEach(function(v) {
      if (!['33)', '34)', '39)'].includes(v.data.tipoDte.split('(')[1])) {
        that.$snotify.error(
          'Debe seleccionar solo boletas o facturas para pagar.',
          {
            timeout: 3000,
          }
        );
        return false;
      }
      lista.push(v.data);
    });
    console.log(lista);
    lista = lista.map(x => {
      return {
        folio: x.folio,
        monto: x.montoTotal,
        fechaVencimiento: x.fechaVencimiento.replaceAll('-', ''),
      };
    });
    console.log(lista);
    if (lista.length == 0) {
      this.$snotify.error('Debe seleccionar un documento', {
        timeout: 3000,
      });
      return false;
    }

    let body: any = {};
    body.lista = lista;
    body.cliente = JSON.parse(localStorage.getItem('user')).clienteDefecto;
    body.user_id = JSON.parse(localStorage.getItem('user')).id;
    requestMS(body, 'iniciaPago')
      .then((response: any) => {
        console.log(response);
        if (response.data.CODIGO_RESPUESTA == '1') {
          console.log(process.env.VUE_APP_SERVICIO_MS + response.data.url);
          let url = process.env.VUE_APP_SERVICIO_MS + response.data.url;
          window.open(url, '_blank');
        } else {
          that.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        that.$snotify.error('Ocurrió un error. Intente nuevamente.', {
          timeout: 3000,
        });
      })
      .finally(() => {});
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
<style>
.hide {
  display: none !important;
}
/*.ver-facturaciones .ag-body-viewport .ag-pinned-left-cols-container,
.ver-facturaciones .ag-header .ag-pinned-left-header {
  display: none;
}*/
.hideuri {
  width: 0px !important;
}
.ver-facturaciones .estilo-grilla {
  height: auto !important;
  margin-bottom: 50px;
}
.ver-facturaciones div[col-id='checked'] {
  pointer-events: all !important;
}
</style>

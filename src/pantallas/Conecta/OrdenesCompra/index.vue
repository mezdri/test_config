<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Ordenes de Compra</v-tab>
    </v-tabs>
    <v-divider />
    <div class="asignacionNoSeriado">
      <v-card>
        <div
          class="layout row wrap "
          style="padding-right: 0px; padding-left: 10px;"
        >
          <div class="flex xs12 sm6 md3">
            <DatePicker
              locale="es-cl"
              v-model="filtro_inicio_fecha_alta"
              color="primary"
              label="Inicio Período de Fecha Emisión"
              clearable
            ></DatePicker>
          </div>
          <div class="flex xs12 sm6 md3">
            <DatePicker
              locale="es-cl"
              v-model="filtro_fin_fecha_alta"
              color="primary"
              label="Fin Período de Fecha Emisión"
              clearable
            ></DatePicker>
          </div>
          <div class="flex xs12 sm6 md3">
            <v-autocomplete
              label="Estado"
              v-model="filtro_estado"
              item-text="configvalor"
              item-value="configid"
              :items="filter_data.ESTADOS"
              clearable
              prepend-icon="home_repair_service"
            >
            </v-autocomplete>
          </div>

          <div class="flex xs6 sm3 md3">
            <div class="text-sm-center botones-filtros">
              <v-btn @click="applyfilters"
                ><v-icon>search</v-icon>Filtrar</v-btn
              >
            </div>
          </div>
        </div>
        <!-- end primera fila  -->

        <div
          class="layout row wrap "
          style="padding-right: 0px; padding-left: 10px;"
        >
          <div class="flex xs12 sm6 md3">
            <v-autocomplete
              label="Razón Social Proveedor"
              v-model="filtro_proveedor"
              item-text="proveedorrazon"
              item-value="proveedorrut"
              :items="filter_data.PROVEEDOR"
              prepend-icon="home_repair_service"
              clearable
            >
            </v-autocomplete>
          </div>
          <div class="flex xs12 sm6 md3">
            <v-autocomplete
              label="Cuenta Costo"
              v-model="filtro_rut_contable"
              item-text="comprarut_contable"
              item-value="comprarut_contable"
              :items="filter_data.RUT_CONTABLE"
              prepend-icon="home_repair_service"
              clearable
            >
            </v-autocomplete>
          </div>
          <div class="flex xs12 sm6 md3">
            <v-autocomplete
              label="Tipo de Equipo"
              v-model="filtro_equipo"
              item-text="tipoeqname_inet"
              item-value="tipoeqid"
              :items="filter_data.EQUIPOS"
              clearable
              prepend-icon="home_repair_service"
            >
            </v-autocomplete>
          </div>

          <div class="flex xs6 sm3 md3">
            <div class="text-sm-center botones-filtros">
              <v-btn @click="cleanfilters"><v-icon>clear</v-icon>Limpiar</v-btn>
            </div>
          </div>
        </div>
        <!-- end segunda fila  -->

        <div
          class="layout row wrap"
          style="padding-right: 0px; padding-left: 10px;"
        >
          <div class="flex xs12 sm6 md6" align="lef"></div>
          <div class="flex xs12 sm6 md6" align="right">
            <v-btn flat small color="primary" @click="btn_exportar">
              <v-icon class="importExportBtnIcon">cloud_download</v-icon
              >&nbsp;&nbsp;
              <span class="importExportBtnTexto" style="margin-right: 30px;"
                >Exportar csv</span
              >
            </v-btn>

            <v-btn
              class="btn-crear v-btn theme--light"
              @click="handlerbuttonmodal"
            >
              <i
                aria-hidden="true"
                class="v-icon v-icon--left material-icons theme--dark"
                style="color: black;"
                >add_circle_outline</i
              >
              <span>Crear</span>
            </v-btn>
          </div>
        </div>

        <div class="gridcard rounded-card">
          <MantenedorGridSinCodigo
            :grid-options="gridOptions"
            :funcionalidad-id="funcionalidad"
          />
        </div>

        <modalCrearOC
          :show="ModalState"
          :id_orden_compra="oc_seleccionada"
          v-on:modalOrdenCompraEmit="modalOCCallback($event)"
          v-if="ModalState"
        ></modalCrearOC>

        <modalCargarArchivo
          :show="CargaArchivoModalState"
          :id_orden_compra="oc_seleccionada"
          v-on:modalOrdenCompraEmit="modalCargarArchivoCallback($event)"
          v-if="CargaArchivoModalState"
        ></modalCargarArchivo>

        <!--
        <ModalExportarCRM
          :show="ExportarCRMModalState"
          :id_orden_compra="oc_seleccionada"
          v-on:modalOrdenCompraEmit="modalexpCRMCallback($event)"
          v-if="ExportarCRMModalState"
        ></ModalExportarCRM>
        -->
      </v-card>
    </div>

    <!-- INICIO MODAL RESULTADO REPORTE -->
    <div v-if="showReporteGenerado" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Reporte Solicitado</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporte()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <v-flex sm12 md12>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">{{ texto_reporte }}</p>
              </div>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">
                  Puede ver sus reportes en el menú
                  <router-link
                    active-class="router-link-active"
                    style="cursor: pointer; font-size: 13px"
                    to="/conecta-reportes"
                    >Informes</router-link
                  >
                </p>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>
    <!-- FIN MODAL RESULTADO REPORTE -->
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { AxiosVue } from '@/AxiosVue';
import { fetchOrdenesCompra } from './fetchOrdenesCompra';
import modalCrearOC from '@/pantallas/Conecta/OrdenesCompra/modalCrearOC.vue';
import modalCargarArchivo from '@/pantallas/Conecta/OrdenesCompra/modalCargarArchivo.vue';
import ModalExportarCRM from '@/pantallas/Conecta/OrdenesCompra/exportar_a_crm.vue';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { actionsEvent } from '@/setup';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { LoadingService } from '@/services/loadingService';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

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
import { utils, writeFileXLSX } from 'xlsx';
import moment from 'moment';

@Component({
  components: {
    MantenedorGridSinCodigo,
    modalCrearOC,
    modalCargarArchivo,
    ModalExportarCRM,
    DatePicker,
  },
})
export default class GrillaOrdenesCompra extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.OrdenesCompra;

  @Prop({ default: null }) filtro_proveedor: any;
  @Prop({ default: null }) filtro_rut_contable: any;
  @Prop({ default: null }) filtro_equipo: any;
  @Prop({ default: null }) filtro_inicio_fecha_alta: any;
  @Prop({ default: null }) filtro_fin_fecha_alta: any;
  @Prop({ default: null }) filtro_estado: any;

  gridApi: GridApi = null;
  ModalState: boolean = false;
  CargaArchivoModalState: boolean = false;
  ExportarCRMModalState: boolean = false;
  oc_seleccionada: Number = null;
  //po_seleccionada: any = null;
  ordesList: any = [];
  mostrarModal: boolean = false;
  filter_data: any = [];
  loadingService = new LoadingService();
  showReporteGenerado: boolean = false;
  texto_reporte: string = 'TEXTO CUERPO MODAL';

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };

  AccionCargarArchivo: PermisoAccion = {
    accionCodigo: 93,
    visible: false,
  };

  AccionVerDetalle: PermisoAccion = {
    accionCodigo: 47,
    visible: false,
  };

  accionEnviar: PermisoAccion = {
    accionCodigo: 90,
    visible: false,
  };

  accionExportaraCRM: PermisoAccion = {
    accionCodigo: 106,
    visible: false,
  };
  /*
  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };
  */

  /*
  formsFields: {
    fechaDesde: { id: string; label: string; value: any };
    fechaHasta: { id: string; label: string; value: any };
    } = {
    fechaDesde: {
      id: '1110',
      label: 'Desde',
      value: moment(new Date()).add(-7, 'days'),
    },
    fechaHasta: {
      id: '1111',
      label: 'Hasta',
      value: moment(new Date()),
    },
  };
  */
  accionesTotales: PermisoAccion[] = [
    this.AccionCargarArchivo,
    this.accionEditar,
    this.AccionVerDetalle,
    this.accionEnviar,
    this.accionExportaraCRM,
  ];

  constructor() {
    super();
    actionsEvent.onEditar(this.handlerbuttonmodalEDIT);
    actionsEvent.onCargarArchivo(this.callbackCargarArchivo);
    actionsEvent.onCompartir(this.callbackExportar);
    actionsEvent.onEnviar(this.callbackcompartir);
    actionsEvent.onExportaraCRM(this.callbackExportarCRM);
  }

  callbackExportarCRM(params: ICellRendererParams) {
    console.log('callbackExportarCRM');
    this.oc_seleccionada = params.data['Compra Número'];
    //this.ExportarCRMModalState = true;
    return fetchOrdenesCompra(
      {
        id_orden_compra: this.oc_seleccionada,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/get_tipoeqname_from_oc'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('get_tipoeqname_from_oc');
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          console.log(data.data.LISTA);
          let headers = {
            //header: ['Equipo y Periferico','Suma de comprobación de fila','Fecha de modificación','Nombre','Identificador','Razón para el estado','Propiedad Equipo','Propietario','Producto','Serie','Plataforma','Cambio de Batería','Simcard','Fecha Cambio de Batería','Observaciones'],
          };
          const ws = utils.json_to_sheet(data.data.LISTA, headers);
          const wb = utils.book_new();
          utils.book_append_sheet(wb, ws, 'Plantilla');
          writeFileXLSX(wb, 'ExportarCRM.xlsx');
          this.$snotify.success('Plantilla Excel descargada con éxito');
        }
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  callbackcompartir(params: ICellRendererParams) {
    console.log('callbackcompartir');
    const OC = params.data['Compra Número'];
    const exp_pdf = this.exportar_fila_pdf(OC);
    console.log(exp_pdf);
  }

  callbackExportar(params: ICellRendererParams) {
    console.log('callbackExportar');
    const xl = this.get_export_inet(params.data['Compra Número']);
  }

  callbackCargarArchivo(params: ICellRendererParams) {
    this.CargaArchivoModalState = true;
    this.oc_seleccionada = params.data['Compra Número'];
    //this.po_seleccionada = params.data.comprapo;
  }

  modalCargarArchivoCallback(event: any) {
    console.log(event);
    this.CargaArchivoModalState = event;
  }

  modalexpCRMCallback(event: any) {
    console.log(event);
    this.ExportarCRMModalState = event;
  }
  /*
  callbackEliminar(params: ICellRendererParams) {
    console.log('callbackEliminar');
    const OC = params.data.compranumero;
    console.log(OC);
  }
  */

  modalOCCallback(event: any) {
    this.cleanfilters();
    console.log(event);
    this.ModalState = event;
  }

  handlerbuttonmodal() {
    this.oc_seleccionada = null;
    //this.po_seleccionada = null;
    this.ModalState = true;
  }

  handlerbuttonmodalEDIT(params: ICellRendererParams) {
    this.ModalState = true;
    this.oc_seleccionada = params.data['Compra Número'];
    //this.po_seleccionada = params.data.comprapo;
  }

  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Compra Número',
        field: 'Compra Número',
        hide: false,
        resizable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'Descripción',
        hide: false,
        resizable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Emisión',
        field: 'Fecha Emisión',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Llegada',
        field: 'Fecha Llegada',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Cuenta Costo',
        field: 'Cuenta Costo',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut Proveedor',
        field: 'Rut Proveedor',
        hide: false,
        resizable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Razón',
        field: 'Razón',
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Equipo',
        field: 'Tipo Equipo',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Cantidad Solicitada',
        field: 'Cantidad Solicitada',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },

      {
        headerName: 'Precio',
        field: 'Precio',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },

      {
        headerName: 'Cantidad Ingresada',
        field: 'Cantidad Ingresada',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'Estado',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Número Reporte',
        field: 'Número Reporte',
        resizable: true,
        hide: false,
        cellStyle: { textAlign: 'left' },
      },
    ].map(x => ({
      width: 300,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 30,
    onGridReady: this.handleGridReady,
  };

  handleClickInfo(event: any) {
    console.log('handleClickInfo');
  }

  async handleGridReady(event: GridReadyEvent) {
    console.log('handleGridReady');

    this.ordesList = await this.getOrders();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');

    //data para los dropdown de los filtros
    this.filter_data = await this.get_filter_data();

    //precargo los filtros de fecha con un mes de rango
    this.filtro_inicio_fecha_alta = moment(new Date()).subtract(1, 'months');
    this.filtro_fin_fecha_alta = moment(new Date());
  }

  async getOrders() {
    console.log('getOrders full grid');
    this.loadingService.showLoading(undefined, 'getOrders');
    return fetchOrdenesCompra(
      {
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('getOrders');
        return data.data.data.LISTA;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async get_filter_data() {
    console.log('grid filter data');
    this.loadingService.showLoading(undefined, 'get_filter_data');
    return fetchOrdenesCompra(
      { '': '' },
      'conectaOrdenesCompra/get_grilla_filters'
    )
      .then((data: any) => {
        var elements = document.getElementsByClassName('v-list__tile__title');
        Array.from(elements).forEach(function(element) {
          if (element.innerHTML == 'Ver Detalle') {
            element.innerHTML = 'Exportar Excel Inet';
          }
        });

        this.loadingService.hideLoading('get_filter_data');
        return data.data;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async applyfilters() {
    console.log('Apply filters');
    this.loadingService.showLoading(undefined, 'applyfilters');
    return fetchOrdenesCompra(
      {
        filtro_proveedor: this.filtro_proveedor,
        filtro_rut_contable: this.filtro_rut_contable,
        filtro_equipo: this.filtro_equipo,
        filtro_inicio_fecha_alta: this.filtro_inicio_fecha_alta,
        filtro_fin_fecha_alta: this.filtro_fin_fecha_alta,
        filtro_estado: this.filtro_estado,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/get_filtered_oc'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('applyfilters');
        this.ordesList = data.data.data.LISTA;
        this.gridApi.setRowData(this.ordesList);
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async cleanfilters() {
    this.filtro_proveedor = null;
    this.filtro_rut_contable = null;
    this.filtro_equipo = null;
    this.filtro_inicio_fecha_alta = null;
    this.filtro_fin_fecha_alta = null;
    this.filtro_estado = null;
    this.ordesList = await this.getOrders();
    this.gridApi.setRowData(this.ordesList);
  }

  getCliente() {
    /*  TODO VERIFICAR */
    let user = localStorage.getItem('user');
    let clienteDefecto = JSON.parse(
      localStorage.getItem('user').replace(/'/g, '"')
    ).clienteDefecto;
    return clienteDefecto;
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    console.log(id);
    return id;
  }

  async btn_exportar() {
    let body: { [key: string]: string } = {
      filtro_proveedor: this.filtro_proveedor,
      filtro_rut_contable: this.filtro_rut_contable,
      filtro_equipo: this.filtro_equipo,
      filtro_inicio_fecha_alta: this.filtro_inicio_fecha_alta,
      filtro_fin_fecha_alta: this.filtro_fin_fecha_alta,
      filtro_estado: this.filtro_estado,
      extension: 'csv',
      tipo_alerta: 'CONECTA_ORDENES_COMPRA',
    };

    this.loadingService.showLoading(undefined, 'btn_exportar');
    return fetchOrdenesCompra(
      {
        clienteDefecto: this.getCliente(),
        user_id: this.getUserID(),
        body: body,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/exportar'
    )
      .then((data: any) => {
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
        }
        this.loadingService.hideLoading('btn_exportar');
        return data.data;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async get_export_inet(oc: any) {
    let body: { [key: string]: string } = {
      extension: 'xlsx',
      tipo_alerta: 'CONECTA_ORDENES_COMPRA',
      id_orden_compra: oc,
    };

    this.loadingService.showLoading(undefined, 'conecta_exportOC_Inet');
    console.log('getOrders con id ' + oc);
    return fetchOrdenesCompra(
      {
        clienteDefecto: this.getCliente(),
        user_id: this.getUserID(),
        body: body,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conecta_exportOC_Inet'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('conecta_exportOC_Inet');
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
        }
        return data.data.data.LISTA;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async exportar_fila_pdf(oc: any) {
    this.loadingService.showLoading(undefined, 'exportar_fila_pdf');
    let body: { [key: string]: string } = {
      extension: 'pdf',
      tipo_alerta: 'CONECTA_ORDENES_COMPRA',
      orden_compra: oc,
    };
    return fetchOrdenesCompra(
      {
        clienteDefecto: this.getCliente(),
        user_id: this.getUserID(),
        body: body,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/exportar_fila_pdf'
    )
      .then((data: any) => {
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
        }
        this.loadingService.hideLoading('exportar_fila_pdf');
        return data.data;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
  }
}
</script>
<style>
.asignacionNoSeriado .estilo-grilla,
.asignacionNoSeriado #gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}

div.asignacionNoSeriado
  > div
  > div.gridcard.rounded-card
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-body-viewport.ag-row-no-animation.ag-layout-auto-height
  > div.ag-pinned-left-cols-container {
  display: none !important;
}

div.asignacionNoSeriado
  > div
  > div.gridcard.rounded-card
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-header.ag-pivot-off
  > div.ag-pinned-left-header {
  display: none !important;
}
</style>

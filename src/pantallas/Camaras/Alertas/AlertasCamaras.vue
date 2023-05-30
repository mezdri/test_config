<template>
  <div class="vigilanti">
    <div class="layout wrap widgets">
      <v-flex sm12 md12 layout wrap>
        <FiltrosBusqueda
          :listaTiposAlerta="listaTiposAlerta"
          :listaFlotas="listaFlotas"
          :listaGrupos="listaGrupos"
          :listaPatentes="listaPatentes"
          :formFields="formFields"
          @resultadoBusqueda="filtroAlertas"
          @changeFlota="changeFlota"
          @changeGrupo="changeGrupo"
          @clear="AlertaInicial"
        />
      </v-flex>
      <v-flex sm12 md12 layout wrap>
        <v-flex sm1 md1 style="align-self: end;">
          <div align="right" style="padding-top:15px">
            <v-btn
              v-if="accionExportar.visible"
              flat
              small
              color="primary"
              @click="exportar('csv')"
            >
              <v-icon class="importExportBtnIcon">cloud_download</v-icon
              >&nbsp;&nbsp;
              <span class="importExportBtnTexto">Exportar<br />CSV</span>
            </v-btn>
          </div>
        </v-flex>
        <v-flex sm1 md1 style="align-self: end;">
          <div align="right" style="padding-top:15px">
            <v-btn
              v-if="accionExportar.visible"
              flat
              small
              color="primary"
              @click="exportar('xlsx')"
            >
              <v-icon class="importExportBtnIcon">cloud_download</v-icon
              >&nbsp;&nbsp;
              <span class="importExportBtnTexto">Exportar<br />EXCEL</span>
            </v-btn>
          </div>
        </v-flex>
        <v-flex sm1 md1 style="align-self: end;">
          <div align="right" style="padding-top:15px">
            <v-btn
              v-if="accionExportar.visible"
              flat
              small
              color="primary"
              @click="exportar('pdf')"
            >
              <v-icon class="importExportBtnIcon">cloud_download</v-icon
              >&nbsp;&nbsp;
              <span class="importExportBtnTexto">Exportar<br />PDF</span>
            </v-btn>
          </div>
        </v-flex>
      </v-flex>
    </div>
    <WidgetAlerta
      :listaAlertasWidgets="listaAlertasWidgets"
      @filtroWidget="filtroWidget"
    />
    <div class="gridcard rounded-card camaras">
      <v-flex xs12 offset-md10 offset-sm10 sm2 md2 hide>
        <v-text-field
          style="margin-right:5px;"
          v-model="filtrobusquedagrilla"
          @input="searchData"
          label="Buscar..."
        ></v-text-field>
      </v-flex>
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
      <!--GridComponent
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :gridOptions="gridOptions"
      ></GridComponent-->
    </div>
    <VerDetalleAlertaModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :alertaSeleccionado="alertaSeleccionado"
    />

    <div v-if="showEvidencia" class="wrap-evidencia">
      <div id="myModal" class="modalEvidencia">
        <!-- Modal content -->
        <div class="modalEvidencia-content">
          <div class="buttonClose" align="right" style="padding-top:15px">
            <v-btn flat small color="primary" @click="closeImage()">
              <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
              <span class="importExportBtnTexto">Cerrar</span>
            </v-btn>
          </div>
          <div class="wrap-evidencia-img">
            <video
              v-if="
                linkEvidencia
                  .split('.')
                  .pop()
                  .toLowerCase() == 'mp4'
              "
              width="100%"
              controls
              disablepictureinpicture
              controlslist="nodownload noplaybackrate"
              muted
              @load="imageLoaded()"
              @error="imageError()"
              @contextmenu="handlerContexTmenu($event)"
            >
              <source :src="linkEvidencia" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <img
              v-else
              :src="linkEvidencia"
              @load="imageLoaded()"
              @error="imageError()"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEnviarCorreo" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Evidencia por Correo</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeEnvio()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <v-flex sm12 md12>
              <v-text-field
                v-model="correoEvidencia"
                label="Correo"
                single-line
                type="email"
                @blur="validateEmail"
              />
              <span style="font-style: italic;margin: 0 auto;font-size: 12px;"
                >Puede ingresar varios correos separados por punto y coma
                (;)</span
              >
            </v-flex>
            <v-flex sm12 md12>
              <div class="text-sm-center">
                <v-btn
                  flat
                  icon
                  small
                  @click="handleEnviarCorreoClick"
                  style="margin-top: 20px;"
                >
                  <v-icon class="importExportBtnIcon">send</v-icon>&nbsp;&nbsp;
                  Enviar
                </v-btn>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>

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
                    to="/informe-generado-vigilanti"
                    >Informes</router-link
                  >
                </p>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import VerDetalleAlertaModal from '@/pantallas/Camaras/Alertas/VerDetalleAlerta.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alertas/WidgetAlerta.vue';
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
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import showImage from '@/pantallas/Camaras/Alertas/showImage.vue';

import {
  fetchAlertas,
  Alerta,
  AlertaGrilla,
  parseAlerta,
} from '@/pantallas/Camaras/Alertas/fetchAlerta';
import {
  fetchTiposAlerta,
  ConfigTiposAlerta,
} from '@/pantallas/Camaras/Alertas/fetchTipoAlerta';
import {
  fetchFlotas,
  ConfigFlotas,
  ConfigGrupos,
  fetchGrupos,
} from '@/pantallas/Camaras/Alertas/fetchFlota';

import {
  ConfigPatente,
  fetchPatentes,
} from '@/pantallas/Camaras/Alertas/fetchPatentes';

import {
  AlertaWidget,
  fetchAlertasWidgets,
} from '@/pantallas/Camaras/Alertas/fetchWidgets';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import { FormFieldDefMap } from '@/reusable/Form/formUtils';

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    VerDetalleAlertaModal,
    WidgetAlerta,
    showImage,
  },
})
export default class AlertasCamaras extends ComponenteBase {
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.AlertasVigilanti;

  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';

  alertaSeleccionado: AlertaGrilla = null;
  mostrarModalVerDetalle: boolean = false;
  listaTiposAlerta: ConfigTiposAlerta[] = [];
  listaFlotas: ConfigFlotas[] = [];
  listaGrupos: ConfigGrupos[] = [];
  listaPatentes: ConfigPatente[] = [];
  //MsResponseData: MsResponseData = null;
  //MsResponseDataWidget: MsResponseDataWidget = null;

  listaAlertasWidgets: AlertaWidget[] = [];

  alertas: Alerta[] = null;
  alertasGrillas: AlertaGrilla[] = [];
  linkEvidencia: string = '';
  showEvidencia: boolean = false;

  correoEvidencia: string = '';
  showEnviarCorreo: boolean = false;
  rowCorreo: ICellRendererParams = null;

  filtros_total: number = 4;
  filtros_cargados: number = 0;

  widgets_loaded: boolean = false;
  grid_loaded: boolean = false;
  widgetSelected: string = null;
  forcehide: boolean = false;

  pagina: number = 1;
  hashpaginacion: string = '';
  rowcount: number = 0;
  total_registros: number = 0;
  cant_regs_pag: number = 50;

  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  showReporteGenerado: boolean = false;
  texto_reporte: string = '';

  formFields: FormFieldDefMap = {
    tipoAlerta: {
      label: 'Tipo Alerta',
      id: 'tipoAlerta',
      value: '',
    },
    flota: {
      label: 'Flota',
      id: 'flota',
      value: '',
    },
    grupo: {
      label: 'Grupo',
      id: 'grupo',
      value: '',
    },
    patente: {
      label: 'Patente',
      id: 'patente',
      value: '',
    },
    velocidad: {
      label: 'Velocidad Mín.',
      id: 'velocidad',
      value: '0',
    },
    tipoFecha: {
      label: 'Tipo Fecha',
      id: 'tipoFecha',
      value: 'alerta',
      items: [],
    },
    tipoEvidencia: {
      label: 'Tipo de evidencia',
      id: 'tipoEvidencia',
      value: 'ambos',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: moment(this.fechaMaxima),
    },
    horaInicio: {
      label: 'Hora Inicio',
      id: 'horaInicio',
      value: moment('00:00', 'HHmm'),
    },
    fechaFin: {
      label: 'Fecha Fin',
      id: 'fechaFin',
      value: moment(this.fechaMaxima),
    },
    horaFin: {
      label: 'Hora Fin',
      value: moment('23:59', 'HHmm'),
      id: 'horaFin',
    },
    cantidadRegistros: {
      label: 'Cantidad Registros',
      id: 'cantidadRegistros',
      value: this.cant_regs_pag,
    },
  };

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Fecha Alerta',
        field: 'fechaAlarma',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Fecha Ingreso',
        field: 'fechaIngreso',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Patente',
        field: 'patente',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Tipo Alerta',
        field: 'tipoAlerta',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Velocidad',
        field: 'velocidad',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Evidencia',
        field: 'evidencia',
        cellRendererFramework: showImage,
        cellRendererParams: {
          openImage: this.openImage,
        },
        width: 150,
      },
      {
        headerName: 'Mapa',
        field: 'ubicacion',
        cellRenderer: this.linkToMap,
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 130,
      },
      {
        headerName: 'Flota',
        field: 'flota',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 100,
      },
      {
        headerName: 'Grupo',
        field: 'grupo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 100,
      },
      {
        headerName: 'Cod Flota',
        field: 'codFlota',
        resizable: true,
        hide: true,
      },
      {
        headerName: 'Files',
        headerClass: 'hide',
        field: 'files',
        cellStyle: { display: 'none' },
        resizable: true,
        hide: true,
      },
      {
        headerName: 'numActividad',
        headerClass: 'hide',
        field: 'numActividad',
        cellStyle: { display: 'none' },
        resizable: true,
        hide: true,
      },
    ],
    pagination: true,
    paginationPageSize: this.cant_regs_pag,
    cacheBlockSize: this.cant_regs_pag,
    paginationAutoPageSize: false,
    rowModelType: 'serverSide',
    serverSideDatasource: this.serverSide,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    onSelectionChanged: this.onSelectionChanged,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
    onGridSizeChanged: event => {
      //event.api.sizeColumnsToFit();
    },
  };

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    //this.gridApi.rowModel.rowsToDisplay = this.rowcount;
    this.columnApi = event.columnApi;
    this.gridEvent = event;

    let self = this;
    this.serverSide = {
      getRows(event: any): void {
        event.request.paginationSize = self.gridOptions.cacheBlockSize;
        self.pagina = event.request.startRow / self.cant_regs_pag + 1;
        let body: any = self.filtros2body();
        body.pagina = self.pagina;
        body.hashpaginacion = self.hashpaginacion;

        fetchAlertas(body)
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              if (response.data.data.length === 0) {
                self.$snotify.error('Sin registros', { timeout: 3000 });
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                event.successCallback(
                  self.alerta2grid(response.data.data.map(parseAlerta)),
                  response.data.total_registros
                );
                self.hashpaginacion = response.data.hash1;
                self.rowcount =
                  response.data.rowcount === null ? 0 : response.data.rowcount;
                self.total_registros =
                  response.data.total_registros === null
                    ? 0
                    : response.data.total_registros;
                self.cant_regs_pag =
                  response.data.cant_regs_pag === null
                    ? 50
                    : response.data.cant_regs_pag;
                self.gridApi.hideOverlay();
                self.autoSizeAll(true);
              }
            } else {
              event.successCallback([{}], 0);
              self.$snotify.error(response.data.MENSAJE_RESPUESTA, {
                timeout: 3000,
              });
            }
          })
          .catch((error: any) => {
            console.log(error);
            event.successCallback([{}], 0);
            self.$snotify.error('Ocurrió un error. Intente nuevamente.', {
              timeout: 3000,
            });
          })
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
          });
      },
    };
    this.inicia_peticion();
    this.getTiposAlertas();
    this.getFlotas();
    this.getPatentes('', '');
    this.getGrupos('');
    this.filtroAlertas(true);
  }

  filtros2body() {
    let body: any = {};

    let fechaInicio: any;
    let fechaFin: any;
    if (moment.isMoment(this.formFields.fechaInicio.value)) {
      fechaInicio = moment(this.formFields.fechaInicio.value).format('L');
    }
    if (moment.isMoment(this.formFields.fechaFin.value)) {
      fechaFin = moment(this.formFields.fechaFin.value).format('L');
    }
    body.tipo_alerta = this.formFields.tipoAlerta.value;
    body.cod_vehiculo = this.formFields.patente.value;
    body.fecha_inicio = fechaInicio;
    body.hora_inicio = moment(this.formFields.horaInicio.value.toString())
      .format('HH:mm')
      .toString();
    body.hora_fin = moment(this.formFields.horaFin.value.toString())
      .format('HH:mm')
      .toString();
    body.fecha_fin = fechaFin;
    body.tipo_evidencia = this.formFields.tipoEvidencia.value;
    body.cantRegistros = this.formFields.cantidadRegistros.value;
    body.clienteDefecto = localStorage.getItem('clienteDefecto');
    body.flota = this.formFields.flota.value;
    body.velocidad = this.formFields.velocidad.value;
    body.tipoFecha = this.formFields.tipoFecha.value;
    body.grupo = this.formFields.grupo.value;
    body.id_usuario = this.getUserID().toString();

    return body;
  }

  filtroAlertas(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
    if (loadWidget) {
      this.buscarAlertasWidgets();
    }
  }

  async buscarAlertasWidgets() {
    let response: any = (await this.fetchAlertasWidgets()) || null;
    if (response !== null) {
      if (response.data.CODIGO_RESPUESTA == '1') {
        if (response.data.data.length === 0) {
          this.listaAlertasWidgets = [];
        } else {
          this.listaAlertasWidgets = response.data.data;
        }
      } else {
        this.listaAlertasWidgets = [];
        this.$snotify.error(response.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      }
      let list = document.querySelectorAll(
        '.vigilanti .wrapper-widget.disabled'
      );
      for (let i = 0; i < list.length; ++i) {
        list[i].classList.remove('disabled');
      }
    }
  }

  fetchAlertasWidgets() {
    let body: any = this.filtros2body();
    let self = this;
    this.loadingService.showLoading();
    return fetchAlertasWidgets(body)
      .catch((error: any) => {
        console.log(error);
        self.listaAlertasWidgets = [];
        self.$snotify.error('Ocurrió un error. Intente nuevamente.', {
          timeout: 3000,
        });
      })
      .finally(() => {
        self.loadingService.hideLoading();
      });
  }

  async AlertaInicial() {}

  onSelectionChanged(params: any) {
    //console.log('seleccionados');
    //console.log(this.gridApi.getSelectedNodes());
  }

  //Ajusta tamaño de las celdas después de cargar la data
  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }

  //transforma la data del Ms, en el formato final para la grilla
  alerta2grid(alertas: Alerta[]) {
    let a: AlertaGrilla[] = [];
    let that = this;
    alertas.forEach(function(v) {
      let x: AlertaGrilla = {
        fechaAlarma:
          v.fechaAlarma == null ? '' : v.fechaAlarma.replace('T', ' '),
        fechaIngreso: v.fechaIngreso.replace('T', ' '),
        patente: v.patente,
        tipoAlerta: v.tipoAlerta,
        tipoAlertaOriginal: v.tipoAlertaOriginal,
        velocidad: v.velocidad,
        evidencia: that.get_images(v.files),
        ubicacion: v.latitud + ',' + v.longitud,
        codFlota: v.codFlota,
        flota: v.flota,
        files: v.files == null ? '' : JSON.stringify(v.files),
        grupo: v.grupo,
        numActividad: v.numActividad,
      };
      a.push(x);
    });
    return a;
  }

  //devuelve los archivos como string
  get_images(files: any[]) {
    let url: string[] = [];
    files.forEach(function(i: any) {
      url.push(i.url);
    });
    return JSON.stringify(url);
  }

  //Carga los filtros
  changeFlota(form: any) {
    this.forcehide = true;
    this.filtros_cargados -= 2;
    this.loadingService.showLoading();
    this.getGrupos(form.flota.value);
    this.getPatentes(form.flota.value, form.grupo.value);
  }
  changeGrupo(form: any) {
    this.forcehide = true;
    this.filtros_cargados -= 1;
    this.loadingService.showLoading();
    this.getPatentes(form.flota.value, form.grupo.value);
  }

  async getPatentes(flota: string, grupo: string) {
    this.listaPatentes = (await this.cargarPatentes(flota, grupo)) || [];
  }
  cargarPatentes(flota: string, grupo: string) {
    return fetchPatentes(flota, grupo, this.getUserID().toString())
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las patentes',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las patentes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.valida_filtros_cargados());
  }

  async getGrupos(flota: string) {
    this.listaGrupos = (await this.cargarGrupos(flota)) || [];
  }

  cargarGrupos(flota: string) {
    return fetchGrupos(flota)
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los grupos',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los grupos',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.valida_filtros_cargados());
  }

  async getFlotas() {
    this.listaFlotas = (await this.cargarFlotas()) || [];
  }

  cargarFlotas() {
    return fetchFlotas()
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las flotas',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las flotas',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.valida_filtros_cargados());
  }

  async getTiposAlertas() {
    this.listaTiposAlerta = (await this.cargarTiposAlertas()) || [];
  }
  cargarTiposAlertas() {
    return fetchTiposAlerta()
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de alarmas',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de alarmas',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.valida_filtros_cargados());
  }

  inicia_peticion() {
    this.widgets_loaded = false;
    this.grid_loaded = false;
    this.loadingService.showLoading();
  }

  valida_resultado_cargado(tipo: string) {
    if (tipo == 'widget') {
      this.widgets_loaded = true;
    }
    if (tipo == 'alerta') {
      this.grid_loaded = true;
    }
    if (this.filtros_cargados != this.filtros_total) {
      return false;
    }
    if (this.widgets_loaded && this.grid_loaded) {
      this.loadingService.hideLoading();
      this.widgets_loaded = false;
      this.grid_loaded = false;
    }
  }

  //Valida que se hayan cargado todos los filtros
  //para ocultar el loading
  valida_filtros_cargados() {
    this.filtros_cargados += 1;
    if (this.forcehide) {
      this.forcehide = false;
      this.loadingService.hideLoading();
      return;
    }
    if (!this.widgets_loaded || !this.grid_loaded) {
      return false;
    }
    if (this.filtros_cargados == this.filtros_total) {
      this.loadingService.hideLoading();
    }
  }

  //Filtra los resultados segun el widget
  filtroWidget(tipo: any) {
    let list: any;

    //si el filtro seleccionado es el mismo tipo,
    //está deshabilitando la seleccion
    if (this.widgetSelected == tipo) {
      list = document.querySelectorAll('.vigilanti .wrapper-widget.disabled');
      for (let i = 0; i < list.length; ++i) {
        list[i].classList.remove('disabled');
      }
      this.widgetSelected = null;
      this.formFields.tipoAlerta.value = '';
      this.filtroAlertas(false);
      return;
    }

    //quito todos los disabled si hay
    list = document.querySelectorAll('.vigilanti .wrapper-widget.disabled');
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.remove('disabled');
    }

    //Marco disabled todo menos el nuevo.
    list = document.querySelectorAll(
      '.vigilanti .wrapper-widget:not(.' + tipo + ')'
    );
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.add('disabled');
    }
    this.widgetSelected = tipo;
    this.formFields.tipoAlerta.value = tipo;
    this.filtroAlertas(false);
  }
  //Busca dentro del resultado de la grilla
  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }

  validateEmail() {
    if (this.correoEvidencia == '') {
      return false;
    }
    let listaCorreos = this.correoEvidencia.split(';');
    for (var correo of listaCorreos) {
      if (
        //eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          correo.trim()
        )
      ) {
        return true;
      } else {
        this.$snotify.error('Correo ' + correo + ' no es válido', {
          timeout: 3000,
        });
        return false;
      }
    }
  }
  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }

  //fx modal imagen, formato grilla
  openImage(link: string) {
    if (
      link
        .split('.')
        .pop()
        .toLowerCase() != 'mp4'
    ) {
      this.loadingService.showLoading();
    }
    this.linkEvidencia = link;
    this.showEvidencia = true;
  }
  imageLoaded() {
    this.loadingService.hideLoading();
  }
  imageError() {
    this.loadingService.hideLoading();
    this.$snotify.error('Error al obtener la evidencia.', { timeout: 3000 });
    this.showEvidencia = false;
  }
  closeImage() {
    this.linkEvidencia = '';
    this.showEvidencia = false;
  }
  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }
  linkToMap(v: any) {
    let link = '';
    if (v.value !== undefined && v.value.indexOf('null') == -1) {
      link =
        '<a target="_blank" style="text-decoration:none" href="https://www.google.com/maps/search/?api=1&query=' +
        v.value +
        '"><i class="v-icon material-icons theme--light" style="color: #526da5 !important;">location_on</i></a>';
    } else {
      link = 'Sin ubicación';
    }
    return link;
  }
  exportar(tipo: string) {
    this.loadingService.showLoading();

    let body: any = this.filtros2body();
    body.extension = tipo;
    let axios = new AxiosVue(ServicioProxy.Metabase);
    axios.http
      .post(`Metabase/PostgenericB/camaras/exportar`, {
        body: body,
        clienteDefecto: localStorage.getItem('clienteDefecto'),
        user_id: JSON.parse(localStorage.getItem('user')).id,
      })
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          //this.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
        } else {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
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
      });
  }

  create_csv(lista: any[], tipo: string) {
    this.loadingService.showLoading();
    let header = this.gridOptions.columnDefs
      .map((x: any) => {
        return x.headerName;
      })
      .filter((y: any) =>
        [
          'Fecha Alerta',
          'Patente',
          'Tipo Alerta',
          'Velocidad',
          'Flota',
          'Grupo',
          'Files',
        ].includes(y)
      )
      .join(';');
    let csvContent = '';
    if (tipo == 'csv') {
      csvContent = 'data:text/csv;charset=utf-8,';
    }
    csvContent += header.replace('Files', 'Archivo;Archivo') + '\r\n';
    lista.forEach(function(rowObject) {
      let rowArray = [];

      let x = JSON.parse(rowObject['files']);
      let listUri = '';
      let arrayUri: any[] = [];
      let urlMs = 'https://api.gpschile.com/ms/camaras/media?r=';
      if (window.location.host != 'track3.gpschile.com') {
        urlMs = 'https://apicert.gpschile.com/ms/camaras/media?r=';
      }
      x.forEach(function(i: any) {
        let r = btoa(i['url'].split('v/view/')[1]);
        arrayUri.push(urlMs + r);
      });
      listUri = arrayUri.join(';');

      rowArray = [
        rowObject['fechaAlarma'],
        rowObject['patente'],
        rowObject['tipoAlerta'],
        rowObject['velocidad'],
        rowObject['flota'],
        rowObject['grupo'],
        listUri,
      ];
      let row = rowArray.join(';');
      csvContent += row + '\r\n';
    });
    if (tipo == 'csv') {
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      // eslint-disable-next-line
      let name =
        'alertas_' +
        new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/T|-|:/g, '') +
        '.csv';
      link.setAttribute('download', name);
      link.classList.add('urldownload');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      let csvb64 = btoa(csvContent);
      const axios = new AxiosVue(ServicioProxy.Metabase);
      axios.http
        .post(`Metabase/PostgenericB/camaras/csv_to_pdf`, {
          csvb64: csvb64,
        })
        .then((data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            let link = document.createElement('a');
            link.setAttribute(
              'href',
              'data:application/pdf;base64,' + data.data.b64
            );
            // eslint-disable-next-line
            let name =
              'alertas_' +
              new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/T|-|:/g, '') +
              '.pdf';
            link.setAttribute('download', name);
            link.classList.add('urldownload');
            document.body.appendChild(link);
            link.click();
            link.remove();
          } else {
            this.$snotify.error('Error al generar PDF', { timeout: 3000 });
            return false;
          }
        });
    }
    this.loadingService.hideLoading();
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

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };
  accionEnviar: PermisoAccion = {
    accionCodigo: 90,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
    this.accionEnviar,
  ];

  handleVerDetalleClick(params: ICellRendererParams) {
    this.alertaSeleccionado = params.data;
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  handleEnviarCorreoClick() {
    if (this.correoEvidencia == '') {
      this.$snotify.error('Debe ingresar al menos un correo', {
        timeout: 3000,
      });
    }
    if (this.validateEmail()) {
      this.loadingService.showLoading();
      const axios = new AxiosVue(ServicioProxy.Metabase);
      axios.http
        .post(`Metabase/PostgenericA/camaras/enviarEvidenciaMail`, {
          lista: this.rowCorreo.data.files,
          correo: this.correoEvidencia,
          FECHA: this.rowCorreo.data.fechaAlarma,
          PATENTE: this.rowCorreo.data.patente,
          TIPO_ALERTA: this.rowCorreo.data.tipoAlerta,
          VELOCIDAD: this.rowCorreo.data.velocidad,
          UBICACION: this.rowCorreo.data.ubicacion,
          ID_ALARMA: this.rowCorreo.data.numActividad,
          FECHA_INGRESO: this.rowCorreo.data.fechaIngreso,
          clienteDefecto: window.localStorage.clienteDefecto,
        })
        .then((data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            this.$snotify.success('Envidencia enviada');
            this.closeEnvio();
          } else {
            this.$snotify.error(
              'Error al enviar correo: ' + data.data.MENSAJE_RESPUESTA,
              { timeout: 3000 }
            );
            return false;
          }
        })
        .finally(() => this.loadingService.hideLoading());
    }
  }
  closeEnvio() {
    this.showEnviarCorreo = false;
    this.correoEvidencia = '';
    this.rowCorreo = null;
  }
  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
  }

  handleEnviarClick(params: ICellRendererParams) {
    if (params.data.evidencia == '') {
      this.$snotify.error('Registro sin imagen evidencia', { timeout: 3000 });
    } else {
      this.showEnviarCorreo = true;
      this.correoEvidencia = '';
      this.rowCorreo = params;
      /*console.log(params);
      const axios = new AxiosVue(ServicioProxy.Metabase);
      axios.http
        .post(`Metabase/PostgenericB/camaras/enviarEvidenciaMail`, {
          lista: params.data.files,
        })
        .then((data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            this.$snotify.success('Envidencia enviada');
          } else {
            console.log(data.data);
            this.$snotify.error('Error al enviar correo: '+data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
            return false;
          }
        });
        */
    }
  }

  constructor() {
    super();
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEnviar(this.handleEnviarClick);
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    /*if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }*/
  }
}
</script>
<style>
.hide {
  display: none !important;
}
div[col-id='checked'] {
  pointer-events: all !important;
}
.modalEvidencia,
.modalEnvio {
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modalEvidencia-content,
.modalEnvio-content {
  background-color: #fafafa;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}
.modalEnvio-content {
  min-width: 300px;
  max-width: 500px;
  width: 30%;
}
.wrap-evidencia .wrap-evidencia-img {
  text-align: center;
  min-height: 480px;
  overflow: hidden;
}
.wrap-evidencia .wrap-evidencia-img img {
  max-width: 100%;
}
.vigilanti .wrap-evidencia video,
.vigilanti .wrapper-files video {
  /*width: 103%;*/
}
.vigilanti .wrapper-files {
  /*overflow: hidden;*/
}
.titleEvidencia {
  width: 70%;
  display: inline-block;
  min-width: 320px;
  min-width: 115px;
}
.buttonCloseEvidencia {
  display: inline-block;
  float: right;
}
.widgets .importExportBtnIcon {
  font-size: 30px;
}
.widgets .importExportBtnTexto {
  font-size: 12px;
}
.camaras .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
.vigilanti video::-webkit-media-controls-volume-slider {
  display: none !important;
}
.vigilanti video::-webkit-media-controls-mute-button {
  display: none !important;
}
.vigilanti video::-webkit-media-controls-enclosure {
  overflow: hidden !important;
}
.vigilanti video::-internal-media-controls-download-button {
  display: none !important;
}
.vigilanti video::-webkit-media-controls-panel {
  width: calc(100% + 30px);
}
.application--wrap {
  overflow-y: auto;
  height: 0px;
}
.vigilanti .wrapper-widget.disabled {
  cursor: pointer !important;
}
</style>

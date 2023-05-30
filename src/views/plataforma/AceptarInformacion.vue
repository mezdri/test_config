<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Aceptar Información</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            @input="onFilterTextBoxChanged"
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md6>
        <div align="right" style="padding-top:15px">
          <v-btn
            v-if="accionExportar.visible"
            flat
            small
            color="primary"
            @click="exportar()"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <v-divider></v-divider>

    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>

    <app-nueva-ci
      :show="showModalNew"
      :_id="editedIndex"
      :modalEsVerDetalle="editedVerDetalle"
      v-on:modalAsociacionEmit="ciModalCallback($event)"
    ></app-nueva-ci>

    <app-confirmacion
      :show="dialog"
      :titulo="dialogTitulo"
      :mensaje="dialogMensaje"
      v-on:modalConfirmationEmit="confirmModalCallback($event)"
      :textoBtnSi="$t('mensajes.crud.dejarCompartirInformacion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.dejarCompartirInformacion.btnCancelar')"
    ></app-confirmacion>

    <v-dialog v-model="dialogIngresarMotivo" persistent max-width="500">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn
            icon
            dark
            @click="
              dialogIngresarMotivo = false;
              motivoDejarCompartirModel = '';
            "
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title
            style="font-size:17px;margin-left: 10px !important"
            >{{ tituloMotivoRechazo }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          {{ mensajeMotivoRechazo }}
          <br />
          <br />
          <v-flex md12>
            <v-form
              ref="formMotivo"
              v-model="validFormMotivo"
              lazy-validation
              class="col-md-12"
            >
              <v-textarea
                solo
                name="input-7-4"
                label="Ingrese motivo... (Opcional)"
                v-model="motivoDejarCompartirModel"
                v-validate="'max:500'"
                :error-messages="errors.collect('motivo')"
                data-vv-name="motivo"
                :counter="500"
              ></v-textarea>
            </v-form>
          </v-flex>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            depressed
            small
            @click="
              dialogIngresarMotivo = false;
              motivoDejarCompartirModel = '';
            "
          >
            <span style="color: #526da5">Cancelar</span>
          </v-btn>
          <v-btn
            color="#526da5"
            depressed
            small
            @click="rechazarDejarRecibirInformacion()"
          >
            <span style="color: white;" :disabled="!validFormMotivo"
              >Aceptar</span
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <app-detalle-vehiculos
      :show="showModalDetalleVehiculos"
      :flota="flotaModal"
      :soloVisualizacion="true"
      v-on:modalAsociacionEmit="showModalDetalleVehiculos = false"
    ></app-detalle-vehiculos>

    <v-dialog v-model="dialogSeleccionarFlota" persistent max-width="500">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialogSeleccionarFlota = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Flota de destino</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          Seleccione la flota donde se incluirán los vehículos aceptados.
          <br />
          <br />
          <v-flex md12>
            <v-form
              ref="formMotivo"
              v-model="validFormFlotaDestino"
              lazy-validation
              class="col-md-12"
            >
              <v-autocomplete
                v-validate="'required'"
                v-model="selectedFlotaDestino"
                :error-messages="errors.collect('flotadestino')"
                data-vv-name="flotadestino"
                :items="flotasModal"
                label="Flota destino"
                item-text="nombre"
                item-value="id"
                persistent-hint
                :clearable="true"
                no-data-text="Sin resultados"
                required
              ></v-autocomplete>
            </v-form>
          </v-flex>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            depressed
            small
            @click="closeAsociaFlotaDestino()"
          >
            <span style="color: #526da5">Cancelar</span>
          </v-btn>
          <v-btn
            color="#526da5"
            depressed
            small
            @click="asignarVehiculosFlota()"
          >
            <span style="color: white;" :disabled="!validFormFlotaDestino"
              >Aceptar</span
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import config from '@/config/index';
import store from '@/store';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { AxiosVue } from '@/AxiosVue';
import {
  ServicioProxy,
  EstadoCompartirInformacion,
  EstadoAceptarInformacion,
  TipoCompartir,
} from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { FlotaInterface } from '@/interfaces/Flota';
import { actionsEvent } from '@/setup';
import { EstadoEntidad, Accion } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import CompartirInformacionModalNuevo from '@/components/plataforma/CompartirInformacionModalNuevo.vue';
import FlotasModalDesasociarVehiculos from '@/components/plataforma/FlotasModalDesasociarVehiculos.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-nueva-ci': CompartirInformacionModalNuevo,
    'app-detalle-vehiculos': FlotasModalDesasociarVehiculos,
  },
})
export default class AceptarInformacion extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.AceptarInformacion;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly controller: string = 'CompartirInformacion';

  tabModel: string = 'tab-1';
  modalEsVerDetalle: boolean = false;
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  serverSide: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();
  dialog: boolean = false;
  dialogIngresarMotivo: boolean = false;
  dialogSeleccionarFlota: boolean = false;
  motivoDejarCompartirModel: string = '';
  validFormMotivo: boolean = false;
  validFormFlotaDestino: boolean = false;
  selectedFlotaDestino: any = null;
  flotasModal: any = [];

  dialogTitulo: string = '';
  dialogMensaje: string = '';
  tipoCambio: string = '';
  tituloMotivoRechazo: string = '';
  mensajeMotivoRechazo: string = '';
  identificadorNombre: string = '';

  showModalDetalleVehiculos: boolean = false;
  flotaModal: FlotaInterface = {};

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  showModalNew: boolean = false;
  muestraBarraBotones: boolean = false;

  $snotify: any;
  search: string = '';
  flotas: FlotaInterface[] = [];
  dialogEliminar: Boolean = false;
  editedIndex: number = -1;
  editedItem: FlotaInterface = {};
  defaultItem: FlotaInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  axiosVehiculos: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosUsuarios: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  clienteId: number = config.getClienteSesion();
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  editedVerDetalle: boolean = false;
  editedIndexTipo: string = '';

  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };

    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        suppressMenu: true,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left', 'pointer-events': 'none' },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        hide: true,
        minWidth: 90,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo',
        field: 'funcionalidadNombre',
        resizable: true,
        sortable: true,
        minWidth: 90,
        width: 130,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Flota/Unidad Origen',
        field: 'identificadorNombre',
        resizable: true,
        sortable: true,
        minWidth: 90,
        width: 130,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Flota Destino',
        field: 'flotaDestinoNombre',
        resizable: true,
        sortable: true,
        minWidth: 90,
        width: 130,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoCompartirInformacionTxt',
        lockPinned: true,
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 100,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Cliente que comparte',
        field: 'clienteCompartio',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 100,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Compartida por',
        field: 'usuarioCompartio',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 100,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha en que se compartió',
        field: 'fechaCompartioTxt',
        lockPinned: true,
        width: 240,
        minWidth: 120,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Aceptada por',
        field: 'aceptadoPor',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 100,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha en que se aceptó',
        field: 'fechaAceptoTxt',
        lockPinned: true,
        resizable: true,
        sortable: true,
        width: 230,
        minWidth: 130,
      },
      {
        headerName: 'Fecha de caducidad',
        field: 'fechaCaducidadTxt',
        lockPinned: true,
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 100,
      },
      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
        filter: false,
        suppressMovable: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 5, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: () => {
        return true;
      },
      doesExternalFilterPass: () => {
        return true;
      },
      blockLoadDebounceMillis: 350,
      onGridReady: this.onGridReady,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      onSelectionChanged: this.onSelectionChanged,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
    this.initialize();
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  onFilterTextBoxChanged() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.search.length >= 2) {
        self.gridApi.onFilterChanged();
      } else if (self.search.length === 0) {
        self.gridApi.setServerSideDatasource(self.serverSide);
      }
      clearInterval(self.intervalo);
    }, 500);
  }

  onGridReady(params: GridReadyEvent) {
    this.loadingService.showLoading();
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.serverSide = {
        getRows(params: any): void {
          params.request.search = self.search;
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          self.paramsExportar = params; //Parametros al Exportar

          self.axiosVehiculos
            .http(`${self.controller}/${self.clienteId}/getGrillaAceptarInfo`, {
              params: params.request,
            })
            .then(flotas => {
              if (flotas.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(flotas.data.data, flotas.data.lastRow);
                self.gridApi.hideOverlay();
              }
              self.loadingService.hideLoading();
            })
            .catch(err => {
              if (!err.response) {
                if (err.response.status !== 401) {
                  self.$snotify.error('Ocurrió un error en la búsqueda.');
                }
              }
              params.failCallback();
              self.loadingService.hideLoading();
            });
        },
      };

      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.showModalNew = false;
  }

  ciModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.editedIndex = 0;
    this.editedVerDetalle = false;

    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 10);
  }

  confirmModalCallback(val: boolean) {
    this.dialog = false;
    if (val) {
      if (this.tipoCambio === 'A') {
        this.getFlotas();
      } else if (this.tipoCambio === 'R' || this.tipoCambio === 'D') {
        this.dialogIngresarMotivo = true;
      }
    }
  }

  rechazarDejarRecibirInformacion() {
    this.$validator.validate('motivo').then(res => {
      if (res) {
        this.dialogIngresarMotivo = false;
        this.loadingService.showLoading();

        //graba evento
        let model: any = {
          Id: this.editedIndex,
          Descripcion: this.motivoDejarCompartirModel,
          Estado: EstadoEntidad.Activo,
          FechaFinAsociacion: new Date(),
          IdentificadorNombre: this.identificadorNombre,
          EstadoCompartirInformacion:
            this.tipoCambio === 'R'
              ? EstadoCompartirInformacion.Rechazada
              : EstadoCompartirInformacion.DejarDeRecibir,
        };

        this.axiosVehiculos.http
          .put(`${this.controller}`, model)
          .then(res => {
            if (this.tipoCambio === 'R') {
              this.enviarCorreoRechazar(this.editedIndex, model);
            } else {
              this.enviarCorreoDejarRecibir(this.editedIndex, model);
            }
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.handleErrors.showError(err);
              }
            } else {
              this.handleErrors.showError(err);
            }
          });
      }
    });
  }

  async enviarCorreoRechazar(compartirInformacionId: number, model: any) {
    let arr: any[] = window.location.pathname.split('/');
    let url: string =
      arr.length >= 3
        ? window.location.origin + '/' + arr[1]
        : window.location.origin;
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: model.Descripcion,
      encodedFechaEnvio: url, //window.location.href,
      url: '',
      idEntidad: 0,
      clienteUsuariosId: 0,
      funcionalidad:
        this.editedIndexTipo === 'Flota'
          ? TipoCompartir.Flota
          : TipoCompartir.Vehículo,
      identificadorId: 0,
      compartirInformacionId: compartirInformacionId,
    };

    const res: any = await this.axiosUsuarios.http.post(
      `Email/RechazarInformacion`,
      modelEmail
    );

    this.loadingService.hideLoading();
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.rechazarInformacion')
    );
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.motivoDejarCompartirModel = '';
  }

  async enviarCorreoDejarRecibir(compartirInformacionId: number, model: any) {
    let arr: any[] = window.location.pathname.split('/');
    let url: string =
      arr.length >= 3
        ? window.location.origin + '/' + arr[1]
        : window.location.origin;
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: model.Descripcion,
      encodedFechaEnvio: url,
      url: '',
      idEntidad: 0,
      clienteUsuariosId: 0,
      funcionalidad:
        this.editedIndexTipo === 'Flota'
          ? TipoCompartir.Flota
          : TipoCompartir.Vehículo,
      identificadorId: 0,
      compartirInformacionId: compartirInformacionId,
    };

    const res: any = await this.axiosUsuarios.http.post(
      `Email/DejarRecibirInformacion`,
      modelEmail
    );

    this.loadingService.hideLoading();
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.dejarRecibirInformacion')
    );
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.motivoDejarCompartirModel = '';
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosVehiculos
        .http(`${this.controller}/${this.clienteId}/getGrillaAceptarInfo`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'AceptarInformacion.csv',
            respServer.data.data,
            this.columnDefs
          );
          this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
        })
        .catch(err => {
          if (!err.response) {
            this.$snotify.error('Ocurrió un error al exportar.');
          }
        });
    } else {
      this.$snotify.warning('No existen datos para exportar.');
    }
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        motivo: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        flotadestino: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    actionsEvent.$on('actionsEvent', (data: any) => {
      this.gridApi.forEachNode((rowNode: any, index: number) => {
        if (data.id === rowNode.data.id) {
          this.identificadorNombre = rowNode.data.identificadorNombre;
        }
      });

      let tipo: any = config.getValorCelda(
        this.gridApi,
        data.id,
        'funcionalidadNombre'
      );
      this.editedIndexTipo = tipo;

      if (data.action === Accion.AceptarInformacionCompartida) {
        this.tipoCambio = 'A';
        this.dialogTitulo = this.$t(
          'mensajes.crud.aceptarInformacion.titulo'
        ).toString();
        this.dialogMensaje = this.$t(
          'mensajes.crud.aceptarInformacion.mensaje',
          {
            Tipo:
              tipo === 'Flota'
                ? 'la Flota compartida'
                : 'el Vehículo compartido',
          }
        ).toString();
        this.editedIndex = data.id;
        this.dialog = true;
      } else if (data.action === Accion.RechazarInformacionCompartida) {
        this.tipoCambio = 'R';
        this.tituloMotivoRechazo = 'Motivo rechazar información';
        this.mensajeMotivoRechazo =
          'Favor indique motivo por el cual rechaza información';
        this.dialogTitulo = this.$t(
          'mensajes.crud.rechazarInformacion.titulo'
        ).toString();
        this.dialogMensaje = this.$t(
          'mensajes.crud.rechazarInformacion.mensaje'
        ).toString();
        this.editedIndex = data.id;
        this.dialog = true;
      } else if (data.action === Accion.DejarRecibirInformacion) {
        this.tipoCambio = 'D';
        this.tituloMotivoRechazo = 'Motivo dejar de recibir información';
        this.mensajeMotivoRechazo =
          'Favor indique motivo por el cual dejará de recibir información';
        this.dialogTitulo = this.$t(
          'mensajes.crud.dejarRecibirInformacion.titulo'
        ).toString();
        this.dialogMensaje = this.$t(
          'mensajes.crud.dejarRecibirInformacion.mensaje'
        ).toString();
        this.editedIndex = data.id;
        this.dialog = true;
      } else if (data.action === Accion.VerDetalle) {
        this.editedIndex = data.id;
        this.editedVerDetalle = true;
        this.showModalNew = true;
      }
    });
  }

  createButtonCellVehiculos(params: any) {
    const eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnF' + params.data.id);
    eButton.setAttribute('title', 'Ver Vehículos');
    eButton.setAttribute('type', 'button');
    eButton.style.cursor = 'pointer';
    eButton.style.textDecoration = 'underline';
    eButton.innerText = params.data.cantidadVehiculos;

    eButton.addEventListener('click', () => {
      if (params.data.cantidadVehiculos > 0) {
        this.flotaModal.id = params.data.identificadorId;
        this.flotaModal.nombre = params.data.identificadorNombre;
        this.showModalDetalleVehiculos = true;
      } else {
        this.$snotify.warning('Flota no posee vehículos activos.');
      }
    });

    return eButton;
  }

  getFlotas() {
    this.loadingService.showLoading();
    this.axiosVehiculos.http
      .get(`flota/cliente/${this.clienteId}/compartido/1`)
      .then(res => {
        //437 - Aceptar Información - Flota destino (Flotas No Compartidas)
        this.flotasModal = res.data.filter((x: any) => x.idCompartida === 0);
        this.dialogSeleccionarFlota = true;
        this.$validator.reset(); //722 - Aceptar Información - Aceptar
        this.loadingService.hideLoading();
      })
      .catch(err => {
        if (err.response !== undefined) {
          if (err.response.status !== 401) {
            this.handleErrors.showError(err);
          }
        } else {
          this.handleErrors.showError(err);
        }
      });
  }

  asignarVehiculosFlota() {
    this.$validator.validate('flotadestino').then(res => {
      if (res) {
        this.dialogSeleccionarFlota = false;
        this.loadingService.showLoading();

        let funcionalidadNombreTipo: any = config.getValorCelda(
          this.gridApi,
          this.editedIndex,
          'funcionalidadNombre'
        );

        let model: any = {
          Id: this.editedIndex,
          Descripcion: '',
          Estado: EstadoEntidad.Activo,
          EstadoCompartirInformacion: EstadoCompartirInformacion.Aceptada,
          UsuarioAceptacionId: this.usuarioId,
          FlotaDestinoId: this.selectedFlotaDestino,
          Funcionalidad:
            funcionalidadNombreTipo === 'Flota'
              ? TipoCompartir.Flota
              : TipoCompartir.Vehículo, //09-2019: Desarrollo Compartir Información
        };

        this.axiosVehiculos.http
          .put(`${this.controller}`, model)
          .then(res => {
            this.loadingService.hideLoading();
            this.$snotify.success(
              this.$t('mensajes.mensajesExito.aceptarInformacion')
            );
            this.selectedFlotaDestino = null; //722 - Aceptar Información - Aceptar
            this.gridApi.deselectAll();
            this.gridApi.setServerSideDatasource(this.serverSide);
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.handleErrors.showError(err);
              }
            } else {
              this.handleErrors.showError(err);
            }
          });
      }
    });
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }

  closeAsociaFlotaDestino() {
    this.selectedFlotaDestino = null; //20191014 AM - Observaciones Compartir Información
    this.dialogSeleccionarFlota = false;
  }
}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Compartir Información</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding:0px">
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
      <v-flex
        xs12
        sm6
        :md4="accionCompartir.visible"
        :md6="!accionCompartir.visible"
      >
        <div align="right" style="padding-top:15px;">
          <v-btn
            v-if="accionExportar.visible"
            flat
            small
            color="primary"
            style="padding-right: 20px;"
            @click="exportar()"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar</span>
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCompartir.visible"
            class="btn-crear"
            style="padding-right:0px;"
            @click="
              (editedItem = {}),
                (showModalNew = true),
                (editedVerDetalle = false)
            "
          >
            <v-icon dark left style="margin-right: 0px; padding-left:0px;"
              >add_circle_outline</v-icon
            >
            <span style="padding-right:7px;">Compartir</span>
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

    <app-confirmacion
      :show="dialogDejarCompartir"
      :titulo="$t('mensajes.crud.dejarCompartirInformacion.titulo')"
      :mensaje="
        $t('mensajes.crud.dejarCompartirInformacion.mensaje', {
          nombre_cliente: nombreMandante,
        })
      "
      v-on:modalConfirmationEmit="dejarCompartirModalCallback($event)"
      :textoBtnSi="$t('mensajes.crud.dejarCompartirInformacion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.dejarCompartirInformacion.btnCancelar')"
    ></app-confirmacion>

    <app-nueva-ci
      :show="showModalNew"
      :_id="editedIndex"
      :modalEsVerDetalle="editedVerDetalle"
      v-on:modalAsociacionEmit="ciModalCallback($event)"
    ></app-nueva-ci>

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
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Motivo dejar de compartir información</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          Favor indique motivo por el cual dejará de compartir información
          <br />
          <br />
          <v-flex md12>
            <v-form v-model="validFormMotivo" lazy-validation class="col-md-12">
              <v-textarea
                solo
                name="input-7-4"
                label="Ingrese motivo... (Opcional)"
                v-model="motivoDejarCompartirModel"
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
          <v-btn color="#526da5" depressed small @click="dejarDeCompartir()">
            <span style="color: white;">Aceptar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
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
  TipoCompartir,
} from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { FlotaInterface } from '@/interfaces/Flota';
import { actionsEvent } from '@/setup';
import { EstadoEntidad, Accion } from '@/config/enums';
import CompartirInformacionModalNuevo from '@/components/plataforma/CompartirInformacionModalNuevo.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
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
  RowNode,
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
  },
})
export default class CompartirInformacion extends ComponenteBase {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.CompartirInformacion;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCompartir: PermisoAccion = {
    accionCodigo: 47,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCompartir,
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
  dialogDejarCompartir: boolean = false;
  dialogIngresarMotivo: boolean = false;
  motivoDejarCompartirModel: string = '';
  validFormMotivo: boolean = false;
  nombreMandante: string = '';
  chequearPermisosBtnCrear: boolean = true;

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

  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculos: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  clienteId: number = config.getClienteSesion();
  intervalo: any; //Intervalo para el buscador
  paramsExportar: any; //Parametros para Exportar
  editedVerDetalle: boolean = false;

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
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo',
        field: 'funcionalidadNombre',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 145,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Flota/Unidad',
        field: 'identificadorNombre',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 163,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoCompartirTxt',
        resizable: true,
        sortable: true,
        minWidth: 124,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Cliente',
        field: 'nombreMandante',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 163,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Compartida por',
        field: 'usuarioComparteNombre',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha en que se compartió',
        field: 'fechaCompartioTxt',
        lockPinned: true,
        width: 240,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Aceptada por',
        field: 'nombreUsuarioAceptacion',
        resizable: true,
        sortable: true,
        width: 163,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha en que se aceptó',
        field: 'fechaAceptoTxt',
        lockPinned: true,
        width: 230,
        minWidth: 80,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Fecha de caducidad',
        field: 'fechaCaducidadTxt',
        lockPinned: true,
        width: 220,
        minWidth: 80,
        resizable: true,
        sortable: true,
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
            .http(`${self.controller}/${self.clienteId}/grid`, {
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

  mounted() {}

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

  dejarCompartirModalCallback(val: boolean) {
    this.dialogDejarCompartir = false;
    if (val) {
      this.motivoDejarCompartirModel = '';
      this.dialogIngresarMotivo = true;
    }
  }

  async dejarDeCompartir() {
    this.dialogIngresarMotivo = false;
    this.loadingService.showLoading();
    let nombreCliente: any = config.getValorCelda(
      this.gridApi,
      this.editedIndex,
      'nombreMandante'
    );
    let compartirInformacionId: any = config.getValorCelda(
      this.gridApi,
      this.editedIndex,
      'id'
    );
    let funcionalidadNombreTipo: any = config.getValorCelda(
      this.gridApi,
      this.editedIndex,
      'funcionalidadNombre'
    );

    //graba evento
    let model: any = {
      Id: this.editedIndex,
      Descripcion: this.motivoDejarCompartirModel,
      Estado: EstadoEntidad.Inactivo,
      FechaFinAsociacion: new Date(),
      EstadoCompartirInformacion: EstadoCompartirInformacion.DejarDeCompartir,
    };

    let arr: any[] = window.location.pathname.split('/');
    let url: string =
      arr.length >= 3
        ? window.location.origin + '/' + arr[1]
        : window.location.origin;
    let modelEmail: any = {
      encodeIdUsuario: '',
      from: '',
      to: '',
      subject: '',
      message: this.motivoDejarCompartirModel, //09-2019: Desarrollo Compartir Información
      encodedFechaEnvio: url,
      url: '',
      idEntidad: 0,
      clienteUsuariosId: 0,
      funcionalidad:
        funcionalidadNombreTipo === 'Flota'
          ? TipoCompartir.Flota
          : TipoCompartir.Vehículo,
      identificadorId: 0,
      compartirInformacionId: compartirInformacionId,
    };

    const res: any = await this.axiosVehiculos.http.put(
      `${this.controller}`,
      model
    );

    const resCorreo: any = await this.axiosAuth.http.post(
      `Email/DejarDeCompartir`,
      modelEmail
    );

    this.loadingService.hideLoading();
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.dejarCompartir', {
        nombre_cliente: nombreCliente,
      })
    );
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.editedIndex = 0;
    this.editedVerDetalle = false;
  }

  async enviarCorreoVehiculoCompartido(vehiculosFlotas: any) {
    try {
      let model: any = {
        Funcionalidad: Funcionalidades.AceptarInformacion,
        VehiculosFlotas: vehiculosFlotas,
        ClienteId: config.getClienteSesion(),
      };

      await this.axiosVehiculos.http.post(
        `vehiculo/correoVehiculosCompartidos`,
        model
      );
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al enviar correo.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al enviar correo.');
      }
    }
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosVehiculos
        .http(`${this.controller}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'CompartirInformacion.csv',
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
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.NoRecibirInformacion) {
        this.nombreMandante = config.getValorCelda(
          this.gridApi,
          data.id,
          'nombreMandante'
        );
        this.editedIndex = data.id;
        this.dialogDejarCompartir = true;
      } else if (data.action == Accion.VerDetalle) {
        this.editedIndex = data.id;
        this.editedVerDetalle = true;
        this.showModalNew = true;
      }
    });
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

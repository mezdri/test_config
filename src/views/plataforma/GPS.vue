<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">GPS</v-tab>
      <v-tab v-if="showTabSIM" :href="`#tab-2`" to="/sim">SIM</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:0px">
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
      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
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
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            @click="(editedItem = {}), (showModalNew = true)"
            style="padding-right:20px;"
          >
            <v-icon dark left style="color=black;">add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <v-layout
      row
      wrap
      v-show="muestraBarraBotones"
      class="animated fadeIn fast"
    >
      <div>
        <v-flex md2>
          <v-btn
            v-if="accionEliminar.visible"
            flat
            small
            class="btn-barra"
            @click="eliminarSeleccionadas"
          >
            <v-icon>delete</v-icon>&nbsp;&nbsp;Eliminar Seleccionadas
          </v-btn>
        </v-flex>
      </div>
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
      :show="dialogEliminar"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <app-gps-modal-nuevo
      :show="showModalNew"
      :gps="editedItem"
      v-on:modalAsociacionEmit="gpsModalCallback($event)"
    ></app-gps-modal-nuevo>

    <app-gps-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :gps="editedItem"
      v-on:modalAsociacionEmit="gpsModalCallback($event)"
    ></app-gps-modal-edicion>

    <div class="text-xs-center">
      <v-dialog v-model="mostrarAvisoDelete" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ titulomostrarAvisoDelete }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text v-if="mostrarMensajeDelete">
            <span>{{ textoMensajeDelete }}</span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              small
              color="primary"
              @click="
                eliminarMasivoMensajes = [];
                mostrarAvisoDelete = false;
              "
              >Aceptar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script lang="ts">
import store from '@/store';
import moment from 'moment';
import config from '@/config/index';
import MenuItem from '@/components/MenuItem.vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Component } from 'vue-property-decorator';
import { IGPS } from '@/interfaces/GPS';
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import { EstadoEntidad } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
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
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': () => import('@/components/Confirmation.vue'), //Confirmation,
    'app-gps-modal-nuevo': () =>
      import('@/components/plataforma/GPSModalNuevo.vue'),
    'app-gps-modal-edicion': () =>
      import('@/components/plataforma/GPSModalEdicion.vue'), //GPSModalEdicion
  },
})
export default class GPSs extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.GPS;
  //Declarar todas las Acciones Mantenedores
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
  readonly controller: string = 'Gps';
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  gridOptions: GridOptions;
  serverSide: any;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = this.$store.state.userId;
  loadingService = new LoadingService();
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  muestraBarraBotones: boolean = false;
  modalEsEdicion: boolean = false;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  mensajeEliminar: any = '';

  $snotify: any;

  gps: IGPS[] = [];
  selected: any = [];
  validForm: Boolean = true;
  date: any = null;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogAsociacion: Boolean = false;
  gpsAsociacion: IGPS = {};
  deleteMasivo: boolean = false;
  clienteId: number = config.getClienteSesion();
  showTabSIM: boolean = true;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  search: string = '';
  editedIndex: number = -1;
  editedItem: IGPS = {};
  defaultItem: IGPS = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  //tabs
  tabModel: string = 'tab-1';
  eliminarMasivoMensajes: any = [];

  //variables modales aviso delete
  tituloEliminar: any = '';
  mostrarAvisoDelete: boolean = false;
  gpsAEliminar: IGPS = {};
  titulomostrarAvisoDelete: string = '';
  textoMensajeDelete: string = '';
  mostrarMensajeDelete: boolean = false;
  contVeh: number = 0;
  contSim: number = 0;
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  simAsociadasGps: any = '';
  cantidadEliminarMasivo: number = 0;

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;

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
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        resizable: true,
        sortable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nro. Serie',
        field: 'numeroSerie',
        resizable: true,
        width: 145,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Marca',
        field: 'marca',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'IMEI',
        field: 'imei',
        resizable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Nro. SIM',
        field: 'numeroSim',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Cía. Telecomunicaciones',
        field: 'ciaTelecomunicaciones',
        resizable: true,
        width: 215,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Patente Vehículo',
        field: 'patenteVehiculo',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'VIN Vehículo',
        field: 'vinVehiculo',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 180,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 180,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
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
        pinned: 'right',
        width: 120,
        minWidth: 120,
        enablePivot: false,
        filter: false,
        suppressMovable: true,
        sortable: false,
        lockVisible: true,
        resizable: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      onSelectionChanged: this.onSelectionChanged,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      suppressCopyRowsToClipboard: true,
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

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async eliminarSeleccionadas() {
    const items = this.gridApi.getSelectedNodes();
    this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
    let index: number = 0;
    let tieneVeh: boolean = false;
    let tieneSim: boolean = false;
    try {
      for (let i = 0; i <= items.length - 1; i++) {
        if (items[i].data.numeroSim !== '') tieneSim = true;
      }
      for (let i = 0; i <= items.length - 1; i++) {
        if (items[i].data.patenteVehiculo !== '') tieneVeh = true;
      }

      // elimacion por lote masivo u individual y un GPS tiene vehiculo o sim
      if (tieneVeh === true && tieneSim === true) {
        if (this.gridApi.getSelectedNodes().length > 1) {
          this.titulomostrarAvisoDelete = 'Eliminar GPSs';
          this.textoMensajeDelete =
            'Los GPSs están asociado a un Vehículo y tienen una SIM asociada, por esta razón no se podrá realizar la eliminación.';
        } else {
          this.titulomostrarAvisoDelete =
            'Eliminar GPS: ' + items[0].data.numeroSerie;
          this.textoMensajeDelete =
            'El GPS está asociado a un Vehículo y tiene una SIM asociada, por esta razón no se podrá realizar la eliminación.';
        }
        this.mostrarAvisoDelete = true;
        this.mostrarMensajeDelete = true;

        //elimacion por lote masivo y un GPS tiene vehiculo
      } else if (tieneVeh === true && tieneSim === false) {
        if (this.gridApi.getSelectedNodes().length > 1) {
          this.titulomostrarAvisoDelete = 'Eliminar GPSs';
          this.textoMensajeDelete =
            'Los GPSs están asociados a un Vehículo, por esta razón no se podrá realizar la eliminación.';
        } else {
          this.titulomostrarAvisoDelete =
            'Eliminar GPS: ' + items[0].data.numeroSerie;
          this.textoMensajeDelete =
            'El GPS está asociado a un Vehículo, por esta razón no se podrá realizar la eliminación.';
        }
        this.mostrarAvisoDelete = true;
        this.mostrarMensajeDelete = true;

        //elimacion por lote masivo u individual y un GPS tiene sim
      } else if (tieneSim === true && tieneVeh === false) {
        if (this.gridApi.getSelectedNodes().length > 1) {
          this.titulomostrarAvisoDelete = 'Eliminar GPSs';
          this.textoMensajeDelete =
            'Los GPSs tienen una SIM asociada, por esta razón no se podrá realizar la eliminación.';
        } else {
          this.titulomostrarAvisoDelete =
            'Eliminar GPS: ' + items[0].data.numeroSerie;
          this.textoMensajeDelete =
            'El GPS tiene una SIM asociada, por esta razón no se podrá realizar la eliminación.';
        }
        this.mostrarAvisoDelete = true;
        this.mostrarMensajeDelete = true;

        //elimacion por lote individual y un GPS no tiene asociación
      } else if (tieneVeh === false && tieneSim === false) {
        if (this.gridApi.getSelectedNodes().length === 1) {
          this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
            entidad: 'GPS',
            nombreEntidad: this.gridApi.getSelectedNodes()[0].data.numeroSerie,
          });
          this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
            entidad: 'el GPS',
          });
          this.editedIndex = this.gridApi.getSelectedNodes()[0].data.id;
          this.dialogEliminar = true;

          //elimacion por lote masivo y un GPS no tiene asociación
        } else {
          this.mostrarMensajeDelete = false;
          this.deleteMasivo = true;
          this.mensajeEliminar = this.$t(
            'mensajes.crud.eliminarMasivo.mensaje',
            {
              los_cantidad_entidad_seleccionados:
                this.gridApi.getSelectedNodes().length > 1
                  ? 'los ' +
                    this.gridApi.getSelectedNodes().length +
                    ' GPSs seleccionados'
                  : 'el GPS seleccionado',
            }
          );
          this.tituloEliminar = 'Eliminar GPSs';
          this.dialogEliminar = true;
        }
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1 ? 'los ' + items.length + 'GPSs' : 'El GPS',
              eliminadaOs: 'seleccionados',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1 ? 'los ' + items.length + 'GPSs' : 'El GPS',
            eliminadaOs: 'seleccionados',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  mounted() {
    eventBus.changeTitlePage('GPS');

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el GPS',
        });
        this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'GPS',
          nombreEntidad: config.getValorCelda(
            this.gridApi,
            data.id,
            'numeroSerie'
          ),
        });
        this.editedIndex = data.id;
        this.titulomostrarAvisoDelete =
          'Eliminar GPS: ' +
          config.getValorCelda(this.gridApi, data.id, 'numeroSerie');
        this.eliminarItem();
      } else if (
        data.action == Accion.Editar ||
        data.action == Accion.VerDetalle
      ) {
        //Editar
        if (data.action == Accion.Editar) {
          this.modalEsEdicion = true;
        } else {
          this.modalEsEdicion = false;
        }

        this.editedIndex = data.id;
        let item: any = null;

        this.gridApi.forEachNode((rowNode: RowNode) => {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            return true;
          }
        });

        if (item !== null) {
          this.editedItem = item;
          this.showModalEdit = true;
        }
      }
    });

    this.showTabSIM = config.chequeaPermisosTabs(
      Funcionalidades.SIM,
      config.getClienteSesion()
    );
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

    this.gridApi.closeToolPanel();

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

          const idFilasSeleccionadas = self.gridApi
            .getSelectedRows()
            .map(x => x.id);
          self.axiosGps
            .http(`${self.controller}/${self.clienteId}/grid`, {
              params: params.request,
            })
            .then(gps => {
              if (gps.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(gps.data.data, gps.data.lastRow);
                self.gridApi.forEachNode(node => {
                  node.setSelected(false);
                });

                self.gridApi.forEachNode(node => {
                  let existe = idFilasSeleccionadas.find(
                    (x: any) => x === node.data.id
                  );
                  if (existe !== null && existe !== undefined) {
                    node.setSelected(true);
                  }
                });
                self.gridApi.hideOverlay();
              }
              //self.gridApi.sizeColumnsToFit();
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

  asociar(item: IGPS) {
    this.gpsAsociacion = item;
    this.dialogAsociacion = true;
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      if (this.deleteMasivo) {
        await this.eliminarGPSMasivo(); //Eliminación Masiva
      } else {
        await this.eliminarGPS(); //Eliminación Unica
      }
    }
    this.deleteMasivo = false;
  }

  async eliminarItem() {
    this.loadingService.showLoading();
    this.deleteMasivo = false;
    this.eliminarMasivoMensajes = [];
    this.contVeh = 0;
    this.contSim = 0;

    try {
      const resGps = await this.axiosGps.http.get<IGPS>(
        `${this.controller}/${this.editedIndex}`
      );
      this.gpsAEliminar = resGps.data;

      if (this.gpsAEliminar.gpsVehiculos !== undefined) {
        const vehiculosGps = this.gpsAEliminar.gpsVehiculos.filter(
          x => x.fechaFinAsociacion === null
        );
        this.gpsAEliminar.gpsVehiculos = vehiculosGps;
        this.contVeh = this.gpsAEliminar.gpsVehiculos.length;
      }

      if (this.gpsAEliminar.gpsSims !== undefined) {
        const gpsSim = this.gpsAEliminar.gpsSims.filter(
          x => x.fechaFinAsociacion === null
        );
        this.gpsAEliminar.gpsSims = gpsSim;
        this.contSim = this.gpsAEliminar.gpsSims.length;
      }

      if (this.contVeh > 0 && this.contSim > 0) {
        this.textoMensajeDelete =
          'El GPS está asociado a un Vehículo y tiene una SIM asociada, por esta razón no se podrá realizar la eliminación.';
        this.mostrarAvisoDelete = true;
        this.mostrarMensajeDelete = true;
      } else if (this.contVeh > 0) {
        this.textoMensajeDelete =
          'El GPS está asociado a un Vehículo, por esta razón no se podrá realizar la eliminación.';
        this.mostrarAvisoDelete = true;
        this.mostrarMensajeDelete = true;
      } else if (this.contSim > 0) {
        this.textoMensajeDelete =
          'El GPS tiene una SIM asociada, por esta razón no se podrá realizar la eliminación.';
        this.mostrarAvisoDelete = true;
        this.mostrarMensajeDelete = true;
      } else {
        this.dialogEliminar = true;
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'el GPS',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'numeroSerie'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'el GPS',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'numeroSerie'
            ),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarGPSMasivo() {
    const items = this.gridApi.getSelectedNodes();
    this.loadingService.showLoading();
    try {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index = 0;
        this.eliminarMasivoMensajes = [];

        for (let i = 0; i <= items.length - 1; i++) {
          const res = await this.axiosGps.http.delete(
            `${this.controller}/${items[i].data.id}`
          );
          index = index + 1;
          if (index == items.length) {
            let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Los ' + items.length + ' GPSs seleccionados'
                  : 'El GPS seleccionado',
              eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
            });
            if (items.length === 1) {
              msj = msj.toString().replace('han', 'ha');
            }
            this.$snotify.success(msj);
            this.muestraBarraBotones = false;
            this.gridApi.deselectAll();
            this.gridApi.setServerSideDatasource(this.serverSide);
          }
        }
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1 ? 'los ' + items.length + 'GPSs' : 'El GPS',
              eliminadaOs: 'seleccionados',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1 ? 'los ' + items.length + 'GPSs' : 'El GPS',
            eliminadaOs: 'seleccionados',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarGPS() {
    this.loadingService.showLoading();
    try {
      const delGps = await this.axiosGps.http.delete(
        `${this.controller}/${this.editedIndex}`
      );
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.eliminar', {
          entidad: 'El GPS',
          nombre: config.getValorCelda(
            this.gridApi,
            this.editedIndex,
            'numeroSerie'
          ),
          eliminadaO: 'eliminado',
        })
      );
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'el GPS',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'numeroSerie'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'el GPS',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'numeroSerie'
            ),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  closeModal(val: boolean) {
    this.dialogEliminar = val;
  }

  gpsModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 0);
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosGps
        .http(`${this.controller}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'GPS.csv',
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

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

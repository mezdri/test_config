<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Tipo de Vehículos</v-tab>
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
            v-show="accionCrear.visible"
            class="btn-crear"
            @click="(editedItem = {}), (showModalNew = true)"
            style="padding-right:20px;"
          >
            <v-icon dark left style="color=black">add_circle_outline</v-icon>
            <span>Crear</span>
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

    <app-tipoVehiculo-modal-nuevo
      :show="showModalNew"
      :esEdicion="modalEsEdicion"
      :etiquetas="editedItem"
      v-on:modalAsociacionEmit="tipoVehiculoModalCallback($event)"
    ></app-tipoVehiculo-modal-nuevo>

    <app-tipoVehiculo-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :tipoVehiculo="editedItem"
      v-on:modalAsociacionEmit="tipoVehiculoModalCallback($event)"
    ></app-tipoVehiculo-modal-edicion>

    <app-confirmacion
      :show="dialogEliminarIndividual"
      :titulo="tituloEliminarIndividual"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', { entidad: 'el Tipo de Vehículo' })
      "
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <!-- <app-confirmacion
      :show="dialogEliminarMasivo"
      :titulo="tituloEliminarMasivo"
      :mensaje="mensajeEliminarMasivo"
      v-on:modalConfirmationEmit="confirmCallbackEliminarSeleccionadas($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion> -->

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              <v-card-text v-if="eliminaIndividual"
                >Eliminar Tipo de Vehículo:
                {{ nombreTipoVehiculo }}</v-card-text
              >
              <v-card-text v-if="eliminaMasivo"
                >Eliminar Tipos de Vehículos</v-card-text
              >
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaMasivo">{{
              mensajeEliminaMasivo
            }}</v-card-text>
            <v-card-text v-if="eliminaIndividual">{{
              mensajeEliminaIndividual
            }}</v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              depressed
              small
              @click="dialogErrorAsoc = false"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import store from '@/store';
import config from '../../config/index';
import { ITipoVehiculo } from '../../interfaces/Vehiculos';
import Confirmation from '../../components/Confirmation.vue';
import MenuItem from '../../components/MenuItem.vue';
import { Component, Watch } from 'vue-property-decorator';
import TipoVehiculoModalEdicion from '@/components/plataforma/TipoVehiculoModalEdicion.vue';
import TipoVehiculoModalNuevo from '@/components/plataforma/TipoVehiculoModalNuevo.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { eventBus, actionsEvent } from '../../setup';
import HandleErrors from '../../config/handleErrors';
import { EstadoEntidad, Accion } from '../../config/enums';
import { IToolPanelParams } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import {
  Grid,
  GridOptions,
  GridApi,
  ColumnApi,
  DetailGridInfo,
  ColDef,
  IDatasource,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
} from 'ag-grid-community';
import { LocaleMessages } from 'vue-i18n';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-tipoVehiculo-modal-nuevo': TipoVehiculoModalNuevo,
    'app-tipoVehiculo-modal-edicion': TipoVehiculoModalEdicion,
  },
})
export default class TipoVehiculo extends ComponenteBase {
  // Permisos
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoDeVehiculo;
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
  // Grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  gridOptions: GridOptions;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  serverSide: any;

  // Axios
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  readonly controller: string = 'VehiculoTipo';

  // Componentes
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

  // Interfaces
  tipoVehiculo: ITipoVehiculo[] = [];
  tipoVehiculoAsociacion: ITipoVehiculo = {};
  editedItem: ITipoVehiculo = {};
  defaultItem: ITipoVehiculo = {};

  // Mensajes
  dialogEliminarIndividual: boolean = false;
  tituloEliminarIndividual: any = '';
  mensajeEliminarIndividual: string = '';
  dialogEliminarMasivo: boolean = false;
  tituloEliminarMasivo: any = '';
  mensajeEliminarMasivo: any = '';
  eliminaMasivo: Boolean = false;
  eliminaIndividual: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  mensajeEliminaMasivo: string = '';

  // Variables globales
  search: String = '';
  muestraBarraBotones: boolean = false;
  localeText: any = config.agGridTextos;
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();
  selected: any = [];
  validForm: Boolean = true;
  date: any = null;
  menuDatePicker: Boolean = false;
  dialog: Boolean = false;
  dialogAsociacion: Boolean = false;
  editedIndex: number = -1;
  $snotify: any;
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  cantidadEliminarMasivo: number = 0;
  vehiculosAsociados: number = 0;
  nombreTipoVehiculo: string = '';
  clienteId: number = config.getClienteSesion();
  chequearPermisosBtnCrear: boolean = false;
  intervalo: any; //Intervalo para el buscador

  // Exportar
  paramsExportar: any;

  constructor() {
    super();
    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };
    const self = this;

    this.columnDefs = [
      {
        ...checkboxColumnDef,
        cellStyle: function(params) {
          return { textAlign: 'center', 'pointer-events': 'none' };
        },
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
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 205,
        minWidth: 80,
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
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
        width: 165,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'nombreModificador',
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
        width: 165,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
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
        filter: false,
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
        suppressMovable: true,
      },
    ];

    this.localeText = config.agGridTextos;

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      sideBar: this.sideBar,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      suppressCsvExport: true,
      suppressExcelExport: true,
      onSelectionChanged: this.onSelectionChanged,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
    };
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  mounted() {
    eventBus.changeTitlePage('Tipo de Vehiculo');
  }

  created() {
    this.initialize();
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
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.ServerSideControler();
    });
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
  }

  closeModalEliminarIndividual() {
    this.dialogEliminarIndividual = false;
  }

  closeModalEliminarMasivo() {
    this.dialogEliminarMasivo = false;
  }

  tipoVehiculoModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.recargarGrilla();
    }, 0);
  }

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.TipoDeVehiculo) {
        if (data.action == Accion.Eliminar) {
          // Eliminacion individual

          this.editedIndex = data.id;
          this.muestraBarraBotones = false;

          let model: any = [];
          model.push({
            Id: data.id,
          });
          this.nombreTipoVehiculo = `${config.getValorCelda(
            this.gridApi,
            data.id,
            'nombre'
          )}`;
          this.axios.http
            .post(`${this.controller}/vehiculo/`, model)
            .then(res => {
              this.vehiculosAsociados = res.data.cantidadVehiculos;

              // Eliminación individual y sin asociaciones
              if (this.vehiculosAsociados === 0) {
                this.dialogEliminarIndividual = true;
                this.tituloEliminarIndividual = `Eliminar Tipo de Vehículo: ${this.nombreTipoVehiculo}`;

                // Eliminación individual y con asociaciones
              } else {
                this.dialogErrorAsoc = true;
                this.eliminaIndividual = true;
                this.mensajeEliminaIndividual =
                  'El Tipo de Vehículo está asociado a ' +
                  (this.vehiculosAsociados > 1
                    ? this.vehiculosAsociados + ' Vehículos, '
                    : 'un Vehículo, ') +
                  'por esta razón no se podrá realizar la eliminación.';
                this.eliminaMasivo = false;
              }
            })
            .catch(error => {
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.handleErrors.showError(
                    error,
                    'Ha ocurrido un problema al intentar eliminar el Tipo de Vehículo'
                  );
                }
              } else {
                this.handleErrors.showError(
                  error,
                  'Ha ocurrido un problema al intentar eliminar el Tipo de Vehículo'
                );
              }
            });
        } else if (
          data.action === Accion.Editar ||
          data.action === Accion.VerDetalle
        ) {
          // Editar - Ver Detalle

          this.modalEsEdicion = data.action == Accion.Editar;
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
      }
    });
  }

  recargarGrilla() {
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  ServerSideControler() {
    const self = this;
    this.serverSide = {
      getRows(params: any): void {
        params.request.search = self.search;
        params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
        self.paramsExportar = params; //Parametros al Exportar
        const idFilasSeleccionadas = self.gridApi
          .getSelectedRows()
          .map(x => x.id);
        self.axios.http
          .get(`${self.controller}/grid`, {
            params: params.request,
          })
          .then(tipoVehiculo => {
            if (tipoVehiculo.data.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              params.successCallback(
                tipoVehiculo.data.data,
                tipoVehiculo.data.lastRow
              );
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
            self.loadingService.hideLoading();
          })
          .catch(err => {
            params.failCallback();
            self.loadingService.hideLoading();
          });
      },
    };

    this.recargarGrilla();
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminarIndividual = false;
    let id = this.editedIndex;
    let model: any = [];
    model.push({
      Id: id,
    });

    if (val) {
      try {
        this.loadingService.showLoading();
        const res = await this.axios.http.delete(`${this.controller}/`, {
          data: model,
        });

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Tipo de Vehículo',
            nombre: config.getValorCelda(this.gridApi, id, 'nombre') + ' ',
            eliminadaO: 'eliminado',
          })
        );

        this.closeModalEliminarIndividual();
        this.recargarGrilla();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'el Tipo de Vehículo',
                nombre: config.getValorCelda(this.gridApi, id, 'nombre'),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'el Tipo de Vehículo',
              nombre: config.getValorCelda(this.gridApi, id, 'nombre'),
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axios
        .http(`${this.controller}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'TipoDeVehiculo.csv',
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

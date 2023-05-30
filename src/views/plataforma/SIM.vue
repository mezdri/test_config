<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab v-if="showTabGPS" :href="`#tab-1`" to="/gps">GPS</v-tab>
      <v-tab :href="`#tab-2`">SIM</v-tab>
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
    <div>
      <v-layout
        row
        wrap
        v-if="muestraBarraBotones"
        class="animated fadeIn fast"
      >
        <v-flex md3>
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
      </v-layout>
    </div>
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
    <app-nueva-sim
      :show="showModalNew"
      :sim="editedItem"
      v-on:modalAsociacionEmit="simModalCallback($event)"
    ></app-nueva-sim>
    <app-edicion-sim
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :sim="editedItem"
      v-on:modalAsociacionEmit="simModalCallback($event)"
    ></app-edicion-sim>
    <div class="text-xs-center">
      <v-dialog v-model="dialogNoPuedeEliminar" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloEliminarSimValidacion }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text v-if="dataEliminarSimGps.length === 0">
            {{ mensajeEliminarSimValidacion }}
          </v-card-text>
          <v-card-text
            v-if="dataEliminarSimGps.length > 0 && mensajeMasivo === 1"
          >
            <span v-for="item in dataEliminarSimGps" :key="item.IdSim">
              La SIM está asociada a un GPS, por esta razón no se podrá realizar
              la eliminación.
            </span>
          </v-card-text>
          <v-card-text
            v-if="dataEliminarSimGps.length > 0 && mensajeMasivo > 1"
          >
            <span>
              Las SIMs están asociadas a un GPS, por esta razón no se podrá
              realizar la eliminación.
            </span>
            <br />
            <br />
            <ul>
              <li v-for="item in dataEliminarSimGps" :key="item.IdSim">
                La SIM: {{ item.NombreSim }} está asociada a
                {{
                  item.CantidadGPS > 1 ? item.CantidadGPS + ' GPSs' : 'un GPS'
                }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              small
              color="primary"
              @click="
                dataEliminarSimGps = [];
                dialogNoPuedeEliminar = false;
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
import moment from 'moment';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import HandleErrors from '@/config/handleErrors';
import SimModalEdicion from '@/components/plataforma/SimModalEdicion.vue';
import SimModalNuevo from '@/components/plataforma/SimModalNuevo.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoSim, Accion } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { ISim } from '@/interfaces/Sim';
import { eventBus, actionsEvent } from '@/setup';
import { EstadoEntidad } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import store from '@/store';
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
import { ComponenteBase } from '@/views/base/ComponenteBase';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-nueva-sim': SimModalNuevo,
    'app-edicion-sim': SimModalEdicion,
  },
})
export default class SIM extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.SIM;
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
  tabModel: string = 'tab-2';
  modalEsEdicion: boolean = false;
  localeText = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();

  sideBar = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  showConfigVista: boolean = false;
  dialogNoPuedeEliminar: boolean = false;
  mensajeEliminar: any = '';
  mensajeEliminarSimValidacion: string = '';
  deleteMasivo: boolean = false;
  vehiculosAsociadosFlotas: any = [];
  cantidadVehiculosEliminaMasivo: number = 0;
  dialogEliminacionMasivaValida: boolean = false;
  dialogConfirmaEliminar: boolean = false;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  showModalCambioEstado: boolean = false;
  muestraBarraBotones: boolean = false;
  clienteId: number = config.getClienteSesion();
  showTabGPS: boolean = true;
  tituloEliminarSimValidacion: string = '';

  $snotify: any;
  search: string = '';
  sims: ISim[] = [];
  //modal eliminar
  tituloEliminar: any = '';
  dialogEliminar: Boolean = false;
  editedIndex: number = -1;
  editedItem: ISim = {};
  defaultItem: ISim = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  gridOptions: GridOptions;
  serverSide: any;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  nombreFlotaEliminar: string = '';
  dataEliminarSimGps: any = [];
  mensajeMasivo: any = [];
  intervalo: any; //Intervalo para el buscador
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  SimController: string = 'Sim';

  //Permisos crear
  chequearPermisosBtnCrear: boolean = true;
  paramsExportar: any; //Parametros para Exportar

  constructor() {
    super();

    this.dataEliminarSimGps = [];

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
        resizable: false,
        sortable: false,
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
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
        headerName: 'Nro. SIM',
        field: 'numeroSIM',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Tipo SIM',
        field: 'tipoSimNombre',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Cía. de Telecomunicaciones',
        field: 'companiaTelecomunicaciones',
        cellRenderer: (r: any) => {
          return r.data.companiaTelecomunicaciones !== undefined
            ? r.data.companiaTelecomunicaciones.toUpperCase()
            : '';
        },
        resizable: true,
        width: 230,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Teléfono Celular',
        field: 'numeroTelefonico',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Marca GPS',
        field: 'marcaGps',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Modelo GPS',
        field: 'modeloGps',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'IMEI GPS',
        field: 'imeiGps',
        width: 170,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 175,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 180,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        width: 170,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Acciones',
        width: 120,
        minWidth: 120,
        enablePivot: false,
        filter: false,
        resizable: false,
        sortable: false,
        field: 'id',
        pinned: 'right',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        rowDrag: false,
        lockVisible: true,
        suppressMovable: true,
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
      suppressCopyRowsToClipboard: true,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
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
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  mounted() {
    eventBus.changeTitlePage('SIM');
    this.showTabGPS = config.chequeaPermisosTabs(
      Funcionalidades.GPS,
      config.getClienteSesion()
    );
  }

  created() {
    this.initialize();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows();
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

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
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
          const idFilasSeleccionadas = self.gridApi
            .getSelectedRows()
            .map(x => x.id);
          self.axios
            .http(`${self.SimController}/${self.clienteId}/grid`, {
              params: params.request,
            })
            .then(sims => {
              if (sims.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(sims.data.data, sims.data.lastRow);
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

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;

    if (val) {
      if (this.deleteMasivo) {
        await this.eliminarSimMasivo(); //Eliminación Masiva
      } else {
        await this.eliminarSim(); //Eliminación Única
      }
    }

    this.deleteMasivo = false;
  }

  async eliminarItem() {
    this.loadingService.showLoading();
    try {
      const resGps = await this.axios.http.get(
        `${this.SimController}/${this.editedIndex}`
      );
      const cantidadGps = resGps.data.gpsSims.filter(
        (x: any) => x.fechaFinAsociacion == null
      );
      if (cantidadGps.length > 0) {
        this.tituloEliminarSimValidacion =
          'Eliminar SIM: ' +
          config.getValorCelda(this.gridApi, this.editedIndex, 'numeroSIM');
        this.mensajeEliminarSimValidacion =
          'La SIM está asociada a un GPS, por esta razón no se podrá realizar la eliminación.';
        this.dialogNoPuedeEliminar = true;
      } else {
        this.dialogEliminar = true;
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'la SIM',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'numeroSIM'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la SIM',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'numeroSIM'
            ),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarSim() {
    this.loadingService.showLoading();
    try {
      const delSIM = await this.axios.http.delete(
        `${this.SimController}/${this.editedIndex}`
      );
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.eliminar', {
          entidad: 'La SIM',
          nombre: config.getValorCelda(
            this.gridApi,
            this.editedIndex,
            'numeroSIM'
          ),
          eliminadaO: 'eliminada',
        })
      );
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'la SIM',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'numeroSIM'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la SIM',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'numeroSIM'
            ),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarSimMasivo() {
    this.loadingService.showLoading();
    try {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index = 0;
        var items = this.gridApi.getSelectedNodes();

        for (let i = 0; i <= items.length - 1; i++) {
          const delSIM = await this.axios.http.delete(
            `${this.SimController}/${items[i].data.id}`
          );
          index = index + 1;
          if (index == items.length) {
            this.muestraBarraBotones = false;
            let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Las ' + items.length + ' SIMs seleccionadas'
                  : 'La SIM seleccionada',
              eliminadaOs: items.length > 1 ? 'eliminadas' : 'eliminada',
            });
            if (items.length === 1) {
              msj = msj.toString().replace('han', 'ha');
            }
            this.$snotify.success(msj);
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
                items.length > 1 ? 'Las ' + items.length + ' SIMs' : 'La SIM',
              eliminadaOs: items.length > 1 ? 'seleccionadas' : 'seleccionada',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1 ? 'Las ' + items.length + ' SIMs' : 'La SIM',
            eliminadaOs: items.length > 1 ? 'seleccionadas' : 'seleccionada',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.showModalNew = false;
    this.showModalEdit = false;
  }

  simModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;

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

      this.axios
        .http(`${this.SimController}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'SIM.csv',
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

  async eliminarSeleccionadas() {
    const items = this.gridApi.getSelectedNodes();
    this.mensajeMasivo = items.length;

    this.loadingService.showLoading();
    try {
      if (this.gridApi.getSelectedNodes().length > 0) {
        //valida asociaciones con gps
        let model: any = [];
        items.forEach((sim: RowNode) => {
          model.push({
            Id: sim.data.id,
            NumeroSIM: sim.data.numeroSIM,
            TipoSim: 0,
            IMEI: '',
            CompaniaTelecomunicaciones: '',
            NumeroTelefonico: '',
            Estado: EstadoEntidad.Activo,
          });
        });

        const resGPS = await this.axios.http.post(
          `${this.SimController}/getGpsFromSims`,
          model
        );
        let data: any = [];

        resGPS.data.forEach((item: any) => {
          if (data.length == 0) {
            data.push({
              IdSim: item.simId,
              NombreSim: model.filter((x: any) => x.Id === item.simId)[0]
                .NumeroSIM,
              CantidadGPS: resGPS.data.filter(
                (x: any) =>
                  x.simId == item.simId && x.fechaFinAsociacion == null
              ).length,
            });
          } else {
            let cant = data.filter((x: any) => x.IdSim == item.simId);
            if (cant.length === 0) {
              data.push({
                IdSim: item.simId,
                NombreSim: model.filter((x: any) => x.Id === item.simId)[0]
                  .NumeroSIM,
                CantidadGPS: resGPS.data.filter(
                  (x: any) =>
                    x.simId == item.simId && x.fechaFinAsociacion == null
                ).length,
              });
            }
          }
        });
        let cantidad = data.filter((x: any) => x.CantidadGPS > 0);
        if (cantidad.length > 0) {
          if (items.length === 1) {
            this.tituloEliminarSimValidacion =
              'Eliminar SIM: ' + items[0].data.numeroSIM;
          } else {
            this.tituloEliminarSimValidacion = 'Eliminar SIMs';
          }
          // declara valores para modal mensaje de validacion masivo

          this.dataEliminarSimGps = data;
          this.dialogNoPuedeEliminar = true;
        } else {
          if (this.gridApi.getSelectedNodes().length === 1) {
            this.deleteMasivo = true;
            this.tituloEliminar =
              'Eliminar SIM: ' +
              this.gridApi.getSelectedNodes()[0].data.numeroSIM;
            this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
              entidad: 'la SIM',
            });
            this.dialogEliminar = true;
          } else {
            this.deleteMasivo = true;
            this.tituloEliminar = 'Eliminar SIMs';
            this.mensajeEliminar = this.$t(
              'mensajes.crud.eliminarMasivo.mensaje',
              {
                los_cantidad_entidad_seleccionados:
                  this.gridApi.getSelectedNodes().length > 1
                    ? 'las ' +
                      this.gridApi.getSelectedNodes().length +
                      ' SIMs seleccionadas'
                    : 'la SIM seleccionada',
              }
            );
            this.dialogEliminar = true;
          }
        }
      }
    } catch (error) {
      this.$snotify.error(
        this.$t('mensajes.mensajesError.eliminarMasivo', {
          los_cantidad_entidad_seleccionados:
            items.length > 1 ? 'Las ' + items.length + ' SIMs' : 'La SIM',
          eliminadaOs: items.length > 1 ? 'seleccionadas' : 'seleccionada',
        })
      );
    } finally {
      this.loadingService.hideLoading();
    }
  }

  redirect(url: string) {
    if (url != null) this.$router.push(url);
  }

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: 'la SIM',
        });

        this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'SIM',
          nombreEntidad: config.getValorCelda(
            this.gridApi,
            data.id,
            'numeroSIM'
          ),
        });
        this.editedIndex = data.id;
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

        this.gridApi.forEachNode(function(rowNode: any) {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            return true;
          }
        });

        if (item != null) {
          this.editedItem = item;
          this.showModalEdit = true;
        }
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

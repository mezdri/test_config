<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`" v-if="showTabZonas" to="/zonas">Zonas</v-tab>
      <v-tab :href="`#tab-2`">Grupo de Zonas</v-tab>
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
            <v-icon dark left style="color=black">add_circle_outline</v-icon>
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
      <div v-if="accionEliminar">
        <v-flex md3>
          <v-btn flat small class="btn-barra" @click="eliminarMasivoConfirm">
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
    <!-- CONFIRMACION ELIMINACION ITEM TIPO LUGAR -->
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="titleEliminarItem"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', { entidad: 'el Grupo de Zonas' })
      "
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
      :width="390"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmEliminarSeleccionadas"
      :titulo="tituloDeleteMasivo"
      :mensaje="mensajeMasivo"
      v-on:modalConfirmationEmit="confirmCallbackEliminarSeleccionadas($event)"
      :textoBtnSi="$t('mensajes.crud.eliminarMasivo.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminarMasivo.btnCancelar')"
    ></app-confirmacion>
    <app-tipolugar-modal-nuevo
      :show="showModalNew"
      :tiposlugar="editedItem"
      v-on:modalAsociacionEmit="tipolugarModalCallback($event)"
    ></app-tipolugar-modal-nuevo>
    <app-tipolugar-modal-edicion
      :show="showModalEdit"
      :tiposlugar="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="tipolugarModalCallback($event)"
    ></app-tipolugar-modal-edicion>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent :max-width="390">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              v-if="eliminaMasivo"
              >Eliminar Grupos de Zonas</v-toolbar-title
            >
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              v-if="eliminaIndividual"
              >Eliminar Grupo de Zonas: {{ name }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>

          <v-card-text v-if="eliminaMasivo">
            <span v-if="cantidadCoordenadasAsociadas === 1">
              Los Grupos de Zonas tienen una Zona asociada, por esta razón no se
              podrá realizar la eliminación.
            </span>
            <span v-if="cantidadCoordenadasAsociadas > 1">
              Los Grupos de Zonas tienen
              {{ cantidadCoordenadasAsociadas }} Zonas asociadas, por esta razón
              no se podrá realizar la eliminación.
            </span>
          </v-card-text>

          <v-card-text v-if="eliminaIndividual">
            <span v-if="cantidadCoordenadasAsociadas === 1">
              El Grupo de Zonas tiene una Zona asociada, por esta razón no se
              podrá realizar la eliminación.
            </span>
            <span v-if="cantidadCoordenadasAsociadas > 1">
              El Grupo de Zonas tiene {{ cantidadCoordenadasAsociadas }} Zonas
              asociadas, por esta razón no se podrá realizar la eliminación.
            </span>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="dialogErrorAsoc = false">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsocBase" persistent :max-width="390">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              v-if="eliminaMasivo"
              >Eliminar Grupos de Zonas</v-toolbar-title
            >
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              v-if="eliminaIndividual"
              >Eliminar Grupo de Zonas: {{ name }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>

          <v-card-text v-if="eliminaMasivo">
            <span>
              Uno de los Grupos de Zonas que desea eliminar es un Grupo de Zonas
              por defecto, por esta razón no se podrá realizar la eliminación.
            </span>
            <br />
            <br />
            <ul>
              <li>{{ name }}</li>
            </ul>
          </v-card-text>
          <v-card-text v-if="eliminaIndividual">
            <span>
              El Grupo de Zonas que desea eliminar es un Grupo de Zonas por
              defecto, por esta razón no se podrá realizar la eliminación.
            </span>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="dialogErrorAsocBase = false">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import store from '@/store';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { ITipoLugar } from '@/interfaces/Zonas';
import { eventBus, actionsEvent } from '@/setup';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import TipolugarModalNuevo from '@/components/plataforma/TipolugarModalNuevo.vue';
import TipolugarModalEdicion from '@/components/plataforma/TipolugarModalEdicion.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion, EstadoEntidad } from '@/config/enums';
import ImportFile from '@/components/ImportFile.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
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
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-tipolugar-modal-nuevo': TipolugarModalNuevo,
    'app-tipolugar-modal-edicion': TipolugarModalEdicion,
    'app-import': ImportFile,
  },
})
export default class TipoLugar extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeZona;
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
  readonly controller: string = 'grupodezona';
  readonly controllerCoord: string = 'coordenada';

  tabModel: string = 'tab-2';
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  muestraBarraBotones: boolean = false;
  loadingService = new LoadingService();
  showTabZonas: boolean = true;

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  gridOptions: GridOptions;

  showModalNew: boolean = false;
  showModalEdit: boolean = false;

  $snotify: any;
  tiposlugar: ITipoLugar[] = [];

  dataTiposLugar: ITipoLugar[] = [];

  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  dialogErrorAsocBase: Boolean = false;
  eliminaMasivo: Boolean = false;
  eliminaIndividual: Boolean = false;
  cantidadCoordenadasAsociadas: number = 0;

  search: String = '';
  editedIndex: number = -1;
  editedName: String = '';
  name: String = '';
  editedItem: ITipoLugar = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  serverSide: any;

  titleEliminarItem: any = '';
  mensajeMasivo: any = '';
  tituloDeleteMasivo: any = '';

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;
  intervalo: any; //Intervalo para el buscador
  paramsExportar: any; //Parametros para Exportar

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
        ...checkboxColumnDef,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
      },
      {
        headerName: 'Código',
        field: 'id',
        sortable: true,
        resizable: true,
        minWidth: 80,
        hide: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        width: 219,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        width: 218,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        sortable: true,
        resizable: true,
        width: 218,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 218,
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
        width: 226,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 236,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        width: 170,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
        hide: true,
      },
      {
        headerName: 'Acciones',
        width: 120,
        minWidth: 120,
        sortable: false,
        resizable: false,
        filter: false,
        enablePivot: false,
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
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onGridReady: this.onGridReady,
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
    eventBus.changeTitlePage('Grupos de Zonas');
    this.showTabZonas = config.chequeaPermisosTabs(
      Funcionalidades.Zonas,
      config.getClienteSesion()
    );
  }

  created() {
    this.initialize();
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
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
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.ServerSideControler();
    });
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

  deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      this.loadingService.showLoading();

      //Eliminación
      this.axiosGps.http
        .delete(`${this.controller}/${this.editedIndex}`)
        .then(res => {
          this.loadingService.hideLoading();
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.eliminar', {
              entidad: 'El Grupo de Zonas',
              nombre: this.editedName,
              eliminadaO: 'eliminado',
            })
          );

          setTimeout(() => {
            this.ServerSideRefresh();
          }, 0);
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.handleErrors.showError(
                error,
                'Ha ocurrido un problema al intentar eliminar el Grupo de Zonas.'
              );
            }
          } else {
            this.handleErrors.showError(
              error,
              'Ha ocurrido un problema al intentar eliminar el Grupo de Zonas.'
            );
          }
        });
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.dialogConfirmEliminarSeleccionadas = val;
  }

  tipolugarModalCallback(val: boolean) {
    this.muestraBarraBotones = false;

    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.ServerSideRefresh();
    }, 0);
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosGps.http
        .get(`${this.controller}/${config.getClienteSesion()}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          let resp = JSON.parse(respServer.data);
          config.crearArchivoCsv(
            'GrupoDeZonas.csv',
            resp.data,
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
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.funcionalidad === Funcionalidades.GrupoDeZona) {
        if (data.action == Accion.Eliminar) {
          //Eliminar
          let item: any = null;
          let asociations: any = 0;
          let nombre: string = '';
          this.gridApi.forEachNode(function(rowNode: any, index: number) {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              nombre = item.nombre;
              return true;
            }
          });
          this.editedName = nombre;
          this.axiosGps.http
            .get(`${this.controllerCoord}/${data.id}/activeCoords`)
            .then(res => {
              this.name = this.getValorCelda(data.id, 'nombre');
              this.cantidadCoordenadasAsociadas = res.data.length;
              if (this.cantidadCoordenadasAsociadas == 0) {
                this.dialogEliminar = true;
                this.editedIndex = data.id;
                this.titleEliminarItem = this.$t(
                  'mensajes.crud.eliminar.titulo',
                  {
                    entidad: 'Grupo de Zonas',
                    nombreEntidad: this.getValorCelda(data.id, 'nombre'),
                  }
                );
              } else {
                this.dialogErrorAsoc = true;
                this.eliminaIndividual = true;
                this.eliminaMasivo = false;
              }
            })
            .catch(error => {
              //this.handleErrors.showError(error, "Ha ocurrido un problema al intentar eliminar el Grupo de Zonas");
            });
        } else if (
          data.action == Accion.Editar ||
          data.action == Accion.VerDetalle
        ) {
          //Editar
          if (data.action == Accion.Editar) this.modalEsEdicion = true;
          else this.modalEsEdicion = false;

          this.editedIndex = data.id;

          let item: any = null;
          this.gridApi.forEachNode(function(rowNode: any, index: number) {
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
      }
    });
  }

  //FUNCIONES UTILES ////////////////////////////////////////////////////////////////
  ServerSideRefresh() {
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
        self.axiosGps.http
          .get(`${self.controller}/${config.getClienteSesion()}/grid`, {
            params: params.request,
          })
          .then(tipolugar => {
            let res = JSON.parse(tipolugar.data);
            if (res.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              params.successCallback(res.data, res.lastRow);
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
            params.failCallback();
            self.loadingService.hideLoading();
          });
      },
    };

    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  eliminarSeleccionadas() {
    if (this.gridApi.getSelectedNodes().length > 0) {
      let index = 0;
      const items = this.gridApi.getSelectedNodes();
      this.loadingService.showLoading();

      for (let i = 0; i <= items.length - 1; i++) {
        this.axiosGps.http
          .delete(`${this.controller}/${items[i].data.id}`)
          .then(res => {
            index = index + 1;
            if (index == items.length) {
              this.loadingService.hideLoading();
              this.muestraBarraBotones = false;
              let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'Los ' + items.length + ' Grupos de Zonas seleccionados'
                    : 'El Grupo de Zonas ' + items[0].data.nombre,
                eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
              });
              if (items.length === 1) {
                msj = msj.toString().replace('han', 'ha');
              }
              this.$snotify.success(msj);
              this.ServerSideRefresh();
            }
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.handleErrors.showError(
                  err,
                  'Ha ocurrido un problema al intentar eliminar los grupos de zonas seleccionados'
                );
              }
            } else {
              this.handleErrors.showError(
                err,
                'Ha ocurrido un problema al intentar eliminar los grupos de zonas seleccionados'
              );
            }
          });
      }
    }
  }

  confirmCallbackEliminarSeleccionadas(val: boolean, close: boolean = false) {
    this.dialogConfirmEliminarSeleccionadas = false;
    if (val) {
      //Eliminación
      this.eliminarSeleccionadas();
    } else {
      this.gridApi.deselectAll();
    }
  }

  eliminarMasivoConfirm() {
    if (this.gridApi.getSelectedNodes().length > 0) {
      let index = 0;
      const items = this.gridApi.getSelectedNodes();
      this.cantidadCoordenadasAsociadas = 0;

      for (let i = 0; i <= items.length - 1; i++) {
        if (items[i].data.estado === EstadoEntidad.Sistema) {
          if (items.length === 1) {
            this.eliminaMasivo = false;
            this.eliminaIndividual = true;
            this.name = this.gridApi.getSelectedNodes()[0].data.nombre;
            this.dialogErrorAsocBase = true;
          } else {
            this.eliminaMasivo = true;
            this.eliminaIndividual = false;
            this.name = 'Grupo de Zonas Base';
            this.tituloDeleteMasivo = 'Eliminar Grupos de Zonas';
            this.dialogErrorAsocBase = true;
          }
        } else {
          this.axiosGps.http
            .get(`${this.controllerCoord}/${items[i].data.id}/activeCoords`)
            .then(res => {
              this.cantidadCoordenadasAsociadas += res.data.length;
              index = index + 1;
              if (index == items.length) {
                if (this.cantidadCoordenadasAsociadas == 0) {
                  // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
                  if (this.gridApi.getSelectedNodes().length === 1) {
                    this.tituloDeleteMasivo =
                      'Eliminar Grupo de Zona: ' +
                      this.gridApi.getSelectedNodes()[0].data.nombre;
                    this.mensajeMasivo = this.$t(
                      'mensajes.crud.eliminar.mensaje',
                      { entidad: 'el Grupo de Zonas' }
                    );
                    this.dialogConfirmEliminarSeleccionadas = true;
                  } else {
                    this.tituloDeleteMasivo = this.$t(
                      'mensajes.crud.eliminarMasivo.titulo',
                      { entidad: 'Grupos de Zonas' }
                    );
                    this.mensajeMasivo = this.$t(
                      'mensajes.crud.eliminarMasivo.mensaje',
                      {
                        los_cantidad_entidad_seleccionados:
                          this.gridApi.getSelectedNodes().length > 1
                            ? 'los ' +
                              this.gridApi.getSelectedNodes().length +
                              ' Grupos de Zonas seleccionados'
                            : 'el Grupo de Zonas seleccionado',
                      }
                    );
                    this.dialogConfirmEliminarSeleccionadas = true;
                  }
                } else {
                  // mensaje de alerta al eliminar una zona con asociación por lote seleccionando solo 1, debe ser igual a la eliminacion individual
                  if (this.gridApi.getSelectedNodes().length === 1) {
                    this.name = items[0].data.nombre;
                    this.dialogErrorAsoc = true;
                    this.eliminaMasivo = false;
                    this.eliminaIndividual = true;
                  } else {
                    this.dialogErrorAsoc = true;
                    this.eliminaIndividual = false;
                    this.eliminaMasivo = true;
                  }
                }
              }
            })
            .catch(error => {
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.handleErrors.showError(
                    error,
                    'Ha ocurrido un problema al intentar eliminar los grupos de zonas'
                  );
                }
              } else {
                this.handleErrors.showError(
                  error,
                  'Ha ocurrido un problema al intentar eliminar los grupos de zonas'
                );
              }
            });
        }
      }
    }
  }

  getValorCelda(idItemEntidad: number, nombreColumna: string) {
    let grid = this.gridApi;
    if (grid != undefined) {
      let item: any = null;
      let res: any = '';

      grid.forEachNode(function(rowNode: any, index: number) {
        if (idItemEntidad == rowNode.data.id) {
          item = rowNode.data;
        }
      });
      if (item != null) {
        res = item[nombreColumna];
      }
      return res;
    }
    return '';
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

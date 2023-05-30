<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Zonas</v-tab>
      <v-tab :href="`#tab-2`" v-if="showTabGrupoZonas" to="/grupodezona"
        >Grupo de Zonas</v-tab
      >
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
      <div v-if="accionEliminar.visible">
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
        style="width: 100%; height: 400px;font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
    <!-- CONFIRMACION ELIMINACION ITEM ZONA -->
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="titleEliminarItem"
      :mensaje="mensajeConfirmacionIndividual"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmEliminarSeleccionadas"
      :titulo="tituloDeleteMasivo"
      :mensaje="mensajeMasivo"
      v-on:modalConfirmationEmit="confirmCallbackEliminarSeleccionadas($event)"
      :textoBtnSi="$t('mensajes.crud.eliminarMasivo.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminarMasivo.btnCancelar')"
    ></app-confirmacion>

    <app-zonas-modal-nuevo
      :show="showModalNew"
      :zona="editedItem"
      v-on:modalAsociacionEmit="zonaModalCallback($event)"
    ></app-zonas-modal-nuevo>

    <app-zonas-modal-edicion
      :show="showModalEdit"
      :zona="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="zonaModalCallback($event)"
    ></app-zonas-modal-edicion>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent :width="390">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              v-if="eliminaMasivo"
              style="font-size:17px;margin-left: 10px !important"
              >Eliminar Zonas</v-toolbar-title
            >
            <v-toolbar-title
              v-if="eliminaIndividual"
              style="font-size:17px;margin-left: 10px !important"
              >{{ this.tituloDeleteIndividual }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaMasivo">
              Al menos una de las Zonas es Geocerca y está asociada a uno o más
              Vehículos, por esta razón no se podrá realizar la eliminación.
            </v-card-text>
            <v-card-text v-if="eliminaIndividual">
              La Geocerca está asociada a
              {{
                cantidadVehiculosAsociados > 1
                  ? cantidadVehiculosAsociados + ' Vehículos,'
                  : ' un Vehículo,'
              }}
              por esta razón no se podrá realizar la eliminación.
            </v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="dialogErrorAsoc = false">
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
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { eventBus, actionsEvent } from '@/setup';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import {
  EstadoEntidad,
  FiltrosTiposZonas,
  Accion,
  TipoGeometria,
  TiposZonas,
  ServicioProxy,
} from '@/config/enums';

import ZonasModalNuevo from '@/components/plataforma/ZonasModalNuevo.vue';
import ZonasModalEdicion from '@/components/plataforma/ZonasModalEdicion.vue';

import { AxiosVue } from '@/AxiosVue';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import ImportFile from '@/components/ImportFile.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import store from '@/store';
import { IZona, ITipoZona } from '@/interfaces/Zonas';
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

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-zonas-modal-nuevo': ZonasModalNuevo,
    'app-zonas-modal-edicion': ZonasModalEdicion,
    'app-import': ImportFile,
  },
})
export default class Zonas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Zonas;
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
  readonly controller: string = 'Coordenada';
  readonly controllerGpsCoordenada: string = 'GpsCoordenada';

  tabModel: string = 'tab-1';
  clienteId: number = config.getClienteSesion();
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  rowData: any = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  muestraBarraBotones: boolean = false;
  loadingService = new LoadingService();

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  gridOptions: GridOptions;

  showModalNew: boolean = false;
  showModalEdit: boolean = false;

  $snotify: any;

  showModalCambioEstado: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];

  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;

  dialogErrorAsoc: Boolean = false;
  eliminaMasivo: Boolean = false;
  eliminaIndividual: Boolean = false;
  cantidadVehiculosAsociados: number = 0;

  search: String = '';
  editedIndex: number = -1;
  editedItem: IZona = {};
  editedName: String = '';
  defaultItem: IZona = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  serverSide: any;

  titleEliminarItem: any = '';
  mensajeConfirmacionIndividual: any = '';
  mensajeMasivo: any = '';
  nombreTipo: any = '';
  mensajeExitoEliminacion: any = '';
  mensajeErrorEliminacion: any = '';
  tituloDeleteMasivo: any = '';
  tituloDeleteIndividual: any = '';
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;

  showTabGrupoZonas: boolean = true;
  intervalo: any; //Intervalo para el buscador

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;

  //VARIABLES MANTENEDOR ------------------------------------------------------------------------------------
  filtroTipoZonaSelected: number = 0;
  filtrosTipoZona: ITipoZona[] = [];
  zonas: IZona[] = [];

  //---------------------------------------------------------------------------------------------------------
  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  //---------------------------------------------------------------------------------------------------------
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
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        suppressMenu: true,
        filter: false,
        suppressMovable: true,
        sortable: false,
        resizable: true,
        lockVisible: true,
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
        hide: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        resizable: true,
        width: 163,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 165,
        minWidth: 80,
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        sortable: true,
        resizable: true,
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
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'nombreModificador',
        sortable: true,
        resizable: true,
        width: 165,
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
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        width: 150,
        minWidth: 80,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Tipo de Zona',
        field: 'tipoZonaNombre',
        enablePivot: true,
        filter: false,
        resizable: true,
        width: 165,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Grupo de Zona',
        field: 'tipoLugarNombre',
        enablePivot: true,
        filter: false,
        resizable: true,
        width: 180,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Tipo Geometría',
        field: 'tipoGeometriaTxt',
        sortable: true,
        resizable: true,
        filter: false,
        hide: true,
        minWidth: 80,
        enablePivot: false,
        lockPinned: true,
      },
      {
        headerName: 'Coordenadas',
        field: 'formaJson',
        suppressMenu: true,
        sortable: false,
        resizable: false,
        filter: false,
        enablePivot: false,
        lockVisible: true,
        minWidth: 80,
        lockPinned: true,
        hide: true,
        headerClass: 'lock-pinned',
        toolPanelClass: 'lock-pinned',
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
      rowModelType: 'serverSide',
      suppressCopyRowsToClipboard: true,
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
  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  mounted() {
    eventBus.changeTitlePage('Zonas');

    this.showTabGrupoZonas = config.chequeaPermisosTabs(
      Funcionalidades.GrupoDeZona,
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
  }

  async deleteItemCallback(aceptado: boolean) {
    this.dialogEliminar = false;

    if (aceptado) {
      try {
        //Eliminación
        this.loadingService.showLoading();
        await this.axiosGps.http.delete(
          `${this.controller}/${this.editedIndex}`
        );
        this.$snotify.success(this.mensajeExitoEliminacion);

        setTimeout(() => {
          this.ServerSideRefresh();
        }, 0);
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(error, this.mensajeErrorEliminacion);
          }
        } else {
          this.handleErrors.showError(error, this.mensajeErrorEliminacion);
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.dialogConfirmEliminarSeleccionadas = val;
  }

  zonaModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;

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

      let tipoZonaSelected = this.filtroTipoZonaSelected;
      this.axiosGps.http
        .get(`${this.controller}/${this.clienteId}/grid/${tipoZonaSelected}`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Zonas.csv',
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
    this.obtenerFiltrosTiposZona();

    actionsEvent.$on('actionsEvent', async (data: any) => {
      if (data.funcionalidad === this.funcionalidad) {
        if (data.action === Accion.Eliminar) {
          let item: any = null;
          let nombre: string = '';
          this.gridApi.forEachNode(function(rowNode: RowNode, index: number) {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              nombre = item.nombre;
              return true;
            }
          });
          this.editedName = nombre;

          try {
            const response = await this.axiosGps.http.get(
              `${this.controllerGpsCoordenada}/${data.id}/activeAsoc`
            );
            this.cantidadVehiculosAsociados = response.data.length;

            if (this.cantidadVehiculosAsociados === 0) {
              this.dialogEliminar = true;
              this.editedIndex = data.id;
              this.nombreTipo = TiposZonas[item.tipoZonaId];
              this.titleEliminarItem = this.$t(
                'mensajes.crud.eliminar.titulo',
                {
                  entidad: this.nombreTipo,
                  nombreEntidad: this.getValorCelda(data.id, 'nombre'),
                }
              );

              let msjEliminacion = '';
              if (item.tipoZonaId == TiposZonas.Geocerca) {
                msjEliminacion = `la ${this.nombreTipo}`;
                this.mensajeExitoEliminacion = `La ${this.nombreTipo}: ${this.editedName} ha sido eliminada de forma exitosa`;
                this.mensajeErrorEliminacion = `Ha ocurrido un problema al intentar eliminar la ${this.nombreTipo}: ${this.editedName}`;
              } else {
                msjEliminacion = `el ${this.nombreTipo}`;
                this.mensajeExitoEliminacion = `El ${this.nombreTipo}: ${this.editedName} ha sido eliminado de forma exitosa`;
                this.mensajeErrorEliminacion = `Ha ocurrido un problema al intentar eliminar el ${this.nombreTipo}: ${this.editedName}`;
              }

              this.mensajeConfirmacionIndividual = this.$t(
                'mensajes.crud.eliminar.mensaje',
                { entidad: msjEliminacion }
              );
            } else {
              this.nombreTipo = TiposZonas[item.tipoZonaId];
              this.tituloDeleteIndividual =
                'Eliminar ' + this.nombreTipo + ': ' + this.editedName;
              this.dialogErrorAsoc = true;
              this.eliminaIndividual = true;
              this.eliminaMasivo = false;
            }
          } catch (error) {
            this.mensajeErrorEliminacion = `Ha ocurrido un problema al intentar eliminar el ${this.nombreTipo}: ${this.editedName}`;
          }
        } else if (
          data.action === Accion.Editar ||
          data.action === Accion.VerDetalle
        ) {
          this.modalEsEdicion = data.action === Accion.Editar;
          this.editedIndex = data.id;

          let item: any = null;
          this.gridApi.forEachNode(function(rowNode: RowNode, index: number) {
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

        let tipoZonaSelected = self.filtroTipoZonaSelected;
        self.axiosGps.http
          .get(
            `${self.controller}/${self.clienteId}/grid/${tipoZonaSelected}`,
            {
              params: params.request,
            }
          )
          .then(zona => {
            let res = zona.data;
            if (res.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              params.successCallback(res.data, res.lastRow);
              // if(self.valCheck != undefined)
              //   {
              //     self.idFilasSeleccionadas = [];
              //     self.valCheck.forEach((x:any) => {
              //       self.idFilasSeleccionadas.push(x.id);
              //     });
              //   }

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

      let msj: any = '';

      if (items.length === 1) {
        this.nombreTipo = TiposZonas[items[0].data.tipoZonaId];
        this.editedName = items[0].data.nombre;
        if (items[0].data.tipoZonaId === TiposZonas.Geocerca)
          msj = `La ${this.nombreTipo}: ${this.editedName} ha sido eliminada de forma exitosa`;
        else
          msj = `El ${this.nombreTipo}: ${this.editedName} ha sido eliminado de forma exitosa`;
      } else {
        msj =
          'Las ' + items.length + ' Zonas han sido eliminadas de forma exitosa';
      }

      for (let i = 0; i <= items.length - 1; i++) {
        this.axiosGps.http
          .delete(`${this.controller}/${items[i].data.id}`)
          .then(res => {
            index = index + 1;
            if (index == items.length) {
              this.loadingService.hideLoading();
              this.muestraBarraBotones = false;
              this.$snotify.success(msj);
              this.ServerSideRefresh();
            }
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.handleErrors.showError(
                  err,
                  'Ha ocurrido un problema al intentar eliminar las zonas seleccionadas.'
                );
              }
            } else {
              this.handleErrors.showError(
                err,
                'Ha ocurrido un problema al intentar eliminar las zonas seleccionadas.'
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
      this.cantidadVehiculosAsociados = 0;
      for (let i = 0; i <= items.length - 1; i++) {
        this.axiosGps.http
          .get(`${this.controllerGpsCoordenada}/${items[i].data.id}/activeAsoc`)
          .then(res => {
            this.cantidadVehiculosAsociados += res.data.length;
            index = index + 1;
            if (index == items.length) {
              if (this.cantidadVehiculosAsociados == 0) {
                // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual

                let itemGrilla: any = this.gridApi.getSelectedNodes()[0].data;
                this.nombreTipo = TiposZonas[itemGrilla.tipoZonaId];
                this.editedName = itemGrilla.nombre;
                let msjEliminacion = '';

                if (itemGrilla.tipoZonaId == TiposZonas.Geocerca) {
                  msjEliminacion = `la ${this.nombreTipo}`;
                  this.mensajeExitoEliminacion = `La ${this.nombreTipo}: ${this.editedName} ha sido eliminada de forma exitosa`;
                  this.mensajeErrorEliminacion = `Ha ocurrido un problema al intentar eliminar la ${this.nombreTipo}: ${this.editedName}`;
                } else {
                  msjEliminacion = `el ${this.nombreTipo}`;
                  this.mensajeExitoEliminacion = `El ${this.nombreTipo}: ${this.editedName} ha sido eliminado de forma exitosa`;
                  this.mensajeErrorEliminacion = `Ha ocurrido un problema al intentar eliminar el ${this.nombreTipo}: ${this.editedName}`;
                }

                if (this.gridApi.getSelectedNodes().length === 1) {
                  this.tituloDeleteMasivo = this.$t(
                    'mensajes.crud.eliminar.titulo',
                    {
                      entidad: this.nombreTipo,
                      nombreEntidad: this.gridApi.getSelectedNodes()[0].data
                        .nombre,
                    }
                  );
                  this.mensajeMasivo = this.$t(
                    'mensajes.crud.eliminar.mensaje',
                    { entidad: msjEliminacion }
                  );
                  this.dialogConfirmEliminarSeleccionadas = true;
                } else {
                  this.tituloDeleteMasivo = this.$t(
                    'mensajes.crud.eliminarMasivo.titulo',
                    { entidad: 'Zonas' }
                  );
                  this.mensajeMasivo = this.$t(
                    'mensajes.crud.eliminarMasivo.mensaje',
                    {
                      los_cantidad_entidad_seleccionados:
                        this.gridApi.getSelectedNodes().length > 1
                          ? 'las ' +
                            this.gridApi.getSelectedNodes().length +
                            ' Zonas seleccionadas'
                          : 'la Zona seleccionadaAAA',
                    }
                  );
                  this.dialogConfirmEliminarSeleccionadas = true;
                }
              } else {
                this.editedName = this.gridApi.getSelectedNodes()[0].data.nombre;

                // mensaje de alerta al eliminar una zona con asociación por lote seleccionando solo 1, debe ser igual a la eliminacion individual
                if (this.gridApi.getSelectedNodes().length === 1) {
                  this.nombreTipo =
                    TiposZonas[
                      this.gridApi.getSelectedNodes()[0].data.tipoZonaId
                    ];
                  this.tituloDeleteIndividual =
                    'Eliminar ' + this.nombreTipo + ': ' + this.editedName;
                  this.dialogErrorAsoc = true;
                  this.eliminaIndividual = true;
                  this.eliminaMasivo = false;
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
                  'Ha ocurrido un problema al intentar eliminar las Zonas.'
                );
              }
            } else {
              this.handleErrors.showError(
                error,
                'Ha ocurrido un problema al intentar eliminar las Zonas.'
              );
            }
          });
      }
    }
  }

  getValorCelda(idItemEntidad: number, nombreColumna: string) {
    let grid = this.gridApi;
    if (grid !== undefined) {
      let item: any = null;
      let res: any = '';

      grid.forEachNode(function(rowNode: RowNode) {
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

  obtenerFiltrosTiposZona() {
    let filtros: any[] = [];
    for (let item in FiltrosTiposZonas) {
      if (!isNaN(Number(item))) {
        let filtro: string = FiltrosTiposZonas[item];
        filtros.push({
          id: Number(item),
          nombre: filtro,
        });
      }
    }

    this.filtrosTipoZona = filtros;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}

.lock-pinned {
  color: rgba(0, 0, 0, 0.3);
}
</style>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Lugar de Interés</v-tab>
      <v-tab :href="`#tab-2`" v-if="showTabGrupoInteres" to="/grupodeinteres"
        >Grupo de Interés</v-tab
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
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
    <!-- CONFIRMACION ELIMINACION ITEM ZONA -->
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="titleEliminarItem"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Lugar de Interés',
        })
      "
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
    <app-lugarinteres-modal-nuevo
      :show="showModalNew"
      :lugarinteres="editedItem"
      v-on:modalAsociacionEmit="lugarinteresModalCallback($event)"
    ></app-lugarinteres-modal-nuevo>
    <app-lugarinteres-modal-edicion
      :show="showModalEdit"
      :lugarinteres="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="lugarinteresModalCallback($event)"
    ></app-lugarinteres-modal-edicion>
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { eventBus, actionsEvent } from '@/setup';

import {
  EstadoEntidad,
  FiltrosTiposLugarInteres,
  TipoGeometria,
} from '@/config/enums';
import LugarInteresModalNuevo from '@/components/plataforma/LugarInteresModalNuevo.vue';
import LugarInteresModalEdicion from '@/components/plataforma/LugarInteresModalEdicion.vue';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import ImportFile from '@/components/ImportFile.vue';
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

// IMPORTS PROPIOS DE ZONA
import { IZona, ITipoZona } from '@/interfaces/Zonas';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-lugarinteres-modal-nuevo': LugarInteresModalNuevo,
    'app-lugarinteres-modal-edicion': LugarInteresModalEdicion,
    'app-import': ImportFile,
  },
})
export default class LugarInteres extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.LugarInteres;
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

  tabModel: string = 'tab-1';
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
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
  showTabGrupoInteres: boolean = true;
  keyModalNuevo: number = 0;

  $snotify: any;

  showModalCambioEstado: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];

  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;
  tituloDeleteMasivo: any = '';
  mensajeDeleteMasivo: any = '';

  search: String = '';
  editedIndex: number = -1;
  editedName: String = '';
  editedItem: IZona = {};
  defaultItem: IZona = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  serverSide: any;

  titleEliminarItem: any = '';
  mensajeMasivo: any = '';

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  intervalo: any; //Intervalo para el buscador
  usuarioId: number = store.state.userId;

  //Permiso boton crear
  chequearPermisosBtnCrear: boolean = true;

  //VARIABLES MANTENEDOR ------------------------------------------------------------------------------------
  filtroTipoLugarInteresSelected: number = 0;
  filtrosTipoLugarInteres: ITipoZona[] = [];

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
        hide: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        lockPinned: true,
        width: 189,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Tipo Geometría',
        field: 'tipoGeometria',
        suppressMenu: true,
        sortable: false,
        resizable: false,
        filter: false,
        hide: true,
        width: 170,
        minWidth: 80,
        enablePivot: false,
        lockVisible: true,
        lockPinned: true,
        cellRenderer: (r: any) => {
          return TipoGeometria[r.data.tipoGeometria];
        },
      },
      {
        headerName: 'Dirección',
        field: 'direccion',

        sortable: true,
        width: 191,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
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
      },
      {
        headerName: 'Grupo de Interés',
        field: 'tipoLugarNombre',
        sortable: true,
        lockPinned: true,
        width: 191,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        sortable: true,
        resizable: true,
        width: 191,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 191,
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
        width: 191,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 191,
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
        lockVisible: false,
        width: 170,
        minWidth: 80,
        lockPinned: true,
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

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  mounted() {
    eventBus.changeTitlePage('Lugares de Interés');
    this.showTabGrupoInteres = config.chequeaPermisosTabs(
      Funcionalidades.GrupoDeInteres,
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
            'El Lugar de Interés ' +
              this.editedName +
              ' ha sido eliminado de forma exitosa'
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
                'Ha ocurrido un problema al intentar eliminar el lugar de interés'
              );
            }
          } else {
            this.handleErrors.showError(
              error,
              'Ha ocurrido un problema al intentar eliminar el lugar de interés'
            );
          }
        });
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.dialogConfirmEliminarSeleccionadas = val;
  }

  lugarinteresModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.modalEsEdicion = val;
    this.keyModalNuevo += 1;
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

      let tipoLugarInteresSelected = this.filtroTipoLugarInteresSelected;
      this.axiosGps.http
        .get(`${this.controller}/grid/${tipoLugarInteresSelected}`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'LugarDeInteres.csv',
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
    this.obtenerFiltrosTiposLugarInteres();

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        //Eliminar
        let item: any = null;
        let nombre: string = '';
        this.gridApi.forEachNode(function(rowNode: any, index: number) {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            nombre = item.nombre;
            return true;
          }
        });
        this.dialogEliminar = true;
        this.editedIndex = data.id;
        this.editedName = nombre;

        this.titleEliminarItem = 'Eliminar Lugar de Interés: ' + nombre;
      } else if (
        data.action == Accion.Editar ||
        data.action == Accion.VerDetalle
      ) {
        //Editar
        this.modalEsEdicion = data.action == Accion.Editar;
        this.editedIndex = data.id;

        let item: any = null;
        this.gridApi.forEachNode(function(rowNode: any, index: number) {
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

        let tipoLugarInteresSelected = self.filtroTipoLugarInteresSelected;
        const idFilasSeleccionadas = self.gridApi
          .getSelectedRows()
          .map(x => x.id);
        self.axiosGps.http
          .get(`${self.controller}/grid/${tipoLugarInteresSelected}`, {
            params: params.request,
          })
          .then(coordenadas => {
            let res = coordenadas.data;
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
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                self.handleErrors.showError(
                  err,
                  'Ha ocurrido un problema al realizar la búsqueda de Lugar de Interés'
                );
              }
            } else {
              self.handleErrors.showError(
                err,
                'Ha ocurrido un problema al realizar la búsqueda de Lugar de Interés'
              );
            }
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
                    ? 'Los ' +
                      items.length +
                      ' Lugares de Interés seleccionados'
                    : 'El Lugar de Interés ' +
                      this.gridApi.getSelectedNodes()[0].data.nombre,
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
                  'Ha ocurrido un problema al intentar eliminar los Lugares de Interés'
                );
              }
            } else {
              this.handleErrors.showError(
                err,
                'Ha ocurrido un problema al intentar eliminar los Lugares de Interés'
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
    // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
    let tituloMensajeMasivo = this.$t('mensajes.crud.eliminarMasivo.titulo', {
      entidad:
        'Lugar de Interés: ' + this.gridApi.getSelectedNodes()[0].data.nombre,
    });
    if (this.gridApi.getSelectedNodes().length === 1) {
      this.tituloDeleteMasivo = tituloMensajeMasivo;
      this.mensajeMasivo = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Lugar de Interés',
      });
      this.dialogConfirmEliminarSeleccionadas = true;
    } else {
      this.tituloDeleteMasivo = 'Eliminar Lugares de Interés';
      this.mensajeMasivo = this.$t('mensajes.crud.eliminarMasivo.mensaje', {
        los_cantidad_entidad_seleccionados:
          this.gridApi.getSelectedNodes().length > 1
            ? 'los ' +
              this.gridApi.getSelectedNodes().length +
              ' Lugares de Interés seleccionados'
            : 'el Lugar de Interés',
      });

      this.dialogConfirmEliminarSeleccionadas = true;
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

  //-- METODOS PROPIOS MANTENEDOR

  obtenerFiltrosTiposLugarInteres() {
    let filtros: any[] = [];
    for (let item in FiltrosTiposLugarInteres) {
      if (!isNaN(Number(item))) {
        let filtro: string = FiltrosTiposLugarInteres[item];
        filtros.push({
          id: Number(item),
          nombre: filtro,
        });
      }
    }
    this.filtrosTipoLugarInteres = filtros;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }
}
</script>

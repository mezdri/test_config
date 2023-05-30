<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-3`">Módulos</v-tab>
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
            style="padding-right:20px;"
            color="#ffe800"
            @click="(editedItem = {}), (showModalNew = true)"
          >
            <v-icon dark left style="color: black;">add_circle_outline</v-icon>
            <span style="color: black;">Crear</span>
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

    <app-modulos-modal-nuevo
      :show="showModalNew"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
    ></app-modulos-modal-nuevo>

    <app-modulos-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :accion="editedItem"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
    ></app-modulos-modal-edicion>

    <app-confirmacion
      :show="dialogEliminarIndividual"
      :titulo="tituloEliminarIndividual"
      :mensaje="mensajeEliminacion"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
  </v-container>
</template>
<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import { Component } from 'vue-property-decorator';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import AsociarEntidades from '@/components/AsociarEntidades.vue';
import { eventBus, actionsEvent } from '@/setup';
import { EstadoEntidad, Accion } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import Confirmation from '../../components/Confirmation.vue';
import HandleErrors from '../../config/handleErrors';
import store from '@/store';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  RowNode,
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import MenuItem from '@/components/MenuItem.vue';
import ModulosModalNuevo from '../../components/mantenedores/ModulosModalNuevo.vue';
import ModulosModalEdicion from '../../components/mantenedores/ModulosModalEdicion.vue';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-modulos-modal-nuevo': ModulosModalNuevo,
    'app-modulos-modal-edicion': ModulosModalEdicion,
  },
})
export default class Modulos extends ComponenteBase {
  funcionalidad: Funcionalidades = Funcionalidades.Funcionalidades;
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);

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

  // Globales
  tabModel: string = 'tab-3';
  muestraBarraBotones: boolean = false;
  registrosAsociar: any = [];
  showModalAsociarEntidades: boolean = false;
  $snotify: any;
  rowsPerPageItems: any = [];
  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  showTabPerfiles: boolean = true;
  showTabRoles: boolean = true;
  loadingService = new LoadingService();
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  chequearPermisosBtnCrear: boolean = true;
  editedIndex: number = -1;
  nombreModulo: string = '';
  dialogEliminarIndividual: boolean = false;
  tituloEliminarIndividual: any = '';
  handleErrors: HandleErrors = new HandleErrors();
  AccionesPerfilesAsociados: number = 0;
  mensajeEliminacion: string = '';

  // Controller
  readonly controller: string = 'funcionalidad';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  // Grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  serverSide: any;

  // Interfaces
  editedItem: IFuncionalidad = {};
  funcionalidades: Array<IFuncionalidad> = [];

  //vuex
  usuarioId: number = store.state.userId;

  // Componentes
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

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
        width: 170,
        minWidth: 80,
        lockPinned: true,
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
        width: 120,
        minWidth: 120,
        filter: false,
        suppressMovable: true,
        sortable: false,
        enablePivot: false,
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
          usuario: store.state.user,
        },
        colId: 'params',
        rowDrag: false,
        pinned: 'right',
        lockVisible: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 5, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
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

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
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
      this.ServerSideControler();
    });
  }

  ServerSideControler() {
    const self = this;
    this.serverSide = {
      getRows(params: any): void {
        params.request.search = self.search;
        params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
        self.paramsExportar = params; //Parametros al Exportar

        self.axios.http
          .get(`${self.controller}/grid`, { params: params.request })
          .then(funcionalidades => {
            if (funcionalidades.data.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              self.gridApi.hideOverlay();
            }
            params.successCallback(
              funcionalidades.data.data,
              funcionalidades.data.lastRow
            );
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

  recargarGrilla() {
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  mounted() {
    eventBus.changeTitlePage('Módulos');
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
            'Modulos.csv',
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
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.Funcionalidades) {
        if (data.action == Accion.Eliminar) {
          this.editedIndex = data.id;
          this.nombreModulo = `${config.getValorCelda(
            this.gridApi,
            data.id,
            'nombre'
          )}`;
          let model: any = [];
          model.push({
            ModuloId: this.editedIndex,
          });

          this.axios.http
            .post(`${this.controllerModuloAccion}/ModulosAsociaciones/`, model)
            .then(res => {
              this.AccionesPerfilesAsociados = res.data.cantidaAsociaciones;

              if (this.AccionesPerfilesAsociados === 0) {
                this.mensajeEliminacion =
                  '¿Está seguro que desea eliminar el Módulo?';
              } else {
                this.mensajeEliminacion =
                  'Se eliminarán todas las asociaciones relacionadas al Módulo. ¿Está seguro que desea eliminar el Módulo?';
              }
              this.dialogEliminarIndividual = true;
              this.tituloEliminarIndividual = `Eliminar Módulo: ${this.nombreModulo}`;
            })
            .catch(error => {
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.handleErrors.showError(
                    error,
                    'Ha ocurrido un problema al intentar eliminar el Módulo'
                  );
                }
              } else {
                this.handleErrors.showError(
                  error,
                  'Ha ocurrido un problema al intentar eliminar el Módulo'
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

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }

  moduloModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.recargarGrilla();
    }, 0);
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminarIndividual = false;
    let id = this.editedIndex;
    if (val) {
      try {
        this.loadingService.showLoading();
        const res = await this.axios.http.delete(
          `${this.controllerModuloAccion}/${this.editedIndex}/DeleteModulo`
        );

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Módulo',
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
                entidad: 'El Módulo',
                nombre: config.getValorCelda(this.gridApi, id, 'nombre'),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'El Módulo',
              nombre: config.getValorCelda(this.gridApi, id, 'nombre'),
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  closeModalEliminarIndividual() {
    this.dialogEliminarIndividual = false;
  }
}
</script>

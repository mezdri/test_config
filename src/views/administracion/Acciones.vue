<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Acciones</v-tab>
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

    <app-acciones-modal-nuevo
      :show="showModalNew"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="accionModalCallback($event)"
    ></app-acciones-modal-nuevo>

    <app-acciones-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :accion="editedItem"
      v-on:modalAsociacionEmit="accionModalCallback($event)"
    ></app-acciones-modal-edicion>

    <app-confirmacion
      :show="dialogEliminarIndividual"
      :titulo="tituloEliminarIndividual"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              <v-card-text v-if="eliminaIndividual"
                >Eliminar Acción: {{ nombreAccion }}</v-card-text
              >
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaIndividual">
              {{ mensajeEliminaIndividual }}
            </v-card-text>
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
import moment from 'moment';
import config from '@/config/index';
import { Component, Watch } from 'vue-property-decorator';
import { AccionesInterface } from '@/interfaces/Acciones';
import { eventBus, actionsEvent } from '@/setup';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { EstadoEntidad, Accion } from '@/config/enums';
import store from '@/store';
import Confirmation from '../../components/Confirmation.vue';
import MenuItem from '../../components/MenuItem.vue';
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
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { LoadingService } from '@/services/loadingService';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import AccionesModalNuevo from '@/components/mantenedores/AccionesModalNuevo.vue';
import AccionesModalEdicion from '@/components/mantenedores/AccionesModalEdicion.vue';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import HandleErrors from '../../config/handleErrors';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-acciones-modal-nuevo': AccionesModalNuevo,
    'app-acciones-modal-edicion': AccionesModalEdicion,
  },
})
export default class Acciones extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Acciones;
  readonly acciones: string[] = ['Consultar', 'Exportar'];
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
  controller: string = 'Accion';
  $snotify: any;
  file: File;
  selectedFile: File;
  selected: any = [];
  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogAsociacion: Boolean = false;
  dialogImport: boolean = false;
  search: String = '';
  headers: any = [];
  editedIndex: number = -1;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  loadingService = new LoadingService();
  llamada: number = 0;
  paramsExportar: any; //Parametros para Exportar
  intervalo: any;
  dialogEliminarIndividual: boolean = false;
  tituloEliminarIndividual: any = '';
  nombreAccion: string = '';
  cantidadAsociaciones: number = 0;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  mensajeEliminar: string = '';

  // Interfaces
  editedItem: AccionesInterface = {};
  defaultItem: AccionesInterface = {};
  accionesServer: AccionesInterface[] = [];

  dictionaryFormErrors: any = {};
  localeText: any = config.agGridTextos;

  // Vuex
  usuarioId: number = store.state.userId;

  // Componentes
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

  // Grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  gridOptions: GridOptions;
  serverSide: any;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;

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
        headerName: 'Módulos',
        field: 'modulos',
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
      blockLoadDebounceMillis: 350,
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

        self.axios
          .http(`${self.controller}/grid`, { params: params.request })
          .then(accionesServer => {
            if (accionesServer.data.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              self.gridApi.hideOverlay();
            }
            params.successCallback(
              accionesServer.data.data,
              accionesServer.data.lastRow
            );
            //self.gridApi.sizeColumnsToFit();
            self.loadingService.hideLoading();
          })
          .catch(err => {
            self.loadingService.hideLoading();
            if (!err.response) {
              self.$snotify.error('Ocurrió un error en la búsqueda.');
            }
            params.failCallback();
          });
      },
    };
    this.recargarGrilla();
  }

  recargarGrilla() {
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  created() {
    this.initialize();
  }

  mounted() {
    eventBus.changeTitlePage('Acciones');
  }

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.Acciones) {
        if (data.action == Accion.Eliminar) {
          this.editedIndex = data.id;

          // Eliminacion individual
          this.nombreAccion = `${config.getValorCelda(
            this.gridApi,
            data.id,
            'nombre'
          )}`;

          let model: any = [];
          model.push({
            AccionId: this.editedIndex,
          });

          this.axios.http
            .post(`${this.controller}/accionModulos/`, model)
            .then(res => {
              this.cantidadAsociaciones = res.data.cantidadModulos;

              if (this.cantidadAsociaciones === 0) {
                this.mensajeEliminar =
                  '¿Está seguro que desea eliminar la Acción?';
              } else {
                this.mensajeEliminar = `Se eliminarán todas las asociaciones relacionadas a la Acción y/o Subacción. ¿Está seguro que desea eliminar la Acción?`;
              }

              this.dialogEliminarIndividual = true;
              this.tituloEliminarIndividual = `Eliminar Acción: ${this.nombreAccion}`;
            })
            .catch(error => {
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.handleErrors.showError(
                    error,
                    'Ha ocurrido un problema al intentar eliminar la Acción'
                  );
                }
              } else {
                this.handleErrors.showError(
                  error,
                  'Ha ocurrido un problema al intentar eliminar la Acción'
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

  closeModal(val: Boolean) {
    this.dialogAsociacion = val;
  }

  closeModalEliminarIndividual() {
    this.dialogEliminarIndividual = false;
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
            'Acciones.csv',
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

  accionModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.recargarGrilla();
    }, 0);
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
        const res = await this.axios.http.delete(
          `${this.controller}/${this.editedIndex}/DeleteAccion`
        );

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'La Acción',
            nombre: config.getValorCelda(this.gridApi, id, 'nombre') + ' ',
            eliminadaO: 'eliminada',
          })
        );

        this.closeModalEliminarIndividual();
        this.recargarGrilla();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'la Acción',
                nombre: config.getValorCelda(this.gridApi, id, 'nombre'),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'la Acción',
              nombre: config.getValorCelda(this.gridApi, id, 'nombre'),
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

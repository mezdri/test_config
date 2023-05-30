<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-2`">Tipo de Licencias</v-tab>
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
            data-permiso="Exportar"
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
      <div data-permiso="Eliminar">
        <v-flex md3>
          <v-btn flat small class="btn-barra">
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
        $t('mensajes.crud.eliminar.mensaje', { entidad: 'el Tipo de Licencia' })
      "
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
      :width="450"
    ></app-confirmacion>
    <app-tipoLicencia-modal-nuevo
      :show="showModalNew"
      :tipoLicencia="editedItem"
      v-on:modalAsociacionEmit="tipoLicenciaModalCallback($event)"
    ></app-tipoLicencia-modal-nuevo>
    <app-tipoLicencia-modal-edicion
      :show="showModalEdit"
      :tipoLicencia="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="tipoLicenciaModalCallback($event)"
    ></app-tipoLicencia-modal-edicion>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent :max-width="450">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              v-if="eliminaMasivo"
              >Eliminar Tipo de Licencia:</v-toolbar-title
            >
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              v-if="eliminaIndividual"
              >Eliminar Tipo de Licencia: {{ name }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>

          <v-card-text v-if="eliminaMasivo">
            <span>
              Los Tipos de licencia que desea eliminar tienen asociadas Zonas.
              Dado a esto, no se puede llevar a cabo la eliminación solicitada
            </span>
          </v-card-text>
          <v-card-text v-if="eliminaIndividual">
            <span>{{ mensajeMasivo }}</span>
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
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import store from '@/store';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { ITipoLicencia } from '@/interfaces/Vehiculos';
import { eventBus, actionsEvent } from '@/setup';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import TipoLicenciaModalNuevo from '@/components/plataforma/TipoLicenciaModalNuevo.vue';
import TipoLicenciaModalEdicion from '@/components/plataforma/TipoLicenciaModalEdicion.vue';
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
    'app-tipoLicencia-modal-nuevo': TipoLicenciaModalNuevo,
    'app-tipoLicencia-modal-edicion': TipoLicenciaModalEdicion,
    'app-import': ImportFile,
  },
})
export default class TipoLicencia extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoLicencia;
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
  readonly controller: string = 'licenciaTipo';
  tabModel: string = 'tab-2';
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

  $snotify: any;
  tiposlugar: ITipoLicencia[] = [];

  dataTiposLugar: ITipoLicencia[] = [];

  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  dialogErrorAsocBase: Boolean = false;
  eliminaMasivo: Boolean = false;
  eliminaIndividual: Boolean = false;
  cantAsociado: number = 0;

  search: String = '';
  editedIndex: number = -1;
  editedName: String = '';
  name: String = '';
  editedItem: ITipoLicencia = {};
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
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

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
        cellStyle: function(params) {
          return { textAlign: 'center', 'pointer-events': 'none' };
        },
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
        headerName: 'Clase',
        field: 'clase',
        sortable: true,
        width: 219,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
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
        field: 'usuarioCreador',
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
        field: 'usuarioModificacion',
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
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
          usuario: store.state.user,
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
      this.axios.http
        .delete(`${this.controller}/${this.editedIndex}`)
        .then(res => {
          this.loadingService.hideLoading();
          this.$snotify.success(
            `El Tipo de Licencia ${this.name} ha sido eliminado de forma exitosa`
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
                'Ha ocurrido un problema al intentar eliminar el Tipo de Licencia.'
              );
            }
          } else {
            this.handleErrors.showError(
              error,
              'Ha ocurrido un problema al intentar eliminar el Tipo de Licencia.'
            );
          }
        });
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.dialogConfirmEliminarSeleccionadas = val;
  }

  tipoLicenciaModalCallback(val: boolean) {
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

      this.axios.http
        .get(`${this.controller}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          let resp = JSON.parse(respServer.data);
          config.crearArchivoCsv(
            'TipoDeLicencia.csv',
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
      if (data.funcionalidad === Funcionalidades.TipoLicencia) {
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
          this.axios.http
            .get(`${this.controller}/asosiacion/${data.id}`)
            .then(res => {
              this.name = this.getValorCelda(data.id, 'clase');
              this.cantAsociado = res.data;
              if (this.cantAsociado == 0) {
                this.dialogEliminar = true;
                this.editedIndex = data.id;
                this.titleEliminarItem = this.$t(
                  'mensajes.crud.eliminar.titulo',
                  {
                    entidad: 'Tipo de Licencia',
                    nombreEntidad: this.getValorCelda(data.id, 'clase'),
                  }
                );
              } else {
                this.mensajeMasivo =
                  'El Tipo de Licencia está asociado a ' +
                  (this.cantAsociado == 1
                    ? 'un Conductor'
                    : this.cantAsociado + '  Conductores') +
                  ', por esta razón no se podrá realizar la eliminación.';
                this.dialogErrorAsoc = true;
                this.eliminaIndividual = true;
                this.eliminaMasivo = false;
              }
            })
            .catch(error => {});
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
        self.axios.http
          .get(`${self.controller}/grid`, {
            params: params.request,
          })
          .then(tipoLicencia => {
            let res = JSON.parse(tipoLicencia.data);
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

<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">ACTIVIDADES</v-tab>
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
      <v-flex
        xs12
        sm6
        md2
        v-if="accionCrear.visible"
        style="padding-right:0px;"
      >
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
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

    <app-actividades-modal-nuevo
      :show="showModalNew"
      :tipoActividad="editedItem"
      v-on:modalAsociacionEmit="ActividadModalCallback($event)"
    ></app-actividades-modal-nuevo>

    <app-actividades-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :actividad="editedItem"
      v-on:modalAsociacionEmit="ActividadModalCallback($event)"
    ></app-actividades-modal-edicion>

    <div class="text-xs-center">
      <v-dialog v-model="mostrarAvisoDelete" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloEliminar }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <span>{{ mensajeEliminar }}</span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="primary" @click="mostrarAvisoDelete = false"
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
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import ActividadesModalNuevo from '@/components/mantenedores/ActividadesModalNuevo.vue';
import ActividadesModalEdicion from '@/components/mantenedores/ActividadesModalEdicion.vue';

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
import { IActividadesInterface } from '../../interfaces/Actividades';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': () => import('@/components/Confirmation.vue'),
    'app-actividades-modal-nuevo': () =>
      import('@/components/mantenedores/ActividadesModalNuevo.vue'),
    'app-actividades-modal-edicion': () =>
      import('@/components/mantenedores/ActividadesModalEdicion.vue'),
  },
})
export default class Actividad extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Actividades; //cambiar por
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

  readonly acciones: string[] = [
    'Editar - Información General',
    'Ver Detalle - Información General',
    'Crear - Información General',
    'Eliminar',
    'Consultar',
    'Exportar',
    'Importar',
  ];
  readonly controller: string = 'actividadesMant';
  actividadesMantController: string = 'actividadesMant';
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
  axios: AxiosVue = new AxiosVue(ServicioProxy.Mantenimiento);

  modalEsEdicion: boolean = false;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  mensajeEliminar: any = '';

  $snotify: any;

  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  clienteId: number = config.getClienteSesion();
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  search: string = '';
  editedIndex: number = -1;
  editedItem: IActividadesInterface = {};
  defaultItem: IActividadesInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //tabs
  tabModel: string = 'tab-1';
  eliminarMasivoMensajes: any = [];

  //variables modales aviso delete
  tituloEliminar: any = '';
  mostrarAvisoDelete: boolean = false;
  titulomostrarAvisoDelete: string = '';
  textoMensajeDelete: string = '';
  mostrarMensajeDelete: boolean = false;
  contVeh: number = 0;
  contSim: number = 0;
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  simAsociadasGps: any = '';
  cantidadEliminarMasivo: number = 0;
  cantPautas: any;

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
        cellStyle: { textAlign: 'left', 'pointer-events': 'none' },
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
        headerName: 'Nombre',
        field: 'nombreActividad',
        resizable: true,
        width: 145,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
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
        headerName: 'Creado por',
        field: 'usuarioCreacion',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
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
        //type: 'fecha',
        resizable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Acciones',
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

  mounted() {
    eventBus.changeTitlePage('Actividad');

    actionsEvent.$on('actionsEvent', async (data: any) => {
      let self = this;
      if (data.action == Accion.Eliminar) {
        const response = await this.axios.http
          .get(`${this.controller}/${data.id}`)
          .then(x => {
            // console.log('x', x);
            this.cantPautas = x.data.pautaActividadMants.length;
          });
        // console.log('cantidad', self.cantPautas);
        // console.log('respuesta', response);
        if (this.cantPautas === 0) {
          this.mensajeEliminar =
            '¿Está seguro que desea eliminar la Actividad?';
          this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
            entidad: 'Actividad',
            nombreEntidad: config.getValorCelda(
              this.gridApi,
              data.id,
              'nombreActividad'
            ),
          });
          this.editedIndex = data.id;
          this.titulomostrarAvisoDelete =
            'Eliminar Actividad: ' +
            config.getValorCelda(this.gridApi, data.id, 'id');
          this.eliminarItem();
        } else {
          this.mensajeEliminar =
            'La Actividad está asociada a ' +
            (this.cantPautas == 1
              ? 'una Pauta de Actividad'
              : this.cantPautas + ' Pautas de Actividades') +
            ', por esta razón no se podrá realizar la eliminación.';

          // this.$t('mensajes.crud.eliminar.mensaje', { entidad: 'la Actividad',});
          this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
            entidad: 'Actividad',
            nombreEntidad: config.getValorCelda(
              this.gridApi,
              data.id,
              'nombreActividad'
            ),
          });
          this.editedIndex = data.id;
          this.mostrarAvisoDelete = true;
          // this.titulomostrarAvisoDelete =
          //   'Eliminar Actividad: ' +
          //   config.getValorCelda(this.gridApi, data.id, 'id');
        }
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
          self.axios
            .http(`${self.actividadesMantController}/grid`, {
              params: params.request,
            })
            .then(tipoActividad => {
              if (tipoActividad.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(
                  tipoActividad.data.data,
                  tipoActividad.data.lastRow
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

  async eliminarItem() {
    try {
      this.dialogEliminar = true;
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarActividad() {
    this.loadingService.showLoading();
    try {
      const delActividad = await this.axios.http.delete(
        `${this.actividadesMantController}/?id=${this.editedIndex}`
      );
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.eliminar', {
          entidad: 'La Actividad',
          nombre: config.getValorCelda(
            this.gridApi,
            this.editedIndex,
            'nombreActividad'
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
              entidad: 'la Actividad',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'nomnombreActividadbre'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la Actividad',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'nombre'
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

  ActividadModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 0);
  }

  deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      this.eliminarActividad();
    }
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axios
        .http(`${this.actividadesMantController}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Actividades.csv',
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

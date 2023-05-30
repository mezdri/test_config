<template>
  <v-container fluid grid-list-md>
    <v-flex xs12>
      <v-tabs left color="transparent">
        <v-tab :href="`#tab-1`">IMPORTAR</v-tab>
      </v-tabs>
    </v-flex>
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
      <v-flex
        xs12
        sm6
        :md4="accionImportar.visible"
        :md6="!accionImportar.visible"
      >
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
            v-if="accionImportar.visible"
            class="btn-crear"
            @click="(editedItem = {}), (showModalNew = true)"
            style="padding-right:20px;"
          >
            <v-icon dark left style="color = black;">add_circle_outline</v-icon>
            <span>Importar</span>
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
      :show="dialogCancelar"
      :titulo="tituloCancelar"
      :mensaje="$t('mensajes.crud.cancelar.mensaje')"
      v-on:modalConfirmationEmit="cancelItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.cancelar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.cancelar.btnCancelar')"
      :width="450"
    ></app-confirmacion>

    <app-importar-modal-nuevo
      :show="showModalNew"
      :importarVd="editedItem"
      v-on:modalAsociacionEmit="importarModalCallback($event)"
    ></app-importar-modal-nuevo>
    <app-importar-modal-verDetalle
      :show="showModalEdit"
      :importarVd="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="importarModalCallback($event)"
    ></app-importar-modal-verDetalle>
  </v-container>
</template>

<script lang="ts">
import moment from 'moment';
import config from '@/config/index';
import store from '@/store';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { eventBus, actionsEvent } from '@/setup';
import ImportFile from '@/components/ImportFile.vue';
import ImportarModalNuevo from '@/components/plataforma/ImportarModalNuevo.vue';
import ImportarModalVerDetalle from '@/components/plataforma/ImportarModalVerDetalle.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion, EstadoEntidad } from '@/config/enums';
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
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { IConductorGrupo } from '../../interfaces/Conductores';
import { IImportar } from '../../interfaces/Importar';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-importar-modal-nuevo': ImportarModalNuevo,
    'app-importar-modal-verDetalle': ImportarModalVerDetalle,
    'app-import': ImportFile,
  },
})
export default class Importar extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Importar;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionImportar: PermisoAccion = {
    accionCodigo: 50,
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
    this.accionImportar,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly controllerImportar: string = 'importacion';

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
  clienteId = config.getClienteSesion();
  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;
  dialogEliminarAsoc: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  eliminaMasivo: Boolean = false;
  eliminaIndividual: Boolean = false;
  cantidadConductoresAsociados: number = 0;
  mensajeEliminaIndividual: string = '';
  mensajeEliminaMasivo: string = '';

  search: String = '';
  editedIndex: number = -1;
  editedName: String = '';
  name: String = '';
  editedItem: IImportar = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  intervalo: any; //Intervalo para el buscador

  serverSide: any;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;
  dialogNoPuedeEliminar: boolean = false;
  titleEliminarItem: any = '';
  mensajeMasivo: any = '';
  tituloMasivo: string = '';
  showTabConductores: boolean = true;
  esBase: boolean = false;
  dialogCancelar: boolean = false;
  tituloCancelar: any = '';
  importarId: number = 0;

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axios: AxiosVue = new AxiosVue(ServicioProxy.Importacion);
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
        cellStyle: function(params) {
          return { textAlign: 'center', 'pointer-events': 'none' };
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        sortable: true,
        resizable: true,
        hide: true,
        minWidth: 80,
        width: 100,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        width: 226,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Tipo Carga',
        field: 'modulo',
        sortable: true,
        width: 266,
        minWidth: 80,
        lockPinned: true,
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
        headerName: 'Total Registros',
        field: 'registrosNum',
        sortable: true,
        width: 266,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Total OK',
        field: 'registrosOk',
        sortable: true,
        width: 266,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Total Error',
        field: 'registrosError',
        sortable: true,
        width: 266,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Nombre Archivo',
        field: 'archivoRef',
        sortable: true,
        width: 266,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Fecha Subida',
        field: 'fechaCreacionTxt',
        width: 193,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        width: 226,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Carga',
        field: 'fechaCargaTxt',
        width: 193,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
      },
      {
        headerName: 'Cancelada por',
        field: 'usuarioCancelacion',
        sortable: true,
        resizable: true,
        width: 226,
        minWidth: 80,
        lockPinned: true,
        filter: false,
        hide: true,
      },
      {
        headerName: 'Fecha Cancelación',
        field: 'fechaCancelacionTxt',
        sortable: true,
        resizable: true,
        width: 226,
        minWidth: 80,
        lockPinned: true,
        filter: false,
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
      cacheBlockSize: 1000, //Solución Paginación
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
    eventBus.changeTitlePage('Grupos de Conductores');
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

  async deleteItemCallback(aceptado: boolean) {
    let indice: any = 0;
    let nom: string = '';
    if (this.editedIndex > 0) {
      indice = this.editedIndex;
    } else {
      if (this.gridApi.getSelectedNodes().length == 1) {
        const item = this.gridApi.getSelectedNodes();
        indice = item[0].data.id;
      }
    }

    this.dialogEliminar = false;
    if (aceptado) {
      try {
        this.loadingService.showLoading();
        const responseDelete = await this.axios.http.delete(
          `${this.controllerImportar}/${indice}`
        );

        this.$snotify.success(
          'El Grupo de Conductores ' +
            this.editedName +
            ' ha sido eliminado de forma exitosa'
        );

        //this.dialogEliminarAsoc = false;
        this.eliminaIndividual = false;
        this.eliminaMasivo = false;

        setTimeout(() => {
          this.ServerSideRefresh();
        }, 0);
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(
              error,
              'Ha ocurrido un problema al intentar eliminar el Grupo de Conductores'
            );
          }
        } else {
          this.handleErrors.showError(
            error,
            'Ha ocurrido un problema al intentar eliminar el Grupo de Conductores'
          );
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

  importarModalCallback(val: boolean) {
    this.muestraBarraBotones = false;

    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.ServerSideRefresh();
    }, 0);
  }

  async exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    const self = this;
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      await this.axios.http
        .get(`${self.controllerImportar}/${self.clienteId}/grid`, {
          params: self.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Importar.csv',
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
      if (data.action == Accion.Cancelar) {
        this.editedIndex = data.id;
        this.tituloCancelar = this.titleEliminarItem = this.$t(
          'mensajes.crud.cancelar.titulo',
          {
            entidad: this.getValorCelda(data.id, 'modulo'),
          }
        );
        this.importarId = data.id;
        this.dialogCancelar = true;
      } else if (
        data.action === Accion.Editar ||
        data.action === Accion.VerDetalle
      ) {
        //Editar
        if (data.action === Accion.Editar) this.modalEsEdicion = true;
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
          .get(`${self.controllerImportar}/${self.clienteId}/grid`, {
            params: params.request,
          })
          .then(res => {
            if (res.data.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              res.data.data.forEach((x: any) => {
                x.estadoTxt = x.estadoTxt.replace(/([a-z])([A-Z])/g, '$1 $2');
              });
              params.successCallback(res.data.data, res.data.lastRow);
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

  // Se comenta metodo eliminar Masivo

  // eliminarSeleccionadas() {
  //   if (this.gridApi.getSelectedNodes().length > 0) {
  //     let index = 0;
  //     const items = this.gridApi.getSelectedNodes();
  //     this.loadingService.showLoading();

  //     for (let i = 0; i <= items.length - 1; i++) {
  //       this.axiosGps.http
  //         .delete(`${this.controller}/${items[i].data.id}`)
  //         .then(res => {
  //           index = index + 1;
  //           if (index == items.length) {
  //             this.loadingService.hideLoading();
  //             this.muestraBarraBotones = false;
  //             //this.dialogEliminarAsoc = false;
  //             this.eliminaIndividual = false;
  //             this.eliminaMasivo = false;
  //             let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
  //               los_cantidad_entidad_seleccionados:
  //                 items.length > 1
  //                   ? 'Los ' +
  //                     items.length +
  //                     ' Grupos de Conductores seleccionados'
  //                   : 'El Grupo de Conductores ' + items[0].data.nombre,
  //               eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
  //             });
  //             if (items.length === 1) {
  //               msj = msj.toString().replace('han', 'ha');
  //             }
  //             this.$snotify.success(msj);
  //             this.ServerSideRefresh();
  //           }
  //         })
  //         .catch(err => {
  //           if (err.response !== undefined) {
  //             if (err.response.status !== 401) {
  //               this.handleErrors.showError(
  //                 err,
  //                 'Ha ocurrido un problema al intentar eliminar los grupos de Conductores'
  //               );
  //             }
  //           } else {
  //             this.handleErrors.showError(
  //               err,
  //               'Ha ocurrido un problema al intentar eliminar los grupos de Conductores'
  //             );
  //           }
  //         });
  //     }
  //   }
  // }

  // Se comenta metodo eliminar Masivo

  // confirmCallbackEliminarSeleccionadas(val: boolean, close: boolean = false) {
  //   this.dialogConfirmEliminarSeleccionadas = false;
  //   if (val) {
  //     //Eliminación
  //     this.eliminarSeleccionadas();
  //   } else {
  //     this.gridApi.deselectAll();
  //   }
  // }

  // Se comenta metodo eliminar Masivo

  // async eliminarMasivoConfirm() {
  //   if (this.gridApi.getSelectedNodes().length > 0) {
  //     let index = 0;
  //     const items = this.gridApi.getSelectedNodes();
  //     this.cantidadConductoresAsociados = 0;
  //     this.name = items[0].data.nombre;

  //     for (let i = 0; i <= items.length - 1; i++) {
  //       await this.axiosGps.http
  //         .get(`${this.controller}/asociacion/${items[i].data.id}`)
  //         .then(res => {
  //           this.cantidadConductoresAsociados += res.data.length;
  //         })
  //         .catch(error => {
  //           if (error.response !== undefined) {
  //             if (error.response.status !== 401) {
  //               this.handleErrors.showError(
  //                 error,
  //                 'Ha ocurrido un problema al intentar eliminar el Grupo de Conductores'
  //               );
  //             }
  //           } else {
  //             this.handleErrors.showError(
  //               error,
  //               'Ha ocurrido un problema al intentar eliminar el Grupo de Conductores'
  //             );
  //           }
  //         });
  //     }
  //     items.forEach(x => {
  //       if (x.data.estado === EstadoEntidad.Sistema) {
  //         this.esBase = true;
  //       }
  //     });
  //     if (this.esBase == true) {
  //       if (items.length == 1) {
  //         this.eliminaIndividual = true;
  //         this.eliminaMasivo = false;
  //         this.mensajeEliminaIndividual =
  //           'El Grupo de Conductores que desea eliminar es un Grupo de Conductores por defecto. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
  //         this.dialogErrorAsoc = true;
  //         this.esBase = false;
  //       } else {
  //         this.eliminaIndividual = false;
  //         this.eliminaMasivo = true;
  //         this.mensajeEliminaMasivo =
  //           'Uno de los Grupos de Conductores que desea eliminar es un Grupo de Conductores por defecto. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
  //         this.dialogErrorAsoc = true;
  //         this.esBase = false;
  //       }
  //     } else if (this.cantidadConductoresAsociados > 0) {
  //       if (items.length > 1) {
  //         this.dialogErrorAsoc = true;
  //         //this.dialogEliminarAsoc = false;
  //         this.eliminaIndividual = false;
  //         this.eliminaMasivo = true;
  //         this.mensajeEliminaMasivo =
  //           'Los Grupos de Conductores que desea eliminar tienen ' +
  //           this.cantidadConductoresAsociados +
  //           ' Conductores asociados. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
  //       } else {
  //         this.dialogErrorAsoc = true;
  //         //this.dialogEliminarAsoc = true;
  //         this.eliminaIndividual = true;
  //         this.mensajeEliminaIndividual =
  //           'El Grupo de Conductor que desea eliminar tiene ' +
  //           this.cantidadConductoresAsociados +
  //           ' Conductor asociado. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
  //         this.eliminaMasivo = false;
  //       }
  //     } else {
  //       // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
  //       if (this.gridApi.getSelectedNodes().length === 1) {
  //         this.editedName = items[0].data.nombre;
  //         this.tituloMasivo =
  //           'Eliminar Grupo de Conductores: ' + this.editedName;
  //         this.mensajeMasivo = this.$t('mensajes.crud.eliminar.mensaje', {
  //           entidad: 'el Grupo de Conductores',
  //         });
  //         this.dialogConfirmEliminarSeleccionadas = true;
  //       } else {
  //         this.tituloMasivo = 'Eliminar Grupos de Conductores';
  //         this.mensajeMasivo = this.$t('mensajes.crud.eliminarMasivo.mensaje', {
  //           los_cantidad_entidad_seleccionados:
  //             this.gridApi.getSelectedNodes().length > 1
  //               ? 'los ' +
  //                 this.gridApi.getSelectedNodes().length +
  //                 ' Grupos de Conductores seleccionados'
  //               : 'el Grupos de Conductores seleccionado',
  //         });
  //         this.dialogConfirmEliminarSeleccionadas = true;
  //       }
  //     }
  //   }
  // }

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
  async eliminarItem() {
    this.loadingService.showLoading();
    try {
      const resGps = await this.axios.http.get(
        `${this.controllerImportar}/${this.editedIndex}`
      );
      const cantidadGps = resGps.data.gpsSims.filter(
        (x: any) => x.fechaFinAsociacion == null
      );
      if (cantidadGps.length > 0) {
        this.titleEliminarItem =
          'Eliminar SIM: ' +
          config.getValorCelda(this.gridApi, this.editedIndex, 'numeroSIM');
        this.mensajeEliminaIndividual =
          'La SIM que desea eliminar se encuentra asociada.' +
          //cantidadGps.length + (cantidadGps.length > 1 ? " GPSs. " : " GPS. ") +
          ' Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
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
  async cancelItemCallback(val: boolean) {
    this.dialogCancelar = false;
    if (val) {
      try {
        await this.axios.http.put(
          `${this.controllerImportar}/${this.importarId}/CancelarImportar`
        );
        const self = this;
        this.$snotify.success(
          `La Importación de ${config.getValorCelda(
            this.gridApi,
            this.editedIndex,
            'modulo'
          )} ha sido cancelada de forma exitosa`
        );
        this.gridApi.setServerSideDatasource(this.serverSide);
        this.dialogCancelar = false;
      } catch (error) {
        return error;
      }
    }
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`" v-if="showTabLugarInteres" to="/lugarinteres"
        >Lugar de Interés</v-tab
      >
      <v-tab :href="`#tab-2`">Grupo de Interés</v-tab>
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
            <v-icon dark left style="color = black;">add_circle_outline</v-icon>
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
    <!-- CONFIRMACION ELIMINACION ITEM TIPO LUGAR -->
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="titleEliminarItem"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', { entidad: 'el Grupo de Interés' })
      "
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmEliminarSeleccionadas"
      :titulo="tituloMasivo"
      :mensaje="mensajeMasivo"
      v-on:modalConfirmationEmit="confirmCallbackEliminarSeleccionadas($event)"
      :textoBtnSi="$t('mensajes.crud.eliminarMasivo.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminarMasivo.btnCancelar')"
    ></app-confirmacion>
    <app-tipolugarinteres-modal-nuevo
      :show="showModalNew"
      :tiposlugarinteres="editedItem"
      v-on:modalAsociacionEmit="tipolugarinteresModalCallback($event)"
    ></app-tipolugarinteres-modal-nuevo>
    <app-tipolugarinteres-modal-edicion
      :show="showModalEdit"
      :tiposlugarinteres="editedItem"
      :esEdicion="modalEsEdicion"
      v-on:modalAsociacionEmit="tipolugarinteresModalCallback($event)"
    ></app-tipolugarinteres-modal-edicion>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="390">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;">
              <v-card-text v-if="eliminaIndividual">
                Eliminar Grupo de Interés: {{ name }}
              </v-card-text>
              <v-card-text v-if="eliminaMasivo">
                Eliminar Grupos de Interés
              </v-card-text></v-toolbar-title
            >
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
import moment from 'moment';
import config from '@/config/index';
import store from '@/store';
import HandleErrors from '@/config/handleErrors';

import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { ITipoLugar } from '@/interfaces/Zonas';
import { eventBus, actionsEvent } from '@/setup';
import ImportFile from '@/components/ImportFile.vue';
import TipoLugarInteresModalNuevo from '@/components/plataforma/TipoLugarInteresModalNuevo.vue';
import TipoLugarInteresModalEdicion from '@/components/plataforma/TipoLugarInteresModalEdicion.vue';
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
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-tipolugarinteres-modal-nuevo': TipoLugarInteresModalNuevo,
    'app-tipolugarinteres-modal-edicion': TipoLugarInteresModalEdicion,
    'app-import': ImportFile,
  },
})
export default class TipoLugarInteres extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeInteres;
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
  readonly controllerTipoLugarCliente: string = 'grupodeinteres';
  readonly controllerCoordenada: string = 'coordenada';

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

  validForm: Boolean = true;
  dialog: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;
  dialogEliminarAsoc: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  eliminaMasivo: Boolean = false;
  eliminaIndividual: Boolean = false;
  cantidadClientesAsociados: number = 0;
  cantidadLugaresAsociados: number = 0;
  mensajeEliminaIndividual: string = '';
  mensajeEliminaMasivo: string = '';

  search: String = '';
  editedIndex: number = -1;
  editedName: String = '';
  name: String = '';
  editedItem: ITipoLugar = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  intervalo: any; //Intervalo para el buscador

  serverSide: any;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;

  titleEliminarItem: any = '';
  mensajeMasivo: any = '';
  tituloMasivo: string = '';
  showTabLugarInteres: boolean = true;

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
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
        width: 226,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        width: 266,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        sortable: true,
        resizable: true,
        width: 226,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 193,
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
        width: 230,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 193,
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
    eventBus.changeTitlePage('Grupos de Interes');
    this.showTabLugarInteres = config.chequeaPermisosTabs(
      Funcionalidades.LugarInteres,
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
        const responseDelete = await this.axiosGps.http.delete(
          `${this.controller}/${indice}`
        );

        this.$snotify.success(
          'El Grupo de Interés ' +
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
              'Ha ocurrido un problema al intentar eliminar el Grupo de Interés'
            );
          }
        } else {
          this.handleErrors.showError(
            error,
            'Ha ocurrido un problema al intentar eliminar el Grupo de Interés'
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

  tipolugarinteresModalCallback(val: boolean) {
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
        .get(`${this.controller}/grid`, { params: this.paramsExportar.request })
        .then(respServer => {
          let resp = JSON.parse(respServer.data);
          config.crearArchivoCsv(
            'GrupoDeInteres.csv',
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
      if (data.action == Accion.Eliminar) {
        //Eliminar
        let item: any = null;
        let nombre: string = '';
        this.gridApi.forEachNode(function(rowNode: any) {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            nombre = item.nombre;
            return true;
          }
        });
        this.editedName = nombre;
        this.name = `${config.getValorCelda(this.gridApi, data.id, 'nombre')}`;
        this.axiosGps.http
          .get(`${this.controllerTipoLugarCliente}/${data.id}/clientes`)
          .then(res => {
            this.cantidadClientesAsociados = res.data.length;
            this.axiosGps.http
              .get(`${this.controllerCoordenada}/${data.id}/lugares`)
              .then(resLug => {
                this.cantidadLugaresAsociados = resLug.data.length;
                this.editedIndex = data.id;
                if (
                  this.cantidadClientesAsociados == 0 &&
                  this.cantidadLugaresAsociados == 0
                ) {
                  this.titleEliminarItem =
                    'Eliminar Grupo de Interés: ' + this.editedName;
                  this.dialogEliminar = true;

                  // this.titleEliminarItem = this.$t(
                  //   "mensajes.crud.eliminar.titulo",
                  //   {
                  //     entidad: "Grupo de Interés",
                  //     nombreEntidad: this.getValorCelda(data.id, "nombre")
                  //   }
                  // );
                } else {
                  this.dialogErrorAsoc = true;
                  //this.dialogEliminarAsoc = true;
                  this.eliminaIndividual = true;
                  this.mensajeEliminaIndividual = this.obtieneMensajeEliminar(
                    1
                  );
                  this.eliminaMasivo = false;
                }
              })
              .catch(error => {
                //this.handleErrors.showError(error, "Ha ocurrido un problema al intentar eliminar el Grupo de interés");
              });
          })
          .catch(error => {
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.handleErrors.showError(
                  error,
                  'Ha ocurrido un problema al intentar eliminar el Grupo de Interés'
                );
              }
            } else {
              this.handleErrors.showError(
                error,
                'Ha ocurrido un problema al intentar eliminar el Grupo de Interés'
              );
            }
          });
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
        self.axiosGps.http
          .get(`${self.controller}/grid`, {
            params: params.request,
          })
          .then(tipolugarinteres => {
            let res = JSON.parse(tipolugarinteres.data);
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
              //this.dialogEliminarAsoc = false;
              this.eliminaIndividual = false;
              this.eliminaMasivo = false;
              let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'Los ' + items.length + ' Grupos de Interés seleccionados'
                    : 'El Grupo de Interés ' + items[0].data.nombre,
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
                  'Ha ocurrido un problema al intentar eliminar los grupos de interés'
                );
              }
            } else {
              this.handleErrors.showError(
                err,
                'Ha ocurrido un problema al intentar eliminar los grupos de interés'
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
      this.cantidadClientesAsociados = 0;
      this.cantidadLugaresAsociados = 0;
      this.name = items[0].data.nombre;

      for (let i = 0; i <= items.length - 1; i++) {
        this.axiosGps.http
          .get(
            `${this.controllerTipoLugarCliente}/${items[i].data.id}/clientes`
          )
          .then(res => {
            this.cantidadClientesAsociados += res.data.length;
            this.axiosGps.http
              .get(`${this.controllerCoordenada}/${items[i].data.id}/lugares`)
              .then(resLug => {
                this.cantidadLugaresAsociados += resLug.data.length;
                index = index + 1;
                if (index == items.length) {
                  if (
                    this.cantidadClientesAsociados == 0 &&
                    this.cantidadLugaresAsociados == 0
                  ) {
                    // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
                    if (this.gridApi.getSelectedNodes().length === 1) {
                      this.editedName = items[0].data.nombre;
                      this.tituloMasivo =
                        'Eliminar Grupo de Interés: ' + this.editedName;
                      this.mensajeMasivo = this.$t(
                        'mensajes.crud.eliminar.mensaje',
                        { entidad: 'el Grupo de Interés' }
                      );
                      this.dialogConfirmEliminarSeleccionadas = true;
                    } else {
                      this.tituloMasivo = 'Eliminar Grupos de Interés';
                      this.mensajeMasivo = this.$t(
                        'mensajes.crud.eliminarMasivo.mensaje',
                        {
                          los_cantidad_entidad_seleccionados:
                            this.gridApi.getSelectedNodes().length > 1
                              ? 'los ' +
                                this.gridApi.getSelectedNodes().length +
                                ' Grupos de Interés seleccionados'
                              : 'el Grupos de Interés seleccionado',
                        }
                      );
                      this.dialogConfirmEliminarSeleccionadas = true;
                    }
                  } else {
                    if (items.length > 1) {
                      this.dialogErrorAsoc = true;
                      //this.dialogEliminarAsoc = false;
                      this.eliminaIndividual = false;
                      this.eliminaMasivo = true;
                      this.mensajeEliminaMasivo = this.obtieneMensajeEliminar(
                        items.length
                      );
                    } else {
                      this.dialogErrorAsoc = true;
                      //this.dialogEliminarAsoc = true;
                      this.eliminaIndividual = true;
                      this.mensajeEliminaIndividual = this.obtieneMensajeEliminar(
                        1
                      );
                      this.eliminaMasivo = false;
                    }
                  }
                }
              })
              .catch(error => {
                if (error.response !== undefined) {
                  if (error.response.status !== 401) {
                    this.handleErrors.showError(
                      error,
                      'Ha ocurrido un problema al intentar eliminar el Grupo de Interés'
                    );
                  }
                } else {
                  this.handleErrors.showError(
                    error,
                    'Ha ocurrido un problema al intentar eliminar el Grupo de Interés'
                  );
                }
              });
          })
          .catch(error => {
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.handleErrors.showError(
                  error,
                  'Ha ocurrido un problema al intentar eliminar los Grupos de Interés'
                );
              }
            } else {
              this.handleErrors.showError(
                error,
                'Ha ocurrido un problema al intentar eliminar los Grupos de Interés'
              );
            }
          });
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

  obtieneMensajeEliminar(cantidad: number) {
    let salida: string = '';

    //INDIVIDUAL
    if (cantidad === 1) {
      if (
        this.cantidadClientesAsociados === 0 &&
        this.cantidadLugaresAsociados === 1
      ) {
        salida =
          'El Grupo de Interés tiene un Lugar de Interés asociado, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 0 &&
        this.cantidadLugaresAsociados > 1
      ) {
        salida =
          'El Grupo de Interés tiene ' +
          this.cantidadLugaresAsociados +
          ' Lugares de Interés asociados, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 1 &&
        this.cantidadLugaresAsociados === 0
      ) {
        salida =
          'El Grupo de Interés está asociado a un Cliente, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 1 &&
        this.cantidadLugaresAsociados === 1
      ) {
        salida =
          'El Grupo de Interés está asociado a un Cliente y tiene un Lugar de Interés asociado, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 1 &&
        this.cantidadLugaresAsociados > 1
      ) {
        salida =
          'El Grupo de Interés está asociado a un Cliente y tiene ' +
          this.cantidadLugaresAsociados +
          ' Lugares de Interés asociados, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados > 1 &&
        this.cantidadLugaresAsociados === 0
      ) {
        salida =
          'El Grupo de Interés está asociado a ' +
          this.cantidadClientesAsociados +
          ' Clientes, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados > 1 &&
        this.cantidadLugaresAsociados === 1
      ) {
        salida =
          'El Grupo de Interés está asociado a ' +
          this.cantidadClientesAsociados +
          ' Clientes y tiene un Lugar de Interés asociado, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados > 1 &&
        this.cantidadLugaresAsociados > 1
      ) {
        salida =
          'El Grupo de Interés está asociado a ' +
          this.cantidadClientesAsociados +
          ' Clientes y tiene ' +
          this.cantidadLugaresAsociados +
          ' Lugares de Interés asociados, por esta razón no se podrá realizar la eliminación.';
      }
    } else {
      //MASIVO
      if (
        this.cantidadClientesAsociados === 0 &&
        this.cantidadLugaresAsociados === 1
      ) {
        salida =
          'Los Grupos de Interés tienen un Lugar de Interés asociado, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 0 &&
        this.cantidadLugaresAsociados > 1
      ) {
        salida =
          'Los Grupos de Interés tienen ' +
          this.cantidadLugaresAsociados +
          ' Lugares de Interés asociados, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 1 &&
        this.cantidadLugaresAsociados === 0
      ) {
        salida =
          'Los Grupos de Interés están asociados a un Cliente, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 1 &&
        this.cantidadLugaresAsociados === 1
      ) {
        salida =
          'Los Grupos de Interés están asociados a un Cliente y tienen un Lugar de Interés asociado, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados === 1 &&
        this.cantidadLugaresAsociados > 1
      ) {
        salida =
          'Los Grupos de Interés están asociados a un Cliente y tienen ' +
          this.cantidadLugaresAsociados +
          ' Lugares de Interés asociados, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados > 1 &&
        this.cantidadLugaresAsociados === 0
      ) {
        salida =
          'Los Grupos de Interés están asociados a ' +
          this.cantidadClientesAsociados +
          ' Clientes, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados > 1 &&
        this.cantidadLugaresAsociados === 1
      ) {
        salida =
          'Los Grupos de Interés están asociados a ' +
          this.cantidadClientesAsociados +
          ' Clientes y tienen un Lugar de Interés asociado, por esta razón no se podrá realizar la eliminación.';
      } else if (
        this.cantidadClientesAsociados > 1 &&
        this.cantidadLugaresAsociados > 1
      ) {
        salida =
          'Los Grupos de Interés están asociados a ' +
          this.cantidadClientesAsociados +
          ' Clientes y tienen ' +
          this.cantidadLugaresAsociados +
          ' Lugares de Interés asociados, por esta razón no se podrá realizar la eliminación.';
      }
    }

    return salida;
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>

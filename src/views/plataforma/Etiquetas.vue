<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab :href="`#tab-1`">Etiquetas</v-tab>
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
            <v-icon dark left style="color=black">add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <div>
      <v-layout row wrap v-show="muestraBarraBotones">
        <v-flex md2>
          <v-btn
            v-if="accionEliminar.visible"
            flat
            small
            color="secondary"
            @click="eliminarMasivoConfirm"
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
      :show="dialogConfirm"
      :titulo="titleEliminarItem"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', { entidad: 'la Etiqueta' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
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

    <app-etiquetas-modal-nuevo
      :show="showModalNew"
      :etiquetas="editedItem"
      v-on:modalAsociacionEmit="etiquetaModalCallback($event)"
    ></app-etiquetas-modal-nuevo>
    <app-etiquetas-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :etiquetas="editedItem"
      v-on:modalAsociacionEmit="etiquetaModalCallback($event)"
    ></app-etiquetas-modal-edicion>
    <div class="text-xs-center">
      <v-dialog v-model="mostrarAvisoDelete" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloModalEliminar }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <span v-show="muestraEncabezadoEliminar">
              Al menos una de las Etiquetas tiene Vehículo asociado, por esta
              razón no se podrá realizar la eliminación.
            </span>
            <br v-show="muestraEncabezadoEliminar" />
            <br v-show="muestraEncabezadoEliminar" />
            {{ this.msgConfirm }}
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
import moment from 'moment';
import config from '@/config/index';
import store from '@/store';
import HandleErrors from '@/config/handleErrors';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';

import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { Component } from 'vue-property-decorator';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { eventBus, actionsEvent } from '@/setup';
import { EstadoEntidad, Accion } from '@/config/enums';

import EtiquetasModalNuevo from '@/components/plataforma/EtiquetasModalNuevo.vue';
import EtiquetasModalEdicion from '@/components/plataforma/EtiquetasModalEdicion.vue';
import ImportFile from '@/components/ImportFile.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { LoadingService } from '@/services/loadingService';

const { AgGridVue } = require('ag-grid-vue');
import {
  Grid,
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

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-etiquetas-modal-nuevo': EtiquetasModalNuevo,
    'app-etiquetas-modal-edicion': EtiquetasModalEdicion,
    'app-import': ImportFile,
  },
})
export default class Etiquetas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.EtiquetaVehiculos;
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
  readonly controllerVehiculoEtiqueta: string = 'VehiculoEtiqueta';
  tabModel: string = 'tab-1';
  localeText: any = config.agGridTextos;
  modalEsEdicion: boolean = false;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  detailCellRendererParams: any = null;
  sideBar: any = config.agGridDefaultConfig;
  gridOptions: GridOptions;
  autoGroupColumnDef: any = null;
  rowData: any = [];
  loadingService = new LoadingService();
  chequearPermisosBtnCrear: boolean = true;

  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  clienteId: number = config.getClienteSesion();
  $snotify: any;

  etiquetas: IEtiqueta[] = [];

  showModalCambioEstado: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];

  selected: any = [];
  validForm: boolean = true;

  dialogConfirm: boolean = false;
  dialogConfirmEliminarSeleccionadas: boolean = false;
  date: any = null;
  menuDatePicker: boolean = false;
  dialog: boolean = false;
  dialogEliminar: boolean = false;
  dialogAsociacion: boolean = false;

  search: String = '';
  editedIndex: number = -1;
  editedItem: IEtiqueta = {};
  defaultItem: IEtiqueta = {};

  dictionaryFormErrors: any = {};

  handleErrors: HandleErrors = new HandleErrors();

  muestraBarraBotones: boolean = false;

  tituloConfirm: string = '';
  msgConfirm: string = '';
  btnSiConfirm: string = '';
  btnNoConfirm: string = '';
  tipoConfirm: number = 0;

  siClassConfirm: string = 'primary';
  noClassConfirm: string = 'error';

  serverSide: any;
  mostrarAvisoDelete: boolean = false;
  tituloModalEliminar: string = '';
  muestraEncabezadoEliminar: boolean = false;
  encabezadoEliminar: string = '';

  titleEliminarItem: any = '';
  mensajeMasivo: any = '';

  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  paramsExportar: any; //Parametros para Exportar
  vehiculosCompartidos: any = [];
  intervalo: any; //Intervalo para el buscador
  tituloDeleteMasivo: any = '';
  mensajeDeleteMasivo: any = '';
  //Ordenamiento + Seleccion
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];
  //---

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
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        minWidth: 100,
        width: 170,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: 'agGroupCellRenderer',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 100,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Vehículos',
        field: 'cantidadVehiculosAsociados',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 100,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 100,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        lockPinned: true,
        width: 165,
        minWidth: 120,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        sortable: true,
        resizable: true,
        minWidth: 100,
        width: 170,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 180,
        minWidth: 120,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        minWidth: 100,
        lockPinned: true,
        width: 170,
      },
      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        filter: false,
        suppressMovable: true,
        resizable: false,
        sortable: false,
        lockVisible: true,
      },
    ];

    //Grilla Vehículos
    this.detailCellRendererParams = {
      detailGridOptions: {
        localeText: this.localeText,
        suppressCsvExport: true,
        suppressExcelExport: true,
        columnDefs: [
          {
            headerName: 'Unidad',
            field: 'unidad',
            resizable: true,
            sortable: false,
            suppressMenu: true,
            filter: false,
            suppressMovable: true,
          },
          {
            headerName: '',
            cellRenderer: this.createButtonCellVehiculoCompartido,
            enablePivot: false,
            lockPinned: true,
            resizable: true,
            width: 90,
            minWidth: 90,
            maxWidth: 90,
            filter: false,
            lockVisible: true,
            cellStyle: { textAlign: 'left' },
          },
        ],
        /*onFirstDataRendered(params: any) {
          params.api.sizeColumnsToFit();
        },*/
      },
      getDetailRowData: (params: any) => {
        params.successCallback(params.data.vehiculos);
      },
    };

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      onSelectionChanged: this.onSelectionChanged,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      masterDetail: true,
      suppressCopyRowsToClipboard: true,
      detailCellRendererParams: this.detailCellRendererParams,
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

  createButtonCellVehiculoCompartido(params: any) {
    const vc: any = this.vehiculosCompartidos.find(
      (x: any) => x.id === params.data.id
    );
    if (vc !== undefined) {
      var eButton = document.createElement('i');
      eButton.setAttribute(
        'title',
        'Vehículo compartido por: ' + vc.compartidoPor
      );
      eButton.innerHTML =
        '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i>';
      return eButton;
    }
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
    eventBus.changeTitlePage('Etiquetas');
    this.axContextoVehiculo.http
      .get(`vehiculo/${0}/${this.clienteId}/vehiculoEsCompartidoGrillaAnidada`)
      .then(res => {
        this.vehiculosCompartidos = res.data;
      });
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

  onSelectionChanged(params: any) {
    if (this.gridApi.getSelectedNodes().length > 0) {
      this.muestraBarraBotones = true;
    } else {
      this.muestraBarraBotones = false;
    }
    this.valCheck = this.gridApi.getSelectedRows(); //Ordenamiento + Seleccion
  }

  onGridReady(params: GridReadyEvent) {
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

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  closeModal(val: boolean) {
    this.dialogEliminar = val;
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  getEtiquetas() {
    this.loadingService.showLoading();
    this.axContextoVehiculo.http
      .get(`${this.controllerVehiculoEtiqueta}/${this.clienteId}/cliente`)
      .then(res => {
        this.etiquetas = res.data;
      })
      .catch(error => {})
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  initialize() {
    this.getEtiquetas();
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.tipoConfirm = 1;
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
          this.eliminarItem(this.editedItem.cantidadVehiculosAsociados);
        }

        this.titleEliminarItem = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Etiqueta',
          nombreEntidad: config.getValorCelda(this.gridApi, data.id, 'nombre'),
        });
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

  confirmCallback(val: boolean, close: boolean = false) {
    this.dialogConfirm = false;

    if (val) {
      //Eliminación
      this.loadingService.showLoading();
      this.axContextoVehiculo.http
        .delete(`${this.controllerVehiculoEtiqueta}/${this.editedIndex}`)
        .then(res => {
          this.loadingService.hideLoading();
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.eliminar', {
              entidad: 'La Etiqueta',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'nombre'
              ),
              eliminadaO: 'eliminada',
            })
          );
          this.ServerSideRefresh();
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminar', {
                  entidad: 'la Etiqueta',
                  nombre: config.getValorCelda(
                    this.gridApi,
                    this.editedIndex,
                    'nombre'
                  ),
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'la Etiqueta',
                nombre: config.getValorCelda(
                  this.gridApi,
                  this.editedIndex,
                  'nombre'
                ),
              })
            );
          }
        });
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

  etiquetaModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;

    this.ServerSideRefresh();
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axContextoVehiculo.http
        .get(`${this.controllerVehiculoEtiqueta}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          let resp = JSON.parse(respServer.data);
          config.crearArchivoCsv(
            'EtiquetasVehiculos.csv',
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

  eliminarSeleccionadas() {
    if (this.gridApi.getSelectedNodes().length > 0) {
      let index = 0;
      var items = this.gridApi.getSelectedNodes();
      this.loadingService.showLoading();

      for (let i = 0; i <= items.length - 1; i++) {
        this.axContextoVehiculo.http
          .delete(`${this.controllerVehiculoEtiqueta}/${items[i].data.id}`)
          .then(res => {
            index = index + 1;
            if (index == items.length) {
              this.loadingService.hideLoading();
              this.muestraBarraBotones = false;

              let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'Las ' + items.length + ' Etiquetas seleccionadas'
                    : 'La Etiqueta ' + items[0].data.nombre,
                eliminadaOs: items.length > 1 ? 'eliminadas' : 'eliminada',
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
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'Las ' + items.length + ' Etiquetas'
                        : 'La Etiqueta',
                    eliminadaOs: items.length > 1 ? 'eliminadas' : 'eliminada',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    items.length > 1
                      ? 'Las ' + items.length + ' Etiquetas'
                      : 'La Etiqueta',
                  eliminadaOs: items.length > 1 ? 'eliminadas' : 'eliminada',
                })
              );
            }
          });
      }
    }
  }

  eliminarMasivoConfirm() {
    var cantidadAsociados = this.devuelveCantidadVehiculosAsociadosEliminacionMasiva();

    if (cantidadAsociados == 0) {
      // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
      if (this.gridApi.getSelectedNodes().length === 1) {
        this.tituloDeleteMasivo =
          'Eliminar Etiqueta: ' +
          this.gridApi.getSelectedNodes()[0].data.nombre;
        this.mensajeMasivo = this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: 'la Etiqueta',
        });
        this.dialogConfirmEliminarSeleccionadas = true;
      } else {
        this.tituloDeleteMasivo = this.$t(
          'mensajes.crud.eliminarMasivo.titulo',
          { entidad: 'Etiquetas' }
        );
        this.mensajeMasivo = this.$t('mensajes.crud.eliminarMasivo.mensaje', {
          los_cantidad_entidad_seleccionados:
            this.gridApi.getSelectedNodes().length > 1
              ? 'las ' +
                this.gridApi.getSelectedNodes().length +
                ' Etiquetas seleccionadas'
              : 'la Etiqueta seleccionada',
        });
        this.dialogConfirmEliminarSeleccionadas = true;
      }
    } else {
      // validacion mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
      if (this.gridApi.getSelectedNodes().length === 1) {
        //La Etiqueta tiene un Vehículo asociado, por esta razón no se podrá realizar la eliminación.
        this.msgConfirm =
          'La Etiqueta tiene ' +
          (cantidadAsociados > 1
            ? cantidadAsociados + ' Vehículos asociados, '
            : ' un Vehículo asociado, ') +
          'por esta razón no se podrá realizar la eliminación.';

        this.tituloModalEliminar =
          'Eliminar Etiqueta: ' +
          this.gridApi.getSelectedNodes()[0].data.nombre;
        this.muestraEncabezadoEliminar = false;
        this.mostrarAvisoDelete = true;
      } else {
        //un solo vehiculo asociado
        if (cantidadAsociados === 1) {
          this.muestraEncabezadoEliminar = false;
          this.msgConfirm =
            'Una de las Etiquetas tiene un Vehículo asociado, por esta razón no se podrá realizar la eliminación.';
        } else {
          this.muestraEncabezadoEliminar = true;
          this.encabezadoEliminar =
            'Al menos una de las Etiquetas tiene Vehículo asociado, por esta razón no se podrá realizar la eliminación.';
          this.msgConfirm =
            'Las Etiquetas están asociadas a ' +
            cantidadAsociados +
            (cantidadAsociados > 1 ? ' Vehículos.' : ' Vehículo.');
        }
        this.tituloModalEliminar = 'Eliminar Etiquetas ';
        this.mostrarAvisoDelete = true;
      }
    }
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

        //Ordenamiento + Seleccion
        const idFilasSeleccionadas = self.gridApi
          .getSelectedRows()
          .map(x => x.id);
        //---

        self.axContextoVehiculo.http
          .get(`${self.controllerVehiculoEtiqueta}/${self.clienteId}/grid`, {
            params: params.request,
          })
          .then(etiquetas => {
            let res = JSON.parse(etiquetas.data);
            if (res.data.length === 0) {
              params.successCallback([{}], 0);
              self.gridApi.showNoRowsOverlay();
            } else {
              params.successCallback(res.data, res.lastRow);
              //Ordenamiento + Seleccion
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
              //---
              self.gridApi.hideOverlay();
            }
            //self.gridApi.sizeColumnsToFit();
          })
          .catch(err => {
            params.failCallback();
          });
      },
    };
    this.ServerSideRefresh();
  }

  eliminarItem(cantidadAsociados: any) {
    if (cantidadAsociados > 0) {
      this.msgConfirm =
        'La Etiqueta tiene ' +
        (cantidadAsociados > 1
          ? cantidadAsociados + ' Vehículos asociados, '
          : ' un Vehículo asociado, ') +
        'por esta razón no se podrá realizar la eliminación.';
      (this.tituloModalEliminar =
        'Eliminar Etiqueta: ' +
        config.getValorCelda(this.gridApi, this.editedItem.id, 'nombre')),
        (this.muestraEncabezadoEliminar = false);
      this.mostrarAvisoDelete = true;
    } else {
      this.dialogConfirm = true;
    }
  }

  devuelveCantidadVehiculosAsociadosEliminacionMasiva(): number {
    let cantidad = 0;
    if (this.gridApi.getSelectedNodes().length > 0) {
      var items = this.gridApi.getSelectedNodes();
      for (let i = 0; i <= items.length - 1; i++) {
        if (items[i].data.cantidadVehiculosAsociados != undefined) {
          cantidad = cantidad + items[i].data.cantidadVehiculosAsociados;
        }
      }
    }
    return cantidad;
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

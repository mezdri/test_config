<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Conductores</v-tab>
      <v-tab
        :href="`#tab-2`"
        v-if="showTabGrupoConductores"
        to="/grupoconductores"
        >Grupo de Conductores</v-tab
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
      <div v-if="accionAgruparConductor.visible">
        <v-flex md3>
          <v-btn
            flat
            small
            class="btn-barra"
            @click="AsociacionConductorModal()"
          >
            <v-icon>person</v-icon>&nbsp;&nbsp;Agrupar Conductores
          </v-btn>
        </v-flex>
      </div>
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

    <app-confirmacion
      :show="dialogEliminar"
      :titulo="titleEliminarItem"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', { entidad: 'el Conductor' })
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

    <app-conductores-modal-asociacion-grupo
      :show="showModalAsociacion"
      :data="dataConductor"
      :conductores="editedItem"
      v-on:modalAsociacionEmit="conductorModalCallback($event)"
    ></app-conductores-modal-asociacion-grupo>
    <app-conductores-modal-nuevo
      :show="showModalNew"
      :conductores="editedItem"
      v-on:modalAsociacionEmit="conductorModalCallback($event)"
    ></app-conductores-modal-nuevo>
    <app-conductores-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :conductores="editedItem"
      v-on:modalAsociacionEmit="conductorModalCallback($event)"
    ></app-conductores-modal-edicion>
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
          <v-card-text v-show="muestraEncabezadoEliminar">
            <span>{{ this.msgConfirm }}</span>
          </v-card-text>
          <v-divider></v-divider>
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
import { ComponenteBase } from '@/views/base/ComponenteBase';
import moment from 'moment';
import config from '@/config/index';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';

import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { Component } from 'vue-property-decorator';
import { IConductor } from '@/interfaces/Conductores';
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import { EstadoEntidad } from '@/config/enums';

import ConductorGrupoAsociacionesModal from '@/components/plataforma/ConductorGrupoAsociacionesModal.vue';
import ConductoresModalNuevo from '@/components/plataforma/ConductoresModalNuevo.vue';
import ConductoresModalEdicion from '@/components/plataforma/ConductoresModalEdicion.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import ImportFile from '@/components/ImportFile.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import store from '@/store';

const { AgGridVue } = require('ag-grid-vue');
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

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-conductores-modal-nuevo': ConductoresModalNuevo,
    'app-conductores-modal-asociacion-grupo': ConductorGrupoAsociacionesModal,
    'app-conductores-modal-edicion': ConductoresModalEdicion,
    'app-import': ImportFile,
  },
})
export default class Conductores extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Conductores;
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

  accionAgruparConductor: PermisoAccion = {
    accionCodigo: 18,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionAgruparConductor,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);

  readonly conductorController: string = 'Conductor';

  tabModel: string = 'tab-1';
  localeText: any = {};
  modalEsEdicion: boolean = false;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = {};
  gridOptions: GridOptions;
  autoGroupColumnDef: any = null;
  loadingService = new LoadingService();

  mostrarAvisoDelete: boolean = false;
  showModalAsociacion: boolean = false;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  tituloModalEliminar: string = '';
  muestraEncabezadoEliminar: boolean = false;

  $snotify: any;

  conductores: IConductor[] = [];

  showModalCambioEstado: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];

  selected: any = [];
  validForm: boolean = true;
  dialogConfirm: boolean = false;
  dialogConfirmEliminarSeleccionadas: boolean = false;
  date: any = null;
  dialog: boolean = false;
  dialogEliminar: boolean = false;
  dialogAsociacion: boolean = false;

  conductorAsociacion: IConductor = {};

  search: String = '';
  editedIndex: number = -1;
  editedItem: IConductor = {};
  defaultItem: IConductor = {};

  dictionaryFormErrors: any = {};

  handleErrors: HandleErrors = new HandleErrors();

  muestraBarraBotones: boolean = false;
  clienteId: number = config.getClienteSesion();
  msgConfirm: string = '';
  tipoConfirm: number = 0;

  serverSide: any;
  dataConductor: IConductor[] = [];

  titleEliminarItem: any = '';
  mensajeMasivo: any = '';
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  chequearPermisosBtnCrear: boolean = true;
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  tituloDeleteMasivo: any = '';
  mensajeDeleteMasivo: any = '';
  //Ordenamiento + Seleccion
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];
  showTabGrupoConductores: boolean = false;
  //---

  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };

    this.localeText = config.agGridTextos;
    this.sideBar = config.agGridDefaultConfig;

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
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false &&
          this.chequearPermiso('Agrupar Conductor') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        sortable: true,
        resizable: true,
        minWidth: 80,
        width: 150,
        lockPinned: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        // cellRenderer: (params: any) => {
        //   return `${params.data.nombre} ${params.data.apellidoPaterno} ${params.data.apellidoMaterno}`;
        // },
      },
      {
        headerName: 'Grupo',
        field: 'conductorGrupoNombre',
        sortable: true,
        resizable: true,
        lockPinned: true,
        width: 205,
        minWidth: 80,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        sortable: true,
        resizable: true,
        width: 205,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Teléfono Celular',
        field: 'telefono',
        sortable: true,
        resizable: true,
        lockPinned: true,
        width: 165,
        minWidth: 80,
      },
      {
        headerName: 'Código Autorización',
        field: 'codigoConductor',
        hide: true,
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente Vehículo',
        field: 'patenteVehiculo',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'VIN Vehículo',
        field: 'vinVehiculo',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        lockPinned: true,
        width: 160,
        minWidth: 80,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        lockPinned: true,
        width: 180,
        minWidth: 80,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: (r: any) => {
          return EstadoEntidad[r.data.estado];
        },
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
        sortable: false,
        enablePivot: false,
        lockVisible: true,
      },
    ];

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
      suppressCopyRowsToClipboard: true,
      onSelectionChanged: this.onSelectionChanged,
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

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  mounted() {
    eventBus.changeTitlePage('Conductores');
    this.showTabGrupoConductores = config.chequeaPermisosTabs(
      Funcionalidades.GrupoDeConductores,
      config.getClienteSesion()
    );
  }

  async created() {
    await this.initialize();
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
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows(); //Ordenamiento + Seleccion
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

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  async obtenerConductores() {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.conductorController}/${this.clienteId}/cliente`
      );

      this.conductores = response.data;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  asociar(item: IConductor) {
    this.conductorAsociacion = item;
    this.dialogAsociacion = true;
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      try {
        this.loadingService.showLoading();
        const response = await this.axiosVehiculo.http.delete(
          `${this.conductorController}/${this.editedItem.id}`
        );

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Conductor',
            nombre:
              config.getValorCelda(this.gridApi, this.editedIndex, 'nombre') +
              ' ' +
              config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'apellidoPaterno'
              ),
            eliminadaO: 'eliminado',
          })
        );

        this.ServerSideRefresh();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'el Conductor',
                nombre:
                  config.getValorCelda(
                    this.gridApi,
                    this.editedIndex,
                    'nombre'
                  ) +
                  ' ' +
                  config.getValorCelda(
                    this.gridApi,
                    this.editedIndex,
                    'apellidoPaterno'
                  ),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'el Conductor',
              nombre:
                config.getValorCelda(this.gridApi, this.editedIndex, 'nombre') +
                ' ' +
                config.getValorCelda(
                  this.gridApi,
                  this.editedIndex,
                  'apellidoPaterno'
                ),
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  closeModal(val: boolean) {
    this.dialogEliminar = val;
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  async initialize() {
    await this.obtenerConductores();

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.tipoConfirm = 1;
        this.editedIndex = data.id;

        this.titleEliminarItem = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Conductor',
          nombreEntidad:
            config.getValorCelda(this.gridApi, data.id, 'nombre') +
            ' ' +
            config.getValorCelda(this.gridApi, data.id, 'apellidoPaterno'),
        });

        let item: any = null;
        this.gridApi.forEachNode(function(rowNode: any, index: number) {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            return true;
          }
        });

        if (item !== null) {
          this.editedItem = item;
          this.eliminarItem(item);
        }
      } else if (
        data.action === Accion.Editar ||
        data.action === Accion.VerDetalle
      ) {
        this.modalEsEdicion = data.action === Accion.Editar;

        this.editedIndex = data.id;

        let item: any = null;
        this.gridApi.forEachNode(function(rowNode: any, index: number) {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            return true;
          }
        });

        if (item != null) {
          this.date = moment(item.fechaNacimiento).format('YYYY-MM-DD');
          this.editedItem.fechaNacimiento = this.date;

          if (item.fechaVencimientoRut != null) {
            let fiv: any = moment(item.fechaVencimientoRut).format(
              'YYYY-MM-DD'
            );
            this.editedItem.fechaVencimientoRut = fiv;
          } else {
            this.editedItem.fechaVencimientoRut = null;
          }

          this.editedItem = item;
          this.showModalEdit = true;
        }
      }
    });
  }

  async confirmCallback(val: boolean, close: boolean = false) {
    this.dialogConfirm = false;

    if (val) {
      //Eliminación
      this.loadingService.showLoading();
      try {
        const response = await this.axiosVehiculo.http.delete(
          `${this.conductorController}/${this.editedItem.id}`
        );
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Conductor',
            nombre:
              config.getValorCelda(this.gridApi, this.editedIndex, 'nombre') +
              ' ' +
              config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'apellidoPaterno'
              ),
            eliminadaO: 'eliminado',
          })
        );

        this.ServerSideRefresh();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(error);
          }
        } else {
          this.handleErrors.showError(error);
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  async confirmCallbackEliminarSeleccionadas(
    aceptado: boolean,
    close: boolean = false
  ) {
    this.dialogConfirmEliminarSeleccionadas = false;

    if (aceptado) {
      //Eliminación
      await this.eliminarSeleccionadas();
    } else {
      this.gridApi.deselectAll();
    }
  }

  AsociacionConductorModal() {
    this.dataConductor = [];
    const data = this.gridApi.getSelectedNodes();

    for (let i = 0; i <= data.length - 1; i++) {
      this.dataConductor.push(data[i].data);
    }

    this.showModalAsociacion = true;
  }

  conductorModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;
    this.showModalAsociacion = val;

    this.ServerSideRefresh();
  }

  ServerSideRefresh() {
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  ServerSideControler() {
    const self = this;
    this.serverSide = {
      async getRows(params: any) {
        params.request.search = self.search;
        params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
        self.paramsExportar = params; //Parametros al Exportar

        try {
          //Ordenamiento + Seleccion
          const idFilasSeleccionadas = self.gridApi
            .getSelectedRows()
            .map(x => x.id);
          //---

          const conductores = await self.axiosVehiculo.http.get(
            `${self.conductorController}/${self.clienteId}/grid`,
            {
              params: params.request,
            }
          );

          let res = JSON.parse(conductores.data);
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
          self.loadingService.hideLoading();
        } catch (error) {
          params.failCallback();
          self.loadingService.hideLoading();
        }
      },
    };

    this.ServerSideRefresh();
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosVehiculo.http
        .get(`${this.conductorController}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          let resp = JSON.parse(respServer.data);
          config.crearArchivoCsv('Conductores.csv', resp.data, this.columnDefs);
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

  async eliminarSeleccionadas() {
    if (this.gridApi.getSelectedNodes().length > 0) {
      this.loadingService.showLoading();
      const items = this.gridApi.getSelectedNodes();

      try {
        for (let i = 0; i <= items.length - 1; i++) {
          const responseDelete = await this.axiosVehiculo.http.delete(
            `${this.conductorController}/${items[i].data.id}`
          );
        }

        this.muestraBarraBotones = false;
        let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
          los_cantidad_entidad_seleccionados:
            items.length > 1
              ? 'Los Conductores'
              : 'El Conductor ' +
                items[0].data.nombre +
                ' ' +
                items[0].data.apellidoPaterno,
          eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
        });

        if (items.length === 1) {
          msj = msj.toString().replace('han', 'ha');
        }

        this.$snotify.success(msj);
        this.ServerSideRefresh();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'los ' + items.length + ' Conductores'
                    : 'el Conductor',
                eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'los ' + items.length + ' Conductores'
                  : 'el Conductor',
              eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  eliminarMasivoConfirm() {
    const cantidadAsociados = this.obtenerCantidadVehiculosAsociadosEliminacionMasiva();

    if (cantidadAsociados === 0) {
      if (this.gridApi.getSelectedNodes().length === 1) {
        this.mensajeMasivo = this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Conductor',
        });
        this.tituloDeleteMasivo =
          'Eliminar Conductor: ' +
          this.gridApi.getSelectedNodes()[0].data.nombre +
          ' ' +
          this.gridApi.getSelectedNodes()[0].data.apellidoPaterno;
        this.dialogConfirmEliminarSeleccionadas = true;
      } else {
        this.mensajeMasivo = this.$t('mensajes.crud.eliminarMasivo.mensaje', {
          los_cantidad_entidad_seleccionados:
            this.gridApi.getSelectedNodes().length > 1
              ? 'los Conductores.'
              : 'el Conductor seleccionado',
        });
        this.tituloDeleteMasivo = this.$t(
          'mensajes.crud.eliminarMasivo.titulo',
          { entidad: 'Conductores' }
        );
        this.dialogConfirmEliminarSeleccionadas = true;
      }
    } else {
      if (this.gridApi.getSelectedNodes().length === 1) {
        this.msgConfirm =
          'El Conductor está asociado a ' +
          (cantidadAsociados > 1
            ? cantidadAsociados + ' Vehículos, '
            : 'un Vehículo, ') +
          'por esta razón no se podrá realizar la eliminación.';
        this.mostrarAvisoDelete = true;
        this.tituloModalEliminar =
          'Eliminar Conductor: ' +
          this.gridApi.getSelectedNodes()[0].data.nombre +
          ' ' +
          this.gridApi.getSelectedNodes()[0].data.apellidoPaterno;
        this.muestraEncabezadoEliminar = true;
      } else {
        this.msgConfirm =
          'Al menos uno de los Conductores está asociado a un Vehículo, por esta razón no se podrá realizar la eliminación.';

        this.mostrarAvisoDelete = true;
        this.tituloModalEliminar = 'Eliminar Conductores';
        this.muestraEncabezadoEliminar = true;
      }
    }
  }

  obtenerCantidadVehiculosAsociadosEliminacionMasiva(): number {
    let cantidad = 0;

    if (this.gridApi.getSelectedNodes().length > 0) {
      const items = this.gridApi.getSelectedNodes();

      for (let i = 0; i <= items.length - 1; i++) {
        if (items[i].data.cantidadVehiculosAsociados !== undefined) {
          cantidad = cantidad + items[i].data.cantidadVehiculosAsociados;
        }
      }
    }

    return cantidad;
  }
  eliminarItem(cantidadAsociados: any) {
    if (cantidadAsociados.cantidadVehiculosAsociados > 0) {
      this.msgConfirm =
        'El Conductor está asociado a ' +
        (cantidadAsociados > 1
          ? cantidadAsociados + ' Vehículos, '
          : 'un Vehículo, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.tituloModalEliminar =
        'Eliminar Conductor: ' +
        cantidadAsociados.nombre +
        ' ' +
        cantidadAsociados.apellidoPaterno;
      this.muestraEncabezadoEliminar = true;
      this.mostrarAvisoDelete = true;
    } else {
      // this.dialogConfirm = true

      this.dialogEliminar = true;
    }
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>

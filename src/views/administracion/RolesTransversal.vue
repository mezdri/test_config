<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Roles Transversales</v-tab>
      <v-tab v-if="showTabPerfiles" :href="`#tab-2`" to="/perfilesTransversal"
        >Perfiles Transversales</v-tab
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
            style="padding-right:20px;"
            @click="(editedItem = {}), (showModalNew = true)"
          >
            <v-icon dark left style="color: black;">add_circle_outline</v-icon
            >Crear
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-show="muestraBarraBotones">
      <div>
        <v-flex md2>
          <v-btn
            v-if="accionAsociarCliente.visible"
            flat
            small
            color="secondary"
            @click="asociarCliente()"
          >
            <v-icon>swap_vert</v-icon>&nbsp;&nbsp;Asociar a Cliente
          </v-btn>
        </v-flex>
      </div>
      <div v-if="accionEliminar.visible">
        <v-flex md3>
          <v-btn flat small color="secondary" @click="eliminarSeleccionadas">
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
      :titulo="tituloRolEliminar"
      :mensaje="mensajeDeleteSingle"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmMasivo"
      :titulo="tituloDeleteMasivo"
      :mensaje="mensajeDeleteMasivo"
      v-on:modalConfirmationEmit="deleteMasivoCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <app-roles-modal-nuevo
      :show="showModalNew"
      :rol="editedItem"
      v-on:modalAsociacionEmit="rolModalCallback($event)"
    ></app-roles-modal-nuevo>
    <app-roles-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :rol="editedItem"
      v-on:modalAsociacionEmit="rolModalCallback($event)"
    ></app-roles-modal-edicion>

    <app-asociar-entidad
      :show="showModalAsociarEntidades"
      entidad="Cliente"
      :registrosAsociar="registrosAsociar"
      titulo="Asociar a Cliente"
      subtitulo="Los Roles seleccionados se asociarán al siguiente Cliente"
      v-on:modalAsociarEntidadesEmit="rolModalCallback($event)"
    ></app-asociar-entidad>

    <div class="text-xs-center">
      <v-dialog
        v-model="dialogConfirmacionValidaAsociaciones"
        persistent
        max-width="580"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloModalEliminar }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text v-if="mensajeValidacionEliminados.length > 0">
            <span v-if="this.cantidadEliminarMasivo > 1">
              Los Roles Transversales que desea eliminar se encuentran asociados
              a Usuarios Transversales. Dado a esto, no se puede llevar a cabo
              la eliminación solicitada.
            </span>
            <ul v-if="this.cantidadEliminarMasivo === 1">
              <span
                v-for="item in mensajeValidacionEliminados"
                :key="item.id"
                >{{ item.mensaje }}</span
              >
              <br />
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              small
              color="primary"
              @click="dialogConfirmacionValidaAsociaciones = false"
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
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { Component } from 'vue-property-decorator';
import { RolesInterface } from '@/interfaces/Roles';
import { eventBus, actionsEvent } from '@/setup';
import { EstadoEntidad, Accion, TipoRol } from '@/config/enums';
import HandleErrors from '@/config/handleErrors';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import AsociarEntidades from '@/components/AsociarEntidades.vue';
import RolesTransversalModalNuevo from '@/components/mantenedores/RolesTransversalModalNuevo.vue';
import RolesTransversalModalEdicion from '@/components/mantenedores/RolesTransversalModalEdicion.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
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
    'app-roles-modal-nuevo': RolesTransversalModalNuevo,
    'app-roles-modal-edicion': RolesTransversalModalEdicion,
    'app-asociar-entidad': AsociarEntidades,
  },
})
export default class RolesTransversal extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.RolesTransversal;

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

  accionAsociarCliente: PermisoAccion = {
    accionCodigo: 12,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionAsociarCliente,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  tabModel: string = 'tab-1';
  readonly controller: string = 'Rol';
  readonly controllerRolTransversal: string = 'RolTransversal';

  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  sideBar: any = config.agGridDefaultConfig;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  autoGroupColumnDef: any = null;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  showModalCambioEstado: boolean = false;
  showModalAsociarEntidades: boolean = false;
  muestraBarraBotones: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];
  registrosAsociar: any = [];
  tituloRolEliminar: any = '';
  showModalValidacionEliminar: boolean = false;
  mensajeValidacionEliminar: string = '';
  tituloDeleteMasivo: string = '';
  mensajeDeleteMasivo: any = '';
  mensajeDeleteSingle: any = '';
  mensajeModalValidacionEliminar: any = [];
  mensajeValidacionEliminados: string[] = [];
  dialogConfirmacionValidaAsociaciones: Boolean = false;
  tituloModalEliminar: string = '';
  mensajeEliminarRolValidacion: string = '';
  usuarioRole: any[] = [];

  $snotify: any;
  search: string = '';
  roles: RolesInterface[] = [];
  dialogEliminar: Boolean = false;
  editedIndex: number = -1;
  editedItem: RolesInterface = {};
  defaultItem: RolesInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  gridOptions: GridOptions;
  serverSide: any;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  clienteId: number = config.getClienteSesion();
  showTabPerfiles: boolean = true;
  showTabModulos: boolean = true;
  loadingService = new LoadingService();
  dialogConfirmMasivo: boolean = false;
  cantidadEliminarMasivo: number = 0;
  paramsExportar: any; //Parametros para Exportar
  //permisos crear
  chequearPermisosBtnCrear: boolean = true;
  intervalo: any; //Intervalo para el buscador

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
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false &&
          this.chequearPermiso('Asociar a cliente') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
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
        field: 'name',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Tipo',
        field: 'tipoTxt',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 170,
        lockPinned: true,
        // cellRenderer: (r: any) => {
        //   return TipoRol[r.data.tipo];
        // },
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        // type: 'fecha',
        lockPinned: true,
        width: 165,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'nombreModificador',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 170,
        minWidth: 80,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        //type: 'fecha',
        lockPinned: true,
        width: 180,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        minWidth: 80,
        width: 170,
        lockPinned: true,
      },
      {
        headerName: 'Acciones',
        width: 120,
        minWidth: 120,
        filter: false,
        suppressMovable: true,
        resizable: false,
        sortable: false,
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
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      suppressCopyRowsToClipboard: true,
      sideBar: this.sideBar,
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
    eventBus.changeTitlePage('Roles Transversales');
    this.showTabPerfiles = config.chequeaPermisosTabs(
      Funcionalidades.PerfilTransversal,
      config.getClienteSesion()
    );
  }

  async created() {
    await this.initialize();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
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
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.serverSide = {
        async getRows(params: any) {
          params.request.search = self.search;
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          self.paramsExportar = params; //Parametros al Exportar
          try {
            const idFilasSeleccionadas = self.gridApi
              .getSelectedRows()
              .map(x => x.id);
            const response = await self.axiosCliente.http(
              `${self.controllerRolTransversal}/grid`,
              {
                params: params.request,
              }
            );

            if (response.data.data.length === 0) {
              self.gridApi.showNoRowsOverlay();
              params.successCallback([{}], 0);
            } else {
              params.successCallback(response.data.data, response.data.lastRow);
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
          } catch (error) {
            params.failCallback();
          }
        },
      };

      this.obtenerRolUsuario();

      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows();
  }

  async deleteItemCallback(aceptado: boolean) {
    this.dialogEliminar = false;

    if (aceptado) {
      try {
        this.loadingService.showLoading();
        //Eliminación
        await this.axios.http.delete(`${this.controller}/${this.editedIndex}`);
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Rol Transversal',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'name'
            ),
            eliminadaO: 'eliminado',
          })
        );
        this.gridApi.deselectAll();
        this.gridApi.setServerSideDatasource(this.serverSide);
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'Rol Transversal',
                nombre: config.getValorCelda(
                  this.gridApi,
                  this.editedIndex,
                  'name'
                ),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'Rol Transversal',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'name'
              ),
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  async obtenerRolUsuario() {
    try {
      const response = await this.axios.http.get(
        `${this.controller}/rolesUsuarios`
      );
      this.usuarioRole = response.data;
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

  async eliminarItem() {
    this.loadingService.showLoading();

    try {
      const resUsuarioRoles = await this.axiosCliente.http.get(
        `${this.controllerRolTransversal}/${this.editedIndex}/usuarios`
      );
      const cantidadUsuarios = resUsuarioRoles.data.length;

      if (cantidadUsuarios > 0) {
        this.tituloRolEliminar = `Eliminar Rol: ${config.getValorCelda(
          this.gridApi,
          this.editedIndex,
          'name'
        )}`;
        this.mensajeDeleteSingle =
          'Se eliminarán todas las asociaciones relacionadas al Rol. ¿Está seguro que desea eliminar el Rol Transversal?';
        this.dialogEliminar = true;
      } else {
        this.tituloRolEliminar = `Eliminar Rol: ${config.getValorCelda(
          this.gridApi,
          this.editedIndex,
          'name'
        )}`;
        this.dialogEliminar = true;
        this.mensajeDeleteSingle = this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Rol Transversal',
        });
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'Rol Transversal',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'name'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'Rol Transversal',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'name'
            ),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
  }

  rolModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;
    this.showModalAsociarEntidades = val;
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.obtenerRolUsuario();
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosCliente
        .http(`${this.controllerRolTransversal}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'RolesTransversales.csv',
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

  asociarCliente() {
    this.registrosAsociar = [];
    const data = this.gridApi.getSelectedNodes();

    for (let i = 0; i <= data.length - 1; i++) {
      this.registrosAsociar.push(data[i].data);
    }

    this.showModalAsociarEntidades = true;
  }

  async eliminarSeleccionadas() {
    const items = this.gridApi.getSelectedNodes();
    let tieneUsuario: boolean = false;
    this.loadingService.showLoading();

    try {
      for (let i = 0; i <= items.length - 1; i++) {
        const rolesAsociados = this.usuarioRole.filter(
          (x: any) => x == items[i].data.id
        );
        if (rolesAsociados.length > 0) {
          tieneUsuario = true;
        }
      }

      if (tieneUsuario === true) {
        if (items.length === 1) {
          this.tituloDeleteMasivo = `Eliminar Rol: ${items[0].data.name}`;
          this.mensajeDeleteMasivo =
            'Se eliminarán todas las asociaciones relacionadas al Rol. ¿Está seguro que desea eliminar el Rol Transversal?';
          this.dialogConfirmMasivo = true;
        } else {
          this.tituloDeleteMasivo = 'Eliminar Roles Transversales';
          this.mensajeDeleteMasivo =
            'Se eliminarán todas las asociaciones relacionadas a los Roles. ¿Está seguro que desea eliminar los Roles Transversales?';
          this.dialogConfirmMasivo = true;
        }
      } else {
        if (items.length === 1) {
          this.tituloDeleteMasivo = `Eliminar Rol: ${items[0].data.name}`;
          this.mensajeDeleteMasivo = this.$t('mensajes.crud.eliminar.mensaje', {
            entidad: 'el Rol Transversal',
          });
          this.dialogConfirmMasivo = true;
        } else {
          this.tituloDeleteMasivo = 'Eliminar Roles Transversales';
          this.mensajeDeleteMasivo = this.$t('mensajes.crud.eliminar.mensaje', {
            entidad: 'los Roles Transversales',
          });
          this.dialogConfirmMasivo = true;
        }
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Los ' + items.length + ' Roles Transversales seleccionados'
                  : 'El Rol Transversal seleccionado',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1
                ? 'Los ' + items.length + ' Roles Transversales seleccionados'
                : 'El Rol Transversal seleccionado',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  deleteMasivoCallback(aceptado: boolean) {
    this.dialogConfirmMasivo = false;
    if (aceptado) {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index = 0;
        const items = this.gridApi.getSelectedNodes();
        let model: any = [];
        this.loadingService.showLoading();
        for (let i = 0; i <= items.length - 1; i++) {
          this.axios.http
            .delete(`${this.controller}/${items[i].data.id}`)
            .then(res => {
              index = index + 1;
              if (index == items.length) {
                this.loadingService.hideLoading();
                this.muestraBarraBotones = false;
                let msj: any = this.$t(
                  'mensajes.mensajesExito.eliminarMasivo',
                  {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'Los ' + items.length + ' Roles seleccionados'
                        : 'El Rol seleccionado',
                    eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
                  }
                );
                if (items.length === 1) {
                  msj = msj.toString().replace('han', 'ha');
                }
                this.$snotify.success(msj);
                this.gridApi.deselectAll();
                this.gridApi.setServerSideDatasource(this.serverSide);
              }
            })
            .catch(err => {
              if (err.response !== undefined) {
                if (err.response.status !== 401) {
                  this.$snotify.error(
                    this.$t('mensajes.mensajesError.eliminarMasivo', {
                      los_cantidad_entidad_seleccionados:
                        'los ' + items.length + ' Roles',
                      eliminadaOs: 'seleccionados',
                    })
                  );
                }
              } else {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      'los ' + items.length + ' Roles',
                    eliminadaOs: 'seleccionados',
                  })
                );
              }
              return;
            });
        }
      }
    }
  }

  async initialize() {
    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);

    actionsEvent.$on('actionsEvent', async (data: any) => {
      if (data.funcionalidad === this.funcionalidad) {
        if (data.action === Accion.Eliminar) {
          this.editedIndex = data.id;
          this.cantidadEliminarMasivo = 1;
          this.tituloRolEliminar = `Eliminar Rol: ${config.getValorCelda(
            this.gridApi,
            data.id,
            'name'
          )}`;
          //this.editedIndex = data.id;
          this.eliminarItem();
        } else if (
          data.action === Accion.Editar ||
          data.action === Accion.VerDetalle
        ) {
          //Editar
          this.modalEsEdicion = data.action === Accion.Editar;

          try {
            const responseRol = await this.axiosCliente.http.get(
              `${this.controllerRolTransversal}/${data.id}`
            );

            this.editedItem = responseRol.data;
            this.showModalEdit = true;
          } catch (error) {
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.$snotify.show(error.message);
              }
            } else {
              this.$snotify.show(error.message);
            }
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
}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">Roles</v-tab>
      <v-tab v-if="showTabPerfiles" :href="`#tab-2`" to="/perfiles"
        >Perfiles</v-tab
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
      <div v-if="accionAsociarUsuario.visible">
        <v-flex md2>
          <v-btn flat small color="secondary" @click="asociarUsuario()">
            <v-icon>swap_vert</v-icon>&nbsp;&nbsp;Asociar a Usuario
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
        suppressCopyRowsToClipboard="true"
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
      :show="dialogEliminarMasivo"
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
      entidad="Usuario"
      :registrosAsociar="registrosAsociar"
      titulo="Asociar a Usuario"
      :subtitulo="subtitulo"
      v-on:modalAsociarEntidadesEmit="rolModalCallback($event)"
    ></app-asociar-entidad>

    <div class="text-xs-center">
      <v-dialog
        v-model="dialogConfirmacionValidaAsociaciones"
        persistent
        max-width="480"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloModalEliminar }}</v-toolbar-title
            >
          </v-toolbar>
          <v-card-text v-if="this.cantidadEliminarMasivo > 0">
            <ul
              style="padding:0;margin:0"
              v-for="item in mensajeValidacionEliminados"
              :key="item.id"
            >
              {{
                item.mensaje
              }}
            </ul>
          </v-card-text>
          <v-divider></v-divider>
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
import RolesModalNuevo from '@/components/mantenedores/RolesModalNuevo.vue';
import RolesModalEdicion from '@/components/mantenedores/RolesModalEdicion.vue';
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
    'app-roles-modal-nuevo': RolesModalNuevo,
    'app-roles-modal-edicion': RolesModalEdicion,
    'app-asociar-entidad': AsociarEntidades,
  },
})
export default class Roles extends ComponenteBase {
  readonly controllerRolTransversal: string = 'RolTransversal';
  readonly funcionalidad: Funcionalidades = Funcionalidades.Roles;

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

  accionAsociarUsuario: PermisoAccion = {
    accionCodigo: 11,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionAsociarUsuario,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  tabModel: string = 'tab-1';
  controller: string = 'Rol';
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
  mensajeModalValidacionEliminar: any = [];
  muestraEncabezadoEliminar: boolean = false;
  tituloModalEliminar: string = '';
  subtitulo: string = '';
  usuarioRole: any[] = [];

  $snotify: any;
  search: string = '';
  roles: RolesInterface[] = [];
  dialogEliminar: Boolean = false;
  dialogEliminarMasivo: boolean = false;
  cantidadEliminarMasivo: number = 0;
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
  loadingService = new LoadingService();
  intervalo: any; //Intervalo para el buscador

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;
  paramsExportar: any; //Parametros para Exportar

  //mensaje de eliminacion
  tituloDeleteMasivo: string = '';
  mensajeDeleteMasivo: any = '';
  mensajeDeleteSingle: any = '';
  mensajeValidacionEliminados: string[] = [];
  dialogConfirmacionValidaAsociaciones: Boolean = false;

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
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false &&
          this.chequearPermiso('Asociar Usuarios') === false
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
        /*cellRenderer: (r: any) => {
          return TipoRol[r.data.tipo];
        },*/
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 190,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        //type: 'fecha',
        lockPinned: true,
        width: 190,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'nombreModificador',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 190,
        minWidth: 80,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        //type: 'fecha',
        lockPinned: true,
        width: 190,
        minWidth: 80,
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
        /*cellRenderer: (r: any) => {
          if (r.data.estado === EstadoEntidad.Sistema)
            return EstadoEntidad[EstadoEntidad.Activo];
          else return EstadoEntidad[r.data.estado];
        },*/
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
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
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
    eventBus.changeTitlePage('Roles');
    this.showTabPerfiles = config.chequeaPermisosTabs(
      Funcionalidades.Perfiles,
      config.getClienteSesion()
    );
  }

  created() {
    this.initialize();
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

          self.axios
            .http(`${self.controller}/${self.clienteId}/grid`, {
              params: params.request,
            })
            .then(res => {
              const roles = JSON.parse(res.data);
              if (roles.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(roles.data, roles.lastRow);
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
              self.loadingService.hideLoading();
            })
            .catch(err => {
              params.failCallback();
              self.loadingService.hideLoading();
            });
        },
      };

      this.obtenerRolUsuario();

      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows(); //Ordenamiento + Seleccion
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
            this.$t('mensajes.mensajesExito.eliminar', {
              entidad: 'El Rol',
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
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminar', {
                  entidad: 'el Rol',
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
                entidad: 'el Rol',
                nombre: config.getValorCelda(
                  this.gridApi,
                  this.editedIndex,
                  'name'
                ),
              })
            );
          }
        });
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

      this.axios
        .http(`${this.controller}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          const roles = JSON.parse(respServer.data);
          config.crearArchivoCsv('Roles.csv', roles.data, this.columnDefs);
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

  asociarUsuario() {
    this.registrosAsociar = [];
    var data = this.gridApi.getSelectedNodes();
    this.subtitulo = 'El Rol seleccionado se asociará al siguiente Usuario';
    if (data.length > 1) {
      this.subtitulo =
        'Los Roles seleccionados se asociarán al siguiente Usuario';
    }
    for (let i = 0; i <= data.length - 1; i++) {
      this.registrosAsociar.push(data[i].data);
    }

    this.showModalAsociarEntidades = true;
  }

  async eliminarSeleccionadas() {
    const items = this.gridApi.getSelectedRows();
    let mensajeMasivo = this.$t('mensajes.crud.eliminarAsociado.mensaje', {
      entidad: 'los Roles',
      entidad1: 'los Roles',
    });
    let mensajeSingle = this.$t('mensajes.crud.eliminarAsociado.mensaje', {
      entidad: 'el Rol',
      entidad1: 'el Rol',
    });
    let mensajeSalida: any = [];
    let tieneUsuario: boolean = false;
    let tienePerfil: boolean = false;
    let index: number = 0;
    this.loadingService.showLoading();
    this.mensajeValidacionEliminados = [];

    try {
      for (let i = 0; i <= items.length - 1; i++) {
        const rolesAsociados = this.usuarioRole.filter(
          (x: any) => x == items[i].id
        );
        if (rolesAsociados.length > 0) {
          tieneUsuario = true;
        }
        if (items[i].tipo !== TipoRol.Local) {
          mensajeSalida.push({
            id: items[i].id,
            estado: 'NOK',
            mensaje: `No es posible eliminar el Rol ${items[i].name}, ya que es un Rol Transversal.`,
          });
        }
      }
      if (items.length > 1) {
        for (let i = 0; i <= items.length - 1; i++) {
          const resPerfiles = await this.axios.http.get(
            `${this.controller}/${items[i].id}/perfil`
          );
          if (resPerfiles.data.length > 0) {
            tienePerfil = true;
          }
        }
      } else {
        const resPerfiles = await this.axios.http.get(
          `${this.controller}/${items[0].id}/perfil`
        );
        if (resPerfiles.data.length > 0) {
          tienePerfil = true;
        }
        const resUsuarioRoles = await this.axiosCliente.http.get(
          `${this.controllerRolTransversal}/${items[0].id}/usuarios`
        );
        if (resUsuarioRoles.data.length > 0) {
          tieneUsuario = true;
        }
      }
      let nom = `${config.getValorCelda(this.gridApi, items[0].id, 'name')}`;
      // es transversal
      if (mensajeSalida.length > 0) {
        if (items.length === 1) {
          this.tituloModalEliminar = 'Eliminar Rol: ' + nom;
        } else {
          this.tituloModalEliminar = 'Eliminar Roles';
        }
        this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
        this.mensajeValidacionEliminados = mensajeSalida;
        this.dialogConfirmacionValidaAsociaciones = true;
        // tiene usuarios asociados
      } else if (tieneUsuario === true || tienePerfil === true) {
        if (items.length === 1) {
          // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
          this.mensajeDeleteMasivo =
            'Se eliminarán todas las asociaciones relacionadas al Rol. ¿Está seguro que desea eliminar el Rol?';
          this.tituloDeleteMasivo = 'Eliminar Rol: ' + nom;
          this.dialogEliminarMasivo = true;
        } else {
          this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
          this.tituloDeleteMasivo = 'Eliminar Roles';
          this.mensajeDeleteMasivo = mensajeMasivo;
          this.dialogEliminarMasivo = true; //Eliminar Masivo
        }
      } else {
        if (items.length === 1) {
          const resUsuarioRoles = await this.axiosCliente.http.get(
            `${this.controllerRolTransversal}/${items[0].id}/usuarios`
          );
          const resPerfiles = await this.axios.http.get(
            `${this.controller}/${items[0].id}/perfil`
          );

          const cantidadUsuarios = resUsuarioRoles.data.length;
          const cantidadPerfiles = resPerfiles.data.length;
          if (cantidadUsuarios > 0 || cantidadPerfiles > 0) {
            this.mensajeDeleteSingle =
              'Se eliminarán todas las asociaciones relacionadas al Rol. ¿Está seguro que desea eliminar el Rol?';
          } else {
            this.mensajeDeleteSingle =
              '¿Está seguro que desea eliminar el Rol?';
          }
          this.tituloDeleteMasivo = 'Eliminar Rol: ' + nom;
          this.mensajeDeleteMasivo = '¿Está seguro que desea eliminar el Rol?';
          this.dialogEliminarMasivo = true;
        } else {
          this.dialogEliminarMasivo = true;
          this.tituloDeleteMasivo = 'Eliminar Roles';
          this.mensajeDeleteMasivo =
            '¿Está seguro que desea eliminar los Roles?';
        }
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Los ' + items.length + ' Roles seleccionados'
                  : 'El Rol seleccionado',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1
                ? 'Los ' + items.length + ' Roles seleccionados'
                : 'El Rol seleccionado',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  deleteMasivoCallback(val: boolean) {
    this.dialogEliminarMasivo = false;
    if (val) {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index = 0;
        const items = this.gridApi.getSelectedNodes();
        this.loadingService.showLoading();
        let borrar = true;

        for (let i = 0; i <= items.length - 1; i++) {
          //valida si es rol transversal
          if (items[i].data.tipo !== TipoRol.Local) {
            this.$snotify.warning(
              'No es posible eliminar el rol ' +
                items[i].data.name +
                ' ya que es un Rol Transversal.'
            );
            borrar = false;
            this.loadingService.hideLoading();
          }
          //---
        }

        if (borrar) {
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
                      eliminadaOs:
                        items.length > 1 ? 'eliminados' : 'eliminado',
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
                this.loadingService.hideLoading();
                if (err.response !== undefined) {
                  if (err.response.status !== 401) {
                    this.$snotify.error(
                      this.$t('mensajes.mensajesError.eliminarMasivo', {
                        los_cantidad_entidad_seleccionados:
                          items.length > 1
                            ? 'Los ' + items.length + ' Roles seleccionados'
                            : 'El Rol seleccionado',
                      })
                    );
                  }
                } else {
                  this.$snotify.error(
                    this.$t('mensajes.mensajesError.eliminarMasivo', {
                      los_cantidad_entidad_seleccionados:
                        items.length > 1
                          ? 'Los ' + items.length + ' Roles seleccionados'
                          : 'El Rol seleccionado',
                    })
                  );
                }
              });
          }
        }
      }
    }
  }

  async eliminarItem() {
    this.loadingService.showLoading();
    this.mensajeValidacionEliminados = [];
    let cant = null;
    try {
      const resUsuarioRoles = await this.axiosCliente.http.get(
        `${this.controllerRolTransversal}/${this.editedIndex}/usuarios`
      );
      const resPerfiles = await this.axios.http.get(
        `${this.controller}/${this.editedIndex}/perfil`
      );

      const cantidadUsuarios = resUsuarioRoles.data.length;
      const cantidadPerfiles = resPerfiles.data.length;
      let nom = `${config.getValorCelda(
        this.gridApi,
        this.editedIndex,
        'name'
      )}`;
      if (cantidadUsuarios > 0 || cantidadPerfiles > 0) {
        this.tituloRolEliminar = 'Eliminar Rol: ' + nom;
        this.mensajeDeleteSingle =
          'Se eliminarán todas las asociaciones relacionadas al Rol. ¿Está seguro que desea eliminar el Rol?';
        this.dialogEliminar = true;
      } else {
        this.tituloRolEliminar = 'Eliminar Rol: ' + nom;
        this.mensajeDeleteSingle = '¿Está seguro que desea eliminar el Rol?';
        this.dialogEliminar = true;
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'Rol',
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
            entidad: 'Rol',
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

  /* eliminarItem() {
    this.mensajeModalValidacionEliminar = [];
    this.loadingService.showLoading();
      this.axios.http
        .get(`${this.controller}/${this.editedIndex}/usuario`)
        .then(res => {
          let resUsuarios = res.data;

          this.axios.http
            .get(`${this.controller}/${this.editedIndex}/perfil`)
            .then(res => {
              let resPerfiles = res.data;
              if (resUsuarios.length > 0 && resPerfiles.length > 0) {
                this.loadingService.hideLoading(); 
                this.mensajeModalValidacionEliminar.push("El Rol que desea eliminar se encuentra asociado a " +
                resUsuarios.length + (resUsuarios.length > 1 ? " Usuarios y " : " Usuario y ") + 
                resPerfiles.length + (resPerfiles.length > 1 ? " Perfiles. " : " Perfil. ") + 
                "Dado a esto, no se puede llevar a cabo la eliminación solicitada.");
                this.showModalValidacionEliminar = true;
                this.muestraEncabezadoEliminar = false;
                this.tituloModalEliminar = "Eliminar Rol";
              } else if (resUsuarios.length > 0) {
                this.loadingService.hideLoading(); 
                this.mensajeModalValidacionEliminar.push("El Rol que desea eliminar se encuentra asociado a " +
                resUsuarios.length + (resUsuarios.length > 1 ? " Usuarios. " : " Usuario. ") + 
                "Dado a esto, no se puede llevar a cabo la eliminación solicitada.");
                this.showModalValidacionEliminar = true;
                this.muestraEncabezadoEliminar = false;
                this.tituloModalEliminar = "Eliminar Rol";
              } else if (resPerfiles.length > 0) {
                this.loadingService.hideLoading(); 
                this.mensajeModalValidacionEliminar.push("El Rol que desea eliminar se encuentra asociado a " +
                resPerfiles.length + (resPerfiles.length > 1 ? " Perfiles. " : " Perfil. ") + 
                "Dado a esto, no se puede llevar a cabo la eliminación solicitada.");
                this.showModalValidacionEliminar = true;
                this.muestraEncabezadoEliminar = false;
                this.tituloModalEliminar = "Eliminar Rol";
              } else {
                //ELIMINAR
                this.loadingService.hideLoading(); 
                this.dialogEliminar = true;
              }              
            })
            .catch(error => {
              this.loadingService.hideLoading(); 
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.$snotify.error(
                    this.$t("mensajes.mensajesError.eliminar", {
                      entidad: "el Rol", 
                      nombre: config.getValorCelda(this.gridApi, this.editedIndex, "name")
                    })
                  );
                }
              } else {
                this.$snotify.error(
                  this.$t("mensajes.mensajesError.eliminar", {
                    entidad: "el Rol", 
                    nombre: config.getValorCelda(this.gridApi, this.editedIndex, "name")
                  })
                );
              }
            });
        })
        .catch(error => {
          this.loadingService.hideLoading(); 
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t("mensajes.mensajesError.eliminar", {
                  entidad: "el Rol", 
                  nombre: config.getValorCelda(this.gridApi, this.editedIndex, "name")
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t("mensajes.mensajesError.eliminar", {
                entidad: "el Rol", 
                nombre: config.getValorCelda(this.gridApi, this.editedIndex, "name")
              })
            );
          }
        });
  } */

  initialize() {
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

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.funcionalidad === Funcionalidades.Roles) {
        if (data.action == Accion.Eliminar) {
          let nom = `${config.getValorCelda(this.gridApi, data.id, 'name')}`;
          this.cantidadEliminarMasivo = 1;
          this.tituloModalEliminar = 'Eliminar Rol: ' + nom;
          this.editedIndex = data.id;
          this.eliminarItem();
        } else if (
          data.action == Accion.Editar ||
          data.action == Accion.VerDetalle
        ) {
          //Editar
          this.modalEsEdicion = data.action == Accion.Editar;

          this.axios.http
            .get(`${this.controller}/${data.id}`)
            .then(res => {
              this.editedItem = res.data;
              this.showModalEdit = true;
            })
            .catch(err => {
              if (err.response !== undefined) {
                if (err.response.status !== 401) {
                  this.$snotify.show(err.message);
                }
              } else {
                this.$snotify.show(err.message);
              }
            });
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

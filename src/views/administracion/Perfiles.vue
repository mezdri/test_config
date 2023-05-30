<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab v-if="showTabRoles" :href="`#tab-1`" to="/roles">Roles</v-tab>
      <v-tab :href="`#tab-2`">Perfiles</v-tab>
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

    <v-layout
      row
      wrap
      v-show="muestraBarraBotones"
      class="animated fadeIn fast"
    >
      <div v-if="accionAsociarRol.visible">
        <v-flex md2>
          <v-btn flat small color="secondary" @click="asociarRol()">
            <v-icon>swap_vert</v-icon>&nbsp;&nbsp;Asociar a Rol
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
      :show="dialogConfirm"
      :titulo="tituloPerfilEliminar"
      :mensaje="mensajeDeleteSingle"
      v-on:modalConfirmationEmit="confirmCallback($event)"
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

    <app-perfiles-modal-nuevo
      :show="showModalNew"
      :perfil="editedItem"
      v-on:modalAsociacionEmit="rolModalCallback($event)"
    ></app-perfiles-modal-nuevo>

    <app-perfiles-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :perfil="editedItem"
      v-on:modalAsociacionEmit="rolModalCallback($event)"
    ></app-perfiles-modal-edicion>

    <app-asociar-entidad
      :show="showModalAsociarEntidades"
      entidad="Rol"
      :registrosAsociar="registrosAsociar"
      titulo="Asociar a Rol"
      btnAceptarTxt="Asociar"
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
          <v-divider></v-divider>
          <v-card-text v-if="mensajeValidacionEliminados.length > 0">
            <span v-if="this.cantidadEliminarMasivo > 1">
              Se eliminarán todas las asociaciones relacionadas a los Perfiles.
              ¿Está seguro que desea eliminar los Perfiles?
            </span>
            <ul v-if="this.cantidadEliminarMasivo === 1">
              <span
                v-for="item in mensajeValidacionEliminados"
                :key="item.id"
                >{{ item.mensaje }}</span
              >
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
import { ServicioProxy, Accion } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';
import { Component } from 'vue-property-decorator';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { PerfilRolInterface } from '@/interfaces/Perfiles';
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import MenuItem from '@/components/MenuItem.vue';
import AsociarEntidades from '@/components/AsociarEntidades.vue';
import PerfilesModalNuevo from '@/components/mantenedores/PerfilesModalNuevo.vue';
import PerfilesModalEdicion from '@/components/mantenedores/PerfilesModalEdicion.vue';
import { EstadoEntidad } from '@/config/enums';
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
  ProcessCellForExportParams,
  CsvExportParams,
} from 'ag-grid-community';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-perfiles-modal-nuevo': PerfilesModalNuevo,
    'app-perfiles-modal-edicion': PerfilesModalEdicion,
    'app-asociar-entidad': AsociarEntidades,
  },
})
export default class Perfiles extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Perfiles;

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

  accionAsociarRol: PermisoAccion = {
    accionCodigo: 10,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionAsociarRol,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  controller: string = 'Perfil';
  PerfilTransversalController: string = 'PerfilTransversal';

  tabModel: string = 'tab-2';
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  sideBar: any = config.agGridDefaultConfig;
  gridApi: GridApi;
  columnApi: ColumnApi;
  gridOptions: GridOptions;
  columnDefs: Array<ColDef> = [];
  tituloPerfilEliminar: any = '';
  loadingService = new LoadingService();
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);

  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];

  dialogConfirmMasivo: boolean = false;
  cantidadEliminarMasivo: number = 0;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  showModalCambioEstado: boolean = false;
  showModalValidacionEliminar: boolean = false;
  mensajeModalValidacionEliminar: any = [];
  muestraEncabezadoEliminar: boolean = false;
  tituloModalEliminar: string = '';
  mensajeValidacionEliminados: string[] = [];
  dialogConfirmacionValidaAsociaciones: Boolean = false;

  $snotify: any;
  perfiles: PerfilesInterface[] = [];
  perfilRolesData: PerfilRolInterface[] = [];
  validForm: Boolean = true;
  dialogConfirm: Boolean = false;
  search: String = '';
  editedIndex: number = -1;
  editedItem: PerfilesInterface = {};
  defaultItem: PerfilesInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  muestraBarraBotones: boolean = false;
  serverSide: any;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  registrosAsociar: any = [];

  tipoConfirm: number = 0;
  showModalAsociarEntidades: boolean = false;
  showAsociarPerfilUsuario: boolean = false;
  showAsociarPerfilRol: boolean = false;
  clienteId: number = config.getClienteSesion();
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  showTabRoles: boolean = true;
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;

  //mensaje de eliminacion
  tituloDeleteMasivo: string = '';
  mensajeDeleteMasivo: any = '';
  mensajeDeleteSingle: any = '';

  //mensaje asociar rol
  subtitulo: string = '';

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
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false &&
          this.chequearPermiso('Asociar a rol') === false
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
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        resizable: true,
        lockPinned: true,
        width: 131,
        minWidth: 80,
      },
      {
        headerName: 'Creado por',
        field: 'nombreCreador',
        sortable: true,
        resizable: true,
        lockPinned: true,
        width: 195,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        //type: 'fecha',
        lockPinned: true,
        width: 195,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'nombreModificador',
        sortable: true,
        resizable: true,
        lockPinned: true,
        width: 195,
        minWidth: 80,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        //type: 'fecha',
        lockPinned: true,
        width: 195,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        sortable: true,
        resizable: true,
        width: 195,
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
      suppressCellSelection: false,
      localeText: this.localeText,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onGridReady: this.onGridReady,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      onSelectionChanged: this.onSelectionChanged,
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

  mounted() {
    eventBus.changeTitlePage('Perfiles');
    this.showTabRoles = config.chequeaPermisosTabs(
      Funcionalidades.Roles,
      config.getClienteSesion()
    );
  }

  async created() {
    await this.initialize();
    this.editedItem = {
      id: 0,
      nombre: '',
      perfilRoles: [],
    };
  }

  async obtenerPerfilRol() {
    try {
      const response = await this.axiosCliente.http.get(
        `${this.PerfilTransversalController}/perfilRoles`
      );
      this.perfilRolesData = response.data;
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
            .then(perfiles => {
              if (perfiles.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(
                  perfiles.data.data,
                  perfiles.data.lastRow
                );
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

      this.obtenerPerfilRol();
      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows(); //Ordenamiento + Seleccion
  }

  asociarRol() {
    this.registrosAsociar = [];
    const data = this.gridApi.getSelectedNodes();
    for (let i = 0; i <= data.length - 1; i++) {
      this.registrosAsociar.push(data[i].data);
    }

    if (data.length > 1) {
      this.subtitulo =
        'Los Perfiles seleccionados se asociarán al siguiente Rol';
    } else {
      this.subtitulo = 'El Perfil seleccionado se asociará al siguiente Rol';
    }
    this.showModalAsociarEntidades = true;
  }

  async confirmCallback(aceptado: boolean, close: boolean = false) {
    this.dialogConfirm = false;

    if (this.tipoConfirm == 1) {
      if (aceptado) {
        //Eliminación
        try {
          this.loadingService.showLoading();
          const responseDelete = await this.axios.http.delete(
            `${this.controller}?id=${this.editedIndex}`
          );
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.eliminar', {
              entidad: 'El Perfil',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'nombre'
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
                  entidad: 'el Perfil',
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
                entidad: 'el Perfil',
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
    } else {
      if (close) {
        this.showAsociarPerfilRol = false;
        this.showAsociarPerfilUsuario = false;
      } else {
        if (aceptado) {
          this.showAsociarPerfilRol = false;
          this.showAsociarPerfilUsuario = true;
        } else {
          this.showAsociarPerfilRol = true;
          this.showAsociarPerfilUsuario = false;
        }
      }
    }
  }

  rolModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;
    this.showModalAsociarEntidades = val;

    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  async eliminarSeleccionadas() {
    await this.obtenerPerfilRol(); //485 - Perfil - Eliminar
    const items = this.gridApi.getSelectedRows();
    this.loadingService.showLoading();
    let tieneRol: boolean = false;
    try {
      for (let i = 0; i <= items.length - 1; i++) {
        const perfilesAsociados = this.perfilRolesData.filter(
          x => x.perfilId == items[i].id
        );
        if (perfilesAsociados.length > 0) {
          tieneRol = true;
        }
      }
      let nom = `${config.getValorCelda(this.gridApi, items[0].id, 'nombre')}`;
      if (tieneRol === true) {
        if (items.length === 1) {
          this.tituloDeleteMasivo = 'Eliminar Perfil: ' + nom;
          this.mensajeDeleteMasivo =
            'Se eliminarán todas las asociaciones relacionadas al Perfil. ¿Está seguro que desea eliminar el Perfil?';
          this.dialogConfirmMasivo = true;
        } else {
          this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
          this.mensajeDeleteMasivo =
            'Se eliminarán todas las asociaciones relacionadas a los Perfiles. ¿Está seguro que desea eliminar los Perfiles?';
          this.tituloDeleteMasivo = 'Eliminar Perfiles';
          this.dialogConfirmMasivo = true;
        }
      } else {
        // mensajes de eliminacion en perfiles transversales sin roles transversales asociados
        if (this.gridApi.getSelectedNodes().length > 0) {
          if (this.gridApi.getSelectedNodes().length === 1) {
            this.mensajeDeleteMasivo =
              '¿Está seguro que desea eliminar el Perfil?';
            this.tituloDeleteMasivo = 'Eliminar Perfil: ' + nom;
            this.dialogConfirmMasivo = true;
          } else {
            this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
            this.mensajeDeleteMasivo =
              '¿Está seguro que desea eliminar los Perfiles?';
            this.tituloDeleteMasivo = 'Eliminar Perfiles';
            this.dialogConfirmMasivo = true;
          }
        }
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Los ' + items.length + ' Perfiles seleccionados'
                  : 'El Perfil seleccionado',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1
                ? 'Los ' + items.length + ' Perfiles seleccionados'
                : 'El Perfil seleccionado',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  deleteMasivoCallback(val: boolean) {
    this.dialogConfirmMasivo = false;
    if (val) {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index = 0;
        const items = this.gridApi.getSelectedNodes();
        this.mensajeModalValidacionEliminar = [];
        this.loadingService.showLoading();
        for (let i = 0; i <= items.length - 1; i++) {
          //Eliminación
          this.axios.http
            .delete('Perfil?id=' + items[i].data.id)
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
                        ? 'Los ' + items.length + ' Perfiles seleccionados'
                        : 'El Perfil ' + items[i].data.nombre + '',
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
              this.loadingService.hideLoading();
              if (err.response !== undefined) {
                if (err.response.status !== 401) {
                  this.$snotify.error(
                    this.$t('mensajes.mensajesError.eliminarMasivo', {
                      los_cantidad_entidad_seleccionados:
                        items.length > 1
                          ? 'Los ' + items.length + ' Perfiles seleccionados.'
                          : 'El Perfil seleccionado.',
                    })
                  );
                }
              } else {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'Los ' + items.length + ' Perfiles seleccionados.'
                        : 'El Perfil seleccionado.',
                  })
                );
              }
            });
        }
      }
    }
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
          config.crearArchivoCsv(
            'Perfiles.csv',
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

  async eliminarItem() {
    this.loadingService.showLoading();
    this.mensajeValidacionEliminados = [];
    try {
      const resUsuarioRoles = await this.axiosCliente.http.get(
        `${this.PerfilTransversalController}/${this.editedIndex}/roles`
      );
      let nom = `${config.getValorCelda(
        this.gridApi,
        this.editedIndex,
        'nombre'
      )}`;
      const cantidadRolesPerfil = resUsuarioRoles.data.length;
      if (cantidadRolesPerfil > 0) {
        this.tituloPerfilEliminar = 'Eliminar Perfil: ' + nom;
        this.mensajeDeleteSingle =
          'Se eliminarán todas las asociaciones relacionadas al Perfil. ¿Está seguro que desea eliminar el Perfil?';
        this.dialogConfirm = true;
      } else {
        this.dialogConfirm = true;
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'El Perfil',
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
            entidad: 'El Perfil',
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

  /*eliminarItem() {
            this.mensajeModalValidacionEliminar = [];
            if (this.tipoConfirm == 1) {
                this.loadingService.showLoading();
                //valida asociaciones antes de eliminar
                this.axios.http
                    .get(`${this.controller}/${this.editedIndex}/rol`)
                    .then(res1 => {
                        let resRoles = res1.data.perfilRoles;

                        this.axios.http
                            .get(`${this.controller}/${this.editedIndex}/usuario`)
                            .then(res2 => {
                                let resUsuarios = res2.data[0].perfilUsuarios;

                                if (resUsuarios.length > 0 && resRoles.length > 0) {
                                    this.loadingService.hideLoading();
                                    this.mensajeModalValidacionEliminar.push(
                                        "El Perfil que desea eliminar se encuentra asociado a " +
                                        resUsuarios.length + (resUsuarios.length > 1 ? " Usuarios y " : " Usuario y ") +
                                        resRoles.length + (resRoles.length > 1 ? " Roles. " : " Rol. ") +
                                        "Dado a esto, no se puede llevar a cabo la eliminación solicitada."
                                    );
                                    this.showModalValidacionEliminar = true;
                                    this.muestraEncabezadoEliminar = false;
                                    this.tituloModalEliminar = "Eliminar Perfil";
                                } else if (resUsuarios.length > 0) {
                                    this.loadingService.hideLoading();
                                    this.mensajeModalValidacionEliminar.push(
                                        "El Perfil que desea eliminar se encuentra asociado a " +
                                        resUsuarios.length + (resUsuarios.length > 1 ? " Usuarios. " : " Usuario. ") +
                                        "Dado a esto, no se puede llevar a cabo la eliminación solicitada."
                                    );
                                    this.showModalValidacionEliminar = true;
                                    this.muestraEncabezadoEliminar = false;
                                    this.tituloModalEliminar = "Eliminar Perfil";
                                } else if (resRoles.length > 0) {
                                    this.loadingService.hideLoading();
                                    this.mensajeModalValidacionEliminar.push(
                                        "El Perfil que desea eliminar se encuentra asociado a " +
                                        resRoles.length + (resRoles.length > 1 ? " Roles. " : " Rol. ") +
                                        "Dado a esto, no se puede llevar a cabo la eliminación solicitada."
                                    );
                                    this.showModalValidacionEliminar = true;
                                    this.muestraEncabezadoEliminar = false;
                                    this.tituloModalEliminar = "Eliminar Perfil";
                                } else {
                                    //Modal Eliminación
                                    this.loadingService.hideLoading();
                                    this.dialogConfirm = true;
                                }
                            });
                    })
                    .catch(error => {
                        if (error.response !== undefined) {
                            if (error.response.status !== 401) {
                                this.$snotify.error(
                                    this.$t("mensajes.mensajesError.eliminar", {
                                        entidad: "el Perfil",
                                        nombre: config.getValorCelda(this.gridApi, this.editedIndex, "nombre")
                                    })
                                );
                            }
                        } else {
                            this.$snotify.error(
                                this.$t("mensajes.mensajesError.eliminar", {
                                    entidad: "el Perfil",
                                    nombre: config.getValorCelda(this.gridApi, this.editedIndex, "nombre")
                                })
                            );
                        }
                    });
            }
        } */

  async initialize() {
    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);

    actionsEvent.$on('actionsEvent', async (data: any) => {
      if (data.funcionalidad === Funcionalidades.Perfiles) {
        if (data.action === Accion.Eliminar) {
          let nom = `${config.getValorCelda(this.gridApi, data.id, 'nombre')}`;
          this.tipoConfirm = 1;
          this.cantidadEliminarMasivo = 1;
          this.tituloPerfilEliminar = 'Eliminar Perfil: ' + nom;
          this.mensajeDeleteSingle =
            '¿Está seguro que desea eliminar el Perfil?';

          this.editedIndex = data.id;
          this.eliminarItem();
        } else if (
          data.action === Accion.Editar ||
          data.action === Accion.VerDetalle
        ) {
          this.modalEsEdicion = data.action === Accion.Editar;

          this.editedIndex = data.id;

          try {
            const response = await this.axios.http.get(
              `${this.controller}/${data.id}`
            );
            this.editedItem = response.data;
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
<style>
.Bbisabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>

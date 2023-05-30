<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Usuarios</v-tab>
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
            @click="(editedItem = {}), (dialog = true)"
          >
            <v-icon dark left style="color: black;">add_circle_outline</v-icon>
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
          <v-btn flat small class="btn-barra" @click="eliminarSeleccionadas">
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
      :titulo="tituloDeleteMasivo"
      :mensaje="mensajeDeleteMasivo"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogEliminarMasivo"
      :titulo="tituloDeleteMasivo"
      :mensaje="mensajeDeleteMasivo"
      v-on:modalConfirmationEmit="deleteMasivoCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminarMasivo.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminarMasivo.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogDesbloquear"
      :titulo="tituloDesbloquear"
      :mensaje="mensajeDesbloquear"
      v-on:modalConfirmationEmit="unlockItemCallback($event)"
      :textoBtnSi="textoBtnSi"
      :textoBtnNo="$t('mensajes.crud.desbloquear.btnCancelar')"
    ></app-confirmacion>

    <app-nuevo-usuario
      :show="dialog"
      :objusuario="editedItem"
      v-on:modalAsociacionEmit="modalUsuarioCallback($event)"
    ></app-nuevo-usuario>
    <app-editar-usuario
      :esEdicion="modalEsEdicion"
      :show="dialogEditar"
      :objusuario="editedItem"
      v-on:modalAsociacionEmit="modalUsuarioCallback($event)"
    ></app-editar-usuario>

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
          <v-card-text v-if="mensajeEliminarConAsociacion.length > 0">
            {{ mensajeEliminarConAsociacion }}
          </v-card-text>
          <v-card-text v-if="mensajeValidacionEliminados.length > 0">
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

      <v-dialog v-model="dialogReestablecerPassword" persistent max-width="580">
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="dialogReestablecerPassword = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important;"
              >{{ tituloReestablecerPassword }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <span>{{ mensajeReestablecerPassword }}</span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <span>{{ linkReestablecerPassword.substring(0, 60) + '...' }}</span>
            <input
              type="hidden"
              id="urlToCopy"
              :value="linkReestablecerPassword"
            />
            <v-spacer></v-spacer>

            <v-btn color="#526da5" small @click.stop.prevent="copiarPassword">
              <span style="color: white;">Copiar Enlace</span>
            </v-btn>
            <v-spacer></v-spacer>
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
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import UsuariosModalNuevo from '@/components/mantenedores/UsuariosModalNuevo.vue';
import UsuariosModalEdicion from '@/components/mantenedores/UsuariosModalEdicion.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { RegistroInterface } from '@/interfaces/Login';
import { Funcionalidades } from '@/config/funcionalidades';
import { EstadoEntidad, TipoUsuario } from '@/config/enums';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { ComponenteBase } from '@/views/base/ComponenteBase';
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
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-nuevo-usuario': UsuariosModalNuevo,
    'app-editar-usuario': UsuariosModalEdicion,
  },
})
export default class Usuarios extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Usuarios;

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
  readonly controller: string = 'Usuario';
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  sideBar: any = config.agGridDefaultConfig;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();

  autoGroupColumnDef: any = null;
  $snotify: any;
  date: any = null;
  usuarios: UsuariosInterface[] = [];
  dialog: Boolean = false;
  dialogEliminarMasivo: Boolean = false;
  dialogEditar: Boolean = false;
  dialogEliminar: Boolean = false;
  dialogConfirmacionValidaAsociaciones: Boolean = false;
  mensajeEliminarConAsociacion: string = '';
  search: string = '';
  editedIndex: number = -1;
  newItem: RegistroInterface = {};
  editedItem: UsuariosInterface = {};
  defaultItem: UsuariosInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  gridOptions: GridOptions;
  muestraBarraBotones: boolean = false;
  dataCambioEstado: any = [];
  serverSide: any;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  tituloUsuarioEliminar: any = '';
  mensajeUsuarioEliminarMasivo: any = '';
  mensajeValidacionEliminados: string[] = [];
  tituloModalEliminar: string = '';
  cantidadEliminarMasivo: number = 0;
  paramsExportar: any; //Parametros para Exportar
  tituloDeleteMasivo: any = '';
  mensajeDeleteMasivo: any = '';
  nAsoc: number = 0;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];
  //permisos crear
  chequearPermisosBtnCrear: boolean = true;
  intervalo: any; //Intervalo para el buscador
  readonly controllerFlota: string = 'flota';
  axiosAuth = new AxiosVue(ServicioProxy.Auth);

  dialogDesbloquear: Boolean = false;
  tituloDesbloquear: any = '';
  mensajeDesbloquear: any = '';
  textoBtnSi: any = '';

  dialogReestablecerPassword: Boolean = false;
  tituloReestablecerPassword: any = '';
  mensajeReestablecerPassword: any = '';
  linkReestablecerPassword: any = '';

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
        headerName: 'Rut',
        field: 'rut',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 150,
        minWidth: 80,
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        sortable: true,
        resizable: true,
        filter: false,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        // cellRenderer: (params: any) => {
        //  return `${params.data.nombre} ${params.data.apellidoPaterno}  ${params.data.apellidoMaterno}`;
        //},
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        enablePivot: true,
        filter: false,
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 205,
        minWidth: 80,
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 180,
        minWidth: 80,
      },
      {
        headerName: 'Teléfono Fijo',
        field: 'telefonoFijo',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 145,
        minWidth: 80,
      },
      {
        headerName: 'Teléfono Celular',
        field: 'telefonoParticular',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 165,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Nac.',
        field: 'fechaNacimientoTxt',
        lockPinned: true,
        width: 145,
        minWidth: 80,
        sortable: true,
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
        width: 165,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 180,
        minWidth: 80,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        lockPinned: true,
        width: 185,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        sortable: true,
        resizable: true,
        filter: false,
        lockPinned: true,
        width: 170,
        minWidth: 80,
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
      cacheBlockSize: 10000, //Solución Paginación
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
          // cellRenderer: this.fechaFilter,
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
    eventBus.changeTitlePage('Usuarios');
    actionsEvent.$on('envioLink', async (link: string) => {
      this.reestablecerPassword(link);
    });
  }

  reestablecerPassword(link: string) {
    this.tituloReestablecerPassword = this.$t(
      'mensajes.crud.cambiarPassword.titulo'
    );
    this.mensajeReestablecerPassword = this.$t(
      'mensajes.crud.cambiarPassword.mensaje'
    );
    this.linkReestablecerPassword = link;
    this.dialogReestablecerPassword = true;
  }

  copiarPassword() {
    let urlToCopy: any = document.querySelector('#urlToCopy');
    urlToCopy.setAttribute('type', 'text');
    urlToCopy.select();
    try {
      var urlCopied = document.execCommand('copy');
      urlCopied
        ? this.$snotify.success(this.$t('mensajes.mensajesExito.copiarEnlace'))
        : this.$snotify.error(this.$t('mensajes.mensajesError.copiarEnlace'));
    } catch (err) {
      console.log('error en execCommand');
    }
    this.dialogReestablecerPassword = false;
    urlToCopy.setAttribute('type', 'hidden');
    window.getSelection().removeAllRanges();
  }

  created() {
    this.initialize();
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;

    if (this.gridApi.getSelectedNodes().length == 1) {
      this.mensajeUsuarioEliminarMasivo = this.$t(
        'mensajes.crud.eliminarMasivo.mensaje',
        { los_cantidad_entidad_seleccionados: 'el Usuario seleccionado' }
      );
    } else if (this.gridApi.getSelectedNodes().length > 1) {
      this.mensajeUsuarioEliminarMasivo = this.$t(
        'mensajes.crud.eliminarMasivo.mensaje',
        {
          los_cantidad_entidad_seleccionados:
            'los ' +
            this.gridApi.getSelectedNodes().length +
            ' Usuarios seleccionados',
        }
      );
    } else {
      this.mensajeUsuarioEliminarMasivo = '';
    }
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
          const idFilasSeleccionadas = self.gridApi
            .getSelectedRows()
            .map(x => x.id);
          self.axios
            .http(`${self.controller}/` + self.clienteId + `/grid`, {
              params: params.request,
            })
            .then(usuarios => {
              if (usuarios.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(
                  usuarios.data.data,
                  usuarios.data.lastRow
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

  //17-05-2019 NUEVA FUNCION: Validacion que pertenezca a un mismo cliente
  //(ISSUE: 229 - Usuario - Eliminar)
  async eliminarItem() {
    this.nAsoc = 0;
    let id = this.editedIndex;
    this.mensajeEliminarConAsociacion = '';
    this.dialogConfirmacionValidaAsociaciones = false;
    let mensajeSingle = this.$t('mensajes.crud.eliminarAsociado.mensaje', {
      entidad: 'al Usuario',
      entidad1: 'el Usuario',
    });

    try {
      this.loadingService.showLoading();
      const res = await this.axios.http.get(`${this.controller}/${id}/cliente`);
      if (res.data.length > 0) {
        let cliente = res.data.filter(
          (x: any) => x.clienteId === this.clienteId
        );
        const resClientesConsulta = await this.axios.http.get(
          `${this.controller}/${id}/clienteRol`
        );
        const cantidadClientes = resClientesConsulta.data.length;
        if (cantidadClientes > 0) {
          this.nAsoc++;
        }
        const resFlotas: any = await this.axiosVehiculo.http.get(
          `${this.controllerFlota}/${id}/usuarioflota/`
        );
        let cantidadFlotas = resFlotas.data.length;
        if (cantidadFlotas > 0) {
          this.nAsoc++;
        }
        this.tituloDeleteMasivo = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Usuario',
          nombreEntidad:
            `${config.getValorCelda(this.gridApi, id, 'nombre')}` +
            ' ' +
            config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'apellidoPaterno'
            ),
        });
        if (cliente.length > 0) {
          if (this.nAsoc == 0) {
            this.mensajeDeleteMasivo =
              '¿Está seguro que desea eliminar el Usuario?';
          } else {
            this.mensajeDeleteMasivo = mensajeSingle;
          }
          this.dialogEliminar = true;
        }
      } else {
        this.dialogConfirmacionValidaAsociaciones = true;
        this.mensajeEliminarConAsociacion =
          'El Usuario que desea eliminar se encuentra asociado a otro Cliente. ' +
          'Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
        this.tituloModalEliminar = 'Eliminar Usuario: ';
      }
    } catch (err) {
      if (err.response !== undefined) {
        if (err.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'el Usuario',
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
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'el Usuario',
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

  //17-05-2019: SE COMENTA FUNCION ANTERIOR (ISSUE: 229 - Usuario - Eliminar)
  /*eliminarItem() {
            let id = this.editedIndex;
            this.mensajeEliminarConAsociacion = "";
            this.mensajeValidacionEliminados = [];
            this.dialogConfirmacionValidaAsociaciones = false;
            this.loadingService.showLoading();

            //valida asociaciones
            this.axios.http
                .get(`${this.controller}/${id}/cliente`)
                .then(res => {
                    this.axios.http
                        .get(`${this.controller}/${id}/rol`)
                        .then(res2 => {
                            if (res.data.length > 0 && res2.data.length > 0) {
                                this.loadingService.hideLoading();
                                this.dialogConfirmacionValidaAsociaciones = true;
                                this.mensajeEliminarConAsociacion =
                                    "El Usuario que desea eliminar se encuentra asociado a " +
                                    res.data.length + (res.data.length > 1 ? " Clientes y " : " Cliente y ") +
                                    res2.data.length + (res2.data.length > 1 ? " Roles. " : " Rol. ") +
                                    "Dado a esto, no se puede llevar a cabo la eliminación solicitada.";
                                this.tituloModalEliminar = "Eliminar Usuario";
                            } else if (res.data.length > 0) {
                                this.loadingService.hideLoading();
                                this.dialogConfirmacionValidaAsociaciones = true;
                                this.mensajeEliminarConAsociacion =
                                    "El Usuario que desea eliminar se encuentra asociado a " +
                                    res.data.length + (res.data.length > 1 ? " Clientes. " : " Cliente. ") +
                                    "Dado a esto, no se puede llevar a cabo la eliminación solicitada.";
                                this.tituloModalEliminar = "Eliminar Usuario";
                            } else if (res2.data.length > 0) {
                                this.loadingService.hideLoading();
                                this.dialogConfirmacionValidaAsociaciones = true;
                                this.mensajeEliminarConAsociacion =
                                    "El Usuario que desea eliminar se encuentra asociado a " +
                                    res2.data.length + (res2.data.length > 1 ? " Roles. " : " Rol. ") +
                                    "Dado a esto, no se puede llevar a cabo la eliminación solicitada.";
                                this.tituloModalEliminar = "Eliminar Usuario";
                            } else {
                                //Eliminación
                                this.loadingService.hideLoading();
                                this.dialogEliminar = true;
                            }
                        })
                        .catch(err => {
                            this.loadingService.hideLoading();
                            if (err.response !== undefined) {
                                if (err.response.status !== 401) {
                                    this.$snotify.error(
                                        this.$t("mensajes.mensajesError.eliminar", {
                                            entidad: "el Usuario",
                                            nombre: config.getValorCelda(this.gridApi, this.editedIndex, "nombre")
                                                + " " +
                                                config.getValorCelda(this.gridApi, this.editedIndex, "apellidoPaterno")
                                        })
                                    );
                                }
                            } else {
                                this.$snotify.error(
                                    this.$t("mensajes.mensajesError.eliminar", {
                                        entidad: "el Usuario",
                                        nombre: config.getValorCelda(this.gridApi, this.editedIndex, "nombre")
                                            + " " +
                                            config.getValorCelda(this.gridApi, this.editedIndex, "apellidoPaterno")
                                    })
                                );
                            }
                        });
                })
                .catch(err => {
                    this.loadingService.hideLoading();
                    if (err.response !== undefined) {
                        if (err.response.status !== 401) {
                            this.$snotify.error(
                                this.$t("mensajes.mensajesError.eliminar", {
                                    entidad: "el Usuario",
                                    nombre: config.getValorCelda(this.gridApi, this.editedIndex, "nombre")
                                        + " " +
                                        config.getValorCelda(this.gridApi, this.editedIndex, "apellidoPaterno")
                                })
                            );
                        }
                    } else {
                        this.$snotify.error(
                            this.$t("mensajes.mensajesError.eliminar", {
                                entidad: "el Usuario",
                                nombre: config.getValorCelda(this.gridApi, this.editedIndex, "nombre")
                                    + " " +
                                    config.getValorCelda(this.gridApi, this.editedIndex, "apellidoPaterno")
                            })
                        );
                    }
                });
        }*/

  //2019-05-17: Nueva Función: sólo validar que el usuario sea del mismo cliente.
  //(ISSUE: 229 - Usuario - Eliminar)
  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    let id = this.editedIndex;

    if (val) {
      try {
        this.loadingService.showLoading();
        const res = await this.axios.http.delete(`${this.controller}/${id}`);

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Usuario',
            nombre:
              config.getValorCelda(this.gridApi, id, 'nombre') +
              ' ' +
              config.getValorCelda(this.gridApi, id, 'apellidoPaterno'),
            eliminadaO: 'eliminado',
          })
        );

        this.close();
        this.recargarGrilla();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminar', {
                entidad: 'el Usuario',
                nombre:
                  config.getValorCelda(this.gridApi, id, 'nombre') +
                  ' ' +
                  config.getValorCelda(this.gridApi, id, 'apellidoPaterno'),
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'el Usuario',
              nombre:
                config.getValorCelda(this.gridApi, id, 'nombre') +
                ' ' +
                config.getValorCelda(this.gridApi, id, 'apellidoPaterno'),
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  async unlockItemCallback(aceptado: boolean) {
    this.dialogDesbloquear = false;
    let estado = 0;
    this.editedItem.estadoTxt == 'Activo' ? (estado = 4) : (estado = 1);
    const self = this;
    if (aceptado) {
      await this.axios.http
        .put(
          `${this.controller}/${this.editedItem.id}/${estado}/desbloqueoUsuario`
        )
        .then(res => {
          self.editedItem.estadoTxt == 'Activo'
            ? this.$snotify.success(
                this.$t('mensajes.mensajesExito.bloquear', {
                  entidad: 'El Usuario',
                })
              )
            : this.$snotify.success(
                this.$t('mensajes.mensajesExito.desbloquear', {
                  entidad: 'El Usuario',
                })
              );
          this.close();
          this.recargarGrilla();
          this.muestraBarraBotones = false;
        })
        .catch(error => {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.desbloquear', {
              entidad: 'Usuario',
              nombre: this.editedItem.nombre,
            })
          );
        });
    }
  }

  //17-05-2019: SE COMENTA FUNCION ANTERIOR (ISSUE: 229 - Usuario - Eliminar)
  /*deleteItemCallback(val: boolean) {
            this.dialogEliminar = false;
            this.mensajeEliminarConAsociacion = "";
            this.dialogConfirmacionValidaAsociaciones = false;

            if (val) {
                let id = this.editedIndex;
                this.loadingService.showLoading();

                this.axios.http
                    .delete(`${this.controller}/${id}`)
                    .then(res => {
                        this.loadingService.hideLoading();
                        this.$snotify.success(
                            this.$t("mensajes.mensajesExito.eliminar", {
                                entidad: "El Usuario",
                                nombre:
                                    config.getValorCelda(this.gridApi, id, "nombre") +
                                    " " +
                                    config.getValorCelda(this.gridApi, id, "apellidoPaterno"),
                                eliminadaO: "eliminado"
                            })
                        );
                        this.close();
                        this.recargarGrilla();
                    })
                    .catch(error => {
                        this.loadingService.hideLoading();
                        if (error.response !== undefined) {
                            if (error.response.status !== 401) {
                                this.$snotify.error(
                                    this.$t("mensajes.mensajesError.eliminar", {
                                        entidad: "el Usuario",
                                        nombre:
                                            config.getValorCelda(this.gridApi, id, "nombre") +
                                            " " +
                                            config.getValorCelda(this.gridApi, id, "apellidoPaterno")
                                    })
                                );
                            }
                        } else {
                            this.$snotify.error(
                                this.$t("mensajes.mensajesError.eliminar", {
                                    entidad: "el Usuario",
                                    nombre:
                                        config.getValorCelda(this.gridApi, id, "nombre") +
                                        " " +
                                        config.getValorCelda(this.gridApi, id, "apellidoPaterno")
                                })
                            );
                        }
                    });
            }
        } */

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
  }

  close() {
    this.newItem = {};
    this.dialogEliminar = false;
    this.dialog = false;
    setTimeout(() => {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.date = null;
      this.$validator.reset();
    }, 300);
  }

  rolModalCallback(val: boolean) {
    this.muestraBarraBotones = false;

    this.recargarGrilla();
  }

  recargarGrilla() {
    this.gridApi.deselectAll();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  modalUsuarioCallback(val: boolean) {
    this.dialog = false;
    this.dialogEditar = false;

    this.recargarGrilla();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async eliminarSeleccionadas() {
    // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
    this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
    let mensajeSingle = this.$t('mensajes.crud.eliminarAsociado.mensaje', {
      entidad: 'al Usuario',
      entidad1: 'el Usuario',
    });
    let mensajeMasivo = this.$t(
      'mensajes.crud.eliminarMasivo.mensajeUsuariosLocales',
      {
        los_cantidad_entidad_seleccionados:
          (this.cantidadEliminarMasivo > 1 ? 'los ' : 'el ') +
          (this.cantidadEliminarMasivo > 1
            ? this.cantidadEliminarMasivo + ' Usuarios seleccionados'
            : ' Usuario seleccionado'),
      }
    );

    if (this.gridApi.getSelectedNodes().length > 0) {
      let index: number = 0;
      let mensajeSalida: any = [];
      this.mensajeValidacionEliminados = [];
      const items = this.gridApi.getSelectedNodes();
      let id: number = items[0].data.id;
      const response = await this.axios.http.get(
        `${this.controller}/${id}/cliente/`
      );
      this.mensajeEliminarConAsociacion = '';
      this.loadingService.showLoading();

      for (let i = 0; i <= items.length - 1; i++) {
        let id: number = items[i].data.id;
        let nombreUsuario: string = `${items[i].data.nombre} ${items[i].data.apellidoPaterno} `;

        try {
          //valida si es usuario en sesion
          const userLogued = localStorage.getItem('user');
          if (userLogued !== null) {
            let u = JSON.parse(userLogued);
            if (u.id === items[i].data.id) {
              mensajeSalida.push({
                id: id,
                estado: 'NOK',
                mensaje: `No es posible eliminar el usuario ${nombreUsuario} ya que se encuentra en sesión.`,
              });
            } else if (items[i].data.tipo === TipoUsuario.Transversal) {
              mensajeSalida.push({
                id: id,
                estado: 'NOK',
                mensaje: `No es posible eliminar el usuario ${nombreUsuario} ya que es un Usuario Transversal.`,
              });
            }
          }

          //valida asociaciones con otro cliente
          const resClientesConsulta = await this.axios.http.get(
            `${this.controller}/${id}/clienteRol`
          );
          const cantidadClientes = resClientesConsulta.data.length;
          if (cantidadClientes > 0) {
            this.nAsoc++;
          }
          const resFlotas: any = await this.axiosVehiculo.http.get(
            `${this.controllerFlota}/${id}/usuarioflota/`
          );
          let cantidadFlotas = resFlotas.data.length;
          if (cantidadFlotas > 0) {
            this.nAsoc++;
          }
          if (cantidadClientes > 0) {
            let cliente = resClientesConsulta.data.filter(
              (x: any) => x.clienteId === this.clienteId
            );
            if (cliente.length === 0) {
              mensajeSalida.push({
                id: id,
                estado: 'NOK',
                mensaje: `El Usuario ${nombreUsuario} se encuentra asociado a otro Cliente.`,
              });
            }
          }
          //---

          //Validación Mensajes Asociaciones
          index = index + 1;
          if (index == items.length) {
            let nombres =
              items[0].data.nombre + ' ' + items[0].data.apellidoPaterno;
            let cantidadProblemas: number = mensajeSalida.filter(
              (x: any) => x.estado === 'NOK'
            ).length;
            if (cantidadProblemas > 0) {
              if (items.length === 1) {
                this.tituloModalEliminar = 'Eliminar Usuario: ' + nombres;
              } else {
                this.tituloModalEliminar = 'Eliminar Usuarios ';
              }
              this.mensajeEliminarConAsociacion = '';
              this.mensajeValidacionEliminados = mensajeSalida;
              this.dialogConfirmacionValidaAsociaciones = true;
            } else {
              // mensaje de eliminación por lote seleccionando sólo 1, debe ser igual a la eliminación individual
              if (this.gridApi.getSelectedNodes().length === 1) {
                if (this.nAsoc === 0) {
                  this.mensajeDeleteMasivo =
                    '¿Está seguro que desea eliminar el Usuario?';
                  this.tituloDeleteMasivo = 'Eliminar Usuario: ' + nombres;
                  this.dialogEliminarMasivo = true;
                } else {
                  this.mensajeDeleteMasivo = mensajeSingle;
                  this.tituloDeleteMasivo = 'Eliminar Usuario: ' + nombres;
                  this.dialogEliminarMasivo = true;
                }
              } else {
                if (this.nAsoc === 0) {
                  this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
                  this.tituloDeleteMasivo = 'Eliminar Usuarios';
                  this.mensajeDeleteMasivo =
                    '¿Está seguro que desea eliminar los Usuarios?';
                  this.dialogEliminarMasivo = true;
                } else {
                  this.tituloDeleteMasivo = 'Eliminar Usuarios';
                  this.mensajeDeleteMasivo = mensajeMasivo;
                  this.dialogEliminarMasivo = true;
                }
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
                      ? `los ${items.length} Usuarios`
                      : 'el Usuario',
                  eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? `los ${items.length} Usuarios`
                    : 'el Usuario',
                eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
              })
            );
          }
        } finally {
          this.loadingService.hideLoading();
        }
      }
    }
  }

  //17-05-2019 FUNCION ANTERIOR - Se comenta por nuevo cambio
  //(ISSUE: 229 - Usuario - Eliminar)
  /*async eliminarSeleccionadas() {
            if (this.gridApi.getSelectedNodes().length > 0) {
                let index: number = 0;
                let mensajeSalida: any = [];
                this.mensajeValidacionEliminados = [];
                const items = this.gridApi.getSelectedNodes();
                this.mensajeEliminarConAsociacion = "";
                this.loadingService.showLoading();

                for (let i = 0; i <= items.length - 1; i++) {
                    let id: number = items[i].data.id;
                    let nombreUsuario: string = `${items[i].data.nombre} ${
                        items[i].data.apellidoPaterno
                        } ${items[i].data.apellidoMaterno}`;

                    try {
                        const resClientesConsulta = await this.axios.http.get(`${this.controller}/${id}/cliente`);
                        const resRolesConsulta = await this.axios.http.get(`${this.controller}/${id}/rol`);

                        const cantidadClientes = resClientesConsulta.data.length;
                        const cantidadRoles = resRolesConsulta.data.length;

                        //valida asociaciones
                        if (resClientesConsulta.data.length > 0 && resRolesConsulta.data.length > 0) {
                            mensajeSalida.push({
                                id: id,
                                estado: "NOK",
                                mensaje: `El Usuario ${nombreUsuario} se encuentra asociado a ${cantidadClientes}
                                ${cantidadClientes.data.length > 1 ? " Clientes y " : " Cliente y "}
                                ${cantidadRoles}${cantidadRoles > 1 ? " Roles. " : " Rol. "}`
                            });
                        } else if (resClientesConsulta.data.length > 0) {
                            mensajeSalida.push({
                                id: id,
                                estado: "NOK",
                                mensaje: `El Usuario ${nombreUsuario} se encuentra asociado a ${cantidadClientes}
                                ${cantidadClientes > 1 ? " Clientes. " : " Cliente. "}`
                            });
                        } else if (resRolesConsulta.data.length > 0) {
                            mensajeSalida.push({
                                id: id,
                                estado: "NOK",
                                mensaje: `El Usuario ${nombreUsuario} se encuentra asociado a ${cantidadRoles}
                                ${cantidadRoles > 1 ? " Roles. " : " Rol. "}`
                            });
                        }

                        //Validación Mensajes Asociaciones
                        index = index + 1;
                        if (index == items.length) {
                            let cantidadProblemas: number = mensajeSalida.filter(
                                (x: any) => x.estado === "NOK"
                            ).length;
                            if (cantidadProblemas > 0) {
                                this.mensajeEliminarConAsociacion = "";
                                this.mensajeValidacionEliminados = mensajeSalida;
                                this.dialogConfirmacionValidaAsociaciones = true;
                                this.tituloModalEliminar = "Eliminar Usuarios";
                            } else {
                                this.dialogEliminarMasivo = true; //Eliminar Masivo
                            }
                        }
                    } catch (error) {
                        if (error.response !== undefined) {
                            if (error.response.status !== 401) {
                                this.$snotify.error(
                                    this.$t("mensajes.mensajesError.eliminarMasivo", {
                                        los_cantidad_entidad_seleccionados:
                                            (items.length > 1 ? `los ${items.length} Usuarios` : "el Usuario"),
                                        eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                    })
                                );
                            }
                        } else {
                            this.$snotify.error(
                                this.$t("mensajes.mensajesError.eliminarMasivo", {
                                    los_cantidad_entidad_seleccionados:
                                        (items.length > 1 ? `los ${items.length} Usuarios` : "el Usuario"),
                                    eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                })
                            );
                        }
                    } finally {
                        this.loadingService.hideLoading();
                    }
                }
            }
        } */

  //17-05-2019: FUNCION NUEVA - Elimina masivamente usuarios del cliente
  //(ISSUE: 229 - Usuario - Eliminar)
  async deleteMasivoCallback(val: boolean) {
    this.dialogEliminarMasivo = false;
    const items = this.gridApi.getSelectedNodes();

    if (val) {
      try {
        this.loadingService.showLoading();
        if (this.gridApi.getSelectedNodes().length > 0) {
          let index: number = 0;

          for (let i = 0; i <= items.length - 1; i++) {
            let id: number = items[i].data.id;
            let nombreUsuario: string = `${items[i].data.nombre} ${items[i].data.apellidoPaterno} ${items[i].data.apellidoMaterno}`;

            const delUser = await this.axios.http.delete(
              `${this.controller}/${id}`
            );

            index = index + 1;
            if (index == items.length) {
              let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  items.length > 1
                    ? 'Los ' + items.length + ' Usuarios seleccionados '
                    : 'El Usuario ' +
                      config.getValorCelda(this.gridApi, id, 'nombre') +
                      ' ' +
                      config.getValorCelda(this.gridApi, id, 'apellidoPaterno'),
                eliminadaOs: items.length > 1 ? 'eliminados' : 'eliminado',
              });

              if (items.length === 1) {
                msj = msj.toString().replace('han', 'ha');
              }

              this.$snotify.success(msj);
              this.close();
              this.recargarGrilla();
              this.muestraBarraBotones = false;
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
                    ? 'los ' + items.length + 'Usuarios'
                    : 'El Usuario',
                eliminadaOs: 'seleccionados',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'los ' + items.length + 'Usuarios'
                  : 'El Usuario',
              eliminadaOs: 'seleccionados',
            })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    } else {
      this.nAsoc = 0;
    }
  }

  //17-05-2019 FUNCION ANTERIOR - Se comenta por nuevo cambio
  //(ISSUE: 229 - Usuario - Eliminar)
  /*deleteMasivoCallback(val: boolean) {
            this.dialogEliminarMasivo = false;
            if (val) {
                if (this.gridApi.getSelectedNodes().length > 0) {
                    let index: number = 0;
                    let mensajeSalida: any = [];
                    this.mensajeValidacionEliminados = [];
                    const items = this.gridApi.getSelectedNodes();
                    this.loadingService.showLoading();

                    for (let i = 0; i <= items.length - 1; i++) {
                        let id: number = items[i].data.id;
                        let nombreUsuario: string = `${items[i].data.nombre} ${
                            items[i].data.apellidoPaterno
                            } ${items[i].data.apellidoMaterno}`;

                        //valida asociaciones
                        this.axios.http
                            .get(`${this.controller}/${id}/cliente`)
                            .then(res => {
                                this.axios.http
                                    .get(`${this.controller}/${id}/rol`)
                                    .then(res2 => {
                                        //Eliminación
                                        this.axios.http
                                            .delete(`${this.controller}/${id}`)
                                            .then(res => {
                                                mensajeSalida.push({
                                                    id: id,
                                                    estado: "OK",
                                                    mensaje: "El Usuario " + nombreUsuario + " ha sido eliminado."
                                                });
                                            })
                                            .catch(error => {
                                                if (error.response !== undefined) {
                                                    if (error.response.status !== 401) {
                                                        this.$snotify.error(
                                                            this.$t("mensajes.mensajesError.eliminarMasivo", {
                                                                los_cantidad_entidad_seleccionados:
                                                                    (items.length > 1 ? "los " + items.length + " Usuarios" : "el Usuario"),
                                                                eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                                            })
                                                        );
                                                    }
                                                } else {
                                                    this.$snotify.error(
                                                        this.$t("mensajes.mensajesError.eliminarMasivo", {
                                                            los_cantidad_entidad_seleccionados:
                                                                (items.length > 1 ? "los " + items.length + " Usuarios" : "el Usuario"),
                                                            eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                                        })
                                                    );
                                                }
                                            });

                                        index = index + 1;
                                        if (index == items.length) {
                                            this.loadingService.hideLoading();

                                            let cantidadProblemas: number = mensajeSalida.filter(
                                                (x: any) => x.estado === "NOK"
                                            ).length;
                                            if (cantidadProblemas > 0) {
                                                this.mensajeEliminarConAsociacion = "";
                                                this.mensajeValidacionEliminados = mensajeSalida;
                                                this.dialogConfirmacionValidaAsociaciones = true;
                                            } else {
                                                this.$snotify.success(
                                                    this.$t("mensajes.mensajesExito.eliminar", {
                                                        entidad: "El Usuario",
                                                        nombre: nombreUsuario,
                                                        eliminadaO: "eliminado"
                                                    })
                                                );
                                                this.close();
                                            }

                                            this.recargarGrilla();
                                            this.muestraBarraBotones = false;
                                        }
                                    })
                                    .catch(err => {
                                        if (err.response !== undefined) {
                                            if (err.response.status !== 401) {
                                                this.$snotify.error(
                                                    this.$t("mensajes.mensajesError.eliminarMasivo", {
                                                        los_cantidad_entidad_seleccionados:
                                                            (items.length > 1 ? "los " + items.length + " Usuarios" : "el Usuario"),
                                                        eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                                    })
                                                );
                                            }
                                        } else {
                                            this.$snotify.error(
                                                this.$t("mensajes.mensajesError.eliminarMasivo", {
                                                    los_cantidad_entidad_seleccionados:
                                                        (items.length > 1 ? "los " + items.length + " Usuarios" : "el Usuario"),
                                                    eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                                })
                                            );
                                        }
                                    });
                            })
                            .catch(err => {
                                if (err.response !== undefined) {
                                    if (err.response.status !== 401) {
                                        this.$snotify.error(
                                            this.$t("mensajes.mensajesError.eliminarMasivo", {
                                                los_cantidad_entidad_seleccionados:
                                                    (items.length > 1 ? "los " + items.length + " Usuarios" : "el Usuario"),
                                                eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                            })
                                        );
                                    }
                                } else {
                                    this.$snotify.error(
                                        this.$t("mensajes.mensajesError.eliminarMasivo", {
                                            los_cantidad_entidad_seleccionados:
                                                (items.length > 1 ? "los " + items.length + " Usuarios" : "el Usuario"),
                                            eliminadaOs: (items.length > 1 ? "eliminados" : "eliminado")
                                        })
                                    );
                                }
                            });
                    }
                }
            }
        }*/

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
            'Usuarios.csv',
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
    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoMaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        contrasena: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
        },
        direccion: {
          max: () => config.errorMensajes.maxLength,
        },
        telefonoFijo: {
          max: () => config.errorMensajes.maxLength,
        },
        telefonoParticular: {
          max: () => config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.Usuarios) {
        if (data.action === Accion.Eliminar) {
          //valida que no se elimine a si mismo
          const userLogued = localStorage.getItem('user');
          if (userLogued != null) {
            let u = JSON.parse(userLogued);
            if (u.id === data.id) {
              this.$snotify.warning(
                'No es posible eliminar el usuario en sesión.'
              );
            } else {
              //this.dialogEliminar = true;
              this.editedIndex = data.id;
              this.tituloUsuarioEliminar = this.$t(
                'mensajes.crud.eliminar.titulo',
                {
                  entidad: 'usuario',
                  nombreEntidad:
                    config.getValorCelda(this.gridApi, data.id, 'nombre') +
                    ' ' +
                    config.getValorCelda(
                      this.gridApi,
                      data.id,
                      'apellidoPaterno'
                    ),
                }
              );
              this.eliminarItem();
            }
          }
        } else if (
          data.action === Accion.Editar ||
          data.action === Accion.VerDetalle
        ) {
          //Editar
          this.modalEsEdicion = data.action === Accion.Editar;

          this.editedIndex = data.id;
          let item: any = null;

          const rows = this.gridApi.getRenderedNodes();
          for (let i = 0; i < rows.length; i++) {
            const rowNode = rows[i];
            if (rowNode.data.id !== undefined && rowNode.data.id !== null) {
              if (data.id == rowNode.data.id) {
                item = rowNode.data;
                break;
              }
            }
          }

          if (item !== null) {
            this.date = moment(item.fechaNacimiento).format('YYYY-MM-DD');
            let fiv: any = moment(item.fechaInicioVigencia).format(
              'YYYY-MM-DD'
            );
            this.editedItem.fechaNacimiento = this.date;
            this.editedItem.fechaInicioVigencia = fiv;
            this.editedItem = item;
            this.dialogEditar = true;
          }
        } else if (data.action == 0) {
          //restablecer contraseña
        } else if (data.action == 8) {
          if (
            config.getValorCelda(this.gridApi, data.id, 'estadoTxt') == 'Activo'
          ) {
            this.tituloDesbloquear = this.$t('mensajes.crud.bloquear.titulo', {
              entidad: 'Usuario',
              nombreEntidad: `${config.getValorCelda(
                this.gridApi,
                data.id,
                'nombre'
              )}
            ${config.getValorCelda(this.gridApi, data.id, 'apellidoPaterno')}`,
            });
            this.mensajeDesbloquear = this.$t(
              'mensajes.crud.bloquear.mensaje',
              {
                entidad: 'el Usuario',
              }
            );
            this.textoBtnSi = this.$t('mensajes.crud.bloquear.btnAceptar');
          } else {
            this.tituloDesbloquear = this.$t(
              'mensajes.crud.desbloquear.titulo',
              {
                entidad: 'Usuario',
                nombreEntidad: `${config.getValorCelda(
                  this.gridApi,
                  data.id,
                  'nombre'
                )}
            ${config.getValorCelda(this.gridApi, data.id, 'apellidoPaterno')}`,
              }
            );
            this.mensajeDesbloquear = this.$t(
              'mensajes.crud.desbloquear.mensaje',
              {
                entidad: 'el Usuario',
              }
            );
            this.textoBtnSi = this.$t('mensajes.crud.desbloquear.btnAceptar');
          }

          this.dialogDesbloquear = true;
          this.editedItem.id = data.id;
          this.editedItem.nombre =
            config.getValorCelda(this.gridApi, data.id, 'nombre') +
            ' ' +
            config.getValorCelda(this.gridApi, data.id, 'apellidoPaterno');
          this.editedItem.email = config.getValorCelda(
            this.gridApi,
            data.id,
            'email'
          );
          this.editedItem.estadoTxt = config.getValorCelda(
            this.gridApi,
            data.id,
            'estadoTxt'
          );
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

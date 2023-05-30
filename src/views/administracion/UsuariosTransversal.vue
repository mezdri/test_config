<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Usuarios Transversales</v-tab>
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
            class="btn-crear"
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
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogEliminarMasivo"
      :titulo="tituloEliminarMasivo"
      :mensaje="mensajeEliminarMasivo"
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

    <app-nuevo-usuariotransversal
      :show="dialog"
      :usuario="editedItem"
      v-on:modalAsociacionEmit="modalUsuarioCallback($event)"
    ></app-nuevo-usuariotransversal>
    <app-editar-usuariotransversal
      :esEdicion="modalEsEdicion"
      :show="dialogEditar"
      :usuario="editedItem"
      v-on:modalAsociacionEmit="modalUsuarioCallback($event)"
    ></app-editar-usuariotransversal>

    <div class="text-xs-center">
      <v-dialog v-model="dialogValidacion" persistent max-width="580">
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="dialogValidacion = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloValidacion }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <span>{{ mensajeValidacion }}</span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="dialogValidacion = false">
              <span style="color: white;">Aceptar</span>
            </v-btn>
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
import UsuariosTransversalModalNuevo from '@/components/mantenedores/UsuariosTransversalModalNuevo.vue';
import UsuariosTransversalModalEdicion from '@/components/mantenedores/UsuariosTransversalModalEdicion.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { RegistroInterface } from '@/interfaces/Login';
import { Funcionalidades } from '@/config/funcionalidades';
import { EstadoEntidad } from '@/config/enums';
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
    'app-nuevo-usuariotransversal': UsuariosTransversalModalNuevo,
    'app-editar-usuariotransversal': UsuariosTransversalModalEdicion,
  },
})
export default class Usuarios extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.UsuariosTransversal;
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
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];
  autoGroupColumnDef: any = null;
  $snotify: any;
  date: any = null;
  usuarios: UsuariosInterface[] = [];
  dialog: Boolean = false;
  dialogEditar: Boolean = false;
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
  showModalCambioEstado: boolean = false;
  serverSide: any;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosAuth = new AxiosVue(ServicioProxy.Auth);
  tituloUsuarioEliminar: any = '';
  mensajeUsuarioEliminarMasivo: any = '';
  mensajeValidacionEliminados: string[] = [];
  cantidadEliminarMasivo: number = 0;
  muestraEncabezadoEliminarMasivo: boolean = false;
  intervalo: any; //Intervalo para el buscador

  //Mensajeria Eliminar
  dialogEliminar: Boolean = false;
  tituloEliminar: any = '';
  mensajeEliminar: any = '';

  dialogEliminarMasivo: Boolean = false;
  tituloEliminarMasivo: any = '';
  mensajeEliminarMasivo: any = '';

  dialogValidacion: Boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';

  dialogDesbloquear: Boolean = false;
  tituloDesbloquear: any = '';
  mensajeDesbloquear: any = '';
  textoBtnSi: any = '';

  dialogReestablecerPassword: Boolean = false;
  tituloReestablecerPassword: any = '';
  mensajeReestablecerPassword: any = '';
  linkReestablecerPassword: any = '';
  //---

  //permisos crear
  chequearPermisosBtnCrear: boolean = true;
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
        //cellRenderer: (params: any) => {
        // return `${params.data.nombre} ${params.data.apellidoPaterno}  ${params.data.apellidoMaterno}`;
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
        width: 145,
        lockPinned: true,
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
        width: 175,
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

  get EliminadosNoValidos() {
    return this.mensajeValidacionEliminados.filter(
      (x: any) => x.estado === 'NOK'
    );
  }

  get EliminadosValidos() {
    return this.mensajeValidacionEliminados.filter(
      (x: any) => x.estado === 'OK'
    );
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
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
            .http(`${self.controller}/grid`, {
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

  async deleteItemCallback(aceptado: boolean) {
    this.dialogEliminar = false;

    if (aceptado) {
      let id = this.editedIndex;
      try {
        this.loadingService.showLoading();

        await this.axios.http.delete(`${this.controller}/${id}`);
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Usuario Transversal',
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
                entidad: 'Usuario',
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
              entidad: 'Usuario',
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
    this.showModalCambioEstado = false;

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
    const items = this.gridApi.getSelectedNodes();
    this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;

    if (this.cantidadEliminarMasivo === 1) {
      //UN SOLO REGISTRO
      const userLogued = localStorage.getItem('user');
      if (userLogued !== null) {
        let u = JSON.parse(userLogued);
        let id: number = items[0].data.id;
        this.editedIndex = id;
        let nombreUsuario: string = `${items[0].data.nombre} ${items[0].data.apellidoPaterno}`;
        let correoUsuario: string = items[0].data.email;
        this.tituloValidacion = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Usuario',
          nombreEntidad: nombreUsuario,
        });

        //Valida si es usuario en sesion
        if (u.id === items[0].data.id) {
          this.mensajeValidacion =
            'No es posible eliminar el Usuario ' +
            nombreUsuario +
            ' ya que se encuentra en sesión.';
          this.dialogValidacion = true;
        } else if (
          correoUsuario.toLowerCase().trim() === 'admintrack@gpschile.com'
        ) {
          //Valida que el usuario no sea ADMINTRACK
          this.mensajeValidacion =
            'No es posible eliminar el Usuario ' +
            nombreUsuario +
            ' ya que es Administrador del Sistema.';
          this.dialogValidacion = true;
        } else {
          this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
            entidad: 'Usuario',
            nombreEntidad: nombreUsuario,
          });
          //Valida que no tenga asociaciones
          const response = await this.axios.http.get(
            `${this.controller}/${id}/cliente/`
          );
          if (response.data.length > 0) {
            //Eliminacion con asociaciones
            this.mensajeEliminar = this.$t(
              'mensajes.crud.eliminarAsociadoUsuarioTransversal.mensaje',
              {
                entidad1: 'al Usuario',
                entidad2: 'el Usuario Transversal',
              }
            );
            this.dialogEliminar = true;
          } else {
            //Eliminación sin asociaciones
            this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
              entidad: 'el Usuario Transversal',
            });
            this.dialogEliminar = true;
          }
        }
      }
    } else {
      //MULTIPLES REGISTROS
      this.tituloValidacion = 'Eliminar Usuarios Transversales';
      this.tituloEliminarMasivo = 'Eliminar Usuarios Transversales';
      let conAsociacion = false;
      let index: number = 0;

      for (let i = 0; i <= items.length - 1; i++) {
        let id: number = items[i].data.id;
        let nombreUsuario: string = `${items[i].data.nombre} ${items[i].data.apellidoPaterno}`;
        let correoUsuario: string = items[i].data.email;

        //Valido si está el usuario en sesión seleccionado y/o ADMINTRACK
        const userLogued = localStorage.getItem('user');
        if (userLogued !== null) {
          let u = JSON.parse(userLogued);
          if (u.id === items[i].data.id) {
            this.mensajeValidacion =
              'No es posible eliminar el Usuario ' +
              nombreUsuario +
              ' ya que se encuentra en sesión.';
            this.dialogValidacion = true;
            break;
          } else if (
            correoUsuario.toLowerCase().trim() === 'admintrack@gpschile.com'
          ) {
            this.mensajeValidacion =
              'No es posible eliminar el Usuario ' +
              nombreUsuario +
              ' ya que es Administrador del Sistema.';
            this.dialogValidacion = true;
            break;
          } else {
            //Valida que no tenga asociaciones
            const response = await this.axios.http.get(
              `${this.controller}/${items[i].data.id}/cliente/`
            );
            if (response.data.length > 0) {
              conAsociacion = true;
            }

            index = index + 1;
            if (index == items.length) {
              if (conAsociacion) {
                this.mensajeEliminarMasivo = this.$t(
                  'mensajes.crud.eliminarAsociadoUsuarioTransversal.mensaje',
                  {
                    entidad1: 'a los Usuarios',
                    entidad2: 'los Usuarios Transversales',
                  }
                );
                this.dialogEliminarMasivo = true;
              } else {
                this.mensajeEliminarMasivo = this.$t(
                  'mensajes.crud.eliminar.mensaje',
                  {
                    entidad: 'los Usuarios Transversales',
                  }
                );
                this.dialogEliminarMasivo = true;
              }
            }
          }
        }
      }
    }
  }

  async deleteMasivoCallback(aceptado: boolean) {
    this.dialogEliminarMasivo = false;

    if (aceptado) {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index: number = 0;
        let mensajeSalida: any = [];
        this.mensajeValidacionEliminados = [];
        const items = this.gridApi.getSelectedNodes();
        let borrar = true;

        try {
          this.loadingService.showLoading();
          if (borrar) {
            items.forEach(async (item: any) => {
              await this.axios.http.delete(
                `${this.controller}/${item.data.id}`
              );
            });

            let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Los ' + items.length + ' Usuarios seleccionados'
                  : 'El Usuario seleccionado',
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
                  entidad: 'El Usuario Transversal',
                })
              )
            : this.$snotify.success(
                this.$t('mensajes.mensajesExito.desbloquear', {
                  entidad: 'El Usuario Transversal',
                })
              );
          this.close();
          this.recargarGrilla();
          this.muestraBarraBotones = false;
        })
        .catch(error => {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.desbloquear', {
              entidad: 'Usuario Transversal',
              nombre: this.editedItem.nombre,
            })
          );
        });
    }
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axios
        .http(`${this.controller}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'UsuariosTransversales.csv',
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

    actionsEvent.$on('actionsEvent', async (data: any) => {
      if (data.funcionalidad === this.funcionalidad) {
        if (data.action === Accion.Eliminar) {
          //El usuario en sesión y el ADMINTRACK no tienen habilitada la opcion Eliminar
          this.editedIndex = data.id;
          this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
            entidad: 'Usuario',
            nombreEntidad: `${config.getValorCelda(
              this.gridApi,
              data.id,
              'nombre'
            )}
                                    ${config.getValorCelda(
                                      this.gridApi,
                                      data.id,
                                      'apellidoPaterno'
                                    )}`,
          });

          this.axios.http
            .get(`${this.controller}/${data.id}/cliente/`)
            .then(response => {
              if (response.data.length > 0) {
                //Eliminacion con asociaciones
                this.mensajeEliminar = this.$t(
                  'mensajes.crud.eliminarAsociadoUsuarioTransversal.mensaje',
                  {
                    entidad1: 'al Usuario',
                    entidad2: 'el Usuario Transversal',
                  }
                );
                this.dialogEliminar = true;
              } else {
                //Eliminación sin asociaciones
                this.mensajeEliminar = this.$t(
                  'mensajes.crud.eliminar.mensaje',
                  {
                    entidad: 'el Usuario Transversal',
                  }
                );
                this.dialogEliminar = true;
              }
            })
            .catch(err => {
              if (!err.response) {
                this.$snotify.error('Ocurrió un error al eliminar el usuario.');
              }
            });
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
              ${config.getValorCelda(
                this.gridApi,
                data.id,
                'apellidoPaterno'
              )}`,
            });
            this.mensajeDesbloquear = this.$t(
              'mensajes.crud.bloquear.mensaje',
              {
                entidad: 'el Usuario Transversal',
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
              ${config.getValorCelda(
                this.gridApi,
                data.id,
                'apellidoPaterno'
              )}`,
              }
            );
            this.mensajeDesbloquear = this.$t(
              'mensajes.crud.desbloquear.mensaje',
              {
                entidad: 'el Usuario Transversal',
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

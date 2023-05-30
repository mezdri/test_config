<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivR">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Rol</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenuRol()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenuRol()"
              :disabled="!validForm || btnBloquear"
            >
              <span
                :style="[
                  btnText == 'Guardar'
                    ? { color: 'white' }
                    : { color: 'black' },
                ]"
                >{{ btnText }}</span
              >
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />

        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              v-show="informacionGeneral.visible"
              :complete="e1 > informacionGeneral.step"
              :step="informacionGeneral.step"
              >Información General</v-stepper-step
            >
            <v-divider v-show="informacionGeneral.visible"></v-divider>

            <v-stepper-step
              v-show="asociarPerfiles.visible"
              :complete="e1 > asociarPerfiles.step"
              :step="asociarPerfiles.step"
              >Asociar Perfiles</v-stepper-step
            >
            <v-divider v-show="asociarPerfiles.visible"></v-divider>

            <v-stepper-step
              v-show="asociarUsuarios.visible"
              :complete="e1 > asociarUsuarios.step"
              :step="asociarUsuarios.step"
              >Asociar Usuarios</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="informacionGeneral.visible"
              :step="informacionGeneral.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-form
                      ref="form"
                      v-model="validForm"
                      lazy-validation
                      class="col-md-12"
                    >
                      <v-container grid-list-md>
                        <div align="left">
                          <v-flex md12>
                            <h2
                              class="h2_title"
                              style="margin-top: 12px!important;"
                            >
                              Información General
                            </h2>
                          </v-flex>
                        </div>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'required|max:80|RolNombreUnicoCrear'"
                              v-model="editedItem.name"
                              :error-messages="errors.collect('name')"
                              data-vv-name="name"
                              label="Nombre"
                              type="text"
                              :counter="80"
                              required
                              @keydown="preventEnterRoles"
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarPerfiles.visible"
              :step="asociarPerfiles.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Perfiles</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarPerfilesNuevo"
                            @input="onFilterTextBoxChangedAsociarPerfiles"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsPerfil"
                              :rowData="perfilesRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadyPerfil"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectedChangePerfiles"
                              :getRowNodeId="getRowNodeIdPerfil"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentPerfil
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassPerfil
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarUsuarios.visible"
              :step="asociarUsuarios.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Usuarios</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarUsuariosNuevo"
                            @input="onFilterTextBoxChangedAsociarUsuarios"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefs"
                              :rowData="usuariosRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReady"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectedChangeUsuarios"
                              :getRowNodeId="getRowNodeIdUsuarios"
                              :processCellForClipboard="procesarFecha"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentUsuario
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassUsuario
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Rol' })"
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: 'el Rol' })"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import store from '@/store';
import { RolesInterface } from '@/interfaces/Roles';
import { PerfilesInterface, PerfilRolInterface } from '@/interfaces/Perfiles';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { LoadingService } from '@/services/loadingService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoUsuario, TipoRol } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import { differenceBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class RolesModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  rol!: RolesInterface;

  readonly controller: string = 'Rol';
  readonly perfilController: string = 'Perfil';
  readonly usuarioController: string = 'Usuario';

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Roles;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarPerfiles: PermisoAccionVm = {
    accion: 'Crear - Asociar Perfiles',
    visible: true,
    step: 2,
    codigoSubAccion: 23,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarUsuarios: PermisoAccionVm = {
    accion: 'Crear - Asociar Usuarios',
    visible: true,
    step: 3,
    codigoSubAccion: 11,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarPerfiles,
    this.asociarUsuarios,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: RolesInterface = {};
  dictionaryFormErrors: any = {};
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  clienteId: number = config.getClienteSesion();
  usuarioId: number = store.state.userId;
  usuariosAsignadosModel: any = [];
  usuariosAsignados: UsuariosInterface[] = [];
  usuariosRespaldo: UsuariosInterface[] = [];
  loadingService = new LoadingService();
  search: string = '';
  buscarPerfilesNuevo: string = '';
  buscarUsuariosNuevo: string = '';

  perfilesAsignadosModel: any = [];
  perfilesAsignados: PerfilesInterface[] = [];
  perfilesRespaldo: PerfilesInterface[] = [];

  //grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  muestraMsj: boolean = false;
  gridApiPerfil: GridApi;
  columnApiPerfil: ColumnApi;
  columnDefsPerfil: Array<ColDef> = [];
  sideBarPerfil: any = config.agGridDefaultConfig;
  seleccionoTodosPerfiles: boolean = false;
  seleccionoTodosUsuarios: boolean = false;

  // mostrar boton seleccionar
  mostrarBtnSeleccionar: boolean = false;
  mostrarBtnSeleccionarUsuarios: boolean = false;

  created() {
    this.registrarValidadores();
  }

  mounted() {
    this.initialize();
    this.chequearPermisos();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivR').scrollIntoView(true);
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('RolNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Rol con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${
                self.controller
              }/${0}/${clienteId}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : { message: '* Ya existe un Rol con este nombre.' },
                });
              });
            })
            .catch(err => {
              return true;
            });
        } else {
          return true;
        }
      },
    });
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnBloquear = false;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.usuariosAsignados = [];
    this.usuariosAsignadosModel = [];
    this.perfilesAsignados = [];
    this.perfilesAsignadosModel = [];
    this.$validator.reset();
    if (value) {
      this.loadingService.showLoading();
      this.seleccionoTodosPerfiles = false;
      this.seleccionoTodosUsuarios = false;
      this.getUsuarios();
    }
  }

  nombreCompleto(user: UsuariosInterface): string {
    return this.formatoTextoAsociacion(
      (user.nombre != undefined ? user.nombre : '') +
        ' ' +
        (user.apellidoPaterno != undefined ? user.apellidoPaterno : '') +
        ' ' +
        (user.apellidoMaterno != undefined ? user.apellidoMaterno : '')
    );
  }

  onUserChange(user: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (user !== undefined && user.length !== this.usuariosAsignados.length) {
      for (let x = this.usuariosAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= user.length - 1; i++) {
          if (this.usuariosAsignados[x].id == user[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.usuariosAsignados.splice(x, 1);
        }
      }

      if (this.usuariosAsignados.length === this.usuariosRespaldo.length)
        this.seleccionoTodosUsuarios = true;
      else this.seleccionoTodosUsuarios = false;
    }
  }

  onUserInput(user: any) {
    if (user !== undefined) {
      for (let i = 0; i <= user.length - 1; i++) {
        const added = this.usuariosAsignados.filter(x => x.id == user[i]);

        if (added.length === 0) {
          const usuario = this.usuariosRespaldo.find(x => x.id == user[i]);
          this.usuariosAsignados.push(usuario);

          if (this.usuariosAsignados.length === this.usuariosRespaldo.length)
            this.seleccionoTodosUsuarios = true;
          else this.seleccionoTodosUsuarios = false;
        }
      }
    }
  }

  marcarTodosUsuarios(value: boolean) {
    this.usuariosAsignados = [];
    this.usuariosAsignadosModel = [];
    if (value) {
      this.usuariosRespaldo.forEach((usuario: any) => {
        this.usuariosAsignados.push(usuario);
        this.usuariosAsignadosModel.push(usuario.id);
      });
    }
    this.seleccionoTodosUsuarios = value;
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuRol(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  onPerfilChange(perfil: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      perfil !== undefined &&
      perfil.length !== this.perfilesAsignados.length
    ) {
      for (let x = this.perfilesAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= perfil.length - 1; i++) {
          if (this.perfilesAsignados[x].id == perfil[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.perfilesAsignados.splice(x, 1);
        }
      }

      if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
        this.seleccionoTodosPerfiles = true;
      else this.seleccionoTodosPerfiles = false;
    }
  }

  onPerfilInput(perfil: any) {
    if (perfil !== undefined) {
      for (let i = 0; i <= perfil.length - 1; i++) {
        const added = this.perfilesAsignados.filter(x => x.id == perfil[i]);

        if (added.length === 0) {
          const perfilAsignar = this.perfilesRespaldo.find(
            x => x.id == perfil[i]
          );
          this.perfilesAsignados.push(perfilAsignar);

          if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
            this.seleccionoTodosPerfiles = true;
          else this.seleccionoTodosPerfiles = false;
        }
      }
    }
  }

  marcarTodosPerfiles(value: boolean) {
    this.perfilesAsignados = [];
    this.perfilesAsignadosModel = [];
    if (value) {
      this.perfilesRespaldo.forEach((perfil: any) => {
        this.perfilesAsignados.push(perfil);
        this.perfilesAsignadosModel.push(perfil.id);
      });
    }
    this.seleccionoTodosPerfiles = value;
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivR').scrollIntoView(true);
        if (this.e1 === this.permisosActuales.length) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
        } else if (this.e1 === this.permisosActuales.length - 1) {
          this.e1 += 1;
          this.btnText = 'Guardar';
          this.btnClass = 'btn-grabar';
        } else {
          this.e1 += 1;
        }
      }
    });
  }

  async grabarAsociacionesUsuarios(rolId: number) {
    try {
      if (this.usuariosAsignados.length > 0) {
        this.usuariosAsignados.forEach(
          (usuarios: PerfilesInterface, idx: number) => {
            const resUsuarios = this.axios.http.post(
              `${this.controller}/${rolId}/usuario/${
                usuarios.id
              }/cliente/${config.getClienteSesion()}`,
              {}
            );
          }
        );
      }
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Rol' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Rol' })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async grabaAsociacionesPerfil(rolId: number) {
    try {
      if (this.perfilesAsignados.length > 0) {
        this.perfilesAsignados.forEach(
          (perfil: PerfilesInterface, idx: number) => {
            const resPerfil = this.axios.http.post(
              `${this.perfilController}/${perfil.id}/rol/${rolId}`
            );
          }
        );
      }
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Rol' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Rol' })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  guardarAsociacionPerfilUsuario() {
    let promesas: Array<Promise<any>> = [];

    this.perfilesAsignados.forEach((perfil: PerfilesInterface, idx: number) => {
      this.usuariosAsignados.forEach(
        (usuario: UsuariosInterface, index: number) => {
          promesas.push(
            this.axios.http.post(
              `${this.perfilController}/${perfil.id}/usuario/${
                usuario.id
              }/cliente/${config.getClienteSesion()}`
            )
          );
        }
      );
    });

    this.loadingService.hideLoading();

    return Promise.all(promesas);
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivR').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarPerfilesNuevo = '';
    this.buscarUsuariosNuevo = '';
    this.gridApiPerfil.setQuickFilter('');
    this.gridApi.setQuickFilter('');
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyPerfil(params: GridReadyEvent) {
    this.gridApiPerfil = params.api;
    this.columnApiPerfil = params.columnApi;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  isExternalFilterPresentPerfil(): boolean {
    return true;
  }

  doesExternalFilterPassPerfil(node: RowNode): boolean {
    if (
      this.perfilesRespaldo.length > 0 &&
      this.buscarPerfilesNuevo.length > 1
    ) {
      let busqueda = this.buscarPerfilesNuevo.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentUsuario(): boolean {
    return true;
  }

  doesExternalFilterPassUsuario(node: RowNode): boolean {
    if (
      this.usuariosRespaldo.length > 0 &&
      this.buscarUsuariosNuevo.length > 1
    ) {
      let busqueda = this.buscarUsuariosNuevo.toLowerCase();
      return (
        node.data.rut.toLowerCase().includes(busqueda) ||
        node.data.nombreCompleto.toLowerCase().includes(busqueda) ||
        node.data.email.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda) ||
        node.data.telefonoParticular.includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaNacimientoTxt.includes(busqueda)
      );
    }
    return true;
  }

  getUsuarios() {
    const self = this;
    this.axios.http
      .get(`${this.usuarioController}/${this.clienteId}/usuariosAsignar`)
      .then(res => {
        this.usuariosRespaldo = res.data;
        if (this.usuariosRespaldo.length > 0) {
          //Solo Usuarios Locales y sin Usuario en sesión
          this.usuariosRespaldo = this.usuariosRespaldo.filter(
            (x: any) => x.tipo == TipoUsuario.Local && x.id !== this.usuarioId
          );
        }

        this.getPerfiles();
        // ocultar btn seleccionar si no hay usuarios creados
        if (this.usuariosRespaldo.length === 0) {
          this.mostrarBtnSeleccionarUsuarios = false;
        } else {
          this.mostrarBtnSeleccionarUsuarios = true;
        }
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener Usuarios.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener Usuarios.');
        }
      });
  }

  getPerfiles() {
    this.axios.http
      .get<PerfilesInterface[]>(
        `${this.perfilController}/${this.clienteId}/cliente`
      )
      .then(res => {
        this.perfilesRespaldo = res.data.filter(
          x => x.estado === EstadoEntidad.Activo
        );

        //[COPIAR PEGAR] Track 3.0 - Grillas
        this.perfilesRespaldo.forEach(perfil => {
          perfil.estadoTxt =
            perfil.estado === EstadoEntidad.Sistema
              ? EstadoEntidad[EstadoEntidad.Activo]
              : EstadoEntidad[perfil.estado];
        });
        //---

        this.loadingService.hideLoading();
        // ocultar btn seleccionar si no hay perfiles creados
        if (this.perfilesRespaldo.length === 0) {
          this.mostrarBtnSeleccionar = false;
        } else {
          this.mostrarBtnSeleccionar = true;
        }
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener Perfiles.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener Perfiles.');
        }
      });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.loadingService.showLoading();
    try {
      if (val) {
        this.btnBloquear = true;
        let model = {
          Id: this.editedItem.id,
          Name: this.editedItem.name,
          Estado: EstadoEntidad.Activo,
          ClienteId: this.clienteId,
          Tipo: TipoRol.Local,
        };

        const resRol = await this.axios.http.post(this.controller, model);
        await this.grabarAsociacionesUsuarios(resRol.data.id);
        await this.grabaAsociacionesPerfil(resRol.data.id);
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Rol',
            creadoA: 'creado',
          })
        );
        this.closeModal(false);
      } else {
        this.btnBloquear = false;
      }
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Rol' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Rol' })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  createButtonCell(params: any) {
    let evento = this.removerUsuarioAsignacion;
    var item = this.usuariosRespaldo.filter(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item[0]);
    });

    return eButton;
  }

  createButtonCellPerfil(params: any) {
    let evento = this.removerPerfilAsignacion;
    var item = this.perfilesRespaldo.filter(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item[0]);
    });

    return eButton;
  }

  removerUsuarioAsignacion(item: UsuariosInterface) {
    for (let i = 0; i <= this.usuariosAsignados.length - 1; i++) {
      if (this.usuariosAsignados[i].id == item.id) {
        this.usuariosAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.usuariosAsignadosModel.length - 1; i++) {
      if (this.usuariosAsignadosModel[i] == item.id) {
        this.usuariosAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.usuariosAsignados.length === this.usuariosRespaldo.length)
      this.seleccionoTodosUsuarios = true;
    else this.seleccionoTodosUsuarios = false;
  }

  removerPerfilAsignacion(item: PerfilRolInterface) {
    for (let i = 0; i <= this.perfilesAsignados.length - 1; i++) {
      if (this.perfilesAsignados[i].id == item.id) {
        this.perfilesAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.perfilesAsignadosModel.length - 1; i++) {
      if (this.perfilesAsignadosModel[i] == item.id) {
        this.perfilesAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
      this.seleccionoTodosPerfiles = true;
    else this.seleccionoTodosPerfiles = false;
  }

  preventEnterRoles(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  initialize() {
    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        width: 120,
        lockPinned: true,
        resizable: false,
        sortable: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        lockVisible: true,
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
        // cellRenderer: (params: any) => {
        //   return `<span>${params.data.nombre} ${params.data.apellidoPaterno}  ${params.data.apellidoMaterno}</span>`;
        // },
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Teléfono',
        field: 'telefonoParticular',
        resizable: true,
        sortable: true,
        width: 190,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Nac.',
        field: 'fechaNacimiento',
        resizable: true,
        sortable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        valueFormatter: this.fechaFilter,
        getQuickFilterText: () => null,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        /*cellRenderer: (r: any) => {
          if (r.data.estado === EstadoEntidad.Sistema)
            return EstadoEntidad[EstadoEntidad.Activo];
          else return EstadoEntidad[r.data.estado];
        },*/
        cellStyle: { textAlign: 'left' },
      },
      {
        field: 'fechaNacimientoTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   cellRenderer: this.createButtonCell,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   minWidth: 80,
      //   lockVisible: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.columnDefsPerfil = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        width: 120,
        lockPinned: true,
        hide: true,
        resizable: false,
        sortable: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        /*cellRenderer: (r: any) => {
          if (r.data.estado === EstadoEntidad.Sistema)
            return EstadoEntidad[EstadoEntidad.Activo];
          else return EstadoEntidad[r.data.estado];
        },*/
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   cellRenderer: this.createButtonCellPerfil,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   minWidth: 80,
      //   lockVisible: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.getUsuarios();
    this.getPerfiles();

    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          regex: config.errorMensajes.regex,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  onFilterTextBoxChangedAsociarPerfiles() {
    this.gridApiPerfil.onFilterChanged();
    // if (this.buscarPerfilesNuevo.length > 1) {
    //   this.gridApiPerfil.setQuickFilter(this.buscarPerfilesNuevo);
    // } else {
    //   this.gridApiPerfil.setQuickFilter('');
    // }
  }

  onSelectedChangePerfiles() {
    this.perfilesAsignados = this.gridApiPerfil.getSelectedRows();
    const perfilesSeleccionados = this.gridApiPerfil
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const perfilesNoSeleccionados = differenceBy(
      this.perfilesRespaldo,
      perfilesSeleccionados,
      perfil => perfil.id
    ).map(perfil => ({
      ...perfil,
      checked: false,
    }));

    this.gridApiPerfil.updateRowData({
      update: [...perfilesNoSeleccionados, ...perfilesSeleccionados],
    });
  }

  onFilterTextBoxChangedAsociarUsuarios() {
    this.gridApi.onFilterChanged();
    // if (this.buscarUsuariosNuevo.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarUsuariosNuevo);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }

  onSelectedChangeUsuarios() {
    this.usuariosAsignados = this.gridApi.getSelectedRows();
    const usuariosSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const usuariosNoSeleccionados = differenceBy(
      this.usuariosRespaldo,
      usuariosSeleccionados,
      usuario => usuario.id
    ).map(usuario => ({
      ...usuario,
      checked: false,
    }));

    this.gridApi.updateRowData({
      update: [...usuariosNoSeleccionados, ...usuariosSeleccionados],
    });
  }

  getRowNodeIdPerfil(perfil: PerfilesInterface) {
    if (!perfil) {
      return;
    }
    return perfil.id;
  }
  getRowNodeIdUsuarios(usuarios: UsuariosInterface) {
    if (!usuarios) {
      return;
    }
    return usuarios.id;
  }

  procesarFecha(params: any) {
    if (params.column.getColDef().field === 'fechaNacimiento') {
      return this.$options.filters.formatDate(params.value);
    } else {
      return params.value;
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivRT">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="
              !esEdicion ? closeModal(false) : (dialogConfirmacionClose = true)
            "
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>
            {{ esEdicion ? 'Editar Rol' : 'Ver Detalle Rol' }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion()"
              :disabled="!validForm || btnBloquear"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn
                @click="cierraMenuRol"
                color="primary"
                flat
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                :value="informacionGeneral.step"
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>

              <v-btn
                @click="cierraMenuRol"
                color="primary"
                flat
                v-show="
                  (asociarPerfiles.visible && esEdicion) ||
                    (asociarPerfilesVerDetalle.visible && !esEdicion)
                "
                :value="asociarPerfiles.step"
              >
                <span>Asociar Perfiles</span>
                <v-icon>group_add</v-icon>
              </v-btn>

              <v-btn
                @click="cierraMenuRol"
                color="primary"
                flat
                v-show="
                  (asociarUsuarios.visible && esEdicion) ||
                    (asociarUsuariosVerDetalle.visible && !esEdicion)
                "
                :value="asociarUsuarios.step"
              >
                <span>Asociar Usuarios</span>
                <v-icon>person_add</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((informacionGeneral.visible && esEdicion) ||
                  (informacionGeneralVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
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
                          v-validate="'required|max:80|RolNombreUnicoEditar'"
                          v-model="editedItem.name"
                          :error-messages="errors.collect('name')"
                          data-vv-name="name"
                          label="Nombre"
                          type="text"
                          :counter="80"
                          :disabled="!esEdicion"
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
          <div
            align="center"
            v-show="
              bottomNav == asociarPerfiles.step &&
                ((asociarPerfiles.visible && esEdicion) ||
                  (asociarPerfilesVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
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
                        v-model="buscarPerfilesEditar"
                        @input="onFilterTextBoxChangedAsociarPerfilesEditar"
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
                          :columnDefs="columnDefsPerfiles"
                          :rowData="perfilesRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          suppressCopyRowsToClipboard="true"
                          :sideBar="false"
                          :localeText="localeText"
                          :onGridReady="onGridReadyPerfiles"
                          :postProcessPopup="onClickCell"
                          @selection-changed="onSelectedChangedPerfilesEditar"
                          :getRowNodeId="getRowNodeIdEditar"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentPerfil
                          "
                          :doesExternalFilterPass="doesExternalFilterPassPerfil"
                        ></ag-grid-vue>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == asociarUsuarios.step &&
                ((asociarUsuarios.visible && esEdicion) ||
                  (asociarUsuariosVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
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
                        v-model="buscarUsuariosEditar"
                        @input="onFilterTextBoxChangedAsociarUsuariosEditar"
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
                          @selection-changed="onSelectedChangedUsuariosEditar"
                          :getRowNodeId="getRowNodeIdUsuariosEditar"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Rol',
          nombreEntidad: rol.name,
        })
      "
      :mensaje="$t('mensajes.crud.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { RolesInterface } from '@/interfaces/Roles';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad, TipoUsuario } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import store from '@/store';
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { differenceBy } from 'lodash';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class RolesModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  rol!: RolesInterface;

  readonly controller: string = 'Rol';
  readonly perfilController: string = 'Perfil';
  readonly usuarioController: string = 'Usuario';

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Roles;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarPerfiles: PermisoAccionVm = {
    accion: 'Editar -  Asociar Perfiles',
    visible: true,
    step: 2,
    codigoSubAccion: 23,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarUsuarios: PermisoAccionVm = {
    accion: 'Editar - Asociar Usuarios',
    visible: true,
    step: 3,
    codigoSubAccion: 11,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarPerfilesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle -  Asociar Perfiles',
    visible: true,
    step: 2,
    codigoSubAccion: 23,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarUsuariosVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Usuarios',
    visible: true,
    step: 3,
    codigoSubAccion: 11,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarPerfiles,
    this.asociarUsuarios,
    this.informacionGeneralVerDetalle,
    this.asociarPerfilesVerDetalle,
    this.asociarUsuariosVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: RolesInterface = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  loadingService = new LoadingService();
  muestraMsj: boolean = false;
  usuariosAsignadosModel: any = [];
  usuariosAsignados: UsuariosInterface[] = [];
  usuariosAsignadosResp: UsuariosInterface[] = [];
  usuariosRespaldo: UsuariosInterface[] = [];
  search: string = '';
  buscarPerfilesEditar: string = '';
  buscarUsuariosEditar: string = '';

  perfilesAsignadosModel: any = [];
  perfilesAsignados: PerfilesInterface[] = [];
  perfilesAsignadosResp: PerfilesInterface[] = [];
  perfilesRespaldo: PerfilesInterface[] = [];

  localeText: any = config.agGridTextos;
  autoGroupColumnDef: any = null;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiPerfiles: GridApi;
  columnApiPerfiles: ColumnApi;
  columnDefsPerfiles: Array<ColDef> = [];
  sideBarPerfiles: any = config.agGridDefaultConfig;
  usuarioId: number = store.state.userId;
  clienteId: number = config.getClienteSesion();
  seleccionoTodosPerfiles: boolean = false;
  seleccionoTodosUsuarios: boolean = false;

  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;
  contadorEventoGrillaUsuarios: number = 0;
  contadorEventoGrillaSelectionUsuarios: number = 0;

  mostrarBtnSeleccionarUsuarios: boolean = false;

  mounted() {
    this.registrarValidadores();
    this.initialize();
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('RolNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Rol con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controller}/${self.editedItem.id}/${clienteId}/${value}/ChequearNombreUnico`
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

  nombreCompletoV2(user: UsuariosInterface): string {
    return this.formatoTextoAsociacion(
      (user.nombre != undefined ? user.nombre : '') +
        ' ' +
        (user.apellidoPaterno != undefined ? user.apellidoPaterno : '') +
        ' ' +
        (user.apellidoMaterno != undefined ? user.apellidoMaterno : '')
    );
    //return user.nombre + " " + user.apellidoPaterno + " " + user.apellidoMaterno + " (" + user.id + ")"
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.editedItem = this.rol;
    this.bottomNav = '1';
    this.usuariosAsignadosModel = [];
    this.usuariosAsignadosResp = [];
    this.usuariosAsignados = [];
    this.perfilesAsignadosModel = [];
    this.perfilesAsignadosResp = [];
    this.perfilesAsignados = [];

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value == true) {
      this.loadingService.showLoading();
      this.$validator.reset();
      this.btnBloquear = false;
      await this.getUsuarios();
      await this.getPerfiles();
      // this.setRemoveButton();

      if (this.usuariosAsignados.length === this.usuariosRespaldo.length)
        this.seleccionoTodosUsuarios = true;
      else this.seleccionoTodosUsuarios = false;

      if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
        this.seleccionoTodosPerfiles = true;
      else this.seleccionoTodosPerfiles = false;

      //recupera usuarios asignados al rol
      if (this.rol.id > 0) {
        this.axios.http
          .get(`${this.controller}/${this.rol.id}/usuario`)
          .then(async res => {
            if (res.data.length > 0) {
              this.usuariosAsignados = res.data;
              this.usuariosAsignadosResp = Object.assign(
                [],
                this.usuariosAsignados
              );

              this.usuariosAsignados.forEach((usuarios: any) => {
                this.usuariosAsignadosModel.push(usuarios.id);
              });
            }
            const self = this;
            this.gridApi.forEachNode(function(node: any) {
              var index = self.usuariosAsignados.findIndex(
                x => x.id == node.data.id
              );
              if (index !== -1) {
                node.setSelected(true);
                self.contadorEventoGrillaUsuarios++;
              }
            });

            await this.seteaAsignadosVerDetalleUsuarios();
            //recupera perfiles asignados al rol
            this.axios.http
              .get(`${this.controller}/${this.rol.id}/perfil`)
              .then(async res => {
                if (res.data.length > 0) {
                  this.perfilesAsignados = res.data;
                  this.perfilesAsignadosResp = Object.assign(
                    [],
                    this.perfilesAsignados
                  );

                  this.perfilesAsignados.forEach((perfil: any) => {
                    this.perfilesAsignadosModel.push(perfil.id);
                  });
                }
                this.loadingService.hideLoading();
                // check de los perfiles asignados
                // this.perfilesRespaldo.forEach(perfiles => {
                //   let exists: any = this.perfilesAsignados.filter(
                //     (x: any) => x.id === perfiles.id
                //   );
                //   if (exists.length == 0) {
                //     perfiles.checked = false;
                //   } else {
                //     perfiles.checked = true;
                //   }
                // });

                // recorre nodos para marcar header de grilla

                this.gridApiPerfiles.forEachNode(function(node: any) {
                  var index = self.perfilesAsignados.findIndex(
                    x => x.id == node.data.id
                  );
                  if (index !== -1) {
                    node.setSelected(true);
                    self.contadorEventoGrilla++;
                  }
                }),
                  await this.seteaAsignadosVerDetallePerfiles();
              })

              .catch(err => {
                this.loadingService.hideLoading();
                if (err.response !== undefined) {
                  if (err.response.status !== 401) {
                    this.handleErrors.showError(err);
                  }
                } else {
                  this.handleErrors.showError(err);
                }
              });
          })
          .catch(err => {
            this.loadingService.hideLoading();
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.handleErrors.showError(err);
              }
            } else {
              this.handleErrors.showError(err);
            }
          });
      } else {
        this.loadingService.hideLoading();
      }
    }

    this.initialize();
  }

  seteaAsignadosVerDetallePerfiles() {
    if (!this.esEdicion) {
      this.perfilesRespaldo = this.perfilesAsignados;
      //[COPIAR PEGAR] Track 3.0 - Grillas
      this.perfilesRespaldo.forEach(perfil => {
        perfil.estadoTxt =
          perfil.estado === EstadoEntidad.Sistema
            ? EstadoEntidad[EstadoEntidad.Activo]
            : EstadoEntidad[perfil.estado];
      });
      //---
    }
  }
  seteaAsignadosVerDetalleUsuarios() {
    if (!this.esEdicion) {
      this.usuariosRespaldo = this.usuariosAsignados;
      this.usuariosRespaldo = this.usuariosRespaldo.map((node: any) => ({
        ...node,
        estadoTxt: EstadoEntidad[node.estado],
        rut: node.rut === null ? '' : node.rut,
        nombreCompleto:
          node.nombre + ' ' + node.apellidoPaterno + ' ' + node.apellidoMaterno,
        giro: node.email === null ? '' : node.email,
        direccion: node.direccion === null ? '' : node.direccion,
        telefonoParticular:
          node.telefonoParticular === null ? '' : node.telefonoParticular,
        fechaNacimientoTxt:
          node.fechaNacimiento === null
            ? ''
            : this.$options.filters.formatDate(node.fechaNacimiento),
      }));
    }
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

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
    }
    this.permisosTotales.forEach(obj => {
      if (obj.visible && obj.accion.includes(accion) && !evaluado) {
        this.bottomNav = obj.step;
        evaluado = true;
      }
    });
  }

  onUserChange(user: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (user != undefined && user.length != this.usuariosAsignados.length) {
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
    if (user != undefined) {
      for (let i = 0; i <= user.length - 1; i++) {
        let added = this.usuariosAsignados.filter(x => x.id == user[i]);
        if (added.length == 0) {
          let usuario = this.usuariosRespaldo.filter(x => x.id == user[i]);
          this.usuariosAsignados.push(usuario[0]);
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
        let added = this.perfilesAsignados.filter(x => x.id == perfil[i]);
        if (added.length == 0) {
          let perfilAgregar = this.perfilesRespaldo.find(
            x => x.id == perfil[i]
          );
          this.perfilesAsignados.push(perfilAgregar);

          if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
            this.seleccionoTodosPerfiles = true;
          else this.seleccionoTodosPerfiles = false;
        }
      }
    }
  }

  isExternalFilterPresentPerfil(): boolean {
    return true;
  }

  doesExternalFilterPassPerfil(node: RowNode): boolean {
    if (
      this.perfilesRespaldo.length > 0 &&
      this.buscarPerfilesEditar.length > 1
    ) {
      let busqueda = this.buscarPerfilesEditar.toLowerCase();
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
      this.buscarUsuariosEditar.length > 1
    ) {
      let busqueda = this.buscarUsuariosEditar.toLowerCase();
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

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    });
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.loadingService.showLoading();
    try {
      if (val) {
        const resVal: any = await this.$validator.validateAll();
        if (resVal) {
          this.btnBloquear = true;
          let model = {
            Id: this.editedItem.id,
            Name: this.editedItem.name,
            Estado: this.editedItem.estado,
            ClienteId: this.clienteId,
          };

          //Edición
          await this.axios.http.put(`${this.controller}/`, model);
          // await this.eliminaAsociacionesUsuarios();
          // await this.grabaAsociacionesUsuarios();

          await this.actualizarAsociacionRol();
          // await this.eliminaAsociacionPerfiles();
          // await this.grabaAsociacionesPerfiles();
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.closeModal(false);
        }
      }
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
    } finally {
      this.loadingService.hideLoading();
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async eliminaAsociacionesUsuarios() {
    let usuarioEliminar: any = [];
    this.usuariosAsignadosResp.forEach((user: any) => {
      let exists = this.usuariosAsignados.filter(z => z.id == user.id);
      if (exists.length == 0) {
        usuarioEliminar.push({ id: user.id });
      }
    });

    if (usuarioEliminar.length > 0) {
      usuarioEliminar.forEach((user: any, idx: number) => {
        this.axios.http.delete(
          `${this.controller}/${this.rol.id}/usuario/${
            user.id
          }/cliente/${config.getClienteSesion()}`
        );
      });
    }
  }

  async grabaAsociacionesUsuarios() {
    if (this.usuariosAsignados.length > 0) {
      this.usuariosAsignados.forEach((usuarios: any, idx: number) => {
        const existe = this.usuariosAsignadosResp.filter(
          x => x.id == usuarios.id
        );

        if (existe.length === 0) {
          this.axios.http.post(
            `${this.controller}/${this.rol.id}/usuario/${
              usuarios.id
            }/cliente/${config.getClienteSesion()}`,
            {}
          );
        }
      });
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

    return Promise.all(promesas);
  }

  async eliminaAsociacionPerfiles() {
    let perfilesDesasociados: any = [];
    this.perfilesAsignadosResp.forEach((perfil: any) => {
      let exists = this.perfilesAsignados.filter(z => z.id == perfil.id);
      if (exists.length == 0) {
        perfilesDesasociados.push({ id: perfil.id });
      }
    });

    //elimina asociados
    if (perfilesDesasociados.length > 0) {
      perfilesDesasociados.forEach((perfil: any) => {
        let model: any = {
          id: perfil.id,
          nombre: 'perfil',
          estado: EstadoEntidad.Activo,
          perfilRoles: [
            {
              Id: 1,
              PerfilId: perfil.id,
              RolId: this.rol.id,
              NombreRol: '',
              FechaInicioAsociacion: new Date(),
              FechaFinAsociacion: new Date(
                new Date().getFullYear() + 1,
                10,
                10
              ),
            },
          ],
          perfilUsuarios: [],
          usuarios: [],
          roles: [],
        };

        this.axios.http.delete(`${this.perfilController}/${perfil.id}/rol`, {
          data: model,
        });
      });
    }
  }

  async grabaAsociacionesPerfiles() {
    if (this.perfilesAsignados.length > 0) {
      this.perfilesAsignados.forEach((perfil: any, idx: number) => {
        let existe = this.perfilesAsignadosResp.filter(x => x.id == perfil.id);
        if (existe.length === 0) {
          this.axios.http.post(
            `${this.perfilController}/${perfil.id}/rol/${this.rol.id}`
          );
        }
      });
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarPerfilesEditar = '';
    this.buscarUsuariosEditar = '';
    this.contadorEventoGrillaSelection = 0;
    this.contadorEventoGrilla = 0;
    this.contadorEventoGrillaSelectionUsuarios = 0;
    this.contadorEventoGrillaUsuarios = 0;
    this.gridApiPerfiles.setQuickFilter('');
    this.gridApi.setQuickFilter('');
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onGridReadyPerfiles(params: GridReadyEvent) {
    this.gridApiPerfiles = params.api;
    this.columnApiPerfiles = params.columnApi;
  }

  async getUsuarios() {
    this.axios.http
      .get(`${this.usuarioController}/${this.clienteId}/usuariosAsignar`)
      .then(async res => {
        this.usuariosRespaldo = res.data;
        if (this.usuariosRespaldo.length > 0) {
          if (this.esEdicion) {
            //Solo Usuarios Locales y sin Usuario en sesión
            this.usuariosRespaldo = this.usuariosRespaldo.filter(
              (x: any) => x.tipo == TipoUsuario.Local && x.id !== this.usuarioId
            );
          } else {
            //Solo Usuarios Locales (puede que el usuario en sesion este asignado al Rol)
            this.usuariosRespaldo = this.usuariosRespaldo.filter(
              (x: any) => x.tipo == TipoUsuario.Local
            );
          }
        }

        // check de los usuarios asignados
        this.usuariosRespaldo.forEach(usuarios => {
          let exists: any = this.usuariosAsignados.filter(
            (x: any) => x.id === usuarios.id
          );
          if (exists.length == 0) {
            usuarios.checked = false;
          } else {
            usuarios.checked = true;
          }
        });
        await this.seteaAsignadosVerDetalleUsuarios();

        // recorre nodos para marcar header de grilla
        const self = this;
        this.gridApi.forEachNode(function(node: any) {
          var index = self.usuariosAsignados.findIndex(
            x => x.id == node.data.id
          );
          if (index !== -1) {
            node.setSelected(true);
          }
        });
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

  async getPerfiles() {
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
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener los Perfiles.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener los Perfiles.');
        }
      });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  createButtonCell(params: any) {
    let evento = this.removerUsuarioAsignacion;
    var item = this.usuariosRespaldo.filter(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--icon theme--light'
      );
    } else {
      eButton.setAttribute('disabled', 'true');
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
      );
    }

    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item[0]);
    });

    return eButton;
  }

  createButtonCellPerfil(params: any) {
    let evento = this.removerPerfilAsignacion;
    var item = this.perfilesRespaldo.find(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--icon theme--light'
      );
    } else {
      eButton.setAttribute('disabled', 'true');
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
      );
    }

    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item);
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

  removerPerfilAsignacion(item: PerfilesInterface) {
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

  // setRemoveButton() {
  //   //if (this.esEdicion) {
  //   let a1 = this.columnDefs.filter((x: any) => x.headerName == 'Desasociar');
  //   let a2 = this.columnDefsPerfiles.filter(
  //     (x: any) => x.headerName == 'Desasociar'
  //   );
  //   if (a1.length == 0) {
  //     this.columnDefs.push({
  //       headerName: 'Desasociar',
  //       width: 150,
  //       cellRenderer: this.createButtonCell,
  //       filter: false,
  //       suppressMovable: true,
  //       resizable: false,
  //       sortable: false,
  //       lockVisible: true,
  //       pinned: 'right',
  //       cellStyle: { textAlign: 'left' },
  //     });
  //   }
  //   if (a2.length == 0) {
  //     this.columnDefsPerfiles.push({
  //       headerName: 'Desasociar',
  //       width: 150,
  //       cellRenderer: this.createButtonCellPerfil,
  //       filter: false,
  //       suppressMovable: true,
  //       resizable: false,
  //       sortable: false,
  //       lockVisible: true,
  //       pinned: 'right',
  //       cellStyle: { textAlign: 'left' },
  //     });
  //   }
  //   /*} else {
  //     //remueve columnas de desasociar, si existen
  //     this.columnDefs = config.returnGrillaCeldasDesasociar(
  //       this.columnDefs,
  //       "Desasociar"
  //     );
  //     this.columnDefsPerfiles = config.returnGrillaCeldasDesasociar(
  //       this.columnDefsPerfiles,
  //       "Desasociar"
  //     );
  //   }*/
  // }

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
        sort: 'desc',
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
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
        resizable: false,
        lockPinned: true,
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
        valueFormatter: this.fechaFilter,
        resizable: true,
        sortable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => null,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        minWidth: 80,
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
      //   enablePivot: false,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   pinned: 'right',
      //   minWidth: 80,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'left' },
      // },
    ];
    if (!this.esEdicion) {
      this.columnDefs.shift();
    }

    this.columnDefsPerfiles = [
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
        sort: 'desc',
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
        hide: true,
        resizable: true,
        sortable: true,
        lockPinned: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
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
        /*cellRenderer: (r: any) => {
          if (r.data.estado === EstadoEntidad.Sistema)
            return EstadoEntidad[EstadoEntidad.Activo];
          else return EstadoEntidad[r.data.estado];
        },*/
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   cellRenderer: this.createButtonCellPerfil,
      //   enablePivot: false,
      //   resizable: false,
      //   minWidth: 80,
      //   sortable: false,
      //   lockVisible: true,
      //   suppressMovable: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];
    if (!this.esEdicion) {
      this.columnDefsPerfiles.shift();
    }
    // this.setRemoveButton();

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

  onFilterTextBoxChangedAsociarPerfilesEditar() {
    this.gridApiPerfiles.onFilterChanged();
    // if (this.buscarPerfilesEditar.length > 1) {
    //   this.gridApiPerfiles.setQuickFilter(this.buscarPerfilesEditar);
    // } else {
    //   this.gridApiPerfiles.setQuickFilter('');
    // }
  }

  onSelectedChangedPerfilesEditar() {
    this.contadorEventoGrillaSelection++;
    if (this.perfilesAsignados.length == 0) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }
    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.perfilesAsignados = this.gridApiPerfiles.getSelectedRows();
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
      const perfilesSeleccionados = this.gridApiPerfiles
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

      this.gridApiPerfiles.updateRowData({
        update: [...perfilesNoSeleccionados, ...perfilesSeleccionados],
      });
    }
  }
  getRowNodeIdEditar(perfil: PerfilesInterface) {
    if (!perfil) {
      return;
    }
    return perfil.id;
  }
  getRowNodeIdUsuariosEditar(usuarios: UsuariosInterface) {
    if (!usuarios) {
      return;
    }
    return usuarios.id;
  }

  onFilterTextBoxChangedAsociarUsuariosEditar() {
    this.gridApi.onFilterChanged();
    // if (this.buscarUsuariosEditar.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarUsuariosEditar);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }

  onSelectedChangedUsuariosEditar() {
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

  procesarFecha(params: any) {
    if (params.column.getColDef().field === 'fechaNacimiento') {
      return this.$options.filters.formatDate(params.value);
    } else {
      return params.value;
    }
  }

  async actualizarAsociacionRol() {
    // eliminar usuarios
    let usuarioEliminar: number[] = [];
    this.usuariosAsignadosResp.forEach((user: any) => {
      let exists = this.usuariosAsignados.filter(z => z.id == user.id);
      if (exists.length == 0) {
        usuarioEliminar.push(user.id);
      }
    });

    let usuariosEliminados = {
      usuarioIds: usuarioEliminar,
      rolId: this.rol.id,
      clienteSesion: config.getClienteSesion(),
    };

    // crear usuarios asignados
    let usuarioAgregados: number[] = [];
    this.usuariosAsignados.forEach((usuarios: any, idx: number) => {
      const existe = this.usuariosAsignadosResp.filter(
        x => x.id == usuarios.id
      );
      if (existe.length === 0) {
        usuarioAgregados.push(usuarios.id);
      }
    });

    let usuariosAgregados = {
      usuarioIds: usuarioAgregados,
      rolId: this.rol.id,
      clienteSesion: config.getClienteSesion(),
    };

    // elimina perfiles
    let perfilesDesasociados: number[] = [];
    this.perfilesAsignadosResp.forEach((perfil: any) => {
      let exists = this.perfilesAsignados.filter(z => z.id == perfil.id);
      if (exists.length == 0) {
        perfilesDesasociados.push(perfil.id);
      }
    });

    let perfilesEliminados = {
      perfilesIds: perfilesDesasociados,
      rolId: this.rol.id,
    };

    // guardar perfiles nuevos
    let perfilAgregados: number[] = [];
    if (this.perfilesAsignados.length > 0) {
      this.perfilesAsignados.forEach((perfil: any, idx: number) => {
        let existe = this.perfilesAsignadosResp.filter(x => x.id == perfil.id);
        if (existe.length === 0) {
          perfilAgregados.push(perfil.id);
        }
      });
    }

    let perfilesAgregados = {
      perfilesIds: perfilAgregados,
      rolId: this.rol.id,
    };

    let body = {
      usuariosEliminados: usuariosEliminados,
      usuariosAgregados: usuariosAgregados,
      perfilesEliminados: perfilesEliminados,
      perfilesAgregados: perfilesAgregados,
    };

    await this.axios.http.put(
      `${this.controller}/${this.rol.id}/actualizarRol`,
      body
    );
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

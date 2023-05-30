<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivUT">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Usuario Transversal</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenuUsuariosTransversales()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenuUsuariosTransversales()"
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
              v-show="asociarRoles.visible"
              :complete="e1 > asociarRoles.step"
              :step="asociarRoles.step"
              >Asociar Rol</v-stepper-step
            >
            <v-divider v-show="!esTipoOperacion"></v-divider>
            <v-stepper-step
              v-show="!esTipoOperacion"
              :complete="e1 > asociarRoles.step + 1"
              :step="asociarRoles.step + 1"
              >Asociar Clientes</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <!-- 1. INFORMACIÓN GENERAL -->
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
                        <br />
                        <v-layout wrap>
                          <v-flex xs6 sm6 md6></v-flex>
                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              slot="activator"
                              v-model="computedDateFormattedVigencia"
                              label="Fecha Inicio Vigencia"
                              persistent-hint
                              prepend-icon="event"
                              readonly
                              required
                              disabled
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="{
                                rules: {
                                  required: true,
                                  max: 200,
                                  email: true,
                                  emailExiste1: true,
                                  regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                                },
                              }"
                              v-model="newItem.email"
                              :error-messages="errors.collect('email')"
                              data-vv-name="email"
                              :counter="200"
                              label="Correo Electrónico"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              id="rutUsuario"
                              v-validate="'required|rut|rutFormato|max:10'"
                              v-model="newItem.rut"
                              :error-messages="errors.collect('rut')"
                              data-vv-name="rut"
                              :counter="10"
                              label="Rut (Ej. 11111111-1)"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'required|max:80|alpha_spaces'"
                              v-model="newItem.nombre"
                              :error-messages="errors.collect('name')"
                              data-vv-name="name"
                              label="Nombre"
                              :counter="80"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              v-validate="'required|max:80|alpha_spaces'"
                              v-model="newItem.apellidoPaterno"
                              :error-messages="
                                errors.collect('apellidoPaterno')
                              "
                              data-vv-name="apellidoPaterno"
                              label="Apellido Paterno"
                              :counter="80"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              v-validate="'max:80|alpha_spaces'"
                              v-model="newItem.apellidoMaterno"
                              :error-messages="
                                errors.collect('apellidoMaterno')
                              "
                              data-vv-name="apellidoMaterno"
                              :counter="80"
                              label="Apellido Materno"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-menu
                              :close-on-content-click="false"
                              v-model="menuDatePicker"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              max-width="290px"
                              min-width="290px"
                            >
                              <v-text-field
                                v-validate="
                                  date == defaultDate && flagDate == true
                                    ? 'fechaNacimiento'
                                    : 'fechaNacimiento|mayorDeEdad'
                                "
                                :error-messages="
                                  errors.collect('fechaNacimiento')
                                "
                                data-vv-name="fechaNacimiento"
                                slot="activator"
                                v-model="computedDateFormatted"
                                label="Fecha Nacimiento"
                                persistent-hint
                                prepend-icon="event"
                                readonly
                                required
                                clearable
                                @click:clear="limpiaValidacionFecha()"
                              ></v-text-field>
                              <v-date-picker
                                v-model="date"
                                first-day-of-week="1"
                                locale="es-cl"
                                scrollable
                                :key="keyDatePickers"
                                @input="menuDatePicker = false"
                                @change="flagDate = false"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'max:60'"
                              v-model="newItem.direccion"
                              :error-messages="errors.collect('direccion')"
                              data-vv-name="direccion"
                              label="Dirección"
                              :counter="60"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              v-validate="{
                                max: 11,
                                regex: /^(56)[0-9]\d{8}$/,
                              }"
                              v-model="newItem.telefonoFijo"
                              :error-messages="errors.collect('telefonoFijo')"
                              data-vv-name="telefonoFijo"
                              label="Teléfono Fijo"
                              placeholder="56299999999"
                              :counter="11"
                              type="tel"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              v-validate="{
                                max: 11,
                                regex: /^(569)[0-9]\d{7}$/,
                              }"
                              v-model="newItem.telefonoParticular"
                              :error-messages="errors.collect('celular')"
                              data-vv-name="celular"
                              label="Teléfono Celular"
                              placeholder="56999999999"
                              :counter="11"
                              type="tel"
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <!-- 2. ASOCIAR ROLES -->
            <v-stepper-content
              v-show="asociarRoles.visible"
              :step="asociarRoles.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Rol</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-select
                            v-model="selectedTipoRol"
                            :items="tiposRol"
                            item-text="nombre"
                            item-value="id"
                            label="Tipo de Rol"
                            @change="onTipoRolChange"
                          ></v-select>
                        </v-flex>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarRol"
                            @input="onFilterTextBoxChangedRol"
                            prepend-icon="person_add"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>

                      <!-- <v-layout v-if="seleccionHome">
                        <v-flex>
                          <v-select
                            v-model="selectedHome"
                            :items="homes"
                            item-text="nombre"
                            item-value="id"
                            label="Pagina Principal"
                          >
                          </v-select>
                        </v-flex>
                      </v-layout> -->
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsRoles"
                              :rowData="rolesRespaldo"
                              rowSelection="single"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadyRoles"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectionChangedRol()"
                              :getRowNodeId="getRowNodeIdRoles"
                              suppressCopyRowsToClipboard="true"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :suppressNoRowsOverlay="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentRol
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassRol
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

            <!-- 3. ASOCIAR CLIENTES -->
            <v-stepper-content
              :v-show="asociarClientes.visible"
              :step="asociarClientes.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Clientes</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarCliente"
                            @input="onFilterTextBoxChangedCliente"
                            prepend-icon="person"
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
                              :columnDefs="columnDefsClientes"
                              :rowData="clientesRolRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :editable="true"
                              :localeText="localeText"
                              :onGridReady="onGridReadyClientes"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectionChangedClientes($event)
                              "
                              :getRowNodeId="getRowNodeIdClientes"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentCliente
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassCliente
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
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Usuario Transversal' })
      "
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: ' el Usuario' })"
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
import Vue from 'vue';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Validator } from 'vee-validate';
import config from '@/config/index';
import ValidaRut from '@/config/validaRut';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { EstadoInterface } from '@/interfaces/Estado';
import { RolesInterface } from '@/interfaces/Roles';
import { IClientes } from '@/interfaces/Clientes';
import { EstadosService } from '@/services/estadosService';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoRol, TipoUsuario } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { differenceBy } from 'lodash';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  IRowModel,
  RowNode,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class UsuariosModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  usuario!: UsuariosInterface;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.UsuariosTransversal; //EMR //Funcionalidades.RolesTransversal;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarRoles: PermisoAccionVm = {
    accion: 'Crear - Asociar Roles',
    visible: true,
    step: 2,
    codigoSubAccion: 26,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarClientes: PermisoAccionVm = {
    accion: 'Crear - Asociar Clientes',
    visible: true,
    step: 3,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarRoles,
    this.asociarClientes,
  ];

  readonly controllerUsuario: string = 'usuario';
  readonly controllerCuenta: string = 'cuenta';
  readonly controllerCliente: string = 'cliente';
  readonly controllerRol: string = 'rol';
  readonly controllerClienteRol: string = 'clienterol';
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);

  //Variables globales
  $snotify: any;
  e1: number = 1;
  date: any = null;
  dateVigencia: any = null;
  repitaPass: string = '';
  selectedEstado: any = null;
  menuDatePicker: boolean = false;
  menuDatePickerVigencia: boolean = false;
  btnText: string = 'Continuar';
  seleccionHome: boolean = false;
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  btnBloquear: boolean = false;
  search: string = '';
  idkey: number = 0;
  clienteId: number = config.getClienteSesion();

  vr: ValidaRut = new ValidaRut();
  estados: EstadoInterface[] = [];
  newItem: UsuariosInterface = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();

  clientesRules: any = [];
  buscarCliente: string = '';

  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];
  //clientesRespaldo: IClientes[] = [];
  //clientesRespaldoId: any = [];
  clientesAsignadosResp: any[] = [];

  rolesAsignadosModel: any = [];

  seleccionoTodos: boolean = false;
  clienteRolAsignadosModel: any = [];
  clienteRolAsignados: any[] = [];
  clientesRolRespaldo: any[] = [];
  rolesSeleccionados: any[] = [];
  roles: any = [];
  seleccionoTodosClientes: boolean = false;

  mostrarBtnSeleccionarAsociarRoles: boolean = false;

  keyDatePickers: number = 0;
  defaultDate: any = moment(new Date()).format('YYYY-MM-DD');
  flagDate: boolean = false;
  rolesGuardados: any = [];
  cambioListaClientes: boolean = false;

  //GRILLAS
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  sideBar: any = config.agGridDefaultConfig;

  gridApiClientes: GridApi;
  columnApiClientes: ColumnApi;
  columnDefsClientes: Array<ColDef> = [];

  gridApiRoles: GridApi;
  columnApiRoles: ColumnApi;
  columnDefsRoles: Array<ColDef> = [];

  //ASOCIAR ROLES
  tiposRol: any = [];
  selectedTipoRol: any = null;
  esTipoOperacion: boolean = true;
  rolesAsignados: RolesInterface[] = [];
  rolesRespaldo: RolesInterface[] = [];
  rolesRespaldoAll: RolesInterface[] = [];
  buscarRol: string = '';
  selectedHome: any = null;
  homes: any = [];

  mounted() {
    this.initialize();
  }

  validaAlMenosUnCliente(): boolean {
    if (this.e1 === 2) {
      return this.clientesAsignados.length > 0;
    }
    return true;
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivUT').scrollIntoView(true);
    if (this.e1 == 2) {
      this.rolesGuardados = [];
      this.roles.forEach((cliente: any) => {
        cliente.children.forEach((rol: any) => {
          var item = this.rolesSeleccionados.filter(x => x === rol.id);
          if (item.length > 0) {
            this.rolesGuardados.push({
              ClienteId: cliente.clienteId,
              RoleId: rol.rolId,
            });
          }
        });
      });
    }
  }

  created() {
    this.chequearPermisos();

    var r = this.vr;
    let self = this;

    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.Rut(value),
            data: r.Rut(value) ? undefined : { message: '* Rut inválido' },
          });
        });
      },
    });

    Validator.extend('rutFormato', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFormatoRut(value),
            data: r.validaFormatoRut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });

    Validator.extend('emailExiste1', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) || '* Correo Electrónico se encuentra en uso'
        );
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.controllerUsuario}/validarEmail?email=${value}`)
          .then(response => {
            if (response.data.id === 0) {
              return true;
            } else {
              return false;
            }
          });
      },
    });

    Validator.extend('fechaNacimiento', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Fecha Nacimiento no puede ser mayor a hoy'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFechaNacimiento(value),
            data: r.validaFechaNacimiento(value)
              ? undefined
              : { message: '* Fecha Nacimiento no puede ser mayor a hoy' },
          });
        });
      },
    });

    Validator.extend('mayorDeEdad', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Fecha Nacimiento no cumple con mayoría de edad'
        );
      },
      validate(value: any) {
        return r.validaMayorEdad(value);
      },
    });
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuUsuariosTransversales(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.btnBloquear = false;
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.clientesAsignadosModel = [];
    this.clientesAsignados = [];
    this.clientesAsignadosResp = [];
    this.newItem.id = 0;
    this.dateVigencia = moment(new Date()).format('YYYY-MM-DD');
    this.esTipoOperacion = true;
    this.date = null;
    this.selectedEstado = 0;
    this.dialogConfirmacionClose = false;

    if (value) {
      this.loadingService.hideLoading();
      this.seleccionoTodos = false;
      this.seleccionoTodosClientes = false;
      this.rolesSeleccionados = [];
      this.getTipoRol();
      await this.getRoles();
    }
  }

  marcarTodosRoles(value: boolean) {
    this.rolesSeleccionados = [];
    if (value) {
      this.roles.forEach((cliente: any) => {
        this.rolesSeleccionados.push(cliente.id);
        cliente.roles.forEach((rol: any) => {
          this.rolesSeleccionados.push(rol.id);
        });
      });
    }
    this.seleccionoTodos = value;
  }

  async continuar() {
    const resultado = await this.$validator.validateAll();

    if (resultado) {
      document.getElementById('cardDivUT').scrollIntoView(true);

      let longPermisosActuales = this.permisosActuales.length;
      if (this.esTipoOperacion) {
        longPermisosActuales = longPermisosActuales - 1;
      }

      if (this.e1 === longPermisosActuales) {
        this.btnBloquear = true;
        this.dialogConfirmacion = true;
      } else if (this.e1 === longPermisosActuales - 1) {
        this.e1 += 1;
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
      } else {
        this.e1 += 1;
      }
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivUT').scrollIntoView(true);
    this.$validator.reset();
    this.btnBloquear = false;
    this.newItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.keyDatePickers += 1;
    this.selectedTipoRol = null;
    this.rolesRespaldoAll = [];
    this.rolesRespaldo = [];
    this.rolesAsignados = [];
    this.clientesAsignados = [];
    this.clientesRolRespaldo = [];
    this.clientesAsignadosResp = [];
    this.buscarRol = '';
    this.buscarCliente = '';
    this.gridApiRoles.setQuickFilter('');
    this.gridApiClientes.setQuickFilter('');
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyRoles(params: GridReadyEvent) {
    this.gridApiRoles = params.api;
    this.columnApiRoles = params.columnApi;
  }

  onGridReadyClientes(params: GridReadyEvent) {
    this.gridApiClientes = params.api;
    this.columnApiClientes = params.columnApi;
  }

  async getClientesPorTipoRol(rolId: number) {
    this.loadingService.showLoading();
    await this.axiosCliente.http
      .get(`${this.controllerCliente}/${rolId}/ClientesPorTipoRol`)
      .then(res => {
        this.clientesRolRespaldo = res.data;
        this.loadingService.hideLoading();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener los Clientes del Rol Seleccionado.'
            );
          }
        } else {
          this.$snotify.error(
            'Ocurrió un error al obtener los Clientes del Rol Seleccionado.'
          );
        }
      });
  }

  getClientesRolSelected() {
    this.roles = [];
    var indexNegativo: number = -1;
    var indexPositivo: number = 1;
    var tview: any = [];
    this.clientesAsignados.forEach(cliente => {
      let validaRoles = this.rolesRespaldo.filter(
        (x: any) => x.id == cliente.id
      );
      if (validaRoles.length > 0) {
        tview.push({
          id: indexNegativo,
          clienteId: cliente.id,
          name: cliente.nombre,
          children: [],
          roles: this.rolesRespaldo.filter((x: any) => x.id == cliente.id),
        });
      }
      indexNegativo -= 1;
    });
    tview.forEach((tv: any) => {
      let childrenRol: any = {};
      if (tv.roles.length > 0) {
        tv.roles.forEach((rol: any) => {
          childrenRol = {
            id: indexPositivo,
            rolId: rol.rolId,
            name: rol.nombre + ' - ' + TipoRol[rol.tipo],
            children: [],
          };
          indexPositivo += 1;
          if (childrenRol.name !== undefined) tv.children.push(childrenRol);
        });
      }
    });
    this.loadingService.hideLoading();
    this.roles = tview;
    if (this.rolesGuardados.length > 0) {
      this.checkeaLosGuardados();
    }
    this.cambioListaClientes = false;
  }

  checkeaLosGuardados() {
    this.rolesSeleccionados = [];
    this.idkey++;
    this.roles.forEach((cliente: any) => {
      let rolesSeleccionadosCliente = this.rolesGuardados.filter(
        (x: any) => x.ClienteId == cliente.clienteId
      );

      if (rolesSeleccionadosCliente.length > 0) {
        cliente.children.forEach((rolHijo: any) => {
          let rolSeleccionado = rolesSeleccionadosCliente.find(
            (x: any) => x.RoleId == rolHijo.rolId
          );
          if (rolSeleccionado != undefined) {
            this.rolesSeleccionados.push(rolHijo.id);
          }
        });
      }
    });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.loadingService.showLoading();
      this.btnBloquear = true;

      const password = this.generatePassword(3, 3, 4, 1);
      const model: any = {
        Id: 0,
        NombreUsuario: this.newItem.email,
        Nombre: this.newItem.nombre,
        ApellidoPaterno: this.newItem.apellidoPaterno,
        ApellidoMaterno:
          this.newItem.apellidoMaterno == undefined
            ? ''
            : this.newItem.apellidoMaterno,
        Rut: this.newItem.rut,
        Email: this.newItem.email,
        Direccion: this.newItem.direccion,
        TelefonoFijo: this.newItem.telefonoFijo,
        TelefonoParticular: this.newItem.telefonoParticular,
        Contrasena: password,
        FechaNacimiento:
          this.date === undefined ||
          this.date === null ||
          this.date === this.defaultDate
            ? null
            : new Date(this.date),
        FechaInicioVigencia: new Date(this.dateVigencia),
        Estado: this.selectedEstado,
        Tipo: TipoUsuario.Transversal,
      };
      await this.axios.http
        .post(this.controllerUsuario, model)
        .then(async res => {
          const usuarioId = res.data.id;

          //URL LOGIN
          let url: string = '';
          let arr = [];
          arr = window.location.pathname.split('/');

          if (arr.length >= 3) {
            url = window.location.origin + '/' + arr[1];
          } else {
            url = window.location.origin;
          }
          //---

          let modelMail = {
            EncodeIdUsuario: btoa(res.data.id.toString()),
            From: '',
            To: model.Email,
            Subject: 'Creación de Usuario',
            Message: url,
            EncodedFechaEnvio: btoa(
              new Date().getDate().toString() +
                new Date().getMonth().toString() +
                new Date().getFullYear().toString()
            ),
            Url: password,
          };

          await this.axiosAuth.http
            .post(`Email/CreacionUsuario`, modelMail)
            .then(res => {});

          await this.grabarAsociacionesRoles(usuarioId);
          await this.grabarAsociacionesClientes(usuarioId);
          await this.actualizaAsociacionFlotas(usuarioId);

          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Usuario Transversal',
              creadoA: 'creado',
            })
          );

          this.closeModal(false);
          this.dialogConfirmacion = false;
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.btnBloquear = false;
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.handleErrors.showError(error);
            }
          } else {
            this.handleErrors.showError(error);
          }
          this.loadingService.hideLoading();
        });
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async grabarAsociacionesRoles(usuarioId: number) {
    if (this.rolesAsignados.length > 0) {
      let model: any = [];
      if (this.clientesAsignados.length > 0) {
        this.clientesAsignados.forEach((cliente: any) => {
          model.push({
            ClienteId: cliente.id,
            RoleId: this.rolesAsignados[0].id,
          });
        });
      } else {
        model.push({
          ClienteId: 0,
          RoleId: this.rolesAsignados[0].id,
        });
      }

      await this.axios.http
        .post(`${this.controllerUsuario}/${usuarioId}/clienterol/`, model)
        .then(res => {})
        .catch(error => {
          this.btnBloquear = false;
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'el Usuario Transversal',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Usuario Transversal',
              })
            );
          }
        });
    }
  }

  async grabarAsociacionesClientes(usuarioId: number) {
    let model: any = [];
    if (this.clientesAsignados.length > 0) {
      this.clientesAsignados.forEach((cliente: IClientes) => {
        model.push({
          Id: 0,
          ClienteId: cliente.id,
          UsuarioId: usuarioId,
        });
      });
    } else {
      if (this.esTipoOperacion) {
        model.push({
          Id: 0,
          ClienteId: this.clienteId,
          UsuarioId: usuarioId,
        });
      }
    }

    if (model.length > 0) {
      await this.axios.http
        .post(`${this.controllerUsuario}/${usuarioId}/cliente/`, model)
        .then(res => {})
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'el Usuario Transversal',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Usuario Transversal',
              })
            );
          }
        });
    }
  }

  get computedDateFormatted() {
    if (this.date === this.defaultDate) return null;
    else return this.formatDate(this.date);
  }

  get computedDateFormattedVigencia() {
    return this.formatDate(this.dateVigencia);
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  initialize() {
    this.columnDefsRoles = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'name',
        resizable: true,
        minWidth: 80,
        sortable: true,
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
        headerName: 'Tipo',
        field: 'tipoTxt',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        lockVisible: false,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.columnDefsClientes = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
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
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        resizable: true,
        lockVisible: true,
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
        headerName: 'Estado',
        field: 'estadoTxt',
        sortable: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Nombre solo debe contener letras y/o espacios.',
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Paterno solo debe contener letras y/o espacios.',
        },
        apellidoMaterno: {
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Materno solo debe contener letras y/o espacios.',
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
          regex: () => config.errorMensajes.regex,
        },
        celular: {
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaNacimiento: {
          mayorDeEdad: () => config.errorMensajes.fechaMayoriaEdad,
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  generatePassword(
    numLc: number,
    numUc: number,
    numDigits: number,
    numSpecial: number
  ) {
    numLc = numLc || 4;
    numUc = numUc || 4;
    numDigits = numDigits || 4;
    numSpecial = numSpecial || 2;

    var lcLetters = 'abcdefghijklmnopqrstuvwxyz';
    var ucLetters = lcLetters.toUpperCase();
    var numbers = '0123456789';
    var special = '.';

    var getRand = function(values: any) {
      return values.charAt(Math.floor(Math.random() * values.length));
    };

    function shuffle(o: any) {
      //v1.0
      for (
        var j, x, i = o.length;
        i;
        j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
      );
      return o;
    }

    var pass = [];
    for (var i1 = 0; i1 < numLc; ++i1) {
      pass.push(getRand(lcLetters));
    }
    for (var i2 = 0; i2 < numUc; ++i2) {
      pass.push(getRand(ucLetters));
    }
    for (var i3 = 0; i3 < numDigits; ++i3) {
      pass.push(getRand(numbers));
    }
    for (var i4 = 0; i4 < numSpecial; ++i4) {
      pass.push(getRand(special));
    }

    return shuffle(pass).join('');
  }

  limpiaValidacionFecha() {
    //this.date = this.defaultDate;
    //this.flagDate = true;
    this.date = null;
    this.flagDate = false;
  }

  onSelectionChangedClientes() {
    this.clientesAsignados = this.gridApiClientes.getSelectedRows();
    this.clientesAsignadosResp = Object.assign([], this.clientesAsignados);

    //Orden campo check
    const clientesSeleccionados = this.gridApiClientes
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const clientesNoSeleccionados = differenceBy(
      this.clientesRolRespaldo,
      clientesSeleccionados,
      cliente => cliente.id
    ).map(cliente => ({
      ...cliente,
      checked: false,
    }));

    this.gridApiClientes.updateRowData({
      update: [...clientesNoSeleccionados, ...clientesSeleccionados],
    });
    //---
  }
  getRowNodeIdClientes(cliente: IClientes) {
    if (!cliente) {
      return;
    }
    return cliente.id;
  }

  onFilterTextBoxChangedCliente() {
    this.gridApiClientes.onFilterChanged();
    // if (this.buscarCliente.length > 1) {
    //   this.gridApiClientes.setQuickFilter(this.buscarCliente);
    // } else {
    //   this.gridApiClientes.setQuickFilter('');
    // }
  }

  getRowNodeIdRoles(rol: any) {
    if (!rol) {
      return;
    }
    return rol.id;
  }
  onFilterTextBoxChangedRol() {
    this.gridApiRoles.onFilterChanged();
    // if (this.buscarRol.length > 1) {
    //   this.gridApiRoles.setQuickFilter(this.buscarRol);
    // } else {
    //   this.gridApiRoles.setQuickFilter('');
    // }
  }

  async onTipoRolChange(tipoRol: any) {
    this.rolesAsignados = [];
    if (tipoRol === TipoRol.Operación) {
      this.esTipoOperacion = true;
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    } else {
      this.esTipoOperacion = false;
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    }

    //Si cambia de Tipo de Rol se limpian los Clientes y Roles Asignados
    this.clientesRolRespaldo = [];
    this.clientesAsignados = [];
    this.clientesAsignadosResp = [];
    this.rolesAsignados = [];
    //---
    await this.showSelectPaginaPrincipal();
    this.rolesRespaldo = this.rolesRespaldoAll.filter(
      (x: any) => x.tipo === tipoRol
    );
  }

  getTipoRol() {
    for (let item in TipoRol) {
      if (!isNaN(Number(item))) {
        if (Number(item) > 0) {
          let nombre = TipoRol[item];
          this.tiposRol.push({
            id: Number(item),
            nombre: nombre,
          });
        }
      }
    }
  }

  async getRoles() {
    await this.axios.http
      .get(this.controllerRol + '/0/tipo')
      .then(res => {
        this.rolesRespaldoAll = res.data.map((x: any) => ({
          ...x,
          estadoTxt:
            x.estado === EstadoEntidad.Activo ||
            x.estado === EstadoEntidad.Sistema
              ? 'Activo'
              : 'Inactivo',
          tipoTxt: TipoRol[x.tipo].toString(),
        }));
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener Roles.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener Roles.');
        }
      });
  }
  showSelectPaginaPrincipal() {
    if (this.rolesAsignados.length > 0) {
      if (this.rolesAsignados.length > 0) {
        if (this.rolesAsignados[0].homes[0].length > 1) {
          this.homes = this.rolesAsignados[0].homes[0];
          this.seleccionHome = true;
        } else this.seleccionHome = false;
      }
    } else this.seleccionHome = false;
  }
  onSelectionChangedRol() {
    this.rolesAsignados = this.gridApiRoles.getSelectedRows();

    if (!this.esTipoOperacion) {
      this.actualizaClientesPorRol();
    }

    if (this.rolesAsignados.length === 0) {
      this.clientesRolRespaldo = [];
      this.clientesAsignados = [];
      this.clientesAsignadosResp = [];
    }

    this.showSelectPaginaPrincipal();

    //Orden campo check
    const rolesSeleccionados = this.gridApiRoles
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const rolesNoSeleccionados = differenceBy(
      this.rolesRespaldo,
      rolesSeleccionados,
      rol => rol.id
    ).map(rol => ({
      ...rol,
      checked: false,
    }));

    this.gridApiRoles.updateRowData({
      update: [...rolesNoSeleccionados, ...rolesSeleccionados],
    });
    //---
  }

  async seteaClientesAsignados() {
    const self = this;
    this.gridApiClientes.forEachNode(function(node: any) {
      var index = self.clientesAsignadosResp.findIndex(
        x => x.id == node.data.id
      );
      if (index !== -1) {
        node.setSelected(true);
      }
    });
  }

  async actualizaClientesPorRol() {
    if (this.rolesAsignados.length > 0) {
      await this.getClientesPorTipoRol(this.rolesAsignados[0].id);
      if (this.clientesAsignadosResp.length > 0) {
        await this.seteaClientesAsignados();
      }
    }
  }

  async actualizaAsociacionFlotas(usuarioId: number) {
    await this.axios.http
      .post(`${this.controllerUsuario}/${usuarioId}/actualizaFlota/`)
      .then(res => {})
      .catch(error => {
        this.btnBloquear = false;
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      });
  }

  isExternalFilterPresentCliente(): boolean {
    return true;
  }

  doesExternalFilterPassCliente(node: RowNode): boolean {
    if (this.clientesRolRespaldo.length > 0 && this.buscarCliente.length > 1) {
      let busqueda = this.buscarCliente.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentRol(): boolean {
    return true;
  }

  doesExternalFilterPassRol(node: RowNode): boolean {
    if (this.rolesRespaldo.length > 0 && this.buscarRol.length > 1) {
      let busqueda = this.buscarRol.toLowerCase();
      return (
        node.data.name.toLowerCase().includes(busqueda) ||
        node.data.tipoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
select {
  margin: 50px;
  width: 150px;
  padding: 5px 35px 5px 5px;
  font-size: 16px;
  border: 1px solid #ccc;
  height: 34px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* CAUTION: IE hackery ahead */
select::-ms-expand {
  display: none; /* remove default arrow on ie10 and ie11 */
}

/* target Internet Explorer 9 to undo the custom arrow */
@media screen and (min-width: 0\0) {
  select {
    background: none\9;
    padding: 5px\9;
  }
}
</style>

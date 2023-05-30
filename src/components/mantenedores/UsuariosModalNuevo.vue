<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivU">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Usuario</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenuUsuarios()"
              :disabled="e1 <= 1"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenuUsuarios()"
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
              v-show="asociarRol.visible"
              :complete="e1 > asociarRol.step"
              :step="asociarRol.step"
              >Asociar Roles</v-stepper-step
            >
            <v-divider v-show="asociarRol.visible"></v-divider>
            <v-stepper-step
              v-show="asociarFlota.visible"
              :complete="e1 > asociarFlota.step"
              :step="asociarFlota.step"
              >Asociar Flotas</v-stepper-step
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
                        <v-layout row wrap>
                          <div align="left">
                            <v-flex md12>
                              <h2 class="h2_title">Información General</h2>
                            </v-flex>
                          </div>
                        </v-layout>
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
                            <!--<v-menu
                                                            :close-on-content-click="false"
                                                            v-model="menuDatePickerVigencia"
                                                            :nudge-right="40"
                                                            lazy
                                                            transition="scale-transition"
                                                            offset-y
                                                            full-width
                                                            max-width="290px"
                                                            min-width="290px"
                                                        >
                                                            <v-text-field
                                                                    slot="activator"
                                                                    v-model="computedDateFormattedVigencia"
                                                                    label="Fecha Inicio Vigencia"
                                                                    persistent-hint
                                                                    prepend-icon="event"
                                                                    readonly
                                                                    required
                                                            ></v-text-field>
                                                            <v-date-picker
                                                                    v-model="dateVigencia"
                                                                    first-day-of-week="1"
                                                                    locale="es-cl"
                                                                    scrollable
                                                                    :key="keyDatePickers"
                                                                    @input="menuDatePickerVigencia = false"
                                                            ></v-date-picker>
                            </v-menu>-->
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
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="selectedEstado"
                              :items="estados"
                              item-text="nombre"
                              item-value="id"
                              label="Estado"
                              v-validate="'required'"
                              :error-messages="errors.collect('estado')"
                              data-vv-name="estado"
                              :disabled="true"
                              v-show="false"
                              required
                            ></v-select>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content
              v-show="asociarRol.visible"
              :step="asociarRol.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md>
                      <v-layout row wrap>
                        <v-flex xs6>
                          <div align="left">
                            <h2 class="h2_title">Asociar Roles</h2>
                          </div>
                        </v-flex>
                        <v-flex xs6>
                          <div align="right" v-show="muestraBotonRoles">
                            <v-btn
                              v-if="!seleccionoTodos"
                              color="primary"
                              @click="marcarTodosRoles(true)"
                              >Seleccionar Todos</v-btn
                            >
                            <v-btn
                              v-else-if="seleccionoTodos"
                              color="primary"
                              @click="marcarTodosRoles(false)"
                              >Deseleccionar Todos</v-btn
                            >
                          </div>
                        </v-flex>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <div align="left">
                        <v-treeview
                          :items="roles"
                          v-model="rolesSeleccionados"
                          selectable
                          open-on-click
                          selected-color="indigo"
                        ></v-treeview>
                      </div>
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content
              v-show="asociarFlota.visible"
              :step="asociarFlota.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Flotas</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarFlotas"
                            prepend-icon="commute"
                            label="Buscar..."
                            @input="onFilterTextBoxChanged"
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
                              :columnDefs="columnDefsFlotas"
                              :rowData="flotasRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadyFlotas"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectionChanged($event)"
                              :getRowNodeId="getRowNodeIdEditar"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentFlota
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassFlota
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Usuario' })"
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

    <app-confirmacion
      :show="showModalRoles"
      :titulo="$t('mensajes.crud.sinAsociacion.titulo', { entidad: 'Rol' })"
      :mensaje="
        $t('mensajes.crud.sinAsociacion.mensaje', {
          entidad: 'Roles',
          entidadAsociada: 'Usuario.',
        })
      "
      v-on:modalConfirmationEmit="confirmCallbackMensajeRoles($event)"
      :textoBtnSi="$t('mensajes.crud.sinAsociacion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.sinAsociacion.btnCancelar')"
    ></app-confirmacion>

    <!-- VALIDA ROLES CLIENTES -->
    <div class="text-xs-center">
      <v-dialog v-model="showWarningRolesClientes" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Asociar Rol</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text
              >No es posible asociar los Roles seleccionados ya que han sido
              modificados.</v-card-text
            >
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="confirmCallbackRolesClientes()"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->
  </v-layout>
</template>

<script lang="ts">
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import {
  EstadoEntidad,
  ServicioProxy,
  TipoRol,
  TipoUsuario,
} from '@/config/enums';
import { Validator } from 'vee-validate';
import config from '@/config/index';
import ValidaRut from '@/config/validaRut';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { EstadoInterface } from '@/interfaces/Estado';
import { FlotaInterface } from '@/interfaces/Flota';
import { IClientes } from '@/interfaces/Clientes';
import { EstadosService } from '@/services/estadosService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import {
  CellContextMenuEvent,
  ColDef,
  ColumnApi,
  GridApi,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { RolesInterface } from '@/interfaces/Roles';
import { differenceBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
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
  objusuario!: UsuariosInterface;

  readonly funcionalidad: Funcionalidades = Funcionalidades.Usuarios;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarRol: PermisoAccionVm = {
    accion: 'Crear - Asociar a Rol',
    visible: true,
    step: 2,
    codigoSubAccion: 10,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarFlota: PermisoAccionVm = {
    accion: 'Crear - Asociar a Flota',
    visible: true,
    step: 3,
    codigoSubAccion: 24,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarRol,
    this.asociarFlota,
  ];

  readonly controllerUsuario: string = 'usuario';
  readonly controllerCuenta: string = 'cuenta';
  readonly controllerFlota: string = 'flota';
  readonly controllerClienteRol: string = 'clienterol';
  readonly controllerRol: string = 'Rol';
  readonly controllerCliente: string = 'cliente';

  //Variables globales
  $snotify: any;
  e1: number = 1;
  date: any = null;
  dateVigencia: any = null;
  selectedEstado: any = null;
  menuDatePicker: boolean = false;
  menuDatePickerVigencia: boolean = false;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  btnBloquear: boolean = false;
  search: string = '';
  buscarFlotas: string = '';

  vr: ValidaRut = new ValidaRut();
  estados: EstadoInterface[] = [];
  newItem: UsuariosInterface = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  clientesRules: any = [];

  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];
  clientesRespaldo: IClientes[] = [];

  flotasAsignadosModel: any = [];
  flotasAsignados: FlotaInterface[] = [];
  flotasRespaldo: FlotaInterface[] = [];

  loadingService = new LoadingService();

  //grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiFlotas: GridApi;
  columnApiFlotas: ColumnApi;
  columnDefsFlotas: Array<ColDef> = [];

  //roles
  rolesAsignadosModel: any = [];
  rolesAsignados: RolesInterface[] = [];
  rolesRespaldo: RolesInterface[] = [];
  rolesSeleccionados: any[] = [];
  seleccionoTodos: boolean = false;
  roles: any = [];
  muestraBotonRoles: boolean = true;
  showModalRoles: boolean = false;
  //flotas
  seleccionoTodosFlotas: boolean = false;

  keyDatePickers: number = 0;
  defaultDate: any = moment(new Date()).format('YYYY-MM-DD');
  flagDate: boolean = false;
  showWarningRolesClientes: boolean = false;
  guardaRoles: boolean = true;

  mounted() {
    this.initialize();
    const estadosClass: EstadosService = new EstadosService();
    this.estados = estadosClass
      .getEstados()
      .filter(x => x.id == 0 || x.id == 1);

    this.estados.sort(function(vote1, vote2) {
      if (vote1.nombre > vote2.nombre) return 1;
      if (vote1.nombre < vote2.nombre) return -1;
    });

    /*this.clientesRules = [
                (v: any) => !!v || config.errorMensajes.textoRequerido,
                (v: any) =>
                    this.validarAlMenosUnCliente() ||
                    "* Debe seleccionar al menos un Cliente"
            ];*/
  }

  /*validarAlMenosUnCliente(): boolean {
            if (this.e1 === 3) {
                return this.clientesAsignados.length > 0;
            }
            return true;
        }*/

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivU').scrollIntoView(true);
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuUsuarios(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }
  created() {
    this.chequearPermisos();

    let r = this.vr;
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

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.btnBloquear = false;
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.clientesAsignadosModel = [];
    this.clientesAsignados = [];
    this.flotasAsignadosModel = [];
    this.flotasAsignados = [];
    this.newItem.id = 0;
    this.dateVigencia = moment(new Date()).format('YYYY-MM-DD');
    this.rolesRespaldo = [];

    this.date = null;
    this.selectedEstado = 0;
    this.dialogConfirmacionClose = false;

    if (value) {
      try {
        this.loadingService.showLoading();
        this.seleccionoTodos = false;
        this.seleccionoTodosFlotas = false;
        this.rolesSeleccionados = [];
        await this.setClienteAsignado();
        await this.getClientesRol();
        await this.obtenerFlotas();
        //this.getClientesRolSelected();
      } finally {
        this.loadingService.hideLoading();
      }
      //flota base viene seleccionada por defecto al crear un usuario local
      const self = this;
      this.gridApiFlotas.forEachNode(function(node: any) {
        var index = self.flotasAsignadosModel.findIndex(
          (x: any) => x.id == node.data.id
        );
        if (index !== -1) {
          node.setSelected(true);
        }
      });
    }
  }

  /*onClienteChange(cliente: any) {
            if (cliente !== undefined && cliente.length !== this.clientesAsignados.length) {
                for (let x = this.clientesAsignados.length - 1; x >= 0; x--) {
                    let borrar = true;

                    for (let i = 0; i <= cliente.length - 1; i++) {
                        if (this.clientesAsignados[x].id == cliente[i]) {
                            borrar = false;
                        }
                    }

                    if (borrar) {
                        this.clientesAsignados.splice(x, 1);
                    }
                }
            }
        }*/

  /*onClienteInput(cliente: any) {
            if (cliente !== undefined) {
                for (let i = 0; i <= cliente.length - 1; i++) {
                    let added = this.clientesAsignados.filter(x => x.id == cliente[i]);

                    if (added.length === 0) {
                        const clienteAgregar = this.clientesRespaldo.find(
                            x => x.id == cliente[i]
                        );
                        this.clientesAsignados.push(clienteAgregar);
                    }
                }
            }
        }*/

  onFlotaChange(flota: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (flota !== undefined && flota.length !== this.flotasAsignados.length) {
      for (let x = this.flotasAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= flota.length - 1; i++) {
          if (this.flotasAsignados[x].id == flota[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.flotasAsignados.splice(x, 1);
        }
      }

      if (this.flotasAsignados.length === this.flotasRespaldo.length)
        this.seleccionoTodosFlotas = true;
      else this.seleccionoTodosFlotas = false;
    }
  }

  onFlotaInput(flota: any) {
    if (flota !== undefined) {
      for (let i = 0; i <= flota.length - 1; i++) {
        let added = this.flotasAsignados.filter(x => x.id == flota[i]);

        if (added.length === 0) {
          let flotaAgregar = this.flotasRespaldo.find(x => x.id == flota[i]);
          this.flotasAsignados.push(flotaAgregar);

          if (this.flotasAsignados.length === this.flotasRespaldo.length)
            this.seleccionoTodosFlotas = true;
          else this.seleccionoTodosFlotas = false;
        }
      }
    }
  }

  marcarTodosFlotas(value: boolean) {
    this.flotasAsignados = [];
    this.flotasAsignadosModel = [];
    if (value) {
      this.flotasRespaldo.forEach((flota: any) => {
        this.flotasAsignados.push(flota);
        this.flotasAsignadosModel.push(flota.id);
      });
    }
    this.seleccionoTodosFlotas = value;
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
      document.getElementById('cardDivU').scrollIntoView(true);
      if (this.e1 === this.permisosActuales.length) {
        this.btnBloquear = true;
        this.dialogConfirmacion = true;
      } else if (this.e1 === this.permisosActuales.length - 1) {
        this.e1 += 1;
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
      } else {
        this.e1 += 1;
        if (this.e1 === 2) {
          if (this.rolesRespaldo.length > 0) {
            this.muestraBotonRoles = true;
            this.getClientesRolSelected();
          } else {
            this.muestraBotonRoles = false;
            this.showModalRoles = true;
          }
        }
      }
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivU').scrollIntoView(true);
    this.$validator.reset();
    this.btnBloquear = false;
    this.newItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.keyDatePickers += 1;
    this.buscarFlotas = '';
    this.gridApiFlotas.setQuickFilter('');
    this.roles = []; //Limpiar TreeView
    this.rolesSeleccionados = []; //Limpiar seleccion TreeView
    this.clientesAsignados = []; //Limpiar listado de Clientes
    this.rolesRespaldo = []; //Limpiar listado de Roles
    this.guardaRoles = true; //Limpiar la Validacion ClienteRol
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onGridReadyFlotas(params: GridReadyEvent) {
    this.gridApiFlotas = params.api;
    this.columnApiFlotas = params.columnApi;
  }

  async obtenerFlotas() {
    try {
      const response = await this.axiosVehiculo.http.get(this.controllerFlota);
      const clienteId = config.getClienteSesion();
      response.data.forEach((flota: FlotaInterface) => {
        if (
          flota.estado === EstadoEntidad.Activo ||
          flota.estado === EstadoEntidad.Sistema
        )
          flota.estadoTxt = 'Activo';
        else flota.estadoTxt = 'Inactivo';

        if (flota.descripcion === null) {
          flota.descripcion = '';
        }
      });
      this.flotasRespaldo = response.data.filter(
        (x: any) =>
          x.clienteId == clienteId &&
          (x.estado == EstadoEntidad.Activo ||
            x.estado == EstadoEntidad.Sistema)
      );
      //Flota por Defecto Seleccionada
      this.flotasAsignados = this.flotasRespaldo.filter(
        (x: any) => x.estado == EstadoEntidad.Sistema
      );
      this.flotasAsignadosModel = this.flotasAsignados;
      //---
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener Flotas.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener Flotas.');
      }
    }
  }

  async getClientesRol() {
    try {
      //Roles Transverales Cliente - Tipo Cliente
      const clienteId = config.getClienteSesion();
      const resT = await this.axiosCliente.http.get(
        `${this.controllerClienteRol}/RolesPorCliente`
      );
      this.rolesRespaldo = resT.data;

      //Roles Locales Cliente
      const resL = await this.axios.http.get(this.controllerRol);
      let rolesL = resL.data;
      if (rolesL.length > 0) {
        let rolesLocales = rolesL.filter(
          (x: any) => x.tipo == TipoRol.Local && x.clienteId == clienteId
        );
        rolesLocales.forEach((rol: any) => {
          let model: any = {
            estado: rol.estado,
            id: rol.clienteId,
            nombre: rol.name,
            rolId: rol.id,
            tipo: rol.tipo,
          };
          this.rolesRespaldo.push(model);
        });
      }

      this.loadingService.hideLoading();
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los Roles de los Cliente Seleccionados.'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los Roles de los Cliente Seleccionados.'
        );
      }
    }
  }

  async setClienteAsignado() {
    try {
      this.clientesAsignados = [];
      const clienteId = config.getClienteSesion();
      const resCliente = await this.axiosCliente.http.get(
        `${this.controllerCliente}`
      );
      if (resCliente.data.length > 0) {
        let itemCliente = resCliente.data.filter(
          (x: any) => x.id === clienteId
        );
        if (itemCliente !== null) {
          let modelCliente = {
            id: clienteId,
            nombre: itemCliente[0].nombre,
          };
          this.clientesAsignados.push(modelCliente);
        }
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los Roles del Cliente seleccionado.'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los Roles del Cliente seleccionado.'
        );
      }
    }
  }

  getClientesRolSelected() {
    var indexNegativo: number = -1;
    var indexPositivo: number = 1;
    var tview: any = [];
    this.clientesAsignados.forEach(cliente => {
      tview.push({
        id: indexNegativo,
        clienteId: cliente.id,
        name: cliente.nombre,
        children: [],
        roles: this.rolesRespaldo.filter((x: any) => x.id == cliente.id),
      });
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
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      await this.validarAsociacionesRoles();
    }
    this.btnBloquear = false;
  }

  async nuevo() {
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
      Tipo: TipoUsuario.Local,
    };

    try {
      this.loadingService.showLoading();

      const response = await this.axios.http.post(
        this.controllerUsuario,
        model
      );
      const usuarioId = response.data.id;

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

      const modelMail = {
        EncodeIdUsuario: btoa(response.data.id.toString()),
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

      await this.grabarAsociacionesClientes(usuarioId);
      if (this.guardaRoles) {
        await this.grabarAsociacionesRoles(usuarioId);
      }
      await this.grabarAsociacionesFlotas(usuarioId);

      try {
        await this.axiosAuth.http.post(`Email/CreacionUsuario`, modelMail);
      } catch (error) {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.warning('Ocurrió un error al enviar el correo.');
          }
        } else {
          this.$snotify.warning('Ocurrió un error al enviar el correo.');
        }
      }
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.crear', {
          entidad: 'Usuario',
          creadoA: 'creado',
        })
      );

      this.closeModal(false);
      this.dialogConfirmacion = false;
    } catch (error) {
      this.loadingService.hideLoading();
      this.btnBloquear = false;
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
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

  confirmCallbackMensajeRoles(val: boolean) {
    this.showModalRoles = false;
  }

  async grabarAsociacionesClientes(usuarioId: number) {
    try {
      let model: any = [];
      const clienteId = config.getClienteSesion();
      model.push({
        Id: 0,
        ClienteId: clienteId,
        UsuarioID: usuarioId,
        FechaInicioAsociacion: new Date(),
        FechaFinAsociacion: new Date(new Date().getFullYear() + 1, 12, 12),
      });

      await this.axios.http.post(
        `${this.controllerUsuario}/${usuarioId}/cliente/`,
        model
      );
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
        );
      }
    }
    this.btnBloquear = false;
  }

  async grabarAsociacionesRoles(usuarioId: number) {
    try {
      const clienteId = config.getClienteSesion();
      if (this.rolesSeleccionados.length > 0) {
        let index = 0;
        let model: any = [];
        this.roles.forEach((cliente: any) => {
          cliente.children.forEach((rol: any) => {
            var item = this.rolesSeleccionados.filter(x => x === rol.id);
            if (item.length > 0) {
              model.push({
                ClienteId: cliente.clienteId,
                RoleId: rol.rolId,
              });
            }
          });
        });
        await this.axios.http.post(
          `${this.controllerUsuario}/${usuarioId}/clienterol/`,
          model
        );
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
        );
      }
    }
    this.btnBloquear = false;
  }

  async grabarAsociacionesFlotas(usuarioId: number) {
    try {
      this.flotasAsignados.forEach(async (flota: FlotaInterface) => {
        await this.axiosVehiculo.http.post(
          `${this.controllerFlota}/${flota.id}/usuario/${usuarioId}`
        );
      });
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Usuario' })
        );
      }
      this.btnBloquear = false;
    }
  }

  async validarAsociacionesRoles() {
    try {
      const clienteId = config.getClienteSesion();
      if (this.rolesSeleccionados.length > 0) {
        let index = 0;
        let model: any = [];
        this.roles.forEach((cliente: any) => {
          cliente.children.forEach((rol: any) => {
            var item = this.rolesSeleccionados.filter(x => x === rol.id);
            if (item.length > 0) {
              model.push({
                ClienteId: cliente.clienteId,
                RoleId: rol.rolId,
              });
            }
          });
        });
        await this.axios.http.post(
          `${this.controllerUsuario}/validaclienterol/`,
          model
        );
        this.guardaRoles = true;
        this.nuevo();
      } else {
        this.guardaRoles = true;
        this.nuevo();
      }
    } catch (error) {
      this.loadingService.hideLoading();
      this.guardaRoles = false;
      this.showWarningRolesClientes = true;
      //console.clear();
    }
  }

  /*createButtonCell(params: any) {
            const item = this.clientesRespaldo.find(x => x.id == params.data.id);

            let eButton = document.createElement("button");
            eButton.setAttribute("id", "btnU" + params.data.id);
            eButton.setAttribute("title", "Remover");
            eButton.setAttribute("class", "v-btn v-btn--flat v-btn--icon theme--light");
            eButton.innerHTML =
                '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

            eButton.addEventListener("click", () => {
                this.removerClientesAsignacion(item);
            });

            return eButton;
        }*/

  /*removerClientesAsignacion(item: IClientes) {
            for (let i = 0; i <= this.clientesAsignados.length - 1; i++) {
                if (this.clientesAsignados[i].id == item.id) {
                    this.clientesAsignados.splice(i, 1);
                    break;
                }
            }

            for (let i = 0; i <= this.clientesAsignadosModel.length - 1; i++) {
                if (this.clientesAsignadosModel[i] == item.id) {
                    this.clientesAsignadosModel.splice(i, 1);
                    break;
                }
            }
        }*/

  createButtonCellFlotas(params: any) {
    const item = this.flotasRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerFlotasAsignacion(item);
    });

    return eButton;
  }

  removerFlotasAsignacion(item: FlotaInterface) {
    for (let i = 0; i <= this.flotasAsignados.length - 1; i++) {
      if (this.flotasAsignados[i].id == item.id) {
        this.flotasAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.flotasAsignadosModel.length - 1; i++) {
      if (this.flotasAsignadosModel[i] == item.id) {
        this.flotasAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.flotasAsignados.length === this.flotasRespaldo.length)
      this.seleccionoTodosFlotas = true;
    else this.seleccionoTodosFlotas = false;
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

  limpiaValidacionFecha() {
    //this.date = this.defaultDate;
    //this.flagDate = true;
    this.date = null;
    this.flagDate = false;
  }

  initialize() {
    /*this.columnDefs = [
                {
                    headerName: "Código",
                    field: "id",
                    sortable: true,
                    resizable: true,
                    hide: true,
                    minWidth: 80,
                    cellStyle: {textAlign: "left"}
                },
                {
                    headerName: "Nombre",
                    field: "nombre",
                    sortable: true,
                    minWidth: 80,
                    resizable: true,
                    lockPinned: true,
                    cellStyle: {textAlign: "left"}
                },
                {
                    headerName: "Estado",
                    field: "estado",
                    sortable: true,
                    minWidth: 80,
                    resizable: true,
                    lockPinned: true,
                    cellRenderer: (r: any) => {
                        if (r.data.estado === EstadoEntidad.Sistema)
                            return EstadoEntidad[EstadoEntidad.Activo];
                        else
                            return EstadoEntidad[r.data.estado];
                    },
                    cellStyle: {textAlign: "left"}
                },
                {
                    headerName: "Desasociar",
                    cellRenderer: this.createButtonCell,
                    enablePivot: false,
                    filter: false,
                    minWidth: 80,
                    suppressMovable: true,
                    resizable: false,
                    sortable: false,
                    lockVisible: true,
                    pinned: "right",
                    cellStyle: {textAlign: "left"}
                }
            ];*/

    this.columnDefsFlotas = [
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
        minWidth: 80,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        sortable: true,
        resizable: true,
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
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        resizable: true,
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
        // cellRenderer: (r: any) => {
        //   if (r.data.estado === EstadoEntidad.Sistema)
        //     return EstadoEntidad[EstadoEntidad.Activo];
        //   else return EstadoEntidad[r.data.estado];
        // },
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Desasociar',
      //   cellRenderer: this.createButtonCellFlotas,
      //   enablePivot: false,
      //   filter: false,
      //   minWidth: 80,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
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

  isExternalFilterPresentFlota(): boolean {
    return true;
  }

  doesExternalFilterPassFlota(node: RowNode): boolean {
    if (this.flotasRespaldo.length > 0 && this.buscarFlotas.length > 1) {
      let busqueda = this.buscarFlotas.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
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

    const lcLetters = 'abcdefghijklmnopqrstuvwxyz';
    const ucLetters = lcLetters.toUpperCase();
    const numbers = '0123456789';
    const special = '.';

    const getRand = function(values: any) {
      return values.charAt(Math.floor(Math.random() * values.length));
    };

    function shuffle(o: any) {
      //v1.0
      for (
        let j, x, i = o.length;
        i;
        j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
      );
      return o;
    }

    let pass = [];
    for (let i1 = 0; i1 < numLc; ++i1) {
      pass.push(getRand(lcLetters));
    }

    for (let i2 = 0; i2 < numUc; ++i2) {
      pass.push(getRand(ucLetters));
    }

    for (let i3 = 0; i3 < numDigits; ++i3) {
      pass.push(getRand(numbers));
    }

    for (let i4 = 0; i4 < numSpecial; ++i4) {
      pass.push(getRand(special));
    }

    return shuffle(pass).join('');
  }
  onFilterTextBoxChanged() {
    this.gridApiFlotas.onFilterChanged();
    // if (this.buscarFlotas.length > 1) {
    //   this.gridApiFlotas.setQuickFilter(this.buscarFlotas);
    // } else {
    //   this.gridApiFlotas.setQuickFilter('');
    // }
  }
  async onSelectionChanged() {
    await this.ordenarGrillaFlotas();
    this.flotasAsignados = this.gridApiFlotas.getSelectedRows();
  }

  ordenarGrillaFlotas() {
    const flotasSeleccionados = this.gridApiFlotas
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const flotasNoSeleccionados = differenceBy(
      this.flotasRespaldo,
      flotasSeleccionados,
      flota => flota.id
    ).map(flota => ({
      ...flota,
      checked: false,
    }));
    this.gridApiFlotas.updateRowData({
      update: [...flotasNoSeleccionados, ...flotasSeleccionados],
    });
  }

  getRowNodeIdEditar(flota: FlotaInterface) {
    if (!flota) {
      return;
    }
    return flota.id;
  }

  async confirmCallbackRolesClientes() {
    this.showWarningRolesClientes = false;
    this.nuevo();
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
    background: none \9;
    padding: 5px \9;
  }
}
</style>

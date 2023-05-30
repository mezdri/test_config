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
            {{
              esEdicion
                ? 'Editar Usuario Transversal'
                : 'Ver Detalle Usuario Transversal'
            }}
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
                @click="
                  cierraMenuUsuariosTransversales(informacionGeneral.step)
                "
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
                @click="cierraMenuUsuariosTransversales(asociarRoles.step)"
                color="primary"
                flat
                v-show="
                  (asociarRoles.visible && esEdicion) ||
                    (asociarRolesVerDetalle.visible && !esEdicion)
                "
                :value="asociarRoles.step"
              >
                <span>Asociar Rol</span>
                <v-icon>person_add</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenuUsuariosTransversales(asociarClientes.step)"
                color="primary"
                flat
                v-show="
                  (asociarClientes.visible && esEdicion && !esTipoOperacion) ||
                    (asociarClientesVerDetalle.visible &&
                      !esEdicion &&
                      !esTipoOperacion)
                "
                :value="asociarClientes.step"
              >
                <span>Asociar Clientes</span>
                <v-icon>person</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>

          <!-- INFORMACION GENERAL -->
          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((esEdicion && informacionGeneral.visible) ||
                  (!esEdicion && informacionGeneralVerDetalle.visible))
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
                    <br />
                    <v-layout wrap>
                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          v-validate="'required'"
                          v-model="usuario.id"
                          :error-messages="errors.collect('id')"
                          data-vv-name="id"
                          label="Código"
                          type="text"
                          :disabled="true"
                          required
                        ></v-text-field>
                      </v-flex>
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
                          :disabled="true"
                          v-validate="{
                            rules: {
                              required: true,
                              max: 200,
                              email: true,
                              emailExiste: true,
                              regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                            },
                          }"
                          v-model="usuario.email"
                          :error-messages="errors.collect('email')"
                          data-vv-name="email"
                          :counter="200"
                          label="Correo Electrónico"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          :disabled="!esEdicion"
                          v-validate="'required|rut|rutFormato|max:10'"
                          v-model="usuario.rut"
                          :error-messages="errors.collect('rut')"
                          data-vv-name="rut"
                          :counter="10"
                          label="Rut (Ej. 11111111-1)"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          :disabled="!esEdicion"
                          v-validate="'required|max:80|alpha_spaces'"
                          v-model="usuario.nombre"
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
                          :disabled="!esEdicion"
                          v-validate="'required|max:80|alpha_spaces'"
                          v-model="usuario.apellidoPaterno"
                          :error-messages="errors.collect('apellidoPaterno')"
                          data-vv-name="apellidoPaterno"
                          label="Apellido Paterno"
                          :counter="80"
                          type="text"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          :disabled="!esEdicion"
                          v-validate="'max:80|alpha_spaces'"
                          v-model="usuario.apellidoMaterno"
                          :error-messages="errors.collect('apellidoMaterno')"
                          data-vv-name="apellidoMaterno"
                          :counter="80"
                          label="Apellido Materno"
                          type="text"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-menu
                          :disabled="!esEdicion"
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
                            :disabled="!esEdicion"
                            :error-messages="errors.collect('fechaNacimiento')"
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
                          :disabled="!esEdicion"
                          v-validate="'max:60'"
                          v-model="usuario.direccion"
                          :error-messages="errors.collect('direccion')"
                          data-vv-name="direccion"
                          label="Dirección"
                          :counter="60"
                          type="text"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          :disabled="!esEdicion"
                          v-validate="{ max: 11, regex: /^(56)[0-9]\d{8}$/ }"
                          v-model="usuario.telefonoFijo"
                          :error-messages="errors.collect('telefonoFijo')"
                          data-vv-name="telefonoFijo"
                          label="Teléfono Fijo"
                          :placeholder="textoPlaceholder('Fijo')"
                          :counter="11"
                          type="tel"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          :disabled="!esEdicion"
                          v-validate="{ max: 11, regex: /^(569)[0-9]\d{7}$/ }"
                          v-model="usuario.telefonoParticular"
                          :error-messages="errors.collect('telefonoParticular')"
                          data-vv-name="telefonoParticular"
                          label="Teléfono Celular"
                          :placeholder="textoPlaceholder('Celular')"
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

          <!-- ASOCIAR ROLES -->
          <div
            align="center"
            v-show="
              bottomNav == asociarRoles.step &&
                ((esEdicion && asociarRoles.visible) ||
                  (!esEdicion && asociarRolesVerDetalle.visible))
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
                        :disabled="!esEdicion"
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
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReadyRoles"
                          :postProcessPopup="onClickCell"
                          @selection-changed="
                            onSelectionChangedRolesEditar($event)
                          "
                          :getRowNodeId="getRowNodeIdRol"
                          suppressCopyRowsToClipboard="true"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="isExternalFilterPresentRol"
                          :doesExternalFilterPass="doesExternalFilterPassRol"
                        ></ag-grid-vue>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
          </div>

          <!-- ASOCIAR CLIENTES -->
          <div
            align="center"
            v-show="
              bottomNav == asociarClientes.step &&
                ((esEdicion && asociarClientes.visible) ||
                  (!esEdicion && asociarClientesVerDetalle.visible))
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
                        <h2 class="h2_title">Asociar Clientes</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarCliente"
                        prepend-icon="person"
                        append-icon="search"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
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
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReadyClientes"
                          :postProcessPopup="onClickCell"
                          @selection-changed="
                            onSelectionChangedClientesEditar($event)
                          "
                          :getRowNodeId="getRowNodeIdCliente"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Usuario',
          nombreEntidad: usuario.nombre + ' ' + usuario.apellidoPaterno,
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

    <!-- SELECCION ROL MODIFICADO -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaRolModificado" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              {{
                $t('mensajes.crud.editar.titulo', {
                  entidad: 'Usuario',
                  nombreEntidad: usuario.nombre + ' ' + usuario.apellidoPaterno,
                })
              }}
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text>
              Favor verificar que los Clientes asociados, al nuevo Rol, sean los
              correctos
            </v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="confirmCallbackRolModificado(true)"
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
import { RolesInterface } from '@/interfaces/Roles';
import { EstadoInterface } from '@/interfaces/Estado';
import { IClientes } from '@/interfaces/Clientes';
import { EstadosService } from '@/services/estadosService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoRol } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { differenceBy } from 'lodash';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class UsuariosModalEdicion extends ComponenteBaseStepper {
  @Prop({
    default: false,
  })
  show!: boolean;
  @Prop({
    default: false,
  })
  esEdicion!: boolean;
  @Prop({
    default: () => ({
      id: 0,
      nombre: '',
      estado: EstadoEntidad.Activo,
    }),
  })
  usuario!: UsuariosInterface;

  readonly controllerUsuario: string = 'usuario';
  readonly controllerCuenta: string = 'cuenta';
  readonly controllerFlota: string = 'flota';
  readonly controllerCliente: string = 'cliente';
  readonly controllerRol: string = 'rol';
  readonly controllerClienteRol: string = 'clienterol';

  //Variables globales
  showTreeView: boolean = false;
  $snotify: any;
  bottomNav: any = '1';
  date: any = null;
  dateVigencia: any = null;
  selectedEstado: any = null;
  estados: EstadoInterface[] = [];
  repitaPass: string = '';
  menuDatePicker: Boolean = false;
  menuDatePickerVigencia: Boolean = false;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  btnBloquear: boolean = false;
  validForm: boolean = false;
  vr: ValidaRut = new ValidaRut();
  newItem: UsuariosInterface = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  clientesRules: any = [];
  search: string = '';
  buscarCliente: string = '';
  contadorEventoGrillaCliente: number = 0;
  contadorEventoGrillaSelectionCliente: number = 0;
  contadorEventoGrillaRol: number = 0;
  contadorEventoGrillaSelectionRol: number = 0;
  idkey: number = 0;
  clienteId: number = config.getClienteSesion();
  auxMounted: boolean = false;
  loadingService = new LoadingService();

  clientesAsignadosModel: any = [];
  clientesAsignados: any[] = [];
  clientesAsignadosResp: any[] = [];
  clientesAsignadosAux: any[] = [];

  rolesAsignadosModel: any = [];

  rolesAsignadosResp: RolesInterface[] = [];
  rolesRespaldo: RolesInterface[] = [];
  rolesRespaldoAll: RolesInterface[] = [];
  seleccionHome: boolean = false;
  selectedHome: any = null;
  homes: any = [];

  //grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApiClientes: GridApi;
  columnApiClientes: ColumnApi;
  columnDefsClientes: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiRoles: GridApi;
  columnApiRoles: ColumnApi;
  columnDefsRoles: Array<ColDef> = [];

  seleccionoTodos: boolean = false;
  roltree: any = [];

  clienteRolAsignadosModel: any = [];
  clienteRolAsignados: any[] = [];
  clienteRolRespaldo: any[] = [];
  rolesSeleccionados: any[] = [];
  roles: any = [];
  seleccionoTodosClientes: boolean = false;

  mostrarBtnSeleccionarAsociarRoles: boolean = false;

  keyDatePickers: number = 0;
  defaultDate: any = moment(new Date()).format('YYYY-MM-DD');
  flagDate: boolean = false;

  tiposRol: any = [];
  selectedTipoRol: any = null;
  esTipoOperacion: boolean = true;
  buscarRol: string = '';

  rolesAsignados: any[] = [];
  rolesAsignadosAux: any[] = [];
  clientesRolRespaldo: any[] = [];
  selectedRolAux: number = 0;
  showAlertaRolModificado: boolean = false;
  numStep: number = 0;
  selectedTipoRolAux: number = 0;

  //permisos
  funcionalidad: Funcionalidades = Funcionalidades.UsuariosTransversal;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarRoles: PermisoAccionVm = {
    accion: 'Editar - Asociar Roles',
    visible: true,
    step: 2,
    codigoSubAccion: 26,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarClientes: PermisoAccionVm = {
    accion: 'Editar - Asociar Clientes',
    visible: true,
    step: 3,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarRolesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Roles',
    visible: true,
    step: 2,
    codigoSubAccion: 26,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarClientesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Clientes',
    visible: true,
    step: 3,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarRoles,
    this.asociarClientes,
    this.informacionGeneralVerDetalle,
    this.asociarRolesVerDetalle,
    this.asociarClientesVerDetalle,
  ];

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuUsuariosTransversales(step: any) {
    this.numStep = step;
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }
  async mounted() {
    await this.initialize();
    const estadosClass: EstadosService = new EstadosService();
    this.estados = estadosClass
      .getEstados()
      .filter(x => x.id == 0 || x.id == 1);

    this.estados.sort(function(vote1, vote2) {
      if (vote1.nombre > vote2.nombre) return 1;
      if (vote1.nombre < vote2.nombre) return -1;
    });

    this.clientesRules = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) =>
        this.validaAlMenosUnCliente() ||
        '* Debe seleccionar al menos un Cliente',
    ];
  }

  validaAlMenosUnCliente(): boolean {
    return this.clientesAsignados.length > 0;
  }

  created() {
    var r = this.vr;
    const self = this;

    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.Rut(value),
            data: r.Rut(value)
              ? undefined
              : {
                  message: '* Rut inválido',
                },
          });
        });
      },
    });

    Validator.extend('rutFormato', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Formato de Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFormatoRut(value),
            data: r.validaFormatoRut(value)
              ? undefined
              : { message: '* Formato de Rut inválido' },
          });
        });
      },
    });

    Validator.extend('emailExiste', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) || '* Correo Electrónico se encuentra en uso'
        );
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.controllerCuenta}/nombreUsuario?email=${value}`)
          .then(response => {
            return false;
          })
          .catch(err => {
            return true;
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

  @Watch('bottomNav')
  async onPropertyChangedNav(value: boolean, oldValue: boolean) {}

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.clientesAsignadosModel = [];
    this.clientesAsignados = [];
    this.clientesAsignadosAux = [];
    this.rolesSeleccionados = [];
    this.rolesAsignados = [];
    this.clientesAsignadosResp = [];
    this.esTipoOperacion = true;
    this.date =
      this.usuario.fechaNacimiento !== null
        ? moment(this.usuario.fechaNacimiento).format('YYYY-MM-DD')
        : null;
    this.dateVigencia = moment(this.usuario.fechaInicioVigencia).format(
      'YYYY-MM-DD'
    );
    this.selectedEstado = this.usuario.estado;
    this.bottomNav = '1';

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.btnBloquear = false;
      this.getTipoRol();
      this.selectedHome = this.usuario.homePath;
      await this.getRoles();
      if (this.usuario.id > 0) {
        let usuarioId = this.usuario.id;
        await this.obtenerRolesAsignados(usuarioId);
        if (!this.esTipoOperacion)
          await this.obtenerClientesAsignados(usuarioId);
      }
      await this.seteaAsignados();

      this.initialize();
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

  async obtenerClientesAsignados(usuarioId: number) {
    try {
      this.loadingService.showLoading();
      const response = await this.axios.http.get(
        `${this.controllerUsuario}/${usuarioId}/cliente/`
      );
      if (response.data.length > 0) {
        this.clientesAsignadosAux = response.data;
        this.clientesAsignados = response.data;
        this.clientesAsignadosResp = Object.assign([], this.clientesAsignados);

        if (!this.esEdicion) {
          this.clientesRolRespaldo = this.clientesAsignados;
          this.clientesAsignadosResp = Object.assign(
            [],
            this.clientesRolRespaldo
          );
        }
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los clientes asignados.'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los clientes asignados.'
        );
      }
    }
  }

  async seteaAsignados() {
    if (!this.esEdicion) {
      this.rolesRespaldo = this.gridApiRoles.getSelectedRows();
    }
  }

  async obtenerRolesAsignados(usuarioId: number) {
    try {
      const response = await this.axios.http.get(
        `${this.controllerUsuario}/${usuarioId}/clienterol/`
      );
      if (response.data.length > 0) {
        this.rolesAsignados = response.data;
        this.rolesAsignadosAux = response.data;
        this.selectedTipoRol = this.rolesAsignados[0].tipo;
        this.selectedTipoRolAux = this.selectedTipoRol;
        await this.seteaTipoRolAsignado();
        await this.seteaRolesAsignados();
      } else {
        this.auxMounted = true;
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los roles asignados.'
          );
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener los roles asignados.');
      }
    }
  }

  async seteaRolesAsignados() {
    const self = this;
    this.gridApiRoles.forEachNode(async function(node: any) {
      var index = self.rolesAsignados.findIndex(x => x.rolId == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        self.contadorEventoGrillaRol++;
        self.selectedRolAux = node.data.id;
        await self.getClientesPorTipoRol(node.data.id);
      }
    });
  }

  async seteaTipoRolAsignado() {
    if (this.selectedTipoRol === TipoRol.Operación) {
      this.esTipoOperacion = true;
    } else {
      this.esTipoOperacion = false;
    }

    this.rolesRespaldo = this.rolesRespaldoAll.filter(
      (x: any) => x.tipo === this.selectedTipoRol
    );
  }

  async seteaClientesAsignados() {
    const self = this;
    this.gridApiClientes.forEachNode(function(node: any) {
      var index = self.clientesAsignadosResp.findIndex(
        x => x.id == node.data.id
      );
      if (index !== -1) {
        node.setSelected(true);
        self.contadorEventoGrillaCliente++;
      }
    });
    setTimeout(() => {
      this.loadingService.hideLoading();
    }, 1000);
  }

  async getClientesRol() {
    try {
      const response = await this.axiosClientes.http.get(
        `${this.controllerClienteRol}/getClientesRoles`
      );
      if (response.data.length > 0) {
        this.rolesRespaldo = JSON.parse(response.data);
      }
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

  grabarEdicion() {
    var formVal: any = this.$refs;
    this.$validator.validateAll().then(res => {
      if (res) {
        if (formVal.form.validate()) {
          if (this.rolesAsignados.length > 0 && this.selectedRolAux !== 0) {
            if (this.rolesAsignados[0].id !== this.selectedRolAux) {
              if (
                !this.esTipoOperacion &&
                this.numStep === this.asociarRoles.step
              ) {
                this.selectedRolAux = 0; //this.rolesAsignados[0].id;
                this.bottomNav = this.asociarClientes.step;
                this.showAlertaRolModificado = true;
              } else {
                this.dialogConfirmacion = true;
                this.btnBloquear = true;
              }
            } else {
              this.dialogConfirmacion = true;
              this.btnBloquear = true;
            }
          } else {
            this.selectedRolAux = 0;
            this.dialogConfirmacion = true;
            this.btnBloquear = true;
          }
        } else {
          this.bottomNav = '2';
        }
      }
    });
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.$validator.reset();
    this.showTreeView = false;
    this.btnBloquear = false;
    this.newItem = {};
    this.auxMounted = false;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarRol = '';
    this.buscarCliente = '';
    this.gridApiRoles.setQuickFilter('');
    this.gridApiClientes.setQuickFilter('');
    this.contadorEventoGrillaSelectionCliente = 0;
    this.contadorEventoGrillaCliente = 0;
    this.contadorEventoGrillaSelectionRol = 0;
    this.contadorEventoGrillaRol = 0;
    this.rolesSeleccionados = [];
    this.numStep = 0;
    this.selectedTipoRol = null;
    this.selectedRolAux = 0;
    this.selectedTipoRolAux = 0;
    this.rolesAsignados = [];
    this.rolesRespaldo = [];
    this.clientesAsignados = [];
    this.clientesAsignadosAux = [];
    this.clientesRolRespaldo = [];
    this.clientesAsignadosResp = [];
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

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.loadingService.showLoading();
      this.btnBloquear = true;

      this.usuario.fechaNacimiento =
        this.date === undefined ||
        this.date === null ||
        this.date === this.defaultDate
          ? null
          : new Date(this.date);
      this.usuario.fechaInicioVigencia = moment(this.dateVigencia)
        .add(30, 'm')
        .toDate();
      this.usuario.estado = this.selectedEstado;
      this.usuario.apellidoMaterno =
        this.usuario.apellidoMaterno == undefined
          ? ''
          : this.usuario.apellidoMaterno;
      this.usuario.homePath = this.selectedHome;
      await this.axios.http
        .put(this.controllerUsuario, this.usuario)
        .then(async res => {
          //Valida que haya cambio de Clientes
          this.clientesAsignados = this.gridApiClientes.getSelectedRows(); //En caso que el usuario no haga cambios en la grilla de clientes
          var idsActuales = this.clientesAsignadosAux.map(x => x.id);
          var idsNuevos = this.clientesAsignados.map(x => x.id);
          let difference = idsActuales
            .filter(x => !idsNuevos.includes(x))
            .concat(idsNuevos.filter(x => !idsActuales.includes(x)));
          //---

          //Guardo roles y/o clientes sólo si ha modificaciones, si quito roles, elimino roles y clientes
          if (this.rolesAsignados.length > 0) {
            if (
              this.rolesAsignados[0].id !== this.selectedRolAux ||
              difference.length > 0
            ) {
              await this.actualizaAsociacionRolesClientes();
            }
          } else {
            await this.eliminaAsociadosClientes();
            await this.actualizaAsociacionFlotas();
            await this.actualizaClientesEstadoUi();
            await this.eliminaAsociadosRoles();
          }
          //---

          // cerrar sesion de usuarios
          await this.cerrarSesionUsuarios();

          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.closeModal(false);
          this.dialogConfirmacion = false;
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.btnBloquear = false;
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.loadingService.hideLoading();
            }
          } else {
            this.loadingService.hideLoading();
          }
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

  async eliminaAsociadosClientes() {
    let model: any = [];

    model.push({
      Id: 0,
      ClienteId: this.clienteId,
      UsuarioId: this.usuario.id,
    });

    if (model.length > 0) {
      await this.axios.http
        .delete(`${this.controllerUsuario}/${this.usuario.id}/cliente/`, {
          data: model,
        })
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
  }

  async grabarAsociacionesClientes() {
    let model: any = [];

    if (this.clientesRolRespaldo.length === 0) {
      this.clientesAsignados = [];
    }

    if (this.clientesAsignados.length > 0) {
      model = this.clientesAsignados.map(cli => ({
        Id: 0,
        ClienteId: cli.id,
        UsuarioId: this.usuario.id,
      }));
    } else {
      if (this.esTipoOperacion) {
        if (this.rolesAsignados.length > 0) {
          model.push({
            Id: 0,
            ClienteId: this.clienteId,
            UsuarioId: this.usuario.id,
          });
        }
      }
    }

    if (model.length > 0) {
      await this.axios.http
        .post(`${this.controllerUsuario}/${this.usuario.id}/cliente/`, model)
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
  }

  async eliminaAsociadosRoles() {
    await this.axios.http
      .delete(
        `${this.controllerUsuario}/${this.usuario.id}/deleteRolesCliente/`
      )
      .then(res => {})
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
        this.btnBloquear = false;
      });
  }

  async grabarAsociacionesRoles() {
    if (this.rolesAsignados.length > 0) {
      let model: any = [];
      if (this.clientesAsignados.length > 0) {
        model = this.clientesAsignados.map(cli => ({
          ClienteId: cli.id,
          RoleId: this.rolesAsignados[0].id,
        }));
      } else {
        model.push({
          ClienteId: 0,
          RoleId: this.rolesAsignados[0].id,
        });
      }

      await this.axios.http
        .post(`${this.controllerUsuario}/${this.usuario.id}/clienterol/`, model)
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
  }

  async actualizaAsociacionFlotas() {
    await this.axios.http
      .post(`${this.controllerUsuario}/${this.usuario.id}/actualizaFlota/`)
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

  async actualizaClientesEstadoUi() {
    await this.axios.http
      .post(
        `${this.controllerUsuario}/${this.usuario.id}/actualizaClienteUsuario/`
      )
      .then(res => {})
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      });
  }

  //20-04-2020: Se consolida todo el guardar en una funcion
  async actualizaAsociacionRolesClientes() {
    let rol: number = 0;
    if (this.rolesAsignados.length > 0) rol = this.rolesAsignados[0].id;

    let model: any = [];
    if (this.clientesRolRespaldo.length === 0) {
      this.clientesAsignados = [];
    }

    if (this.clientesAsignados.length > 0) {
      model = this.clientesAsignados.map(cli => ({
        Id: 0,
        ClienteId: cli.id,
        UsuarioId: this.usuario.id,
      }));
    }

    await this.axios.http
      .post(
        `${this.controllerUsuario}/${this.usuario.id}/${rol}/actualizaRolesClientes/`,
        model
      )
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
  //---

  async cerrarSesionUsuarios() {
    await this.axios.http
      .post(
        `${this.controllerUsuario}/${this.usuario.id}/cerrarSesionUsuarios/`
      )
      .then(res => {})
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      });
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

  textoPlaceholder(tipo: string) {
    if (this.esEdicion) {
      if (tipo === 'Fijo') return '56999999999';
      if (tipo === 'Celular') return '56299999999';
    } else {
      return '';
    }
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
        sort: 'desc',
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
        lockVisible: true,
        lockPinned: true,
        cellStyle: {
          textAlign: 'left',
        },
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
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
        cellStyle: {
          textAlign: 'left',
        },
      },
    ];

    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
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
        },
        telefonoParticular: {
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

    if (!this.esEdicion) {
      this.columnDefsRoles.shift();
      this.columnDefsClientes.shift();
    }
  }

  limpiaValidacionFecha() {
    this.date = null;
    this.flagDate = false;
  }

  onSelectionChangedClientesEditar(params: any) {
    const self = this;
    if (this.esEdicion) {
      this.clientesAsignados = this.gridApiClientes.getSelectedRows();
      this.clientesAsignadosResp = Object.assign([], this.clientesAsignados);
    }

    this.contadorEventoGrillaSelectionCliente++;

    if (
      this.clientesAsignados.length == 1 ||
      this.clientesAsignados.length == 0
    ) {
      this.contadorEventoGrillaSelectionCliente = 0;
      this.contadorEventoGrillaCliente = 0;
    }

    if (
      this.contadorEventoGrillaSelectionCliente ===
      this.contadorEventoGrillaCliente
    ) {
      this.contadorEventoGrillaSelectionCliente = 0;
      this.contadorEventoGrillaCliente = 0;
      this.contadorEventoGrillaCliente++;
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
    }
  }

  getRowNodeIdCliente(cliente: IClientes) {
    if (!cliente) {
      return;
    }
    return cliente.id;
  }

  getRowNodeIdRol(rol: any) {
    if (!rol) {
      return;
    }
    return rol.id;
  }

  onFilterTextBoxChanged() {
    this.gridApiClientes.onFilterChanged();
    if (this.buscarCliente.length > 1) {
      this.gridApiClientes.setQuickFilter(this.buscarCliente);
    } else {
      this.gridApiClientes.setQuickFilter('');
    }
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

  async onTipoRolChange() {
    if (this.selectedTipoRol === TipoRol.Operación) {
      this.esTipoOperacion = true;
    } else {
      this.esTipoOperacion = false;
    }

    //Si cambia de Tipo de Rol se limpian los Clientes y Roles Asignados
    this.clientesRolRespaldo = [];
    this.clientesAsignados = [];
    this.clientesAsignadosAux = [];
    this.clientesAsignadosResp = [];
    this.rolesAsignados = [];
    //---
    //await this.showSelectPaginaPrincipal();

    this.rolesRespaldo = this.rolesRespaldoAll.filter(
      (x: any) => x.tipo === this.selectedTipoRol
    );
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

  onFilterTextBoxChangedRol() {
    this.gridApiRoles.onFilterChanged();
    if (this.buscarRol.length > 1) {
      this.gridApiRoles.setQuickFilter(this.buscarRol);
    } else {
      this.gridApiRoles.setQuickFilter('');
    }
  }

  async getRoles() {
    this.loadingService.showLoading();
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
        this.loadingService.hideLoading();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener Roles.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener Roles.');
        }
      });
  }

  onSelectionChangedRolesEditar() {
    const self = this;
    if (this.esEdicion) {
      this.rolesAsignados = this.gridApiRoles.getSelectedRows();
      //this.showSelectPaginaPrincipal();
      if (this.auxMounted) {
        this.actualizaClientesPorRol();
      }
      this.auxMounted = true;
    }
    this.contadorEventoGrillaSelectionRol++;
    if (
      this.contadorEventoGrillaSelectionRol === this.contadorEventoGrillaRol
    ) {
      this.contadorEventoGrillaSelectionRol = 0;
      this.contadorEventoGrillaRol = 0;
      this.contadorEventoGrillaRol++;

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
    }
  }

  async getClientesPorTipoRol(rolId: number) {
    this.loadingService.showLoading();
    await this.axiosClientes.http
      .get(`${this.controllerCliente}/${rolId}/ClientesPorTipoRol`)
      .then(async res => {
        this.clientesRolRespaldo = res.data;

        if (!this.esEdicion) {
          this.clientesRolRespaldo = this.clientesAsignados;
        }

        setTimeout(async () => {
          await this.seteaClientesAsignados();
        }, 3000);
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

  async actualizaClientesPorRol() {
    if (this.rolesAsignados.length > 0) {
      await this.getClientesPorTipoRol(this.rolesAsignados[0].id);
      if (this.auxMounted) {
        if (this.clientesAsignadosResp.length > 0) {
          this.contadorEventoGrillaSelectionCliente = 0;
          this.contadorEventoGrillaCliente = 0;
        }
        this.auxMounted = true;
        //await this.seteaClientesAsignados();
      }
    }
  }

  confirmCallbackRolModificado(val: boolean) {
    this.showAlertaRolModificado = false;
  }

  isExternalFilterPresentCliente(): boolean {
    return true;
  }

  doesExternalFilterPassCliente(node: RowNode): boolean {
    if (this.clientesRolRespaldo.length > 0 && this.buscarRol.length > 1) {
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
#alinear {
  text-align: justify;
}
</style>

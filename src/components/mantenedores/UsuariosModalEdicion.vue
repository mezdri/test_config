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
          <v-toolbar-title>{{
            esEdicion ? 'Editar Usuario' : 'Ver Detalle Usuario'
          }}</v-toolbar-title>
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
                @click="cierraMenuUsuarios"
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
                @click="cierraMenuUsuarios"
                color="primary"
                flat
                v-show="
                  (asociarRol.visible && esEdicion) ||
                    (asociarRolVerDetalle.visible && !esEdicion)
                "
                :value="asociarRol.step"
              >
                <span>Asociar Roles</span>
                <v-icon>person_add</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenuUsuarios"
                color="primary"
                flat
                v-show="
                  (asociarFlota.visible && esEdicion) ||
                    (asociarFlotaVerDetalle.visible && !esEdicion)
                "
                :value="asociarFlota.step"
              >
                <span>Asociar Flotas</span>
                <v-icon>commute</v-icon>
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
                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          v-validate="'required'"
                          v-model="objusuario.id"
                          :error-messages="errors.collect('id')"
                          data-vv-name="id"
                          label="Codigo Usuario"
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
                                                        :disabled="!esEdicion"
                                                        slot="activator"
                                                        v-model="computedDateFormattedVigencia"
                                                        label="Fecha Inicio Vigencia"
                                                        persistent-hint
                                                        prepend-icon="event"
                                                        readonly
                                                        required
                                                    ></v-text-field>
                                                    <v-date-picker
                                                        :disabled="!esEdicion"
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
                          v-model="objusuario.email"
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
                          v-model="objusuario.rut"
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
                          v-model="objusuario.nombre"
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
                          v-model="objusuario.apellidoPaterno"
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
                          v-model="objusuario.apellidoMaterno"
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
                          v-model="objusuario.direccion"
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
                          v-model="objusuario.telefonoFijo"
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
                          v-model="objusuario.telefonoParticular"
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

          <div
            align="center"
            v-show="
              bottomNav == asociarRol.step &&
                ((asociarRol.visible && esEdicion) ||
                  (asociarRolVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md text-xs-center>
                  <v-layout row wrap>
                    <v-flex xs6>
                      <div align="left">
                        <h2 class="h2_title">Asociar Roles</h2>
                      </div>
                    </v-flex>
                    <v-flex xs6 v-if="esEdicion">
                      <div align="right" v-show="muestraBotonRolesEditar">
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
                      :style="[
                        esEdicion
                          ? { 'pointer-events': 'auto' }
                          : { 'pointer-events': 'none' },
                      ]"
                      v-if="showTreeView"
                      :items="roles"
                      v-model="rolesSeleccionados"
                      selectable
                      open-on-click
                      :open-all="!esEdicion"
                      :selected-color="esEdicion ? 'indigo' : 'grey'"
                    ></v-treeview>
                  </div>
                </v-container>
              </v-card>
            </v-flex>
          </div>

          <div
            align="center"
            v-show="
              bottomNav == asociarFlota.step &&
                ((asociarFlota.visible && esEdicion) ||
                  (asociarFlotaVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Flotas</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarFlota"
                        prepend-icon="commute"
                        color="primary"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
                        append-icon="search"
                      >
                        <!-- <template slot="selection" slot-scope="data">
                          <v-chip
                            close
                            class="chip--select-multi"
                            @input="removerFlotasAsignacion(data.item)"
                          >
                            {{ formatoTextoAsociacion(data.item.nombre) }}
                          </v-chip>
                        </template>-->
                      </v-text-field>
                    </v-flex>
                    <!-- <v-flex md3 style="padding-top:22px"> 
                      <div align="right">
                        <v-btn
                          v-if="!seleccionoTodosFlotas"
                          color="primary"
                          @click="marcarTodosFlotas(true)"
                          >Seleccionar Todos
                        </v-btn>
                        <v-btn
                          v-else-if="seleccionoTodosFlotas"
                          color="primary"
                          @click="marcarTodosFlotas(false)"
                          >Deseleccionar Todos
                        </v-btn>
                      </div>
                    </v-flex>-->
                    <!-- <v-flex md3 style="padding-top:22px">
                                            <div align="right">
                                                <v-btn flat small color="primary">
                                                    <v-icon class="btn-asociar-icon" left>cloud_upload</v-icon>
                                                    <span class="btn-asociar-texto">Asociar desde Archivo</span>
                                                </v-btn>
                                            </div>
                    </v-flex>-->
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
                          cacheBlockSize="10000"
                          suppressRowClickSelection="true"
                          suppressCopyRowsToClipboard="true"
                          :sideBar="false"
                          :localeText="localeText"
                          :onGridReady="onGridReadyFlotas"
                          :postProcessPopup="onClickCell"
                          @selection-changed="onSelectionChanged($event)"
                          :getRowNodeId="getRowNodeId"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentFlota
                          "
                          :doesExternalFilterPass="doesExternalFilterPassFlota"
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
          nombreEntidad: objusuario.nombre + ' ' + objusuario.apellidoPaterno,
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
import { EstadoEntidad, ServicioProxy, TipoRol } from '@/config/enums';
import { Validator } from 'vee-validate';
import config from '@/config/index';
import ValidaRut from '@/config/validaRut';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { FlotaInterface } from '@/interfaces/Flota';
import { EstadoInterface } from '@/interfaces/Estado';
import { IClientes } from '@/interfaces/Clientes';
import { EstadosService } from '@/services/estadosService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
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
  objusuario!: UsuariosInterface;

  readonly funcionalidad: Funcionalidades = Funcionalidades.Usuarios;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarRol: PermisoAccionVm = {
    accion: 'Editar - Asociar a Rol',
    visible: true,
    step: 2,
    codigoSubAccion: 10,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarFlota: PermisoAccionVm = {
    accion: 'Editar - Asociar a Flota',
    visible: true,
    step: 3,
    codigoSubAccion: 24,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarRolVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar a Rol',
    visible: true,
    step: 2,
    codigoSubAccion: 10,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarFlotaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar a Flota',
    visible: true,
    step: 3,
    codigoSubAccion: 24,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarRol,
    this.asociarFlota,
    this.informacionGeneralVerDetalle,
    this.asociarRolVerDetalle,
    this.asociarFlotaVerDetalle,
  ];

  readonly controllerUsuario: string = 'usuario';
  readonly controllerCuenta: string = 'cuenta';
  readonly controllerFlota: string = 'flota';
  readonly controllerCliente: string = 'cliente';
  readonly controllerClienteRol: string = 'clienterol';
  readonly controllerRol: string = 'Rol';

  //Variables globales
  $snotify: any;
  bottomNav: any = '1';
  date: any = null;
  dateVigencia: any = null;
  selectedEstado: any = null;
  estados: EstadoInterface[] = [];
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
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  clientesRules: any = [];
  search: string = '';
  buscarFlota: string = '';

  loadingService = new LoadingService();

  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];
  clientesAsignadosResp: IClientes[] = [];
  clientesRespaldo: IClientes[] = [];

  flotasAsignadosModel: any = [];
  flotasAsignados: FlotaInterface[] = [];
  flotasAsignadosResp: FlotaInterface[] = [];
  flotasRespaldo: FlotaInterface[] = [];

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
  rolesAsignadosResp: RolesInterface[] = [];
  rolesRespaldo: RolesInterface[] = [];
  rolesSeleccionados: any[] = [];
  seleccionoTodos: boolean = false;
  roles: any = [];
  showTreeView: boolean = false;
  muestraBotonRolesEditar: boolean = true;
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;

  //flotas
  seleccionoTodosFlotas: boolean = false;

  keyDatePickers: number = 0;
  defaultDate: any = moment(new Date()).format('YYYY-MM-DD');
  flagDate: boolean = false;
  showWarningRolesClientes: boolean = false;
  guardaRoles: boolean = true;

  mounted() {
    this.initialize();
    // const estadosClass: EstadosService = new EstadosService();
    // this.estados = estadosClass
    //   .getEstados()
    //   .filter(x => x.id == 0 || x.id == 1);

    // this.estados.sort(function(vote1, vote2) {
    //   if (vote1.nombre > vote2.nombre) return 1;
    //   if (vote1.nombre < vote2.nombre) return -1;
    // });

    // this.clientesRules = [
    //   (v: any) => !!v || config.errorMensajes.textoRequerido,
    //   (v: any) =>
    //     this.validarAlMenosUnCliente() ||
    //     '* Debe seleccionar al menos un Cliente',
    // ];
  }

  validarAlMenosUnCliente(): boolean {
    return this.clientesAsignados.length > 0;
  }

  created() {
    let r = this.vr;
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

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.clientesAsignadosModel = [];
    this.clientesAsignados = [];
    this.flotasAsignadosModel = [];
    this.flotasAsignados = [];
    this.rolesSeleccionados = []; //Limpio Roles
    this.rolesRespaldo = []; //Limpio Listado de Roles

    this.date =
      this.objusuario.fechaNacimiento !== null
        ? moment(this.objusuario.fechaNacimiento).format('YYYY-MM-DD')
        : null;
    this.dateVigencia = moment(this.objusuario.fechaInicioVigencia).format(
      'YYYY-MM-DD'
    );

    this.selectedEstado = this.objusuario.estado;
    this.bottomNav = '1';

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        await this.getClientesRol();
        await this.obtenerFlotas();

        //flotas

        this.btnBloquear = false;
        // this.setRemoveButton();

        //recupera clientes asignados
        if (this.objusuario.id > 0) {
          const usuarioId = this.objusuario.id;
          await this.obtenerUsuario(usuarioId);
          await this.obtenerFlota(usuarioId);
          await this.obtenerRolesAsignados(usuarioId);
          this.getClientesRolSelected();
        }
      } finally {
        this.loadingService.hideLoading();
      }
      await this.seteaAsignadosVerDetalle();
      this.initialize();
    }
  }
  seteaAsignadosVerDetalle() {
    if (!this.esEdicion) {
      this.flotasRespaldo = this.flotasAsignados;
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

  async obtenerUsuario(usuarioId: number) {
    try {
      const response = await this.axios.http.get(
        `${this.controllerUsuario}/${usuarioId}/cliente`
      );

      if (response.data.length > 0) {
        this.clientesAsignados = response.data;
        this.clientesAsignadosResp = Object.assign([], this.clientesAsignados);

        this.clientesAsignados.forEach((cliente: any) => {
          this.clientesAsignadosModel.push(cliente.id);
        });
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  async obtenerFlota(usuarioId: number) {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerFlota}/${usuarioId}/usuarioflota/`
      );
      if (response.data.length > 0) {
        this.flotasAsignados = response.data;
        //En "Ver Detalle": Muestra solo flotas cliente en session
        if (!this.esEdicion) {
          const clienteSessionId = config.getClienteSesion();
          this.flotasAsignados = this.flotasAsignados.filter(
            (x: any) => x.clienteId == clienteSessionId
          );
        }
        //---
        const self = this;
        this.gridApiFlotas.forEachNode(function(node: any) {
          var index = self.flotasAsignados.findIndex(x => x.id == node.data.id);
          if (index !== -1) {
            node.setSelected(true);
            self.contadorEventoGrilla++;
          }
        });
        this.flotasAsignadosResp = Object.assign([], this.flotasAsignados);

        this.flotasAsignados.forEach((flota: any) => {
          this.flotasAsignadosModel.push(flota.id);
        });
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
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

  async obtenerRolesAsignados(usuarioId: number) {
    try {
      const response = await this.axios.http.get(
        `${this.controllerUsuario}/${usuarioId}/clienterol/`
      );
      if (response.data.length > 0) {
        this.rolesAsignados = response.data;
        this.rolesAsignadosResp = Object.assign([], this.rolesAsignados);

        this.rolesAsignados.forEach((rol: any) => {
          this.rolesAsignadosModel.push(rol.id);
        });
      }
      this.loadingService.hideLoading();
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

  getClientesRolSelected() {
    var indexNegativo: number = -1;
    var indexPositivo: number = 1;
    var tview: any = [];

    //En "Ver Detalle": Muestra solo cliente + roles del cliente en session
    if (!this.esEdicion) {
      const clienteSessionId = config.getClienteSesion();
      this.clientesAsignados = this.clientesAsignados.filter(
        (x: any) => x.id == clienteSessionId
      );
    }
    //---

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
          if (childrenRol.name !== undefined) tv.children.push(childrenRol);
          indexPositivo += 1;
        });
      }
    });

    this.rolesSeleccionados = []; //Limpio Roles
    this.roles = tview;
    this.roles.forEach((cliente: any) => {
      cliente.children.forEach((rol: any) => {
        this.rolesAsignados.forEach((r: any) => {
          if (r.rolId === rol.rolId && cliente.clienteId === r.clienteId) {
            this.rolesSeleccionados.push(rol.id);
          }
        });
      });
    });

    if (this.rolesRespaldo.length === 0) {
      this.showTreeView = false;
      this.muestraBotonRolesEditar = false;
    } else {
      this.showTreeView = true;
    }
  }

  onClienteChange(cliente: any) {
    if (
      cliente !== undefined &&
      cliente.length !== this.clientesAsignados.length
    ) {
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
  }

  onClienteInput(cliente: any) {
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
  }

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

  grabarEdicion() {
    const formVal: any = this.$refs;
    this.$validator.validateAll().then(res => {
      if (res) {
        if (formVal.form.validate()) {
          this.dialogConfirmacion = true;
          this.btnBloquear = true;
        } else {
          this.bottomNav = '2';
        }
      }
    });
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.$validator.reset();
    this.btnBloquear = false;
    this.newItem = {};
    this.$emit('modalAsociacionEmit', false);
    this.rolesAsignados = [];
    this.dialog = false;
    this.keyDatePickers += 1;
    this.buscarFlota = '';
    this.gridApiFlotas.setQuickFilter('');
    this.contadorEventoGrilla = 0;
    this.contadorEventoGrillaSelection = 0;
    this.rolesRespaldo = []; //Limpio Listado de Roles
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

  async obtenerFlotas(): Promise<void> {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerFlota}/FlotasPorCliente/`
      );
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
      this.flotasRespaldo = response.data;
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

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;
    if (aceptado) {
      await this.validarAsociacionesRoles();
    }
    this.btnBloquear = false;
  }

  async editado() {
    this.btnBloquear = true;
    this.objusuario.fechaNacimiento =
      this.date === undefined ||
      this.date === null ||
      this.date === this.defaultDate
        ? null
        : new Date(this.date);
    this.objusuario.fechaInicioVigencia = moment(this.dateVigencia)
      .add(30, 'm')
      .toDate();
    this.objusuario.estado = this.selectedEstado;
    this.objusuario.apellidoMaterno =
      this.objusuario.apellidoMaterno == undefined
        ? ''
        : this.objusuario.apellidoMaterno;
    try {
      this.loadingService.showLoading();
      await this.axios.http.put(this.controllerUsuario, this.objusuario);

      // await this.eliminarAsociacionesRoles();

      // if (this.guardaRoles) {
      //   await this.grabarAsociacionesRoles();
      // }
      await this.eliminarAsociadosFlotas();
      await this.grabarAsociacionesFlotas();
      await this.actualizarAsociacionesRoles();
      await this.cerrarSesionUsuarios();
      this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
      this.closeModal(false);
      this.dialogConfirmacion = false;
    } catch (error) {
      this.loadingService.hideLoading();
      this.btnBloquear = false;
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
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

  async eliminarAsociacionesRoles() {
    try {
      if (this.rolesAsignadosResp.length > 0) {
        await this.axios.http.delete(
          `${this.controllerUsuario}/${this.objusuario.id}/deleteRolesCliente/`
        );
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  async grabarAsociacionesRoles() {
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
          `${this.controllerUsuario}/${this.objusuario.id}/clienterol/`,
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

  async eliminarAsociadosFlotas(): Promise<void> {
    try {
      this.flotasAsignadosResp.forEach((flota: any, idx: number) => {
        const exists = this.flotasAsignados.filter(z => z.id == flota.id);
        if (exists.length === 0) {
          this.axiosVehiculo.http.delete(
            `${this.controllerFlota}/${flota.id}/usuario/${this.objusuario.id}`
          );
        }
      });
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  async grabarAsociacionesFlotas(): Promise<void> {
    try {
      this.flotasAsignados.forEach(async (flota: FlotaInterface) => {
        let existe = this.flotasAsignadosResp.filter(x => x.id === flota.id);

        if (existe.length === 0) {
          await this.axiosVehiculo.http.post(
            `${this.controllerFlota}/${flota.id}/usuario/${this.objusuario.id}`,
            {}
          );
        }
      });
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  createButtonCell(params: any) {
    const item = this.clientesRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
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

    eButton.addEventListener('click', () => {
      this.removerClientesAsignacion(item);
    });

    return eButton;
  }

  removerClientesAsignacion(item: IClientes) {
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
  }

  createButtonCellFlotas(params: any) {
    const item = this.flotasRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
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

  // setRemoveButton() {
  //if (this.esEdicion) {
  // let a1 = this.columnDefs.filter(
  //   (x: ColDef) => x.headerName == 'Desasociar'
  // );
  // let a2 = this.columnDefsFlotas.filter(
  //   (x: ColDef) => x.headerName == 'Desasociar'
  // );

  // if (a1.length == 0) {
  //   this.columnDefs.push({
  //     headerName: 'Desasociar',
  //     cellRenderer: this.createButtonCell,
  //     enablePivot: false,
  //     width: 150,
  //     minWidth: 80,
  //     filter: false,
  //     suppressMovable: true,
  //     resizable: false,
  //     sortable: false,
  //     lockVisible: true,
  //     pinned: 'right',
  //     cellStyle: {
  //       textAlign: 'left',
  //     },
  //   });
  // }

  // if (a2.length == 0) {
  //   this.columnDefsFlotas.push({
  //     headerName: 'Desasociar',
  //     cellRenderer: this.createButtonCellFlotas,
  //     enablePivot: false,
  //     filter: false,
  //     suppressMovable: true,
  //     resizable: false,
  //     sortable: false,
  //     lockVisible: true,
  //     width: 150,
  //     minWidth: 80,
  //     pinned: 'right',
  //     cellStyle: {
  //       textAlign: 'left',
  //     },
  //   });
  // }
  /* } else {
               //remueve columnas de desasociar, si existen
               this.columnDefs = config.returnGrillaCeldasDesasociar(
                 this.columnDefs,
                 "Desasociar"
               );
               this.columnDefsFlotas = config.returnGrillaCeldasDesasociar(
                 this.columnDefsFlotas,
                 "Desasociar"
               );
             }*/
  // }

  textoPlaceholder(tipo: string) {
    if (this.esEdicion) {
      if (tipo === 'Fijo') return '56999999999';
      if (tipo === 'Celular') return '56299999999';
    } else {
      return '';
    }
  }

  limpiaValidacionFecha() {
    //this.date = this.defaultDate;
    //this.flagDate = true;
    this.date = null;
    this.flagDate = false;
  }

  initialize() {
    this.columnDefs = [
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
        sort: 'desc',
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
        minWidth: 80,
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
        field: 'estado',
        cellRenderer: (r: any) => {
          if (r.data.estado === EstadoEntidad.Sistema)
            return EstadoEntidad[EstadoEntidad.Activo];
          else return EstadoEntidad[r.data.estado];
        },
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: {
          textAlign: 'left',
        },
      },
    ];

    this.columnDefsFlotas = [
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
        sort: 'desc',
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
        width: 200,
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
        cellStyle: {
          textAlign: 'left',
        },
      },
    ];
    if (!this.esEdicion) {
      this.columnDefsFlotas.shift();
    }

    // this.setRemoveButton();

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
  }
  onFilterTextBoxChanged() {
    this.gridApiFlotas.onFilterChanged();
    // if (this.buscarFlota.length > 1) {
    //   this.gridApiFlotas.setQuickFilter(this.buscarFlota);
    // } else {
    //   this.gridApiFlotas.setQuickFilter('');
    // }
  }

  async onSelectionChanged() {
    this.contadorEventoGrillaSelection++;

    if (this.flotasAsignados.length === 0) {
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrillaSelection = 0;
    }

    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      await this.ordenarGrillaFlotasEditar();
      this.flotasAsignados = this.gridApiFlotas.getSelectedRows();
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
    }
  }

  isExternalFilterPresentFlota(): boolean {
    return true;
  }

  doesExternalFilterPassFlota(node: RowNode): boolean {
    if (this.flotasRespaldo.length > 0 && this.buscarFlota.length > 1) {
      let busqueda = this.buscarFlota.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  ordenarGrillaFlotasEditar() {
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
  getRowNodeId(flota: FlotaInterface) {
    if (!flota) {
      return;
    }
    return flota.id;
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
        this.editado();
      } else {
        this.guardaRoles = true;
        this.editado();
      }
    } catch (error) {
      this.loadingService.hideLoading();
      this.guardaRoles = false;
      this.showWarningRolesClientes = true;
      //console.clear();
    }
  }

  async confirmCallbackRolesClientes() {
    this.showWarningRolesClientes = false;
    this.editado();
  }

  async cerrarSesionUsuarios() {
    await this.axios.http
      .post(
        `${this.controllerUsuario}/${this.objusuario.id}/cerrarSesionUsuarios/`
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

  async actualizarAsociacionesRoles() {
    try {
      if (
        this.rolesAsignadosResp.length > 0 ||
        this.rolesSeleccionados.length > 0
      ) {
        const clienteId = config.getClienteSesion();

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
        await this.axios.http.put(
          `${this.controllerUsuario}/${this.objusuario.id}/actualizaAsociacionRol/`,
          model
        );
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

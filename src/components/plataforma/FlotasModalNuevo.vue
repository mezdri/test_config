<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivF">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Crear Flota</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenu()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenu()"
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
              v-show="asociarUsuario.visible"
              :complete="e1 > asociarUsuario.step"
              :step="asociarUsuario.step"
              >Asociar Usuarios</v-stepper-step
            >
            <v-divider v-show="asociarUsuario.visible"></v-divider>
            <v-stepper-step
              v-show="asociarVehiculos.visible"
              :complete="e1 > asociarVehiculos.step"
              :step="asociarVehiculos.step"
              >Asociar Vehículos</v-stepper-step
            >
            <v-divider v-show="asociarVehiculos.visible"></v-divider>
            <v-stepper-step
              v-show="asociarSubFlota.visible"
              :complete="e1 > asociarSubFlota.step"
              :step="asociarSubFlota.step"
              >Asociar Subflotas</v-stepper-step
            >
            <!--<v-divider v-show="asociarSubFlota.visible"></v-divider>-->
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
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <div align="left">
                              <h2
                                class="h2_title"
                                style="margin-top: 12px!important;"
                              >
                                Información General
                              </h2>
                            </div>
                            <v-divider></v-divider>
                          </v-flex>
                        </v-layout>
                        <br />
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <v-text-field
                              v-validate="
                                'required|FlotaNombreUnicoCrear|max:80'
                              "
                              v-model="editedItem.nombre"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              :key="keyNombre"
                              :counter="80"
                              required
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <v-text-field
                              v-validate="'max:200'"
                              v-model="editedItem.descripcion"
                              :error-messages="errors.collect('descripcion')"
                              data-vv-name="descripcion"
                              label="Descripción"
                              type="text"
                              :counter="200"
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <v-autocomplete
                              :disabled="true"
                              v-validate="'required'"
                              v-model="selectedCliente"
                              :error-messages="errors.collect('cliente')"
                              data-vv-name="cliente"
                              :items="clientes"
                              label="Cliente"
                              item-text="nombre"
                              item-value="id"
                              persistent-hint
                              :clearable="true"
                              required
                            ></v-autocomplete>
                          </v-flex>
                        </v-layout>
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <v-autocomplete
                              v-model="selectedFlotaPadre"
                              :items="flotas"
                              label="Flota Padre"
                              item-text="nombre"
                              item-value="id"
                              persistent-hint
                              :clearable="true"
                              no-data-text="Sin resultados"
                              @change="changeFlotaPadre"
                            ></v-autocomplete>
                          </v-flex>
                        </v-layout>
                        <br />

                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <div align="left">
                              <h2 class="h2_title">Responsables</h2>
                            </div>
                            <v-divider></v-divider>
                          </v-flex>
                        </v-layout>
                        <br />
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <v-autocomplete
                              v-model="selectedResponsableFlota"
                              :items="usuariosRespaldo"
                              label="Responsable de la flota"
                              :item-text="nombreCompleto"
                              item-value="id"
                              persistent-hint
                              :clearable="true"
                              prepend-icon="person"
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                        </v-layout>
                        <v-layout align-center justify-center row>
                          <v-flex xs8 sm8 md8>
                            <v-autocomplete
                              v-model="selectedResponsableMantencion"
                              :items="usuariosRespaldo"
                              label="Responsable de mantención de la flota"
                              :item-text="nombreCompleto"
                              item-value="id"
                              persistent-hint
                              :clearable="true"
                              prepend-icon="person"
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarUsuario.visible"
              :step="asociarUsuario.step"
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
                            v-model="buscarUsuario"
                            prepend-icon="person"
                            color="primary"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedAsociarUsuarios"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                        <!-- <v-flex md6 style="padding-top:22px">
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
                              :columnDefs="columnDefs"
                              :rowData="usuariosRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReady"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectedChangeUsuarios($event)
                              "
                              :getRowNodeId="getRowNodeIdUsuarioNuevo"
                              suppressCopyRowsToClipboard="true"
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
            <v-stepper-content
              v-show="asociarVehiculos.visible"
              :step="asociarVehiculos.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Vehículos</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <v-alert
                        v-if="cantidadVehiculosYaAsociados > 0"
                        :value="true"
                        color="error"
                        icon="warning"
                        :dismissible="true"
                        outline
                      >
                        ADVERTENCIA: Existen
                        {{ cantidadVehiculosYaAsociados }} vehículos que ya
                        poseen una asociación, si continua con esta operación
                        serán re-asociados a la flota actual.
                      </v-alert>
                      <br />
                      <h3
                        style="font-size: 1.6vmin; font-weight: 400; width: fit-content;"
                      >
                        Tipo de Asociación:
                      </h3>
                      <v-checkbox
                        v-model="duplicateVehicle"
                        label="Si desmarca esta opción, los vehículos permanecerán tanto en la flota actual como en la nueva"
                      ></v-checkbox>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarVehiculo"
                            prepend-icon="directions_car"
                            color="primary"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedAsociarVehiculo"
                            append-icon="search"
                          >
                          </v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsVehiculos"
                              :rowData="vehiculosRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBarVehiculos"
                              :localeText="localeText"
                              :onGridReady="onGridReadyVehiculo"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectedChangeVehiculos($event)
                              "
                              @row-selected="onSelectedRowVehiculos($event)"
                              :getRowNodeId="getRowNodeIdVehiculosNuevo"
                              suppressCopyRowsToClipboard="true"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentVehiculo
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassVehiculo
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
              v-show="asociarSubFlota.visible"
              :step="asociarSubFlota.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Subflotas</h2>
                          </v-flex>
                          <p>
                            (Opcional, las Flotas asociadas quedarán guardadas
                            como subflotas de esta)
                          </p>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <v-alert
                        v-if="!puedeAsociarSubFlotas"
                        :value="true"
                        color="error"
                        icon="warning"
                        :dismissible="true"
                        outline
                      >
                        ADVERTENCIA: No es posible asignar Subflotas, si la
                        flota actual posee una Flota Padre.
                      </v-alert>
                      <br />
                      <v-layout row wrap v-show="puedeAsociarSubFlotas">
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarSubFlota"
                            prepend-icon="commute"
                            color="primary"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedAsociarSubFlota"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card v-show="puedeAsociarSubFlotas">
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsSubFlotas"
                              :rowData="subFlotasRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBarSubFlotas"
                              :localeText="localeText"
                              :onGridReady="onGridReadySubFlota"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectedChangeSubFlota($event)
                              "
                              :getRowNodeId="getRowNodeIdSubFlotasNuevo"
                              suppressCopyRowsToClipboard="true"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentSubFlota
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassSubFlota
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Flota' })"
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: 'la Flota' })"
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

    <v-dialog
      v-model="dialogVehiculoCompartido"
      persistent
      max-width="450"
      style="z-index: 1000006  !important"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Vehículos Compartidos</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text style="text-align:justify; ">{{
          dialogVehiculoCompartidoText
        }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            depressed
            small
            @click="remueveVehiculoCompartido()"
          >
            <span style="color: #526da5">Rechazar</span>
          </v-btn>
          <v-btn
            color="#526da5"
            depressed
            small
            @click="dialogVehiculoCompartido = false"
          >
            <span style="color: white;">Aceptar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogVehiculoCompartidoMasivo"
      persistent
      max-width="450"
      style="z-index: 1000006  !important"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Vehículo Compartido</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text style="text-align:justify; ">{{
          dialogVehiculoCompartidoText
        }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            depressed
            small
            @click="remueveVehiculoCompartidoMasivo()"
          >
            <span style="color: #526da5">Rechazar</span>
          </v-btn>
          <v-btn
            color="#526da5"
            depressed
            small
            @click="dialogVehiculoCompartidoMasivo = false"
          >
            <span style="color: white;">Aceptar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { FlotaInterface } from '@/interfaces/Flota';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { IClientes } from '@/interfaces/Clientes';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoCompartir } from '@/config/enums';
import { Validator } from 'vee-validate';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import IconoCompartido from '@/components/IconoCompartido.vue';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import store from '@/store';
import { differenceBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import moment from 'moment';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    'app-icono-compartido': IconoCompartido,
  },
})
export default class FlotasModalNuevo extends ComponenteBaseStepper {
  @Prop({
    default: false,
  })
  show!: boolean;
  @Prop({
    default: () => ({
      id: 0,
      nombre: '',
      estado: EstadoEntidad.Activo,
    }),
  })
  flota!: FlotaInterface;

  readonly controller: string = 'flota';
  readonly controllerFlotaCompartida: string = 'flotaCompartida';
  readonly controllerUsuario: string = 'usuario';
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerCliente: string = 'cliente';
  readonly controllerVehiculoFlota: string = 'VehiculoFlota';

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Flotas;
  permisosActuales: PermisoAccionVm[] = [];
  duplicateVehicle: boolean = true;
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarUsuario: PermisoAccionVm = {
    accion: 'Crear - Asociar Usuarios',
    visible: true,
    step: 2,
    codigoSubAccion: 11,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarVehiculos: PermisoAccionVm = {
    accion: 'Crear - Asociar Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarSubFlota: PermisoAccionVm = {
    accion: 'Crear - Asociar Sub-Flotas',
    visible: true,
    step: 4,
    codigoSubAccion: 33,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarUsuario,
    this.asociarVehiculos,
    this.asociarSubFlota,
  ];

  //Variables globales
  keyNombre: number = 0;
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: FlotaInterface = {};
  dictionaryFormErrors: any = {};
  puedeAsociarSubFlotas: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dialogVehiculoCompartido: boolean = false;
  dialogVehiculoCompartidoMasivo: boolean = false;
  dialogVehiculoCompartidoText: string = '';
  dialogVehiculoCompartidoClearCrear: string = '';
  handleErrors: HandleErrors = new HandleErrors();
  flotas: FlotaInterface[] = [];
  clientes: any = [];
  btnBloquear: boolean = false;
  cantidadVehiculosYaAsociados: number = 0;
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosMetabase: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  idCliente: number = 0;
  loadingService = new LoadingService();
  currentVehiculoId: number = 0;
  search: string = '';
  seleccionoTodosUsuarios: boolean = true;
  seleccionoTodosSub: boolean = true;
  seleccionoTodosVehiculos: boolean = true;
  muestraUsuarios: boolean = false;
  muestraVehiculos: boolean = false;
  muestraSub: boolean = false;
  vehCompartidos: any = [];
  buscarUsuario: string = '';
  buscarVehiculo: string = '';
  buscarSubFlota: string = '';
  cont: number = 0;
  indexVehiculo: number = 0;
  eDataNuevo: any;

  usuariosAsignadosModel: any = [];
  usuariosAsignados: UsuariosInterface[] = [];
  usuariosRespaldo: UsuariosInterface[] = [];

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  vehiculosAsignadosRespaldoGrilla: IVehiculo[] = [];

  subFlotassAsignadosModel: any = [];
  subFlotasAsignados: FlotaInterface[] = [];
  subFlotasRespaldo: FlotaInterface[] = [];

  //grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiVehiculos: GridApi;
  columnApiVehiculos: ColumnApi;
  columnDefsVehiculos: Array<ColDef> = [];
  sideBarVehiculos: any = config.agGridDefaultConfig;

  gridApiSubFlotas: GridApi;
  columnApiSubFlotas: ColumnApi;
  columnDefsSubFlotas: Array<ColDef> = [];
  sideBarSubFlotas: any = config.agGridDefaultConfig;

  selectedCliente: any = null;
  selectedFlotaPadre: any = null;
  selectedResponsableFlota: any = null;
  selectedResponsableMantencion: any = null;

  textoVehiculo(item: any) {
    let retorno: string = '';
    if (item !== undefined && item !== null) {
      if (item.patente !== null && item.patente !== '') retorno = item.patente;
      else if (item.vin !== null && item.vin !== '') retorno = item.vin;
    }
    return retorno;
  }

  created() {
    this.chequearPermisos();
    this.registrarValidadores();
  }

  mounted() {
    this.initialize();
  }

  @Watch('dialogConfirmacionClose')
  onDialogConfirmacionClose() {
    if (this.dialogConfirmacionClose) {
      this.duplicateVehicle = true;
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
  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }
  onVehiculoInput(vehiculo: any) {
    if (vehiculo !== undefined) {
      for (let i = 0; i <= vehiculo.length - 1; i++) {
        const added = this.vehiculosAsignados.filter(x => x.id == vehiculo[i]);

        if (added.length === 0) {
          const vehiculoAgrega = this.vehiculosRespaldo.find(
            x => x.id == vehiculo[i]
          );
          this.vehiculosAsignados.push(vehiculoAgrega);
          if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length)
            this.seleccionoTodosUsuarios = true;
          else this.seleccionoTodosUsuarios = false;
        }
      }
    }
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivF').scrollIntoView(true);
  }

  nombreCompleto(user: UsuariosInterface): string {
    return (
      user.nombre + ' ' + user.apellidoPaterno + ' ' + user.apellidoMaterno
    );
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('FlotaNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Flota con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosVehiculo.http
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
                    : { message: '* Ya existe una Flota con este nombre.' },
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

  nombreCompletoMandante(user: IClientes): string {
    return `${user.nombre} ( ${user.rut} )`;
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.usuariosAsignados = [];
    this.usuariosAsignadosModel = [];
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];
    this.subFlotasAsignados = [];
    this.subFlotassAsignadosModel = [];
    this.selectedFlotaPadre = [];
    this.selectedCliente = null;
    this.selectedResponsableFlota = [];
    this.selectedResponsableMantencion = [];
    this.cantidadVehiculosYaAsociados = 0;

    if (value) {
      this.loadingService.showLoading();
      this.seleccionoTodosUsuarios = false;
      this.seleccionoTodosVehiculos = false;
      this.seleccionoTodosSub = false;
      this.btnBloquear = false;
      this.idCliente = config.getClienteSesion();
      this.getUsuarios();
    }
  }

  @Watch('selectedFlotaPadre')
  onflotaPadreChanged(value: any, oldValue: any) {
    if (this.selectedFlotaPadre == null) {
      this.puedeAsociarSubFlotas = true;
    } else if (this.selectedFlotaPadre.length === 0) {
      this.puedeAsociarSubFlotas = true;
    } else {
      this.puedeAsociarSubFlotas = false;
    }
  }

  atras() {
    if (this.e1 > 0) this.e1 = this.e1 - 1;
  }
  async changeVehiculob() {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    let vehSinCompartir: any = [];
    this.vehCompartidos = [];

    this.vehiculosAsignados.forEach(async (veh: any, idx: number) => {
      if (veh.loComparto) {
        this.vehCompartidos.push(veh);
      }
    });

    if (this.vehCompartidos.length > 0) {
      this.dialogVehiculoCompartidoText =
        'Existen Vehículos que se encuentran actualmente en una flota compartida, por lo que si desasocia los vehículos los clientes dejarán de recibir información. ¿Desea continuar?';
      this.dialogVehiculoCompartidoMasivo = true;
    }
  }

  //  async changeVehiculob(vehiculo: any) {
  //   this.search = '';
  //   if (vehiculo !== undefined && vehiculo.length !== this.vehiculosAsignados.length) {
  //     for (let x = this.vehiculosAsignados.length - 1; x >= 0; x--) {
  //       let borrar = true;

  //       for (let i = 0; i <= vehiculo.length - 1; i++) {
  //         if (this.vehiculosAsignados[x].id == vehiculo[i]) {
  //           borrar = false;
  //         }
  //       }

  //       if (borrar) {
  //         this.vehiculosAsignados.splice(x, 1);
  //       }
  //        if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length)
  //         this.seleccionoTodosVehiculos = true;
  //     else
  //         this.seleccionoTodosVehiculos = false;
  //     }
  //   }
  //  }

  async changeVehiculo(vehiculo: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    await this.validaTodo(vehiculo);
    let asignado: any = await this.vehiculosAsignados.filter(
      (x: any) => x.id === vehiculo.id
    );
    if (asignado.length > 1) {
      for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
        this.vehiculosAsignados.splice(i, 1);
        this.vehiculosAsignadosModel.splice(i, 1);
      }
    }
  }
  chequeaCompartidos() {
    if (
      this.vehiculosAsignados.length >
      this.vehiculosAsignadosRespaldoGrilla.length
    ) {
      let existe: any;
      this.vehiculosAsignados.forEach(veh => {
        existe = this.vehiculosAsignadosRespaldoGrilla.filter(
          x => x.id === veh.id
        );
      });
      if (existe.length === 0) {
        let almacenaNuevos: any = [];
        this.vehiculosAsignados.forEach(veh => {
          this.vehiculosAsignadosRespaldoGrilla.includes(veh)
            ? null
            : almacenaNuevos.push(veh);
        });
      }
      this.vehiculosAsignadosRespaldoGrilla = this.vehiculosAsignados;
    } else {
      this.vehiculosAsignadosRespaldoGrilla = this.vehiculosAsignados;
    }
  }
  async validaTodo(vehiculo: any) {
    if (vehiculo !== undefined) {
      if (vehiculo.loComparto) {
        this.dialogVehiculoCompartidoText = '';

        if (vehiculo.loCompartoList.length == 1) {
          this.dialogVehiculoCompartidoText =
            'El Vehículo se encuentra actualmente compartido con el Cliente ' +
            vehiculo.loCompartoList[0] +
            ', por lo que si desasocia el Vehículo el Cliente dejará de recibir información ¿Desea continuar?';
        } else {
          this.dialogVehiculoCompartidoText =
            'El Vehículo se encuentra compartido con los Clientes ';

          vehiculo.loCompartoList.forEach((element: any, index: number) => {
            if (vehiculo.loCompartoList.length - index > 1) {
              this.dialogVehiculoCompartidoText += element + ', ';
            } else {
              this.dialogVehiculoCompartidoText += ' y ' + element;
            }
          });

          this.dialogVehiculoCompartidoText +=
            ', por lo que si desasocia el Vehículo los Clientes dejarán de recibir información ¿Desea continuar?';
        }
        this.dialogVehiculoCompartido = true;
      }
    }
  }

  async onClearVehiculos() {
    for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
      this.vehiculosAsignados[i].selected = false;
      this.vehiculosAsignados.splice(i, 1);
    }

    for (let i = this.vehiculosAsignadosModel.length - 1; i >= 0; i--) {
      this.vehiculosAsignadosModel.splice(i, 1);
    }

    for (let i = this.vehiculosRespaldo.length - 1; i >= 0; i--) {
      this.vehiculosRespaldo[i].selected = false;
    }

    if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodosVehiculos = true;
    } else {
      this.seleccionoTodosVehiculos = false;
    }
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
        if (this.usuariosAsignados.length === this.usuariosRespaldo.length)
          this.seleccionoTodosUsuarios = true;
        else this.seleccionoTodosUsuarios = false;
      }
    }
  }

  onUserInput(user: any) {
    if (user !== undefined) {
      for (let i = 0; i <= user.length - 1; i++) {
        const added = this.usuariosAsignados.filter(x => x.id == user[i]);

        if (added.length === 0) {
          const usuarioAgregar = this.usuariosRespaldo.find(
            x => x.id == user[i]
          );
          this.usuariosAsignados.push(usuarioAgregar);
          if (this.usuariosAsignados.length === this.usuariosRespaldo.length)
            this.seleccionoTodosUsuarios = true;
          else this.seleccionoTodosUsuarios = false;
        }
      }
    }
  }

  onSubFlotaChange(subflota: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      subflota !== undefined &&
      subflota.length !== this.subFlotasAsignados.length
    ) {
      for (let x = this.subFlotasAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= subflota.length - 1; i++) {
          if (this.subFlotasAsignados[x].id == subflota[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.subFlotasAsignados.splice(x, 1);
        }
      }
    }
    if (this.subFlotasAsignados.length === this.subFlotasRespaldo.length)
      this.seleccionoTodosSub = true;
    else this.seleccionoTodosSub = false;
  }

  onSubFlotaInput(subflota: any) {
    if (subflota !== undefined) {
      for (let i = 0; i <= subflota.length - 1; i++) {
        const added = this.subFlotasAsignados.filter(x => x.id == subflota[i]);

        if (added.length === 0) {
          const subflotaAgregar = this.subFlotasRespaldo.find(
            x => x.id == subflota[i]
          );
          this.subFlotasAsignados.push(subflotaAgregar);
          if (this.subFlotasAsignados.length === this.subFlotasRespaldo.length)
            this.seleccionoTodosSub = true;
          else this.seleccionoTodosSub = false;
        }
      }
    }
  }

  changeFlotaPadre(flotaPadre: number) {
    if (this.subFlotasAsignados.length > 0) {
      this.$snotify.warning(
        'No es posible asignar una Flota Padre cuando se han asignado Subflotas'
      );
      this.$nextTick(() => {
        this.selectedFlotaPadre = null;
      });
    }
  }

  remueveVehiculoCompartido() {
    this.dialogVehiculoCompartido = false;
    this.gridApiVehiculos.deselectIndex(this.indexVehiculo);
    this.indexVehiculo = 0;
  }

  remueveVehiculoCompartidoMasivo() {
    this.gridApiVehiculos.forEachNode(nodo => {
      let existe = this.vehCompartidos.filter(
        (x: any) => x.id === nodo.data.id
      );
      if (existe.length === 1) {
        this.gridApiVehiculos.deselectIndex(nodo.rowIndex);
      }
    });
    this.dialogVehiculoCompartidoMasivo = false;
    let vehiculosCompartidos: any = [];
    let vehiculosAsignadosNoCompartidos: any = [];
    var cont = 0;
    this.indexVehiculo = 0;
    this.vehiculosAsignados.forEach((veh: any, i: number) => {
      cont++;
      var vehiculo = this.vehCompartidos.filter((x: any) => x.id === veh.id);
      if (vehiculo.length === 0) {
        vehiculosAsignadosNoCompartidos.push(veh);
      }
      if (cont === this.vehiculosAsignados.length) {
        this.vehiculosAsignados = vehiculosAsignadosNoCompartidos;
        this.vehiculosAsignadosModel = vehiculosAsignadosNoCompartidos;
      }
    });

    this.vehCompartidos.forEach((vehC: any, i: number) => {
      vehC.selected = false;
    });
  }

  /*for (let i = 0 ;  this.vehiculosAsignados.length;  i++) {
      for (let x = 0 ;  this.vehCompartidos.length - 1; x++) {
      if (this.vehiculosAsignados[i].id === this.vehCompartidos[x].id) {
        // this.vehiculosAsignados[i].selected = false;
        // this.vehiculosAsignados.splice(i, 1);
        // this.vehiculosAsignadosModel.splice(i, 1);
        // break;
        
      }
     }
    }*/
  // }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivF').scrollIntoView(true);
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

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.btnBloquear = true;
      this.loadingService.showLoading();

      let model = {
        Id: 0,
        PadreId:
          this.selectedFlotaPadre === null ||
          this.selectedFlotaPadre === undefined ||
          this.selectedFlotaPadre.length == 0
            ? 0
            : this.selectedFlotaPadre,
        ClienteId: this.selectedCliente,
        ResponsableFlotaId:
          this.selectedResponsableFlota === undefined ||
          this.selectedResponsableFlota.length == 0
            ? 0
            : this.selectedResponsableFlota,
        ResponsableMantenimientoFlotaId:
          this.selectedResponsableMantencion === undefined ||
          this.selectedResponsableMantencion.length == 0
            ? 0
            : this.selectedResponsableMantencion,
        Nombre: this.editedItem.nombre,
        Descripcion: this.editedItem.descripcion,
        Estado: EstadoEntidad.Activo,
      };

      try {
        const res: any = await this.axiosVehiculo.http.post(
          `${this.controller}/`,
          model
        );

        /*await this.grabarAsociacionesUsuarios(res.data.id);
        await this.notificaCorreoVehiculoCompartido();
        await this.grabaAsociacionesVehiculos(res.data.id);
        await this.grabaAsociacionesSubFlotas(res.data.id);*/

        //performance
        await this.grabarAsociacionesUsuariosV2(res.data.id);
        await this.notificaCorreoVehiculoCompartidoV2();
        await this.grabaAsociacionesVehiculosV2(res.data.id);
        await this.grabaAsociacionesSubFlotasV2(res.data.id);
        //-----

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Flota',
            creadoA: 'creada',
          })
        );
        this.closeModal(false);
      } catch (e) {
        this.loadingService.hideLoading();
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', { entidad: 'la Flota' })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'la Flota' })
          );
        }
      } finally {
        this.btnBloquear = false;
        this.loadingService.hideLoading();
      }
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async grabarAsociacionesUsuarios(nuevaFlotaId: number) {
    if (this.usuariosAsignados.length > 0) {
      for (let usuario of this.usuariosAsignados) {
        await this.axiosVehiculo.http.post(
          `${this.controller}/${nuevaFlotaId}/usuario/${usuario.id}`
        );
      }
    }
  }

  //performance
  async grabarAsociacionesUsuariosV2(nuevaFlotaId: number) {
    if (this.usuariosAsignados.length > 0) {
      let idsUsuarios: any[] = [];
      for (let usuario of this.usuariosAsignados) {
        const data = {
          idUsuario: usuario.id,
          nombre: usuario.nombre,
          apellidoPaterno: usuario.apellidoPaterno,
        };
        idsUsuarios.push(data);
      }

      let modelAsociacionesUsuarios = {
        flotaId: nuevaFlotaId,
        usuariosId: idsUsuarios,
      };

      await this.axiosVehiculo.http.post(
        `${this.controller}/usuarios`,
        modelAsociacionesUsuarios
      );
    }
  }

  async grabaAsociacionesVehiculos(nuevaFlotaId: number) {
    if (this.vehiculosAsignados.length > 0) {
      for (let vehiculo of this.vehiculosAsignados) {
        await this.axiosVehiculo.http.post(
          `${this.controller}/${nuevaFlotaId}/vehiculo/${vehiculo.id}`
        );
      }
    }
  }

  //performance
  /*async grabaAsociacionesVehiculosV2(nuevaFlotaId: number) {
    if (this.vehiculosAsignados.length > 0) {
      let idsVehiculos: any[] = [];
      for (let vehiculo of this.vehiculosAsignados) {
        const data = {
          idVehiculo: vehiculo.id,
          unidad: vehiculo.unidad,
          patente: vehiculo.patente,
        };
        idsVehiculos.push(data);
      }
      let modelAsociacionesVehiculos = {
        flotaId: nuevaFlotaId,
        vehiculosId: idsVehiculos,
      };
      await this.axiosVehiculo.http.post(
        `${this.controller}/vehiculos`,
        modelAsociacionesVehiculos
      );
    }
  }*/

  async grabaAsociacionesVehiculosV2(nuevaFlotaId: number) {
    if (this.vehiculosAsignados.length > 0) {
      let vehiculosFlotaModelListPost: any = [];

      for (let vehiculo of this.vehiculosAsignados) {
        let flotaModel = {
          flotaId: nuevaFlotaId,
          vehiculoId: vehiculo.id,
          clienteId: config.getClienteSesion(),
        };
        vehiculosFlotaModelListPost.push(flotaModel);
      }

      if (vehiculosFlotaModelListPost.length > 0) {
        if (this.duplicateVehicle) {
          await this.axiosVehiculo.http.post(
            `${this.controllerVehiculoFlota}/asocia/`,
            vehiculosFlotaModelListPost
          );
        } else {
          await this.axiosMetabase.http
            .post('Metabase/PostgenericA/track/assignFleet', {
              vehicles: vehiculosFlotaModelListPost,
              id_user: this.getUserID().toString(),
            })
            .then((response: any) => {
              if (response.data.CODIGO_RESPUESTA == '1') {
                this.$snotify.success(response.data.message);
              } else {
                this.$snotify.error(response.data.MENSAJE_RESPUESTA);
              }
            })
            .catch((error: any) => {
              console.log(error);
              this.$snotify.error(
                'Ocurrió un error al asociar los vehículos a la flota.'
              );
            })
            .finally(() => {
              this.duplicateVehicle = true;
            });
        }
      }
    }
  }

  //Si alguno de los vehiculos pertenece a una flota compartida, se debe notificar al usuario
  async notificaCorreoVehiculoCompartido() {
    if (this.vehiculosAsignados.length > 0) {
      this.vehiculosAsignados.forEach(async (item: any) => {
        const model: number[] = [item.id];
        const flotaActualId = item.flotaActual.id;
        const res: any = await this.axiosVehiculo.http.get(
          `vehiculo/${
            item.id
          }/${config.getClienteSesion()}/vehiculoEsCompartido`
        );

        //Filtrar que sea Tipo Compartir Flota
        res.data = res.data.filter(
          (x: any) => x.compartirTipo === TipoCompartir.Flota
        );

        if (res.data.length > 0) {
          //es compartido
          await this.enviarCorreoRemover(model, flotaActualId);
        }
      });
    }
  }
  //---

  //performance
  //Si alguno de los vehiculos pertenece a una flota compartida, se debe notificar al usuario
  async notificaCorreoVehiculoCompartidoV2() {
    if (this.vehiculosAsignados.length > 0) {
      this.vehiculosAsignados.forEach(async (item: any) => {
        const model: number[] = [item.id];
        const flotaActualId = item.flotaActual.id;
        const res: any = await this.axiosVehiculo.http.get(
          `vehiculo/${
            item.id
          }/${config.getClienteSesion()}/vehiculoEsCompartido`
        );

        //Filtrar que sea Tipo Compartir Flota
        res.data = res.data.filter(
          (x: any) => x.compartirTipo === TipoCompartir.Flota
        );

        if (res.data.length > 0) {
          //es compartido
          await this.enviarCorreoRemover(model, flotaActualId);
        }
      });
    }
  }
  //---

  async enviarCorreoRemover(vehiculosIds: number[], flotaId: number) {
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: '',
      url: '',
      idEntidad: flotaId,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: flotaId,
      compartirInformacionId: 0,
      vehiculosIds: vehiculosIds,
    };

    const res: any = await this.axiosAuth.http.post(
      `Email/RemoverVehiculos`,
      modelEmail
    );
  }

  async grabaAsociacionesSubFlotas(flotaNuevaId: number) {
    if (this.subFlotasAsignados.length > 0) {
      let model: any = [];

      this.subFlotasAsignados.forEach(subflota => {
        model.push({
          Id: subflota.id,
          ClienteId: subflota.clienteId,
          ResponsableFlotaId: 0,
          ResponsableMantenimientoFlotaId: 0,
          Nombre: subflota.nombre,
          Descripcion: subflota.descripcion,
          Estado: EstadoEntidad.Activo,
        });
      });

      await this.axiosVehiculo.http.put(
        `${this.controller}/${flotaNuevaId}/subflota/`,
        model
      );
    }
  }

  //performance
  async grabaAsociacionesSubFlotasV2(flotaNuevaId: number) {
    if (this.subFlotasAsignados.length > 0) {
      let model: any = [];

      this.subFlotasAsignados.forEach(subflota => {
        model.push({
          Id: subflota.id,
          ClienteId: subflota.clienteId,
          ResponsableFlotaId: 0,
          ResponsableMantenimientoFlotaId: 0,
          Nombre: subflota.nombre,
          Descripcion: subflota.descripcion,
          Estado: EstadoEntidad.Activo,
        });
      });

      await this.axiosVehiculo.http.put(
        `${this.controller}/${flotaNuevaId}/subflota/`,
        model
      );
    }
  }

  errorCallback(error: any) {
    let he = new HandleErrors();
    he.showError(error);
    this.dialogConfirmacion = false;
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivF').scrollIntoView(true);
    this.keyNombre += 1;
    this.btnBloquear = false;
    this.buscarUsuario = '';
    this.buscarVehiculo = '';
    this.buscarSubFlota = '';
    this.gridApi.setQuickFilter('');
    this.gridApiSubFlotas.setQuickFilter('');
    this.gridApiVehiculos.setQuickFilter('');
    this.usuariosRespaldo = [];
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.usuariosRespaldo = [];
    this.usuariosAsignados = [];
    this.vehiculosRespaldo = [];
    this.vehiculosAsignados = [];
    this.subFlotasRespaldo = [];
    this.subFlotasAsignados = [];
    this.dialog = false;
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyVehiculo(params: GridReadyEvent) {
    this.gridApiVehiculos = params.api;
    this.columnApiVehiculos = params.columnApi;
  }

  onGridReadySubFlota(params: GridReadyEvent) {
    this.gridApiSubFlotas = params.api;
    this.columnApiSubFlotas = params.columnApi;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  getUsuarios() {
    let clienteSesion = config.getClienteSesion();
    this.axiosGestionUsuarios.http
      .get(`${this.controllerUsuario}/${clienteSesion}/usuariosAsignar`)
      .then(res => {
        const self = this;
        //Solo Usuarios Activos
        res.data = res.data.filter(
          (x: any) => x.estado == EstadoEntidad.Activo
        );
        this.usuariosRespaldo = res.data;
        this.getVehiculos();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener lista de Usuarios.'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Usuarios.');
        }
      });
  }

  getVehiculos() {
    this.axiosVehiculo.http
      .get(`${this.controllerVehiculo}/${this.idCliente}/vehiculosClienteV2`) //Se usa el mismo metodo en el Crear y Editar
      .then(res => {
        const self = this;
        this.vehiculosRespaldo = res.data;
        this.getClientes();
        if (this.vehiculosRespaldo.length > 0) {
          this.muestraVehiculos = true;
        } else {
          this.muestraVehiculos = false;
        }
      })
      .catch(err => {
        this.loadingService.hideLoading();
        if (err.response !== undefined) {
          if (err.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener lista de Vehículos'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Vehículos');
        }
      });
  }

  getFlotas() {
    this.axiosVehiculo.http
      //.get(this.controller)
      .get(`${this.controller}/FlotasPorCliente/`)
      .then(res => {
        //let clienteSesion = config.getClienteSesion();
        const self = this;
        res.data = res.data.map((subFlota: FlotaInterface) => ({
          ...subFlota,
          estadoTxt: EstadoEntidad[subFlota.estado],
        }));
        this.flotas = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo //&& x.clienteId === clienteSesion
        );
        this.subFlotasRespaldo = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo //&& x.clienteId === clienteSesion
        );

        this.subFlotasRespaldo.forEach((flota: FlotaInterface) => {
          if (flota.descripcion === null) {
            flota.descripcion = '';
          }
        });

        if (this.subFlotasRespaldo.length > 0) {
          this.muestraSub = true;
        } else {
          this.muestraSub = false;
        }
        this.loadingService.hideLoading();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener lista de Flotas');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Flotas');
        }
      });
  }

  getClientes() {
    const clienteId = config.getClienteSesion();
    this.axiosClientes.http
      .get(`${this.controllerCliente}/${clienteId}/ClientePorId`)
      .then(res => {
        this.clientes = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo
        );

        if (clienteId != null) {
          this.selectedCliente = clienteId;
        }

        this.getFlotas();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener lista de Clientes'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Clientes');
        }
      });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  fechaFilterTxt(r: any) {
    return this.$options.filters.formatDate(r);
  }

  createButtonCell(params: any) {
    let evento = this.removerUsuarioAsignacion;
    const item = this.usuariosRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item);
    });

    return eButton;
  }

  createButtonCellVehiculo(params: any) {
    const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerVehiculoAsignacion(item);
    });

    return eButton;
  }

  createButtonCellVehiculoAlerta(params: any) {
    if (this.vehiculosRespaldo.length > 0) {
      let evento = this.removerVehiculoAsignacion;
      const item: any = this.vehiculosRespaldo.find(
        x => x.id == params.data.id
      );

      if (item !== undefined && item !== null) {
        if (item.vehiculosFlotas !== undefined) {
          const vehiculosasociados = item.vehiculosFlotas.filter(
            (y: any) =>
              y.vehiculoId == params.data.id &&
              y.flotaId != this.flota.id &&
              y.fechaFinAsociacion == null
          );

          if (vehiculosasociados.length > 0) {
            if (
              item.flotaActual.clienteId !== undefined &&
              item.flotaActual.clienteId === this.idCliente &&
              item.flotaActual.id !== this.flota.id
            ) {
              var eButton = document.createElement('i');
              eButton.setAttribute(
                'title',
                'Asignado a Flota: ' + item.flotaActual.nombre
              );
              eButton.innerHTML =
                '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
              return eButton;
            }
          }
        }
      }
    }
  }

  createButtonCellVehiculoCompartido(params: any) {
    if (this.vehiculosRespaldo.length > 0) {
      if (params.data.esCompartido === true) {
        const compartidoPor: any = this.vehiculosRespaldo.find(
          (x: any) => x.id === params.data.id
        );
        var eButton = document.createElement('i');
        eButton.setAttribute(
          'title',
          'Vehículo compartido por: ' + compartidoPor.compartidoPor
        );
        eButton.innerHTML =
          '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i>';
        return eButton;
      }
    }
  }

  createButtonCellSubFlota(params: any) {
    let evento = this.removerSubFlotaAsignacion;
    const item = this.subFlotasRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item);
    });

    return eButton;
  }

  createButtonCellSubFlotaAlerta(params: any) {
    if (this.subFlotasRespaldo.length > 0) {
      const item: any = this.subFlotasRespaldo.find(
        x => x.id == params.data.id
      );
      if (item !== undefined && item !== null) {
        if (item.padreId != 0) {
          var eButton = document.createElement('i');
          eButton.setAttribute('title', 'Asignada a otra Flota');
          eButton.innerHTML =
            '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
          return eButton;
        }
      }
    }
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
    if (this.usuariosAsignados.length === this.usuariosRespaldo.length) {
      this.seleccionoTodosUsuarios = true;
    } else {
      this.seleccionoTodosUsuarios = false;
    }
  }

  removerVehiculoAsignacion(item: IVehiculo) {
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      if (this.vehiculosAsignados[i].id == item.id) {
        this.vehiculosAsignados[i].selected = false;
        this.vehiculosAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.vehiculosAsignadosModel.length - 1; i++) {
      if (this.vehiculosAsignadosModel[i] == item.id) {
        this.vehiculosAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodosVehiculos = true;
    } else {
      this.seleccionoTodosVehiculos = false;
    }

    let v: any = [];
    v = item;
    let va = v.vehiculosFlotas.filter((y: any) => y.vehiculoId == item.id);

    if (va.length > 0 && this.cantidadVehiculosYaAsociados > 0) {
      this.cantidadVehiculosYaAsociados -= 1;
    }
  }

  removerSubFlotaAsignacion(item: FlotaInterface) {
    for (let i = 0; i <= this.subFlotasAsignados.length - 1; i++) {
      if (this.subFlotasAsignados[i].id == item.id) {
        this.subFlotasAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.subFlotassAsignadosModel.length - 1; i++) {
      if (this.subFlotassAsignadosModel[i] == item.id) {
        this.subFlotassAsignadosModel.splice(i, 1);
        break;
      }
    }
    if (this.subFlotasAsignados.length === this.subFlotasRespaldo.length)
      this.seleccionoTodosSub = true;
    else this.seleccionoTodosSub = false;
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
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        lockPinned: true,
        minWidth: 80,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Correo Electrónico',
        field: 'email',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
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
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
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
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Nac.',
        field: 'fechaNacimiento',
        valueFormatter: this.fechaFilter,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => null,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        field: 'fechaNacimientoTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
    ];

    this.columnDefsVehiculos = [
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
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        field: 'esCompartido',
        width: 90,
        minWidth: 90,
        cellRenderer: this.createButtonCellVehiculoAlerta,
        enablePivot: false,
        lockPinned: true,
        resizable: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
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
        headerName: '',
        cellRenderer: this.createButtonCellVehiculoCompartido,
        enablePivot: false,
        lockPinned: true,
        suppressMenu: false,
        width: 70,
        minWidth: 80,
        filter: false,
        lockVisible: true,
        sortable: false,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
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
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.columnDefsSubFlotas = [
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
        lockPinned: true,
        resizable: true,
        sortable: true,
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 90,
        minWidth: 90,
        cellRenderer: this.createButtonCellSubFlotaAlerta,
        enablePivot: false,
        lockPinned: true,
        resizable: false,
        sortable: false,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        lockPinned: true,
        sortable: true,
        width: 200,
        minWidth: 80,
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
        lockPinned: true,
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
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
        lockPinned: true,
        field: 'estadoTxt',
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.dictionaryFormErrors = {
      custom: {
        clienteId: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        cliente: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  onSelectedChangeSubFlota() {
    this.subFlotasAsignados = this.gridApiSubFlotas.getSelectedRows();
    const SubSeleccionados = this.gridApiSubFlotas
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const SubFlotasNoSeleccionados = differenceBy(
      this.subFlotasRespaldo,
      SubSeleccionados,
      sub => sub.id
    ).map(sub => ({
      ...sub,
      checked: false,
    }));

    this.gridApiSubFlotas.updateRowData({
      update: [...SubFlotasNoSeleccionados, ...SubSeleccionados],
    });
  }
  onFilterTextBoxChangedAsociarSubFlota() {
    this.gridApiSubFlotas.onFilterChanged();
    // if (this.buscarSubFlota.length > 1) {
    //   this.gridApiSubFlotas.setQuickFilter(this.buscarSubFlota);
    // } else {
    //   this.gridApiSubFlotas.setQuickFilter('');
    // }
  }
  onSelectedChangeUsuarios() {
    this.usuariosAsignados = this.gridApi.getSelectedRows();
    const UsuariosSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const UsuariosNoSeleccionados = differenceBy(
      this.usuariosRespaldo,
      UsuariosSeleccionados,
      veh => veh.id
    ).map(veh => ({
      ...veh,
      checked: false,
    }));

    this.gridApi.updateRowData({
      update: [...UsuariosNoSeleccionados, ...UsuariosSeleccionados],
    });
  }
  onFilterTextBoxChangedAsociarUsuarios() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarUsuario.length > 1) {
      this.gridApi.setQuickFilter(this.buscarUsuario);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }
  onSelectedRowVehiculos(e: any) {
    this.eDataNuevo = e;
  }
  async onSelectedChangeVehiculos(e: any) {
    await this.ordenaVehiculo();
    this.vehiculosAsignados = this.gridApiVehiculos.getSelectedRows();
    await this.call();
  }
  ordenaVehiculo() {
    const vehiculosSeleccionados = this.gridApiVehiculos
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const vehiculosNoSeleccionados = differenceBy(
      this.vehiculosRespaldo,
      vehiculosSeleccionados,
      veh => veh.id
    ).map(veh => ({
      ...veh,
      checked: false,
    }));

    this.gridApiVehiculos.updateRowData({
      update: [...vehiculosNoSeleccionados, ...vehiculosSeleccionados],
    });
    this.gridApiVehiculos.forEachNode(n => {
      if (n.data.id === this.eDataNuevo.data.id) {
        this.indexVehiculo = n.rowIndex;
      }
    });
  }
  call() {
    if (
      this.vehiculosAsignados.length -
        this.vehiculosAsignadosRespaldoGrilla.length ==
        1 ||
      this.vehiculosAsignados.length -
        this.vehiculosAsignadosRespaldoGrilla.length ==
        0
    ) {
      this.vehiculosAsignados.forEach(veh => {
        let existe = this.vehiculosAsignadosRespaldoGrilla.filter(
          x => x.id === veh.id
        );
        if (existe.length === 0) {
          this.validaTodo(veh);
        }
      });
    } else if (
      this.vehiculosAsignados.length -
        this.vehiculosAsignadosRespaldoGrilla.length >
      1
    ) {
      this.changeVehiculob();
    }
    this.vehiculosAsignadosRespaldoGrilla = this.vehiculosAsignados;
  }
  onFilterTextBoxChangedAsociarVehiculo() {
    this.gridApiVehiculos.onFilterChanged();
    // if (this.buscarVehiculo.length > 1) {
    //   this.gridApiVehiculos.setQuickFilter(this.buscarVehiculo);
    // } else {
    //   this.gridApiVehiculos.setQuickFilter('');
    // }
  }
  getRowNodeIdVehiculosNuevo(veh: IVehiculo) {
    if (!veh) {
      return;
    }
    return veh.id;
  }
  getRowNodeIdUsuarioNuevo(us: UsuariosInterface) {
    if (!us) {
      return;
    }
    return us.id;
  }
  getRowNodeIdSubFlotasNuevo(sf: FlotaInterface) {
    if (!sf) {
      return;
    }
    return sf.id;
  }

  procesarFecha(params: any) {
    if (params.column.getColDef().field === 'fechaNacimiento') {
      return this.$options.filters.formatDate(params.value);
    } else {
      return params.value;
    }
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentUsuario(): boolean {
    return true;
  }

  doesExternalFilterPassUsuario(node: RowNode): boolean {
    if (this.usuariosRespaldo.length > 0 && this.buscarUsuario.length > 1) {
      let busqueda = this.buscarUsuario.toLowerCase();
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

  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehiculo.length > 1) {
      let busqueda = this.buscarVehiculo.toLowerCase();
      return (
        node.data.patente.toLowerCase().includes(busqueda) ||
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.tipoVehiculo.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentSubFlota(): boolean {
    return true;
  }

  doesExternalFilterPassSubFlota(node: RowNode): boolean {
    if (this.subFlotasRespaldo.length > 0 && this.buscarSubFlota.length > 1) {
      let busqueda = this.buscarSubFlota.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }
  //---
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}

.ag-header-cell-label {
  justify-content: center;
}
.v-menu__content
  .theme--light
  .menuable__content__active
  .v-autocomplete__content {
  z-index: 203 !important;
}
</style>

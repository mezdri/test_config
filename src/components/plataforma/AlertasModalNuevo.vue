<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      fullscreen
      persistent
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivV">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Crear Alerta</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar()"
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
              >Configurar Alerta</v-stepper-step
            >
            <v-divider v-show="informacionGeneral.visible"></v-divider>
            <v-stepper-step
              v-show="asociarVehiculoFlota.visible"
              :complete="e1 > asociarVehiculoFlota.step"
              :step="asociarVehiculoFlota.step"
              >Asociar Flotas, Etiquetas o Vehículos</v-stepper-step
            >
            <v-divider v-show="asociarVehiculoFlota.visible"></v-divider>
            <v-stepper-step
              v-show="configuracionNotificaciones.visible"
              :complete="e1 > configuracionNotificaciones.step"
              :step="configuracionNotificaciones.step"
              >Configurar Notificaciones</v-stepper-step
            >
            <!--<v-divider v-show="configuracionNotificaciones.visible"></v-divider>-->
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
                              <h2 class="h2_title">Configurar Alerta</h2>
                            </v-flex>
                          </div>
                        </v-layout>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.nombre"
                              v-validate="{
                                rules: {
                                  required: true,
                                  max: 100,
                                  NombreUnico: true,
                                  regex: regexEmoji,
                                },
                              }"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              :counter="100"
                              @keydown="preventPunto"
                              @paste="preventPunto"
                              label="Nombre Alerta"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="tipoAlerta"
                              v-validate="'required'"
                              :error-messages="errors.collect('tipoAlerta')"
                              data-vv-name="tipoAlerta"
                              label="Tipo De Alerta"
                              :items="tiposAlertas"
                              class="styled-select"
                              readonly
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-autocomplete
                              v-model="tipificacion"
                              v-validate="'required'"
                              item-value="title"
                              item-text="title"
                              :error-messages="errors.collect('tipificacion')"
                              data-vv-name="tipificacion"
                              label="Color Tipificación"
                              no-data-text="Sin resultados"
                              :items="colores"
                              class="styled-select"
                            >
                              <template v-slot:selection="data">
                                <v-avatar
                                  :color="data.item.icon"
                                  size="20"
                                ></v-avatar>
                                &nbsp;{{ data.item.title }}
                              </template>
                              <template v-slot:item="data">
                                <template v-if="typeof data.item !== 'object'">
                                  <v-list-tile-content
                                    v-text="data.item"
                                  ></v-list-tile-content>
                                </template>
                                <template v-else>
                                  <v-list-tile-avatar
                                    :color="data.item.icon"
                                  ></v-list-tile-avatar>
                                  <v-list-tile-content>
                                    <v-list-tile-title
                                      v-html="data.item.title"
                                    ></v-list-tile-title>
                                  </v-list-tile-content>
                                </template>
                              </template>
                            </v-autocomplete>
                          </v-flex>
                        </v-layout>
                        <v-layout wrap>
                          <!--Configuracion de alerta de tipo Exceso de velocidad-->
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="velocidadMaxima.velocidadMaxima"
                              menu-props="auto"
                              v-validate="
                                'required|numeric|integer|max:3|max_value:240|min_value:0'
                              "
                              :error-messages="
                                errors.collect('velocidadAdicional')
                              "
                              data-vv-name="velocidadAdicional"
                              :counter="3"
                              class="styled-select"
                              label="Velocidad Máxima en km/h"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="velocidadMaxima.tolerancia"
                              v-validate="
                                'required|numeric|integer|max:2|max_value:99|min_value:0'
                              "
                              :error-messages="errors.collect('tolerancia')"
                              data-vv-name="tolerancia"
                              class="styled-select"
                              label="Tolerancia en km/h"
                              type="text"
                              :counter="2"
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs122 sm12 md6>
                            <v-text-field
                              v-model="editedItem.cantidadEventos"
                              v-validate="{
                                rules: {
                                  required:
                                    !editedItem.temporalidad ||
                                    editedItem.temporalidad == 0
                                      ? true
                                      : false,
                                  numeric: true,
                                  max: 3,
                                  min_value:
                                    editedItem.temporalidad < 1 ? 1 : 0,
                                  integer: true,
                                },
                              }"
                              :error-messages="
                                errors.collect('numeroRepeticiones')
                              "
                              data-vv-name="numeroRepeticiones"
                              :counter="3"
                              class="styled-select"
                              label="Número de Eventos"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.temporalidad"
                              v-validate="{
                                rules: {
                                  required:
                                    !editedItem.cantidadEventos ||
                                    editedItem.cantidadEventos == 0
                                      ? true
                                      : false,
                                  numeric: true,
                                  max: 3,
                                  min_value:
                                    editedItem.cantidadEventos < 1 ? 1 : 0,
                                  integer: true,
                                },
                              }"
                              :error-messages="errors.collect('temporalidad')"
                              data-vv-name="temporalidad"
                              :counter="3"
                              label="Temporalidad en min."
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <!---->
                          <v-flex xs12 sm12 md12>
                            <v-switch
                              :label="estadoAlerta ? 'Activo' : 'Inactivo'"
                              v-model="estadoAlerta"
                              color="success"
                            ></v-switch>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content
              v-show="asociarVehiculoFlota.visible"
              :step="asociarVehiculoFlota.step"
            >
              <asociar-vfe :show="show" ref="asociar"></asociar-vfe>
            </v-stepper-content>

            <v-stepper-content
              v-show="configuracionNotificaciones.visible"
              :step="configuracionNotificaciones.step"
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
                      <v-container grid-list-md text-xs-center>
                        <v-layout row wrap>
                          <div align="left">
                            <v-flex md12>
                              <h2 class="h2_title">
                                Configurar Notificaciones
                              </h2>
                            </v-flex>
                          </div>
                        </v-layout>
                        <v-divider></v-divider>
                        <v-layout row wrap>
                          <v-flex xs12 sm6 md6>
                            <v-text-field
                              v-model="buscarUsu"
                              label="Buscar..."
                              @input="onFilterTextBoxChangedUsu"
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                          <v-flex md12>
                            <v-card>
                              <ag-grid-vue
                                style="width: 100%; height: 350px;"
                                class="ag-theme-material"
                                :columnDefs="columnDefsUsu"
                                :rowData="usuariosRespaldo"
                                rowSelection="multiple"
                                rowMultiSelectWithClick="false"
                                pagination="true"
                                paginationPageSize="10"
                                suppressRowClickSelection="true"
                                suppressCopyRowsToClipboard="true"
                                :sideBar="sideBar"
                                :localeText="localeText"
                                :postProcessPopup="onClickCell"
                                :onGridReady="onGridReady"
                                :suppressCsvExport="true"
                                :suppressExcelExport="true"
                                key="gridUsu"
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
                        <v-divider></v-divider>
                        <br />
                        <v-layout row wrap>
                          <div align="left">
                            <v-flex md12>
                              <h2 class="h2_title">
                                Notificar vía Correo Electrónico
                              </h2>
                            </v-flex>
                          </div>
                        </v-layout>
                        <v-layout row wrap>
                          <v-flex md12></v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="alertaMail.emailEnvio"
                              label="Correos Electrónicos"
                              v-validate="{
                                rules: {
                                  regex: /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4};?)+$/,
                                  max: 2000,
                                },
                              }"
                              :error-messages="
                                errors.collect('Correo Electrónico')
                              "
                              data-vv-name="Correo Electrónico"
                              type="text"
                              :counter="2000"
                              hint='Escriba los correos separados por "punto y coma"(;) sin espacios'
                              persistent-hint
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Alerta' })"
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: 'la Alerta' })"
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
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import HandleErrors from '@/config/handleErrors'; //
import Confirmation from '@/components/Confirmation.vue'; //
import { Component, Prop, Watch } from 'vue-property-decorator'; //
import { Funcionalidades } from '@/config/funcionalidades'; //
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm'; //
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper'; //
import { Validator } from 'vee-validate';
import {
  AlertasInterface,
  VelocidadMaximaInterface,
  AlertaMailInterface,
} from '@/interfaces/Alertas';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import store from '@/store';
import ValidaRut from '@/config/validaRut';
import AsociarVFE from '@/components/AsociarVFE.vue'; //
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
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    'asociar-vfe': AsociarVFE,
  },
})
export default class AlertasModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean; //
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) }) //
  Alerta!: AlertasInterface;

  //abstract
  readonly usuarioController: string = 'Usuario';
  readonly funcionalidad: Funcionalidades = Funcionalidades.Alertas; //
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerFlota: string = 'flota';
  readonly controllerEtiqueta: string = 'VehiculoEtiqueta';
  permisosActuales: PermisoAccionVm[] = [];

  //Modales
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Configurar Alerta',
    visible: true,
    step: 1,
    codigoSubAccion: 40,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarVehiculoFlota: PermisoAccionVm = {
    accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 41,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  configuracionNotificaciones: PermisoAccionVm = {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 4,
    codigoSubAccion: 42,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarVehiculoFlota,
    this.configuracionNotificaciones,
  ];

  //Variables globales
  $snotify: any; //
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  loadingService = new LoadingService();
  usuarioId: number = store.state.userId;
  clienteId: number = config.getClienteSesion();

  //Se importan la validacion para que en el input de nombre no existan emojis
  vr: ValidaRut = new ValidaRut();
  regexEmoji: any = this.vr.regexEmoji;

  //AXIOS
  axiosAlertas: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //grilla
  localeText: any = config.agGridTextos; //
  gridApi: GridApi; //
  columnApi: ColumnApi; //
  columnDefs: Array<ColDef> = []; //
  sideBar: any = config.agGridDefaultConfig; //

  created() {
    this.chequearPermisos(); //
  }

  mounted() {
    this.initialize(); //
    this.registrarValidadores();
  }

  initialize() {
    this.columnDefsUsu = [
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
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        resizable: true,
        width: 200,
        minWidth: 200,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        suppressMovable: true,
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
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 200,
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
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 200,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          regex: () => '* Nombre inválido.',
        },
        tipoAlerta: {
          required: () => config.errorMensajes.textoRequerido,
        },
        tipificacion: {
          required: () => config.errorMensajes.textoRequerido,
        },
        velocidadAdicional: {
          required: () => config.errorMensajes.textoRequerido,
          max_value: () => config.errorMensajes.maxLength,
          min_value: () => '* El valor no puede ser negativo.',
          integer: () =>
            '* El campo Velocidad Máxima solo debe contener números enteros.',
          numeric: () =>
            '* El campo Velocidad Máxima solo debe contener números enteros',
          max: () => config.errorMensajes.maxLength,
        },
        tolerancia: {
          required: () => config.errorMensajes.textoRequerido,
          max_value: () => config.errorMensajes.maxLength,
          min_value: () => '* El valor no puede ser negativo.',
          integer: () =>
            '* El campo Tolerancia solo debe contener números enteros.',
          numeric: () =>
            '* El campo Tolerancia solo debe contener números enteros',
          max: () => config.errorMensajes.maxLength,
        },
        numeroRepeticiones: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          min_value: () => '* El valor no puede ser menor a 1.',
          integer: () =>
            '* El campo Número de Eventos solo debe contener números enteros.',
          numeric: () =>
            '* El campo Número de Eventos solo debe contener números enteros',
        },
        temporalidad: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          min_value: () => ' * El valor no puede ser menor a 1.',
          integer: () =>
            '* El campo Temporalidad solo debe contener números enteros.',
          numeric: () =>
            '* El campo Temporalidad solo debe contener números enteros',
        },
        usuarios: {
          required: () => config.errorMensajes.textoRequerido,
        },
        'Correo Electrónico': {
          required: () => config.errorMensajes.textoRequerido,
          regex: () => '* Correo Electrónico inválido.',
          max: () => config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();
    Validator.extend('NombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Alerta con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosAlertas.http
            .get(
              `AlertaConfiguracion/${0}/${clienteId}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message: '* Ya existe una Alerta con este nombre.',
                      },
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
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value; //
    this.btnBloquear = false; //
    this.btnText = 'Continuar'; //
    this.btnClass = 'btn-continuar'; //

    this.tipoAlerta = 'Exceso de velocidad';
    this.alertaMail.emailEnvio = '';

    if (value) {
      this.getUsuarios();
      //this.getTiposAlertas();
    }
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivV').scrollIntoView(true);
        if (this.e1 === this.permisosActuales.length) {
          this.usuariosAsignados = this.gridApi.getSelectedRows();
          if (
            this.usuariosAsignados.length == 0 &&
            this.alertaMail.emailEnvio.length == 0
          ) {
            this.$snotify.error(
              'Debe seleccionar al menos un destinatario a notificar.'
            );
          } else {
            this.btnBloquear = true;
            this.dialogConfirmacion = true;
          }
        } else if (this.e1 === this.permisosActuales.length - 1) {
          var ref = this.$refs.asociar as any;
          this.flotasAsignados = ref.flotasAsignados;
          this.etiquetasAsignados = ref.etiquetasAsignados;
          this.vehiculosAsignados = ref.vehiculosAsignados;
          if (
            this.flotasAsignados.length == 0 &&
            this.etiquetasAsignados.length == 0 &&
            this.vehiculosAsignados.length == 0
          ) {
            this.$snotify.error(
              'Debe asociar al menos una Flota, Etiqueta o Vehículo'
            );
          } else {
            this.e1 += 1;
            this.btnText = 'Guardar';
            this.btnClass = 'btn-grabar';
          }
        } else {
          this.e1 += 1;
        }
      }
    });
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivV').scrollIntoView(true);
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivV').scrollIntoView(true);
    this.tipificacion = '';
    this.btnBloquear = false;
    this.$validator.reset();

    this.editedItem = {};
    this.velocidadMaxima = {};
    this.tipoConfig = 0;
    this.estadoAlerta = true;

    this.usuariosRespaldo = [];
    this.usuariosAsignados = [];
    this.alertaMail = {};
    this.buscarUsu = '';
    this.gridApi.setQuickFilter('');

    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
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

  //#region Informacion General
  velocidadMaxima: VelocidadMaximaInterface = {};
  editedItem: AlertasInterface = {};
  tipificacion: any = '';
  tipoAlerta: string = 'Exceso de velocidad';
  tiposAlertas: any[] = ['Exceso de velocidad'];
  estadoAlerta: boolean = true;
  selected: any[] = [];
  tipoConfig: number = 0;
  colores: any = [
    {
      title: 'Roja',
      icon: 'red',
    },
    {
      title: 'Amarilla',
      icon: 'yellow',
    },
    {
      title: 'Verde',
      icon: 'green',
    },
  ];

  //Funcion que trae los tipos de alertas
  async getTiposAlertas() {
    try {
      this.loadingService.showLoading();
      const response = await this.axiosAlertas.http.get('AlertaTipo');
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

  preventPunto(event: any) {
    if (event.key == '.') {
      if (
        this.editedItem.nombre == undefined ||
        this.editedItem.nombre.length == 0
      ) {
        event.preventDefault();
      }
    }
    if (event.type == 'paste') {
      if (
        this.editedItem.nombre == undefined ||
        this.editedItem.nombre.length == 0
      ) {
        event.preventDefault();
      }
    }
  }

  preventEnter(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  //#region

  flotasAsignados: IFlota[] = [];
  etiquetasAsignados: IEtiqueta[] = [];
  vehiculosAsignados: IVehiculo[] = [];

  //#region Notificar
  search: string = '';
  columnDefsUsu: Array<ColDef> = [];
  usuariosAsignados: UsuariosInterface[] = [];
  usuariosRespaldo: UsuariosInterface[] = [];
  alertaMail: AlertaMailInterface = {};
  buscarUsu: string = '';

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onFilterTextBoxChangedUsu() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarUsu.length > 1) {
      this.gridApi.setQuickFilter(this.buscarUsu);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }

  async getUsuarios() {
    try {
      this.loadingService.showLoading();
      /*const response = await this.axiosAlertas.http.get(
        `Usuarios/${this.usuarioId}/${this.clienteId}`
      );*/
      const response = await this.axios.http.get(
        `Usuario/${this.usuarioId}/${this.clienteId}/getUsuariosAuditoria`
      );
      this.usuariosRespaldo = response.data;
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

  nombreCompleto(user: any): string {
    return (
      (user.nombre != undefined ? user.nombre : '') +
      ' ' +
      (user.apellidoPaterno != undefined ? user.apellidoPaterno : '') +
      ' ' +
      (user.apellidoMaterno != undefined ? user.apellidoMaterno : '')
    );
  }

  //#region

  //#region Generacion de Alerta
  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      try {
        this.loadingService.showLoading();
        this.btnBloquear = true;
        let cont: boolean = true;

        this.editedItem.color = this.tipificacion;

        if (
          this.editedItem.temporalidad == undefined ||
          this.editedItem.temporalidad == null ||
          this.editedItem.temporalidad.toString() == ''
        ) {
          this.editedItem.temporalidad = 0;
        }
        if (
          this.editedItem.cantidadEventos == undefined ||
          this.editedItem.cantidadEventos == null ||
          this.editedItem.cantidadEventos.toString() == ''
        ) {
          this.editedItem.cantidadEventos = 0;
        }
        if (
          this.editedItem.temporalidad == 0 ||
          this.editedItem.cantidadEventos == 0
        ) {
          this.tipoConfig = 1;
        } else {
          this.tipoConfig = 0;
        }

        let model = {
          id: 0,
          nombre: this.editedItem.nombre,
          color: this.editedItem.color,
          cantidadEventos: this.editedItem.cantidadEventos,
          temporalidad: this.editedItem.temporalidad,
          tipoConfiguracion: this.tipoConfig,
          estado: this.estadoAlerta === true ? 1 : 0,
          clienteId: this.clienteId,
          alertaTipoId: 1, //VelocidadMaxima Por Defecto
        };

        await this.axiosAlertas.http
          .post('AlertaConfiguracion', model)
          .then(res => {
            this.editedItem.id = res.data.id;

            this.$snotify.success(
              this.$t('mensajes.mensajesExito.crear', {
                entidad: 'Alerta',
                creadoA: 'creada',
              })
            );
          })
          .catch(error => {
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.crear', {
                    entidad: 'la Alerta',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'la Alerta',
                })
              );
            }
            cont = false;
          });

        if (cont) {
          await this.grabarUsuarios();
          await this.grabarEmails();
          await this.grabarEFVZ();
          await this.grabarVelocidadMaxima();
          this.closeModal(false);
          this.dialogConfirmacion = false;
        }
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', { entidad: 'la Alerta' })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'la Alerta' })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
    this.btnBloquear = false;
  }

  async grabarUsuarios() {
    let idsUsuarios: number[] = [];
    this.usuariosAsignados = this.gridApi.getSelectedRows();

    for (let i = 0; i <= this.usuariosAsignados.length - 1; i++) {
      idsUsuarios.push(this.usuariosAsignados[i].id);
    }

    let modelUsuarios = {
      alertaConfiguracionId: this.editedItem.id,
      usuarioIds: idsUsuarios,
    };
    await this.axiosAlertas.http.post(
      'AlertaConfiguracionNotificacionUsuario',
      modelUsuarios
    );
  }

  async grabarEmails() {
    let modelEmail = {
      id: 0,
      alertaConfiguracionId: this.editedItem.id,
      emailEnvio: this.alertaMail.emailEnvio,
    };
    await this.axiosAlertas.http.post(
      'AlertaConfiguracionEnvioEmail',
      modelEmail
    );
  }

  async grabarVelocidadMaxima() {
    let modelVelocidad = {
      id: 0,
      velocidadMaxima: this.velocidadMaxima.velocidadMaxima,
      tolerancia: this.velocidadMaxima.tolerancia,
      alertaConfiguracionId: this.editedItem.id,
    };
    await this.axiosAlertas.http.post(
      'AlertaConfiguracionVelocidad',
      modelVelocidad
    );
  }

  async grabarEFVZ() {
    let idsFlotas: number[] = [];
    let idsVehiculos: number[] = [];
    let idsEtiquetas: number[] = [];
    let idsZonas: number[] = [];

    for (let i = 0; i <= this.flotasAsignados.length - 1; i++) {
      idsFlotas.push(this.flotasAsignados[i].id);
    }
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      idsVehiculos.push(this.vehiculosAsignados[i].id);
    }
    for (let i = 0; i <= this.etiquetasAsignados.length - 1; i++) {
      idsEtiquetas.push(this.etiquetasAsignados[i].id);
    }

    let modelTrasnportes = {
      alertaConfiguracionId: this.editedItem.id,
      etiquetaIds: idsEtiquetas,
      flotaIds: idsFlotas,
      vehiculoIds: idsVehiculos,
      zonaIds: idsZonas,
    };
    await this.axiosAlertas.http.post('AlertaEfvz', modelTrasnportes);
  }

  //#region

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentUsuario(): boolean {
    return true;
  }

  doesExternalFilterPassUsuario(node: RowNode): boolean {
    if (this.usuariosRespaldo.length > 0 && this.buscarUsu.length > 1) {
      let busqueda = this.buscarUsu.toLowerCase();
      return (
        node.data.nombreCompleto.toLowerCase().includes(busqueda) ||
        node.data.email.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
html {
  overflow-y: hidden;
}
</style>

<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivZ">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquearMapa"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Zonas</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="
                back(), cierraMenu();
                btnText = 'Continuar';
                btnClass = 'btn-continuar';
              "
              :disabled="e1 <= 1"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenu()"
              :disabled="!validForm || btnBloquear ? true : false"
              >{{ btnText }}</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              v-show="dibujar.visible"
              :complete="e1 > dibujar.step"
              :step="dibujar.step"
              >Dibujar</v-stepper-step
            >
            <v-divider v-show="informacionGeneral.visible"></v-divider>
            <v-stepper-step
              v-show="informacionGeneral.visible"
              :complete="e1 > informacionGeneral.step"
              :step="informacionGeneral.step"
              >Información General</v-stepper-step
            >
            <v-divider
              v-show="editedItem.tipoZonaId === idGeocerca"
            ></v-divider>
            <v-stepper-step
              v-show="
                editedItem.tipoZonaId === idGeocerca && asociarVehiculos.visible
              "
              :complete="e1 > informacionGeneral.step + 1"
              :step="informacionGeneral.step + 1"
              >Asociar Vehículos</v-stepper-step
            >
            <!-- <v-divider></v-divider>
            <v-stepper-step :complete="e1 > 4" step="4">Configurar Alertas</v-stepper-step>-->
          </v-stepper-header>
          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="dibujar.visible"
              :step="dibujar.step"
              style="padding:0px !important;"
              :key="keyMap"
            >
              <app-google-map
                name="zonas-new"
                :show="show"
                :enableControls="enableControlsMap"
                :coordenadas="strCoords"
                :geometria="tipogeometria"
                :tipoMapaSelected="typeMap"
                :zoomMapaSelected="zoomMapSelected"
                module="zonas"
                :key="keyMap"
                :from="from"
                v-on:enableContinueEmit="enableContinue($event)"
              ></app-google-map>
            </v-stepper-content>
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
                            <v-select
                              item-value="id"
                              item-text="nombre"
                              :items="TipoZona"
                              v-model="editedItem.tipoZonaId"
                              label="Tipo de Zona"
                              data-vv-name="tipozona"
                              :error-messages="errors.collect('tipozona')"
                              v-validate="'required'"
                              @change="selectedTipoZonaId"
                              no-data-text="Sin resultados"
                              required
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Nombre"
                              v-validate="'required|NombreUnico|max:80'"
                              :counter="80"
                              data-vv-name="vnombre"
                              v-model="editedItem.nombre"
                              type="text"
                              :error-messages="errors.collect('vnombre')"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Descripción"
                              :counter="200"
                              v-model="editedItem.descripcion"
                              :error-messages="errors.collect('descripcion')"
                              data-vv-name="descripcion"
                              v-validate="'max:200'"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Dirección"
                              :counter="200"
                              v-model="editedItem.direccion"
                              data-vv-name="direccion"
                              v-validate="{ required: false, max: 200 }"
                              :error-messages="errors.collect('direccion')"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Tiempo de Estadia en minutos"
                              v-model="editedItem.tiempoEstadia"
                              v-validate="'numeric|min_value:0|max_value:1440'"
                              :error-messages="errors.collect('tiempoEstadia')"
                              data-vv-name="tiempoEstadia"
                              type="numeric"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-show="showVelocidad"
                              label="Velocidad Máxima"
                              v-model="editedItem.velocidadMaxGeo"
                              data-vv-name="velocidadMaxGeo"
                              v-validate="
                                showVelocidad ? 'numeric|velocidadMaxima' : ''
                              "
                              :error-messages="
                                errors.collect('velocidadMaxGeo')
                              "
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              item-value="id"
                              item-text="nombre"
                              :items="TipoLugar"
                              v-model="editedItem.tipoLugarId"
                              data-vv-name="tipolugar"
                              label="Grupo de Zonas"
                              :error-messages="errors.collect('tipolugar')"
                              no-data-text="Sin resultados"
                              @change="selectedTipoLugarId"
                              v-validate="'required'"
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
              v-show="
                editedItem.tipoZonaId === idGeocerca &&
                  e1 === informacionGeneral.step + 1
              "
              :step="informacionGeneral.step + 1"
            >
              <div align="center">
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
                    <br />
                    <v-layout row wrap>
                      <v-flex md6>
                        <v-text-field
                          label="Buscar..."
                          v-model="buscarVehiculosZonas"
                          @input="onFilterTextBoxChangedVehiculos"
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
                            style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                            class="ag-theme-material"
                            :columnDefs="columnDefsVehiculo"
                            :rowData="vehiculosRespaldo"
                            rowSelection="multiple"
                            rowMultiSelectWithClick="false"
                            pagination="true"
                            paginationPageSize="10"
                            suppressRowClickSelection="true"
                            :sideBar="sideBar"
                            :localeText="localeText"
                            :onGridReady="onGridReady"
                            :postProcessPopup="onClickCell"
                            @selection-changed="onSelectedChangeVehiculosZonas"
                            suppressCopyRowsToClipboard="true"
                            @row-selected="onRowSelectedVehiculoZona($event)"
                            :getRowNodeId="getRowNodeIdVehiculo"
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
              </div>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: nombreTipo })"
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: elLaNombreTipoMsj })
      "
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
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorWarning" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Error al Crear Geocerca</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>{{ mensajeAsociarGeocercas }}</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="closeErrorWarningGuardar()">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { EstadoEntidad, TiposZonas, TipoLugarAlcance } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { filtroHomeEventBus } from '@/setup';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { ServicioProxy, TipoGeometria } from '@/config/enums';

//IMPORTS PROPIOS DE ZONA
import GoogleMapDrawer from '@/components/GoogleMapDrawer.vue';
import { IZona, ITipoLugar, ITipoZona } from '@/interfaces/Zonas';
import { IVehiculoGeocerca } from '@/interfaces/Vehiculos';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import ZonaEventBus from '@/eventBus/zonaEventBus';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import ValidaRut from '@/config/validaRut';
import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { differenceBy } from 'lodash';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    'app-google-map': GoogleMapDrawer,
  },
})
export default class ZonasModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: '' }) strCoords!: string;
  @Prop({ default: 0 }) tipogeometria!: TipoGeometria;
  @Prop({ default: '' }) tipoMapaSelected!: any;
  @Prop({ default: '' }) zoomMap!: any;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) }) zonas!: IZona;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Zonas;
  permisosActuales: PermisoAccionVm[] = [];

  dibujar: PermisoAccionVm = {
    accion: 'Crear - Dibujar',
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 2,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarVehiculos: PermisoAccionVm = {
    accion: 'Crear - Asociar Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.dibujar,
    this.informacionGeneral,
    this.asociarVehiculos,
  ];

  //Variables globales
  keyMap: number = 0;
  $snotify: any;
  vr: ValidaRut = new ValidaRut();
  typeMap: any = this.tipoMapaSelected;
  zoomMapSelected: any = this.zoomMap;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IZona = {};
  controller: string = 'Coordenada';
  controllerTipoZona: string = 'tipozona';
  controllerTipoLugar: string = 'grupodezona';
  controllerVehiculo: string = 'vehiculo';
  controllerGpsVehiculo: string = 'gpsvehiculo';
  controllerGpsCoordenada: string = 'gpscoordenada';
  loadingService = new LoadingService();
  idGeocerca = TiposZonas.Geocerca;
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogErrorWarning: boolean = false;
  dialogConfirmacionClose: boolean = false;
  addressRequired: boolean = false;
  nombreTipo: string = '';
  elLaNombreTipoMsj: string = '';
  search: string = '';
  muestraVehiculos: boolean = false;
  seleccionoTodos: boolean = false;
  buscarVehiculosZonas: string = '';
  vehCount: number = 0;
  vehSelected: any = null;

  usuarioId: number = store.state.userId;
  btnBloquearMapa: Boolean = false;
  estLlamado: boolean = false;

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculoGeocerca[] = [];
  vehiculosRespaldo: IVehiculoGeocerca[] = [];

  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: any;
  columnApi: any;

  columnDefsVehiculo: any = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;

  //VARIABLES STEPPER 1
  enableControlsMap: boolean = false;
  coordShape: any = null;
  coordSelected: boolean = false;
  TipoZona: ITipoZona[] = [];
  TipoLugar: ITipoLugar[] = [];

  tipoLugarId: number;
  tipoZonaId: number;

  //filtrosVehiculo: any = [];
  showVelocidad: boolean = false;

  //Variables para Switch Alertas
  switch1: boolean = false;
  switch2: boolean = false;
  switch3: boolean = false;
  switch4: boolean = false;
  switch5: boolean = false;
  correosNotify: any = ['nombre@correo.cl'];

  from: string = 'mantenedor';

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  //---------------------------------------------------------------------------------------------------------

  //Concurrencia Geocercas
  mensajeAsociarGeocercas: any = '';
  boolCierraModal: boolean = false;
  //---

  mounted() {
    this.initialize();
    this.registrarValidadores();
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setStateLoadZonaManteiner') {
        if (store.getters.isLoadedZona) {
          this.loadingService.hideLoading();
        }
      }
    });
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setStateLoadZonaMap') {
        if (store.getters.isLoadedZona) {
          this.loadingService.hideLoading();
        }
      }
    });
    store.commit('setEsDibujar', true); //Al iniciar es "Dibujar"
    filtroHomeEventBus.$on('showCrearZone', (obj: any) => {
      this.estLlamado = obj;
    });
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    const r = this.vr;
    Validator.extend('velocidadMaxima', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Velocidad máxima debe ser un valor entre 0 y 255 km/h.'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaVelocidadGeo(value),
            data: r.validaVelocidadGeo(value)
              ? undefined
              : {
                  message:
                    '* Velocidad máxima debe ser un valor entre 0 y 255 km/h.',
                },
          });
        });
      },
    }),
      Validator.extend('NombreUnico', {
        getMessage(field: any, params: any, data: any) {
          return '* Ya existe una Zona con este nombre.';
        },
        validate(value: any) {
          if (value !== '') {
            return self.axiosGps.http
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
                      : {
                          message: '* Ya existe una Zona con este nombre.',
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

  created() {
    this.chequearPermisos();
    ZonaEventBus.$on('resetCreation', () => {
      this.e1 = 1;
      this.btnBloquear = true;
    });

    ZonaEventBus.$on('showMsgError', (msg: string) => {
      this.$snotify.error(msg);
    });
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.btnBloquear = true;
    this.showVelocidad = false;
    if (value) {
      try {
        this.loadingService.showLoading();

        //Se toman del Store
        this.typeMap = store.getters.getTipoMapa;
        this.zoomMapSelected = store.getters.getZoom;
        //---

        this.enableControlsMap = true;
        if (this.strCoords !== '') {
          this.coordSelected = true;
          this.from = 'home';
        }
      } finally {
        store.commit('setStateLoadZonaManteiner', true);
      }
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivZ').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];
    this.vehiculosRespaldo = [];
    this.enableControlsMap = false;
    this.addressRequired = false;
    this.buscarVehiculosZonas = '';
    this.gridApi.setQuickFilter('');
    this.nombreTipo = '';
    this.elLaNombreTipoMsj = '';
    this.keyMap += 1;
    this.$emit('modalAsociacionEmit', false);
    store.commit('setStateLoadZonaMap', false);
    store.commit('setStateLoadZonaManteiner', false);
    this.dialog = false;
    if (this.coordShape != null) {
      this.coordShape.overlay.setMap(null);
    }
    this.$validator.errors.clear();
    this.$validator.reset();
  }

  closeErrorWarningGuardar() {
    this.dialogErrorWarning = false;
    this.btnBloquear = false;
    if (this.boolCierraModal) {
      this.closeSuccess();
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  initialize() {
    this.generarColumnasGrilla();

    this.dictionaryFormErrors = {
      custom: {
        vnombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        tipozona: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        tipolugar: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        descripcion: {
          max: () => config.errorMensajes.maxLength,
        },
        direccion: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        velocidadMaxGeo: {
          numeric: () => config.errorMensajes.soloNumeros,
          velocidadMaxima: () =>
            '* Velocidad máxima debe ser un valor entre 0 y 255 km/h.',
        },
        tiempoEstadia: {
          numeric: config.errorMensajes.soloNumeros,
          max_value: () => config.errorMensajes.maxLength,
          min_value: () => '* El valor no puede ser negativo.',
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  crearBotonVehiculoAlerta(params: any) {
    const item: any = this.vehiculosRespaldo.find(
      x => x.id === params.data.id && x.esCompartido === true
    );
    if (item !== undefined) {
      let eButton = document.createElement('div');
      eButton.setAttribute(
        'title',
        'Vehículo Compartido por: ' + item.compartidoPor
      );
      eButton.innerHTML =
        '<i aria-hidden="true"  style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i><span class="v-tooltip v-tooltip--bottom"></span>';
      return eButton;
    }
  }

  showTooltip() {
    //alert("Show Tooltip");
  }

  hideTooltip() {
    //alert("Hide Tooltip");
  }

  crearBotonWarning(params: any) {
    const item: any = this.vehiculosAsignados.find(
      x =>
        x.id === params.data.id &&
        (x.warnPuntos === true ||
          x.warnCirculos === true ||
          x.warnGeocercas === true ||
          x.warnPuntosPorGeo === true ||
          x.warnSoportaCirculos === true)
    );
    const mensajePlural: string =
      'El Vehículo no cumple con las siguientes validaciones:\n\n';
    const mensajeSingular: string =
      'El Vehículo no cumple con la siguiente validación:\n\n';
    let cont: number = 0;
    let mensajeValidaciones: string = '';
    let mensaje: string = '';
    if (item !== undefined) {
      if (item.warnPuntos) {
        cont += 1;
        mensajeValidaciones =
          '- GPS asociado al vehículo excede límite de polígonos permitidos.\n';
      }
      if (item.warnCirculos) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo excede límite de geocercas circulares permitidas.\n';
      }
      if (item.warnGeocercas) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo excede límite de geocercas permitidas.\n';
      }
      if (item.warnGps) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- La geocerca no puede ser asociada a un vehículo sin GPS.\n';
      }
      if (item.warnPuntosPorGeo) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo excede límite de vértices permitidos por geocerca.\n';
      }
      if (item.warnSoportaCirculos) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo no permite asociar geocercas circulares.\n';
      }
      if (cont > 1) {
        mensaje = mensajePlural + mensajeValidaciones;
      } else {
        mensaje = mensajeSingular + mensajeValidaciones;
      }
      let eButton = document.createElement('i');
      eButton.setAttribute('title', mensaje);
      eButton.innerHTML =
        '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
      return eButton;
    }
  }

  generarColumnasGrilla() {
    this.columnDefsVehiculo = [
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
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 40,
        cellRenderer: this.crearBotonVehiculoAlerta,
        enablePivot: false,
        resizable: true,
        minWidth: 40,
        sortable: true,
        lockVisible: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 40,
        cellRenderer: this.crearBotonWarning,
        enablePivot: false,
        resizable: false,
        minWidth: 40,
        sortable: false,
        lockVisible: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Vehículo',
        field: 'unidad',
        rowDrag: true,
        minWidth: 80,
        lockVisible: true,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(
          valueA: any,
          valueB: any,
          nodeA: any,
          nodeB: any,
          isInverted: any
        ) {
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
        headerName: 'Tipo de Vehículo',
        field: 'vehiculoTipo',
        rowDrag: true,
        minWidth: 80,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(
          valueA: any,
          valueB: any,
          nodeA: any,
          nodeB: any,
          isInverted: any
        ) {
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
        headerName: 'IMEI',
        field: 'imei',
        rowDrag: true,
        minWidth: 80,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Modelo Gps',
        field: 'modeloGps',
        rowDrag: true,
        minWidth: 80,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(
          valueA: any,
          valueB: any,
          nodeA: any,
          nodeB: any,
          isInverted: any
        ) {
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
        headerName: 'Nro. Serie Gps',
        field: 'numeroSerie',
        rowDrag: true,
        minWidth: 80,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(
          valueA: any,
          valueB: any,
          nodeA: any,
          nodeB: any,
          isInverted: any
        ) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
    ];
  }

  //GRABAR --------------------------------------------------------------------------------------
  async continuar() {
    document.getElementById('cardDivZ').scrollIntoView(true);
    let msjDuplicado = '';
    store.commit('setEsDibujar', false);

    switch (this.e1) {
      case 1:
        if (this.coordSelected) {
          this.e1 = 2;
          if (this.coordShape.tipo == 'marker') {
            await this.obtenerTiposZona(true);
            this.btnText = 'Guardar';
            this.btnClass = 'btn-grabar';
            this.showVelocidad = false;
          } else {
            await this.obtenerTiposZona();
          }
          await this.obtenerTiposLugar();
        } else {
          this.$snotify.error(
            'Debe seleccionar un área o un marcador en el mapa antes de continuar.'
          );
        }
        break;
      case 2:
        this.nombreTipo = TiposZonas[this.editedItem.tipoZonaId];

        if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
          this.elLaNombreTipoMsj =
            'la ' + this.nombreTipo + ': ' + this.editedItem.nombre;
          msjDuplicado =
            'Ya existe una ' + this.nombreTipo + ' con este nombre.';
        } else {
          this.elLaNombreTipoMsj =
            'el ' + this.nombreTipo + ': ' + this.editedItem.nombre;
          msjDuplicado =
            'Ya existe un ' + this.nombreTipo + ' con este nombre.';
        }

        this.$validator.validateAll().then(res => {
          if (res) {
            this.axiosGps.http
              .get(this.controller)
              .then(async res => {
                let zonas = res.data.filter(
                  (x: any) =>
                    x.nombre
                      .toString()
                      .toUpperCase()
                      .trim() ===
                      this.editedItem.nombre
                        .toString()
                        .toUpperCase()
                        .trim() &&
                    x.estado !== EstadoEntidad.Eliminado &&
                    x.tipoZonaId === this.editedItem.tipoZonaId &&
                    x.clienteId === this.getClienteID() &&
                    x.tipoLugarAlcance === TipoLugarAlcance.Cliente
                );

                if (zonas.length === 0) {
                  if (this.coordShape.tipo != 'marker') {
                    if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
                      this.e1 = 3;
                      //Se cargan Vehículos para las Geocercas
                      if (this.vehiculosRespaldo.length === 0) {
                        await this.obtenerVehiculosOpt();
                      }
                      //---
                      //DESCOMENTAR CUANDO SE HABILITEN LAS ALERTAS
                      //this.btnText = "Continuar";
                      this.btnText = 'Guardar';
                      this.btnClass = 'btn-grabar';
                      await this.ValidarCapacidadGpsVehiculosGrilla();
                      this.gridApi.refreshCells({ force: true });
                    } else {
                      //DESCOMENTAR CUANDO SE HABILITEN LAS ALERTAS
                      //this.e1 = 4;
                      //this.btnText = "Guardar";
                      //ELIMINAR CUANDO SE HABILITEN LAS ALERTAS
                      this.btnBloquear = true;
                      this.btnBloquearMapa = true;
                      this.dialogConfirmacion = true;
                    }
                  } else {
                    this.btnBloquear = true;
                    this.dialogConfirmacion = true;
                  }
                } else {
                  this.$snotify.error(msjDuplicado);
                }
              })
              .catch(error => {
                if (error.response !== undefined) {
                  if (error.response.status !== 401) {
                    this.$snotify.error(
                      'Ha ocurrido un error al validar el nombre de la zona'
                    );
                  }
                } else {
                  this.$snotify.error(
                    'Ha ocurrido un error al validar el nombre de la zona'
                  );
                }
              });
          }
        });
        break;
      case 3:
        this.$validator.validateAll().then(res => {
          if (res) {
            //DESCOMENTAR CUANDO SE HABILITEN LAS ALERTAS
            //this.e1 = 4;
            //this.btnText = "Guardar";
            let flagError = false;
            if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
              this.vehiculosAsignados.forEach((gps: any) => {
                if (
                  gps.warnPuntos ||
                  gps.warnCirculos ||
                  gps.warnGeocercas ||
                  gps.warnPuntosPorGeo ||
                  gps.warnSoportaCirculos
                ) {
                  flagError = true;
                }
              });
            }
            if (!flagError) {
              this.btnBloquear = true;
              this.dialogConfirmacion = true;
              this.btnBloquearMapa = true;
            } else {
              this.boolCierraModal = false;
              this.mensajeAsociarGeocercas = this.$t(
                'mensajes.mensajesError.cargaGeocercasZonaCrear'
              );
              this.dialogErrorWarning = true;
            }
          }
        });
        break;
      case 4:
        this.$validator.validateAll().then(res => {
          if (res) {
            this.btnBloquear = true;
            this.dialogConfirmacion = true;
          }
        });
        break;
    }
  }

  //Generico para Asociar Entidades --------------------------------------------------------------
  asociarEntidad(id: number, url: string, model: any, entidadasociar: any) {
    let he = new HandleErrors();
    if (entidadasociar.length > 0) {
      let index = 0;
      entidadasociar.forEach((entidad: any) => {
        this.axiosGps.http
          .post(url + entidad.id, model)
          .then(res => {
            index = index + 1;
            if (index == entidadasociar.length) {
              this.$snotify.success('Correcto');
              this.closeModal(false);
            }
          })
          .catch(error => {
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.errorMSG(error, he);
              }
            } else {
              this.errorMSG(error, he);
            }
          });
      });
    } else {
      this.$snotify.success('Correcto');
      this.closeModal(false);
    }
  }

  async ValidarCapacidadGpsVehiculosGrilla() {
    let puntos = this.editedItem.puntos;
    let circulos = this.editedItem.circulos;
    let poligonosAlmacenados: number = 0;
    //Validar por vehiculo los GPS/Geocercas Asociados
    this.vehiculosAsignados.forEach(async (va: any) => {
      va.warnPuntos = false;
      va.warnCirculos = false;
      va.warnGeocercas = false;
      va.warnPuntosPorGeo = false;
      va.warnSoportaCirculos = false;
      poligonosAlmacenados =
        this.editedItem.tipoGeometria == 1
          ? (poligonosAlmacenados = +1)
          : poligonosAlmacenados;

      //Valida Poligonos
      if (poligonosAlmacenados > va.limitePuntos) va.warnPuntos = true;
      //Valida Circulos
      if (
        va.circulosAlmacenados + circulos > va.limiteCirculos &&
        va.limiteCirculos > 0
      )
        va.warnCirculos = true;
      //Valida Geocercas
      if (va.geocercasAlmacenadas + 1 > va.limiteGeocercas)
        va.warnGeocercas = true;
      //Valida Puntos por Geo
      if (va.limitePuntosPorGeocerca < puntos) va.warnPuntosPorGeo = true;
      //Valida Soporta Circulos
      if (va.limiteCirculos === 0 && circulos > 0)
        va.warnSoportaCirculos = true;
    });
    //---
    this.gridApi.refreshCells({ force: true });
  }

  // ButtonCell - Source -------------------------------------------------------

  crearBotonCeldaVehiculo(params: any) {
    const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerVehiculoAsignacion(item);
    });
    return eButton;
  }

  getClienteID() {
    return config.getClienteSesion();
  }

  //ASOCIACIONES /////////////////////////////////////////////////////////////////////////////////////////////
  /*async obtenerVehiculos() {
    try {
      const responseVehiculo = await this.axiosVehiculo.http.get(
        `${this.controllerVehiculo}/${this.getClienteID()}/vehiculosCliente`
      );

      let vehiculosRes: any = responseVehiculo.data;
      let vehiculos: any = [];
      let gpsStored: any = [];
      responseVehiculo.data.forEach((element: any) => {
        if (element.estado === EstadoEntidad.Activo) {
          vehiculos.push({
            Id: 0,
            VehiculoId: element.id,
            TipoVehiculo:
              element.vehiculoTipo != null ? element.vehiculoTipo.nombre : '',
            Patente: element.patente,
            Vin: element.vin,
            esCompartido: element.esCompartido,
            compartidoPor: element.compartidoPor,
            Unidad: element.unidad,
          });
        }
      });

      const responseGpsPrincipal = await this.axiosGps.http.post(
        `${this.controllerGpsVehiculo}/getPrincipalGpsSimVehiculos`,
        vehiculos
      );
      responseGpsPrincipal.data.forEach(async (elementgps: any) => {
        gpsStored = {
          GpsId: elementgps.gpsId,
        };
        const resGpsStored = await this.axiosGps.http.post(
          `${this.controllerGpsCoordenada}/GetStoredCoordGps`,
          gpsStored
        );
        vehiculosRes.forEach((elementVeh: any) => {
          if (elementgps.vehiculoId == elementVeh.id) {
            this.vehiculosRespaldo.push({
              id: elementVeh.id,
              tipoVehiculo:
                elementVeh.vehiculoTipo != null
                  ? elementVeh.vehiculoTipo.nombre
                  : '',
              gpsId: elementgps.gpsId,
              patente:
                elementVeh.patente != null ? elementVeh.patente : 'Sin Patente',
              vin: elementVeh.vin != null ? elementVeh.vin : 'Sin Vin',
              imei: elementgps.imei,
              modeloGps: elementgps.modeloGps,
              nroSerie: elementgps.serieGPS,
              nroSim: elementgps.nroSim,
              limitePuntos: elementgps.limitePuntos,
              limiteCirculos: elementgps.limiteCirculos,
              puntosAlmacenados:
                resGpsStored.data.puntosAlmacenados != undefined
                  ? resGpsStored.data.puntosAlmacenados
                  : 0,
              circulosAlmacenados:
                resGpsStored.data.circulosAlmacenados != undefined
                  ? resGpsStored.data.circulosAlmacenados
                  : 0,
              esCompartido: elementVeh.esCompartido,
              compartidoPor: elementVeh.compartidoPor,
              geocercasAlmacenadas:
                resGpsStored.data.geocercasAlmacenadas != undefined
                  ? resGpsStored.data.geocercasAlmacenadas
                  : 0,
              limiteGeocercas: elementgps.limiteGeocercas,
              unidad: elementVeh.unidad,
              limitePuntosPorGeocerca: elementgps.limitePuntosPorGeocerca,
            });
          }
        });
      });
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los GPSs de los Vehículos'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los GPSs de los Vehículos'
        );
      }
    }
  }*/

  // marcarTodosVehiculos(value: boolean) {
  //   this.vehiculosAsignados = [];
  //   this.vehiculosAsignadosModel = [];
  //   if (value) {
  //     this.vehiculosRespaldo.forEach((veh: any) => {
  //       this.vehiculosAsignados.push(veh);
  //       this.vehiculosAsignadosModel.push(veh.id);
  //       veh.selected = true;
  //     });
  //   } else {
  //     this.vehiculosRespaldo.forEach((veh: any) => {
  //       veh.selected = false;
  //     });
  //   }
  //   this.ValidarCapacidadGpsVehiculosGrilla();

  //   this.seleccionoTodos = value;
  // }

  async obtenerVehiculosOpt() {
    const loadingKey = 'obtenerVehiculosOpt';
    this.loadingService.showLoading(undefined, loadingKey);
    try {
      const responseVehiculo = await this.axiosVehiculo.http.get(
        `${
          this.controllerVehiculo
        }/${this.getClienteID()}/obtenerVehiculosCliente`
      );

      this.vehiculosRespaldo = responseVehiculo.data;

      if (this.vehiculosRespaldo.length > 0) {
        this.muestraVehiculos = true;
      } else {
        this.muestraVehiculos = false;
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los GPSs de los Vehículos'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los GPSs de los Vehículos'
        );
      }
    } finally {
      this.loadingService.hideLoading(loadingKey);
    }
  }

  onClearVehiculos() {
    this.search = '';
    for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
      this.vehiculosAsignados[i].selected = false;
      this.vehiculosAsignados.splice(i, 1);
    }

    for (let i = this.vehiculosAsignadosModel.length - 1; i >= 0; i--) {
      this.vehiculosAsignadosModel.splice(i, 1);
    }
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  async changeVehiculo(vehiculo: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (vehiculo !== undefined) {
      let asignado: any = this.vehiculosAsignados.filter(
        (x: any) => x.id === vehiculo.id
      );
      if (asignado.length > 0) {
        for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
          if (this.vehiculosAsignados[i].id === vehiculo.id) {
            this.vehiculosAsignados[i].selected = false;
            this.vehiculosAsignados.splice(i, 1);
            break;
          }
        }

        for (let i = this.vehiculosAsignadosModel.length - 1; i >= 0; i--) {
          if (this.vehiculosAsignadosModel[i] === vehiculo.id) {
            this.vehiculosAsignadosModel.splice(i, 1);
            break;
          }
        }
        this.btnBloquear = false;
      } else {
        this.vehiculosAsignados.push(vehiculo);
        this.vehiculosAsignadosModel.push(vehiculo.id);

        for (let i: number = 0; i <= this.vehiculosAsignados.length - 1; i++) {
          if (this.vehiculosAsignados[i].id === vehiculo.id) {
            this.vehiculosAsignados[i].selected = true;
            break;
          }
        }
        this.ValidarCapacidadGpsVehiculosGrilla();
      }
    }
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
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

  onVehiculoChange(vehiculo: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      vehiculo !== undefined &&
      vehiculo.length !== this.vehiculosAsignados.length
    ) {
      for (let x = this.vehiculosAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= vehiculo.length - 1; i++) {
          if (this.vehiculosAsignados[x].id == vehiculo[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.vehiculosAsignados.splice(x, 1);
        }
      }
    }
  }

  onVehiculoInput(vehiculo: any) {
    if (vehiculo !== undefined) {
      if (vehiculo.length !== undefined) {
        for (let i = 0; i <= vehiculo.length - 1; i++) {
          let added = this.vehiculosAsignados.filter(x => x.id == vehiculo[i]);

          if (added.length === 0) {
            const vehiculoAgregar = this.vehiculosRespaldo.find(
              x => x.id == vehiculo[i]
            );
            this.vehiculosAsignados.push(vehiculoAgregar);
          }
        }
      } else {
        let added = this.vehiculosAsignados.filter(x => x.id == vehiculo.id);

        if (added.length > 0) {
          for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
            if (this.vehiculosAsignados[i].id === vehiculo.id) {
              this.vehiculosAsignados.splice(i, 1);
              break;
            }
          }
          for (let i = this.vehiculosAsignadosModel.length - 1; i >= 0; i--) {
            if (this.vehiculosAsignadosModel[i] === vehiculo.id) {
              this.vehiculosAsignadosModel.splice(i, 1);
              break;
            }
          }
        }
      }
      this.ValidarCapacidadGpsVehiculosGrilla();
    }
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  removerVehiculoAsignacion(item: IVehiculoGeocerca) {
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
  }

  //-------------------------------------------------------------------------------------------
  //FIN ASOCIACIONES /////////////////////////////////////////////////////////////////////////////////////////
  //GET-FIN------------------------------------------------------------------------------------

  selectedTipoLugarId(e: any) {
    this.tipoLugarId = e;
  }

  selectedTipoZonaId(e: any) {
    this.tipoZonaId = e;
    this.$validator.reset();
    if (this.tipoZonaId == this.idGeocerca) {
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
      this.showVelocidad = true;
    } else {
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
      this.showVelocidad = true;
    }
  }

  //CONFIRMACION ////////////////////////////////////////////////////////////////////////////////////////////
  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      if (this.estLlamado) {
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
      } else {
        document.getElementsByTagName('html')[0].style.overflow = 'auto';
      }
      this.$validator.validateAll().then(res => {
        if (res) {
          this.btnBloquear = true;
          let boolError = this.nuevo();
        }
      });

      this.estLlamado = false;
    }
    this.btnBloquear = false;
    this.btnBloquearMapa = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      if (this.estLlamado) {
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
      } else {
        document.getElementsByTagName('html')[0].style.overflow = 'auto';
      }
      this.estLlamado = false;
      this.closeModal(false);
    }
  }

  ///////////////////////////
  errorCallback(error: any) {
    let he = new HandleErrors();
    this.errorMSG(error, he);
    this.dialogConfirmacion = false;
  }

  closeSuccess() {
    let creadoA = '';
    let msjExito = this.nombreTipo + ': ' + this.editedItem.nombre;
    if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
      creadoA = 'creada';
    } else {
      creadoA = 'creado';
    }
    this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: msjExito,
        creadoA: creadoA,
      })
    );
  }

  //GUARDAR ///////////////////////////////////////////////////////////////////////////////////////////
  async nuevo() {
    let msjErrorCrear = '';
    if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
      msjErrorCrear =
        'Ha ocurrido un problema al intentar crear la ' +
        this.nombreTipo +
        ': ' +
        this.editedItem.nombre;
    } else {
      msjErrorCrear =
        'Ha ocurrido un problema al intentar crear el ' +
        this.nombreTipo +
        ': ' +
        this.editedItem.nombre;
    }

    this.loadingService.showLoading();

    let modelCoordenada = {
      Id: 0,
      ClienteId: this.getClienteID(),
      Nombre: this.editedItem.nombre,
      Descripcion: this.editedItem.descripcion,
      Direccion: this.editedItem.direccion,
      TipoGeometria: this.editedItem.tipoGeometria,
      FormaJson: this.editedItem.formaJson,
      VelocidadMaxGeo:
        this.editedItem.tipoZonaId == TiposZonas.Geocerca ||
        this.editedItem.tipoZonaId == TiposZonas.Sitio
          ? this.editedItem.velocidadMaxGeo != null
            ? this.editedItem.velocidadMaxGeo
            : 0
          : null,
      Notas: this.editedItem.notas,
      TipoZonaId: this.tipoZonaId,
      GrupoId: this.tipoLugarId,
      Estado: this.editedItem.estado,
      TiempoEstadia: this.editedItem.tiempoEstadia,
    };
    try {
      const response = await this.axiosGps.http.post(
        `${this.controller}/`,
        modelCoordenada
      );
      await this.grabarAsociacionesVehiculos(response.data.id);
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(msjErrorCrear);
        }
      } else {
        this.$snotify.error(msjErrorCrear);
      }
    }
  }

  async grabarAsociacionesVehiculos(coordenadaId: number) {
    let msjErrorCrear = '';
    if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
      msjErrorCrear =
        'Ha ocurrido un problema al intentar crear la ' +
        this.nombreTipo +
        ': ' +
        this.editedItem.nombre;
    } else {
      msjErrorCrear =
        'Ha ocurrido un problema al intentar crear el ' +
        this.nombreTipo +
        ': ' +
        this.editedItem.nombre;
      this.vehiculosAsignados = [];
    }

    try {
      let gpsCoordenadaModelListPost: any = [];

      if (this.vehiculosAsignados.length > 0) {
        this.vehiculosAsignados.forEach((gps: any) => {
          let gpsModel = gps;
          gpsModel = {
            CoordenadaId: coordenadaId,
            VehiculoId: gps.id,
            GpsId: gps.gpsId,
            Vertices: this.editedItem.puntos,
            Circulos: this.editedItem.circulos,
            TipoGeometria: this.editedItem.tipoGeometria,
            FormaJson: this.editedItem.formaJson,
            VelocidadMaxGeo:
              this.editedItem.velocidadMaxGeo != null
                ? this.editedItem.velocidadMaxGeo
                : 0,
          };

          gpsCoordenadaModelListPost.push(gpsModel);
        });

        if (gpsCoordenadaModelListPost.length > 0) {
          const response = await this.axiosGps.http.post(
            this.controllerGpsCoordenada,
            gpsCoordenadaModelListPost
          );

          //634 - [INTERNA] - Definir solución para concurrencia en asignación de geocercas en vehículo que están compartido
          this.loadingService.hideLoading();
          if (response.data) {
            if (!response.data.respuesta) {
              this.boolCierraModal = true;
              var messageError: any = this.$t(
                'mensajes.mensajesError.concurrenciaGeocercasZona'
              );
              this.mensajeAsociarGeocercas = response.data.hasOwnProperty(
                'mensaje'
              )
                ? response.data.mensaje
                : messageError;
              this.dialogErrorWarning = true;
            } else {
              this.closeSuccess();
            }
          }
          //---
        } else {
          this.closeSuccess();
        }
      } else {
        this.closeSuccess();
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(msjErrorCrear);
        }
      } else {
        this.$snotify.error(msjErrorCrear);
      }
    }
  }

  errorMSG(error: any, he: HandleErrors) {
    he.showError(error);
    this.btnBloquear = false;
  }

  enableContinue(val: any) {
    if (val !== null) {
      this.coordSelected = true;
      this.btnBloquear = false;
      this.validForm = true;
      this.coordShape = val;
      this.editedItem.direccion = '';
      this.$validator.reset();

      switch (this.coordShape.tipo) {
        case 'marker':
          // this.$validator.reset();
          this.editedItem.tipoGeometria = TipoGeometria.Marcador;
          this.editedItem.puntos = 0;
          this.editedItem.direccion = this.coordShape.addressMarker;
          break;
        case 'circle':
          this.editedItem.tipoGeometria = TipoGeometria.Circunferencia;
          this.editedItem.puntos = 1;
          this.editedItem.circulos = 1;
          break;
        case 'rectangle':
          this.editedItem.tipoGeometria = TipoGeometria.Rectangulo;
          this.editedItem.puntos = 5;
          this.editedItem.circulos = 0;
          break;
        case 'polygon':
          this.editedItem.tipoGeometria = TipoGeometria.Poligono;
          this.editedItem.puntos = this.coordShape.puntos;
          this.editedItem.circulos = 0;
          break;
      }
      this.editedItem.formaJson = this.coordShape.coordenadas;
      this.btnBloquear = false;
    } else {
      this.btnBloquear = true;
    }
  }

  async obtenerTiposZona(filtered: boolean = false) {
    if (filtered) {
      try {
        this.addressRequired = true;
        const response = await this.axiosGps.http.get(
          `${this.controllerTipoZona}/`
        );

        this.TipoZona = response.data.filter(
          (x: any) => x.nombre.toUpperCase().trim() === 'MARCADOR'
        );

        this.tipoZonaId = TiposZonas.Marcador;
        this.editedItem.tipoZonaId = TiposZonas.Marcador;
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar obtener los tipos de Zonas.'
            );
          }
        } else {
          this.$snotify.error(
            'Ha ocurrido un problema al intentar obtener los tipos de Zonas.'
          );
        }
      }
    } else {
      try {
        this.addressRequired = false;
        const response = await this.axiosGps.http.get(
          `${this.controllerTipoZona}/`
        );
        this.TipoZona = response.data.filter(
          (x: any) => x.nombre.toUpperCase().trim() !== 'MARCADOR'
        );
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar obtener los tipos de Zonas.'
            );
          }
        } else {
          this.$snotify.error(
            'Ha ocurrido un problema al intentar obtener los tipos de Zonas.'
          );
        }
      }
    }
  }

  async obtenerTiposLugar() {
    try {
      const response = await this.axiosGps.http.get(`${
        this.controllerTipoLugar
      }/
                                                         ${this.getClienteID()}/tiposlugarCliente`);
      this.TipoLugar = response.data.filter(
        (x: any) => x.tipoLugarAlcance === TipoLugarAlcance.Cliente
      );
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ha ocurrido un problema al intentar obtener los Grupos de Zonas.'
          );
        }
      } else {
        this.$snotify.error(
          'Ha ocurrido un problema al intentar obtener los Grupos de Zonas.'
        );
      }
    }
  }

  back() {
    document.getElementById('cardDivZ').scrollIntoView(true);
    if (this.editedItem.tipoZonaId == TiposZonas.Sitio && this.e1 == 4) {
      this.e1 -= 2;
    } else {
      this.e1 -= 1;
    }
    if (this.e1 == 1) {
      this.validForm = true;
      this.btnBloquear = false;
      store.commit('setEsDibujar', true); //Al iniciar es "Dibujar"
    }
  }

  resetCreation() {
    // document.getElementById('cardDivZ').scrollIntoView(true);
    // if (this.editedItem.tipoZonaId == TiposZonas.Sitio && this.e1 == 4) {
    //   this.e1 -= 2;
    // } else {
    //   this.e1 -= 1;
    // }
    // if(this.e1 == 1){
    //   this.validForm = true;
    //   this.btnBloquear = false;
    // }
    alert('reset creation');
  }

  onRowSelectedVehiculoZona(event: any) {
    this.vehSelected = event.node;
    this.vehCount++;
  }

  async onSelectedChangeVehiculosZonas() {
    await this.actualizarGrillaVehiculo();
    this.vehiculosAsignados = this.gridApi.getSelectedRows();
    if (this.vehCount === 1 && this.vehSelected != null) {
      if (this.vehSelected.selected) {
        this.vehiculosAsignados.forEach(async (e: any) => {
          if (e.vehSelected === this.vehSelected.data.id) {
            e.warnGeocercas = false;
            e.warnPuntos = false;
            e.warnCirculos = false;
            e.warnSoportaCirculos = false;
            e.warnPuntosPorGeo = false;
          }
        });
        await this.ValidarCapacidadGpsVehiculosGrilla();
        this.gridApi.refreshCells({ force: true });
      } else {
        this.vehiculosAsignados.forEach(async (e: any) => {
          e.warnGeocercas = false;
          e.warnPuntos = false;
          e.warnCirculos = false;
          e.warnSoportaCirculos = false;
          e.warnPuntosPorGeo = false;
        });
        await this.ValidarCapacidadGpsVehiculosGrilla();
        this.gridApi.refreshCells({ force: true });
      }
    } else {
      this.vehiculosAsignados.forEach(async (e: any) => {
        e.warnGeocercas = false;
        e.warnPuntos = false;
        e.warnCirculos = false;
        e.warnSoportaCirculos = false;
        e.warnPuntosPorGeo = false;
      });
      await this.ValidarCapacidadGpsVehiculosGrilla();
      this.gridApi.refreshCells({ force: true });
    }

    this.vehCount = 0;
  }

  actualizarGrillaVehiculo() {
    const vehiculosSeleccionados = this.gridApi
      .getSelectedNodes()
      .map((node: any) => ({ ...node.data, checked: true }));

    const vehiculosNoSeleccionados = differenceBy(
      this.vehiculosRespaldo,
      vehiculosSeleccionados,
      (veh: IVehiculoGeocerca) => veh.id
    ).map(veh => ({
      ...veh,
      checked: false,
    }));

    this.gridApi.updateRowData({
      update: [...vehiculosNoSeleccionados, ...vehiculosSeleccionados],
    });
  }

  getRowNodeIdVehiculo(rowIdVehiculo: IVehiculoGeocerca) {
    if (!rowIdVehiculo) {
      return;
    }
    return rowIdVehiculo.id;
  }

  onFilterTextBoxChangedVehiculos() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarVehiculosZonas.length > 1) {
      this.gridApi.setQuickFilter(this.buscarVehiculosZonas);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (
      this.vehiculosRespaldo.length > 0 &&
      this.buscarVehiculosZonas.length > 1
    ) {
      let busqueda = this.buscarVehiculosZonas.toLowerCase();
      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.vehiculoTipo.toLowerCase().includes(busqueda) ||
        node.data.imei.includes(busqueda) ||
        node.data.modeloGps.toLowerCase().includes(busqueda) ||
        node.data.numeroSerie.toLowerCase().includes(busqueda)
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
</style>

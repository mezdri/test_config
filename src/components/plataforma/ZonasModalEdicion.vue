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
          <v-btn icon dark @click="cerrarOperacion()" :disabled="btnBloquear">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>
            {{ esEdicion ? 'Editar Zona' : 'Ver Detalle Zona' }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
              @click="grabarEdicion()"
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
                color="primary"
                flat
                v-show="
                  (dibujar.visible && esEdicion) ||
                    (dibujarVerDetalle.visible && !esEdicion)
                "
                :value="dibujar.step"
              >
                <span>Dibujar</span>
                <v-icon>edit_location</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu()"
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
                @click="cierraMenu()"
                color="primary"
                flat
                v-show="
                  (showAsocVehic && AsociarVehiculos.visible && esEdicion) ||
                    (showAsocVehic &&
                      AsociarVehiculosVerDetalle.visible &&
                      !esEdicion)
                "
                :value="AsociarVehiculos.step"
              >
                <span>Asociar Vehículos</span>
                <v-icon>directions_car</v-icon>
              </v-btn>
              <v-btn color="primary" flat value="4" v-if="showConfAlerts">
                <span>Configurar Alertas</span>
                <v-icon>report</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == dibujar.step &&
                ((dibujar.visible && esEdicion) ||
                  (dibujarVerDetalle.visible && !esEdicion))
            "
          >
            <v-alert
              :value="showMessageDraw"
              color="warning"
              icon="priority_high"
              outline
            >
              No se puede modificar el dibujo de la geocerca porque ya se
              encuentra asociada a vehículos.
            </v-alert>
            <v-alert
              :value="showMessageConfirmDraw"
              color="warning"
              icon="priority_high"
              outline
              >Se espera confirmación del sistema para poder modificar
              dibujo.</v-alert
            >
            <app-google-map
              name="zona-edit"
              :show="show"
              :enableControls="editDraw"
              :coordenadas="zona.formaJson"
              :geometria="zona.tipoGeometria"
              :tipozona="zona.tipoZonaId"
              :restrictDrawers="restrictDrawers"
              module="zonas"
              :key="keyMap"
              v-on:enableContinueEmit="enableContinue($event)"
            ></app-google-map>
          </div>
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
                        <v-select
                          item-value="id"
                          item-text="nombre"
                          :items="TipoZona"
                          v-model="editedItem.tipoZonaId"
                          label="Tipo de Zona"
                          data-vv-name="tipozona"
                          :disabled="true"
                          :error-messages="errors.collect('tipozona')"
                          v-validate="'required'"
                          no-data-text="Sin resultados"
                          required
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Nombre"
                          v-validate="'required|NombreUnicoEditar|max:80'"
                          :counter="80"
                          data-vv-name="vnombre"
                          v-model="editedItem.nombre"
                          :disabled="!esEdicion"
                          type="text"
                          :error-messages="errors.collect('vnombre')"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Descripción"
                          :counter="200"
                          data-vv-name="descripcion"
                          v-validate="'max:200'"
                          :error-messages="errors.collect('descripcion')"
                          v-model="editedItem.descripcion"
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('direccion')"
                          type="text"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Tiempo de Estadia en minutos"
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('velocidadMaxGeo')"
                          type="text"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          item-value="id"
                          item-text="nombre"
                          :items="TipoLugar"
                          v-model="editedItem.grupoId"
                          data-vv-name="tipolugar"
                          label="Grupo de Zonas"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('tipolugar')"
                          no-data-text="Sin resultados"
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
          <div
            align="center"
            v-show="
              bottomNav == AsociarVehiculos.step &&
                ((showAsocVehic && AsociarVehiculos.visible && esEdicion) ||
                  (showAsocVehic &&
                    AsociarVehiculosVerDetalle.visible &&
                    !esEdicion))
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
                        v-model="buscarVehiculosZonasEditar"
                        @input="onFilterTextBoxChangedVehiculoEditar"
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
                          @selection-changed="
                            onSelectedChangeVehiculoZonaEditar
                          "
                          @row-selected="
                            onRowSelectedVehiculoZonaEditar($event)
                          "
                          suppressCopyRowsToClipboard="true"
                          :getRowNodeId="getRowNodeIdVehiculoEditar"
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
          <div align="center" v-show="bottomNav == '4'">
            <v-container grid-list-md text-xs-center>
              <v-layout row>
                <v-flex xs12 sm6 offset-sm3>
                  <v-card>
                    <v-card-title>
                      <span class="title font-weight-light"
                        >Configuración de Alertas</span
                      >
                    </v-card-title>
                    <v-card-text>
                      <v-list two-line>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>
                              <strong>Tipo de Alerta</strong>
                            </v-list-tile-title>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-list-tile-title>
                              <strong>Estado</strong>
                            </v-list-tile-title>
                          </v-list-tile-action>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Sobreestadía</v-list-tile-title>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-list-tile-action-text>
                              <v-switch
                                v-model="switch1"
                                :label="switch1 ? 'Activa' : 'Inactiva'"
                              ></v-switch>
                            </v-list-tile-action-text>
                          </v-list-tile-action>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Detención</v-list-tile-title>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-list-tile-action-text>
                              <v-switch
                                v-model="switch2"
                                :label="switch2 ? 'Activa' : 'Inactiva'"
                              ></v-switch>
                            </v-list-tile-action-text>
                          </v-list-tile-action>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Entrada</v-list-tile-title>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-list-tile-action-text>
                              <v-switch
                                v-model="switch3"
                                :label="switch3 ? 'Activa' : 'Inactiva'"
                              ></v-switch>
                            </v-list-tile-action-text>
                          </v-list-tile-action>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Salida</v-list-tile-title>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-list-tile-action-text>
                              <v-switch
                                v-model="switch4"
                                :label="switch4 ? 'Activa' : 'Inactiva'"
                              ></v-switch>
                            </v-list-tile-action-text>
                          </v-list-tile-action>
                        </v-list-tile>
                        <v-divider></v-divider>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title
                              >Exceso Velocidad Sobre:</v-list-tile-title
                            >
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-list-tile-action-text>
                              <v-switch
                                v-model="switch5"
                                :label="switch5 ? 'Activa' : 'Inactiva'"
                              ></v-switch>
                            </v-list-tile-action-text>
                          </v-list-tile-action>
                        </v-list-tile>
                        <v-divider></v-divider>
                      </v-list>
                      <div align="left" style="padding: inherit;">
                        <span
                          class="font-weight-light"
                          style="font-size: 16px; padding: inherit;"
                          >Notificar a:</span
                        >
                      </div>
                      <v-select
                        :items="correosNotify"
                        single-line
                        hide-details
                        no-data-text="Sin resultados"
                        style="padding: inherit;"
                      ></v-select>
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="tituloConfirmacion"
      :mensaje="$t('mensajes.crud.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorWarning" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Error al Editar Geocerca</v-toolbar-title
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
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import { Validator } from 'vee-validate';
import store from '@/store';
import { Component, Prop, Watch } from 'vue-property-decorator';
import GoogleMapDrawer from '@/components/GoogleMapDrawer.vue';
import { ITipoZona } from '@/interfaces/TipoZonas';
import { AxiosVue } from '@/AxiosVue';
import Confirmation from '@/components/Confirmation.vue';
import { filtroHomeEventBus } from '@/setup';
import { IZona, ITipoLugar, ICoordenadaVehiculo } from '@/interfaces/Zonas';
import {
  EstadoEntidad,
  TiposZonas,
  TipoLugarAlcance,
  ServicioProxy,
  TipoGeometria,
  FiltroAsocVehiculo,
  EstadoEnvioGps,
} from '@/config/enums';
import { IVehiculoGeocerca } from '@/interfaces/Vehiculos';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
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

declare var google: any;

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-google-map': GoogleMapDrawer,
    'app-confirmacion': Confirmation,
  },
})
export default class ZonasModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({
      id: 0,
      nombre: '',
      tipoGeometria: 0,
      formaJson: '',
      tipoZonaId: 0,
    }),
  })
  zona!: IZona;

  //permisos
  readonly funcionalidad: Funcionalidades = Funcionalidades.Zonas;
  permisosActuales: PermisoAccionVm[] = [];

  dibujar: PermisoAccionVm = {
    accion: 'Editar - Dibujar',
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 2,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  AsociarVehiculos: PermisoAccionVm = {
    accion: 'Editar - Asociar Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  dibujarVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Dibujar',
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 2,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  AsociarVehiculosVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.dibujar,
    this.informacionGeneral,
    this.AsociarVehiculos,
    this.dibujarVerDetalle,
    this.informacionGeneralVerDetalle,
    this.AsociarVehiculosVerDetalle,
  ];

  //Variables globales
  keyMap: number = 0;
  $snotify: any;
  bottomNav: any = '1';
  e1: number = 1;
  vr: ValidaRut = new ValidaRut();

  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dictionaryFormErrors: any = {};
  TipoZona: ITipoZona[] = [];
  TipoLugar: ITipoLugar[] = [];
  coordSelected: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogErrorWarning: boolean = false;
  muestraVehiculos: boolean = false;
  seleccionoTodos: boolean = false;
  tituloConfirmacion: string = '';

  editedItem: IZona = {};
  coordShape: any = null;
  btnBloquear: boolean = false;
  controller: string = 'Coordenada';
  controllerTipoZona: string = 'tipozona';
  controllerTipoLugar: string = 'grupodezona';
  controllerVehiculo: string = 'vehiculo';
  controllerGpsVehiculo: string = 'gpsvehiculo';
  controllerGpsCoordenada: string = 'gpscoordenada';
  currentPoints: number = 0;
  currentCircles: number = 0;
  currentPointsBkp: number = 0;
  currentCirclesBkp: number = 0;
  loadingService = new LoadingService();
  addressRequired: boolean = false;
  search: string = '';
  showVelocidad: boolean = false;
  estLlamado: boolean = false;
  buscarVehiculosZonasEditar: string = '';
  vehCountEditar: number = 0;
  vehSelectedEditar: any = null;

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: any;
  columnApi: any;

  columnDefsVehiculo: any = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  filtrosVehiculo: any = [];

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculoGeocerca[] = [];
  vehiculosRespaldo: IVehiculoGeocerca[] = [];
  vehiculosAsignadosResp: IVehiculoGeocerca[] = [];

  coordenadaVehiculos: ICoordenadaVehiculo[] = [];

  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  //---------------------------------------------------------------------------------------------------------

  //Variables para el dibujo del mapa
  strShape: string = '';
  typeShape: number = 0;
  showMessageDraw: boolean = false;
  showMessageConfirmDraw: boolean = false;
  editDraw: boolean = false;

  //Variables para el control de botonera
  showAsocVehic: boolean = false;
  showConfAlerts: boolean = false;
  restrictDrawers: boolean = true;

  //Variables para Switch Alertas
  switch1: boolean = false;
  switch2: boolean = false;
  switch3: boolean = false;
  switch4: boolean = false;
  switch5: boolean = false;
  correosNotify: any = ['nombre@correo.cl'];

  //Concurrencia Geocercas
  mensajeAsociarGeocercas: any = '';
  boolCierraModal: boolean = false;
  //---

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.strShape = '';
    this.typeShape = 0;
    this.bottomNav = '1';
    this.vehiculosAsignadosModel = [];
    this.vehiculosAsignados = [];
    this.vehiculosRespaldo = [];
    this.vehiculosAsignadosResp = [];
    this.showMessageDraw = false;
    this.showMessageConfirmDraw = false;
    this.editDraw = false;
    this.showVelocidad = false;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      try {
        if (this.zona.tipoGeometria == TipoGeometria.Marcador) {
          this.addressRequired = true;
          await this.getTiposZona(true);
        } else {
          this.addressRequired = false;
          await this.getTiposZona();
        }

        const zona = await this.axiosGps.http.get<IZona>(
          `${this.controller}/${this.zona.id}`
        );

        this.editedItem = zona.data;

        switch (this.editedItem.tipoZonaId) {
          case TiposZonas.Marcador:
            this.showAsocVehic = false;
            this.showConfAlerts = false;
            if (this.esEdicion) {
              //this.showMessageDraw = false;
              this.editDraw = true;
            } else {
              this.editDraw = false;
              store.commit('setStateLoadZonaMap', true);
            }
            this.showVelocidad = false;
            break;
          case TiposZonas.Sitio:
            this.showAsocVehic = false;
            //CAMBIAR A TRUE CUANDO SE HABILITEN LAS ALERTAS
            this.showConfAlerts = false;
            if (this.esEdicion) {
              //this.showMessageDraw = false;
              this.editDraw = true;
            } else {
              this.editDraw = false;
              store.commit('setStateLoadZonaMap', true);
            }
            this.showVelocidad = true;
            break;
          case TiposZonas.Geocerca:
            //this.getFiltrosVehiculo();
            await this.obtenerVehiculosOpt();

            //this.ValidarCapacidadGpsVehiculosGrilla();
            //this.gridApi.refreshCells({ force: true });
            this.showAsocVehic = true;
            //CAMBIAR A TRUE CUANDO SE HABILITEN LAS ALERTAS
            this.showConfAlerts = false;
            this.showVelocidad = true;
            break;
        }

        await this.obtenerTiposLugar();

        this.$validator.errors.clear();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(error);
          }
        } else {
          this.handleErrors.showError(error);
        }
      }
    } else {
      this.editDraw = false;
    }
    this.initialize();
    if (this.vehiculosAsignados.length == this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

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
    filtroHomeEventBus.$on('showEditarZona', (obj: any) => {
      this.estLlamado = obj;
    });
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
      Validator.extend('NombreUnicoEditar', {
        getMessage(field: any, params: any, data: any) {
          return '* Ya existe una Zona con este nombre.';
        },
        validate(value: any) {
          if (value !== '') {
            return self.axiosGps.http
              .get(
                `${self.controller}/${self.editedItem.id}/${clienteId}/${value}/ChequearNombreUnico`
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

  // getFiltrosVehiculo() {
  //     let filtros: any[] = [];
  //     for (let item in FiltroAsocVehiculo) {
  //         if (!isNaN(Number(item))) {
  //             let estado: string = FiltroAsocVehiculo[item];
  //             filtros.push({
  //                 id: Number(item),
  //                 nombre: estado
  //             });
  //         }
  //     }
  //     this.filtrosVehiculo = filtros;
  // }

  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  setCoordenadasVehiculos() {
    if (this.editedItem.id != undefined) {
      this.axiosGps.http
        .get(`${this.controllerGpsCoordenada}/${this.editedItem.id}/vehiculos`)
        .then(res => {
          this.coordenadaVehiculos = res.data;
          this.coordenadaVehiculos.forEach((cl: any) => {
            let objVehiculo = this.vehiculosRespaldo.find(
              x => x.id == cl.vehiculoId
            );
            objVehiculo.fechaInicioAsociacion = this.formatDate(
              cl.fechaInicioAsociacion.substr(0, 10)
            );
            (objVehiculo.estadoAsociacion = cl.estadoEnvioGpsTxt), //cl.estadoEnvioGps;
              (objVehiculo.fechaAsociacionFisica =
                cl.fechaAsociacionFisica != null
                  ? this.formatDate(cl.fechaAsociacionFisica.substr(0, 10))
                  : null);
            objVehiculo.selected = true;
            this.vehiculosAsignados.push(objVehiculo);
            this.vehiculosAsignadosModel.push(cl.vehiculoId);
          });
          this.seteaAsignadosZonasVerDetalle();
          // selecciono nodos grilla vehiculos
          var self = this;
          this.gridApi.forEachNode(function(node: any) {
            var index = self.vehiculosAsignados.findIndex(
              x => x.id == node.data.id
            );
            if (index !== -1) {
              node.setSelected(true);
            }
          });
          if (this.esEdicion) {
            this.editDraw = true;
          } else {
            store.commit('setStateLoadZonaMap', true);
            this.editDraw = false;
            //this.showMessageDraw = false;
          }
          this.vehiculosAsignadosResp = Object.assign(
            [],
            this.vehiculosAsignados
          );
          //store.commit("setStateLoadZonaManteiner", true);
          this.ValidarCapacidadGpsVehiculosGrilla();
          this.gridApi.refreshCells({ force: true }); //16-08-2019: (439 - Zona geocerca - Editar) TEST EMR - Se refresca la tabla
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ha ocurrido un problema al intentar recuperar los vehículos asociados'
              );
            }
          } else {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar recuperar los vehículos asociados'
            );
          }
        });
    }
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  async actualizacionVehiculos() {
    //Ingresa/Actualiza/Elimina (Desasocia)
    let vehiculoModelListPost: any = [];
    let vehiculoModelListPut: any = [];
    let vehiculoModelListDelete: any = [];

    if (this.vehiculosAsignados == undefined) this.vehiculosAsignados = [];
    this.vehiculosAsignados.forEach(async (vehiculo: any) => {
      let vehiculoModel = vehiculo;
      let exists = this.coordenadaVehiculos.find(
        x => x.vehiculoId == vehiculo.id
      );

      if (exists == null) {
        vehiculoModel = {
          CoordenadaId: this.editedItem.id,
          VehiculoId: vehiculo.id,
          GpsId: vehiculo.gpsId,
          Vertices: this.currentPoints,
          Circulos: this.currentCircles,
          TipoGeometria: this.editedItem.tipoGeometria,
          FormaJson: this.editedItem.formaJson,
          VelocidadMaxGeo: this.getVelocidadMaxima,
        };
        vehiculoModelListPost.push(vehiculoModel);
      } else {
        vehiculoModel = {
          CoordenadaId: this.editedItem.id,
          VehiculoId: exists.vehiculoId,
          GpsId: vehiculo.gpsId,
          Vertices: this.currentPoints,
          Circulos: this.currentCircles,
          TipoGeometria: this.editedItem.tipoGeometria,
          FormaJson: this.editedItem.formaJson,
          VelocidadMaxGeo: this.getVelocidadMaxima(),
        };
        vehiculoModelListPut.push(vehiculoModel);
      }
    });

    //Valida que no hayan Geocercas
    let notifica = false;
    if (vehiculoModelListPost.length === 0 && vehiculoModelListPut.length === 0)
      notifica = true;
    //---

    this.coordenadaVehiculos.forEach((cl: any) => {
      let clModel = cl;
      let exists = this.vehiculosAsignados.find(
        x => x.id == clModel.vehiculoId
      );
      if (exists == null) {
        let clienteModel = {
          CoordenadaId: this.editedItem.id,
          VehiculoId: clModel.vehiculoId,
          GpsId: clModel.gpsId,
          Vertices: this.currentPoints,
          Circulos: this.currentCircles,
          TipoGeometria: this.editedItem.tipoGeometria,
          FormaJson: this.editedItem.formaJson,
          VelocidadMaxGeo: this.getVelocidadMaxima(),
          NotificaGps: notifica, //Valida que no hayan Geocercas
          moduloLlamado: 'zonas',
        };
        vehiculoModelListDelete.push(clienteModel);
      }
    });
    if (vehiculoModelListDelete.length > 0) {
      this.axiosGps.http
        .delete(`${this.controllerGpsCoordenada}/`, {
          data: vehiculoModelListDelete,
        })
        .then(res => {
          if (vehiculoModelListPut.length > 0) {
            this.axiosGps.http
              .put(`${this.controllerGpsCoordenada}/`, vehiculoModelListPut)
              .then(res => {
                if (vehiculoModelListPost.length > 0) {
                  this.axiosGps.http
                    .post(
                      `${this.controllerGpsCoordenada}/`,
                      vehiculoModelListPost
                    )
                    .then(res => {
                      this.loadingService.hideLoading();
                      //634 - [INTERNA] - Definir solución para concurrencia en asignación de geocercas en vehículo que están compartido
                      if (res.data) {
                        if (!res.data.respuesta) {
                          this.boolCierraModal = true;
                          var messageError: any = this.$t(
                            'mensajes.mensajesError.concurrenciaGeocercasZona'
                          );
                          this.mensajeAsociarGeocercas = res.data.hasOwnProperty(
                            'mensaje'
                          )
                            ? res.data.mensaje
                            : messageError;
                          this.dialogErrorWarning = true;
                        } else {
                          this.close();
                        }
                      }
                      //---
                    })
                    .catch(error => {
                      if (error.response !== undefined) {
                        if (error.response.status !== 401) {
                          this.$snotify.error(
                            'Ha ocurrido un problema al intentar guardar los cambios'
                          );
                        }
                      } else {
                        this.$snotify.error(
                          'Ha ocurrido un problema al intentar guardar los cambios'
                        );
                      }
                    });
                } else {
                  this.close();
                }
              })
              .catch(error => {
                if (error.response !== undefined) {
                  if (error.response.status !== 401) {
                    this.$snotify.error(
                      'Ha ocurrido un problema al intentar guardar los cambios'
                    );
                  }
                } else {
                  this.$snotify.error(
                    'Ha ocurrido un problema al intentar guardar los cambios'
                  );
                }
              });
          } else if (vehiculoModelListPost.length > 0) {
            this.axiosGps.http
              .post(`${this.controllerGpsCoordenada}/`, vehiculoModelListPost)
              .then(res => {
                this.loadingService.hideLoading();
                //634 - [INTERNA] - Definir solución para concurrencia en asignación de geocercas en vehículo que están compartido
                if (res.data) {
                  if (!res.data.respuesta) {
                    this.boolCierraModal = true;
                    var messageError: any = this.$t(
                      'mensajes.mensajesError.concurrenciaGeocercasZona'
                    );
                    this.mensajeAsociarGeocercas = res.data.hasOwnProperty(
                      'mensaje'
                    )
                      ? res.data.mensaje
                      : messageError;
                    this.dialogErrorWarning = true;
                  } else {
                    this.close();
                  }
                }
                //---
              })
              .catch(error => {
                if (error.response !== undefined) {
                  if (error.response.status !== 401) {
                    this.$snotify.error(
                      'Ha ocurrido un problema al intentar guardar los cambios'
                    );
                  }
                } else {
                  this.$snotify.error(
                    'Ha ocurrido un problema al intentar guardar los cambios'
                  );
                }
              });
          } else {
            this.close();
          }
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ha ocurrido un problema al intentar guardar los cambios'
              );
            }
          } else {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar guardar los cambios'
            );
          }
        });
    } else if (vehiculoModelListPut.length > 0) {
      this.axiosGps.http
        .put(`${this.controllerGpsCoordenada}/`, vehiculoModelListPut)
        .then(res => {
          if (vehiculoModelListPost.length > 0) {
            this.axiosGps.http
              .post(`${this.controllerGpsCoordenada}/`, vehiculoModelListPost)
              .then(res => {
                this.loadingService.hideLoading();
                //634 - [INTERNA] - Definir solución para concurrencia en asignación de geocercas en vehículo que están compartido
                if (res.data) {
                  if (!res.data.respuesta) {
                    this.boolCierraModal = true;
                    var messageError: any = this.$t(
                      'mensajes.mensajesError.concurrenciaGeocercasZona'
                    );
                    this.mensajeAsociarGeocercas = res.data.hasOwnProperty(
                      'mensaje'
                    )
                      ? res.data.mensaje
                      : messageError;
                    this.dialogErrorWarning = true;
                  } else {
                    this.close();
                  }
                }
                //---
              })
              .catch(error => {
                if (error.response !== undefined) {
                  if (error.response.status !== 401) {
                    this.$snotify.error(
                      'Ha ocurrido un problema al intentar guardar los cambios'
                    );
                  }
                } else {
                  this.$snotify.error(
                    'Ha ocurrido un problema al intentar guardar los cambios'
                  );
                }
              });
          } else {
            this.close();
          }
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ha ocurrido un problema al intentar guardar los cambios'
              );
            }
          } else {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar guardar los cambios'
            );
          }
        });
    } else if (vehiculoModelListPost.length > 0) {
      this.axiosGps.http
        .post(`${this.controllerGpsCoordenada}/`, vehiculoModelListPost)
        .then(res => {
          this.loadingService.hideLoading();
          //634 - [INTERNA] - Definir solución para concurrencia en asignación de geocercas en vehículo que están compartido
          if (res.data) {
            if (!res.data.respuesta) {
              this.boolCierraModal = true;
              var messageError: any = this.$t(
                'mensajes.mensajesError.concurrenciaGeocercasZona'
              );
              this.mensajeAsociarGeocercas = res.data.hasOwnProperty('mensaje')
                ? res.data.mensaje
                : messageError;
              this.dialogErrorWarning = true;
            } else {
              this.close();
            }
          }
          //---
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ha ocurrido un problema al intentar guardar los cambios'
              );
            }
          } else {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar guardar los cambios'
            );
          }
        });
    } else {
      this.close();
    }
  }
  getVelocidadMaxima(): number {
    if (this.editedItem.velocidadMaxGeo == null) {
      return 0;
    } else if (this.editedItem.velocidadMaxGeo.toString() == '') {
      return 0;
    } else {
      return this.editedItem.velocidadMaxGeo;
    }
  }

  // --------------------------------------------------------------------------------------
  closeModal(val: boolean) {
    document.getElementById('cardDivR').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];
    this.vehiculosRespaldo = [];
    this.coordenadaVehiculos = [];
    this.editDraw = false;
    this.buscarVehiculosZonasEditar = '';
    this.gridApi.setQuickFilter('');
    this.addressRequired = false;
    this.loadingService.hideLoading();
    this.keyMap += 1;
    store.commit('setStateLoadZonaMap', false);
    store.commit('setStateLoadZonaManteiner', false);
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    if (this.coordShape != null) {
      this.coordShape.overlay.setMap(null);
    }
    this.$validator.errors.clear();
  }

  initialize() {
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
        sort: 'desc',
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
        field: 'esCompartido',
        width: 40,
        minWidth: 40,
        cellRenderer: this.createButtonCellVehiculoAlerta,
        enablePivot: false,
        resizable: true,
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
        minWidth: 80,
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        lockVisible: true,
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
      {
        headerName: 'Fecha Asign. Geocerca',
        field: 'fechaInicioAsociacion',
        rowDrag: true,
        minWidth: 80,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Asign. Física',
        field: 'fechaAsociacionFisica',
        rowDrag: true,
        minWidth: 80,
        enablePivot: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado Asociación',
        field: 'estadoAsociacion',
        sortable: true,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
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

    if (!this.esEdicion) {
      this.columnDefsVehiculo.shift();
      this.columnDefsVehiculo.splice(2, 1);
    }

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
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  createButtonCellVehiculoAlerta(params: any) {
    const item: any = this.vehiculosRespaldo.find(
      x => x.id === params.data.id && x.esCompartido === true
    );
    if (item !== undefined) {
      let eButton = document.createElement('i');
      eButton.setAttribute(
        'title',
        'Vehículo Compartido por: ' + item.compartidoPor
      );
      eButton.innerHTML =
        '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i>';
      return eButton;
    }
  }

  marcarTodosVehiculos(value: boolean) {
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];
    if (value) {
      this.vehiculosRespaldo.forEach((veh: any) => {
        this.vehiculosAsignados.push(veh);
        this.vehiculosAsignadosModel.push(veh.id);
        veh.selected = true;
      });
    } else {
      this.vehiculosRespaldo.forEach((veh: any) => {
        veh.selected = false;
      });
    }
    this.ValidarCapacidadGpsVehiculosGrilla();
    this.seleccionoTodos = value;
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
          '- GPS asociado al vehículo excede límite de Polígonos permitidos.\n';
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

  ValidarCapacidadGpsVehiculosGrilla() {
    let puntos = this.currentPoints;
    let circulos = this.currentCircles;
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

      let exists = this.coordenadaVehiculos.find(x => x.vehiculoId == va.id);

      if (exists === undefined) {
        //Valida Geocercas
        if (va.geocercasAlmacenadas + 1 > va.limiteGeocercas)
          va.warnGeocercas = true;
        //Valida Puntos
        //va.puntosAlmacenados - this.currentPointsBkp + puntos >
        if (poligonosAlmacenados > va.limitePuntos) va.warnPuntos = true;
        //Valida Circulos
        //va.circulosAlmacenados - this.currentCirclesBkp + circulos >
        if (
          va.circulosAlmacenados + circulos > va.limiteCirculos &&
          va.limiteCirculos > 0
        )
          va.warnCirculos = true;
        //Valida Puntos por Geo
        if (va.limitePuntosPorGeocerca < puntos) va.warnPuntosPorGeo = true;
        //Valida Soporta Circulos
        if (va.limiteCirculos === 0 && circulos > 0)
          va.warnSoportaCirculos = true;
      } else {
        //Valida Puntos
        if (va.puntosAlmacenados - exists.vertices + puntos > va.limitePuntos)
          va.warnPuntos = true;
        //Valida Circulos
        if (
          va.circulosAlmacenados - exists.circulos + circulos >
            va.limiteCirculos &&
          va.limiteCirculos > 0
        )
          va.warnCirculos = true;
        //Valida Puntos por Geo
        if (va.limitePuntosPorGeocerca < puntos) va.warnPuntosPorGeo = true;
        //Valida Soporta Circulos
        if (va.limiteCirculos === 0 && circulos > 0)
          va.warnSoportaCirculos = true;
      }
    });
    //---
    this.gridApi.refreshCells({ force: true });
  }

  createButtonCellVehiculos(params: any) {
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

    if (this.esEdicion) {
      return eButton;
    } else {
      return '';
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  close() {
    this.closeModal(false);
    this.$snotify.success('Los cambios han sido guardados de forma exitosa');
  }

  closeErrorWarningGuardar() {
    this.dialogErrorWarning = false;
    this.btnBloquear = false;
    if (this.boolCierraModal) {
      this.close();
    }
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

  getClienteID() {
    return config.getClienteSesion();
  }

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.btnBloquear = false;
    if (val) {
      this.loadingService.showLoading();
      this.btnBloquear = true;

      let model = {
        Id: this.editedItem.id,
        ClienteId: this.getClienteID(),
        Nombre: this.editedItem.nombre,
        Descripcion: this.editedItem.descripcion,
        Direccion: this.editedItem.direccion,
        TipoGeometria: this.editedItem.tipoGeometria,
        FormaJson: this.editedItem.formaJson,
        TipoZonaId: this.editedItem.tipoZonaId,
        GrupoId: this.editedItem.grupoId,
        Estado: this.editedItem.estado,
        VelocidadMaxGeo:
          this.editedItem.tipoZonaId == TiposZonas.Geocerca ||
          this.editedItem.tipoZonaId == TiposZonas.Sitio
            ? this.getVelocidadMaxima()
            : null,
        TiempoEstadia: this.editedItem.tiempoEstadia,
      };
      this.axiosGps.http
        .put(`${this.controller}/`, model)
        .then(res => {
          if (this.editedItem.tipoZonaId === TiposZonas.Geocerca) {
            this.actualizacionVehiculos();
          } else {
            this.close();
          }
        })
        .catch(error => {
          this.btnBloquear = false;
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ha ocurrido un problema al intentar guardar los cambios.'
              );
            }
          } else {
            this.$snotify.error(
              'Ha ocurrido un problema al intentar guardar los cambios.'
            );
          }
        });
      if (this.estLlamado) {
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
      } else {
        document.getElementsByTagName('html')[0].style.overflow = 'auto';
      }
      this.estLlamado = false;
    }
    this.btnBloquear = false;
  }

  async obtenerVehiculosOpt() {
    var cont = 0;
    this.editDraw = true;
    this.loadingService.showLoading();
    try {
      const responseVehiculo = await this.axiosVehiculo.http.get(
        `${
          this.controllerVehiculo
        }/${this.getClienteID()}/obtenerVehiculosCliente`
      );

      this.vehiculosRespaldo = responseVehiculo.data;

      if (this.vehiculosRespaldo.length > 0) {
        this.muestraVehiculos = true;
        this.setCoordenadasVehiculos();
      } else {
        this.muestraVehiculos = false;
        if (this.esEdicion) {
          this.editDraw = true;
        } else {
          store.commit('setStateLoadZonaMap', true);
          this.editDraw = false;
        }
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

  onVehiculoChange(vehiculo: any) {
    if (vehiculo.length !== undefined) {
      let v = [];
      for (let i = 0; i <= vehiculo.length - 1; i++) {
        let vAdd: any = this.vehiculosRespaldo.find(x => x.id === vehiculo[i]);
        v.push(vAdd);
      }
      this.vehiculosAsignados = v;
    }
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  onVehiculoInput(vehiculo: any) {
    if (vehiculo != undefined) {
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
    for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
      if (this.vehiculosRespaldo[i].id == item.id) {
        this.vehiculosRespaldo[i].selected = false;
        break;
      }
    }
    if (
      this.vehiculosAsignados.length == 0 &&
      this.vehiculosAsignadosResp.length > 0
    ) {
      this.showMessageConfirmDraw = true;
      this.showMessageDraw = false;
    }
    this.btnBloquear = false;
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  //-------------------------------------------------------------------------------------------
  //FIN ASOCIACIONES /////////////////////////////////////////////////////////////////////////////////////////

  enableContinue(val: any) {
    if (val !== null) {
      this.coordSelected = true;
      if (this.coordShape !== null) {
        this.currentPointsBkp = this.currentPoints;
        this.currentCirclesBkp = this.currentCircles;
      }
      this.coordShape = val;
      // this.editedItem.direccion = '';
      switch (this.coordShape.tipo) {
        case 'marker':
          this.editedItem.tipoGeometria = TipoGeometria.Marcador;
          this.currentPoints = 1;
          this.currentCircles = 0;
          this.editedItem.direccion = this.coordShape.addressMarker;
          break;
        case 'circle':
          this.editedItem.tipoGeometria = TipoGeometria.Circunferencia;
          this.currentPoints = 1;
          this.currentCircles = 1;
          break;
        case 'rectangle':
          this.editedItem.tipoGeometria = TipoGeometria.Rectangulo;
          this.currentPoints = 5;
          this.currentCircles = 0;
          break;
        case 'polygon':
          this.editedItem.tipoGeometria = TipoGeometria.Poligono;
          this.currentPoints = this.coordShape.puntos;
          this.currentCircles = 0;
          break;
      }
      this.editedItem.formaJson = this.coordShape.coordenadas;
      this.ValidarCapacidadGpsVehiculosGrilla();
      this.gridApi.refreshCells({ force: true });
      this.btnBloquear = false;
    } else {
      this.btnBloquear = true;
    }
  }

  async getTiposZona(filtered: boolean = false) {
    if (filtered) {
      this.axiosGps.http
        .get(`${this.controllerTipoZona}/`)
        .then(res => {
          this.TipoZona = res.data.filter(
            (x: any) =>
              x.nombre
                .toString()
                .toUpperCase()
                .trim() === 'MARCADOR'
          );
        })
        .catch(error => {
          this.loadingService.hideLoading();
        });
    } else {
      this.axiosGps.http
        .get(`${this.controllerTipoZona}/`)
        .then(res => {
          this.TipoZona = res.data.filter(
            (x: any) =>
              x.nombre
                .toString()
                .toUpperCase()
                .trim() !== 'MARCADOR'
          );
        })
        .catch(error => {
          this.loadingService.hideLoading();
        });
    }
  }

  async obtenerTiposLugar() {
    try {
      const response = await this.axiosGps.http.get(
        `${this.controllerTipoLugar}/${this.getClienteID()}/tiposlugarCliente`
      );
      this.TipoLugar = response.data.filter(
        (x: any) => x.tipoLugarAlcance === TipoLugarAlcance.Cliente
      );
      store.commit('setStateLoadZonaManteiner', true);
    } catch (error) {
      this.loadingService.hideLoading();
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

  //MODIFICACION --------------------------------------------------------
  grabarEdicion() {
    let msjDuplicado = '';
    let nombreTipo = TiposZonas[this.editedItem.tipoZonaId];
    if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
      msjDuplicado = 'Ya existe una ' + nombreTipo + ' con este nombre.';
    } else {
      msjDuplicado = 'Ya existe un ' + nombreTipo + ' con este nombre.';
    }
    this.$validator.validateAll().then(res => {
      if (res) {
        //valida nombre de la zona
        this.axiosGps.http
          .get(this.controller)
          .then(res => {
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
                //x.tipoLugarId === this.editedItem.tipoLugarId &&
                x.id !== this.editedItem.id &&
                x.clienteId === this.getClienteID() &&
                x.tipoLugarAlcance === TipoLugarAlcance.Cliente
            );
            if (zonas.length === 0) {
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
                if (this.editedItem.tipoZonaId == TiposZonas.Sitio) {
                  this.tituloConfirmacion = `Editar Sitio: ${this.editedItem.nombre}`;
                } else if (this.editedItem.tipoZonaId == TiposZonas.Geocerca) {
                  this.tituloConfirmacion = `Editar Geocerca: ${this.editedItem.nombre}`;
                } else {
                  this.tituloConfirmacion = `Editar Marcador: ${this.editedItem.nombre}`;
                }
                this.dialogConfirmacion = true;
              } else {
                this.boolCierraModal = false;
                this.mensajeAsociarGeocercas = this.$t(
                  'mensajes.mensajesError.cargaGeocercasZonaEditar'
                );
                this.dialogErrorWarning = true;
                this.dialogConfirmacion = false;
                //this.bottomNav = "3";
              }
              this.btnBloquear = false;
              //this.btnBloquear = true;
              //this.dialogConfirmacion = true;
            } else {
              this.$snotify.error(msjDuplicado);
              this.btnBloquear = false;
            }
          })
          .catch(error => {
            this.loadingService.hideLoading();
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.$snotify.error(
                  'Ha ocurrido un error al validar el nombre de la Zona'
                );
              }
            } else {
              this.$snotify.error(
                'Ha ocurrido un error al validar el nombre de la Zona'
              );
            }
          });
      }
    });
  }

  onRowSelectedVehiculoZonaEditar(event: any) {
    this.vehSelectedEditar = event.node;
    this.vehCountEditar++;
  }

  async onSelectedChangeVehiculoZonaEditar() {
    await this.actualizarGrillaVehiculoEditar();
    this.vehiculosAsignados = this.gridApi.getSelectedRows();
    if (this.vehSelectedEditar === 1 && this.vehSelectedEditar != null) {
      if (this.vehSelectedEditar.selected) {
        this.vehiculosAsignados.forEach(async (e: any) => {
          if (e.vehSelectedEditar === this.vehSelectedEditar.data.id) {
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

    this.vehCountEditar = 0;
  }

  actualizarGrillaVehiculoEditar() {
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

  getRowNodeIdVehiculoEditar(rowIdVehiculoEditar: IVehiculoGeocerca) {
    if (!rowIdVehiculoEditar) {
      return;
    }
    return rowIdVehiculoEditar.id;
  }

  onFilterTextBoxChangedVehiculoEditar() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarVehiculosZonasEditar.length > 1) {
      this.gridApi.setQuickFilter(this.buscarVehiculosZonasEditar);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }

  seteaAsignadosZonasVerDetalle() {
    if (!this.esEdicion) {
      this.vehiculosRespaldo = this.vehiculosAsignados;
    }
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (
      this.vehiculosRespaldo.length > 0 &&
      this.buscarVehiculosZonasEditar.length > 1
    ) {
      let busqueda = this.buscarVehiculosZonasEditar.toLowerCase();
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

.ag-header-cell-label {
  justify-content: center;
}
</style>

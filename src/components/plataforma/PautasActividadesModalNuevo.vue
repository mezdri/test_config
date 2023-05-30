<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivS">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Crear Pautas de Actividades</v-toolbar-title>
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
              v-show="asociarActividades.visible"
              :complete="e1 > asociarActividades.step"
              :step="asociarActividades.step"
              >Asociar Actividades</v-stepper-step
            >
            <v-stepper-step
              v-show="asociarPlanMantencion.visible"
              :complete="e1 > asociarPlanMantencion.step"
              :step="asociarPlanMantencion.step"
              >Asociar Plan de Mantención</v-stepper-step
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
                              Informaci&oacute;n General
                            </h2>
                          </v-flex>
                        </div>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'required'"
                              v-model="editedItem.nombrePlan"
                              :error-messages="errors.collect('nombPauta')"
                              data-vv-name="nombPauta"
                              label="Nombre de la Pauta"
                              required
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
              v-show="asociarActividades.visible"
              :step="asociarActividades.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Actividades</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-form ref="form" lazy-validation>
                            <v-text-field
                              label="Buscar..."
                              v-model="buscarActividades"
                              @input="onFilterTextBoxChangedActividades"
                              prepend-icon="lock_open"
                              append-icon="search"
                            ></v-text-field>
                          </v-form>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card></v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarPlanMantencion.visible"
              :step="asociarPlanMantencion.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Plan de Mantención</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-form ref="form" lazy-validation>
                            <v-text-field
                              label="Buscar..."
                              v-model="buscarPlanMantencion"
                              @input="onFilterTextBoxChangedPlanMantencion"
                              prepend-icon="lock_open"
                              append-icon="search"
                            ></v-text-field>
                          </v-form>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card></v-card>
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
  </v-layout>
</template>

<script lang="ts">
import {
  IVehiculo,
  ITipoVehiculo,
  ITipoPeaje,
  ITipoCombustible,
  ITipoTransmision,
  IMarca,
  IModelo,
  IEtiqueta,
} from '@/interfaces/Vehiculos';
import { IConductor } from '@/interfaces/Conductores';
import { IGeocerca } from '@/interfaces/Geocerca';
import { IZona } from '@/interfaces/Zonas';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { EstadoEntidad, TipoGeometria, EstadoEnvioGps } from '@/config/enums';
import { IGPS } from '@/interfaces/GPS';
import { IFlota } from '@/interfaces/Flota';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';

import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoCompartirInformacion } from '@/config/enums';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  GridReadyEvent,
  SelectionChangedEvent,
  SelectionController,
  RowNode,
} from 'ag-grid-community';
import { differenceBy } from 'lodash';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class PautasActividadesModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Vehiculos;
  permisosActuales: PermisoAccionVm[] = [];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IVehiculo = {};
  hayPrincipal: boolean = false;
  showAlertaGpsPrincipal: boolean = false;
  search: string = '';
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  showModalGeocercas: boolean = false;
  dialogErrorWarningCond: boolean = false;
  dialogErrorWarningGuardar: boolean = false;

  usuarioId: number = store.state.userId;
  gpsPrincipal: number = 0;
  vr: ValidaRut = new ValidaRut();
  loadingService: LoadingService;

  buscarEtiquetas: string = '';
  buscarGps: string = '';
  buscarGeocerca: string = '';
  buscarConductor: string = '';
  geosCount: number = 0;
  geoSelected: any = null;

  buscarActividades: any = null;
  buscarPlanMantencion: any = null;

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  etiquetaAsignadosModel: any = [];
  etiquetaAsignados: IEtiqueta[] = [];
  etiquetaRespaldo: IEtiqueta[] = [];

  gpsAsignadosModel: any = [];
  gpsAsignados: IGPS[] = [];
  gpsRespaldo: IGPS[] = [];
  mostrarGps: Boolean = false;
  mostrarGeocerca: Boolean = false;
  mostrarEtiqueta: Boolean = false;

  geocercaAsignadosModel: any = [];
  geocercaAsignados: IZona[] = [];
  geocercaRespaldo: IZona[] = [];
  geoSeleccionadas: IZona[] = [];
  geoSeleccionadasAux: IZona[] = [];

  conductorAsignadosModel: any = [];
  conductorAsignados: IConductor[] = [];
  conductorRespaldo: IConductor[] = [];
  vehiculoConductorEliminar: any[] = []; //Para "Robar" el conductor a otro vehiculo

  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  gridApiGeo: GridApi;
  columnApiGeo: ColumnApi;
  gridApiEtiquetas: GridApi;
  columnApiEtiquetas: ColumnApi;
  gridApiConductor: GridApi;
  columnApiConductor: ColumnApi;

  columnDefsEtiqueta: Array<ColDef> = [];
  columnDefsGPS: Array<ColDef> = [];
  columnDefsGeocerca: Array<ColDef> = [];
  columnDefsConductor: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;

  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);

  showMessage: Boolean = false;

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
  };

  asociarActividades: PermisoAccionVm = {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 2,
  };

  asociarPlanMantencion: PermisoAccionVm = {
    accion: 'Crear - Asociar Plan de Mantención',
    visible: true,
    step: 3,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarActividades,
    this.asociarPlanMantencion,
  ];

  usuario: any = store.state.user;

  constructor() {
    super();

    this.loadingService = new LoadingService();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
  }

  created() {
    this.chequearPermisos();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivV').scrollIntoView(true);
  }

  mounted() {}

  onFilterTextBoxChangedActividades() {}

  onFilterTextBoxChangedPlanMantencion() {}
}
</script>

<style scoped>
#alinear {
  text-align: justify;
}

.h2_title {
  font-weight: normal;
}
</style>

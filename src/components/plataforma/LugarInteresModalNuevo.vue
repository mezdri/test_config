<!-- version 1.1 -->
<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivLI">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquearMapa"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Lugar de Interés</v-toolbar-title>

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
            <v-divider v-show="dibujar.visible"></v-divider>
            <v-stepper-step
              v-show="informacionGeneral.visible"
              :complete="e1 > informacionGeneral.step"
              :step="informacionGeneral.step"
              >Información General</v-stepper-step
            >
          </v-stepper-header>
          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="dibujar.visible"
              :step="dibujar.step"
              style="padding:0px !important;"
            >
              <app-google-map
                name="lugarinteres-new"
                :show="show"
                :enableControls="enableControlsMap"
                module="lugarinteres"
                :key="keyMap"
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
                            <v-text-field
                              label="Nombre"
                              v-validate="
                                'required|LugarInteresNombreUnicoCrear|max:80'
                              "
                              :counter="80"
                              data-vv-name="nombre"
                              v-model="editedItem.nombre"
                              type="text"
                              :error-messages="errors.collect('nombre')"
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
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Dirección"
                              v-validate="{
                                required: this.addressRequired,
                                max: 200,
                              }"
                              :counter="200"
                              data-vv-name="direccion"
                              v-model="editedItem.direccion"
                              type="text"
                              :error-messages="errors.collect('direccion')"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              item-value="id"
                              item-text="nombre"
                              :items="TipoLugar"
                              v-model="editedItem.grupoId"
                              data-vv-name="tipolugar"
                              label="Grupo de Interés"
                              :error-messages="errors.collect('tipolugar')"
                              no-data-text="Sin resultados"
                              @change="selectedTipoLugarId"
                              v-validate="'required'"
                              required
                            ></v-select>
                          </v-flex>
                          <v-divider></v-divider>
                          <v-flex xs12 sm12 md12>
                            * Este Lugar de Interés estará disponible para los
                            Clientes asociados en el mantenedor de
                            <strong>Grupo de Interés.</strong>
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
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Lugar de Interés' })
      "
      :mensaje="
        $t('mensajes.crud.crear.mensaje', {
          entidad: 'el Lugar de Interés ',
        })
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
  </v-layout>
</template>

<script lang="ts">
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { EstadoEntidad, TiposZonas, TipoLugarAlcance } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';

import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoGeometria } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';

//IMPORTS PROPIOS DE ZONA
import GoogleMapDrawer from '@/components/GoogleMapDrawer.vue';
import { IZona, ITipoLugar, ITipoZona } from '@/interfaces/Zonas';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import ZonaEventBus from '@/eventBus/zonaEventBus';
import { GridApi, ColumnApi, ColDef, GridReadyEvent } from 'ag-grid-community';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    'app-google-map': GoogleMapDrawer,
  },
})
export default class LugarInteresModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: '' }) strCoords!: string;
  @Prop({ default: 0 }) tipogeometria!: TipoGeometria;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  lugaresinteres!: IZona;

  readonly controller: string = 'Coordenada';
  readonly controllerTipoLugar: string = 'grupodezona';

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.LugarInteres;
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

  permisosTotales: PermisoAccionVm[] = [this.dibujar, this.informacionGeneral];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IZona = {};
  keyMap: number = 0;

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  usuarioId: number = store.state.userId;

  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();
  loadingService = new LoadingService();
  addressRequired: boolean = false;

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;

  columnDefsVehiculo: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;
  btnBloquearMapa: Boolean = false;

  //VARIABLES STEPPER 1
  enableControlsMap: boolean = false;
  coordShape: any = null;
  coordSelected: boolean = false;
  TipoZona: ITipoZona[] = [];
  TipoLugar: ITipoLugar[] = [];

  tipoLugarId: number;
  tipoZonaId: number;

  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  created() {
    this.chequearPermisos();

    ZonaEventBus.$on('resetCreation', () => {
      this.e1 = 1;
      this.btnBloquear = true;
      this.btnBloquearMapa = false;
    });
  }

  mounted() {
    this.initialize();
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
    this.registrarValidadores();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.btnBloquear = false;
    this.btnBloquearMapa = false;
    this.validForm = true;
    document.getElementById('cardDivLI').scrollIntoView(true);
    store.commit('setEsDibujar', true); //Al iniciar es "Dibujar"
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('LugarInteresNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Lugar de Interés con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosGps.http
            .get(`${self.controller}/${0}/${value}/ChequearNombreUnicoLugar`)
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message:
                          '* Ya existe un Lugar de Interés con este nombre.',
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
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.loadingService.showLoading();
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.btnBloquear = true;
    this.btnBloquearMapa = false;
    if (value) {
      this.enableControlsMap = true;
    } else {
      this.enableControlsMap = false;
    }
    setTimeout(() => {
      store.commit('setStateLoadZonaManteiner', true);
    }, 3000);
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivLI').scrollIntoView(true);
    this.btnBloquear = false;
    this.btnBloquearMapa = false;
    this.editedItem = {};
    this.e1 = 1;
    this.addressRequired = false;
    this.$emit('modalAsociacionEmit', false);
    store.commit('setStateLoadZonaMap', false);
    store.commit('setStateLoadZonaManteiner', false);
    this.dialog = false;
    this.keyMap += 1;
    if (this.coordShape !== null) {
      this.coordShape.overlay.setMap(null);
    }

    this.$validator.errors.clear();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
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
        tipozona: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        tipolugar: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  async continuar() {
    store.commit('setEsDibujar', false); //No es "Dibujar"
    switch (this.e1) {
      case 1:
        if (this.coordSelected) {
          this.e1 = 2;
          this.btnText = 'Guardar';
          this.btnClass = 'btn-grabar';
          this.btnBloquear = false;
          this.btnBloquearMapa = false;
          document.getElementById('cardDivLI').scrollIntoView(true);
          await this.obtenerTiposLugarInteres();
        } else {
          this.$snotify.error(
            'Debe seleccionar un área en el mapa antes de continuar.'
          );
        }
        break;
      case 2:
        this.$validator.validateAll().then(res => {
          if (res) {
            //valida nombre del lugar de interes
            this.axiosGps.http
              .get(this.controller)
              .then(res => {
                let lugares = res.data.filter(
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
                    x.tipoLugarAlcance === TipoLugarAlcance.GPS
                  //&& x.tipoLugarId === this.editedItem.tipoLugarId
                );
                if (lugares.length === 0) {
                  this.btnBloquear = true;
                  this.dialogConfirmacion = true;
                  this.btnBloquearMapa = true;
                } else {
                  this.loadingService.hideLoading();
                  this.$snotify.error(
                    'Ya existe un Lugar de interés con este nombre'
                  );
                }
              })
              .catch(error => {
                this.loadingService.hideLoading();
                if (error.response !== undefined) {
                  if (error.response.status !== 401) {
                    this.$snotify.error(
                      'Ha ocurrido un error al validar el nombre del Lugar de Interés'
                    );
                  }
                } else {
                  this.$snotify.error(
                    'Ha ocurrido un error al validar el nombre del Lugar de Interés'
                  );
                }
              });
          }
        });
        break;
    }
  }

  // continuar() {
  //     this.$validator.validateAll().then(resultado => {
  //       if (resultado) {
  //         if (this.e1 === this.permisosActuales.length) {
  //           this.btnBloquear = true;
  //           this.dialogConfirmacion = true;
  //         } else if (this.e1 === this.permisosActuales.length - 1) {
  //           this.e1 += 1;
  //           this.btnText = "Guardar";
  //           this.btnClass = "btn-grabar";
  //         } else {
  //           this.e1 += 1;
  //         }
  //       }
  //     });
  //   }

  getClienteID() {
    return config.getClienteSesion();
  }

  selectedTipoLugarId(e: any) {
    this.tipoLugarId = e;
  }

  selectedTipoZonaId(e: any) {
    this.tipoZonaId = e;
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      const resultadoValidacion = this.$validator.validateAll();
      if (resultadoValidacion) {
        this.btnBloquear = true;
        this.btnBloquearMapa = false;
        await this.nuevo();
      }
    }

    this.btnBloquear = false;
    this.btnBloquearMapa = false;
  }

  confirmCallbackConfirm(aceptado: boolean) {
    this.dialogConfirmacionClose = false;
    if (aceptado) {
      this.closeModal(false);
    }
  }

  closeSuccess() {
    this.loadingService.hideLoading();
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Lugar de Interés ' + this.editedItem.nombre,
        creadoA: 'creado',
      })
    );
    this.closeModal(false);
  }

  async nuevo() {
    try {
      this.loadingService.showLoading();
      let tipoZonaId = 0;

      if (this.editedItem.tipoGeometria === TipoGeometria.Marcador) {
        tipoZonaId = TiposZonas.Marcador;
      } else {
        tipoZonaId = TiposZonas.Sitio;
      }

      let modelCoordenada = {
        Id: 0,
        Nombre: this.editedItem.nombre,
        ClienteId: this.getClienteID(),
        Descripcion: this.editedItem.descripcion,
        Direccion: this.editedItem.direccion,
        TipoGeometria: this.editedItem.tipoGeometria,
        FormaJson: this.editedItem.formaJson,
        TipoZonaId: tipoZonaId,
        GrupoId: this.tipoLugarId,
        Estado: this.editedItem.estado,
      };
      console.log('x', modelCoordenada);
      await this.axiosGps.http.post(`${this.controller}/`, modelCoordenada);
      this.closeSuccess();
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ha ocurrido un problema al intentar crear el lugar de interés ' +
              this.editedItem.nombre
          );
        }
      } else {
        this.$snotify.error(
          'Ha ocurrido un problema al intentar crear el lugar de interés ' +
            this.editedItem.nombre
        );
      }
      this.btnBloquear = false;
      this.btnBloquearMapa = false;
    }
  }

  errorMSG(error: any, he: HandleErrors) {
    he.showError(error);
    this.btnBloquear = false;
    this.btnBloquearMapa = false;
  }

  enableContinue(val: any) {
    if (val !== null) {
      this.coordSelected = true;
      this.btnBloquear = false;
      this.btnBloquearMapa = false;
      this.validForm = true;
      this.coordShape = val;
      this.editedItem.direccion = '';
      switch (this.coordShape.tipo) {
        case 'marker':
          this.editedItem.tipoGeometria = TipoGeometria.Marcador;
          this.editedItem.direccion = this.coordShape.addressMarker;
          this.addressRequired = true;
          break;
        case 'circle':
          this.editedItem.tipoGeometria = TipoGeometria.Circunferencia;
          this.addressRequired = false;
          break;
        case 'rectangle':
          this.editedItem.tipoGeometria = TipoGeometria.Rectangulo;
          this.addressRequired = false;
          break;
        case 'polygon':
          this.editedItem.tipoGeometria = TipoGeometria.Poligono;
          this.addressRequired = false;
          break;
      }

      this.editedItem.formaJson = this.coordShape.coordenadas;
      this.btnBloquear = false;
      this.btnBloquearMapa = false;
    } else {
      this.btnBloquear = true;
      this.btnBloquearMapa = false;
    }
  }

  async obtenerTiposLugarInteres() {
    try {
      const response = await this.axiosGps.http.get(
        `${this.controllerTipoLugar}/`
      );
      this.TipoLugar = response.data.filter(
        (x: any) =>
          x.tipoLugarAlcance === TipoLugarAlcance.GPS &&
          x.estado !== EstadoEntidad.Eliminado
      );
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ha ocurrido un problema al intentar obtener los Grupos de Interes.'
          );
        }
      } else {
        this.$snotify.error(
          'Ha ocurrido un problema al intentar obtener los Grupos de Interes.'
        );
      }
    }
  }

  back() {
    if (this.editedItem.tipoZonaId == TiposZonas.Sitio && this.e1 == 4) {
      this.e1 -= 2;
    } else {
      this.e1 -= 1;
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

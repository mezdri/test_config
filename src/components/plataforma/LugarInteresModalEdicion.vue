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
          <v-btn icon dark @click="cerrarOperacion()" :disabled="btnBloquear">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>
            {{
              esEdicion
                ? 'Editar Lugar de Interés'
                : 'Ver Detalle Lugar de Interés'
            }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
              @click="grabarEdicion(), (btnBloquear = true)"
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
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == dibujar.step &&
                ((esEdicion && dibujar.visible) ||
                  (dibujarVerDetalle.visible && !esEdicion))
            "
          >
            <app-google-map
              name="lugarinteres-edit"
              :show="show"
              :enableControls="esEdicion"
              :coordenadas="lugarinteres.formaJson"
              :geometria="lugarinteres.tipoGeometria"
              module="lugarinteres"
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
                        <v-text-field
                          label="Nombre"
                          v-validate="
                            'required|LugarInteresNombreUnicoEditar|max:80'
                          "
                          :counter="80"
                          data-vv-name="nombre"
                          v-model="editedItem.nombre"
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          type="text"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Dirección"
                          :counter="200"
                          data-vv-name="direccion"
                          v-model="editedItem.direccion"
                          :disabled="!esEdicion"
                          type="text"
                          v-validate="{
                            required: this.addressRequired,
                            max: 200,
                          }"
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
      :titulo="titulo"
      mensaje="¿Está seguro que desea guardar los cambios realizados?"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      textoBtnSi="Guardar Cambios"
      textoBtnNo="Continuar Editando"
    ></app-confirmacion>
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
import { IZona, ITipoLugar } from '@/interfaces/Zonas';
import { LoadingService } from '@/services/loadingService';
import {
  EstadoEntidad,
  TipoLugarAlcance,
  ServicioProxy,
  TipoGeometria,
} from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
declare var google: any;

@Component({
  components: {
    'app-google-map': GoogleMapDrawer,
    'app-confirmacion': Confirmation,
  },
})
export default class LugarInteresModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', tipoGeometria: 0, formaJson: '' }),
  })
  lugarinteres!: IZona;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.LugarInteres;
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

  permisosTotales: PermisoAccionVm[] = [
    this.dibujar,
    this.informacionGeneral,
    this.dibujarVerDetalle,
    this.informacionGeneralVerDetalle,
  ];

  readonly controller: string = 'Coordenada';
  readonly controllerTipoLugar: string = 'grupodezona';

  //Variables globales
  $snotify: any;
  bottomNav: any = '1';
  e1: number = 1;
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
  editedItem: IZona = {};
  coordShape: any = null;
  btnBloquear: boolean = false;
  loadingService = new LoadingService();
  addressRequired: boolean = false;
  keyMap: number = 0;
  titulo: string = '';

  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  //Variables para el dibujo del mapa
  strShape: string = '';
  typeShape: number = 0;

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.strShape = '';
    this.typeShape = 0;
    this.bottomNav = 1;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        await this.obtenerTiposLugarInteres();
        const lugarInteresResponse = await this.axiosGps.http.get<IZona>(
          `${this.controller}/${this.lugarinteres.id}`
        );
        this.editedItem = lugarInteresResponse.data;
        this.$validator.errors.clear();
      } catch (error) {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(error);
          }
        } else {
          this.handleErrors.showError(error);
        }
      } finally {
        //this.loadingService.hideLoading();
        setTimeout(() => {
          store.commit('setStateLoadZonaManteiner', true);
        }, 3000);
      }
    } else {
      this.esEdicion = false;
    }
  }

  created() {}

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
    this.registrarValidadores();
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

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('LugarInteresNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Lugar de Interés con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosGps.http
            .get(
              `${self.controller}/${self.lugarinteres.id}/${value}/ChequearNombreUnicoLugar`
            )
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

  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    store.commit('setStateLoadZonaMap', false);
    store.commit('setStateLoadZonaManteiner', false);
    this.keyMap += 1;
    this.dialog = false;
    this.addressRequired = false;

    if (this.coordShape !== null) {
      this.coordShape.overlay.setMap(null);
    }

    this.$validator.errors.clear();
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        direccion: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        descripcion: {
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

  close() {
    this.closeModal(false);
    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
  }

  confirmCallbackConfirm(aceptado: boolean) {
    this.dialogConfirmacionClose = false;
    if (aceptado) {
      this.closeModal(false);
    }
    this.btnBloquear = false;
  }

  getClienteID() {
    return config.getClienteSesion();
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;
    this.btnBloquear = false;

    if (aceptado) {
      try {
        this.loadingService.showLoading();

        this.btnBloquear = true;

        const model = {
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
        };

        await this.axiosGps.http.put(`${this.controller}/`, model);
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
  }

  enableContinue(val: any) {
    if (val !== null) {
      this.coordSelected = true;
      this.coordShape = val;

      switch (this.coordShape.tipo) {
        case 'marker':
          this.editedItem.tipoGeometria = TipoGeometria.Marcador;
          // this.editedItem.direccion = this.coordShape.addressMarker;
          this.addressRequired = true;
          break;
        case 'circle':
          this.editedItem.tipoGeometria = TipoGeometria.Circunferencia;
          // this.editedItem.direccion = '';
          this.addressRequired = false;
          break;
        case 'rectangle':
          this.editedItem.tipoGeometria = TipoGeometria.Rectangulo;
          // this.editedItem.direccion = '';
          this.addressRequired = false;
          break;
        case 'polygon':
          this.editedItem.tipoGeometria = TipoGeometria.Poligono;
          // this.editedItem.direccion = '';
          this.addressRequired = false;
          break;
      }

      this.editedItem.formaJson = this.coordShape.coordenadas;
      this.btnBloquear = false;
    } else {
      this.btnBloquear = true;
    }
  }

  async obtenerTiposLugarInteres() {
    try {
      const response = await this.axiosGps.http.get(
        `${this.controllerTipoLugar}/`
      );
      this.TipoLugar = response.data.filter(
        (x: any) =>
          x.tipoLugarAlcance === TipoLugarAlcance.GPS && x.estado === 1
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

  grabarEdicion() {
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
                //x.tipoLugarId === this.editedItem.tipoLugarId &&
                x.id !== this.editedItem.id &&
                x.tipoLugarAlcance === TipoLugarAlcance.GPS
            );
            this.titulo = `Editar Lugar de Interés: ${this.editedItem.nombre}`;
            if (lugares.length === 0) {
              this.btnBloquear = true;
              this.dialogConfirmacion = true;
            } else {
              this.$snotify.error(
                'Ya existe un Lugar de interés con este nombre'
              );
              this.btnBloquear = false;
              this.dialogConfirmacion = false;
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
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

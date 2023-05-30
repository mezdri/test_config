<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivAcciones">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Acción</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              @click="continuar()"
              class="btn-grabar"
              :disabled="!validForm || btnBloquear"
              >Guardar</v-btn
            >
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
                              v-validate="'required|accionNombreUnico|max:80'"
                              v-model="editedItem.nombre"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              min="1"
                              :counter="80"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'max:200'"
                              v-model="editedItem.descripcion"
                              :error-messages="errors.collect('descripcion')"
                              data-vv-name="descripcion"
                              label="Descripción"
                              type="text"
                              min="1"
                              :counter="200"
                            ></v-text-field>
                            <v-flex xs12 sm12 md12>
                              <v-select
                                :items="estados"
                                v-model="estadoSeleccionado"
                                label="Estado"
                                item-value="id"
                                item-text="nombre"
                                v-validate="'required'"
                                :error-messages="errors.collect('estado')"
                                data-vv-name="estado"
                                required
                                no-data-text="Sin resultados"
                                @change="seleccionarEstado"
                                :hint="warningInactivo"
                                persistent-hint
                              ></v-select>
                            </v-flex>
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Acción' })"
      :mensaje="mensajeConfirmacion"
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
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AccionesInterface } from '@/interfaces/Acciones';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class AccionesModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Acciones;
  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 19,
  };

  permisosTotales: PermisoAccionVm[] = [this.informacionGeneral];

  // Globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  warningInactivo: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dictionaryFormErrors: any = {};
  estadoElecto: any = '';
  disabledAccion: boolean = false;
  mensajeConfirmacion: any = '';

  //data
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();
  estadoSeleccionado: any = null;

  //Interface
  editedItem: AccionesInterface = {};

  //controllers
  readonly controller: string = 'Accion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  constructor() {
    super();
    this.registrarValidadores();
  }

  created() {
    this.chequearPermisos();
  }

  mounted() {
    this.initialize();
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('accionNombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Acción con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(`${self.controller}/${0}/${value}/ChequearNombreUnico`)
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message: '* Ya existe una Acción con este nombre.',
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

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_num: () =>
            '* El Número de serie solo debe contener números y/o letras.',
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_num: () =>
            '* El Número de serie solo debe contener números y/o letras.',
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async continuar() {
    const resultado = await this.$validator.validateAll();
    if (resultado) {
      if (this.e1 == 1 && this.disabledAccion === true) {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      } else if (this.e1 == 1) {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    }
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      await this.postAccion();
    }
    this.btnBloquear = false;
  }

  async postAccion() {
    let self = this;
    this.loadingService.showLoading();
    let he = new HandleErrors();
    this.editedItem.id = 0;

    let model = {
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.estadoSeleccionado,
    };

    this.axios.http
      .post(`${self.controller}`, model)
      .then(res => {
        this.loadingService.hideLoading();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Acción',
            creadoA: 'creada',
          })
        );
        this.closeModal(false);
        this.dialogConfirmacion = false;
      })
      .catch(error => {
        //he.showError(error);
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'la Acción',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'la Acción',
            })
          );
        }
      });
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivAcciones').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset(); //Reset Validaciones
    this.dialog = false;
    this.warningInactivo = '';
    this.mensajeConfirmacion = '';
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.$validator.reset();
    this.loadingService.showLoading();
    this.estadoSeleccionado = EstadoEntidad.Activo; //Estado Activo0
    this.loadingService.hideLoading();
    this.btnBloquear = false;
    this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'la Acción',
    });
  }

  seleccionarEstado(tipoEstado: any) {
    this.estadoElecto = tipoEstado;

    switch (this.estadoElecto) {
      case 1: // estado Activo
        this.warningInactivo = '';
        this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'la Acción',
        });
        this.disabledAccion = false;

        break;

      case 0: // estado Inactivo
        this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
        this.mensajeConfirmacion =
          this.warningInactivo +
          ' ' +
          this.$t('mensajes.crud.crear.mensaje', {
            entidad: 'la Acción',
          });
        this.disabledAccion = true;
        break;
    }
  }
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

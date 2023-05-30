<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivCale">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Tipo de Contacto</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              @click="continuar()"
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
                          <!-- <v-flex xs12 sm12 md12>
                            <v-switch
                              :label="estado ? 'Activo' : 'Inactivo'"
                              v-model="estado"
                              color="success"
                              @change="selectedEstado"
                              :hint="warningInactivo"
                              persistent-hint
                            ></v-switch>
                          </v-flex>-->
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.nombre"
                              v-validate="'required|max:20|nombreUnico'"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              :counter="20"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.descripcion"
                              v-validate="'required|max:200'"
                              :error-messages="errors.collect('descripcion')"
                              data-vv-name="descripcion"
                              label="Descripción"
                              type="text"
                              :counter="200"
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
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Tipo de Contacto' })
      "
      :mensaje="mensajeConfirmacionInactivo"
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
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { ITipoContacto } from '@/interfaces/TipoContacto';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class TipoContactoNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, estado: 0 }) }) tipoContacto!: ITipoContacto;

  //Abstract
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
  };

  permisosTotales: PermisoAccionVm[] = [this.informacionGeneral];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dialogConfirmacionClose: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;

  //controllers
  readonly Controller: string = 'TipoContactos';

  //data
  editedItem: ITipoContacto = {};
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;

  constructor() {
    super();
    this.registrarValidadores();
  }

  mounted() {
    this.initialize();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.$validator.reset();
    this.editedItem.estado = EstadoEntidad.Activo;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el Tipo de Contacto',
    });
  }

  continuar() {
    if (this.e1 == 1) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.dialogConfirmacion = true;
          this.btnBloquear = true;
        }
      });
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivCale').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset();
    this.dialog = false;
    this.warningInactivo = '';
    this.estado = true;
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.loadingService.showLoading();
      this.editedItem.estado = this.estado === true ? 1 : 0;
      this.axios.http
        .post(`${this.Controller}/`, this.editedItem)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Tipo de Contacto',
              creadoA: 'creado',
            })
          );
          this.closeModal(false);
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'el Tipo de Contacto',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Tipo de Contacto',
              })
            );
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

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  selectedEstado(isActivo: boolean) {
    if (!isActivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Tipo de Contacto',
        });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Tipo de Contacto' }
      );
    }
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('nombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Tipo de Contacto con este nombre.';
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.Controller}/ChequearNombreUnico/0/${value}`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : {
                      message:
                        '* Ya existe un Tipo de Contacto con este nombre.',
                    },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

<template>
  <v-layout row justify-center class="crearProveedor">
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivModulos">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Proveedor</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              @click="crear()"
              :disabled="!validForm || btnBloquear ? true : false"
              class="btn-grabar"
            >
              <span>Guardar</span>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              v-show="crearProveedor.visible"
              :complete="e1 > crearProveedor.step"
              :step="crearProveedor.step"
              >Crear Proveedor</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="crearProveedor.visible"
              :step="crearProveedor.step"
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
                              style="margin-top: 12px !important"
                            >
                              Crear Proveedor
                            </h2>
                          </v-flex>
                        </div>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs2 sm2 md2>
                            <v-checkbox
                              :label="formFields.internacional.label"
                              v-model="formFields.internacional.value"
                              @change="formFields.rut.value = ''"
                            ></v-checkbox>
                          </v-flex>
                          <v-flex xs2 sm2 md2>
                            <v-text-field
                              :label="formFields.rut.label"
                              v-model="formFields.rut.value"
                              :rules="[rules.required, rules.rut]"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.razon.label"
                              v-model="formFields.razon.value"
                              :rules="[rules.required]"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.direccion.label"
                              v-model="formFields.direccion.value"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.pais.label"
                              v-model="formFields.pais.value"
                              :rules="[rules.soloLetras]"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.telefono.label"
                              v-model="formFields.telefono.value"
                              placeholder="56111234651"
                              :rules="[rules.counter]"
                              :counter="15"
                              prefix="+"
                              @paste.prevent
                              type="number"
                              maxlength="15"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.contacto.label"
                              v-model="formFields.contacto.value"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.email.label"
                              v-model="formFields.email.value"
                              :rules="[rules.email]"
                              type="mail"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.condicion.label"
                              v-model="formFields.condicion.value"
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
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import { fetchProveedores } from './fetchProveedores';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadoInterface } from '@/interfaces/Estado';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { Validator } from 'vee-validate';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { AccionesInterface, IAccionesPadre } from '@/interfaces/Acciones';
const { AgGridVue } = require('ag-grid-vue');
import Confirmation from '@/components/Confirmation.vue'; //
import { SubAccion } from '../../views/base/VariablesPermisos';

@Component({
  components: {
    DatePicker,
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class FormCrearProveedor extends ComponenteBaseStepper {
  @Prop({ default: false }) show: boolean;
  @Prop({ default: false }) usados!: any;
  @Prop({ required: true }) usuarioActivo: any;

  rules = {
    required: (value: any) => !!value || 'Required.',
    counter: (value: any) => value.length <= 15 || 'Maximo 15 caracteres',
    soloLetras: (value: any) => {
      return value.match(/^[a-zA-Z]*$/) || 'Solo se permiten letras';
    },
    email: (value: any) => {
      if (value != '') {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || 'Invalid e-mail.';
      }
    },
    rut: (value: any) => {
      if (this.formFields.internacional.value) {
        return;
      }
      let Fn = {
        // Valida el rut con su cadena completa "XXXXXXXX-X"
        validaRut: function(rutCompleto: any) {
          rutCompleto = rutCompleto.replace('‐', '-').replace(/[.]/g, '');
          console.log(rutCompleto);
          if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) return false;
          var tmp = rutCompleto.split('-');
          var digv = tmp[1];
          var rut = tmp[0];
          if (digv == 'K') digv = 'k';

          return Fn.dv(rut) == digv;
        },
        dv: function(T: any) {
          var M = 0,
            S = 1;
          for (; T; T = Math.floor(T / 10))
            S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
          return S ? S - 1 : 'k';
        },
      };
      return Fn.validaRut(value) || 'Rut Invalido';
    },
  };

  formFields: {
    internacional: any;
    rut: any;
    razon: any;
    direccion: any;
    pais: any;
    telefono: any;
    contacto: any;
    email: any;
    condicion: any;
  } = {
    internacional: {
      label: 'Internacional',
      value: '',
    },
    rut: {
      label: 'RUT (Obligatorio)',
      value: '',
    },
    razon: {
      label: 'Razón Social (Obligatorio)',
      value: '',
    },
    direccion: {
      label: 'Dirección',
      value: '',
    },
    pais: {
      label: 'País',
      value: '',
    },
    telefono: {
      label: 'Teléfono',
      value: '',
    },
    contacto: {
      label: 'Contacto',
      value: '',
    },
    email: {
      label: 'Email',
      value: '',
    },
    condicion: {
      label: 'Condición',
      value: '',
    },
  };

  async crearProvee() {
    let self = this;
    if (this.formFields.rut.value != '') {
      return fetchProveedores(
        {
          rut: this.nuevoDato.rut,
          razon: this.nuevoDato.razon,
          direccion: this.nuevoDato.direccion,
          pais: this.nuevoDato.pais,
          telefono: this.nuevoDato.telefono,
          contacto: this.nuevoDato.contacto,
          email: this.nuevoDato.email,
          codicion: this.nuevoDato.condicion,
          usuarioId: this.usuarioActivo.id,
          usuarioRut: this.usuarioActivo.rut,
          internacional: this.nuevoDato.internacional,
        },
        'conectaMantenedorProveedores/crear'
      )
        .then((data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            self.$snotify.success('Creación exitosa', { timeout: 3000 });
            this.closeModal(false);
            return null;
          } else {
            self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
            return [];
          }
        })
        .catch((error: any) => {
          self.$snotify.error('Error al crear el proveedor', { timeout: 3000 });
        });
    } else {
      self.$snotify.error('Por favor ingrese un RUT valido', { timeout: 3000 });
    }
  }

  validarEmail() {
    let emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    return emailRegex.test(this.nuevoDato.email);
  }

  nuevoDato: any = {};

  crear() {
    this.nuevoDato.rut = this.formFields.rut.value;
    this.nuevoDato.razon = this.formFields.razon.value;
    this.nuevoDato.direccion = this.formFields.direccion.value;
    this.nuevoDato.pais = this.formFields.pais.value;
    this.nuevoDato.internacional = this.formFields.internacional.value
      ? 'Y'
      : 'N';
    this.nuevoDato.telefono =
      this.formFields.telefono.value.length > 0
        ? '+' + this.formFields.telefono.value
        : '';
    this.nuevoDato.contacto = this.formFields.contacto.value;
    this.nuevoDato.email = this.formFields.email.value;
    this.nuevoDato.condicion = this.formFields.condicion.value;
    this.nuevoDato.rut = this.nuevoDato.rut.split('.').join('');
    /*Validar RUT */

    /* --------------------- */

    if (this.nuevoDato.rut == '' || this.nuevoDato.razon == '') {
      this.$snotify.error('Por favor ingrese RUT y Razón social ', {
        timeout: 3000,
      });
      return;
    }

    if (this.usados.includes(this.nuevoDato.rut)) {
      this.$snotify.error('Por favor verifique que el rut no este registrado', {
        timeout: 3000,
      });
      return;
    }

    if (this.nuevoDato.email != '' && !this.validarEmail()) {
      this.$snotify.error('Por favor verifique que el email sea valido', {
        timeout: 3000,
      });
      return;
    }

    if (this.nuevoDato.telefono.length > 16) {
      this.$snotify.error('Por favor ingrese un número de teléfono valido', {
        timeout: 3000,
      });
      return;
    }

    this.crearProvee();
  }

  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  crearProveedor: PermisoAccionVm = {
    accion: 'Crear - Crear Proveedor',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 19,
  };

  asociarAcciones: PermisoAccionVm = {
    accion: 'Crear - Asociar Acciones',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 20,
  };

  asociarSubAcciones: PermisoAccionVm = {
    accion: 'Crear - Asociar SubAcciones',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 21,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.crearProveedor,
    this.asociarAcciones,
    this.asociarSubAcciones,
  ];

  // Globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = true;
  validForm: boolean = false;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  warningInactivo: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  //data
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();

  //Interface
  editedItem: IFuncionalidad = {};

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'ModuloAccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  closeModal(val: boolean) {
    document.getElementById('cardDivModulos').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('datoCreado', true);
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset(); //Reset Validaciones
    this.dialog = false;

    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';

    this.show = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
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
}
</script>

<style scoped>
.crearProveedor #alinear {
  text-align: justify;
}

.crearProveedor .h2_title {
  font-weight: normal;
}
</style>

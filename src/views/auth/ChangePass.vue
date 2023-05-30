<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="elevation-12">
        <br />
        <br />
        <br />
        <v-container
          fluid
          fill-height
          class="animated fadeIn fast"
          grid-list-md
        >
          <v-layout align-center justify-center>
            <v-flex xs12 sm8 md5>
              <v-card>
                <v-card-text>
                  <div align="center">
                    <v-flex md12>
                      <span style="font-size:25px">Cambio de Contraseña</span>
                    </v-flex>
                  </div>

                  <!-- <br />
                    <div align="center">
                      <v-flex md12>
                        <span style="font-size:13px">
                          Ingresa el correo con el cual estás registrado en la
                          plataforma
                        </span>
                      </v-flex>
                  </div>-->
                  <br />
                </v-card-text>
                <v-form
                  ref="form"
                  v-model="validFormActualizaPass"
                  lazy-validation
                  align="center"
                  style="padding:0px 20px 20px;"
                >
                  <v-text-field
                    xs3
                    md3
                    lg3
                    autocomplete="false"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                    prepend-icon="lock_open"
                    :append-icon="show2 ? 'visibility_off' : 'visibility'"
                    v-model="userDataChangePass.contrasena1"
                    label="Contraseña Actual"
                    :type="show2 ? 'text' : 'password'"
                    @click:append="show2 = !show2"
                    :rules="passRules1"
                    :counter="20"
                    required
                  ></v-text-field>

                  <v-text-field
                    prepend-icon="lock_open"
                    autocomplete="new-password"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                    v-validate="'required|max:20|min:8'"
                    :append-icon="show3 ? 'visibility_off' : 'visibility'"
                    v-model="userDataChangePass.contrasena2"
                    label="Nueva Contraseña"
                    :type="show3 ? 'text' : 'password'"
                    @click:append="show3 = !show3"
                    :rules="passRules2"
                    :counter="20"
                    @keyup="changeInput()"
                    required
                  ></v-text-field>

                  <v-text-field
                    prepend-icon="lock_open"
                    autocomplete="new-password"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                    v-model="userDataChangePass.contrasena3"
                    :append-icon="show4 ? 'visibility_off' : 'visibility'"
                    data-vv-name="contrasena3"
                    label="Repita Contraseña"
                    :type="show4 ? 'text' : 'password'"
                    @click:append="show4 = !show4"
                    :rules="passRules3"
                    :counter="20"
                    @keyup="changeInput()"
                    required
                  ></v-text-field>
                  <br />
                  <v-card-actions>
                    <v-layout row wrap>
                      <v-flex>
                        <div align="right">
                          <v-btn
                            type="button"
                            id="btnAceptar"
                            color="#526da5"
                            :disabled="!validFormActualizaPass"
                            @click="actualizarPassLogin()"
                            @keyup.enter="actualizarPassLogin()"
                          >
                            <span style="color: white">Aceptar</span>
                          </v-btn>
                        </div>
                      </v-flex>
                    </v-layout>
                  </v-card-actions>
                  <v-card-actions>
                    <br />
                    <v-layout row wrap>
                      <v-flex xs12>
                        <br />
                        <v-layout>
                          <v-divider></v-divider>
                          <v-expansion-panel>
                            <v-expansion-panel-content>
                              <div slot="header" style="font-size:12px">
                                Reglas de contraseña
                              </div>
                              <v-card>
                                <v-card-text>
                                  <span align="left" style="font-size:12px">
                                    * Debe tener un largo mínimo de 8
                                    caracteres.
                                  </span>
                                  <br />
                                  <span align="left" style="font-size:12px">
                                    * Debe tener un largo máximo de 20
                                    caracteres.
                                  </span>
                                  <br />
                                  <span align="left" style="font-size:12px">
                                    * Debe contener al menos una mayúscula
                                    ('A'-'Z').
                                  </span>
                                  <br />
                                  <span align="left" style="font-size:12px">
                                    * Debe contener al menos un número
                                    ('0'-'9').
                                  </span>
                                  <br />
                                  <span align="left" style="font-size:12px"
                                    >* Debe contener al menos un símbolo [. -
                                    ,].</span
                                  >
                                  <br />
                                  <span align="left" style="font-size:12px">
                                    * Debe ser una contraseña no utilizada con
                                    anterioridad.
                                  </span>
                                </v-card-text>
                              </v-card>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                        </v-layout>
                      </v-flex>
                    </v-layout>
                    <br />
                    <br />
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="dialogConfirmacionClose = true">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Cambiar Contraseña</v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- <v-toolbar-items>
            <v-btn depressed class="btn-grabar">Guardar</v-btn>
          </v-toolbar-items>-->
        </v-toolbar>
      </v-card>
    </v-dialog>
    <div class="text-xs-center">
      <v-dialog v-model="modalLogout" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Cambio de Contraseña</v-toolbar-title
            >
          </v-toolbar>

          <v-card-text>
            La Contraseña ha sido actualizada de forma exitosa. Su sesión se
            cerrará
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="primary" @click="ejecutaLogout()"
              >Aceptar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import HandleErrors from '@/config/handleErrors';
import { LoadingService } from '@/services/loadingService';
import Validadores from '@/config/validaRut';
import router from '../../router';
import { Validator } from 'vee-validate';

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
import Confirmation from '@/components/Confirmation.vue'; //

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class ChangePass extends Vue {
  @Prop({ default: false }) show: boolean;

  //propiedades
  dialog: boolean = false;
  dialogConfirmacionClose: boolean = false;

  //
  $snotify: any;
  usuarioId: number = this.$store.state.userId;
  email: string = '';
  correoEnviado: boolean = false;
  userDataChangePass: any = {
    contrasena1: '',
    contrasena2: '',
    contrasena3: '',
  };
  validForm: boolean = false;
  validForm2: boolean = false;
  validFormActualizaPass: boolean = false;
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  paso1_ok: boolean = false;
  show1: boolean = false;
  show2: boolean = false;
  show3: boolean = false;
  show4: boolean = false;
  username: string = '';
  recuperarPass: boolean = false;
  debeCambiarPass: boolean = false;
  contactarEjecutivo: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  Controller: string = 'Cuenta';
  controllerParametroSistema: string = 'ParametroSistema';
  axiosGestionUsuario: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  passRules1: any = [];
  passRules2: any = [];
  passRules3: any = [];
  estadoUsuario: any;
  dialogSesionExpirada: boolean = false;
  dialogpermisosModificados: boolean = false;
  loadingService = new LoadingService();
  readonly controllerUi: string = 'EstadoUi';
  vr: Validadores = new Validadores();
  usuario: any = this.$store.state.user;
  modalLogout: boolean = false;
  axiosMetabase: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

  redireccionaAceptarInfo: string = '0';

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.show1 = false;
    this.show2 = false;
    this.show3 = false;
    this.show4 = false;
    var formVal: any = this.$refs;
    formVal.form.reset();
    this.validFormActualizaPass = true;
    const model = {
      ClienteId: this.getClienteID(),
    };
  }

  closeModal(val: boolean) {
    this.userDataChangePass.contrasena1 = '';
    this.userDataChangePass.contrasena2 = '';
    this.show1 = false;
    this.show2 = false;
    this.show3 = false;
    this.show4 = false;
    this.userDataChangePass.contrasena3 = '';
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }
  created() {
    //Redirección Aceptar Información
    this.redireccionaAceptarInfo = window.localStorage.getItem(
      'urlAceptarInformacion'
    );
    //---

    var sesionExpirada = window.localStorage.getItem('showSesionExpirada');
    if (sesionExpirada != null) {
      this.dialogSesionExpirada = true;
      this.loadingService.hideLoading();
      window.localStorage.removeItem('showSesionExpirada');
      console.clear();
    }

    var tokenModificado = window.localStorage.getItem('showLogoutPermisos');
    if (tokenModificado != null) {
      this.dialogpermisosModificados = true;
      this.loadingService.hideLoading();
      window.localStorage.removeItem('showLogoutPermisos');
      console.clear();
    }

    this.passRules1 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || '* El campo debe tener al menos 8 caracteres.',
      (v: any) =>
        this.vr.validaFormatoPassword(v) ||
        '* Formato de contraseña incorrecto (Vea reglas de contraseña).',
    ];
    this.passRules2 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || '* El campo debe tener al menos 8 caracteres.',
      (v: any) =>
        this.userDataChangePass.contrasena2 ==
          this.userDataChangePass.contrasena3 ||
        config.errorMensajes.passNoIguales,
      (v: any) =>
        this.vr.validaFormatoPassword(v) ||
        '* Formato de contraseña incorrecto (Vea reglas de contraseña).',
    ];
    this.passRules3 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || '* El campo debe tener al menos 8 caracteres.',
      (v: any) =>
        this.userDataChangePass.contrasena2 ==
          this.userDataChangePass.contrasena3 ||
        config.errorMensajes.passNoIguales,
      (v: any) =>
        this.vr.validaFormatoPassword(v) ||
        '* Formato de contraseña incorrecto (Vea reglas de contraseña).',
    ];

    this.dictionaryFormErrors = {
      custom: {
        email: {
          required: () => config.errorMensajes.textoRequerido,
          emailValido: () =>
            'El campo correo electrónico debe ser un correo válido',
        },
        contrasena: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
          max: () => config.errorMensajes.maxLength,
        },
        contrasena1: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
          max: () => config.errorMensajes.maxLength,
        },
        contrasena2: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
          max: () => config.errorMensajes.maxLength,
        },
        contrasena3: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  changeInput() {
    var formVal: any = this.$refs;
    formVal.form.validate();
  }
  actualizarPassLogin() {
    var formVal: any = this.$refs;
    if (formVal.form.validate()) {
      //valida contraseña
      if (
        this.vr.validaFormatoPassword(
          this.userDataChangePass.contrasena2.toString().trim()
        ) === true
      ) {
        let validaModel: any = {
          NombreUsuario: this.usuario.email,
          Contrasena: this.userDataChangePass.contrasena1,
          NuevaContrasena: this.userDataChangePass.contrasena2,
          RepetirContrasena: this.userDataChangePass.contrasena3,
          token: window.localStorage.token,
          origen: window.location.origin,
        };
        if (
          this.userDataChangePass.contrasena1 ===
          this.userDataChangePass.contrasena2
        ) {
          this.$snotify.warning(
            'Nueva contraseña no puede ser igual a la anterior.'
          );
          return;
        }

        this.axiosMetabase.http
          .post(`Metabase/PostgenericA/track/change_password`, validaModel)
          .then(res => {
            if (res.data.CODIGO_RESPUESTA == '1') {
              this.axios.http
                .put(`${this.Controller}/${this.usuarioId}/cambiarEstado`)
                .then(res => {
                  this.modalLogout = true;
                })
                .catch(error => {
                  this.$snotify.error(
                    'Ocurrio un error al actualizar estado de usuario.'
                  );
                });
            } else {
              this.$snotify.error(res.data.MENSAJE_RESPUESTA);
            }
          })
          .catch(err => {
            this.$snotify.error('Error de conexión');
          });

        /*this.axios.http
          .post(`${this.Controller}/checkCurrentPassword`, validaModel)
          .then(res => {
            let model: any = {
              UsuarioId: this.usuarioId,
              Contrasena: this.userDataChangePass.contrasena2,
              RepetirContrasena: this.userDataChangePass.contrasena3,
            };
            this.axios.http.post('');

            this.axios.http
              .post(`${this.Controller}/changepass`, model)
              .then(res => {
                this.axios.http
                  .put(`${this.Controller}/${this.usuarioId}/cambiarEstado`)
                  .then(res => {
                    this.modalLogout = true;
                  })
                  .catch(error => {
                    this.$snotify.error(
                      'Ocurrio un error al actualizar estado de usuario.'
                    );
                  });
              })
              .catch(error => {
                if (error.response.status == '409') {
                  this.$snotify.warning(
                    'La contraseña debe ser distinta a las últimas 3 utilizadas'
                  );
                } else {
                  this.$snotify.error(
                    'Ocurrio un error al actualizar contraseña.'
                  );
                }
              });
          })
          .catch(err => {
            this.$snotify.error('Contraseña actual incorrecta.');
          });*/
      } else {
        this.$snotify.error(
          'Contraseña no cumple las reglas básicas de validación para su generación.'
        );
      }
      //}
    }
  }
  getClienteID() {
    return config.getClienteSesion();
  }
  ejecutaLogout() {
    this.modalLogout = false;
    this.paso1_ok = false;
    this.recuperarPass = false;
    this.debeCambiarPass = false;
    window.localStorage.setItem('logout', '1');
    this.$store.dispatch('logout');
    this.$snotify.clear();
  }
}
</script>

<style lang="stylus" scoped></style>

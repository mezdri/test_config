<template>
  <v-app id="inspire">
    <vue-snotify></vue-snotify>

    <v-content class="bimg">
      <v-container fluid fill-height class="animated fadeIn fast">
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <!--            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />-->
            <div class="logo-login" title="Ir al Inicio"></div>
            <v-card class="elevation-12">
              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">Restablecer Contraseña</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:13px">
                      Ingrese su nueva contraseña para ingresar al sistema
                    </span>
                  </v-flex>
                </div>
                <br />

                <v-form ref="form" v-model="validForm" lazy-validation>
                  <v-text-field
                    prepend-icon="lock_open"
                    autocomplete="new-password"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                    v-validate="'required|max:20|min:8'"
                    :append-icon="show1 ? 'visibility_off' : 'visibility'"
                    v-model="userDataChangePass.contrasena1"
                    label="Nueva Contraseña"
                    :type="show1 ? 'text' : 'password'"
                    @click:append="show1 = !show1"
                    :rules="passRules1"
                    :counter="20"
                    @keyup="changeInput()"
                    required
                  ></v-text-field>

                  <v-text-field
                    prepend-icon="lock_open"
                    autocomplete="new-password"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                    v-model="userDataChangePass.contrasena2"
                    :append-icon="show2 ? 'visibility_off' : 'visibility'"
                    data-vv-name="contrasena3"
                    label="Repita Contraseña"
                    :type="show2 ? 'text' : 'password'"
                    @click:append="show2 = !show2"
                    :rules="passRules2"
                    :counter="20"
                    @keyup="changeInput()"
                    required
                  ></v-text-field>

                  <br />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex xs6>
                    <div align="left">
                      <v-btn
                        type="button"
                        id="btnVolver"
                        color="primary"
                        @click="cancelar()"
                        >Cancelar</v-btn
                      >
                    </div>
                  </v-flex>
                  <v-flex>
                    <div align="right">
                      <v-btn
                        type="button"
                        id="btnAceptar"
                        color="primary"
                        :disabled="
                          !btnBloquear ||
                            !puedeCambiarPass ||
                            bloquearBtnAceptar
                        "
                        @click="actualizarPass()"
                        @keyup.enter="actualizarPass()"
                        >Aceptar</v-btn
                      >
                    </div>
                  </v-flex>
                  <br />
                  <br />
                  <br />
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-divider></v-divider>
                      <v-expansion-panel>
                        <v-expansion-panel-content>
                          <div slot="header" style="font-size:12px">
                            Reglas de contraseña
                          </div>
                          <v-card>
                            <v-card-text>
                              <span align="left" style="font-size:12px">
                                * Debe tener un largo mínimo de 8 caracteres.
                              </span>
                              <br />
                              <span align="left" style="font-size:12px"
                                >* Debe tener un largo máximo de 20
                                caracteres.</span
                              >
                              <br />
                              <span align="left" style="font-size:12px">
                                * Debe contener al menos una mayúscula
                                ('A'-'Z').
                              </span>
                              <br />
                              <span align="left" style="font-size:12px">
                                * Debe contener al menos un número ('0'-'9').
                              </span>
                              <br />
                              <span align="left" style="font-size:12px">
                                * Debe contener al menos un símbolo [. - ,].
                              </span>
                              <br />
                              <span align="left" style="font-size:12px">
                                * Debe ser una contraseña no utilizada con
                                anterioridad.
                              </span>
                            </v-card-text>
                          </v-card>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-flex>
                  </v-layout>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '../../config/index';
import Validadores from '../../config/validaRut';
import { LoginInterface } from '../../interfaces/Login';
import { Component, Watch } from 'vue-property-decorator';
import router from '../../router';
import HandleErrors from '../../config/handleErrors';
import { constants } from 'fs';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment, { Duration } from 'moment';
import { LoadingService } from '@/services/loadingService';

if (process.env.NODE_ENV == 'QA') {
  if (location.host.split('.')[0] == 'qagpstrack') {
    import(`../../css/${'track3'}_login_style.css`);
  } else {
    import(
      `../../css/${
        location.hostname == 'localhost'
          ? 'track3'
          : location.host.split('.')[0].substring(3) == ''
          ? '192'
          : location.host.split('.')[0].substring(3)
      }_login_style.css`
    );
  }
} else {
  import(
    `../../css/${
      location.hostname == 'localhost' ? 'track3' : location.host.split('.')[0]
    }_login_style.css`
  );
}
@Component
export default class ReestrablecerPass extends Vue {
  $snotify: any;
  usuarioId: number = 0;
  fechaEnvio: Date = null;
  axios: AxiosVue;
  axiosMS: AxiosVue;
  validForm: boolean = false;
  show1: boolean = false;
  show2: boolean = false;
  passRules1: any = [];
  passRules2: any = [];
  handleError: HandleErrors = new HandleErrors();
  puedeCambiarPass: boolean = true;
  vr: Validadores = new Validadores();
  userDataChangePass: any = { contrasena1: '', contrasena2: '' };
  Controller: string = 'Cuenta';
  loadingService = new LoadingService();
  bloquearBtnAceptar: boolean = false;
  btnBloquear: boolean = true;

  constructor() {
    super();

    this.axios = new AxiosVue(ServicioProxy.Auth);
    this.axiosMS = new AxiosVue(ServicioProxy.MS);
  }

  async mounted() {
    this.passRules1 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || '* El campo debe tener al menos 8 caracteres.',
      (v: any) =>
        this.userDataChangePass.contrasena1 ==
          this.userDataChangePass.contrasena2 ||
        config.errorMensajes.passNoIguales,
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
        this.userDataChangePass.contrasena1 ==
          this.userDataChangePass.contrasena2 ||
        config.errorMensajes.passNoIguales,
      (v: any) =>
        this.vr.validaFormatoPassword(v) ||
        '* Formato de contraseña incorrecto (Vea reglas de contraseña).',
    ];

    try {
      this.loadingService.showLoading();
      var decodedId = atob(this.$route.params.id);
      var decodedFecha = atob(this.$route.params.fecha);
      let minutes = decodedFecha.substr(0, 2);
      let hour = decodedFecha.substr(2, 2);
      let day = decodedFecha.substr(4, 2);
      let month = decodedFecha.substr(6, 2);
      let year = decodedFecha.substr(8, 8);
      let email: string = decodedFecha.substr(12, decodedFecha.length);
      this.usuarioId = parseInt(decodedId);
      const response: any = await this.axios.http.get(
        `${this.Controller}/nombreUsuario?email=${email}`
      );
      let caducidad = response.data.caducidad;
      let horas = this.obtenerMoment(caducidad).asHours();

      this.fechaEnvio = new Date(
        parseInt(year),
        parseInt(month),
        parseInt(day),
        parseInt(hour),
        parseInt(minutes)
      );
      this.fechaEnvio.setHours(this.fechaEnvio.getHours() + horas);
      var date = new Date();
      if (this.fechaEnvio < date) {
        this.puedeCambiarPass = false;
        this.$snotify.warning(
          'Link de recuperación de contraseña ha caducado, favor solicitar nuevamente'
        );
      }
    } catch (err) {
      this.puedeCambiarPass = false;
      this.$snotify.error('Parametros de email inválidos. Redireccionando...');
      setTimeout(() => {
        this.$router.push('/login');
      }, 3000);
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private obtenerMoment(valor: string): Duration {
    const regexHoras: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;

    if (regexHoras.test(valor)) {
      return moment.duration(moment(valor, 'HH:mm:ss').format('HH:mm:ss'));
    }

    return moment.duration(moment(valor, 'DD.HH:mm:ss').format('DD.HH:mm:ss'));
  }

  changeInput() {
    var formVal: any = this.$refs;
    formVal.form.validate();
    this.btnBloquear = formVal.form.validate();
  }

  cancelar() {
    this.$router.push('/login');
  }

  actualizarPass() {
    this.loadingService.showLoading(); //Muestra Cargando

    var formVal: any = this.$refs;
    if (!this.puedeCambiarPass) {
      this.loadingService.hideLoading(); //Oculta Cargando
      this.$snotify.warning(
        'Link de recuperación de contraseña ha caducado, favor solicitar nuevamente'
      );
      return;
    }

    if (formVal.form.validate()) {
      let model: any = {
        UsuarioId: this.usuarioId,
        Contrasena: this.userDataChangePass.contrasena1,
        RepetirContrasena: this.userDataChangePass.contrasena2,
        origen: window.location.origin,
        source: 'ReestrablecerPass',
      };

      this.axiosMS.http
        .post(`track/restablecer_pass`, model)
        .then(res => {
          if (res.data.CODIGO_RESPUESTA == '1') {
            this.loadingService.hideLoading(); //Oculta Cargando
            this.$snotify.success(
              'La Contraseña ha sido actualizada de forma exitosa'
            );
            this.bloquearBtnAceptar = true;
            setTimeout(() => {
              this.$router.push('/login');
            }, 5000); //1200
          } else {
            this.$snotify.error(res.data.MENSAJE_RESPUESTA);
            this.loadingService.hideLoading(); //Oculta Cargando
          }
        })
        .catch(err => {
          this.$snotify.error('Error de conexión');
          this.loadingService.hideLoading(); //Oculta Cargando
        });

      /*this.axios.http
        .post('cuenta/changepass', model)
        .then(res => {
          this.loadingService.hideLoading(); //Oculta Cargando
          this.$snotify.success(
            'La Contraseña ha sido actualizada de forma exitosa'
          );
          this.bloquearBtnAceptar = true;
          setTimeout(() => {
            this.$router.push('/login');
          }, 5000); //1200
        })
        .catch(error => {
          this.loadingService.hideLoading(); //Oculta Cargando
          if (error.response.status == '409') {
            this.bloquearBtnAceptar = false;
            this.$snotify.warning(
              'La contraseña debe ser distinta a las últimas 3 utilizadas'
            );
          } else {
            this.handleError.showError(error);
          }
        });*/
    }
  }
}
</script>

<style scoped>
/*.bimg {
  background: url('../../assets/fondo3.jpg') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
.application {
  font-family: 'asap', sans-serif !important;
}
.sizeLogo {
  height: 50%;
  width: 50%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}*/
</style>

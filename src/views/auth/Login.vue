<template>
  <v-app id="inspire">
    <vue-snotify></vue-snotify>

    <v-toolbar class="color-header-bar">
      <v-toolbar-title>
        <!--        <img
          src="../../assets/LOGO-GPSCHILE-BLANCO-20180306.png"
          alt="GPS Chile"
          style="max-width:80px;cursor:pointer;"
          title="Ir al Inicio"
        />-->
        <div class="logo-sidebar" title="Ir al Inicio"></div>
      </v-toolbar-title>
    </v-toolbar>
    <!-- Ingreso Usuario -->
    <v-content class="bimg">
      <v-container
        fluid
        fill-height
        v-if="
          !paso1_ok &&
            !recuperarPass &&
            !correoEnviado &&
            !contactarEjecutivo &&
            !usuarioBloqueado
        "
        class="animated fadeIn fast"
      >
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
                    <span style="font-size:25px">Ingresa con tu correo</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:13px">
                      Ingresa el correo con el cual estás registrado en la
                      plataforma
                    </span>
                  </v-flex>
                </div>
                <br />

                <v-form
                  v-model="validForm"
                  lazy-validation
                  onkeypress="return event.keyCode != 13;"
                >
                  <v-text-field
                    id="txtEmail"
                    data-testid="Login__v-text-field--email"
                    autofocus
                    prepend-icon="person_outline"
                    v-validate="'required|emailValido'"
                    v-model="userData.email"
                    :error-messages="errors.collect('email')"
                    data-vv-name="email"
                    label="Correo Electrónico"
                    type="email"
                    required
                  ></v-text-field>
                  <v-text-field
                    id="txtPass"
                    data-testid="Login__v-text-field--password"
                    prepend-icon="lock"
                    v-validate="'required'"
                    v-model="userData.password"
                    :append-icon="show1 ? 'visibility_off' : 'visibility'"
                    :error-messages="errors.collect('contraseña')"
                    data-vv-name="contraseña"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="Contraseña"
                    required
                    @click:append="show1 = !show1"
                  ></v-text-field>

                  <br />
                </v-form>
              </v-card-text>

              <v-layout align-center justify-start row fill-height>
                <v-flex xs6 style="padding-left:10px">
                  <span style="cursor:pointer">
                    <a @click="contactarEjecutivo = true"
                      >¿Necesitas contactarnos?</a
                    >
                  </span>
                </v-flex>
                <v-flex xs6 style="text-align: end;padding-right: 10px;">
                  <span style="cursor:pointer">
                    <!--a
                      @click="
                        recuperarPass = true;
                        paso1_ok = false;
                      "
                      >¿Has olvidado tu contraseña?</a
                    -->
                    <a @click="olvido_pass()">¿Has olvidado tu contraseña?</a>
                  </span>
                </v-flex>
              </v-layout>

              <v-card-actions>
                <v-layout align-center justify-start row fill-height>
                  <SolicitarClave></SolicitarClave>
                </v-layout>
                <v-layout>
                  <v-flex>
                    <div align="right" style="padding-right:10px;">
                      <v-btn
                        type="button"
                        id="btnContinuar"
                        data-testid="Login__continuar"
                        color="#526da5"
                        :depressed="true"
                        @click="login()"
                        @keyup.enter="login()"
                        :disabled="!validForm"
                      >
                        <span style="color: white">Continuar</span>
                      </v-btn>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- Ingreso contraseña -->
      <v-container
        fluid
        fill-height
        v-if="
          paso1_ok &&
            !recuperarPass &&
            !debeCambiarPass &&
            !correoEnviado &&
            !usuarioBloqueado
        "
        class="animated fadeIn fast"
      >
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <!--            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />-->
            <div class="logo-login" title="Ir al Inicio"></div>
            <v-card class="elevation-12">
              <div align="center" style="padding-right:70px;">
                <!-- <v-avatar
                  style="z-index:2;top:-50px;position:absolute;"
                  :tile="false"
                  size="90px"
                  color="grey lighten-4"
                >
                  <img src="../../assets/logo.png" alt="avatar">
                </v-avatar>-->
                <br />
              </div>

              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">{{ username }}</span>
                  </v-flex>
                  <v-flex md12>
                    <span style="font-size:25px">Validando...</span>
                  </v-flex>
                </div>

                <!-- <br> -->
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:14px">
                      {{ userData.email }}&nbsp;&nbsp;
                      <span sytle="color:#808080">|</span>&nbsp;&nbsp;
                    </span>
                    <a @click="back()">¿No es tu cuenta?</a>
                  </v-flex>
                </div>
                <br />

                <v-form
                  v-model="validForm2"
                  lazy-validation
                  onkeypress="return event.keyCode != 13;"
                >
                  <!--v-text-field
                    id="txtPass"
                    data-testid="Login__v-text-field--password"
                    autofocus
                    v-validate="'required'"
                    v-model="userData.password"
                    :append-icon="show1 ? 'visibility_off' : 'visibility'"
                    :error-messages="errors.collect('contraseña')"
                    data-vv-name="contraseña"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-1"
                    label="Contraseña"
                    v-on:keyup.enter="login()"
                    required
                    @click:append="show1 = !show1"
                  ></v-text-field-->

                  <br />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex xs6>
                    <span style="cursor:pointer">
                      <a
                        @click="
                          recuperarPass = true;
                          paso1_ok = false;
                        "
                        >¿Has olvidado tu contraseña?</a
                      >
                    </span>
                  </v-flex>
                  <v-flex>
                    <div align="right">
                      <v-btn
                        type="button"
                        id="btnLogin"
                        data-testid="Login__login"
                        color="#526da5"
                        :depressed="true"
                        :disabled="!validForm2"
                        v-on:keyup.enter="login()"
                        @click="login()"
                      >
                        <span style="color: white">Continuar</span>
                      </v-btn>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- Crear Nueva Contraseña -->
      <v-container
        fluid
        fill-height
        v-if="recuperarPass && !correoEnviado"
        class="animated fadeIn fast"
      >
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />
            <v-card class="elevation-12">
              <div align="center" style="padding-right:70px;">
                <!-- <v-avatar
                  style="z-index:2;top:-50px;position:absolute;"
                  :tile="false"
                  size="90px"
                  color="grey lighten-4"
                >
                  <img src="../../assets/logo.png" alt="avatar">
                </v-avatar>-->
                <br />
              </div>

              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">{{
                      username | limitString(35, '...')
                    }}</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:14px"
                      >{{ userData.email }}&nbsp;&nbsp;|&nbsp;&nbsp;</span
                    >
                    <a @click="back()">¿No es tu cuenta?</a>
                  </v-flex>
                </div>
                <br />

                <div align="center">
                  <v-flex md12>
                    <span style="font-size:14px">
                      ¿Desea crear una nueva contraseña para la cuenta asociada
                      a su correo {{ userData.email }}?
                    </span>
                  </v-flex>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex xs6>
                    <div align="left">
                      <v-btn :depressed="true" color="#526da5" @click="back()">
                        <span style="color: white">Volver</span>
                      </v-btn>
                    </div>
                  </v-flex>
                  <v-flex>
                    <div align="right">
                      <v-btn
                        :depressed="true"
                        color="#526da5"
                        @click="crearContraseña()"
                      >
                        <span style="color: white">Crear Contraseña</span>
                      </v-btn>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- Debe atualizar su contraseña antes de ingresar al sistema -->
      <v-container
        fluid
        fill-height
        v-if="paso1_ok && debeCambiarPass && !correoEnviado"
        class="animated fadeIn fast"
      >
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />
            <v-card class="elevation-12">
              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">Actualizar Contraseña</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:13px"
                      >Debe actualizar su contraseña antes de ingresar al
                      sistema</span
                    >
                  </v-flex>
                </div>
                <br />

                <v-form
                  ref="form"
                  v-model="validFormActualizaPass"
                  lazy-validation
                >
                  <v-text-field
                    v-show="!paso1_ok && !debeCambiarPass && correoEnviado"
                  ></v-text-field>
                  <v-text-field
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
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex xs6>
                    <div align="left">
                      <v-btn
                        type="button"
                        id="btnVolver"
                        color="#526da5"
                        :depressed="true"
                        @click="
                          paso1_ok = false;
                          debeCambiarPass = false;
                          correoEnviado = false;
                        "
                      >
                        <span style="color: white">Volver</span>
                      </v-btn>
                    </div>
                  </v-flex>
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
                              <span align="left" style="font-size:12px"
                                >* Debe tener un largo mínimo de 8
                                caracteres.</span
                              >
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
                              <span align="left" style="font-size:12px"
                                >* Debe contener al menos un número
                                ('0'-'9').</span
                              >
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
      <!-- Hemos enviado las instrucciones a su correo para cambiar la contraseña -->
      <v-container
        fluid
        fill-height
        v-if="correoEnviado"
        class="animated fadeIn fast"
      >
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />
            <v-card class="elevation-12">
              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">{{ username }}</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:13px">
                      Hemos enviado las instrucciones para cambiar su contraseña
                      al correo
                    </span>
                  </v-flex>
                  <v-flex md12>
                    <span style="font-size:13px">
                      <strong>{{ email }}</strong>
                    </span>
                  </v-flex>
                </div>
                <br />
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex md12>
                    <div align="center">
                      <v-btn
                        type="button"
                        id="btnCorreo"
                        color="#526da5"
                        :depressed="true"
                        @click="
                          correoEnviado = false;
                          paso1_ok = false;
                          recuperarPass = false;
                          limpiarForm();
                        "
                      >
                        <span style="color: white">Volver</span>
                      </v-btn>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- Contactar a la mesa central -->
      <v-container
        fluid
        fill-height
        v-if="contactarEjecutivo && !paso1_ok"
        class="animated fadeIn fast"
      >
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />
            <v-card class="elevation-12">
              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">Contacto</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:13px">
                      Estimado usuario, por favor contacte a su ejecutivo de
                      cuenta o a nuestra mesa central.
                    </span>
                    <br />
                    <br />
                  </v-flex>
                  <v-flex md12>
                    <span style="font-size:13px">
                      <strong>Mesa Central</strong>
                    </span>
                    <br />
                    <span style="font-size:13px">(+56) 2 2940 4911</span>
                    <br />
                    <span style="font-size:13px">clientes@gpschile.com</span>
                  </v-flex>
                </div>
                <br />
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex md12>
                    <div align="center">
                      <v-btn
                        type="button"
                        id="btnCorreo"
                        color="#526da5"
                        :depressed="true"
                        @click="
                          correoEnviado = false;
                          paso1_ok = false;
                          recuperarPass = false;
                          contactarEjecutivo = false;
                        "
                      >
                        <span style="color: white">Volver</span>
                      </v-btn>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
      <!-- Bloqueo de cuenta -->
      <v-container
        fluid
        fill-height
        v-if="usuarioBloqueado && !correoEnviado"
        class="animated fadeIn fast"
      >
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <img
              class="sizeLogo"
              src="../../assets/logo-track.png"
              alt="logo-track"
            />
            <v-card class="elevation-12">
              <div align="center" style="padding-right:70px;">
                <!-- <v-avatar
                  style="z-index:2;top:-50px;position:absolute;"
                  :tile="false"
                  size="90px"
                  color="grey lighten-4"
                >
                  <img src="../../assets/logo.png" alt="avatar">
                </v-avatar>-->
                <br />
              </div>

              <v-card-text>
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:25px">{{
                      username | limitString(35, '...')
                    }}</span>
                  </v-flex>
                </div>

                <br />
                <div align="center">
                  <v-flex md12>
                    <span style="font-size:14px"
                      >{{ userData.email }}&nbsp;&nbsp;|&nbsp;&nbsp;</span
                    >
                    <a @click="back()">¿No es tu cuenta?</a>
                  </v-flex>
                </div>
                <br />

                <div align="center">
                  <v-flex md12>
                    <span style="font-size:14px">{{ mensajeBloqueado }}</span>
                  </v-flex>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-layout row wrap>
                  <v-flex xs6>
                    <div align="left">
                      <v-btn :depressed="true" color="#526da5" @click="back()">
                        <span style="color: white">Volver</span>
                      </v-btn>
                    </div>
                  </v-flex>
                  <v-flex>
                    <div align="right">
                      <v-btn
                        :depressed="true"
                        color="#526da5"
                        @click="crearContraseña()"
                        v-show="usuarioBloqueadoBtn"
                      >
                        <span style="color: white">Crear Contraseña</span>
                      </v-btn>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
                <br />
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

      <v-layout row justify-center>
        <v-dialog
          v-model="dialogSesionExpirada"
          persistent
          width="390"
          max-width="390"
        >
          <v-card>
            <v-toolbar dark color="primary">
              <v-btn icon dark @click="dialogSesionExpirada = false">
                <v-icon>close</v-icon>
              </v-btn>
              <v-toolbar-title
                style="font-size:17px;margin-left: 10px !important"
                >Sesión Expirada</v-toolbar-title
              >
            </v-toolbar>
            <v-divider></v-divider>
            <v-card-text>
              Su sesión de trabajo ha expirado, por lo que usted fue
              redireccionado(a) al inicio de sesión.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                depressed
                @click="dialogSesionExpirada = false"
                >Aceptar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>

      <v-layout row justify-center>
        <v-dialog
          v-model="dialogpermisosModificados"
          persistent
          width="390"
          max-width="390"
        >
          <v-card>
            <v-toolbar dark color="primary">
              <v-btn icon dark @click="dialogpermisosModificados = false">
                <v-icon>close</v-icon>
              </v-btn>
              <v-toolbar-title
                style="font-size:17px;margin-left: 10px !important"
                >Cierre de sesión</v-toolbar-title
              >
            </v-toolbar>
            <v-divider></v-divider>
            <v-card-text
              >Su usuario ha sido modificado. Favor ingrese
              nuevamente.</v-card-text
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                depressed
                @click="dialogpermisosModificados = false"
                >Aceptar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '@/config/index';
import { LoginInterface } from '@/interfaces/Login';
import { Component, Watch } from 'vue-property-decorator';
import router from '@/router';
import Validadores from '@/config/validaRut';
import HandleErrors from '@/config/handleErrors';
import { Funcionalidades } from '@/config/funcionalidades';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad, Accion } from '@/config/enums';
import { ParametroSistemaVm } from '@/interfaces/parametroSistema';
import { LoadingService } from '@/services/loadingService';
import moment, { Duration } from 'moment';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import SolicitarClave from '@/pantallas/SucursalVirtual/SolicitarClave/index.vue';

if (process.env.NODE_ENV == 'QA') {
  console.log(location.host.split('.')[0]);
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
@Component({
  components: {
    SolicitarClave,
  },
})
export default class Login extends Vue {
  $snotify: any;
  usuarioId: number = 0;
  email: string = '';
  correoEnviado: boolean = false;
  userData: LoginInterface = { email: '', password: '' };
  userId: string = '';
  userMail: string = '';
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
  vr: Validadores = new Validadores();
  username: string = '';
  recuperarPass: boolean = false;
  usuarioBloqueado: boolean = false;
  debeCambiarPass: boolean = false;
  contactarEjecutivo: boolean = false;
  axios: AxiosVue;
  Controller: string = 'Cuenta';
  controllerParametroSistema: string = 'ParametroSistema';
  axiosGestionUsuario: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosMS = new AxiosVue(ServicioProxy.MS);
  axiosMSLOGIN = new AxiosVue(ServicioProxy.MSLOGIN);
  passRules1: any = [];
  passRules2: any = [];
  passRules3: any = [];
  usuarioBloqueadoBtn: boolean = false;
  mensajeBloqueado: string =
    'Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos, favor de ponerse en contacto con su ejecutivo de cuenta.';
  estadoUsuario: any;
  dialogSesionExpirada: boolean = false;
  dialogpermisosModificados: boolean = false;
  loadingService = new LoadingService();
  readonly controllerUi: string = 'EstadoUi';
  esCaducado: boolean = false;

  //Intentos Contraseña
  numIntentos: number = 0;
  numMaxIntentos: number = 0;
  //---

  //Redirección Aceptar Información
  redireccionaAceptarInfo: string = '0';
  //

  constructor() {
    super();

    this.axios = new AxiosVue(ServicioProxy.Auth);
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
      this.dialogSesionExpirada = false;
      this.loadingService.hideLoading();
      window.localStorage.removeItem('showLogoutPermisos');
      console.clear();
    }

    this.passRules1 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || 'El campo debe tener al menos 8 caracteres.',
    ];
    this.passRules2 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || 'El campo debe tener al menos 8 caracteres.',
      (v: any) =>
        this.userDataChangePass.contrasena2 ==
          this.userDataChangePass.contrasena3 ||
        config.errorMensajes.passNoIguales,
      (v: any) =>
        this.vr.validaFormatoPassword(v) ||
        'Formato de contraseña incorrecto (Vea reglas de contraseña).',
    ];
    this.passRules3 = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) => (v && v.length <= 20) || config.errorMensajes.maxLength,
      (v: any) =>
        (v && v.length >= 8) || 'El campo debe tener al menos 8 caracteres.',
      (v: any) =>
        this.userDataChangePass.contrasena2 ==
          this.userDataChangePass.contrasena3 ||
        config.errorMensajes.passNoIguales,
      (v: any) =>
        this.vr.validaFormatoPassword(v) ||
        'Formato de contraseña incorrecto (Vea reglas de contraseña).',
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

  back() {
    this.paso1_ok = false;
    this.userData.email = '';
    this.userData.password = '';
    this.username = '';
    this.recuperarPass = false;
    this.usuarioBloqueado = false;
    this.usuarioBloqueadoBtn = false;
    this.numIntentos = 0;
  }

  mounted() {
    console.log('Hola');
    this.registrarValidadores();
  }

  private registrarValidadores() {
    const r = this.vr;
    const self = this;
    Validator.extend('emailValido', {
      getMessage(field: any, params: any, data: any) {
        return 'El campo correo electrónico debe ser un correo válido';
      },
      validate(value: any) {
        return r.validaEmail(value);
      },
    });
  }

  crearContraseña() {
    let url: string = '';
    let arr = [];
    arr = window.location.pathname.split('/');

    if (arr.length >= 3) {
      url = window.location.origin + '/' + arr[1];
    } else {
      url = window.location.origin;
    }
    const hor = new Date().getHours();
    const min = new Date().getMinutes();
    const dia = new Date().getDate();
    const mes = new Date().getMonth();
    const horStr = hor > 9 ? hor.toString() : '0' + hor.toString();
    const minStr = min > 9 ? min.toString() : '0' + min.toString();
    const diaStr = dia > 9 ? dia.toString() : '0' + dia.toString();
    const mesStr = mes > 9 ? mes.toString() : '0' + mes.toString();
    const anoStr = new Date().getFullYear().toString();
    let model = {
      EncodeIdUsuario: btoa(this.usuarioId.toString()),
      From: '',
      To: this.userData.email,
      Subject: 'Track 3.0 - Reestablecer contraseña',
      Message: '',
      EncodedFechaEnvio: btoa(
        minStr + horStr + diaStr + mesStr + anoStr + this.userData.email
      ),
      Url: url,
      esCaducado: this.esCaducado,
    };

    this.$snotify.info('Enviando correo, espere por favor...');
    //this.axios.http
    this.axiosMS.http
      .post(`track/ReestablecerPassword`, model)
      .then(res => {
        if (res.data.CODIGO_RESPUESTA == '1') {
          this.correoEnviado = true;
        } else {
          this.$snotify.error(res.data.MENSAJE_RESPUESTA);
        }
      })
      .catch(err => {
        this.$snotify.error('Ocurrio un error al enviar correo.');
      })
      .finally();
    {
      this.esCaducado = false;
    }
  }

  async continuar(val: any) {
    const res: boolean = await this.$validator.validate('email');
    if (res) {
      this.loadingService.showLoading();
      try {
        const response: any = await this.axios.http.get(
          `${this.Controller}/nombreUsuario?email=${this.userData.email}`
        );
        if (response.data.estado == 5) {
          this.mensajeBloqueado =
            'Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos, favor de ponerse en contacto con su ejecutivo de cuenta.';
          this.usuarioBloqueado = true;
          this.usuarioBloqueadoBtn = true;
        } else if (response.data.estado == 4) {
          this.mensajeBloqueado =
            'Su cuenta ha sido bloqueada. Para solicitar acceso, contacta a tu Ejecutivo de Cuentas.';
          this.usuarioBloqueado = true;
          this.usuarioBloqueadoBtn = false;
        } else {
          this.paso1_ok = true;
        }
        this.username = response.data.nombre + ' ' + response.data.apellidos;
        this.usuarioId = response.data.id;
        this.email = response.data.email;
        this.estadoUsuario = response.data.estado;
        this.numMaxIntentos = response.data.numMaxIntentos;

        if (this.estadoUsuario == EstadoEntidad.Inactivo) {
          this.debeCambiarPass = true;
        }
      } catch (e) {
        this.paso1_ok = false;
        this.$snotify.error('Correo electrónico no se encuentra registrado.');
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  private obtenerMoment(valor: string): Duration {
    const regexHoras: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;

    if (regexHoras.test(valor)) {
      return moment.duration(moment(valor, 'HH:mm:ss').format('HH:mm:ss'));
    }

    return moment.duration(moment(valor, 'DD.HH:mm:ss').format('DD.HH:mm:ss'));
  }

  olvido_pass() {
    if (this.userData.email == '') {
      this.$snotify.error('Debe ingresar un correo electrónico');
      return false;
    } else {
      this.recuperarPass = true;
      this.paso1_ok = false;
    }
  }

  async login() {
    const res1: boolean = await this.$validator.validate('email');
    const res: boolean = await this.$validator.validate('contraseña');
    let clientes: any = [];
    this.esCaducado = false;

    /*if (!res || !res1){
      this.$snotify.error('Debe ingresar un email y contraseña correcto.');
      return false;
    }*/

    if ((res && res1) || (res && this.userData.email != '')) {
      this.loadingService.showLoading();
      try {
        const model = {
          NombreUsuario: this.userData.email,
          Contrasena: this.userData.password,
        };

        this.numIntentos++;
        const response: any = await this.axiosMSLOGIN.http.post(``, model);

        if (response.data.CODIGO_RESPUESTA == undefined) {
          this.$snotify.error('Error la validar sesión, intente nuevamente');
          return false;
        } else if (response.data.CODIGO_RESPUESTA == '2') {
          this.$snotify.error(
            'Ocurrió un error: ' + response.data.MENSAJE_RESPUESTA
          );
          return false;
        }

        if (response.data.estado == 5) {
          this.mensajeBloqueado =
            'Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos, favor de ponerse en contacto con su ejecutivo de cuenta.';
          this.usuarioBloqueado = true;
          this.usuarioBloqueadoBtn = true;
          return false;
        } else if (response.data.estado == 4) {
          this.mensajeBloqueado =
            'Su cuenta ha sido bloqueada. Para solicitar acceso, contacta a tu Ejecutivo de Cuentas.';
          this.usuarioBloqueado = true;
          this.usuarioBloqueadoBtn = false;
          return false;
        }

        this.paso1_ok = true;
        if (response.data.estado == EstadoEntidad.Inactivo) {
          this.userMail = response.data.usuario;
          this.userId = response.data.u;
          this.debeCambiarPass = true;
          return false;
        }

        if (response.data.code == 0) {
          if (window.localStorage) {
            window.localStorage.setItem('sendMsgCliente', '1');
            window.localStorage.setItem('token', response.data.token);
            window.localStorage.setItem(
              'user',
              JSON.stringify(response.data.usuario)
            );
          }

          this.$store.commit('setToken', response.data.token);
          this.$store.commit('authUser', response.data.usuario);

          //recuperacion de ultimo cliente del usuario
          let axiosGestionUsuario: AxiosVue = new AxiosVue(
            ServicioProxy.GestionUsuario
          );

          let uiModel: any = {
            UsuarioId: response.data.usuario.id,
            ClienteId: 0,
            Componente: 'Inicio',
            Funcionalidades: Funcionalidades.Inicio,
          };

          await this.axiosGestionUsuario.http
            .get(`usuario/${response.data.usuario.id}/cliente`)
            .then(async res => {
              clientes = res.data;

              clientes = await clientes.filter(
                (x: any) => x.accesoUsuarios === true
              );
            });

          const userClient: any = await axiosGestionUsuario.http.get<any>(
            `${this.controllerUi}/`,
            { params: uiModel }
          );

          if (userClient.data.clienteId !== 0 && clientes.length > 0) {
            const _cliente = clientes.find(
              (x: any) => x.clienteId == userClient.data.clienteId
            );
            if (_cliente != undefined) {
              localStorage.setItem('clienteDefecto', userClient.data.clienteId);
            } else {
              localStorage.setItem('clienteDefecto', clientes[0].clienteId);
            }
          } else {
            window.localStorage.setItem(
              'clienteDefecto',
              response.data.usuario.clienteDefecto
            );
          }
          //get homePath
          const gethomePath = await axiosGestionUsuario.http
            .get(`usuario/${response.data.usuario.id}/homePath`)
            .then(res => {
              var homePath = res.data.homePath;
              this.$store.commit('setHomePath', homePath);
            });

          //Redirección Aceptar Información
          if (this.redireccionaAceptarInfo === '1') {
            window.localStorage.removeItem('urlAceptarInformacion');
            router.replace('/aceptarinformacion');
            this.$snotify.clear();
          } else {
            window.localStorage.removeItem('urlAceptarInformacion');
            router.push('/'); //Redirecciona al Home
            this.$snotify.clear();
          }
        } else if (response.data.code == 1) {
          this.contactarEjecutivo = true;
          this.paso1_ok = false;
        } else if (response.data.code == 2) {
          this.esCaducado = true;
          this.$snotify.error(
            'Su contraseña ha caducado, por favor restablezca su contraseña'
          );
          this.recuperarPass = true;
          this.paso1_ok = false;
        } else if (response.data.code == 3) {
          this.$snotify.error(
            'Usuario no se encuentra activo, comuníquese con el Administrador.'
          );
        } else if (response.data.code == 4) {
          this.usuarioBloqueado = true;
          this.mensajeBloqueado =
            'Su cuenta ha sido bloqueada por exceder el límite de intentos fallidos, favor de ponerse en contacto con su ejecutivo de cuenta.';
          this.usuarioBloqueadoBtn = true;
          this.paso1_ok = true;
        }
      } catch (error) {
        this.$snotify.error(
          'Inicio de sesión incorrecto. Compruebe contraseña'
        );
        // if (
        //   error.response.status !== undefined &&
        //   error.response.status == '404'
        // ) {
        //   this.$snotify.error(
        //     'Usuario no se encuentra activo, comuníquese con el Administrador.'
        //   );
        // }  else {
        // if (this.numIntentos < this.numMaxIntentos) {
        //   this.$snotify.error(
        //     'Inicio de sesión incorrecto. Compruebe contraseña'
        //   );
        // } else {
        //   this.recuperarPass = true;
        //   this.paso1_ok = false;
        // }
        // }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  changeInput() {
    var formVal: any = this.$refs;
    formVal.form.validate();
  }

  actualizarPassLogin() {
    this.loadingService.showLoading(); //Muestra Cargando

    var formVal: any = this.$refs;
    //if (formVal.form.validate()) {
    //valida contraseña
    if (
      this.vr.validaFormatoPassword(
        this.userDataChangePass.contrasena2.toString().trim()
      ) === true
    ) {
      let validaModel: any = {
        NombreUsuario: this.userMail,
        old: this.userDataChangePass.contrasena1,
        Contrasena: this.userDataChangePass.contrasena2,
        RepetirContrasena: this.userDataChangePass.contrasena3,
        UsuarioId: this.userId,
      };

      this.axiosMS.http
        .post(`track/restablecer_pass`, validaModel)
        .then(res => {
          if (res.data.CODIGO_RESPUESTA == '1') {
            this.loadingService.hideLoading(); //Oculta Cargando
            this.$snotify.success(
              'La Contraseña ha sido actualizada de forma exitosa'
            );

            this.userData.email = '';
            this.userData.password = '';
            this.paso1_ok = false;
            this.recuperarPass = false;
            this.debeCambiarPass = false;
            this.usuarioBloqueado = false;
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
        .post(`${this.Controller}/checkCurrentPassword`, validaModel)
        .then(res => {
          if (
            this.userDataChangePass.contrasena1 ===
            this.userDataChangePass.contrasena2
          ) {
            this.loadingService.hideLoading(); //Oculta Cargando
            this.$snotify.warning(
              'Nueva contraseña no puede ser igual a la anterior.'
            );
            return;
          }

          let model: any = {
            UsuarioId: this.usuarioId,
            Contrasena: this.userDataChangePass.contrasena2,
            RepetirContrasena: this.userDataChangePass.contrasena3,
          };

          this.axios.http
            .post(`${this.Controller}/changepass`, model)
            .then(res => {
              this.axios.http
                .put(`${this.Controller}/${this.usuarioId}/cambiarEstado`)
                .then(res => {
                  this.loadingService.hideLoading(); //Oculta Cargando
                  this.$snotify.success(
                    'Contraseña actualizada correctamente.'
                  );

                  formVal.form.reset();
                  this.paso1_ok = false;
                  this.recuperarPass = false;
                  this.debeCambiarPass = false;
                  this.usuarioBloqueado = false;
                })
                .catch(error => {
                  this.loadingService.hideLoading(); //Oculta Cargando
                  this.$snotify.error(
                    'Ocurrio un error al actualizar estado de usuario.'
                  );
                });
            })
            .catch(error => {
              this.loadingService.hideLoading(); //Oculta Cargando
              this.$snotify.error('Ocurrio un error al actualizar contraseña.');
            });
        })
        .catch(err => {
          this.loadingService.hideLoading(); //Oculta Cargando
          this.$snotify.error('Contraseña actual incorrecta.');
        });
        */
    } else {
      this.loadingService.hideLoading(); //Oculta Cargando
      this.$snotify.error(
        'Contraseña no cumple las reglas básicas de validación para su generación.'
      );
    }
    //}
  }

  goToRegister() {
    this.$router.push('/registro');
  }
  limpiarForm() {
    this.userData.email = '';
    this.userData.password = '';
  }
}
</script>

<style scoped></style>

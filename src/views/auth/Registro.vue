<template>
  <v-app id="inspire">
    <vue-snotify></vue-snotify>
    <v-content class="bimg">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Registro de Usuario</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form v-model="validForm" lazy-validation>
                  <!-- <v-text-field prepend-icon="person" name="login" label="Login" type="text"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="Password" type="password"></v-text-field> -->
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-text-field
                        v-validate="'required|rut'"
                        v-model="userData.rut"
                        :error-messages="errors.collect('rut')"
                        data-vv-name="rut"
                        label="Rut"
                        required
                      >
                      </v-text-field>
                    </v-flex>

                    <v-flex xs12>
                      <v-text-field
                        v-validate="'required'"
                        v-model="userData.nombre"
                        :error-messages="errors.collect('nombre')"
                        data-vv-name="nombre"
                        label="Nombre"
                        required
                      >
                      </v-text-field>
                    </v-flex>

                    <v-flex md6>
                      <v-text-field
                        v-validate="'required'"
                        v-model="userData.apellidoPaterno"
                        :error-messages="errors.collect('apellidoPaterno')"
                        data-vv-name="apellidoPaterno"
                        label="Apellido Paterno"
                        required
                      >
                      </v-text-field>
                    </v-flex>

                    <v-flex md6>
                      <v-text-field
                        v-validate="'required'"
                        v-model="userData.apellidoMaterno"
                        :error-messages="errors.collect('apellidoMaterno')"
                        data-vv-name="apellidoMaterno"
                        label="Apellido Materno"
                        required
                      >
                      </v-text-field>
                    </v-flex>

                    <v-flex md12>
                      <v-text-field
                        v-validate="'required|email'"
                        v-model="userData.email"
                        :error-messages="errors.collect('email')"
                        data-vv-name="email"
                        label="Email"
                        type="email"
                        required
                      >
                      </v-text-field>
                    </v-flex>

                    <v-flex md12>
                      <v-text-field
                        v-validate="'required'"
                        v-model="userData.contrasena"
                        :error-messages="errors.collect('contrasena')"
                        data-vv-name="contrasena"
                        label="Contraseña"
                        type="password"
                        ref="password"
                        required
                      >
                      </v-text-field>
                    </v-flex>

                    <v-flex md12>
                      <v-text-field
                        v-validate="'required|confirmed:password'"
                        v-model="confirmPass"
                        :error-messages="errors.collect('contrasena')"
                        data-vv-name="contrasena"
                        label="Repita Contraseña"
                        type="password"
                        required
                      >
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  :disabled="!validForm"
                  @click="registro()"
                >
                  Registrarme
                </v-btn>
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
import { RegistroInterface } from '../../interfaces/Login';
import { Component, Watch } from 'vue-property-decorator';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import HandleErrors from '../../config/handleErrors';
import ValidaRut from '../../config/validaRut';
import { Validator } from 'vee-validate';
import { AxiosVue } from '@/AxiosVue';

@Component
export default class Registro extends Vue {
  $snotify: any;
  userData: RegistroInterface = {};
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  confirmPass: string = '';
  handleErrors: HandleErrors = new HandleErrors();
  vr: ValidaRut = new ValidaRut();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  registro() {
    this.$validator.validateAll().then(res => {
      if (res) {
        let model = {
          Id: 0,
          NombreUsuario: this.userData.email,
          Nombre: this.userData.nombre,
          ApellidoPaterno: this.userData.apellidoPaterno,
          ApellidoMaterno: this.userData.apellidoMaterno,
          Rut: this.userData.rut,
          Email: this.userData.email,
          Direccion: this.userData.direccion,
          Telefono: this.userData.telefono,
          Contrasena: this.userData.contrasena,
          FechaNacimiento: this.userData.fechaNacimiento,
        };

        var he = this.handleErrors;

        this.axios.http
          .post('usuario', model)
          .then(response => {
            var r = this.$router;
            this.$snotify.success('Registro Correcto');

            setTimeout(function() {
              r.replace('/login');
            }, 1500);
          })
          .catch(function(error) {
            he.showError(error);
          });
      }
    });
  }

  created() {
    var r = this.vr;
    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.Rut(value),
            data: r.Rut(value) ? undefined : { message: '* Rut inválido' },
          });
        });
      },
    });

    this.dictionaryFormErrors = {
      custom: {
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        contrasena: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
        },
        rut: {
          required: () => config.errorMensajes.textoRequerido,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
        },
        apellidoMaterno: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
}
</script>

<style scope>
#app {
  font-family: 'Asap', sans-serif;
}
.bimg {
  background: url('../../assets/fondo3.jpg') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
</style>

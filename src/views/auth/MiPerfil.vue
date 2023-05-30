<template>
  <div>
    <v-container fluid grid-list-md>
      <v-layout>
        <v-flex xs12 sm8 offset-sm2>
          <v-card>
            <v-card-title primary-title>
              <div align="center">
                <div align="center">
                  <h2 class="h2_title">Mi Perfil</h2>
                  <p>Información General</p>
                </div>
                <v-flex md10>
                  <v-form
                    ref="form"
                    v-model="validForm"
                    lazy-validation
                    class="col-md-12"
                  >
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-validate="'required|max:80'"
                            v-model="newItem.nombre"
                            :error-messages="errors.collect('nombre')"
                            data-vv-name="nombre"
                            label="Nombre"
                            :counter="80"
                            type="text"
                            prepend-icon="person"
                            required
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex xs6 sm6 md6>
                          <v-text-field
                            v-validate="'required|max:80'"
                            v-model="newItem.apellidoPaterno"
                            :error-messages="errors.collect('apellidoPaterno')"
                            data-vv-name="apellidoPaterno"
                            label="Apellido Paterno"
                            :counter="80"
                            type="text"
                            prepend-icon="person"
                            required
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex xs6 sm6 md6>
                          <v-text-field
                            v-validate="'required|max:80'"
                            v-model="newItem.apellidoMaterno"
                            :error-messages="errors.collect('apellidoMaterno')"
                            data-vv-name="apellidoMaterno"
                            :counter="80"
                            label="Apellido Materno"
                            type="text"
                            prepend-icon="person"
                            required
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <!-- v-validate="'fechaNacimiento|mayorDeEdad'" -->
                          <v-menu
                            :close-on-content-click="false"
                            v-model="menuDatePicker"
                            :nudge-right="40"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            max-width="290px"
                            min-width="290px"
                          >
                            <v-text-field
                              slot="activator"
                              v-validate="
                                date == defaultDate && flagDate == true
                                  ? 'fechaNacimiento'
                                  : 'fechaNacimiento|mayorDeEdad'
                              "
                              :error-messages="
                                errors.collect('fechaNacimiento')
                              "
                              data-vv-name="fechaNacimiento"
                              v-model="computedDateFormatted"
                              label="Fecha Nacimiento"
                              persistent-hint
                              prepend-icon="event"
                              readonly
                              required
                              clearable
                              @click:clear="limpiaValidacionFecha()"
                            >
                            </v-text-field>
                            <v-date-picker
                              v-model="date"
                              first-day-of-week="1"
                              locale="es-cl"
                              scrollable
                              :default-date="defaultDate"
                              @input="menuDatePicker = false"
                              @change="flagDate = false"
                            >
                            </v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-if="!isUserSucursal"
                            v-validate="'max:60'"
                            v-model="newItem.direccion"
                            :error-messages="errors.collect('direccion')"
                            data-vv-name="direccion"
                            label="Dirección"
                            prepend-icon="location_city"
                            :counter="60"
                            type="text"
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-select
                            v-if="isUserSucursal"
                            v-model="newItem.direccion"
                            :items="direcciones"
                            item-text="nombre"
                            item-value="id"
                            label="Dirección Principal"
                            v-validate="'required'"
                            :error-messages="errors.collect('pagInicio')"
                            data-vv-name="dirPrincipal"
                            prepend-icon="location_city"
                            required
                          ></v-select>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-validate="{ max: 11, regex: /^(56)[0-9]\d{8}$/ }"
                            v-model="newItem.telefonoFijo"
                            :error-messages="errors.collect('telefonoFijo')"
                            data-vv-name="telefonoFijo"
                            label="Teléfono Fijo"
                            placeholder="56299999999"
                            :counter="11"
                            prepend-icon="call"
                            type="tel"
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-validate="{ max: 11, regex: /^(569)[0-9]\d{7}$/ }"
                            v-model="newItem.telefonoParticular"
                            :error-messages="
                              errors.collect('telefonoParticular')
                            "
                            data-vv-name="telefonoParticular"
                            label="Teléfono Móvil"
                            placeholder="56999999999"
                            prepend-icon="call"
                            :counter="11"
                            type="tel"
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-select
                            v-model="selectedPaginaInicio"
                            :items="paginasInicio"
                            item-text="nombre"
                            item-value="id"
                            label="Página de Inicio"
                            v-validate="'required'"
                            :error-messages="errors.collect('pagInicio')"
                            data-vv-name="pagInicio"
                            prepend-icon="web"
                            required
                          ></v-select>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-flex>
                <v-btn color="primary" :disabled="!validForm" @click="guardar()"
                  >Guardar</v-btn
                >
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import config from '../../config/index';
import Confirmation from '../../components/Confirmation.vue';
import { Component, Watch } from 'vue-property-decorator';
import { UsuariosInterface } from '../../interfaces/Usuarios';
import { eventBus } from '../../setup';
import { AxiosVue } from '@/AxiosVue';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import { ServicioProxy } from '@/config/enums';
import { userInfo } from 'os';
import store from '@/store';
import { fetchMS } from '@/views/auth/fetchMS';
import { LoadingService } from '@/services/loadingService';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class MiPerfil extends Vue {
  $snotify: any;
  readonly loadingService = new LoadingService();
  newItem: any = {}; // UsuariosInterface = {}
  date: any = null;
  menuDatePicker: boolean = false;
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  selectedPaginaInicio: any = null;
  paginasInicio: any = [];
  vr: ValidaRut = new ValidaRut();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  defaultDate: any = moment(new Date()).format('YYYY-MM-DD');
  flagDate: boolean = false;
  isUserSucursal: boolean = false;
  selectedDireccionPrincipal: any = null;
  direcciones: any[] = [];

  constructor() {
    super();

    this.paginasInicio.push(
      //{ id: 1, nombre: 'Dashboard'},
      { id: 2, nombre: 'Home' }
    );
    this.getDirecciones();

    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoMaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        direccion: {
          max: () => config.errorMensajes.maxLength,
        },
        telefonoFijo: {
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        telefonoParticular: {
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        pagInicio: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaNacimiento: {
          mayorDeEdad: () => config.errorMensajes.fechaMayoriaEdad,
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  mounted() {
    let r = this.vr;
    Validator.extend('fechaNacimiento', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Fecha Nacimiento no puede ser mayor a hoy'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFechaNacimiento(value),
            data: r.validaFechaNacimiento(value)
              ? undefined
              : { message: '* Fecha Nacimiento no puede ser mayor a hoy' },
          });
        });
      },
    });

    Validator.extend('mayorDeEdad', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Fecha Nacimiento no cumple con mayoría de edad'
        );
      },
      validate(value: any) {
        return r.validaMayorEdad(value);
      },
    });

    var usuario = localStorage.getItem('user');
    if (usuario != null) {
      let userInfo = JSON.parse(usuario);

      this.axios.http
        .get('usuario/' + userInfo.id)
        .then(res => {
          this.newItem = res.data;
          //Se debe quitar esto cuando exista el dashboard y cuando este campo se almacene en la base de datos
          this.selectedPaginaInicio = 2;
          if (res.data.fechaNacimiento !== null) {
            this.date = moment(res.data.fechaNacimiento).format('YYYY-MM-DD');
          }
        })
        .catch(err => {
          this.$snotify.error(
            'Ocurrió un error al obtener información del usuario.'
          );
        });
    }
  }

  async getDirecciones() {
    let resp: any = (await this.cargarDirecciones()) || [];
    if (resp.data.CODIGO_RESPUESTA == '1') {
      this.isUserSucursal = true;
      this.direcciones = resp.data.data;
      this.direcciones.forEach(v => {
        if (v.nombre == this.newItem.direccion) {
          this.newItem.direccion = v.id;
        }
      });
    } else {
      console.log('Sucursal virtual: ' + resp.data.MENSAJE_RESPUESTA);
    }
  }

  cargarDirecciones() {
    //this.loadingService.showLoading(undefined, 'cargarDirecciones');
    let self = this;
    let user = JSON.parse(window.localStorage.user).id.toString();
    let rutEmpresa = JSON.parse(window.localStorage.user).rutClienteDefecto;
    return fetchMS(
      { user_id: user, rutEmpresa: rutEmpresa },
      'getDireccionesSucursal'
    ).catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las direcciones',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las direcciones',
          { timeout: 3000 }
        );
      }
    });
    //.finally(() => self.loadingService.hideLoading('cargarDirecciones'));
  }

  actualizarDatos(data: any) {
    console.log(this.isUserSucursal);
    data.isUserSucursal = this.isUserSucursal;
    if (this.isUserSucursal) {
      this.direcciones.forEach(v => {
        if (v.id == data.direccion) {
          data.direccionNombre = v.nombre;
        }
      });
    }
    data.token = window.localStorage.token;
    let self = this;
    return fetchMS({ data }, 'actualizarDatos')
      .then(resp => {
        if (resp.data.CODIGO_RESPUESTA == '1') {
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          var user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            self.$store.state.name = self.newItem.nombre;
            self.$store.state.lastname = self.newItem.apellidoPaterno;
            user.nombre = self.newItem.nombre;
            user.apellidoPaterno = self.newItem.apellidoPaterno;
            window.localStorage.setItem('user', JSON.stringify(user));
          }
        } else {
          this.$snotify.error(resp.data.MENSAJE_RESPUESTA);
        }
      })
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar actualizar datos',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar actualizar datos',
            { timeout: 3000 }
          );
        }
      });
  }

  get computedDateFormatted() {
    if (this.date === this.defaultDate) return null;
    else return this.formatDate(this.date);
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  limpiaValidacionFecha() {
    //this.date = this.defaultDate;
    //this.flagDate = true;
    this.date = null;
    this.flagDate = false;
  }

  guardar() {
    let self = this;
    this.$validator.validateAll().then(res => {
      if (res) {
        /*if (this.date !== null){
                    this.newItem.fechaNacimiento = new Date(this.date);
                } else {
                    this.newItem.fechaNacimiento = null;
                }*/
        (this.newItem.fechaNacimiento =
          this.date === undefined ||
          this.date === null ||
          this.date === this.defaultDate
            ? null
            : new Date(this.date)),
          //this.newItem.estado = this.selectedPaginaInicio;

          /*this.axios.http
            .put('usuario/', this.newItem)
            .then(res => {
              this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
              var user = JSON.parse(localStorage.getItem('user'));
              if (user) {
                self.$store.state.name = self.newItem.nombre;
                self.$store.state.lastname = self.newItem.apellidoPaterno;
                user.nombre = self.newItem.nombre;
                user.apellidoPaterno = self.newItem.apellidoPaterno;
                window.localStorage.setItem('user', JSON.stringify(user));
              }
            })
            .catch(error => {
              this.$snotify.error('Ocurrió un error al grabar información.');
            });
          */
          this.actualizarDatos(this.newItem);
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

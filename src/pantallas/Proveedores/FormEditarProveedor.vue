<template>
  <v-layout row justify-center class="editarProveedor">
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivTV">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="
              !esEdicion ? closeModal(false) : (dialogConfirmacionClose = true)
            "
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>{{
            esEdicion ? 'Editar Proveedor' : 'Ver Detalle Proveedor'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              @click="grabarEdicion()"
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br /><br /><br />
        <div>
          <div align="center" class="cardnew">
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
                          style="margin-top: 12px !important"
                        >
                          {{
                            esEdicion
                              ? 'Editar Proveedor'
                              : 'Ver Detalle Proveedor'
                          }}
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
                          :disabled="true"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs2 sm2 md2>
                        <v-text-field
                          :label="formFields.rut.label"
                          v-model="formFields.rut.value"
                          :disabled="true"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { fetchProveedores } from './fetchProveedores';
import { AxiosVue } from '@/AxiosVue'; //
import { LoadingService } from '@/services/loadingService';
import { ServicioProxy } from '@/config/enums'; //
import { Component, Prop } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { EstadoEntidad } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue'; //
import { TranslateResult } from 'vue-i18n';
import { GridApi } from 'ag-grid-community';

@Component({
  components: {
    DatePicker,
    'app-confirmacion': Confirmation,
  },
})
export default class FormEditarProveedor extends Vue {
  @Prop({ default: false }) edited!: any;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ required: true }) usuarioActivo: any;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  accion!: any;
  ordesList2: any;
  data: any = {};

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
  };

  async getProveedorSeleccionado() {
    let self = this;
    this.loadingService.showLoading();
    return fetchProveedores(
      { proveedorRut: this.edited },
      'conectaMantenedorProveedores/inicio'
    )
      .then((data: any) => {
        //console.log(data.data.data);
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.loadingService.hideLoading();
          return data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.loadingService.hideLoading();
          return [];
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
        this.loadingService.hideLoading();
      });
  }

  async getProveedor() {
    this.ordesList2 = (await this.getProveedorSeleccionado()) || [];
    this.data = this.ordesList2[0];
    this.formFields.internacional.value = this.data.proveedortipo == 'Y';
    this.formFields.rut.value = this.data.proveedorrut;
    this.formFields.razon.value = this.data.proveedorrazon;
    this.formFields.direccion.value = this.data.proveedordireccion;
    this.formFields.pais.value = this.data.proveedorpais;
    this.formFields.telefono.value = this.data.proveedortel.replace('+', '');
    this.formFields.contacto.value = this.data.proveedorcontacto;
    this.formFields.email.value = this.data.proveedoremail;
    this.formFields.condicion.value = this.data.proveedorcondicion;
  }

  mounted() {
    this.getProveedor();
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  onSelectionChanged(params: any) {}

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
      label: 'RUT',
      value: '',
    },
    razon: {
      label: 'Razón Social',
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

  //abstract
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.TablaMantenedorProveedores;

  //propiedades globales
  loadingService = new LoadingService();
  gridApi: GridApi;
  $snotify: any;
  dialog: boolean = true;
  dialogConfirmacionClose: boolean = false;
  bottomNav: any = '1';
  dictionaryFormErrors: any = {};
  validForm: boolean = false;
  dialogConfirmacion: boolean = false;
  btnBloquear: Boolean = false;

  //Interface
  estadoSwitch: boolean = false;

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //@Watch('show')
  async onPropertyChanged(value: boolean) {
    this.dialog = value;
    this.dialog = value;
    // permisos
    this.setBotonNav();
  }

  validarEmail() {
    let emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    return emailRegex.test(this.datoEditado.email);
  }

  datoEditado: any = {};

  grabarEdicion() {
    this.datoEditado.rut = this.formFields.rut.value;
    this.datoEditado.razon = this.formFields.razon.value;
    this.datoEditado.direccion = this.formFields.direccion.value;
    this.datoEditado.pais = this.formFields.pais.value;
    this.datoEditado.telefono =
      this.formFields.telefono.value.length > 0
        ? '+' + this.formFields.telefono.value
        : '';
    this.datoEditado.contacto = this.formFields.contacto.value;
    this.datoEditado.email = this.formFields.email.value;
    this.datoEditado.condicion = this.formFields.condicion.value;

    if (this.datoEditado.email != '' && !this.validarEmail()) {
      this.$snotify.error('Por favor verifique que el email sea valido', {
        timeout: 3000,
      });
      return;
    }

    this.editar();
  }

  async editar() {
    let self = this;
    return fetchProveedores(
      {
        rut: this.datoEditado.rut,
        razon: this.datoEditado.razon,
        direccion: this.datoEditado.direccion,
        pais: this.datoEditado.pais,
        telefono: this.datoEditado.telefono,
        contacto: this.datoEditado.contacto,
        email: this.datoEditado.email,
        codicion: this.datoEditado.condicion,
        usuarioId: this.usuarioActivo.id,
        usuarioRut: this.usuarioActivo.rut,
      },
      'conectaMantenedorProveedores/editar'
    )
      .then((data: any) => {
        //console.log(data.data);
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success('Actualizacion exitosa', { timeout: 3000 });
          this.closeModal(false);
          return null;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
    /* .finally(() => {
          return null;
        }); */
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
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

  closeModal(val: boolean) {
    this.$validator.reset();
    document.getElementById('cardDivTV').scrollIntoView(true);
    this.$emit('modalAsociacionEmit', false);
    this.$emit('datoEditado', true);
    this.dialog = false;
    this.btnBloquear = false;
  }

  confirmCallback(val: any) {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }
}
</script>

<style scoped>
.editarProveedor .h2_title {
  font-weight: normal;
}
</style>

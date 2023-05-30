<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Técnico" @cerrar="handleCerrar">
      <div
        style="

letter-spacing: 0.02em;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin-top: 16px;
;"
      ></div>
      <div class="boton_crear" style="">
        <v-btn
          :disabled="bloquear"
          @click="editar2"
          class="icon"
          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;
  
  margin: 0 0 0 auto;margin-top: 13px;
height: 38px;"
        >
          <span style="color: white;" class="color-blanco">Guardar</span>
        </v-btn>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <div align="center">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-form ref="form" lazy-validation class="col-md-12">
              <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
                <FormFieldsContainer titulo="Editar Producto">
                  <slot name="prependInformacionGeneral" />

                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.id.label"
                      v-model="formFields.id.value"
                      disabled
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.nombre.label"
                      v-model="formFields.nombre.value"
                      v-validate="'required|max:80|alpha_spaces'"
                      :error-messages="errors.collect('name')"
                      data-vv-name="name"
                      :counter="80"
                      type="text"
                      required
                      :disabled="bloquear"
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.apellido.label"
                      v-model="formFields.apellido.value"
                      v-validate="'required|max:80|alpha_spaces'"
                      :error-messages="errors.collect('lastname')"
                      data-vv-name="lastname"
                      :counter="80"
                      type="text"
                      :disabled="bloquear"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      v-validate="'max:60'"
                      v-model="formFields.direccion.value"
                      :error-messages="errors.collect('direccion')"
                      data-vv-name="direccion"
                      label="Dirección"
                      :counter="60"
                      type="text"
                      :disabled="bloquear"
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      v-validate="{
                        rules: {
                          required: true,
                          max: 200,
                          email: true,

                          regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                        },
                      }"
                      :label="formFields.email.label"
                      v-model="formFields.email.value"
                      :error-messages="errors.collect('email')"
                      data-vv-name="email"
                      :counter="200"
                      required
                      :disabled="bloquear"
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      v-validate="{
                        max: 11,
                      }"
                      :label="formFields.tel.label"
                      v-model="formFields.tel.value"
                      :error-messages="errors.collect('telefonoFijo')"
                      data-vv-name="telefonoFijo"
                      placeholder="56299999999"
                      :counter="11"
                      type="tel"
                      :disabled="bloquear"
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-combobox
                      :label="formFields.localidad.label"
                      v-model="formFields.localidad.value"
                      :items="localidadeslist"
                      item-text="locaname"
                      item-value="locaid"
                      :disabled="bloquear"
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.ubicacion.label"
                      v-model="formFields.ubicacion.value"
                      v-validate="'required|max:80'"
                      :error-messages="errors.collect('ubicacion')"
                      data-vv-name="ubicacion"
                      :counter="80"
                      type="text"
                      required
                      :disabled="bloquear"
                    />
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </div>
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import config from '@/config/index';
import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import TextField from '@/reusable/Form/TextField.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    TextField,
    FormFieldsContainer,
  },
})
export default class VerEditarModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) id: any;
  @Prop({ default: null }) nombre: any;
  @Prop({ default: null }) apellido: any;
  @Prop({ default: null }) email: any;
  @Prop({ default: null }) direccion: any;
  @Prop({ default: null }) tel: any;
  @Prop({ default: null }) localidad: any;
  @Prop({ default: null }) bodega: any;
  @Prop({ default: null }) tipoubicaid: any;
  @Prop({ default: null }) locaid2: any;
  @Prop({ default: null }) estado: any;

  mensajes: Mensaje[] = [];
  localidadeslist: any[] = [];
  bloquear: boolean = false;
  dictionaryFormErrors: any = {};
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  readonly funcionalidad: Funcionalidades = Funcionalidades.AltaTecnico;

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Editar Técnico',
      visible: true,
      step: 1,
      title: 'Editar Técnico',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };
  respuesta: any;
  locaidsend: any;
  async editar2() {
    this.respuesta = await this.$validator.validateAll();
    let self = this;
    this.loadingService.showLoading();
    this.locaidsend = this.formFields.localidad.value;
    console.log(JSON.parse(localStorage.getItem('user')).rutClienteDefecto);
    if (this.respuesta == false) {
      self.$snotify.error('Por favor ingrese los campos requeridos.', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    return fetchReportesSerie(
      {
        usuarioid_modifica: JSON.parse(localStorage.getItem('user')).id,
        usuariorut_modifica: JSON.parse(localStorage.getItem('user'))
          .rutClienteDefecto,
        tecnicoid: this.formFields.id.value,
        tecniconame: this.formFields.nombre.value,
        tecnicodireccion: this.formFields.direccion.value,
        tecnicomail: this.formFields.email.value,
        tecnicotel: this.formFields.tel.value,
        locaid: this.locaidsend.locaid,
        tipoubicaid: this.tipoubicaid,
        tipoubicaname: this.formFields.ubicacion.value,
        apellido: this.formFields.apellido.value,
        modulo: this.funcionalidad,
      },
      'AltaTecnico/update_tecnico'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.handleCerrar();
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  formFields: FormFieldDefMap = {
    id: {
      label: 'Id',
      id: this.id,
      value: this.id,
    },
    nombre: {
      label: 'Nombre',
      id: this.nombre,
      value: this.nombre,
    },
    apellido: {
      label: 'Apellido',
      id: this.apellido,
      value: this.apellido,
    },
    direccion: {
      label: 'Dirección',
      id: this.direccion,
      value: this.direccion,
    },
    email: {
      label: 'Email',
      id: this.email,
      value: this.email,
    },
    tel: {
      label: 'Teléfono',
      id: this.tel,
      value: this.tel,
    },
    localidad: {
      label: 'Localidad',
      id: '',
      value: '',
    },
    ubicacion: {
      label: 'Ubicación',
      id: this.bodega,
      value: this.bodega,
    },
  };

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'AltaTecnico/get_localidades')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.localidadeslist = data.data.LOCALIDAD;

          console.log(Number(data.data.UBICACION.max));
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  mounted() {
    if (this.estado != 'Activo') {
      this.bloquear = true;
    }
    this.getEquipos();
    this.formFields.localidad.value = {
      locaname: this.localidad,
      locaid: this.locaid2,
    };
    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Nombre solo debe contener letras y/o espacios.',
        },
        lastname: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido solo debe contener letras y/o espacios.',
        },
        ubicacion: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Paterno solo debe contener letras y/o espacios.',
        },
        apellidoMaterno: {
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Materno solo debe contener letras y/o espacios.',
        },
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        contrasena: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
        },
        direccion: {
          max: () => config.errorMensajes.maxLength,
        },
        telefonoFijo: {
          max: () => config.errorMensajes.maxLength,
        },
        celular: {
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaNacimiento: {
          mayorDeEdad: () => config.errorMensajes.fechaMayoriaEdad,
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
<style></style>

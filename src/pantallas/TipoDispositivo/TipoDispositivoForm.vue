<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <!-- <CampoUnico
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :id="formFields.nombre.id"
                  counter="80"
                  :disabled="isVerDetalle || isEditar"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :validate="validarNombreTipo"
                  message=" Tipo de Dispositivo ya existe"
                ></CampoUnico> -->
                <v-text-field
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:80|CampoUnico`"
                  :data-vv-name="formFields.nombre.id"
                  :id="formFields.nombre.id"
                  counter="80"
                  :disabled="isVerDetalle || isEditar"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-testid="`${testId}--nombre`"
                ></v-text-field>
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.marca.label"
                  :error-messages="errors.collect(formFields.marca.id)"
                  :data-vv-name="formFields.marca.id"
                  v-model="formFields.marca.value"
                  v-validate="'required|max:80'"
                  :counter="80"
                  :disabled="isVerDetalle"
                  :data-testid="`${testId}--marca`"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.modelo.label"
                  :error-messages="errors.collect(formFields.modelo.id)"
                  :data-vv-name="formFields.modelo.id"
                  v-model="formFields.modelo.value"
                  v-validate="'required|max:80'"
                  :counter="80"
                  :disabled="isVerDetalle"
                  :data-testid="`${testId}--modelo`"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.descripcion.label"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  v-validate="'max:200'"
                  :counter="200"
                  :disabled="isVerDetalle"
                  :data-testid="`${testId}--descripcion`"
                />
              </v-flex>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  formErrors,
  FormErrors,
  FormFieldDefMap,
  FormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
} from '@/reusable/Grid/aggridColumnDefUtils';
import CampoUnico, { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import { TipoDispositivoNuevo } from '@/pantallas/TipoDispositivo/TipoDispositivo';
@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    CampoUnico,
  },
})
export default class TipoDispositivoForm extends Vue {
  @Prop({ required: false }) testId: string;
  @Prop() tipoSeleccionado: TipoDispositivoNuevo;
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: false }) isEditar: boolean;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  uniqueFieldRule = uniqueFieldRule;
  tipoDispositivoId: number = 0;
  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    marca: {
      label: 'Marca',
      id: 'marca',
      value: '',
    },
    modelo: {
      label: 'Modelo',
      id: 'modelo',
      value: '',
    },
  };

  axios = new AxiosVue(ServicioProxy.Dispositivo);

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* handle */

  @Watch('tipoSeleccionado', { deep: true })
  handletipoSeleccionadoChange() {
    if (!this.tipoSeleccionado) {
      return;
    }
    this.formFields.nombre.value = this.tipoSeleccionado.nombre;
    this.formFields.descripcion.value = this.tipoSeleccionado.descripcion;
    this.formFields.marca.value = this.tipoSeleccionado.marca;
    this.formFields.modelo.value = this.tipoSeleccionado.modelo;
    this.tipoDispositivoId = this.tipoSeleccionado.id
      ? this.tipoSeleccionado.id
      : 0;
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        nombre: this.formFields.nombre.value,
        marca: this.formFields.marca.value,
        modelo: this.formFields.modelo.value,
        descripcion: this.formFields.descripcion.value,
      } as TipoDispositivoNuevo,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.handletipoSeleccionadoChange();
  }

  constructor() {
    super();
    this.registrarValidadores();
  }

  registrarValidadores() {
    const self = this;
    Validator.extend('CampoUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Tipo de Dispositivo ya existe';
      },
      validate(value: any) {
        const axios = new AxiosVue(ServicioProxy.Dispositivo);
        return axios.http
          .get(
            `tipodispositivo/ChequearNombreUnico/${self.tipoDispositivoId}/${value}`
          )
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: !response.data,
                data: !response.data
                  ? undefined
                  : {
                      message: '* Tipo de Dispositivo ya existe',
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

  /* Util */

  validarNombreTipo(nombre: string) {
    const axios = new AxiosVue(ServicioProxy.Dispositivo);
    const id =
      this.tipoSeleccionado === undefined ? 0 : this.tipoSeleccionado.id;
    return axios.http.get(
      `TipoDispositivo/ChequearNombreUnico/${id}/${nombre}`
    );
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

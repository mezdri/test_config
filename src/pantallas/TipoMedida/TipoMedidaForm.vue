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
              <v-flex xs12 sm12 md6>
                <!-- <CampoUnico
                  :label="formFields.sigla.label"
                  v-model="formFields.sigla.value"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :id="formFields.sigla.id"
                  :data-testid="`${testId}--sigla`"
                  counter="80"
                  :disabled="isVerDetalle || isEditar"
                  :error-messages="errors.collect(formFields.sigla.id)"
                  :validate="validarSigla"
                  message=" Tipo de Medida ya existe"
                ></CampoUnico>-->
                <v-text-field
                  :label="formFields.sigla.label"
                  v-model="formFields.sigla.value"
                  v-validate="`required|max:80|CampoUnico`"
                  :data-vv-name="formFields.sigla.id"
                  :id="formFields.sigla.id"
                  counter="80"
                  :disabled="isVerDetalle || isEditar"
                  :error-messages="errors.collect(formFields.sigla.id)"
                  :data-testid="`${testId}--sigla`"
                ></v-text-field>
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.nombre.label"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  v-validate="'required|max:80'"
                  :data-testid="`${testId}--nombre`"
                  :counter="80"
                  :disabled="isVerDetalle"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.descripcion.label"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  v-validate="'max:200'"
                  :data-testid="`${testId}--descripcion`"
                  :counter="200"
                  :disabled="isVerDetalle"
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

import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    CampoUnico,
  },
})
export default class TipoMedidaForm extends Vue {
  @Prop({ required: false }) testId: string;
  @Prop() tipoSeleccionado: TipoMedidaNuevo;
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: false }) isEditar: boolean;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  uniqueFieldRule = uniqueFieldRule;
  tipoMedidaId: number = 0;
  message = '* Ya existe un Tipo de Medida con esta sigla';
  formFields: FormFieldDefMap = {
    sigla: {
      label: 'Sigla',
      id: 'sigla',
      value: '',
    },
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
    this.formFields.sigla.value = this.tipoSeleccionado.sigla;
    this.tipoMedidaId = this.tipoSeleccionado.id ? this.tipoSeleccionado.id : 0;
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
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: this.formFields.nombre.value,
          descripcion: this.formFields.descripcion.value,
          sigla: this.formFields.sigla.value,
        } as TipoMedidaNuevo,
      },
      this
    );
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
        return self.message;
      },
      validate(value: any) {
        const axios = new AxiosVue(ServicioProxy.Dispositivo);
        return axios.http
          .get(`tipomedida/ChequearNombreUnico/${self.tipoMedidaId}/${value}`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: !response.data,
                data: !response.data
                  ? undefined
                  : {
                      message: self.message,
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

  validarSigla(sigla: string) {
    const axios = new AxiosVue(ServicioProxy.Dispositivo);
    const id =
      this.tipoSeleccionado === undefined ? 0 : this.tipoSeleccionado.id;
    return axios.http.get(`TipoMedida/ChequearNombreUnico/${id}/${sigla}`);
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

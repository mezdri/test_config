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
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  :data-vv-name="formFields.activo.id"
                  :readonly="verTaller"
                  persistent-hint
                  @change="cambioEstadoSwitch"
                  :hint="mensajeEstado"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <CampoUnico
                  :label="formFields.rut.label"
                  placeholder="EJ: 11111111-1"
                  v-model="formFields.rut.value"
                  v-validate="
                    `required|rut|rutFormato|max:10|${uniqueFieldRule}`
                  "
                  :id="formFields.rut.id"
                  counter="10"
                  :disabled="verTaller || editarTaller"
                  :error-messages="errors.collect(formFields.rut.id)"
                  :validate="validarRutRegistrado"
                  message=" Ya existe un Taller con ese Rut."
                ></CampoUnico>
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-validate="'required|max:80'"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  counter="80"
                  :disabled="verTaller"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.descripcion.label"
                  v-validate="'max:80'"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  counter="80"
                  :disabled="verTaller"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.giro.label"
                  v-validate="'max:80'"
                  :error-messages="errors.collect(formFields.giro.id)"
                  :data-vv-name="formFields.giro.id"
                  v-model="formFields.giro.value"
                  counter="80"
                  :disabled="verTaller"
                />
              </v-flex>
              <v-flex xs11 sm11 md11>
                <v-text-field
                  :label="formFields.direccion.label"
                  v-validate="'max:120'"
                  :error-messages="errors.collect(formFields.direccion.id)"
                  :data-vv-name="formFields.direccion.id"
                  v-model="formFields.direccion.value"
                  id="searchInputHome"
                  counter="120"
                  :disabled="verTaller"
                />
              </v-flex>
              <v-flex md1 sm1 xs1>
                <v-btn
                  flat
                  icon
                  style="margin-left: 10px; margin-top: 10px;"
                  id="btnSearchHome"
                  :hidden="verTaller"
                >
                  <v-icon>search</v-icon>
                </v-btn>
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Taller } from './Taller';
import { Snotify } from '@/snotify/Snotify';
import { EstadoEntidad } from '../../config/enums';
import ValidaRut from '@/config/validaRut';
import CampoUnico, { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import { fetchTallerUnico } from '@/pantallas/Taller/fetchTallerUnico';

@Component({
  components: { TextField, FormFieldsContainer, CampoUnico },
})
export default class TallerForm extends Vue {
  @Prop() tallerSeleccionado: Taller;
  @Prop({ default: true }) editarTaller: boolean;
  @Prop({ default: true }) verTaller: boolean;
  @Prop({ default: '' }) direccionAutoCompleteGoogle: string;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  totalAsociados: number = 0;

  estadoSwitch: boolean = true;
  mensajeEstado: string = '';

  vr: ValidaRut = new ValidaRut();
  uniqueFieldRule = uniqueFieldRule;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: 'false',
    },
    rut: {
      label: 'Rut',
      id: 'rut',
      value: '',
    },
    nombre: {
      label: 'Nombre o Razón Social',
      id: 'nombre',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    giro: {
      label: 'Giro',
      id: 'giro',
      value: '',
    },
    direccion: {
      label: 'Dirección',
      id: 'direccion',
      value: '',
    },
    latitud: {
      label: '',
      id: 'latitud',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));

    let r = this.vr;

    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.Rut(value),
            data: r.Rut(value)
              ? undefined
              : {
                  message: '* Rut inválido',
                },
          });
        });
      },
    });

    Validator.extend('rutFormato', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFormatoRut(value),
            data: r.validaFormatoRut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });

    this.handleFormChange();
  }

  @Watch('tallerSeleccionado', { deep: true, immediate: true })
  handleTallerSeleccionadoChange() {
    if (!this.tallerSeleccionado) {
      this.totalAsociados = 0;
      return;
    }
    this.formFields.rut.value = this.tallerSeleccionado.rut;
    this.formFields.nombre.value = this.tallerSeleccionado.nombre;
    this.formFields.descripcion.value = this.tallerSeleccionado.descripcion;
    this.formFields.giro.value = this.tallerSeleccionado.giro;
    this.formFields.activo.value =
      this.tallerSeleccionado.estado == EstadoEntidad.Activo ? true : false;
    this.formFields.direccion.value = this.tallerSeleccionado.direccion;
    this.totalAsociados = this.tallerSeleccionado.totalAsociados;
    this.cambioEstadoSwitch(this.formFields.activo.value);
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          rut: this.formFields.rut.value,
          nombre: this.formFields.nombre.value,
          descripcion: this.formFields.descripcion.value,
          giro: this.formFields.giro.value,
          estado: this.formFields.activo.value
            ? EstadoEntidad.Activo
            : EstadoEntidad.Inactivo,
        } as Taller,
      },
      this
    );
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  @Watch('formFields.direccion', { deep: true })
  handleFormFieldDireccion() {
    this.$emit('handleFormFieldDireccion', this.formFields.direccion.value);
  }

  @Watch('direccionAutoCompleteGoogle', { deep: true, immediate: true })
  handleChangeDireccion() {
    if (this.direccionAutoCompleteGoogle) {
      const { direccion } = this.formFields;
      direccion.value = this.direccionAutoCompleteGoogle;
    }
  }

  cambioEstadoSwitch(isActivo: boolean) {
    //this.fields[this.formFields.activo.id].dirty = true;
    this.handleFormChange();
    if (isActivo) {
      this.mensajeEstado = '';
      this.formFields.activo.label = 'Activo';
    } else {
      if (this.totalAsociados === 0) {
        this.mensajeEstado =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
      }
      this.formFields.activo.label = 'Inactivo';
    }
    this.$emit('estadoSwitch', isActivo);
  }

  validarRutRegistrado(rut: string) {
    const axios = new AxiosVue(ServicioProxy.Mantenimiento);
    const id =
      this.tallerSeleccionado === undefined ? 0 : this.tallerSeleccionado.id;
    return axios.http.get(`TallerMant/ChequearNombreUnico/${id}/${rut}/`);
  }
}
</script>

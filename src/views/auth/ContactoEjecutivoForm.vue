<template>
  <div align="center">
    <v-form ref="form" v-model="isFormValid" lazy-validation class="col-md-12">
      <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
        <br />
        <!-- EJECUTIVO COMERCIAL  -->
        <FormFieldsContainer titulo="Ejecutivo Comercial">
          <slot name="prependInformacionGeneral" />
          <v-layout
            v-if="
              this.contactoEjecutivoSeleccionado &&
                this.contactoEjecutivoSeleccionado.nombreEjeComercial
            "
          >
            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.nombreEjecutivoComercial.label"
                :disabled="modoVer"
                prepend-icon="person"
                v-model="formFields.nombreEjecutivoComercial.value"
              />
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.telefonoEjecutivoComercial.label"
                :disabled="modoVer"
                prepend-icon="phone"
                v-model="formFields.telefonoEjecutivoComercial.value"
              />
            </v-flex>

            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.correoEjecutivoComercial.label"
                :disabled="modoVer"
                prepend-icon="email"
                v-model="formFields.correoEjecutivoComercial.value"
              />
            </v-flex>
          </v-layout>
          <v-layout v-else style="padding-left: 30px;">
            Sin Ejecutivo Asignado</v-layout
          >
        </FormFieldsContainer>
        <br />
        <br />
        <!-- EJECUTIVO DE COBRANZA -->
        <FormFieldsContainer titulo="Ejecutivo de Cobranza">
          <slot name="prependInformacionGeneral" />
          <v-layout
            v-if="
              this.contactoEjecutivoSeleccionado &&
                this.contactoEjecutivoSeleccionado.nombreEjecCobranza
            "
          >
            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.nombreEjecutivoCobranza.label"
                :disabled="modoVer"
                prepend-icon="person"
                v-model="formFields.nombreEjecutivoCobranza.value"
              />
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.telefonoEjecutivoCobranza.label"
                :disabled="modoVer"
                prepend-icon="phone"
                v-model="formFields.telefonoEjecutivoCobranza.value"
              />
            </v-flex>

            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.correoEjecutivoCobranza.label"
                :disabled="modoVer"
                prepend-icon="email"
                v-model="formFields.correoEjecutivoCobranza.value"
              />
            </v-flex>
          </v-layout>
          <v-layout v-else style="padding-left: 30px;"
            >Sin Ejecutivo Asignado</v-layout
          >
        </FormFieldsContainer>
        <br />
        <br />
        <!-- CONTACTO TÉCNICO -->
        <FormFieldsContainer titulo="Contacto Técnico">
          <slot name="prependInformacionGeneral" />
          <v-layout
            v-if="
              this.contactoEjecutivoSeleccionado &&
                this.contactoEjecutivoSeleccionado.nombreTecnico
            "
          >
            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.nombreContactoTecnico.label"
                :disabled="modoVer"
                prepend-icon="person"
                v-model="formFields.nombreContactoTecnico.value"
              />
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.telefonoContactoTecnico.label"
                :disabled="modoVer"
                prepend-icon="phone"
                v-model="formFields.telefonoContactoTecnico.value"
              />
            </v-flex>

            <v-flex xs4 sm4 md4>
              <v-text-field
                :label="formFields.correoContactoTecnico.label"
                :disabled="modoVer"
                prepend-icon="email"
                v-model="formFields.correoContactoTecnico.value"
              />
            </v-flex>
          </v-layout>
          <v-layout v-else style="padding-left: 30px;">
            Sin Técnico Asignado</v-layout
          >
        </FormFieldsContainer>
      </v-container>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import moment from 'moment';
import {
  emitFormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { EstadoEntidad } from '../../config/enums';
import ValidaRut from '@/config/validaRut';
import { LoadingService } from '@/services/loadingService';

import { fetchGiro } from '@/reusable/Giro/fetchGiro';
import { Giro } from '@/reusable/Giro/Giro';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class ContactoEjecutivoForm extends Vue {
  @Prop() contactoEjecutivoSeleccionado: any;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);

  mensajeEstado: string = '';
  modoVer: boolean = true;

  vr: ValidaRut = new ValidaRut();

  formFields: FormFieldDefMap = {
    nombreEjecutivoComercial: {
      label: 'Nombre Ejecutivo Comercial',
      id: 'nombreEjecutivoComercial',
      value: '',
    },
    telefonoEjecutivoComercial: {
      label: 'Teléfono',
      id: 'telefonoEjecutivoComercial',
      value: '',
    },
    correoEjecutivoComercial: {
      label: 'Correo Electrónico',
      id: 'correoEjecutivoComercial',
      value: '',
    },
    nombreEjecutivoCobranza: {
      label: 'Nombre Ejecutivo de Cobranza',
      id: 'nombreEjecutivoCobranza',
      value: '',
    },
    telefonoEjecutivoCobranza: {
      label: 'Teléfono',
      id: 'telefonoEjecutivoCobranza',
      value: '',
    },
    correoEjecutivoCobranza: {
      label: 'Correo Electrónico',
      id: 'correoEjecutivoCobranza',
      value: '',
    },

    nombreContactoTecnico: {
      label: 'Nombre Contacto Técnico',
      id: 'NombreContactoTecnico',
      value: '',
    },
    telefonoContactoTecnico: {
      label: 'Teléfono',
      id: 'telefonoContactoTecnico',
      value: '',
    },
    correoContactoTecnico: {
      label: 'Correo Electrónico',
      id: 'correoContactoTecnico',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    const self = this;
    let r = this.vr;

    // this.handleFormChange(this.formFields);
    this.handlecalibracionSeleccionadaChange();
  }

  @Watch('contactoEjecutivoSeleccionado', { deep: true })
  handlecalibracionSeleccionadaChange() {
    if (!this.contactoEjecutivoSeleccionado) {
      return;
    }
    this.formFields.nombreEjecutivoComercial.value = this.contactoEjecutivoSeleccionado.nombreEjeComercial;
    this.formFields.telefonoEjecutivoComercial.value = this.contactoEjecutivoSeleccionado.telefonoEjeComercial;
    this.formFields.correoEjecutivoComercial.value = this.contactoEjecutivoSeleccionado.emailEjeComercial;

    this.formFields.nombreEjecutivoCobranza.value = this.contactoEjecutivoSeleccionado.nombreEjecCobranza;
    this.formFields.correoEjecutivoCobranza.value = this.contactoEjecutivoSeleccionado.emailEjecCobranza;
    this.formFields.telefonoEjecutivoCobranza.value = this.contactoEjecutivoSeleccionado.telefonoEjecCobranza;

    this.formFields.nombreContactoTecnico.value = this.contactoEjecutivoSeleccionado.nombreTecnico;
    this.formFields.correoContactoTecnico.value = this.contactoEjecutivoSeleccionado.emailTecnico;
    this.formFields.telefonoContactoTecnico.value = this.contactoEjecutivoSeleccionado.telefonoTecnico;
  }
}
</script>
<style scoped>
.pr {
  padding-right: 20px !important;
}
.pl {
  padding-left: 20px !important;
}
p {
  color: #c5c5c5;
}
</style>

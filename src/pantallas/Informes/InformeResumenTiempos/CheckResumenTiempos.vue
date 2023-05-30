<template>
  <FormFieldsContainer>
    <v-flex md3>
      <v-text-field
        :label="formFields.txtMinimoDias.label"
        v-model="formFields.txtMinimoDias.value"
        @change="ResumenTiempoTxtMinimoDetencion"
        v-validate="'required|numeric'"
        :error-messages="errors.collect('numSim')"
        data-vv-name="numSim"
        required
      />
    </v-flex>
    <v-flex md2>
      <TimePicker
        v-model="formFields.horaInicio.value"
        v-validate="'required'"
        :label="formFields.horaInicio.label"
        :error-messages="errors.collect(formFields.horaInicio.id)"
        :id="formFields.horaInicio.id"
        :disabled="false"
      />
    </v-flex>
  </FormFieldsContainer>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import InformeEventBus from '../partes/InformeEventBus';
import config from '../../../config';
import { Validator } from 'vee-validate';

@Component({
  components: {
    FormFieldsContainer,
    TimePicker,
  },
})
export default class CheckResumenTiempos extends Vue {
  dictionaryFormErrors: any = {};
  formFields: FormFieldDefMap = {
    txtMinimoDias: {
      label: 'Mínimo días de detención',
      id: 'minDias',
      value: null,
    },
    horaInicio: {
      label: 'Mínimo de tiempo',
      id: 'horaInicio',
      value: null,
    },
  };
  ResumenTiempoTxtMinimoDetencion() {
    InformeEventBus.$emit(
      'txtMinimoDetencion',
      parseInt(this.formFields.txtMinimoDias.value.toString()) * 24
    );
  }
  @Watch('formFields.horaInicio.value')
  ResumenTiempoTimePicker() {
    InformeEventBus.$emit(
      'timePickerResumenTiempo',
      this.formFields.horaInicio.value
    );
  }
  async handleValidate() {
    await this.$validator.validateAll();
  }
  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        numSim: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    InformeEventBus.$on('validaResumenTiempo', (validador: any) => {
      this.handleValidate();
    });
  }
}
</script>

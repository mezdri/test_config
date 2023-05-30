<template>
  <div>
    <FormFieldsContainer titulo="Selección Formato Informe">
      <v-flex>
        <v-radio-group
          row
          v-model="formFields.formato.value"
          :disabled="accion === 3"
        >
          <v-radio label="PDF" :value="1"></v-radio>
          <v-radio label="Excel" :value="2"></v-radio>
          <v-radio label="CSV" :value="3"></v-radio>
        </v-radio-group>
      </v-flex>
    </FormFieldsContainer>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import moment from 'moment';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
} from '@/reusable/Form/formUtils';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class SeleccionFormatoInforme extends Vue {
  @Prop({ default: 0 }) formatoInformeProgramado: number;
  @Prop({ default: 1 }) accion: number;

  formFields: FormFieldDefMap = {
    formato: {
      label: '',
      id: 'formatoInforme',
      value: 1,
    },
  };

  /*Handles */

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          formato: this.formFields.formato.value,
        } as any,
      },
      this
    );
  }

  @Watch('formatoInformeProgramado', { deep: true, immediate: true })
  handleFormato() {
    if (this.formatoInformeProgramado) {
      this.formFields.formato.value = this.formatoInformeProgramado;
    }
  }
}
</script>

<style scoped></style>

<template>
  <FormFieldsContainer>
    <v-flex md2>
      <v-checkbox
        :label="formFields.checkSoloResumen.label"
        v-model="formFields.checkSoloResumen.value"
        @change="clickSoloResumen"
        :disabled="accion === 3"
      />
    </v-flex>
  </FormFieldsContainer>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import InformeEventBus from '../partes/InformeEventBus';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class CheckDetalleViaje extends Vue {
  @Prop() formsFieldSitio: any;
  @Prop({ default: 1 }) accion: number;
  formFields: FormFieldDefMap = {
    checkSoloResumen: {
      label: 'Sólo Resumen',
      id: 'soloResumen',
      value: false,
    },
    checkAgruparPorDia: {
      label: 'Agrupar por Día',
      id: 'agruparPorDia',
      value: false,
    },
  };

  @Watch('formsFieldSitio', { deep: true, immediate: true })
  onFormsFieldSitioChanged() {
    this.formFields.checkSoloResumen.value = this.formsFieldSitio;
  }
  clickSoloResumen() {
    InformeEventBus.$emit(
      'checkSoloResumen',
      this.formFields.checkSoloResumen.value
    );
  }
}
</script>

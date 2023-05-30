<template>
  <div align="center">
    <FormFieldsContainer>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkResumen.label"
          v-model="formFields.checkResumen.value"
          :value="true"
          @change="handledDetalleViaje"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkAgruparDia.label"
          v-model="formFields.checkAgruparDia.value"
          :value="true"
          @change="handledDetalleViaje"
          :disabled="accion === 3"
        />
      </v-flex>
    </FormFieldsContainer>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { FiltrosBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class InformeDetalleViaje extends Vue {
  @Prop({ default: (): [] => [] }) filtro: FiltrosBackend[];
  @Prop({ default: 1 }) accion: number;
  // data
  formFields: FormFieldDefMap = {
    checkResumen: {
      label: 'Sólo Resumen',
      id: '5',
      value: false,
    },
    checkAgruparDia: {
      label: 'Agrupar por Día',
      id: '6',
      value: false,
    },
  };

  handledDetalleViaje() {
    const { checkResumen, checkAgruparDia } = this.formFields;
    this.$emit('checkDetalleViaje', checkResumen.value, checkAgruparDia.value);
  }

  @Watch('filtro', { deep: true, immediate: true })
  handlefiltro() {
    if (this.filtro) {
      const { checkResumen, checkAgruparDia } = this.formFields;

      const resumen = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkResumen.id)
      );

      const agruparDia = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkAgruparDia.id)
      );

      checkResumen.value =
        resumen == undefined ? false : resumen.value === 'true';

      checkAgruparDia.value =
        agruparDia == undefined ? false : agruparDia.value === 'true';
    }

    this.handledDetalleViaje();
  }
}
</script>

<style scoped></style>

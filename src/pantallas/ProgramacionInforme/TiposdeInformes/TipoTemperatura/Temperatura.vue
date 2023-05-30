<template>
  <div align="center">
    <FormFieldsContainer>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkSatelite.label"
          v-model="formFields.checkSatelite.value"
          :value="true"
          @change="handledTemperatura"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkHDOP.label"
          v-model="formFields.checkHDOP.value"
          :value="true"
          @change="handledTemperatura"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkLongYLat.label"
          v-model="formFields.checkLongYLat.value"
          :value="true"
          @change="handledTemperatura"
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
export default class Temperatura extends Vue {
  @Prop({ default: (): [] => [] }) filtro: FiltrosBackend[];
  @Prop({ default: 1 }) accion: number;

  // data
  formFields: FormFieldDefMap = {
    checkSatelite: {
      label: 'Satélite',
      id: '13',
      value: false,
    },
    checkHDOP: {
      label: 'HDOP',
      id: '14',
      value: false,
    },
    checkLongYLat: {
      label: 'Latitud y Longitud',
      id: '15',
      value: false,
    },
  };

  handledTemperatura() {
    const { checkSatelite, checkHDOP, checkLongYLat } = this.formFields;
    this.$emit(
      'checkTemperatura',
      checkSatelite.value,
      checkHDOP.value,
      checkLongYLat.value
    );
  }

  @Watch('filtro', { deep: true, immediate: true })
  handlefiltro() {
    if (this.filtro) {
      const { checkSatelite, checkHDOP, checkLongYLat } = this.formFields;

      const satelite = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkSatelite.id)
      );

      const hdop = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkHDOP.id)
      );

      const longYLat = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkLongYLat.id)
      );

      checkSatelite.value =
        satelite == undefined ? false : satelite.value === 'true';

      checkHDOP.value = hdop == undefined ? false : hdop.value === 'true';

      checkLongYLat.value =
        longYLat == undefined ? false : longYLat.value === 'true';
    }

    this.handledTemperatura();
  }
}
</script>

<style scoped></style>

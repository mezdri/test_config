<template>
  <FormFieldsContainer>
    <v-flex md3>
      <v-text-field
        :label="formFields.limiteVelocidad.label"
        :id="formFields.limiteVelocidad.id"
        v-model="formFields.limiteVelocidad.value"
        prepend-icon="network_check"
        @change="handleLimiteVelocidad"
        :error-messages="errors.collect('velMax')"
        data-vv-name="velMax"
        v-validate="'required|numeric|max:3|max_value:120|min_value:1'"
        :counter="3"
        :disabled="accion === 3"
      />
    </v-flex>
  </FormFieldsContainer>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Validator } from 'vee-validate';
import config from '@/config/index';
import { FiltrosBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class ExcesoVelocidad extends Vue {
  @Prop({ default: (): [] => [] }) filtro: FiltrosBackend[];
  @Prop({ default: 1 }) accion: number;

  dictionaryFormErrors: any = {};

  formFields: FormFieldDefMap = {
    limiteVelocidad: {
      label: 'Límite de Velocidad',
      id: '12',
      value: null,
    },
  };

  @Watch('filtro', { deep: true, immediate: true })
  handlefiltro() {
    if (this.filtro) {
      const { limiteVelocidad } = this.formFields;

      const limite = this.filtro.find(
        x => x.reporteFiltroId === parseInt(limiteVelocidad.id)
      );

      limiteVelocidad.value = limite == undefined ? null : limite.value;
    }
  }

  @Watch('formFields.limiteVelocidad.value', { deep: true, immediate: true })
  handleLimiteVelocidad() {
    this.$emit('limiteVelocidad', this.formFields.limiteVelocidad.value);
  }

  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        velMax: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
          max_value: () =>
            '* Limite de Velocidad debe ser mayor a 0 y menor a 120 km/h.',
          min_value: () =>
            '* Limite de Velocidad debe ser mayor a 0 y menor a 120 km/h.',
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
}
</script>

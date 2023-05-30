<template>
  <div>
    <FormFieldsContainer titulo="Periodo de Informe">
      <v-flex md2>
        <TimePicker label="Hora Desde" />
      </v-flex>
      <v-flex md2>
        <TimePicker label="Hora Hasta" />
      </v-flex>
    </FormFieldsContainer>
    <v-divider />
    <br />
    <FormFieldsContainer>
      <v-flex md2 style="margin-top:26px;">
        <span class="font-weight-medium">Seleccionar Periodo</span>
      </v-flex>
      <v-flex md2>
        <v-select label="Por rango" no-data-text="Datos no disponibles" />
      </v-flex>
      <v-flex md2>
        <DatePicker label="Desde" />
      </v-flex>
      <v-flex md2>
        <DatePicker label="Desde" />
      </v-flex>
    </FormFieldsContainer>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';

@Component({
  components: {
    TimePicker,
    FormFieldsContainer,
    DatePicker,
  },
})
export default class PeriodoDeInforme extends Vue {}
</script>

<style scoped></style>

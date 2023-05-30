<template>
  <FormFieldsContainer>
    <v-flex md2>
      <v-checkbox
        :label="formFields.checkSatelite.label"
        v-model="formFields.checkSatelite.value"
        @change="checkTemperatura"
      />
    </v-flex>
    <v-flex md2>
      <v-checkbox
        :label="formFields.checkHDOP.label"
        v-model="formFields.checkHDOP.value"
        @change="checkTemperatura"
      />
    </v-flex>
    <v-flex md2>
      <v-checkbox
        :label="formFields.checkLongYLat.label"
        v-model="formFields.checkLongYLat.value"
        @change="checkTemperatura"
      />
    </v-flex>
  </FormFieldsContainer>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import InformeEventBus from '../partes/InformeEventBus';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class CheckTemperatura extends Vue {
  formFields: FormFieldDefMap = {
    checkSatelite: {
      label: 'Satélite',
      id: 'numero_satelites',
      value: true,
    },
    checkHDOP: {
      label: 'HDOP',
      id: 'hdop',
      value: true,
    },
    checkLongYLat: {
      label: 'Latitud y Longitud',
      id: '',
      value: true,
    },
  };
  checkTemperatura() {
    var check = [];
    if (this.formFields.checkSatelite.value) {
      check.push(this.formFields.checkSatelite.id);
    }
    if (this.formFields.checkHDOP.value) {
      check.push(this.formFields.checkHDOP.id);
    }
    if (this.formFields.checkLongYLat.value) {
      check.push('latitud', 'longitud');
    }

    InformeEventBus.$emit('checkTemperatura', check);
  }
  mounted() {
    this.checkTemperatura();
  }
}
</script>

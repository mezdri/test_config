<template>
  <div>
    <FormFieldsContainer>
      <v-flex sm2 md2>
        <v-text-field
          v-model="formFields.rut.value"
          :label="formFields.rut.label"
          single-line
        />
      </v-flex>
      <v-flex sm3 md3>
        <div class="text-sm-center">
          <v-btn flat icon small @click="handleBuscarClick">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small @click="clearFilters">
            <v-icon>clear</v-icon>
          </v-btn>
        </div>
      </v-flex>
    </FormFieldsContainer>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { isFunction } from 'lodash';
import { GridApi } from 'ag-grid-community';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
  },
})
export default class FormularioFlota extends Vue {
  formFields: FormFieldDefMap = {
    rut: {
      label: 'Rut',
      id: 'rut',
      value: '',
    },
  };

  handleBuscarClick() {
    this.$emit('resultadoBusqueda', this.formFields);
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {} as any,
    });
  }

  clearFilters() {
    this.formFields.rut.value = '';
    this.$emit('clear');
  }
}
</script>
<style></style>

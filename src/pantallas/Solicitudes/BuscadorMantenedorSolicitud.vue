<template>
  <div>
    <FormFieldsContainer>
      <v-flex sm3 md3>
        <DatePicker
          :label="formFields.fechaInicio.label"
          :error-messages="errors.collect(formFields.fechaInicio.id)"
          :id="formFields.fechaInicio.id"
          v-model="formFields.fechaInicio.value"
          :min="fechaMinima"
          :max="fechaMaximaInicio.format('YYYY-MM-DD')"
          :format="'DD/MM/YYYY'"
        />
      </v-flex>
      <v-flex sm3 md3>
        <DatePicker
          :label="formFields.fechaTermino.label"
          :error-messages="errors.collect(formFields.fechaTermino.id)"
          :id="formFields.fechaTermino.id"
          v-model="formFields.fechaTermino.value"
          :min="fechaMinimaInicio.format('YYYY-MM-DD')"
          :max="fechaMaxima"
          :format="'DD/MM/YYYY'"
        />
      </v-flex>
      <v-flex sm4 md4>
        <v-text-field
          v-model="query"
          label="Buscar..."
          single-line
          hide-details
          v-bind="{ ...$props, ...$attrs }"
        />
      </v-flex>
      <v-flex sm2 md2>
        <div class="text-xs-center">
          <v-btn flat icon small @click="realizarBusqueda">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small @click="limpiarBusqueda">
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
export default class BuscadorMantenedorSolicitud extends Vue {
  @Prop({ required: true }) filter: (query: string) => void;

  formFields: FormFieldDefMap = {
    fechaInicio: {
      label: 'Fecha Desde',
      id: 'fechaInicio',
      value: moment(this.fechaMinima),
    },
    fechaTermino: {
      label: 'Fecha Hasta',
      id: 'fechaTermino',
      value: moment(this.fechaMaxima),
    },
  };

  query: string = '';

  mounted() {}

  realizarBusqueda() {
    this.$emit('resultadoBusqueda', this.formFields);
    if (!isFunction(this.filter)) {
      return;
    }
    /*
    El filtro solo debería ser aplicado si el texto ingresado es superior a 1,
    de otro modo restablecerlo para cubrir casos en que el largo disminuye a
    0 o 1.
    */
    this.filter(this.query.length > 1 ? this.query : '');
  }

  limpiarBusqueda() {
    this.query = '';
    this.filter(this.query);
    this.formFields.fechaInicio.value = moment(this.fechaMinima);
    this.formFields.fechaTermino.value = moment(this.fechaMaxima);
    this.$emit('clear');
  }

  get fechaMaxima() {
    let fechaMax: any = new Date().toISOString().substr(0, 10);
    return fechaMax;
  }

  get fechaMinima() {
    let fechaAntigua = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaAntigua;
  }

  get fechaMaximaInicio() {
    let fechaMax = this.formFields.fechaTermino.value;
    return fechaMax as moment.Moment;
  }

  get fechaMinimaInicio() {
    let fechaIni = this.formFields.fechaInicio.value;
    return fechaIni as moment.Moment;
  }
}
</script>

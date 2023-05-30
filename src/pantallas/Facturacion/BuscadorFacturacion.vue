<template>
  <div>
    <FormFieldsContainer>
      <v-flex sm2 md2>
        <v-select
          v-model="formFields.tipoDocumento.value"
          :label="formFields.tipoDocumento.label"
          :items="listaTipoDocumentos"
          item-text="nombre"
          item-value="id"
        />
      </v-flex>
      <v-flex sm2 md2>
        <DatePicker
          :label="formFields.fechaInicio.label"
          :error-messages="errors.collect(formFields.fechaInicio.id)"
          :id="formFields.fechaInicio.id"
          v-model="formFields.fechaInicio.value"
          :min="fechaMinima"
          :max="fechaMaximaInicio.format('YYYY-MM-DD')"
        />
      </v-flex>
      <v-flex sm2 md2>
        <DatePicker
          :label="formFields.fechaTermino.label"
          :error-messages="errors.collect(formFields.fechaTermino.id)"
          :id="formFields.fechaTermino.id"
          v-model="formFields.fechaTermino.value"
          :max="fechaMaxima"
          :min="fechaMinimaInicio.format('YYYY-MM-DD')"
        />
      </v-flex>
      <v-flex sm2 md2>
        <v-select
          v-model="formFields.estado.value"
          :label="formFields.estado.label"
          :items="listaEstados"
          item-text="nombre"
          item-value="nombre"
        />
      </v-flex>
      <v-flex sm2 md2>
        <v-text-field
          v-model="formFields.nroDcto.value"
          :label="formFields.nroDcto.label"
          single-line
          hide-details
        />
      </v-flex>
      <v-flex sm1 md1>
        <div class="text-xs-center">
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
import { TipoDocumento } from '@/pantallas/Facturacion/fetchTipoDocumento';
import { TipoEstado } from '@/pantallas/Facturacion/fetchEstados';
@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
  },
})
export default class BuscadorFacturacion extends Vue {
  @Prop() listaEstados: TipoEstado[];
  @Prop() listaTipoDocumentos: TipoDocumento[];

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
    tipoDocumento: {
      label: 'Tipo de Documento',
      id: 'tipoDocumento',
      value: '',
    },
    nroDcto: {
      label: 'Nro. de Documento',
      id: 'nroDcto',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'estado',
      value: '',
    },
  };

  handleBuscarClick() {
    this.$emit('resultadoBusqueda', this.formFields);
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        fechaInicio: fields.fechaInicio.value,
        fechaTermino: fields.fechaTermino.value,
      } as any,
    });
  }

  get fechaMaxima() {
    let fechaMax: any = new Date().toISOString().substr(0, 10);
    return fechaMax;
  }

  get fechaMaximaInicio() {
    //let fechaMax: any = new Date().toISOString().substr(0, 10);
    let fechaMax = this.formFields.fechaTermino.value;
    return fechaMax as moment.Moment;
  }

  get fechaMinimaInicio() {
    //let fechaMax: any = new Date().toISOString().substr(0, 10);
    let fechaIni = this.formFields.fechaInicio.value;
    return fechaIni as moment.Moment;
  }

  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }

  clearFilters() {
    this.formFields.fechaInicio.value = moment(this.fechaMinima);
    this.formFields.fechaTermino.value = moment(this.fechaMaxima);
    this.formFields.tipoDocumento.value = '';
    this.formFields.nroDcto.value = '';
    this.formFields.estado.value = '';
    this.$emit('clear');
  }
}
</script>

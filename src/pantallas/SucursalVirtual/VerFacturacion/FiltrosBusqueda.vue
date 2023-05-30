<template>
  <div v-show="showFilters">
    <FormFieldsContainer>
      <v-flex sm3 md3>
        <v-select
          v-model="formFields.tipoDTE.value"
          :label="formFields.tipoDTE.label"
          :items="listaTipoDocumentos"
          item-text="nombre"
          item-value="id"
        />
      </v-flex>
      <v-flex sm3 md3>
        <v-select
          v-model="formFields.estado.value"
          :label="formFields.estado.label"
          :items="listaEstados"
          item-text="nombre"
          item-value="nombre"
        />
      </v-flex>
      <v-flex sm2 md2 v-show="!showFilters">
        <v-text-field
          v-model="formFields.folio.value"
          :label="formFields.folio.label"
          single-line
          hide-details
        />
      </v-flex>
      <v-flex sm2 md2 v-show="!showFilters">
        <v-text-field
          v-model="formFields.cantidadRegistros.value"
          :label="formFields.cantidadRegistros.label"
          single-line
          hide-details
        />
      </v-flex>
      <v-flex sm2 md2>
        <DatePicker
          :label="formFields.fechaDesde.label"
          :error-messages="errors.collect(formFields.fechaDesde.id)"
          :id="formFields.fechaDesde.id"
          v-model="formFields.fechaDesde.value"
          :min="fechaMinima"
          :max="fechaMaximaInicio.format('YYYY-MM-DD')"
          :type="formFields.fechaDesde.type"
          :format="formFields.fechaDesde.format"
        />
      </v-flex>
      <v-flex sm4 md4>
        <div class="text-sm-center botones-filtros">
          <v-btn @click="handleBuscarClick">
            <v-icon>search</v-icon>Filtrar
          </v-btn>
          <v-btn @click="clearFilters"> <v-icon>clear</v-icon>Limpiar </v-btn>
          <!--v-btn flat icon small @click="AdvancedFilters">
            <v-icon>filter_list</v-icon>
          </v-btn-->
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
import { TipoDte } from '@/pantallas/SucursalVirtual/VerFacturacion/fetchTipoDte';
import { TipoEstado } from '@/pantallas/SucursalVirtual/VerFacturacion/fetchEstados';
@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
  },
})
export default class FiltrosBusqueda extends Vue {
  @Prop() listaEstados: TipoEstado[];
  @Prop() listaTipoDocumentos: TipoDte[];

  formFields: FormFieldDefMap = {
    folio: {
      label: 'Nº Documento',
      id: 'folio',
      value: '',
    },
    tipoDTE: {
      label: 'Tipo de Documento',
      id: 'tipoDTE',
      value: '',
    },
    estado: {
      label: 'Estado Pago',
      id: 'estado',
      value: '',
    },
    cantidadRegistros: {
      label: 'Cantidad Registros',
      id: 'cantidadRegistros',
      value: '',
    },
    fechaDesde: {
      label: 'Periodo',
      id: 'fechaDesde',
      value: moment(this.fechaMaxima),
      type: 'month',
      format: 'MM/YYYY',
    },
    fechaHasta: {
      label: 'Fecha Hasta',
      id: 'fechaHasta',
      value: moment(this.fechaMaxima),
    },
  };

  handleBuscarClick() {
    this.$emit('resultadoBusqueda', this.formFields);
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        fechaDesde: fields.fechaDesde.value,
        fechaHasta: fields.fechaHasta.value,
      } as any,
    });
  }

  get fechaMaxima() {
    let fechaMax: any = new Date().toISOString().substr(0, 10);
    return fechaMax;
  }

  get fechaMaximaInicio() {
    //let fechaMax: any = new Date().toISOString().substr(0, 10);
    let fechaMax = this.formFields.fechaHasta.value;
    return fechaMax as moment.Moment;
  }

  get fechaMinimaInicio() {
    //let fechaMax: any = new Date().toISOString().substr(0, 10);
    let fechaIni = this.formFields.fechaDesde.value;
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
    this.formFields.fechaDesde.value = moment(this.fechaMaxima);
    this.formFields.fechaHasta.value = moment(this.fechaMaxima);
    this.formFields.tipoDTE.value = '';
    this.formFields.folio.value = '';
    this.formFields.estado.value = '';
    this.formFields.cantidadRegistros.value = '';
    this.showAdvancedFilters = false;
    this.$emit('clear');
  }

  showFilters: boolean = true;

  showAdvancedFilters: boolean = true;
  AdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
}
</script>
<style>
.botones-filtros button {
  /*background-color: #ffe700 !important;*/
  font-size: 11px;
}
</style>

<template>
  <div v-show="showFilters">
    <FormFieldsContainer>
      <v-flex sm2 md2>
        <v-select
          v-model="formFields.empresa.value"
          :label="formFields.empresa.label"
          :items="listaEmpresas"
          item-text="nombre"
          item-value="id"
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
          v-model="formFields.buscador.value"
          :label="formFields.buscador.label"
          single-line
          hide-details
        />
      </v-flex>
      <v-flex sm2 md2>
        <v-text-field
          v-model="formFields.cantidadRegistros.value"
          :label="formFields.cantidadRegistros.label"
          single-line
          hide-details
        />
      </v-flex>
      <v-flex sm2 md2>
        <div class="text-sm-center">
          <v-btn flat icon small @click="handleBuscarClick">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small @click="clearFilters">
            <v-icon>clear</v-icon>
          </v-btn>
          <v-btn flat icon small @click="AdvancedFilters">
            <v-icon>filter_list</v-icon>
          </v-btn>
        </div>
      </v-flex>
      <div class="clearfix" style="width:100%"></div>
      <v-flex sm2 md2 v-show="showAdvancedFilters">
        <DatePicker
          :label="formFields.fechaDesde.label"
          :error-messages="errors.collect(formFields.fechaDesde.id)"
          :id="formFields.fechaDesde.id"
          v-model="formFields.fechaDesde.value"
          :min="fechaMinima"
          :max="fechaMaximaInicio.format('YYYY-MM-DD')"
        />
      </v-flex>
      <v-flex sm2 md2 v-show="showAdvancedFilters">
        <DatePicker
          :label="formFields.fechaHasta.label"
          :error-messages="errors.collect(formFields.fechaHasta.id)"
          :id="formFields.fechaHasta.id"
          v-model="formFields.fechaHasta.value"
          :max="fechaMaxima"
          :min="fechaMinimaInicio.format('YYYY-MM-DD')"
        />
      </v-flex>
      <v-flex sm2 md2 v-show="showAdvancedFilters">
        <v-select
          v-model="formFields.categoria.value"
          :label="formFields.categoria.label"
          :items="listaCategorias"
          item-text="nombre"
          item-value="id"
        />
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
import {
  ConfigEmpresas,
  ConfigEstados,
  ConfigCategorias,
} from '@/pantallas/SucursalVirtual/MisSolicitudes/fetchConfigInicial';
@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
  },
})
export default class FiltrosBusqueda extends Vue {
  @Prop() listaEstados: ConfigEstados[];
  @Prop() listaEmpresas: ConfigEmpresas[];
  @Prop() listaCategorias: ConfigCategorias[];

  formFields: FormFieldDefMap = {
    empresa: {
      label: 'Empresa',
      id: 'empresa',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'estado',
      value: '',
    },
    buscador: {
      label: 'Buscador',
      id: 'buscador',
      value: '',
    },
    cantidadRegistros: {
      label: 'Nº Registros',
      id: 'cantidadRegistros',
      value: '',
    },
    fechaDesde: {
      label: 'Fecha Desde',
      id: 'fechaDesde',
      value: moment(this.fechaMaxima),
    },
    fechaHasta: {
      label: 'Fecha Hasta',
      id: 'fechaHasta',
      value: moment(this.fechaMaxima),
    },
    categoria: {
      label: 'Categoría',
      id: 'categoria',
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
    /*
    this.formFields.fechaDesde.value = moment(this.fechaMaxima);
    this.formFields.fechaHasta.value = moment(this.fechaMaxima);
    this.formFields.tipoDTE.value = '';
    this.formFields.folio.value = '';
    this.formFields.estado.value = '';
    this.formFields.cantidadRegistros.value = '';
    this.showAdvancedFilters = false;
    this.$emit('clear');
    */
  }

  showFilters: boolean = false;

  showAdvancedFilters: boolean = false;
  AdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
}
</script>

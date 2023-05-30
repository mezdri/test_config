<template>
  <v-layout row wrap align-center>
    <v-flex xs12 md6 lg3>
      <v-select v-model="avl" :items="avls" label="AVL"> </v-select>
    </v-flex>
    <v-flex xs12 md6 lg3 v-if="avl">
      <FlotaFilterAutocomplete v-model="flota" :avl="avl" />
    </v-flex>
    <v-flex xs12 md6 lg3>
      <v-text-field v-model="patente" label="Patente" />
    </v-flex>
    <v-flex xs12 md6 lg3>
      <div class="text-sm-center">
        <v-btn flat icon small @click="onChangeFilter">
          <v-icon>search</v-icon>
        </v-btn>
        <v-btn flat icon small @click="clearFilters">
          <v-icon>clear</v-icon>
        </v-btn>
      </div>
    </v-flex>
    <v-flex xs12 md6 lg3 v-if="flota.nombre !== ''">
      <v-layout row>
        <v-flex xs12 md6 offset-lg6 offset-md6>
          <AsignacionDialog :flota="flota" />
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import ClientFilter from '@/components/Filters/ClientFilter.vue';
import {
  ClientFilterI,
  FilterI,
  FlotaFilterI,
  PatenteFilterI,
} from '@/interfaces/Filters';
import FlotaFilterAutocomplete from '@/components/Filters/FlotaFilterAutocomplete.vue';
import AsignacionDialog from './AsignacionDialog.vue';

@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
    ClientFilter,
    FlotaFilterAutocomplete,
    AsignacionDialog,
  },
})
export default class FilterFlotaVehiculo extends Vue {
  formFields: FormFieldDefMap = {
    rut: {
      label: 'Rut',
      id: 'rut',
      value: '',
    },
  };

  @Prop() value: FilterI; //mejorar para que los valores necesarios esten dentro de value y asi usar un warcher

  avls = ['Navman', 'Orvis'];

  avl: string = '';
  client: ClientFilterI = { id: '', nombre: '', rut: '' };
  flota: FlotaFilterI = { id: '', nombre: '' };
  patente: string = '';

  handleBuscarClick() {
    this.$emit('resultadoBusqueda', this.formFields);
  }

  onChangeFilter() {
    this.$emit('input', {
      client: this.client,
      flota: this.flota,
      patente: this.patente,
    });
  }

  @Watch('flota')
  watchFlota() {
    this.$emit('input', {
      client: this.client,
      flota: this.flota,
      patente: this.patente,
    });
  }

  /*@Watch('patente')
  watchPatente() {
    this.$emit('input', {
      client: this.client,
      flota: this.flota,
      patente: this.patente,
    });
  }*/

  clearFilters() {
    this.avl = '';
    this.client = { id: '', nombre: '', rut: '' };
    this.flota = { id: '', nombre: '' };
    this.patente = '';
  }
}
</script>
<style></style>

import { ActivarIntegracionService } from './activarIntegracionService'; import
{ MSResponse } from '@/interfaces/MS'; import { AxiosResponse } from 'axios';
<template>
  <v-layout row wrap align-center>
    <v-flex xs12 md6 lg3>
      <ClientFilter v-model="client" />
    </v-flex>
    <v-flex xs12 md6 lg3 v-if="client">
      <FlotaFilterAutocomplete v-model="flota" :clientRut="client.rut" />
    </v-flex>
    <v-flex xs12 md6 lg3>
      <div class="text-sm-center">
        <v-btn flat icon small @click="handleBuscarClick">
          <v-icon>search</v-icon>
        </v-btn>
        <v-btn flat icon small @click="clearFilters">
          <v-icon>clear</v-icon>
        </v-btn>
      </div>
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
import FlotaFilterAutocomplete from '@/components/Filters/FlotaFilterAutocomplete.vue';
import { ClientFilterI, FlotaFilterI } from '@/interfaces/Filters';
import { ConfigIntegracionInterface } from './activarIntegracionInterface';
import { ActivarIntegracionService } from './activarIntegracionService';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
    ClientFilter,
    FlotaFilterAutocomplete,
  },
})
export default class FilterActivarIntegracion extends Vue {
  response: any = {};
  activarIntegracionService = new ActivarIntegracionService();

  client: ClientFilterI = { id: '', nombre: '', rut: '' };
  flota: FlotaFilterI = { id: '', nombre: '' };
  $snotify: any;

  handleBuscarClick() {
    this.response = {
      client: this.client,
      flota: this.flota,
    };
    this.$emit('filter', this.response);
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {} as any,
    });
  }

  @Watch('client')
  handleClients() {
    this.getConfig();
  }

  async getConfig() {
    const axiosResponse: AxiosResponse<
      MSResponse<ConfigIntegracionInterface>
    > = await this.activarIntegracionService.getIntegrationConfig();
    const msResponse: MSResponse<ConfigIntegracionInterface> =
      axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.$store.commit('setIntegrationConfig', msResponse.data);
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
  }

  clearFilters() {
    this.client = { id: '', nombre: '', rut: '' };
    this.flota = { id: '', nombre: '' };
    this.$emit('clear');
  }
}
</script>
<style></style>

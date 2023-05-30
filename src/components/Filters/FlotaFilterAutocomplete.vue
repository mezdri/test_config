<template>
  <v-autocomplete
    v-model="filter"
    :value="value"
    :items="flotas"
    :loading="loading"
    label="Flotas"
    item-text="nombre"
    item-value="id"
    return-object
    @change="$emit('input', filter)"
  ></v-autocomplete>
</template>

<script lang="ts">
import { FlotaFilterI } from '@/interfaces/Filters';
import { MSResponse } from '@/interfaces/MS';
import { FilterService } from '@/services/filterServices';
import { AxiosResponse } from 'axios';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
@Component
export default class FlotaFilterAutocomplete extends Vue {
  flotas: FlotaFilterI[] = [];
  @Prop() value: FlotaFilterI;
  @Prop(String) readonly avl: string;
  @Prop(String) readonly clientRut: string;
  filter: string = '';
  search: string = '';
  loading: boolean = false;

  private filterService: FilterService = new FilterService();
  private timeOut: NodeJS.Timeout;
  $snotify: any;

  created() {
    this.getFlotas('');
  }

  async getFlotas(filter: string) {
    const axiosResponse: AxiosResponse<
      MSResponse<FlotaFilterI>
    > = await this.filterService.getFlota(this.avl, this.clientRut, filter);
    const msResponse: MSResponse<FlotaFilterI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.flotas = msResponse.data;
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
    this.loading = false;
  }

  @Watch('search')
  searchWatcher(value: string, oldValue: string) {
    if (value !== oldValue && value !== null && this.value.nombre !== value) {
      if (this.timeOut) clearTimeout(this.timeOut);
      this.loading = true;
      this.timeOut = setTimeout(() => this.getFlotas(value), 700);
    }
  }

  @Watch('value')
  watchValueS(value: FlotaFilterI) {
    if (!value.id) {
      this.filter = '';
      this.search = '';
    }
  }

  @Watch('avl')
  watchAVL() {
    this.getFlotas(this.search);
  }

  @Watch('clientRut')
  watchClientRut() {
    this.getFlotas(this.search);
  }
}
</script>
<style></style>

<template>
  <v-select
    v-model="flota"
    :items="flotas"
    :value="value"
    :loading="loading"
    label="Flotas"
    item-text="nombre"
    item-value="nombre"
    return-object
    @change="$emit('input', flota)"
  ></v-select>
</template>

<script lang="ts">
import { FlotaFilterI } from '@/interfaces/Filters';
import { MSResponse } from '@/interfaces/MS';
import { FilterService } from '@/services/filterServices';
import { AxiosResponse } from 'axios';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
@Component
export default class FlotaFilter extends Vue {
  flotas: FlotaFilterI[] = [];
  @Prop() value: FlotaFilterI;
  @Prop(String) readonly clientId: string;
  @Prop(String) readonly avl: string;
  loading: boolean = false;
  flota: FlotaFilterI = { id: '', nombre: '' };

  private filterService: FilterService = new FilterService();
  private timeOut: NodeJS.Timeout;

  created() {
    this.getFlotas();
  }

  async getFlotas() {
    const axiosResponse: AxiosResponse<
      MSResponse<FlotaFilterI>
    > = await this.filterService.getFlota(this.avl, this.clientId, '');
    const msResponse: MSResponse<FlotaFilterI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.flotas = msResponse.data;
    } else {
      //TODO agregar notificacion notify
      console.error(msResponse.MENSAJE_RESPUESTA);
    }
    this.loading = false;
  }

  @Watch('clientId')
  watchClient() {
    this.getFlotas();
  }

  @Watch('avl')
  watchAVL() {
    this.getFlotas();
  }
}
</script>
<style></style>

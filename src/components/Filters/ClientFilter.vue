<template>
  <v-autocomplete
    v-model="filter"
    :value="value"
    :items="clients"
    :loading="loading"
    label="Clientes"
    item-text="nombre"
    item-value="rut"
    return-object
    @change="$emit('input', filter)"
  ></v-autocomplete>
</template>

<script lang="ts">
import { ClientFilterI } from '@/interfaces/Filters';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
@Component({ name: 'ClientFilter' })
export default class ClientFilter extends Vue {
  @Prop() value: ClientFilterI;
  filter: string = '';
  search: string = '';
  loading: boolean = false;

  get clients(): ClientFilterI[] {
    return this.$store.getters.getClients;
  }

  @Watch('value')
  watchValueS(value: ClientFilterI) {
    if (!value.id) {
      this.filter = '';
      this.search = '';
    }
  }
}
</script>
<style></style>

<template>
  <v-container
    fluid
    grid-list-md
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>Histórico</v-tab>
    </v-tabs>
    <v-divider />
    <HistoricoComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CamaraHistorico from '@/pantallas/Camaras/Historico/CamaraHistorico.vue';

@Component({
  components: { HistoricoComponent: CamaraHistorico },
})
export default class CamaraHistoricoPantalla extends Vue {}
</script>
<style scoped></style>

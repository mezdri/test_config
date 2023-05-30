<template>
  <v-container fluid grid-list-md class="InventarioSimConecta">
    <v-tabs left color="transparent">
      <v-tab>Inventario de SIM</v-tab>
    </v-tabs>
    <v-divider />
    <InventarioSimBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import InventarioSimBase from './InventarioSimBase.vue';

@Component({
  components: { InventarioSimBase },
})
export default class ReportesInventarioSim extends Vue {}
</script>

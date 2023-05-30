<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Históricos de Mantenimiento</v-tab>
    </v-tabs>
    <v-divider />
    <HistoricoMantenimiento />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import HistoricoMantenimiento from '@/pantallas/HistoricoMantenimiento/HistoricoMantenimiento.vue';

@Component({
  components: { HistoricoMantenimiento },
})
export default class HistoricoMantenimientoPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Tipos de Mantenimiento</v-tab>
    </v-tabs>
    <v-divider />
    <TipoMantenimiento />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TipoMantenimiento from '@/pantallas/TipoMantenimiento/TipoMantenimiento.vue';

@Component({
  components: { TipoMantenimiento },
})
export default class TipoMantenimientoPantalla extends Vue {}
</script>

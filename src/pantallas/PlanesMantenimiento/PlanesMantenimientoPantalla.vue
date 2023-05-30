<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Planes de Mantenimiento</v-tab>
    </v-tabs>
    <v-divider />
    <PlanesMantenimiento />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import PlanesMantenimiento from '@/pantallas/PlanesMantenimiento/PlanesMantenimiento.vue';

@Component({
  components: { PlanesMantenimiento },
})
export default class PlanesMantenimientoPantalla extends Vue {}
</script>

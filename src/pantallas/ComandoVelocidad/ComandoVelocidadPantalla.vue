<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Asignar Velocidad </v-tab>
    </v-tabs>
    <v-divider />
    <ComandoVelocidad />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ComandoVelocidad from '@/pantallas/ComandoVelocidad/ComandoVelocidad.vue';

@Component({
  components: { ComandoVelocidad },
})
export default class ComandoVelocidadPantalla extends Vue {}
</script>

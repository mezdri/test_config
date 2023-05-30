<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Asignar Vehículos</v-tab>
    </v-tabs>
    <v-divider />
    <Asignacion />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Asignacion from '@/pantallas/Peajes/Asignacion/Asignacion.vue';

@Component({
  components: { Asignacion },
})
export default class AsignacionPantallas extends Vue {}
</script>

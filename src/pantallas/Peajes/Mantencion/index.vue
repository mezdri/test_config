<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Administrador Rutas</v-tab>
    </v-tabs>
    <v-divider />
    <Peajes />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Peajes from '@/pantallas/Peajes/Mantencion/Peajes.vue';

@Component({
  components: { Peajes },
})
export default class PeajesPantalla extends Vue {}
</script>

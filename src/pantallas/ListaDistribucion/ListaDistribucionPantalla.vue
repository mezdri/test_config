<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Lista de Distribución</v-tab>
    </v-tabs>
    <v-divider />
    <ListaDistribucion />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ListaDistribucion from '@/pantallas/ListaDistribucion/ListaDistribucion.vue';

@Component({
  components: { ListaDistribucion },
})
export default class ListaDistribucionPantalla extends Vue {}
</script>

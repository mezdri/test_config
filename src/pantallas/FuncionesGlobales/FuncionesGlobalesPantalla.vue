<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Funciones Globales</v-tab>
    </v-tabs>
    <v-divider />
    <FuncionesGlobales />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import FuncionesGlobales from '@/pantallas/FuncionesGlobales/FuncionesGlobales.vue';

@Component({
  components: { FuncionesGlobales },
})
export default class FuncionesGlobalesPantalla extends Vue {}
</script>

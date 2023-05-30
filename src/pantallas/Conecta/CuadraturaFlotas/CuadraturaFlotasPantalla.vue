<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Creación Flotas</v-tab>
    </v-tabs>
    <v-divider />
    <CuadraturaFlotas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CuadraturaFlotas from '@/pantallas/Conecta/CuadraturaFlotas/CuadraturaFlotas.vue';

@Component({
  components: { CuadraturaFlotas },
})
export default class CuadraturaFlotasPantalla extends Vue {}
</script>

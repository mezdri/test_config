<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Administrador Tarifas</v-tab>
    </v-tabs>
    <v-divider />
    <Tarifas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Tarifas from '@/pantallas/Peajes/Tarifas/Tarifas.vue';

@Component({
  components: { Tarifas },
})
export default class TarifasPantalla extends Vue {}
</script>

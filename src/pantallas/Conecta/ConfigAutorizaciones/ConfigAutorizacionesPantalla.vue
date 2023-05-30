<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Configuración de Autorizaciones</v-tab>
    </v-tabs>
    <v-divider />
    <ConfigAutorizaciones />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConfigAutorizaciones from '@/pantallas/Conecta/ConfigAutorizaciones/ConfigAutorizaciones.vue';

@Component({ components: { ConfigAutorizaciones } })
export default class SimSolicitudesPantalla extends Vue {}
</script>

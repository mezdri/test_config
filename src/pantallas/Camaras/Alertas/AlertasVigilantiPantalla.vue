<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Alertas Fatiga y Distracción</v-tab>
    </v-tabs>
    <v-divider />
    <AlertasCamaras />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import AlertasCamaras from '@/pantallas/Camaras/Alertas/AlertasCamaras.vue';

@Component({
  components: { AlertasCamaras },
})
export default class AlertasVigilantiPantalla extends Vue {}
</script>

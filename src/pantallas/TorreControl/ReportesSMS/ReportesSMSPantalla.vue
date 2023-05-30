<template>
  <v-container
    fluid
    grid-list-md
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>Reporte Comandos Envíados</v-tab>
    </v-tabs>
    <v-divider />
    <ReportesSMSComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ReportesSMS from '@/pantallas/TorreControl/ReportesSMS/ReportesSMS.vue';

@Component({
  components: { ReportesSMSComponent: ReportesSMS },
})
export default class ConfiguracionComandosSMSPantalla extends Vue {}
</script>
<style scoped></style>

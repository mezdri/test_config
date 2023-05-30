<template>
  <v-container fluid grid-list-md class="reportesSerieActiva">
    <v-tabs left color="transparent">
      <v-tab>Consulta de Seguimiento y Estadía de Equipos</v-tab>
    </v-tabs>
    <v-divider />
    <ReportesSerieBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ReportesSerieBase from './ReporteSerieBase.vue';

@Component({
  components: { ReportesSerieBase },
})
export default class ReportesSerieActivaPantalla extends Vue {}
</script>

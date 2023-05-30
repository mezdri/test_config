<template>
  <v-container fluid grid-list-md class="reportesSerieConecta">
    <v-tabs left color="transparent">
      <v-tab>Consulta Equipos Activos</v-tab>
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
export default class ReportesSeriePantalla extends Vue {}
</script>

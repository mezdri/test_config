<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Histórico de Informes</v-tab>
    </v-tabs>
    <v-divider />
    <HistoricoInformeData />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import HistoricoInformeData from '@/pantallas/HistoricoInforme/HistoricoInformeData.vue';

@Component({
  components: { HistoricoInformeData },
})
export default class HistoricoInforme extends Vue {}
</script>

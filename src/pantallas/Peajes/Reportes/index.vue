<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Reportes</v-tab>
    </v-tabs>
    <v-divider />
    <Reportes />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Reportes from '@/pantallas/Peajes/Reportes/Reportes.vue';

@Component({
  components: { Reportes },
})
export default class ReportesPantalla extends Vue {}
</script>

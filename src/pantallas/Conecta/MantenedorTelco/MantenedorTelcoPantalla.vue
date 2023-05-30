<template>
  <v-container fluid grid-list-md class="reportesSerieConecta">
    <v-tabs left color="transparent">
      <v-tab>Mantenedor Telcos</v-tab>
    </v-tabs>
    <v-divider />
    <MantenedorTelcosBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MantenedorTelcosBase from './MantenedorTelcosBase.vue';

@Component({
  components: { MantenedorTelcosBase },
})
export default class MantenedorTelcoPantalla extends Vue {}
</script>

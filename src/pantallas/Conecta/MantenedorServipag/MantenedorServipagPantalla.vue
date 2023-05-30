<template>
  <v-container class="reportesSerieActiva" fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Transacción Servipag</v-tab>
    </v-tabs>
    <v-divider />
    <ConfigurarPantallaServipag />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConfigurarPantallaServipag from './ConfigurarPantallaServipag.vue';

@Component({
  components: { ConfigurarPantallaServipag },
})
export default class MantenedorServipagPantalla extends Vue {}
</script>

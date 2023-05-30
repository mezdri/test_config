<template>
  <v-container fluid grid-list-md class="reportesSerieActiva">
    <v-tabs left color="transparent">
      <v-tab>Tipos de Equipo</v-tab>
    </v-tabs>
    <v-divider />
    <MatrizBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MatrizBase from './MatrizBase.vue';

@Component({
  components: { MatrizBase },
})
export default class MatrizProductoPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md class="reportesSerieActiva">
    <v-tabs left color="transparent">
      <v-tab>Tipos de Productos Comerciales</v-tab>
    </v-tabs>
    <v-divider />
    <TiposProductoBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TiposProductoBase from './TiposProductoBase.vue';

@Component({
  components: { TiposProductoBase },
})
export default class TiposProductoPantalla extends Vue {}
</script>

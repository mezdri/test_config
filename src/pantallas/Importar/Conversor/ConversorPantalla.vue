<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Conversor Kmz a Csv</v-tab>
    </v-tabs>
    <v-divider />
    <Conversor />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Conversor from '@/pantallas/Importar/Conversor/Conversor.vue';

@Component({
  components: { Conversor },
})
export default class ConversorPantalla extends Vue {}
</script>
<style scoped></style>

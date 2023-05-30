<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Visitas</v-tab>
    </v-tabs>
    <v-divider />
    <MisVisitas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MisVisitas from '@/pantallas/SucursalVirtual/MisVisitas/MisVisitas.vue';

@Component({
  components: { MisVisitas },
})
export default class MisVisitasPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Pautas de Actividades</v-tab>
    </v-tabs>
    <v-divider />
    <PautasActividades />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import PautasActividades from '@/pantallas/PautasActividades/PautasActividades.vue';

@Component({
  components: { PautasActividades },
})
export default class PautasActividadesPantalla extends Vue {}
</script>

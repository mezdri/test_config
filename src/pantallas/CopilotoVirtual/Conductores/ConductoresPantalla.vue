<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Conductores Copiloto Virtual</v-tab>
    </v-tabs>
    <v-divider />
    <Conductores />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Conductores from '@/pantallas/CopilotoVirtual/Conductores/CopilotoConductores.vue';

@Component({
  components: { Conductores },
})
export default class ConductoresPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Eventos Copiloto Virtual</v-tab>
    </v-tabs>
    <v-divider />
    <Evento />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Evento from '@/pantallas/CopilotoVirtual/Eventos/CopilotoEvento.vue';

@Component({
  components: { Evento },
})
export default class EventoPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Alertas</v-tab>
    </v-tabs>
    <v-divider />
    <Alertas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Alertas from '@/pantallas/Alertas/Alertas.vue';

@Component({
  components: { Alertas },
})
export default class AlertasPantalla extends Vue {}
</script>

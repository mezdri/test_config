<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Dispositivos</v-tab>
    </v-tabs>
    <v-divider />
    <Dispositivo />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Dispositivo from '@/pantallas/Dispositivos/Dispositivo.vue';

@Component({
  components: { Dispositivo },
})
export default class DispositivoPantalla extends Vue {}
</script>

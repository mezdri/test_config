<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Tipo de Dispositivo</v-tab>
    </v-tabs>
    <v-divider />
    <TipoDispositivo />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TipoDispositivo from '@/pantallas/TipoDispositivo/TipoDispositivo.vue';

@Component({
  components: { TipoDispositivo },
})
export default class TipoDispositivoPantalla extends Vue {}
</script>

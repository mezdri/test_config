<template>
  <v-container class="MotivodeBaja" fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Mantenedor de Baja</v-tab>
    </v-tabs>
    <v-divider />
    <ConfigurarPantallaMotivo />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConfigurarPantallaMotivo from './ConfigurarPantallaMotivo.vue';

@Component({
  components: { ConfigurarPantallaMotivo },
})
export default class MotivodeBajaPantalla extends Vue {}
</script>

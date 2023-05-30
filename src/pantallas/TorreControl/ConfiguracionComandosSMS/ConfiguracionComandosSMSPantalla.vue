<template>
  <v-container
    fluid
    grid-list-md
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>Configuración Comandos</v-tab>
    </v-tabs>
    <v-divider />
    <ConfiguracionComandoComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConfiguracionComandosSMS from '@/pantallas/TorreControl/ConfiguracionComandosSMS/ConfiguracionComandosSMS.vue';

@Component({
  components: { ConfiguracionComandoComponent: ConfiguracionComandosSMS },
})
export default class ConfiguracionComandosSMSPantalla extends Vue {}
</script>
<style scoped></style>

<template>
  <v-container
    fluid
    grid-list-md
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>Envío Comandos SMS</v-tab>
    </v-tabs>
    <v-divider />
    <EnvioComandoComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EnvioComandosSMS from '@/pantallas/TorreControl/EnvioComandosSMS/EnvioComandosSMS.vue';

@Component({
  components: { EnvioComandoComponent: EnvioComandosSMS },
})
export default class EnvioComandosSMSPantalla extends Vue {}
</script>
<style scoped></style>

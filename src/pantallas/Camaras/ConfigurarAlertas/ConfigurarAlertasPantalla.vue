<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Configurar Notificaciones</v-tab>
    </v-tabs>
    <v-divider />
    <ConfigurarAlertas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConfigurarAlertas from '@/pantallas/Camaras/ConfigurarAlertas/ConfigurarAlertas.vue';

@Component({
  components: { ConfigurarAlertas },
})
export default class ConfigurarAlertasPantalla extends Vue {}
</script>

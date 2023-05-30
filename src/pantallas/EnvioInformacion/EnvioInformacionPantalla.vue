<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Envío de información</v-tab>
    </v-tabs>
    <v-divider />
    <EnvioInformacion />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EnvioInformacion from '@/pantallas/EnvioInformacion/EnvioInformacion.vue';

@Component({
  components: { EnvioInformacion },
})
export default class EnvioInformacionPantalla extends Vue {}
</script>

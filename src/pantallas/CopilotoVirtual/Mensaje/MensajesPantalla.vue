<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Mensajes Copiloto Virtual</v-tab>
    </v-tabs>
    <v-divider />
    <Mensaje />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Mensaje from '@/pantallas/CopilotoVirtual/Mensaje/CopilotoMensaje.vue';

@Component({
  components: { Mensaje },
})
export default class MensajesPantalla extends Vue {}
</script>

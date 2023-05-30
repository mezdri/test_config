<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Administrador Clientes</v-tab>
    </v-tabs>
    <v-divider />
    <ClientesConecta />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ClientesConecta from '@/pantallas/Conecta/Clientes/ClientesConecta.vue';

@Component({
  components: { ClientesConecta },
})
export default class ClientesConectaPantalla extends Vue {}
</script>

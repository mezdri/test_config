<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>CLIENTES PROVEEDORES DE GPS</v-tab>
    </v-tabs>
    <v-divider />
    <ClientesProveedores />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ClientesProveedores from '@/pantallas/ClienteProveedor/ClientesProveedores.vue';

@Component({
  components: { ClientesProveedores },
})
export default class ClientesProveedoresPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Proveedores de GPS</v-tab>
    </v-tabs>
    <v-divider />
    <Proveedores />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Proveedores from '@/pantallas/Proveedor/Proveedores.vue';

@Component({
  components: { Proveedores },
})
export default class ProveedoresPantalla extends Vue {}
</script>

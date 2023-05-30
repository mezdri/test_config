<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>CONFIGURACIÓN DE CONTRATO</v-tab>
    </v-tabs>
    <v-divider />
    <ContratoProveedor />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ContratoProveedor from '@/pantallas/ContratoProveedor/ContratoProveedor.vue';

@Component({
  components: { ContratoProveedor },
})
export default class ContratoProveedorPantalla extends Vue {}
</script>

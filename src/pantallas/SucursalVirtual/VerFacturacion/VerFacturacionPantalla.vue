<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Facturaci&oacute;n</v-tab>
    </v-tabs>
    <v-divider />
    <VerFacturaciones />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import VerFacturaciones from '@/pantallas/SucursalVirtual/VerFacturacion/VerFacturaciones.vue';

@Component({
  components: { VerFacturaciones },
})
export default class VerFacturacionPantalla extends Vue {}
</script>

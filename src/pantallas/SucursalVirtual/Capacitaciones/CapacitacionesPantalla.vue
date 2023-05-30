<template>
  <v-container fluid grid-list-md class="sv-capacitaciones">
    <v-tabs left color="transparent">
      <v-tab>Capacitaciones</v-tab>
    </v-tabs>
    <v-divider />
    <CapacitacionesBase />
    
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CapacitacionesBase from '@/pantallas/SucursalVirtual/Capacitaciones/CapacitacionesBase.vue';

@Component({
  components: { CapacitacionesBase },
})
export default class CapacitacionPantalla extends Vue {}
</script>

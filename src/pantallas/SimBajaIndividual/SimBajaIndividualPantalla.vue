<template>
  <v-container fluid grid-list-md class="simBajaIndividual">
    <v-tabs left color="transparent">
      <v-tab>Solicitud de Baja SIM Individual</v-tab>
    </v-tabs>
    <v-divider />
    <SimBajaIndividualBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import SimBajaIndividualBase from './SimBajaIndividualBase.vue';

@Component({
  components: { SimBajaIndividualBase },
})
export default class SimBajaIndividualPantalla extends Vue {}
</script>

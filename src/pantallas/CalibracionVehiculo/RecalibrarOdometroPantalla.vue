<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Recalibrar Odómetro</v-tab>
    </v-tabs>
    <v-divider />
    <RecalibrarOdometro />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import RecalibrarOdometro from '@/pantallas/CalibracionVehiculo/RecalibrarOdometro.vue';

@Component({
  components: { RecalibrarOdometro },
})
export default class RecalibrarOdometroPantalla extends Vue {}
</script>

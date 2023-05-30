<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Recalibrar Horómetro</v-tab>
    </v-tabs>
    <v-divider />
    <RecalibrarHorometro />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import RecalibrarHorometro from '@/pantallas/CalibracionVehiculo/RecalibrarHorometro.vue';

@Component({
  components: { RecalibrarHorometro },
})
export default class RecalibrarHorometroPantalla extends Vue {}
</script>

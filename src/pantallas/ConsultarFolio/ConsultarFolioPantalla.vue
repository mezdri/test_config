<template>
  <v-container fluid>
    <v-tabs left color="transparent">
      <v-tab>Consultar Folio</v-tab>
    </v-tabs>
    <v-divider />
    <ConsultarFolio />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConsultarFolio from '@/pantallas/ConsultarFolio/ConsultarFolio.vue';

@Component({
  components: { ConsultarFolio },
})
export default class ConsultarFolioPantalla extends Vue {}
</script>

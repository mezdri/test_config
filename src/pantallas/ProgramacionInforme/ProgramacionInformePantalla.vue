<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Programación de Informes</v-tab>
    </v-tabs>
    <v-divider />
    <ProgramacionInforme />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ProgramacionInforme from '@/pantallas/ProgramacionInforme/ProgramacionInforme.vue';

@Component({
  components: { ProgramacionInforme },
})
export default class ProgramacionInformePantalla extends Vue {}
</script>

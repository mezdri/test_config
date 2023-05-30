<template>
  <v-container fluid grid-list-md class="AltaTecnicoConecta">
    <v-tabs left color="transparent">
      <v-tab>Técnicos</v-tab>
    </v-tabs>
    <v-divider />
    <AltaTecnicoBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import AltaTecnicoBase from './AltaTecnicoBase.vue';

@Component({
  components: { AltaTecnicoBase },
})
export default class AltaTecnicoPantalla extends Vue {}
</script>

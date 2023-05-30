<template>
  <v-container
    fluid
    grid-list-md
    class="containerClass"
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>VOD</v-tab>
    </v-tabs>
    <v-divider />
    <VODComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CamaraVOD from '@/pantallas/Camaras/VOD/CamaraVOD.vue';

@Component({
  components: { VODComponent: CamaraVOD },
})
export default class CamaraVODPantalla extends Vue {}
</script>

<style scoped></style>

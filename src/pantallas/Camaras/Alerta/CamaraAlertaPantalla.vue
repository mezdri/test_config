<template>
  <v-container
    fluid
    grid-list-md
    class="containerClass"
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>Alerta</v-tab>
    </v-tabs>
    <v-divider />
    <AlertaComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CamaraAlerta from '@/pantallas/Camaras/Alerta/CamaraAlerta.vue';

@Component({
  components: { AlertaComponent: CamaraAlerta },
})
export default class CamaraAlertaPantalla extends Vue {}
</script>

<style scoped></style>

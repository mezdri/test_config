<template>
  <v-container
    fluid
    grid-list-md
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>Registros en la Cámara</v-tab>
    </v-tabs>
    <v-divider />
    <RegistroComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CamaraRegistro from '@/pantallas/Camaras/Registro/CamaraRegistro.vue';

@Component({
  components: { RegistroComponent: CamaraRegistro },
})
export default class CamaraRegistroPantalla extends Vue {}
</script>
<style scoped></style>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Seguimiento de solicitudes</v-tab>
    </v-tabs>
    <v-divider />
    <MisSolicitudes />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MisSolicitudes from '@/pantallas/SucursalVirtual/MisSolicitudes/MisSolicitudes.vue';

@Component({
  components: { MisSolicitudes },
})
export default class MisSolicitudesPantalla extends Vue {}
</script>

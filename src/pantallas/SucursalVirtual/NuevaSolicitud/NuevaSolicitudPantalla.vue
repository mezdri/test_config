<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Registro de Nueva Solicitud</v-tab>
    </v-tabs>
    <v-divider />
    <NuevaSolicitud />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NuevaSolicitud from '@/pantallas/SucursalVirtual/NuevaSolicitud/NuevaSolicitud.vue';

@Component({
  components: { NuevaSolicitud },
})
export default class NuevaSolicitudPantalla extends Vue {}
</script>

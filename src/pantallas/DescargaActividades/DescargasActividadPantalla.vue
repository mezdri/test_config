<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Descarga de Información</v-tab>
    </v-tabs>
    <v-divider />
    <DescargasActividad />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import DescargasActividad from '@/pantallas/DescargaActividades/DescargasActividad.vue';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { fetchClientesProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';

@Component({
  components: { DescargasActividad },
})
export default class DescargasActividadPantalla extends Vue {
  created() {
    fetchProveedoresGps.cache.clear();
    fetchClientesProveedorGps.cache.clear();
  }
}
</script>

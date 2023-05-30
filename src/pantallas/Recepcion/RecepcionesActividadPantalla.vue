<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Recepción de Información</v-tab>
    </v-tabs>
    <v-divider />
    <RecepcionesActividad />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import RecepcionesActividad from '@/pantallas/Recepcion/RecepcionesActividad.vue';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { fetchClientesProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';

@Component({
  components: { RecepcionesActividad },
})
export default class RecepcionesActividadPantalla extends Vue {
  created() {
    fetchProveedoresGps.cache.clear();
    fetchClientesProveedorGps.cache.clear();
  }
}
</script>

<template>
  <v-container fluid grid-list-md id="vContainerStyle">
    <v-tabs left color="transparent">
      <v-tab>Informes Generados</v-tab>
    </v-tabs>
    <v-divider />
    <InformesGenerados />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import Datatables from '@/pantallas/TorreControl/Datatables.vue';
import { MSResponse } from '@/interfaces/MS';
import { AxiosResponse } from 'axios';
import { ControlVehiculosInterface } from '@/pantallas/TorreControl/ControlVehiculos/controlVehiculosInterface';
import { headers } from '@/pantallas/TorreControl/ControlVehiculos/controlVehiculosHeaders';
import { VehiculosService } from '@/pantallas/TorreControl/ControlVehiculos/vehiculosService';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';
import InformesGenerados from '@/pantallas/Informes/InformesGenerados/InformesGenerados.vue';

@Component({
  name: 'ControlVehiculos',
  components: {
    Datatables,
    InformesGenerados,
  },
})
export default class ControlInformes extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();
  tabSelected: number = 1;
  clientId: string;
  flotaId: string;
  isLoading: boolean = false;
  dataTable: ControlVehiculosInterface[] = [];
  vehiculosService = new VehiculosService();
  headers = headers;
  readonly funcionalidad: Funcionalidades = Funcionalidades.TorreControl;

  detalleSeleccionado: any = null;

  constructor() {
    super();
    this.getClientId();
  }

  getClientId() {
    this.flotaId = this.$route.params.id;
    this.clientId = localStorage.getItem('clienteDefecto');
  }

  async mounted() {}
}
</script>

<style scoped></style>

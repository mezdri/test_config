<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form class="col-md-12">
          <v-container grid-list-md>
            <v-layout row wrap>
              <div align="left">
                <v-flex md12>
                  <h2 class="h2_title">Seleccionar Vehículo</h2>
                </v-flex>
              </div>
            </v-layout>
            <v-divider></v-divider>
            <AsociarVehiculo
              test-id="AsociarVehiculo"
              :vehiculos="vehiculos.todos"
              :vehiculos-seleccionados="vehiculos.seleccionados"
              @selectionChange="handleSelectedVehiculosChange"
              :readonly="readonly"
            />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import AsociarVehiculo from '@/pantallas/Preventivas/AsociarVehiculo.vue';
import {
  fetchVehiculos,
  Vehiculo,
} from '@/pantallas/Preventivas/fetchVehiculos';

type Asociacion<T> = {
  todos: T[];
  seleccionados: T[];
};

export type AsociarVehiculoChangeEvent = {
  vehiculos: Vehiculo[];
};

@Component({
  components: {
    AsociarVehiculo,
  },
})
export default class AsociarVehiculoForm extends Vue {
  @Prop({ default: (): [] => [] }) vehiculosIdSeleccionar: number;
  @Prop({ default: false }) readonly: boolean;

  /* state */
  vehiculos: Asociacion<Vehiculo> = {
    todos: [],
    seleccionados: [],
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  emitChangeEvent() {
    const event: AsociarVehiculoChangeEvent = {
      vehiculos: this.vehiculos.seleccionados,
    };
    this.$emit('change', event);
  }

  async cargarVehiculos() {
    this.vehiculos.todos = (await this.fetchVehiculos()) || [];
    if (this.readonly) {
      this.vehiculos.seleccionados.push(
        this.vehiculos.todos.find(x => x.id === this.vehiculosIdSeleccionar)
      );
    }
  }

  /* Handles*/

  handleSelectedVehiculosChange(vehiculos: Vehiculo[]) {
    this.vehiculos.seleccionados = vehiculos;
    this.emitChangeEvent();
  }

  /* Util */

  fetchVehiculos() {
    this.loadingService.showLoading();
    return fetchVehiculos()
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener los vehículos`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  /* lifecycle hooks */

  mounted() {
    this.cargarVehiculos();
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

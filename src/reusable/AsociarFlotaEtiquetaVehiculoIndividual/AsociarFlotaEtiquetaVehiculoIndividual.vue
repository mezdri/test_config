<template>
  <div align="center">
    <v-flex :md12="esInforme" :md10="!esInforme">
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <v-form class="col-md-12">
            <StepTitle>Asociar Flotas, Etiquetas o Vehículos</StepTitle>
            <v-divider></v-divider>
            <v-layout wrap>
              <v-flex xs12 md12 lg12>
                <v-radio-group v-model="tipoAsociacion" row>
                  <v-radio
                    label="Flotas"
                    :value="tiposAsociacion.flota"
                  ></v-radio>
                  <v-radio
                    label="Etiquetas"
                    :value="tiposAsociacion.etiqueta"
                  ></v-radio>
                  <v-radio
                    label="Vehículos"
                    :value="tiposAsociacion.vehiculo"
                  ></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>
            <div align="left">
              <AsociarFlotasIndividual
                v-show="tipoAsociacion === tiposAsociacion.flota"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :flotas="flotas.todos"
                :flotasSeleccionadas="flotas.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                @selectionChange="handleSelectedFlotasChange"
                :show="tipoAsociacion === tiposAsociacion.flota"
              />
            </div>
            <div align="left">
              <AsociarEtiquetasIndividual
                v-show="tipoAsociacion === tiposAsociacion.etiqueta"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :etiquetas="etiquetas.todos"
                :etiquetasSeleccionadas="etiquetas.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                @selectionChange="handleSelectedEtiquetasChange"
                :show="tipoAsociacion === tiposAsociacion.etiqueta"
              />
            </div>
            <div align="left">
              <AsociarVehiculos
                v-show="tipoAsociacion === tiposAsociacion.vehiculo"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :vehiculos="vehiculos.todos"
                :vehiculos-seleccionados="vehiculos.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                :columnDefs="colDefVehiculo"
                @selectionChange="handleSelectedVehiculosChange"
                :show="tipoAsociacion === tiposAsociacion.vehiculo"
              />
            </div>
          </v-form>
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { uniqBy, differenceBy } from 'lodash';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { ColDef } from 'ag-grid-community';

import AsociarFlotasIndividual from './AsociarFlotasIndividual.vue';
import AsociarEtiquetasIndividual from './AsociarEtiquetasIndividual.vue';
import AsociarVehiculos from '../AsociarFlotaEtiquetaVehiculo/AsociarVehiculos.vue';
import {
  Etiqueta,
  fetchFlotasEtiquetasVehiculos,
  Flota,
  Vehiculo,
} from '../AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';

enum TiposAsociacion {
  flota,
  etiqueta,
  vehiculo,
  vehiculoDejadoRecibir,
}

type Asociacion<T> = {
  todos: T[];
  seleccionados: T[];
};

export type AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
  flotas: Flota[];
  etiquetas: Etiqueta[];
  vehiculos: Vehiculo[];
};

@Component({
  components: {
    StepTitle,
    AsociarVehiculos,
    AsociarEtiquetasIndividual,
    AsociarFlotasIndividual,
  },
})
export default class AsociarFlotaEtiquetaVehiculoIndividual extends Vue {
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) esInforme: boolean;
  @Prop({ default: (): [] => [] }) flotasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) etiquetasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) vehiculosIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) colDefVehiculo: Array<ColDef>;
  @Prop({ default: false }) filtroGps!: boolean;
  /* state */

  flotas: Asociacion<Flota> = {
    todos: [],
    seleccionados: [],
  };
  etiquetas: Asociacion<Etiqueta> = {
    todos: [],
    seleccionados: [],
  };
  vehiculos: Asociacion<Vehiculo> = {
    todos: [],
    seleccionados: [],
  };

  /* template */

  tiposAsociacion = TiposAsociacion;
  tipoAsociacion = TiposAsociacion.flota;
  vehiculoDDR: Vehiculo[];
  showDDR: boolean = false;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* lifecycle hooks */

  mounted() {
    this.cargarData();
  }

  async cargarData() {
    const data = await this.fetchFlotasEtiquetasVehiculos();
    if (!data) {
      return;
    }

    const { etiquetas, flotas, vehiculos } = data;

    if (!this.filtroGps) {
      this.flotas.todos = flotas;
      this.etiquetas.todos = etiquetas;
      this.vehiculos.todos = vehiculos;
    } else {
      this.vehiculos.todos = vehiculos.filter(v => !v.poseeGps);
      this.flotas.todos = uniqBy(
        this.vehiculos.todos.map(x => x.flota),
        flota => flota.id
      );
      this.etiquetas.todos = uniqBy(
        this.vehiculos.todos.flatMap(x => x.etiquetas),
        etiqueta => etiqueta.id
      );
    }

    this.handleFlotasIdSeleccionarChange();
    this.handleEtiquetasIdSeleccionarChange();
    this.handleVehiculosIdSeleccionarChange();
  }

  emitChangeEvent() {
    const event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
      flotas: this.flotas.seleccionados,
      etiquetas: this.etiquetas.seleccionados,
      vehiculos: this.vehiculos.seleccionados,
    };

    this.$emit('change', event);
  }

  /* event handlers */

  handleSelectedFlotasChange(flotas: Flota[]) {
    this.flotas.seleccionados = flotas;
    this.emitChangeEvent();
  }

  handleSelectedEtiquetasChange(etiquetas: Etiqueta[]) {
    this.etiquetas.seleccionados = etiquetas;
    this.emitChangeEvent();
  }

  handleSelectedVehiculosChange(vehiculos: Vehiculo[]) {
    this.vehiculos.seleccionados = vehiculos;
    this.emitChangeEvent();
  }

  /* fetch */

  fetchFlotasEtiquetasVehiculos() {
    this.loadingService.showLoading();
    return fetchFlotasEtiquetasVehiculos()
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener flotas/etiquetas/vehiculos disponibles`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  /* watcher */
  @Watch('flotasIdSeleccionar', { deep: true, immediate: true })
  handleFlotasIdSeleccionarChange() {
    if (this.flotasIdSeleccionar) {
      this.handleSelectedFlotasChange(
        uniqBy(
          [
            ...this.flotas.seleccionados,
            ...this.flotasIdSeleccionar
              .map(id => this.flotas.todos.find(x => x.id === id))
              .filter(x => x !== undefined),
          ],
          x => x.id
        )
      );
    }
  }

  @Watch('etiquetasIdSeleccionar', { deep: true, immediate: true })
  handleEtiquetasIdSeleccionarChange() {
    if (this.etiquetasIdSeleccionar) {
      this.handleSelectedEtiquetasChange(
        uniqBy(
          [
            ...this.etiquetas.seleccionados,
            ...this.etiquetasIdSeleccionar
              .map(id => this.etiquetas.todos.find(x => x.id === id))
              .filter(x => x !== undefined),
          ],
          x => x.id
        )
      );
    }
  }

  @Watch('vehiculosIdSeleccionar', { deep: true, immediate: true })
  handleVehiculosIdSeleccionarChange() {
    if (this.vehiculosIdSeleccionar) {
      this.handleSelectedVehiculosChange(
        uniqBy(
          [
            ...this.vehiculos.seleccionados,
            ...this.vehiculosIdSeleccionar
              .map(id => this.vehiculos.todos.find(x => x.id === id))
              .filter(x => x !== undefined),
          ],
          x => x.id
        )
      );
    }
  }
}
</script>

<style scoped></style>

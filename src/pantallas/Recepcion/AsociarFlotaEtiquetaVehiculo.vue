<template>
  <div align="center" :data-testid="makeTestId('container')">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <StepTitle>Asociar Flotas, Etiquetas o Vehículos</StepTitle>
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
            <v-divider></v-divider>
            <AsociarFlotas
              v-show="tipoAsociacion === tiposAsociacion.flota"
              test-id="AsociarFlotaEtiquetaVehiculo"
              :flotas="flotas.todos"
              :flotas-seleccionadas="flotas.seleccionados"
              :readonly="readonly"
              @selectionChange="handleSelectedFlotasChange"
            />
            <AsociarEtiquetas
              v-show="tipoAsociacion === tiposAsociacion.etiqueta"
              test-id="AsociarFlotaEtiquetaVehiculo"
              :etiquetas="etiquetas.todos"
              :etiquetas-seleccionadas="etiquetas.seleccionados"
              :readonly="readonly"
              @selectionChange="handleSelectedEtiquetasUserChange"
            />
            <AsociarVehiculos
              v-show="tipoAsociacion === tiposAsociacion.vehiculo"
              test-id="AsociarFlotaEtiquetaVehiculo"
              :vehiculos="vehiculos.todos"
              :vehiculos-seleccionados="vehiculos.seleccionados"
              :readonly="readonly"
              @selectionChange="handleSelectedVehiculosChange"
            />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { uniqBy, differenceBy } from 'lodash';

import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import AsociarFlotas from '@/pantallas/Recepcion/AsociarFlotas.vue';
import AsociarEtiquetas, {
  SelectionChangeEventParams,
} from '@/pantallas/Recepcion/AsociarEtiquetas.vue';
import AsociarVehiculos from '@/pantallas/Recepcion/AsociarVehiculos.vue';
import {
  Etiqueta,
  fetchFlotasEtiquetasVehiculos,
  Flota,
  Vehiculo,
} from '@/pantallas/Recepcion/fetchFlotasEtiquetasVehiculos';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { makeTestId } from '@/reusable/Test/makeTestId';

enum TiposAsociacion {
  flota,
  etiqueta,
  vehiculo,
}

type Asociacion<T> = {
  todos: T[];
  seleccionados: T[];
};

// TODO reemplazar por evento 'input' y v-model
export type AsociarFlotaEtiquetaVehiculoChangeEvent = {
  flotas: Flota[];
  etiquetas: Etiqueta[];
  vehiculos: Vehiculo[];
};

@Component({
  components: { StepTitle, AsociarVehiculos, AsociarEtiquetas, AsociarFlotas },
})
export default class AsociarFlotaEtiquetaVehiculo extends Vue {
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: (): [] => [] }) flotasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) etiquetasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) vehiculosIdSeleccionar: number[];

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
  makeTestId = makeTestId(this);

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  emitChangeEvent() {
    const event: AsociarFlotaEtiquetaVehiculoChangeEvent = {
      flotas: this.flotas.seleccionados,
      etiquetas: this.etiquetas.seleccionados,
      vehiculos: this.vehiculos.seleccionados,
    };
    this.$emit('change', event);
  }

  /* event handlers */

  handleSelectedFlotasChange(flotas: Flota[]) {
    this.flotas.seleccionados = flotas;

    this.vehiculos.seleccionados = this.vehiculos.todos.filter(vehiculo =>
      flotas.find(x => x.id === vehiculo.flota.id)
    );
    this.etiquetas.seleccionados = uniqBy(
      this.vehiculos.seleccionados.flatMap(x => x.etiquetas),
      etiqueta => etiqueta.id
    );

    this.emitChangeEvent();
  }

  handleSelectedEtiquetasUserChange(event: SelectionChangeEventParams) {
    const { selected: etiquetas } = event;
    this.etiquetas.seleccionados = etiquetas;

    this.vehiculos.seleccionados = this.getVehiculosPorEtiquetas(
      etiquetas
    ).filter(vehiculo => {
      const { lastRowSelectionChanged } = event;

      if (
        vehiculo.etiquetas.find(
          etiqueta =>
            !!etiquetas.find(
              (etiquetaSeleccionada: Etiqueta) =>
                etiquetaSeleccionada.id === etiqueta.id
            )
        )
      ) {
        return true;
      }
      if (
        vehiculo.etiquetas.find(x => x.id === lastRowSelectionChanged.data.id)
      ) {
        return lastRowSelectionChanged.isSelected();
      }
      return true;
    });

    this.setFlotasSeleccionadas();
    this.emitChangeEvent();
  }

  handleSelectedEtiquetasChange(etiquetas: Etiqueta[]) {
    this.etiquetas.seleccionados = etiquetas;
    this.vehiculos.seleccionados = this.getVehiculosPorEtiquetas(etiquetas);
    this.setFlotasSeleccionadas();
  }

  getVehiculosPorEtiquetas(etiquetas: Etiqueta[]) {
    return [
      ...this.vehiculos.seleccionados,
      ...this.vehiculos.todos.filter(vehiculo =>
        vehiculo.etiquetas.find(
          etiquetaVehiculo =>
            !!etiquetas.find(
              (etiqueta: Etiqueta) => etiqueta.id === etiquetaVehiculo.id
            )
        )
      ),
    ];
  }

  handleSelectedVehiculosChange(vehiculos: Vehiculo[]) {
    this.vehiculos.seleccionados = vehiculos;

    const setEtiquetasSeleccionadas = () => {
      const etiquetasDeVehiculos: Etiqueta[] = uniqBy(
        this.vehiculos.seleccionados.flatMap(x => x.etiquetas),
        etiqueta => etiqueta.id
      );
      const vehiculoPerteneceEtiqueta = (etiqueta: Etiqueta) => (
        vehiculo: Vehiculo
      ) => !!vehiculo.etiquetas.find(x => x.id === etiqueta.id);

      this.etiquetas.seleccionados = etiquetasDeVehiculos.filter(etiqueta => {
        const perteneceEtiquetaActual = vehiculoPerteneceEtiqueta(etiqueta);
        return (
          differenceBy(
            this.vehiculos.todos.filter(perteneceEtiquetaActual),
            this.vehiculos.seleccionados.filter(perteneceEtiquetaActual),
            vehiculo => vehiculo.id
          ).length === 0
        );
      });
    };

    this.setFlotasSeleccionadas();
    setEtiquetasSeleccionadas();
    this.emitChangeEvent();
  }

  setFlotasSeleccionadas() {
    const flotasDeVehiculos: Flota[] = uniqBy(
      this.vehiculos.seleccionados.map(x => x.flota),
      flota => flota.id
    );
    const vehiculoPerteneceFlota = (flota: Flota) => (vehiculo: Vehiculo) =>
      vehiculo.flota.id === flota.id;

    this.flotas.seleccionados = flotasDeVehiculos.filter(flota => {
      const perteneceFlotaActual = vehiculoPerteneceFlota(flota);
      return (
        differenceBy(
          this.vehiculos.todos.filter(perteneceFlotaActual),
          this.vehiculos.seleccionados.filter(perteneceFlotaActual),
          vehiculo => vehiculo.id
        ).length === 0
      );
    });
  }

  /* lifecycle hooks */

  mounted() {
    this.cargarAsociaciones();
  }

  async cargarAsociaciones() {
    const asociaciones = await this.fetchFlotasEtiquetasVehiculos();
    if (!asociaciones) {
      return;
    }
    const { etiquetas, flotas, vehiculos } = asociaciones;
    this.flotas.todos = flotas;
    this.etiquetas.todos = etiquetas;
    this.vehiculos.todos = vehiculos;
  }

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

  @Watch('flotasIdSeleccionar')
  handleFlotasIdSeleccionarChange() {
    this.handleSelectedFlotasChange(
      uniqBy(
        [
          ...this.flotas.seleccionados,
          ...this.flotasIdSeleccionar.map(id =>
            this.flotas.todos.find(x => x.id === id)
          ),
        ],
        x => x.id
      )
    );
  }

  @Watch('etiquetasIdSeleccionar')
  handleEtiquetasIdSeleccionarChange() {
    this.handleSelectedEtiquetasChange(
      uniqBy(
        [
          ...this.etiquetas.seleccionados,
          ...this.etiquetasIdSeleccionar.map(id =>
            this.etiquetas.todos.find(x => x.id === id)
          ),
        ],
        x => x.id
      )
    );
  }

  @Watch('vehiculosIdSeleccionar')
  handleVehiculosIdSeleccionarChange() {
    this.handleSelectedVehiculosChange(
      uniqBy(
        [
          ...this.vehiculos.seleccionados,
          ...this.vehiculosIdSeleccionar.map(id =>
            this.vehiculos.todos.find(x => x.id === id)
          ),
        ],
        x => x.id
      )
    );
  }
}
</script>

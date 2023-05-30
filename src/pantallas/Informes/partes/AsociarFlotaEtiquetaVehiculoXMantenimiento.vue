<template>
  <div align="center">
    <v-flex md12>
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
              <AsociarFlotas
                v-show="tipoAsociacion === tiposAsociacion.flota"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :flotas="flotas.todos"
                :flotas-seleccionadas="flotas.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                @selectionChange="handleSelectedFlotasChange"
                :show="tipoAsociacion === tiposAsociacion.flota"
              />
            </div>
            <div align="left">
              <AsociarEtiquetas
                v-show="tipoAsociacion === tiposAsociacion.etiqueta"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :etiquetas="etiquetas.todos"
                :etiquetas-seleccionadas="etiquetas.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                @selectionChange="handleSelectedEtiquetasUserChange"
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
import AsociarFlotas from '../../../reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotas.vue';
import AsociarEtiquetas, {
  SelectionChangeEventParams,
} from '../../../reusable/AsociarFlotaEtiquetaVehiculo/AsociarEtiquetas.vue';
import AsociarVehiculos from '../../../reusable/AsociarFlotaEtiquetaVehiculo/AsociarVehiculos.vue';
import {
  Etiqueta,
  fetchFlotasEtiquetasVehiculos,
  Flota,
  Vehiculo,
} from '../../../reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { makeTestId } from '@/reusable/Test/makeTestId';
import { ColDef } from 'ag-grid-community';
import { fetchVFE } from './fetchVFEPlanMantenimiento';
import InformeEventBus from './InformeEventBus';
import { ServicioProxy } from '../../../config/enums';
import { AxiosVue } from '../../../AxiosVue';

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
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) esInforme: boolean;
  @Prop({ default: (): [] => [] }) flotasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) etiquetasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) vehiculosIdSeleccionar: number[];

  /* state */
  axios: AxiosVue = new AxiosVue(ServicioProxy.Mantenimiento);
  mantenimientoId: number[] = [];
  mantenimientos: any = {};
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
  asocArmadoMasivos: any = {
    vehiculos: [],
    etiquetas: [],
    flotas: [],
  };
  readonly colDefVehiculo: Array<ColDef> = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      suppressMovable: true,
    },
    {
      headerName: 'Tipo de Vehículo',
      field: 'tipoVehiculo',
    },
    {
      headerName: 'Marca',
      field: 'marca',
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
    },
    {
      headerName: 'Tipo de Combustible',
      field: 'tipoCombustible',
    },
    {
      headerName: 'Tipo de Transmisión',
      field: 'tipoTransmision',
    },
    {
      headerName: 'Año',
      field: 'ano',
    },
  ];

  /* template */

  tiposAsociacion = TiposAsociacion;
  tipoAsociacion = TiposAsociacion.flota;
  makeTestId = makeTestId(this);
  asocMasivos: any = [];

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
    InformeEventBus.$on(
      'selectionPlanesMantenimiento',
      async (planesMantenimientoSeleccionadas: any[]) => {
        this.mantenimientos = planesMantenimientoSeleccionadas;

        this.cargarAsociaciones();
      }
    );
  }

  async cargarAsociaciones() {
    this.mantenimientoId = [];
    this.mantenimientos.forEach((x: any) => {
      this.mantenimientoId.push(x.id);
    });
    this.asocMasivos = await this.fetchFlotasEtiquetasVehiculos();

    if (!this.asocMasivos) {
      return;
    }

    const { etiquetas, flotas, vehiculos } = this.asocMasivos;
    this.flotas.todos = flotas;
    this.etiquetas.todos = etiquetas;
    this.vehiculos.todos = vehiculos;

    this.handleFlotasIdSeleccionarChange();
    this.handleEtiquetasIdSeleccionarChange();
    this.handleVehiculosIdSeleccionarChange();
  }

  async fetchFlotasEtiquetasVehiculos() {
    this.loadingService.showLoading();
    return await fetchVFE(this.mantenimientoId)
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
          ...this.flotasIdSeleccionar
            .map(id => this.flotas.todos.find(x => x.id === id))
            .filter(x => x !== undefined),
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
          ...this.etiquetasIdSeleccionar
            .map(id => this.etiquetas.todos.find(x => x.id === id))
            .filter(x => x !== undefined),
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
          ...this.vehiculosIdSeleccionar
            .map(id => this.vehiculos.todos.find(x => x.id === id))
            .filter(x => x !== undefined),
        ],
        x => x.id
      )
    );
  }
}
</script>

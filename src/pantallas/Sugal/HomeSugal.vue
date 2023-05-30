<template>
  <div>
    <template v-if="homeTabsRendered">
      <app-home-tabs />
    </template>
    <v-divider></v-divider>

    <v-layout row wrap>
      <v-flex id="vicDiv" md4 sm4 xs12 style="padding: 0px;">
        <template>
          <template>
            <vehiculos-grid /> </template
        ></template>
      </v-flex>
      <v-flex>
        <template
          ><mapa
        /></template>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HomeTabs from '@/components/HomeTabs.vue';
import { Component } from 'vue-property-decorator';
import { filtroHomeEventBus } from '@/setup';
import VehiculosGridSugal from '@/pantallas/Inicio/VehiculosGrid/VehiculosGridSugal.vue';
import ActividadesGrid from '@/pantallas/Inicio/ActividadesGrid/ActividadesGrid.vue';
import Mapa from '@/pantallas/Inicio/Mapa/MapaSugal.vue';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import VerDetalleModalTab from '@/pantallas/Inicio/Mapa/VerDetalleModalTab.vue';
import { fetchPlantas } from './fetchPlantas';
import { fetchSitiosSugal } from './fetchSitiosSugal';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import HomeTabsSugal from '@/components/HomeTabsSugal.vue';

@Component({
  components: {
    'app-home-tabs': HomeTabsSugal,
    'vehiculos-grid': VehiculosGridSugal,
    mapa: Mapa,
    VerDetalleModalTab,
  },
})
export default class HomeSugal extends Vue {
  readonly funcionalidad: Funcionalidades = Funcionalidades.HomeSugal;
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar];

  toolTipText: string = 'Ocultar';
  showControls: boolean = true;
  icon: string = 'chevron_left';
  items: any[];
  model: any[];

  homeTabsRendered: boolean = false;
  homeGridRendered: boolean = false;
  showDetalleVehiculo = false;
  detalleVehiculoHomeRendered = false;
  vehiculoSeleccionadoUnidad: string = '';
  plantas: object = null;
  sitios: object = null;

  renderHomeTabs(render: boolean) {
    this.homeTabsRendered = render;
  }

  renderHomeGrid(render: boolean) {
    this.homeGridRendered = render;
  }

  constructor() {
    super();

    filtroHomeEventBus.$on('renderedHomeTabs', (render: boolean) =>
      this.renderHomeTabs(render)
    );
    filtroHomeEventBus.$on('renderHomeGrid', (render: boolean) =>
      this.renderHomeGrid(render)
    );
  }

  mounted() {
    filtroHomeEventBus.$emit('restaurarEstadoHome');
    this.plantas = fetchPlantas();
    this.sitios = fetchSitiosSugal();
  }

  // handleCerrarDetalleVehiculo() {
  //   this.setVisibilidadModalDetalleVehiculo(false);
  // }

  handleCerrarVerDetalle() {
    this.detalleVehiculoHomeRendered = false;
  }

  // setVisibilidadModalDetalleVehiculo(visible: boolean) {
  //   this.showDetalleVehiculo = visible;
  //   document.getElementsByTagName('html')[0].style.overflow = visible
  //     ? 'hidden'
  //     : 'auto';
  // }
}
</script>

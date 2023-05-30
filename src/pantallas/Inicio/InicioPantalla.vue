<template>
  <div>
    <template v-if="homeTabsRendered">
      <app-home-tabs v-show="!detalleVehiculoHomeRendered" />
    </template>
    <v-divider></v-divider>

    <v-layout row wrap>
      <v-flex
        id="vicDiv2"
        :class="`${showControls ? 'md8 sm8' : 'md12 sm12'} xs12`"
        style="padding: 0px"
      >
        <v-fab-transition
          style="top: 25px"
          v-show="!detalleVehiculoHomeRendered"
        >
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              style="top: 25px"
              color="indigo"
              flat
              icon
              small
              absolute
              top
              left
              @click="
                showControls = !showControls;
                showControls
                  ? (icon = 'chevron_left')
                  : (icon = 'chevron_right');
                showControls
                  ? (toolTipText = 'Ocultar')
                  : (toolTipText = 'Mostrar');
              "
            >
              <v-icon>{{ icon }}</v-icon>
            </v-btn>
            <span>{{ toolTipText }}</span>
          </v-tooltip>
        </v-fab-transition>
      </v-flex>
    </v-layout>
    <div class="splitter">
      <div
        id="first"
        v-show="showControls"
        :class="showControls ? 'animated fadeIn fast' : 'animated fadeOut fast'"
      >
        <vehiculos-grid />
        <actividades-grid />
      </div>
      <div
        id="separator"
        v-show="showControls"
        :class="showControls ? 'animated fadeIn fast' : 'animated fadeOut fast'"
      >
        <div class="btn_left">
          <v-icon color="#7D8493" @click="closeFirstDiv()">chevron_left</v-icon>
        </div>
        <div class="btn_right">
          <v-icon color="#7D8493" @click="fullFirstDiv()">chevron_right</v-icon>
        </div>
      </div>
      <div id="second" style="background-color: #bbb">
        <mapa />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HomeTabs from '@/components/HomeTabs.vue';
import { Component, Watch } from 'vue-property-decorator';
import { filtroHomeEventBus } from '@/setup';
import VehiculosGrid from '@/pantallas/Inicio/VehiculosGrid/VehiculosGrid.vue';
import ActividadesGrid from '@/pantallas/Inicio/ActividadesGrid/ActividadesGrid.vue';
import Mapa from '@/pantallas/Inicio/Mapa/Mapa.vue';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import VerDetalleModalTab from '@/pantallas/Inicio/Mapa/VerDetalleModalTab.vue';
import { Vehiculo } from './VehiculosData/fetchVehiculos';
import { Actividad } from './ActividadesData/fetchActividades';

@Component({
  components: {
    'app-home-tabs': HomeTabs,
    'vehiculos-grid': VehiculosGrid,
    'actividades-grid': ActividadesGrid,
    mapa: Mapa,
    VerDetalleModalTab,
  },
})
export default class InicioPantalla extends Vue {
  toolTipText: string = 'Ocultar';
  showControls: boolean = true;
  icon: string = 'chevron_left';

  homeTabsRendered: boolean = false;
  homeGridRendered: boolean = false;
  showDetalleVehiculo = false;
  detalleVehiculoHomeRendered = false;
  vehiculoSeleccionadoUnidad: string = '';

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

  @Watch('showControls')
  onChangeShow() {
    document.getElementById('second').style.width = '100%';
  }

  mounted() {
    filtroHomeEventBus.$emit('restaurarEstadoHome');
    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);
    this.dragElement(document.getElementById('separator'), 'H');
  }

  handleAbrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    this.detalleVehiculoHomeRendered = show;
    this.showControls = !show;
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

  dragElement(element: any, direction: any) {
    let md: any = {}; // remember mouse down info
    const first = document.getElementById('first');
    const second = document.getElementById('second');

    element.onmousedown = onMouseDown;

    function onMouseDown(e: any) {
      //console.log("mouse down: " + e.clientX);
      md = {
        e,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        firstWidth: first.offsetWidth,
        secondWidth: second.offsetWidth,
      };

      document.onmousemove = onMouseMove;
      document.onmouseup = () => {
        //console.log("mouse up");
        document.onmousemove = document.onmouseup = null;
      };
    }

    function onMouseMove(e: any) {
      //console.log("mouse move: " + e.clientX);
      var delta = { x: e.clientX - md.e.clientX, y: e.clientY - md.e.clientY };

      if (direction === 'H') {
        // Horizontal
        // Prevent negative-sized elements
        delta.x = Math.min(Math.max(delta.x, -md.firstWidth), md.secondWidth);

        element.style.left = md.offsetLeft + delta.x + 'px';
        first.style.width = md.firstWidth + delta.x + 'px';
        second.style.width = md.secondWidth - delta.x + 'px';
      }
    }
  }

  fullFirstDiv() {
    document.getElementById('first').style.width = '99%';
    document.getElementById('second').style.width = '0px';
  }

  closeFirstDiv() {
    var isMobile = '';
    if (navigator.userAgent.toLowerCase().match(/mobile/i) != null) {
      isMobile = 'mobile';
    }

    if (isMobile == 'mobile') {
      document.getElementById('first').style.minWidth = '0px';
      document.getElementById('first').style.width = '10px';
      document.getElementById('second').style.width = '100%';
    } else {
      document.getElementById('first').style.width = '30px';
      document.getElementById('second').style.width = '100%';
    }
  }
}
</script>
<style scoped>
.splitter {
  width: 100%;
  height: 1142px;
  display: flex;
}
#separator {
  cursor: col-resize;
  background-image: url('~@/assets/puntos.svg');
  background-color: #f1f4f5;
  background-repeat: no-repeat;
  background-position: 50%;
  background-position-y: 41%;
  width: 20px;
  min-width: 20px;
  height: 100%;
  border-left: solid 1px #ccd1d3;
  border-right: solid 1px #ccd1d3;

  /* Prevent the browser's built-in drag from interfering */
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#first {
  width: 30%;
  transition: 0.5s;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-x: hidden;
  transition: 0.5s;
  min-width: 250px;
}
.btn_left {
  margin: 0;
  position: absolute;
  top: 47%;
  margin-left: -5px;
  cursor: pointer;
}

#second {
  width: 70%;
  height: 1024px;
}

.btn_right {
  margin: 0;
  position: absolute;
  top: 41%;
  margin-left: -5px;
  cursor: pointer;
}
</style>

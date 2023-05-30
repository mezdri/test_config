<template>
  <v-card light>
    <v-carousel
      height="620"
      :cycle="false"
      :show-arrows="true"
      @change="e => onEvent(e)"
      dark
    >
      <v-carousel-item v-for="(item, i) in elementos" :key="i"
        ><div class="title">
          <h2 style="margin: 0;">
            Flota: {{ item.__nom_flota }} ({{ cantidadVehiculos }})
          </h2>
        </div>
        <FlotasMap
          :flota="flotaActual"
          :loadData="item.cod_flota === flotaActual"
          v-if="item.cod_flota === flotaActual"
        />
      </v-carousel-item>
      <!--      <div class="v-carousel__controls">
        <div class="v-item-group">
          <v-btn v-for="(item, i) in elementos" :key="i"
              :class="'v-btn&#45;&#45;icon v-btn&#45;&#45;small v-carousel__controls__item' + item.cod_flota === flotaActual ? 'v-btn&#45;&#45;active' : ''"
          >
            <div class="v-btn__content">
              <v-icon style="font-size: 18px;">fiber_manual_record</v-icon>
            </div>
          </v-btn>
        </div>
      </div>-->
    </v-carousel>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import FlotasMap from '@/pantallas/TorreControl/ControlFlotas/FlotasMap.vue';
import { LoadingService } from '@/services/loadingService';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';

@Component({
  name: 'FlotasCarousel',
  components: {
    FlotasMap,
  },
})
export default class FlotasCarousel extends Vue {
  @Prop({ default: true }) show!: boolean;
  @Prop({ default: [] }) elementos!: any;
  loadingService = new LoadingService();
  flotaActual: number = 0;
  cantidadVehiculos: number = 0;

  beforeDestroy() {
    this.elementos = [];
    TorreControlInstance.$off('showCount');
  }

  mounted() {
    TorreControlInstance.$on('showCount', (cantidad: number) => {
      this.cantidadVehiculos = cantidad;
    });
  }

  onEvent(e: any) {
    this.flotaActual = this.elementos[e].cod_flota;
    this.cantidadVehiculos = 0;
    TorreControlInstance.$emit('changeSlide');
  }
}
</script>

<style>
button.v-btn.v-btn--icon.theme--dark {
  color: #030809 !important;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-carousel__prev .v-btn:hover,
.v-carousel__next .v-btn:hover {
  background: grey;
}
</style>

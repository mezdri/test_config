<template>
  <div>
    <v-progress-linear
      indeterminate
      color="primary"
      v-show="!showGrafico"
    ></v-progress-linear>
    <div v-show="showGrafico">
      <v-container grid-list-md>
        <div id="mapContainer"></div>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MarkerClusterer from '@google/markerclustererplus';

@Component({
  components: {},
})
export default class GraficoBarra extends Vue {
  @Prop({ default: [] }) dataInicial!: any;
  showGrafico: boolean = false;
  map: google.maps.Map;
  infoWindow = new google.maps.InfoWindow({
    content: '',
    disableAutoPan: true,
  });
  locations: any = [];
  labels: any = [];

  mounted() {
    const m1 = require('@/assets/cluster_imagenes/1.png');
    const m2 = require('@/assets/cluster_imagenes/2.png');
    const m3 = require('@/assets/cluster_imagenes/3.png');
    const m4 = require('@/assets/cluster_imagenes/4.png');
    const m5 = require('@/assets/cluster_imagenes/5.png');
    const self = this;
    if (this.dataInicial) {
      this.getLocation(this.dataInicial.data);

      this.showGrafico = true;
    }
    let iconourl =
      'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
    let icon = {
      url: iconourl,
      scaledSize: new google.maps.Size(32, 51),
    };
    this.map = new google.maps.Map(document.getElementById('mapContainer'), {
      center: { lat: -33.4372, lng: -70.6506 },
      disableDefaultUI: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      gestureHandling: 'greedy',
      mapTypeControl: false,
      maxZoom: 20,
      minZoom: 2,
      zoom: 3,
    });
    const markers = this.locations.map((position: any, i: number) => {
      const label = this.labels[i].toString();
      const marker = new google.maps.Marker({
        position: position,
        icon: icon,
      });
      marker.addListener('click', () => {
        this.infoWindow.open(this.map, marker);
        this.infoWindow.setContent(label);
      });
      return marker;
    });
    let mapa = this.map;
    const cluster_styles: any[] = [
      {
        width: 53,
        height: 52,
        url: m1,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 56,
        height: 55,
        url: m2,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 66,
        height: 65,
        url: m3,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 78,
        height: 77,
        url: m4,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 90,
        height: 89,
        url: m5,
        textColor: 'black',
        textSize: 11,
      },
    ];
    new MarkerClusterer(mapa, markers, {
      styles: cluster_styles,
      maxZoom: 17,
    });
  }
  getLocation(data: any) {
    data.map((auto: any) => {
      let location = { lat: Number(auto.latitud), lng: Number(auto.longitud) };
      this.locations = [...this.locations, location];
      this.labels = [
        ...this.labels,
        'Patente: ' +
          auto.patente.toString() +
          '\n Ultima conexion: ' +
          auto.last_activity.toString(),
      ];
    });
  }
}
</script>
<style scoped>
#mapContainer {
  width: 100%;
  height: 424px;
}
.google-map {
  width: 100%;
  height: 110vh;
  margin: 0 auto;
  background: gray;
}
</style>

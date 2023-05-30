<template>
  <div>
    <v-card id="vCardDialogVideo" shaped outlined v-if="showLocation">
      <div id="headerDialogVideo">
        <div style="margin-left: 2%">
          <h2 class="textstyle">Última Ubicación</h2>
        </div>
      </div>
      <div id="bodyDialogVideo">
        <div class="google-map" :id="mapName"></div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { MSResponse } from '@/interfaces/MS';
import { AxiosResponse } from 'axios';
import { DispositivosService } from '@/pantallas/TorreControl/ControlDispositivos/dispositivosService';
import { LoadingService } from '@/services/loadingService';
import { ControlVehiculoInfo } from '@/pantallas/TorreControl/ControlDispositivos/controlDispositivosInterface';
import { watch } from 'fs';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';

@Component({
  components: {},
})
export default class LastLocation extends Vue {
  @Prop() patente: any;
  loadingService = new LoadingService();
  dispositivosService = new DispositivosService();
  isLoading: boolean = false;
  map: google.maps.Map = null;
  mapName: string = 'last-location-map';
  lastPatente: string = '';
  dataLocation: any = null;
  showLocation: boolean = false;
  clientId: string;
  $snotify: any;

  mounted() {
    this.isLoading = true;
    this.loadingService.showLoading();
    this.clientId = localStorage.getItem('clienteDefecto');
    TorreControlInstance.$off('reloadLocation');
    TorreControlInstance.$on('reloadLocation', () => {
      if (this.lastPatente == this.patente) {
        this.getDataLocation().finally(() => {
          if ('CODIGO_RESPUESTA' in this.dataLocation)
            this.renderMap(this.dataLocation);
        });
      }
    });
    if (this.patente != '') {
      this.getDataLocation().finally(() => {
        if ('CODIGO_RESPUESTA' in this.dataLocation)
          this.renderMap(this.dataLocation);
      });
    }
    this.isLoading = false;
    this.loadingService.hideLoading();
  }
  @Watch('patente')
  watchPatente() {
    this.getDataLocation().finally(() => {
      if ('CODIGO_RESPUESTA' in this.dataLocation)
        this.renderMap(this.dataLocation);
      this.lastPatente = this.patente;
    });
  }

  async getDataLocation() {
    const axiosResponse: AxiosResponse<
      MSResponse<ControlVehiculoInfo>
    > = await this.dispositivosService.getLastLocation(
      this.clientId,
      this.patente
    );
    this.isLoading = false;
    const msResponse: MSResponse<ControlVehiculoInfo> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.dataLocation = msResponse;
      this.showLocation = true;
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.dataLocation = [];
      this.showLocation = false;
    }
  }

  renderMap(data: any) {
    // var lat = -33.505315;
    var lat = data.lat;
    // var lon: number = -70.657807;
    var lon: number = data.lon;
    var date_act = data.fecha;
    // var date_act = '2023-03-26 19:26:42';

    var myLatlng = new google.maps.LatLng(lat, lon);

    var mapOptions: any = {
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: myLatlng,
      mapTypeControl: false,
      streetViewControl: true,
      gestureHandling: 'greedy',
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      minZoom: 2,
      maxZoom: 20,
    };
    const infowindow = new google.maps.InfoWindow({
      content: this.generateHtml(`${lat}, ${lon}`, date_act),
    });

    const map = new google.maps.Map(
      document.getElementById(this.mapName),
      mapOptions
    );

    const marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        labelOrigin: new google.maps.Point(75, 32),
        size: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32),
      },
      label: {
        text: 'Posición',
        color: '#C70E20',
        fontWeight: 'bold',
      },
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
      // window.open(`https://maps.google.com/?q=${lat},${lon}`);
    });

    // this.infoWindow.open(this.map, marker);

    const mapContainer = document.getElementById(this.mapName);

    mapContainer.addEventListener('mousemove', this.updateMouseCoordinates, {
      passive: true,
    });
  }

  generateHtml(coords: string, date: string): string {
    var html: string = '';

    html =
      '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">Última Actividad</h1>' +
      '<div id="bodyContent">' +
      '<p></p>' +
      `<p><b style="font-weight: 700;">Fecha: </b> ${date}</p>` +
      `<p><b style="font-weight: 700;">Coordenadas: </b> ${coords}</p>` +
      '</div>' +
      '</div>';

    return html;
  }

  updateMouseCoordinates(event: MouseEvent) {
    const point2LatLng = (point: google.maps.Point) => {
      const { map } = this;
      const topRight = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getNorthEast());
      const bottomLeft = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getSouthWest());
      const scale = Math.pow(2, map.getZoom());
      const worldPoint = new google.maps.Point(
        point.x / scale + bottomLeft.x,
        point.y / scale + topRight.y
      );
      return map.getProjection().fromPointToLatLng(worldPoint);
    };
  }
}
</script>

<style scoped>
#vCardDialogVideo {
  height: 80vh;
  width: 100%;
}
#headerDialogVideo {
  display: flex;
  align-items: center;
  height: 10%;
  background: #27488e;
}
h2.textstyle {
  color: white;
  font-family: 'Asap', sans-serif !important;
  font-weight: normal;
}
.google-map {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: gray;
}

#bodyDialogVideo {
  /* display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; */
  height: 90%;
  width: 100%;
}
</style>

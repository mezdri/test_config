<template>
  <div>
    <v-dialog
      v-model="openDialog"
      max-width="1200"
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card id="vCardDialogVideo" shaped outlined>
        <div id="headerDialogVideo">
          <div style="margin-left: 2%">
            <h2 class="textstyle">Ver Coordenadas</h2>
          </div>
          <div style="margin-left: auto; margin-right: 1%;">
            <v-btn icon dark @click="closeDialog">
              <v-icon>close</v-icon>
            </v-btn>
          </div>
        </div>
        <div id="bodyDialogVideo">
          <div class="google-map" :id="mapName"></div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';

@Component({
  components: {},
})
export default class MapComponent extends Vue {
  @Prop({ default: false }) openDialog: boolean;
  @Prop() event: any;
  mapName: string = 'alerta-cam-map';
  map: google.maps.Map = null;

  @Watch('openDialog')
  onDialogChanged() {
    this.renderMap(this.event);
  }

  renderMap(data: any) {
    var lat = data.latitud;
    var lon: number = data.longitud;
    var date_act = data.fecha;

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
      window.open(`https://maps.google.com/?q=${lat},${lon}`);
    });

    // this.infoWindow.open(this.map, marker);

    const mapContainer = document.getElementById(this.mapName);

    mapContainer.addEventListener('mousemove', this.updateMouseCoordinates, {
      passive: true,
    });
  }

  closeDialog() {
    CamaraEventBus.$emit('closeMap');
    this.$emit('closeMap');
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

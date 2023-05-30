<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle Taller" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <TallerForm
        @change="handleFormChange"
        :tallerSeleccionado="tallerSeleccionado"
        :editarTaller="false"
        :verTaller="true"
      />
      <div align="center">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-container grid-list-md>
              <div id="mapContainer"></div>
            </v-container>
          </v-card>
        </v-flex>
      </div>
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { editarTaller } from '@/pantallas/Taller/editarTaller';
import { LoadingService } from '@/services/loadingService';
import { Taller } from './Taller';
import { Snotify } from '@/snotify/Snotify';
import TallerForm from '@/pantallas/Taller/TallerForm.vue';
import { Validator } from 'vee-validate/types/vee-validate';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { Zona } from '../Inicio/Mapa/VariblesMapa';

const markerClustererMaxZoom = 17;

type FormState = {
  entity: Taller;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModal,
    TallerForm,
    ModalMantenedor,
    GuardarButton,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class VerTallerModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) tallerSeleccionado: Taller;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Información General',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  zona: Zona = {
    drawingManager: null,
    mapType: 'roadmap',
    zoom: '',
    controllerTipoLugar: 'tipoLugar',
    controllerCoordenada: 'coordenada',
    controllerGpsCoordenada: 'GpsCoordenada',
    capasDeInformacion: [],
    capasSeleccionadas: [],
    lugares: [],
    selectedCapas: [],
    tipoMapa: [],
    selected: [],
    menu: false,
    drawingToolBar: false,
    showCrearZona: false,
    showEditarZona: false,
    modalEsEdicion: true,
    editedItem: {},
    axios: new AxiosVue(ServicioProxy.Gps),
    enabledBtnContinue: false,
    tipoGeometriaModal: 0,
    strCoordsModal: '',
    dialogErrorAsoc: false,
    editedName: '',
    dialogEliminar: false,
    editedIndex: -1,
    editedCapaId: -1,
    titleEliminarItem: '',
    mensajeConfirmacionIndividual: '',
    mensajeExitoEliminacion: '',
    mensajeErrorEliminacion: '',
    autocompleteText: '',
    marcadorBuscador: null,
    overlay: null,
    overlaybkp: null,
    hidden: false,
    markerZona: [],
    circles: [],
    polylines: [],
    infoWindowsZonas: [],
    mapEventListenerList: [],
    loadMapaTs: false, //Carga de Mapa
    windowHeight: 0,
    cantidadVehiculosAsociados: 0,
    directionsService: new google.maps.DirectionsService(),
    directionsDisplayContinua: new google.maps.DirectionsRenderer(),
    walkingLineSymbol: {},
    directionsDisplayDiscontinua: new google.maps.DirectionsRenderer(),
    directionsDisplayArray: [],
    directionsDisplayDiscontinuaArray: [],
  };

  form: FormState = {
    entity: null,
    validator: null,
  };

  //Variables Mapa
  map: google.maps.Map;

  mounted() {
    //Mapa

    this.map = new google.maps.Map(document.getElementById('mapContainer'), {
      center: { lat: -33.4372, lng: -70.6506 },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      gestureHandling: 'greedy',
      mapTypeControl: false,
      maxZoom: 20,
      minZoom: 2,
      zoom: 12,
    });

    var input = document.getElementById('searchInputHome');
    input.setAttribute('placeholder', '');

    this.seteaMapa();
  }

  setMarket(places: google.maps.places.PlaceResult[]) {
    this.map.setCenter(places[0].geometry.location);
    let iconourl =
      'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
    let icon = {
      url: iconourl,
      scaledSize: new google.maps.Size(32, 51),
    };
    var marker = new google.maps.Marker({
      map: this.map,
      position: places[0].geometry.location,
      icon: icon,
    });

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(places[0].geometry.location);
    this.map.fitBounds(bounds);
    this.map.setZoom(markerClustererMaxZoom + 1);
  }

  seteaMapa() {
    if (this.tallerSeleccionado.latitud) {
      let iconourl =
        'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
      let icon = {
        url: iconourl,
        scaledSize: new google.maps.Size(32, 51),
      };
      var marker = new google.maps.Marker({
        map: this.map,
        position: {
          lat: this.tallerSeleccionado.latitud,
          lng: this.tallerSeleccionado.longitud,
        },
        icon: icon,
      });

      this.map.setZoom(markerClustererMaxZoom + 1);
      if (this.zona.marcadorBuscador != null) {
        this.zona.marcadorBuscador.setMap(null);
      }
      this.zona.marcadorBuscador = marker;
      var bounds = new google.maps.LatLngBounds();
      bounds.extend({
        lat: this.tallerSeleccionado.latitud,
        lng: this.tallerSeleccionado.longitud,
      });
      this.map.fitBounds(bounds);
      this.map.setZoom(markerClustererMaxZoom + 1);
    }
  }
  /* event handlers */
  handleCerrar() {
    this.$emit('cerrar');
  }
  handleFormChange(event: FormChangeEvent) {
    this.form = event;
  }
}
</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: 500px;
}

.google-map {
  width: 100%;
  height: 110vh;
  margin: 0 auto;
  background: gray;
}
</style>

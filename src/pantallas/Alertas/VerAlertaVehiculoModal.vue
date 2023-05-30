<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle Alerta" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <ConfigurarAlertaForm
        :lstAlertasBase="lstAlertasBase"
        :alertaSeleccionada="alertaConfig"
        :modoVer="true"
        :modoAlertaVehiculo="true"
        :tituloModal="'Parametros Configurados'"
        v-show="pasoActivoIndex === pasos.configurarAlerta.step"
      />
      <ValoresObtenidosForm
        :lstAlertasBase="lstAlertasBase"
        :alertaVehiculo="alertaVehiculo"
        v-show="pasoActivoIndex === pasos.configurarAlerta.step"
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
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';

import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import ConfigurarAlertaForm from '@/pantallas/Alertas/ConfigurarAlertaForm.vue';
import ValoresObtenidosForm from '@/pantallas/Alertas/ValoresObtenidosForm.vue';

import { AlertaBackend, AlertaVehiculo } from '@/interfaces/Alertas';
import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';

import { ServicioProxy } from '@/config/enums';
import { Zona } from '../Inicio/Mapa/VariblesMapa';
import { AxiosVue } from '@/AxiosVue';
const markerClustererMaxZoom = 17;

@Component({
  components: {
    ModalMantenedor,
    CabeceraModal,
    CrudStepsNavBar,
    ContenidoModal,
    ConfigurarAlertaForm,
    ValoresObtenidosForm,
  },
})
export default class VerAlertaVehiculoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];
  @Prop({ required: true }) alertaConfig: AlertaBackend;
  @Prop({ required: true }) alertaVehiculo: AlertaVehiculo;

  pasoActivoIndex: number = 1;
  readonly pasos: PasosCrud = {
    configurarAlerta: {
      accion: 'Ver - Configurar Alerta',
      visible: true,
      step: 1,
      title: 'Alerta',
      icon: 'info',
    },
  };

  //Variables Mapa
  map: google.maps.Map;

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
  direccion: string = '';
  direccionAutoCompleteGoogle: string = '';
  latitud: number;
  longitud: number;

  constructor() {
    super();
  }

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

    this.seteaMapa();
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$emit('cerrar');
  }

  seteaMapa() {
    if (this.alertaVehiculo.latitudInicioExceso) {
      let iconourl =
        'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
      let icon = {
        url: iconourl,
        scaledSize: new google.maps.Size(32, 51),
      };
      var marker = new google.maps.Marker({
        map: this.map,
        position: {
          lat: this.alertaVehiculo.latitudInicioExceso,
          lng: this.alertaVehiculo.longitudInicioExceso,
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
        lat: this.alertaVehiculo.latitudInicioExceso,
        lng: this.alertaVehiculo.longitudInicioExceso,
      });
      this.map.fitBounds(bounds);
      this.map.setZoom(markerClustererMaxZoom + 1);
    }

    this.latitud = this.alertaVehiculo.latitudInicioExceso;
    this.longitud = this.alertaVehiculo.longitudInicioExceso;
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

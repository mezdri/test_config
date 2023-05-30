<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Taller"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Taller'"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <TallerForm
        @change="handleFormChange"
        @handleFormFieldDireccion="handleFormFieldDireccion"
        :tallerSeleccionado="tallerSeleccionado"
        :editarTaller="true"
        :verTaller="false"
        :direccionAutoCompleteGoogle="direccionAutoCompleteGoogle"
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
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
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import { Zona } from '../Inicio/Mapa/VariblesMapa';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
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
    Confirmation,
    CabeceraModalEditar,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class EditarTallerModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) tallerSeleccionado: Taller;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  modificable: boolean = true;
  estadoEntidad: boolean = true;

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

  form: FormState = {
    entity: null,
    validator: null,
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
    var searchBox: google.maps.places.SearchBox = new google.maps.places.SearchBox(
      input as HTMLInputElement
    );

    document.getElementById('btnSearchHome').onclick = () => {
      google.maps.event.trigger(input, 'focus', {});
      google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
      google.maps.event.trigger(this, 'focus', {});
    };

    document.getElementById('btnGuardar').onclick = () => {
      google.maps.event.trigger(input, 'focus', {});
      google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
      google.maps.event.trigger(this, 'focus', {});
    };

    //Autocomplete de Google Maps
    input.addEventListener('keypress', this.onBuscarKeyPress);
    input.addEventListener('keyup', this.onBuscarKeyUp);
    input.addEventListener('keyup', this.onBuscarKeyUp);
    input.setAttribute('placeholder', '');

    this.zona.mapEventListenerList.push(
      this.map.addListener('bounds_changed', () => {
        searchBox.setBounds(this.map.getBounds());
      })
    );

    this.zona.mapEventListenerList.push(
      searchBox.addListener('places_changed', () => {
        var places: google.maps.places.PlaceResult[] = searchBox.getPlaces();

        if (places.length == 0) {
          if (this.zona.marcadorBuscador != null) {
            this.zona.marcadorBuscador.setMap(null);
          }
          this.$snotify.warning(
            'No se han encontrado resultados para la búsqueda'
          );
          this.latitud = 0;
          this.longitud = 0;
          return;
        } else {
          this.setMarket(places[0]);
        }
      })
    );

    this.seteaMapa();
  }

  setMarket(place: google.maps.places.PlaceResult) {
    this.zona.autocompleteText = place.formatted_address;

    this.map.setCenter(place.geometry.location);
    let iconourl =
      'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
    let icon = {
      url: iconourl,
      scaledSize: new google.maps.Size(32, 51),
    };
    var marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      icon: icon,
    });

    if (this.zona.marcadorBuscador != null) {
      this.zona.marcadorBuscador.setMap(null);
    }

    this.zona.marcadorBuscador = marker;
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(place.geometry.location);
    this.map.fitBounds(bounds);
    this.map.setZoom(markerClustererMaxZoom + 1);

    this.direccion = place.formatted_address;
    this.direccionAutoCompleteGoogle = place.formatted_address;
    this.latitud = place.geometry.location.lat();
    this.longitud = place.geometry.location.lng();
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

    this.direccion = this.tallerSeleccionado.direccion;
    this.latitud = this.tallerSeleccionado.latitud;
    this.longitud = this.tallerSeleccionado.longitud;
  }

  private onBuscarKeyPress() {
    let listObjPacContainer: any = document.getElementsByClassName(
      'pac-container'
    );

    for (let item of listObjPacContainer) {
      item.style.zIndex = '1015004';
    }
  }

  private onBuscarKeyUp() {
    if (this.direccion == '') {
      if (this.zona.marcadorBuscador != null) {
        this.zona.marcadorBuscador.setMap(null);
        this.latitud = 0;
        this.longitud = 0;
      }
    }
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInactivo() {}

  async handleGuardar() {
    const {
      rut,
      nombre,
      descripcion,
      giro,
      estado,
    } = this.pasos.informacionGeneral.formState.entity;

    var tallerEditar: Taller = {
      rut,
      nombre,
      descripcion,
      giro,
      estado,
      id: this.tallerSeleccionado.id,
      clienteId: config.getClienteSesion(),
      direccion: this.direccion,
      latitud: this.direccion === '' ? 0 : this.latitud,
      longitud: this.direccion === '' ? 0 : this.longitud,
    };

    //this.loadingService.showLoading();
    return await editarTaller(tallerEditar)
      .then(() => {
        this.$snotify.success(
          'Los cambios han sido guardados de forma exitosa',
          { timeout: 3000 }
        );
        this.handleCerrar();
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar editar taller: ${tallerEditar.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        //this.loadingService.hideLoading();
      });
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;

    if (
      this.tallerSeleccionado.totalAsociados > 0 &&
      this.pasos.informacionGeneral.formState.entity.estado == 0
    ) {
      this.modificable = false;
    } else {
      this.modificable = true;
    }
    if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
      this.estadoEntidad = false;
    } else {
      this.estadoEntidad = true;
    }
  }

  handleFormFieldDireccion(direccion: string) {
    this.direccion = direccion;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
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

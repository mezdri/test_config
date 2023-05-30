<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Crear Taller'" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <TallerForm
            @change="handleFormChange"
            @handleFormFieldDireccion="handleFormFieldDireccion"
            :editarTaller="false"
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
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Taller',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { crearTaller } from '@/pantallas/Taller/crearTaller';
import { LoadingService } from '@/services/loadingService';
import { Taller } from './Taller';
import { Snotify } from '@/snotify/Snotify';
import TallerForm from '@/pantallas/Taller/TallerForm.vue';
import { Validator } from 'vee-validate/types/vee-validate';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { Zona } from '../Inicio/Mapa/VariblesMapa';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';

const markerClustererMaxZoom = 17;

type CrearPautaActividadFormState = {
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
    CabeceraModalCrear,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
  },
})
export default class CrearTallerModal extends Vue {
  @Prop({ default: true }) show: boolean;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';

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

  form: CrearPautaActividadFormState = {
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
          this.zona.autocompleteText = places[0].formatted_address;
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

          if (this.zona.marcadorBuscador != null) {
            this.zona.marcadorBuscador.setMap(null);
          }

          this.zona.marcadorBuscador = marker;
          var bounds = new google.maps.LatLngBounds();
          bounds.extend(places[0].geometry.location);
          this.map.fitBounds(bounds);
          this.map.setZoom(markerClustererMaxZoom + 1);
          this.direccion = places[0].formatted_address;
          this.direccionAutoCompleteGoogle = places[0].formatted_address;
          this.latitud = places[0].geometry.location.lat();
          this.longitud = places[0].geometry.location.lng();
        }
      })
    );
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
      }
    }
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();

    if (isValid) {
      if (this.pasos.informacionGeneral.formState.entity.estado == 1) {
        this.mensajeConfirmacionInactivo = this.$t(
          'mensajes.crud.crear.mensaje',
          { entidad: 'el Taller' }
        );
      } else {
        this.mensajeConfirmacionInactivo =
          this.$t('mensajes.crud.inactivo.mensaje') +
          ' ' +
          this.$t('mensajes.crud.crear.mensaje', {
            entidad: 'el Taller',
          });
      }
      this.dialogConfirmacionGuardar = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;
    const {
      rut,
      nombre,
      descripcion,
      giro,
      estado,
    } = this.pasos.informacionGeneral.formState.entity;

    if (isConfirm) {
      var tallerCrear: Taller = {
        rut,
        nombre,
        descripcion,
        giro,
        estado,
        clienteId: config.getClienteSesion(),
        direccion: this.direccion,
        latitud: this.direccion === '' ? 0 : this.latitud,
        longitud: this.direccion === '' ? 0 : this.longitud,
      };

      this.loadingService.showLoading();
      return crearTaller(tallerCrear)
        .then(() => {
          this.$snotify.success('Taller ha sido creado de forma exitosa', {
            timeout: 3000,
          });
          this.handleCerrar();
        })
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar crear el Taller: ${tallerCrear.nombre}`,
            { timeout: 3000 }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
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

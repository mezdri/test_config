<template>
  <div id="prisadasd" style="width: 100%; height: 100%">
    <div
      id="divDialog"
      class="dialogLoadingClass"
      v-show="showLoadingZones"
      :style="changeToggleControls"
    >
      <div style="width: 30%" class="contentDialogLoading">
        <v-img
          contain
          class="imageLoadingClass"
          :src="require('../../../assets/loadingGif.gif')"
          alt="Loading"
        ></v-img>
      </div>
      <div class="contentDialogLoadingText" style="width: 70%">
        {{ labelLoadingZones }}
      </div>
    </div>
    <div id="mapContainer"></div>

    <!-- INICIO 9 MENU PUNTOS -->
    <div align="right" class="text-xs-center" id="xxxHome">
      <v-snackbar
        v-model="snackbar"
        color="primary"
        :timeout="timeout"
        :bottom="'bottom'"
        >{{ snackbarMessage }}</v-snackbar
      >

      <v-menu
        v-model="zona.menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
        left
      >
        <v-btn style="min-width: 10px" slot="activator" color="default" small>
          <v-icon>apps</v-icon>
        </v-btn>

        <v-card>
          <v-card-actions>
            <v-layout wrap align-center>
              <v-flex md6 sm6 xs12 d-flex>
                <v-autocomplete
                  class="tst"
                  style="font-size: 11px"
                  v-model="zona.selectedCapas"
                  :items="zona.capasDeInformacion"
                  color="primary"
                  :clearable="true"
                  label="Grupo de Información"
                  item-text="nombre"
                  item-value="id"
                  no-data-text="Sin resultados"
                  multiple
                  hide-details
                  @click:clear="onClearCapas"
                  :menu-props="{ maxHeight: '400' }"
                >
                  <template v-slot:prepend-item>
                    <v-list-tile
                      ><v-checkbox
                        v-model="checkAllZones"
                        label="Seleccionar todos"
                        @change="selectAllZones()"
                      ></v-checkbox
                    ></v-list-tile>
                    <v-divider></v-divider>
                  </template>
                  <template v-slot:selection="data">
                    <v-chip
                      :selected="data.selected"
                      close
                      class="chip--select-multi"
                      @input="changeCapa(data.item)"
                    ></v-chip>
                  </template>
                  <template v-slot:item="data">
                    <template v-if="valideType(data.item)">
                      <v-list-tile-content
                        :v-text="data.item"
                      ></v-list-tile-content>
                    </template>
                    <template v-else>
                      <v-list-tile>
                        <v-list-tile-action
                          style="
                            padding-top: 13px !important;
                            min-width: 0px !important;
                          "
                        >
                          <v-checkbox
                            @change="changeCapa(data.item)"
                            v-model="data.item.selected"
                          ></v-checkbox>
                        </v-list-tile-action>

                        <v-list-tile-content>
                          <v-list-tile-title @click="changeCapa(data.item)">
                            <span style="cursor: pointer !important">
                              {{ data.item.nombre }} </span
                            >&nbsp;
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </template>
                  </template>
                </v-autocomplete>
              </v-flex>

              <v-flex md6 sm6 xs12 d-flex>
                <v-select
                  small
                  id="sel"
                  v-model="zona.selected"
                  item-text="nombre"
                  item-value="valor"
                  :items="zona.tipoMapa"
                  hide-details
                  @change="changeTipoMapa"
                  label="Tipo de Vista"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
    <!-- FIN MENU 9 PUNTOS -->

    <!-- INICIO MODAL CREAR ZONAS -->
    <div
      class="animated fadeIn fast"
      id="divDrawingBtns"
      v-show="zona.drawingToolBar"
    >
      <v-btn
        @click="toggleDrawingControlsVisibility"
        dark
        color="#777777"
        small
        style="font-size: 12px; margin: 4px 4px"
        >Cancelar</v-btn
      >
      <v-btn
        @click="mostrarCrearZona()"
        dark
        color="primary"
        :disabled="!zona.enabledBtnContinue"
        small
        style="font-size: 12px; margin: 4px 4px"
        >Continuar</v-btn
      >
    </div>

    <div align="right" class="text-xs-center" id="divCrearZona">
      <v-btn
        @click="toggleDrawingControlsVisibility()"
        dark
        color="#777777"
        style="width: 42px; min-width: 42px"
        v-show="acciondibujar.visible"
      >
        <v-icon>layers</v-icon>
      </v-btn>
    </div>

    <div class="text-xs-center">
      <v-dialog v-model="zona.dialogErrorAsoc" persistent max-width="390">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >{{ zona.titleEliminarItem }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-show="zona.cantidadVehiculosAsociados === 1">
              La Geocerca está asociada a un Vehículo, por esta razón no se
              podrá realizar la eliminación.
            </v-card-text>
            <v-card-text v-show="zona.cantidadVehiculosAsociados > 1">
              La Geocerca está asociada a
              {{ zona.cantidadVehiculosAsociados }} Vehículos, por esta razón no
              se podrá realizar la eliminación.
            </v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="zona.dialogErrorAsoc = false">
              <span style="color: white">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- FIN MODAL CREAR ZONAS   -->

    <!-- PROPS MODALES ZONAS -->

    <app-confirmacion
      :show="zona.dialogEliminar"
      :titulo="zona.titleEliminarItem"
      :mensaje="zona.mensajeConfirmacionIndividual"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
      :width="390"
    ></app-confirmacion>

    <app-crear-zona
      :show="zona.showCrearZona"
      :tipogeometria="zona.tipoGeometriaModal"
      :strCoords="zona.strCoordsModal"
      :tipoMapaSelected="zona.mapType"
      :zoomMap="zona.zoom"
      v-on:modalAsociacionEmit="zonaModalCallback($event)"
    ></app-crear-zona>

    <app-editar-zona
      :show="zona.showEditarZona"
      :zona="zona.editedItem"
      :esEdicion="zona.modalEsEdicion"
      v-on:modalAsociacionEmit="zonaModalCallbackEditar($event)"
    ></app-editar-zona>
    <!-- FIN PROPS MODALES ZONAS -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { rDiaEvents } from '@/pantallas/RepetirDia/rdiaEventBus';
import { Zona } from '@/pantallas/Inicio/Mapa/VariblesMapa';
import { AxiosVue } from '../../../AxiosVue';
import {
  ServicioProxy,
  TipoGeometria,
  TipoLugarAlcance,
  TiposZonas,
} from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { InfoZonaVm } from '../../../interfaces/InfoZonaVm';
import config from '@/config/index';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import {
  CodigoAccion,
  PermisoAccion,
} from '../../../views/base/VariablesPermisos';
import { Funcionalidades } from '../../../config/funcionalidades';
import ZonaEventBus from '../../../eventBus/zonaEventBus';
import { filtroHomeEventBus } from '../../../setup';
import Confirmation from '../../../components/Confirmation.vue';

const jsts = require('jsts');

@Component({
  components: {
    'app-crear-zona': () =>
      import('@/components/plataforma/ZonasModalNuevo.vue'),
    'app-editar-zona': () =>
      import('@/components/plataforma/ZonasModalEdicion.vue'),
    'app-confirmacion': Confirmation,
  },
})
export default class mapRepetirDia extends ComponenteBaseStepper {
  @Prop({ default: [] }) actividadesMap!: any[];
  permisosActuales: PermisoAccionVm[] = [];

  map: google.maps.Map;
  markers: any[] = [];
  patente: string = localStorage.getItem('patenteVehiculoRdia');
  idActividadSeleccionada: number = 0;
  loadingService = new LoadingService();
  readonly funcionalidad: Funcionalidades = Funcionalidades.Zonas;
  $snotify: any;
  checkAllZones: boolean = false;
  showLoadingZones: boolean = false;
  boolControlLateral: boolean = true;
  labelLoadingZones: string = '';
  timer: any = 0;

  //Dibujar zonas

  acciondibujar: PermisoAccionVm = {
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  dibujarEditar: PermisoAccionVm = {
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralEditar: PermisoAccionVm = {
    visible: true,
    step: 2,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarVehiculosEditar: PermisoAccionVm = {
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  trazarRutaInferida: PermisoAccion = {
    visible: true,
    moduloCodigo: Funcionalidades.Inicio,
    accionCodigo: CodigoAccion.TrazarRutaInferida,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.acciondibujar,
    this.dibujarEditar,
    this.informacionGeneralEditar,
    this.asociarVehiculosEditar,
  ];

  zona: Zona = {
    drawingManager: null,
    mapType: 'roadmap',
    zoom: '',
    controllerTipoLugar: 'grupodezona',
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

  //Latitud y longitud mouse event
  currentMouseLat: string = '';
  currentMouseLng: string = '';
  snackbar: boolean = false;
  snackbarMessage: string = '';
  timeout: number = 3000;
  tilesloadedAtivado = false;

  FlechaAzul: string = [
    '<?xml version="1.0"?>',
    '<svg width="100%" height="100%" viewBox="0 0 125 125" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" transform="rotate(##Rotation##)" >',
    '<path d="M62.106,121.942c-32.64,-0 -59.191,-26.52 -59.191,-59.118c-0,-32.598 26.551,-59.118 59.191,-59.118c32.633,-0 59.184,26.52 59.184,59.118c0,32.598 -26.551,59.118 -59.184,59.118Z" style="fill:#4766a8;fill-rule:nonzero;stroke:#fff;stroke-width:4.58px;"/>',
    '<g><path d="M66.42,43.287l-0,45.778l-11.191,0l0,-45.778l11.191,0Z" style="fill:#ffe700;fill-rule:nonzero;"/>',
    '<path d="M83.091,57.642l-7.912,7.914l-14.354,-14.355l-14.355,14.355l-7.913,-7.914l22.268,-22.266l22.266,22.266Z" style="fill:#ffe700;fill-rule:nonzero;"/></g></svg>',
  ].join('\n');

  FlechaGris: string = [
    '<?xml version="1.0"?>',
    '<svg width="100%" height="100%" viewBox="0 0 125 125" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" transform="rotate(##Rotation##)">',
    '<path d="M62.106,121.942c-32.64,-0 -59.191,-26.52 -59.191,-59.118c-0,-32.598 26.551,-59.118 59.191,-59.118c32.633,-0 59.184,26.52 59.184,59.118c0,32.598 -26.551,59.118 -59.184,59.118Z" style="fill:#7d8493;fill-rule:nonzero;stroke:#fff;stroke-width:4.58px;"/><g><path d="M66.42,43.287l-0,45.778l-11.191,0l0,-45.778l11.191,0Z" style="fill:#fff;fill-rule:nonzero;"/>',
    '<path d="M83.091,57.642l-7.912,7.914l-14.354,-14.355l-14.355,14.355l-7.913,-7.914l22.268,-22.266l22.266,22.266Z" style="fill:#fff;fill-rule:nonzero;"/></g></svg>',
  ].join('\n');

  @Watch('actividadesMap')
  onPropertyChanged() {
    this.CreaMarkers();
  }

  mounted() {
    rDiaEvents.$on('actividadSelected', (actividad: any) => {
      this.OpenInfowindows(actividad);
    });

    rDiaEvents.$on('reproducirRdia', (repetir: any) => {});

    let clienteId = localStorage.getItem('clienteDefecto');
    this.GetZonasClientes(Number(clienteId));

    this.initMap();
    this.habilitaDrawing();
    this.SetButtonsMaps();

    //fin mounted
  }

  //#region  Inicia Mapa
  initMap() {
    this.map = new google.maps.Map(document.getElementById('mapContainer'), {
      center: {
        lat:
          this.actividadesMap.length > 0
            ? this.actividadesMap[0].latitud
            : -33.447487,
        lng:
          this.actividadesMap.length > 0
            ? this.actividadesMap[0].longitud
            : -70.673676,
      },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      gestureHandling: 'greedy',
      mapTypeControl: false,

      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });
  }

  OpenInfowindows(actividad: any) {
    let idx = 0;
    this.idActividadSeleccionada = actividad.id;
    for (let i = 0; i < this.markers.length; i++) {
      const mks = this.markers[i];

      if (Number(actividad.id) == mks.id) {
        idx = i;
        const svg = this.FlechaAzul.replace('##Rotation##', actividad.heading);
        const icon: any = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(25, 25),
        };
        mks.setIcon(icon);
        google.maps.event.trigger(mks, 'click');
      }
    }
  }

  get changeToggleControls() {
    return this.boolControlLateral ? '' : 'margin-top: 25px';
  }

  async CreaMarkers() {
    let marker: any;

    //bounds centra el mapa en las actividades - se podria remplazar con la 1era actividad del arreglo
    let bounds = new google.maps.LatLngBounds();
    const infowindow = new google.maps.InfoWindow({
      content: '',
      maxWidth: 600,
    });
    const nroActividades = this.actividadesMap.length;

    for (let i = 0; i < nroActividades; i++) {
      const actividad = this.actividadesMap[i];
      let svg = this.FlechaGris.replace('##Rotation##', actividad.heading);

      marker = new google.maps.Marker({
        position: new google.maps.LatLng(actividad.latitud, actividad.longitud),
        map: this.map,
        optimized: false,

        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(25, 25),
        },
      });

      marker.id = actividad.id;
      marker.heading = actividad.heading;
      marker.index = i;
      bounds.extend(marker.getPosition());
      const info = this.getInfoWindows(actividad, this.patente);

      const iconClick: any = {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(
            this.FlechaAzul.replace('##Rotation##', actividad.heading)
          ),
        scaledSize: new google.maps.Size(25, 25),
      };

      google.maps.event.addListener(
        marker,
        'click',
        (function(marker, map) {
          return function() {
            infowindow.setContent(info);
            infowindow.open(map, marker);
            map.setZoom(15);
            map.setCenter(marker.getPosition());
            marker.setIcon(iconClick);
          };
        })(marker, this.map)
      );

      this.markers.push(marker);
      this.map.fitBounds(bounds);
    }

    return;
  }

  getInfoWindows(act: any, vehiculo: string) {
    const fechaformat = act.fecha.format('DD-MM-YYYY HH:mm:ss');
    const conductor =
      act.conductor.length > 2 ? act.conductor : 'No hay conductor';
    const tipoActividad =
      act.tipoActividad.length > 13 ? act.conductor : 'No hay conductor';

    const htmlInfowindows = `<div style="border-bottom:1px solid #27488e; padding:5px"> <table><tr><td><i class="material-icons" style="font-size: 20px; color:#27488e">directions_car</i></td><td></td><td> ${vehiculo}</td></tr></table></div>
        <div style="padding:10px;">
        <table>
        <tr>
        <td><i class="material-icons" style="font-size: 20px; color:#27488e">schedule</i></td>
        <td></td>
        <td style=" padding-bottom:4px">${fechaformat}</td>
        <td><i class="material-icons" style="font-size: 20px; color:#27488e">view_list</i></td>
        <td></td>
        <td style=" padding-bottom:4px">${act.tipoActividad} </td>
        </tr> 
            <tr>
        <td><i class="material-icons" style="font-size: 20px; color:#27488e">person</i></td>
        <td></td>
        <td style=" padding-bottom:4px">${conductor}</td>
        <td><i class="material-icons" style="font-size: 20px; color:#27488e">speed</i></td>
        <td></td>
        <td style=" padding-bottom:4px">${act.velocidad} km/h </td>
        </tr> 
    <tr>
    <td>
    <i class="material-icons" style="font-size: 20px; color:#27488e">place</i>
    </td>
           <td style=" padding-bottom:3px" colspan="5" >
           
        ${act.ubicacion}
        </td>
          <tr>
        </table>`;

    return htmlInfowindows;
  }

  //#endregion

  SetButtonsMaps() {
    this.zona.tipoMapa = [
      {
        id: 1,
        nombre: 'Mapa',
        valor: 'roadmap',
      },
      {
        id: 2,
        nombre: 'Satelital',
        valor: 'satellite',
      },
      {
        id: 3,
        nombre: 'Híbrido',
        valor: 'hybrid',
      },
      {
        id: 4,
        nombre: 'Relieve',
        valor: 'terrain',
      },
    ];

    let centerControlDiv = document.createElement('div');
    let centerControl = this.CenterControl(centerControlDiv, this.map);

    let centerControlDiv2 = document.createElement('div');
    let centerControl2 = this.CreateCrearZonaBtn(centerControlDiv2, this.map);

    let centerControlDiv3 = document.createElement('div');
    let centerControl3 = this.CreateDrawingControlBtns(
      centerControlDiv3,
      this.map
    );

    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
      centerControlDiv
    );

    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
      centerControlDiv2
    );

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      centerControlDiv3
    );
  }

  //region zonas

  deleteItemCallback(val: boolean) {
    this.zona.dialogEliminar = false;
    if (val) {
      this.loadingService.showLoading();
      //Eliminación
      this.zona.axios.http
        .delete(`${this.zona.controllerCoordenada}/${this.zona.editedIndex}`)
        .then(res => {
          this.removeOverlay(this.zona.editedIndex);
          filtroHomeEventBus.$emit('removeOverlay', this.zona.editedIndex);
          this.loadingService.hideLoading();
          this.$snotify.success(this.zona.mensajeExitoEliminacion);
        })
        .catch(error => {
          this.$snotify.error(this.zona.mensajeErrorEliminacion);
        });
    }
  }

  async selectAllZones() {
    this.loadingZones(this.checkAllZones);
    if (this.checkAllZones) {
      //this.onClearCapas();
      //this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
      //  infoWin.close();
      //});
      //this.zona.capasSeleccionadas = [];
      for (var i = 0; i < this.zona.capasDeInformacion.length; i++) {
        if (
          this.zona.capasDeInformacion[i].id != undefined &&
          this.zona.capasDeInformacion[i].selected == false
        ) {
          this.zona.capasSeleccionadas.push(this.zona.capasDeInformacion[i]);
          this.getTiposLugarPorCliente(this.zona.capasDeInformacion[i], false);
          this.zona.capasDeInformacion[i].selected = true;
        }
      }
    } else {
      var zoneGroupId: any = {};
      for (var x = 0; x < this.zona.capasSeleccionadas.length; x++) {
        zoneGroupId = this.zona.capasDeInformacion.findIndex((item: any) => {
          return item.id == this.zona.capasSeleccionadas[x].id;
        });
        this.remueveCapas(this.zona.capasDeInformacion[zoneGroupId].id);
        this.zona.capasDeInformacion[zoneGroupId].selected = false;
      }
      this.zona.capasSeleccionadas = [];
    }
  }

  removeOverlay(Id: number) {
    this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
      infoWin.close();
    });

    for (let i = this.zona.polylines.length - 1; i >= 0; i--) {
      let polyline: any = this.zona.polylines[i];
      if (polyline.id === Id) {
        polyline.setMap(null);
        this.zona.polylines.splice(i, 1);
        return;
      }
    }

    for (let i = this.zona.circles.length - 1; i >= 0; i--) {
      let circle: any = this.zona.circles[i];
      if (circle.id === Id) {
        circle.setMap(null);
        this.zona.circles.splice(i, 1);
        return;
      }
    }

    for (let i = this.zona.markerZona.length - 1; i >= 0; i--) {
      let marker: any = this.zona.markerZona[i];
      if (marker.id === Id) {
        this.removeEventListeners(marker);
        marker.setMap(null);
        this.zona.markerZona.splice(i, 1);
        return;
      }
    }
  }

  async GetZonasClientes(clienteId: number) {
    this.onClearCapas();
    this.zona.capasDeInformacion = [];

    try {
      const response = await this.zona.axios.http.get(
        `${this.zona.controllerTipoLugar}/${clienteId}/tiposlugarCliente`
      );
      if (response.data.length > 0) {
        let data: any = [];
        let tiposLugar: [] = response.data.filter(
          (x: any) => x.tipoLugarAlcance === 1
        );

        const tiposLugarInteres: any = response.data.filter(
          (x: any) => x.tipoLugarAlcance === 2
        );

        if (tiposLugar.length > 0) {
          data.push({ header: 'Grupos de Zonas' });
          tiposLugar.forEach((element: any, idx: number) => {
            data.push({
              id: element.id,
              nombre: element.nombre,
              grupo: 'Grupos de Zonas',
              selected: false,
            });
          });
        }

        if (tiposLugarInteres.length > 0) {
          data.push({ divider: true });
          data.push({ header: 'Grupos de Interés' });

          tiposLugarInteres.forEach((element: any, idx: number) => {
            data.push({
              id: element.id,
              nombre: element.nombre,
              grupo: 'Grupos de Interés',
              selected: false,
            });
          });
        }

        this.zona.capasDeInformacion = data;
      }
    } catch (error) {
      return;
    }
  }

  changeTipoMapa(val: any) {
    if (val !== undefined && val !== '') {
      this.map.setMapTypeId(val);
      this.zona.mapType = val;
    }
  }

  async loadingZones(bool: boolean) {
    this.showLoadingZones = false;
    clearTimeout(this.timer);
    this.timer = 0;
    this.labelLoadingZones = bool ? 'Cargando Zonas' : 'Eliminando Zonas';
    this.showLoadingZones = true;
    this.timer = setTimeout(() => {
      this.showLoadingZones = false;
    }, 1500);
  }

  CenterControl(controlDiv: any, map: any) {
    // Set CSS for the control border.
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('xxxHome');
    controlUI.appendChild(centerControlDiv);
  }

  CreateDrawingControlBtns(controlDiv: any, map: any) {
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    //controlUI.title = "Crear Zona";
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('divDrawingBtns');
    controlUI.appendChild(centerControlDiv);
  }

  habilitaDrawing() {
    let icon = {
      url: 'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png', // url
      scaledSize: new google.maps.Size(32, 51),
    };

    this.zona.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
      markerOptions: {
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#27488e',
          fillOpacity: 1,
          strokeWeight: 0,
          anchor: new google.maps.Point(0, -3),
          rotation: 270,
        },
        position: new google.maps.LatLng(null, null),
      },
      circleOptions: {
        fillColor: '#3A01DF',
        strokeColor: '#3A01DF',
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: '#3A01DF',
        strokeColor: '#3A01DF',
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: '#3A01DF',
        strokeColor: '#3A01DF',
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
    });

    this.zona.mapEventListenerList.push(
      this.zona.drawingManager.addListener('overlaycomplete', ($event: any) => {
        if ($event.type === 'polygon') {
          if ($event.overlay.getPath().getArray().length > 2) {
            var intersects = this.findSelfIntersects($event.overlay.getPath());
            if (!(intersects && intersects.length)) {
              if (this.zona.overlay != null) {
                //this.overlaybkp = this.overlay;
                this.zona.overlay.setMap(null);
              }
              if (this.zona.marcadorBuscador != null) {
                this.zona.marcadorBuscador.setMap(null);
              }
              this.zona.overlay = $event.overlay;
              this.zona.drawingManager.setDrawingMode(null);
              this.zona.enabledBtnContinue = true;
            } else {
              if (this.zona.overlay != null) {
                //this.overlaybkp = this.overlay;
                this.zona.overlay.setMap(null);
              }
              if (this.zona.marcadorBuscador != null) {
                this.zona.marcadorBuscador.setMap(null);
              }
            }
          } else {
            if (this.zona.overlay != null) {
              //this.overlaybkp = this.overlay;
              this.zona.overlay.setMap(null);
            }
            if (this.zona.marcadorBuscador != null) {
              this.zona.marcadorBuscador.setMap(null);
            }
          }
        } else {
          if (this.zona.overlay != null) {
            //this.overlaybkp = this.overlay;
            this.zona.overlay.setMap(null);
          }
          if (this.zona.marcadorBuscador != null) {
            this.zona.marcadorBuscador.setMap(null);
          }
          this.zona.overlay = $event.overlay;
          this.zona.drawingManager.setDrawingMode(null);
          this.zona.enabledBtnContinue = true;
        }
      })
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addDomListener(document, 'keyup', ($e: any) => {
        var code = $e.keyCode ? $e.keyCode : $e.which;
        if (code === 27) {
          this.zona.drawingManager.setDrawingMode(null);
          if (this.zona.overlay != null) {
            this.zona.overlay.setMap(null);
          }
          this.zona.enabledBtnContinue = false;
        }
      })
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'polygoncomplete',
        ($polygon: google.maps.Polyline) => {
          this.addPolygonEditListeners($polygon);
          if ($polygon.getPath().getArray().length > 2) {
            var intersects = this.findSelfIntersects($polygon.getPath());
            if (intersects && intersects.length) {
              this.$snotify.error(
                'El polígono que está trazando no es válido.'
              );
              $polygon.setMap(null);
              if (this.zona.overlaybkp != null) {
                this.zona.overlaybkp.setMap(this.map);
              }
              this.zona.enabledBtnContinue = false;
            } else {
              $polygon.setEditable(true);
              let pathArray: google.maps.LatLng[] = $polygon
                .getPath()
                .getArray();
              this.TransformCoordsPolygon(pathArray);
              this.zona.drawingManager.setDrawingMode(null);
            }
          } else {
            this.$snotify.error('El polígono que está trazando no es válido.');
            $polygon.setMap(null);
            if (this.zona.overlaybkp != null) {
              this.zona.overlaybkp.setMap(this.map);
            }
            this.zona.enabledBtnContinue = false;
          }
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'rectanglecomplete',
        ($rectangle: google.maps.Rectangle) => {
          this.addRectangleEditListeners($rectangle);
          let bounds: google.maps.LatLngBounds = $rectangle.getBounds();
          this.TransformCoordsRectangle(bounds);
          this.zona.drawingManager.setDrawingMode(null);
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'markercomplete',
        ($marker: google.maps.Marker) => {
          this.zona.drawingManager.setDrawingMode(null);
          let position: google.maps.LatLng = $marker.getPosition();
          this.TransformCoordsMarker(position);
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'circlecomplete',
        ($circle: google.maps.Circle) => {
          this.addCircleEditListeners($circle);
          this.TransformCoordsCircle($circle);
          this.zona.drawingManager.setDrawingMode(null);
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'drawingmode_changed',
        ($e: any) => {
          if (this.zona.drawingManager.getDrawingMode() != null) {
            this.zona.enabledBtnContinue = false;
          }
        }
      )
    );

    this.zona.drawingManager.setMap(this.map);

    this.zona.drawingManager.setOptions({
      drawingControl: false,
    });
  }

  CreateCrearZonaBtn(controlDiv: any, map: any) {
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Crear Zona';

    /*if (!this.dibujar.visible) {
      controlUI.style.display = 'none';
    }*/
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('divCrearZona');
    controlUI.appendChild(centerControlDiv);
  }

  copyToClipboard() {
    this.snackbar = true;

    this.snackbarMessage =
      'Copiado: ' + this.currentMouseLat + ', ' + this.currentMouseLng;
    var el = document.createElement('textarea');
    el.value = this.currentMouseLat + ',' + this.currentMouseLng;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
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

    const mouseLatLng = point2LatLng(
      new google.maps.Point(event.clientX, event.clientY)
    );
    this.currentMouseLat = mouseLatLng.lat().toString();
    this.currentMouseLng = mouseLatLng.lng().toString();
  }

  //#region CAPAS

  onClearCapas() {
    if (this.zona.capasSeleccionadas != null) {
      for (
        let x: number = this.zona.capasSeleccionadas.length - 1;
        x >= 0;
        x--
      ) {
        this.remueveCapas(this.zona.capasSeleccionadas[x].id);
        this.zona.capasSeleccionadas.splice(x, 1);
      }
    }
    if (this.zona.selectedCapas != null) {
      for (let x: number = this.zona.selectedCapas.length - 1; x >= 0; x--) {
        this.remueveCapas(this.zona.selectedCapas[x]);
        this.zona.selectedCapas.splice(x, 1);
      }
    }
  }

  reloadEditedCapa() {
    let capaRecargar = this.zona.capasDeInformacion.find(
      (x: any) => x.id == this.zona.editedCapaId
    );
    this.remueveCapas(this.zona.editedCapaId);
    this.getTiposLugarPorCliente(capaRecargar, false);
  }

  reloadCapas(marcador: boolean) {
    //Antes utilizaba this.selectedCapas
    if (this.zona.capasSeleccionadas.length > 0) {
      this.zona.capasSeleccionadas.forEach((capa: any, idx: number) => {
        let capaRecargar = this.zona.capasDeInformacion.find(
          (x: any) => x.id == capa.id
        );
        if (capaRecargar !== undefined && capaRecargar !== null) {
          if (marcador) {
            this.getTiposLugarPorCliente(capaRecargar, true);
          } else {
            this.remueveCapas(capaRecargar.id);
            this.getTiposLugarPorCliente(capaRecargar, false);
          }
        }
      });
    }
  }

  limpiarCapas() {
    this.zona.capasDeInformacion.forEach((x: any) => this.remueveCapas(x.id));
    this.zona.capasSeleccionadas.forEach((x: any) => this.remueveCapas(x.id));
  }

  remueveCapas(capaId: number) {
    this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
      infoWin.close();
    });

    for (let i = this.zona.polylines.length - 1; i >= 0; i--) {
      let polyline: any = this.zona.polylines[i];
      if (polyline.grupoId === capaId) {
        polyline.setMap(null);
        this.zona.polylines.splice(i, 1);
      }
    }

    for (let i = this.zona.circles.length - 1; i >= 0; i--) {
      let circle: any = this.zona.circles[i];
      if (circle.grupoId === capaId) {
        circle.setMap(null);
        this.zona.circles.splice(i, 1);
      }
    }

    for (let i = this.zona.markerZona.length - 1; i >= 0; i--) {
      let marker: any = this.zona.markerZona[i];
      if (marker.grupoId === capaId) {
        this.removeEventListeners(marker);
        marker.setMap(null);
        this.zona.markerZona.splice(i, 1);
      }
    }
  }
  //Revisa si necesito esto
  private removeEventListeners(marker: any) {
    marker.gps.eventListeners.forEach((listener: any) => listener.remove());
  }

  async changeCapa(capa: any) {
    this.loadingZones(capa.selected);
    if (capa !== undefined) {
      let added = this.zona.capasSeleccionadas.filter(
        (x: any) => x.id == capa.id
      );
      if (added.length == 0) {
        let capaAgregar = this.zona.capasDeInformacion.find(
          (x: any) => x.id == capa.id
        );
        this.zona.capasSeleccionadas.push(capaAgregar);
        this.getTiposLugarPorCliente(capaAgregar, false);
        capa.selected = true;
      } else {
        capa.selected = false;
        for (
          let x: number = this.zona.capasSeleccionadas.length - 1;
          x >= 0;
          x--
        ) {
          if (this.zona.capasSeleccionadas[x].id == capa.id) {
            this.remueveCapas(capa.id);
            this.zona.capasSeleccionadas.splice(x, 1);
          }
        }
      }
    }
  }

  getTiposLugarPorCliente(tipo: any, marcador: boolean) {
    const clienteId = localStorage.getItem('clienteDefecto');
    this.zona.axios.http
      .get(`${this.zona.controllerCoordenada}/${clienteId}/${tipo.id}/cliente`)
      .then(res => {
        // Dibujar nueva capa sobre capas antiguas
        this.zona.lugares = JSON.parse(res.data);
        this.zona.lugares.forEach((elem: any) => {
          if (marcador) {
            this.dibujaCapasInformacionMarcador(elem, this.map);
          } else {
            this.dibujaCapasInformacion(elem, this.map);
          }
        });
      })
      .catch(err => {});
  }

  dibujaCapasInformacionMarcador(el: any, map: google.maps.Map) {
    switch (el.tipoGeometria) {
      case TipoGeometria.Marcador:
        this.dibujarMarcadorCapa(el, map);
        break;
    }
  }

  dibujaCapasInformacion(el: any, map: google.maps.Map) {
    switch (el.tipoGeometria) {
      case TipoGeometria.Poligono:
        this.dibujarPoligono(el, map);
        break;
      case TipoGeometria.Circunferencia:
        this.dibujarCircunferencia(el, map);
        break;
      case TipoGeometria.Rectangulo:
        this.dibujarRectangulo(el, map);
        break;
      case TipoGeometria.Marcador:
        this.dibujarMarcadorCapa(el, map);
        break;
    }
  }

  dibujarMarcadorCapa(capa: any, map: google.maps.Map) {
    let coordenadas: any = {};
    let latlng = capa.formaJson.split(';');

    if (capa.formaJson !== '0;0') {
      if (latlng.length >= 2) {
        let latitud = parseFloat(latlng[0]);
        let longitud = parseFloat(latlng[1]);
        coordenadas = { lat: latitud, lng: longitud };
        let iconourl =
          'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png';
        // if (capa.tipoAlcance == TipoLugarAlcance.GPS){
        //   iconourl = "http://www.clker.com/cliparts/3/5/y/O/U/I/blue-pin-th.png";
        // }
        let icon = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#27488e',
          fillOpacity: 1,
          strokeWeight: 0,
          anchor: new google.maps.Point(0, -3),
          rotation: 270,
        };

        let marker = new (google.maps.Marker as any)({
          grupoId: capa.grupoId,
          id: capa.id,
          vehiculoId: capa.vehiculoId,
          transmitiendo: capa.transmitiendo,
          position: coordenadas,
          map: map,
          icon: icon,
          title: '',
          //animation: google.maps.Animation.DROP
        });

        let dataInfoWinZona: InfoZonaVm = {
          id: capa.id,
          tipoalcance: capa.tipoAlcance,
          tipo: capa.tipoZonaNombre,
          tipolugar: capa.tipoLugarNombre,
          nombre: capa.nombre,
          tipodibujo: 'Marcador',
          tipogeometria: TipoGeometria.Marcador,
          formaJson: capa.formaJson,
          grupoId: capa.grupoId,
          tipozonaid: capa.tipoZonaId,
        };

        let infowindowzona = new google.maps.InfoWindow({
          content: config.createInfoWindowZona(dataInfoWinZona),
        });

        const eventListeners = [];
        if (capa.tipoAlcance == TipoLugarAlcance.Cliente) {
          eventListeners.push(
            google.maps.event.addListener(infowindowzona, 'domready', () => {
              this.createInfoWindowZonasBtn(dataInfoWinZona);
            })
          );
        }

        eventListeners.push(
          google.maps.event.addListener(infowindowzona, 'closeclick', () => {
            this.zona.infoWindowsZonas.forEach(
              (infoWin: google.maps.InfoWindow) => {
                infoWin.close();
              }
            );
            ZonaEventBus.$emit('controlDibujo-cerrar');
          })
        );

        eventListeners.push(
          google.maps.event.addListener(marker, 'click', (e: any) => {
            this.zona.infoWindowsZonas.forEach(
              (infoWin: google.maps.InfoWindow) => {
                infoWin.close();
              }
            );

            infowindowzona.setPosition(e.latLng);
            infowindowzona.open(this.map);
            this.zona.infoWindowsZonas.push(infowindowzona);
          })
        );

        marker.gps = {
          eventListeners,
        };

        this.zona.markerZona.push(marker);
      }
    }
  }

  dibujarPoligono(capa: any, map: google.maps.Map) {
    let coordenadas: any = [];
    let item = capa.formaJson.split('|');

    item.forEach((coord: any) => {
      let latlng = coord.split(';');

      if (latlng.length >= 2) {
        let latitud = parseFloat(latlng[0]);
        let longitud = parseFloat(latlng[1]);
        coordenadas.push({ lat: latitud, lng: longitud });
      }
    });

    let poligonoCoords = coordenadas;
    let color = '#FF0000'; //rojo
    let linecolor = '#FF0000'; //rojo
    if (capa.tipoAlcance == TipoLugarAlcance.GPS) {
      color = '#ffff00'; //amarillo
      linecolor = '#3A01DF'; //azul
    } else {
      if (capa.tipoZonaId == TiposZonas.Sitio) {
        color = '#3A01DF'; //azul
        linecolor = '#3A01DF'; //azul
      } else {
        //color = "#50555b" //gris
        color = '#FF0000'; //rojo
        linecolor = '#FF0000'; //azul
      }
    }

    let poligono = new (google.maps.Polygon as any)({
      grupoId: capa.grupoId,
      paths: poligonoCoords,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
      id: capa.id,
    });

    let dataInfoWinZona: InfoZonaVm = {
      id: capa.id,
      tipoalcance: capa.tipoAlcance,
      tipo: capa.tipoZonaNombre,
      tipolugar: capa.tipoLugarNombre,
      nombre: capa.nombre,
      tipodibujo: 'Polígono',
      tipogeometria: TipoGeometria.Poligono,
      formaJson: capa.formaJson,
      grupoId: capa.grupoId,
      tipozonaid: capa.tipoZonaId,
    };

    let infowindowzona = new google.maps.InfoWindow({
      content: config.createInfoWindowZona(dataInfoWinZona),
    });
    if (capa.tipoAlcance == TipoLugarAlcance.Cliente) {
      // TODO limpiar listeners al eliminar
      google.maps.event.addListener(infowindowzona, 'domready', () => {
        this.createInfoWindowZonasBtn(dataInfoWinZona);
      });
    }

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(infowindowzona, 'closeclick', () => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      ZonaEventBus.$emit('controlDibujo-cerrar');
    });

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(poligono, 'click', (e: any) => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      infowindowzona.setPosition(e.latLng);
      infowindowzona.open(this.map);
      this.zona.infoWindowsZonas.push(infowindowzona);
    });
    this.zona.polylines.push(poligono);
    poligono.setMap(map);
  }

  dibujarRectangulo(capa: any, map: google.maps.Map) {
    let item = capa.formaJson.split('|');
    let flagCoor = 0;
    let cont = 1;
    let north = 0;
    let west = 0;
    let south = 0;
    let east = 0;

    item.forEach((coord: any) => {
      let latlng = coord.split(';');

      if (latlng.length >= 2) {
        if (cont == 1) {
          north = parseFloat(latlng[0]);
        }
        if (cont == 2) {
          west = parseFloat(latlng[1]);
        }
        if (cont == 3) {
          south = parseFloat(latlng[0]);
        }
        if (cont == 4) {
          east = parseFloat(latlng[1]);
        }
      }
      cont++;
    });

    let ne = new google.maps.LatLng(north, east);
    let sw = new google.maps.LatLng(south, west);
    let recBounds = new google.maps.LatLngBounds(ne, sw);
    let color = '#FF0000'; //rojo
    let linecolor = '#FF0000'; //rojo
    if (capa.tipoAlcance == TipoLugarAlcance.GPS) {
      color = '#ffff00'; //amarillo
      linecolor = '#3A01DF'; //azul
    } else {
      if (capa.tipoZonaId == TiposZonas.Sitio) {
        color = '#3A01DF'; //azul
        linecolor = '#3A01DF'; //azul
      } else {
        //color = "#50555b" //gris
        color = '#FF0000'; //rojo
        linecolor = '#FF0000'; //azul
      }
    }

    let rectangulo = new (google.maps.Rectangle as any)({
      grupoId: capa.grupoId,
      bounds: recBounds,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
      id: capa.id,
    });

    let dataInfoWinZona: InfoZonaVm = {
      id: capa.id,
      tipoalcance: capa.tipoAlcance,
      tipo: capa.tipoZonaNombre,
      tipolugar: capa.tipoLugarNombre,
      nombre: capa.nombre,
      tipodibujo: 'Rectángulo',
      tipogeometria: TipoGeometria.Rectangulo,
      formaJson: capa.formaJson,
      grupoId: capa.grupoId,
      tipozonaid: capa.tipoZonaId,
    };

    let infowindowzona = new google.maps.InfoWindow({
      content: config.createInfoWindowZona(dataInfoWinZona),
    });

    if (capa.tipoAlcance == TipoLugarAlcance.Cliente) {
      // TODO limpiar listeners al eliminar
      google.maps.event.addListener(infowindowzona, 'domready', () => {
        this.createInfoWindowZonasBtn(dataInfoWinZona);
      });
    }

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(infowindowzona, 'closeclick', () => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      ZonaEventBus.$emit('controlDibujo-cerrar');
    });

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(rectangulo, 'click', (e: any) => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });

      infowindowzona.setPosition(e.latLng);
      infowindowzona.open(this.map);
      this.zona.infoWindowsZonas.push(infowindowzona);
    });

    this.zona.polylines.push(rectangulo);
    rectangulo.setMap(map);
  }

  valideType(data: any): boolean {
    return typeof data !== 'object';
  }

  dibujarCircunferencia(capa: any, map: google.maps.Map) {
    let latlng = capa.formaJson.split(';');

    if (latlng.length >= 3) {
      let coordenadas = {
        center: {
          lat: parseFloat(latlng[0]),
          lng: parseFloat(latlng[1]),
        },
        population: parseFloat(latlng[2]),
      };

      let color = '#FF0000'; //rojo
      let linecolor = '#FF0000'; //rojo
      if (capa.tipoAlcance == TipoLugarAlcance.GPS) {
        color = '#ffff00'; //amarillo
        linecolor = '#3A01DF'; //azul
      } else {
        if (capa.tipoZonaId == TiposZonas.Sitio) {
          color = '#3A01DF'; //azul
          linecolor = '#3A01DF'; //azul
        } else {
          //color = "#50555b" //gris
          color = '#FF0000'; //rojo
          linecolor = '#FF0000'; //azul
        }
      }
      let cityCircle = new (google.maps.Circle as any)({
        grupoId: capa.grupoId,
        id: capa.id,
        strokeColor: linecolor,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        center: coordenadas.center,
        radius: coordenadas.population, //Math.sqrt(coordenadas.population) * 100
      });

      let dataInfoWinZona: InfoZonaVm = {
        id: capa.id,
        tipoalcance: capa.tipoAlcance,
        tipo: capa.tipoZonaNombre,
        tipolugar: capa.tipoLugarNombre,
        nombre: capa.nombre,
        tipodibujo: 'Circunferencia',
        tipogeometria: TipoGeometria.Circunferencia,
        formaJson: capa.formaJson,
        grupoId: capa.grupoId,
        tipozonaid: capa.tipoZonaId,
      };

      let infowindowzona = new google.maps.InfoWindow({
        content: config.createInfoWindowZona(dataInfoWinZona),
      });

      if (capa.tipoAlcance == TipoLugarAlcance.Cliente) {
        // TODO limpiar listeners al eliminar
        google.maps.event.addListener(infowindowzona, 'domready', () => {
          this.createInfoWindowZonasBtn(dataInfoWinZona);
        });
      }

      // TODO limpiar listeners al eliminar
      google.maps.event.addListener(infowindowzona, 'closeclick', () => {
        this.zona.infoWindowsZonas.forEach(
          (infoWin: google.maps.InfoWindow) => {
            infoWin.close();
          }
        );
        ZonaEventBus.$emit('controlDibujo-cerrar');
      });

      // TODO limpiar listeners al eliminar
      google.maps.event.addListener(cityCircle, 'click', (e: any) => {
        this.zona.infoWindowsZonas.forEach(
          (infoWin: google.maps.InfoWindow) => {
            infoWin.close();
          }
        );
        infowindowzona.setPosition(cityCircle.getCenter());
        infowindowzona.open(this.map);
        this.zona.infoWindowsZonas.push(infowindowzona);
      });

      this.zona.circles.push(cityCircle);
    }
  }

  createInfoWindowZonasBtn(dataInfoWin: InfoZonaVm) {
    let existButton = document.getElementById('btnEditarZona' + dataInfoWin.id);
    ZonaEventBus.$emit('controlDibujo-abrir');
    if (existButton === null) {
      let editBtn = document.createElement('i');
      editBtn.setAttribute('class', 'material-icons');
      editBtn.setAttribute('title', 'Editar');
      editBtn.setAttribute('id', 'btnEditarZona' + dataInfoWin.id);
      editBtn.setAttribute('style', 'display:flex;font-size:19px;');
      editBtn.innerText = 'create';

      //605 - Ver detalle - Editar Zona (Condiciones para ocultar tooltip editar mediante permisos)
      var resultados =
        !this.dibujarEditar.visible &&
        !this.informacionGeneralEditar.visible &&
        !this.asociarVehiculosEditar.visible;

      let visibleEditar = this.chequearPermisoModuloAccion(
        CodigoAccion.Editar,
        Funcionalidades.Zonas
      );

      if (!visibleEditar) {
        editBtn.style.display = 'none';
      }

      // TODO limpiar listeners al eliminar
      editBtn.addEventListener('click', () => {
        this.editarZona(dataInfoWin);
      });

      let delBtn = document.createElement('i');
      delBtn.setAttribute('class', 'material-icons');
      delBtn.setAttribute('title', 'Eliminar');
      delBtn.setAttribute('id', 'btnEliminarZona' + dataInfoWin.id);
      delBtn.setAttribute('style', 'display:flex;font-size:19px;');
      delBtn.innerText = 'delete';

      let visibleEliminar = this.chequearPermisoModuloAccion(
        CodigoAccion.Eliminar,
        Funcionalidades.Zonas
      );

      if (!visibleEliminar) {
        delBtn.style.display = 'none';
      }
      //---
      delBtn.addEventListener('click', () => {
        this.eliminarZona(dataInfoWin);
      });

      let divEl = document.createElement('div');
      divEl.setAttribute('style', 'display: inline-flex;');
      divEl.appendChild(editBtn);
      divEl.appendChild(delBtn);

      let table: any = document.getElementById(
        'vvvTableZonas' + dataInfoWin.id
      );
      let row = table.insertRow(4);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      cell3.setAttribute('style', 'text-align: right;');
      cell3.setAttribute('nowrap', 'nowrap');
      //cell3.style.display = "flex";
      //cell3.appendChild(editBtn);
      cell3.appendChild(divEl);

      //return editBtn;
    }
  }

  private setShowCrearZona(showCrearZona: boolean) {
    window.setTimeout(() => {
      ZonaEventBus.$emit(`crearZona-${showCrearZona ? 'abrir' : 'cerrar'}`);
      this.zona.showCrearZona = showCrearZona;
    });
  }

  //#region ZONAS
  mostrarCrearZona() {
    ZonaEventBus.$emit('crearZona-abrir');
    if (document.fullscreen) {
      document.exitFullscreen();
    }
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.setShowCrearZona(true);
  }

  editarZona(zona: InfoZonaVm) {
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.zona.showEditarZona = true;
    this.zona.editedItem.id = zona.id;
    this.zona.editedItem.tipoGeometria = zona.tipogeometria;
    this.zona.editedItem.tipoZonaId = zona.tipozonaid;
    this.zona.editedItem.formaJson = zona.formaJson;
    this.zona.editedCapaId = zona.grupoId;
  }
  eliminarZona(zona: InfoZonaVm) {
    this.zona.editedName = zona.nombre;
    this.zona.axios.http
      .get(`${this.zona.controllerGpsCoordenada}/${zona.id}/activeAsoc`)
      .then(res => {
        this.zona.cantidadVehiculosAsociados = res.data.length;
        if (this.zona.cantidadVehiculosAsociados == 0) {
          this.zona.dialogEliminar = true;
          this.zona.editedIndex = zona.id;
          this.zona.editedCapaId = zona.grupoId;
          this.zona.titleEliminarItem = this.$t(
            'mensajes.crud.eliminar.titulo',
            {
              entidad: zona.tipo,
              nombreEntidad: zona.nombre,
            }
          );
          let msjEliminacion = '';
          if (zona.tipozonaid == TiposZonas.Geocerca) {
            msjEliminacion = 'la ' + zona.tipo; // + ': ' + zona.nombre;
            this.zona.mensajeExitoEliminacion =
              'La ' +
              zona.tipo +
              ': ' +
              zona.nombre +
              ' ha sido eliminada de forma exitosa';
            this.zona.mensajeErrorEliminacion =
              'Ha ocurrido un problema al intentar eliminar la ' +
              zona.tipo +
              ': ' +
              zona.nombre;
          } else {
            msjEliminacion = 'el ' + zona.tipo; // + ': ' + zona.nombre;
            this.zona.mensajeExitoEliminacion =
              'El ' +
              zona.tipo +
              ': ' +
              zona.nombre +
              ' ha sido eliminado de forma exitosa';
            this.zona.mensajeErrorEliminacion =
              'Ha ocurrido un problema al intentar eliminar el ' +
              zona.tipo +
              ': ' +
              zona.nombre;
          }
          this.zona.mensajeConfirmacionIndividual = this.$t(
            'mensajes.crud.eliminar.mensaje',
            { entidad: msjEliminacion }
          );
        } else {
          this.zona.titleEliminarItem = this.$t(
            'mensajes.crud.eliminar.titulo',
            {
              entidad: zona.tipo,
              nombreEntidad: zona.nombre,
            }
          );
          this.zona.dialogErrorAsoc = true;
        }
      })
      .catch(error => {
        this.$snotify.error(
          'Ha ocurrido un problema al intentar eliminar la zona'
        );
      });
  }

  addPolygonEditListeners(polygon: any) {
    let self = this;
    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.zona.enabledBtnContinue = false;
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
        self.zona.enabledBtnContinue = true;
      }
    });
    google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.zona.enabledBtnContinue = false;
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
        self.zona.enabledBtnContinue = true;
      }
    });
    google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.zona.enabledBtnContinue = false;
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
        self.zona.enabledBtnContinue = true;
      }
    });
  }

  addRectangleEditListeners(rectangle: any) {
    let self = this;
    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(rectangle, 'bounds_changed', function() {
      let bounds: google.maps.LatLngBounds = rectangle.getBounds();
      self.TransformCoordsRectangle(bounds);
    });
  }

  addCircleEditListeners(circle: any) {
    let self = this;

    // TODO limpiar listeners al eliminar
    //Resize del Circulo
    google.maps.event.addListener(circle, 'radius_changed', function() {
      self.TransformCoordsCircle(circle);
    });

    //Desplazado del Circulo
    google.maps.event.addListener(circle, 'center_changed', function() {
      self.TransformCoordsCircle(circle);
    });
  }

  findSelfIntersects(googlePolygonPath: any) {
    var coordinates = this.googleMaps2JTS(googlePolygonPath);
    var geometryFactory = new jsts.geom.GeometryFactory();
    var shell = geometryFactory.createLinearRing(coordinates);
    var jstsPolygon = geometryFactory.createPolygon(shell);

    // if the geometry is aleady a simple linear ring, do not
    // try to find self intersection points.
    var validator = new jsts.operation.IsSimpleOp(jstsPolygon);
    if (validator.isSimpleLinearGeometry(jstsPolygon)) {
      return;
    }

    var res = [];
    var graph = new jsts.geomgraph.GeometryGraph(0, jstsPolygon);
    var cat = new jsts.operation.valid.ConsistentAreaTester(graph);
    var r = cat.isNodeConsistentArea();
    if (!r) {
      var pt = cat.getInvalidPoint();
      res.push([pt.x, pt.y]);
    }
    return res;
  }

  googleMaps2JTS(boundaries: any) {
    var coordinates = [];
    for (var i = 0; i < boundaries.getLength(); i++) {
      coordinates.push(
        new jsts.geom.Coordinate(
          boundaries.getAt(i).lat(),
          boundaries.getAt(i).lng()
        )
      );
    }
    coordinates.push(coordinates[0]);
    return coordinates;
  }

  toggleDrawingControlsVisibility() {
    this.boolControlLateral = !this.boolControlLateral;
    this.zona.drawingManager.setOptions({
      drawingControl: !this.zona.drawingToolBar,
    });

    this.zona.drawingToolBar = !this.zona.drawingToolBar;
    this.zona.enabledBtnContinue = false;

    if (this.zona.overlay !== null) {
      this.zona.overlay.setMap(null);
    }

    if (this.zona.drawingToolBar === false) {
      ZonaEventBus.$emit('controlDibujo-cerrar');
      if (this.zona.drawingManager != null) {
        this.zona.drawingManager.setDrawingMode(null);
      }
    } else {
      ZonaEventBus.$emit('controlDibujo-abrir');
    }
  }

  hideDrawingControls() {
    this.zona.drawingToolBar = true;
    this.toggleDrawingControlsVisibility();
  }

  zonaModalCallback(val: boolean) {
    this.reloadCapas(false);
    if (this.zona.drawingManager != null) {
      this.zona.drawingManager.setDrawingMode(null);
    }
    if (this.zona.overlay != null) {
      this.zona.overlay.setMap(null);
      this.zona.overlay = null;
    }
    this.zona.overlaybkp = null;
    this.toggleDrawingControlsVisibility(); //Se descomenta esta función que oculta el panel de dibujo en el mapa
    this.setShowCrearZona(false);
    //document.getElementsByTagName("html")[0].style.overflow = "auto";
    this.zona.showEditarZona = false;
    this.zona.drawingToolBar = false;
    this.zona.enabledBtnContinue = false;
    filtroHomeEventBus.$emit('clearDrawerTools');
  }

  zonaModalCallbackEditar(val: boolean) {
    this.reloadEditedCapa();
    filtroHomeEventBus.$emit('reloadEditedCapa', this.zona.editedCapaId);
    this.zona.showEditarZona = false;
  }

  TransformCoordsPolygon(patharray: google.maps.LatLng[]) {
    let coordenadas = '';

    patharray.forEach((coordenada: google.maps.LatLng) => {
      let latitud = coordenada.lat().toString();
      let longitud = coordenada.lng().toString();
      coordenadas += latitud + ';' + longitud + '|';
    });

    this.zona.tipoGeometriaModal = TipoGeometria.Poligono;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  TransformCoordsRectangle(bounds: google.maps.LatLngBounds) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const coordenadas: string = `${ne.lat()};${ne.lng()}|${sw.lat()};${ne.lng()}|${sw.lat()};${sw.lng()}|${ne.lat()};${sw.lng()}`;

    this.zona.tipoGeometriaModal = TipoGeometria.Rectangulo;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  TransformCoordsMarker(position: google.maps.LatLng) {
    let coordenadas = `${position.lat()};${position.lng()}`;

    this.zona.tipoGeometriaModal = TipoGeometria.Marcador;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  TransformCoordsCircle(circle: google.maps.Circle) {
    let center = circle.getCenter();
    let radius = circle.getRadius();
    let coordenadas = `${center.lat()};${center.lng()};${radius}`;

    this.zona.tipoGeometriaModal = TipoGeometria.Circunferencia;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  //#region
}
</script>
<style scoped>
#mapContainer {
  width: 100%;
  height: 1142px;
}

.google-map {
  width: 100%;
  margin: 0 auto;
  height: 100%;
}

.v-icon--right {
  margin-left: 1px !important;
}
.menuable__content__active {
  z-index: 1015000 !important; /*1000 !important;*/
  width: 664px !important;
}
.v-dialog--active {
  overflow: hidden !important;
}
#divRepetirDia {
  font: 400 11px Asap, sans-serif !important;
}
#divRepetirDia2 {
  font: 400 11px Asap, sans-serif !important;
}

.dialogLoadingClass {
  position: absolute;
  height: 5%;
  width: 18%;
  z-index: 1;
  display: flex;
}

.contentDialogLoading {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.contentDialogLoadingText {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: -5%;
  font-weight: 600;
  font-size: 1.9vmin;
  text-shadow: 2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff,
    1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
}
</style>

<template>
  <div>
    <div
      id="divDialog"
      class="dialogLoadingClass"
      v-show="showLoadingZones"
      style="margin-top: 25px;"
    >
      <div style="width: 20%;" class="contentDialogLoading">
        <v-img
          contain
          class="imageLoadingClass"
          :src="require('./../assets/loadingGif.gif')"
          alt="Loading"
        ></v-img>
      </div>
      <div class="contentDialogLoadingText" style="width: 70%">
        {{ labelLoadingZones }}
      </div>
    </div>
    <div class="google-map" :id="mapName"></div>

    <div
      :show="showSettings"
      align="right"
      class="text-xs-center"
      :id="idXXXContainer"
    >
      <v-btn
        tile
        outlined
        class="text-center"
        style="text-transform: capitalize; font-size: 13px; opacity: 0.7; font-weight: 900;"
        v-show="true"
      >
        {{ currentMouseLat }} , {{ currentMouseLng }}
      </v-btn>

      <v-snackbar
        v-model="snackbar"
        color="primary"
        :timeout="timeout"
        :bottom="'bottom'"
      >
        {{ snackbarMessage }}
      </v-snackbar>

      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="400"
        offset-x
        left
      >
        <v-btn style="min-width: 10px;" slot="activator" color="default" small>
          <v-icon>apps</v-icon>
        </v-btn>

        <v-card>
          <v-card-actions>
            <v-layout wrap align-center>
              <v-flex md4 sm4 xs12 d-flex>
                <v-autocomplete
                  class="tst"
                  style="font-size: 11px;"
                  v-model="selectedCapas"
                  :items="capasDeInformacion"
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
                  id="autoCapasInfo"
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
                          style="padding-top: 13px !important; min-width: 0px !important;"
                        >
                          <v-checkbox
                            @change="changeCapa(data.item)"
                            v-model="data.item.selected"
                          ></v-checkbox>
                        </v-list-tile-action>

                        <v-list-tile-content>
                          <v-list-tile-title @click="changeCapa(data.item)">
                            <span style="cursor: pointer !important;">
                              {{ data.item.nombre }} </span
                            >&nbsp;
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </template>
                  </template>
                </v-autocomplete>
              </v-flex>

              <v-flex md3 sm3 xs12 d-flex>
                <v-select
                  small
                  id="sel"
                  v-model="selected"
                  item-text="nombre"
                  item-value="valor"
                  :items="tipoMapa"
                  hide-details
                  @change="changeTipoMapa"
                  label="Tipo de Vista"
                ></v-select>
              </v-flex>

              <v-flex md4 sm4 xs12 d-flex>
                <v-text-field
                  id="searchInput"
                  v-model="autocompleteText"
                  placeholder="Buscar Ubicación"
                  single-line
                  hide-details
                ></v-text-field>
              </v-flex>
              <v-flex md1 sm1 xs12>
                <v-btn
                  flat
                  icon
                  style="margin-left: 10px; margin-top: 10px;"
                  id="btnSearch"
                >
                  <v-icon>search</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '../config/index';
import store from '@/store';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '../config/handleErrors';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import {
  TipoGeometria,
  ServicioProxy,
  TipoLugarAlcance,
  TiposZonas,
} from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import ZonaEventBus from '@/eventBus/zonaEventBus';
import { InfoZonaVm } from '@/interfaces/InfoZonaVm';
import { RepetirDiaVm } from '@/interfaces/RepetirDiaVm';
import { filtroHomeEventBus } from '@/setup';

const jsts = require('jsts');
declare var google: any;

@Component({
  components: {},
})
export default class GoogleMapDrawer extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: '' }) name!: string;
  @Prop({ default: true }) enableControls!: boolean;
  @Prop({ default: '' }) coordenadas!: string;
  @Prop({ default: 0 }) geometria!: number;
  @Prop({ default: 0 }) tipozona!: number;
  @Prop({ default: '' }) tipoMapaSelected!: any;
  @Prop({ default: '' }) zoomMapaSelected!: any;
  @Prop({ default: false }) restrictDrawers!: boolean;
  @Prop({ default: '' }) module!: string;
  @Prop({ default: 'mantenedor' }) from!: string;

  //Variables globales
  handleErrors: HandleErrors = new HandleErrors();
  enableContinueEmit: boolean = false;
  controllerTipoLugar: string = 'grupodezona';
  controllerCoordenada: string = 'coordenada';

  //Mapa
  map: google.maps.Map = null;
  tipoMapa: any = [];
  mapName: string = this.name + '-map';
  selected: any = [];
  menu: boolean = false;
  poligono: any = null;
  rectangulo: any = null;
  circulo: any = null;
  marcador: any = null;
  overlay: any = null;
  overlaybkp: any = null;
  marcadorBuscador: any = null;
  showSearchPlaces: boolean = false;
  showSettings: boolean = true;
  mapType: any = 'roadmap';
  currentMouseLat: string = '';
  currentMouseLng: string = '';
  snackbar: boolean = false;
  snackbarMessage: string = '';
  timeout: number = 3000;
  checkAllPatent: boolean = false;
  showLoadingZones: boolean = false;
  boolControlLateral: boolean = true;
  labelLoadingZones: string = '';
  timer: any = 0;
  checkAllZones: boolean = false;

  capasDeInformacion: any = [];
  capasSeleccionadas: any = [];
  lugares: any = [];
  selectedCapas: any = null;

  clienteId: number = config.getClienteSesion();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  markers: google.maps.Marker[] = [];
  circles: google.maps.Circle[] = [];
  polylines: google.maps.Polyline[] = [];
  currentGeometry: any = 0;

  drawingManager: any = null;

  //Coordenadas de Santiago
  centerCoordinates: any = { latitude: -33.4372, longitude: -70.6506 };

  //Variables para controles
  btnSettings: any = null;
  controlsDiv: any = null;

  //Variables GoogleMapsTS
  drawingToolBar: boolean = false;
  enabledBtnContinue: boolean = false;
  $snotify: any;
  autocompleteText: string = '';
  loadingService = new LoadingService();
  infoWindows: google.maps.InfoWindow[] = [];
  infoWindowsZonas: google.maps.InfoWindow[] = [];
  idXXXContainer = this.name + '-map' + '-xxx';

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.selectedCapas = null;
    this.autocompleteText = '';
    this.overlaybkp = null;
    this.centerMap(
      this.centerCoordinates.latitude,
      this.centerCoordinates.longitude
    );
    const mapContainer = document.getElementById(this.mapName);

    if (value) {
      mapContainer.addEventListener('mousemove', this.updateMouseCoordinates, {
        passive: true,
      });
      this.GetZonasClientes();
      //NO SE USA, TOMA VALORES DESDE LA MUTACION
      /*if(this.tipoMapaSelected != ""){
        this.map.setMapTypeId(this.tipoMapaSelected);  
        this.selected = this.tipoMapaSelected;
      } else {
        this.selected = this.tipoMapa[0];
      }
      if(this.zoomMapaSelected != ""){
        this.map.setZoom(this.zoomMapaSelected);
      }*/

      //Set el tipo mapa, zoom y centro desde el Home hacia el Ver Detalle
      this.selected = store.getters.getTipoMapa;
      this.mapType = this.selected;
      this.map.setMapTypeId(this.selected);
      this.map.setCenter(store.getters.getCoordenadas);
      this.map.setZoom(store.getters.getZoom);
      //---

      switch (this.geometria) {
        case TipoGeometria.Marcador:
          this.dibujarMarcador(this.coordenadas, this.map);
          this.currentGeometry = TipoGeometria.Marcador;
          break;
        case TipoGeometria.Circunferencia:
          this.dibujarCircunferencia(this.coordenadas, this.map);
          this.currentGeometry = TipoGeometria.Circunferencia;
          break;
        case TipoGeometria.Poligono:
          this.dibujarPoligono(this.coordenadas, this.map);
          this.currentGeometry = TipoGeometria.Poligono;
          break;
        case TipoGeometria.Rectangulo:
          this.dibujarRectangulo(this.coordenadas, this.map);
          this.currentGeometry = TipoGeometria.Rectangulo;
          break;
      }
      //if(this.module === "lugarinteres"){
      setTimeout(() => {
        store.commit('setStateLoadZonaMap', true);
      }, 3000);
      //}
    } else {
      mapContainer.removeEventListener(
        'mousemove',
        this.updateMouseCoordinates
      );
      this.clearShapes();
    }
  }

  @Watch('enableControls')
  async onPropertyChangedEC(value: boolean, oldValue: boolean) {
    if (value == true) {
      if (this.drawingManager === null) {
        await this.habilitaDrawing();
        await this.createListeners();
      }
      this.setDrawingControlVisibility(true);
      if (this.overlay != null && this.geometria != TipoGeometria.Marcador) {
        this.overlay.setEditable(true);
      }
    } else {
      this.setDrawingControlVisibility(false);
      if (
        this.overlay != null &&
        this.geometria != TipoGeometria.Marcador &&
        this.geometria != 0 &&
        this.currentGeometry != TipoGeometria.Marcador
      ) {
        this.overlay.setEditable(false);
      }
      if (this.marcadorBuscador != null) {
        this.marcadorBuscador.setMap(null);
        this.marcadorBuscador = null;
      }
      this.drawingManager.setMap(null);
    }
  }

  mounted() {
    this.tipoMapa = [
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

    //this.selected = this.tipoMapa[0];

    var myLatlng: google.maps.LatLng = new google.maps.LatLng(
      -33.4372,
      -70.6506
    );

    var mapOptions = {
      zoom: 13,
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

    this.map = new google.maps.Map(
      document.getElementById(this.mapName),
      mapOptions
    );

    var centerControlDiv = document.createElement('div');
    this.reposicionarMenu9Puntos(centerControlDiv);

    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
      centerControlDiv
    );

    // Create the search box and link it to the UI element.
    var input = document.getElementById('searchInput');
    var searchBox: google.maps.places.SearchBox = new google.maps.places.SearchBox(
      input
    );

    document.getElementById('btnSearch').onclick = () => {
      google.maps.event.trigger(input, 'focus', {});
      google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
      google.maps.event.trigger(this, 'focus', {});
    };

    //Autocomplete de Google Maps
    input.addEventListener('keypress', () => {
      let searchActivated = false;
      if (!searchActivated) {
        let listObjPacContainer: any = document.getElementsByClassName(
          'pac-container'
        );
        for (let item of listObjPacContainer) {
          item.style.zIndex = '1015004';
        }
        searchActivated = true;
      }
    });

    input.addEventListener('keyup', () => {
      if (this.autocompleteText == '') {
        if (this.marcadorBuscador != null) {
          this.marcadorBuscador.setMap(null);
        }
      }
    });

    //Evento al mover el centro del mapa
    this.map.addListener('dragend', () => {
      const center: google.maps.LatLng = this.map.getCenter(); //Obtiene el centro del mapa
      this.actualizarValoresMapa();
    });
    //---

    //Evento al cambiar el zoom del mapa
    this.map.addListener('zoom_changed', () => {
      const zoom: number = this.map.getZoom(); //Obtiene el zoom del mapa
      this.actualizarValoresMapa();
    });
    //---

    // Bias the SearchBox results towards current map's viewport.
    this.map.addListener('bounds_changed', () => {
      searchBox.setBounds(this.map.getBounds());
    });

    this.map.addListener('click', ($event: any) => {
      this.copyToClipboard();
    });

    searchBox.addListener('places_changed', () => {
      var places: google.maps.places.PlaceResult[] = searchBox.getPlaces();

      if (places.length == 0) {
        if (this.marcadorBuscador != null) {
          this.marcadorBuscador.setMap(null);
        }
        this.$snotify.warning(
          'No se han encontrado resultados para la búsqueda.'
        );
        return;
      } else {
        this.autocompleteText = places[0].formatted_address;
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
        if (this.marcadorBuscador != null) {
          this.marcadorBuscador.setMap(null);
        }
        this.marcadorBuscador = marker;
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(places[0].geometry.location);
        this.map.fitBounds(bounds);
        this.map.setZoom(17);
      }
    });
    //this.habilitaDrawing();
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setStateLoadZonaManteiner') {
        if (store.getters.isLoadedZona) {
          this.loadingService.hideLoading();
        }
      }
    });
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setStateLoadZonaMap') {
        if (store.getters.isLoadedZona) {
          this.loadingService.hideLoading();
        }
      }
    });
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

  created() {}

  valideType(data: any): boolean {
    return typeof data !== 'object';
  }

  search() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('searchInput');
    var searchBox: google.maps.places.SearchBox = new google.maps.places.SearchBox(
      input
    );

    var places: google.maps.places.PlaceResult[] = searchBox.getPlaces();

    if (places.length == 0) {
      this.$snotify.warning(
        'No se han encontrado resultados para la búsqueda.'
      );
      return;
    } else {
      this.autocompleteText = places[0].formatted_address;
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
      if (this.marcadorBuscador != null) {
        this.marcadorBuscador.setMap(null);
      }
      this.marcadorBuscador = marker;
      var bounds = new google.maps.LatLngBounds();
      bounds.extend(places[0].geometry.location);
      this.map.fitBounds(bounds);
      this.map.setZoom(17);
    }
  }

  initialize() {
    this.initMap();
  }

  drawingControlVisibility() {
    this.drawingManager.setOptions({
      drawingControl: !this.drawingToolBar,
    });

    this.drawingToolBar = !this.drawingToolBar;
    this.enabledBtnContinue = false;
  }

  setDrawingControlVisibility(val: boolean) {
    this.drawingManager.setOptions({
      drawingControl: val,
    });
    //store.commit("setStateLoadZonaMap", true);
  }

  habilitaDrawing() {
    let modes = [];
    if (this.module !== 'lugarinteres') {
      if (this.restrictDrawers) {
        if (this.geometria == TipoGeometria.Marcador) {
          modes = [google.maps.drawing.OverlayType.MARKER];
        } else {
          modes = [
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.RECTANGLE,
            google.maps.drawing.OverlayType.CIRCLE,
          ];
        }
      } else {
        modes = [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
        ];
      }
    } else {
      modes = [
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE,
        google.maps.drawing.OverlayType.CIRCLE,
      ];
    }
    let initialColorFill = '#3A01DF';
    let initialColorStroke = '#3A01DF';
    if (this.module === 'lugarinteres') {
      initialColorFill = '#ffff00';
    }

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null, //google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: modes,
      },
      //markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
      circleOptions: {
        fillColor: initialColorFill,
        strokeColor: initialColorStroke,
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: initialColorFill,
        strokeColor: initialColorStroke,
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: initialColorFill,
        strokeColor: initialColorStroke,
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
    });

    this.drawingManager.setMap(this.map);

    this.drawingManager.setOptions({
      drawingControl: false,
    });
  }

  createListeners() {
    this.drawingManager.addListener('overlaycomplete', ($event: any) => {
      if ($event.type === 'polygon') {
        if ($event.overlay.getPath().getArray().length > 2) {
          var intersects = this.findSelfIntersects($event.overlay.getPath());
          if (!(intersects && intersects.length)) {
            if (this.overlay != null) {
              this.overlaybkp = this.overlay;
              this.overlay.setMap(null);
            }
            if (this.marcadorBuscador != null) {
              this.marcadorBuscador.setMap(null);
            }
            this.overlay = $event.overlay;
            this.drawingManager.setDrawingMode(null);
            this.enabledBtnContinue = true;
          } else {
            if (this.overlay != null) {
              this.overlaybkp = this.overlay;
              this.overlay.setMap(null);
            }
            if (this.marcadorBuscador != null) {
              this.marcadorBuscador.setMap(null);
            }
          }
        } else {
          if (this.overlay != null) {
            this.overlaybkp = this.overlay;
            this.overlay.setMap(null);
          }
          if (this.marcadorBuscador != null) {
            this.marcadorBuscador.setMap(null);
          }
        }
      } else {
        if (this.overlay != null) {
          this.overlaybkp = this.overlay;
          this.overlay.setMap(null);
        }
        if (this.marcadorBuscador != null) {
          this.marcadorBuscador.setMap(null);
        }
        this.overlay = $event.overlay;
        this.drawingManager.setDrawingMode(null);
        this.enabledBtnContinue = true;
      }
    });

    google.maps.event.addDomListener(document, 'keyup', ($e: any) => {
      var stepDibujar = store.getters.getEsDibujar;
      var code = $e.keyCode ? $e.keyCode : $e.which;
      if (code === 27 && stepDibujar) {
        ZonaEventBus.$emit('resetCreation');
        this.drawingManager.setDrawingMode(null);
        if (this.overlay != null) {
          this.overlay.setMap(null);
          this.overlay = null;
          this.$emit('enableContinueEmit', null);
          switch (this.geometria) {
            case TipoGeometria.Marcador:
              this.dibujarMarcador(this.coordenadas, this.map);
              break;
            case TipoGeometria.Circunferencia:
              this.dibujarCircunferencia(this.coordenadas, this.map);
              break;
            case TipoGeometria.Poligono:
              this.dibujarPoligono(this.coordenadas, this.map);
              break;
            case TipoGeometria.Rectangulo:
              this.dibujarRectangulo(this.coordenadas, this.map);
              break;
          }
          if (this.enableControls == true) {
            ////this.habilitaDrawing();
            this.setDrawingControlVisibility(true);
            if (
              this.overlay != null &&
              this.geometria != TipoGeometria.Marcador
            ) {
              this.overlay.setEditable(true);
            }
          } else {
            this.setDrawingControlVisibility(false);
            if (
              this.overlay != null &&
              this.geometria != TipoGeometria.Marcador &&
              this.geometria != 0
            ) {
              this.overlay.setEditable(false);
            }
            this.drawingManager.setMap(null);
          }
        }
        this.enabledBtnContinue = false;
      }
    });

    google.maps.event.addListener(
      this.drawingManager,
      'drawingmode_changed',
      ($e: any) => {
        if (this.drawingManager.getDrawingMode() != null) {
          ZonaEventBus.$emit('resetCreation');
        }
      }
    );

    google.maps.event.addListener(
      this.drawingManager,
      'polygoncomplete',
      ($polygon: google.maps.Polygon) => {
        this.addPolygonEditListeners($polygon);
        if ($polygon.getPath().getArray().length > 2) {
          var intersects = this.findSelfIntersects($polygon.getPath());
          if (intersects && intersects.length) {
            this.$snotify.error('El polígono que está trazando no es válido.');
            $polygon.setMap(null);
            if (
              this.overlaybkp != null &&
              (this.from === 'home' || this.name === 'zona-edit')
            ) {
              this.overlaybkp.setMap(this.map);
            }
            //this.$emit("enableContinueEmit", null);
          } else {
            $polygon.setEditable(true);
            let pathArray: google.maps.LatLng[] = $polygon.getPath().getArray();
            this.drawingManager.setDrawingMode(null);
            this.TransformCoordsPolygon(pathArray);
          }
        } else {
          this.$snotify.error('El polígono que está trazando no es válido.');
          $polygon.setMap(null);
          if (
            this.overlaybkp != null &&
            (this.from === 'home' || this.name === 'zona-edit')
          ) {
            this.overlaybkp.setMap(this.map);
          }
          //this.$emit("enableContinueEmit", null);
        }
      }
    );

    google.maps.event.addListener(
      this.drawingManager,
      'rectanglecomplete',
      ($rectangle: google.maps.Rectangle) => {
        this.addRectangleEditListeners($rectangle);
        $rectangle.setEditable(true);
        let bounds: google.maps.LatLngBounds = $rectangle.getBounds();
        this.drawingManager.setDrawingMode(null);
        this.TransformCoordsRectangle(bounds);
      }
    );

    google.maps.event.addListener(
      this.drawingManager,
      'markercomplete',
      ($marker: google.maps.Marker) => {
        this.drawingManager.setDrawingMode(null);
        let position: google.maps.LatLng = $marker.getPosition();
        this.TransformCoordsMarker(position);
      }
    );

    google.maps.event.addListener(
      this.drawingManager,
      'circlecomplete',
      ($circle: google.maps.Circle) => {
        this.addCircleEditListeners($circle);
        $circle.setEditable(true);
        this.drawingManager.setDrawingMode(null);
        this.TransformCoordsCircle($circle);
      }
    );
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

  selectAllPatent() {
    if (this.checkAllPatent) {
      this.capasDeInformacion = [];
      this.selectedCapas = this.capasDeInformacion.map((x: any) => {
        return x.id;
      });
    } else {
      this.selectedCapas = [];
    }
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

  GetZonasClientes() {
    this.onClearCapas();
    this.capasDeInformacion = [];
    this.axios.http
      .get(`${this.controllerTipoLugar}/${this.clienteId}/tiposlugarCliente`)
      .then(res => {
        if (res.data.length > 0) {
          let data: any = [];
          let arrTipoLugar: any = res.data.filter(
            (x: any) => x.tipoLugarAlcance === 1
          );
          let arrTipoLugarInteres: any = res.data.filter(
            (x: any) => x.tipoLugarAlcance === 2
          );

          if (arrTipoLugar.length > 0) {
            data.push({ header: 'Grupos de Zonas' });
            arrTipoLugar.forEach((element: any, idx: number) => {
              data.push({
                id: element.id,
                nombre: element.nombre,
                grupo: 'Grupos de Zonas',
                selected: false,
              });
            });
          }

          if (arrTipoLugarInteres.length > 0) {
            data.push({ divider: true });
            data.push({ header: 'Grupos de Interés' });

            arrTipoLugarInteres.forEach((element: any, idx: number) => {
              data.push({
                id: element.id,
                nombre: element.nombre,
                grupo: 'Grupos de Interés',
                selected: false,
              });
            });
          }

          this.capasDeInformacion = data;
        }
      })
      .catch(err => {});
  }

  changeTipoMapa(val: any) {
    if (val !== undefined && val !== '') {
      this.map.setMapTypeId(val);
      this.mapType = val;
      this.actualizarValoresMapa();
    }
  }

  onClearCapas() {
    if (this.capasSeleccionadas != null) {
      for (let x: number = this.capasSeleccionadas.length - 1; x >= 0; x--) {
        this.remueveCapas(this.capasSeleccionadas[x].id);
        this.capasSeleccionadas.splice(x, 1);
      }
    }
    if (this.selectedCapas != null) {
      for (let x: number = this.selectedCapas.length - 1; x >= 0; x--) {
        this.remueveCapas(this.selectedCapas[x]);
        this.selectedCapas.splice(x, 1);
      }
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

  async selectAllZones() {
    this.loadingZones(this.checkAllZones);
    if (this.checkAllZones) {
      //this.onClearCapas();
      //this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
      //  infoWin.close();
      //});
      //this.capasSeleccionadas = [];
      for (var i = 0; i < this.capasDeInformacion.length; i++) {
        if (
          this.capasDeInformacion[i].id != undefined &&
          this.capasDeInformacion[i].selected == false
        ) {
          this.capasSeleccionadas.push(this.capasDeInformacion[i]);
          this.getTiposLugarPorCliente(this.capasDeInformacion[i]);
          this.capasDeInformacion[i].selected = true;
        }
      }
    } else {
      var zoneGroupId: any = {};
      for (var x = 0; x < this.capasSeleccionadas.length; x++) {
        zoneGroupId = this.capasDeInformacion.findIndex((item: any) => {
          return item.id == this.capasSeleccionadas[x].id;
        });
        this.remueveCapas(this.capasDeInformacion[zoneGroupId].id);
        this.capasDeInformacion[zoneGroupId].selected = false;
      }
      this.capasSeleccionadas = [];
    }
  }

  async changeCapa(capa: any) {
    this.loadingZones(capa.selected);
    if (capa !== undefined) {
      let added = this.capasSeleccionadas.filter((x: any) => x.id == capa.id);
      if (added.length == 0) {
        let capaAgregar = this.capasDeInformacion.find(
          (x: any) => x.id == capa.id
        );
        this.capasSeleccionadas.push(capaAgregar);
        this.getTiposLugarPorCliente(capaAgregar);
        capa.selected = true;
      } else {
        capa.selected = false;
        for (let x: number = this.capasSeleccionadas.length - 1; x >= 0; x--) {
          if (this.capasSeleccionadas[x].id == capa.id) {
            this.remueveCapas(capa.id);
            this.capasSeleccionadas.splice(x, 1);
          }
        }
      }
    }
  }

  get changeToggleControls() {
    return this.boolControlLateral ? '' : 'margin-top: 25px';
  }

  /**
   * Reposiciona el menú de 9 puntos e indicador de coordenadas.
   */
  reposicionarMenu9Puntos(controlDiv: Element) {
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';

    controlDiv.appendChild(controlUI);

    const centerControlDiv = document.getElementById(this.idXXXContainer);
    controlUI.appendChild(centerControlDiv);
  }

  TransformCoordsPolygon(patharray: any) {
    let strCoords = '';
    let puntos = 1;
    patharray.forEach((coordenada: any, idx: number) => {
      let latitud = coordenada.lat().toString();
      let longitud = coordenada.lng().toString();
      strCoords += latitud + ';' + longitud + '|';
      puntos = puntos + 1;
    });
    if (strCoords.length > 0) {
      this.poligono = strCoords.substr(0, strCoords.length - 1);
    }
    let objShape = null;
    objShape = {
      overlay: this.overlay,
      coordenadas: this.poligono,
      tipo: 'polygon',
      puntos: puntos,
    };
    this.currentGeometry = TipoGeometria.Poligono;
    this.$emit('enableContinueEmit', objShape);
  }

  TransformCoordsRectangle(bounds: any) {
    let strCoords = '';
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();
    strCoords =
      ne.lat() +
      ';' +
      ne.lng() +
      '|' +
      sw.lat() +
      ';' +
      ne.lng() +
      '|' +
      sw.lat() +
      ';' +
      sw.lng() +
      '|' +
      ne.lat() +
      ';' +
      sw.lng();
    this.rectangulo = strCoords;
    let objShape = null;
    objShape = {
      overlay: this.overlay,
      coordenadas: this.rectangulo,
      tipo: 'rectangle',
      puntos: 5,
    };
    this.currentGeometry = TipoGeometria.Rectangulo;
    this.$emit('enableContinueEmit', objShape);
  }

  TransformCoordsMarker(position: any) {
    let strCoords = '';
    let latitud = position.lat();
    let longitud = position.lng();
    let addressMarker = '';
    let self = this;
    strCoords = latitud + ';' + longitud;
    this.marcador = strCoords;
    this.overlay.setMap(null);
    var icon = {
      url: 'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png', // url
      scaledSize: new google.maps.Size(32, 51),
    };
    var marker = new google.maps.Marker({
      position: { lat: latitud, lng: longitud },
      icon: icon,
      map: this.map,
    });
    this.overlay = marker;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ latLng: marker.getPosition() }, function(
      results: any,
      status: any
    ) {
      if (status == google.maps.GeocoderStatus.OK) {
        addressMarker = results[0]['formatted_address'];
      } else {
        addressMarker = strCoords;
      }
      let objShape = null;
      objShape = {
        overlay: self.overlay,
        coordenadas: self.marcador,
        tipo: 'marker',
        puntos: 1,
        addressMarker: addressMarker,
      };
      self.currentGeometry = TipoGeometria.Marcador;
      self.$emit('enableContinueEmit', objShape);
    });
  }

  TransformCoordsCircle(circle: any) {
    let strCoords = '';
    let center = circle.getCenter();
    let radius = circle.getRadius();
    let objShape = null;
    strCoords = center.lat() + ';' + center.lng() + ';' + radius;
    this.circulo = strCoords;
    objShape = {
      overlay: this.overlay,
      coordenadas: this.circulo,
      tipo: 'circle',
      puntos: 0,
    };
    this.currentGeometry = TipoGeometria.Circunferencia;
    this.$emit('enableContinueEmit', objShape);
  }

  callbackPlace(val: any) {
    this.centerMap(val.latitude, val.longitude);
  }

  initMap() {
    var myLatlng = new google.maps.LatLng(
      this.centerCoordinates.latitude,
      this.centerCoordinates.longitude
    );
    var mapOptions = {
      zoom: 13,
      center: myLatlng,
      mapTypeControl: false,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      minZoom: 2,
      maxZoom: 20,
    };

    // Crea control lateral para filtros
    //this.btnSettingsControlDiv = document.createElement('div');
    //this.btnSettings = this.BtnSettingsControl(this.btnSettingsControlDiv, this.map);

    // Crea Control para Capas de Información, Tipo de Vista y Búsqueda de lugares
    this.controlsDiv = document.createElement('div');
    this.reposicionarMenu9Puntos(this.controlsDiv);

    this.map = new google.maps.Map(
      document.getElementById(this.mapName),
      mapOptions
    );
    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
      this.controlsDiv
    );
  }

  centerMap(lat: any, lng: any) {
    let center = { lat: lat, lng: lng };
    this.map.setCenter(center);
  }

  onCapaChange(capa: any) {
    if (capa != undefined && capa.length != this.capasSeleccionadas.length) {
      let id: number = 0;

      for (let x = this.capasSeleccionadas.length - 1; x >= 0; x--) {
        let borrar = true;

        if (capa.length === 0) {
          id = this.capasSeleccionadas[0].id;
        }

        for (let i = 0; i <= capa.length - 1; i++) {
          if (this.capasSeleccionadas[x].id == capa[i]) {
            borrar = false;
          } else {
            id = this.capasSeleccionadas[x].id;
          }
        }
        if (borrar) {
          this.remueveCapas(id);
          this.capasSeleccionadas.splice(x, 1);
        }
      }
    }
  }

  onCapaInput(capa: any) {
    if (capa != undefined) {
      for (let i = 0; i <= capa.length - 1; i++) {
        let added = this.capasSeleccionadas.filter((x: any) => x.id == capa[i]);
        if (added.length == 0) {
          let _capa = this.capasDeInformacion.filter(
            (x: any) => x.id == capa[i]
          );
          this.capasSeleccionadas.push(_capa[0]);
          this.getTiposLugarPorCliente(_capa[0]);
        }
      }
    }
  }

  remueveCapas(capaId: number) {
    for (let i = this.polylines.length - 1; i >= 0; i--) {
      let polyline: any = this.polylines[i];
      if (polyline.grupoId === capaId) {
        polyline.setMap(null);
        this.polylines.splice(i, 1);
      }
    }

    for (let i = this.circles.length - 1; i >= 0; i--) {
      let circle: any = this.circles[i];
      if (circle.grupoId === capaId) {
        circle.setMap(null);
        this.circles.splice(i, 1);
      }
    }

    for (let i = this.markers.length - 1; i >= 0; i--) {
      let marker: any = this.markers[i];
      if (marker.grupoId === capaId) {
        marker.setMap(null);
        this.markers.splice(i, 1);
      }
    }
  }

  removeCapa(capa: any) {
    this.remueveCapas(capa.id);

    for (let x: number = this.capasSeleccionadas.length - 1; x >= 0; x--) {
      if (this.capasSeleccionadas[x].id === capa.id) {
        this.capasSeleccionadas.splice(x, 1);
        break;
      }
    }

    for (let x: number = this.selectedCapas.length - 1; x >= 0; x--) {
      if (this.selectedCapas[x] === capa.id) {
        this.selectedCapas.splice(x, 1);
        break;
      }
    }
  }

  clearShapes() {
    for (let i = this.polylines.length - 1; i >= 0; i--) {
      let polyline: any = this.polylines[i];
      polyline.setMap(null);
      this.polylines.splice(i, 1);
    }

    for (let i = this.circles.length - 1; i >= 0; i--) {
      let circle: any = this.circles[i];
      circle.setMap(null);
      this.circles.splice(i, 1);
    }

    for (let i = this.markers.length - 1; i >= 0; i--) {
      let marker: any = this.markers[i];
      marker.setMap(null);
      this.markers.splice(i, 1);
    }
  }

  getTiposLugarPorCliente(tipo: any) {
    this.axios.http
      .get(`${this.controllerCoordenada}/${this.clienteId}/${tipo.id}/cliente`)
      .then(res => {
        this.lugares = JSON.parse(res.data);
        this.lugares.forEach((elem: any) => {
          this.dibujaCapasInformacion(elem, this.map);
        });
      })
      .catch(err => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar recuperar los Grupos de Zonas del Cliente'
        );
      });
  }

  dibujaCapasInformacion(el: any, map: any) {
    switch (el.tipoGeometria) {
      case TipoGeometria.Poligono:
        this.dibujarPoligonoCapa(el, map);
        break;
      case TipoGeometria.Circunferencia:
        this.dibujarCircunferenciaCapa(el, map);
        break;
      case TipoGeometria.Rectangulo:
        this.dibujarPoligonoCapa(el, map);
        break;
      case TipoGeometria.Marcador:
        this.dibujarMarcadorCapa(el, map);
        break;
    }
  }

  dibujarPoligonoCapa(capa: any, map: google.maps.Map) {
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
    let poligono = new google.maps.Polygon({
      grupoId: capa.grupoId,
      paths: poligonoCoords,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
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
      google.maps.event.addListener(infowindowzona, 'domready', () => {
        this.createInfoWindowZonasBtn(dataInfoWinZona);
      });
    }
    google.maps.event.addListener(poligono, 'click', (e: any) => {
      this.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      infowindowzona.setPosition(e.latLng);
      infowindowzona.open(this.map);
      this.infoWindowsZonas.push(infowindowzona);
    });

    this.polylines.push(poligono);
    poligono.setMap(map);
  }

  dibujarCircunferenciaCapa(capa: any, map: google.maps.Map) {
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
      let cityCircle = new google.maps.Circle({
        grupoId: capa.grupoId,
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
        grupoId: capa.grupo,
        tipozonaid: capa.tipoZonaId,
      };

      let infowindowzona = new google.maps.InfoWindow({
        content: config.createInfoWindowZona(dataInfoWinZona),
      });

      if (capa.tipoAlcance == TipoLugarAlcance.Cliente) {
        google.maps.event.addListener(infowindowzona, 'domready', () => {
          this.createInfoWindowZonasBtn(dataInfoWinZona);
        });
      }

      google.maps.event.addListener(cityCircle, 'click', (e: any) => {
        this.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
          infoWin.close();
        });
        infowindowzona.setPosition(cityCircle.getCenter());
        infowindowzona.open(this.map);
        this.infoWindowsZonas.push(infowindowzona);
      });

      this.circles.push(cityCircle);

      this.circles.push(cityCircle);
    }
  }

  dibujarMarcadorCapa(capa: any, map: google.maps.Map) {
    let coordenadas: any = {};
    let latlng = capa.formaJson.split(';');

    if (latlng.length >= 2) {
      let latitud = parseFloat(latlng[0]);
      let longitud = parseFloat(latlng[1]);
      coordenadas = { lat: latitud, lng: longitud };
      let iconourl =
        'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png';
      if (capa.tipoAlcance == TipoLugarAlcance.GPS) {
        iconourl = 'http://www.clker.com/cliparts/3/5/y/O/U/I/blue-pin-th.png';
      }
      let icon = {
        url: iconourl,
        scaledSize: new google.maps.Size(32, 51),
      };
      let marker = new google.maps.Marker({
        grupoId: capa.grupoId,
        position: coordenadas,
        map: map,
        icon: icon,
        title: '',
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

      if (capa.tipoAlcance == TipoLugarAlcance.Cliente) {
        google.maps.event.addListener(infowindowzona, 'domready', () => {
          this.createInfoWindowZonasBtn(dataInfoWinZona);
        });
      }

      google.maps.event.addListener(marker, 'click', (e: any) => {
        this.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
          infoWin.close();
        });

        infowindowzona.setPosition(e.latLng);
        infowindowzona.open(this.map);
        this.infoWindowsZonas.push(infowindowzona);
      });

      this.markers.push(marker);
    }
  }

  dibujarPoligono(capa: any, map: google.maps.Map) {
    let coordenadas: any = [];
    var item = capa.split('|');
    var flagCoor = 0;
    var puntos = 1;
    item.forEach((coord: any) => {
      var latlng = coord.split(';');
      if (latlng.length >= 2) {
        var latitud = parseFloat(latlng[0]);
        var longitud = parseFloat(latlng[1]);
        coordenadas.push({ lat: latitud, lng: longitud });
        if (flagCoor == 0) {
          flagCoor = 1;
          this.centerMap(latitud, longitud);
        }
        puntos = puntos + 1;
      }
    });
    var poligonoCoords = coordenadas;
    let color = '#3A01DF';
    let linecolor = '#3A01DF';
    if (this.module === 'lugarinteres') {
      color = '#ffff00';
    }
    switch (this.tipozona) {
      case TiposZonas.Sitio:
        color = '#3A01DF'; //Azul;
        linecolor = '#3A01DF';
        break;
      case TiposZonas.Geocerca:
        //color = "#50555b" //Gris;
        color = '#FF0000'; //rojo
        linecolor = '#FF0000';
        break;
    }
    var poligono = new google.maps.Polygon({
      grupoId: capa.grupoId,
      paths: poligonoCoords,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
    });
    this.addPolygonEditListeners(poligono);
    this.polylines.push(poligono);
    this.overlay = poligono;
    poligono.setMap(map);
    let objShape = null;
    objShape = {
      overlay: this.overlay,
      coordenadas: capa,
      tipo: 'polygon',
      puntos: puntos,
    };
    this.$emit('enableContinueEmit', objShape);
  }

  addPolygonEditListeners(polygon: any) {
    let self = this;
    google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.$emit('enableContinueEmit', null);
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
      }
    });
    google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.$emit('enableContinueEmit', null);
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
      }
    });
    google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.$emit('enableContinueEmit', null);
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
      }
    });
  }

  addRectangleEditListeners(rectangle: any) {
    let self = this;
    google.maps.event.addListener(rectangle, 'bounds_changed', function() {
      let bounds: google.maps.LatLngBounds = rectangle.getBounds();
      self.TransformCoordsRectangle(bounds);
    });
  }

  addCircleEditListeners(circle: any) {
    let self = this;

    //Resize del Circulo
    google.maps.event.addListener(circle, 'radius_changed', function() {
      self.TransformCoordsCircle(circle);
    });

    //Desplazado del Circulo
    google.maps.event.addListener(circle, 'center_changed', function() {
      self.TransformCoordsCircle(circle);
    });
  }

  dibujarRectangulo(capa: any, map: google.maps.Map) {
    var item = capa.split('|');
    var flagCoor = 0;
    var cont = 1;
    var north = 0;
    var west = 0;
    var south = 0;
    var east = 0;
    item.forEach((coord: any) => {
      var latlng = coord.split(';');
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
        var latitud = parseFloat(latlng[0]);
        var longitud = parseFloat(latlng[1]);
        if (flagCoor == 0) {
          flagCoor = 1;
          this.centerMap(latitud, longitud);
        }
      }
      cont++;
    });
    var ne = new google.maps.LatLng(north, east);
    var sw = new google.maps.LatLng(south, west);
    var recBounds = new google.maps.LatLngBounds(ne, sw);
    let color = '#3A01DF';
    let linecolor = '#3A01DF';
    if (this.module === 'lugarinteres') {
      color = '#ffff00';
    }
    switch (this.tipozona) {
      case TiposZonas.Sitio:
        color = '#3A01DF';
        linecolor = '#3A01DF';
        break;
      case TiposZonas.Geocerca:
        //color = "#50555b" //Gris;
        color = '#FF0000'; //rojo
        linecolor = '#FF0000';
        break;
    }
    var rectangulo = new google.maps.Rectangle({
      grupoId: capa.grupoId,
      bounds: recBounds,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
    });
    this.addRectangleEditListeners(rectangulo);
    this.polylines.push(rectangulo);
    this.overlay = rectangulo;
    rectangulo.setMap(map);
    let objShape = null;
    objShape = {
      overlay: this.overlay,
      coordenadas: capa,
      tipo: 'rectangle',
      puntos: 5,
    };
    this.$emit('enableContinueEmit', objShape);
  }
  createInfoWindowBtn(vehiculoId: number, dataInfoWin: RepetirDiaVm) {
    let existButton = document.getElementById('btnVerDetalle' + vehiculoId);

    if (existButton === null) {
      let eButton = document.createElement('a');
      eButton.setAttribute('id', 'btnVerDetalle' + vehiculoId);
      eButton.setAttribute('data-testid', `ver_detalle_test`);
      eButton.innerText = 'Ver Detalle >';

      eButton.addEventListener('click', () => {
        if (document.fullscreen) {
          document.exitFullscreen();
        }
        //this.verDetalleVehiculo(vehiculoId, dataInfoWin);
      });

      let table: any = document.getElementById('vvvTable' + dataInfoWin.id);

      let _row = table.insertRow(2);
      let _cell1 = _row.insertCell(0);
      let _cell2 = _row.insertCell(1);
      _cell1.innerHTML = '';
      _cell2.setAttribute('align', 'right');
      _cell2.appendChild(eButton);

      return eButton;
    } else {
      existButton.style.display = 'block';
      return existButton;
    }
  }

  createInfoWindowZonasBtn(dataInfoWin: InfoZonaVm) {
    let existButton = document.getElementById('btnEditarZona' + dataInfoWin.id);

    if (existButton === null) {
      let delBtn = document.createElement('i');
      delBtn.setAttribute('class', 'material-icons');
      delBtn.setAttribute('title', 'Eliminar');
      delBtn.setAttribute('id', 'btnEliminarZona' + dataInfoWin.id);
      delBtn.setAttribute('style', 'display:flex;font-size:19px;');
      delBtn.innerText = 'delete';

      delBtn.style.display = 'none';

      let divEl = document.createElement('div');
      divEl.setAttribute('style', 'display: inline-flex;');

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

  dibujarCircunferencia(capa: any, map: google.maps.Map) {
    var latlng = capa.split(';');
    if (latlng.length >= 3) {
      var coordenadas = {
        center: {
          lat: parseFloat(latlng[0]),
          lng: parseFloat(latlng[1]),
        },
        radius: parseFloat(latlng[2]),
      };
      let color = '#3A01DF';
      let linecolor = '#3A01DF';
      if (this.module === 'lugarinteres') {
        color = '#ffff00';
      }
      switch (this.tipozona) {
        case TiposZonas.Sitio:
          color = '#3A01DF';
          linecolor = '#3A01DF';
          break;
        case TiposZonas.Geocerca:
          //color = "#50555b" //Gris;
          color = '#FF0000'; //rojo
          linecolor = '#FF0000';
          break;
      }
      var Circle = new google.maps.Circle({
        grupoId: capa.grupoId,
        strokeColor: linecolor,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        center: coordenadas.center,
        radius: coordenadas.radius, //Math.sqrt(coordenadas.population) * 100
      });
      this.addCircleEditListeners(Circle);
      this.centerMap(parseFloat(latlng[0]), parseFloat(latlng[1]));
      Circle.setMap(map);
      this.overlay = Circle;
      this.circles.push(Circle);
      let objShape = null;
      objShape = {
        overlay: this.overlay,
        coordenadas: capa,
        tipo: 'circle',
        puntos: 0,
      };
      this.$emit('enableContinueEmit', objShape);
    }
  }

  dibujarMarcador(capa: any, map: google.maps.Map) {
    let coordenadas: any = {};
    var latlng = capa.split(';');
    let addressMarker = '';
    var self = this;
    if (latlng.length >= 2) {
      var latitud = parseFloat(latlng[0]);
      var longitud = parseFloat(latlng[1]);
      coordenadas = { lat: latitud, lng: longitud };
      var icon = {
        url: 'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png', // url
        scaledSize: new google.maps.Size(32, 51),
      };
      var marker = new google.maps.Marker({
        grupoId: capa.grupoId,
        position: coordenadas,
        map: map,
        icon: icon,
      });
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ latLng: marker.getPosition() }, function(
        results: any,
        status: any
      ) {
        if (status == google.maps.GeocoderStatus.OK) {
          addressMarker = results[0]['formatted_address'];
        }
        let objShape = null;

        objShape = {
          overlay: self.overlay,
          coordenadas: capa,
          tipo: 'marker',
          puntos: 1,
          addressMarker: addressMarker,
        };
        self.$emit('enableContinueEmit', objShape);
      });
      this.centerMap(latitud, longitud);
      marker.setMap(map);
      this.overlay = marker;
      this.markers.push(marker);
    }
  }

  actualizarValoresMapa() {
    //Tipo Mapa
    store.commit('setSeleccionarTipoMapa', this.mapType); //Guarda el tipo mapa en la mutación
    filtroHomeEventBus.tipoMapa = this.mapType;

    //Zoom Mapa
    const zoom: number = this.map.getZoom(); //Obtiene el zoom del mapa
    store.commit('setSeleccionarZoom', zoom); //Guarda el zoom del mapa en la mutación
    filtroHomeEventBus.zoom = zoom;

    //Centro Mapa
    const center: google.maps.LatLng = this.map.getCenter(); //Obtiene el centro del mapa
    store.commit('setSeleccionarCoordenadas', center); //Guarda el centro del mapa en la mutación
    filtroHomeEventBus.coordenadas = center;

    filtroHomeEventBus.$emit('guardarEstadoHome'); //Guarda tipo mapa, zoom y centro en la BBDD
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
}
</script>

<style scoped>
.google-map {
  width: 100%;
  height: 800px;
  margin: 0 auto;
  background: gray;
}
div.gmnoprint div:nth-child(1) {
  height: 100px;
  width: 48px;
  cursor: pointer;
}

div.gmnoprint div:nth-child(2) {
  height: 48px;
  width: 48px;
  cursor: pointer;
}

div.gmnoprint div:nth-child(3) {
  height: 48px;
  width: 48px;
  cursor: pointer;
}

.menuable__content__active {
  z-index: 1015000 !important; /*1000 !important;*/
  width: 664px !important;
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

.imageLoadingClass {
  height: 100%;
  width: 100%;
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

import config from '@/config/index';
import { EstadoTransmision } from '@/config/enums';
import { RepetirDiaVm } from '@/interfaces/RepetirDiaVm';

/*
Presuntos:
- Cada marcador siempre tiene un infoWindow asociado
- No es posible asociar más de un infoWindow a cada marcador
 */

// TODO definir tipo correcto
type VehiculoMapa = {
  id: number;
};
type MarcadorVehiculoHelpers = {
  getInfoWindow: () => google.maps.InfoWindow;
};
type MarcadorVehiculo = google.maps.Marker & {
  vehiculo: VehiculoMapa;
  helpers: MarcadorVehiculoHelpers;
};

export default class MapaVehiculos {
  readonly map: google.maps.Map;
  private marcadores: MarcadorVehiculo[] = [];

  constructor(elementId: string, mapOptions?: google.maps.MapOptions) {
    this.map = crearMapa(elementId, mapOptions);
  }

  public eliminarMarcadores() {
    eliminarMarcadores(this.marcadores);
  }

  public centrarEnMarcador(marcador: MarcadorVehiculo) {
    centrarEnMarcador(this.map, marcador);
  }
}

export const crearMapa = (
  elementId: string,
  mapOptions?: google.maps.MapOptions
) =>
  new google.maps.Map(document.getElementById(elementId), {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(-33.4372, -70.6506),
    mapTypeControl: false,
    streetViewControl: true,
    gestureHandling: 'greedy',
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    ...mapOptions,
  });

const crearInfoWindow = (
  repetirDiaVm: RepetirDiaVm,
  vehiculo: VehiculoMapa,
  onInfoWindowReady: (infoWindow: google.maps.InfoWindow) => void
) => {
  const infoWindow = new google.maps.InfoWindow({
    content: config.createInfoWindowVerDet(repetirDiaVm, vehiculo.id),
    maxWidth: 300,
  });
  google.maps.event.addListener(infoWindow, 'domready', () =>
    onInfoWindowReady(infoWindow)
  );
  return infoWindow;
};

const cerrarTodasInfoWindows = (
  infoWindows: google.maps.InfoWindow[],
  marcadores: MarcadorVehiculo[]
) => {
  /*
      TODO eliminar, solo mantenido para compatibilidad hacia atrás.
      La única manera de acceder a los infoWindows debería ser a través de su
      marcador asociado.
    */
  infoWindows.forEach(x => x.close());
  marcadores.map(x => x.helpers.getInfoWindow()).forEach(x => x.close());
};

export const crearMarcadorVehiculo = (
  map: google.maps.Map,
  marcadores: MarcadorVehiculo[],
  infoWindows: google.maps.InfoWindow[],

  latitud: number,
  longitud: number,
  repetirDiaVm: RepetirDiaVm,
  vehiculo: VehiculoMapa,
  onInfoWindowReady: (infoWindow: google.maps.InfoWindow) => void,
  markerOptions: google.maps.MarkerOptions
) => {
  const infoWindow = crearInfoWindow(repetirDiaVm, vehiculo, onInfoWindowReady);

  const helpers = {
    getInfoWindow: () => infoWindow,
  };
  const marcador: MarcadorVehiculo = Object.assign(
    new google.maps.Marker({
      position: { lat: latitud, lng: longitud },
      map,
      icon: config.getIconoMarker(EstadoTransmision.SinTransmitir),
      ...markerOptions,
    }),
    { vehiculo, helpers }
  );

  google.maps.event.addListener(marcador, 'spider_click', () => {
    cerrarTodasInfoWindows(infoWindows, marcadores);
    infoWindow.open(map, marcador);
  });

  // TODO compatibilidad hacia atrás: eliminar después de adoptar clase MapaVehiculos
  marcadores.push(marcador);
};

export const eliminarMarcadores = (marcadores: MarcadorVehiculo[]) => {
  marcadores.forEach(x => x.setMap(null));
  marcadores.length = 0;
};

export const centrarEnMarcador = (
  map: google.maps.Map,
  marcador: MarcadorVehiculo
) => {
  map.setCenter(marcador.getPosition());
  map.setZoom(14);
};

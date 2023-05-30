import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';

export default interface ActividadMarker extends google.maps.Marker {
  cleanup: () => void;
  infoWindow: google.maps.InfoWindow;
  actividad: Actividad;
}

export interface ActividadMarkerOptions extends google.maps.MarkerOptions {
  actividad: Actividad;
  infoWindow: unknown;
}

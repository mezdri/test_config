import {
  Vehiculo,
  smVehiculo,
} from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';

export default interface VehiculoMarker extends google.maps.Marker {
  /*
    Campos agregados al momento de crear el marcador deberían ser declarados en
    `VehiculoMarkerOptions`.
    Los únicos campos que podrían existir en `VehiculoMarker` exclusivamente son
    aquellos agregados después de la creación del marcador `google.maps.Marker`.
     */
  cleanup: () => void;
  infoWindow: google.maps.InfoWindow;
  isSeleccionado: boolean;
  smVehiculo: smVehiculo;
  // vehiculo: Vehiculo;
}

import Vue from 'vue';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import VehiculoMarker from '@/pantallas/Inicio/Mapa/VehiculoMarker';
import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';
import { ActividadRepetirDiaIntersection } from '@/pantallas/Inicio/ActividadesData/ActividadRepetirDiaIntersection';
import { runInThisContext } from 'vm';

export const vehiculoEvents = {
  actualizarVehiculos: 'actualizarVehiculos',
  cargarFlotaVehiculos: 'cargarFlotaVehiculos',
  seleccionar: 'seleccionarVehiculo',
  seleccionarVehiculoMarker: 'seleccionarVehiculoMarker',
  abrirDetalleVehiculo: 'abrirDetalleVehiculo',
  cerrarDetalleVehiculo: 'cerrarDetalleVehiculo',
  actualizarVehiculoSeleccionado: 'actualizarVehiculoSeleccionado',
};

class VehiculoEventBus extends Vue {
  actualizarVehiculos(vehiculos: Vehiculo[]) {
    this.$emit(vehiculoEvents.actualizarVehiculos, vehiculos);
  }

  onActualizacionVehiculos(callbackfn: (vehiculos: Vehiculo[]) => void) {
    this.$on(vehiculoEvents.actualizarVehiculos, callbackfn);
  }

  cargarFlotaVehiculos(vehiculos: any) {
    this.$emit(vehiculoEvents.cargarFlotaVehiculos, vehiculos);
  }

  onCargaFlotaVehiculos(callbackfn: (vehiculos: Vehiculo[]) => void) {
    this.$on(vehiculoEvents.cargarFlotaVehiculos, callbackfn);
  }

  seleccionar(vehiculo: Vehiculo) {
    this.$emit(vehiculoEvents.seleccionar, vehiculo);
  }

  onSeleccionar(callbackfn: (vehiculo: Vehiculo) => void) {
    this.$on(vehiculoEvents.seleccionar, callbackfn);
  }

  actualizarVehiculoSeleccionado(vehiculo: Vehiculo) {
    this.$emit(vehiculoEvents.actualizarVehiculoSeleccionado, vehiculo);
  }

  onActualizarVehiculoSeleccionado(callbackfn: (vehiculo: Vehiculo) => void) {
    this.$on(vehiculoEvents.actualizarVehiculoSeleccionado, callbackfn);
  }

  seleccionarVehiculoMarker(marker: VehiculoMarker) {
    this.$emit(vehiculoEvents.seleccionarVehiculoMarker, marker);
  }

  onSeleccionarVehiculoMarker(callbackfn: (marker: VehiculoMarker) => void) {
    this.$on(vehiculoEvents.seleccionarVehiculoMarker, callbackfn);
  }

  abrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad?: ActividadRepetirDiaIntersection,
    ultimaActividad?: ActividadRepetirDiaIntersection,
    show?: boolean,
    tabModel?: string
  ) {
    this.$emit(
      vehiculoEvents.abrirDetalleVehiculo,
      vehiculo,
      actividad,
      ultimaActividad,
      show,
      tabModel
    );
  }

  onAbrirDetalleVehiculo(
    callbackfn: (
      vehiculo: Vehiculo,
      actividad?: Actividad,
      ultimaActividad?: Actividad,
      show?: boolean,
      tabModel?: string
    ) => void
  ) {
    this.$on(vehiculoEvents.abrirDetalleVehiculo, callbackfn);
  }

  cerrarDetalleVehiculo(vehiculo: Vehiculo) {
    this.$emit(vehiculoEvents.cerrarDetalleVehiculo, vehiculo);
  }

  onCerrarDetalleVehiculo(callbackfn: (vehiculo: Vehiculo) => void) {
    this.$on(vehiculoEvents.cerrarDetalleVehiculo, callbackfn);
  }
}

export default new VehiculoEventBus();

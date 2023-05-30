import Vue from 'vue';
import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';
import ActividadMarker from '@/pantallas/Inicio/Mapa/ActividadMarker';
import { ActividadRepetirDiaIntersection } from '@/pantallas/Inicio/ActividadesData/ActividadRepetirDiaIntersection';

export const actividadEvents = {
  cargarActividades: 'cargarActividades',
  seleccionar: 'seleccionar',
  seleccionarActividadMarker: 'seleccionarActividadMarker',
  actualizarActividades: 'actualizarActividades',
};

class ActividadEventBus extends Vue {
  seleccionar(actividad: Actividad) {
    this.$emit(actividadEvents.seleccionar, actividad);
  }

  onSeleccionar(callbackfn: (actividad: Actividad) => void) {
    this.$on(actividadEvents.seleccionar, callbackfn);
  }

  seleccionarActividadMarker(actividad: ActividadMarker) {
    this.$emit(actividadEvents.seleccionarActividadMarker, actividad);
  }

  onSeleccionarActividadMarker(callbackfn: (actividad: Actividad) => void) {
    this.$on(actividadEvents.seleccionarActividadMarker, callbackfn);
  }

  actualizarActividad() {
    this.$emit(actividadEvents.actualizarActividades);
  }

  onActualizarActividad(callbackfn: () => void) {
    this.$on(actividadEvents.actualizarActividades, callbackfn);
  }

  cargarActividades(actividad: ActividadRepetirDiaIntersection[]) {
    this.$emit(actividadEvents.cargarActividades, actividad);
  }

  onCargarActividades(callbackfn: (actividad: Actividad[]) => void) {
    this.$on(actividadEvents.cargarActividades, callbackfn);
  }
}

export default new ActividadEventBus();

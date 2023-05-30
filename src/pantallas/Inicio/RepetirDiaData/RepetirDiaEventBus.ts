import Vue from 'vue';
import { RepetirDia } from '@/pantallas/Inicio/RepetirDiaData/fetchRepetirDia';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';

export const repetirDiaEvents = {
  abrirRepetirDiaHome: 'abrirRepetirDiaHome',
  cargarActividadesRepetirDia: 'cargarActividadesRepetirDia',
};

class RepetirDiaEventBus extends Vue {
  abrirRepetirDiaHome(vehiculo: Vehiculo) {
    this.$emit(repetirDiaEvents.abrirRepetirDiaHome, vehiculo);
  }

  onAbrirRepetirDiaHome(callbackfn: (vehiculo: Vehiculo) => void) {
    this.$on(repetirDiaEvents.abrirRepetirDiaHome, callbackfn);
  }

  cargarActividadesRepetirDia(actividadRepetirDia: RepetirDia[]) {
    this.$emit(
      repetirDiaEvents.cargarActividadesRepetirDia,
      actividadRepetirDia
    );
  }

  onCargarActividadesRepetirDia(
    callbackfn: (actividadRepetirDia: RepetirDia[]) => void
  ) {
    this.$on(repetirDiaEvents.cargarActividadesRepetirDia, callbackfn);
  }
}

export default new RepetirDiaEventBus();

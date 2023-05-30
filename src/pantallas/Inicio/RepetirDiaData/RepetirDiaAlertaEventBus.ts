import Vue from 'vue';
import { RepetirDiaRequest } from '@/pantallas/Inicio/RepetirDiaData/fetchRepetirDia';

export const repetirDiaAlertaEvents = {
  cargarAlertasRepetirDia: 'cargarAlertasRepetirDia',
};

class RepetirDiaAlertaEventBus extends Vue {
  cargarAlertasRepetirDia(AlertRepetirDia: RepetirDiaRequest) {
    this.$emit(repetirDiaAlertaEvents.cargarAlertasRepetirDia, AlertRepetirDia);
  }

  oncargarAlertasRepetirDia(
    callbackfn: (AlertRepetirDia: RepetirDiaRequest) => void
  ) {
    this.$on(repetirDiaAlertaEvents.cargarAlertasRepetirDia, callbackfn);
  }
}

export default new RepetirDiaAlertaEventBus();

import Vue from 'vue';

export const cortaCorrienteEvents = {
  abrirCortaCorrienteHome: 'abrirabrirCortaCorrienteHome',
};

class CortaCorrienteEventBus extends Vue {
  abrirCortaCorrienteHome(vehiculo: any) {
    this.$emit(cortaCorrienteEvents.abrirCortaCorrienteHome, vehiculo);
  }
  onAbrirCortaCorriente(callbackfn: (vehiculo: any) => void) {
    this.$on(cortaCorrienteEvents.abrirCortaCorrienteHome, callbackfn);
  }
}

export default new CortaCorrienteEventBus();

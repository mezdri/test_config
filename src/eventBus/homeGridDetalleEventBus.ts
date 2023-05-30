import Vue from 'vue';
const homeGridDetalleEventBus = new Vue();
export const homeGridDetalleEvents = {
  abrir: 'verDetalle-abrir',
  cerrar: 'verDetalle-cerrar',
};

export default homeGridDetalleEventBus;

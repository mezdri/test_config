<template>
  <DispositivosExtendidoActividad
    :id="params.data.idInterno"
    :actividad-extendida="params.data.extendida"
  />
</template>

<script>
import Vue from 'vue';
import DispositivosExtendidoActividad from './DispositivosExtendidoActividad';

export default Vue.extend({
  components: { DispositivosExtendidoActividad },
  methods: {
    /**
     * Ejecutado por ag-grid cuando la celda es actualizada
     */
    refresh() {},
  },
});
</script>

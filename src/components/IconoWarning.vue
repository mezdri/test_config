<template>
  <div
    class="text-xs-center d-flex align-center"
    style="padding-left: 1px;"
    v-if="warnPuntos || warnCirculos || warnGeocercas"
  >
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-icon
          style="padding-top: 8px; padding-left: 1px;"
          color="grey"
          dark
          v-on="on"
          >warning</v-icon
        >
      </template>
      <span>Vehículo compartido por: </span>
    </v-tooltip>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  data: function() {
    return {
      warnPuntos: true,
      warnCirculos: false,
      warnGeocercas: false,
    };
  },
  mounted() {
    // if (this.params.data.warnPuntos !== null && this.params.data.warnPuntos !== undefined) {
    //   this.warnPuntos = this.params.data.warnPuntos;
    // }
    // if (this.params.data.warnCirculos !== null && this.params.data.warnCirculos !== undefined) {
    //   this.warnCirculos = this.params.data.warnCirculos;
    // }
    // if (this.params.data.warnGeocercas !== null && this.params.data.warnGeocercas !== undefined) {
    //   this.warnGeocercas = this.params.data.warnGeocercas;
    // }
  },
});
</script>

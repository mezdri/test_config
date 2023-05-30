<template>
  <v-layout>
    <v-card class="card">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="handleCerrar()">
          <v-icon>close</v-icon>
        </v-btn>

        <v-toolbar-title>
          Detalle Vehículo:
          <span style="text-transform: uppercase;">{{ unidadVehiculo }}</span>
        </v-toolbar-title>
      </v-toolbar>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class VerDetalleModalTab extends Vue {
  @Prop({ default: '' }) unidadVehiculo: string;

  dialog = true;

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
<style scoped>
.v-icon--right {
  margin-left: 1px !important;
}
.menuable__content__active {
  z-index: 1015000 !important; /*1000 !important;*/
  width: 664px !important;
}
.theme--dark.v-btn.v-btn--disabled:not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline) {
  background-color: #526da5 !important;
}
.primary--text {
  color: #ffe800 !important;
  caret-color: #ffe800 !important;
}
.v-dialog--active {
  overflow: hidden !important;
}
.v-slider {
  font-size: 14px;
}
.card {
  width: 100%;
}
</style>

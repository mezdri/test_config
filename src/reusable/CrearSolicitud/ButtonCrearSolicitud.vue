<template>
  <span>
    <v-btn @click="handleClick()" class="btn">
      <v-icon dark left class="icon">add_circle_outline</v-icon>
      <span class="text">Crear Solicitud</span>
    </v-btn>
    <CrearSolicitudModal
      :show="mostrarModalCrear"
      @cerrar="handleCierreModalCrear"
    />
  </span>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CrearSolicitudModal from '@/pantallas/Solicitudes/CrearSolicitudModal.vue';

@Component({
  components: {
    CrearSolicitudModal,
  },
})
export default class ButtonCrearSolicitud extends Vue {
  mostrarModalCrear: boolean = false;
  handleClick() {
    this.mostrarModalCrear = true;
  }
  handleCierreModalCrear() {
    this.mostrarModalCrear = false;
  }
}
</script>
<style scoped>
.btn {
  background-color: #ffe800 !important;
  color: black !important;
  padding-right: 7px !important;
  padding-left: 7px !important;
}
.icon {
  margin-right: 3px !important;
}
.text {
  font-size: 7px !important;
}
</style>

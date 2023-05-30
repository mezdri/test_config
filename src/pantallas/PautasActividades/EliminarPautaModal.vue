<template>
  <v-card>
    <v-toolbar dark color="primary">
      <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
        >Eliminar Pauta de Actividades: {{ nombrePauta }}</v-toolbar-title
      >
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text>
      <span>{{ mensajeEliminacion }}</span>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn small color="primary" @click="handleAceptar">Aceptar</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

@Component({})
export default class EliminarPautaModal extends Vue {
  @Prop({ default: 0 }) cantidadActividades: number;
  @Prop({ default: 0 }) cantidadPlanes: number;
  @Prop({ default: '' }) nombrePauta: string;

  mensajeEliminacion: string = '';

  mounted() {
    this.handleCantidadActividades();
    this.handleCantidadPlanes();
  }

  @Watch('cantidadActividades')
  handleCantidadActividades() {
    this.makeMensajeEliminar();
  }
  @Watch('cantidadPlanes')
  handleCantidadPlanes() {
    this.makeMensajeEliminar();
  }

  makeMensajeEliminar() {
    if (this.cantidadActividades === 1 && this.cantidadPlanes === 1) {
      this.mensajeEliminacion =
        'La Pauta de Actividades tiene asociada una Actividad y está asociada a un Plan de Mantenimiento, por esta razón no se podrá realizar la eliminación.';
    } else if (this.cantidadActividades > 1 && this.cantidadPlanes > 1) {
      this.mensajeEliminacion = `La Pauta de Actividades tiene asociada ${this.cantidadActividades} Actividades y está asociada a ${this.cantidadPlanes} Planes de Mantenimiento, por esta razón no se podrá realizar la eliminación.`;
    } else if (this.cantidadActividades === 1 && this.cantidadPlanes > 1) {
      this.mensajeEliminacion = `La Pauta de Actividades tiene asociada una Actividad y está asociada a ${this.cantidadPlanes} Planes de Mantenimiento, por esta razón no se podrá realizar la eliminación.`;
    } else if (this.cantidadActividades > 1 && this.cantidadPlanes === 1) {
      this.mensajeEliminacion = `La Pauta de Actividades tiene asociada ${this.cantidadActividades} Actividades y está asociada a un Plan de Mantenimiento, por esta razón no se podrá realizar la eliminación.`;
    } else if (this.cantidadActividades === 0 && this.cantidadPlanes === 1) {
      this.mensajeEliminacion =
        'La Pauta de Actividades está asociada a un Plan de Mantenimiento, por esta razón no se podrá realizar la eliminación.';
    } else if (this.cantidadActividades === 0 && this.cantidadPlanes > 1) {
      this.mensajeEliminacion = `La Pauta de Actividades tiene ${this.cantidadPlanes} Planes de Mantenimiento asociados, por esta razón no se podrá realizar la eliminación.`;
    } else if (this.cantidadActividades === 1 && this.cantidadPlanes === 0) {
      this.mensajeEliminacion =
        'La Pauta de Actividades está asociada a una Actividad, por esta razón no se podrá realizar la eliminación.';
    } else if (this.cantidadActividades > 1 && this.cantidadPlanes === 0) {
      this.mensajeEliminacion = `La Pauta de Actividades está asociada a ${this.cantidadActividades} Actividades, por esta razón no se podrá realizar la eliminación.`;
    }
  }

  handleAceptar() {
    this.$emit('aceptar');
  }
}
</script>

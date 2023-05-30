<template>
  <div class="text-xs-center">
    <v-dialog v-model="modalMensajeValidacion" persistent :max-width="400">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title
            style="font-size:17px;margin-left: 10px !important"
            >{{ titulo }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>{{ mensaje }}</v-card-text>
        <v-card-text v-if="items">
          <ul>
            <li v-for="item in items" :key="item">{{ item }}</li>
          </ul>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#526da5" small @click="handleAceptar()">
            <span style="color: white;">Aceptar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class MensajeValidacion extends Vue {
  @Prop({ default: false }) showDialog!: boolean;
  @Prop({ default: '' }) titulo!: string;
  @Prop({ default: '' }) mensaje!: string;
  @Prop() items!: string[];

  modalMensajeValidacion: boolean = false;

  @Watch('showDialog')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.modalMensajeValidacion = value;
  }

  handleAceptar(val: boolean) {
    this.$emit('modalConfirmationEmit', val);
    this.modalMensajeValidacion = false;
  }
}
</script>

<style scoped></style>

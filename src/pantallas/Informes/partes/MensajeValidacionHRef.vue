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
        <v-card-text>
          <div style="width: 100%; ">
            <div>{{ mensaje }}</div>
            <div>{{ mensajeBot }}</div>
          </div></v-card-text
        >
        <v-card-text>
          <router-link
            v-if="href"
            active-class="router-link-active"
            style="cursor: pointer; font-size: 13px; color:blue; text-decoration:underline;"
            :to="href"
            >Ir a Histórico de informes</router-link
          >
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="btnCancelar"
            color="white"
            small
            @click="handleCancelar($event)"
          >
            <span style="color: #526da5;">Cancelar</span>
          </v-btn>
          <v-btn color="#526da5" small @click="handleAceptar($event)">
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
export default class MensajeValidacionHRef extends Vue {
  @Prop({ default: false }) showDialog!: boolean;
  @Prop({ default: '' }) titulo!: string;
  @Prop({ default: '' }) mensaje!: string;
  @Prop({ default: '' }) mensajeBot!: string;
  @Prop() href!: string;
  @Prop({ default: false }) btnCancelar!: boolean;

  modalMensajeValidacion: boolean = false;

  @Watch('showDialog')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.modalMensajeValidacion = value;
  }

  handleCancelar(val: boolean) {
    this.$emit('btnCancelar', true);
    this.modalMensajeValidacion = false;
  }

  handleAceptar(val: boolean) {
    this.$emit('btnCancelar', true);
    this.$emit('modalConfirmationEmit', val);
    this.modalMensajeValidacion = false;
  }
}
</script>

<style scoped></style>

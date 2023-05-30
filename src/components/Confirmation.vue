<template>
  <v-dialog v-model="dialog" persistent :max-width="width">
    <v-card :data-testid="testId">
      <v-toolbar dark color="primary">
        <v-toolbar-title style="font-size:17px;margin-left: 10px !important">
          {{ titulo }}
        </v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>
      <div id="alinear">
        <v-card-text v-if="!items">
          {{ mensaje }}
          <br />
          <br />
        </v-card-text>
        <div v-if="items">
          <v-card-text>
            {{ mensaje }}
          </v-card-text>
          <v-card-text v-if="items">
            <ul>
              <li v-for="item in items" :key="item">{{ item }}</li>
            </ul>
            <br />
            <br />
          </v-card-text>
        </div>
      </div>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          data-testid="v-btn--cancelar"
          color="white"
          depressed
          small
          @click="closeModal(false)"
          v-if="mostrarBoton"
        >
          <span style="color: #526da5">{{ textoBtnNo }}</span>
        </v-btn>
        <v-btn
          data-testid="v-btn--aceptar"
          color="#526da5"
          depressed
          small
          @click="closeModal(true)"
        >
          <span style="color: white;">{{ textoBtnSi }}</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Confirmation extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: 'Confirmación' }) titulo!: string;
  @Prop({ default: 'Esta seguro de ...' }) mensaje!: string;
  @Prop({ default: 'Aceptar' }) textoBtnSi!: string;
  @Prop({ default: 'Cancelar' }) textoBtnNo!: string;
  @Prop({ default: '#526da5' }) siClass!: string;
  @Prop({ default: 'error' }) noClass!: string;
  @Prop({ default: 380 }) width!: number;
  @Prop({ default: true }) mostrarBoton: boolean;
  @Prop({}) testId!: string;
  @Prop() items!: string[];

  dialog: boolean = false;

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
  }

  closeModal(val: boolean) {
    this.$emit('modalConfirmationEmit', val);
    this.dialog = false;
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>

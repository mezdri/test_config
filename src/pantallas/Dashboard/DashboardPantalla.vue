<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab @click="selectOperation">Resumen Operacional</v-tab>
      <v-tab @click="selectTransmission">Estado de transmisión</v-tab>
      <v-tab @click="selectKilometer">Kilometraje</v-tab>
    </v-tabs>
    <v-divider />
    <DashboardOs
      v-on:notifyLoad="notifyLoadOperation"
      :load="loadGraphOperation"
      v-if="tabSelected == 0"
    />
    <DashboardTs
      :load="loadGraphTransmission"
      :loadOperation="notifyLoadOp"
      v-if="tabSelected == 1"
    />
    <DashboardKi :loadOperation="notifyLoadOp" v-if="tabSelected == 2" />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import DashboardOs from '@/pantallas/Dashboard/DashboardOs.vue';
import DashboardTs from '@/pantallas/Dashboard/DashboardTs.vue';
import DashboardKi from '@/pantallas/Dashboard/DashboardKi.vue';

@Component({
  components: { DashboardOs, DashboardTs, DashboardKi },
})
export default class DispositivoPantalla extends Vue {
  tabSelected: number = 0;
  loadGraphTransmission: boolean = false;
  loadGraphOperation: boolean = false;
  notifyLoadOp: boolean = true;

  selectTransmission() {
    this.tabSelected = 1;
    this.loadGraphTransmission = true;
    this.loadGraphOperation = false;
  }
  selectOperation() {
    this.tabSelected = 0;
    this.loadGraphTransmission = false;
    this.loadGraphOperation = true;
  }
  selectKilometer() {
    this.tabSelected = 2;
    this.loadGraphTransmission = false;
    this.loadGraphOperation = false;
  }
  notifyLoadOperation(value: boolean) {
    this.notifyLoadOp = value;
  }
}
</script>

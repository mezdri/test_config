<template>
  <v-container
    fluid
    grid-list-md
    style="overflow-y: auto !important; height: 93vh;"
  >
    <v-tabs left color="transparent">
      <v-tab>{{ moduleType }}</v-tab>
    </v-tabs>
    <v-divider />
    <DashboardComponent />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CamaraDashboard from '@/pantallas/Camaras/Dashboard/CamaraDashboard.vue';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';
@Component({
  components: { DashboardComponent: CamaraDashboard },
})
export default class CamaraVODPantalla extends Vue {
  moduleType: string = '';
  created() {
    var self = this;
    CamaraEventBus.$on('reloadComponent', () => {
      //self.chargePatentsCamera();
      let url = new URL(window.location.href);
      self.changedModule();
    });
  }

  mounted() {
    this.changedModule();
  }

  changedModule() {
    let url = new URL(window.location.href);
    this.moduleType =
      url.searchParams.get('m') == null
        ? 'Monitoreo Dispositivos Cámaras'
        : 'Monitoreo Dispositivos Fatiga y Distracción';
  }
}
</script>

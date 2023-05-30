<template>
  <v-container fluid grid-list-md style="height: 89vh">
    <v-tabs left color="transparent">
      <v-tab>{{ moduleType }}</v-tab>
    </v-tabs>
    <v-divider />
    <CamaraEnVivo />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CamaraEnVivo from '@/pantallas/Camaras/EnVivo/CamaraEnVivo.vue';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';

@Component({
  components: { CamaraEnVivo },
})
export default class CamaraEnVivoPantalla extends Vue {
  moduleType: string = '';

  created() {
    var self = this;
    CamaraEventBus.$on('reloadComponentInLives', () => {
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
      url.pathname != '/camaras-envivo' ? 'En Vivo Cámaras' : 'En vivo';
  }
}
</script>

<style scoped>
.v-input__slot {
  top: 9px !important;
}
</style>

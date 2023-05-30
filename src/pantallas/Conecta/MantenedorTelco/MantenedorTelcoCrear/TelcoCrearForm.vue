<template>
  <div id="app">
    <Tabs>
      <Tab name="Telco" selected="true">
        <TelcoFormGeneral :modoVer="true" :telcoid_crear="telcoid_crear" />
      </Tab>
      <Tab name="Planes Telco">
        <TelcoFormPlanes :modoVer="true" :telcoid_crear="telcoid_crear" />
      </Tab>
      <Tab name="Apn">
        <TelcoFormApn :modoVer="true" :telcoid_crear="telcoid_crear" />
      </Tab>
      <Tab name="Stock Crítico">
        <TelcoFormStock :modoVer="true" :telcoid_crear="telcoid_crear" />
      </Tab>
    </Tabs>
  </div>
</template>

<script lang="ts">
import Tab from '../components/Tab.vue';
import Tabs from '../components/Tabs.vue';
import TelcoFormGeneral from './TelcoFormGeneral.vue';
import TelcoFormStock from './TelcoFormStock.vue';
import TelcoFormApn from './TelcoFormApn.vue';
import TelcoFormPlanes from './TelcoFormPlanes.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { fetchReportesSerie } from '../fetchReporteSerie';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { ServicioProxy } from '@/config/enums';
@Component({
  components: {
    Tab,
    Tabs,
    TelcoFormGeneral,
    TelcoFormStock,
    TelcoFormApn,
    TelcoFormPlanes,
  },
})
export default class TelcoCrearForm extends Vue {
  @Prop({ default: null }) telcoid_crear: any;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  mounted() {
    console.log('Desde el principal', this.telcoid_crear);
  }
}
</script>

<style>
#app {
  font-family: 'Asap', sans-serif !important;
  margin-top: 30px;
}
</style>

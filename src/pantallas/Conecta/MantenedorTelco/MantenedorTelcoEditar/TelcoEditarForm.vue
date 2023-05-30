<template>
  <div id="app">
    <Tabs>
      <Tab name="Telco" selected="true">
        <TelcoFormGeneral
          :modoVer="true"
          :telcoid="telcoid"
          :telconame="telconame"
          :telcoprefix="telcoprefix"
          :usuarioID="usuarioID"
        />
      </Tab>
      <Tab name="Planes Telco">
        <TelcoFormPlanes :modoVer="true" :telcoid="telcoid" />
      </Tab>
      <Tab name="Apn">
        <TelcoFormApn :modoVer="true" :telcoid="telcoid" />
      </Tab>
      <Tab name="Stock Crítico">
        <TelcoFormStock :modoVer="true" :telcoid="telcoid" />
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
export default class TelcoEditarForm extends Vue {
  @Prop({ default: null }) telcoid: any;
  @Prop({ default: null }) telconame: any;
  @Prop({ default: null }) telcoprefix: any;
  @Prop({ default: null }) usuarioID: any;
}
</script>

<style>
#app {
  font-family: 'Asap', sans-serif !important;
  margin-top: 30px;
}
</style>

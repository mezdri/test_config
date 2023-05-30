<template>
  <div id="app">
    <Tabs>
      <Tab name="Detalle General" selected="true">
        <SimNumeroFormGeneral
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
        />
      </Tab>
      <Tab name="Desactivadores">
        <SimDesactivadoresForm
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :simestadolistSeleccionado="simestadolistSeleccionado"
        />
      </Tab>
      <Tab name="Equipo Activado">
        <EquipoActivoForm
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
        />
      </Tab>
      <Tab name="Movimientos">
        <SimMovimientosForm
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
        />
      </Tab>
    </Tabs>
  </div>
</template>

<script lang="ts">
import Tab from '@/pantallas/ReportesSerie/components/Tab.vue';
import Tabs from '@/pantallas/ReportesSerie/components/Tabs.vue';
import SimNumeroFormGeneral from './SimNumeroFormGeneral.vue';
import EquipoActivoForm from './EquipoActivoForm.vue';
import SimMovimientosForm from './SimMovimientosForm.vue';
import SimDesactivadoresForm from './SimDesactivadoresForm.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
  components: {
    Tab,
    Tabs,
    SimNumeroFormGeneral,
    EquipoActivoForm,
    SimMovimientosForm,
    SimDesactivadoresForm,
  },
})
export default class InventarioSimForm extends Vue {
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  @Prop({ default: null }) simestadolistSeleccionado: any;
}
</script>

<style>
#app {
  font-family: 'Asap', sans-serif !important;
  margin-top: 30px;
}
</style>

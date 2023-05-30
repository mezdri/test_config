<template>
  <div id="app">
    <Tabs>
      <Tab name="Información General" selected="true">
        <SerieNumeroFormGeneral
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
        />
      </Tab>
      <Tab name="Detalle de Preparación">
        <SerieNumeroFormSerieActiva
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
          :serieactivanroSeleccionado="serieactivanroSeleccionado"
        />
      </Tab>
      <Tab name="Devolución a Bodega">
        <SerieNumeroFormDevolucionBodega
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
          :serieactivanroSeleccionado="serieactivanroSeleccionado"
        />
      </Tab>
      <Tab name="Movimientos de Dispositivos">
        <SerieNumeroFormMovimientoDispositivos
          :modoVer="true"
          :serieNumeroSeleccionado="serieNumeroSeleccionado"
          :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
        />
      </Tab>
    </Tabs>
  </div>
</template>

<script lang="ts">
import Tab from './components/Tab.vue';
import Tabs from './components/Tabs.vue';
import SerieNumeroFormGeneral from './SerieNumeroFormGeneral.vue';
import SerieNumeroFormDevolucionBodega from './SerieNumeroFormDevolucionBodega.vue';
import SerieNumeroFormSerieActiva from './SerieNumeroFormSerieActiva.vue';
import SerieNumeroFormMovimientoDispositivos from './SerieNumeroFormMovimientoDispositivos.vue';
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    Tab,
    Tabs,
    SerieNumeroFormGeneral,
    SerieNumeroFormDevolucionBodega,
    SerieNumeroFormSerieActiva,
    SerieNumeroFormMovimientoDispositivos,
  },
})
export default class SerieNumeroForm extends Vue {
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  @Prop({ default: null }) serieactivanroSeleccionado: any;
}
</script>

<style>
#app {
  font-family: 'Asap', sans-serif !important;
  margin-top: 30px;
}
.ReportesSerieMovimientos
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(3)
  > div:nth-child(1) {
  display: none;
}
.ReportesSerieMovimientos
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
</style>

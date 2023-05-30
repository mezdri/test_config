<template>
  <PasoAsociacion title="Tipos de Actividad">
    <v-divider></v-divider>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
        />
      </template>
    </CabeceraTabla>
    <TiposActividadGrid
      :readonly="modoVer"
      :esEditar="modoEditar"
      :value="value"
      @input="handleValueChange"
      @gridApiChange="handleGridApiChange"
    />
  </PasoAsociacion>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';

import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import TiposActividadGrid, {
  GridApiChangeEvent,
  Value,
} from '@/reusable/TiposActividad/TiposActividadGrid.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';

@Component({
  components: {
    CabeceraTabla,
    BuscadorOperacionCrud,
    PasoAsociacion,
    TiposActividadGrid,
    StepTitle,
  },
})
export default class TiposActividad extends Vue {
  /**
   * Puente de valor a <TiposActividadGrid>
   */
  @Prop({}) value: Value;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: false }) modoVer: boolean;

  gridApi: GridApiChangeEvent = null;

  @Emit('input')
  handleValueChange(value: Value) {
    return value;
  }

  handleGridApiChange(event: GridApiChangeEvent) {
    this.gridApi = event;
  }
}
</script>

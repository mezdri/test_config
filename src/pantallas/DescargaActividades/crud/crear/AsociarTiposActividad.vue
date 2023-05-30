<template>
  <div>
    <StepTitle>Asociar Actividades</StepTitle>
    <v-divider></v-divider>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
        />
      </template>
    </CabeceraTabla>
    <TiposActividadGrid
      :value="value"
      :readonly="readonly"
      @input="handleValueChange"
      @gridApiChange="handleGridApiChange"
      :esEditar="esEditar"
    />
  </div>
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
export default class AsociarTiposActividad extends Vue {
  /**
   * Puente de valor a <TiposActividadGrid>
   */
  @Prop({}) readonly value: Value;
  @Prop({ default: false }) readonly readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;

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

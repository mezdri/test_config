<template>
  <MantenedorGrid
    v-bind="{ ...$props, ...$attrs }"
    :grid-options="enrichedGridOptions"
  />
</template>

<script lang="ts">
import { ColDef, GridOptions } from 'ag-grid-community';
import { Vue, Prop, Component } from 'vue-property-decorator';

import MantenedorGrid from './MantenedorGrid.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({ components: { MantenedorGrid } })
export default class MantenedorGridSinCodigo extends Vue {
  @Prop({ default: {} }) readonly gridOptions: GridOptions;
  @Prop({ required: true }) readonly funcionalidadId: Funcionalidades;
  @Prop({}) readonly lastColumnDef: ColDef;
  @Prop({}) readonly codigoColumnField: string;

  get enrichedGridOptions() {
    return {
      ...this.gridOptions,
      columnDefs: [
        {
          ...checkboxColumnDef,
          cellStyle: { 'pointer-events': 'none' },
        },
        ...this.gridOptions.columnDefs,
        this.lastColumnDef || makeAccionesColumnDef(this.funcionalidadId),
      ],
    };
  }
}
</script>

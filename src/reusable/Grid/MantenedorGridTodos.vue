<template>
  <div>
    <v-divider></v-divider>
    <MantenedorGrid
      v-bind="{ ...$props, ...$attrs }"
      :grid-options="enrichedGridOptions"
    />
  </div>
</template>

<script lang="ts">
import { ColDef, GridOptions } from 'ag-grid-community';
import { Vue, Prop, Component, Emit, Watch } from 'vue-property-decorator';

import MantenedorGrid from './MantenedorGrid.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({ components: { MantenedorGrid } })
export default class MantenedorGridTodos extends Vue {
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
        {
          headerName: 'Código',
          field: this.codigoColumnField || 'id',
          hide: true,
          // No son permitidas búsquedas por código
          getQuickFilterText: () => '',
        },
        ...this.gridOptions.columnDefs,
        this.lastColumnDef || makeAccionesColumnDef(this.funcionalidadId),
      ],
    };
  }

  @Watch('enrichedGridOptions', { deep: true, immediate: true })
  @Emit('gridOptionsEnriched')
  onGridOptionsEnriched() {
    return this.enrichedGridOptions;
  }
}
</script>

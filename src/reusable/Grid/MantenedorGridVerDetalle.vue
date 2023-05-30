<template>
  <MantenedorGrid
    v-bind="{ ...$props, ...$attrs }"
    :grid-options="enrichedGridOptions"
  />
</template>

<script lang="ts">
import { GridOptions, ColDef } from 'ag-grid-community';
import { Vue, Prop, Component } from 'vue-property-decorator';

import MantenedorGrid from './MantenedorGrid.vue';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

@Component({ components: { MantenedorGrid } })
export default class MantenedorGridVerDetalle extends Vue {
  @Prop({ default: {} }) readonly gridOptions: GridOptions;

  get enrichedGridOptions() {
    return {
      ...this.gridOptions,
      // Ver detalle no lleva checkboxes
      columnDefs: this.gridOptions.columnDefs.filter(
        (x: ColDef) => x.field !== checkboxColumnDef.field
      ),
    };
  }
}
</script>

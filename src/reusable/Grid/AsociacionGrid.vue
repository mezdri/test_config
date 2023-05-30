<template>
  <MantenedorGrid
    v-bind="{ ...$props, ...$attrs }"
    :grid-options="enrichedGridOptions"
  />
</template>

<script lang="ts">
import { GridOptions, SelectionChangedEvent, RowNode } from 'ag-grid-community';
import { Vue, Prop, Component } from 'vue-property-decorator';

import MantenedorGrid from './MantenedorGrid.vue';
import {
  checkboxColumnDefAsoEditar,
  checkboxColumnDefAsoCrear,
} from '@/reusable/Grid/aggridColumnDefUtils';

@Component({ components: { MantenedorGrid } })
export default class AsociacionGrid extends Vue {
  @Prop({ default: {} }) readonly gridOptions: GridOptions;
  @Prop({ default: true }) readonly headerCheckbox: boolean;
  @Prop({ default: false }) readonly esEditar: boolean;

  get enrichedGridOptions() {
    return {
      ...this.gridOptions,
      columnDefs: [
        {
          ...(this.esEditar
            ? checkboxColumnDefAsoEditar
            : checkboxColumnDefAsoCrear),
          headerCheckboxSelection: this.headerCheckbox,
        },
        ...this.gridOptions.columnDefs,
      ],
      onSelectionChanged: this.handleSelectionChanged,
    };
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    let selectedRowData: any[] = [];
    let unselectedRowData: any[] = [];
    event.api.forEachNode((row: RowNode) => {
      if (row.isSelected()) {
        row.data.checked = true;
        selectedRowData.push(row.data);
      } else {
        row.data.checked = false;
        unselectedRowData.push(row.data);
      }
    });

    event.api.updateRowData({
      update: [...selectedRowData, ...unselectedRowData],
    });

    if (this.gridOptions.onSelectionChanged) {
      this.gridOptions.onSelectionChanged(event);
    }
  }
}
</script>

<template>
  <div>
    <ag-grid-vue
      style="width: 100%; height: 400px;font-family: 'Asap', sans-serif;"
      class="ag-theme-material"
      v-bind="$attrs"
      :grid-options="mergedGridOptions"
      :data-testid="computedTestId"
    />
  </div>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import {
  GridOptions,
  ColDef,
  GridReadyEvent,
  SortChangedEvent,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
} from 'ag-grid-community';
import { Vue, Prop, Component } from 'vue-property-decorator';

import config from '@/config/index';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import store from '@/store';
import moment from 'moment';
import { isNil } from 'lodash';

const customComparator = (
  valueA: string | number | moment.Moment,
  valueB: string | number | moment.Moment
) => {
  const formatMoment = (x: moment.Moment) => x.format('YYYY-MM-DD-T');
  if (valueA instanceof moment) {
    valueA = formatMoment(valueA as moment.Moment);
  }
  if (valueB instanceof moment) {
    valueB = formatMoment(valueB as moment.Moment);
  }
  valueA = isNil(valueA) ? '' : valueA.toString();
  valueB = isNil(valueB) ? '' : valueB.toString();

  return valueA
    .toLowerCase()
    .localeCompare(valueB.toLowerCase(), 'es', { numeric: true });
};

const makeDefaultColumnDef = (columnDef: ColDef): ColDef => ({
  hide: true,
  minWidth: 80,
  lockPinned: true,
  lockVisible: false,
  resizable: true,
  // comparator: customComparator,
  sortable: true,
  ...columnDef,
});

@Component({ components: { 'ag-grid-vue': AgGridVue } })
export default class Grid extends Vue {
  @Prop({ default: {} }) readonly gridOptions: GridOptions;
  @Prop({}) readonly funcionalidadId: Funcionalidades;
  @Prop({}) readonly testId: string;

  agGridUtil: AgGridUtil;
  defaultGridOptions: GridOptions = {
    rowSelection: 'single',
    rowHeight: 35,
    headerHeight: 45,
    blockLoadDebounceMillis: 350,
    localeText: config.agGridTextos,
    suppressCsvExport: true,
    suppressExcelExport: true,
  };

  handleGridReady(event: GridReadyEvent) {
    if (this.gridOptions.onGridReady) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onGridReady(event);
    }

    if (!this.funcionalidadId) {
      return;
    }
    this.agGridUtil = new AgGridUtil(event.api, event.columnApi, {
      id: 0,
      grilla: '',
      usuarioId: store.state.userId,
      funcionalidades: this.funcionalidadId,
    });
    this.agGridUtil.recuperarEstadoGrilla();
  }

  handleSortChange(event: SortChangedEvent) {
    if (this.gridOptions.onSortChanged) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onSortChanged(event);
    }

    this.guardarEstadoServidor();
  }

  handleDragStopped(event: DragStoppedEvent) {
    if (this.gridOptions.onDragStopped) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onDragStopped(event);
    }

    this.guardarEstadoServidor();
  }

  handleColumnVisible(event: ColumnVisibleEvent) {
    if (this.gridOptions.onColumnVisible) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onColumnVisible(event);
    }

    this.guardarEstadoServidor();
  }

  handleColumnPinned(event: ColumnPinnedEvent) {
    if (this.gridOptions.onColumnPinned) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onColumnPinned(event);
    }

    this.guardarEstadoServidor();
  }

  guardarEstadoServidor() {
    if (this.agGridUtil) {
      this.agGridUtil.guardarEstadoGrilla();
    }
  }

  get mergedGridOptions() {
    return {
      ...this.defaultGridOptions,
      ...this.gridOptions,
      columnDefs: this.gridOptions.columnDefs.map(makeDefaultColumnDef),
      // onDragStopped: this.handleDragStopped,
      // onColumnVisible: this.handleColumnVisible,
      // onColumnPinned: this.handleColumnPinned,
      // // onGridReady: this.handleGridReady,
      // onSortChanged: this.handleSortChange,
    };
  }

  get computedTestId() {
    const { testId } = this;
    return testId ? `${testId}__Grid` : '';
  }
}
</script>

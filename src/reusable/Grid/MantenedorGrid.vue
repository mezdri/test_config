<template>
  <div ref="container">
    <v-card>
      <ag-grid-vue
        class="ag-theme-material estilo-grilla"
        v-bind="$attrs"
        :grid-options="mergedGridOptions"
        :data-testid="computedTestId"
        :row-data="rowData"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import {
  GridOptions,
  ColDef,
  GridReadyEvent,
  SortChangedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  GridApi,
  ColumnApi,
  ModelUpdatedEvent,
  RowDataChangedEvent,
  ValueFormatterParams,
  DisplayedColumnsChangedEvent,
} from 'ag-grid-community';
import { Vue, Prop, Component } from 'vue-property-decorator';
import { isNil, debounce } from 'lodash';

import config from '@/config/index';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import store from '@/store';
import { EstadoGrilla } from '@/agGridUtil/EstadoGrilla';
import moment from 'moment';
import { LoadingService } from '../../services/loadingService';

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

const defaultValueFormatter = (params: ValueFormatterParams) => {
  if (params.value instanceof moment) {
    return (params.value as moment.Moment).format('DD/MM/YYYY');
  }
  return params.value;
};

const makeDefaultColumnDef = (columnDef: ColDef): ColDef => {
  const { cellStyle, ...rest } = columnDef;

  return {
    resizable: true,
    sortable: true,
    lockPinned: true,
    comparator: customComparator,
    cellStyle: { textAlign: 'left', ...cellStyle },
    valueFormatter: defaultValueFormatter,
    ...rest,
  };
};

@Component({ components: { 'ag-grid-vue': AgGridVue } })
export default class MantenedorGrid extends Vue {
  @Prop({ default: {} }) readonly gridOptions: GridOptions;
  @Prop({ default: (): [] => [] }) readonly rowData: any[];
  @Prop({}) readonly funcionalidadId: Funcionalidades;
  @Prop({}) readonly testId: string;

  gridApi: GridApi = null;
  columnApi: ColumnApi;
  agGridUtil: AgGridUtil;
  defaultGridOptions: GridOptions = {
    rowSelection: 'multiple',
    blockLoadDebounceMillis: 350,
    localeText: config.agGridTextos,
    suppressRowClickSelection: true,
    suppressCsvExport: true,
    suppressExcelExport: true,
    pagination: true,
    paginationPageSize: 5,
    /*
    Sobreescribir desde consumidor en caso de tablas con muchas columnas no
    renderizadas o impacto en rendimiento.
    Ver: https://www.ag-grid.com/javascript-grid-resizing/
     */
    suppressColumnVirtualisation: true,
  };
  estadoServidor: EstadoGrilla = null;
  guardarEstadoServidor: () => void = () => undefined;

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.cargarEstadoDesdeServidor(event.api, event.columnApi);
    this.autoSizeAllColumns();

    if (this.gridOptions.onGridReady) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onGridReady(event);
    }
  }

  cargarEstadoDesdeServidor(gridApi: GridApi, columnApi: ColumnApi) {
    if (!this.funcionalidadId) {
      return;
    }
    this.agGridUtil = new AgGridUtil(gridApi, columnApi, {
      id: 0,
      grilla: '',
      usuarioId: store.state.userId,
      funcionalidades: this.funcionalidadId,
    });
    this.agGridUtil
      .recuperarEstadoGrilla()
      .then((estadoServidor: EstadoGrilla) => {
        this.estadoServidor = estadoServidor;
      });
    this.guardarEstadoServidor = debounce(() => {
      if (this.agGridUtil) {
        this.agGridUtil.guardarEstadoGrilla();
      }
    }, 1000);
  }

  handleSortChange(event: SortChangedEvent) {
    this.guardarEstadoServidor();

    if (this.gridOptions.onSortChanged) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onSortChanged(event);
    }
  }

  handleColumnVisible(event: ColumnVisibleEvent) {
    this.autoSizeAllColumns();

    if (this.gridOptions.onColumnVisible) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onColumnVisible(event);
    }
  }

  handleColumnPinned(event: ColumnPinnedEvent) {
    this.guardarEstadoServidor();

    if (this.gridOptions.onColumnPinned) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onColumnPinned(event);
    }
  }

  handleModelUpdated(event: ModelUpdatedEvent) {
    if (!this.gridApi) {
      return;
    }
    if (this.gridOptions.rowModelType === 'serverSide') {
      return;
    }
    //@ts-ignore
    if (eval('this.gridApi.rowModel.rowsToDisplay.length == 0')) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }

    if (this.gridOptions.onModelUpdated) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onModelUpdated(event);
    }
  }

  handleRowDataChange(event: RowDataChangedEvent) {
    if (this.estadoServidor) {
      return;
    }
    // Permitir a ag-grid tiempo de renderizar el nuevo conjunto de filas
    setTimeout(this.autoSizeAllColumns);
    /* `columnApi.autoSizeColumns()` calcula anchos en base a filas visibles.
     * La tabla podría no ser visible al momento de ser ejecutado este watcher,
     * lo que provocaría que ag-grid calculara valores por omisión para filas
     * no visibles.
     * Es necesario esperar a que el próximo ancestro con directiva "v-show"
     * cambie su estado a mostrado para poder solicitar a ag-grid un nuevo
     * calculo de tamaño.
     */
    this.onNearestAncestorDisplayed(this.autoSizeAllColumns);

    if (this.gridOptions.onRowDataChanged) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onRowDataChanged(event);
    }
  }

  handleDisplayedColumnsChanged(event: DisplayedColumnsChangedEvent) {
    this.guardarEstadoServidor();

    if (this.gridOptions.onDisplayedColumnsChanged) {
      // No sobreescribir callback de consumidor
      this.gridOptions.onDisplayedColumnsChanged(event);
    }
  }

  /* util */

  /**
   * Escucha cambios en propiedad "style" del ancestro no visible más próximo,
   * esperando a que "style" sea distinto a "none", asumiendo que cambió
   * producto de directiva "v-show" y ejecutando función "callback".
   * @param callback
   */
  onNearestAncestorDisplayed(callback: () => void) {
    const container = this.$refs.container as HTMLElement;
    const getFirstHiddenAncestor = (e: HTMLElement): HTMLElement | null => {
      if (!e) {
        return null;
      }
      if (e.style.display === 'none') {
        return e;
      }
      return getFirstHiddenAncestor(e.parentElement);
    };

    const hiddenAncestor = getFirstHiddenAncestor(container);
    if (!hiddenAncestor) {
      return;
    }

    const handleMutation: MutationCallback = (mutationsList, observer) => {
      const matchingMutations = mutationsList.filter(
        x =>
          x.type === 'attributes' &&
          x.attributeName === 'style' &&
          /* Solo reaccionar a mutaciones que provocaron que la propiedad
           * "display" fuese restablecida. Esto ocurre cuando un ancestro con
           * directiva "v-show" previamente establecida como "true" es cambiada
           * por un valor "false". */
          hiddenAncestor.style.display !== 'none'
      );
      if (matchingMutations.length > 0) {
        callback();
        /* En primera instancia solo reaccionar a la primera mutación parece
         * ser es suficiente para cubrir el caso de tablas no mostradas por
         * v-show de un ancestro. Revisar en caso de error al esconder o
         * mostrar múltiples veces. */
        observer.disconnect();
      }
    };

    const observer = new MutationObserver(handleMutation);
    observer.observe(hiddenAncestor, {
      attributes: true,
    });
  }

  autoSizeAllColumns() {
    const { columnApi } = this;
    if (!columnApi) {
      return;
    }
    //Se le quita el autosize a la columna del checkbox
    let columns = columnApi.getAllColumns();
    if (columns[0].getColId() === 'checked') {
      columns.splice(0);
    }
    columnApi.autoSizeColumns(columns);
  }

  get mergedGridOptions() {
    return {
      ...this.defaultGridOptions,
      ...this.gridOptions,
      columnDefs: this.gridOptions.columnDefs.map(makeDefaultColumnDef),
      onColumnVisible: this.handleColumnVisible,
      onColumnPinned: this.handleColumnPinned,
      onGridReady: this.handleGridReady,
      onSortChanged: this.handleSortChange,
      onModelUpdated: this.handleModelUpdated,
      onRowDataChanged: this.handleRowDataChange,
      onDisplayedColumnsChanged: this.handleDisplayedColumnsChanged,
    };
  }

  get computedTestId() {
    const { testId } = this;
    return testId ? `${testId}__Grid` : '';
  }
}
</script>
<style>
.estilo-grilla {
  width: 100%;
  height: 400px;
  font-family: 'Asap', sans-serif;
}

.ag-theme-material .ag-cell-inline-editing,
.ag-theme-material .ag-popup-editor {
  background: #fff !important;
}
.ag-theme-material .ag-cell-inline-editing {
  height: 48px !important;
}
</style>

<template>
  <div>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
          :prepend="'directions_car'"
        />
      </template>
    </CabeceraTabla>
    <MantenedorGridVerDetalle
      v-if="readonly"
      :grid-options="gridOptions"
      :row-data="etiquetasSeleccionadas"
    />
    <MantenedorGrid v-else :grid-options="gridOptions" :row-data="etiquetas" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowSelectedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { Etiqueta } from '@/pantallas/Recepcion/fetchFlotasEtiquetasVehiculos';
import { RowNode } from '@/reusable/Grid/aggridUtils';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

export type SelectionChangeEventParams = {
  selected: Etiqueta[];
  lastRowSelectionChanged: RowNode<Etiqueta>;
};

@Component({
  components: {
    MantenedorGridVerDetalle,
    MantenedorGrid,
    BuscadorOperacionCrud,
    CabeceraTabla,
  },
})
export default class AsociarEtiquetas extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ required: true }) etiquetas: Etiqueta[];
  @Prop({ required: true }) etiquetasSeleccionadas: Etiqueta[];
  @Prop({ default: false }) readonly: boolean;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      { ...checkboxColumnDef, headerCheckboxSelection: true },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
        lockPinned: true,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSelectionChanged,
    onRowSelected: this.handleRowSelected,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* state */

  lastRowSelectionChanged: RowNode<Etiqueta> = null;

  /* watchers */

  @Watch('etiquetasSeleccionadas')
  handleEtiquetasSeleccionadasChange(etiquetas: any[]) {
    setTimeout(() => {
      this.gridApi.forEachNode(row => {
        row.setSelected(
          !!etiquetas.find(x => x.id === row.data.id),
          undefined,
          /* Evitar gatillado de evento `SelectionChangedEvent` de ag-grid, que
        desencadenaría en emisión de evento `selectionChange` al consumidor de
        este componente y posible posterior ciclo infinito de consumidor
        enviando nuevas etiquetas seleccionadas.
        De esta manera emitimos el evento `SelectionChangedEvent`
        exclusivamente cuando el usuario interactúa con la tabla. */
          true
        );
      });
    });
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    this.handleEtiquetasSeleccionadasChange(this.etiquetasSeleccionadas);
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    const { lastRowSelectionChanged } = this;
    this.$emit('selectionChange', {
      selected: event.api.getSelectedRows(),
      lastRowSelectionChanged,
    } as SelectionChangeEventParams);
  }

  handleRowSelected(event: RowSelectedEvent) {
    this.lastRowSelectionChanged = event.node;
  }
}
</script>

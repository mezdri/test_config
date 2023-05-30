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
      :row-data="flotasSeleccionadas"
    />
    <MantenedorGrid v-else :grid-options="gridOptions" :row-data="flotas" />
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
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { Flota } from '@/pantallas/Recepcion/fetchFlotasEtiquetasVehiculos';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

@Component({
  components: {
    MantenedorGridVerDetalle,
    MantenedorGrid,
    BuscadorOperacionCrud,
    CabeceraTabla,
  },
})
export default class AsociarFlotas extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ required: true }) flotas: Flota[];
  @Prop({ required: true }) flotasSeleccionadas: Flota[];
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
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* watchers */

  @Watch('flotasSeleccionadas')
  handleFlotasSeleccionadasChange(flotas: any[]) {
    this.gridApi.forEachNode(row => {
      row.setSelected(
        !!flotas.find(x => x.id === row.data.id),
        undefined,
        /* Evitar gatillado de evento `SelectionChangedEvent` de ag-grid, que
        desencadenaría en emisión de evento `selectionChange` al consumidor de
        este componente y posible posterior ciclo infinito de consumidor
        enviando nuevas flotas seleccionadas.
        De esta manera emitimos el evento `SelectionChangedEvent`
        exclusivamente cuando el usuario interactúa con la tabla. */
        true
      );
    });
  }

  /* event handlers */
  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    this.handleFlotasSeleccionadasChange(this.flotasSeleccionadas);
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    this.$emit('selectionChange', event.api.getSelectedRows());
  }
}
</script>

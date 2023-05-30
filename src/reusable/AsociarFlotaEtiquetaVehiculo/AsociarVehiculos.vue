<template>
  <div>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
          prepend="directions_car"
        />
      </template>
    </CabeceraTabla>
    <MantenedorGridVerDetalle
      v-if="readonly"
      :grid-options="gridOptions"
      :row-data="vehiculosSeleccionados"
    />
    <AsociacionGrid
      v-else
      :grid-options="gridOptions"
      :row-data="vehiculos"
      :esEditar="esEditar"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  SelectionChangedEvent,
  ColDef,
} from 'ag-grid-community';
import { Vehiculo } from './fetchFlotasEtiquetasVehiculos';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';

@Component({
  components: {
    AsociacionGrid,
    MantenedorGridVerDetalle,
    BuscadorOperacionCrud,
    CabeceraTabla,
  },
})
export default class AsociarVehiculos extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ required: true }) vehiculos: Vehiculo[];
  @Prop({ required: true }) vehiculosSeleccionados: Vehiculo[];
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: (): [] => [] }) columnDefs: Array<ColDef>;
  @Prop({ default: false }) show: boolean;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: this.columnDefs,
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSelectionChanged,
    onRowDataChanged: this.handleDataGridChange,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* watchers */
  cont: number = 0;
  @Watch('vehiculosSeleccionados')
  handleVehiculosSeleccionadosChange(vehiculos: any[]) {
    if (!this.gridApi || this.readonly) {
      return;
    }
    this.gridApi.forEachNode(row => {
      if (this.cont === 0) {
        row.setSelected(vehiculos.some(x => x.id === row.data.id));
        if (vehiculos.some(x => x.id === row.data.id)) {
          this.cont++;
        }
      } else {
        row.setSelected(
          !!vehiculos.find(x => x.id === row.data.id),
          undefined,
          /* Evitar gatillado de evento `SelectionChangedEvent` de ag-grid, que
          desencadenaría en emisión de evento `selectionChange` al consumidor de
          este componente y posible posterior ciclo infinito de consumidor
          enviando nuevos vehiculos seleccionados.
          De esta manera emitimos el evento `SelectionChangedEvent`
          exclusivamente cuando el usuario interactúa con la tabla. */
          true
        );
      }
    });
    this.cont = 0;
  }

  @Watch('show')
  handleShowChange() {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.refreshHeader();
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    this.handleVehiculosSeleccionadosChange(this.vehiculosSeleccionados);
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    this.$emit('selectionChange', event.api.getSelectedRows());
  }

  handleDataGridChange() {
    this.handleVehiculosSeleccionadosChange(this.vehiculosSeleccionados);
  }
}
</script>

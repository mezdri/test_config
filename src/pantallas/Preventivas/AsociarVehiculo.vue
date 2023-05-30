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
    <div align="left">
      <MantenedorGridVerDetalle
        v-if="readonly"
        :grid-options="gridOptions"
        :row-data="vehiculosSeleccionados"
      />
      <MantenedorGrid
        v-else
        :grid-options="gridOptions"
        :row-data="vehiculos"
      />
    </div>
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
import { Vehiculo } from '@/pantallas/Preventivas/fetchVehiculos';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

@Component({
  components: {
    MantenedorGridVerDetalle,
    MantenedorGrid,
    BuscadorOperacionCrud,
    CabeceraTabla,
  },
})
export default class AsociarVehiculo extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ required: true }) vehiculos: Vehiculo[];
  @Prop({ required: true }) vehiculosSeleccionados: Vehiculo[];
  @Prop({ default: false }) readonly: boolean;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      { ...checkboxColumnDef },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockVisible: true,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'referencia',
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
      },
      {
        headerName: 'Año',
        field: 'ano',
      },
    ].map(x => ({ width: 200, ...x })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSelectionChanged,
    rowSelection: 'single',
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* watchers */

  @Watch('vehiculosSeleccionados')
  handleVehiculosSeleccionadosChange(vehiculos: any[]) {
    this.gridApi.forEachNode(row => {
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
    });
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    this.handleVehiculosSeleccionadosChange(this.vehiculosSeleccionados);
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    this.$emit('selectionChange', event.api.getSelectedRows());
  }
}
</script>

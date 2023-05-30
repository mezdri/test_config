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
      :row-data="flotasSeleccionadas"
    />
    <AsociacionGrid
      v-else
      :grid-options="gridOptions"
      :row-data="flotas"
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
} from 'ag-grid-community';
import { Flota } from '../AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
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
export default class AsociarFlotasIndividual extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ required: true }) flotas: Flota[];
  @Prop({ required: true }) flotasSeleccionadas: Flota[];
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) show: boolean;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
        suppressMovable: true,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSelectionChanged,
    onRowDataChanged: this.handleRowDataChange,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* watchers */
  cont: number = 0;
  @Watch('flotasSeleccionadas')
  handleFlotasSeleccionadasChange(flotas: any[]) {
    if (!this.gridApi || this.readonly) {
      return;
    }
    this.gridApi.forEachNode(row => {
      if (this.cont === 0) {
        row.setSelected(flotas.some(x => x.id === row.data.id));
        if (flotas.some(x => x.id === row.data.id)) {
          this.cont++;
        }
      } else {
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
      }
    });
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
    this.handleFlotasSeleccionadasChange(this.flotasSeleccionadas);
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    this.$emit('selectionChange', event.api.getSelectedRows());
  }

  handleRowDataChange() {
    if (this.flotasSeleccionadas) {
      this.handleFlotasSeleccionadasChange(this.flotasSeleccionadas);
      this.handleShowChange();
    }
  }
}
</script>

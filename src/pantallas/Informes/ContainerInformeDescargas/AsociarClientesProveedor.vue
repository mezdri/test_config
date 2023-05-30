<template>
  <div>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
          prepend="lock_open"
        />
      </template>
    </CabeceraTabla>
    <MantenedorGridVerDetalle
      v-if="readonly"
      :grid-options="gridOptions"
      :row-data="infoClientesProveedorAsignados"
    />
    <AsociacionGrid
      v-else
      :grid-options="gridOptions"
      :row-data="listadoClientesProveedor"
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

import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import { clienteProveedorBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';

@Component({
  components: {
    AsociacionGrid,
    MantenedorGridVerDetalle,
    BuscadorOperacionCrud,
    CabeceraTabla,
  },
})
export default class AsociarClientesProveedor extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ required: true }) listadoClientesProveedor: any[];
  @Prop({ required: true })
  infoClientesProveedorAsignados: clienteProveedorBackend[];
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) show: boolean;
  @Prop({ required: true }) esInformeProgramado: boolean;

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

  cont: number = 0;

  /* watchers */
  @Watch('infoClientesProveedorAsignados')
  handleClientesProveedorSeleccionadosChange(
    clienteProveedor: clienteProveedorBackend[]
  ) {
    if (!this.gridApi || this.readonly) {
      return;
    }

    if (clienteProveedor.length < 1) {
      if (this.esInformeProgramado) {
        this.gridApi.deselectAll();
      }
      return;
    }

    this.gridApi.forEachNode(row => {
      if (this.cont === 0) {
        row.setSelected(
          clienteProveedor.some(x => x.clienteProveedorId === row.data.id)
        );
        if (clienteProveedor.some(x => x.clienteProveedorId === row.data.id)) {
          this.cont++;
        }
      } else {
        row.setSelected(
          !!clienteProveedor.find(x => x.clienteProveedorId === row.data.id),
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
    this.handleClientesProveedorSeleccionadosChange(
      this.infoClientesProveedorAsignados
    );
  }

  handleSelectionChanged(event: SelectionChangedEvent) {
    this.$emit('selectionChange', event.api.getSelectedRows());
  }

  handleRowDataChange() {
    if (this.infoClientesProveedorAsignados) {
      this.handleClientesProveedorSeleccionadosChange(
        this.infoClientesProveedorAsignados
      );
      this.handleShowChange();
    }
  }
}
</script>

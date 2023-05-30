<template>
  <div>
    <StepTitle>Asociar Dispositivos</StepTitle>
    <v-divider></v-divider>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
        />
      </template>
    </CabeceraTabla>
    <MantenedorGridVerDetalle
      v-if="readonly"
      :grid-options="gridOptions"
      :row-data="dispositivosSeleccionados"
    />
    <AsociacionGrid
      v-else
      :grid-options="gridOptions"
      :row-data="dispositivos"
      :esEditar="esEditar"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';

import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { RowNode } from '@/reusable/Grid/aggridUtils';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import { fetchDispositivos } from '@/reusable/Dispositivos/fetchDispositivos';
import { Dispositivo } from '@/reusable/Dispositivos/dispositivos';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

type Value = number[];

@Component({
  components: {
    MantenedorGridVerDetalle,
    StepTitle,
    AsociacionGrid,
    CabeceraTabla,
    BuscadorOperacionCrud,
    PasoAsociacion,
  },
})
export default class AsociarDispositivos extends Vue {
  /**
   * Lista de identificadores de dispositivos seleccionadas
   */
  @Prop({}) readonly value: Value;
  @Prop({ default: false }) readonly readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;

  /* state */

  gridApi: GridApi = null;
  dispositivos: Dispositivo[] = [];
  dispositivosSeleccionados: any[] = [];

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
    ],
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSelectionChanged,
    onRowDataChanged: this.handleRowDataChanged,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    this.dispositivos = (await this.fetchDispositivos()) || [];
    this.getDispositivosSeleccionados();
    this.handleValueChange();
  }

  @Emit('input')
  handleSelectionChanged() {
    return (this.gridApi.getSelectedRows() as Dispositivo[]).map(x => x.id);
  }

  handleRowDataChanged() {
    this.handleValueChange();
  }

  @Watch('value')
  handleValueChange() {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.forEachNode((node: RowNode<Dispositivo>) => {
      if (this.value.find(x => x === node.data.id)) {
        node.setSelected(true);
      }
    });
  }

  /* utils */

  getDispositivosSeleccionados() {
    this.dispositivosSeleccionados = this.dispositivos.filter(dispositivo =>
      this.value.some(seleccionado => seleccionado === dispositivo.id)
    );
  }

  async fetchDispositivos() {
    this.gridApi.showLoadingOverlay();
    return fetchDispositivos()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los dispositivos disponibles',
          })
        );
      })
      .finally(() => this.gridApi.hideOverlay());
  }
}
</script>

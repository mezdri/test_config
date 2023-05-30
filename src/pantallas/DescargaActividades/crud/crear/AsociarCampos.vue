<template>
  <PasoAsociacion title="Asociar Campos">
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
      :row-data="camposSeleccionados"
    />
    <AsociacionGrid
      v-else
      :grid-options="gridOptions"
      :row-data="campos"
      :esEditar="esEditar"
    />
  </PasoAsociacion>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';

import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import TiposActividadGrid from '@/reusable/TiposActividad/TiposActividadGrid.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Campo, fetchCampos } from './fetchCampos';
import { RowNode } from '@/reusable/Grid/aggridUtils';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

type Value = number[];

@Component({
  components: {
    MantenedorGridVerDetalle,
    AsociacionGrid,
    CabeceraTabla,
    BuscadorOperacionCrud,
    PasoAsociacion,
    TiposActividadGrid,
    StepTitle,
  },
})
export default class AsociarCampos extends Vue {
  /**
   * Lista de identificadores de campos seleccionadas
   */
  @Prop({}) readonly value: Value;
  @Prop({ default: false }) readonly readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;

  /* state */

  gridApi: GridApi = null;
  campos: Campo[] = [];
  camposSeleccionados: any[] = [];

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
        lockPinned: true,
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

    this.campos = (await this.fetchCampos()) || [];
    this.getcamposSeleccionados();
  }

  @Emit('input')
  handleSelectionChanged() {
    return (this.gridApi.getSelectedRows() as Campo[]).map(x => x.id);
  }

  handleRowDataChanged() {
    this.handleValueChange();
  }

  @Watch('value')
  handleValueChange() {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.forEachNode((node: RowNode<Campo>) => {
      if (this.value.find(x => x === node.data.id)) {
        node.setSelected(true);
      }
    });
  }

  /* utils */

  getcamposSeleccionados() {
    this.camposSeleccionados = this.campos.filter(campo =>
      this.value.some(seleccionado => seleccionado === campo.id)
    );
  }

  async fetchCampos() {
    this.loadingService.showLoading();
    return fetchCampos()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los campos disponibles',
          })
        );
      })
      .finally(this.loadingService.hideLoading);
  }
}
</script>

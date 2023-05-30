<template>
  <MantenedorGridVerDetalle
    v-if="readonly"
    :grid-options="gridOptions"
    :row-data="actividadSeleccionados"
  />
  <AsociacionGrid
    v-else
    :grid-options="gridOptions"
    :row-data="actividades"
    :esEditar="esEditar"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Snotify } from '@/snotify/Snotify';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
} from 'ag-grid-community';

import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';

import { fetchActividades } from '@/pantallas/ConfigurarBase/fetchActividades';
import { typeActividad } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { RowNode } from '@/reusable/Grid/aggridUtils';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

export type Value = number[];

export type GridApiChangeEvent = GridApi;

@Component({
  components: {
    MantenedorGridVerDetalle,
    AsociacionGrid,
  },
})
export default class TiposActividadGrid extends Vue {
  /**
   * Lista de identificadores del tipo de actividad seleccionadas
   */
  @Prop({ default: (): Value => [] }) readonly value: Value;
  @Prop({ default: false }) readonly readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;

  // TODO mejorar tipo
  actividades: typeActividad[] = [];
  actividadSeleccionados: any[] = [];
  columnApi: ColumnApi;
  gridApi: GridApi;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
      },
      {
        headerName: 'Nombre',
        field: 'tipoEvento',
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
    this.emitGridApiChange(this.gridApi);

    this.actividades = (await this.fetchActividades()) || [];
    this.tiposActividadSeleccionados();
    this.handleValueChange();
  }

  handleSelectionChanged() {
    this.$emit('input', this.gridApi.getSelectedRows().map(x => x.id));
  }

  handleRowDataChanged() {
    this.handleValueChange();
  }

  @Watch('value')
  handleValueChange() {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.forEachNode((node: RowNode<typeActividad>) => {
      if (this.value.find(x => x === node.data.id)) {
        node.setSelected(true);
      }
    });
  }

  /* utils */

  tiposActividadSeleccionados() {
    this.actividadSeleccionados = this.actividades.filter(tipoActividad =>
      this.value.some(seleccionado => seleccionado === tipoActividad.id)
    );
  }

  emitGridApiChange(event: GridApiChangeEvent) {
    this.$emit('gridApiChange', event);
  }

  async fetchActividades() {
    this.gridApi.showLoadingOverlay();
    return fetchActividades()
      .catch(() => {
        this.$t('mensajes.mensajesError.consulta', {
          entidad: 'los tipos de actividades',
        });
      })
      .finally(() => this.gridApi.hideOverlay());
  }
}
</script>

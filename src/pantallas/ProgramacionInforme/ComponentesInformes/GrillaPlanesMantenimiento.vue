<template>
  <div align="center">
    <v-card class="rounded-card mt-20">
      <v-container grid-list-md>
        <v-form class="col-md-12">
          <StepTitle>Planes Mantenimiento</StepTitle>
          <v-divider></v-divider>
          <FormFieldsContainer>
            <v-flex md6>
              <BuscadorOperacionCrud
                :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
              />
            </v-flex>
          </FormFieldsContainer>
          <div align="left">
            <v-flex>
              <MantenedorGrid
                :grid-options="gridOptionsPlanesMantencion"
              ></MantenedorGrid>
            </v-flex>
          </div>
        </v-form>
      </v-container>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import {
  fetchPlanesMantenimiento,
  IPlaneMantenimiento,
} from '../../PlanesMantenimiento/Data/fetchPlanesMantenimiento';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
    StepTitle,
  },
})
export default class GrillaPlanesMantenimiento extends Vue {
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  planesMantenimiento: IPlaneMantenimiento[] = [];

  /* aggrid */
  gridApi: GridApi = null;
  readonly gridOptionsPlanesMantencion: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handlePlanesMantenimiento,
    onSelectionChanged: this.PlanesMantenimientoSeleccionados,
  };

  /*Handles */
  async handlePlanesMantenimiento(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.planesMantenimiento = (await fetchPlanesMantenimiento()) || [];
    this.gridApi.setRowData(this.planesMantenimiento);
  }

  async fetchPlanesMantenimiento() {
    this.loadingService.showLoading();
    return fetchPlanesMantenimiento()
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la lista de planes de mantenimiento'
        );
        return [];
      })
      .finally(() => this.loadingService.hideLoading());
  }

  PlanesMantenimientoSeleccionados(event: SelectionChangedEvent) {
    const planesMantenimientosSeleccionados = event.api.getSelectedRows();
    const planesIds: number[] = planesMantenimientosSeleccionados.map(
      x => x.id
    );
    this.$emit('PlanesMantenimientoSeleccionados', planesIds);
  }
}
</script>

<style scoped></style>

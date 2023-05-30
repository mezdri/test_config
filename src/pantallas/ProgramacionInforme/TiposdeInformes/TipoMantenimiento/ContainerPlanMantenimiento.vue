<template>
  <v-card class="rounded-card mt-20">
    <v-container grid-list-md>
      <FormFieldsContainer titulo="Planes de Mantenimiento">
        <v-flex md6>
          <BuscadorOperacionCrud
            :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
          />
        </v-flex>
      </FormFieldsContainer>
      <div align="left">
        <v-flex>
          <MantenedorGridVerDetalle
            v-if="accion === 3"
            :grid-options="computedGridOptions"
            :row-data="planesMantenimiento"
          />
          <AsociacionGrid
            v-else
            :grid-options="computedGridOptions"
            :esEditar="accion === 2 ? true : false"
          />
        </v-flex>
      </div>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { fetchPlanesMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/fetchPlanesMantenimiento';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import { planMantenimientoBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

@Component({
  components: {
    TimePicker,
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
    AsociacionGrid,
    MantenedorGridVerDetalle,
  },
})
export default class ContainerVehiculosAlDia extends Vue {
  @Prop({ default: [] })
  planesManteniminetoAsignados: planMantenimientoBackend[];
  @Prop({ default: 1 }) accion: number;
  pagination: any = {
    rowsPerPage: -1,
  };
  rowsPerPage: any = [5, 10, 25, { text: 'Todos', value: -1 }];
  headers: any = [
    { text: 'Nombre', value: 'tipomantenimientotTxt', width: '500' },
  ];
  items: any = [];
  gridApi: GridApi = null;
  planesMantenimiento: any = [];
  readonly gridOptionsPlanesMantenimiento: GridOptions = {
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
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handlePlanesMantenimiento,
    onSelectionChanged: this.selectionPlanesMantenimiento,
  };

  async handlePlanesMantenimiento(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.planesMantenimiento = await fetchPlanesMantenimiento();
    this.gridApi.setRowData(this.planesMantenimiento);
    this.handlePlanesMantenimientoSeleccionadosChange(
      this.planesManteniminetoAsignados
    );
  }

  @Watch('planesManteniminetoAsignados')
  handlePlanesMantenimientoSeleccionadosChange(
    seleccionados: planMantenimientoBackend[]
  ) {
    if (seleccionados.length === 0) {
      return;
    }
    setTimeout(() => {
      this.gridApi.forEachNode(row => {
        row.setSelected(
          seleccionados.some(x => x.planMantenimientoId === row.data.id)
        );
      });

      if (this.accion === 3) {
        this.planesMantenimiento = this.gridApi.getSelectedRows();
      }
    });
  }

  selectionPlanesMantenimiento(event: SelectionChangedEvent) {
    InformeEventBus.$emit(
      'selectionPlanesMantenimiento',
      event.api.getSelectedRows()
    );

    const planesSeleccionados = event.api.getSelectedRows();
    const planesIds: number[] = planesSeleccionados.map(x => x.id);
    this.$emit('planSeleccionado', planesIds);
  }

  get computedGridOptions() {
    const {
      gridOptionsPlanesMantenimiento: { columnDefs },
    } = this;

    return this.gridOptionsPlanesMantenimiento;
  }
}
</script>

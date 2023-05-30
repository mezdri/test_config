<template>
  <v-card class="rounded-card mt-20">
    <v-container grid-list-md>
      <FormFieldsContainer titulo="Periodo de informe">
        <v-flex md2>
          <TimePicker label="Hora Desde" />
        </v-flex>
        <v-flex md2>
          <TimePicker label="Hora Hasta" />
        </v-flex>
      </FormFieldsContainer>
      <v-divider />
      <FormFieldsContainer>
        <v-flex md2 class="v-title">
          <h4>Seleccionar Periodo</h4>
        </v-flex>
        <v-flex md2>
          <v-select label="Por rango" />
        </v-flex>
        <v-flex md3>
          <DatePicker label="Desde" />
        </v-flex>
        <v-flex md2>
          <DatePicker label="Desde" />
        </v-flex>
      </FormFieldsContainer>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop } from 'vue-property-decorator';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';
import { checkboxColumnDef } from '../../../reusable/Grid/aggridColumnDefUtils';
import { fetchPlanesMantenimiento } from '../../PlanesMantenimiento/Data/fetchPlanesMantenimiento';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';

@Component({
  components: {
    TimePicker,
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
    DatePicker,
  },
})
export default class ContainerVehiculosAlDia extends Vue {
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
        ...checkboxColumnDef,
      },
      {
        headerName: 'id',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handlePlanesMantenimiento,
    //onSelectionChanged: this.handleSeleccionFlota,
  };

  async handlePlanesMantenimiento(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.planesMantenimiento = await fetchPlanesMantenimiento();
    this.gridApi.setRowData(this.planesMantenimiento);
  }
}
</script>

<style scoped>
.v-title {
  margin-top: 23px;
  font-size: 16px;
}
h4 {
  font-weight: normal;
}
</style>

<template>
  <div align="center">
    <FormFieldsContainer>
      <v-flex>
        <v-checkbox
          :label="formFields.checkSatelite.label"
          v-model="formFields.checkSatelite.value"
          @change="checkActividad"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="formFields.checkHDOP.label"
          v-model="formFields.checkHDOP.value"
          @change="checkActividad"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="formFields.checkLongYLat.label"
          v-model="formFields.checkLongYLat.value"
          @change="checkActividad"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="formFields.checkDatoConfiable.label"
          v-model="formFields.checkDatoConfiable.value"
          @change="checkActividad"
        />
      </v-flex>
    </FormFieldsContainer>
    <FormFieldsContainer>
      <v-flex md12>
        <div class="v-title" align="left">
          <h2>
            Tipo de Actividad
          </h2>
        </div>
      </v-flex>
      <v-flex md6>
        <BuscadorOperacionCrud
          :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
        />
      </v-flex>
    </FormFieldsContainer>
    <div align="left">
      <v-flex>
        <MantenedorGrid :grid-options="gridOptionsActividad"></MantenedorGrid>
      </v-flex>
    </div>
  </div>
</template>
<script lang="ts">
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { fetchTipoActividad } from './fetchTipoActividad';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
  },
})
export default class CheckActividad extends Vue {
  readonly gridOptionsActividad: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        headerCheckboxSelection: true,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'tipoEvento',
        lockVisible: true,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyActividad,
    onSelectionChanged: this.ActividadSeleccionada,
  };

  formFields: FormFieldDefMap = {
    checkSatelite: {
      label: 'Satélite',
      id: 'numero_satelites',
      value: true,
    },
    checkHDOP: {
      label: 'HDOP',
      id: 'hdop',
      value: true,
    },
    checkLongYLat: {
      label: 'Latitud y Longitud',
      id: '',
      value: true,
    },
    checkDatoConfiable: {
      label: 'Confiable',
      id: 'datoConfiable',
      value: true,
    },
  };
  headers: any = [{ text: 'Nombre', value: 'tipoEvento' }];
  pagination: any = {
    rowsPerPage: -1,
  };
  rowsPerPage: any = [5, 10, 25, { text: 'Todos', value: -1 }];
  gridApi: GridApi = null;
  tipoActividad: any = [];
  actividadesSeleccionadas: any = [];

  // async mounted() {
  //   this.tipoActividad =  await fetchTipoActividad();
  // }

  async handleReadyActividad(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.tipoActividad = await fetchTipoActividad();
    this.gridApi.setRowData(this.tipoActividad);
    this.checkActividad(); // envio valores de actividad por defecto
  }
  ActividadSeleccionada(event: SelectionChangedEvent) {
    InformeEventBus.$emit(
      'ActividadesSeleccionChanged',
      event.api.getSelectedRows()
    );
  }
  checkActividad() {
    var check = [];
    if (this.formFields.checkSatelite.value) {
      check.push(this.formFields.checkSatelite.id);
    }
    if (this.formFields.checkHDOP.value) {
      check.push(this.formFields.checkHDOP.id);
    }
    if (this.formFields.checkLongYLat.value) {
      check.push('latitud', 'longitud');
    }

    InformeEventBus.$emit('checkActividad', check);
    InformeEventBus.$emit(
      'confiable',
      this.formFields.checkDatoConfiable.value
    );
  }
}
</script>

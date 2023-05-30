<template>
  <v-card class="rounded-card mt-20">
    <!--se desctiva contenedor-->
    <v-container grid-list-md v-if="false">
      <FormFieldsContainer titulo="Planes de Mantenimiento">
        <v-flex md6>
          <BuscadorOperacionCrud
            :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
          />
        </v-flex>
      </FormFieldsContainer>
      <div align="left">
        <v-flex>
          <MantenedorGrid
            :grid-options="gridOptionsPlanesMantenimiento"
          ></MantenedorGrid>
        </v-flex>
      </div>
    </v-container>

    <!--contenedor select-->
    <v-container grid-list-md>
      <FormFieldsContainer
        titulo="Asociar Plan de Mantenimiento y Pauta de Actividades"
      >
        <slot name="prependAsociar" />
        <v-flex sm12 md6>
          <v-autocomplete
            required
            v-model="idplan"
            :disabled="readonly"
            v-validate="{
              rules: {
                required: !readonly,
              },
            }"
            :items="planesMantenimiento"
            item-text="nombre"
            item-value="id"
            no-data-text="Sin resultados"
            @change="handleChangePlan()"
          />
        </v-flex>
      </FormFieldsContainer>
    </v-container>

    <v-container grid-list-md>
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
            :grid-options="gridOptionsPlanesMantenimiento"
          ></MantenedorGrid>
        </v-flex>
      </div>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop } from 'vue-property-decorator';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '../../../reusable/Grid/aggridColumnDefUtils';
import { fetchPlanesMantenimiento } from '../../PlanesMantenimiento/Data/fetchPlanesMantenimiento';
import {
  fetchPautasActividad,
  PautaActividad,
} from '@/pantallas/Preventivas/fetchPautasActividades';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import InformeEventBus from '../partes/InformeEventBus';

@Component({
  components: {
    TimePicker,
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
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

  /**
   * se agregan variables para la pautas de actividades
   */
  pautasActividad: any[] = [];
  selectedRows: any[] = [];
  idplan: any = null;
  readonly = false;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  readonly gridOptionsPlanesMantenimiento: GridOptions = {
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
        field: 'nombre',
        lockVisible: true,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handlePlanesMantenimiento,
    //onSelectionChanged: this.selectionPlanesMantenimiento,
    onSelectionChanged: this.setSelectionPuataActividades,
  };

  async handlePlanesMantenimiento(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.planesMantenimiento = await fetchPlanesMantenimiento();
    //this.gridApi.setRowData(this.planesMantenimiento);
  }

  selectionPlanesMantenimiento(event: SelectionChangedEvent) {
    InformeEventBus.$emit(
      'selectionPlanesMantenimiento',
      event.api.getSelectedRows()
    );
  }

  /**
   * se obtiene pauta de actividades
   */
  fetchPautasActividades(idplan: number) {
    this.loadingService.showLoading();
    return fetchPautasActividad(idplan, 0)
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener las pautas de actividad`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  /**
   * se obtiene pautas relaciionadas al plan
   */
  async handleChangePlan() {
    this.pautasActividad =
      (await this.fetchPautasActividades(this.idplan)) || [];
    this.gridApi.setRowData(this.pautasActividad);
    this.setSelectionPlanMantenimiento();
  }

  /**
   * Se envia plan seleccionado al parent component
   */
  setSelectionPlanMantenimiento() {
    this.selectedRows.push(
      this.planesMantenimiento.find((x: any) => x.id === this.idplan)
    );
    InformeEventBus.$emit('selectionPlanesMantenimiento', this.selectedRows);
  }

  /**
   * Se envia la pautas al parent component
   */
  setSelectionPuataActividades(event: SelectionChangedEvent) {
    InformeEventBus.$emit(
      'selectionPutasActividades',
      event.api.getSelectedRows()
    );
  }
  /**
   * se agrega mounted para rellenar lista en inicio
   */
  async mounted() {
    this.planesMantenimiento = await fetchPlanesMantenimiento();
  }
}
</script>

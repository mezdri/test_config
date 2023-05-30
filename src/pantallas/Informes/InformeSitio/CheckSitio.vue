<template>
  <div>
    <FormFieldsContainer>
      <v-flex md3>
        <v-select
          v-model="formFields.tipoZonaSeleccionado.value"
          :items="tiposZona"
          label="Tipo de Zona"
          icon="fas fa-angle-down"
          item-text="descripcion"
          item-value="id"
          @change="setTipoZona()"
          :error-messages="errors.collect('informeRequerido')"
          v-validate="'required'"
          data-vv-name="informeRequerido"
          required
          :disabled="accion === 3"
        ></v-select>
      </v-flex>
    </FormFieldsContainer>
    <v-divider></v-divider>
    <br />
    <FormFieldsContainer>
      <v-flex md6>
        <v-text-field
          v-model="buscarAccion"
          prepend-icon="lock_open"
          label="Buscar zonas..."
          append-icon="search"
          @input="onFilterTextBoxChanged"
          :disabled="accion === 3"
        ></v-text-field>
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
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '../../../reusable/Grid/aggridColumnDefUtils';
import { fetchSitio } from './fetchSitios';
import config from '../../../config';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import InformeEventBus from '../partes/InformeEventBus';

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
  },
})
export default class CheckSitio extends Vue {
  @Prop({ default: 'Sitio' }) typeZone: string;
  @Prop({
    default(): string[] {
      return [];
    },
  })
  sitiosSeleccionados: any;
  @Prop({ default: true }) isProgrammed: boolean;
  @Prop({ default: 1 }) accion: number;
  formFields: FormFieldDefMap = {
    checkSoloResumen: {
      label: 'Sólo Resumen',
      id: 'soloResumen',
      value: false,
    },
    tipoZonaSeleccionado: {
      label: '',
      id: 'tipoZonaSeleccionado',
      value: 'Sitio',
    },
  };
  items: any = [];
  gridApi: GridApi = null;
  buscarAccion: string = '';
  sitio: any = [];
  clienteId: number = config.getClienteSesion();
  tiposZona: any[] = ['Sitio', 'Geocerca'];
  readonly gridOptionsActividad: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        headerCheckboxSelection: true,
        hide: this.isHide,
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
      {
        headerName: 'Descripción',
        field: 'descripcion',
      },
      {
        headerName: 'Nombre Cliente',
        field: 'nombreCliente',
      },
      {
        headerName: 'Grupo de Zona',
        field: 'nombreTipoLugar',
      },
      {
        headerName: 'Tipo de Zona',
        field: 'nombreTipoZona',
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadySitio,
    onSelectionChanged: this.onSelectionSitio,
    rowSelection: 'multiple',
  };

  get isHide() {
    return this.accion == 3 ? true : false;
  }

  handleZonasSeleccionadosChange(seleccionados: any) {
    if (!this.gridApi) {
      return;
    }
    setTimeout(() => {
      this.gridApi.forEachNode(row => {
        row.setSelected(seleccionados.some((x: any) => x === row.data.nombre));
      });
    });
  }

  async handleReadySitio(event: GridReadyEvent) {
    this.gridApi = event.api;
    var txt: string = '';
    this.sitio = await fetchSitio(this.clienteId);
    this.gridApi.setRowData(this.sitio.geoSitio);
    if (this.isProgrammed) {
      txt = this.formFields.tipoZonaSeleccionado.value.toString();
      this.gridApi.setQuickFilter(txt);
    } else {
      txt = this.formFields.tipoZonaSeleccionado.value.toString();
      this.gridApi.setQuickFilter(txt);
      this.handleZonasSeleccionadosChange(this.sitiosSeleccionados);
    }
  }

  @Watch('typeZone', { deep: true, immediate: true })
  onTypeZoneChanged() {
    this.formFields.tipoZonaSeleccionado.value = this.typeZone;
  }

  @Watch('sitiosSeleccionados', { deep: true, immediate: true })
  onSitiosSeleccionadosChanged() {
    //console.log(this.sitiosSeleccionados)
    //this.handleZonasSeleccionadosChange([1, 2, 3, 4])
  }

  onSelectionSitio(event: SelectionChangedEvent) {
    InformeEventBus.$emit('selectionSitio', event.api.getSelectedRows());
  }
  checkSoloResumen() {
    InformeEventBus.$emit(
      'checkSoloResumen',
      this.formFields.checkSoloResumen.value
    );
  }
  onFilterTextBoxChanged() {
    if (this.buscarAccion.length > 1) {
      this.gridApi.setQuickFilter(this.buscarAccion);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }
  setTipoZona() {
    var txt = this.formFields.tipoZonaSeleccionado.value;
    InformeEventBus.$emit(
      'typeZone',
      this.formFields.tipoZonaSeleccionado.value
    );
    if (txt == 'Todos') {
      this.gridApi.setQuickFilter('');
    } else {
      this.gridApi.setQuickFilter(txt);
    }
  }
}
</script>

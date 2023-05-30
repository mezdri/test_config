<template>
  <div>
    <FormFieldsContainer>
      <v-flex md4>
        <v-select
          v-model="formFields.tipoZonaSeleccionado.value"
          :items="tiposZona"
          label="Tipo de Zona"
          icon="fas fa-angle-down"
          item-text="descripcion"
          item-value="id"
          @change="handledTipoZona"
        ></v-select>
      </v-flex>
      <v-flex md2>
        <v-checkbox
          :label="formFields.checkSoloResumen.label"
          v-model="formFields.checkSoloResumen.value"
          :value="true"
          @change="handledSitio"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex md4>
        <v-checkbox
          :label="formFields.checkTodoTipoEvento.label"
          v-model="formFields.checkTodoTipoEvento.value"
          :value="true"
          @change="handledSitio"
          :disabled="accion === 3"
        />
      </v-flex>
    </FormFieldsContainer>

    <v-divider></v-divider>
    <br />
    <FormFieldsContainer>
      <v-flex md6>
        <v-text-field
          v-model="buscarZona"
          prepend-icon="lock_open"
          label="Buscar Tipos de Zonas..."
          append-icon="search"
          @input="onFilterTextBoxChanged"
        ></v-text-field>
      </v-flex>
    </FormFieldsContainer>

    <div align="left">
      <v-flex>
        <MantenedorGridVerDetalle
          v-if="accion === 3"
          :grid-options="computedGridOptions"
        />
        <AsociacionGrid
          v-else
          :grid-options="computedGridOptions"
          :esEditar="accion === 2 ? true : false"
        />
      </v-flex>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { checkboxColumnDef } from '../../../../reusable/Grid/aggridColumnDefUtils';
import config from '@/config/index';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import { fetchSitio } from '@/pantallas/ProgramacionInforme/TiposdeInformes/TipoSitio/fetchSitios';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import {
  FiltrosBackend,
  zonasBackend,
} from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
    AsociacionGrid,
    MantenedorGridVerDetalle,
  },
})
export default class InformeSitio extends Vue {
  @Prop({ default: [] }) filtro: FiltrosBackend[];
  @Prop({ default: [] }) zonasAsignadas: zonasBackend[];
  @Prop({ default: 1 }) accion: number;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  readonly gridOptionsSitio: GridOptions = {
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
    onGridReady: this.onGridReadySitio,
    onSelectionChanged: this.zonasSeleccionadas,
  };

  sitio: any = null;

  gridApi: GridApi = null;
  items: Array<string> = [];
  value: number = 0;
  tipoZonaRadio: number = 0;
  tiposZona: Array<string> = ['Todos', 'Sitio', 'Geocerca', 'Lugar de Interés'];
  clienteId: number = config.getClienteSesion();
  buscarZona: string = '';

  // data
  formFields: FormFieldDefMap = {
    tipoZonaSeleccionado: {
      label: '',
      id: 'tipoZonaSeleccionado',
      value: 'Todos',
    },
    checkSoloResumen: {
      label: 'Sólo Resumen',
      id: '8',
      value: false,
    },
    checkTodoTipoEvento: {
      label: 'Usar todos los tipos de eventos',
      id: '7',
      value: false,
    },
  };

  async onGridReadySitio(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.sitio = (await this.fetchTipoSitio()) || [];
    this.gridApi.setRowData(this.sitio.geoSitio);
    this.handleZonasSeleccionadosChange(this.zonasAsignadas);
  }

  @Watch('zonasAsignadas')
  handleZonasSeleccionadosChange(seleccionados: any) {
    if (!this.gridApi) {
      return;
    }
    setTimeout(() => {
      this.gridApi.forEachNode(row => {
        row.setSelected(
          seleccionados.some((x: any) => x.gpsCoordenadaId === row.data.id)
        );
      });

      if (this.accion === 3) {
        this.gridApi.setRowData(this.gridApi.getSelectedRows());
      }
    });
  }

  handledSitio() {
    const { checkSoloResumen, checkTodoTipoEvento } = this.formFields;
    this.$emit('checkSitio', checkSoloResumen.value, checkTodoTipoEvento.value);
  }

  zonasSeleccionadas(event: SelectionChangedEvent) {
    const zonasSeleccionadas = event.api.getSelectedRows();
    const zonasIds: number[] = zonasSeleccionadas.map(x => x.id);
    this.$emit('zonasSeleccionadas', zonasIds);
  }

  handledTipoZona(tipoZona: string) {
    const tipoZonaSeleccionada = tipoZona;
    if (tipoZonaSeleccionada === 'Todos') {
      this.gridApi.setQuickFilter('');
    } else {
      this.gridApi.setQuickFilter(tipoZonaSeleccionada);
    }
  }

  onFilterTextBoxChanged() {
    if (this.buscarZona.length > 1) {
      this.gridApi.setQuickFilter(this.buscarZona);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  @Watch('filtro', { deep: true, immediate: true })
  handlefiltro() {
    if (this.filtro) {
      const { checkSoloResumen, checkTodoTipoEvento } = this.formFields;

      const resumen = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkSoloResumen.id)
      );

      const todoTipoEvento = this.filtro.find(
        x => x.reporteFiltroId === parseInt(checkTodoTipoEvento.id)
      );

      checkSoloResumen.value =
        resumen == undefined ? false : resumen.value === 'true';

      checkTodoTipoEvento.value =
        todoTipoEvento == undefined ? false : todoTipoEvento.value === 'true';
    }

    this.handledSitio();
  }

  async fetchTipoSitio() {
    this.loadingService.showLoading();
    return fetchSitio(this.clienteId)
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los sitios'
        );
        return [];
      })
      .finally(() => this.loadingService.hideLoading());
  }

  get computedGridOptions() {
    const {
      gridOptionsSitio: { columnDefs },
    } = this;

    return this.gridOptionsSitio;
  }
}
</script>

<style scoped></style>

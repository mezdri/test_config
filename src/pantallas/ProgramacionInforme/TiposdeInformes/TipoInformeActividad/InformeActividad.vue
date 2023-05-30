<template>
  <div align="center">
    <FormFieldsContainer>
      <v-flex>
        <v-checkbox
          :label="this.formFields.satelite.label"
          v-model="formFields.satelite.value"
          :value="true"
          @change="handledActividad"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkHDOP.label"
          v-model="formFields.checkHDOP.value"
          :value="true"
          @change="handledActividad"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkLongYLat.label"
          v-model="formFields.checkLongYLat.value"
          :value="true"
          @change="handledActividad"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="this.formFields.checkDatoValido.label"
          v-model="formFields.checkDatoValido.value"
          :value="true"
          @change="handledActividad"
          :disabled="accion === 3"
        />
      </v-flex>
    </FormFieldsContainer>
    <v-divider />
    <FormFieldsContainer>
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
          :row-data="tipoActividad"
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
import {
  fetchTipoActividad,
  TipoActividad,
} from '@/pantallas/Informes/InformeActividad/fetchTipoActividad';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Filtros } from '../../ProgramacionInforme';
import {
  actividadBackend,
  FiltrosBackend,
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
export default class InformeActividad extends Vue {
  @Prop({ default: [] }) actividadesAsignados: actividadBackend[];
  @Prop({ default: (): [] => [] }) filtro: FiltrosBackend[];
  @Prop({ default: 1 }) accion: number;
  @Prop({ default: [] }) hiddenColumns: string[];
  @Prop({ default: false }) isProgrammed: boolean;

  /* aggrid */

  gridApi: GridApi = null;
  tipoActividad: TipoActividad[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  readonly gridOptionsInformeActividad: GridOptions = {
    columnDefs: [
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
    onGridReady: this.handledGridReadyActividad,
    onSelectionChanged: this.ActividadSeleccionada,
  };

  // data
  formFields: FormFieldDefMap = {
    satelite: {
      label: 'Satélite',
      id: '1',
      value: false,
    },
    checkHDOP: {
      label: 'HDOP',
      id: '2',
      value: false,
    },
    checkLongYLat: {
      label: 'Latitud y Longitud',
      id: '3',
      value: false,
    },
    checkDatoValido: {
      label: 'Confiable',
      id: '4',
      value: false,
    },
  };

  /* event handlers */

  async handledGridReadyActividad(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.tipoActividad = (await this.fetchTipoInforme()) || [];
    this.gridApi.setRowData(this.tipoActividad);
    this.handleActividadesSeleccionadosChange(this.actividadesAsignados);
  }

  ActividadSeleccionada(event: SelectionChangedEvent) {
    const actividadSeleccionada = event.api.getSelectedRows();
    const actividadesIds: number[] = actividadSeleccionada.map(x => x.id);
    const actividadesNombres: string[] = actividadSeleccionada.map(
      x => x.tipoEvento
    );
    this.$emit('actividadSeleccionada', actividadesIds, actividadesNombres);
  }

  @Watch('hiddenColumns', { deep: true, immediate: true })
  onColumnsChanged() {
    if (this.hiddenColumns.includes('hdop')) {
      this.formFields.checkHDOP.value = true;
    }
    if (this.hiddenColumns.includes('numero_satelites')) {
      this.formFields.satelite.value = true;
    }
    if (
      this.hiddenColumns.includes('latitud') ||
      this.hiddenColumns.includes('longitud')
    ) {
      this.formFields.checkLongYLat.value = true;
    }
    if (this.hiddenColumns.includes('trustworthy')) {
      this.formFields.checkDatoValido.value = true;
    }
    //this.handledActividad();
  }

  @Watch('actividadesAsignados')
  handleActividadesSeleccionadosChange(seleccionados: actividadBackend[]) {
    if (seleccionados.length === 0) {
      return;
    }
    setTimeout(() => {
      this.gridApi.forEachNode(row => {
        row.setSelected(
          seleccionados.some(x => x.actividadTipoId === row.data.id)
        );
      });

      if (this.accion === 3) {
        this.tipoActividad = this.gridApi.getSelectedRows();
      }
    });
  }

  // @Watch('filtro', { deep: true, immediate: true })
  // handlefiltro() {
  //   console.log("Lo apagué")
  //   if (this.filtro) {
  //     const {
  //       satelite,
  //       checkHDOP,
  //       checkLongYLat,
  //       checkDatoValido,
  //     } = this.formFields;

  //     const satelit = this.filtro.find(
  //       x => x.reporteFiltroId === parseInt(satelite.id)
  //     );

  //     const hdop = this.filtro.find(
  //       x => x.reporteFiltroId === parseInt(checkHDOP.id)
  //     );

  //     const longYLat = this.filtro.find(
  //       x => x.reporteFiltroId === parseInt(checkLongYLat.id)
  //     );

  //     const datoValido = this.filtro.find(
  //       x => x.reporteFiltroId === parseInt(checkDatoValido.id)
  //     );

  //     checkDatoValido.value =
  //       datoValido == undefined ? false : datoValido.value === 'true';

  //     satelite.value = satelit == undefined ? false : satelit.value === 'true';

  //     checkHDOP.value = hdop == undefined ? false : hdop.value === 'true';

  //     checkLongYLat.value =
  //       longYLat == undefined ? false : longYLat.value === 'true';
  //   }

  //   this.handledActividad();
  // }

  handledActividad() {
    const {
      satelite,
      checkHDOP,
      checkLongYLat,
      checkDatoValido,
    } = this.formFields;
    this.$emit(
      'checkActividad',
      satelite.value,
      checkHDOP.value,
      checkLongYLat.value,
      checkDatoValido.value
    );
  }

  async fetchTipoInforme() {
    this.loadingService.showLoading();
    return fetchTipoActividad()
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la lista de actividades'
        );
        return [];
      })
      .finally(() => this.loadingService.hideLoading());
  }

  get computedGridOptions() {
    const {
      gridOptionsInformeActividad: { columnDefs },
    } = this;

    return this.gridOptionsInformeActividad;
  }
}
</script>

<style scoped></style>

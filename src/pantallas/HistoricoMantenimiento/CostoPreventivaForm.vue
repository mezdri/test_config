<template>
  <div>
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer>
              <v-flex xs12 sm12 md3>
                <v-text-field
                  :label="formFields.patente.label"
                  v-model="formFields.patente.value"
                  prepend-icon="directions_car"
                  :disabled="true"
                />
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  :label="formFields.costoTotal.label"
                  v-model="formFields.costoTotal.value"
                  prepend-icon="monetization_on"
                  :disabled="true"
                />
              </v-flex>
              <v-flex sm12 md3>
                <v-text-field
                  :label="formFields.costoPreventiva.label"
                  v-model="formFields.costoPreventiva.value"
                  prepend-icon="monetization_on"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
            <div align="left">
              <MantenedorGrid
                :grid-options="gridOptions"
                test-id="costoHistorico"
              />
            </div>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <VerDetallePlanPreventivoModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :planSeleccionado="planSeleccionado"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  formErrors,
  FormErrors,
  FormFieldDefMap,
  FormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  checkboxColumnDef,
  makeAccionesModal,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import VerDetallePlanPreventivoModal from '@/pantallas/HistoricoMantenimiento/VerDetallePlanPreventivoModal.vue';
import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
import { Vehiculo as VehiculoType } from '@/pantallas/HistoricoMantenimiento/fetchVehiculosHistorico';
import {
  fetchHistoricosPreventivo,
  HistoricoPreventivo,
  HistoricosPreventivoList,
} from '@/pantallas/HistoricoMantenimiento/fetchHistoricoPreventivo';

@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    MantenedorGrid,
    VerDetallePlanPreventivoModal,
  },
})
export default class CostoPreventivaForm extends Vue {
  @Prop({ required: true }) vehiculoSeleccionado: VehiculoType;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Preventivas;
  planes: any[] = [];
  historicoPreventivo: HistoricoPreventivo = null;
  planSeleccionado: HistoricosPreventivoList = null;
  mostrarModalVerDetalle: boolean = false;
  formFields: FormFieldDefMap = {
    patente: {
      label: 'Patente Vehículo',
      id: 'patente',
      value: '',
    },
    costoTotal: {
      label: 'Costo Total Mantenimiento',
      id: 'costoTotal',
      value: '',
    },
    costoPreventiva: {
      label: 'Costo Total Preventiva',
      id: 'costoPreventiva',
      value: '',
    },
  };

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        cellStyle: { textAlign: 'left', 'pointer-events': 'none' },
      },
      {
        headerName: 'Codigó',
        field: 'idPlanMantenimiento',
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => '',
      },
      {
        headerName: 'Nombre Plan',
        field: 'planMantenimientoText',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Pauta',
        field: 'pautaActividadMantText',
      },
      {
        headerName: 'Estado',
        field: 'planMantenimientoEstadoText',
      },
      {
        headerName: 'Fecha Realización',
        field: 'fechaRealizacion',
      },
      makeAccionesModal({
        onVerDetalle: this.handleVerDetalle,
      }),
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
  };

  /* aggrid */

  gridApi: GridApi = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }

  /* handle */

  handleVerDetalle(plan: any) {
    this.planSeleccionado = plan;
    this.mostrarModalVerDetalle = true;
  }

  @Watch('vehiculoSeleccionado', { deep: true, immediate: true })
  async handletipoVehiculoChange() {
    if (!this.vehiculoSeleccionado) {
      return;
    }
    this.historicoPreventivo =
      (await this.fetchPlanes(this.vehiculoSeleccionado.vehiculoId)) || null;
    this.planes = this.historicoPreventivo.preventivosHistoricos;
    this.gridApi.setRowData(this.planes || []);
    this.formFields.patente.value = this.vehiculoSeleccionado.unidad;
    this.formFields.costoTotal.value = this.historicoPreventivo.totalPrevCorr;
    this.formFields.costoPreventiva.value = this.historicoPreventivo.totPrev;
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  /* tabla */
  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  /* Util */

  fetchPlanes(id: number) {
    //this.loadingService.showLoading();
    this.loadingService.showLoading();
    return fetchHistoricosPreventivo(id)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el histórico del vehículos. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  /*lifecycle Hook*/

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

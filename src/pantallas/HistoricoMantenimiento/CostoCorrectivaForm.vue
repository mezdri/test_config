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
                  :label="formFields.costoCorrectiva.label"
                  v-model="formFields.costoCorrectiva.value"
                  prepend-icon="monetization_on"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
            <div align="left">
              <MantenedorGrid
                :grid-options="gridOptions"
                :row-data="
                  correctivasVehiculo
                    ? correctivasVehiculo.correctivosHistoricos
                    : []
                "
              />
            </div>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>

    <VerDetalleMantenimientoCorrectivoModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :correctivoSeleccionado="correctivoSeleccionado"
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
  makeAccionesColumnDef,
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

import VerDetalleMantenimientoCorrectivoModal from '@/pantallas/HistoricoMantenimiento/VerDetalleMantenimientoCorrectivoModal.vue';
import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
import {
  HistoricosCorrectivosList,
  HistoricoCorrectivo,
} from './HistoricoCorrectivo';
import { Correctiva } from '@/pantallas/Correctivas/Data/Correctiva';
import { fetchMantenimientoCorrectivoDetalle } from '@/pantallas/Correctivas/Data/fetchMantenimientoCorrectivoDetalle';
import VerDetalleCorrectivasModal from '@/pantallas/Correctivas/VerDetalleCorrectivasModal.vue';
import { Vehiculo as VehiculoType } from '@/pantallas/HistoricoMantenimiento/fetchVehiculosHistorico';
import { fetchHistoricosCorrectivo } from './fetchHistoricoCorrectivo';
@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    MantenedorGrid,
    VerDetalleMantenimientoCorrectivoModal,
    VerDetalleCorrectivasModal,
  },
})
export default class CostoCorrectivaForm extends Vue {
  @Prop({ required: true }) vehiculoSeleccionado: VehiculoType;

  correctivoSeleccionado: Correctiva = null;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Correctivas;
  correctivasVehiculo: HistoricoCorrectivo = null;

  mostrarModalVerDetalle: boolean = false;
  formFields: FormFieldDefMap = {
    patente: {
      label: 'Patente Vehículo',
      id: 'patente',
      value: '',
    },
    costoTotal: {
      label: 'Costo Total Mantenimiento',
      id: 'costoTotalMantenimiento',
      value: '',
    },
    costoCorrectiva: {
      label: 'Costo Total Correctiva',
      id: 'costoTotalCorrectiva',
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
        field: 'id',
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => '',
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Realización',
        field: 'fechaRealizacion',
      },
      makeAccionesModal({
        onVerDetalle: this.handleVerDetalleClick,
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

  @Watch('vehiculoSeleccionado', { deep: true, immediate: true })
  async handletipoSeleccionadoChange() {
    if (!this.vehiculoSeleccionado) {
      return;
    }
    this.correctivasVehiculo =
      (await this.fetchCorrectivasVehiculo(
        this.vehiculoSeleccionado.vehiculoId
      )) || null;
    this.formFields.patente.value = this.correctivasVehiculo.patente;
    this.formFields.costoCorrectiva.value = `$ ${this.correctivasVehiculo.costoTotalCorrectiva.toLocaleString()}`;
    this.formFields.costoTotal.value = `$ ${this.correctivasVehiculo.costoTotalMantenimientos.toLocaleString()}`;
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  async handleVerDetalleClick(data: any) {
    this.correctivoSeleccionado =
      (await this.fetchCorrectivasDetalle(data.id)) || null;
    this.mostrarModalVerDetalle = true;
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

  fetchCorrectivasVehiculo(idVehiculo: number) {
    return fetchHistoricosCorrectivo(idVehiculo)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los mantenimientos historicos ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchCorrectivasDetalle(idVehiculo: number) {
    this.loadingService.showLoading();
    return fetchMantenimientoCorrectivoDetalle(idVehiculo)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el mantenimiento correctivo. ',
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

<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Planificado">
              <slot name="prependPlanificado" />
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.kilometrajePlanificado.label"
                  v-model="formFields.kilometrajePlanificado.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasMotorPlanificado.label"
                  v-model="formFields.horasMotorPlanificado.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.tiempoPlanificado.label"
                  v-model="formFields.tiempoPlanificado.value"
                  disabled
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer titulo="Realizado">
              <slot name="prependRealizado" />
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.kilometrajeRealizado.label"
                  v-model="formFields.kilometrajeRealizado.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasMotorRealizado.label"
                  v-model="formFields.horasMotorRealizado.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <DatePicker
                  :label="formFields.tiempoMotorRealizado.label"
                  :id="formFields.tiempoMotorRealizado.id"
                  v-model="formFields.tiempoMotorRealizado.value"
                  disabled
                  :error-messages="
                    errors.collect(formFields.tiempoMotorRealizado.id)
                  "
                  :data-vv-name="formFields.tiempoMotorRealizado.id"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasHonbre.label"
                  v-model="formFields.horasHonbre.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.costos.label"
                  v-model="formFields.costos.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.taller.label"
                  v-model="formFields.taller.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.responsable.label"
                  v-model="formFields.responsable.value"
                  disabled
                />
              </v-flex>
              <v-flex sm12 md4>
                <DatePicker
                  :label="formFields.fechaIngresoTaller.label"
                  :id="formFields.fechaIngresoTaller.id"
                  v-model="formFields.fechaIngresoTaller.value"
                  disabled
                  :error-messages="
                    errors.collect(formFields.fechaIngresoTaller.id)
                  "
                  :data-vv-name="formFields.fechaIngresoTaller.id"
                />
              </v-flex>
              <v-flex sm12 md4>
                <DatePicker
                  :label="formFields.fechasalidaTaller.label"
                  :id="formFields.fechasalidaTaller.id"
                  v-model="formFields.fechasalidaTaller.value"
                  disabled
                  :error-messages="
                    errors.collect(formFields.fechasalidaTaller.id)
                  "
                  :data-vv-name="formFields.fechasalidaTaller.id"
                />
              </v-flex>
            </FormFieldsContainer>
            <br />
            <v-layout row wrap>
              <div align="left">
                <v-flex md12>
                  <h2 class="h2_title">Actividades</h2>
                </v-flex>
              </div>
            </v-layout>
            <v-divider></v-divider>
            <div align="left">
              <MantenedorGrid :grid-options="computedGridOptions" />
            </div>
            <br />
            <FormFieldsContainer titulo="Actividades Extra Realizadas">
              <slot name="prependActividadesExtra" />
              <v-flex sm12 md12>
                <v-textarea
                  :label="formFields.actividadesExtra.label"
                  v-model="formFields.actividadesExtra.value"
                  disabled
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
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
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  CellValueChangedEvent,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import DatePicker from '@/reusable/Form/DatePicker.vue';

import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
import { PreventivaNuevo } from '@/pantallas/Preventivas/Preventiva';
import {
  HistoricosPreventivoList,
  Actividad,
} from '@/pantallas/HistoricoMantenimiento/fetchHistoricoPreventivo';
@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    MantenedorGrid,
    DatePicker,
  },
})
export default class DetallePreventivaForm extends Vue {
  @Prop() planSeleccionado: HistoricosPreventivoList;
  @Prop({ default: false }) isVerDetalle: boolean;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  formFields: FormFieldDefMap = {
    kilometrajePlanificado: {
      label: 'Kilometraje',
      id: 'kilometrajePlanificado',
      value: '',
    },
    horasMotorPlanificado: {
      label: 'Horas de Motor',
      id: 'horasMotorPlanificado',
      value: '',
    },
    tiempoPlanificado: {
      label: 'Tiempo',
      id: 'tiempoPlanificado',
      value: '',
    },
    kilometrajeRealizado: {
      label: 'kilometraje',
      id: 'kilometrajeRealizado',
      value: '',
    },
    horasMotorRealizado: {
      label: 'Horas de Motor',
      id: 'horasMotorRealizado',
      value: '',
    },
    tiempoMotorRealizado: {
      label: 'Tiempo',
      id: 'tiempoMotorRealizado',
      value: '',
    },
    horasHonbre: {
      label: 'Horas Hombre',
      id: 'horasHonbreRealizado',
      value: '',
    },
    costos: {
      label: 'Costos',
      id: 'costos',
      value: '',
    },
    taller: {
      label: 'Taller',
      id: 'taller',
      value: '',
    },
    responsable: {
      label: 'Responsable',
      id: 'responsable',
      value: '',
    },
    fechaIngresoTaller: {
      label: 'Fecha de Ingreso al Taller',
      id: 'fechaIngresoTaller',
      value: '',
    },
    fechasalidaTaller: {
      label: 'Fecha de Salida al Taller',
      id: 'fechasalidaTaller',
      value: '',
    },
    actividadesExtra: {
      label: 'Actividades Extra Realizadas',
      id: 'actividadesExtra',
      value: '',
    },
  };
  actividades: Actividad[] = [];
  axios = new AxiosVue(ServicioProxy.Dispositivo);

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.estado);
          }
        },
      },
      {
        headerName: 'Nombre ',
        field: 'nombreActividad',
        suppressMovable: true,
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Accion ',
        field: 'tipoActividadMantText',
        lockPinned: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Estado ',
        field: 'estado',
        lockPinned: true,
        width: 200,
        minWidth: 200,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* handle */

  @Watch('planSeleccionado', { deep: true })
  handletipoSeleccionadoChange() {
    if (!this.planSeleccionado) {
      return;
    }
    this.formFields.kilometrajePlanificado.value = this.planSeleccionado.planiKilometraje;
    this.formFields.horasMotorPlanificado.value = this.planSeleccionado.planiHoraMotor;
    this.formFields.tiempoPlanificado.value = this.planSeleccionado.planiTiempo;
    this.formFields.kilometrajeRealizado.value = this.planSeleccionado.kilometraje;
    this.formFields.horasMotorRealizado.value = this.planSeleccionado.horaMotor;
    this.formFields.tiempoMotorRealizado.value = this.planSeleccionado.fechaRealizacion;
    this.formFields.horasHonbre.value = this.planSeleccionado.horasHombre;
    this.formFields.costos.value = this.planSeleccionado.costoHH;
    this.formFields.taller.value = this.planSeleccionado.taller;
    this.formFields.responsable.value = this.planSeleccionado.responsable;
    this.formFields.fechaIngresoTaller.value = this.planSeleccionado.fechaIngreso;
    this.formFields.fechasalidaTaller.value = this.planSeleccionado.fechaSalida;
    this.formFields.actividadesExtra.value = this.planSeleccionado.actividadeExtras;
    this.actividades = this.planSeleccionado.listaActividades || [];
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.actividades || []);
  }

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handletipoSeleccionadoChange();
  }

  /*template*/

  get computedGridOptions() {
    const {
      gridOptions: { columnDefs },
    } = this;

    return this.isVerDetalle
      ? {
          ...this.gridOptions,
          columnDefs: columnDefs.slice(1, columnDefs.length),
        }
      : this.gridOptions;
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

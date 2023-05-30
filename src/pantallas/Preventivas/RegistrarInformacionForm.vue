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
            <FormFieldsContainer titulo="Registrar Información">
              <slot name="prependRegistrarInformacion" />
              <v-flex sm12 md6>
                <v-autocomplete
                  :label="formFields.tallerId.label"
                  v-model="formFields.tallerId.value"
                  required
                  :disabled="readonly"
                  v-validate="{
                    rules: {
                      required: !readonly,
                    },
                  }"
                  :error-messages="errors.collect(formFields.tallerId.id)"
                  :data-vv-name="formFields.tallerId.id"
                  :items="talleres"
                  item-text="nombre"
                  item-value="id"
                  no-data-text="Sin resultados"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.responsable.label"
                  :error-messages="errors.collect(formFields.responsable.id)"
                  :data-vv-name="formFields.responsable.id"
                  v-model="formFields.responsable.value"
                  v-validate="'required|max:80'"
                  :counter="80"
                  :disabled="readonly"
                />
              </v-flex>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaIngreso.label"
                  :id="formFields.fechaIngreso.id"
                  v-model="formFields.fechaIngreso.value"
                  :disabled="readonly"
                  v-validate="{
                    rules: {
                      required: !readonly,
                    },
                  }"
                  :max="
                    fechaMaximaInicio != null
                      ? fechaMaximaInicio.format('YYYY-MM-DD')
                      : ''
                  "
                  :error-messages="errors.collect(formFields.fechaIngreso.id)"
                  :data-vv-name="formFields.fechaIngreso.id"
                />
              </v-flex>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaSalida.label"
                  :id="formFields.fechaSalida.id"
                  v-model="formFields.fechaSalida.value"
                  :disabled="readonly"
                  v-validate="{
                    rules: {},
                  }"
                  :error-messages="errors.collect(formFields.fechaSalida.id)"
                  :min="fechaMinimaFin.format('YYYY-MM-DD')"
                  :data-vv-name="formFields.fechaSalida.id"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.kilometraje.label"
                  :error-messages="errors.collect(formFields.kilometraje.id)"
                  :data-vv-name="formFields.kilometraje.id"
                  v-model="formFields.kilometraje.value"
                  v-validate="'required|max:80|numeric'"
                  :counter="80"
                  :disabled="readonly"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.horasMotor.label"
                  :error-messages="errors.collect(formFields.horasMotor.id)"
                  :data-vv-name="formFields.horasMotor.id"
                  v-model="formFields.horasMotor.value"
                  v-validate="'max:80'"
                  :counter="80"
                  :disabled="readonly"
                />
              </v-flex>
              <v-flex sm12 md4>
                <DatePicker
                  :label="formFields.fechaRealizacion.label"
                  :id="formFields.fechaRealizacion.id"
                  v-model="formFields.fechaRealizacion.value"
                  :disabled="readonly"
                  v-validate="{
                    rules: {},
                  }"
                  :error-messages="
                    errors.collect(formFields.fechaRealizacion.id)
                  "
                  :data-vv-name="formFields.fechaRealizacion.id"
                />
              </v-flex>
            </FormFieldsContainer>
            <br />
            <FormFieldsContainer
              titulo="Asociar Plan de Mantenimiento y Pauta de Actividades"
              v-show="!this.preventivaSeleccionada || readonly"
            >
              <slot name="prependAsociar" />
              <v-flex sm12 md6>
                <v-autocomplete
                  :label="formFields.mantenimientoPlanMantenimientoId.label"
                  v-model="formFields.mantenimientoPlanMantenimientoId.value"
                  required
                  :disabled="readonly"
                  v-validate="{
                    rules: { required: !readonly },
                  }"
                  :error-messages="
                    errors.collect(
                      formFields.mantenimientoPlanMantenimientoId.id
                    )
                  "
                  :data-vv-name="formFields.mantenimientoPlanMantenimientoId.id"
                  :items="planesMantenimiento"
                  item-text="nombre"
                  item-value="id"
                  @change="handleChangePlan()"
                  no-data-text="Sin resultados"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-autocomplete
                  :label="formFields.mantenimientoPautaActividadId.label"
                  v-model="formFields.mantenimientoPautaActividadId.value"
                  required
                  :disabled="readonly"
                  v-validate="{
                    rules: { required: !readonly },
                  }"
                  :error-messages="
                    errors.collect(formFields.mantenimientoPautaActividadId.id)
                  "
                  :data-vv-name="formFields.mantenimientoPautaActividadId.id"
                  :items="pautasActividad"
                  item-text="nombre"
                  item-value="id"
                  no-data-text="Sin resultados"
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
  makeAccionesColumnDef_DEPRECATED,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import { PreventivaNuevo } from '@/pantallas/Preventivas/Preventiva';
import {
  fetchPlanesMantenimiento,
  PlanMantenimiento,
} from '@/pantallas/Preventivas/fetchPlanMantenimiento';
import {
  fetchPautasActividad,
  PautaActividad,
} from '@/pantallas/Preventivas/fetchPautasActividades';
import { fetchTalleres, Taller } from '@/pantallas/Preventivas/fetchTalleres';

@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    DatePicker,
  },
})
export default class RegistrarInformacionForm extends Vue {
  @Prop() preventivaSeleccionada: PreventivaNuevo;
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: 0 }) idVehiculo: number;

  isFormValid: boolean = false;

  formFields: FormFieldDefMap = {
    tallerId: {
      label: 'Taller',
      id: 'tallerId',
      value: '',
    },
    responsable: {
      label: 'Responsable',
      id: 'responsable',
      value: '',
    },
    fechaIngreso: {
      label: 'Fecha de Ingreso Taller',
      id: 'fechaIngreso',
      value: '',
    },
    fechaSalida: {
      label: 'Fecha de Salida Taller',
      id: 'fechaSalida',
      value: '',
    },
    kilometraje: {
      label: 'Kilometraje',
      id: 'kilometraje',
      value: '',
    },
    horasMotor: {
      label: 'Horas de Motor',
      id: 'horasMotor',
      value: '',
    },
    fechaRealizacion: {
      label: 'Fecha Realización',
      id: 'fechaRealizacion',
      value: '',
    },
    mantenimientoPlanMantenimientoId: {
      label: 'Seleccionar Plan de Mantenimiento',
      id: 'mantenimientoPlanMantenimientoId',
      value: '',
    },
    mantenimientoPautaActividadId: {
      label: 'Seleccionar Pauta de Actividades',
      id: 'mantenimientoPautaActividadId',
      value: '',
    },
  };

  planesMantenimiento: PlanMantenimiento[] = [];
  pautasActividad: PautaActividad[] = [];
  talleres: Taller[] = [];

  fechaMinimaInicio: moment.Moment = moment();
  fechaMaximaInicio: moment.Moment = null;
  fechaMinimaFin: moment.Moment = moment();
  fechaMaximaFin: moment.Moment;

  axios = new AxiosVue(ServicioProxy.Mantenimiento);

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* handle */

  @Watch('preventivaSeleccionada', { deep: true })
  async handletipoSeleccionadoChange() {
    let taller: any = (await this.fetchTalleres()) || [];
    this.talleres = taller.data;
    if (!this.preventivaSeleccionada) {
      this.fechaMinimaInicio = moment();
      this.fechaMinimaFin = moment();
      return;
    }
    this.formFields.tallerId.value = this.preventivaSeleccionada.tallerId;
    this.formFields.responsable.value = this.preventivaSeleccionada.responsable;
    this.formFields.fechaIngreso.value = this.preventivaSeleccionada.fechaIngreso;
    this.formFields.fechaSalida.value = this.preventivaSeleccionada.fechaSalida;
    this.formFields.kilometraje.value = this.preventivaSeleccionada.kilometraje;
    this.formFields.horasMotor.value = this.preventivaSeleccionada.horasMotor;
    this.formFields.fechaRealizacion.value = this.preventivaSeleccionada.fechaRealizacion;
    this.planesMantenimiento =
      (await this.fetchPlanes(
        this.preventivaSeleccionada.vehiculoMantenimientoId
      )) || [];
    this.formFields.mantenimientoPlanMantenimientoId.value = this.preventivaSeleccionada.mantenimientoPlanMantenimientoId;
    this.handleChangePlan();
    this.formFields.mantenimientoPautaActividadId.value = this.preventivaSeleccionada.mantenimientoPautaActividadId;
  }

  @Watch('idVehiculo', { deep: true })
  async handleVehiculoChange() {
    if (!this.idVehiculo) {
      return;
    }
    this.planesMantenimiento = (await this.fetchPlanes(this.idVehiculo)) || [];
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
    // this.fechaMinimaFin = moment(this.formFields.fechaInicio.value.toString());
    // this.fechaMaximaInicio =
    //   moment(this.formFields.fechaFin.value.toString()) !== moment()
    //     ? moment(this.formFields.fechaFin.value.toString())
    //     : moment();
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          tallerId: this.formFields.tallerId.value,
          responsable: this.formFields.responsable.value,
          fechaIngreso: this.formFields.fechaIngreso.value,
          fechaSalida: this.formFields.fechaSalida.value,
          kilometraje: this.formFields.kilometraje.value,
          horasMotor: this.formFields.horasMotor.value,
          fechaRealizacion: this.formFields.fechaRealizacion.value,
          mantenimientoPautaActividadId: this.formFields
            .mantenimientoPautaActividadId.value,
          mantenimientoPlanMantenimientoId: this.formFields
            .mantenimientoPlanMantenimientoId.value,
        } as PreventivaNuevo,
      },
      this
    );
  }

  async handleChangePlan() {
    let idPlan: any = this.formFields.mantenimientoPlanMantenimientoId.value;
    this.pautasActividad = (await this.fetchPautas(idPlan)) || [];
  }

  /* Util */

  fetchPlanes(id: number) {
    this.loadingService.showLoading();
    return fetchPlanesMantenimiento(id)
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener los planes`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchPautas(idPlan: number) {
    this.loadingService.showLoading();
    let idVehiculo = !this.preventivaSeleccionada ? this.idVehiculo : 0;
    return fetchPautasActividad(idPlan, idVehiculo)
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener las pautas de actividad`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchTalleres() {
    this.loadingService.showLoading();
    return fetchTalleres()
      .catch(() => {
        this.$snotify.error(
          `Ha ocurrido un error al intentar obtener los planes`,
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  /*LifeCicle Hook */

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.handletipoSeleccionadoChange();
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

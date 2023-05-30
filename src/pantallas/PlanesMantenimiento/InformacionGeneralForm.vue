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
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :id="formFields.nombre.id"
                  counter="80"
                  :disabled="disabled"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :validate="validarNombrePlan"
                  message="Ya existe un Plan de Mantenimiento con ese nombre."
                ></CampoUnico>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-select
                  :items="formFields.tipoMantenimiento.items"
                  v-model="formFields.tipoMantenimiento.value"
                  :label="formFields.tipoMantenimiento.label"
                  item-text="nombre"
                  item-value="id"
                  v-validate="'required'"
                  :disabled="disabled"
                  :error-messages="
                    errors.collect(formFields.tipoMantenimiento.id)
                  "
                  :data-vv-name="formFields.tipoMantenimiento.id"
                  required
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
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
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
  PlanMantenimiento,
  PlanMantenimientoNueva,
  PlanMantenimientoDetalle,
} from './Data/PlanMantenimiento';
import CampoUnico from '@/reusable/Form/CampoUnico.vue';
import { AxiosVue } from '../../AxiosVue';
import { ServicioProxy } from '../../config/enums';
import { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { fetchTipoMantenimiento } from '@/pantallas/TipoMantenimiento/fetchTipoMantenimiento';
import { TipoMantenimiento as TipoMantenimientoType } from '@/pantallas/TipoMantenimiento/TipoMantenimiento';

type TipoPlanMantenimiento = {
  id: number;
  tipo: string;
};

@Component({
  components: { FormFieldsContainer, CampoUnico },
})
export default class InformacionGeneralForm extends Vue {
  @Prop() planMantenimientoSeleccionado: PlanMantenimientoDetalle;
  @Prop({ default: false }) disabled: boolean;

  isFormValid: boolean = false;
  estadoSwitch: boolean = true;
  mensajeEstado: string = '';
  uniqueFieldRule = uniqueFieldRule;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  tiposMantenimiento: TipoMantenimientoType[] = [];

  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    tipoMantenimiento: {
      label: 'Tipo de Mantenimiento',
      id: 'tipoMantenimiento',
      value: '',
      items: [],
    },
  };

  @Watch('planMantenimientoSeleccionado', { deep: true })
  async handlePlanSeleccionadoChange() {
    this.tiposMantenimiento = (await this.fetchTipoMantenimiento()) || [];
    this.tiposMantenimiento = this.tiposMantenimiento
      ? this.tiposMantenimiento.filter(
          x =>
            x.categoriaTipoMantenimiento === 1 &&
            (x.estado === 1 || x.estado === 3)
        )
      : [];
    this.formFields.tipoMantenimiento.items = this.tiposMantenimiento;
    if (!this.planMantenimientoSeleccionado) {
      return;
    }
    this.formFields.nombre.value = this.planMantenimientoSeleccionado.nombre;
    this.formFields.tipoMantenimiento.value = this.planMantenimientoSeleccionado.tipoMantenimientoId;
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: this.formFields.nombre.value,
          tipoMantenimientoId: this.formFields.tipoMantenimiento.value,
        } as PlanMantenimientoNueva,
      },
      this
    );
  }

  validarNombrePlan(nombre: string) {
    const axios = new AxiosVue(ServicioProxy.Mantenimiento);

    const idPlan = this.planMantenimientoSeleccionado
      ? this.planMantenimientoSeleccionado.id
      : 0;

    return axios.http.get(
      `PlanMantenimiento/ChequearNombreUnico/${idPlan}/${nombre}`
    );
  }

  fetchTipoMantenimiento() {
    this.loadingService.showLoading();
    return fetchTipoMantenimiento()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de mantenimiento',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  /*lifecycle hook */

  mounted() {
    const validatorDictionary = makeValidatorDictionary(this.formFields);
    validatorDictionary.custom[this.formFields.nombre.id].max =
      formErrors.max.max;
    this.$validator.localize('es', validatorDictionary);

    this.emitFormChange();
    this.handlePlanSeleccionadoChange();
  }
}
</script>

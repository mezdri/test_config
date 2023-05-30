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
              <v-flex xs12>
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  persistent-hint
                  :hint="mensajeEstado"
                  :readonly="disabled"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombrePauta.label"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :error-messages="errors.collect(formFields.nombrePauta.id)"
                  :id="formFields.nombrePauta.id"
                  :data-vv-name="formFields.nombrePauta.id"
                  v-model="formFields.nombrePauta.value"
                  :validate="validarNombrePauta"
                  counter="80"
                  :disabled="disabled"
                  message="Ya existe una Pauta de Actividades con este nombre"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field
                  :label="formFields.descripcion.label"
                  v-validate="'required|max:200'"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  :counter="200"
                  required
                  :disabled="disabled"
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
  PautaActividad,
  PautaActividadNueva,
  PautaActividadDetalle,
} from './PautaActividad';
import { fetchPautaUnica } from './fetchPautaUnica';
import { AxiosVue } from '../../AxiosVue';
import { ServicioProxy, EstadoEntidad } from '../../config/enums';
import { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import CampoUnico from '@/reusable/Form/CampoUnico.vue';
import { EstadosService } from '../../services/estadosService';
import { PautaActividadesMantenimiento } from '../ActividadesMantenimiento/ActividadMantenimiento';
import { PautasPlanesMantenimiento } from '../PlanesMantenimiento/Data/PlanMantenimiento';

@Component({
  components: { FormFieldsContainer, CampoUnico },
})
export default class PautaActividadForm extends Vue {
  @Prop() pautaSeleccionada: PautaActividadDetalle;
  @Prop({ default: false }) disabled: boolean;

  isFormValid: boolean = false;
  estadoSwitch: boolean = true;
  mensajeEstado: any = '';
  uniqueFieldRule = uniqueFieldRule;
  actividadesMantenimiento: PautaActividadesMantenimiento[] = [];
  planesMantenimiento: PautasPlanesMantenimiento[] = [];

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    nombrePauta: {
      label: 'Nombre',
      id: 'nombrePauta',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
  };

  @Watch('pautaSeleccionada', { deep: true })
  handlePautaSeleccionadaChange() {
    if (!this.pautaSeleccionada) {
      return;
    }
    this.formFields.nombrePauta.value = this.pautaSeleccionada.nombrePauta;
    this.formFields.descripcion.value = this.pautaSeleccionada.descripcion;
    this.formFields.activo.value = this.pautaSeleccionada.estado;
    this.actividadesMantenimiento = this.pautaSeleccionada.actividades;
    this.planesMantenimiento = this.pautaSeleccionada.planesMantenimiento;
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const estados = new EstadosService().getEstadosVisibles();
    const estado = this.formFields.activo.value
      ? estados.find(x => x.id === EstadoEntidad.Activo)
      : estados.find(x => x.id === EstadoEntidad.Inactivo);

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          estado: estado,
          nombrePauta: this.formFields.nombrePauta.value,
          descripcion: this.formFields.descripcion.value,
        },
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    if (!isActivo) {
      if (
        this.pautaSeleccionada &&
        this.pautaSeleccionada.planesMantenimiento.length > 0
      ) {
        this.mensajeEstado = '';
      } else if (
        this.pautaSeleccionada &&
        this.pautaSeleccionada.actividades.length > 0
      ) {
        this.mensajeEstado = this.$t('mensajes.crud.inactivoAsociado.mensaje');
      } else {
        this.mensajeEstado = this.$t('mensajes.crud.inactivo.mensaje');
      }
    } else {
      this.mensajeEstado = '';
    }
  }

  validarNombrePauta(nombre: string) {
    const axios = new AxiosVue(ServicioProxy.Mantenimiento);

    const idPauta = this.pautaSeleccionada ? this.pautaSeleccionada.id : 0;

    return axios.http.get(
      `PautaActividad/ChequearNombreUnico/${idPauta}/${nombre}`
    );
  }

  mounted() {
    const validatorDictionary = makeValidatorDictionary(this.formFields);
    validatorDictionary.custom[this.formFields.nombrePauta.id].max =
      formErrors.max.max;
    validatorDictionary.custom[this.formFields.descripcion.id].max =
      formErrors.max.max;
    this.$validator.localize('es', validatorDictionary);

    this.handleFormChange();
    this.handlePautaSeleccionadaChange();
  }
}
</script>

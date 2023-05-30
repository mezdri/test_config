<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Pauta de Actividades"
      @cerrar="handleCerrar"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
      :inactivoSinAsociacion="inactivoSinAsociacion"
      entidad="Pauta de Actividades"
      pronombre="La "
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombrePauta
          : ''
      "
    ></CabeceraModalEditar>
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <PautaActividadForm
        @change="handleFormChange"
        :pautaSeleccionada="pautaSeleccionada"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarActividadGrid
        @change="handleActividadChange"
        :actividadesSeleccionadas="
          pautaSeleccionada ? pautaSeleccionada.actividades : pautaSeleccionada
        "
        v-show="pasoActivoIndex === pasos.asociarActividades.step"
        :pautaSeleccionada="pautaSeleccionada"
      />
      <AsociarPlanMantencionGrid
        @change="handlePlanChange"
        :planesSeleccionados="
          pautaSeleccionada
            ? pautaSeleccionada.planesMantenimiento
            : pautaSeleccionada
        "
        v-show="pasoActivoIndex === pasos.asociarPlanMantencion.step"
        :pautaSeleccionada="pautaSeleccionada"
      />
    </ContenidoModal>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t('Ingresar Frecuencia')"
      :mensaje="
        $t(
          'Debe ingresar al menos una Fecuencia por cada Plan de Mantenimiento seleccionado.'
        )
      "
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import PautaActividadForm from '@/pantallas/PautasActividades/PautaActividadForm.vue';
import AsociarActividadGrid from '@/pantallas/PautasActividades/AsociarActividadGrid.vue';
import AsociarPlanMantencionGrid from '@/pantallas/PautasActividades/AsociarPlanMantencionGrid.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  PautaActividad,
  PautaActividadNueva,
  PautaActividadAsociacion,
  PautaActividadDetalle,
  makePautaPasosEditar,
} from './PautaActividad';
import { editarPautaActividad } from '@/pantallas/PautasActividades/editarPautaActividad';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { PautaActividadesMantenimiento } from '../ActividadesMantenimiento/ActividadMantenimiento';
import { PautasPlanesMantenimiento } from '../PlanesMantenimiento/Data/PlanMantenimiento';
import config from '../../config';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

type CrearPautaActividadFormState = {
  entity: PautaActividadNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModalEditar,
    PautaActividadForm,
    ModalMantenedor,
    AsociarActividadGrid,
    AsociarPlanMantencionGrid,
    CrudStepsNavBar,
    ContenidoModal,
    NavegacionModalCrud,
    MensajeValidacion,
  },
})
export default class EditarPautaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) pautaSeleccionada: PautaActividadDetalle;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.PautasActividades;

  pasoActivoIndex = 1;

  readonly pasos: PasosCrud = makePautaPasosEditar();
  form: CrearPautaActividadFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  warningInactivo: string = '';
  clienteId = config.getClienteSesion();
  actividadesMantenimiento: PautaActividadesMantenimiento[] = [];
  planesMantenimiento: PautasPlanesMantenimiento[] = [];
  isPlanValid: boolean = true;
  showInactivo: boolean = true;
  modificable: boolean = true;
  estadoEntidad: boolean = true;
  inactivoSinAsociacion: boolean = true;
  showValidacion: boolean = false;
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  constructor() {
    super();
    this.pasos.asociarPlanMantencion.permitirContinuar = this.permiteContinuarPlanes;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleGuardar() {
    this.loadingService.showLoading();
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      if (this.pautaSeleccionada.planesMantenimiento.length > 0) {
        if (this.pautaSeleccionada.existeUnicaPlanMant === false) {
          this.actividadesMantenimiento = [];
          this.planesMantenimiento = [];
        }
      } else if (this.pautaSeleccionada.actividades.length > 0) {
        /*Deja inactivar con mensaje de advertencia */
        this.actividadesMantenimiento = [];
        this.planesMantenimiento = [];
      } else {
        this.actividadesMantenimiento = [];
        this.planesMantenimiento = [];
      }
    }
    const pautaEditada: PautaActividadAsociacion = {
      ...this.pasos.informacionGeneral.formState.entity,
      clienteId: this.clienteId,
      id: this.pautaSeleccionada.id,
      actividades: this.actividadesMantenimiento,
      planes: this.planesMantenimiento,
    };
    return editarPautaActividad(pautaEditada)
      .then(() =>
        this.$snotify.success(this.$t('mensajes.mensajesExito.editar'))
      )
      .catch(() =>
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'))
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('editar');
      });
  }

  permiteContinuarPlanes() {
    if (!this.isPlanValid) {
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      if (
        this.pautaSeleccionada.planesMantenimiento.length > 0 ||
        this.pautaSeleccionada.existeMant === true
      ) {
        if (
          this.pautaSeleccionada.existeUnicaPlanMant === true ||
          this.pautaSeleccionada.existeMant === true
        ) {
          /*No debe dejar inactivar */
          this.modificable = false;
        } else {
          this.modificable = true;
        }
      } else if (this.pautaSeleccionada.actividades.length > 0) {
        /*Deja inactivar con mensaje de advertencia */
        this.modificable = true;
        this.inactivoSinAsociacion = false;
      }
      this.estadoEntidad = false;
    } else {
      this.modificable = true;
      this.estadoEntidad = true;
      this.inactivoSinAsociacion = true;
    }
  }

  handleActividadChange(
    actividadMantenimiento: PautaActividadesMantenimiento[]
  ) {
    this.actividadesMantenimiento = actividadMantenimiento;
  }

  handlePlanChange(
    planMantenimiento: PautasPlanesMantenimiento[],
    valid: boolean
  ) {
    this.isPlanValid = valid;
    this.planesMantenimiento = planMantenimiento;
  }
}
</script>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Pauta de Actividades"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        :estado-id="estadoId"
        @guardar="handleGuardarClick"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <PautaActividadForm @change="handleFormChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarActividades">
          <AsociarActividadGrid @change="handleActividadChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarPlanMantencion">
          <AsociarPlanMantencionGrid @change="handlePlanChange" />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Pauta de Actividades' })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>

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
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import {
  PautaActividad,
  PautaActividadNueva,
  PautaActividadAsociacion,
  makePautaPasosCrear,
} from './PautaActividad';
import { crearPautaActividad } from '@/pantallas/PautasActividades/crearPautaActividad';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { PautaActividadesMantenimiento } from '../ActividadesMantenimiento/ActividadMantenimiento';
import { PautasPlanesMantenimiento } from '../PlanesMantenimiento/Data/PlanMantenimiento';
import config from '../../config';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
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
    CabeceraModal,
    PautaActividadForm,
    ModalMantenedor,
    AsociarActividadGrid,
    AsociarPlanMantencionGrid,
    CabeceraModalCrear,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperHeader,
    CrudStepperItems,
    MensajeValidacion,
  },
})
export default class CrearPautaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.PautasActividades;

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = makePautaPasosCrear();
  form: CrearPautaActividadFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };
  showVolver: boolean = false;
  showContinuar: boolean = true;
  showGuardar: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  disableBtnContinuar: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  warningInactivo: string = '';
  hasErrors = false;
  isValid = false;
  estadoSwitch: boolean = true;
  clienteId = config.getClienteSesion();
  actividadesMantenimiento: PautaActividadesMantenimiento[] = [];
  planesMantenimiento: PautasPlanesMantenimiento[] = [];
  isPlanValid: boolean = true;
  showInactivo: boolean = true;
  showValidacion: boolean = false;
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  constructor() {
    super();
    this.pasos.asociarPlanMantencion.permitirContinuar = this.permiteContinuarPlanes;
  }

  handleConfirmacionGuardar(isConfirmado: boolean) {
    this.dialogConfirmacionGuardar = false;
    if (!isConfirmado) {
      return;
    }
    if (!this.showInactivo) {
      this.actividadesMantenimiento = [];
      this.planesMantenimiento = [];
    }
    this.loadingService.showLoading();
    const pautaActividad: PautaActividadAsociacion = {
      ...this.pasos.informacionGeneral.formState.entity,
      clienteId: this.clienteId,
      actividades: this.actividadesMantenimiento,
      planes: this.planesMantenimiento,
    };
    return crearPautaActividad(pautaActividad)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Pauta de Actividades',
            creadoA: 'creada',
          })
        )
      )
      .catch(() => this.$snotify.error(this.$t('mensajes.mensajesError.crear')))
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('crear');
      });
  }

  permiteContinuarPlanes() {
    if (!this.isPlanValid) {
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  handleGuardarClick() {
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'la Pauta de Actividades',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Pauta de Actividades' }
      );
    }
    this.dialogConfirmacionGuardar = true;
  }

  async handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (this.disableBtnContinuar) {
      const isValid = await this.form.validator.validateAll();
      if (isValid) {
        this.disableBtnContinuar = false;
      }
    }
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.showInactivo = false;
    } else {
      this.showInactivo = true;
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

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado.id;
  }
}
</script>

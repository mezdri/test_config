<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditarBase
      titulo="Editar Mantenimiento Preventivo"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :tituloEliminar="this.$t('Editar Mantenimiento Preventivo')"
      :entidad="'Mantenimiento Preventivo'"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <RegistrarInformacionForm
        @change="handleFormChangeRegistrarInformacion"
        test-id="EditarRegistrarInformacionModal"
        :preventivaSeleccionada="preventivaSeleccionada"
        v-show="pasoActivoIndex === pasos.registrarInformacion.step"
      />

      <AsociarActividadesForm
        test-id="AsociarActividadesForm"
        @change="handleFormChangeAsociarActividades"
        :idPauta="idPauta"
        :preventivaSeleccionada="preventivaSeleccionada"
        v-show="pasoActivoIndex === pasos.asociarActividades.step"
      />
    </ContenidoModal>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t('Seleccionar Actividad')"
      :mensaje="$t('Debe seleccionar al menos una Actividad.')"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { RecepcionActividadFormState } from '@/pantallas/Recepcion/RecepcionActividadForm.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
import CabeceraModalEditarBase from '@/reusable/Modal/CabeceraModalEditarBase.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

import {
  makePreventivaPasosEditar,
  PreventivaNuevo,
} from '@/pantallas/Preventivas/Preventiva';
import RegistrarInformacionForm from '@/pantallas/Preventivas/RegistrarInformacionForm.vue';
import AsociarActividadesForm from '@/pantallas/Preventivas/AsociarActividadesForm.vue';
import { editarPreventiva } from '@/pantallas/Preventivas/editarPreventiva';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    GuardarCambiosButton,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    CabeceraModalEditarBase,
    ModalMantenedor,
    RegistrarInformacionForm,
    AsociarActividadesForm,
    MensajeValidacion,
  },
})
export default class EditarPreventivaModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) preventivaSeleccionada: PreventivaNuevo;

  /* template */

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = makePreventivaPasosEditar();
  readonly funcionalidad: Funcionalidades = Funcionalidades.Preventivas;
  idPauta: number = 0;
  showValidacion: boolean = false;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    this.loadingService.showLoading();
    let model: PreventivaNuevo = {
      id: this.preventivaSeleccionada.id,
      vehiculoMantenimientoId: this.preventivaSeleccionada
        .vehiculoMantenimientoId,
      tallerId: this.pasos.registrarInformacion.formState.entity.tallerId,
      responsable: this.pasos.registrarInformacion.formState.entity.responsable,
      fechaIngreso: this.pasos.registrarInformacion.formState.entity
        .fechaIngreso,
      fechaSalida: this.pasos.registrarInformacion.formState.entity.fechaSalida,
      kilometraje: this.pasos.registrarInformacion.formState.entity.kilometraje,
      horasMotor: this.pasos.registrarInformacion.formState.entity.horasMotor,
      fechaRealizacion: this.pasos.registrarInformacion.formState.entity
        .fechaRealizacion,
      mantenimientoPlanMantenimientoId: this.preventivaSeleccionada
        .mantenimientoPlanMantenimientoId,
      mantenimientoPautaActividadId: this.preventivaSeleccionada
        .mantenimientoPautaActividadId,
      mantenimientoActividadMantId: this.pasos.asociarActividades.formState
        .entity.mantenimientoActividadMantId,
      actividadeExtras: this.pasos.asociarActividades.formState.entity
        .actividadeExtras,
      horasHombre: this.pasos.asociarActividades.formState.entity.horasHombre,
      costoHH: this.pasos.asociarActividades.formState.entity.costoHH,
      costoInsum: this.pasos.asociarActividades.formState.entity.costoInsum,
    };
    editarPreventiva(model)
      .then(() => {
        this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
        this.$emit('editar');
      })
      .catch(() =>
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'))
      )
      .finally(this.loadingService.hideLoading);
  }

  async handleFormChangeRegistrarInformacion(event: FormChangeEvent) {
    this.pasos.registrarInformacion.formState = event;
    if (
      this.pasos.registrarInformacion.formState.entity
        .mantenimientoPautaActividadId
    ) {
      this.idPauta = this.pasos.registrarInformacion.formState.entity.mantenimientoPautaActividadId;
    } else {
      this.idPauta = 0;
    }
  }

  async handleFormChangeAsociarActividades(event: FormChangeEvent) {
    this.pasos.asociarActividades.formState = event;
  }

  permiteContinuarActividades() {
    if (
      !this.pasos.asociarActividades.formState.entity
        .mantenimientoActividadMantId ||
      this.pasos.asociarActividades.formState.entity
        .mantenimientoActividadMantId.length === 0
    ) {
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  /* misc */

  constructor() {
    super();

    this.pasos.asociarActividades.permitirContinuar = this.permiteContinuarActividades;
  }
}
</script>

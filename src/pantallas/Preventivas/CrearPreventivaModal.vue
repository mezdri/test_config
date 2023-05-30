<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Registrar Mantenimiento Preventivo"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardarClick"
      />
    </CabeceraModal>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.seleccionarVehiculo">
          <AsociarVehiculoForm @change="handleVehiculosChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.registrarInformacion">
          <RegistrarInformacionForm
            @change="handleFormChangeRegistrarInformacion"
            :idVehiculo="vehiculoSeleccionado && vehiculoSeleccionado.id"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarActividades">
          <AsociarActividadesForm
            test-id="AsociarActividadesForm"
            @change="handleFormChangeAsociarActividades"
            :idPauta="idPauta"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('Registrar Mantenimiento Preventivo')"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="'CONTINUAR REGISTRANDO'"
    ></Confirmation>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import Confirmation from '@/components/Confirmation.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';

import AsociarVehiculoForm, {
  AsociarVehiculoChangeEvent,
} from '@/pantallas/Preventivas/AsociarVehiculoForm.vue';
import RegistrarInformacionForm from '@/pantallas/Preventivas/RegistrarInformacionForm.vue';
import AsociarActividadesForm from '@/pantallas/Preventivas/AsociarActividadesForm.vue';
import { Vehiculo } from '@/pantallas/Preventivas/fetchVehiculos';
import { crearPreventiva } from '@/pantallas/Preventivas/crearPreventiva';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

import {
  makePreventivaPasosCrear,
  PreventivaNuevo,
} from '@/pantallas/Preventivas/Preventiva';

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    ModalMantenedor,
    GuardarButton,
    AsociarVehiculoForm,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    RegistrarInformacionForm,
    AsociarActividadesForm,
    MensajeValidacion,
  },
})
export default class CrearPreventivaModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = makePreventivaPasosCrear();
  readonly funcionalidad: Funcionalidades = Funcionalidades.Preventivas;

  dialogConfirmacionClose: boolean = false;
  disableBtnContinuar: boolean = false;
  hasErrors = false;
  isValid = false;
  dialogConfirmacion: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  /*Template */
  vehiculos: AsociarVehiculoChangeEvent = {
    vehiculos: [],
  };
  vehiculoSeleccionado: Vehiculo = null;
  idPauta: number = 0;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  permiteContinuarVehiculo() {
    if (!this.vehiculoSeleccionado) {
      this.tituloValidacion = 'Seleccionar Vehículo';
      this.mensajeValidacion = 'Debe seleccionar un Vehículo.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  handleCerrar() {
    this.dialogConfirmacionClose = true;
  }

  handleCierreConfirmacionCerrar(isConfirmado: boolean) {
    this.dialogConfirmacionClose = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('cerrar');
  }

  async handleGuardarClick() {
    this.isValid = await this.pasos.registrarInformacion.formState.validator.validateAll();
    this.hasErrors = true;
    if (
      !this.pasos.asociarActividades.formState.entity
        .mantenimientoActividadMantId ||
      this.pasos.asociarActividades.formState.entity
        .mantenimientoActividadMantId.length === 0
    ) {
      this.tituloValidacion = 'Seleccionar Actividad';
      this.mensajeValidacion = 'Debe seleccionar al menos una Actividad.';
      this.showValidacion = true;
      return;
    }
    if (this.isValid) {
      this.mensajeConfirmacionInactivo = this.$t(
        '¿Está seguro que desea registrar el Mantenimiento Preventivo?'
      );
      this.dialogConfirmacion = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.hasErrors = false;
    if (val) {
      this.loadingService.showLoading();
      let model: PreventivaNuevo = {
        id: 0,
        vehiculoMantenimientoId: this.vehiculoSeleccionado.id,
        tallerId: this.pasos.registrarInformacion.formState.entity.tallerId,
        responsable: this.pasos.registrarInformacion.formState.entity
          .responsable,
        fechaIngreso: this.pasos.registrarInformacion.formState.entity
          .fechaIngreso,
        fechaSalida: this.pasos.registrarInformacion.formState.entity
          .fechaSalida,
        kilometraje: this.pasos.registrarInformacion.formState.entity
          .kilometraje,
        horasMotor: this.pasos.registrarInformacion.formState.entity.horasMotor,
        fechaRealizacion: this.pasos.registrarInformacion.formState.entity
          .fechaRealizacion,
        mantenimientoPlanMantenimientoId: this.pasos.registrarInformacion
          .formState.entity.mantenimientoPlanMantenimientoId,
        mantenimientoPautaActividadId: this.pasos.registrarInformacion.formState
          .entity.mantenimientoPautaActividadId,
        mantenimientoActividadMantId: this.pasos.asociarActividades.formState
          .entity.mantenimientoActividadMantId,
        actividadeExtras: this.pasos.asociarActividades.formState.entity
          .actividadeExtras,
        horasHombre: this.pasos.asociarActividades.formState.entity.horasHombre,
        costoHH: this.pasos.asociarActividades.formState.entity.costoHH,
        costoInsum: this.pasos.asociarActividades.formState.entity.costoInsum,
      };
      return crearPreventiva(model)
        .then(() => {
          this.$snotify.success(
            'Mantenimiento Preventivo ha sido registrado de forma exitosa'
          );
          this.$emit('crear');
        })
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar registrar el Mantenimiento Preventivo`,
            { timeout: 3000 }
          )
        )
        .finally(this.loadingService.hideLoading);
    }
  }

  handleVehiculosChange(event: AsociarVehiculoChangeEvent) {
    this.vehiculos = event;
    if (this.vehiculos.vehiculos[0]) {
      this.vehiculoSeleccionado = this.vehiculos.vehiculos[0];
    } else {
      this.vehiculoSeleccionado = null;
    }
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

  /* lifecycle hook*/
  constructor() {
    super();
    this.pasos.seleccionarVehiculo.permitirContinuar = this.permiteContinuarVehiculo;
  }
}
</script>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrearBase
      titulo="Registrar Mantenimiento Correctivo"
      textoBtnCancelar="Continuar Registrando"
      :titulo-confirmacion="$t('mensajes.mensajesAbandono.crear.titulo')"
      :cuerpo-confirmacion="$t('mensajes.mensajesAbandono.crear.mensaje')"
      :texto-btn-aceptar="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardarClick"
      />
    </CabeceraModalCrearBase>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <BuscarVehiculoGrid
            @vehiculoSeleccionado="handleVehiculoSeleccionado"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.registrarMantenimientoCorrectivo">
          <MantenimientoCorrectivoForm
            test-id="CrearCorrectivasModal"
            @change="handleFormChange"
            @actividadesChange="handleActividadesSeleccionadas"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('Registrar Mantenimiento Correctivo')"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
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
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { AsociarFlotaEtiquetaVehiculoChangeEvent } from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import MantenimientoCorrectivoForm, {
  MantenimientoCorrectivaFormState,
} from '@/pantallas/Correctivas/MantenimientoCorrectivoForm.vue';
import { Vehiculo } from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraModalCrearBase from '@/reusable/Modal/CabeceraModalCrearBase.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { crearMantenimientoCorrectivo } from '@/pantallas/Correctivas/Data/crearMantenimientoCorrectivo';
import BuscarVehiculoGrid from './BuscarVehiculoGrid.vue';
import {
  makeCorrectivaPasosCrear,
  ActividadesCorrectivas,
} from '@/pantallas/Correctivas/Data/Correctiva';
import Confirmation from '@/components/Confirmation.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    Confirmation,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    CabeceraModalCrearBase,
    MantenimientoCorrectivoForm,
    BuscarVehiculoGrid,
    ModalMantenedor,
    MensajeValidacion,
  },
})
export default class CrearCorrectivasModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  /* template */
  dialogConfirmacionClose: boolean = false;
  pasoActivoIndex = 1;
  readonly pasos = makeCorrectivaPasosCrear();
  readonly funcionalidad: Funcionalidades = Funcionalidades.Correctivas;
  form: MantenimientoCorrectivaFormState = {
    entity: null,
    validator: null,
    isDirty: false,
  };

  vehiculoSeleccionadoId: number = 0;
  actividadesSeleccionadas: ActividadesCorrectivas[] = [];
  dialogConfirmacion: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.permiteContinuarVehiculo;
    this.pasos.registrarMantenimientoCorrectivo.permitirContinuar = this.permiteContinuarInofrmacion;
  }

  permiteContinuarVehiculo() {
    if (!this.vehiculoSeleccionadoId) {
      this.tituloValidacion = 'Seleccionar Vehículo';
      this.mensajeValidacion = 'Debe seleccionar un Vehículo.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  permiteContinuarInofrmacion() {
    if (
      this.actividadesSeleccionadas.length === 0 &&
      !this.pasos.registrarMantenimientoCorrectivo.formState.entity
        .actividadesExtras
    ) {
      this.tituloValidacion = 'Seleccionar Actividad';
      this.mensajeValidacion =
        'Debe seleccionar al menos una Actividad o agregar una Actividad extra.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  async handleGuardarClick() {
    /* if (this.actividadesSeleccionadas.length === 0) {
      this.tituloValidacion = 'Seleccionar Actividad';
      this.mensajeValidacion = 'Debe seleccionar al menos una Actividad.';
      this.showValidacion = true;
      return;
    } */
    this.mensajeConfirmacionInactivo = this.$t(
      '¿Está seguro que desea registrar el Mantenimiento Correctivo?'
    );
    this.dialogConfirmacion = true;
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.loadingService.showLoading();
      crearMantenimientoCorrectivo({
        ...this.pasos.registrarMantenimientoCorrectivo.formState.entity,
        vehiculoId: this.vehiculoSeleccionadoId,
        actividades: this.actividadesSeleccionadas,
      })
        .then(() => {
          this.$snotify.success(
            'Mantenimiento Correctivo ha sido registrado de forma exitosa'
          );
          this.$emit('crear');
        })
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar registrar el Mantenimiento Correctivo`,
            { timeout: 3000 }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.registrarMantenimientoCorrectivo.formState = event;
  }

  handleVehiculoSeleccionado(idVehiculo: number) {
    this.vehiculoSeleccionadoId = idVehiculo;
  }

  handleActividadesSeleccionadas(event: ActividadesCorrectivas[]) {
    this.actividadesSeleccionadas = event;
  }
}
</script>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Mantenimiento Correctivo"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :nombreEntidad="correctivoSeleccionado.nombre"
      entidad="Mantenimiento Correctivo"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <MantenimientoCorrectivoForm
        @change="handleFormChange"
        @actividadesChange="handleActividadesSeleccionadas"
        test-id="EditarMantenimientoCorrectivoModal"
        v-show="pasoActivoIndex === pasos.registrarMantenimientoCorrectivo.step"
        :correctivoSeleccionado="correctivoSeleccionado"
      />
    </ContenidoModal>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t('Seleccionar Actividad')"
      :mensaje="
        $t(
          'Debe seleccionar al menos una Actividad o agregar una Actividad extra.'
        )
      "
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
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { crearMantenimientoCorrectivo } from '@/pantallas/Correctivas/Data/crearMantenimientoCorrectivo';
import BuscarVehiculoGrid from './BuscarVehiculoGrid.vue';
import {
  makeCorrectivaPasos,
  ActividadesCorrectivas,
  makeCorrectivaPasosEditar,
} from '@/pantallas/Correctivas/Data/Correctiva';
import Confirmation from '@/components/Confirmation.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import { editarMantenimientoCorrectivo } from './Data/editarMantenimientoCorrectivo';
import { Correctiva } from '../Correctivas/Data/Correctiva';
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
    MantenimientoCorrectivoForm,
    BuscarVehiculoGrid,
    ModalMantenedor,
    GuardarCambiosButton,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModalEditar,
    MensajeValidacion,
  },
})
export default class EditarCorrectivaModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop() correctivoSeleccionado: Correctiva;

  /* template */
  dialogConfirmacionClose: boolean = false;
  pasoActivoIndex = 1;
  readonly pasos = makeCorrectivaPasosEditar();
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
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    this.loadingService.showLoading();
    editarMantenimientoCorrectivo({
      ...this.pasos.registrarMantenimientoCorrectivo.formState.entity,
      id: this.correctivoSeleccionado.id,
      vehiculoId: this.correctivoSeleccionado.vehiculoId,
      actividades: this.actividadesSeleccionadas,
    })
      .then(() => {
        this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
        this.$emit('editar');
      })
      .catch(() =>
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'))
      )
      .finally(this.loadingService.hideLoading);
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.registrarMantenimientoCorrectivo.formState = event;
  }

  handleActividadesSeleccionadas(event: ActividadesCorrectivas[]) {
    this.actividadesSeleccionadas = event;
  }

  permiteContinuarActividad() {
    if (
      this.actividadesSeleccionadas.length === 0 &&
      !this.pasos.registrarMantenimientoCorrectivo.formState.entity
        .actividadesExtras
    ) {
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  /* lifecycle hook*/
  constructor() {
    super();
    this.pasos.registrarMantenimientoCorrectivo.permitirContinuar = this.permiteContinuarActividad;
  }
}
</script>

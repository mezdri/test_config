<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Mantenimiento Correctivo"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />

    <ContenidoModal>
      <DetalleCorrectivaForm
        :readonly="true"
        test-id="CrearCorrectivasModal"
        :correctivoSeleccionado="correctivoSeleccionado"
        v-show="pasoActivoIndex === pasos.registrarMantenimientoCorrectivo.step"
      />
    </ContenidoModal>
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
import {
  makeCorrectivaPasosVerDetalle,
  ActividadesCorrectivas,
  Correctiva,
} from '@/pantallas/Correctivas/Data/Correctiva';
import Confirmation from '@/components/Confirmation.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import DetalleCorrectivaForm from '@/pantallas/HistoricoMantenimiento/DetalleCorrectivaForm.vue';

@Component({
  components: {
    Confirmation,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    MantenimientoCorrectivoForm,
    ModalMantenedor,
    GuardarCambiosButton,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModal,
    DetalleCorrectivaForm,
  },
})
export default class VerDetalleMantenimientoCorrectivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop() correctivoSeleccionado: Correctiva;

  /* template */
  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    registrarMantenimientoCorrectivo: {
      accion: 'Crear - Registrar Información',
      visible: true,
      step: 1,
      title: 'Mantenimiento Correctivo',
      // TODO definir icono (usado en editar/ver detalle)
      icon: 'description',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };
  readonly funcionalidad: Funcionalidades = Funcionalidades.Correctivas;

  vehiculoSeleccionadoId: number = 0;
  actividadesSeleccionadas: ActividadesCorrectivas[] = [];

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

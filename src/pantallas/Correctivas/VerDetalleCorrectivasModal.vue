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
      <BuscarVehiculoGrid
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
        :modoVer="true"
        :correctivoSeleccionado="correctivoSeleccionado"
      />

      <MantenimientoCorrectivoForm
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
import BuscarVehiculoGrid from './BuscarVehiculoGrid.vue';
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
    CabeceraModal,
  },
})
export default class VerDetalleCorrectivasModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop() correctivoSeleccionado: Correctiva;

  /* template */
  pasoActivoIndex = 1;
  readonly pasos = makeCorrectivaPasosVerDetalle();
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

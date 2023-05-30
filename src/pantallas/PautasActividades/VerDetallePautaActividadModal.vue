<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Pauta de Actividades"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <PautaActividadForm
        :disabled="true"
        :pautaSeleccionada="pautaSeleccionada"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarActividadGrid
        :disabled="true"
        :actividadesSeleccionadas="
          pautaSeleccionada ? pautaSeleccionada.actividades : pautaSeleccionada
        "
        v-show="pasoActivoIndex === pasos.asociarActividades.step"
      />
      <AsociarPlanMantencionGrid
        :disabled="true"
        :planesSeleccionados="
          pautaSeleccionada
            ? pautaSeleccionada.planesMantenimiento
            : pautaSeleccionada
        "
        v-show="pasoActivoIndex === pasos.asociarPlanMantencion.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import PautaActividadForm from '@/pantallas/PautasActividades/PautaActividadForm.vue';
import AsociarActividadGrid from '@/pantallas/PautasActividades/AsociarActividadGrid.vue';
import AsociarPlanMantencionGrid from '@/pantallas/PautasActividades/AsociarPlanMantencionGrid.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  PautaActividad,
  PautaActividadNueva,
  makePautaPasosVerDetalle,
} from './PautaActividad';
import { editarPautaActividad } from '@/pantallas/PautasActividades/editarPautaActividad';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearPautaActividadFormState = {
  entity: PautaActividadNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModal,
    PautaActividadForm,
    ModalMantenedor,
    AsociarActividadGrid,
    AsociarPlanMantencionGrid,
    ContenidoModal,
    CrudStepsNavBar,
  },
})
export default class VerDetallePautaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) pautaSeleccionada: PautaActividad;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.PautasActividades;

  pasoActivoIndex = 1;
  readonly pasos = makePautaPasosVerDetalle();

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Mantenimiento Preventivo"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />

    <ContenidoModal>
      <AsociarVehiculoForm
        :readonly="true"
        v-show="pasoActivoIndex === pasos.seleccionarVehiculo.step"
        :vehiculosIdSeleccionar="preventivaSeleccionada.vehiculoMantenimientoId"
      />
      <RegistrarInformacionForm
        :readonly="true"
        test-id="EditarRegistrarInformacionModal"
        :preventivaSeleccionada="preventivaSeleccionada"
        v-show="pasoActivoIndex === pasos.registrarInformacion.step"
      />

      <AsociarActividadesForm
        :readonly="true"
        test-id="AsociarActividadesForm"
        :idPauta="idPauta"
        :preventivaSeleccionada="preventivaSeleccionada"
        v-show="pasoActivoIndex === pasos.asociarActividades.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { RecepcionActividad } from '@/pantallas/Recepcion/RecepcionActividad';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import AsociarFlotaEtiquetaVehiculo from '@/pantallas/Recepcion/AsociarFlotaEtiquetaVehiculo.vue';
import {
  fetchRecepcionActividad,
  RecepcionActividadDetalle,
} from '@/pantallas/Recepcion/fetchRecepcionActividad';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import {
  makePreventivaPasosVerDetalle,
  PreventivaNuevo,
} from '@/pantallas/Preventivas/Preventiva';
import AsociarVehiculoForm, {
  AsociarVehiculoChangeEvent,
} from '@/pantallas/Preventivas/AsociarVehiculoForm.vue';
import RegistrarInformacionForm from '@/pantallas/Preventivas/RegistrarInformacionForm.vue';
import AsociarActividadesForm from '@/pantallas/Preventivas/AsociarActividadesForm.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    AsociarFlotaEtiquetaVehiculo,
    ContinuarButton,
    VolverButton,
    GuardarCambiosButton,
    ModalMantenedor,
    CabeceraModal,
    AsociarVehiculoForm,
    RegistrarInformacionForm,
    AsociarActividadesForm,
  },
})
export default class VerDetallePreventivaModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) preventivaSeleccionada: PreventivaNuevo;

  /* template */

  recepcionActividadDetalle: RecepcionActividadDetalle | void = null;
  pasoActivoIndex: number = 1;
  readonly pasos: PasosCrud = makePreventivaPasosVerDetalle();
  readonly funcionalidad: Funcionalidades = Funcionalidades.Preventivas;
  idPauta: number = 0;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  /* lifecycle hooks */

  async mounted() {
    //this.recepcionActividadDetalle = await this.fetchRecepcionActividad();
  }

  /* misc */

  // fetchRecepcionActividad() {
  //   this.loadingService.showLoading();
  //   return fetchRecepcionActividad(this.recepcionActividad)
  //     .catch(() => {
  //       this.$snotify.error(
  //         'Ha ocurrido un error al intentar obtener esta recepción de actividades',
  //         { timeout: 3000 }
  //       );
  //       return;
  //     })
  //     .finally(() => this.loadingService.hideLoading());
  // }
}
</script>

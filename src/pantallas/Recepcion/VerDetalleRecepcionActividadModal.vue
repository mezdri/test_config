<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="'Ver Detalle Recepción de Información'"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />

    <ContenidoModal>
      <RecepcionActividadForm
        :disabled="true"
        :recepcion-actividad="recepcionActividad"
        test-id="VerDetalleRecepcionActividadModal"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarFlotaEtiquetaVehiculoIndividual
        :readonly="true"
        :flotas-id-seleccionar="
          recepcionActividadDetalle && recepcionActividadDetalle.flotasId
        "
        :etiquetas-id-seleccionar="
          recepcionActividadDetalle && recepcionActividadDetalle.etiquetasId
        "
        :vehiculos-id-seleccionar="
          recepcionActividadDetalle && recepcionActividadDetalle.vehiculosId
        "
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
        :col-def-vehiculo="vehiculoColDefs"
        :filtroGps="true"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import RecepcionActividadForm from '@/pantallas/Recepcion/RecepcionActividadForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import {
  makeRecepcionActividadPasosVerDetalle,
  RecepcionActividad,
} from '@/pantallas/Recepcion/RecepcionActividad';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import {
  fetchRecepcionActividad,
  RecepcionActividadDetalle,
} from '@/pantallas/Recepcion/fetchRecepcionActividad';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import { ColDef } from 'ag-grid-community';
import AsociarFlotaEtiquetaVehiculoIndividual from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    AsociarFlotaEtiquetaVehiculoIndividual,
    ContinuarButton,
    VolverButton,
    GuardarCambiosButton,
    ModalMantenedor,
    CabeceraModal,
    RecepcionActividadForm,
  },
})
export default class VerDetalleRecepcionActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) recepcionActividad: RecepcionActividad;

  /* template */

  recepcionActividadDetalle: RecepcionActividadDetalle | void = null;
  pasoActivoIndex: number = 1;
  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.RecepcionDeActividades;
  readonly pasos: PasosCrud = makeRecepcionActividadPasosVerDetalle();
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  // TODO extraer
  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      lockPinned: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  /* lifecycle hooks */

  async mounted() {
    this.recepcionActividadDetalle = await this.fetchRecepcionActividad();
  }

  /* misc */

  fetchRecepcionActividad() {
    this.loadingService.showLoading();
    return fetchRecepcionActividad(this.recepcionActividad)
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener esta recepción de actividades',
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

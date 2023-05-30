<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      @cerrar="handleCerrar"
      titulo="Ver Detalle Descarga de Información"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />

    <ContenidoModal v-if="descargaActividadDetalle">
      <DescargaActividadForm
        :disabled="true"
        :descarga-actividad="descargaActividadDetalle"
        test-id="VerDetalleDescargaActividadModal"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarFlotaEtiquetaVehiculoIndividual
        :readonly="true"
        :flotas-id-seleccionar="descargaActividadDetalle.flotasId"
        :etiquetas-id-seleccionar="descargaActividadDetalle.etiquetasId"
        :vehiculos-id-seleccionar="descargaActividadDetalle.vehiculosId"
        :col-def-vehiculo="vehiculoColDefs"
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
      />
      <PasoAsociacion
        v-show="pasoActivoIndex === pasos.asociarActividades.step"
      >
        <AsociarTiposActividad
          v-model="descargaActividadDetalle.tiposActividadId"
          :readonly="true"
        />
      </PasoAsociacion>
      <PasoAsociacion
        v-show="pasoActivoIndex === pasos.asociarDispositivos.step"
      >
        <AsociarDispositivos
          v-model="descargaActividadDetalle.dispositivosId"
          :readonly="true"
        />
      </PasoAsociacion>
      <AsociarCampos
        v-show="pasoActivoIndex === pasos.seleccionarCampos.step"
        v-model="descargaActividadDetalle.camposId"
        :readonly="true"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import {
  DescargaActividad,
  DescargaActividadParcial,
  makeDescargaActividadPasosVerDetalle,
  DescargaActividadGrid,
} from '@/pantallas/DescargaActividades/DescargaActividad';
import { fetchDescargaActividad } from '@/pantallas/DescargaActividades/fetchDescargaActividad';
import DescargaActividadForm from '@/pantallas/DescargaActividades/crud/DescargaActividadForm.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import AsociarTiposActividad from '@/pantallas/DescargaActividades/crud/crear/AsociarTiposActividad.vue';
import AsociarDispositivos from '@/reusable/Dispositivos/AsociarDispositivos.vue';
import AsociarCampos from '@/pantallas/DescargaActividades/crud/crear/AsociarCampos.vue';
import { ColDef } from 'ag-grid-community';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import AsociarFlotaEtiquetaVehiculoIndividual from '../../../../reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    AsociarCampos,
    AsociarDispositivos,
    AsociarTiposActividad,
    PasoAsociacion,
    DescargaActividadForm,
    ContenidoModal,
    CrudStepsNavBar,
    ContinuarButton,
    VolverButton,
    GuardarCambiosButton,
    ModalMantenedor,
    CabeceraModal,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class VerDetalleDescargaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) descargaActividad: DescargaActividadGrid;

  /* template */

  descargaActividadDetalle: DescargaActividad = null;
  pasoActivoIndex: number = 1;
  readonly pasos = makeDescargaActividadPasosVerDetalle();

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.Descargas;

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

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  /* lifecycle hooks */

  async mounted() {
    this.descargaActividadDetalle =
      (await this.fetchDescargaActividad()) || null;
  }

  /* misc */

  fetchDescargaActividad() {
    this.loadingService.showLoading();
    return fetchDescargaActividad(this.descargaActividad)
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener esta descarga de actividades'
        );
        this.handleCerrar();
      })
      .finally(this.loadingService.hideLoading);
  }
}
</script>

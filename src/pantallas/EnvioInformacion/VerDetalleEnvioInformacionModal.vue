<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Envío de Información"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <InformacionGeneralForm
        :modoVer="true"
        :envio="envio"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarFlotaEtiquetaVehiculoIndividual
        :flotas-id-seleccionar="envio && envio.flotas"
        :etiquetas-id-seleccionar="envio && envio.etiquetas"
        :vehiculos-id-seleccionar="envio && envio.vehiculos"
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
        :readonly="true"
        :col-def-vehiculo="vehiculoColDefs"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import InformacionGeneralForm from '@/pantallas/EnvioInformacion/InformacionGeneralForm.vue';
import AsociarFlotaEtiquetaVehiculo from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { ColDef } from 'ag-grid-community';

import { fetchByIdEnvio } from '@/pantallas/EnvioInformacion/Services/fetchByIdEnvio';
import { Envio, makePasosVerDetalle } from '@/interfaces/Envio';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

import AsociarFlotaEtiquetaVehiculoIndividual from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    ModalMantenedor,
    CabeceraModal,
    InformacionGeneralForm,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class VerDetalleEnvioInformacionModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) id: number;

  readonly $snotify: Snotify;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  loadingService = new LoadingService();

  /* template */
  pasoActivoIndex: number = 1;
  readonly funcionalidad: Funcionalidades = Funcionalidades.EnvioDeInformacion;
  readonly pasos: PasosCrud = makePasosVerDetalle();

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

  envio: Envio | void = null;

  handleCerrar() {
    this.$emit('cerrar');
  }

  async mounted() {
    this.envio = await this.fetchByIdEnvio();
  }

  /* event handlers */

  fetchByIdEnvio() {
    this.loadingService.showLoading();
    return fetchByIdEnvio(this.id)
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'el servicio de envio',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

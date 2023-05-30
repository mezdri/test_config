<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Información Telco" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <TelcoEditarForm
        :modoVer="true"
        :isVerDetalle="true"
        :telcoid="telcoid"
        :telconame="telconame"
        :telcoprefix="telcoprefix"
        v-show="pasoActivoIndex === pasos.serie_numero.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import TelcoEditarForm from './MantenedorTelcoEditar/TelcoEditarForm.vue';
// import AsociarMensajesForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesForm.vue';
import AsociarMensajesFormDetalle from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesFormDetalle.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import { ServicioProxy } from '@/config/enums';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { ColDef } from 'ag-grid-community';
import {
  BaseRuta,
  MensajeSeleccionado,
  Ruta,
  TipoEventoCopiloto,
  TipoEventoCopilotoSeleccionado,
} from '@/pantallas/CopilotoVirtual/Ruta/rutas';
import { AxiosVue } from '@/AxiosVue';
import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import { fetchReportesSerie } from './fetchReporteSerie';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    TelcoEditarForm,
  },
})
export default class VerEditarRutaModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) telcoid: any;
  @Prop({ default: null }) telconame: any;
  @Prop({ default: null }) telcoprefix: any;

  mensajes: Mensaje[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    serie_numero: {
      accion: 'Crear - Asociar Eventos',
      visible: true,
      step: 1,
      title: 'Editar Telco',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

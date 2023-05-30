<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Crear Información Telco" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <TelcoCrearForm
        :modoVer="true"
        :isVerDetalle="true"
        v-show="pasoActivoIndex === pasos.serie_numero.step"
        :telcoid_crear="telcoid_crear"
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
import TelcoCrearForm from './MantenedorTelcoCrear/TelcoCrearForm.vue';
import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    TelcoCrearForm,
  },
})
export default class VerEditarRutaModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) telcoid_crear: any;

  mensajes: Mensaje[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    serie_numero: {
      accion: 'Crear - Asociar Eventos',
      visible: true,
      step: 1,
      title: 'Crear Telco',
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

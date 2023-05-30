<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Tipo de Mantenimiento"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <TipoMantenimientoForm
        :tipoMantenimientoSeleccionado="tipoMantenimientoSeleccionado"
        :modoVer="true"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import { TipoMantenimiento } from './TipoMantenimiento';
import TipoMantenimientoForm from '@/pantallas/TipoMantenimiento/TipoMantenimientoForm.vue';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    TipoMantenimientoForm,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class VerTipoMantenimientoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) tipoMantenimientoSeleccionado: TipoMantenimiento;

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Información General',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

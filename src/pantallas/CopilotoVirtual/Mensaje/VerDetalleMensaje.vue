<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle Mensaje" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <MensajeForm
        :mensajeSeleccionado="mensajeSeleccionado"
        :isVerDetalle="true"
        test-id="VerDetalleDispositivoModal"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import MensajeForm from '@/pantallas/CopilotoVirtual/Mensaje/MensajeForm.vue';

import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    MensajeForm,
  },
})
export default class VerDetalleMensaje extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) mensajeSeleccionado: Mensaje;

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

  /* Event Handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Contacto Ejecutivo"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <ContenidoModal>
      <ContactarEjecutivoForm :isVerDetalle="true" />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import ContactarEjecutivoForm from '@/pantallas/SucursalVirtual/ContactarEjecutivo/ContactarEjecutivoForm.vue';

import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    ContenidoModal,
    ContactarEjecutivoForm,
  },
})
export default class ContactarEjecutivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) usuarioSeleccionado: any;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInfoGeneral() {
    this.showInfo = true;
  }
}
</script>

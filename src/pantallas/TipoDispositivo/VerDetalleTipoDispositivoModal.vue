<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Tipo de Dispositivo"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.informacionGeneral.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.informacionGeneral.visible"
          @click="handleInfoGeneral"
          color="primary"
          flat
          :value="pasos.informacionGeneral.step"
        >
          <span>Información General</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <TipoDispositivoForm
        :tipoSeleccionado="tipoSeleccionado"
        :isVerDetalle="true"
        test-id="VerDetalleTipoDispositivoModal"
      />
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';

import TipoDispositivoForm from '@/pantallas/TipoDispositivo/TipoDispositivoForm.vue';
import { TipoDispositivoNuevo } from '@/pantallas/TipoDispositivo/TipoDispositivo';

@Component({
  components: {
    CabeceraModal,
    TipoDispositivoForm,
    ModalMantenedor,
  },
})
export default class VerDetalleTipoDispositivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) tipoSeleccionado: TipoDispositivoNuevo;

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

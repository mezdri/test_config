<template>
  <ModalMantenedor :show="show" style="min-width: 978px !important;">
    <CabeceraModal titulo="Detalle VOD" @cerrar="handleCerrar"></CabeceraModal>
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
          <span>Detalle VOD</span>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <DetalleVODForm :selectedVOD="selectedVOD" />
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import DetalleVODForm from '@/pantallas/Camaras/VOD/DetalleVODForm.vue';
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

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    DetalleVODForm,
  },
})
export default class CrearVODModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: {} }) selectedVOD: any;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Detalle - Información General',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  mounted() {
    console.log(this.selectedVOD);
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInfoGeneral() {
    this.showInfo = true;
  }
}
</script>

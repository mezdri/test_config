<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="(esEditar ? 'Editar' : 'Crear') + ' Configuración Alertas'"
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
      <AlertaConfigForm
        :registroSeleccionado="registroSeleccionado"
        :esEditar="esEditar"
        :listaFlotas="listaFlotas"
        :listaGrupos="listaGrupos"
        @handleCerrar="handleCerrar"
        @handleShowLoading="handleShowLoading"
        @handleHideLoading="handleHideLoading"
      />
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import AlertaConfigForm from '@/pantallas/Camaras/ConfigurarAlertas/AlertaConfigForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';

import { AlertaGrilla } from '@/pantallas/Camaras/Alertas/fetchAlerta';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import {
  ConfigFlotas,
  ConfigGrupos,
} from '@/pantallas/Camaras/Alertas/fetchFlota';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    AlertaConfigForm,
  },
})
export default class VerDetalleAlertaModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) registroSeleccionado: any;
  @Prop({ required: true }) esEditar: boolean;
  @Prop() listaFlotas: ConfigFlotas[];
  @Prop() listaGrupos: ConfigGrupos[];

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

  handleShowLoading() {
    this.loadingService.showLoading();
  }
  handleHideLoading() {
    this.loadingService.hideLoading();
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInfoGeneral() {
    this.showInfo = true;
  }
}
</script>

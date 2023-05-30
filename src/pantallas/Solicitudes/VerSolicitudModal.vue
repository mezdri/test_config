<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Solicitud"
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
      <SolicitudForm
        :modoVer="true"
        :solicitudSeleccionada="solicitudSeleccionada"
      />
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import SolicitudForm from '@/pantallas/Solicitudes/SolicitudForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { editarPautaActividad } from '@/pantallas/PautasActividades/editarPautaActividad';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';
import { fetchClienteProveedor } from '@/pantallas/ClienteProveedor/fetchClienteProveedor';

type CrearPautaActividadFormState = {
  entity: ClienteProveedor;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModal,
    SolicitudForm,
    ModalMantenedor,
  },
})
export default class VerSolicitudModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) solicitudSeleccionada: any;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;
  showPlanMantenimiento: boolean = false;
  lstClienteProveedor: any = {};

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {}

  /* event handlers */
  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

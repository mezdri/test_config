<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Mantenimiento Preventivo"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.mantenimientoPreventivo.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.mantenimientoPreventivo.visible"
          @click="handleInfoGeneral"
          color="primary"
          flat
          :value="pasos.mantenimientoPreventivo.step"
        >
          <span>Mantenimiento Preventivo</span>
          <v-icon>assignment</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <DetallePreventivaForm
        :planSeleccionado="planSeleccionado"
        :isVerDetalle="true"
      />
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { PreventivaNuevo } from '@/pantallas/Preventivas/Preventiva';
import DetallePreventivaForm from '@/pantallas/HistoricoMantenimiento/DetallePreventivaForm.vue';
import { HistoricosPreventivoList } from '@/pantallas/HistoricoMantenimiento/fetchHistoricoPreventivo';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    DetallePreventivaForm,
  },
})
export default class VerDetallePlanPreventivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) planSeleccionado: HistoricosPreventivoList;

  pasoActivoIndex = 1;
  pasos = {
    mantenimientoPreventivo: {
      accion: 'Ver Detalle - Mantenimiento Preventivo',
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

  @Watch('planSeleccionado', { deep: true, immediate: true })
  async handlePlanSeleccionadoChange() {
    if (!this.planSeleccionado) {
      return;
    }
  }
}
</script>

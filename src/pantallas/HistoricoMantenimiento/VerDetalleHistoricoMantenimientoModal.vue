<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Históricos de Mantenimiento"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.costoMantenimiento.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.costoMantenimiento.visible"
          @click="handleInfoGeneral"
          color="primary"
          flat
          :value="pasos.costoMantenimiento.step"
        >
          <span>Costo Mantenimiento</span>
          <v-icon>assignment</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <div align="center">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-tabs left v-model="tabModel" color="transparent">
              <v-tab :href="`#tab-1`">PREVENTIVA</v-tab>
              <v-tab :href="`#tab-2`">CORRECTIVA</v-tab>
            </v-tabs>
          </v-card>
        </v-flex>
        <CostoPreventivaForm
          v-show="tabModel === 'tab-1'"
          :vehiculoSeleccionado="vehiculoSeleccionado"
        />
        <CostoCorrectivaForm
          v-show="tabModel === 'tab-2'"
          :vehiculoSeleccionado="vehiculoSeleccionado"
        />
      </div>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { Vehiculo as VehiculoType } from '@/pantallas/HistoricoMantenimiento/fetchVehiculosHistorico';
import CostoPreventivaForm from '@/pantallas/HistoricoMantenimiento/CostoPreventivaForm.vue';
import CostoCorrectivaForm from '@/pantallas/HistoricoMantenimiento/CostoCorrectivaForm.vue';
import { HistoricoCorrectivo } from './HistoricoCorrectivo';
import { fetchHistoricosCorrectivo } from './fetchHistoricoCorrectivo';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CostoPreventivaForm,
    CostoCorrectivaForm,
  },
})
export default class VerDetalleHistoricoMantenimientoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) vehiculoSeleccionado: VehiculoType;

  tabModel: string = 'tab-1';
  pasoActivoIndex = 1;
  pasos = {
    costoMantenimiento: {
      accion: 'Ver Detalle - Costo Mantenimiento',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;
  idVehiculoSeleccionado: number = 0;

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

  @Watch('vehiculoSeleccionado', { deep: true })
  handletipoSeleccionadoChange() {
    if (!this.vehiculoSeleccionado) {
      return;
    }
    this.idVehiculoSeleccionado = this.vehiculoSeleccionado.vehiculoId;
  }
}
</script>

<template>
  <v-card height="55px" flat>
    <v-bottom-nav
      :active.sync="pasoActivoIndex"
      :value="true"
      absolute
      color="transparent"
    >
      <v-layout justify-center>
        <v-btn
          v-for="paso in Object.values(pasos)"
          :key="paso.step"
          v-show="paso.visible"
          color="primary"
          flat
          :value="paso.step"
          @click="handleStepClick"
        >
          <span>{{ paso.title }}</span>
          <v-icon>{{ paso.icon }}</v-icon>
        </v-btn>
      </v-layout>
    </v-bottom-nav>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { scrollModalIntoView } from '../Modal/ModalMantenedor.vue';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import { isPasoValido } from './isPasoValido';

type Value = number;

@Component({})
export default class CrudStepsNavBar extends Vue {
  /**
   * Índice del paso activo
   */
  @Prop({ required: true }) value: Value;
  @Prop({ required: true }) pasos: PasosCrud;
  /**
   * Pasos en "Ver detalle" no validan, tampoco tienen un validador de
   * v-validate asignado.
   */
  @Prop({ default: true }) validarPaso: boolean;

  pasoActivoIndex: Value = this.value;

  @Watch('pasoActivoIndex')
  async handleValueChange(
    pasoActivoIndex: Value,
    previousPasoActivoIndex: Value
  ) {
    if (this.validarPaso) {
      if (!(await isPasoValido(this.getPaso(previousPasoActivoIndex)))) {
        this.pasoActivoIndex = previousPasoActivoIndex;
        return;
      }
    }
    this.$emit('input', this.pasoActivoIndex);
  }

  async handleStepClick() {
    // Asume que es usado dentro de un <ModalMantenedor>
    scrollModalIntoView();
  }

  getPaso(index: number) {
    return Object.values(this.pasos).find(x => x.step === index);
  }
}
</script>

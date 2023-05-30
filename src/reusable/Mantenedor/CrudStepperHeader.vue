<template>
  <v-stepper-header>
    <template v-for="paso in Object.values(pasos)">
      <v-stepper-step
        :key="`step-${paso.step}`"
        v-show="paso.visible"
        :complete="pasoActivoIndex > paso.step"
        :step="paso.step"
        >{{ paso.title }}</v-stepper-step
      >
      <v-divider
        v-show="paso.visible && contador !== paso.step"
        :key="`divider-${paso.step}`"
      />
    </template>
  </v-stepper-header>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { object } from 'yup';

@Component({
  components: { GuardarCambiosButton, ContinuarButton, VolverButton },
})
export default class CrudStepperHeader extends Vue {
  @Prop({ required: true }) pasos: PasosCrud;
  @Prop({ required: true }) pasoActivoIndex: number;

  contador: number = 0;

  @Watch('pasos', { immediate: true })
  async contadorPasos() {
    this.contador = 0;
    Object.values(this.pasos).forEach(value => {
      if (value.visible) {
        this.contador++;
      }
    });
  }
}
</script>

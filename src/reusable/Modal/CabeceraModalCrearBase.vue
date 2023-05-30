<template>
  <div>
    <CabeceraModal :titulo="titulo" @cerrar="handleCerrar">
      <slot />
    </CabeceraModal>
    <Confirmation
      :show="showConfirmacionCerrar"
      :titulo="tituloConfirmacion"
      :mensaje="cuerpoConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmarCerrar"
      :textoBtnSi="textoBtnAceptar"
      :textoBtnNo="textoBtnCancelar"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Confirmation from '@/components/Confirmation.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';

@Component({
  components: { CabeceraModal, Confirmation },
})
export default class CabeceraModalCrearBase extends Vue {
  @Prop({ required: true }) titulo: string;
  @Prop({ required: true }) tituloConfirmacion: string;
  @Prop({ required: true }) cuerpoConfirmacion: string;
  @Prop({ required: true }) textoBtnAceptar: string;
  @Prop({ required: true }) textoBtnCancelar: string;

  /* state */

  showConfirmacionCerrar = false;

  /* event handlers */

  handleCerrar() {
    this.showConfirmacionCerrar = true;
  }

  handleConfirmarCerrar(isConfirmado: boolean) {
    this.showConfirmacionCerrar = false;
    if (isConfirmado) {
      this.$emit('cerrar');
    }
  }
}
</script>

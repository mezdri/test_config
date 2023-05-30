<template>
  <Fragment>
    <VolverButton
      v-if="pasoActivoIndex > 1"
      @click="handleVolverClick"
    />&nbsp;&nbsp;
    <GuardarButton
      v-if="isEstadoInactivo || pasoActivoIndex === ultimoPasoIndex"
      @click="handleGuardarClick"
      :disabled="isNextStepButtonDisabled"
    />
    <ContinuarButton
      v-else
      :disabled="isNextStepButtonDisabled"
      @click="handleContinuarClick"
    />
    <Confirmation
      v-if="confirmarAntesDeGuardar"
      :show="showConfirmacionGuardar"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: entidadTitulo })"
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: entidadMensaje })"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      @modalConfirmationEmit="handleConfirmarGuardar"
    />
  </Fragment>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { isPasoValido } from '@/reusable/Mantenedor/isPasoValido';
import { scrollModalIntoView } from '@/reusable/Modal/ModalMantenedor.vue';
import { EstadoEntidad } from '@/config/enums';
import { isDevelopmentEnv } from '@/reusable/environment/environmentUtils';
import Confirmation from '@/components/Confirmation.vue';

type EstadoId = number;

@Component({
  components: {
    Confirmation,
    GuardarButton,
    ContinuarButton,
    VolverButton,
  },
})
export default class NavegacionModalCrud extends Vue {
  @Prop({}) value: number;
  @Prop({ required: true }) pasos: PasosCrud;
  @Prop({
    default(): null {
      if (isDevelopmentEnv) {
        console.warn(
          'Prop "estadoId" no proporcionado. Si el mantenedor tiene un estado, este prop debería ser obligatorio.'
        );
      }
      return null;
    },
  })
  estadoId: EstadoId;
  @Prop({}) entidadTitulo: string;
  @Prop({}) entidadMensaje: string;

  /* state */

  showConfirmacionGuardar = false;

  /* event handlers */

  handleVolverClick() {
    this.offsetPasoActivoIndex(-1);
  }

  async handleContinuarClick() {
    if (!(await isPasoValido(this.pasoActivo))) {
      return;
    }

    this.offsetPasoActivoIndex(1);
  }

  async handleGuardarClick() {
    if (!(await isPasoValido(this.pasoActivo))) {
      return;
    }

    this.scrollToTop();
    if (this.confirmarAntesDeGuardar) {
      this.showConfirmacionGuardar = true;
    } else {
      this.guardar();
    }
  }

  handleConfirmarGuardar(isConfirmado: true) {
    this.showConfirmacionGuardar = false;
    if (!isConfirmado) {
      return;
    }
    this.guardar();
  }

  guardar() {
    this.$emit('guardar');
  }

  /* misc */

  offsetPasoActivoIndex(offset: number) {
    this.scrollToTop();
    this.$emit('input', this.value + offset);
  }

  scrollToTop() {
    // Asume que es usado dentro de un <ModalMantenedor>
    scrollModalIntoView();
  }

  get pasoActivoIndex() {
    return this.value;
  }

  get pasoActivo() {
    return Object.values(this.pasos).find(x => x.step === this.pasoActivoIndex);
  }

  get isNextStepButtonDisabled() {
    const {
      pasoActivo: { formState },
    } = this;
    if (!formState) {
      return false;
    }
    return formState.hasErrors;
  }

  get ultimoPasoIndex() {
    return Math.max(...Object.values(this.pasos).map(x => x.step));
  }

  get isEstadoInactivo() {
    return this.estadoId === EstadoEntidad.Inactivo;
  }

  get confirmarAntesDeGuardar() {
    return (
      this.entidadTitulo !== undefined && this.entidadMensaje !== undefined
    );
  }
}
</script>

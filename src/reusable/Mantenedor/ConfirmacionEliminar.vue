<template>
  <Confirmation
    :test-id="makeTestId('container')"
    :titulo="tituloEstandarOrSobreescrito"
    :mensaje="mensajeEstandarOrSobreescrito"
    :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
    :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    @modalConfirmationEmit="handleCierreConfirmacion"
    v-bind="{ ...passthroughProps, ...passthroughAttributes }"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { omit } from 'lodash';

import Confirmation from '@/components/Confirmation.vue';
import { makeTestId } from '@/reusable/Test/makeTestId';

type TituloEstandarParams = {
  entidad: string;
  nombreEntidad: string;
};
type MensajeEstandarParams = {
  entidad: string;
};

@Component({
  components: { Confirmation },
})
export default class ConfirmacionEliminar extends Vue {
  @Prop({ required: true }) titulo: string | TituloEstandarParams;
  @Prop({ required: true }) mensaje: string | MensajeEstandarParams;

  /* template */

  makeTestId = makeTestId(this);

  /* event handlers */

  handleCierreConfirmacion(isConfirmado: boolean) {
    this.$emit(isConfirmado ? 'aceptar' : 'cancelar');
  }

  /* template */

  get tituloEstandarOrSobreescrito() {
    const { titulo } = this;
    return typeof titulo === 'string'
      ? titulo
      : this.$t('mensajes.crud.eliminar.titulo', {
          entidad: titulo.entidad,
          nombreEntidad: titulo.nombreEntidad,
        });
  }

  get mensajeEstandarOrSobreescrito() {
    const { mensaje } = this;
    return typeof mensaje === 'string'
      ? mensaje
      : this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: mensaje.entidad,
        });
  }

  omitFromPassthroughObject(o: Object) {
    return omit(o, ['titulo', 'mensaje']);
  }

  get passthroughProps() {
    return this.omitFromPassthroughObject(this.$props);
  }

  get passthroughAttributes() {
    return this.omitFromPassthroughObject(this.$attrs);
  }
}
</script>

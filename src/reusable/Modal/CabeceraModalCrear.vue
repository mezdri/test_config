<template>
  <CabeceraModalCrearBase
    :titulo="titulo"
    :titulo-confirmacion="$t('mensajes.mensajesAbandono.crear.titulo')"
    :cuerpo-confirmacion="$t('mensajes.mensajesAbandono.crear.mensaje')"
    :texto-btn-aceptar="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
    :texto-btn-cancelar="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    v-on="$listeners"
  >
    <slot />
  </CabeceraModalCrearBase>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModalCrearBase from '@/reusable/Modal/CabeceraModalCrearBase.vue';

@Component({
  components: { CabeceraModalCrearBase },
})
export default class CabeceraModalCrear extends Vue {
  @Prop({ required: true }) titulo: string;
}
</script>

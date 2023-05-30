<template>
  <CabeceraModal
    titulo="Ver Configuración de Autorización"
    @cerrar="$emit('cerrarVer')"
  >
    <div class="cabecera"></div>
  </CabeceraModal>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';

@Component({ components: { CabeceraModal } })
export default class CabeceraModalVisualizacion extends Vue {}
</script>

<style scoped>
.cabecera {
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 10px;
}
</style>

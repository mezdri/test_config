<template>
  <CabeceraModal
    titulo="Editar Configuración de Autorización"
    @cerrar="$emit('cerrarEditar')"
  >
    <div class="cabecera">
      <div class="botones">
        <v-btn
          class="cabeceraBtnGuardar"
          @click="guard"
          :disabled="!permitirGuard"
        >
          <span>
            {{
              permitirGuard ? 'Guardar' : 'Complete los campos obligatorios (*)'
            }}
          </span>
        </v-btn>
      </div>
    </div>
  </CabeceraModal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';

@Component({ components: { CabeceraModal } })
export default class CabeceraModalEdicion extends Vue {
  @Prop({ default: false }) permitirGuard: Boolean;

  guard() {
    this.$emit('guardarCrear');
  }
}
</script>

<style scoped>
.cabecera {
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 10px;
}

.cabeceraBtnGuardar {
  padding: 0 20px;
  display: block;
  margin: 0 7px !important;
  height: 45px !important;
  line-height: 31px !important;
  font-size: 14px;
  font-weight: 500;
}

.cabeceraBtnGuardar {
  background-color: #ff6c00 !important;
  color: #fff;
}

.botones {
  display: flex;
  justify-content: space-evenly;
}
</style>

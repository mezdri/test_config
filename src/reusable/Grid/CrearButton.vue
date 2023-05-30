<template>
  <v-btn
    v-if="permisoAccion.visible"
    @click="handleClick()"
    class="icon"
    data-testid="CrearButton"
  >
    <v-icon dark left>add_circle_outline</v-icon>
    <span>Crear</span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
@Component({})
export default class CrearButton extends Vue {
  @Prop({
    default: () => ({
      accionCodigo: 0,
      visible: true,
      moduloCodigo: 0,
    }),
  })
  permisoAccion: PermisoAccion;
  handleClick() {
    this.$emit('click');
  }
}
</script>
<style scoped>
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>

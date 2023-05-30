<template>
  <v-btn
    class="button"
    @click="handleClick"
    data-testid="GuardarButton"
    id="btnGuardar"
    v-bind="{ ...$props, ...$attrs }"
  >
    <span class="text">
      <slot>Guardar</slot>
    </span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class GuardarButton extends Vue {
  handleClick() {
    this.$emit('click');
  }
}
</script>

<style scoped>
.button {
  background-color: #ff6c00 !important;
  max-height: 75% !important;
}
</style>

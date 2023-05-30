<template>
  <v-btn
    class="button"
    @click="handleClick"
    data-testid="ContinuarButton"
    v-bind="{ ...$props, ...$attrs }"
  >
    <span class="text"> Imprimir</span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class ImprimirButton extends Vue {
  handleClick() {
    this.$emit('click');
  }
}
</script>

<style scoped>
.button {
  background-color: #ffe800 !important;
  color: black !important;
  max-height: 75% !important;
}
.text {
  color: black;
}
</style>

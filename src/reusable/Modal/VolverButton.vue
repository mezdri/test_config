<template>
  <v-btn class="button" @click="handleClick">Volver</v-btn>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class VolverButton extends Vue {
  handleClick() {
    this.$emit('click');
  }
}
</script>

<style scoped>
.button {
  background-color: #526da5 !important;
  max-height: 75% !important;
}
</style>

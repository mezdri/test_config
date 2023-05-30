<template>
  <v-btn @click="handleClick()" class="icon" data-testid="AgregarButton">
    <v-icon dark left>add_circle_outline</v-icon>
    <span>Agregar</span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class AgregarButton extends Vue {
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

<template>
  <v-btn
    flat
    small
    data-permiso="Exportar"
    color="primary"
    @click="handleClick()"
  >
    <v-icon class="icon">cloud_download</v-icon>&nbsp;&nbsp;
    <span class="text">Exportar</span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class ExportarButton extends Vue {
  handleClick() {
    this.$emit('click');
  }
}
</script>

<style scoped>
.icon {
  color: #526da5 !important;
}
.text {
  color: rgba(0, 0, 0, 0.7);
}
</style>

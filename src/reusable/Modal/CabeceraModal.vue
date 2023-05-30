<template>
  <div>
    <v-toolbar dark color="primary" fixed>
      <v-btn icon dark @click="handleCerrarClick" :disabled="isLoading">
        <v-icon>close</v-icon>
      </v-btn>

      <v-toolbar-title>{{ titulo }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items>
        <slot />
      </v-toolbar-items>
    </v-toolbar>
    <br />
    <br />
    <br />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class CabeceraModal extends Vue {
  @Prop({ required: true }) titulo: string;

  /* state */

  isLoading: boolean = false;

  /* event handlers */

  handleCerrarClick() {
    this.$emit('cerrar');
  }
}
</script>
<style scoped>
.v-toolbar--fixed {
  z-index: 5 !important;
}
</style>

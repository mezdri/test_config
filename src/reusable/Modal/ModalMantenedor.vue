<template>
  <v-layout row justify-center v-if="show">
    <v-dialog
      v-model="show"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card :id="slotContainerId">
        <slot />
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';

const slotContainerId = 'modal-mantenedor-container';
let slotContainer: Element = null;
/**
 * Asume que un máximo de 1 modal de mantendor puede ser mostrado al mismo
 * tiempo.
 */
export const scrollModalIntoView = () => {
  if (!slotContainer) {
    return;
  }
  slotContainer.scrollIntoView(true);
};

@Component({
  components: {},
})
export default class ModalMantenedor extends Vue {
  @Prop({ required: true }) show: boolean;

  slotContainerId = slotContainerId;

  mounted() {
    slotContainer = document.getElementById(slotContainerId);
  }

  @Watch('show', { immediate: true })
  handleShowChange() {
    /* Evitar múltiples barras de desplazamiento al aumentar zoom con un modal
    abierto. */
    document.getElementsByTagName('html')[0].style.overflow = this.show
      ? 'hidden'
      : 'auto';
  }
}
</script>

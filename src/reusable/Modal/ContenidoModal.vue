<template>
  <div align="center" class="cardnew">
    <br />
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class ContenidoModal extends Vue {}
</script>

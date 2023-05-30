<template>
  <div style="display: flex;height: inherit;max-width: 100%">
    <slot />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class Fragment extends Vue {}
</script>

<template>
  <Buscador
    append-icon="search"
    v-bind="{ ...$props, ...$attrs }"
    style="margin-bottom: 11px; margin-top: 8px;"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Buscador from '@/reusable/Grid/Buscador.vue';

@Component({
  components: {
    Buscador,
  },
})
export default class BuscadorMantenedor extends Vue {}
</script>

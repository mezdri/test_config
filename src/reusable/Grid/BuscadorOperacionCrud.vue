<template>
  <div>
    <Buscador
      :prepend-icon="prepend"
      color="#27488e"
      v-bind="{ ...$props, ...$attrs }"
      append-icon="search"
    />
    <br />
    <br />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Buscador from '@/reusable/Grid/Buscador.vue';

@Component({
  components: {
    Buscador,
  },
})
export default class BuscadorOperacionCrud extends Vue {
  @Prop({ default: 'lock_open' }) prepend: string;
}
</script>

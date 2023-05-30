<template>
  <v-text-field
    v-model="query"
    label="Buscar..."
    single-line
    hide-details
    @input="handleChange"
    v-bind="{ ...$props, ...$attrs }"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { isFunction } from 'lodash';

@Component({})
export default class Buscador extends Vue {
  @Prop({ required: true }) filter: (query: string) => void;

  query: string = '';

  handleChange() {
    if (!isFunction(this.filter)) {
      return;
    }
    /*
    El filtro solo debería ser aplicado si el texto ingresado es superior a 1,
    de otro modo restablecerlo para cubrir casos en que el largo disminuye a
    0 o 1.
    */
    this.filter(this.query.length > 1 ? this.query : '');
  }
}
</script>

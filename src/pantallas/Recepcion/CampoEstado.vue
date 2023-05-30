<template>
  <v-select
    :value="value"
    :items="items"
    item-text="nombre"
    item-value="id"
    label="Estado"
    :data-vv-name="id"
    :hint="
      value === 0
        ? 'Al dejar como inactivo, no se podrán realizar asociaciones'
        : undefined
    "
    persistent-hint
    :data-testid="testId"
    @input="handleChange"
    v-bind="{ ...$props, ...$attrs }"
  />
</template>
<script>
import { EstadosService } from '@/services/estadosService';

export default {
  name: 'CampoEstado',
  $_veeValidate: {
    value() {
      return this.value;
    },
    name() {
      return this.id;
    },
  },
  props: {
    id: String,
    errorMessages: {
      type: null,
    },
    value: {
      type: null,
      default: null,
    },
    testId: String,
  },
  data: () => ({
    items: new EstadosService().getEstadosVisibles(),
  }),
  methods: {
    handleChange(value) {
      this.$emit('input', value);
    },
  },
};
</script>

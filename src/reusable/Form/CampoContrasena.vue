<template>
  <v-text-field
    :append-icon="isTextoVisible ? 'visibility_off' : 'visibility'"
    :type="isTextoVisible ? 'text' : 'password'"
    :value="value"
    :data-testid="testId"
    @input="handleChange"
    @click:append="handleVisibilityClick"
    v-bind="{ ...$props, ...$attrs }"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class CampoContrasena extends Vue {
  @Prop() value: string;
  @Prop() testId: string;

  isTextoVisible = false;

  handleChange(value: string) {
    this.$emit('input', value);
  }

  handleVisibilityClick() {
    this.isTextoVisible = !this.isTextoVisible;
  }
}
</script>

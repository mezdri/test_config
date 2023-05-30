<template>
  <!-- @ts-ignore -->
  <v-switch :label="label" v-bind="{ ...$props, ...$attrs }"></v-switch>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class SwitchForm extends Vue {
  @Prop({ required: true }) label: string;
}
</script>

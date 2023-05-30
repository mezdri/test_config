<template>
  <!-- @ts-ignore -->
  <v-text-field :label="label" v-bind="{ ...$props, ...$attrs }"></v-text-field>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { lowerCase } from 'lodash';

@Component({})
export default class TextField extends Vue {
  @Prop({ required: true }) label: string;

  lowerCase = lowerCase;
}
</script>

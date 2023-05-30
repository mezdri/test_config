<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>{{ title }}</v-tab>
    </v-tabs>
    <v-divider />
    <slot></slot>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class ContainerPage extends Vue {
  @Prop(String) readonly title: string;
}
</script>

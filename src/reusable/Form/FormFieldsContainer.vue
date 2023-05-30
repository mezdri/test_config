<template>
  <div>
    <div class="v-title" align="left" v-if="titulo">
      <h2>
        {{ titulo }}
      </h2>
      <v-divider></v-divider>
    </div>

    <v-layout wrap :column="column">
      <slot />
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class FormFieldsContainer extends Vue {
  @Prop({}) titulo: string;
  @Prop({ default: false }) column: boolean;
}
</script>

<style scoped>
.v-title {
  margin-bottom: 20px;
}

h2 {
  font-weight: normal;
  margin: 12px 0px 0px;
}
</style>

<template>
  <div>
    <div align="left" v-if="titulo">
      <h2>
        {{ titulo }}
        <!-- <v-btn flat icon small @click="imprimir">
            <v-icon color="#27488E">print</v-icon>
        </v-btn> -->
      </h2>
      <v-divider></v-divider>
      <br />
    </div>
    <v-layout wrap>
      <slot />
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class FormFieldContainerFacturacion extends Vue {
  @Prop({}) titulo: string;

  imprimir() {}
}
</script>

<style scoped>
h2 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

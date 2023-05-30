<template>
  <v-container fluid grid-list-md>
    <iframe :src="urlDinamica" frameborder="0"></iframe>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class AppExterna extends Vue {
  @Prop({ default: 'Asociar' }) urlDinamica!: string;

  constructor() {
    super();
  }
}
</script>
<style scoped>
#app,
#app iframe {
  height: 100vh;
  width: 100vw;
  border: none;
  box-sizing: border-box;
}
body {
  margin: 0;
}
</style>

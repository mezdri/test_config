<template>
  <v-layout row wrap>
    <div align="left">
      <v-flex md12>
        <h2>
          <slot />
        </h2>
      </v-flex>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class StepTitle extends Vue {}
</script>
<style scoped>
h2 {
  font-weight: normal;
  margin: 0px 0px 0px;
}
</style>

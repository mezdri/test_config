<template>
  <v-stepper-items class="cardnew">
    <slot />
  </v-stepper-items>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class CrudStepperItems extends Vue {}
</script>

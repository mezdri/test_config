<template>
  <v-stepper-content v-show="paso.visible" :step="paso.step">
    <slot />
  </v-stepper-content>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { PasoCrud } from '@/reusable/Mantenedor/mantenedorUtils';

@Component({})
export default class CrudStepperItems extends Vue {
  @Prop({ required: true }) paso: PasoCrud;
}
</script>

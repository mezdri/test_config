<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <StepTitle v-if="title">{{ title }}</StepTitle>
            <slot />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';

@Component({ components: { StepTitle } })
export default class PasoAsociacion extends Vue {
  @Prop({}) title: string;
}
</script>

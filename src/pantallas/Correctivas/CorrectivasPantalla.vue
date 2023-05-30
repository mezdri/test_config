<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`" to="/preventivas">PREVENTIVAS</v-tab>
      <v-tab :href="`#tab-2`">CORRECTIVAS</v-tab>
    </v-tabs>
    <v-divider />
    <Correctivas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Correctivas from '@/pantallas/Correctivas/Correctivas.vue';

@Component({
  components: { Correctivas },
})
export default class CorrectivasPantalla extends Vue {
  tabModel: string = 'tab-2';
}
</script>

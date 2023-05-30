<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-1`">PREVENTIVAS</v-tab>
      <v-tab :href="`#tab-2`" to="/correctivas">CORRECTIVAS</v-tab>
    </v-tabs>
    <v-divider />
    <Preventivas />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Preventivas from '@/pantallas/Preventivas/Preventivas.vue';

@Component({
  components: { Preventivas },
})
export default class PreventivasPantalla extends Vue {
  tabModel: string = 'tab-1';
}
</script>

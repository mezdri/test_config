<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Talleres</v-tab>
    </v-tabs>
    <v-divider />
    <Talleres />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Talleres from '@/pantallas/Taller/Talleres.vue';

@Component({
  components: { Talleres },
})
export default class TalleresPantalla extends Vue {}
</script>

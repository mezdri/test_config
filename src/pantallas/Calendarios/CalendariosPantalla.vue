<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Calendarios</v-tab>
    </v-tabs>
    <v-divider />
    <Calendarios />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Calendarios from '@/pantallas/Calendarios/Calendarios.vue';

@Component({
  components: { Calendarios },
})
export default class CalendariosPantalla extends Vue {}
</script>

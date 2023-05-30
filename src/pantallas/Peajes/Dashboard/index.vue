<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Dashboard</v-tab>
    </v-tabs>
    <v-divider />
    <Dashboard />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Dashboard from '@/pantallas/Peajes/Dashboard/dashboard.vue';

@Component({
  components: { Dashboard },
})
export default class DashboardPantalla extends Vue {}
</script>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Configurar Base</v-tab>
    </v-tabs>
    <v-divider />
    <AlertasBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import AlertasBase from '@/pantallas/ConfigurarBase/AlertasBase.vue';

@Component({
  components: { AlertasBase },
})
export default class AlertaBasePantalla extends Vue {}
</script>

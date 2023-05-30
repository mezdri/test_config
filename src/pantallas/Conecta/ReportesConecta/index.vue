<template>
  <v-container fluid grid-list-md id="vContainerStyle">
    <v-tabs left color="transparent">
      <v-tab>Informes Generados Conecta</v-tab>
    </v-tabs>
    <v-divider />
    <InformesGeneradosConecta />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import InformesGeneradosConecta from '@/pantallas/Conecta/ReportesConecta/informesGeneradorConecta.vue';

@Component({
  components: { InformesGeneradosConecta },
})
export default class ReportesConecta extends Vue {}
</script>
<style scoped>
#vContainerStyle {
  height: 90vh;
  overflow: auto;
}
</style>

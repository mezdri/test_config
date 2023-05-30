<template>
  <v-container fluid grid-list-md id="vContainerStyle">
    <v-tabs left color="transparent">
      <v-tab>Informes Generados</v-tab>
    </v-tabs>
    <v-divider />
    <InformesGenerados />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import InformesGenerados from '@/pantallas/Informes/InformesGenerados/InformesGenerados.vue';

@Component({
  components: { InformesGenerados },
})
export default class InformesGeneradosPantalla extends Vue {}
</script>
<style scoped>
#vContainerStyle {
  height: 90vh;
  overflow: auto;
}
</style>

<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Tipo de Medida</v-tab>
    </v-tabs>
    <v-divider />
    <TipoMedida />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TipoMedida from '@/pantallas/TipoMedida/TipoMedida.vue';

@Component({
  components: { TipoMedida },
})
export default class TipoMedidaPantalla extends Vue {}
</script>

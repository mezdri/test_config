<template>
  <v-container fluid grid-list-md class="editarVehiculoConecta">
    <v-tabs left color="transparent">
      <v-tab>Editar Vehículos</v-tab>
    </v-tabs>
    <v-divider />
    <EditarVehiculosBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EditarVehiculosBase from './EditarVehiculosBase.vue';

@Component({
  components: { EditarVehiculosBase },
})
export default class EditarVehiculoPantalla extends Vue {}
</script>

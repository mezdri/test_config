<template>
  <v-container fluid grid-list-md class="editar-coordinadores-conecta">
    <v-tabs left color="transparent">
      <v-tab>Mantenedor de Coordinadores</v-tab>
    </v-tabs>
    <v-divider />
    <MantenedorCoordinadorBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MantenedorCoordinadorBase from '@/pantallas/Conecta/MantenedorCoordinador/MantenedorCoordinadorBase.vue';

@Component({
  components: { MantenedorCoordinadorBase },
})
export default class MantenedorCoordinadorPantalla extends Vue {}
</script>

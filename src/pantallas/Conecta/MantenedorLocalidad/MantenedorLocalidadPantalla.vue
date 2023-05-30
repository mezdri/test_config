<template>
  <v-container fluid grid-list-md class="configurar-localidad-conecta">
    <v-tabs left color="transparent">
      <v-tab>Mantenedor de Localidad</v-tab>
    </v-tabs>
    <v-divider />
    <MantenedorLocalidadBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MantenedorLocalidadBase from './MantenedorLocalidadBase.vue';

@Component({ components: { MantenedorLocalidadBase } })
export default class MantenedorLocalidadPantalla extends Vue {}
</script>

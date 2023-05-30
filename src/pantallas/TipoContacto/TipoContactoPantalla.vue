<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Tipo de Contacto</v-tab>
    </v-tabs>
    <v-divider />
    <TipoContacto />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TipoContacto from '@/pantallas/TipoContacto/TipoContacto.vue';

@Component({
  components: { TipoContacto },
})
export default class TipoContactoPantalla extends Vue {}
</script>

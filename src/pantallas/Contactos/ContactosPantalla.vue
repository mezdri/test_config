<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Contactos</v-tab>
    </v-tabs>
    <v-divider />
    <Contactos />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Contactos from '@/pantallas/Contactos/Contactos.vue';

@Component({
  components: { Contactos },
})
export default class ContactosPantalla extends Vue {}
</script>

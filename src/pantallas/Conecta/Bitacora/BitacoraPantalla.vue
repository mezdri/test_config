<template>
  <v-container fluid grid-list-md class="reportesSerieActiva">
    <v-tabs left color="transparent">
      <v-tab>Bitácora</v-tab>
    </v-tabs>
    <v-divider />
    <BitacoraBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BitacoraBase from './BitacoraBase.vue';

@Component({
  components: { BitacoraBase },
})
export default class BitacoraPantalla extends Vue {
  permiso: any = JSON.parse(localStorage.getItem('user')).permisosUsuario[0]
    .nombrePerfil;
}
</script>

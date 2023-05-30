<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Certificados de Emisión </v-tab>
    </v-tabs>
    <v-divider />
    <CertificadoEmisionNuevo :mostrarModalPantalla="mostarEmisionModal" />
    <v-form class="col-md-12">
      <v-btn depressed color="primary" elevation="2" @click="handleCrearClick">
        Emitir
      </v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CertificadoEmisionNuevo from '@/pantallas/CertificadosEmision/CertificadoEmisionNuevo.vue';

@Component({
  components: { CertificadoEmisionNuevo },
})
export default class CertificadoEmisionPantalla extends Vue {
  mostarEmisionModal: boolean = false;

  handleCrearClick() {
    this.mostarEmisionModal = !this.mostarEmisionModal;
  }
}
</script>

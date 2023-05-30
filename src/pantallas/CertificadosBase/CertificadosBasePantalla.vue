<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Certificados Base</v-tab>
    </v-tabs>
    <v-divider />
    <CertificadosBase />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CertificadosBase from '@/pantallas/CertificadosBase/CertificadosBase.vue';

@Component({
  components: { CertificadosBase },
})
export default class CertificadosBasePantalla extends Vue {}
</script>

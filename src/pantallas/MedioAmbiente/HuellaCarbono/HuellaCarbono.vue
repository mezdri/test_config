<template>
  <v-container fluid grid-list-md class="editarVehiculoConecta">
    <v-tabs left color="transparent">
      <v-tab @click="selectTab('general')" v-if="rolUser.length > 0"
        >Huella de Carbono General</v-tab
      >
      <v-tab @click="selectTab('individual')"
        >Huella de Carbono Individual</v-tab
      >
    </v-tabs>
    <v-divider />
    <EditarVehiculosBase v-if="indivitual" />
    <HuellaCarbonoGeneral v-else-if="general" />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EditarVehiculosBase from '@/pantallas/Conecta/EditarVehiculos/EditarVehiculosBase.vue';
import HuellaCarbonoGeneral from '@/pantallas/MedioAmbiente/HuellaCarbono/HuellaCarbonoGeneral.vue';
import store from '@/store';

@Component({
  components: { EditarVehiculosBase, HuellaCarbonoGeneral },
})
export default class HuellaCarbono extends Vue {
  indivitual: boolean = false;
  general: boolean = true;

  rolUser: any = {};

  created() {
    const data = JSON.parse(localStorage.getItem('user')).permisosUsuario;
    this.rolUser = data.filter(
      (permiso: any) =>
        permiso.moduloId == 188 && permiso.nombrePerfil == 'Root'
    );
    if (this.rolUser.length == 0) {
      this.general = false;
      this.indivitual = true;
    }
  }

  selectTab(value: string) {
    if (value == 'general') {
      this.indivitual = false;
      this.general = true;
    } else {
      this.general = false;
      this.indivitual = true;
    }
  }
}
</script>

<style scoped></style>

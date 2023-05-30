<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" width="500" persistent>
      <template v-slot:activator="{ on }">
        <v-btn v-if="flota" color="primary" dark v-on="on" block
          >Asignar Flota
        </v-btn>
        <v-btn v-if="vehiculo" v-on="on" flat icon color="primary">
          <v-icon>local_shipping</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="headline"
          >Asignar {{ flota ? flota.nombre : vehiculo.patente_vehiculo }} a un
          cliente
        </v-card-title>
        <v-card-text>
          <ClientFilter v-model="client" />
        </v-card-text>
        <v-card-text style="color: red"
          >Si usted asigna una flota completa al cliente, se le asignarán todos
          los vehículos de la flota al cliente (No aplica para Transportistas
          que no tienen su propia flota)
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="asignar">Asigrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import { ClientFilterI, FlotaFilterI } from '@/interfaces/Filters';
import { Vue, Component, Prop } from 'vue-property-decorator';
import ClientFilter from '@/components/Filters/ClientFilter.vue';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { FlotaVehiculoService } from './flotaVehiculoService';
import { FlotaVehiculoInterface } from './FlotaVehiculoInterface';

@Component({
  components: {
    ClientFilter,
  },
})
export default class AsignacionDialog extends Vue {
  @Prop() readonly flota: FlotaFilterI;
  @Prop() readonly vehiculo: FlotaVehiculoInterface;
  dialog: boolean = false;
  client: ClientFilterI = { id: '', nombre: '', rut: '' };
  $snotify: any; //TODO: Esto deberia ser una variable global para toda la aplicacion usando Vue.prototype
  flotaVehiculoService = new FlotaVehiculoService();

  async asignar() {
    let axiosResponse: AxiosResponse<MSResponse<any>>;
    if (this.flota) {
      axiosResponse = await this.flotaVehiculoService.assignFlota({
        client: this.client,
        flota: this.flota,
      });
    } else {
      axiosResponse = await this.flotaVehiculoService.assignVehicle(
        this.client.rut,
        this.vehiculo
      );
    }
    const msResponse: MSResponse<any> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.$snotify.success(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
    this.client = { id: '', nombre: '', rut: '' };
    this.dialog = false;
  }
}
</script>

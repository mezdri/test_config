<template>
  <v-layout row wrap align-center>
    <!--    <v-flex xs12 md6 lg2>
      <v-autocomplete
        v-model="flota"
        :items="allFlota"
        @change="watchFlota"
        label="Flota"
        item-text="nombre"
        item-value="id"
      />
    </v-flex>-->
    <v-flex xs12 md6 lg2>
      <v-autocomplete
        v-model="codVehiculoSelected"
        :items="itemsCodVehiculo"
        label="Patente"
        item-text="patente_vehiculo"
        item-value="id"
        return-object
      />
    </v-flex>
    <v-flex xs12 md6 lg2>
      <v-btn @click="onChangeFilter"> <v-icon>search</v-icon>Buscar </v-btn>
      <v-btn @click="clearFilters"> <v-icon>clear</v-icon>Limpiar </v-btn>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { ControlVehiculoInfo } from '@/pantallas/TorreControl/ControlDispositivos/controlDispositivosInterface';
import { LoadingService } from '@/services/loadingService';
import { DispositivosService } from '@/pantallas/TorreControl/ControlDispositivos/dispositivosService';
import {
  CamaraRelacionadaI,
  Flotas,
} from '@/pantallas/Conecta/ClasificacionPatentes/ClasificacionPatentesInterfaces';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';
import { ClasificacionPatentes } from '@/pantallas/Conecta/ClasificacionPatentes/ClasificacionPatentesService';
import { FlotaService } from '@/pantallas/TorreControl/ControlFlotas/flotaService';
import { VehiculoFilterI } from '@/interfaces/Filters';

@Component({
  name: 'searchPatente',
  components: {},
})
export default class searchPatente extends Vue {
  @Prop({ default: '' }) clientId!: string;
  loadingService = new LoadingService();
  vehiculosService = new DispositivosService();
  clasificacionPatentes = new ClasificacionPatentes();
  flotaService = new FlotaService();
  $snotify: any;
  isLoading: boolean = false;
  userId: number = 0;
  patente: string = '';
  response: any;
  flota: string = '';
  allFlota: any[] = [{ id: '', nombre: '' }];
  cods_flota: any[] = [];
  nombreFlotaSeleccionada: string = '';
  itemsCodVehiculo: VehiculoFilterI[] = [];
  codVehiculoSelected: VehiculoFilterI = {
    id: '',
    cod_vehiculo: '',
    cod_flota: '',
    patente_vehiculo: '',
  };

  constructor() {
    super();
  }

  mounted() {
    let self = this;
    if (!this.$route.params.patente) {
      this.getAllFlotas().finally(() => {
        this.getVehicles();
      });
    }
    TorreControlInstance.$off('reloadSelect');
    TorreControlInstance.$on('reloadSelect', () => {
      self.getAllFlotas().finally(() => {
        self.getVehicles();
      });
    });
    this.userId = JSON.parse(localStorage.getItem('user')).id;
  }

  clearFilters() {
    this.patente = '';
    this.codVehiculoSelected = {
      id: '',
      cod_vehiculo: '',
      cod_flota: '',
      patente_vehiculo: '',
    };
    TorreControlInstance.$emit('searchPatenteD', {
      patente: '',
      avl: '',
    });
  }

  async onChangeFilter() {
    this.isLoading = true;
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<ControlVehiculoInfo>
    > = await this.vehiculosService.getVehiculoId(
      this.clientId,
      this.codVehiculoSelected.patente_vehiculo
    );
    this.isLoading = false;
    const msResponse: MSResponse<any> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.response = msResponse.data;
      if (this.response.cod_vehiculo) {
        TorreControlInstance.$emit('searchPatenteD', {
          patente: this.codVehiculoSelected.patente_vehiculo,
          avl: this.response.avl,
        });
      }
    } else {
      this.response = [];
    }
    this.loadingService.hideLoading();
    this.isLoading = false;
  }

  async getAllFlotas() {
    this.loadingService.showLoading();
    let clientId = localStorage.getItem('clienteDefecto');
    const axiosResponse: AxiosResponse<
      MSResponse<Flotas>
    > = await this.flotaService.getFlotas(clientId, false);
    const msResponse: MSResponse<Flotas> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.allFlota = msResponse.data;
      this.allFlota.forEach(value => {
        this.cods_flota.push(value.cod_flota);
      });
      this.loadingService.hideLoading();
    } else {
      this.allFlota = [];
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
    }
  }
  async getVehicles() {
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<VehiculoFilterI>
    > = await this.vehiculosService.getVehiculos(
      this.cods_flota,
      '',
      this.userId,
      this.clientId
    );
    const msResponse: MSResponse<VehiculoFilterI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA == '1') {
      this.itemsCodVehiculo = msResponse.data;
      this.loadingService.hideLoading();
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      //TODO agregar notificacion notify
      this.itemsCodVehiculo = [];
      this.loadingService.hideLoading();
    }
  }
}
</script>

<style scoped></style>

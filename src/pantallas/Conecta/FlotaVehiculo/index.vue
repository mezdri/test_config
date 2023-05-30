<template>
  <ContainerPage title="Flota Vehiculo">
    <v-card flat color="transparent">
      <v-card-text>
        <FilterFlotaVehiculo v-model="filter" />
        <v-flex xs12 sm5 md3 offset-xs0 offset-lg10>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </v-flex>
        <FlotaVehiculoTable
          :config="configTable"
          :dataTable="dataTable"
          :search="search"
        />
      </v-card-text>
    </v-card>
  </ContainerPage>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import ContainerPage from '@/components/ContainerPage.vue';
import { FlotaVehiculoService } from './flotaVehiculoService';
import { MSResponse } from '@/interfaces/MS';
import { FlotaVehiculoInterface } from './FlotaVehiculoInterface';
import { AxiosResponse } from 'axios';
import { headers, configTable } from './flotaVehiculosHeaders';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import FilterFlotaVehiculo from './Filter.vue';
import { FilterI } from '@/interfaces/Filters';
import { LoadingService } from '@/services/loadingService';
import FlotaVehiculoTable from './FlotaVehiculoTable.vue';

@Component({
  components: {
    ContainerPage,
    FilterFlotaVehiculo,
    FlotaVehiculoTable,
  },
})
export default class FlotaVehiculo extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();
  flotaVehiculoService = new FlotaVehiculoService();
  clientId: string;
  isLoading: boolean = false;
  dataTable: FlotaVehiculoInterface[] = [];
  configTable = { ...configTable };

  readonly funcionalidad: Funcionalidades = Funcionalidades.FlotaVehiculo;

  detalleSeleccionado: any = null;
  filter: FilterI = {};
  // headers = headers;
  search = '';

  constructor() {
    super();
    this.getClientId();
  }

  async getFlotaVehiculo() {
    this.isLoading = true;
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<FlotaVehiculoInterface>
    > = await this.flotaVehiculoService.getFlotaVehiculos(this.filter);
    this.isLoading = false;
    const msResponse: MSResponse<FlotaVehiculoInterface> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.dataTable = msResponse.data;
    } else {
      //TODO agregar notificacion notify
      this.dataTable = [];
    }
    this.loadingService.hideLoading();
  }

  getClientId() {
    this.clientId = localStorage.getItem('clienteDefecto');
  }

  @Watch('filter')
  searchWatcher(value: string) {
    this.getFlotaVehiculo();
  }
}
</script>

<style>
#gridFlotaVehiculo {
  height: auto !important;
  margin-bottom: 50px;
}
</style>

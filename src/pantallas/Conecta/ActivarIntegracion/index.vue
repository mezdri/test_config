<template>
  <ContainerPage title="Activar Integraciones">
    <v-card flat color="transparent">
      <FilterActivarIntegracion
        @filter="filtrado($event)"
        @clear="isFiltred = false"
      ></FilterActivarIntegracion>
      <v-card-text>
        <!-- <MantenedorGridSinCodigo
          class="selectable"
          :grid-options="gridOptions"
          :funcionalidad-id="funcionalidad"
        /> -->
        <integration-table
          :headers="selectedHeaders"
          :dataTable="dataTable"
          :totalItems="totalRegistros"
          :noDataMessage="noDataMessage"
          @change="onItemChange($event)"
          @changeFlota="onFlotaChange($event)"
          @showAll="showAll($event)"
        />
      </v-card-text>
    </v-card>
  </ContainerPage>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  PaginationProxy,
} from 'ag-grid-community';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import ContainerPage from '@/components/ContainerPage.vue';
import { ActivarIntegracionService } from './activarIntegracionService';
import { MSResponse } from '@/interfaces/MS';
import { ActivarIntegracionInterface } from './activarIntegracionInterface';
import { AxiosResponse } from 'axios';
import { headersAll, headersShort } from './activarIntegracionHeaders';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import FilterActivarIntegracion from './Filter.vue';
import { LoadingService } from '@/services/loadingService';
import { ClientFilterI, FlotaFilterI } from '@/interfaces/Filters';
import IntegrationTable from './Table.vue';

@Component({
  components: {
    ContainerPage,
    MantenedorGridSinCodigo,
    FilterActivarIntegracion,
    IntegrationTable,
  },
})
export default class ClientesConecta extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();

  activarIntegracionService = new ActivarIntegracionService();
  client: ClientFilterI = { id: '', rut: '', nombre: '' };
  flota: FlotaFilterI = { id: '', nombre: '' };

  totalRegistros: number = 0;
  rowSelected: any[] = [];
  selectedHeaders: any[] = headersShort;
  headersAll = headersAll;
  headersShort = headersShort;
  dataTable: any[] = [];
  noDataMessage: string = 'Por favor seleccione un filtro para buscar.';

  isFiltred: boolean = false;

  $snotify: any;

  readonly funcionalidad: Funcionalidades = Funcionalidades.IntegracionVehiculo;

  detalleSeleccionado: any = null;

  constructor() {
    super();
  }

  async getRelacionVehiculo() {
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<ActivarIntegracionInterface>
    > = await this.activarIntegracionService.getRelacionVehiculo(
      this.client.rut,
      this.flota.id
    );
    const msResponse: MSResponse<ActivarIntegracionInterface> =
      axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      // this.gridApi.setRowData(msResponse.data);
      this.dataTable = msResponse.data;
      // this.gridApi.paginationSetPageSize(10);
      this.loadingService.hideLoading();
    } else {
      // this.gridApi.setRowData(msResponse.data);
      this.dataTable = msResponse.data;
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
    }
  }

  filtrado(e: any) {
    console.log(e);
    if (e.client.id !== '' || e.flota.id !== '') {
      this.client = e.client;
      this.client.rut = this.client.rut.slice(0, -2);
      this.flota = e.flota;
      this.isFiltred = true;
      this.getRelacionVehiculo();
    } else {
      this.$snotify.info('Por favor seleccione un filtro para buscar.');
    }
  }

  async onChange(e: any) {
    const integracion = e.column.colId;
    const value = e.value;
    const cod_vehiculo = e.node.data.cod_vehiculo;
    let params: any = {
      cod_vehiculo: cod_vehiculo,
    };
    params[integracion] = value;
    const axiosResponse: AxiosResponse<
      MSResponse<ActivarIntegracionInterface>
    > = await this.activarIntegracionService.updateRelacion(params);
    const msResponse: MSResponse<ActivarIntegracionInterface> =
      axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.$snotify.success(msResponse.data, {
        timeout: 3000,
      });
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
  }

  onSelect(e: any) {
    //console.log(e)
    this.rowSelected.includes(e.data)
      ? this.rowSelected.splice(e.data)
      : this.rowSelected.push(e.data);
    //console.log(this.rowSelected)
  }

  onSelectionChanged(e: any) {
    console.log(e);
  }

  async onItemChange(e: any) {
    let params: any = e;
    delete params.rownum;
    delete params.cod_flota;
    const axiosResponse: AxiosResponse<
      MSResponse<ActivarIntegracionInterface>
    > = await this.activarIntegracionService.updateRelacion(params);
    const msResponse: MSResponse<ActivarIntegracionInterface> =
      axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.$snotify.success(msResponse.data, {
        timeout: 3000,
      });
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
  }

  async onFlotaChange(e: any) {
    let params: any = e;
    delete params.rownum;
    delete params.cod_vehiculo;
    console.log(params);
    const axiosResponse: AxiosResponse<
      MSResponse<ActivarIntegracionInterface>
    > = await this.activarIntegracionService.updateRelacion(params);
    const msResponse: MSResponse<ActivarIntegracionInterface> =
      axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.$snotify.success(msResponse.data, {
        timeout: 3000,
      });
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
    this.getRelacionVehiculo();
  }

  showAll(e: any) {
    e === true
      ? (this.selectedHeaders = this.headersAll)
      : (this.selectedHeaders = this.headersShort);
  }

  @Watch('isFiltred')
  watchIsFiltred(value: boolean) {
    this.noDataMessage = value
      ? 'No se han encontrado resultados para la búsqueda.'
      : 'Por favor seleccione un filtro para buscar.';
  }
}
</script>

<style scoped>
.ag-cell.ag-cell-not-inline-editing.ag-cell-with-height.ag-cell-last-left-pinned {
  pointer-events: auto !important;
  display: none;
}
</style>

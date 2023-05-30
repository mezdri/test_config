<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <StepTitle>Asociar Cliente Proveedor de GPS</StepTitle>
            <v-divider></v-divider>
            <CabeceraTabla>
              <template v-slot:izquierda>
                <BuscadorOperacionCrud
                  :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
                />
              </template>
            </CabeceraTabla>
            <div align="left">
              <MantenedorGridVerDetalle
                v-if="modoVer"
                :grid-options="computedGridOptions"
              />
              <AsociacionGrid
                v-else
                :grid-options="computedGridOptions"
                :esEditar="esEditar"
              />
            </div>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import Buscador from '@/reusable/Grid/Buscador.vue';
import config from '@/config/index';
import store from '@/store';

import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';

import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';
import { Proveedor } from './Proveedor';

import { ProveedorGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { ClienteProveedorGps } from '../../reusable/proveedorGps/fetchClientesProveedorGps';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

import { fetch as fetchClientesProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';

@Component({
  components: {
    StepTitle,
    Buscador,
    AsociacionGrid,
    MantenedorGridVerDetalle,
    BuscadorOperacionCrud,
    CabeceraTabla,
    MensajeValidacion,
  },
})
export default class ClienteProveedorGrid extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop() proveedorSeleccionado: ProveedorGps;
  @Prop({ default: false }) show: boolean;
  @Prop({ default: 0 }) idProveedor: number;

  contexto: AxiosVue = new AxiosVue(ServicioProxy.Integracion);

  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  /* aggrid */
  gridApi: GridApi = null;

  /* template */
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        minWidth: 80,
      },
      {
        headerName: 'Nombre o Razón Social',
        field: 'nombre',
        lockVisible: true,
        lockPinned: true,
        width: 250,
        minWidth: 180,
      },
      {
        headerName: 'Rut',
        field: 'rut',
        width: 230,
        minWidth: 180,
      },
    ].map(x => ({
      width: 200,
      cellStyle: { textAlign: 'left' },
      hide: false,
      ...x,
    })),
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSeleccion,
    onRowSelected: this.onRowSelected,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  @Watch('proveedorSeleccionado', { deep: true })
  async handleProveedoresSeleccionadosChange(seleccionados: any) {
    if (!this.gridApi || this.modoVer) {
      if (this.modoVer && this.proveedorSeleccionado) {
        //Carga la grilla con solo los seleccionados - Ver Detalle
        this.gridApi.setRowData(this.proveedorSeleccionado.clienteProveedorVm);
      }
      return;
    }

    //Carga la grilla Crear - Editar
    let clientesActivos: ClienteProveedor[] = [];
    let lstClientesProveedores: ClienteProveedor[] = [];
    lstClientesProveedores = (await this.fetchClientes()) || [];
    lstClientesProveedores.map((x: ClienteProveedor) => {
      if (x.estado === 1) {
        clientesActivos.push(x);
      }
    });
    this.gridApi.setRowData(clientesActivos);

    //Marca los seleccionados Editar
    if (this.esEditar) {
      this.gridApi.forEachNode(function(node: any) {
        var index = seleccionados.clienteProveedorVm.findIndex(
          (x: any) => x.id == node.data.id
        );
        if (index !== -1) {
          node.setSelected(true);
        }
      });
    }
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    if (!this.esEditar || this.modoVer) {
      this.handleProveedoresSeleccionadosChange(this.proveedorSeleccionado);
    }
  }

  handleSeleccion(event: SelectionChangedEvent) {
    this.$emit('change', event.api.getSelectedRows());
    this.gridApi.redrawRows();
  }

  async onRowSelected(e: any) {
    if (e.node.selected === false && this.esEditar === true) {
      const axios = new AxiosVue(ServicioProxy.Integracion);
      const idClienteProveedor = e.data.id;
      const res = await axios.http.get(
        `ClienteProveedor/Asociados/${idClienteProveedor}/${this.idProveedor}`
      );
      if (res.data != null && res.data.length > 0) {
        this.gridApi.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Cliente Proveedor de GPS';
        this.mensajeValidacion =
          'No se puede desasociar este Cliente Proveedor de GPS debido a que se encuentra registrado en: ' +
          res.data +
          '.';
        this.showValidacion = true;
      }
    }
  }

  fetchClientes() {
    this.loadingService.showLoading();
    return fetchClientesProveedorGps()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Clientes Proveedores de GPS',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  get computedGridOptions() {
    const {
      gridOptions: { columnDefs },
    } = this;

    return this.gridOptions;
  }
}
</script>

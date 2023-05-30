<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <StepTitle>Asociar Proveedor de GPS</StepTitle>
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
                :grid-options="gridOptions"
                :row-data="clienteProveedorSeleccionado.proveedorVm"
              />
              <AsociacionGrid
                v-else
                :grid-options="gridOptions"
                :row-data="proveedoresActivos"
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

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import Buscador from '@/reusable/Grid/Buscador.vue';

import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';

import config from '@/config/index';
import store from '@/store';

import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';

import { Proveedor } from '@/pantallas/Proveedor/Proveedor';
import { ProveedorGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { ClienteProveedorGps } from '../../reusable/proveedorGps/fetchClientesProveedorGps';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

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
export default class ProveedorGrid extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: [] }) clienteProveedorSeleccionado: ClienteProveedorGps;
  @Prop({ required: true }) proveedores: ProveedorGps[];
  @Prop({ default: false }) show: boolean;
  @Prop({ default: 0 }) idCliente: number;

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
    ],
    onGridReady: this.handleGridReady,
    onSelectionChanged: this.handleSeleccion,
    onRowSelected: this.onRowSelected,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  proveedoresActivos: Proveedor[] = [];
  cont: number = 0;

  mounted() {
    this.soloActivos();
  }

  @Watch('proveedores')
  soloActivos() {
    this.proveedoresActivos = [];
    this.proveedores.map((x: Proveedor) => {
      if (x.estado === 1) {
        this.proveedoresActivos.push(x);
      }
    });
  }

  @Watch('clienteProveedorSeleccionado')
  handleProveedoresSeleccionadosChange(seleccionados: any) {
    if (!this.gridApi || this.modoVer) {
      return;
    }
    setTimeout(() => {
      this.gridApi.forEachNode(row => {
        if (this.cont === 0) {
          row.setSelected(
            seleccionados.proveedorVm.some((x: any) => x.id === row.data.id)
          );
          if (
            seleccionados.proveedorVm.some((x: any) => x.id === row.data.id)
          ) {
            this.cont++;
          }
        } else {
          row.setSelected(
            !!seleccionados.proveedorVm.find(
              (x: ProveedorGps) => x.id === row.data.id
            ),
            undefined,
            /* Evitar gatillado de evento `SelectionChangedEvent` de ag-grid, que
          desencadenaría en emisión de evento `selectionChange` al consumidor de
          este componente y posible posterior ciclo infinito de consumidor
          enviando nuevos vehiculos seleccionados.
          De esta manera emitimos el evento `SelectionChangedEvent`
          exclusivamente cuando el usuario interactúa con la tabla. */
            true
          );
        }
      });
    });
    this.cont = 0;
  }

  @Watch('show')
  handleShowChange() {
    if (!this.gridApi) {
      return;
    }

    this.gridApi.refreshHeader();
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.soloActivos();
    this.handleProveedoresSeleccionadosChange(
      this.clienteProveedorSeleccionado
    );
  }

  handleSeleccion(event: SelectionChangedEvent) {
    this.$emit('change', event.api.getSelectedRows());
    this.gridApi.redrawRows();
  }

  async onRowSelected(e: any) {
    if (e.node.selected === false && this.esEditar === true) {
      const axios = new AxiosVue(ServicioProxy.Integracion);
      const idProveedor = e.data.id;
      const res = await axios.http.get(
        `ClienteProveedor/Asociados/${this.idCliente}/${idProveedor}`
      );
      if (res.data != null && res.data.length > 0) {
        this.gridApi.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Proveedor de GPS';
        this.mensajeValidacion = 'No se puede desasociar este Proveedor de GPS debido a que se encuentra registrado en: ' + res.data + '.';
        this.showValidacion = true;
      }
    }
  }
}
</script>

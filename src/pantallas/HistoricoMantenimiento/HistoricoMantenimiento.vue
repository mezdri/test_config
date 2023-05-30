<template>
  <div>
    <CabeceraTabla>
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="funcionFiltrar" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="VehiculoHistorico"
      style="padding-top: 7px"
    />

    <!-- Modal -->
    <VerDetalleHistoricoManteniminetoModal
      v-if="isModalVerDetalleActivo"
      @cerrar="cerrarModalCrud"
      :vehiculoSeleccionado="vehiculoSeleccionado"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  RowNode,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import VerDetalleHistoricoManteniminetoModal from '@/pantallas/HistoricoMantenimiento/VerDetalleHistoricoMantenimientoModal.vue';
import {
  fetchVehiculosHistorico,
  Vehiculo as VehiculoType,
} from '@/pantallas/HistoricoMantenimiento/fetchVehiculosHistorico';

@Component({
  components: {
    BuscadorMantenedor,
    CabeceraTabla,
    MantenedorGridTodos,
    VerDetalleHistoricoManteniminetoModal,
  },
})
export default class HistoricoMantenimiento extends ComponenteBase {
  /* ComponenteBase */
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEliminar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.HistoricoMantenimiento;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Unidad',
        field: 'unidad',
      },
      {
        headerName: 'Flota',
        field: 'flota',
      },
      {
        headerName: 'Etiquetas',
        field: 'etiqueta',
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    if (this.vehiculos.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.flota.toLowerCase().includes(busqueda) ||
        node.data.etiqueta
          .toString()
          .toLowerCase()
          .includes(busqueda)
      );
    }
    return true;
  }

  /* state */

  vehiculos: VehiculoType[] = [];
  vehiculoSeleccionado: VehiculoType = null;
  mostrarConfirmacionEliminar: boolean = false;
  modalCrudActivo: OperacionesCrud = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarVehiculos();
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.vehiculoSeleccionado = params.data;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  /* tabla */
  async cargarVehiculos() {
    this.vehiculos = (await this.fetchVehiculos()) || [];
    this.gridApi.setRowData(this.vehiculos || []);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  /* util */

  fetchVehiculos() {
    this.loadingService.showLoading();
    return fetchVehiculosHistorico()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el histórico del vehículos. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  get isModalVerDetalleActivo() {
    return this.modalCrudActivo === OperacionesCrud.consultar;
  }
}
</script>

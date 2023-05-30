<template>
  <div>
    <CabeceraTabla :permisoAccion="accionRegistrar">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="funcionFiltrar" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="correctivas"
          exported-file-name="Correctivas"
        />
      </template>
      <template v-slot:derecha>
        <RegistrarButton
          :permisoAccion="accionRegistrar"
          @click="handleCrearClick()"
        />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearCorrectivasModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />

    <EditarCorrectivaModal
      v-if="isModalEditarActivo"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
      :correctivoSeleccionado="correctivoSeleccionado"
    />

    <VerDetalleCorrectivasModal
      v-if="isModalVerDetalleActivo"
      @cerrar="handleCierreModalVerDetalle"
      :correctivoSeleccionado="correctivoSeleccionado"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import RegistrarButton from '@/reusable/Grid/RegistrarButton.vue';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
  makeAccionesModal,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import {
  CorrectivaGrid,
  Correctiva,
} from '@/pantallas/Correctivas/Data/Correctiva';
import { eliminarTipoMedida } from '@/pantallas/TipoMedida/eliminarTipoMedida';
import CrearCorrectivasModal from '@/pantallas/Correctivas/CrearCorrectivasModal.vue';
import VerDetalleTipoMedidaModal from '@/pantallas/TipoMedida/VerDetalleTipoMedidaModal.vue';
import { fetchCorrectivasGrid } from '@/pantallas/Correctivas/Data/fetchCorrectivasGrid';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { OperacionesCrud } from '../../reusable/Mantenedor/mantenedorUtils';
import EditarCorrectivaModal from './EditarCorrectivaModal.vue';
import { fetchMantenimientoCorrectivoDetalle } from './Data/fetchMantenimientoCorrectivoDetalle';
import VerDetalleCorrectivasModal from './VerDetalleCorrectivasModal.vue';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    RegistrarButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearCorrectivasModal,
    VerDetalleTipoMedidaModal,
    EditarCorrectivaModal,
    VerDetalleCorrectivasModal,
  },
})
export default class Correctivas extends ComponenteBase {
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionRegistrar: PermisoAccion = {
    accionCodigo: 87,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionRegistrar,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Correctivas;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Unidad',
        field: 'unidad',
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Costos Insumos',
        field: 'costoInsum',
      },
      {
        headerName: 'Costos H/H',
        field: 'costoHH',
      },
      {
        headerName: 'Flota',
        field: 'flota',
      },
      creadoPorColumnDefs('usuarioCreacion'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModificacion'),
      {
        ...fechaModificacionColumnDefs('fechaModificacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassCorrectivas,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  isExternalFilterPresent(): boolean {
    return true;
  }

  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  doesExternalFilterPassCorrectivas(node: RowNode): boolean {
    if (this.correctivas.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.nombre.toLowerCase().includes(busqueda) ||
        String(node.data.costoHH)
          .toLowerCase()
          .includes(busqueda) ||
        String(node.data.costoInsum)
          .toLowerCase()
          .includes(busqueda) ||
        node.data.flota.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaCreacion)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaModificacion)
          .format('DD/MM/YYYY')
          .includes(busqueda)
      );
    }
    return true;
  }

  /* state */

  correctivas: CorrectivaGrid[] = [];
  correctivoSeleccionado: Correctiva = null;
  modalCrudActivo: OperacionesCrud = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarCorrectivas();
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.cargarCorrectivas();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.correctivoSeleccionado =
      (await this.fetchCorrectivaDetalle(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  async handleEditarClick(params: ICellRendererParams) {
    this.correctivoSeleccionado =
      (await this.fetchCorrectivaDetalle(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  handleCierreModalVerDetalle() {
    this.cerrarModalCrud();
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  /* tabla */
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }

  get isModalCrearActivo() {
    return this.modalCrudActivo === OperacionesCrud.crear;
  }

  get isModalEditarActivo() {
    return this.modalCrudActivo === OperacionesCrud.editar;
  }

  get isModalVerDetalleActivo() {
    return this.modalCrudActivo === OperacionesCrud.consultar;
  }

  async cargarCorrectivas() {
    this.correctivas = (await this.fetchCorrectivasGrid()) || [];
    this.gridApi.setRowData(this.correctivas);
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

  fetchCorrectivaDetalle(idCorrectiva: number) {
    this.loadingService.showLoading();
    return fetchMantenimientoCorrectivoDetalle(idCorrectiva)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los manteniminentos correctivos. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchCorrectivasGrid() {
    this.loadingService.showLoading();
    return fetchCorrectivasGrid()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los manteniminentos correctivos. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

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
          :row-data="preventivas"
          exported-file-name="Preventivas"
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
      test-id="Preventiva"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearPreventivaModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />

    <EditarPreventivaModal
      v-if="isModalEditarActivo"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
      :preventivaSeleccionada="preventivaSeleccionada"
    />

    <VerDetallePreventivaModal
      v-if="isModalVerDetalleActivo"
      @cerrar="cerrarModalCrud"
      :preventivaSeleccionada="preventivaSeleccionada"
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
import moment from 'moment';
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
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import { Preventiva as PreventivaType } from '@/pantallas/Preventivas/Preventiva';
import { fetchPreventivas } from '@/pantallas/Preventivas/fetchPreventivas';
import CrearPreventivaModal from '@/pantallas/Preventivas/CrearPreventivaModal.vue';
import EditarPreventivaModal from '@/pantallas/Preventivas/EditarPreventivaModal.vue';
import VerDetallePreventivaModal from '@/pantallas/Preventivas/VerDetallePreventivaModal.vue';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    RegistrarButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearPreventivaModal,
    EditarPreventivaModal,
    VerDetallePreventivaModal,
  },
})
export default class Preventivas extends ComponenteBase {
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionRegistrar: PermisoAccion = {
    accionCodigo: 87,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionRegistrar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Preventivas;

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
        headerName: 'Nombre del Plan',
        field: 'nombrePlanMantenimiento',
      },
      {
        headerName: 'Nombre de la Pauta',
        field: 'nombrePautaActividad',
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
        headerName: 'Estado',
        field: 'estadoPlanMantenimientoText',
      },
      {
        headerName: 'Flota',
        field: 'nombreFlota',
      },
      creadoPorColumnDefs('usuarioCreador'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModifica'),
      {
        ...fechaModificacionColumnDefs('fechaModificacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
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
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    if (this.preventivas.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.nombrePlanMantenimiento.toLowerCase().includes(busqueda) ||
        node.data.nombrePautaActividad.toLowerCase().includes(busqueda) ||
        node.data.costoInsum.toString().includes(busqueda) ||
        node.data.costoHH.toString().includes(busqueda) ||
        node.data.estadoPlanMantenimientoText
          .toLowerCase()
          .includes(busqueda) ||
        node.data.nombreFlota.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreador.toLowerCase().includes(busqueda) ||
        node.data.usuarioModifica.toLowerCase().includes(busqueda) ||
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

  preventivas: PreventivaType[] = [];
  preventivaSeleccionada: PreventivaType = null;
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

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarPreventivas();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.preventivaSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.preventivaSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.cargarPreventivas();
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

  async cargarPreventivas() {
    this.preventivas = (await this.fetchPreventivas()) || [];
    this.gridApi.setRowData(this.preventivas || []);
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

  fetchPreventivas() {
    this.loadingService.showLoading();
    return fetchPreventivas()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las mantenciones preventivas. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  /* template */

  get isModalCrearActivo() {
    return this.modalCrudActivo === OperacionesCrud.crear;
  }

  get isModalEditarActivo() {
    return this.modalCrudActivo === OperacionesCrud.editar;
  }

  get isModalVerDetalleActivo() {
    return this.modalCrudActivo === OperacionesCrud.consultar;
  }
}
</script>

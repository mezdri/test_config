<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
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
          :row-data="pautas"
          exported-file-name="PautasDeActividades"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      :row-data="pautas"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="{
        entidad: 'Pauta de Actividades',
        nombreEntidad: pautaSeleccionada ? pautaSeleccionada.nombrePauta : '',
      }"
      :mensaje="{ entidad: 'la Pauta de Actividades' }"
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />

    <EditarPautaActividadModal
      v-if="isModalEditarActivo"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
      :pautaSeleccionada="pautaSeleccionada"
    />

    <CrearPautaActividadModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />

    <VerDetallePautaActividadModal
      v-if="isModalVerDetalleActivo"
      @cerrar="handleCierreModalVerDetalle"
      :pautaSeleccionada="pautaSeleccionada"
    />

    <div class="text-xs-center">
      <v-dialog v-model="showEliminarPautaMsj" persistent max-width="480">
        <EliminarPautaModal
          @aceptar="handleCloseEliminarMsj"
          :nombrePauta="pautaSeleccionada ? pautaSeleccionada.nombrePauta : ''"
          :cantidadActividades="
            pautaSeleccionada ? pautaSeleccionada.actividades.length : 0
          "
          :cantidadPlanes="
            pautaSeleccionada ? pautaSeleccionada.planesMantenimiento.length : 0
          "
        />
      </v-dialog>
    </div>
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
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { fetchPautasActividades } from '@/pantallas/PautasActividades/fetchPautasActividades';
import { fetchPautasActividadesDetalle } from '@/pantallas/PautasActividades/fetchPautasActividadesDetalle';
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
import {
  PautaActividad as PautaActividadType,
  PautaActividadDetalle,
} from '@/pantallas/PautasActividades/PautaActividad';
import { eliminarPautasActividades } from '@/pantallas/PautasActividades/eliminarPautasActividades';
import CrearPautaActividadModal from '@/pantallas/PautasActividades/CrearPautaActividadModal.vue';
import EditarPautaActividadModal from '@/pantallas/PautasActividades/EditarPautaActividadModal.vue';
import VerDetallePautaActividadModal from '@/pantallas/PautasActividades/VerDetallePautaActividadModal.vue';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { OperacionesCrud } from '../../reusable/Mantenedor/mantenedorUtils';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import EliminarPautaModal from '@/pantallas/PautasActividades/EliminarPautaModal.vue';

type PautaActividadesRowData = PautaActividadType & {
  checked?: boolean;
};

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearPautaActividadModal,
    EditarPautaActividadModal,
    VerDetallePautaActividadModal,
    ConfirmacionEliminar,
    EliminarPautaModal,
  },
})
export default class PautasActividades extends ComponenteBase {
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
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
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.PautasActividades;

  /* state */
  permisoAccion: PermisoAccion = null;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombrePauta',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
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
    if (this.pautas.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombrePauta.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacion.toLowerCase().includes(busqueda) ||
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

  pautas: PautaActividadType[] = [];
  pautaSeleccionada: PautaActividadDetalle = null;
  pautaSeleccionadaGrilla: PautaActividadType = null;
  modalCrudActivo: OperacionesCrud = null;
  showEliminarPautaMsj: boolean = false;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.pautas = (await this.fetchPautas()) || [];
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.pautaSeleccionada =
      (await this.fetchPautasDetalle(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  async handleEditarClick(params: ICellRendererParams) {
    this.pautaSeleccionada =
      (await this.fetchPautasDetalle(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  async handleEliminarClick(params: ICellRendererParams) {
    this.pautaSeleccionadaGrilla = params.data;
    this.pautaSeleccionada =
      (await this.fetchPautasDetalle(params.data.id)) || null;

    if (
      this.pautaSeleccionada.actividades.length > 0 ||
      this.pautaSeleccionada.planesMantenimiento.length > 0
    ) {
      this.showEliminarPautaMsj = true;
      return;
    }

    this.modalCrudActivo = OperacionesCrud.eliminar;
  }

  handleCloseEliminarMsj() {
    this.showEliminarPautaMsj = false;
  }

  handleConfirmacionEliminar() {
    this.eliminarPauta(this.pautaSeleccionadaGrilla).finally(
      this.recargarPautas
    );
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { pautaSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Pauta de Actividades',
    });
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

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.recargarPautas();
  }

  handleCierreModalVerDetalle() {
    this.cerrarModalCrud();
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
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

  async recargarPautas() {
    this.pautas = (await this.fetchPautas()) || [];
    this.gridApi.setRowData(this.pautas);
  }

  /* util */

  fetchPautasDetalle(idPauta: number) {
    this.loadingService.showLoading();
    return fetchPautasActividadesDetalle(idPauta)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las pautas de actividades. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchPautas() {
    this.loadingService.showLoading();
    return fetchPautasActividades()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las pautas de actividades. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarPauta(pauta: PautaActividadType) {
    this.loadingService.showLoading();
    return eliminarPautasActividades(pauta)
      .then(() =>
        this.$snotify.success(
          `La Pauta de Actividades ${pauta.nombrePauta} ha sido eliminada de forma exitosa`,
          { timeout: 3000 }
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar la pauta de actividad: ${pauta.nombrePauta}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.recargarPautas();
      });
  }
}
</script>

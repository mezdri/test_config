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
          :row-data="recepciones"
          exported-file-name="RecepcionDeInformacion"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="RecepcionesActividad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modals -->
    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="'Eliminar Recepción de Información'"
      :mensaje="{ entidad: 'la Recepción de Información' }"
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />
    <Confirmation
      :show="mostrarInactivoEliminar"
      :titulo="tituloInactivoEliminar"
      :mensaje="mensajeInactivoEliminar"
      v-on:modalConfirmationEmit="handleCierreEliminar"
      :mostrarBoton="false"
      :textoBtnSi="`Aceptar`"
    ></Confirmation>
    <CrearRecepcionActividadModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />
    <EditarRecepcionActividadModal
      v-if="isModalEditarActivo"
      :recepcionActividad="recepcionSeleccionada"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
    />
    <VerDetalleRecepcionActividadModal
      v-if="isModalVerDetalleActivo"
      :recepcion-actividad="recepcionSeleccionada"
      @cerrar="cerrarModalCrud"
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
import {
  estadoColumnDefs,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { fetchRecepcionesActividad } from '@/pantallas/Recepcion/fetchRecepcionesActividad';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import { RecepcionActividad } from '@/pantallas/Recepcion/RecepcionActividad';
import { eliminarRecepcionActividad } from '@/pantallas/Recepcion/eliminarRecepcionActividad';
import CrearRecepcionActividadModal from '@/pantallas/Recepcion/CrearRecepcionActividadModal.vue';
import EditarRecepcionActividadModal from '@/pantallas/Recepcion/EditarRecepcionActividadModal.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import VerDetalleRecepcionActividadModal from '@/pantallas/Recepcion/VerDetalleRecepcionActividadModal.vue';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import moment from 'moment';

@Component({
  components: {
    MantenedorGridTodos,
    ConfirmacionEliminar,
    VerDetalleRecepcionActividadModal,
    EditarRecepcionActividadModal,
    CrearRecepcionActividadModal,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
  },
})
export default class RecepcionActividades extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.RecepcionDeActividades;

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
        headerName: 'Proveedor GPS',
        field: 'nombreProveedorText',
      },
      {
        headerName: 'Cliente Proveedor GPS',
        field: 'nombreClienteProveedorText',
      },
      {
        headerName: 'Login',
        field: 'login',
      },
      {
        headerName: 'Password',
        field: 'passwordOfuscado',
      },
      {
        headerName: 'Fecha Inicio',
        field: 'fechaInicio',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      {
        headerName: 'Fecha Término',
        field: 'fechaTermino',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      {
        headerName: 'Tiempo Mínimo entre Transmisiones',
        field: 'intervaloTransmiciones',
      },
      {
        headerName: 'Nro Máximo de Registros por Bloque',
        field: 'numeroRegistrosPorBloque',
      },
      estadoColumnDefs('estadoTxt'),
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
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassRecepciones,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  recepciones: RecepcionActividad[] = [];
  recepcionSeleccionada: RecepcionActividad = null;
  modalCrudActivo: OperacionesCrud = null;

  mostrarInactivoEliminar: boolean = false;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  /* External Filter aggrid */
  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassRecepciones(node: RowNode): boolean {
    if (this.recepciones.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombreProveedorText.toLowerCase().includes(busqueda) ||
        node.data.nombreClienteProveedorText.toLowerCase().includes(busqueda) ||
        node.data.login.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaInicio)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaTermino)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        String(node.data.intervaloTransmiciones)
          .toLowerCase()
          .includes(busqueda) ||
        String(node.data.numeroRegistrosPorBloque)
          .toLowerCase()
          .includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaCreacion)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        node.data.usuarioModificacion.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaModificacion)
          .format('DD/MM/YYYY')
          .includes(busqueda)
      );
    }
    return true;
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarRecepcionesActividad();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.recepcionSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.recepcionSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.recepcionSeleccionada = params.data;
    const nombre = `${this.recepcionSeleccionada.proveedor.nombre} - ${this.recepcionSeleccionada.clienteProveedor.nombre}`;
    if (this.recepcionSeleccionada.estado.id === 1) {
      this.mostrarInactivoEliminar = true;
    } else {
      this.modalCrudActivo = OperacionesCrud.eliminar;
    }
  }

  handleCierreEliminar() {
    this.mostrarInactivoEliminar = false;
  }

  get tituloInactivoEliminar() {
    return 'Eliminar Recepción de Información';
  }

  get mensajeInactivoEliminar() {
    return 'El servicio a eliminar tiene asociaciones activas, por esta razón no se puede eliminar';
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleConfirmacionEliminar() {
    this.eliminarRecepcionActividad(this.recepcionSeleccionada).finally(
      this.cargarRecepcionesActividad
    );
    this.cerrarModalCrud();
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

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.cargarRecepcionesActividad();
  }

  /* tabla */

  formatFecha(fecha: moment.Moment) {
    return fecha ? fecha.format('DD/MM/YYYY') : '';
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

  /* util */

  async cargarRecepcionesActividad() {
    this.recepciones = (await this.fetchRecepcionesActividad()) || [];
    this.gridApi.setRowData(this.recepciones);
  }

  fetchRecepcionesActividad() {
    this.loadingService.showLoading();
    return fetchRecepcionesActividad()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Recepciones de Información',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarRecepcionActividad(recepcion: RecepcionActividad) {
    this.loadingService.showLoading();
    return eliminarRecepcionActividad(recepcion)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'La Recepción de Información',
            eliminadaO: 'eliminada',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'La Recepción de Información',
          })
        )
      )
      .finally(() => this.loadingService.hideLoading());
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
}
</script>

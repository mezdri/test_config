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
          :row-data="descargas"
          exported-file-name="DescargaDeInformacion"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :rowData="descargas"
      :funcionalidad-id="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
      test-id="DescargasActividad"
    />

    <!-- Modals -->
    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="'Eliminar Descarga de Información'"
      :mensaje="{ entidad: 'la Descarga de Información' }"
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
    <CrearDescargaActividadModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />
    <EditarDescargaActividadModal
      v-if="isModalEditarActivo"
      :descargaActividad="descargaSeleccionada"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
    />
    <VerDetalleDescargaActividadModal
      v-if="isModalVerDetalleActivo"
      :descarga-actividad="descargaSeleccionada"
      @cerrar="cerrarModalCrud"
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
  GetQuickFilterTextParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import moment from 'moment';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { fetchDescargasActividad } from '@/pantallas/DescargaActividades/fetchDescargasActividad';
import { eliminarDescargaActividad } from '@/pantallas/DescargaActividades/crud/eliminar/eliminarDescargaActividad';
import {
  DescargaActividadParcial,
  DescargaActividadGrid,
} from '@/pantallas/DescargaActividades/DescargaActividad';
import CrearDescargaActividadModal from '@/pantallas/DescargaActividades/crud/crear/CrearDescargaActividadModal.vue';
import EditarDescargaActividadModal from '@/pantallas/DescargaActividades/crud/editar/EditarDescargaActividadModal.vue';
import VerDetalleDescargaActividadModal from '@/pantallas/DescargaActividades/crud/verDetalle/VerDetalleDescargaActividadModal.vue';
import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import {
  fechaModificacionColumnDefs,
  fechaCreacionColumnDefs,
  creadoPorColumnDefs,
  estadoColumnDefs,
  modificadoPorColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

@Component({
  components: {
    MantenedorGridTodos,
    VerDetalleDescargaActividadModal,
    EditarDescargaActividadModal,
    CrearDescargaActividadModal,
    ConfirmacionEliminar,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
  },
})
export default class DescargaActividades extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.Descargas;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Proveedor',
        field: 'proveedorNombre',
      },
      {
        headerName: 'Cliente Proveedor',
        field: 'clienteProveedorNombre',
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
        headerName: 'Login',
        field: 'usuario',
      },
      {
        headerName: 'Password',
        field: 'password',
      },
      {
        headerName: 'Máximo de Consultas por Día',
        field: 'maximoPeticionesDia',
      },
      {
        headerName: 'Máximo de Consultas por Hora',
        field: 'maximoPeticionesHora',
      },
      {
        headerName: 'Máximo de Registros por Bloque',
        field: 'maximoRegistrosBloque',
      },
      estadoColumnDefs('estadoNombre'),
      creadoPorColumnDefs('usuarioCreacion'),
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacion',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModificacion'),
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacion',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
    ],
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
    if (this.descargas.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.proveedorNombre.toLowerCase().includes(busqueda) ||
        node.data.clienteProveedorNombre.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaInicio)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaTermino)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        node.data.usuario.toLowerCase().includes(busqueda) ||
        //node.data.password.toLowerCase().includes(busqueda) ||
        node.data.maximoPeticionesDia.toString().includes(busqueda) ||
        node.data.maximoPeticionesHora.toString().includes(busqueda) ||
        node.data.maximoRegistrosBloque.toString().includes(busqueda) ||
        node.data.estadoNombre.toLowerCase().includes(busqueda) ||
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

  descargas: DescargaActividadGrid[] = [];
  descargaSeleccionada: DescargaActividadGrid = null;
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

  /* Table */

  formatFecha(fecha: moment.Moment) {
    return fecha ? fecha.format('DD/MM/YYYY') : '';
  }
  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }
  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarDescargas();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.descargaSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.descargaSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.descargaSeleccionada = params.data;
    if (this.descargaSeleccionada.estadoNombre === 'Activo') {
      this.mostrarInactivoEliminar = true;
    } else {
      this.modalCrudActivo = OperacionesCrud.eliminar;
    }
  }

  handleCierreEliminar() {
    this.mostrarInactivoEliminar = false;
  }

  get tituloInactivoEliminar() {
    return 'Eliminar Descarga de Información';
  }

  get mensajeInactivoEliminar() {
    return 'El servicio a eliminar tiene asociaciones activas, por esta razón no se puede eliminar';
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleConfirmacionEliminar() {
    this.eliminarDescarga(this.descargaSeleccionada).finally(
      this.cargarDescargas
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

  get getPassword() {
    return '********';
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.cargarDescargas();
  }

  /* util */

  async cargarDescargas() {
    this.descargas = [];
    let descargaActividadParcial = (await this.fetchDescargas()) || [];
    descargaActividadParcial.forEach(da => {
      this.descargas.push(this.parseDescarga(da));
    });
    this.gridApi.setRowData(this.descargas);
  }

  fetchDescargas() {
    this.loadingService.showLoading();
    return fetchDescargasActividad()
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Descargas de Información',
          })
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarDescarga(descarga: DescargaActividadGrid) {
    this.loadingService.showLoading();
    return eliminarDescargaActividad(descarga)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'Descarga de Información',
            eliminadaO: 'eliminado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la descarga de información',
          })
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  parseDescarga(descarga: DescargaActividadParcial): DescargaActividadGrid {
    return {
      ...descarga,
      proveedorNombre: descarga.proveedor.nombre,
      clienteProveedorNombre: descarga.clienteProveedor.nombre,
      estadoNombre: descarga.estado.nombre,
      usuario: descarga.usuario,
      password: '**********',
      fechaCreacion: descarga.creacion.fecha,
      usuarioCreacion: descarga.creacion.usuario,
      fechaModificacion: descarga.modificacion.fecha,
      usuarioModificacion: descarga.modificacion.usuario,
    };
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

<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusquedaLstDistribucion" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="listasDistribucion"
          exported-file-name="ListaDeDistribucion"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearListaDistribucionModal
      v-if="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />

    <EditarListaDistribucionModal
      v-if="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :listaSeleccionada="listaSeleccionada"
    />

    <VerDetalleListaDistribucionModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :listaSeleccionada="listaSeleccionada"
    />

    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
            >
              <v-card-text v-if="eliminaIndividual">
                {{ tituloEliminar }}
              </v-card-text>
            </v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-if="eliminaIndividual">
              {{ mensajeEliminaIndividual }}
            </v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              depressed
              small
              @click="dialogErrorAsoc = false"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
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
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { fetchListasDistribucion } from '@/pantallas/ListaDistribucion/fetchListasDeDistribucion';
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
import { ListaDistribucion as ListaDistribucionType } from '@/pantallas/ListaDistribucion/ListaDistribucion';
import { eliminarListaDistribucion } from '@/pantallas/ListaDistribucion/eliminarListaDistribucion';
import CrearListaDistribucionModal from '@/pantallas/ListaDistribucion/CrearListaDistribucionModal.vue';
import EditarListaDistribucionModal from '@/pantallas/ListaDistribucion/EditarListaDistribucionModal.vue';
import VerDetalleListaDistribucionModal from '@/pantallas/ListaDistribucion/VerDetalleListaDistribucionModal.vue';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearListaDistribucionModal,
    EditarListaDistribucionModal,
    VerDetalleListaDistribucionModal,
  },
})
export default class ListaDistribucion extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.ListaDeDistribucion;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
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
    doesExternalFilterPass: this.doesExternalFilterPassLstDistribucion,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  listasDistribucion: ListaDistribucionType[] = [];
  listaSeleccionada: ListaDistribucionType = null;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVerDetalle: boolean = false;
  busquedaGrillaLstDistribucion: string = '';

  /*Eliminar*/
  mensajeEliminar: any = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  tituloEliminar: any = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassLstDistribucion(node: RowNode): boolean {
    if (
      this.listasDistribucion.length > 0 &&
      this.busquedaGrillaLstDistribucion.length > 1
    ) {
      let busqueda = this.busquedaGrillaLstDistribucion;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
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

  /* event handlers */

  handleBusquedaLstDistribucion(consulta: string) {
    this.busquedaGrillaLstDistribucion = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.listasDistribucion = (await this.fetchListas()) || [];
    this.gridApi.setRowData(this.listasDistribucion);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.recargarListas();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.listaSeleccionada = params.data;
    this.mostrarModalVerDetalle = true;
  }

  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.listaSeleccionada = params.data;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.listaSeleccionada = params.data;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Lista de Distribución',
      nombreEntidad: this.listaSeleccionada.nombre,
    });
    const totalAsociados = this.listaSeleccionada.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'la Lista de Distribución',
      });
      this.dialogEliminar = true;
    } else {
      this.mensajeEliminaIndividual =
        'La Lista de Distribución tiene ' +
        (totalAsociados > 1
          ? 'asociaciones activas, '
          : 'una asociación activa, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
    }
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.dialogEliminar = false;
    if (!isConfirmado) {
      return;
    }
    await this.eliminarLista(this.listaSeleccionada);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { listaSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'La Lista ',
      nombreEntidad: listaSeleccionada ? listaSeleccionada.nombre : '',
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

  async recargarListas() {
    this.listasDistribucion = (await this.fetchListas()) || [];
    this.gridApi.setRowData(this.listasDistribucion);
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

  fetchListas() {
    this.loadingService.showLoading();
    return fetchListasDistribucion()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Listas de Distribución. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarLista(lista: ListaDistribucionType) {
    this.loadingService.showLoading();
    return eliminarListaDistribucion(lista)
      .then(() => {
        this.recargarListas();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            nombre: this.listaSeleccionada.nombre,
            entidad: 'La Lista de Distribución',
            eliminadaO: 'eliminada',
          })
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar la Lista de Distribución: ${lista.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }
}
</script>

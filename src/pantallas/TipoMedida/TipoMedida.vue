<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusqueda" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="
            enrichedGridOptions
              ? enrichedGridOptions.columnDefs
              : gridOptions.columnDefs
          "
          :row-data="tiposMedida"
          exported-file-name="TipoDeMedida"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="TipoMedida"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

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
            <v-card-text v-if="eliminaMasivo">
              {{ mensajeEliminaMasivo }}
            </v-card-text>
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

    <CrearTipoMedidaModal
      v-if="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />

    <EditarTipoMedidaModal
      v-if="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :tipoSeleccionado="tipoSeleccionado"
    />

    <VerDetalleTipoMedidaModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :tipoSeleccionado="tipoSeleccionado"
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
import CrearButton from '@/reusable/Grid/CrearButton.vue';
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
import { TipoMedida as TipoMedidaType } from '@/pantallas/TipoMedida/TipoMedida';
import { eliminarTipoMedida } from '@/pantallas/TipoMedida/eliminarTipoMedida';
import CrearTipoMedidaModal from '@/pantallas/TipoMedida/CrearTipoMedidaModal.vue';
import EditarTipoMedidaModal from '@/pantallas/TipoMedida/EditarTipoMedidaModal.vue';
import VerDetalleTipoMedidaModal from '@/pantallas/TipoMedida/VerDetalleTipoMedidaModal.vue';
import { fetchTiposMedida } from '@/pantallas/TipoMedida/fetchTiposDeMedida';
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
    CrearTipoMedidaModal,
    EditarTipoMedidaModal,
    VerDetalleTipoMedidaModal,
  },
})
export default class TipoMedida extends ComponenteBase {
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

  readonly acciones: Accion[] = [
    'Consultar',
    'Ver Detalle',
    'Eliminar',
    'Exportar',
    'Ver Detalle - Información General',
    'Crear - Información General',
    'Editar - Información General',
  ];
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoDeMedida;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Sigla',
        field: 'sigla',
      },
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
    doesExternalFilterPass: this.doesExternalFilterPassTipoMedida,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  tiposMedida: TipoMedidaType[] = [];
  tipoSeleccionado: TipoMedidaType = null;
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVerDetalle: boolean = false;
  busquedaGrilla: string = '';

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogEliminar: Boolean = false;
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  eliminaMasivo: Boolean = false;
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

  doesExternalFilterPassTipoMedida(node: RowNode): boolean {
    if (this.tiposMedida.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.sigla.toLowerCase().includes(busqueda) ||
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

  handleBusqueda(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarTipos();
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
    this.cargarTipos();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.tipoSeleccionado = params.data;
    this.mostrarModalVerDetalle = true;
  }

  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.tipoSeleccionado = params.data;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.tipoSeleccionado = params.data;
    console.log(this.tipoSeleccionado);
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Tipo de Medida ',
      nombreEntidad: this.tipoSeleccionado.nombre,
    });
    if (this.tipoSeleccionado.totalAsociados > 0) {
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
      this.mensajeEliminaIndividual =
        'El Tipo de Medida que desea eliminar tiene ' +
        this.tipoSeleccionado.totalAsociados +
        (this.tipoSeleccionado.totalAsociados > 1
          ? ' Datos Extendidos asociados'
          : ' Dato Extendido asociado') +
        ', por está razón no se podrá realizar la eliminación.';
      this.eliminaMasivo = false;
    } else {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Tipo de Medida',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Tipo: ' + this.tipoSeleccionado.id;
      this.dialogEliminar = true;
    }
    this.mostrarConfirmacionEliminar = true;
    this.mostrarConfirmacionEliminar = true;
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    this.dialogEliminar = false;
    this.dialogErrorAsoc = false;
    if (!isConfirmado) {
      return;
    }
    await this.eliminarTipo(this.tipoSeleccionado);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { tipoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'El Tipo de Medida ',
      nombreEntidad: tipoSeleccionado ? tipoSeleccionado.nombre : '',
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

  async cargarTipos() {
    this.tiposMedida = (await this.fetchTipos()) || [];
    this.gridApi.setRowData(this.tiposMedida || []);
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

  fetchTipos() {
    this.loadingService.showLoading();
    return fetchTiposMedida()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de medida. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarTipo(tipo: TipoMedidaType) {
    this.loadingService.showLoading();
    return eliminarTipoMedida(tipo)
      .then(() => {
        this.cargarTipos();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            nombre: this.tipoSeleccionado.nombre,
            entidad: 'El Tipo de Medida',
            eliminadaO: 'eliminado',
          })
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el tipo de medida: ${tipo.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }
}
</script>

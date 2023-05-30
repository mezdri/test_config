<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusqueda" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="columnDefs"
          :row-data="mensajes"
          exported-file-name="CopilotoMensaje"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="CopilotoMensaje"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearMensajeModal
      :show="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />

    <VerDetalleMensaje
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :mensajeSeleccionado="mensajeSeleccionado"
    />
    <EditarMensajeModal
      :show="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :mensajeSeleccionado="mensajeSeleccionado"
    />
    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Mensaje',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorAsoc" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
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
            <v-btn color="#526da5" depressed small>
              <span style="color: white">Aceptar</span>
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
  ColDef,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';

import { fetchMensaje } from '@/pantallas/CopilotoVirtual/Mensaje/fetchMensaje';
import {
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import { eliminarMensaje } from '@/pantallas/CopilotoVirtual/Mensaje/elimiarMensaje';
import VerDetalleMensaje from '@/pantallas/CopilotoVirtual/Mensaje/VerDetalleMensaje.vue';
import CrearMensajeModal from '@/pantallas/CopilotoVirtual/Mensaje/CrearMensajeModal.vue';
import EditarMensajeModal from '@/pantallas/CopilotoVirtual/Mensaje/EditarMensajeModal.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import moment from 'moment';
import { Mensaje } from './mensaje';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearMensajeModal,
    VerDetalleMensaje,
    EditarMensajeModal,
    ConfirmacionEliminar,
  },
})
export default class CopilotoMensaje extends ComponenteBase {
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.Mensajes;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Título',
        field: 'titulo',
        hide: false,
      },
      {
        headerName: 'Mensaje',
        field: 'mensaje',
        hide: false,
      },

      {
        headerName: 'Estado',
        field: 'estado',
        hide: false,
        valueFormatter: this.stateValueFormatter,
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
    doesExternalFilterPass: this.doesExternalFilterPassMensaje,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  columnDefs: Array<ColDef> = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
      //suppressToolPanel: false
    },
    {
      headerName: 'Título',
      field: 'titulo',
      hide: false,
    },
    {
      headerName: 'Descripción',
      field: 'descripcion',
      hide: false,
    },
    {
      headerName: 'Estado',
      field: 'estadoTxt',
      hide: false,
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
  ];

  /* state */

  mensajes: any[] = [];

  mensajeSeleccionado: Mensaje = null;

  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVerDetalle: boolean = false;
  modalCrudActivo: OperacionesCrud = null;
  busquedaGrilla: string = '';

  /*Eliminar*/
  dialogEliminar: boolean = false;
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
  dialogErrorAsoc: Boolean = false;
  mensajeEliminaIndividual: string = '';
  eliminaIndividual: Boolean = false;
  tituloEliminar: any = '';

  /* misc */

  $snotify: Snotify;
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

  doesExternalFilterPassMensaje(node: RowNode): boolean {
    if (this.mensajes.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        //node.data.id.toLowerCase().includes(busqueda) ||
        node.data.titulo.toLowerCase().includes(busqueda) ||
        node.data.mensaje.toLowerCase().includes(busqueda) ||
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
    this.mensajes = (await this.fetchMensaje()) || [];
    this.gridApi.setRowData(this.mensajes || []);
    if (this.gridOptions.columnApi) {
      this.gridOptions.columnApi.setColumnsVisible(
        ['titulo', 'mensaje', 'estado'],
        true
      );
    }
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierraModalSinGuardar() {
    if (this.mostrarModalEditar) {
      this.recargarMensajes();
    }
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.recargarMensajes();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.mensajeSeleccionado = params.data;
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }
  handleEditarClick(params: ICellRendererParams) {
    this.mensajeSeleccionado = params.data;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.mensajeSeleccionado = params.data;

    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Mensaje',
      nombreEntidad: self.mensajeSeleccionado.titulo,
    });
    const totalAsociados = 0;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Mensaje',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Mensaje: ' + self.mensajeSeleccionado.titulo;
      this.dialogEliminar = true;
    }
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  /* tabla */

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  formatState(state: number) {
    return state == 1 ? 'Activo' : 'Inactivo';
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }
  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  stateValueFormatter(params: ValueFormatterParams) {
    return this.formatState(params.value);
  }

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }
  async recargarMensajes() {
    this.mensajes = (await this.fetchMensaje()) || [];
    this.gridApi.setRowData(this.mensajes);
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

  get tituloConfirmacionEliminar() {
    const { mensajeSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Mensaje',
      nombreEntidad: mensajeSeleccionado ? mensajeSeleccionado.titulo : '',
    });
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.dialogEliminar = false;
    if (isConfirmado) {
      this.eliminarMensajeSeleccionado(this.mensajeSeleccionado);
    }
  }

  /* util */

  eliminarMensajeSeleccionado(mensajeSeleccionado: Mensaje) {
    this.loadingService.showLoading();
    return eliminarMensaje(mensajeSeleccionado)
      .then(() => {
        this.recargarMensajes();
        this.$snotify.success(
          'El Mensaje ' +
            mensajeSeleccionado.titulo +
            ' ha sido eliminado de forma exitosa',
          {
            timeout: 3000,
          }
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el Mensaje: ${mensajeSeleccionado.titulo}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  fetchMensaje() {
    this.loadingService.showLoading();
    return fetchMensaje()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los mensajes',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

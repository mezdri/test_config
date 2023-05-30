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
          :row-data="rutas"
          exported-file-name="Rutas"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="CopilotoRutas"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearRutaModal
      :show="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />

    <VerDetalleRutaModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :rutaSeleccionada="rutaSeleccionada"
    />
    <EditarRutaModal
      :show="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :rutaSeleccionada="rutaSeleccionada"
    />
    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'la Ruta',
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
            <v-btn
              color="#526da5"
              depressed
              small
              @click="dialogErrorAsoc = false"
            >
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

import { eleliminarRuta } from '@/pantallas/CopilotoVirtual/Ruta/eliminarRuta';

import VerDetalleRutaModal from '@/pantallas/CopilotoVirtual/Ruta/VerDetalleRutaModal.vue';
import CrearRutaModal from '@/pantallas/CopilotoVirtual/Ruta/CrearRutaModal.vue';
import EditarRutaModal from '@/pantallas/CopilotoVirtual/Ruta/EditarRutaModal.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import moment from 'moment';
import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { Ruta } from '../Ruta/rutas';
import { fetchRutas } from './fetchRutas';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearRutaModal,
    VerDetalleRutaModal,

    ConfirmacionEliminar,
    EditarRutaModal,
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
        headerName: 'Nombre',
        field: 'nombre',
      },
      creadoPorColumnDefs('usuarioCreador'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('nombreModificador'),
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
    },
    {
      headerName: 'Nombre',
      field: 'nombre',
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

  // mensajes: Ruta[] = [];
  rutas: Ruta[] = [];

  rutaSeleccionada: Ruta = null;

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

  readonly $snotify: any;
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
    if (this.rutas.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        //node.data.id.toLowerCase().includes(busqueda) ||
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreador.toLowerCase().includes(busqueda) ||
        node.data.nombreModificador.toLowerCase().includes(busqueda) ||
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
    this.rutas = (await this.fetchRutas()) || [];
    this.gridApi.setRowData(this.rutas || []);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierraModalSinGuardar() {
    if (this.mostrarModalEditar) {
      this.recargarRutas();
    }
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.recargarRutas();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.rutaSeleccionada = null;
    this.rutaSeleccionada = params.data;
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.rutaSeleccionada = null;
    this.mostrarModalVerDetalle = false;
  }
  handleEditarClick(params: ICellRendererParams) {
    this.rutaSeleccionada = null;
    this.rutaSeleccionada = params.data;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.rutaSeleccionada = null;
    this.rutaSeleccionada = params.data;

    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Ruta',
      nombreEntidad: self.rutaSeleccionada.nombre,
    });
    const totalAsociados = 0;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'La ruta',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar la ruta : ' + self.rutaSeleccionada.nombre;
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
  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }
  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }
  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }
  async recargarRutas() {
    this.rutas = (await this.fetchRutas()) || [];
    this.gridApi.setRowData(this.rutas);
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
    const { rutaSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Ruta',
      nombreEntidad: rutaSeleccionada ? rutaSeleccionada.nombre : '',
    });
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.dialogEliminar = false;
    if (isConfirmado) {
      this.eliminarrutaSeleccionada(this.rutaSeleccionada);
    }
  }

  /* util */

  eliminarrutaSeleccionada(rutaSeleccionada: Ruta) {
    this.loadingService.showLoading();
    return eleliminarRuta(rutaSeleccionada)
      .then(() => {
        this.$snotify.success(
          'La ruta ' +
            rutaSeleccionada.nombre +
            ' ha sido eliminado de forma exitosa',
          {
            timeout: 3000,
          }
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar la ruta: ${rutaSeleccionada.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.recargarRutas();
        this.loadingService.hideLoading();
      });
  }

  fetchRutas() {
    this.loadingService.showLoading();
    return fetchRutas()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', { entidad: 'las rutas' })
        );
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

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
          :row-data="dispositivos"
          exported-file-name="Dispositivos"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="Dispositivos"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <CrearDispositivoModal
      :show="mostrarModalCrear"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
    />
    <VerDetalleDispositivoModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :dispositivoSeleccionado="dispositivoSeleccionado"
    />
    <EditarDispositivoModal
      :show="mostrarModalEditar"
      @cerrar="handleCierraModalSinGuardar"
      @cerrarBtnGuardar="handleCierreModalBtnGuardar"
      :dispositivoSeleccionado="dispositivoSeleccionado"
    />
    <Confirmation
      :show="dialogEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Dispositivo',
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
  ColDef,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { fetchDispositivos } from '@/reusable/Dispositivos/fetchDispositivos';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
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
import { Dispositivo as DispositivoType } from '@/reusable/Dispositivos/dispositivos';
import { eliminarDispositivo } from '@/pantallas/Dispositivos/eliminarDispositivo';
import CrearDispositivoModal from '@/pantallas/Dispositivos/CrearDispositivoModal.vue';
import EditarDispositivoModal from '@/pantallas/Dispositivos/EditarDispositivoModal.vue';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import VerDetalleDispositivoModal from '@/pantallas/Dispositivos/VerDetalleDispositivoModal.vue';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import moment from 'moment';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearDispositivoModal,
    VerDetalleDispositivoModal,
    EditarDispositivoModal,
    ConfirmacionEliminar,
  },
})
export default class Dispositivo extends ComponenteBase {
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.Dispositivos;

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
        headerName: 'Marca',
        field: 'marca',
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
      },
      {
        headerName: 'GPS',
        field: 'isGpsText',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
      },
      {
        headerName: 'Ícono',
        field: '',
        cellRenderer: this.crearIcono,
        cellStyle: { 'pointer-events': 'none' },
        getQuickFilterText: () => '',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
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
    doesExternalFilterPass: this.doesExternalFilterPassDispositivos,
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
    {
      headerName: 'Marca',
      field: 'marca',
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
    },
    {
      headerName: 'GPS',
      field: 'isGpsText',
    },
    {
      headerName: 'Descripción',
      field: 'descripcion',
    },
    {
      headerName: 'Estado',
      field: 'estadoTxt',
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

  dispositivos: any[] = [];
  dispositivoSeleccionado: DispositivoType = null;
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

  doesExternalFilterPassDispositivos(node: RowNode): boolean {
    if (this.dispositivos.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.marca.toLowerCase().includes(busqueda) ||
        node.data.modelo.toLowerCase().includes(busqueda) ||
        node.data.isGpsText.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
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
    this.dispositivos = (await this.fetchDispositivos()) || [];
    this.gridApi.setRowData(this.dispositivos || []);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierraModalSinGuardar() {
    if (this.mostrarModalEditar) {
      this.recargarDispositivos();
    }
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
    this.recargarDispositivos();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.dispositivoSeleccionado = params.data;
    this.mostrarModalVerDetalle = true;
  }
  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.dispositivoSeleccionado = params.data;
    this.mostrarModalEditar = true;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.dispositivoSeleccionado = params.data;
    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Dispositivo',
      nombreEntidad: self.dispositivoSeleccionado.nombre,
    });
    const totalAsociados = self.dispositivoSeleccionado.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Dispositivo',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Dispositivo: ' + self.dispositivoSeleccionado.nombre;
      this.dialogEliminar = true;
      //this.modalCrudActivo = OperacionesCrud.eliminar;
    } else {
      this.mensajeEliminaIndividual =
        'El Dispositivo tiene ' +
        (totalAsociados > 1
          ? 'asociaciones activas, '
          : 'una asociación activa, ') +
        'por esta razón no se podrá realizar la eliminación.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
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
  async recargarDispositivos() {
    this.dispositivos = (await this.fetchDispositivos()) || [];
    this.gridApi.setRowData(this.dispositivos);
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
    const { dispositivoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Dispositivo',
      nombreEntidad: dispositivoSeleccionado
        ? dispositivoSeleccionado.nombre
        : '',
    });
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.dialogEliminar = false;
    if (isConfirmado) {
      this.eliminarDispositivoSeleccionado(this.dispositivoSeleccionado);
    }
  }

  /* util */

  eliminarDispositivoSeleccionado(dispositivoSeleccionado: DispositivoType) {
    this.loadingService.showLoading();
    return eliminarDispositivo(dispositivoSeleccionado)
      .then(() => {
        this.recargarDispositivos();
        this.$snotify.success(
          'El Dispositivo ' +
            dispositivoSeleccionado.nombre +
            ' ha sido eliminado de forma exitosa',
          {
            timeout: 3000,
          }
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el Dispositivo: ${dispositivoSeleccionado.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  fetchDispositivos() {
    this.loadingService.showLoading();
    return fetchDispositivos()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los dispositivos',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  crearIcono({ data: dispositivo }: { data: DispositivoType }) {
    if (dispositivo.icono == '' || dispositivo.icono === null) {
      return;
    }
    return `<img src='${'data:image/jpg;base64,' +
      dispositivo.icono}' style='height: 40px; width: 40px;padding-right: 2px'/>`;
  }
}
</script>

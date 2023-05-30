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
          :row-data="lstEnvios"
          exported-file-name="EnvioDeInformacion"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      :row-data="lstEnvios"
      @gridOptionsEnriched="enrichedGridOptions = $event"
      test-id="Envio"
    />
    <!-- Modals -->
    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="'Eliminar Envío de Información'"
      :mensaje="{ entidad: 'el Envio de Información' }"
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />
    <Confirmation
      :show="mostrarInactivoEliminar"
      :titulo="'Eliminar Envío de Información'"
      :mensaje="
        'El Servicio tiene envíos asociados, por esta razón no se podrá realizar la eliminación'
      "
      v-on:modalConfirmationEmit="mostrarInactivoEliminar = false"
      :mostrarBoton="false"
      :textoBtnSi="`Aceptar`"
    ></Confirmation>
    <CrearEnvioInformacionModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />
    <EditarEnvioInformacionModal
      v-if="isModalEditarActivo"
      :id="idEnvio"
      @cerrar="cerrarModalCrud"
      @guardar="handleCrearOrEditar"
    />
    <VerDetalleEnvioInformacionModal
      v-if="isModalVerActivo"
      :id="idEnvio"
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
  ValueFormatterParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';

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
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';

import {
  estadoColumnDefs,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
  fechaInicioColumnDefs,
  fechaTerminoColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';

import CrearEnvioInformacionModal from '@/pantallas/EnvioInformacion/CrearEnvioInformacionModal.vue';
import EditarEnvioInformacionModal from '@/pantallas/EnvioInformacion/EditarEnvioInformacionModal.vue';
import VerDetalleEnvioInformacionModal from '@/pantallas/EnvioInformacion/VerDetalleEnvioInformacionModal.vue';

import { fetchEnvios } from '@/pantallas/EnvioInformacion/Services/fetchEnvios';
import { eliminarEnvio } from '@/pantallas/EnvioInformacion/Services/eliminarEnvio';
import { chequearEnvio } from '@/pantallas/EnvioInformacion/Services/chequearEnvio';
import { Envio } from '../../interfaces/Envio';
import moment from 'moment';
import { EstadoEntidad } from '../../config/enums';

@Component({
  components: {
    MantenedorGridTodos,
    ConfirmacionEliminar,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    CrearEnvioInformacionModal,
    EditarEnvioInformacionModal,
    VerDetalleEnvioInformacionModal,
  },
})
export default class EnvioInformacion extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.EnvioDeInformacion;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Proveedor',
        field: 'proveedor',
      },
      {
        headerName: 'Cliente Proveedor',
        field: 'clienteProveedor',
      },
      {
        headerName: 'Contrato',
        field: 'contratoNombre',
      },
      {
        ...fechaInicioColumnDefs('fechaIni'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      {
        ...fechaTerminoColumnDefs('fechaFin'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      {
        headerName: 'Endpoint',
        field: 'endpoint',
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
        headerName: 'APIkey',
        field: 'apiKey',
      },
      estadoColumnDefs('estadoTxt'),
      creadoPorColumnDefs('usuarioCreacion'),
      {
        headerName: 'Último Envío',
        field: 'ultimoEnvio',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
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
    if (this.lstEnvios.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.proveedor.toLowerCase().includes(busqueda) ||
        node.data.clienteProveedor.toLowerCase().includes(busqueda) ||
        node.data.contratoNombre.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaIni)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaFin)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        node.data.endpoint.toLowerCase().includes(busqueda) ||
        node.data.usuario.toLowerCase().includes(busqueda) ||
        //node.data.password.toLowerCase().includes(busqueda) ||
        node.data.apiKey.toLowerCase().includes(busqueda) ||
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

  lstEnvios: Envio[] = [];
  envioSeleccionado: Envio = null;
  idEnvio: number = 0;
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

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarEnvios();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.idEnvio = params.data.id;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  async handleEditarClick(params: ICellRendererParams) {
    this.idEnvio = params.data.id;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.envioSeleccionado = params.data;

    if (
      this.envioSeleccionado.estado == EstadoEntidad.Activo ||
      this.envioSeleccionado.ultimoEnvio.isValid()
    ) {
      this.mostrarInactivoEliminar = true;
    } else {
      this.modalCrudActivo = OperacionesCrud.eliminar;
    }
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  async handleConfirmacionEliminar() {
    var chequeoEnvio = await this.chequearEnvio();

    if (!chequeoEnvio) {
      this.eliminarEnvio().finally(this.cargarEnvios);
    } else {
      this.$snotify.error(
        'El servicio a eliminar tiene asociaciones activas, debe primero desasociar, para eliminar el servicio'
      );
    }

    this.cerrarModalCrud();
  }

  /* template */

  get isModalCrearActivo() {
    return this.modalCrudActivo === OperacionesCrud.crear;
  }

  get isModalEditarActivo() {
    return this.modalCrudActivo === OperacionesCrud.editar;
  }

  get isModalVerActivo() {
    return this.modalCrudActivo === OperacionesCrud.consultar;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.cargarEnvios();
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

  formatFecha(fecha: moment.Moment) {
    return moment(fecha).format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  async cargarEnvios() {
    this.lstEnvios = (await this.fetchEnvios()) || [];
    this.gridApi.setRowData(this.lstEnvios);
  }

  fetchEnvios() {
    this.loadingService.showLoading();
    return fetchEnvios()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'Envíos de Información',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarEnvio() {
    this.loadingService.showLoading();
    return eliminarEnvio(this.envioSeleccionado.id)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'El Envío de Información',
            eliminadaO: 'eliminado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'Envío de Información',
          })
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  chequearEnvio() {
    this.loadingService.showLoading();
    return chequearEnvio(this.envioSeleccionado.id)
      .then(response => {
        return response.data;
      })
      .catch(() =>
        this.$snotify.error('Error al verificar el Envío de Información')
      )
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

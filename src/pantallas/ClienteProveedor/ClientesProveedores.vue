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
          :row-data="lstClientesProveedores"
          exported-file-name="ClientesProveedoresDeGPS"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <div class="gridcard rounded-card">
      <MantenedorGridTodos
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
        :row-data="lstClientesProveedores"
        @gridOptionsEnriched="enrichedGridOptions = $event"
      />
    </div>
    <Confirmation
      :show="mostrarAsociacionesEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="mensajeAsociacionEliminar"
      v-on:modalConfirmationEmit="handleCierreEliminar"
      :mostrarBoton="false"
      :textoBtnSi="`Aceptar`"
    ></Confirmation>
    <Confirmation
      :show="mostrarRecepcionesEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="mensajeRecepcionesEliminar"
      v-on:modalConfirmationEmit="handleCierreEliminar"
      :mostrarBoton="false"
      :textoBtnSi="`Aceptar`"
    ></Confirmation>
    <Confirmation
      :show="mostrarConfirmacionEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'el Cliente Proveedor de GPS',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>
    <CrearClienteProveedorModal
      :show="mostrarModalCrear"
      @cerrar="handleCierreModalCrear"
    />
    <VerClienteProveedorModal
      :show="mostrarModalVer"
      @cerrar="handleCierreModalVer"
      :clienteProveedorSeleccionado="clienteProveedorSeleccionado"
    />
    <EditarClienteProveedorModal
      :show="mostrarModalEditar"
      @cerrar="handleCierreModalEditar"
      :clienteProveedorSeleccionado="clienteProveedorSeleccionado"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

import { LoadingService } from '@/services/loadingService';

import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';

import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';
import { fetch as fetchClientesProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import { eliminarClienteProveedor } from '@/pantallas/ClienteProveedor/eliminarClienteProveedor';
import { fetchAsociacionCliente } from '@/pantallas/ClienteProveedor/fetchAsociacion';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';

import CrearClienteProveedorModal from '@/pantallas/ClienteProveedor/CrearClienteProveedorModal.vue';
import VerClienteProveedorModal from '@/pantallas/ClienteProveedor/VerClienteProveedorModal.vue';
import EditarClienteProveedorModal from '@/pantallas/ClienteProveedor/EditarClienteProveedorModal.vue';

import { EstadoEntidad } from '@/config/enums';
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
    CrearClienteProveedorModal,
    VerClienteProveedorModal,
    EditarClienteProveedorModal,
  },
})
export default class ClientesProveedores extends ComponenteBase {
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.ClienteProveedor;

  /* state */

  lstClientesProveedores: ClienteProveedor[] = [];
  clienteProveedorSeleccionado: ClienteProveedor = null;
  mostrarConfirmacionEliminar: boolean = false;
  mostrarRecepcionesEliminar: boolean = false;
  mostrarAsociacionesEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalVer: boolean = false;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre o Razón Social',
        field: 'nombre',
      },
      {
        headerName: 'Rut',
        field: 'rut',
      },
      {
        headerName: 'Giro',
        field: 'giroText',
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
      },
      creadoPorColumnDefs('usuarioCreador'),
      fechaCreacionColumnDefs('fechaCreacionTxt'),
      modificadoPorColumnDefs('usuarioModifica'),
      fechaModificacionColumnDefs('fechaModificacionTxt'),
    ],
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassClientesProveedores,
  };

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

  doesExternalFilterPassClientesProveedores(node: RowNode): boolean {
    if (
      this.lstClientesProveedores.length > 0 &&
      this.busquedaGrilla.length > 1
    ) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.rut.toLowerCase().includes(busqueda) ||
        node.data.giroText.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreador.toLowerCase().includes(busqueda) ||
        node.data.fechaCreacionTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioModifica.toLowerCase().includes(busqueda) ||
        node.data.fechaModificacionTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { clienteProveedorSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Cliente Proveedor de GPS',
      nombreEntidad: clienteProveedorSeleccionado
        ? clienteProveedorSeleccionado.nombre
        : '',
    });
  }

  get mensajeAsociacionEliminar() {
    return 'El Cliente Proveedor de GPS tiene asociaciones activas, por esta razón no se podrá realizar la eliminación.';
  }

  get mensajeRecepcionesEliminar() {
    return 'El Cliente Proveedor de GPS tiene asociaciones activas, por esta razón no se podrá realizar la eliminación.';
  }

  /* util */

  fetchClienteProveedor() {
    this.loadingService.showLoading();
    return fetchClientesProveedorGps()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Clientes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async eliminarProveedor(proveedor: ClienteProveedor) {
    this.loadingService.showLoading();
    return eliminarClienteProveedor(proveedor.id)
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el Cliente Proveedor: ${proveedor.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.$snotify.success(
          `El Cliente Proveedor de GPS ${proveedor.nombre} ha sido eliminado de forma exitosa`,
          {
            timeout: 3000,
          }
        );
        this.loadingService.hideLoading();
        this.buscarClienteProveedor();
      });
  }

  async comprobarAsociaciones(cliente: any) {
    if (cliente.proveedoresId.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  fetchProveedores() {
    this.loadingService.showLoading();
    return fetchProveedoresGps()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Proveedores',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async buscarClienteProveedor() {
    this.lstClientesProveedores = (await this.fetchClienteProveedor()) || [];
    this.gridApi.setRowData(this.lstClientesProveedores);
  }

  /* tabla */

  formatFecha(params: ValueFormatterParams) {
    return params.value.format('DD/MM/YYYY');
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.buscarClienteProveedor();
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModalCrear() {
    this.mostrarModalCrear = false;
    this.buscarClienteProveedor();
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.clienteProveedorSeleccionado = params.data;
    this.mostrarModalVer = true;
  }

  handleCierreModalVer() {
    this.mostrarModalVer = false;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.clienteProveedorSeleccionado = params.data;
    this.mostrarModalEditar = true;
  }

  handleCierreModalEditar() {
    this.mostrarModalEditar = false;
    this.buscarClienteProveedor();
  }

  async handleEliminarClick(params: ICellRendererParams) {
    this.clienteProveedorSeleccionado = params.data;

    let asociacionRecepcion = await fetchAsociacionCliente(
      this.clienteProveedorSeleccionado.id
    );
    let asociacionClientes = await this.comprobarAsociaciones(
      this.clienteProveedorSeleccionado
    );

    if (asociacionRecepcion.data) {
      this.mostrarRecepcionesEliminar = true;
    } else if (asociacionClientes) {
      this.mostrarAsociacionesEliminar = true;
    } else {
      this.mostrarConfirmacionEliminar = true;
    }
  }

  handleCierreEliminar() {
    this.mostrarRecepcionesEliminar = false;
    this.mostrarAsociacionesEliminar = false;
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    if (isConfirmado) {
      this.eliminarProveedor(this.clienteProveedorSeleccionado);
    }
  }
}
</script>

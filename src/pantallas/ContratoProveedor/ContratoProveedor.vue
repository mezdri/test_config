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
          :row-data="lstContratosProveedores"
          exported-file-name="ConfiguracionDeContrato"
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
      test-id="ContratoProveedor"
    />

    <!-- Modals -->
    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="
        this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Configuración de Contrato',
          nombreEntidad: contratoProveedorSeleccionado
            ? contratoProveedorSeleccionado.nombre
            : '',
        })
      "
      :mensaje="{ entidad: 'la Configuración de Contrato' }"
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />
    <Confirmation
      :show="noPermiteEliminarConfirm"
      :titulo="
        this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Configuración de Contrato',
          nombreEntidad: contratoProveedorSeleccionado
            ? contratoProveedorSeleccionado.nombre
            : '',
        })
      "
      :mensaje="
        'El Contrato a eliminar tiene asociaciones activas, por esta razón no se puede eliminar.'
      "
      :mostrarBoton="false"
      v-on:modalConfirmationEmit="noPermiteEliminarConfirm = false"
    ></Confirmation>
    <CrearContratoProveedorModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />
    <EditarContratoProveedorModal
      v-if="isModalEditarActivo"
      :idContratoProveedor="idContratoProveedor"
      @cerrar="cerrarModalCrud"
      @guardar="handleCrearOrEditar"
    />
    <VerContratoProveedorModal
      v-if="isModalVerActivo"
      :idContratoProveedor="idContratoProveedor"
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
} from '@/reusable/Grid/aggridColumnDefUtils';

import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';

import CrearContratoProveedorModal from '@/pantallas/ContratoProveedor/CrearContratoProveedorModal.vue';
import EditarContratoProveedorModal from '@/pantallas/ContratoProveedor/EditarContratoProveedorModal.vue';
import VerContratoProveedorModal from '@/pantallas/ContratoProveedor/VerContratoProveedorModal.vue';

import { fetchContratosProveedores } from '@/pantallas/ContratoProveedor/Services/fetchContratosProveedores';
import { eliminarContratoProveedor } from '@/pantallas/ContratoProveedor/Services/eliminarContratoProveedor';
import { chequearContratoEnvio } from '@/pantallas/ContratoProveedor/Services/chequearContratoEnvio';
import moment from 'moment';

@Component({
  components: {
    MantenedorGridTodos,
    ConfirmacionEliminar,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    CrearContratoProveedorModal,
    EditarContratoProveedorModal,
    VerContratoProveedorModal,
  },
})
export default class ContratoProveedor extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.ContratoProveedor;

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Proveedor',
        field: 'proveedor',
      },
      {
        headerName: 'Tiempo Mín. entre Transmisiones',
        field: 'tiempoMin',
      },
      {
        headerName: 'Tiempo Máx. entre Transmisiones',
        field: 'tiempoMax',
      },
      {
        headerName: 'Tamaño del Bloque de Envío',
        field: 'cantidadBloque',
      },
      {
        headerName: 'Cantidad de Reintentos',
        field: 'reintentos',
      },
      estadoColumnDefs('estadoTxt'),
      creadoPorColumnDefs('usuarioCreacion'),
      {
        ...fechaCreacionColumnDefs('fechaCreacionTxt'),
      },
      modificadoPorColumnDefs('usuarioModificacion'),
      {
        ...fechaModificacionColumnDefs('fechaModificacionTxt'),
      },
    ],
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  funcionFiltrar(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    if (
      this.lstContratosProveedores.length > 0 &&
      this.busquedaGrilla.length > 1
    ) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.proveedor.toLowerCase().includes(busqueda) ||
        node.data.tiempoMin.toString().includes(busqueda) ||
        node.data.tiempoMax.toString().includes(busqueda) ||
        node.data.cantidadBloque.toString().includes(busqueda) ||
        node.data.reintentos.toString().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacion.toLowerCase().includes(busqueda) ||
        node.data.fechaCreacionTxt.includes(busqueda) ||
        node.data.fechaModificacionTxt.includes(busqueda)
      );
    }
    return true;
  }

  /* state */

  lstContratosProveedores: ContratoProveedorBackend[] = [];
  contratoProveedorSeleccionado: ContratoProveedorBackend = null;
  idContratoProveedor: number = 0;
  modalCrudActivo: OperacionesCrud = null;
  noPermiteEliminarConfirm: boolean = false;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleContratoClick);
    actionsEvent.onEditar(this.handleEditarContratoClick);
    actionsEvent.onEliminar(this.handleEliminarContratoClick);
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.cargarContratoProveedores();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  async handleVerDetalleContratoClick(params: ICellRendererParams) {
    this.idContratoProveedor = params.data.id;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  async handleEditarContratoClick(params: ICellRendererParams) {
    this.idContratoProveedor = params.data.id;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  async handleEliminarContratoClick(params: ICellRendererParams) {
    this.contratoProveedorSeleccionado = params.data;

    var relacionContratoEnvio = await this.chequearContratoEnvio();

    if (!relacionContratoEnvio) {
      this.modalCrudActivo = OperacionesCrud.eliminar;
    } else {
      this.noPermiteEliminarConfirm = true;
    }
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleConfirmacionEliminar() {
    this.eliminarContratoProveedor().finally(this.cargarContratoProveedores);
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
    this.cargarContratoProveedores();
  }

  /* util */

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return params.value.format('DD/MM/YYYY');
  }

  async cargarContratoProveedores() {
    this.lstContratosProveedores =
      (await this.fetchContratosProveedores()) || [];
    this.gridApi.setRowData(this.lstContratosProveedores);
  }

  fetchContratosProveedores() {
    this.loadingService.showLoading();
    return fetchContratosProveedores()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Configuraciones de Contrato',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarContratoProveedor() {
    const nombre = this.contratoProveedorSeleccionado.nombre;

    this.loadingService.showLoading();
    return eliminarContratoProveedor(this.contratoProveedorSeleccionado.id)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'Configuración de Contrato',
            eliminadaO: 'eliminado',
            nombre,
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'Configuración de Contrato',
            nombre,
          })
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  chequearContratoEnvio() {
    this.loadingService.showLoading();
    return chequearContratoEnvio(this.contratoProveedorSeleccionado.id)
      .then(response => {
        return response.data;
      })
      .catch(() =>
        this.$snotify.error('Error al verificar relación contrato - envio')
      )
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

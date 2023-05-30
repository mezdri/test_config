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
          :row-data="funciones"
          exported-file-name="FuncionesGlobales"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      test-id="FuncionesGlobales"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modals -->
    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="{
        entidad: 'Función Global',
        nombreEntidad: funcionSeleccionada ? funcionSeleccionada.nombre : '',
      }"
      :mensaje="{ entidad: 'la Función Global' }"
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
    <CrearFuncionesGlobales
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />
    <EditarFuncionesGlobales
      v-if="isModalEditarActivo"
      :funcionGlobal="funcionSeleccionada"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
    />
    <VerDetalleFuncionesGlobales
      v-if="isModalVerDetalleActivo"
      :funcionGlobal="funcionSeleccionada"
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
import {
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
import { eliminarRecepcionActividad } from '@/pantallas/Recepcion/eliminarRecepcionActividad';
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';

import { FuncionGlobal } from '@/pantallas/FuncionesGlobales/servicios/Funciones';
import { fetchFuncionesGlobales } from '@/pantallas/FuncionesGlobales/servicios/CargarFuncionesGlobales';
import { deleteFuncionGlobal } from '@/pantallas/FuncionesGlobales/servicios/EliminarFuncionGlobal';

import CrearFuncionesGlobales from '@/pantallas/FuncionesGlobales/CrearFuncionesGlobales.vue';
import EditarFuncionesGlobales from '@/pantallas/FuncionesGlobales/EditarFuncionesGlobales.vue';
import VerDetalleFuncionesGlobales from '@/pantallas/FuncionesGlobales/VerDetalleFuncionesGlobales.vue';
import moment from 'moment';

@Component({
  components: {
    MantenedorGridTodos,
    ConfirmacionEliminar,
    VerDetalleFuncionesGlobales,
    EditarFuncionesGlobales,
    CrearFuncionesGlobales,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
  },
})
export default class FuncionesGlobales extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.FuncionesGlobales;

  /* state */
  permisoAccion: PermisoAccion = null;
  busquedaGrilla: string = '';

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre de  Función',
        field: 'nombre',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        /*cellRenderer: (r: any) => {
          if (r.data.estado == '1') {
            return 'Activo';
          } else {
            return 'Inactivo';
          }
        },*/
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
    if (this.funciones.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
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

  /* state */

  funciones: FuncionGlobal[] = [];
  funcionSeleccionada: FuncionGlobal = null;

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
    this.cargarFuncionesGlobales();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.funcionSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.funcionSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.funcionSeleccionada = params.data;
    if (this.funcionSeleccionada.estado == '1') {
      this.mostrarInactivoEliminar = true;
    } else {
      this.modalCrudActivo = OperacionesCrud.eliminar;
    }
  }

  handleCierreEliminar() {
    this.mostrarInactivoEliminar = false;
  }

  get tituloInactivoEliminar() {
    return 'Eliminar Función Global';
  }

  get mensajeInactivoEliminar() {
    return 'La función a eliminar se encuentra activa, por esta razón no se puede eliminar';
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleConfirmacionEliminar() {
    this.eliminarFuncionGlobal(this.funcionSeleccionada).finally(
      this.cargarFuncionesGlobales
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
    this.cargarFuncionesGlobales();
  }

  /* util */

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }
  formatFecha(fecha: moment.Moment) {
    return fecha ? fecha.format('DD/MM/YYYY') : '';
  }

  async cargarFuncionesGlobales() {
    this.funciones = (await this.fetchFuncionesGlobales()) || [];
    this.gridApi.setRowData(this.funciones);
  }

  fetchFuncionesGlobales() {
    this.loadingService.showLoading();
    return fetchFuncionesGlobales()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Funciones Globales',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarFuncionGlobal(funcion: FuncionGlobal) {
    this.loadingService.showLoading();
    return deleteFuncionGlobal(funcion.id)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'La Función Global',
            eliminadaO: 'eliminada',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'La Función Global',
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

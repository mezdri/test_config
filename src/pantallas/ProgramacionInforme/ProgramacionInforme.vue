<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedor :filter="handleBusqueda" />
      </template>
      <template v-slot:centro>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="gridOptions.columnDefs"
          :row-data="lstProgramacionesInformes"
          exported-file-name="ProgramacionDeInformes"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :rowData="lstProgramacionesInformes"
      :funcionalidad-id="funcionalidad"
    />
    <CrearProgramacionInformeModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />

    <EditarProgramacionInformesModal
      v-if="isModalEditarActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
      :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
      :notificacion="notificacion"
    />

    <VerProgramacionInformeModal
      v-if="isModalVerDetalleActivo"
      @cerrar="cerrarModalCrud"
      :informeProgramadoSeleccionado="informeProgramadoSeleccionado"
      :notificacion="notificacion"
    />

    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'la Programacion de Informes',
        })
      "
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
  fechaCreacionColumnDefs,
  modificadoPorColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import { Snotify } from '@/snotify/Snotify';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { OperacionesCrud } from '../../reusable/Mantenedor/mantenedorUtils';
import CrearProgramacionInformeModal from '@/pantallas/ProgramacionInforme/CrearProgramacionInformeModal.vue';
import EditarProgramacionInformesModal from '@/pantallas/ProgramacionInforme/EditarProgramacionInformesModal.vue';
import VerProgramacionInformeModal from '@/pantallas/ProgramacionInforme/VerProgramacionInformeModal.vue';
import {
  fetchProgramacionesInformes,
  ProgramacionesInformes,
} from '@/pantallas/ProgramacionInforme/fetchProgamacionesInformes';
import { eliminarProgramacionInformes } from '@/pantallas/ProgramacionInforme/eliminarProgramacionInformes';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import moment from 'moment';
import {
  fetchInformeProgramado,
  IInformeProgramadoBackend,
} from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import { fetchNotificacionesDetalle } from '@/pantallas/ProgramacionInforme/fetchNotificaciones';
import { Notificacion } from '@/pantallas/ProgramacionInforme/ProgramacionInforme';

@Component({
  components: {
    MantenedorGridTodos,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    CrearProgramacionInformeModal,
    ConfirmacionEliminar,
    EditarProgramacionInformesModal,
    VerProgramacionInformeModal,
  },
})
export default class ProgramacionInforme extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.ProgramacionInforme;

  programacionInformeSeleccionada: ProgramacionesInformes = null;
  informeProgramadoSeleccionado: IInformeProgramadoBackend = {};
  notificacion: Notificacion = null;

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  handleEliminarClick(params: ICellRendererParams) {
    this.programacionInformeSeleccionada = params.data;
    this.modalCrudActivo = OperacionesCrud.eliminar;
  }

  handleConfirmacionEliminar() {
    this.eliminarProgramacion(this.programacionInformeSeleccionada);
    this.cerrarModalCrud();
  }

  async handleEditarClick(params: ICellRendererParams) {
    this.programacionInformeSeleccionada = params.data;
    this.informeProgramadoSeleccionado =
      (await this.fetchInformeProgramado(params.data.id)) || {};
    console.log(this.informeProgramadoSeleccionado);
    this.notificacion =
      (await this.fetchNotificaciones(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.programacionInformeSeleccionada = params.data;
    this.informeProgramadoSeleccionado =
      (await this.fetchInformeProgramado(params.data.id)) || {};
    this.notificacion =
      (await this.fetchNotificaciones(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  lstProgramacionesInformes: ProgramacionesInformes[] = [];
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
      },
      {
        headerName: 'Tipo de Informe',
        field: 'tipoInforme',
      },
      {
        headerName: 'Último Envío',
        field: 'ultimoEnvio',
      },
      {
        headerName: 'Estado de Envío',
        field: 'estadoEnvioTxt',
      },
      {
        headerName: 'Detalle de error',
        field: 'detalleError',
      },
      creadoPorColumnDefs('usuarioCreacion'),
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
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassProgramacionInformes,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  /* state */

  modalCrudActivo: OperacionesCrud = null;
  busquedaGrilla: string = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassProgramacionInformes(node: RowNode): boolean {
    if (
      this.lstProgramacionesInformes.length > 0 &&
      this.busquedaGrilla.length > 1
    ) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.tipoInforme.toLowerCase().includes(busqueda) ||
        node.data.estadoEnvioTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacion.toLowerCase().includes(busqueda) ||
        String(node.data.detalleError)
          .toLowerCase()
          .includes(busqueda) ||
        moment(node.data.ultimoEnvio)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
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

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.recargaGrilla();
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  handleCrearOrEditar() {
    this.cerrarModalCrud();
    this.recargaGrilla();
  }

  async recargaGrilla() {
    this.lstProgramacionesInformes = (await this.fetchProgramaciones()) || [];
    this.gridApi.setRowData(this.lstProgramacionesInformes);
  }

  /* template */

  get isModalCrearActivo() {
    return this.modalCrudActivo === OperacionesCrud.crear;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  get isModalEditarActivo() {
    return this.modalCrudActivo === OperacionesCrud.editar;
  }

  get isModalVerDetalleActivo() {
    return this.modalCrudActivo === OperacionesCrud.consultar;
  }

  get tituloConfirmacionEliminar() {
    const { programacionInformeSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Programacion de Informes',
      nombreEntidad: programacionInformeSeleccionada
        ? programacionInformeSeleccionada.nombre
        : '',
    });
  }

  /*Util */

  fetchProgramaciones() {
    this.loadingService.showLoading();
    return fetchProgramacionesInformes()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las programaciones de informes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarProgramacion(programacion: ProgramacionesInformes) {
    this.loadingService.showLoading();
    return eliminarProgramacionInformes(programacion)
      .then(() => {
        this.recargaGrilla();
        this.$snotify.success(
          'La Programacion de Informes ' +
            programacion.nombre +
            ' ha sido eliminada de forma exitosa',
          {
            timeout: 3000,
          }
        );
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar la Programación de Informes: ${programacion.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async fetchInformeProgramado(id: number) {
    this.loadingService.showLoading();
    return fetchInformeProgramado(id)
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener la informacion del informe programado',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchNotificaciones(idInforme: number) {
    this.loadingService.showLoading();
    return fetchNotificacionesDetalle(idInforme)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Notificaciones. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

<style scoped></style>

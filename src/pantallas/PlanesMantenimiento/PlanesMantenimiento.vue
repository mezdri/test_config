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
          :row-data="plan"
          exported-file-name="PlanesDeMantenimiento"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidad-id="funcionalidad"
      :row-data="plan"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />

    <!-- Modal -->

    <ConfirmacionEliminar
      :show="isConfirmacionEliminarActivo"
      :titulo="{
        entidad: 'Plan de Mantenimiento',
        nombreEntidad: planSeleccionado ? planSeleccionado.nombre : '',
      }"
      :mensaje="{ entidad: 'el Plan de Mantenimiento' }"
      @aceptar="handleConfirmacionEliminar"
      @cancelar="cerrarModalCrud"
    />

    <EditarPlanMantenimientoModal
      v-if="isModalEditarActivo"
      @cerrar="cerrarModalCrud"
      @editar="handleCrearOrEditar"
      :planMantenimientoSeleccionado="planSeleccionado"
      :notificacion="notificacion"
    />

    <CrearPlanMantenimientoModal
      v-if="isModalCrearActivo"
      @cerrar="cerrarModalCrud"
      @crear="handleCrearOrEditar"
    />

    <VerDetallePlanMantenimientoModal
      v-if="isModalVerDetalleActivo"
      @cerrar="handleCierreModalVerDetalle"
      :planMantenimientoSeleccionado="planSeleccionado"
      :notificacion="notificacion"
    />

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
  RowNode,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { fetchPlanesMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/fetchPlanesMantenimiento';
import { fetchPlanesMantenimientoDetalle } from '@/pantallas/PlanesMantenimiento/Data/fetchPlanesMantenimientoDetalle';
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
  PlanMantenimiento as PlanMantenimientoType,
  PlanMantenimientoDetalle,
  makePlanesPasosCrear,
  NotificacionPlanMantenimientoDetalle,
} from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { eliminarPlanMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/eliminarPlanMantenimiento';
import CrearPlanMantenimientoModal from '@/pantallas/PlanesMantenimiento/CrearPlanMantenimientoModal.vue';
import EditarPlanMantenimientoModal from '@/pantallas/PlanesMantenimiento/EditarPlanMantenimientoModal.vue';
import VerDetallePlanMantenimientoModal from '@/pantallas/PlanesMantenimiento/VerDetallePlanMantenimientoModal.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { OperacionesCrud } from '../../reusable/Mantenedor/mantenedorUtils';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import moment from 'moment';
import { fetchNotificacionesDetalle } from './Data/fetchNotificaciones';

type PlanMantenimientoRowData = PlanMantenimientoType & {
  checked?: boolean;
};

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
    CrearPlanMantenimientoModal,
    EditarPlanMantenimientoModal,
    VerDetallePlanMantenimientoModal,
    ConfirmacionEliminar,
  },
})
export default class PlanesMantenimiento extends ComponenteBase {
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
  readonly funcionalidad: Funcionalidades = Funcionalidades.PlanDeMantenimiento;

  /* state */
  permisoAccion: PermisoAccion = null;

  /* aggrid */

  gridApi: GridApi = null;
  readonly pasos = makePlanesPasosCrear();
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
        headerName: 'Tipo de Mantenimiento',
        field: 'tipomantenimientotTxt',
      },
      {
        headerName: 'Nro. de Vehículos asociados',
        field: 'cantVehiculos',
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
    if (this.plan.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.tipomantenimientotTxt.toLowerCase().includes(busqueda) ||
        node.data.cantVehiculos.toString().includes(busqueda) ||
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

  plan: PlanMantenimientoType[] = [];
  planSeleccionado: PlanMantenimientoDetalle = null;
  planSeleccionadaGrilla: PlanMantenimientoType;
  notificacion: NotificacionPlanMantenimientoDetalle = null;
  modalCrudActivo: OperacionesCrud = null;
  showEliminarPautaMsj: boolean = false;

  /*Eliminar*/
  mensajeEliminar: any = '';
  titulomostrarAvisoDelete: string = '';
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

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.plan = (await this.fetchPlanes()) || [];
  }

  handleCrearClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  async handleVerDetalleClick(params: ICellRendererParams) {
    this.planSeleccionado =
      (await this.fetchPlanesDetalle(params.data.id)) || null;
    this.notificacion =
      (await this.fetchNotificaciones(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.consultar;
  }

  async handleEditarClick(params: ICellRendererParams) {
    this.planSeleccionado =
      (await this.fetchPlanesDetalle(params.data.id)) || null;

    this.notificacion =
      (await this.fetchNotificaciones(params.data.id)) || null;
    this.modalCrudActivo = OperacionesCrud.editar;
  }

  async handleEliminarClick(params: ICellRendererParams) {
    this.planSeleccionadaGrilla = params.data;
    const self = this;
    this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Plan de Mantenimiento',
      nombreEntidad: self.planSeleccionadaGrilla.nombre,
    });
    const totalAsociados = self.planSeleccionadaGrilla.totalAsociados;
    if (totalAsociados === 0) {
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'el Plan de Mantenimiento',
      });
      this.titulomostrarAvisoDelete =
        'Eliminar Plan de Mantenimiento: ' + self.planSeleccionadaGrilla.nombre;
      this.modalCrudActivo = OperacionesCrud.eliminar;
    } else {
      this.mensajeEliminaIndividual =
        'El Plan de Mantenimiento no se puede eliminar porque tiene registros de mantenimientos asociados.';
      this.dialogErrorAsoc = true;
      this.eliminaIndividual = true;
    }
  }

  handleConfirmacionEliminar(isConfirmado: boolean) {
    this.eliminarPlan(this.planSeleccionadaGrilla).finally(this.recargarPlanes);
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { planSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Plan De Mantenimiento',
    });
  }

  /* tabla */

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

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
    this.recargarPlanes();
  }

  handleCierreModalVerDetalle() {
    this.cerrarModalCrud();
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
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

  async recargarPlanes() {
    this.plan = (await this.fetchPlanes()) || [];
  }

  /* util */

  fetchPlanes() {
    this.loadingService.showLoading();
    return fetchPlanesMantenimiento()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los Planes de Mantenimiento. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchPlanesDetalle(idPlan: number) {
    this.loadingService.showLoading();
    return fetchPlanesMantenimientoDetalle(idPlan)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener el Plan de Mantenimiento. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchNotificaciones(idPlan: number) {
    this.loadingService.showLoading();
    return fetchNotificacionesDetalle(idPlan)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Notificaciones. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarPlan(plan: PlanMantenimientoType) {
    this.loadingService.showLoading();
    return eliminarPlanMantenimiento(plan)
      .then(() =>
        this.$snotify.success(
          `El Plan de Mantenimiento ha sido eliminado de forma exitosa`,
          { timeout: 3000 }
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar el Plan de Mantenimiento: ${plan.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.recargarPlanes();
      });
  }
}
</script>

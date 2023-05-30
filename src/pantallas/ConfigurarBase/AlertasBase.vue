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
          :row-data="alertasBase"
          exported-file-name="Alerta-Base"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <MantenedorGridTodos
      :grid-options="gridOptions"
      :funcionalidadId="funcionalidad"
      @gridOptionsEnriched="enrichedGridOptions = $event"
    />
    <Confirmation
      :show="mostrarConfirmacionEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'Configuración Base',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="noPermiteEliminarConfirm"
      :titulo="'Eliminar Configuración Base'"
      :mensaje="
        'La Configuración Base a eliminar tiene Alertas activas, debe primero desasociar, para eliminar la Configuración Base'
      "
      :mostrarBoton="false"
      v-on:modalConfirmationEmit="noPermiteEliminarConfirm = false"
    ></Confirmation>
    <CrearAlertasBaseModal
      :show="mostrarModalCrear"
      @cerrar="handleCierreModal()"
    />
    <VerAlertaBaseModal
      :show="mostrarModalVer"
      :alertaBaseSeleccionada="alertaBaseSeleccionada"
      @cerrar="handleCierreModal()"
    />
    <EditarAlertaBaseModal
      :show="mostrarModalEditar"
      :alertaBaseSeleccionada="alertaBaseSeleccionada"
      @cerrar="handleCierreModal()"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { AgGridVue } from 'ag-grid-vue';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
  RowNode,
} from 'ag-grid-community';
import {
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import {
  typeConfigBase,
  AlertasBaseBackend,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { fetchAlertasBaseGrid } from '@/pantallas/ConfigurarBase/fetchAlertasBaseGrid';
import { fetchByIdAlertaBase } from '@/pantallas/ConfigurarBase/fetchByIdAlertaBase';
import { eliminarAlertaBase } from '@/pantallas/ConfigurarBase/eliminarAlertaBase';
import { chequearConfiguracionAlerta } from '@/pantallas/ConfigurarBase/chequearConfiguracionAlerta';

import CrearAlertasBaseModal from '@/pantallas/ConfigurarBase/CrearAlertasBaseModal.vue';
import VerAlertaBaseModal from '@/pantallas/ConfigurarBase/VerAlertaBaseModal.vue';
import EditarAlertaBaseModal from '@/pantallas/ConfigurarBase/EditarAlertaBaseModal.vue';
import moment from 'moment';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

@Component({
  components: {
    CabeceraTabla,
    ExportarAgGridButton,
    MantenedorGridTodos,
    AgGridVue,
    CrearButton,
    BuscadorMantenedor,
    Confirmation,
    CrearAlertasBaseModal,
    VerAlertaBaseModal,
    EditarAlertaBaseModal,
  },
})
export default class AlertasBase extends ComponenteBase {
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.AlertasBase;

  /* aggrid */

  gridApi: GridApi = null;

  /*template*/

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre Alerta',
        field: 'nombre',
      },
      creadoPorColumnDefs('usuarioCreadorTxt'),
      {
        ...fechaCreacionColumnDefs('fechaCreacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      modificadoPorColumnDefs('usuarioModificacionTxt'),
      {
        ...fechaModificacionColumnDefs('fechaModificacion'),
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
    ],
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPassConfiguracionBase,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */

  alertasBase: AlertasBaseBackend[] = [];
  alertaBaseSeleccionada: AlertasBaseBackend = {};
  mostrarConfirmacionEliminar: boolean = false;
  noPermiteEliminarConfirm: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalVer: boolean = false;
  mostrarModalEditar: boolean = false;
  esEdicion: boolean = false;
  busquedaGrilla: string = '';

  /*  misc */
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleConfiguracionClick);
    actionsEvent.onEditar(this.handleEditarConfiguracionClick);
    actionsEvent.onEliminar(this.handleEliminarConfiguracionClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassConfiguracionBase(node: RowNode): boolean {
    if (this.alertasBase.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreadorTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacionTxt.toLowerCase().includes(busqueda) ||
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
    this.alertasBase = (await this.fetchAlertasBase()) || [];
    this.gridApi.setRowData(this.alertasBase);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModal() {
    this.mostrarModalCrear = false;
    this.mostrarModalVer = false;
    this.mostrarModalEditar = false;
    this.actualizarGrilla();
  }

  async handleVerDetalleConfiguracionClick(params: ICellRendererParams) {
    this.alertaBaseSeleccionada =
      (await this.fetchByIdAlertaBase(params.data.id)) || {};
    this.mostrarModalVer = true;
  }

  async handleEditarConfiguracionClick(params: ICellRendererParams) {
    this.alertaBaseSeleccionada =
      (await this.fetchByIdAlertaBase(params.data.id)) || {};
    this.mostrarModalEditar = true;
  }

  async handleEliminarConfiguracionClick(params: ICellRendererParams) {
    this.alertaBaseSeleccionada = params.data;

    var relacionConfiguracionAlerta = await this.chequearConfiguracionAlerta();

    if (!relacionConfiguracionAlerta) {
      this.mostrarConfirmacionEliminar = true;
    } else {
      this.noPermiteEliminarConfirm = true;
    }
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;

    if (isConfirmado) {
      this.eliminarAlerta(this.alertaBaseSeleccionada);
    }
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { alertaBaseSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Configuración Base',
      nombreEntidad: alertaBaseSeleccionada
        ? alertaBaseSeleccionada.nombre
        : '',
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

  /* util */

  async fetchAlertasBase() {
    this.loadingService.showLoading();
    return fetchAlertasBaseGrid()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Configuraciones Base',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async fetchByIdAlertaBase(id: number) {
    this.loadingService.showLoading();
    return fetchByIdAlertaBase(id)
      .then(e => {
        return e;
      })
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la Configuración Base',
          { timeout: 3000 }
        );

        return null;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarAlerta(alertaBase: typeConfigBase) {
    this.loadingService.showLoading();
    return eliminarAlertaBase(alertaBase.id)
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar la Configuración Base: ${alertaBase.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.$snotify.success(
          'La Configuración Base ha sido eliminada de forma exitosa',
          {
            timeout: 3000,
          }
        );
        this.loadingService.hideLoading();
        this.actualizarGrilla();
      });
  }

  chequearConfiguracionAlerta() {
    this.loadingService.showLoading();
    return chequearConfiguracionAlerta(this.alertaBaseSeleccionada.id)
      .then(response => {
        return response.data;
      })
      .catch(() =>
        this.$snotify.error('Error al verificar relación contrato - envio')
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async actualizarGrilla() {
    this.alertasBase = (await this.fetchAlertasBase()) || [];
    this.gridApi.setRowData(this.alertasBase);
  }
}
</script>

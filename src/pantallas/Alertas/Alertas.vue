<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12 sm7 md3>
        <v-select
          label="Filtrar Por Todos"
          v-model="tipoAlerta"
          :items="lstAlertasBaseFiltro"
          class="styled-select"
          style="margin-top: 8px;"
          item-text="nombre"
          item-value="id"
          @change="handleTipoAlertaChange"
        ></v-select>
      </v-flex>
      <v-flex xs12 sm5 md3>
        <div align="center">
          <BuscadorMantenedor :filter="handleBusqueda" />
        </div>
      </v-flex>
      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
        <div align="right" style="padding-top:15px">
          <ExportarAgGridButton
            :permisoAccion="accionExportar"
            :column-defs="
              enrichedGridOptions
                ? enrichedGridOptions.columnDefs
                : gridOptions.columnDefs
            "
            :row-data="lstAlertas"
            exported-file-name="Alertas"
          />
        </div>
      </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick" />
        </div>
      </v-flex>
    </v-layout>
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
          entidad: 'la Alerta',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>

    <CrearAlertaModal
      :show="mostrarModalCrear"
      :lstAlertasBase="lstAlertasBase"
      @cerrar="handleCierreModal()"
    />
    <VerAlertaModal
      :show="mostrarModalVer"
      :lstAlertasBase="lstAlertasBase"
      :alertaSeleccionada="alertaSeleccionada"
      @cerrar="handleCierreModal()"
    />
    <EditarAlertaModal
      :show="mostrarModalEditar"
      :lstAlertasBase="lstAlertasBase"
      :alertaSeleccionada="alertaSeleccionada"
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
import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import moment from 'moment';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

import CrearAlertaModal from '@/pantallas/Alertas/CrearAlertaModal.vue';
import VerAlertaModal from '@/pantallas/Alertas/VerAlertaModal.vue';
import EditarAlertaModal from '@/pantallas/Alertas/EditarAlertaModal.vue';

import { fetchAlertas } from '@/pantallas/Alertas/Services/fetchAlertas';
import { fetchAlertasBase } from '@/pantallas/Alertas/Services/fetchAlertasBase';
import { fetchByIdAlerta } from '@/pantallas/Alertas/Services/fetchByIdAlerta';
import { eliminarAlerta } from '@/pantallas/Alertas/Services/eliminarAlerta';

import { AlertaBackend } from '@/interfaces/Alertas';

@Component({
  components: {
    CabeceraTabla,
    ExportarAgGridButton,
    MantenedorGridTodos,
    AgGridVue,
    CrearButton,
    BuscadorMantenedor,
    Confirmation,
    CrearAlertaModal,
    VerAlertaModal,
    EditarAlertaModal,
  },
})
export default class Alertas extends ComponenteBase {
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

  readonly funcionalidad: Funcionalidades = Funcionalidades.Alertas;

  /* aggrid */

  gridApi: GridApi = null;

  /*template*/

  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Cantidad Eventos',
        field: 'eventos',
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
      },
      {
        headerName: 'Color',
        field: 'color',
      },
      {
        headerName: 'Temporalidad',
        field: 'temporalidad',
      },
      {
        headerName: 'Tipo Alerta',
        field: 'alertaTipo',
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
    doesExternalFilterPass: this.doesExternalFilterPassAlertas,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  /* state */
  tipoAlerta: number = 0;
  lstAlertasBase: AlertasBaseBackend[] = [];
  lstAlertasBaseFiltro: AlertasBaseBackend[] = [];
  busquedaGrilla: string = '';

  lstAlertas: AlertaBackend[] = [];
  alertaSeleccionada: AlertaBackend = {};
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalVer: boolean = false;
  mostrarModalEditar: boolean = false;
  esEdicion: boolean = false;

  /*  misc */
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();

    actionsEvent.onVerDetalle(this.handleVerDetalleAlertaClick);
    actionsEvent.onEditar(this.handleEditarAlertaClick);
    actionsEvent.onEliminar(this.handleEliminarAlertaClick);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassAlertas(node: RowNode): boolean {
    if (this.lstAlertas.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.color.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreadorTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacionTxt.toLowerCase().includes(busqueda) ||
        node.data.alertaTipo.toLowerCase().includes(busqueda) ||
        String(node.data.temporalidad)
          .toLowerCase()
          .includes(busqueda) ||
        String(node.data.eventos)
          .toLowerCase()
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

  mounted() {
    this.fetchAlertasBase();
  }

  /* event handlers */

  handleBusqueda(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.lstAlertas = (await this.fetchAlertas()) || [];
    this.gridApi.setRowData(this.lstAlertas);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  async handleCierreModal() {
    this.mostrarModalCrear = false;
    this.mostrarModalVer = false;
    this.mostrarModalEditar = false;
    this.actualizarGrilla();
  }

  async handleVerDetalleAlertaClick(params: ICellRendererParams) {
    this.alertaSeleccionada =
      (await this.fetchByIdAlerta(params.data.id)) || {};
    this.mostrarModalVer = true;
  }

  async handleEditarAlertaClick(params: ICellRendererParams) {
    this.alertaSeleccionada =
      (await this.fetchByIdAlerta(params.data.id)) || {};
    this.mostrarModalEditar = true;
  }

  handleEliminarAlertaClick(params: ICellRendererParams) {
    this.alertaSeleccionada = params.data;
    this.mostrarConfirmacionEliminar = true;
  }

  async handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    if (isConfirmado) {
      this.eliminarAlerta(this.alertaSeleccionada);
    }
  }

  handleTipoAlertaChange(idBase: number) {
    if (idBase != 0) {
      let filtro = this.lstAlertas.filter(a => a.alertaBaseId == idBase);
      this.gridApi.setRowData(filtro);
    } else {
      this.gridApi.setRowData(this.lstAlertas);
    }
  }

  /* template */

  get tituloConfirmacionEliminar() {
    const { alertaSeleccionada } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Alerta',
      nombreEntidad: alertaSeleccionada ? alertaSeleccionada.nombre : '',
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
    return fetchAlertasBase()
      .then(res => {
        this.lstAlertasBase = res;

        this.lstAlertasBaseFiltro.push({
          id: 0,
          nombre: 'Todos',
        });
        res.forEach(a => {
          this.lstAlertasBaseFiltro.push(a);
        });
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de Alerta',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async fetchAlertas() {
    this.loadingService.showLoading();
    return fetchAlertas()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Alertas',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async fetchByIdAlerta(id: number) {
    this.loadingService.showLoading();
    return fetchByIdAlerta(id)
      .then(e => {
        return e;
      })
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la Alerta',
          { timeout: 3000 }
        );

        return null;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  eliminarAlerta(alerta: AlertaBackend) {
    this.loadingService.showLoading();
    return eliminarAlerta(alerta.id)
      .then(() => {
        this.$snotify.success(
          'La Alerta ' + alerta.nombre + ' ha sido eliminada de forma exitosa',
          {
            timeout: 3000,
          }
        );

        this.actualizarGrilla();
      })
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar eliminar la Alerta: ${alerta.nombre}`,
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  async actualizarGrilla() {
    this.lstAlertas = (await this.fetchAlertas()) || [];
    this.handleTipoAlertaChange(this.tipoAlerta);
  }
}
</script>

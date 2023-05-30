<template>
  <div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:izquierda>
        <BuscadorMantenedorSolicitud
          @resultadoBusqueda="handleFormChange"
          @clear="reiniciarGrilla"
          :filter="funcionFiltrar"
        />
      </template>
      <template v-slot:derecha>
        <CrearButton :permisoAccion="accionCrear" @click="handleCrearClick()" />
      </template>
    </CabeceraTabla>
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
    <CrearSolicitudModal
      :show="mostrarModalCrear"
      @cerrar="handleCierreModalCrear"
    />
    <VerSolicitudModal
      :show="mostrarModalVer"
      @cerrar="handleCierreModalVer"
      :solicitudSeleccionada="solicitudSeleccionada"
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
  RowNode,
  GridReadyEvent,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';

import { LoadingService } from '@/services/loadingService';
import moment from 'moment';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import BuscadorMantenedorSolicitud from '@/pantallas/Solicitudes/BuscadorMantenedorSolicitud.vue';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';

import { Solicitud } from '@/pantallas/Solicitudes/Solicitud';
import { fetchSolicitudes } from '@/pantallas/Solicitudes/fetchSolicitudes';

import CrearSolicitudModal from '@/pantallas/Solicitudes/CrearSolicitudModal.vue';
import VerSolicitudModal from '@/pantallas/Solicitudes/VerSolicitudModal.vue';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

type CrearFormState = {
  entity: FiltroFecha;
};

type FiltroFecha = {
  fechaInicio: moment.Moment;
  fechaTermino: moment.Moment;
};

@Component({
  components: {
    BuscadorMantenedorSolicitud,
    CrearButton,
    CabeceraTabla,
    MantenedorGridSinCodigo,
    CrearSolicitudModal,
    VerSolicitudModal,
  },
})
export default class Solicitudes extends ComponenteBase {
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
  readonly acciones: Accion[] = [
    'Crear - Información General',
    'Ver Detalle - Información General',
    'Consultar',
  ];

  readonly funcionalidad: Funcionalidades = Funcionalidades.Solicitudes;

  /* state */

  lstSolicitudes: Solicitud[] = [];
  solicitudSeleccionada: Solicitud = null;
  listaFiltrada: Solicitud[] = [];
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalVer: boolean = false;

  form: CrearFormState = {
    entity: null,
  };
  fechaInicio: any = '';
  fechaFin: any = '';

  /* aggrid */

  gridApi: GridApi = null;
  busquedaGrilla: string = '';

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nro. de Caso',
        field: 'numeroResolucion',
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacion',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
      },
      {
        headerName: 'Categoría',
        field: 'categoria',
      },
      {
        headerName: 'Subcategoría',
        field: 'subcategoria',
      },
      {
        headerName: 'Título',
        field: 'titulo',
      },
      {
        headerName: 'Estado',
        field: 'estado',
      },
    ],
    onGridReady: this.handleGridReady,
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
    if (this.lstSolicitudes.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.numeroResolucion.toLowerCase().includes(busqueda) ||
        moment(node.data.fechaCreacion)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        node.data.categoria.toLowerCase().includes(busqueda) ||
        node.data.subcategoria.toLowerCase().includes(busqueda) ||
        node.data.titulo.toLowerCase().includes(busqueda) ||
        node.data.estado.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
  }

  /* util */

  mounted() {
    this.buscarSolicitudes('', '');
  }

  fetchSolicitudes(ini: string, fin: string) {
    this.loadingService.showLoading();
    return fetchSolicitudes(ini, fin)
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las Solicitudes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async filtrarSolicitudes(ini: string, fin: string) {
    this.lstSolicitudes = (await this.fetchSolicitudes(ini, fin)) || [];
    this.listaFiltrada = this.lstSolicitudes;
    this.gridApi.setRowData(this.listaFiltrada);
  }

  async buscarSolicitudes(ini: string, fin: string) {
    this.lstSolicitudes = (await this.fetchSolicitudes(ini, fin)) || [];
    this.gridApi.setRowData(this.lstSolicitudes);
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

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.buscarSolicitudes(this.fechaInicio, this.fechaFin);
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModalCrear() {
    this.mostrarModalCrear = false;
    this.buscarSolicitudes(this.fechaInicio, this.fechaFin);
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.solicitudSeleccionada = params.data;
    this.mostrarModalVer = true;
  }

  handleCierreModalVer() {
    this.mostrarModalVer = false;
  }

  async handleFormChange(filtros: any) {
    this.fechaInicio = moment(filtros.fechaInicio.value).format('L');

    this.fechaFin = moment(filtros.fechaTermino.value)
      .add(1, 'days')
      .format('L');

    this.filtrarSolicitudes(this.fechaInicio, this.fechaFin);
  }

  reiniciarGrilla() {
    this.buscarSolicitudes('', '');
  }
}
</script>
<style scoped>
.pt {
  padding-top: 18px !important;
}
</style>

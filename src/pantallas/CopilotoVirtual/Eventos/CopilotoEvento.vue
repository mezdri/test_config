<template>
  <div>
    <template>
      <v-container fluid grid-list-md>
        <v-layout>
          <v-flex xs12 sm6 md2>
            <v-autocomplete
              :items="lsEventoTipo"
              v-model="filtroGrillaEvento"
              label="Eventos"
              item-value="id"
              item-text="nombre"
              :error-messages="errors.collect('eventos')"
              no-data-text="Sin resultados"
              autocomplete
            ></v-autocomplete>
          </v-flex>

          <v-flex xs12 sm6 md2>
            <v-menu
              :close-on-content-click="false"
              v-model="menuDatePickerFechaD"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <v-text-field
                slot="activator"
                v-model="computedDateFormattedFechaD"
                label="Fecha Desde"
                persistent-hint
                prepend-icon="event"
                v-validate="''"
                :error-messages="errors.collect('fechaDesde')"
                data-vv-name="fechaDesde"
                readonly
              ></v-text-field>
              <v-date-picker
                v-model="filtroGrillaFechaD"
                first-day-of-week="1"
                locale="es-cl"
                scrollable
                :max="maxDate"
                :key="keyDatePickers"
                @input="menuDatePickerFechaD = false"
              ></v-date-picker>
            </v-menu>
          </v-flex>
          <v-flex xs12 sm6 md2>
            <v-menu
              :close-on-content-click="false"
              v-model="menuDatePickerFechaH"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <v-text-field
                slot="activator"
                v-model="computedDateFormattedFechaH"
                label="Fecha Hasta"
                persistent-hint
                prepend-icon="event"
                v-validate="''"
                :error-messages="errors.collect('fechaHasta')"
                data-vv-name="fechaHasta"
                readonly
              ></v-text-field>
              <v-date-picker
                v-model="filtroGrillaFechaH"
                first-day-of-week="1"
                locale="es-cl"
                scrollable
                :min="minDate"
                :key="keyDatePickers"
                @input="menuDatePickerFechaH = false"
              ></v-date-picker>
            </v-menu>
          </v-flex>
          <v-flex xs12 sm6 md2>
            <div align="left">
              <v-text-field
                v-model="search"
                label="Buscar..."
                single-line
                hide-details
              ></v-text-field>
            </div>
          </v-flex>
          <v-flex xs12 sm6 md1>
            <div class="text-xs-center">
              <v-btn flat icon small @click="getDataFilter">
                <v-icon>search</v-icon>
              </v-btn>
              <v-btn
                flat
                icon
                small
                :disabled="btnDisabled"
                @click="clearFilters"
              >
                <v-icon>clear</v-icon>
              </v-btn>
            </div>
          </v-flex>
          <v-flex xs12 sm6 md1>
            <ExportarAgGridButton
              :permisoAccion="accionExportar"
              :column-defs="columnDefs"
              :row-data="eventos"
              exported-file-name="EventosCopiloto"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </template>

    <MantenedorGridTodos :grid-options="gridOptions" :funcionalidad-id="0" />

    <!-- Modal -->
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  GetQuickFilterTextParams,
  ColDef,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';

import {
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
import { OperacionesCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { fetchTipoEvento } from '@/pantallas/CopilotoVirtual/Eventos/fetchFiltros';
import { fetchEventos } from '@/pantallas/CopilotoVirtual/Eventos/fetchEventos';
import { evento } from '@/pantallas/CopilotoVirtual/Eventos/evento';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import moment from 'moment';
import { EventoTipo } from './tipoEvento';
import { string } from 'yup';

@Component({
  components: {
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    MantenedorGridTodos,
  },
})
export default class CopilotoEvento extends ComponenteBase {
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

    this.accionExportar,
  ];

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Eventos;

  axios: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  /* aggrid */

  gridApi: GridApi = null;

  /* template */
  enrichedGridOptions: GridOptions = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Conductor',
        field: 'conductorNombre',
      },
      {
        headerName: 'Evento',
        field: 'eventoNombre',
      },
      {
        headerName: 'Título',
        field: 'tituloMensaje',
      },
      {
        headerName: 'Mensaje',
        field: 'mensaje',
      },
      {
        headerName: 'Zona',
        field: 'coordenadaNombre',
      },
      {
        headerName: 'Ruta',
        field: 'rutaNombre',
      },
      {
        headerName: 'Vehículo',
        field: 'patente',
      },
      {
        headerName: 'Latitud',
        field: 'latitud',
      },
      {
        headerName: 'Longitud',
        field: 'longitud',
      },
      {
        headerName: 'link Mapa',
        field: 'linkMapa',
      },
      {
        headerName: 'Velocidad',
        field: 'velocidadActual',
      },
      {
        headerName: 'Fecha',
        field: 'fechaTxt',
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
    doesExternalFilterPass: this.doesExternalFilterPassMensaje,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  columnDefs: Array<ColDef> = [
    {
      headerName: 'Conductor',
      field: 'conductorNombre',
    },
    {
      headerName: 'Evento',
      field: 'eventoNombre',
    },
    {
      headerName: 'Título',
      field: 'tituloMensaje',
    },
    {
      headerName: 'Mensaje',
      field: 'mensaje',
    },
    {
      headerName: 'Zona',
      field: 'coordenadaNombre',
    },
    {
      headerName: 'Ruta',
      field: 'rutaNombre',
    },
    {
      headerName: 'Vehículo',
      field: 'patente',
    },
    {
      headerName: 'Latitud',
      field: 'latitud',
    },
    {
      headerName: 'Longitud',
      field: 'longitud',
    },
    {
      headerName: 'link Mapa',
      field: 'linkMapa',
    },
    {
      headerName: 'Velocidad',
      field: 'velocidadActual',
    },
    {
      headerName: 'Fecha',
      field: 'fechaTxt',
    },
  ];

  /* state */

  eventos: evento[] = [];

  lsEventoTipo: EventoTipo[] = [];

  EventoTipoSeleccionado: EventoTipo = null;
  search: string = '';
  btnDisabled: boolean = false;
  busquedaGrilla: string = '';
  limpiarGrilla: boolean = true;
  filtroGrillaEvento: any = null;
  filtroGrillaFechaD = moment(new Date())
    .add(-7, 'days')
    .toISOString()
    .substr(0, 10);
  filtroGrillaFechaH: any = new Date().toISOString().substr(0, 10);

  menuDatePickerFechaD: boolean = false;
  menuDatePickerFechaH: boolean = false;
  keyDatePickers: number = 0;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }
  async created() {
    this.keyDatePickers += 1;
    this.getTipoEvento();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPassMensaje(node: RowNode): boolean {
    if (this.eventos.length > 0 && this.busquedaGrilla.length > 1) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.id.toLowerCase().includes(busqueda) ||
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
    this.eventos = (await this.fetchEvent()) || [];
    this.gridApi.setRowData(this.eventos || []);
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

  fetchEvent() {
    this.loadingService.showLoading();
    return fetchEventos()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los mensajes',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async getTipoEvento() {
    this.lsEventoTipo = (await this.fetchTipoEvento()) || [];
  }

  fetchTipoEvento() {
    this.loadingService.showLoading();
    return fetchTipoEvento()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de eventos',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  get computedDateFormattedFechaD() {
    return this.formatDate(this.filtroGrillaFechaD);
  }

  get computedDateFormattedFechaH() {
    return this.formatDate(this.filtroGrillaFechaH);
  }

  formatDate(fecha: String): string {
    if (!fecha) return null;
    const [year, month, day] = fecha.toString().split('-');
    return `${day}/${month}/${year}`;
  }

  get minDate() {
    return this.filtroGrillaFechaD;
  }

  get maxDate() {
    return this.filtroGrillaFechaH;
  }
  async clearFilters() {
    this.btnDisabled = true;
    this.search = '';
    this.filtroGrillaEvento = null;

    this.filtroGrillaFechaD = moment(new Date())
      .add(-7, 'days')
      .toISOString()
      .substr(0, 10);
    this.filtroGrillaFechaH = new Date().toISOString().substr(0, 10);
    this.menuDatePickerFechaD = false;
    this.menuDatePickerFechaH = false;
    this.limpiarGrilla = true;
    this.gridApi.showNoRowsOverlay();

    this.eventos = (await this.fetchEvent()) || [];
    this.gridApi.setRowData(this.eventos || []);
    setTimeout(() => {
      this.btnDisabled = false;
    }, 3000);
  }

  async getDataFilter() {
    if (this.filtroGrillaEvento == null) {
      this.filtroGrillaEvento = 0;
    }
    if (this.search.length == 0) {
      this.search = '-1';
    }

    const loadingKey = 'getEventos';
    try {
      const response = await this.axios.http.get(
        `EventoCopiloto/${this.filtroGrillaEvento}/${this.filtroGrillaFechaD}/${this.filtroGrillaFechaH}/${this.search}/getEventosFiltros`
      );
      this.eventos = response.data;
      this.gridApi.setRowData(this.eventos || []);
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener lista de Eventos');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener lista de Eventos');
      }
    } finally {
      this.loadingService.hideLoading(loadingKey);
      this.search = '';
    }
  }
}
</script>

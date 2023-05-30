<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12 sm12 md12>
        <v-card>
          <v-card-title
            primary-title
            style="padding-top: 1px;padding-bottom: 1px;"
          >
            <v-text-field
              style="height: 50px;"
              @input="onFilterTextBoxChanged"
              v-model="search"
              append-icon="search"
              label="Buscar..."
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>

          <v-card-text class="grilla">
            <grid
              data-testid="test__unidad"
              style="width: 100%; height: 400px;font-family: 'Asap', sans-serif;"
              class="ag-theme-material"
              :gridOptions="gridOptions"
              :getRowNodeId="getRowNodeId"
              :rowData="vehiculos"
              :animateRows="false"
              :deltaRowDataMode="true"
              suppressCopyRowsToClipboard="true"
              :funcionalidad-id="funcionalidad"
            ></grid>
          </v-card-text>
          <v-card-text style="padding: 10px; text-align: right;">
            <span style="font-size:13px; padding-right: 10px;"
              >Mostrando {{ cantidadVehiculos }} vehículos</span
            >
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { differenceBy } from 'lodash';
import store from '@/store';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import MenuItem from '@/components/MenuItem.vue';
import { ParametroSistemaVm } from '@/interfaces/parametroSistema';
import {
  filtroHomeEventBus,
  filtroHomeEvents,
  repetirDiaEventBus,
  repetirDiaEvents,
} from '@/setup';
import RepetirDiaEventBus from '@/pantallas/Inicio/RepetirDiaData/RepetirDiaEventBus';
import CortaCorrienteEventBus from '@/pantallas/Inicio/CortaCorrienteData/CortaCorrienteEventBus';
import { Component } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEnvioGps, HomeFiltros } from '@/config/enums';
import MarcadorEventBus from '@/eventBus/marcadorEventBus';
import HomeGridDetalleEventBus from '@/eventBus/homeGridDetalleEventBus';
import ZonaEventBus from '@/eventBus/zonaEventBus';
import { Funcionalidades } from '@/config/funcionalidades';
import { LoadingService } from '@/services/loadingService';
import moment, { Duration } from 'moment';
import { VehiculoHomeGrid } from '@/services/homeGrid';
import {
  GridOptions,
  GridApi,
  ColDef,
  Column,
  GridReadyEvent,
  CellClickedEvent,
  RowNode,
  ColumnApi,
} from 'ag-grid-community';
import Grid from '@/reusable/Grid/Grid.vue';
import {
  fetchListaVehiculos,
  Vehiculo,
} from '@/pantallas/Sugal/fetchListaVehiculos';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import VehiculoMarker from '@/pantallas/Inicio/Mapa/VehiculoMarker';
import ActividadesEventBus from '../../../eventBus/actividadesEventBus';
import ActividadEventBus from '../ActividadesData/ActividadEventBus';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  Actividad,
  fetchActividades,
  FetchCanceler,
} from '../ActividadesData/fetchActividades';
import { AgGridUtil } from '../../../agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '../../../interfaces/EstadoGrillaVm';

const defaultIntervaloActualizar = moment.duration('00:01:00');

@Component({
  components: {
    'app-menu-item': MenuItem,
    grid: Grid,
  },
})
export default class VehiculosGrid extends ComponenteBase {
  // campos ComponenteBase
  readonly funcionalidad: Funcionalidades = Funcionalidades.HomeSugal;
  //Declarar todas las Acciones Mantenedores
  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: store.state.userId,
      funcionalidades: this.funcionalidad,
    };
  }

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
  accionCortaCorriente: PermisoAccion = {
    accionCodigo: 7,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionCortaCorriente,
  ];
  readonly acciones: string[] = [
    'Repetir día',
    'Indicadores',
    'Corte de segunda ignición',
  ];
  snotify: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  columnDefs: Array<ColDef> = [
    {
      headerName: 'Unidad',
      field: 'unidad',
      width: 105,
      minWidth: 60,
      hide: undefined,
      cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
      headerName: 'Últ. Transmisión',
      field: 'fechaUltimaActividad',
      colId: 'fechaUltimaActividad',
      width: 155,
      hide: undefined,
      valueFormatter: this.createFechaIcon,
    },
    {
      headerName: 'Estado',
      field: 'estado',
      width: 105,
      minWidth: 50,
      hide: undefined,
      cellRenderer: (r: any) => {
        if (r.data.estado.id == 1) return 'Activo';
        else return 'Inactivo';
      },
    },
    {
      headerName: 'Código Vehículo',
      field: 'id',
      width: 100,
      minWidth: 100,
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'VIN',
      field: 'vin',
    },
    {
      headerName: 'Patente',
      field: 'patente',
    },
    {
      headerName: 'Referencia',
      field: 'referencia',
    },
    {
      headerName: 'Tipo Vehículo',
      field: 'tipoVehiculo',
    },
    {
      headerName: 'Tipo Peaje',
      field: 'tipoPeaje',
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
    },
    {
      headerName: 'Año',
      field: 'ano',
    },
    {
      headerName: 'Tipo Combustible',
      field: 'tipoCombustible',
    },
    {
      headerName: 'Tipo Transmisión',
      field: 'tipoTransmision',
    },

    {
      headerName: 'Nro. Motor',
      field: 'numeroMotor',
    },
    {
      headerName: 'Flota',
      field: 'flota',
    },
    {
      headerName: 'IMEI',
      field: 'imei',
    },
    {
      headerName: 'Marca GPS',
      field: 'marcaGps',
    },
    {
      headerName: 'Modelo GPS',
      field: 'modeloGps',
    },
    {
      headerName: 'Nro. Serie',
      field: 'numeroSerie',
    },
    {
      headerName: 'Tipo SIM',
      field: 'tipoSim',
    },
    {
      headerName: 'Cía. Telecomunicaciones',
      field: 'ciaTelecomunicaciones',
    },
    {
      headerName: 'Nro. SIM',
      field: 'numeroSim',
    },
    {
      headerName: 'Conductor',
      field: 'nombreConductor',
    },
    {
      headerName: 'Etiquetas',
      field: 'etiquetas',
    },
    {
      field: 'fechaUltimaActividadTxt',
      filter: false,
      suppressToolPanel: true,
    },
  ];
  gridOptions: GridOptions = {
    suppressCellSelection: true,
    processCellForClipboard: this.procesarFecha,
    onGridReady: this.onGridReady,
    columnDefs: this.columnDefs,
    isExternalFilterPresent: () => true,
    doesExternalFilterPass: () => true,
    onSortChanged: this.handleSortChange,
    onCellClicked: this.onCellClicked,
    deltaRowDataMode: true,
    overlayLoadingTemplate:
      '<span class="ag-overlay-loading-center">Por favor espere...</span>',
  };
  loadingService = new LoadingService();
  search: string = null;
  axiosParams: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  permisoRepetirDia: boolean = false;
  intervaloActualizarDatos: moment.Duration = defaultIntervaloActualizar;
  actualizarDatosTimeoutId: number = null;
  verDetalleAbierto: boolean = false;
  vehiculos: Vehiculo[] = [];
  lastSortModel: { colId?: string; sort?: string } = {};
  permisoCortaCorriente: boolean = false;
  cortaCorrienteController: string = 'CortaCorriente';
  ultimoSelec: any = [];
  cancelFetchActividades: FetchCanceler;
  cantidadVehiculos: number = 0;
  vehiculoSeleccionado: Vehiculo = null;

  procesarFecha({ column, value }: { column: Column; value: Date }) {
    if (column.getColDef().field !== 'fechaUltimaActividad') {
      return value;
    }

    const fecha = moment(value, 'YYYY-MM-DDTHH:mm:ss');
    if (fecha.get('year') !== 1900) {
      return fecha.format('DD/MM/YYYY HH:mm:ss');
    } else {
      return '';
    }
  }

  async onCambiarFiltro() {
    await this.recargarHome();
    this.cargarParametrosSistema();
    //Fix - [UAT - 022] Home - Filtro de Vehículo (Que no muestre cargando en filtro Vehiculo)
    if (filtroHomeEventBus.filtro !== HomeFiltros.Vehículo) {
      this.loadingService.showLoading();
    }
    await this.cargarVehiculos();

    if (filtroHomeEventBus.filtro === HomeFiltros.Vehículo) {
      this.search = null;
      this.gridApi.setQuickFilter('');
    }

    if (this.search) {
      this.onFilterTextBoxChanged();
    }

    this.cerrarCortaCorriente();
    store.commit('setRepetirDiaAbierto', false);

    this.obtenerPrimerVehiculo();
    this.loadingService.hideLoading();
  }

  recargarHome() {
    //[Entrega3 - B501] Home - Filtro de Vehículo
    //this.loadingService.showLoading();
    if (!this.gridApi) {
      window.location.href = window.location.origin;
    }
  }

  created() {
    this.permisoRepetirDia = this.chequearPermiso('Repetir día');

    filtroHomeEventBus.$on(
      filtroHomeEvents.cambiarFiltro,
      this.onCambiarFiltro
    );

    filtroHomeEventBus.$on('borrarGrillaVehiculo', () => {
      this.loadingService.showLoading();
      this.search = null;
      const grid: any[] = [];
      this.gridApi.forEachNode(node => {
        grid.push(node.data);
      });
      this.gridApi.updateRowData({ remove: grid });
      this.onFilterTextBoxChanged();
    });

    MarcadorEventBus.$on('marcadorEventBus', (patente: string) => {
      this.gridOptions.api.forEachNode(node => {
        if (node.data.patente === patente) {
          node.setSelected(true);
          this.gridApi.ensureNodeVisible(node);
        }
      });
    });

    repetirDiaEventBus.$on(
      repetirDiaEvents.cerrar,
      this.handleCierreRepetirDia
    );
    ZonaEventBus.$on('crearZona-abrir', this.clearActualizarDatosTimeout);
    ZonaEventBus.$on('crearZona-cerrar', this.setTimeoutActualizarDatos);

    ZonaEventBus.$on('controlDibujo-abrir', this.clearActualizarDatosTimeout);
    ZonaEventBus.$on('controlDibujo-cerrar', this.setTimeoutActualizarDatos);

    vehiculoEventBus.onSeleccionar(this.handleSeleccionVehiculo);
    vehiculoEventBus.onSeleccionarVehiculoMarker(
      this.handleSeleccionVehiculoMarker
    );

    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleVerDetalleVehiculo);
  }

  private handleVerDetalleVehiculo(
    vehiculo: Vehiculo,
    actividades: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    /*if (!show) {
      if (!this.isRepetirDiaAbierto()) {
        // this.gridApi.getRowNode(this.vehiculoSeleccionado.id.toString()).;
        // this.seleccionarVehiculo(this.vehiculoSeleccionado);
      }
    } else {
    }*/
    this.setVerDetalleAbierto(show);
  }

  private handleCierreRepetirDia() {
    const { data: vehiculo } = this.gridApi.getSelectedRows()[0];
    vehiculoEventBus.seleccionar(vehiculo);
  }

  private handleSeleccionVehiculo(vehiculo: Vehiculo) {
    this.seleccionarVehiculo(vehiculo.id);
    this.vehiculoSeleccionado = vehiculo;
  }

  private handleSeleccionVehiculoMarker(marker: VehiculoMarker) {
    const selectedRow = this.seleccionarVehiculo(marker.smVehiculo.id);
    this.gridApi.ensureNodeVisible(selectedRow);
  }

  private isVerDetalleAbierto() {
    return this.verDetalleAbierto;
  }

  private isRepetirDiaAbierto() {
    return this.$store.getters.getRepetirDiaAbierto.repetirDiaAbierto;
  }

  private isCortaCorrienteAbierto() {
    return this.$store.getters.getcortaCorrienteAbierto.cortaCorrienteAbierto;
  }

  private isCortaCorrienteAbiertoAux() {
    return this.$store.getters.getcortaCorrienteAbiertoAux
      .cortaCorrienteAbiertoAux;
  }

  private handleCierreVerDetalle() {
    const loadingKey = 'handleCierreVerDetalle';
    this.loadingService.showLoading(undefined, loadingKey);

    if (this.isRepetirDiaAbierto()) {
      setTimeout(() => {
        this.loadingService.hideLoading(loadingKey);
      }, 3000);
      return;
    }

    //Fix - [Entrega3 - B547] Home - Modal Corta Corriente
    if (this.isCortaCorrienteAbierto() || this.isCortaCorrienteAbiertoAux()) {
      this.openCortaCorriente(this.ultimoSelec);
    }
    //---

    this.actualizarVehiculos();
    this.setTimeoutActualizarDatos();

    setTimeout(() => {
      this.loadingService.hideLoading(loadingKey);
    }, 3000);
  }

  private seleccionarVehiculo(idVehiculo: number) {
    store.commit('setRepetirDiaAbierto', false);
    let selectedRow: RowNode;
    this.gridApi.forEachNode(node => {
      if (node.data.id !== idVehiculo) {
        return;
      }
      selectedRow = node;
      node.setSelected(true);
    });

    return selectedRow;
  }

  private setVerDetalleAbierto(verDetalleAbierto: boolean) {
    this.verDetalleAbierto = verDetalleAbierto;
    (verDetalleAbierto
      ? this.clearActualizarDatosTimeout
      : this.handleCierreVerDetalle
    ).call(this);
  }

  private fetchParametrosSistema() {
    const http = this.axiosParams.http;
    const controller = 'ParametroSistema';
    const clienteId: number = config.getClienteSesion();

    return Promise.all([
      http.get<ParametroSistemaVm>(`${controller}/sistema`),
      http.get<ParametroSistemaVm>(`${controller}/${clienteId}/cliente`),
    ]).catch(() => {
      this.snotify.warning(
        'Ha ocurrido un error al intentar obtener parámetros de sistema. Usando valores por omisión.',
        { timeout: 3000 }
      );

      const parametrosOmision = {
        data: {
          refrescarVisualizacionMapaConfigurableCliente: true,
          refrescoVisualizacionMapaSegundos: '00:01:00',
        },
      };
      return [parametrosOmision, parametrosOmision];
    });
  }

  private async cargarParametrosSistema() {
    const [
      { data: sistema },
      { data: cliente },
    ] = await this.fetchParametrosSistema();
    const intervaloConfigurado = VehiculosGrid.stringToMomentDuration(
      sistema.refrescarVisualizacionMapaConfigurableCliente
        ? cliente.refrescoVisualizacionMapaSegundos
        : sistema.refrescoVisualizacionMapaSegundos
    );
    this.intervaloActualizarDatos =
      intervaloConfigurado || defaultIntervaloActualizar;
  }

  async mounted() {
    store.subscribe(mutation => {
      if (mutation.type === 'setPermisoRepetirDia') {
        this.permisoRepetirDia = store.getters.getPermisoRepetirDia;
      }
    });

    store.subscribe(mutation => {
      if (mutation.type !== 'setRepetirDiaAbierto') {
        return;
      }
      if (!this.isRepetirDiaAbierto()) {
        this.onFilterTextBoxChanged();
      }
    });
    this.permisoCortaCorriente = this.accionCortaCorriente.visible;
    this.cargarParametrosSistema();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );
    this.cargarVehiculos().then();
  }

  private setTimeoutActualizarDatos() {
    if (this.isVerDetalleAbierto() || this.isRepetirDiaAbierto()) {
      /*
      Mientras pantalla ver detalle se encuentre activa el mapa nunca debería
      actualizar.
       */
      return;
    }

    // Asegurar solo un timeout de actualización de datos se encuentre activo
    clearTimeout(this.actualizarDatosTimeoutId);
    this.actualizarDatosTimeoutId = window.setTimeout(
      this.actualizarVehiculos,
      this.intervaloActualizarDatos.asMilliseconds()
    );
  }

  fetchVehiculos() {
    return fetchListaVehiculos()
      .catch(() =>
        this.snotify.error(
          'Ha ocurrido un error al intentar obtener vehículos asociados a la flota.',
          { timeout: 3000 }
        )
      )
      .finally(() => this.setTimeoutActualizarDatos());
  }

  async cargarVehiculos() {
    this.gridApi.showLoadingOverlay();
    this.gridApi.resetQuickFilter();
    const vehiculos = await this.fetchVehiculos();
    this.vehiculos = vehiculos;
    this.cantidadVehiculos = vehiculos.length;
    this.establecerVehiculosUi(vehiculos);
    this.gridApi.setSortModel([
      {
        colId: 'fechaUltimaActividad',
        sort: 'desc',
      },
    ]);

    return vehiculos;
  }

  async actualizarVehiculos() {
    const vehiculosActuales = await this.fetchVehiculos();

    /*
    TODO Revisar posible redundancia entre:
    - `this.gridApi.setRowData(vehiculosActuales)`
    - `this.vehiculos = vehiculosActuales`
    
    Deberían tener el mismo efecto.
    */
    //this.gridApi.setRowData(vehiculosActuales);
    const vehiculosAnteriores = this.vehiculos;
    const vehiculosEliminados = differenceBy(
      vehiculosAnteriores,
      vehiculosActuales,
      (x: Vehiculo) => (x ? x.id : undefined)
    );
    this.vehiculos = vehiculosActuales;

    if (this.search) {
      this.onFilterTextBoxChanged();
      return;
    }

    this.gridApi.forEachNode(node => {
      if (node.isSelected()) {
        this.gridApi.ensureNodeVisible(node);
      }
    });

    if (this.vehiculoSeleccionado) {
      const vehiculoActual = vehiculosActuales.find(
        (x: Vehiculo) => x.id === this.vehiculoSeleccionado.id
      );
      vehiculoEventBus.actualizarVehiculoSeleccionado(vehiculoActual);
    }

    vehiculoEventBus.actualizarVehiculos(vehiculosActuales);
    VehiculosGrid.establecerHomeTabsContador(this.vehiculos);

    //Fix - [Entrega3 - B527] Ver detalle / Home - Modal Corta Corriente
    //if (this.isCortaCorrienteAbierto() || this.isCortaCorrienteAbiertoAux()) {
    //  this.openCortaCorriente(this.ultimoSelec);
    //}
    //---

    ActividadEventBus.actualizarActividad();
  }

  getRowNodeId(vehiculos: Vehiculo) {
    if (!vehiculos) {
      return;
    }
    return vehiculos.id;
  }

  private static establecerHomeTabsContador(vehiculos: Vehiculo[]) {
    const addOne = (x: number) => x + 1;

    const cantidadTransmitiendo = vehiculos
      .filter(x => x.ultimaActividad.transmitiendo)
      .reduce(addOne, 0);
    const cantidadDesconectado = vehiculos
      .filter(x => !x.ultimaActividad.transmitiendo)
      .reduce(addOne, 0);

    store.commit('setCantidadVehiculosHome', {
      transmitiendo: cantidadTransmitiendo,
      sintransmitir: cantidadDesconectado,
    });
  }

  private establecerVehiculosUi(vehiculos: Vehiculo[]) {
    VehiculosGrid.establecerHomeTabsContador(vehiculos);
    if (!this.isVerDetalleAbierto() && !this.isRepetirDiaAbierto()) {
      vehiculoEventBus.cargarFlotaVehiculos(vehiculos);
    }
  }

  obtenerPrimerVehiculo() {
    let primerVehiculo;
    let esPrimerCiclo = true;
    this.gridApi.forEachNodeAfterFilterAndSort(rowNode => {
      if (esPrimerCiclo) {
        primerVehiculo = rowNode.data;
        esPrimerCiclo = false;
      }
    });

    if (primerVehiculo !== undefined) {
      filtroHomeEventBus.$emit('centrarMapaCambioFlota', primerVehiculo);
    }

    this.loadingService.hideLoading();
  }

  onCellClicked(event: CellClickedEvent) {
    // var d = new Date();
    //  console.log('Entra en onCellClicked',d.getHours(),':',d.getUTCMinutes(),':',d.getUTCSeconds())

    const vehiculo = event.data;

    if (event.colDef.colId == 'cortaCteID') {
      this.openCortaCorriente(vehiculo);

      ActividadesEventBus.$emit('idDirecto', event.data);
      if (this.isRepetirDiaAbierto()) {
        RepetirDiaEventBus.abrirRepetirDiaHome(null);
      }
      //vehiculoEventBus.seleccionar(vehiculo);
      return;
    }

    vehiculoEventBus.seleccionar(vehiculo);
    store.commit('setActividadSeleccionada', null);

    if (event.colDef.field === 'repetirDia') {
      store.commit('setRepetirDiaAbierto', true);
      // vehiculoEventBus.seleccionar(vehiculo);
      store.commit('setCortaCorrienteAbierto', false);
      this.cerrarCortaCorriente();
      /*
      Ignorar selección de vehículo si se clickea en columna botón abrir modal
      "repetir día"
       */
      // TODO 2 eventos, centralizar apertura de repetir día en uno

      this.openRepetirDia(vehiculo);
      RepetirDiaEventBus.abrirRepetirDiaHome(vehiculo);
      return;
    }

    if (this.isCortaCorrienteAbierto()) {
      this.cerrarCortaCorriente();
    }
    store.commit('setRepetirDiaAbierto', false);
    this.setTimeoutActualizarDatos();

    //  var dd = new Date();
    //  console.log('Sale en onCellClicked',dd.getHours(),':',dd.getUTCMinutes(),':',dd.getUTCSeconds())
  }

  handleSortChange() {
    if (this.gridApi.getSortModel().length === 0) {
      const { lastSortModel = {} } = this;
      const nextSortDirection =
        lastSortModel.sort === 'desc' ? 'asc' : lastSortModel.sort;
      const defaultSortedColumn = 'fechaUltimaActividad';
      this.gridApi.setSortModel([
        {
          colId: defaultSortedColumn,
          sort:
            lastSortModel.colId === defaultSortedColumn
              ? nextSortDirection
              : 'desc',
        },
      ]);
    }
    this.lastSortModel = this.gridApi.getSortModel()[0];
  }

  onFilterTextBoxChanged() {
    /*
    El filtro de vehículos solo debería ser aplicado si el texto ingresado es
    superior a 1, de otro modo restablecerlo para cubrir casos en que se borra
    un filtro y el largo se convierte en 0 o 1.
    */
    if (this.search === null) this.search = '';
    this.gridApi.setQuickFilter(this.search.length > 1 ? this.search : '');

    const vehiculosFiltrados: Vehiculo[] = [];
    const filasFiltradas: RowNode[] = [];
    this.gridApi.forEachNodeAfterFilter(rowNode => {
      vehiculosFiltrados.push(rowNode.data);
      filasFiltradas.push(rowNode);
    });

    const filaSeleccionada = filasFiltradas.find(x => x.isSelected());
    if (filaSeleccionada) {
      this.gridApi.ensureNodeVisible(filaSeleccionada);
    }

    if (vehiculosFiltrados.length === 0) {
      this.gridApi.showNoRowsOverlay();
      this.clearActualizarDatosTimeout();
    } else {
      this.gridApi.hideOverlay();
      this.setTimeoutActualizarDatos();
    }

    this.cantidadVehiculos = vehiculosFiltrados.length;

    this.establecerVehiculosUi(vehiculosFiltrados);
  }

  private static stringToMomentDuration(valor: string): Duration {
    const regexHoras: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;

    if (regexHoras.test(valor)) {
      return moment.duration(moment(valor, 'HH:mm:ss').format('HH:mm:ss'));
    }

    return moment.duration(moment(valor, 'DD.HH:mm:ss').format('DD.HH:mm:ss'));
  }

  createIconRD({ data: vehiculo }: { data: Vehiculo }) {
    const eSpan = document.createElement('i');
    eSpan.className = 'material-icons';
    eSpan.id = vehiculo.id.toString();
    if (!vehiculo.ultimaActividad.transmitiendo) {
      eSpan.innerHTML = 'signal_wifi_off';
      eSpan.title = 'Fuera de Línea';
      eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
    } else {
      eSpan.innerHTML = 'signal_wifi_4_bar';
      eSpan.title = 'En Línea';
      eSpan.style.cssText = 'cursor:pointer;color:#6eb812;font-size: 18px;';
    }
    return eSpan;
  }

  createFechaIcon({ data: vehiculo }: { data: Vehiculo }) {
    if (vehiculo === undefined) {
      return;
    }
    const fecha = moment(vehiculo.fechaUltimaActividad, 'YYYY-MM-DDTHH:mm:ss');
    if (fecha.get('year') !== 1900) {
      return fecha.format('DD/MM/YYYY HH:mm:ss');
    } else {
      return '';
    }
  }

  createButtonIcon({ data: vehiculo }: { data: Vehiculo }) {
    if (!this.permisoRepetirDia || !vehiculo.id) {
      return;
    }
    //Muestra Icono de Repetir Día
    const eSpan = document.createElement('i');
    eSpan.innerHTML = 'repeat';
    eSpan.className = 'material-icons';
    eSpan.id = vehiculo.id.toString();
    eSpan.style.cssText = 'cursor:pointer;color:#ffe800;font-size: 18px;';
    eSpan.title = 'Repetir Día';

    eSpan.addEventListener('click', () => {
      this.openRepetirDia(vehiculo);
    });
    return eSpan;
  }

  createCorteIgnicionCell({ data: vehiculo }: { data: Vehiculo }) {
    if (vehiculo.id === undefined) {
      return;
    }
    const eSpan = document.createElement('i');
    eSpan.innerHTML = 'vpn_key';
    eSpan.className = 'material-icons';
    eSpan.id = vehiculo.id.toString();

    if (vehiculo.ultimaActividad.ignicion) {
      eSpan.title = 'Encendido';
      eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
    } else {
      eSpan.title = 'Apagado';
      eSpan.style.cssText = 'cursor:pointer;color:#27488e;font-size: 18px;';
    }
    return eSpan;
  }

  openRepetirDia(vehiculo: Vehiculo) {
    // FIXME pendiente
    const data: any = {
      show: true,
      vehiculoId: vehiculo.id,
      showRepetirDia: true,
      fechaRecepcion: vehiculo.ultimaActividad.fechaRecepcion,
      vehiculo: this.vehiculos.find((x: any) => x.id === vehiculo.id),
    };

    this.clearActualizarDatosTimeout();
    store.commit('setRepetirDiaAbierto', true);
    repetirDiaEventBus.abrir(data);
  }

  private clearActualizarDatosTimeout() {
    clearTimeout(this.actualizarDatosTimeoutId);
  }

  beforeDestroy() {
    this.clearActualizarDatosTimeout();
  }
  private setCancelFetchActividades(cancelFetch: FetchCanceler) {
    this.cancelFetchActividades = cancelFetch;
  }

  createCortaCorrienteCell({ data: vehiculo }: { data: VehiculoHomeGrid }) {
    if (vehiculo.id === undefined || !this.permisoCortaCorriente) {
      return;
    }
    const eSpan = document.createElement('i');
    eSpan.innerHTML = 'power_settings_new';
    eSpan.className = 'material-icons';
    eSpan.id = vehiculo.id.toString();
    eSpan.title = 'Corta Corriente';

    if (vehiculo.estadoCortaCorriente == '6') {
      eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
    } else {
      eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
    }
    // eSpan.addEventListener('click', () => {
    //   this.openCortaCorriente(vehiculo);
    // });
    return eSpan;
  }

  async openCortaCorriente(vehiculo: VehiculoHomeGrid) {
    this.ultimoSelec = vehiculo;
    store.commit('setCortaCorrienteAbierto', true);
    store.commit('setCortaCorrienteAbiertoAux', true);
    var dataComunicacion: any = [];
    var repetirDia = false;
    const vStore = store.getters.getVehiculoActual;
    const v: any = {
      vehiculoActualId: vehiculo.id,
      vehiculoAnteriorId:
        vStore.vehiculoActual === null
          ? null
          : vStore.vehiculoActual.vehiculoActualId,
      repetirDia,
    };
    store.commit('setVehiculoActual', v);
    await this.axios.http
      .get(
        `${this.cortaCorrienteController}/${vehiculo.id}/GetUltimoComunicacion` //lena valores para modal corte ignicion y los envia por params
      )
      .then(res => {
        dataComunicacion = res.data;
        if (dataComunicacion.id) {
          dataComunicacion.solicitudTxt = dataComunicacion.solicitudTxt.replace(
            /([a-z])([A-Z])/g,
            '$1 $2'
          );
          dataComunicacion.estadoTxt = EstadoEnvioGps[
            dataComunicacion.estadoId
          ].replace(/_/g, ' ');
        }
      });

    // const actividad = await fetchActividades(
    //   vehiculo.id,
    //   this.setCancelFetchActividades
    // );
    const data: any = {
      show: true,
      vehiculoId: vehiculo.id,
      vehiculo: vehiculo,
      // actividad: actividad,
      ultimaActividad: vehiculo.ultimaActividad,
      showCorteIgnicion: true,
      fechaRecepcion: vehiculo.ultimaActividad.fechaRecepcion,
      usuarioId: this.usuarioId,
      dataComunicacion: {
        mensajeTxt: dataComunicacion.mensajeTxt,
        fechaSolicitudTxt: dataComunicacion.fechaSolicitudTxt,
        estadoTxt: dataComunicacion.estadoTxt,
        usuarioTxt: dataComunicacion.usuarioTxt,
      },
    };
    store.commit('setRepetirDiaAbierto', false);
    //actividadesEventBus
    CortaCorrienteEventBus.abrirCortaCorrienteHome(data);
  }
  cerrarCortaCorriente() {
    const data: any = {
      show: false,
      vehiculoId: 0,
      showCorteIgnicion: false,
      fechaRecepcion: null,
      usuarioId: 0,
      dataComunicacion: {
        mensajeTxt: '',
        fechaSolicitudTxt: '',
        estadoTxt: '',
        usuarioTxt: '',
      },
    };
    // store.commit('setRepetirDiaAbierto', false);
    //actividadesEventBus
    CortaCorrienteEventBus.abrirCortaCorrienteHome(data);
    store.commit('setCortaCorrienteAbierto', false);
    store.commit('setCortaCorrienteAbiertoAux', false);
  }
}
</script>
<style>
.grilla {
  padding-right: 0 !important;
}
</style>

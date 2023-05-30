<template>
  <div>
    <v-card class="fish" style="max-width:100%;">
      <v-tabs v-model="active" slider-color="primary">
        <v-tabs-slider color="primary"></v-tabs-slider>
        <v-tab href="#tab-1" style="font-size: 11px; height: 50px"
          >Registro Actividades</v-tab
        >
        <v-tab-item v-for="i in 3" :key="i" :value="'tab-' + i">
          <v-card flat v-if="i === 1">
            <v-card-title style="padding: 5px 5px 5px 20px; height: 55px">
              <span
                v-if="vehiculoUnidad"
                style="font-size:17px;text-transform: uppercase;background-color: rgb(0, 0, 0, 0.18);padding: 5px;"
                >{{ vehiculoUnidad }}</span
              >
              <v-btn
                v-if="vehiculoUnidad"
                style="font-size:12px; background:white; margin-right: 0px;"
                depressed
                flat
                @click="handleVerDetalleClick()"
              >
                Ver Detalle
                <v-icon right dark>keyboard_arrow_right</v-icon>
              </v-btn>
              <ButtonCrearSolicitud
                v-if="
                  !vehiculoTransmite &&
                    (mostrarFacturacion || mostrarSolicitudes)
                "
              ></ButtonCrearSolicitud>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-actions
              class="grilla"
              id="grillaId"
              style="padding-top: 1px;padding-bottom: 1px;padding-right:16px;"
            >
              <grid
                style="width: 100%; height: 400px;font-family: 'Asap', sans-serif;"
                class="ag-theme-material"
                data-testid="test__unidad"
                :gridOptions="gridOptions"
                :getRowNodeId="getRowNodeId"
                :row-data="rowData"
                :animateRows="true"
                :deltaRowDataMode="true"
                :funcionalidad-id="funcionalidadActividades"
                :immutableColumns="true"
              ></grid>
            </v-card-actions>
            <v-card-text
              style="text-align: right; padding: 10px 10px 10px 5px;"
            >
              <span style="font-size:13px; padding-right: 10px;"
                >Mostrando {{ cantidadActiviadades }} actividades</span
              >
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from '@/store';
import moment from 'moment';
import config from '@/config/index';
import { Funcionalidades } from '@/config/funcionalidades';
import { Component } from 'vue-property-decorator';
import ActividadesEventBus from '@/eventBus/actividadesEventBus';
import { repetirDiaEventBus, repetirDiaEvents } from '@/setup';
import { LoadingService } from '@/services/loadingService';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import {
  GridOptions,
  GridApi,
  ColDef,
  ColumnApi,
  GridReadyEvent,
  Column,
} from 'ag-grid-community';
import { filtroHomeEventBus, filtroHomeEvents } from '@/setup';
import {
  Actividad,
  fetchActividades,
} from '@/pantallas/Inicio/ActividadesData/fetchActividadespg';
import actividadEventBus from '@/pantallas/Inicio/ActividadesData/ActividadEventBus';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import { RepetirDia } from '../RepetirDiaData/fetchRepetirDia';
import RepetirDiaEventBus from '@/pantallas/Inicio/RepetirDiaData/RepetirDiaEventBus';
import VehiculoMarker from '@/pantallas/Inicio/Mapa/VehiculoMarker';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import ActividadEventBus from '@/pantallas/Inicio/ActividadesData/ActividadEventBus';
import CortaCorrienteEventBus from '@/pantallas/Inicio/CortaCorrienteData/CortaCorrienteEventBus';
import ButtonCrearSolicitud from '@/reusable/CrearSolicitud/ButtonCrearSolicitud.vue';
import GridHome from '@/reusable/Grid/GridHome.vue';
import { ActividadRepetirDiaIntersection } from '@/pantallas/Inicio/ActividadesData/ActividadRepetirDiaIntersection';
import { RowNode as GenericRowNode } from '@/reusable/Grid/aggridUtils';
import { ColumnState } from 'ag-grid-community/dist/lib/columnController/columnController';
import { EstadoGrilla } from '@/agGridUtil/EstadoGrilla';

type RowNode = GenericRowNode<ActividadRepetirDiaIntersection>;

@Component({
  components: {
    grid: GridHome,
    ButtonCrearSolicitud,
  },
})
export default class ActividadesGrid extends Vue {
  // readonly funcionalidad: Funcionalidades = Funcionalidades.Inicio;
  readonly funcionalidadActividades: Funcionalidades =
    Funcionalidades.GrillaActividadHome;
  localeText: any = config.agGridTextos;
  search: string = null;
  active: any = null;
  gridApi: GridApi;
  columnDefs: Array<ColDef> = [
    {
      colId: 'actividadTipoNombre',
      headerName: 'Actividad',
      field: 'actividadTipoNombre',
      width: 30,
      minWidth: 30,
      sortable: true,
      resizable: true,
      cellStyle: { padding: 0 },
      filter: false,
      rowDrag: false,
      hide: false,
      suppressMovable: true,
      enablePivot: false,
      lockVisible: true,
      lockPosition: true,
      cellRenderer: this.createIconoActividadTipoCell,
    },
    {
      colId: 'ignicion',
      headerName: 'Estado Ignición',
      field: 'ignicion',
      width: 30,
      minWidth: 30,
      lockPinned: true,
      hide: false,
      cellStyle: { padding: 0 },
      cellRenderer: this.createIconoCorteIgnicionCell,
    },
    {
      colId: 'fechaActividad',
      headerName: 'Fecha/Hora de Actividad',
      field: 'fechaActividad',
      width: 200,
      lockPinned: true,
      sortable: true,
      hide: false,
      cellRenderer: this.formatearNumbers,
    },
    {
      colId: 'velocidadActual',
      headerName: 'Velocidad',
      field: 'velocidadActual', //velocidadActual
      width: 120,
      lockPinned: true,
      hide: false,
      cellRenderer: this.formatearNumbers,
    },
    {
      colId: 'ubicacion',
      headerName: 'Ubicación',
      field: 'ubicacion',
      width: 120,
      lockPinned: true,
      hide: false,
    },
    {
      headerName: 'Distancia Recorrida',
      colId: 'distanciaRecorrida',
      field: 'distanciaRecorrida',
      width: 175,
      hide: true,
      cellRenderer: this.formatearNumbers,
    },
    {
      headerName: 'Nro. Satélites',
      colId: 'nroSatelites',
      field: 'nroSatelites',
      width: 140,
      hide: true,
    },
    {
      headerName: 'HDOP',
      field: 'hdop',
      colId: 'hdop',
      width: 100,
      hide: true,
    },
    {
      headerName: 'Id de la Actividad',
      field: 'actividadId',
      colId: 'actividadId',
      width: 160,
      hide: true,
    },
    {
      headerName: 'Código de la Actividad',
      field: 'codigoActividad',
      colId: 'codigoActividad',
      width: 190,
      hide: true,
    },
    {
      headerName: 'Descripción de la Actividad',
      field: 'actividadTipoNombre',
      width: 190,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
      hide: false,
    },
    {
      headerName: 'Distancia Acumulada',
      field: 'distanciaAcumulada',
      colId: 'distanciaAcumulada',
      width: 195,
      hide: true,
      cellRenderer: this.formatearNumbers,
    },
    {
      headerName: 'Dato Válido',
      field: 'gpsValid',
      colId: 'gpsValid',
      width: 30,
      minWidth: 30,
      resizable: false,
      hide: true,
      cellStyle: { padding: 0 },
      cellRenderer: this.createIconoDatoValidoCell,
    },
    {
      headerName: 'Orientación',
      field: 'heading',
      width: 30,
      colId: 'heading',
      minWidth: 30,
      resizable: false,
      hide: true,
      cellStyle: { padding: 0 },
      cellRenderer: this.createIconoOrientacionCell,
    },
    {
      headerName: 'Latitud',
      field: 'latitud',
      width: 115,
      hide: true,
    },
    {
      headerName: 'Longitud',
      field: 'longitud',
      width: 120,
      hide: true,
    },
    {
      headerName: 'Velocidad Máxima Permitida',
      field: 'velocidadMaxima',
      width: 230,
      hide: true,
      cellRenderer: this.formatearNumbers,
    },
    {
      headerName: 'Odómetro',
      field: 'odometro',
      width: 130,
      hide: true,
    },
    {
      headerName: 'Altura',
      field: 'altura',
      width: 100,
      hide: true,
    },
    {
      headerName: 'Nombre del Proveedor',
      field: 'nombreProveedor',
      width: 190,
      hide: true,
    },
    {
      headerName: 'Rut Conductor',
      field: 'rutConductor',
      width: 150,
      hide: true,
    },
    {
      headerName: 'Nombre del Conductor',
      field: 'nombreConductor',
      width: 190,
      hide: true,
    },
    {
      headerName: 'Horas de Motor',
      field: 'horasMotor',
      width: 145,
      hide: true,
    },
    {
      headerName: 'Geocerca',
      colId: 'geocerca',
      field: 'geocerca',
      width: 145,
      hide: true,
    },
  ].map(x => ({
    ...x,
    colId: x.field,
    rowDrag: false,
    filter: false,
    sortable: true,
    lockPinned: undefined,
  }));
  gridOptions: GridOptions = {
    suppressNoRowsOverlay: true,
    columnDefs: this.columnDefs,
    processCellForClipboard: this.formatearNumbers,
    onGridReady: this.onGridReady,
    onSortChanged: this.handleSortChange,
    navigateToNextCell: this.navigateToNextCell,
    onCellClicked: this.onCellClicked,
    overlayLoadingTemplate:
      '<span class="ag-overlay-loading-center">Cargando...</span>',
  };
  dialog: boolean = true;
  usuarioId: number = store.state.userId;
  agGridUtil: AgGridUtil;
  loadingService = new LoadingService();
  cantidadActiviadades: number = 0;
  autoGroupColumnDef: any = null;
  vehiculoId: number = 0;
  vehiculoSeleccionado: any = null;
  btnVerDetalleEnabled: boolean = false;
  dataVieneDesdeRepetirDia: any = {};
  generandoRuta: boolean = false;
  switchRepetirDia: boolean = false;
  blockDetalle: boolean = true;
  rowData: ActividadRepetirDiaIntersection[] = [];
  actividades: Actividad[] = [];
  lastSortModel: { colId?: string; sort?: string } = {};
  vehiculoUnidad: string = null;
  vehiculoTransmite: boolean = true;
  mostrarFacturacion: boolean = false;
  mostrarSolicitudes: boolean = false;
  columnApi: ColumnApi;
  columnDefActual: ColDef[] = [];
  estadoColumnas: ColumnState[] = [];

  vehiculo: Vehiculo;

  vehiculosbase: Vehiculo[];

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  private isCortaCorrienteAbierto() {
    return this.$store.getters.getcortaCorrienteAbierto.cortaCorrienteAbierto;
  }

  async cargarActividades() {
    if (this.isRepetirDiaAbierto()) {
      return;
    }

    this.loadingService.showLoading();
    this.gridApi.setRowData([]);
    var fecha = null;
    const vStore = store.getters.getActividadSeleccionada;

    fecha = moment(
      this.vehiculoSeleccionado == null
        ? this.vehiculo.fechaUltimaActividad
        : this.vehiculoSeleccionado.fechaUltimaActividad
    );
    var auxId =
      this.vehiculoId != null
        ? this.vehiculoId
        : this.vehiculoSeleccionado.id != null
        ? this.vehiculoSeleccionado.Id
        : vStore.actividadSeleccionada != undefined ||
          vStore.actividadSeleccionada != null
        ? vStore.actividadSeleccionada.vehiculoId
        : null;

    let params: any = {
      user: this.usuarioId,
      pagina: 1,
      vehiculoid: auxId,
      fechaActividad: fecha,
    };

    const actividades = await fetchActividades(params).catch();
    // this.gridApi.showLoadingOverlay();

    let actividadesGrilla;

    if (!this.vehiculoSeleccionado) {
      actividadesGrilla = actividades;
    } else {
      actividadesGrilla = actividades;
    }

    store.commit('setUltimaActividad', actividadesGrilla[0]);

    if (!this.isRepetirDiaAbierto()) {
      this.rowData = actividadesGrilla;
      this.cantidadActiviadades = actividadesGrilla.length;
      this.btnVerDetalleEnabled = this.cantidadActiviadades !== 0;
      this.loadingService.hideLoading();
      this.switchRepetirDia = false;
      actividadEventBus.cargarActividades(actividadesGrilla);
    }
    // setTimeout(() => {
    //   this.gridApi.forEachNode((x: RowNode, index) => {
    //     if (index === 0) {
    //       x.setSelected(true);
    //       this.gridApi.ensureNodeVisible(x, 'middle');
    //     }
    //   });
    // });

    return actividadesGrilla;
  }

  async actualizarActividades(vehiculo: Vehiculo) {
    // this.rowData =
    const vStore = store.getters.getActividadSeleccionada;
    var fecha = null;
    if (vStore.actividadSeleccionada == null) {
      fecha = moment(this.vehiculoSeleccionado.fechaUltimaActividad);
    } else {
      fecha = moment(vStore.actividadSeleccionada.fechaActividad);
    }
    var auxId =
      this.vehiculoId != null
        ? this.vehiculoId
        : this.vehiculoSeleccionado.id != null
        ? this.vehiculoSeleccionado.Id
        : vStore.actividadSeleccionada != undefined ||
          vStore.actividadSeleccionada != null
        ? vStore.actividadSeleccionada.vehiculoId
        : null;
    let params: any = {
      user: this.usuarioId,
      pagina: 1,
      vehiculoid: auxId,
      fechaActividad: fecha,
    };
    if (auxId != null) {
      let actividades: any = await fetchActividades(params);

      if (!vehiculo) {
        this.rowData = actividades;
      } else {
        this.rowData = actividades.filter(
          (x: Actividad) => x.fechaActividad <= vehiculo.fechaUltimaActividad
        );
      }

      actividadEventBus.cargarActividades(this.rowData);

      store.commit('setUltimaActividad', this.rowData[0]);
      setTimeout(() => {
        this.gridApi.forEachNode((x: RowNode, index) => {
          if (index === 0) {
            x.setSelected(true);
            this.gridApi.ensureNodeVisible(x, 'middle');
          }
        });
      });
    }
  }

  getRowNodeId(actividades: any) {
    if (!actividades) {
      return;
    }
    return actividades.id;
  }

  // onModelUpdate() {
  //   this.loadingService.hideLoading();
  // }

  handleSortChange() {
    if (this.gridApi.getSortModel().length === 0) {
      const { lastSortModel = {} } = this;
      const nextSortDirection =
        lastSortModel.sort === 'desc' ? 'asc' : lastSortModel.sort;
      const defaultSortedColumn = 'fechaActividad';
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

  formatearNumbers(params: any) {
    if (!params) {
      return;
    } else if (params.column.getColDef().field === 'fechaActividad') {
      const fecha = moment(params.value, 'YYYY-MM-DDTHH:mm:ss');
      if (fecha.get('year') !== 1900) {
        return fecha.format('DD/MM/YYYY HH:mm:ss');
      } else {
        return '';
      }
    } else if (params.column.getColDef().field === 'velocidadActual') {
      return params.value + ' Km/h';
    } else if (params.column.getColDef().field === 'distanciaRecorrida') {
      return params.value + ' Km';
    } else if (params.column.getColDef().field === 'distanciaAcumulada') {
      return params.value + ' Km';
    } else if (params.column.getColDef().field === 'velocidadMaxima') {
      return params.value + ' Km/h';
    }
    return params.value;
  }

  navigateToNextCell(params: any) {
    const self = this;
    const suggestedNextCell = params.nextCellDef;
    const KEY_UP = 38;
    const KEY_DOWN = 40;
    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;

    if (suggestedNextCell === null) {
      return;
    }

    switch (params.key) {
      case KEY_DOWN:
        this.gridApi.forEachNode(function(rowNode: RowNode) {
          if (rowNode.rowIndex === suggestedNextCell.rowIndex) {
            self.keyboardAction(rowNode);
          }
        });
        return suggestedNextCell;
      case KEY_UP:
        this.gridApi.forEachNode(function(rowNode: RowNode) {
          if (rowNode.rowIndex === suggestedNextCell.rowIndex) {
            self.keyboardAction(rowNode);
          }
        });
        return suggestedNextCell;
      case KEY_LEFT:
      case KEY_RIGHT:
        return suggestedNextCell;
      default:
        throw 'this will never happen, navigation is always one of the 4 keys above';
    }
  }

  private handleCargaFlotaVehiculos(vehiculos: Vehiculo[]) {
    const presenteEnNuevaFlota = vehiculos.find(x => x.id === this.vehiculoId);
    this.vehiculosbase = vehiculos;
    /* No mostrar registros en casos en que el vehículo previamente
    seleccionado haya desaparecido de la flota. */
    // this.gridApi.setRowData(presenteEnNuevaFlota ? this.rowData : []);

    if (!presenteEnNuevaFlota) {
      this.rowData = [];
    }

    // this.rowData = presenteEnNuevaFlota ? this.rowData : [];
  }

  handleSeleccionVehiculo(vehiculo: Vehiculo) {
    this.vehiculoSeleccionado = vehiculo;
    if (!this.isRepetirDiaAbierto()) {
      this.seleccionarVehiculo(vehiculo);
    }
  }

  handleSeleccionVehiculoMarker(marker: VehiculoMarker) {
    const vehiculo = this.vehiculosbase.find(
      x => x.id === marker.smVehiculo.id
    );
    this.seleccionarVehiculo(vehiculo);
  }

  seleccionarVehiculo(vehiculo: Vehiculo) {
    this.vehiculo = vehiculo;
    this.vehiculoId = vehiculo.id;
    this.vehiculoUnidad = vehiculo.unidad;
    this.vehiculoTransmite = vehiculo.ultimaActividad.transmitiendo;
    this.cargarActividades();
  }

  handleActualizacionActividad(vehiculo: Vehiculo) {
    if (!vehiculo) {
      return;
    }
    this.actualizarActividades(vehiculo);
  }

  handleCargaActividadesRepetirDia(repetirDia: RepetirDia[]) {
    this.loadingService.showLoading();
    // this.gridApi.setRowData(repetirDia);
    // this.gridApi.showLoadingOverlay();
    this.rowData = repetirDia;
    this.cantidadActiviadades = this.rowData.length;
    this.vehiculoUnidad = repetirDia[0].unidad;
    store.commit('setUltimaActividad', repetirDia[repetirDia.length - 1]);
    store.commit('setActividadSeleccionada', repetirDia[0]);
    this.switchRepetirDia = true;
    store.commit('setGenerandoRuta', false);
    // Asume que solo es llamado desde repetir día. TODO Eliminar todos estos campos de clase
    const [actividadMasReciente, ...rest] = repetirDia;
    this.vehiculoId = actividadMasReciente.vehiculoId;
    this.dataVieneDesdeRepetirDia = repetirDia;
    this.btnVerDetalleEnabled = repetirDia.length > 0;
    this.cantidadActiviadades = repetirDia.length;

    store.commit('setCambiaHeigth', true);
    // this.loadingService.hideLoading();

    setTimeout(() => {
      this.gridApi.forEachNode((x: RowNode, index) => {
        if (index === 0) {
          x.setSelected(true);
          this.gridApi.ensureNodeVisible(x, 'middle');
        }
      });
    });
    this.loadingService.hideLoading();
  }

  async mounted() {
    this.permisosComercial();
    ActividadesEventBus.$on(
      'actividadesEventBusRecargar',
      ({ vehiculo }: any) => {
        if (!vehiculo) {
          return;
        }
        if (vehiculo.fechaUltimaActividad) {
          this.vehiculoSeleccionado = vehiculo;
        }
        this.gridApi.deselectAll();
        this.actualizarActividades(vehiculo);
      }
    );

    RepetirDiaEventBus.onCargarActividadesRepetirDia(
      this.handleCargaActividadesRepetirDia
    );
    vehiculoEventBus.onCargaFlotaVehiculos(this.handleCargaFlotaVehiculos);
    vehiculoEventBus.onSeleccionar(this.handleSeleccionVehiculo);
    vehiculoEventBus.onSeleccionarVehiculoMarker(
      this.handleSeleccionVehiculoMarker
    );
    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);

    // ActividadEventBus.onActualizarActividad(this.handleActualizacionActividad);
    vehiculoEventBus.onActualizarVehiculoSeleccionado(
      this.handleActualizacionActividad
    );

    const ordenamientoColumnasRepetirDia = {
      set: () =>
        // @ts-ignore
        this.gridApi.columnController.setColumnDefs(
          this.columnDefs.map(columnDef => ({
            ...columnDef,
            sort: columnDef.field === 'fechaActividad' ? 'desc' : false,
            sortable: columnDef.field === 'fechaActividad' ? true : false,
            suppressSorting:
              columnDef.field === 'fechaActividad' ? false : true,
          }))
        ),

      unset: () =>
        // @ts-ignore
        this.gridApi.columnController.setColumnDefs(
          this.columnDefs.map(columnDef => ({
            ...columnDef,
            suppressSorting: false,
            sortable: true,
            sort: columnDef.field === 'fechaActividad' ? 'asc' : true,
          }))
        ),
    };

    store.subscribe((mutation, state) => {
      if (mutation.type === 'setRepetirDiaAbierto') {
        const pintarRepetirDia: any = this.$store.getters.getRepetirDiaAbierto;

        if (mutation.payload === false) {
          ordenamientoColumnasRepetirDia.unset();
          // this.columnApi.setColumnState(this.estadoColumnas)
        }
      }
    });

    repetirDiaEventBus.$on(repetirDiaEvents.cerrar, () => {
      const ultimaActividad = this.gridApi.getRowNode('0');
      if (!ultimaActividad) {
        return;
      }
      ultimaActividad.setSelected(true);
      this.gridApi.ensureNodeVisible(ultimaActividad, 'middle');
      // this.gridApi.setColumnDefs(null);

      ordenamientoColumnasRepetirDia.unset();
      // this.columnApi.setColumnState(this.estadoColumnas);
    });

    repetirDiaEventBus.$on(repetirDiaEvents.abrir, () => {
      // this.gridApi.setColumnDefs(null);
      const estadoGrilla = this.cargarEstadoDesdeServidor(
        this.gridApi,
        this.columnApi
      );
      let Estado: ColumnState[] = [];

      ordenamientoColumnasRepetirDia.set();
      estadoGrilla.then(x => {
        if (x.estadoColumna.length > 0) {
          this.estadoColumnas = x.estadoColumna;
        }
      });
      setTimeout(() => {
        if (this.estadoColumnas.length > 0) {
          // this.columnApi.setColumnState(this.estadoColumnas);
        }
      }, 300);
    });

    filtroHomeEventBus.$on(filtroHomeEvents.cambiarFiltro, () => {
      this.rowData = [];
      this.vehiculoId = null;
      this.vehiculoUnidad = null;
      this.btnVerDetalleEnabled = false;
      this.cantidadActiviadades = this.rowData.length;
    });

    store.subscribe((mutation, state) => {
      if (mutation.type === 'setGenerandoRuta') {
        const pintarRepetirDia: any = this.$store.getters.getRepetirDiaAbierto;

        if (mutation.payload === true) {
          this.generandoRuta = true;
        } else {
          this.generandoRuta = false;
        }

        if (
          pintarRepetirDia === undefined ||
          pintarRepetirDia.repetirDiaAbierto === undefined ||
          pintarRepetirDia.repetirDiaAbierto === false
        ) {
          this.generandoRuta = false;
        }
      }
    });

    store.subscribe(mutation => {
      if (mutation.type !== 'setActividad') {
        return;
      }
      if (mutation.payload === null) {
        this.gridApi.forEachNode(node => {
          node.setSelected(false);
        });
        return;
      }
      this.gridApi.forEachNode((row: RowNode) => {
        if (
          row.data === undefined ||
          row.data.id !== mutation.payload.id ||
          row.data.actividadId !== mutation.payload.actividadId
        ) {
          row.setSelected(false);
          return;
        }
        row.setSelected(true);
        this.gridApi.ensureNodeVisible(row, 'middle');
      });
    });
  }

  async cargarEstadoDesdeServidor(gridApi: GridApi, columnApi: ColumnApi) {
    if (!this.funcionalidadActividades) {
      return;
    }
    this.agGridUtil = new AgGridUtil(gridApi, columnApi, {
      id: 0,
      grilla: '',
      usuarioId: store.state.userId,
      funcionalidades: this.funcionalidadActividades,
    });
    const estadoGrilla = await this.agGridUtil.recuperarEstadoGrilla();

    return estadoGrilla;
  }

  private onCellSelection(actividad: Actividad) {
    store.commit('setActividadSeleccionada', actividad);
    if (this.$store.getters.getRepetirDiaAbierto.repetirDiaAbierto) {
      store.commit('setGenerandoRuta', true);
      store.commit('setClickDetalle', { actividad, openInfoWindow: false });
    }

    actividadEventBus.seleccionar(actividad);
  }

  onCellClicked(cell: any) {
    this.onCellSelection(cell.data);
  }

  keyboardAction(row: any) {
    this.onCellSelection(row.data);
  }

  private isRepetirDiaAbierto() {
    return this.$store.getters.getRepetirDiaAbierto.repetirDiaAbierto;
  }

  handleVerDetalleClick() {
    let ultimaActividad;

    if (this.getActividadSeleccionada()) {
      ultimaActividad = this.getActividadSeleccionada();
    } else {
      ultimaActividad = this.rowData[0];
    }
    if (this.isCortaCorrienteAbierto) this.cerrarCortaCorriente();

    if (!this.switchRepetirDia) {
      ActividadEventBus.actualizarActividad();
    }

    vehiculoEventBus.abrirDetalleVehiculo(
      this.vehiculo,
      ultimaActividad,
      this.rowData[0],
      true,
      '0'
    );
  }

  async handleAbrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    if (show) {
      this.gridApi.setRowData(this.actividades);
    }
  }

  getActividadSeleccionada(): Actividad | undefined {
    // Solo es permitida la selección de una fila a la vez
    return this.gridApi.getSelectedRows()[0];
  }

  createIconoCorteIgnicionCell(params: any) {
    if (!params.data) {
      return;
    }
    if (params.data.id !== undefined) {
      var eSpan = document.createElement('i');
      eSpan.innerHTML = 'vpn_key';
      eSpan.className = 'material-icons';
      eSpan.id = params.data.id;

      if (params.data.ignicion == 1) {
        eSpan.title = 'Encendido';
        eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
      } else {
        eSpan.title = 'Apagado';
        eSpan.style.cssText = 'cursor:pointer;color:#27488e;font-size: 18px;';
      }
      return eSpan;
    }
  }

  createIconoActividadTipoCell(params: any) {
    if (params.data !== undefined) {
      if (params.data.id !== undefined) {
        const eSpan = document.createElement('i');
        eSpan.className = 'material-icons';
        eSpan.id = params.data.id;
        eSpan.title = params.data.actividadTipoNombre;

        if (params.data.codigoActividad === 20) {
          //ACTUALIZACION PROGRAMADA
          eSpan.innerHTML = 'update';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else if (params.data.codigoActividad === 21) {
          //SIN CONTACTO
          eSpan.innerHTML = 'power_off';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (params.data.codigoActividad === 22) {
          //CON CONTACTO
          eSpan.innerHTML = 'power';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else if (params.data.codigoActividad === 23) {
          //ALIMENTACION BATERIA
          eSpan.innerHTML = 'battery_charging_full';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else if (params.data.codigoActividad === 27) {
          //DATOS SERIALES AUXILIARES
          eSpan.innerHTML = 'sim_card';
          eSpan.style.cssText = 'cursor:pointer;color:#27488e;font-size: 18px;';
        } else if (params.data.codigoActividad === 50) {
          //ALIMENTACION BATERIA DESCONECTADA
          eSpan.innerHTML = 'battery_unknown';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (params.data.codigoActividad === 62) {
          //EXCESO DE VELOCIDAD
          eSpan.innerHTML = 'report';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (params.data.codigoActividad === 24) {
          //ENTRADA GEO
          eSpan.innerHTML = 'login';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else if (params.data.codigoActividad === 25) {
          //SALIDA GEO
          eSpan.innerHTML = 'logout';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (params.data.codigoActividad === 139) {
          //PULSADOR EVENTO ON
          eSpan.innerHTML = 'touch_app';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else if (params.data.codigoActividad === 140) {
          //PULSADOR EVENTO OFF
          eSpan.innerHTML = 'touch_app';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (
          params.data.codigoActividad === 63 ||
          params.data.codigoActividad === 135
        ) {
          //APERTURA DE PUERTA
          eSpan.innerHTML = 'meeting_room';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (
          params.data.codigoActividad === 64 ||
          params.data.codigoActividad === 136
        ) {
          //CIERRE DE PUERTA
          eSpan.innerHTML = 'door_front';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else if (params.data.codigoActividad === 137) {
          //CARGANDO
          eSpan.innerHTML = 'file_upload';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        } else if (params.data.codigoActividad === 138) {
          //DESCARGANDO
          eSpan.innerHTML = 'file_download';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else {
          eSpan.innerHTML = 'block';
          eSpan.style.cssText = 'cursor:pointer;color:black;font-size: 18px;';
        }
        return eSpan;
      }
    }
  }

  createIconoDatoValidoCell(params: any) {
    if (params.data !== undefined) {
      if (params.data.id !== undefined) {
        const eSpan = document.createElement('i');
        eSpan.className = 'material-icons';
        eSpan.id = params.data.id;

        if (params.data.gpsValid === 1) {
          eSpan.innerHTML = 'check_circle_outline';
          eSpan.title = 'Confiable';
          eSpan.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
        } else {
          eSpan.innerHTML = 'not_interested';
          eSpan.title = 'No Confiable';
          eSpan.style.cssText = 'cursor:pointer;color:red;font-size: 18px;';
        }
        return eSpan;
      }
    }
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
    CortaCorrienteEventBus.abrirCortaCorrienteHome(data);
    store.commit('setCortaCorrienteAbierto', false);
  }

  createIconoOrientacionCell(params: any) {
    if (params.data !== undefined) {
      if (params.data.id !== undefined) {
        const eSpan = document.createElement('i');
        eSpan.innerHTML = 'arrow_upward';
        eSpan.className = 'material-icons';
        eSpan.id = params.data.id;
        const estiloOrientacion =
          params.data.heading > 0
            ? '-webkit-transform: rotate(' +
              params.data.heading +
              'deg); -moz-transform: rotate(' +
              params.data.heading +
              'deg); -ms-transform: rotate(' +
              params.data.heading +
              'deg); -o-transform: rotate(' +
              params.data.heading +
              'deg); transform: rotate(' +
              params.data.heading +
              'deg);'
            : '';
        eSpan.style.cssText =
          'cursor:pointer;color:#27488e;font-size: 18px;' + estiloOrientacion;
        eSpan.title = params.data.heading + '°';
        return eSpan;
      }
    }
  }

  permisosComercial() {
    if (store.state.permisoFacturacion) {
      this.mostrarFacturacion = true;
    } else {
      this.mostrarFacturacion = false;
    }

    if (store.state.permisoSolicitudes) {
      this.mostrarSolicitudes = true;
    } else {
      this.mostrarSolicitudes = false;
    }
  }
}
</script>

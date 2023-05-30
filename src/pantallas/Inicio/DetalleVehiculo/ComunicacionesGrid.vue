<template>
  <div>
    <GridHome
      :row-data="comunicaciones"
      :gridOptions="gridOptions"
      :funcionalidadId="funcionalidad"
    ></GridHome>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GridHome from '@/reusable/Grid/GridHome.vue';
import { Funcionalidades } from '../../../config/funcionalidades';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  RowNode,
  ColDef,
  ColumnApi,
} from 'ag-grid-community';
import { repetirDiaEventBus, repetirDiaEvents } from '@/setup';
import { LoadingService } from '@/services/loadingService';
// import ActividadDetalleVehiculoHome from '@/components/ActividadDetalleVehiculo.vue';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { filtroHomeEventBus, filtroHomeEvents } from '@/setup';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import VehiculoMarker from '@/pantallas/Inicio/Mapa/VehiculoMarker';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import ActividadEventBus from '@/pantallas/Inicio/ActividadesData/ActividadEventBus';
import ActividadesEventBus from '@/eventBus/actividadesEventBus';
import moment from 'moment';
import store from '../../../store';
import {
  fetchComunicaciones,
  Comunicacion,
  FetchCanceler,
} from '../CortaCorrienteData/fetchComunicaciones';
import { EstadoEnvioGps } from '../../../config/enums';

@Component({
  components: { GridHome: GridHome },
})
export default class ActividadesDetalleGrid extends Vue {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.GrillaComunicaciones;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  columnDefs: Array<ColDef> = [
    {
      headerName: 'Tipo Solicitud',
      field: 'solicitudTxt',
      lockPinned: true,
      width: 195,
      minWidth: 80,
      resizable: true,
      sortable: true,
      cellStyle: { textAlign: 'left' },
      lockVisible: true,
    },
    {
      headerName: 'Mensaje',
      field: 'mensajeTxt',
      lockPinned: true,
      width: 195,
      minWidth: 80,

      resizable: true,
      sortable: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Fecha/Hora Solicitud',
      field: 'fechaSolicitudTxt',
      lockPinned: true,
      width: 195,
      minWidth: 80,
      resizable: true,
      sortable: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Estado',
      field: 'estadoTxt',
      lockPinned: true,
      width: 235,
      minWidth: 80,
      resizable: true,
      sortable: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Fecha/Hora Estado',
      field: 'fechaRespuestaTxt',
      lockPinned: true,
      width: 195,
      minWidth: 80,
      resizable: true,
      sortable: true,
      cellStyle: { textAlign: 'left' },
    },
    {
      headerName: 'Usuario',
      field: 'usuarioTxt',
      lockPinned: true,
      width: 195,
      minWidth: 80,
      resizable: true,
      sortable: true,
      cellStyle: { textAlign: 'left' },
    },
  ];

  readonly gridOptions: GridOptions = {
    columnDefs: this.columnDefs,
    onGridReady: this.handleGridReady,
    overlayLoadingTemplate:
      '<span class="ag-overlay-loading-center">Por favor espere...</span>',
  };

  /* state */

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
  rowData: Comunicacion[] = [];
  comunicaciones: Comunicacion[] = [];
  lastSortModel: { colId?: string; sort?: string } = {};
  vehiculoUnidad: string = null;
  columnApi: ColumnApi;

  vehiculo: Vehiculo;
  vehiculosBase: Vehiculo[];
  cancelFetchActividades: FetchCanceler;

  handleGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  private setCancelFetchActividades(cancelFetch: FetchCanceler) {
    this.cancelFetchActividades = cancelFetch;
  }

  async cargarActividades() {
    this.gridApi.showLoadingOverlay();
    const comunicaciones = await fetchComunicaciones(
      this.vehiculoId,
      this.setCancelFetchActividades
    );
    comunicaciones.forEach((x: any) => {
      x.solicitudTxt = x.solicitudTxt.replace(/([a-z])([A-Z])/g, '$1 $2');
      x.estadoTxt = EstadoEnvioGps[x.estadoId]
        .replace('comunicacion', 'comunicación')
        .replace(/_/g, ' ');
    });
    this.comunicaciones = comunicaciones;
    this.cantidadActiviadades = comunicaciones.length;
    this.btnVerDetalleEnabled = this.cantidadActiviadades !== 0;
    // this.loadingService.hideLoading();
    return comunicaciones;
  }

  async actualizarActividades() {
    this.comunicaciones = await fetchComunicaciones(
      this.vehiculoId,
      this.setCancelFetchActividades
    );
    this.comunicaciones.forEach((x: any) => {
      x.solicitudTxt = x.solicitudTxt.replace(/([a-z])([A-Z])/g, '$1 $2');
      x.estadoTxt = EstadoEnvioGps[x.estadoId]
        .replace('comunicacion', 'comunicación')
        .replace(/_/g, ' ');
    });
    const ultimaActividad = this.gridApi.getRowNode('0');
    if (!ultimaActividad) {
      return;
    }
    ultimaActividad.setSelected(true);
    this.gridApi.ensureNodeVisible(ultimaActividad, 'middle');
  }

  getRowNodeId(comunicaciones: any) {
    if (!comunicaciones) {
      return;
    }
    return comunicaciones.id;
  }

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

  private handleCargaFlotaVehiculos(vehiculos: Vehiculo[]) {
    const presenteEnNuevaFlota = vehiculos.find(x => x.id === this.vehiculoId);
    this.vehiculosBase = vehiculos;
    /* No mostrar registros en casos en que el vehículo previamente
    seleccionado haya desaparecido de la flota. */
    this.gridApi.setRowData(presenteEnNuevaFlota ? this.rowData : []);
  }

  handleSeleccionVehiculo(vehiculo: Vehiculo) {
    this.seleccionarVehiculo(vehiculo);
  }

  handleSeleccionVehiculoMarker(marker: VehiculoMarker) {
    const vehiculo = this.vehiculosBase.find(
      x => x.id === marker.smVehiculo.id
    );
    this.seleccionarVehiculo(vehiculo);
  }

  seleccionarVehiculo(vehiculo: Vehiculo) {
    if (this.cancelFetchActividades) {
      /* Asegurar que solo la última solicitud realizada sea considerada.
      Corrige inconsistencias al seleccionar múltiples vehículos antes de
      obtener respuesta de actividades desde el servidor. */
      this.cancelFetchActividades();
    }

    this.vehiculo = vehiculo;
    this.vehiculoId = vehiculo.id;
    this.vehiculoUnidad = vehiculo.unidad;
    this.cargarActividades();
  }

  handleActualizacionActividad() {
    if (!this.vehiculoId) {
      return;
    }
    this.actualizarActividades();
  }

  mounted() {
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
        this.actualizarActividades();
      }
    );

    vehiculoEventBus.onCargaFlotaVehiculos(this.handleCargaFlotaVehiculos);
    vehiculoEventBus.onSeleccionar(this.handleSeleccionVehiculo);
    vehiculoEventBus.onSeleccionarVehiculoMarker(
      this.handleSeleccionVehiculoMarker
    );

    ActividadEventBus.onActualizarActividad(this.handleActualizacionActividad);

    const ordenamientoColumnasRepetirDia = {
      set: () =>
        // @ts-ignore
        this.gridApi.columnController.setColumnDefs(
          this.columnDefs.map(columnDef => ({
            ...columnDef,
            sortable:
              columnDef.field === 'fechaActividad' ? columnDef.sortable : false,
          }))
        ),
      // @ts-ignore
      unset: () => this.gridApi.columnController.setColumnDefs(this.columnDefs),
    };

    repetirDiaEventBus.$on(repetirDiaEvents.cerrar, () => {
      const ultimaActividad = this.gridApi.getRowNode('0');
      if (!ultimaActividad) {
        return;
      }
      ultimaActividad.setSelected(true);
      this.gridApi.ensureNodeVisible(ultimaActividad, 'middle');
      this.gridApi.setColumnDefs(null);
      ordenamientoColumnasRepetirDia.unset();
    });

    repetirDiaEventBus.$on(repetirDiaEvents.abrir, () => {
      this.gridApi.setColumnDefs(null);
      ordenamientoColumnasRepetirDia.set();
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
          (row.data.id !== mutation.payload.id ||
            row.data.actividadId !== mutation.payload.actividadId)
        ) {
          row.setSelected(false);
          return;
        }
        row.setSelected(true);
        this.gridApi.ensureNodeVisible(row, 'middle');
      });
    });

    // vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);
  }

  // handleVerDetalleClick() {
  //   vehiculoEventBus.abrirDetalleVehiculo(
  //     this.vehiculo,
  //     this.getActividadSeleccionada(),
  //     true
  //   );
  // }

  // handleAbrirDetalleVehiculo(
  //   vehiculo: Vehiculo,
  //   actividad: Comunicacion,
  //   show: boolean
  // ) {
  //   if (show) {
  //     var actividadId: any;

  //     if (!actividad) {
  //       const ultimaActividad = this.gridApi.getRowNode('0');
  //       actividadEventBus.seleccionar(ultimaActividad.data);
  //       actividadId = ultimaActividad.data.id;
  //     } else {
  //       actividadEventBus.seleccionar(actividad);
  //       actividadId = actividad.id;
  //     }

  //     this.gridApi.forEachNode(node => {
  //       if (node.data.id === actividadId) {
  //         node.setSelected(true);
  //         setTimeout(() => {
  //           //Caso especial: la tabla debe estar visible para que ensureNodeVisible se ejecute. Tiene una directiva v-show
  //           this.gridApi.ensureNodeVisible(node);
  //         });
  //       }
  //     });
  //   }
  // }

  // getActividadSeleccionada(): Actividad | undefined {
  //   // Solo es permitida la selección de una fila a la vez
  //   return this.gridApi.getSelectedRows()[0];
  // }

  createIconoCorteIgnicionCell(params: any) {
    if (!params.data) {
      return;
    }
    if (params.data.id !== undefined) {
      var eSpan = document.createElement('i');
      eSpan.innerHTML = 'vpn_key';
      eSpan.className = 'material-icons';
      eSpan.id = params.data.id;

      if (params.data.ignicion === 1) {
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
    if (!params.data) {
      return;
    }
    if (params.data.id !== undefined) {
      var eSpan = document.createElement('i');
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
        eSpan.style.cssText = 'cursor:pointer;red;font-size: 18px;';
      } else {
        eSpan.innerHTML = 'block';
        eSpan.style.cssText = 'cursor:pointer;color:black;font-size: 18px;';
      }

      return eSpan;
    }
  }

  createIconoDatoValidoCell(params: any) {
    if (!params.data) {
      return;
    }
    if (params.data.id !== undefined) {
      var eSpan = document.createElement('i');
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
</script>

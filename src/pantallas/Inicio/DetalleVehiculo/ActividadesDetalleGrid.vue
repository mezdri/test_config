<template>
  <div>
    <GridHome
      :row-data="actividades"
      :gridOptions="gridOptions"
      :funcionalidadId="funcionalidad"
    ></GridHome>
    <v-card-text style="padding: 10px; text-align: right; padding-left:5px;">
      <span style="font-size:13px"
        >Mostrando {{ cantidadActiviadades }} actividades</span
      >
    </v-card-text>
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
  ColDef,
  BodyScrollEvent,
  PaginationChangedEvent,
} from 'ag-grid-community';
import { repetirDiaEventBus, repetirDiaEvents } from '@/setup';
import { LoadingService } from '@/services/loadingService';
// import ActividadDetalleVehiculoHome from '@/components/ActividadDetalleVehiculo.vue';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { filtroHomeEventBus, filtroHomeEvents } from '@/setup';
import {
  Actividad,
  fetchActividades,
} from '@/pantallas/Inicio/ActividadesData/fetchActividadespg';

import actividadEventBus from '@/pantallas/Inicio/ActividadesData/ActividadEventBus';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import { RepetirDia } from '../RepetirDiaData/fetchRepetirDia';
import RepetirDiaEventBus from '@/pantallas/Inicio/RepetirDiaData/RepetirDiaEventBus';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import ActividadesEventBus from '@/eventBus/actividadesEventBus';
import moment from 'moment';
import store from '../../../store';
import ActividadPerifericosVue from './ActividadPerifericos.vue';
import config from '../../../config';
import { RowNode as GenericRowNode } from '@/reusable/Grid/aggridUtils';
import { ActividadRepetirDiaIntersection } from '@/pantallas/Inicio/ActividadesData/ActividadRepetirDiaIntersection';

type RowNode = GenericRowNode<ActividadRepetirDiaIntersection>;

@Component({
  components: { GridHome: GridHome },
})
export default class ActividadesDetalleGrid extends Vue {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.GrillaActividadDetalle;

  /* aggrid */

  gridApi: GridApi = null;
  localeText: any = config.agGridTextos;

  /* template */

  columnDefs: Array<ColDef> = [
    {
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
      headerName: 'Estado Ignición',
      field: 'ignicion',
      width: 30,
      minWidth: 30,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
      lockPinned: true,
      cellStyle: { padding: 0 },
      cellRenderer: this.createIconoCorteIgnicionCell,
    },
    {
      headerName: 'Fecha/Hora de Actividad',
      field: 'fechaActividad',
      width: 200,
      minWidth: 80,
      sortable: true,
      resizable: true,
      filter: false,
      cellRenderer: (params: any) => {
        if (params.data != null && params.data.fechaActividad != null) {
          const newFecha = new Date(params.data.fechaActividad);
          return moment(String(newFecha)).format('DD/MM/YYYY HH:mm:ss');
        } else {
          return '';
        }
      },
    },
    {
      headerName: 'Velocidad',
      field: 'velocidadActual',
      width: 120,
      minWidth: 80,
      sortable: true,
      resizable: true,
      filter: false,
      cellRenderer: (params: any) => {
        if (!params.data) {
          return;
        }
        return `${params.data.velocidadActual} Km/h`;
      },
    },
    {
      headerName: 'Actividad Extendida',
      field: 'id',
      width: 30,
      minWidth: 30,
      rowDrag: false,
      sortable: true,
      resizable: false,
      filter: false,
      cellStyle: { padding: 0 },
      cellRenderer: this.makeIconoActividadExtendida,
    },
    {
      headerName: 'Ubicación',
      field: 'ubicacion',
      width: 120,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'Distancia Recorrida',
      field: 'distanciaRecorrida',
      width: 175,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
      cellRenderer: (params: any) => {
        if (!params.data) {
          return;
        }
        return `${params.data.distanciaRecorrida} Km`;
      },
    },
    {
      headerName: 'Nro. Satélites',
      field: 'nroSatelites',
      width: 140,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'HDOP',
      field: 'hdop',
      width: 100,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Id de la Actividad',
      field: 'actividadId',
      width: 160,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Código de la Actividad',
      field: 'codigoActividad',
      width: 190,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
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
      width: 195,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
      cellRenderer: (params: any) => {
        if (!params.data) {
          return;
        }
        return `${params.data.distanciaAcumulada} Km`;
      },
    },
    {
      headerName: 'Dato Válido',
      field: 'gpsValid',
      width: 30,
      minWidth: 30,
      rowDrag: false,
      sortable: true,
      resizable: false,
      filter: false,
      cellStyle: { padding: 0 },
      cellRenderer: this.createIconoDatoValidoCell,
    },
    {
      headerName: 'Orientación',
      field: 'heading',
      width: 30,
      minWidth: 30,
      rowDrag: false,
      sortable: true,
      resizable: false,
      filter: false,
      cellStyle: { padding: 0 },
      cellRenderer: this.createIconoOrientacionCell,
    },
    {
      headerName: 'Latitud',
      field: 'latitud',
      width: 115,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Longitud',
      field: 'longitud',
      width: 120,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Velocidad Máxima Permitida',
      field: 'velocidadMaxima',
      width: 230,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
      cellRenderer: (params: any) => {
        if (!params.data) {
          return;
        }
        return `${params.data.velocidadMaxima} Km/h`;
      },
    },
    {
      headerName: 'Odómetro',
      field: 'odometro',
      width: 130,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Odómetro Calibrado',
      field: 'odometro_calibrado',
      width: 130,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Altura',
      field: 'altura',
      width: 100,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Nombre del Proveedor',
      field: 'nombreProveedor',
      width: 190,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Rut Conductor',
      field: 'rutConductor',
      width: 150,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Nombre del Conductor',
      field: 'nombreConductor',
      width: 190,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Horas de Motor',
      field: 'horasMotor',
      width: 145,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Horas de Motor Calibrado',
      field: 'horasmotor_calibrado',
      width: 145,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
    {
      headerName: 'Geocerca',
      field: 'geocerca',
      colId: 'geocerca',
      width: 145,
      minWidth: 80,
      rowDrag: false,
      sortable: true,
      resizable: true,
      filter: false,
    },
  ];

  detailCellRendererParams = {
    detailGridOptions: {
      localeText: this.localeText,
      onFirstDataRendered(params: any) {
        params.api.sizeColumnsToFit();
      },
    },
    getDetailRowData: (params: any) => {
      params.successCallback(params.data.callRecords);
    },
  };

  readonly gridOptions: GridOptions = {
    columnDefs: this.columnDefs,
    onGridReady: this.handleGridReady,
    navigateToNextCell: this.navigateToNextCell,
    onCellClicked: this.onCellClicked,
    onSortChanged: this.handleSortChange,
    pagination: true,
    paginationPageSize: 999,
    onPaginationChanged: this.paginationChanged,
    onRowDataChanged: this.rowDataChaged,
    detailCellRenderer: 'ActividadPerifericosVue',
    detailCellRendererParams: this.detailCellRendererParams,
    frameworkComponents: { ActividadPerifericosVue },
    onDragStopped: this.dragStopped,
    masterDetail: true,
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
  rowData: ActividadRepetirDiaIntersection[] = [];
  actCarga: Actividad[] = [];
  actividades: Actividad[] = [];
  serverside: any;
  lastSortModel: { colId?: string; sort?: string } = {};
  vehiculoUnidad: string = null;
  pagina: number = 1;

  vehiculo: Vehiculo;

  handleGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  public dragStopped(event: any) {}
  public async rowDataChaged() {}
  public async paginationChanged(event: PaginationChangedEvent) {
    if (event.newPage) {
      if (
        this.gridApi.paginationGetCurrentPage() ==
        this.gridApi.paginationGetTotalPages() - 1
      ) {
        if (this.cantidadActiviadades % 1000 == 0) {
          this.gridApi.showLoadingOverlay();
          const vStore = store.getters.getActividadSeleccionada;
          let vehiculoActual = vStore.actividadSeleccionada.vehiculoId;
          var fecha = moment(vStore.actividadSeleccionada.fechaActividad);
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
            pagina: this.gridApi.paginationGetTotalPages(),
            vehiculoid: auxId,
            fechaActividad: fecha,
          };
          if (auxId != null) {
            const actividades = await fetchActividades(params)
              .then((x: Actividad[]) => {
                this.actCarga = this.actividades.concat(x);
                this.cantidadActiviadades = this.actCarga.length;
                this.gridApi.setRowData(this.actCarga);
                this.actividades = this.actCarga;
              })
              .catch()
              .finally(() => {
                this.gridApi.hideOverlay();
              });
          }
          this.gridApi.hideOverlay();
        }
      }
    }
  }

  async actualizarActividades() {
    //  this.actividades = await fetchActividades(this.vehiculoId);
    const ultimaActividad = this.gridApi.getRowNode('0');
    if (!ultimaActividad) {
      return;
    }

    setTimeout(() => {
      this.gridApi.forEachNode((x: RowNode, index) => {
        if (index === 0) {
          x.setSelected(true);
          this.gridApi.ensureNodeVisible(x, 'middle');
        }
      });
    });
  }

  getRowNodeId(actividades: any) {
    if (!actividades) {
      return;
    }
    return actividades.id;
  }

  isJsonString(str: any): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
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
    /* No mostrar registros en casos en que el vehículo previamente
    seleccionado haya desaparecido de la flota. */
    this.gridApi.setRowData(presenteEnNuevaFlota ? this.rowData : []);
  }

  handleCargaActividadesRepetirDia(repetirDia: RepetirDia[]) {
    this.gridApi.setRowData(repetirDia);
    this.rowData = repetirDia;
    this.cantidadActiviadades = this.rowData.length;
    this.switchRepetirDia = true;

    this.vehiculoUnidad = repetirDia[0].unidad;

    store.commit('setGenerandoRuta', false);
    // Asume que solo es llamado desde repetir día. TODO Eliminar todos estos campos de clase
    const [actividadMasReciente, ...rest] = repetirDia;
    this.vehiculoId = actividadMasReciente.vehiculoId;
    this.dataVieneDesdeRepetirDia = repetirDia;
    this.btnVerDetalleEnabled = repetirDia.length > 0;
    this.cantidadActiviadades = repetirDia.length;

    store.commit('setCambiaHeigth', true);
    this.loadingService.hideLoading();

    setTimeout(() => {
      this.gridApi.forEachNode((x: RowNode, index) => {
        if (index === 0) {
          x.setSelected(true);
          this.gridApi.ensureNodeVisible(x, 'middle');
        }
      });
    });
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

    RepetirDiaEventBus.onCargarActividadesRepetirDia(
      this.handleCargaActividadesRepetirDia
    );
    vehiculoEventBus.onCargaFlotaVehiculos(this.handleCargaFlotaVehiculos);
    actividadEventBus.onCargarActividades(this.handleCargaActividades);

    const ordenamientoColumnasRepetirDia = {
      set: () =>
        // @ts-ignore
        this.gridApi.columnController.setColumnDefs(
          this.columnDefs.map(columnDef => ({
            ...columnDef,
            sort: columnDef.field === 'fechaActividad' ? 'desc' : false,
            sortable:
              columnDef.field === 'fechaActividad' ? columnDef.sortable : false,
          }))
        ),
      // @ts-ignore
      unset: () => this.gridApi.setColumnDefs(this.columnDefs),
    };

    repetirDiaEventBus.$on(repetirDiaEvents.cerrar, () => {
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

    store.subscribe((mutation, state) => {
      if (mutation.type === 'setRepetirDiaAbierto') {
        const pintarRepetirDia: any = this.$store.getters.getRepetirDiaAbierto;
        if (mutation.payload === false) {
          this.gridApi.setRowData(this.actividades);
          this.cantidadActiviadades = this.actividades.length;
        }
      }
    });

    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);
  }

  private onCellSelection(actividad: Actividad) {
    actividadEventBus.seleccionar(actividad);
  }

  onCellClicked(cell: any) {
    this.onCellSelection(cell.data);
  }

  keyboardAction(row: any) {
    this.onCellSelection(row.data);
  }

  handleCargaActividades(actividad: Actividad[]) {
    const actividades = actividad;
    this.actividades = actividades;
    this.cantidadActiviadades = actividades.length;
    this.switchRepetirDia = false;

    this.btnVerDetalleEnabled = this.cantidadActiviadades !== 0;
    setTimeout(() => {
      this.gridApi.forEachNode((x: RowNode, index) => {
        if (index === 0) {
          x.setSelected(true);
          this.gridApi.ensureNodeVisible(x, 'middle');
        }
      });
    });
    return actividades;
  }

  async handleAbrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    if (this.switchRepetirDia) {
      return;
    }

    const actividadSeleccionada = this.$store.getters.getActividadSeleccionada
      .actividadSeleccionada;

    if (show) {
      var actividadId: any;

      this.gridApi.setRowData(this.actividades);
      this.gridApi.paginationGoToFirstPage();

      if (!actividadSeleccionada) {
        const ultimaActividad = this.gridApi.getRowNode('0');
        if (ultimaActividad) {
          if (!this.$store.getters.getRepetirDiaAbierto.repetirDiaAbierto) {
            actividadEventBus.seleccionar(ultimaActividad.data);
          }

          actividadId = ultimaActividad.data.id;
        }
      } else {
        // actividadEventBus.seleccionar(actividadSeleccionada);
        actividadId = actividadSeleccionada.id;
      }

      this.gridApi.forEachNode(node => {
        if (node.data.id === actividadId) {
          node.setSelected(true);
          setTimeout(() => {
            //Caso especial: la tabla debe estar visible para que ensureNodeVisible se ejecute. Tiene una directiva v-show
            this.gridApi.ensureNodeVisible(node);
          });
        }
      });
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

  createIconoOrientacionCell(params: any) {
    if (!params.data) {
      return;
    }
    if (params.data.id !== undefined) {
      var eSpan = document.createElement('i');
      eSpan.innerHTML = 'arrow_upward';
      eSpan.className = 'material-icons';
      eSpan.id = params.data.id;
      var estiloOrientacion = '';
      if (params.data.heading > 0) {
        estiloOrientacion =
          '-webkit-transform: rotate(' +
          params.data.heading +
          'deg); -moz-transform: rotate(' +
          params.data.heading +
          'deg); -ms-transform: rotate(' +
          params.data.heading +
          'deg); -o-transform: rotate(' +
          params.data.heading +
          'deg); transform: rotate(' +
          params.data.heading +
          'deg);';
      }
      eSpan.style.cssText =
        'cursor:pointer;color:#27488e;font-size: 18px;' + estiloOrientacion;
      eSpan.title = params.data.heading + '°';
      return eSpan;
    }
  }

  makeIconoActividadExtendida(params: RowNode) {
    if (!params.data || !params.data.id) {
      return;
    }
    const icon = document.createElement('i');
    icon.id = params.data.id;

    if (!params.data.extendida) {
      return icon;
    }

    icon.innerHTML = 'settings_remote';
    icon.className = 'material-icons';
    icon.style.cssText = 'cursor:pointer;color:green;font-size: 18px;';
    icon.title = 'Con actividades extendidas';
    return icon;
  }
}
</script>
<style scoped>
#grillaDetalle {
  height: 400px !important;
  scrollbar-width: 400px !important;
  overflow: scroll;
}
</style>

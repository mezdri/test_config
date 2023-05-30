<template>
  <div class="splitter">
    <div id="first">
      <div style="padding: 20px">
        <v-layout row class="light--text">
          <v-flex sm4 md3>
            <h3>
              Vehículo <br />
              {{ patente }}
            </h3>
          </v-flex>

          <v-flex sm4 md4>
            <v-select
              v-model="intervaloSeleccionado"
              v-validate="'required'"
              :items="intervalosRepetirDia"
              label="Velocidad en Segundos."
              data-vv-name="select"
              required
              :disabled="iconPlay"
            ></v-select>
          </v-flex>

          <v-flex sm4 md5 class="py-2">
            <div style="margin-left: 15px; text-align: right">
              <v-btn-toggle>
                <v-btn
                  fab
                  small
                  color="primary"
                  style="margin: 0"
                  @click="previous()"
                  :disabled="isDisabled"
                >
                  <v-icon color="white"> skip_previous </v-icon>
                </v-btn>
                <v-btn
                  fab
                  small
                  color="primary"
                  style="margin: 0"
                  dark
                  @click="play()"
                >
                  <v-icon color="white">
                    {{ iconPlay ? 'pause' : 'play_arrow' }}
                  </v-icon>
                </v-btn>
                <v-btn
                  fab
                  small
                  color="primary"
                  style="margin: 0"
                  :disabled="isDisabled"
                  @click="next()"
                >
                  <v-icon color="white"> skip_next </v-icon>
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
      </div>

      <grid
        style="width: 100%; font-family: 'Asap', sans-serif"
        class="ag-theme-material"
        :gridOptions="gridOptions"
        :funcionalidad-id="funcionalidadActividades"
        :immutableColumns="true"
      ></grid>
    </div>
    <div id="separator">
      <div class="btn_left">
        <v-icon color="#7D8493" @click="closeFirstDiv()">chevron_left</v-icon>
      </div>
      <div class="btn_right">
        <v-icon color="#7D8493" @click="fullFirstDiv()">chevron_right</v-icon>
      </div>
    </div>
    <div id="second" style="background-color: #bbb">
      <mapa :actividadesMap="mapsActivities"></mapa>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import Mapa from '@/pantallas/Inicio/Mapa/MapaRepetirDiaV2.vue';
import GridRdia from '@/reusable/Grid/GridRdia.vue';
import { LoadingService } from '@/services/loadingService';
import moment from 'moment';
import { Funcionalidades } from '@/config/funcionalidades';
import { ColumnState } from 'ag-grid-community/dist/lib/columnController/columnController';
import {
  GridOptions,
  GridApi,
  ColDef,
  ColumnApi,
  GridReadyEvent,
  CellClickedEvent,
} from 'ag-grid-community';
import { RowNode as GenericRowNode } from '@/reusable/Grid/aggridUtils';
import { ActividadRepetirDiaIntersection } from '@/pantallas/Inicio/ActividadesData/ActividadRepetirDiaIntersection';
import {
  RepetirDia,
  RepetirDiaRequest,
  fetchRepetirDia,
} from '@/pantallas/Inicio/RepetirDiaData/fetchRepetirDia';
import { toInteger } from 'lodash';
import { rDiaEvents } from '@/pantallas/RepetirDia/rdiaEventBus';

type RowNode = GenericRowNode<ActividadRepetirDiaIntersection>;

@Component({
  components: {
    DatePicker,
    mapa: Mapa,
    grid: GridRdia,
  },
})
export default class RepetirDia_two extends Vue {
  readonly funcionalidadActividades: Funcionalidades =
    Funcionalidades.GrillaActividadHome;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefActual: ColDef[] = [];
  estadoColumnas: ColumnState[] = [];
  lastSortModel: { colId?: string; sort?: string } = {};
  loadingService = new LoadingService();
  rowData: ActividadRepetirDiaIntersection[] = [];
  mapsActivities: any = [];
  patente: string = '';
  idvehiculo: string = '';
  actividades: RepetirDia[] = [];
  actividadId: number = 0;
  fechadesde: string;
  fechahasta: string;
  actSeleccionada: any;
  iconPlay: boolean = false;
  isDisabled: boolean = false;
  intervaloSeleccionado: number = 1.0;
  intervalosRepetirDia: number[] = [0.5, 1.0, 1.5, 2.0];
  inciado: boolean = false;
  indexSelected: number = 0;

  // #region ColumnsDefs
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
      lockPinned: true,
      hide: false,
    },
    {
      headerName: 'Longitud',
      field: 'longitud',
      width: 120,
      lockPinned: true,
      hide: false,
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
    onCellClicked: this.onCellClicked,
    overlayLoadingTemplate:
      '<span class="ag-overlay-loading-center">Cargando...</span>',
  };
  // navigateToNextCell: this.navigateToNextCell,
  // onCellClicked: this.onCellClicked,
  // #endregion

  async mounted() {
    this.idvehiculo = localStorage.getItem('idVehiculoRdia');
    this.patente = localStorage.getItem('patenteVehiculoRdia');
    this.fechadesde = localStorage.getItem('fechaDesde');
    this.fechahasta = localStorage.getItem('fechaHasta');

    await this.cargaActividadesRdia();
    this.dragElement(document.getElementById('separator'), 'H');
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  play() {
    if (this.iconPlay == true) {
      this.iconPlay = false;
      this.isDisabled = false;
    } else {
      this.iconPlay = true;
      this.isDisabled = true;
    }
    const largeArray = this.actividades.length - 1;

    const interval = setInterval(() => {
      if (this.iconPlay == true) {
        let node = this.gridApi.getRowNode(this.indexSelected.toString());
        node.setSelected(true);
        this.gridApi.ensureNodeVisible(node, 'middle');

        const actividad = node.data;
        this.actSeleccionada = actividad;
        rDiaEvents.$emit('actividadSelected', actividad);

        if (largeArray > this.indexSelected) {
          this.indexSelected++;
        } else {
          this.indexSelected = 0;
          this.iconPlay = false;
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, this.getIntervalo());
  }

  next() {
    this.indexSelected++;
    let node = this.gridApi.getRowNode(this.indexSelected.toString());
    node.setSelected(true);
    this.gridApi.ensureNodeVisible(node, 'middle');
    const actividad = node.data;
    this.actSeleccionada = actividad;
    rDiaEvents.$emit('actividadSelected', actividad);
  }
  previous() {
    this.indexSelected--;
    let node = this.gridApi.getRowNode(this.indexSelected.toString());
    node.setSelected(true);
    this.gridApi.ensureNodeVisible(node, 'middle');
    const actividad = node.data;
    this.actSeleccionada = actividad;
    rDiaEvents.$emit('actividadSelected', actividad);
  }

  getIntervalo() {
    // intervalosRepetirDia: number[] = [0.5, 1.0, 1.5, 2.0];
    this.intervaloSeleccionado;

    switch (this.intervaloSeleccionado) {
      case 0.5:
        return 500;

      case 1.0:
        return 1000;

      case 1.5:
        return 1500;

      case 2.0:
        return 2000;

      default:
        return 1000;
    }
  }

  onCellClicked(event: CellClickedEvent) {
    this.indexSelected = event.rowIndex;
    const actividad = event.data;
    this.actSeleccionada = actividad;
    rDiaEvents.$emit('actividadSelected', actividad);
  }

  async cargaActividadesRdia() {
    let clienteId = localStorage.getItem('clienteDefecto');

    let fechadesde = moment(this.fechadesde, 'YYYY-MM-DDTHH:mm:ss');
    let fechahasta = moment(this.fechahasta, 'YYYY-MM-DDTHH:mm:ss');

    let parametros: RepetirDiaRequest = {
      clienteId: toInteger(clienteId),
      vehiculoId: toInteger(this.idvehiculo),
      fechaInicio: new Date(fechadesde.toString()),
      fechaTermino: new Date(fechahasta.toString()),
      orderDescending: false,
    };

    this.actividades = await fetchRepetirDia(parametros);

    this.mapsActivities = this.actividades.map(x => {
      return {
        id: x.id,
        latitud: x.latitud,
        longitud: x.longitud,
        ubicacion: x.ubicacion,
        heading: x.heading,
        fecha: x.fechaActividad,
        tipoActividad: x.actividadTipoNombre,
        conductor: x.nombreConductor,
        velocidad: x.velocidadActual,
      };
    });
    this.gridApi.setRowData(this.actividades);
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

  dragElement(element: any, direction: any) {
    let md: any = {}; // remember mouse down info
    const first = document.getElementById('first');
    const second = document.getElementById('second');

    element.onmousedown = onMouseDown;

    function onMouseDown(e: any) {
      //console.log("mouse down: " + e.clientX);
      md = {
        e,
        offsetLeft: element.offsetLeft,
        offsetTop: element.offsetTop,
        firstWidth: first.offsetWidth,
        secondWidth: second.offsetWidth,
      };

      document.onmousemove = onMouseMove;
      document.onmouseup = () => {
        //console.log("mouse up");
        document.onmousemove = document.onmouseup = null;
      };
    }

    function onMouseMove(e: any) {
      //console.log("mouse move: " + e.clientX);
      var delta = { x: e.clientX - md.e.clientX, y: e.clientY - md.e.clientY };

      if (direction === 'H') {
        // Horizontal
        // Prevent negative-sized elements
        delta.x = Math.min(Math.max(delta.x, -md.firstWidth), md.secondWidth);

        element.style.left = md.offsetLeft + delta.x + 'px';
        first.style.width = md.firstWidth + delta.x + 'px';
        second.style.width = md.secondWidth - delta.x + 'px';
      }
    }
  }

  fullFirstDiv() {
    document.getElementById('first').style.width = '99%';
    document.getElementById('second').style.width = '0px';
  }

  closeFirstDiv() {
    var isMobile = '';
    if (navigator.userAgent.toLowerCase().match(/mobile/i) != null) {
      isMobile = 'mobile';
    }

    if (isMobile == 'mobile') {
      document.getElementById('first').style.minWidth = '0px';
      document.getElementById('first').style.width = '0px';
      document.getElementById('second').style.width = '100%';
    } else {
      document.getElementById('first').style.width = '30px';
      document.getElementById('second').style.width = '100%';
    }
  }
}
</script>

<style scoped>
.splitter {
  width: 100%;
  height: 1142px;
  display: flex;
}
#separator {
  cursor: col-resize;
  background-image: url('~@/assets/puntos.svg');
  background-color: #f1f4f5;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 100%;
  min-width: 20px;
  border-left: solid 2px #ccd1d3;
  border-right: solid 2px #ccd1d3;

  /* Prevent the browser's built-in drag from interfering */
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
#first {
  width: 30%;
  transition: 0.5s;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-x: hidden;
  transition: 0.5s;
  min-width: 250px;
}
.btn_left {
  margin: 0;
  position: absolute;
  top: 45%;
  margin-left: -5px;
  cursor: pointer;
}

#second {
  width: 70%;
  height: 1024px;
}

.btn_right {
  margin: 0;
  position: absolute;
  top: 53%;
  margin-left: -5px;
  cursor: pointer;
}
</style>

<template>
  <div id="container" class="dashboard">
    <MapComponent :openDialog="openDialog" :event="currentEvent" />

    <div id="dashboardContainer">
      <v-card
        id="cardDashboard"
        v-for="item in listDashboard"
        :key="item.key"
        :style="porcentVCard"
        :class="item.tag"
        @click="filtroWidget(item.tag)"
      >
        <div style="text-align:center">
          <div class="titleCard">{{ item.title }}</div>
          <div class="contentCard">{{ item.value }}</div>
        </div>
      </v-card>
    </div>
    <div id="descriptionActiveContainer">
      <ul>
        <h3 style="font-size: 1.6vmin; font-weight: 400;">
          *Se considera activo cuando haya reportado su posición o una alerta.
        </h3>
      </ul>
      <ul>
        <h3 style="font-size: 1.6vmin; font-weight: 400;">
          *Se considera en línea cuando la cámara está conectada al servidor.
        </h3>
      </ul>
    </div>
    <div id="filtersContainer">
      <div id="filtersContainerLeft">
        <div id="filtersContainerLeft-left">
          <v-text-field
            style="margin-left: 1%"
            v-model="searchInput"
            @input="searchData"
            label="Buscar..."
          ></v-text-field>
        </div>
      </div>
      <div id="filtersContainerRight">
        <v-btn
          id="btnExportCsv"
          flat
          small
          color="primary"
          @click="onBtnExport"
        >
          <v-icon class="importExportBtnIcon">cloud_download</v-icon
          >&nbsp;&nbsp;
          <span class="importExportBtnTexto">Exportar<br />CSV</span>
        </v-btn>
      </div>
    </div>
    <div id="gridContainer">
      <v-card style="width: 100%; ">
        <GridComponent
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        ></GridComponent
      ></v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
const { AgGridVue } = require('ag-grid-vue');
import Confirmation from '@/components/Confirmation.vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import MapComponent from '@/pantallas/Camaras/MapComponent.vue';

import '../ClassAggrid.css';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

@Component({
  components: { GridComponent: AgGridVue, MapComponent },
})
export default class CamaraDashboard extends ComponenteBase {
  funcionalidad: Funcionalidades = Funcionalidades.CamarasDashboard;
  loadingService = new LoadingService();
  gridOptions: GridOptions;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  localeText: any = {};
  $snotify: any;
  checkAllPatent: boolean = false;
  currentEvent: any = null;
  openDialog: boolean = false;
  map: google.maps.Map = null;
  mapName: string = 'dashboard-cam-map';
  gridList: any[] = [];
  widgetSelected: any = '';
  cssMap: {} = {
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'flex-start',
  };
  // infoWindow = new google.maps.InfoWindow({
  //   disableAutoPan: true,
  // });

  listDashboard: { title: string; value: any; key: any }[] = [];
  searchInput: string = '';
  accionDashboard: PermisoAccion = {
    accionCodigo: CodigoAccion.detallesDashboard,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [this.accionDashboard];

  constructor() {
    super();
    if (window.localStorage.getItem('dashboard-vigilanti') == '1') {
      this.funcionalidad = Funcionalidades.DashboardVigilanti;
    }
    this.columnDefs = [
      {
        headerName: 'Fecha Última Conexión',
        field: 'fecha_ultima_conexion',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Unidad',
        field: 'patente_vehiculo',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: this.renderState,
      },
      {
        headerName: 'Id Cámara',
        field: 'id_camara',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Latitud',
        field: 'latitud',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Longitud',
        field: 'longitud',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Ver Mapa',
        field: 'latitud',
        sortable: true,
        resizable: true,
        width: 80,
        pinned: 'right',
        lockPinned: true,
        onCellClicked: this.renderMap,
        cellStyle: this.cssMap,
        cellRenderer: params => {
          return params.data.latitud != '-1' &&
            params.data.longitud != '-1' &&
            params.data.latitud != '0' &&
            params.data.longitud != '0' &&
            params.data.latitud != null &&
            params.data.longitud != null
            ? '<i class="material-icons" id="iconMap" title="Ver Mapa" style="margin-top: 60%; color: #27488e" >map</i>'
            : '';
        },
        cellClass: 'cellClassAggrid',
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      onGridSizeChanged: event => {
        event.api.sizeColumnsToFit();
      },
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      //onSelectionChanged: this.onSelectionChanged,
      //onRowSelected: this.onSelectionRow,
      //onCellClicked: this.onSelectionRow,
      // onCellMouseOver: this.mouseOverEvent,
      // onCellMouseOut: this.mouseOverOut,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      blockLoadDebounceMillis: 350,
      //onDragStopped: this.onDragStoppedEvent,
      //onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {},
      suppressCsvExport: false,
      suppressExcelExport: true,
    };
  }

  filtroWidget(tipo: any) {
    let list: any;
    //si el filtro seleccionado es el mismo tipo,
    //está deshabilitando la seleccion
    if (this.widgetSelected == tipo) {
      list = document.querySelectorAll('.dashboard #cardDashboard.disabled');
      for (let i = 0; i < list.length; ++i) {
        list[i].classList.remove('disabled');
      }
      this.widgetSelected = null;
      this.filterGrid('');
      return;
    }
    //quito todos los disabled si hay
    list = document.querySelectorAll('.dashboard #cardDashboard.disabled');
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.remove('disabled');
    }
    //Marco disabled todo menos el nuevo.
    list = document.querySelectorAll(
      '.dashboard #cardDashboard:not(.' + tipo + ')'
    );
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.add('disabled');
    }
    this.widgetSelected = tipo;
    this.filterGrid(tipo.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    // this.alertFilter(false);
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
  }

  filterGrid(filter: string) {
    if (filter == '') {
      this.gridApi.setRowData(this.gridList);
    } else {
      var filters: any[] = this.gridList.filter(
        (item: any) =>
          item.KEY_TOT.includes(filter) || item.KEY.includes(filter)
      );
      this.gridApi.setRowData(filters);
    }
  }

  onBtnExport() {
    var columnKeys: string[] = [
      'fecha_ultima_conexion',
      'patente_vehiculo',
      'estado',
      'id_camara',
      'latitud',
      'longitud',
    ];
    if (this.accionesTotales[0].visible) {
      columnKeys.push('sistema');
      columnKeys.splice(0, 0, 'fecha_ingreso');
    }
    this.gridOptions.api.exportDataAsCsv({
      suppressQuotes: true,
      columnKeys: columnKeys,
      fileName: 'dispositivos_monitoreados',
    });
  }

  searchData() {
    this.gridApi.setQuickFilter(this.searchInput);
    this.gridApi.setDomLayout('autoHeight');
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  renderState(params: any) {
    const text =
      '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
      params.value;
    '</a>';

    if (
      params.value.toUpperCase().includes('EN LINEA') ||
      params.value.toUpperCase().includes('EN LÍNEA')
    ) {
      return (
        '<i class="material-icons" title="En Línea" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(42, 255, 78)"></i>' +
        text
      );
    } else if (params.value.toUpperCase().includes('DESCONECTADO')) {
      return (
        '<i class="material-icons" title="Desconectado" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(255, 58, 58)"></i>' +
        text
      );
    } else if (
      params.value.toUpperCase().includes('SIN INFORMACION') ||
      params.value.toUpperCase().includes('SIN INFORMACIÓN')
    ) {
      return (
        '<i class="material-icons" title="Sin Información" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(33, 33, 255)"></i>' +
        text
      );
    } else {
      return (
        '<i class="material-icons" title="Sin Información" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(33, 33, 255)"></i>' +
        text
      );
    }

    // switch (params.value) {
    //   case 'En Linea':
    //     return (
    //       '<i class="material-icons" title="En Linea" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(42, 255, 78)"></i>' +
    //       text
    //     );
    //   case 'En Línea':
    //     return (
    //       '<i class="material-icons" title="En Línea" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(42, 255, 78)"></i>' +
    //       text
    //     );
    //   case 'Desconectado':
    //     return (
    //       '<i class="material-icons" title="Desconectado" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(255, 58, 58)"></i>' +
    //       text
    //     );
    //   case 'Sin Información':
    //     return (
    //       '<i class="material-icons" title="Sin Información" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(33, 33, 255)"></i>' +
    //       text
    //     );
    //   default:
    //     return (
    //       '<i class="material-icons" title="Sin Información" style="width: 24px; height: 24px;margin-top: 4%; border-radius: 50%; background: rgb(33, 33, 255)"></i>' +
    //       text
    //     );
    // }
  }

  getHtmlFromState(state: string): string {
    const style =
      'width: 24px; height: 24px;margin-top: 2%; border-radius: 50%; ';
    var html = '';
    var css = '';
    if (state == 'Linea') {
      css = style + ' background: rgb(42, 255, 78)';
    } else if (state == 'Desconecta') {
      css = style + ' background: rgb(255, 58, 58)';
    } else if (state == 'Sin Info') {
      css = style + ' background: rgb(33, 33, 255)';
    }
    return css;
  }

  @Watch('openDialog')
  onDialogChanged() {}

  updateMouseCoordinates(event: MouseEvent) {
    const point2LatLng = (point: google.maps.Point) => {
      const { map } = this;
      const topRight = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getNorthEast());
      const bottomLeft = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getSouthWest());
      const scale = Math.pow(2, map.getZoom());
      const worldPoint = new google.maps.Point(
        point.x / scale + bottomLeft.x,
        point.y / scale + topRight.y
      );
      return map.getProjection().fromPointToLatLng(worldPoint);
    };
  }

  renderMap(event: any) {
    if (event.value) {
      var lat = event.data.latitud != null ? event.data.latitud : -28.851947;

      var lon: number =
        event.data.longitud != null ? event.data.longitud : -70.035511;

      var data = {
        latitud: lat,
        longitud: lon,
        fecha: event.data.fecha_ingreso,
      };

      this.currentEvent = data;
      this.openDialog = true;
    }
  }

  generateHtml(coords: string, date: string): string {
    var html: string = '';

    html =
      '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h1 id="firstHeading" class="firstHeading">Última Actividad</h1>' +
      '<div id="bodyContent">' +
      '<p></p>' +
      `<p><b style="font-weight: 700;">Fecha: </b> ${date}</p>` +
      `<p><b style="font-weight: 700;">Coordenadas: </b> ${coords}</p>` +
      '</div>' +
      '</div>';

    return html;
  }

  mounted() {
    this.loadingService.showLoading();
    this.getDashboardCamera();
    if (this.accionesTotales[0].visible) {
      this.columnDefs.splice(3, 0, {
        headerName: 'Sistema',
        field: 'sistema',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      });
      this.columnDefs.splice(0, 0, {
        headerName: 'Fecha Última Actividad',
        field: 'fecha_ingreso',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      });
      this.gridOptions.api.setColumnDefs(this.columnDefs);
    }
    //this.getDashboardGrid();
  }

  created() {
    var self = this;
    window.addEventListener('popstate', function() {
      console.log('location changed!');
    });
    CamaraEventBus.$on('reloadComponent', () => {
      this.loadingService.showLoading();
      self.getDashboardCamera();
      //self.getDashboardGrid();
      console.log('REINICIAR COMPONENTES');
    });
    CamaraEventBus.$on('closeMap', () => {
      self.openDialog = false;
    });
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 41) {
      retorno = item.substr(0, 40) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  isUndefined(value: any): string {
    return value == undefined ? '0' : value;
  }

  formatDictToArray(dict: any) {
    var listDashboard: {
      title: string;
      tag: string;
      value: any;
      key: any;
    }[] = [];
    Object.entries(dict).forEach(([key, value], index) => {
      //console.log(`${index}: ${key} = ${value}`);
      listDashboard.push({
        title: key.replace(/_/g, ' '),
        tag: key,
        value: value,
        key: index,
      });
    });
    this.listDashboard = listDashboard;
  }

  get porcentVCard() {
    const porcent = ((100 / this.listDashboard.length) | 0) - 1;
    return `width: ${porcent}%`;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 3798;
  }

  async getDashboardCamera() {
    this.loadingService.showLoading();
    let url = new URL(window.location.href);
    let menu =
      url.searchParams.get('m') == null ? 'Camaras' : url.searchParams.get('m');
    const body: any = { id_cliente: this.getClientID(), menu: menu };
    if (this.accionesTotales[0].visible) {
      body.admin = 'SI';
    }
    fetchCamaraModulo(body, 'dashboard_monitoreo_camaras')
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          if (response.data.data.hasOwnProperty('widgets')) {
            this.formatDictToArray(response.data.data.widgets);
          } else {
            this.formatDictToArray({});
          }

          if (response.data.data.hasOwnProperty('detalle')) {
            this.gridList = response.data.data.detalle;
            this.gridApi.setRowData(response.data.data.detalle);
          } else {
            this.gridApi.setRowData([]);
          }
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al traer los datos.');
      })
      .finally(() => {
        this.gridApi.setDomLayout('autoHeight');
        this.loadingService.hideLoading();
      });
  }
}
</script>
<style scoped>
#container {
  height: 83vh;
  width: 100%;
}
#dashboardContainer {
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  -background: red;
}
#descriptionActiveContainer {
  height: 3%;
}
#filtersContainer {
  height: 15%;
  display: flex;
}
#filtersContainerLeft {
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  -background: rgb(114, 114, 240);
}
#filtersContainerLeft-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 65%;
}
#filtersContainerRight {
  -background: rgb(0, 183, 255);
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  padding-right: 1%;
  justify-content: flex-end;
}
#gridContainer {
  height: 62%;
  -background: green;
}
.autoCompleteFilter {
  width: 25%;
  margin-left: 1%;
  position: fixed;
}
.btnSearch {
  margin-left: 1%;
  margin-right: 1%;
  height: 34%;
  width: 15%;
}
#cardDashboard {
  height: 70%;
  margin: 1%;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #fafafa;
  background: #526da5;
  color: white;
  cursor: pointer;
}
#cardDashboard.disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

#cardDashboard:hover {
  height: 68%;
  margin: 1%;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.titleCard {
  font-weight: 900;
  font-size: 1.6vmin;
}
.contentCard {
  margin-top: 2%;
  font-weight: 300;
  font-size: 1.6vmin;
}
#headerDialogVideo {
  display: flex;
  align-items: center;
  height: 10%;
  background: #27488e;
}
h2.textstyle {
  color: white;
  font-family: 'Asap', sans-serif !important;
  font-weight: normal;
}
#vCardDialogVideo {
  height: 80vh;
  width: 100%;
}
#bodyDialogVideo {
  /* display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; */
  height: 90%;
  width: 100%;
}
.google-map {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: gray;
}
.v-dialog--active {
  width: auto !important;
}
.cellClassAggrid {
  background: blue;
}

#gridComponent {
  width: 100%;
  font-family: 'Asap', sans-serif;
}

.importExportBtnIcon {
  font-size: 30px;
}
#btnExportCsv {
  height: auto;
}
.wrapper-widget {
  position: relative;
  border: 1px solid #fafafa;
  background: #526da5;
  padding: 10px !important;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}
.wrapper-widget.disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}
.wrapper-widget p.title-widget {
}
.wrapper-widget p.count {
  bottom: 0;
  position: absolute;
  margin-bottom: 5px;
  font-weight: bold;
}
</style>

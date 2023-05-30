<template>
  <v-container fluid grid-list-md id="vContainerStyle">
    <v-tabs left color="transparent">
      <v-tab>Informes Generados</v-tab>
      <v-spacer></v-spacer>
      <v-btn @click="showDialog(true)">Generar Certificado</v-btn>
    </v-tabs>

    <v-divider />
    <div id="mainDiv">
      <v-dialog v-model="showInfoDialog" width="500">
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Validez del Certificado</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card max-height="300" id="bodyDialogInfo">
          <div style="margin-left: 20px; margin-top: 20px">
            <div
              v-for="item in infoItems"
              :key="item.index"
              class="itemInfoDiv"
            >
              <li>
                <strong style="margin-right: 7px">{{ item.key }}: </strong>
                {{ item.value }}
              </li>
            </div>
          </div>
        </v-card>
      </v-dialog>
      <div id="headerDiv">
        <div style="width: 50%;">
          <v-text-field
            v-model="searchReport"
            label="Buscar..."
            single-line
            hide-details
            style="width: 70%"
            @input="handleSearch"
          />
        </div>
        <fieldset
          style="margin: 1.5em; display: flex; height: 95%; border:1px solid #dcdcdc; margin-left: auto;"
        >
          <legend
            style="margin-left: 0.3rem; color: #9e9e9e;font-size: 0.8rem;"
          >
            Búsqueda por Fecha Generación
          </legend>
          <span
            style="display: flex; align-items: center; justify-content: flex-end"
          >
            <div style="margin: 20px">
              <DatePicker
                :label="formsFields.fechaDesde.label"
                :error-messages="errors.collect(formsFields.fechaDesde.id)"
                :id="formsFields.fechaDesde.id"
                v-model="formsFields.fechaDesde.value"
                :min="fechaMinima"
                :max="fechaMaxima"
                @input="validateDates"
                v-validate="'required'"
              />
            </div>
            <div style="margin: 20px">
              <DatePicker
                :label="formsFields.fechaHasta.label"
                :error-messages="errors.collect(formsFields.fechaHasta.id)"
                :id="formsFields.fechaHasta.id"
                v-model="formsFields.fechaHasta.value"
                :min="fechaMinima"
                :max="fechaMaxima"
                @input="validateDates"
                v-validate="'required'"
              />
            </div>
            <v-btn
              @click="intervalSearchReports"
              :disabled="datesHasChange"
              color="#FFE700"
              >Buscar</v-btn
            >
          </span>
        </fieldset>
      </div>
      <div id="bodyDiv">
        <div style="height: 100%; width: 100%">
          <div class="gridcard rounded-card">
            <ag-grid-vue
              style="width: 100%; height: 100%; font-family: 'Asap', sans-serif;"
              class="ag-theme-material"
              :gridOptions="gridOptions"
            ></ag-grid-vue>
          </div>
        </div>
      </div>
    </div>
    <CertificadosSucursal
      :show="dialog"
      @close="showDialog($event)"
    ></CertificadosSucursal>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { fetchInformes } from '@/pantallas/Informes/InformesGenerados/fetchInformesGenerados';
import moment from 'moment';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { LoadingService } from '@/services/loadingService';
import CertificadosSucursal from '@/pantallas/SucursalVirtual/Certificados/CertificadosSucursal.vue';

@Component({
  components: { 'ag-grid-vue': AgGridVue, DatePicker, CertificadosSucursal },
})
export default class InformesGeneradosSV extends Vue {
  readonly urlServiceReport: string = 'get_reports';
  loadingService = new LoadingService();

  dialog: boolean = false;

  formsFields: {
    fechaDesde: { id: string; label: string; value: any };
    fechaHasta: { id: string; label: string; value: any };
  } = {
    fechaDesde: {
      id: '1110',
      label: 'Desde',
      value: moment(new Date()).add(-7, 'days'),
    },
    fechaHasta: {
      id: '1111',
      label: 'Hasta',
      value: moment(new Date()),
    },
  };
  formSend: { fechaDesde: any; fechaHasta: any } = {
    fechaDesde: moment(new Date()).add(-7, 'days'),
    fechaHasta: moment(new Date()),
  };
  currentDates: { fechaDesde: any; fechaHasta: any } = {
    fechaDesde: '',
    fechaHasta: '',
  };
  datesHasChange: boolean = false;

  gridOptions: GridOptions;
  localeText: any = {};
  sideBar: any = {};
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef | ColGroupDef> = [];
  agGridUtil: AgGridUtil;
  searchReport: string = '';
  timer: any = '';
  serverSide: any;
  showInfoDialog: boolean = false;
  infoItems: any[] = [];
  infoTypeReport: string = '';

  constructor() {
    super();

    this.columnDefs = [
      {
        headerName: 'Id Informe',
        field: 'id_reporte',
        sortable: true,
        resizable: true,
        minWidth: 80,
        width: 130,
        lockPinned: true,
      },
      {
        headerName: 'Fecha Generación',
        field: 'fecha_ingreso',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sort: 'desc',
      },
      {
        headerName: 'Tipo Informe',
        field: 'nombre_reporte',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Formato Informe',
        field: 'formato_reporte',
        sortable: true,
        resizable: true,
        minWidth: 80,
        width: 170,
        lockPinned: true,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: this.getHtml,
      },
      {
        headerName: 'Intentos',
        field: 'reintentos',
        sortable: false,
        resizable: false,
        minWidth: 80,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Descarga',
        field: 'estado',
        sortable: false,
        resizable: true,
        minWidth: 80,
        width: 120,
        lockPinned: true,
        cellRenderer: params => {
          if (
            params.data.estado == 'TERMINADO' &&
            params.data.token != 'token' &&
            params.data.token != '' &&
            !this.isTokenOK(params.data.fecha_ingreso)
          ) {
            var token = params.data.token;
            var html =
              '<i class="material-icons" id="5544" title="Descargar informe" style="width: 28px; color: rgb(39, 72, 142); height: 28px; margin-top: 65%">file_download_outlined </i>';
            return html;
          } else {
            return '<i class="material-icons" id="5545" title="No Se Puede Descargar" style="width: 28px; height: 28px; margin-top: 65%" >file_download_off_outlined</i>';
          }
        },
        cellStyle: params => {
          return params.data.estado == 'TERMINADO' &&
            params.data.token != 'token' &&
            params.data.token != '' &&
            !this.isTokenOK(params.data.fecha_ingreso)
            ? {
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'flex-start',
                cursor: 'pointer',
              }
            : {
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'flex-start',
              };
        },
      },
      {
        headerName: 'Detalles',
        field: 'fecha_real',
        type: 'medalColumn',
        tooltipField: 'country',
        cellRenderer: () => {
          return '<i class="material-icons" id="5545" title="Ver Detalle" style="width: 28px; height: 28px; margin-top: 10%" >info_outlined</i>';
        },
        cellStyle: () => {
          return { cursor: 'pointer' };
        },
        onCellClicked: this.handleClickInfo,
        columnGroupShow: 'closed',
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 10, //Solución Paginación
      cacheBlockSize: 10, //Solución Paginación //Ordenamiento + Selección
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      onCellClicked: this.downloadFile,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      columnTypes: {
        medalColumn: { width: 150, columnGroupShow: 'open', filter: false },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  downloadFile(event: any) {
    if (event.colDef.headerName == 'Descarga') {
      var tk = event.data.token;
      let _url_base = process.env.VUE_APP_SERVICIO_MS;
      window.open(_url_base + 'descarga_reporte?tk=' + tk, '_blank');
    }
  }

  validateDates() {}

  showDialog(e: boolean) {
    this.dialog = e;
  }

  get fechaMaxima() {
    const fechaMax = moment().format('YYYY-MM-DD h:mm:ss a');
    return fechaMax;
  }

  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }

  get today() {
    return moment(new Date());
  }

  get semanaAnterior() {
    let fechaMin = moment(new Date()).add(-7, 'days');
    return fechaMin;
  }

  handleClickInfo(event: any) {
    var itemsInfo: any[] = [];
    if (event.value != '' && event.value != undefined && event.value != null) {
      var desde = moment(event.value).format('L');
      var hasta: any = moment(event.value).add(1, 'y');
      hasta = moment(hasta).format('L');
      itemsInfo.push({ key: 'Desde', value: desde });
      itemsInfo.push({ key: 'Hasta', value: hasta });
    }
    this.infoItems = itemsInfo;
    this.infoTypeReport = 'bom dia';
    this.showInfoDialog = true;
  }

  async intervalSearchReports() {
    this.loadingService.showLoading();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  isTokenOK(date: any) {
    /**let token = moment(new Date()).add(-5, 'days');
    console.log(token)
    let today = moment(date);
    if (token.isAfter(today)) {
      return true;
    } else {
      return false;
    }**/
    return false;
  }

  getHtml(params: any): string {
    var css = '';
    if (this.isTokenOK(params.data.fecha_ingreso)) {
      params.data.estado = 'ARCHIVO EXPIRADO';
      css =
        '<i class="material-icons" id="5545" title="Archivo Expirado" style="width: 24px; height: 24px; margin-top: 7%; background: #FF2626; border-radius: 50%;" ></i>';
    } else if (params.data.estado == 'TERMINADO') {
      css =
        '<i class="material-icons" id="5545" title="Terminado" style="width: 24px; height: 24px; margin-top: 7%; background: #26FF26; border-radius: 50%;" ></i>';
    } else if (
      params.data.estado == 'PENDIENTE' ||
      params.data.estado == 'EN_PROCESO'
    ) {
      css =
        '<i class="material-icons" id="5545" title="Pendiente" style="width: 24px; height: 24px; margin-top: 7%; background: #FFF226; border-radius: 50%;"></i>';
    } else if (params.data.estado == 'FALLA') {
      css =
        '<i class="material-icons" id="5545" title="Error" style="width: 24px; height: 24px; margin-top: 7%; background: #FF2626; border-radius: 50%;" ></i>';
    }
    return (
      css +
      '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
      params.data.estado +
      '</a>'
    );
  }

  beforeDestroy() {
    clearInterval(this.timer);
  }

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    const self = this;
    this.startInterval();
    this.loadingService.showLoading();
    this.serverSide = {
      getRows(params: any): void {
        var start_date = moment(self.formsFields.fechaDesde.value.toString())
          .format('YYYY-MM-DD')
          .toString();
        var ending_date = moment(self.formsFields.fechaHasta.value.toString())
          .format('YYYY-MM-DD')
          .toString();
        params.request.search = self.searchReport;
        params.request.paginationPageSize = self.gridOptions.cacheBlockSize;
        var body = Object.assign({}, params.request, {
          id_cliente: self.getClientID(),
          start_date: start_date,
          ending_date: ending_date,
          id_usuario: self.getUserID(),
          pathname: window.location.pathname,
          aplication: 'CERTIFICADO',
        });
        fetchInformes(self.urlServiceReport, body)
          .then((response: any) => {
            if (response.data.total === 0) {
              params.successCallback([{}], 0);
              self.gridApi.showNoRowsOverlay();
            } else {
              params.successCallback(
                response.data.reportes,
                response.data.total
              );
              self.autoSizeAll(false);
              self.gridApi.hideOverlay();
            }
            self.loadingService.hideLoading();
          })
          .catch((error: any) => {})
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
            self.loadingService.hideLoading();
          });
      },
    };
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  startInterval() {
    var self = this;
    this.timer = setInterval(function() {
      self.gridApi.setServerSideDatasource(self.serverSide);
    }, 20000);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  handleSearch(event: string) {
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
  }

  getUserID(): number {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return parseInt(id);
  }
}
</script>

<style scoped>
#vContainerStyle {
  height: 90vh;
  overflow: auto;
}
#mainDiv {
  height: 100%;
  width: 100%;
}
#headerDiv {
  align-items: center;
  display: flex;
  height: 15%;
  width: 100%;
  margin-bottom: 3px;
}
#bodyDiv {
  height: 90%;
  width: 100%;
}
#bodyDialogInfo {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow-y: auto;
}

.itemInfoDiv {
  margin-bottom: 15px;
  font-size: 1.2rem;
}
</style>

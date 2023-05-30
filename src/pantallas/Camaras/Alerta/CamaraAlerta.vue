<template>
  <div class="camaras" style="height: 100%; width: 100%; margin-top: 0.5%">
    <MapComponent :openDialog="openDialog" :event="currentEvent" />
    <div class="flex sm10 md10">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm2 md2>
            <v-autocomplete
              v-model="formFields.fleets.value"
              :label="formFields.fleets.label"
              :items="formFields.fleets.items"
              @input="handleFleet"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm2 md2>
            <v-autocomplete
              v-model="formFields.patents.value"
              :label="formFields.patents.label"
              :items="formFields.patents.items"
              @input="handlePatent"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm2 md2>
            <v-autocomplete
              v-model="formFields.alerts.value"
              :label="formFields.alerts.label"
              :items="formFields.alerts.items"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm3 md3 style="display: flex; align-items: center">
            <v-btn @click="handleClick" icon> <v-icon>search</v-icon></v-btn>
          </v-flex>
        </v-flex>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm2 md2>
            <DatePicker
              :label="formFields.dateStart.label"
              v-model="formFields.dateStart.value"
              v-validate="'required'"
              data-vv-name="fechaInicioRequerida"
              :error-messages="errors.collect('fechaInicioRequerida')"
              required
            />
          </v-flex>
          <v-flex sm2 md2>
            <TimePicker
              :label="formFields.timeStart.label"
              v-model="formFields.timeStart.value"
              v-validate="'required'"
              data-vv-name="horaInicioRequerida"
              :error-messages="errors.collect('horaInicioRequerida')"
              required
            />
          </v-flex>
          <v-flex sm2 md2>
            <DatePicker
              :label="formFields.dateEnd.label"
              v-model="formFields.dateEnd.value"
              v-validate="'required'"
              data-vv-name="fechaFinRequerida"
              :error-messages="errors.collect('fechaFinRequerida')"
              required
            />
          </v-flex>
          <v-flex sm2 md2>
            <TimePicker
              :label="formFields.timeEnd.label"
              v-model="formFields.timeEnd.value"
              v-validate="'required'"
              data-vv-name="horaFinRequerida"
              :error-messages="errors.collect('horaFinRequerida')"
              required
            />
          </v-flex>
        </v-flex>
      </FormFieldsContainer>
    </div>
    <div style="display: flex">
      <v-btn id="btnExportCsv" flat small color="primary" @click="onBtnExport">
        <v-icon class="importExportBtnIcon">cloud_download</v-icon>&nbsp;&nbsp;
        <span class="importExportBtnTexto">Exportar<br />CSV</span>
      </v-btn>
    </div>
    <!-- <div style="height: 20%; width: 100%; display: flex; "> -->
    <WidgetAlerta
      :listaAlertasWidgets="listaAlertasWidgets"
      @filtroWidget="filtroWidget"
    />
    <!-- </div> -->
    <v-card style="width: 100%; margin-top: 1% ">
      <GridComponent
        id="gridComponent"
        ref="gridComponent"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></GridComponent
    ></v-card>
    <div v-if="showReporteGenerado" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Reporte Solicitado</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporte()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <v-flex sm12 md12>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">{{ texto_reporte }}</p>
              </div>
              <div class="text-sm-center">
                <p style="margin-top: 40px;">
                  Puede ver sus reportes en el menú
                  <router-link
                    active-class="router-link-active"
                    style="cursor: pointer; font-size: 13px"
                    to="/informe-generado-camaras"
                    >Informes</router-link
                  >
                </p>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { AgGridVue } from 'ag-grid-vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alerta/WidgetAlerta.vue';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import { LoadingService } from '@/services/loadingService';
import MapComponent from '@/pantallas/Camaras/MapComponent.vue';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
import moment from 'moment';

@Component({
  components: {
    FormFieldsContainer,
    GridComponent: AgGridVue,
    DatePicker,
    TimePicker,
    WidgetAlerta,
    MapComponent,
  },
})
export default class CamaraAlerta extends Vue {
  loadingService: any = new LoadingService();
  dateString: any = new Date();
  openDialog: boolean = false;
  currentEvent: any = null;
  formFields: {
    fleets: any;
    alerts: any;
    patents: any;
    dateStart: any;
    timeStart: any;
    dateEnd: any;
    timeEnd: any;
    alertType: any;
  } = {
    fleets: {
      items: [],
      label: 'Flotas',
      value: '',
    },
    alerts: {
      items: [],
      label: 'Tipos de Alertas',
      value: '',
      checkbox: false,
    },
    patents: {
      items: [],
      label: 'Patentes',
      value: '',
    },
    dateStart: {
      label: 'Fecha inicio',
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
      selectedValue: '',
    },
    timeStart: {
      label: 'Hora Inicio',
      value: moment('00:00', 'HHmm'),
      selectedValue: '00:00:00',
    },
    dateEnd: {
      label: 'Fecha fin',
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
      selectedValue: '',
    },
    timeEnd: {
      label: 'Hora Fin',
      value: moment('23:59', 'HHmm'),
      selectedValue: '23:59:59',
    },
    alertType: {
      value: '',
    },
  };
  cssMap: {} = {
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'flex-start',
  };

  gridOptions: GridOptions;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  serverSide: any;
  columnApi: ColumnApi;
  localeText: any = {};
  widgetSelected: any;
  hashPage: any = '';
  listaAlertasWidgets: any = [];
  $snotify: any;
  showReporteGenerado: boolean = false;
  texto_reporte: string = '';

  mounted() {
    this.getFleets();
    this.getAlertsType();
    this.getPatents();
  }

  created() {
    CamaraEventBus.$on('closeMap', () => {
      this.openDialog = false;
    });
  }

  constructor() {
    super();

    this.columnDefs = [
      {
        headerName: 'Fecha Actividad',
        field: 'fecha_ingreso',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Alarma',
        field: 'alerta',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Flota',
        field: 'flota',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Patente',
        field: 'patente',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Tipo Alarma',
        field: 'tipo_alarma',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Ver Mapa',
        field: '',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        onCellClicked: this.renderMap,
        cellStyle: this.cssMap,
        cellRenderer: params => {
          return params.data.latitud != '-1' &&
            params.data.longitud != '-1' &&
            params.data.latitud != '0' &&
            params.data.longitud != '0'
            ? '<i class="material-icons" id="iconMap" title="Ver Mapa" style="margin-top: 60%; color: #27488e" >map</i>'
            : '';
        },
      },
      {
        headerName: 'Latitud',
        field: 'latitud',
        hide: true,
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Longitud',
        field: 'longitud',
        hide: true,
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 50, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      onGridSizeChanged: event => {
        event.api.sizeColumnsToFit();
      },
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,

      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,

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

  handleFleet() {
    this.getPatents();
  }
  handlePatent() {}

  filtroWidget(tipo: any) {
    let list: any;
    console.log(list);
    //si el filtro seleccionado es el mismo tipo,
    //está deshabilitando la seleccion
    if (this.widgetSelected == tipo) {
      list = document.querySelectorAll('.camaras .wrapper-widget.disabled');
      for (let i = 0; i < list.length; ++i) {
        list[i].classList.remove('disabled');
      }
      this.widgetSelected = null;
      this.formFields.alertType.value = '';
      this.alertFilter(false);
      return;
    }
    //quito todos los disabled si hay
    list = document.querySelectorAll('.camaras .wrapper-widget.disabled');
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.remove('disabled');
    }
    //Marco disabled todo menos el nuevo.
    list = document.querySelectorAll(
      '.camaras .wrapper-widget:not(.' + tipo + ')'
    );
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.add('disabled');
    }
    this.widgetSelected = tipo;
    console.log(this.widgetSelected);
    this.formFields.alertType.value = tipo;
    this.alertFilter(false);
  }

  alertFilter(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
    // if (loadWidget) {
    //   this.buscarAlertasWidgets();
    // }
  }

  onBtnExport() {
    // this.gridOptions.api.exportDataAsCsv({
    //   suppressQuotes: true,
    //   columnKeys: [
    //     'fecha_ingreso',
    //     'alerta',
    //     'flota',
    //     'patente',
    //     'tipo_alarma',
    //     'latitud',
    //     'longitud',
    //   ],
    //   fileName: 'alertas',
    // });
    this.loadingService.showLoading();
    var body: any = {
      id_cliente: this.getClientID(),
      fecha_inicio: this.formFields.dateStart.selectedValue,
      hora_inicio: this.formFields.timeStart.selectedValue,
      fecha_fin: this.formFields.dateEnd.selectedValue,
      hora_fin: this.formFields.timeEnd.selectedValue,
      tipo_alerta: this.widgetSelected ? this.widgetSelected : '',
      cod_flota: this.formFields.fleets.value,
      patente: this.formFields.patents.value,
      tipo_alerta2: this.formFields.alerts.value,
      exportOption: true,
      extension: 'csv',
    };

    fetchCamaraModulo(
      {
        body: body,
        clienteDefecto: localStorage.getItem('clienteDefecto'),
        user_id: JSON.parse(localStorage.getItem('user')).id,
        camaras: true,
      },
      'exportar'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          //this.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.texto_reporte = data.data.MENSAJE_RESPUESTA;
          this.showReporteGenerado = true;
        } else {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return false;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Ocurrió un error. Intente nuevamente.', {
          timeout: 3000,
        });
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
  }

  renderMap(event: any) {
    console.log(event);
    if (
      event.data.latitud != '-1' &&
      event.data.longitud != '-1' &&
      event.data.latitud != '0' &&
      event.data.longitud != '0'
    ) {
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

  async onGridReady(params: GridReadyEvent) {
    var self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.serverSide = {
      getRows(params: any): void {
        params.request.paginationSize = self.gridOptions.cacheBlockSize;

        var body: any = {
          id_cliente: self.getClientID(),
          fecha_inicio: self.formFields.dateStart.selectedValue,
          hora_inicio: self.formFields.timeStart.selectedValue,
          fecha_fin: self.formFields.dateEnd.selectedValue,
          hora_fin: self.formFields.timeEnd.selectedValue,
          tipo_alerta: self.widgetSelected ? self.widgetSelected : '',
          cod_flota: self.formFields.fleets.value,
          patente: self.formFields.patents.value,
          tipo_alerta2: self.formFields.alerts.value,
        };

        if (self.hashPage != '') {
          body['hash'] = this.hashPage;
        }

        body = Object.assign({}, body, params.request);

        fetchCamaraModulo(body, 'getAlertFailure')
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              var resp = response.data.data.detalle;
              self.listaAlertasWidgets = self.formatAlerts(
                response.data.data.widgets
              );
              self.hashPage = 'hash' in resp ? resp.hash : '';
              if (resp.registros.length === 0) {
                params.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                params.successCallback(resp.registros, resp.total_registros);
                self.gridApi.hideOverlay();
              }
            } else {
              params.successCallback([{}], 0);
              self.$snotify.error(response.data.MENSAJE_RESPUESTA, {
                timeout: 3000,
              });
            }
          })
          .catch((error: any) => {
            console.log(error);
            this.$snotify.error('Error al traer los datos.');
          })
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
          });
      },
    };
    this.gridApi.setDomLayout('autoHeight');
    this.firstChargeAlerts();
  }

  formatAlerts(widgets: any): any[] {
    let index = 0;
    var returnAlerts: any[] = [];
    for (let [key, value] of Object.entries(widgets)) {
      returnAlerts.push({
        tipo_alarma: key,
        total: value,
        id: key,
      });
    }
    return returnAlerts;
  }

  async getPatents() {
    this.loadingService.showLoading();
    fetchCamaraModulo(
      {
        clienteDefecto: this.getClientID().toString(),
        flota: this.formFields.fleets.value.toString(),
        grupo: '',
        id_usuario: this.getUserID().toString(),
      },
      'getPatentes'
    )
      .then((response: any) => {
        this.formFields.patents.items = response.data.data;
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async getFleets() {
    this.loadingService.showLoading();
    fetchCamaraModulo(
      { clienteDefecto: this.getClientID().toString() },
      'getFlotas'
    )
      .then((response: any) => {
        this.formFields.fleets.items = response.data.data;
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {});
  }

  async getAlertsType() {
    this.loadingService.showLoading();
    fetchCamaraModulo({}, 'getAlertsType')
      .then((response: any) => {
        this.formFields.alerts.items = response.data.data;
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {});
  }

  firstChargeAlerts() {
    const dateToday = new Date();
    var startDate =
      dateToday.getFullYear() +
      '-' +
      (dateToday.getMonth() + 1).toString() +
      '-' +
      dateToday.getDate();
    var endDate =
      dateToday.getFullYear() +
      '-' +
      (dateToday.getMonth() + 1).toString() +
      '-' +
      dateToday.getDate();

    this.formFields.dateStart.selectedValue = startDate;
    this.formFields.dateEnd.selectedValue = endDate;

    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  async handleClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    if (resultadoValidacion) {
      this.formFields.dateStart.selectedValue = moment(
        this.formFields.dateStart.value.toString()
      )
        .format('YYYY-MM-DD')
        .toString();
      this.formFields.timeStart.selectedValue = moment(
        this.formFields.timeStart.value.toString()
      )
        .format('HH:mm')
        .toString();
      this.formFields.dateEnd.selectedValue = moment(
        this.formFields.dateEnd.value.toString()
      )
        .format('YYYY-MM-DD')
        .toString();
      this.formFields.timeEnd.selectedValue = moment(
        this.formFields.timeEnd.value.toString()
      )
        .format('HH:mm')
        .toString();

      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }

  selectCheckboxAlerts() {}

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }

  getUserID(): number {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return parseInt(id);
  }
}
</script>

<style>
.widgetCard {
  border: 1px solid #fafafa !important;
  background: #526da5 !important;
}
#gridComponent {
  width: 100%;
  font-family: 'Asap', sans-serif;
}
#btnExportCsv {
  height: auto;
}
.importExportBtnIcon {
  font-size: 30px;
}

.modalEvidencia-content,
.modalEnvio-content {
  background-color: #fafafa;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}
.modalEnvio-content {
  min-width: 300px;
  max-width: 500px;
  width: 30%;
}
.wrap-evidencia .wrap-evidencia-img {
  text-align: center;
  min-height: 480px;
  overflow: hidden;
}
.titleEvidencia {
  width: 70%;
  display: inline-block;
  min-width: 320px;
  min-width: 115px;
}
</style>

<template>
  <div id="containerReportsCommand">
    <v-layout row wrap style="padding-right:0px; margin-top: 15px">
      <v-flex sm12 md12 layout wrap
        ><v-flex sm3 md3>
          <v-autocomplete
            :items="formFields.client.items"
            :label="formFields.client.label"
            v-model="formFields.client.value"
            @input="getVehicles()"
            item-text="desc"
            item-value="cod"
          ></v-autocomplete> </v-flex
        ><v-flex sm3 md3>
          <v-combobox
            :items="formFields.vehicles.items"
            :label="formFields.vehicles.label"
            v-model="formFields.vehicles.value"
          ></v-combobox> </v-flex
      ></v-flex>
      <v-flex sm12 md12 layout wrap
        ><v-flex sm3 md3
          ><DateComponent
            :label="formFields.dateStart.label"
            v-model="formFields.dateStart.value"
            v-validate="'required'"
            data-vv-name="fechaRequerida"
            :error-messages="errors.collect('fechaRequerida')"
            required/></v-flex
        ><v-flex sm3 md3
          ><DateComponent
            :label="formFields.dateEnd.label"
            v-model="formFields.dateEnd.value"
            v-validate="'required'"
            data-vv-name="fechaRequerida"
            :error-messages="errors.collect('fechaRequerida')"
            required/></v-flex
      ></v-flex>
      <v-flex sm12 md12 layout wrap
        ><v-flex sm3 md3
          ><TimeComponent
            :label="formFields.timeStart.label"
            v-model="formFields.timeStart.value"
            v-validate="'required'"
            data-vv-name="fechaRequerida"
            :error-messages="errors.collect('fechaRequerida')"
            required/></v-flex
        ><v-flex sm3 md3
          ><TimeComponent
            :label="formFields.timeEnd.label"
            v-model="formFields.timeEnd.value"
            v-validate="'required'"
            data-vv-name="fechaRequerida"
            :error-messages="errors.collect('fechaRequerida')"
            required/></v-flex
      ></v-flex>
      <v-flex sm12 md12 layout wrap
        ><v-flex sm3 md3
          ><v-autocomplete
            :items="formFields.typeSend.items"
            :label="formFields.typeSend.label"
            v-model="formFields.typeSend.value"
          ></v-autocomplete></v-flex
        ><v-flex
          sm3
          md3
          style="margin-left: 15px;display: flex; justify-content: flex-start; align-items: center;"
          ><v-btn
            color="primary"
            flat
            icon
            small
            style="margin: 0px !important;"
            @click="getRecords()"
          >
            <v-icon color="black">search</v-icon>
          </v-btn></v-flex
        ></v-flex
      >
    </v-layout>
    <div style="margin-top: 20px;">
      <v-card style="width: 100%; "
        ><MantenedorGrid
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :grid-options="gridOptions"
      /></v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
const { AgGridVue } = require('ag-grid-vue');
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import { fetchSMS } from '@/pantallas/TorreControl/fetchSMS';
import { LoadingService } from '@/services/loadingService';

@Component({
  components: {
    DateComponent: DatePicker,
    TimeComponent: TimePicker,
    MantenedorGrid: AgGridVue,
  },
})
export default class ReportesSMS extends Vue {
  dateString = new Date();
  loadingService = new LoadingService();
  //@ts-ignore
  $snotify: any;

  formFields: {
    client: { items: any[]; value: string; label: string };
    vehicles: { value: any; items: any[]; label: string };
    dateStart: { value: any; label: string };
    timeStart: { value: any; label: string };
    dateEnd: { value: any; label: string };
    timeEnd: { value: any; label: string };
    typeSend: { items: any[]; value: string; label: string };
  } = {
    client: { items: [], value: '', label: 'Cliente' },
    vehicles: { items: ['Todos'], value: 'Todos', label: 'Patente' },
    dateStart: {
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
      label: 'Fecha Inicio',
    },
    dateEnd: {
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
      label: 'Fecha Fin',
    },
    timeStart: {
      value: moment('00:00', 'HHmm'),
      label: 'Hora Inicio',
    },
    timeEnd: {
      value: moment('23:59', 'HHmm'),
      label: 'Hora Fin',
    },
    typeSend: {
      items: ['Todos', 'Sms', 'Bluetooth'],
      value: 'Todos',
      label: 'Tipo de Envío',
    },
  };
  columnApi: any = null;
  gridApi: GridApi = null;
  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'id',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Fecha de Envío',
        field: 'fecha_envio',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Patente',
        field: 'patente',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Tipo Comando',
        field: 'tipo_comando',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Comando',
        field: 'comando',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Estado Recepción',
        field: 'estado_rcp_sms',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Recepción',
        field: 'fecha_rcp_sms',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Tipo de Envío',
        field: 'tipo_envio',
        sortable: true,
        resizable: true,
        minWidth: 80,
        cellRenderer: this.htmlSendTypeColumn,
        cellStyle: {
          cursor: 'pointer',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'flex-start',
        },
        cellClass: 'send_type_aggrid_class',
      },
      {
        headerName: 'Proceso de Envío',
        field: 'proceso_envio',
        sortable: true,
        resizable: true,
        minWidth: 80,
      },
      {
        headerName: 'Cliente',
        field: 'cliente',
        sortable: true,
        resizable: true,
        minWidth: 80,
        hide: true,
      },
      {
        headerName: 'Usuario',
        field: 'usuario',
        sortable: true,
        resizable: true,
        minWidth: 80,
        hide: true,
      },
    ],
    rowSelection: 'multiple',
    pagination: true,
    paginationPageSize: 50,
    cacheBlockSize: 10000,
    paginationAutoPageSize: false,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
    onGridReady: this.handleGridReady,
    suppressCsvExport: false,
    onGridSizeChanged: (event: any) => {
      event.api.sizeColumnsToFit();
    },
  };

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
  }

  mounted() {
    this.getClients();
    this.getVehicles();
  }

  getClients() {
    this.loadingService.showLoading();
    fetchSMS({}, 'get_clients')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener los clientes'
          );
        } else {
          this.formFields.client.items = response.data.data;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de los clientes [get_clients]'
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  getVehicles() {
    this.loadingService.showLoading();
    fetchSMS({ id_cliente: this.formFields.client.value }, 'get_vehicles')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener los vehículos'
          );
        } else {
          this.formFields.vehicles.items = response.data.data;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de los vehículos [get_vehicles]'
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  generateBody(): any {
    const date_start = moment(this.formFields.dateStart.value.toString())
      .format('YYYY-MM-DD')
      .toString();
    const time_start =
      moment(this.formFields.timeStart.value.toString())
        .format('HH:mm')
        .toString() + ':00';
    const date_end = moment(this.formFields.dateEnd.value.toString())
      .format('YYYY-MM-DD')
      .toString();
    const time_end =
      moment(this.formFields.timeEnd.value.toString())
        .format('HH:mm')
        .toString() + ':00';

    const body = {
      fecha_inicio: `${date_start} ${time_start}`,
      fecha_fin: `${date_end} ${time_end}`,
      tipo_envio: this.formFields.typeSend.value,
      patente: this.formFields.vehicles.value,
      id_cliente: this.formFields.client.value,
    };
    return body;
  }

  getRecords() {
    this.loadingService.showLoading();
    const body = {};
    fetchSMS(this.generateBody(), 'get_sent_command')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener los comandos envíados'
          );
        } else {
          this.gridApi.setRowData(response.data.data);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de los comandos envíados [get_sent_command]'
        );
      })
      .finally(() => {
        this.gridApi.setDomLayout('autoHeight');
        this.loadingService.hideLoading();
      });
  }

  htmlSendTypeColumn(params: any): string {
    var html: string = '';
    switch (params.value.toLowerCase()) {
      case 'sms':
        html =
          '<i class="material-icons" id="smsIcon" title="SMS" style=" color: #27488e; margin-right: 5px;" >sms</i> SMS';
        break;
      case 'bluetooth':
        html =
          '<i class="material-icons" id="bluetoothIcon" title="BLUETOOTH" style="color: #27488e; margin-right: 5px;" >bluetooth</i> BLUETOOTH';
        break;
    }
    return html;
  }
}
</script>

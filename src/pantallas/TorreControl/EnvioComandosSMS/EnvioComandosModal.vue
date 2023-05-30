<template>
  <v-dialog
    v-model="show"
    persistent
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card id="sendCommandModalContainer">
      <CabeceraModal
        :titulo="titleModal + params.patente"
        @cerrar="handleCerrar"
      ></CabeceraModal>
      <v-card class="v-title" align="left">
        <div class="v-title-item">
          <div class="divTextDetail">Patente:</div>
          <div class="divTextDetailValue">
            {{ params.patente }}
          </div>
        </div>
        <div class="v-title-item">
          <div class="divTextDetail">Marca:</div>
          <div class="divTextDetailValue">
            {{ params.marca }}
          </div>
        </div>
        <div class="v-title-item">
          <div class="divTextDetail">Modelo:</div>
          <div class="divTextDetailValue">{{ params.modelo }}</div>
        </div>
      </v-card>
      <div style="margin-left: 32px;">
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-text-field
              v-model="searchCommand"
              append-icon="search"
              label="Buscar..."
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-flex>
        <div id="descriptionActiveContainer">
          <h3
            v-if="modalType == 'send'"
            style="font-size: 1.6vmin; font-weight: 400; margin-top: 30px;"
          >
            Comandos disponibles para el envío de SMS a la patente
            {{ params.patente }}:
          </h3>
          <h3
            v-else
            style="font-size: 1.6vmin; font-weight: 400; margin-top: 30px;"
          >
            Últimos 20 comandos enviados a la patente {{ params.patente }}:
          </h3>
        </div>
        <v-card style="width: calc(100% - 32px); margin-top: 10px; ">
          <AgGridVue
            id="gridComponent"
            ref="gridComponent"
            class="ag-theme-material"
            :grid-options="gridOptions"
          />
        </v-card>
      </div>
    </v-card>
    <app-confirmacion
      :show="dialogConfirmSend"
      :titulo="titleConfirmSend"
      :mensaje="messageConfirmSend"
      v-on:modalConfirmationEmit="sendItemCallback($event)"
      textoBtnSi="Si"
      textoBtnNo="No"
    ></app-confirmacion>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
const { AgGridVue } = require('ag-grid-vue');
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
import { LoadingService } from '@/services/loadingService';
import { fetchSMS } from '@/pantallas/TorreControl/fetchSMS';
import '../ClassAggridSMS.css';
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: { CabeceraModal, AgGridVue, 'app-confirmacion': Confirmation },
})
export default class EnvioComandosModal extends Vue {
  @Prop({ default: false }) show: boolean;
  @Prop({
    default: {
      patente: '[Sin patente seleccionada]',
      id_marca: '',
      id_modelo: '',
      marca: '',
      modelo: '',
    },
  })
  params: any;
  @Prop({ default: '' }) modalType: string;

  loadingService = new LoadingService();
  //@ts-ignore
  $snotify: any;
  titleModal: string = '';
  current_command: any = {};
  searchCommand: string = '';
  titleConfirmSend: string = '';
  messageConfirmSend: string = '';
  dialogConfirmSend: boolean = false;
  columnApi: any = null;
  gridApi: GridApi = null;
  sendColumns: ColDef[] = [
    {
      headerName: 'id',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Marca',
      field: 'marca',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
    {
      headerName: 'Tipo de comando',
      field: 'tipo_comando',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
    {
      headerName: 'Descripción',
      field: 'descripcion',
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
      headerName: 'Usuario Creador',
      field: 'usuariocreadorid',
      sortable: true,
      resizable: true,
      minWidth: 80,
      hide: true,
    },
    {
      headerName: 'Fecha De Creación',
      field: 'fechacreacion',
      sortable: true,
      resizable: true,
      minWidth: 80,
      hide: true,
    },
    {
      headerName: 'Último Usuario Modificador',
      field: 'usuariomodificacionid',
      sortable: true,
      resizable: true,
      minWidth: 80,
      hide: true,
    },
    {
      headerName: 'última Fecha Modificación',
      field: 'fechamodificacion',
      sortable: true,
      resizable: true,
      minWidth: 80,
      hide: true,
    },
    {
      headerName: 'Enviar',
      sortable: false,
      resizable: false,
      width: 100,
      minWidth: 100,
      suppressAutoSize: true,
      suppressSizeToFit: true,
      pinned: 'right',
      onCellClicked: this.handleSendCommand,
      cellRenderer: (params: any) => {
        return '<i class="material-icons" id="iSMS" title="Enviar SMS" style="width: 28px; height: 28px; color: #27488e" >send</i>';
      },
      cellClass: 'cellClassSendAggrid',
    },
  ];
  detailColumns: ColDef[] = [
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
      headerName: 'Comando',
      field: 'comando',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
    {
      headerName: 'Usuario',
      field: 'usuario',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
    {
      headerName: 'Estado de Recepción',
      field: 'estado_rcp_sms',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
    {
      headerName: 'Fecha de Recepción',
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
    },
    {
      headerName: 'Proceso de Envío',
      field: 'proceso_envio',
      sortable: true,
      resizable: true,
      minWidth: 80,
    },
  ];
  gridOptions: GridOptions = {
    columnDefs: [],
    pagination: true,
    paginationPageSize: 50,
    cacheBlockSize: 10000,
    paginationAutoPageSize: false,
    onGridReady: this.handleGridReady,
    overlayNoRowsTemplate: '',
    suppressCsvExport: false,
    onGridSizeChanged: (event: any) => {
      event.api.sizeColumnsToFit();
    },
  };

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleSendCommand(event: any) {
    this.current_command = event.data;
    this.titleConfirmSend = `Enviar comando ${event.data.tipo_comando}`;
    this.messageConfirmSend = `¿Desea enviar el comando ${event.data.comando} al vehículo ${this.params.patente}?`;
    this.dialogConfirmSend = true;
  }

  @Watch('show', { immediate: true })
  async onOpenDialog() {
    if (this.show) {
      var self = this;
      this.switchModalType(
        this.modalType,
        () => {
          self.titleModal = 'Detalles de envío: ';
          self.gridOptions.overlayNoRowsTemplate =
            'No hay ningún envío registrado para este vehículo';
          self.gridOptions.api.setColumnDefs(this.detailColumns);
          self.gridApi.setRowData([]);
          self.getDetails();
        },
        () => {
          self.titleModal = 'Envío de comandos: ';
          self.gridOptions.overlayNoRowsTemplate =
            'No hay comandos disponibles para el modelo del vehículo';
          self.gridOptions.api.setColumnDefs(this.sendColumns);
          self.gridApi.setRowData([]);
          self.getCommands();
        }
      );
    } else {
      this.gridApi.setRowData([]);
    }
  }

  switchModalType(
    type: string,
    detailFunction: Function,
    sendFunction: Function
  ) {
    switch (type) {
      case 'detail':
        detailFunction();
        break;
      case 'send':
        sendFunction();
        break;
    }
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
  }

  sendItemCallback(confirm: boolean) {
    this.dialogConfirmSend = false;
    if (confirm) {
      this.sendCommand();
    }
  }

  getDetails() {
    this.loadingService.showLoading();
    const body = {
      fecha_inicio: '',
      fecha_fin: '',
      tipo_envio: '',
      patente: this.params.patente,
      id_cliente: '',
    };
    fetchSMS(body, 'get_sent_command')
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
    this.loadingService.hideLoading();
  }

  sendCommand() {
    this.loadingService.showLoading();
    const body: any = {
      patente: this.params.patente,
      id_comando: this.current_command.id,
      id_usuario: this.getUserID().toString(),
      id_cliente: this.getClientID().toString(),
    };
    fetchSMS(body, 'send_command')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al enviar el comando al vehículo'
          );
        } else {
          this.$snotify.success('Se ha enviado el comando con éxito');
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta del envío de comando [send_command]'
        );
      })
      .finally(() => {
        this.gridApi.setDomLayout('autoHeight');
        this.loadingService.hideLoading();
      });
  }

  async getCommands() {
    this.loadingService.showLoading();
    fetchSMS(
      {
        marca: this.params.marca,
        modelo: this.params.modelo,
        id_cliente: this.getClientID().toString(),
        id_usuario: this.getUserID().toString(),
        tipo_envio: 'sms',
      },
      'get_command'
    )
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener los comandos'
          );
        } else {
          this.gridApi.setRowData(response.data.data);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de los comandos [get_command]'
        );
      })
      .finally(() => {
        this.gridApi.setDomLayout('autoHeight');
        this.loadingService.hideLoading();
      });
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
}
</script>

<style scoped>
.divTextDetail {
  margin-right: 1%;
  font-weight: 500;
  font-size: 1.3rem;
  white-space: nowrap;
}
.divTextDetailValue {
  margin-left: 5px;
  margin-right: 1%;
  font-size: 1.2rem;
  white-space: nowrap;
  margin-top: 3px;
}
.v-title {
  margin: 20px;
  display: flex;
  width: min-content;
  border: 1px solid #fafafa;
  background: #526da5;
  padding: 10px !important;
  color: white;
  border-radius: 5px;
}
.v-title-item {
  display: flex;
  margin: 10px;
  /* border: 1px solid #fafafa;
  background: #526da5;
  padding: 10px !important;
  color: white;
  border-radius: 5px; */
}

#descriptionActiveContainer {
  height: 3%;
}
</style>

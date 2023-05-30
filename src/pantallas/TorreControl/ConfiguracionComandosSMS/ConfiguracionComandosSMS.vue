<template>
  <div id="containerComandSMS">
    <ConfiguracionComandosSMSModal
      :show="showModal"
      :modal_action="modalAction"
      :modal_title="modalTitle"
      :command_data="selectedRow"
      @closeModal="handleCloseModal"
      @reloadGrid="getCommands"
    />
    <v-layout row wrap style="padding-right:0px; margin-top: 15px">
      <v-flex sm12 md12 layout wrap>
        <v-flex sm3 md3>
          <v-text-field
            v-model="searchModel"
            @input="searchData"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </v-flex>
        <v-flex sm3 md3></v-flex>
        <v-flex sm3 md3></v-flex>
        <v-flex
          sm3
          md3
          style="display: flex; align-items: flex-end; justify-content: flex-end;"
        >
          <v-btn
            v-if="accionExportar.visible"
            style="height: 48px;"
            color="primary"
            @click="onBtnExport"
          >
            <v-icon
              class="importExportBtnIcon"
              style="color: #FFFFFF !important;"
              >cloud_download</v-icon
            >&nbsp;&nbsp;
            <div
              class="importExportBtnTexto"
              style="color: #FFFFFF !important;"
            >
              Exportar<br />CSV
            </div>
          </v-btn>

          <v-btn
            v-if="accionCrear.visible"
            style="height: 48px;"
            color="#ffe800"
            @click="handleModal('create')"
          >
            <v-icon
              dark
              left
              style="font-size: 160%; margin-right: 7% !important;"
              >add_circle_outline</v-icon
            >
            <span>Crear Comando</span>
          </v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
    <div style="margin-top: 20px;">
      <v-card style="width: 100%; ">
        <MantenedorGrid
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :grid-options="gridOptions"
        />
      </v-card>
    </div>
    <app-confirmacion
      :show="dialogConfirmDelete"
      :titulo="titleConfirmDelete"
      :mensaje="messageConfirmDelete"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
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
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
import ConfiguracionComandosSMSModal from '@/pantallas/TorreControl/ConfiguracionComandosSMS/ConfiguracionComandosSMSModal.vue';
import { fetchSMS } from '@/pantallas/TorreControl/fetchSMS';
import { actionsEvent } from '@/setup';
import { range } from 'lodash';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import '../ClassAggridSMS.css';

@Component({
  components: {
    MantenedorGrid: AgGridVue,
    ConfiguracionComandosSMSModal,
    'app-confirmacion': Confirmation,
  },
})
export default class ConfiguracionComandosSMS extends ComponenteBase {
  // Perfilación
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.ConfiguracionComandosSMS;
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };
  accionEditar: PermisoAccion = {
    accionCodigo: 3,
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
  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
    this.accionEditar,
  ];

  // Variables de estados
  dialogConfirmDelete: boolean = false;
  //@ts-ignore
  $snotify: any;
  loadingService = new LoadingService();
  titleConfirmDelete: string = '';
  messageConfirmDelete: string = '';
  searchModel: string = '';
  showModal: boolean = false;
  modalTitle: string = '';
  modalAction: string = '';
  selectedRow: any = {};
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
        headerName: 'Usuario Creador',
        field: 'usuariocreador',
        sortable: true,
        resizable: true,
        minWidth: 80,
        hide: true,
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
        headerName: 'Fecha De Creación',
        field: 'fechacreacion',
        sortable: true,
        resizable: true,
        minWidth: 80,
        hide: true,
      },
      {
        headerName: 'Último Usuario Modificador',
        field: 'usuariomodificacion',
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
      makeAccionesColumnDef(this.funcionalidad),
    ],
    rowSelection: 'multiple',
    pagination: true,
    paginationPageSize: 50,
    cacheBlockSize: 10000,
    paginationAutoPageSize: false,
    onGridReady: this.handleGridReady,
    suppressCsvExport: false,
    onGridSizeChanged: (event: any) => {
      event.api.sizeColumnsToFit();
    },
    //onModelUpdated: this.onModelUpdated,
    //onSelectionChanged: this.onSelectionChanged,
  };

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
    this.getCommands();
  }

  searchData() {
    this.gridApi.setQuickFilter(this.searchModel);
    this.gridApi.setDomLayout('autoHeight');
  }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditCommand);
    actionsEvent.onEliminar(this.handleDeleteCommand);
  }

  handleEditCommand(params: ICellRendererParams) {
    this.selectedRow = params.data;
    this.handleModal('edit');
  }
  handleDeleteCommand(params: ICellRendererParams) {
    this.selectedRow = params.data;
    this.titleConfirmDelete = `Borrar comando tipo ${params.data.tipo_comando}`;
    this.messageConfirmDelete = `¿Desea borrar el comando?`;
    this.dialogConfirmDelete = true;
  }

  deleteItemCallback(confirm: boolean) {
    this.dialogConfirmDelete = false;
    if (confirm) {
      this.deleteCommand({
        id_usuario: this.getUserID().toString(),
        id_comando: this.selectedRow.id,
      });
    }
  }

  async getCommands() {
    this.loadingService.showLoading();
    fetchSMS(
      {
        id_cliente: this.getClientID().toString(),
        id_usuario: this.getUserID().toString(),
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

  deleteCommand(body: any) {
    this.loadingService.showLoading();
    fetchSMS(body, 'delete_command')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al eliminar el comando'
          );
        } else {
          this.$snotify.success(
            `El comando id ${response.data.id} se ha eliminado con éxito`
          );
          this.getCommands();
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta del comando [delete_command]'
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  onBtnExport() {
    var columnKeys: string[] = [
      'marca',
      'modelo',
      'tipo_comando',
      'descripcion',
      'comando',
      'tipo_envio',
      'usuariocreador',
      'fechacreacion',
    ];
    this.gridOptions.api.exportDataAsCsv({
      suppressQuotes: true,
      columnKeys: columnKeys,
      fileName: 'comandos',
    });
  }

  handleModal(type: string) {
    switch (type) {
      case 'create': {
        this.modalAction = 'crear';
        this.modalTitle = 'Crear Comando';
        break;
      }
      case 'edit': {
        this.modalAction = 'editar';
        this.modalTitle = 'Editar Comando';
        break;
      }
      default: {
        //statements;
        break;
      }
    }
    this.showModal = true;
  }

  handleCloseModal() {
    this.showModal = false;
  }

  getUserID(): any {
    let user: any = localStorage.getItem('user');
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
#containerComandSMS {
  width: 100%;
}
</style>

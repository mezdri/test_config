<template>
  <div>
    <!-- <CrearVODModal :openDialog="dialogCreateVOD" /> -->
    <CrearVODModal v-if="dialogCreateVOD" @cerrar="handleCierreModalCrear" />
    <DetalleVODModal
      v-if="dialogDetailVOD"
      @cerrar="handleCloseModalDetail"
      :selectedVOD="selectedDetailVOD"
    />
    <v-dialog
      v-model="openVideo"
      persistent
      max-width="700"
      max-height="700"
      transition="dialog-bottom-transition"
    >
      <v-card id="vCardDialogVideo" shaped outlined>
        <div id="headerDialogVideo">
          <div style="margin-left: 2%">
            <h2 class="textstyle">{{ titleDialog }}</h2>
          </div>
          <div style="margin-left: auto; margin-right: 0;">
            <v-btn icon dark @click="openVideo = false">
              <v-icon>close</v-icon>
            </v-btn>
          </div>
        </div>
        <div id="bodyDialogVideo">
          <video :src="videoUrl" controls id="videoDialog" v-show="!isDownload">
            <source :src="videoUrl" type="video/mp4" />
          </video>
          <v-btn
            :href="videoUrl"
            id="btnDownloadDialog"
            color="#27488E"
            dark
            v-show="isDownload"
            ><v-icon left>upload</v-icon>Descargar video</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
    <div style="margin-top: 1%">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-autocomplete
              class="tfClass"
              contentClass="vAutoCom"
              multiple
              :items="formFields.patent.items"
              v-model="formFields.patent.value"
              :label="formFields.patent.label"
              @change="changeAutoComplete"
              item-text="desc"
              item-value="desc"
            >
              <template v-slot:prepend-item>
                <v-list-tile
                  ><v-checkbox
                    v-model="checkAllPatent"
                    label="Seleccionar todos"
                    @change="selectAllPatent()"
                  ></v-checkbox
                ></v-list-tile>
                <v-divider></v-divider>
              </template>
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index === 0">
                  <span>{{ textoComprimido(item.desc) }}</span>
                </v-chip>
                <span v-if="index === 1" class="grey--text caption"
                  >(+{{ patentsSelect.length - 1 }} otros)</span
                >
              </template>
              <template slot="item" slot-scope="data">
                <v-list-tile v-on="data.tile.on" v-bind="data.tile.props">
                  <v-list-tile-action
                    style="padding-top: 13px !important;min-width: 0px !important;"
                    @click="changePatentCheckbox(data.item)"
                  >
                    <v-checkbox v-model="data.item.selected"></v-checkbox>
                  </v-list-tile-action>
                  <v-list-tile-content style="overflow: visible !important">
                    <div
                      style="display: flex; margin-left: 5%; margin-right: 5%; cursor: pointer !important;"
                      @click="changePatent(data.item)"
                    >
                      <i
                        class="material-icons"
                        id="5545"
                        :title="getStateString(data.item.estado)"
                        :style="getHtmlFromState(data.item.estado)"
                      ></i>
                      <div
                        style="padding-left: 16px; margin-top: 2%;"
                        class="tooltip"
                      >
                        <span style=" margin-top: 4%">
                          {{
                            textoComprimido(
                              data.item.patente + ' [' + data.item.cod + ']'
                            )
                          }}</span
                        >&nbsp;
                        <span class="tooltiptext">{{
                          data.item.patente + ' [' + data.item.cod + ']'
                        }}</span>
                      </div>
                    </div>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-autocomplete>
          </v-flex>
          <v-flex sm3 md3>
            <DateComponent
              :label="formFields.dateStart.label"
              class="tfClass"
              v-model="formFields.dateStart.value"
              v-validate="'required'"
              data-vv-name="fechaRequerida"
              :error-messages="errors.collect('fechaRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3>
            <TimeComponent
              :label="formFields.timeStart.label"
              class="tfClass"
              v-model="formFields.timeStart.value"
              v-validate="'required'"
              data-vv-name="horaRequerida"
              :error-messages="errors.collect('horaRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3 style="text-align: end;">
            <v-btn
              style="height: 48px;"
              color="#ffe800"
              @click="handleClickCreate"
            >
              <v-icon
                dark
                left
                style="font-size: 160%; margin-right: 7% !important;"
                >add_circle_outline</v-icon
              >
              <span style="font-size: 1.5vmin;">Crear VOD</span>
            </v-btn>
          </v-flex>
        </v-flex>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <DateComponent
              :label="formFields.dateEnd.label"
              class="tfClass"
              v-model="formFields.dateEnd.value"
              v-validate="'required'"
              data-vv-name="fechaFinRequerida"
              :error-messages="errors.collect('fechaFinRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3>
            <TimeComponent
              :label="formFields.timeEnd.label"
              class="tfClass"
              v-model="formFields.timeEnd.value"
              v-validate="'required'"
              data-vv-name="horaFinRequerida"
              :error-messages="errors.collect('horaFinRequerida')"
              required
            />
          </v-flex>
        </v-flex>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-autocomplete
              class="tfClass"
              :items="formFields.channels.items"
              v-model="formFields.channels.value"
              :label="formFields.channels.label"
              item-text="desc"
              item-value="cod"
            ></v-autocomplete>
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              class="tfClass"
              :items="formFields.state.items"
              v-model="formFields.state.value"
              :label="formFields.state.label"
              item-text="desc"
              item-value="cod"
            ></v-autocomplete>
          </v-flex>
          <v-flex sm3 md3 style="display: flex; align-items: center">
            <v-btn @click="handleClick" icon>
              <v-icon>search</v-icon>
            </v-btn>
          </v-flex>
        </v-flex>
      </FormFieldsContainer>
    </div>
    <div>
      <h3 style="font-size: 1.6vmin; font-weight: 400; margin-top: 30px;">
        *Presione sobre una fila para expandir sus detalles
      </h3>
    </div>
    <div class="bodyDiv">
      <div class="gridcard rounded-card">
        <GridComponent
          id="gridComponent"
          ref="gridComponent"
          class="ag-theme-material"
          :gridOptions="gridOptions"
        ></GridComponent>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const { AgGridVue } = require('ag-grid-vue');
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import MenuItemVOD from '@/components/MenuItemVOD.vue';
import store from '@/store';
import { Vue, Component, Watch } from 'vue-property-decorator';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { LoadingService } from '@/services/loadingService';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';
import moment from 'moment';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import CrearVODModal from '@/pantallas/Camaras/VOD/CrearVODModal.vue';
import DetalleVODModal from '@/pantallas/Camaras/VOD/DetalleVODModal.vue';
import showVideo from '../showVideo.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import { actionsEvent } from '@/setup';
import {
  codigoAccionesMenuItem as cami,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';
import axios from 'axios';

@Component({
  components: {
    DateComponent: DatePicker,
    TimeComponent: TimePicker,
    GridComponent: AgGridVue,
    HtmlTemplateForm,
    CrearVODModal,
    DetalleVODModal,
    showVideo,
    FormFieldsContainer,
    MenuItemVOD,
  },
})
export default class CamaraVOD extends ComponenteBase {
  readonly codigoAccionesMenuItem = Object.values(cami);
  readonly funcionalidad: Funcionalidades = Funcionalidades.CamarasVOD;
  // State
  readonly urlConverter: string =
    'https://test.awsgpschile.com/ms/videoconverter';
  loadingService = new LoadingService();
  dateString = new Date();
  selectedDetailVOD: any = {};

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionCancelar: PermisoAccion = {
    accionCodigo: 48,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCancelar,
  ];

  formFields: {
    patent: any;
    channels: any;
    state: any;
    dateStart: any;
    timeStart: any;
    dateEnd: any;
    timeEnd: any;
  } = {
    patent: {
      label: 'Patente/Cámara',
      value: '',
      items: [],
      patent: [],
    },
    channels: {
      label: 'Canal',
      value: '',
      items: [
        { desc: 'Todos', cod: '' },
        { desc: '1', cod: '1' },
        { desc: '2', cod: '2' },
        { desc: '3', cod: '3' },
        { desc: '4', cod: '4' },
      ],
    },
    state: {
      label: 'Estado',
      value: '',
      items: [],
    },
    dateStart: {
      label: 'Fecha desde',
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
    },
    timeStart: {
      label: 'Hora desde',
      value: moment('00:00', 'HHmm'),
    },
    dateEnd: {
      label: 'Fecha hasta',
      value: moment(
        this.dateString.getFullYear() +
          '-' +
          (this.dateString.getMonth() + 1).toString() +
          '-' +
          this.dateString.getDate()
      ),
    },
    timeEnd: {
      label: 'Hora hasta',
      value: moment('23:59', 'HHmm'),
    },
  };
  gridOptions: GridOptions;
  mainColumnDefs: Array<ColDef> = [];
  detailCellRendererParams: any = null;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  localeText: any = {};
  userType: string = '';
  htmlExample: any = '';
  openVideo: boolean = false;
  videoUrl: string = '';
  titleDialog: string = '';
  isDownload: boolean = true;
  $snotify: any;
  channelsDict: { [id_channel: string]: string[] } = {};
  channelSelect: string[] = [];
  searchPatent: string = '';
  dialogCreateVOD: boolean = false;
  dialogDetailVOD: boolean = false;
  checkAllPatent: boolean = false;
  serverSide: any;
  patentsSelect: any[] = [];
  cssWithOutVideo: {} = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'start',
  };
  cssWithVideo: {} = {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'start',
    cursor: 'pointer',
  };
  startDateFetch: any = '';
  endDateFetch: any = '';
  cameraFetch: any = '';
  hashPage: string = '';

  // Methods

  created() {
    CamaraEventBus.$on('closeDialog', () => {
      this.dialogCreateVOD = false;
    });
    CamaraEventBus.$on('postVOD', (body: any) => {
      this.$validator.reset();
      this.dialogCreateVOD = false;
      this.firstChargeVOD();
    });
  }

  constructor() {
    super();
    actionsEvent.onCancelar(this.handleDeleteVOD);
    this.initializeColumnDefs();

    this.mainColumnDefs = [
      {
        field: '',
        sortable: false,
        resizable: false,
        width: 30,
        lockPinned: true,
        cellRenderer: params => {
          return '<i class="material-icons" id="expandedVOD" title="Ver VOD" style="width: 28px; height: 28px;" >add</i>';
        },
        cellClass: 'cellClassDetailAggrid',
      },
      {
        headerName: 'Fecha Solicitud',
        field: 'fecha_ingreso',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        sort: 'desc',
      },
      {
        headerName: 'Patente',
        field: 'patente',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Rango Solicitado',
        field: 'rango_solicitado',
        sortable: true,
        resizable: true,
        lockPinned: true,
        cellRenderer: this.getTooltip,
      },
      {
        headerName: 'Id Cámara',
        field: 'id_camara',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
    ];
    this.detailCellRendererParams = {
      detailGridOptions: {
        paginationPageSize: 4,
        cacheBlockSize: 4,
        localeText: this.localeText,
        suppressCsvExport: true,
        suppressExcelExport: true,
        columnDefs: this.columnDefs,
        onGridSizeChanged: (event: any) => {
          event.api.sizeColumnsToFit();
        },
        /*onFirstDataRendered(params: any) {
          params.api.sizeColumnsToFit();
        },*/
      },
      getDetailRowData: (params: any) => {
        params.successCallback(params.data.vods);
      },
    };

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 50, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,

      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      onRowClicked: this.onRowClicked,
      onGridReady: this.onGridReady,
      columnDefs: this.mainColumnDefs,
      suppressCopyRowsToClipboard: true,
      onGridSizeChanged: (event: any) => {
        event.api.sizeColumnsToFit();
      },
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      alwaysShowVerticalScroll: false,
      //onSelectionChanged: this.onSelectionChanged,
      //onRowSelected: this.onSelectionRow,
      //onCellClicked: this.onSelectionRow,
      // onCellMouseOver: this.mouseOverEvent,
      // onCellMouseOut: this.mouseOverOut,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      //onDragStopped: this.onDragStoppedEvent,
      //onColumnPinned: this.onColumnPinnedEvent,
      masterDetail: true,
      detailCellRendererParams: this.detailCellRendererParams,
      columnTypes: {},
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  // mouseOverOut(event){
  //   console.log(event)
  //   event.colDef.cellStyle = event.colDef.field == 'url' ? {cursor: 'pointer'} : {};
  //   this.gridApi.refreshCells({force: true });
  // }

  // mouseOverEvent(event: any){
  //   const rowIndex = event.node.rowIndex;
  //   event.colDef.cellStyle = (params: any) => {
  //     return params.node.rowIndex == rowIndex? {cursor: 'pointer', color: 'blue'} : {cursor: 'pointer'} }
  //   this.gridApi.refreshCells({force: true});
  // }

  onRowClicked(event: any) {
    if (this.gridApi.getDisplayedRowAtIndex(event.rowIndex).expanded) {
      this.gridApi.getDisplayedRowAtIndex(event.rowIndex).setExpanded(false);
    } else {
      this.gridApi.getDisplayedRowAtIndex(event.rowIndex).setExpanded(true);
    }
  }

  async mounted() {
    console.log(this.accionesTotales);
    this.userType = await this.getTypeUser();
    this.loadingService.showLoading();
    this.chargeStatesDropdown();
    this.chargePatentsCamera();
    this.initializeColumnDefs();

    this.detailCellRendererParams = {
      detailGridOptions: {
        paginationPageSize: 4,
        cacheBlockSize: 4,
        localeText: this.localeText,
        suppressCsvExport: true,
        suppressExcelExport: true,
        columnDefs: this.columnDefs,
        onGridSizeChanged: (event: any) => {
          event.api.sizeColumnsToFit();
        },
      },
      getDetailRowData: (params: any) => {
        console.log(params.data.vods);
        params.successCallback(params.data.vods);
      },
    };

    this.gridOptions.detailCellRendererParams = this.detailCellRendererParams;
    //this.firstChargeVOD();
  }

  @Watch('formFields.patent.value')
  onPatentValue() {}

  changeAutoComplete(event: any) {
    if (event.length == 0) {
      this.selectAllPatentWithCondition();
    }
  }

  handleDeleteVOD(params: ICellRendererParams) {
    console.log(params.data);
    this.deleteVOD(params.data.id);
  }

  deleteVOD(idPeticion: any) {
    this.loadingService.showLoading();
    var body: any = {
      id_peticion: idPeticion,
    };
    fetchCamaraModulo(body, 'cancelVOD')
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.$snotify.success(
            'El VOD ' + response.data.id + ' se ha cancelado'
          );
          this.gridApi.setServerSideDatasource(this.serverSide);
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al cancelar petición');
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async initializeColumnDefs() {
    let funcionalidad = this.funcionalidad;
    let codigoAccionesMenuItem = Object.values(cami);
    this.columnDefs = [
      {
        headerName: 'Id Solicitud',
        field: 'id',
        sortable: true,
        resizable: true,
        width: 120,
        lockPinned: true,
        hide: false,
      },
      {
        headerName: 'Id Cámara',
        field: 'id_camara',
        sortable: true,
        resizable: true,
        width: 120,
        lockPinned: true,
        //hide: !(this.userType == '1'),
        hide: true,
      },
      {
        headerName: 'Patente',
        field: 'patente',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Canal',
        field: 'chl',
        sortable: true,
        resizable: true,
        width: 100,
        lockPinned: true,
        sort: 'asc',
      },
      {
        headerName: 'Rango Solicitado',
        field: 'rango_solicitado',
        sortable: true,
        resizable: true,
        lockPinned: true,
        hide: true,
        cellRenderer: this.getTooltip,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        resizable: true,
        lockPinned: true,
        cellRenderer: this.getHtml,
      },
      {
        headerName: 'Mensaje',
        field: 'msg',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: this.getTooltip,
      },
      {
        headerName: 'Detalle',
        field: '',
        sortable: false,
        resizable: true,
        width: 100,
        lockPinned: true,
        onCellClicked: this.showDetailVOD,
        cellRenderer: params => {
          return '<i class="material-icons" id="infoVOD" title="Ver Detalles" style="width: 28px; height: 28px; color: #27488e" >info_outlined</i>';
        },
        cellClass: 'cellClassDetailAggrid',
      },
      {
        headerName: 'Video',
        field: 'url',
        sortable: false,
        resizable: false,
        width: 120,
        lockPinned: true,
        cellRendererFramework: showVideo,
        cellRendererParams: {
          handleVideo: this.handleVideo,
        },
      },
      {
        headerName: 'Fecha Término Solicitud',
        field: 'fecha_termino',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: this.getTooltip,
      },
      {
        headerName: 'Acciones',
        width: 120,
        minWidth: 120,
        sortable: false,
        resizable: false,
        filter: false,
        enablePivot: false,
        field: 'id',
        cellRendererFramework: MenuItemVOD,
        cellRendererParams: (params: any) => {
          return {
            funcionalidad,
            codigoAccionesMenuItem,
            usuario: store.state.user,
            data: params.data,
          };
        },
        colId: 'params',
        rowDrag: false,
        pinned: 'right',
        lockVisible: true,
        suppressMovable: true,
        getQuickFilterText: () => '',
        cellStyle: (params: any) => {
          return params.data.estado.toLowerCase() == 'finalizado' ||
            params.data.estado.toLowerCase() == 'cancelado' ||
            params.data.estado.toLowerCase() == 'consolidando'
            ? { textAlign: 'center', display: 'none' }
            : { textAlign: 'center' };
        },
      },
    ];
  }

  autoSizeAll() {
    const allColumnIds: any = [];
    this.columnApi.getAllColumns().forEach((column: any) => {
      allColumnIds.push(column.getId());
    });
    this.columnApi.autoSizeColumns(allColumnIds);
  }

  showDetailVOD(event: any) {
    this.selectedDetailVOD = event.data;
    this.dialogDetailVOD = true;
  }

  handleCloseModalDetail() {
    this.dialogDetailVOD = false;
  }

  selectAllPatentWithCondition() {
    this.patentsSelect = [];
    for (var i = 0; i < this.formFields.patent.items.length; i++) {
      this.formFields.patent.items[i].selected = false;
    }
    this.formFields.patent.value = this.patentsSelect.map((item: any) => {
      return item.desc;
    });
  }

  selectAllPatent() {
    if (this.checkAllPatent) {
      // this.formFields.patent.value = [];
      // this.formFields.patent.value = this.formFields.patent.items.map(
      //   (x: any) => {
      //     return x.desc;
      //   }
      // );
      this.patentsSelect = [];
      for (var x = 0; x < this.formFields.patent.items.length; x++) {
        this.formFields.patent.items[x].selected = true;
        this.patentsSelect.push(this.formFields.patent.items[x]);
      }
      this.formFields.patent.value = this.patentsSelect.map((item: any) => {
        return item.desc;
      });
    } else {
      this.patentsSelect = [];
      for (var i = 0; i < this.formFields.patent.items.length; i++) {
        this.formFields.patent.items[i].selected = false;
      }
      this.formFields.patent.value = this.patentsSelect.map((item: any) => {
        return item.desc;
      });
    }
  }

  get lengthPatents(): string {
    return this.patentsSelect.length.toString();
  }

  handleCierreModalCrear() {
    this.dialogCreateVOD = false;
  }

  getText(data: any, index: any): string {
    let retorno: string = '';
    if (this.patentsSelect.length > 0) {
      if (this.patentsSelect[0].desc.length > 11) {
        retorno = this.patentsSelect[0].desc.substr(0, 11) + '...';
      } else {
        retorno = this.patentsSelect[0].desc;
      }
    }
    return retorno;
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 14) {
      retorno = item.substr(0, 13) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  firstChargeVOD() {
    const dateToday = new Date();
    var startDate =
      dateToday.getFullYear() +
      '-' +
      (dateToday.getMonth() + 1).toString() +
      '-' +
      dateToday.getDate() +
      ' 00:00';
    var endDate =
      dateToday.getFullYear() +
      '-' +
      (dateToday.getMonth() + 1).toString() +
      '-' +
      dateToday.getDate() +
      ' 23:59';

    //this.chargeVOD('', fechaInicio, fechaFinal);
    this.startDateFetch = startDate;
    this.endDateFetch = endDate;
    this.cameraFetch = '';

    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    var self = this;

    this.serverSide = {
      getRows(params: any): void {
        params.request.paginationSize = self.gridOptions.cacheBlockSize;

        var body: any = {
          id_cliente: self.getClientID(),
          id_camara: self.cameraFetch,
          fecha_inicio: self.startDateFetch,
          fecha_fin: self.endDateFetch,
          chl: self.formFields.channels.value,
          estado: self.formFields.state.value,
        };

        if (self.hashPage != '') {
          body['hash'] = this.hashPage;
        }

        body = Object.assign({}, body, params.request);

        fetchCamaraModulo(body, 'busqueda_vod_cliente')
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              console.log(response.data);
              self.hashPage = 'hash' in response.data ? response.data.hash : '';
              if (response.data.dataReformed.length === 0) {
                // self.gridApi.setRowData([{}]);
                params.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                params.successCallback(
                  response.data.dataReformed,
                  response.data.total_records
                );
                self.gridApi.hideOverlay();
              }
            } else {
              this.$snotify.error(response.data.MENSAJE_RESPUESTA);
            }
          })
          .catch((error: any) => {
            params.failCallback();
            this.$snotify.error('Error al traer data');
          })
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
            //self.loadingService.hideLoading();
          });
      },
    };
    this.gridApi.setDomLayout('autoHeight');
    this.firstChargeVOD();
    //this.gridApi.setServerSideDatasource(this.serverSide);
    // this.gridApi.setRowData([]);
    // this.gridApi.sizeColumnsToFit();
  }

  handleVideo(url: any, type: string) {
    if (type == 'ver') {
      this.isDownload = false;
      this.titleDialog = 'Visualizador de video';
      this.videoUrl = url;
      this.openVideo = true;
      //this.showVideo(url);
    } else if (type == 'descargar') {
      this.isDownload = true;
      this.titleDialog = 'Descargar video';
      this.videoUrl = url;
      this.openVideo = true;
      //this.downloadVideo(url);
    }
    console.log(type);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  changePatentCheckbox(data: any) {
    const indexItem = this.formFields.patent.items.findIndex(
      (item: any) => item.cod == data.cod
    );
    if (indexItem > -1) {
      if (!this.formFields.patent.items[indexItem].selected) {
        var index = this.patentsSelect.findIndex(
          (item: any) => item.cod == data.cod
        );
        if (index > -1) {
          this.patentsSelect.splice(index, 1);
        }
      } else {
        this.patentsSelect.push(data);
      }
    }
  }

  changePatent(data: any) {
    const indexItem = this.formFields.patent.items.findIndex(
      (item: any) => item.cod == data.cod
    );
    if (indexItem > -1) {
      if (this.formFields.patent.items[indexItem].selected) {
        this.formFields.patent.items[indexItem].selected = false;
        var index = this.patentsSelect.findIndex(
          (item: any) => item.cod == data.cod
        );
        if (index > -1) {
          this.patentsSelect.splice(index, 1);
        }
      } else {
        this.formFields.patent.items[indexItem].selected = true;
        this.patentsSelect.push(data);
      }
    }
  }

  async handleClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    if (resultadoValidacion) {
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

      var cameras: any = '';
      if (this.patentsSelect.length > 0) {
        cameras = this.patentsSelect.map((item: any) => item.cod);
      }
      this.startDateFetch = date_start + ' ' + time_start;
      this.endDateFetch = date_end + ' ' + time_end;
      this.cameraFetch = cameras;

      this.gridApi.setServerSideDatasource(this.serverSide);

      // const body = {
      //   id_cliente: this.getClientID(),
      //   id_camara: cameras,
      //   channel: this.formFields.channel.value,
      //   fecha_inicio: date_start + ' ' + time_start,
      //   fecha_fin: date_end + ' ' + time_end,
      // };
      // this.loadingService.showLoading();
      // this.chargeVOD(body.id_camara, body.fecha_inicio, body.fecha_fin);
    }
  }

  getStateString(state: string): string {
    var stateString: string = '';
    if (state == 'Linea') {
      stateString = 'En Línea';
    } else if (state == 'Desconecta') {
      stateString = 'Desconectado';
    } else if (state == 'Sin Info') {
      stateString = 'Sin Información';
    }
    return stateString;
  }

  getHtmlFromState(state: string): string {
    const style =
      'width: 24px; height: 24px;margin-top: 2%; border-radius: 50%; ';
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

  getTooltip(params: any): string {
    var render: string = '';
    render = '<div title="' + params.value + '">' + params.value + '</div>';
    return render;
  }

  getHtml(params: any): string {
    const red = '#FF2626';
    const yellow = '#FFF226';
    const green = '#26FF26';
    var css = '';
    if (params.value == 'FINALIZADO') {
      css =
        '<i class="material-icons" id="5545" title="' +
        params.value +
        '" style="width: 24px; height: 24px; margin-top: 12px; background: ' +
        green +
        '; border-radius: 50%;" ></i>';
    } else if (
      params.value == 'ERROR' ||
      params.value == 'FALLA_PETICION' ||
      params.value == 'VOD_NO_EXISTE' ||
      params.value == 'CANCELADO'
    ) {
      css =
        '<i class="material-icons" id="5545" title="' +
        params.value +
        '" style="width: 24px; height: 24px; margin-top: 12px; background: ' +
        red +
        '; border-radius: 50%;"></i>';
    } else {
      css =
        '<i class="material-icons" id="5545" title="' +
        params.value +
        '" style="width: 24px; height: 24px; margin-top: 12px; background: ' +
        yellow +
        '; border-radius: 50%;" ></i>';
    }
    return (
      css +
      '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
      params.value +
      '</a>'
    );
  }

  async handleClickCreate() {
    this.dialogCreateVOD = true;
  }

  clearFormfields() {
    this.formFields.patent.value = '';
    this.formFields.channels.value = '';
    this.formFields.state.value = '';
    this.formFields.dateStart.value = '';
    this.formFields.timeStart.value = '';
    this.formFields.dateEnd.value = '';
    this.formFields.timeEnd.value = '';
  }

  async postVOD(body: any) {
    this.loadingService.showLoading();
    //const body: {} = {id_cliente: this.getClientID()};
    var self = this;
    fetchCamaraModulo(body, 'postVOD')
      .then((response: any) => {
        if (response.data.id_solicitud != 'without_id') {
          this.$snotify.success('El VOD se ha creado con éxito');
        } else {
          this.$snotify.error('Hubo un error al crear el VOD');
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Hubo un error al crear el VOD');
      })
      .finally(() => {
        // this.clearFormfields();
        this.$validator.reset();
        self.loadingService.hideLoading();
        this.dialogCreateVOD = false;
      });
  }

  isArray(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  // async chargeHistoricCamera(body: any) {
  //   this.loadingService.showLoading();
  //   var self = this;
  //   fetchCameraData(body, 'historicCamera')
  //     .then((response: any) => {
  //       this.gridApi.setRowData(response.data.data || []);
  //     })
  //     .catch((error: any) => {
  //       console.log(error);
  //     })
  //     .finally(() => {
  //       self.loadingService.hideLoading();
  //     });
  // }

  async chargePatentsCamera() {
    //const body: {} = {id_cliente: this.getClientID()};
    const body: {} = { id_cliente: this.getClientID() };
    var self = this;
    fetchCamaraModulo(body, 'getPatentCameras')
      .then((response: any) => {
        self.formFields.patent.items = response.data.data || [];
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al traer las patentes');
      })
      .finally(() => {
        self.formFields.patent.items = self.formFields.patent.items.map(
          (item: any) => {
            return { selected: false, ...item };
          }
        );
        this.loadingService.hideLoading();
      });
  }

  async chargeStatesDropdown() {
    //const body: {} = {id_cliente: this.getClientID()};
    const body: {} = { id_cliente: this.getClientID() };
    var self = this;
    fetchCamaraModulo(body, 'getVODState')
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          self.formFields.state.items = response.data.estados;
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA);
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al traer los estados');
      })
      .finally(() => {});
  }

  async downloadVideo(videoUrl: string) {
    this.loadingService.showLoading();
    var video: string = await this.getVideo(videoUrl);
    if (video != '') {
      this.isDownload = true;
      this.videoUrl = video;
      this.openVideo = true;
    }
    this.loadingService.hideLoading();
  }

  async showVideo(videoUrl: string) {
    this.loadingService.showLoading();
    var video: string = await this.getVideo(videoUrl);
    if (video != '') {
      this.isDownload = false;
      this.videoUrl = video;
      this.openVideo = true;
    }
    this.loadingService.hideLoading();
  }

  // async getVideo(videoUrl: string): Promise<string> {
  //   //PRUEBA
  //   // videoUrl =
  //   //   'https://api.gpschile.com/ms/view_camaras/playback_howen/20220503/01853/01853__20220503120658__3__20220503123530.h264';
  //   var response = await axios.post(
  //     'https://aqknvl4y5f.execute-api.us-east-1.amazonaws.com/ffmpeg',
  //     { video_url: videoUrl }
  //   );
  //   if (response.data.statusCode == 200) {
  //     return JSON.parse(response.data.body).url;
  //   } else {
  //     return '';
  //   }
  // }

  async getVideo(videoUrl: string): Promise<string> {
    var response = await axios.post(this.urlConverter, { url: videoUrl });
    if (response.data.CODIGO_RESPUESTA == '1') {
      return response.data.data.new_url;
    } else {
      this.$snotify.error('Hubo un error al intentar abrir el video');
      return '';
    }
  }

  get patentFormat(): string {
    return this.formFields.patent.value.toString().split(' ')[0];
  }

  get cameraFormat(): string {
    return this.formFields.patent.value.map((x: any) => {
      console.log(x);
      return x
        .toString()
        .split(' ')[1]
        .slice(1, -1);
    });
  }

  // get cameraFormat(): string {
  //   return this.formFields.patent.value
  //     .toString()
  //     .split(' ')[1]
  //     .slice(1, -1);
  // }

  async getTypeUser(): Promise<string> {
    const body: {} = { id_user: this.getUserID() };
    return fetchCamaraModulo(body, 'getUserType')
      .then((response: any) => {
        console.log(response.data);
        if (response.data.CODIGO_RESPUESTA == '1') {
          return response.data.tipo;
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA);
          return '-1';
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al traer el tipo de usuario');
        return '-1';
      })
      .finally(() => {});
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

<style>
/* Container */
.headerDiv {
  height: 15vh;
}
#headerUp {
  height: 50%;
}
#headerDown {
  height: 50%;
  width: 100%;
  display: flex;
}
.bodyDiv {
  margin-top: 1%;
}

/* Components */
h2.textstyle {
  color: rgb(255, 255, 255);
  font-family: 'Asap', sans-serif !important;
  font-weight: normal;
}
#tfClassPatent {
  width: 80%;
}
.tfClass {
  width: 80%;
  position: relative;
}
.separatorTfDivs {
  width: 17%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: clip;
  overflow-y: visible;
}
.btnCreateVod {
  height: 100%;
  width: 17%;
  margin-right: -0.2%;
  float: right;
  display: flex;
  align-items: center;
  justify-content: center;
}
#headerDialogVideo {
  display: flex;
  align-items: center;
  height: 12%;
  background: #27488e;
}
#bodyDialogVideo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88%;
}
#vCardDialogVideo {
  height: 55vh;
}
#h2TitleDialogVideo {
  color: white;
}
#videoDialog {
  height: 100%;
  width: 100%;
}
#btnDownloadDialog {
  height: 15%;
  width: 30%;
}
.pruebaClass {
  background-color: blue;
}
.vAutoCom {
  min-width: 264px !important;
  width: 16.2%;
}

.vAutoComChild {
  min-width: 264px !important;
  width: 40.2%;
}

.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  max-width: 210px;
  min-width: 150px;
  top: 100%;
  left: 50%;
  margin-left: -60px;
  background-color: #7e7e7e;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  transition-delay: 0s;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
  -webkit-transition-delay: 0s;
  -moz-transition-delay: 0s;
  -ms-transition-delay: 0s;
  -o-transition-delay: 0s;
  transition-delay: 0.5s;
}
#gridComponent {
  width: 100%;
  font-family: 'Asap', sans-serif;
}
.ag-theme-material .ag-details-row {
  padding: 17px !important;
  background: #fafafa !important;
  /* border: 1px solid #ebebeb; */
  /* box-shadow: 1px 1px 1px 1px black inset; */
}

.ag-theme-material .ag-details-row .ag-details-grid {
  border: 1px solid #ebebeb !important;
}
</style>

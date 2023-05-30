<template>
  <div>
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
            @click="openVideo = false"
            v-show="isDownload"
            ><v-icon left>upload</v-icon>Descargar video</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
    <v-flex md10
      ><v-card class="rounded-card" style="width: 1030px"
        ><v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
          ><v-container grid-list-md style="overflow-y: visible !important;"
            ><div>
              <div class="v-title" align="left">
                <div style="display: flex; margin-bottom: 6px;">
                  <div class="divTextDetail">Patente:</div>
                  <div class="divTextDetailValue">
                    {{ selectedVOD.patente }}
                  </div>
                </div>
                <div style="display: flex; margin-bottom: 6px;">
                  <div class="divTextDetail">Rango:</div>
                  <div class="divTextDetailValue">
                    {{ selectedVOD.rango_solicitado }}
                  </div>
                </div>
                <div style="display: flex; margin-bottom: 6px;">
                  <div class="divTextDetail">Canal:</div>
                  <div class="divTextDetailValue">{{ selectedVOD.chl }}</div>
                </div>
                <v-divider></v-divider>
              </div>
              <v-layout wrap>
                <div
                  style="width: 100%; display: flex; justify-content: center"
                >
                  <div
                    class="gridcard rounded-card"
                    style="display: inline-block;"
                  >
                    <GridComponent
                      id="gridComponent"
                      ref="gridComponent"
                      class="ag-theme-material"
                      :gridOptions="gridOptions"
                    ></GridComponent>
                  </div>
                </div>
              </v-layout>
            </div>

            <!-- <FormFieldsContainer titulo="Crear VOD <br> hola">
              </FormFieldsContainer>-->
          </v-container></v-form
        ></v-card
      >
    </v-flex>

    <!--v-flex overload xs12 sm12 md12>
    </v-flex-->
  </div>
</template>

<script lang="ts">
const { AgGridVue } = require('ag-grid-vue');
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';
import moment from 'moment';
import showVideo from '../showVideo.vue';
import axios from 'axios';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';

@Component({
  components: {
    GridComponent: AgGridVue,
    FormFieldsContainer,
  },
})
export default class DetalleVODForm extends Vue {
  @Prop({ default: {} }) selectedVOD!: any;

  loadingService = new LoadingService();
  openVideo: boolean = false;
  formFields: {};
  isFormValid: boolean = true;
  gridOptions: GridOptions;
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  localeText: any = {};
  titleDialog: string = '';
  isDownload: boolean = true;
  videoUrl: string = '';
  $snotify: any;

  constructor() {
    super();

    this.columnDefs = [
      {
        headerName: 'Fecha Inicio Video',
        field: 'fecha_ini_file',
        sortable: true,
        resizable: true,
        lockPinned: true,
        autoHeight: true,
      },
      {
        headerName: 'Fecha Fin Video',
        field: 'fecha_fin_file',
        sortable: true,
        resizable: true,
        lockPinned: true,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        resizable: true,
        lockPinned: true,
        cellRenderer: this.getHtml,
        cellClass: 'cellClassDetailAggrid',
      },
      {
        headerName: 'Mensaje',
        field: 'msg',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Video',
        field: 'url',
        sortable: true,
        resizable: true,
        width: 160,
        lockPinned: true,
        cellRendererFramework: showVideo,
        cellRendererParams: {
          handleVideo: this.handleVideo,
        },
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      onGridSizeChanged: event => {},
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
      columnTypes: {},
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  created() {}

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.setRowData([]);
    this.getDetailVOD();
  }

  async downloadVideo(videoUrl: string, urlConverter: string) {
    this.loadingService.showLoading();
    var video: string = await this.getVideo(videoUrl, urlConverter);
    if (video != '') {
      this.isDownload = true;
      this.videoUrl = video;
      this.openVideo = true;
    }
    this.loadingService.hideLoading();
  }

  async showVideo(videoUrl: string, urlConverter: string) {
    this.loadingService.showLoading();
    var video: string = await this.getVideo(videoUrl, urlConverter);
    if (video != '') {
      this.isDownload = false;
      this.videoUrl = video;
      this.openVideo = true;
    }
  }

  async getVideo(videoUrl: string, urlConverter: string): Promise<string> {
    try {
      var response = await axios.post(urlConverter, { url: videoUrl });
      this.loadingService.hideLoading();
      if (response.data.CODIGO_RESPUESTA == '1') {
        return response.data.data.new_url;
      } else {
        this.$snotify.error('Hubo un error al intentar abrir el video');
        return '';
      }
    } catch (error) {
      console.log(error);
      this.$snotify.error('Hubo un error al intentar abrir el video');
      this.loadingService.hideLoading();
      return '';
    }
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  autoSizeAll() {
    const allColumnIds: any = [];
    this.columnApi.getAllColumns().forEach((column: any) => {
      allColumnIds.push(column.getId());
    });
    this.columnApi.autoSizeColumns(allColumnIds);
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
        '" style="width: 24px; height: 24px;  background: ' +
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
        '" style="width: 24px; height: 24px; background: ' +
        red +
        '; border-radius: 50%;"></i>';
    } else {
      css =
        '<i class="material-icons" id="5545" title="' +
        params.value +
        '" style="width: 24px; height: 24px;  background: ' +
        yellow +
        '; border-radius: 50%;" ></i>';
    }
    return (
      '<div>' +
      css +
      '<a style="color: #4f4f4f; position: absolute; margin-top: -4%; margin-left: 3%">' +
      params.value +
      '</a></div>'
    );
  }

  handleVideo(url: any, type: string, urlConverter: string) {
    if (type == 'ver') {
      this.isDownload = false;
      this.titleDialog = 'Visualizador de video';
      this.showVideo(url, urlConverter);
    } else if (type == 'descargar') {
      this.isDownload = true;
      this.titleDialog = 'Descargar video';
      this.downloadVideo(url, urlConverter);
    }
  }

  async getDetailVOD() {
    var self = this;
    this.loadingService.showLoading();
    const body: {} = {
      id_cliente: this.getClientID(),
      id_solicitud: this.selectedVOD.id,
    };
    fetchCamaraModulo(body, 'detailVOD')
      .then((response: any) => {
        console.log(response);
        this.gridApi.setRowData(response.data.data);
        //this.gridApi.setRowData(response.data.data || []);
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
        this.gridApi.setDomLayout('autoHeight');
        // this.gridApi.setDomLayout('autoHeight');
        // var offsetHeight = document.getElementById('gridComponent')
        //   .offsetHeight;
        self.loadingService.hideLoading();
      });
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
}
</script>

<style scoped>
#gridComponent {
  width: 978px;
  font-family: 'Asap', sans-serif;
}

.v-title {
  margin-bottom: 20px;
}

h2 {
  font-weight: normal;
  margin: 12px 0px 0px;
}
.divTextDetail {
  margin-right: 1%;
  font-weight: 500;
  font-size: 1.3rem;
}
.divTextDetailValue {
  margin-right: 1%;
  font-size: 1.2rem;
}
</style>

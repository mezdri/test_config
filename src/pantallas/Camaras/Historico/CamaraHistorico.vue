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
    <div>
      <div class="flex sm10 md10" style="margin-top: 1%">
        <FormFieldsContainer>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm3 md3>
              <v-autocomplete
                class="tfClass"
                :items="formFields.patent.items"
                v-model="formFields.patent.value"
                :label="formFields.patent.label"
                item-text="desc"
                item-value="cod"
                v-validate="'required'"
                data-vv-name="patenteRequerida"
                :error-messages="errors.collect('patenteRequerida')"
                @input="changeChannels()"
                required
                ><template v-slot:item="data"
                  ><v-btn
                    style="height:100%; width: 113%; margin-left: -15px ; background: white;"
                    elevation="0"
                  >
                    <v-list-tile>
                      <v-list-tile-content style="overflow: visible !important">
                        <div
                          style="display: flex; margin-left: 5%; margin-right: 5%; cursor: pointer !important;"
                        >
                          <i
                            class="material-icons"
                            id="5545"
                            :title="getStateString(data.item.estado)"
                            :style="getHtmlFromState(data.item.estado)"
                          ></i>
                          <div
                            style="padding-left: 16px; margin-top: 2%;"
                            class="tooltipModal"
                          >
                            <span style=" margin-top: 4%">
                              {{
                                textoComprimido(
                                  data.item.patente + ' [' + data.item.cod + ']'
                                )
                              }}</span
                            >&nbsp;
                            <span class="tooltiptextModal">{{
                              data.item.patente + ' [' + data.item.cod + ']'
                            }}</span>
                          </div>
                        </div>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-btn>
                </template></v-autocomplete
              >
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
            <v-flex sm3 md3 style="display: flex; align-items: center">
              <v-btn @click="handleClick" icon>
                <v-icon>search</v-icon>
              </v-btn>
            </v-flex>
          </v-flex>
        </FormFieldsContainer>
      </div>
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
import vuee from 'vue';
import { Vue, Component, Watch } from 'vue-property-decorator';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { LoadingService } from '@/services/loadingService';
import moment from 'moment';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import '../ClassAggrid.css';
import showVideo from '../showVideo.vue';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
import axios from 'axios';

@Component({
  components: {
    DateComponent: DatePicker,
    TimeComponent: TimePicker,
    GridComponent: AgGridVue,
    HtmlTemplateForm,
    showVideo,
    FormFieldsContainer,
  },
})
export default class CamaraHistorico extends Vue {
  // State
  readonly urlConverter: string =
    'https://test.awsgpschile.com/ms/videoconverter';
  loadingService = new LoadingService();
  dateString = new Date();
  $snotify: any;
  formFields: {
    patent: any;
    channels: any;
    dateStart: any;
    timeStart: any;
    dateEnd: any;
    timeEnd: any;
  } = {
    patent: {
      label: 'Patente/Cámara',
      value: '',
      items: [],
      patent: '',
    },
    channels: {
      label: 'Canal',
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
  columnDefs: Array<ColDef> = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  localeText: any = {};
  htmlExample: any = '';
  openVideo: boolean = false;
  videoUrl: string = '';
  titleDialog: string = '';
  isDownload: boolean = true;
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
  serverSide: any;
  startDateFetch: any = '';
  endDateFetch: any = '';
  cameraFetch: any = '';
  patentFetch: any = '';
  hashPage: string = '';

  // Methods

  constructor() {
    super();

    this.columnDefs = [
      {
        headerName: 'Fecha inicio',
        field: 'fecha_ini',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Fecha fin',
        field: 'fecha_fin',
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
        headerName: 'Canal',
        field: 'channel',
        sortable: true,
        resizable: true,
        width: 80,
        lockPinned: true,
      },
      {
        headerName: 'Video',
        field: 'url',
        sortable: false,
        resizable: false,
        width: 100,
        lockPinned: true,
        cellRendererFramework: showVideo,
        cellRendererParams: {
          handleVideo: this.handleVideo,
        },
      },
      {
        headerName: 'Origen',
        field: 'origen',
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
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReady,

      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,

      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      onGridSizeChanged: event => {
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
      columnTypes: {},
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  mounted() {
    this.chargePatentsCamera();
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    var self = this;

    this.serverSide = {
      getRows(params: any): void {
        params.request.paginationSize = self.gridOptions.cacheBlockSize;

        var body: any = {
          //id_cliente: this.getClientID().toString(),
          id_cliente: self.getClientID().toString(),
          id_usuario: self.getUserID().toString(),
          id_camara: self.cameraFetch,
          fecha_inicio: self.startDateFetch,
          fecha_fin: self.endDateFetch,
          patente: self.patentFetch,
          chl: self.formFields.channels.value,
        };

        if (self.hashPage != '') {
          body['hash'] = this.hashPage;
        }

        body = Object.assign({}, body, params.request);

        fetchCamaraModulo(body, 'busqueda_playback_camara')
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              self.hashPage = 'hash' in response.data ? response.data.hash : '';
              if (response.data.data.length === 0) {
                // self.gridApi.setRowData([{}]);
                params.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                params.successCallback(
                  response.data.data,
                  response.data.total_records
                );
                self.gridApi.hideOverlay();
              }
            } else {
              this.$snotify.error('Error al traer los registros');
            }
          })
          .catch((error: any) => {
            console.log(error);
          })
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
          });
      },
    };
    // this.gridApi.setRowData([]);
    this.gridApi.setDomLayout('autoHeight');
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  changeChannels() {
    var channels: any[] = [{ cod: '', desc: 'Todos' }];
    var channelsPatent: any[] = this.formFields.patent.items.filter(
      (item: any) => item.cod == this.formFields.patent.value
    );
    if (channelsPatent.length > 0) {
      if (channelsPatent[0].channels != null) {
        channelsPatent = channelsPatent[0].channels.map((item: any) => {
          return { cod: item, desc: item };
        });
        channels = channels.concat(channelsPatent);
        this.formFields.channels.items = channels;
        this.formFields.channels.value = '';
      }
    }
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

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
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

      this.startDateFetch = date_start + ' ' + time_start;
      this.endDateFetch = date_end + ' ' + time_end;
      this.cameraFetch = this.formFields.patent.value;
      this.patentFetch = this.patentFormat;

      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }

  async chargePatentsCamera() {
    this.loadingService.showLoading();
    //const body: {} = {id_cliente: this.getClientID()};
    const body: {} = {
      id_cliente: this.getClientID(),
      id_usuario: this.getUserID().toString(),
    };
    var self = this;
    fetchCamaraModulo(body, 'getPatentCameras')
      .then((response: any) => {
        self.formFields.patent.items = response.data.data || [];
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
        self.loadingService.hideLoading();
      });
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

  get patentFormat(): string {
    return this.formFields.patent.items.find(
      (item: any) => item.cod == this.formFields.patent.value
    ).patente;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }
}
</script>

<style scoped>
/* Container */
.headerDiv {
}
#headerUp {
  height: 50%;
}
#headerDown {
  width: 100%;
  height: 50%;
  display: flex;
}
.bodyDiv {
  margin-top: 1%;
}

/* Components */
h2.textstyle {
  color: white;
  font-family: 'Asap', sans-serif !important;
  font-weight: normal;
}
.tfClass {
  width: 80%;
}
.separatorTfDivs {
  width: 17%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
#btnCreateVod {
  height: 100%;
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
  overflow: hidden;
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

.tooltipModal {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltipModal .tooltiptextModal {
  visibility: hidden;
  max-width: 300px;
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
.tooltipModal:hover .tooltiptextModal {
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
</style>

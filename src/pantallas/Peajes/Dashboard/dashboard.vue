<template>
  <div class="tarifas">
    <fieldset
      style="width: 100%;margin-bottom: 20px;display: flex;height: 95%;border: 1px solid rgb(220, 220, 220);"
    >
      <legend style="margin-left: 0.3rem; color: #9e9e9e;font-size: 0.8rem;">
        Generar Reporte
      </legend>
      <span
        style="display: flex; align-items: center; justify-content: center; width: 100%;"
      >
        <div style="margin: 20px; width: 50%; ">
          <v-autocomplete
            v-validate="'required'"
            v-model="flotasSeleccionados"
            :items="flotas"
            label="Flotas"
            multiple
            chips
            deletable-chips
            dense
          >
            <template v-slot:prepend-item>
              <v-list-tile
                ><v-checkbox
                  v-model="checkAllFlotas"
                  label="Seleccionar todos"
                  @change="selectAllFlota()"
                ></v-checkbox
              ></v-list-tile>
              <v-divider></v-divider>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0">
                <span>{{ textoComprimido(item) }}</span>
              </v-chip>
              <span
                v-if="index === 1"
                class="grey--text text-caption"
                style="font-size: 0.75em"
              >
                (+{{ flotasSeleccionados.length - 1 }})
              </span>
            </template>
          </v-autocomplete>
        </div>
        <div>
          <div style="display: flex;">
            <div style="margin: 20px">
              <DatePicker
                label="Fecha Inicio"
                v-model="fechaDesde"
                v-validate="'required'"
                :max="fechaMaxima"
              />
              <TimePicker
                label="Hora Inicio"
                v-model="horaDesde"
                v-validate="'required'"
              />
            </div>
            <div style="margin: 20px">
              <DatePicker
                label="Fecha Fin"
                v-model="fechaHasta"
                v-validate="'required'"
                :max="fechaMaxima"
              />
              <TimePicker
                label="Hora Fin"
                v-model="horaHasta"
                v-validate="'required'"
              />
            </div>
          </div>
          <div style="display: flex; justify-content: center;">
            <div>
              <v-btn color="#FFE700" @click="buscaDashboard()">Generar</v-btn>
            </div>
          </div>
        </div>
      </span>
    </fieldset>
    <div>
      <v-layout>
        <v-flex md6 sm12>
          <v-card class="idCard">
            <div class="idcardTitle">
              <p class="titleCards">Top 5 Gastos Más Altos</p>
            </div>

            <p class="titleCards">Total de Gastos: {{ total }}</p>
            <ag-grid-vue
              style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
              class="ag-theme-material"
              :gridOptions="gridOptions"
            ></ag-grid-vue>
          </v-card>
        </v-flex>
        <v-flex md6 sm12>
          <v-card class="idCard">
            <div class="idcardTitle">
              <p class="titleCards">Cobros por Tipo de Tarifa</p>
              <v-divider></v-divider>
            </div>
            <doughnutComp :height="280" ref="doughnutCompRef" />
          </v-card>
        </v-flex>
      </v-layout>
      <v-card class="idCard">
        <div class="idcardTitle">
          <p class="titleCards">Gasto por Patente</p>
        </div>
        <barComp :height="280" ref="barRefSpeed" />
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Conecta/Clientes/FiltrosBusqueda.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { Bar, Line, Doughnut, Radar } from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
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
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors'; //
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  fetchFlotas,
  fetchDashboard,
  MsResponseData,
} from '@/pantallas/Peajes/Dashboard/fetchData';
import VerDetalleModal from '@/pantallas/Peajes/Mantencion/VerDetalleModal.vue';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FiltrosBusqueda,
    VerDetalleModal,
    DatePicker,
    TimePicker,
    doughnutComp: Doughnut,
    lineComp: Line,
    'ag-grid-vue': AgGridVue,
    barComp: Bar,
  },
})
export default class TarifasPantalla extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.DashboardPeajes;
  accionesTotales: PermisoAccion[] = [];
  loadingService = new LoadingService();

  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;
  detalleSeleccionado: any = null;
  peajeSeleccionado: number = 0;
  mostrarModalVerDetalle: boolean = false;
  infoItems: any[] = [];
  infoTypeReport: string = '';
  showInfoDialog: boolean = false;
  verDetalle: boolean = false;
  buscarPeaje: string = '';
  flotasSeleccionados: any[] = [];
  flotas: any[] = [];
  checkAllFlotas: boolean = false;
  fechaDesde: any = moment(new Date()).add(-1, 'weeks');
  fechaHasta: any = moment();
  horaDesde: any = moment('00:00', 'HHmm');
  horaHasta: any = moment('23:59', 'HHmm');
  transmissionGraphic: any = [];
  speedGraphic: any = [];
  total: any = 0;
  top5: any = [];

  gridApi: GridApi = null;

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Patente',
        field: 'rego',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Gasto',
        field: 'gasto',
        cellStyle: { textAlign: 'left' },
      },
    ].map(x => ({
      width: 250,
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.top5);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  selectAllFlota() {
    if (this.checkAllFlotas === true) {
      this.flotas.forEach((x: any) => {
        const existe: boolean = this.flotasSeleccionados.some(a => a === x);
        if (existe === false) {
          this.flotasSeleccionados.push(x);
        }
      });
    } else {
      this.flotasSeleccionados = [];
    }
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 14) {
      retorno = item.substr(0, 30) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  get fechaMaxima() {
    const fechaMax = moment().format('YYYY-MM-DD h:mm:ss a');
    return fechaMax;
  }

  buscaDashboard() {
    console.log('busca');
    let data = {
      flotas: this.flotasSeleccionados,
      starting_date: this.fechaDesde.format('YYYY-MM-DD').toString(),
      starting_hour: this.horaDesde.format('HH:mm').toString(),
      ending_date: this.fechaHasta.format('YYYY-MM-DD').toString(),
      ending_hour: this.horaHasta.format('HH:mm').toString(),
    };
    this.buscarDashboard(data);
  }

  formatGraphicTransmission(data: []) {
    var labels: any = [];
    var values: any = [];
    var color: any = [];
    for (var item of data) {
      values.push(item['gasto']);
      labels.push(item['desc_tipotarifa']);
      color.push(this.dynamicColors());
    }
    return { labels: labels, values: values, color: color };
  }

  mounted() {
    this.buscarFlotas();
    let data = {
      flotas: this.flotasSeleccionados,
      starting_date: this.fechaDesde.format('YYYY-MM-DD').toString(),
      starting_hour: this.horaDesde.format('HH:mm').toString(),
      ending_date: this.fechaHasta.format('YYYY-MM-DD').toString(),
      ending_hour: this.horaHasta.format('HH:mm').toString(),
    };
    this.buscarDashboard(data);
    (this.$refs.doughnutCompRef as Doughnut).addPlugin(ChartDataLabels);
  }

  @Watch('transmissionGraphic')
  onTransmissionChanged(value: string, oldValue: string) {
    this.mountGraphicTransmission();
    this.mountGraphicSpeed();
  }

  showLoading() {
    this.requestsStart += 1;
    if (this.requestsStart == 1) {
      this.loadingService.showLoading();
    }
  }
  hideLoading() {
    this.requestsStart -= 1;
    if (this.requestsStart == 0) {
      this.loadingService.hideLoading();
    }
  }

  async buscarFlotas() {
    this.MsResponseData = (await this.fetchFlotas()) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.flotas = this.MsResponseData.data;
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error('Por Favor Seleccione una Flota', {
          timeout: 3000,
        });
      }
    }
  }

  async buscarDashboard(data: any) {
    this.MsResponseData = (await this.fetchDashboard(data)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.MENSAJE_RESPUESTA == 'OK') {
          data = this.MsResponseData.data;
          this.transmissionGraphic = data.porTarifa;
          this.total = data.total[0].gasto;
          this.top5 = data.top5;
          this.gridApi.setRowData(this.top5);
          this.speedGraphic = data.vehiculos;
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error('Por Favor Seleccione una Flota', {
          timeout: 3000,
        });
      }
    }
  }

  fetchFlotas() {
    this.showLoading();
    return fetchFlotas(localStorage.clienteDefecto)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  fetchDashboard(data: any) {
    this.showLoading();
    return fetchDashboard(data)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }
  dynamicColors() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  mountGraphicTransmission() {
    var data = this.formatGraphicTransmission(this.transmissionGraphic);
    (this.$refs.doughnutCompRef as Doughnut).renderChart(
      {
        labels: data.labels,
        datasets: [
          {
            label: '',
            data: data.values,
            backgroundColor: data.color,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            display: false,
          },
        },
      }
    );
  }
  mountGraphicSpeed() {
    var data = this.getForListBar(this.speedGraphic, 'rego', 'gasto', 'Gasto');
    (this.$refs.barRefSpeed as Bar).renderChart(
      {
        labels: data.labels,
        datasets: [
          {
            label: data.ref,
            data: data.values,
            backgroundColor: '#d49231',
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
      }
    );
  }
  getForListBar(
    data: [],
    labelName: string,
    valueName: string,
    graphRef: string
  ) {
    var labels: any = [];
    var values: any = [];
    for (var item of data) {
      labels.push(item[labelName]);
      values.push(item[valueName]);
    }
    return { labels: labels, values: values, ref: graphRef };
  }
}
</script>
<style scoped>
::v-deep .gridcard div.parent .v-card {
  display: none !important;
}

::v-deep .ag-root-wrapper-body.ag-layout-normal {
  height: auto !important;
}
.idCard {
  height: 100%;
  max-height: 100%;
}
.idcardTitle {
  font-size: medium;
  width: 100%;
  max-height: 54px;
  display: flex;
}
.titleCards {
  padding: 17px;
  font-weight: 500;
}
</style>

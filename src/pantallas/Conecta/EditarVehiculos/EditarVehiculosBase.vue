<template>
  <div class="resportesserie">
    <div class="flex sm10 md10">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.avl.value"
                :label="formFields.avl.label"
                :items="avlist"
                item-text="avl"
                item-value="avl"
                @change="getVehiculosOptions"
              />
            </v-flex>

            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.flota.value"
                :label="formFields.flota.label"
                :items="flotalist"
                item-text="nombre"
                item-value="id"
                @change="getVehiculosOptionsPatente"
              />
            </v-flex>

            <v-flex sm3 md3>
              <v-autocomplete
                v-model="formFields.patente.value"
                :label="formFields.patente.label"
                :items="patentelist"
                item-text="patente_vehiculo"
                item-value="patente_vehiculo"
              />
            </v-flex>
            <v-flex sm3 md3>
              <div class="text-sm-center botones-filtros">
                <v-btn @click="handleBuscarClick">
                  <v-icon>search</v-icon>Filtrar
                </v-btn>
                <v-btn @click="clearFilters">
                  <v-icon>clear</v-icon>Limpiar
                </v-btn>
              </div>
            </v-flex>
          </v-flex>
        </v-flex>
        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>

    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
      />
    </div>

    <VerEditarModal
      v-if="dialog"
      @cerrar="handleCierreModalVerDetalle"
      :codigoVehiculo="codigoVehiculo"
      :nombre="nombre"
      :flota="flota"
      :patente="patente"
    />
    <div v-if="dialog2" class="wrap-evidencia">
      <div id="myModal2" class="modalEnvio">
        <!-- Modal content -->
        <div class="modalEnvio-content">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Detalle del Vehículo</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn
                flat
                small
                color="primary"
                @click="handleCierreModalVerDetalle_2()"
              >
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <v-flex sm12 md12>
              <div>
                <h3>{{ patente }}</h3>
                <ul id="example-1">
                  <li v-for="(value, name) in jinfo" v-bind:key="name">
                    <span
                      class="llave"
                      style="font-size: 16px;
                      font-weight: bold;"
                      >{{ name }}</span
                    >
                    :

                    <span class="valor">{{ value }}</span>
                    <br />
                  </li>
                </ul>
              </div>
            </v-flex>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from '@/pantallas/Conecta/EditarVehiculos/fetchReporteSerie';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';

import { PermisoAccion } from '@/views/base/VariablesPermisos';
import VerEditarModal from '@/pantallas/Conecta/EditarVehiculos/VerEditarModal.vue';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FormFieldsContainer,
    DatePicker,
    VerEditarModal,
  },
})
export default class EditarVehiculosBase extends ComponenteBase {
  funcionalidad: Funcionalidades = Funcionalidades.EditarVehiculos;
  @Prop({ default: false }) modoVer: boolean;

  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;
  dialog: boolean = false;
  dialog2: boolean = false;
  //MsResponseData: MsResponseData = null;
  //MsResponseDataWidget: MsResponseDataWidget = null;
  codigoVehiculoLabel: any = 'Codigo Vehículo';
  tipoeqid: any = '';
  pagina: number = 1;
  codigoVehiculo: any = '';
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  nombre: any = '';
  texto_reporte: string = '';
  ordesList: any[] = [];
  flota: any = '';
  patente: any = '';
  flotalist: any[] = [];
  patentelist: any[] = [];
  avlist: any[] = [];
  jinfo: any;
  showModalMostrar: boolean = false;
  usuarioID: any = '';
  condator: any = '';
  hashpaginacion: string = '';
  rowcount: number = 0;
  total_registros: number = 0;
  cant_regs_pag: number = 25;
  rutDefecto: any = '';
  contador: number = null;

  searchData() {
    this.gridApi.setQuickFilter(this.serverSide);
    this.gridApi.setDomLayout('autoHeight');
  }
  getVehiculosOptions() {
    let self = this;
    this.loadingService.showLoading();
    this.formFields.flota.value = '';
    this.formFields.patente.value = '';
    return fetchReportesSerie(
      {
        AVL: this.formFields.avl.value,
        ClienteDefecto: JSON.parse(localStorage.getItem('clienteDefecto')),
      },
      'editar_vehiculos/get_grilla_filters_diferido'
    )
      .then((data: any) => {
        if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          this.formFields.flota.value = '';
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        } else if (data.data.CODIGO_RESPUESTA == '1') {
          self.flotalist = data.data.FLOTA;

          this.formFields.patente.value = '';
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.formFields.patente.value = '';
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  getVehiculosOptionsPatente() {
    let self = this;
    this.formFields.patente.value = '';
    this.loadingService.showLoading();
    if (this.formFields.flota.value == '') {
      return false;
    }
    return fetchReportesSerie(
      {
        AVL: this.formFields.avl.value,
        flota: this.formFields.flota.value,
        ClienteDefecto: JSON.parse(localStorage.getItem('clienteDefecto')),
      },
      'editar_vehiculos/get_grilla_filters_patente'
    )
      .then((data: any) => {
        if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          this.formFields.patente.value = '';
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        } else if (data.data.CODIGO_RESPUESTA == '1') {
          self.patentelist = data.data.PATENTE;
        } else {
          this.formFields.patente.value = '';
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { ClienteDefecto: JSON.parse(localStorage.getItem('clienteDefecto')) },
      'editar_vehiculos/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.avlist = data.data.AVL;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleVerDetalleClick);
    actionsEvent.onVerDetalle(this.handleVerDetalleClick_2);
  }

  mounted() {
    if (this.$route.path.includes('Huella-Carbono'))
      this.funcionalidad = Funcionalidades.MedioAmbiente;
  }

  handleVerDetalleClick_2(params: ICellRendererParams) {
    this.codigoVehiculo = params.data.cod_vehiculo;

    this.patente = params.data.patente_vehiculo;
    let self = this;
    return fetchReportesSerie(
      {
        codigo_vehiculo: this.codigoVehiculo,
      },
      'editar_vehiculos/detalle_vehiculo_modelo'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          /* self.jinfo = data.data.JINFO.jinfo */

          self.jinfo = data.data.JINFO.jinfo;
          this.dialog2 = true;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  handleCierreModalVerDetalle_2() {
    this.dialog2 = false;
  }
  handleVerDetalleClick(params: ICellRendererParams) {
    this.dialog = true;
    this.codigoVehiculo = params.data.cod_vehiculo;
    this.nombre = params.data.nombre_nombre;
    this.flota = params.data.__nom_flota;
    this.patente = params.data.patente_vehiculo;
  }
  handleCierreModalVerDetalle() {
    this.dialog = false;
    this.handleBuscarClick();
  }

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código del Vehículo',
        field: 'cod_vehiculo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 300,
      },
      {
        headerName: 'Nombre de Flota',
        field: '__nom_flota',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 300,
      },
      {
        headerName: 'Cliente',
        field: 'nombre_nombre',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 350,
      },
      {
        headerName: 'Patente del Vehículo',
        field: 'patente_vehiculo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 300,
      },
    ],
    pagination: true,
    paginationPageSize: this.cant_regs_pag,
    cacheBlockSize: this.cant_regs_pag,
    paginationAutoPageSize: false,
    rowModelType: 'serverSide',
    serverSideDatasource: this.serverSide,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    onSelectionChanged: this.onSelectionChanged,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
    onGridSizeChanged: event => {
      //event.api.sizeColumnsToFit();
    },
  };
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    //this.gridApi.rowModel.rowsToDisplay = this.rowcount;
    this.columnApi = event.columnApi;
    this.gridEvent = event;
    this.usuarioID = JSON.parse(localStorage.getItem('clienteDefecto'));

    let self = this;
    this.serverSide = {
      getRows(event: any): void {
        event.request.paginationSize = self.gridOptions.cacheBlockSize;
        self.pagina = Math.ceil(
          event.request.startRow / self.cant_regs_pag + 1
        );
        let body: any = self.filtros2body();
        body.pagina = self.pagina;

        if (body.avl == '') {
          event.successCallback([{}], 0);
          self.gridApi.setDomLayout('autoHeight');
          return;
        }

        fetchReportesSerie(
          {
            AVL: body.avl,
            PATENTE: body.patente,
            FLOTA: body.flota,
            pagina: body.pagina * 25,
            ClienteDefecto: JSON.parse(localStorage.getItem('clienteDefecto')),
          },
          'editar_vehiculos/get_filtered_rs'
        )
          .then((response: any) => {
            //console.log(response);
            if (response.data.CODIGO_RESPUESTA == '1') {
              if (response.data.data.length === 0) {
                self.$snotify.error('Sin registros', { timeout: 3000 });
                event.successCallback([{}], 0);
              } else {
                if (self.contador == null) {
                  let count = response.data.cant_regs_pag.hasOwnProperty(
                    'count'
                  )
                    ? Number(response.data.cant_regs_pag.count)
                    : Number(response.data.cant_regs_pag.TOTAL_REGISTROS);
                  if (count != undefined) {
                    self.contador = count;
                  } else {
                    self.contador = 0;
                  }
                }
                if (self.contador == 0)
                  self.contador = this.data.data.LISTA.length;
                event.successCallback(response.data.data.LISTA, self.contador);
                self.gridApi.hideOverlay();
              }
            } else {
              event.successCallback([{}], 0);
              self.$snotify.error(response.data.MENSAJE_RESPUESTA, {
                timeout: 3000,
              });
            }
          })
          .catch((error: any) => {
            event.successCallback([{}], 0);
            self.$snotify.error('Ocurrió un error. Intente nuevamente.', {
              timeout: 3000,
            });
          })
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
          });
      },
    };
    this.getEquipos();
    this.clearFilters();
  }

  formFields: FormFieldDefMap = {
    avl: {
      label: 'AVL',
      id: 'tipoubicaid',
      value: 'tipoubicaname',
    },
    flota: {
      label: 'Flota',
      id: 'asigrequerimiento',
      value: 'asigrequerimiento',
    },
    patente: {
      label: 'Patente',
      id: 'asigrequerimiento',
      value: 'asigrequerimiento',
    },
  };

  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }

  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }
  get fechaMinimaInicio() {
    let fechaIni = this.formFields.fechaInicio.value;
    return fechaIni as moment.Moment;
  }
  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }
  get fechaMaximaInicio() {
    //let fechaMax = this.formFields.fechaInicio.value;

    return moment(this.fechaMaxima) as moment.Moment;
    //return fechaMax as moment.Moment;
  }

  async clearFilters() {
    console.log(this.formFields);
    this.formFields.avl.value = '';
    this.formFields.flota.value = '';
    this.flotalist = [];
    this.formFields.patente.value = '';
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.gridApi.showNoRowsOverlay();
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.accionEditar];

  filtroRequerimiento(loadWidget: boolean) {
    if (this.formFields.avl.value == '') {
      this.$snotify.error('Debe seleccionar un AVL', {
        timeout: 3000,
      });
    } else {
      this.contador = null;
      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }
  async fetchRequermientosWidgets() {
    this.loadingService.showLoading();
  }
  filtros2body() {
    let body: any = {};
    body.patente = this.formFields.patente.value;
    body.flota = this.formFields.flota.value;
    body.avl = this.formFields.avl.value;

    return body;
  }
  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }
  onSelectionChanged(params: any) {
    //console.log('seleccionados');
    //console.log(this.gridApi.getSelectedNodes());
  }
}
</script>
<style scope>
.editarVehiculoConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.editarVehiculoConecta
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1) {
  display: none;
}
.editarVehiculoConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.editarVehiculoConecta .resportesserie .estilo-grilla,
.editarVehiculoConecta #gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>

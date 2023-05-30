<template>
  <div class="resportesserie">
    <div class="flex sm16 md16">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm2 md2>
              <v-text-field
                v-model="formFields.simnumero.value"
                :label="formFields.simnumero.label"
              />
            </v-flex>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.motibaja.value"
                :label="formFields.motibaja.label"
                :items="bajalist"
                item-text="motiname"
                item-value="motiid"
                clearable
              />
            </v-flex>
            <v-flex sm2 md2>
              <DatePicker
                :label="formFields.fechaInicio.label"
                :error-messages="errors.collect(formFields.fechaInicio.id)"
                :id="formFields.fechaInicio.id"
                v-model="formFields.fechaInicio.value"
                :max="fechaMaximaInicio.format('YYYY-MM-DD')"
              />
            </v-flex>
            <v-flex sm2 md2>
              <DatePicker
                :label="formFields.fechaFin.label"
                :error-messages="errors.collect(formFields.fechaFin.id)"
                :id="formFields.fechaFin.id"
                v-model="formFields.fechaFin.value"
                :max="fechaMaximaInicio.format('YYYY-MM-DD')"
              />
            </v-flex>

            <v-flex sm2 md2>
              <div class="text-sm-center botones-filtros">
                <v-btn @click="handleBuscarClick">
                  <v-icon>search</v-icon>Filtrar
                </v-btn>
                <v-btn @click="clearFilters">
                  <v-icon>clear</v-icon>Limpiar
                </v-btn>
              </div>
            </v-flex>
            <v-flex sm2 md2>
              <div class="text-sm-center botones-filtros">
                <v-btn
                  v-if="accionCrear.visible"
                  style="padding-right:20px;"
                  color="#ffe800"
                  @click="handleCrearClick()"
                >
                  <v-icon dark left style="color: black;"
                    >add_circle_outline</v-icon
                  >
                  <span style="color: black;">Crear</span>
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
        class="solicitud-baja"
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
      />
    </div>
    <CrearSolicitud
      :modoVer="true"
      :show="mostrarModalCrear"
      v-on:modalAsociacionEmit="handleCierreModal()"
      :serverSide="serverSide"
    />
    <app-confirmacion
      :show="mostrarModalVerDetalle"
      :titulo="$t('Confirmación')"
      :mensaje="$t('¿Está seguro de anular la solicitud?')"
      v-on:modalConfirmationEmit="confirmCallback($event, params)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';

import DatePicker from '@/reusable/Form/DatePicker.vue';

import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import moment from 'moment';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import CrearSolicitud from './CrearSolicitud.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { actionsEvent } from '@/setup';
import Confirmation from '@/components/Confirmation.vue';
@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,

    FormFieldsContainer,
    DatePicker,
    CrearSolicitud,
    CrearButton,

    'app-confirmacion': Confirmation,
  },
})
export default class SimBajaIndividualBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.SimBajaIndividual;
  mostrarModalVerDetalle: boolean = false;
  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;

  //MsResponseData: MsResponseData = null;
  //MsResponseDataWidget: MsResponseDataWidget = null;
  reporteSeleccionado: Number = null;
  serieNumeroSeleccionado: string = null;
  tipoEquipoSeleccionado: string = null;
  serieactivanroSeleccionado: string = null;
  showReporteGenerado: boolean = false;
  tipoeqid: any = '';
  pagina: number = 1;
  mostrarModalCrear: boolean = false;
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;

  estadolist: any = [];

  usuarioID: any = '';
  $snotify: any;
  hashpaginacion: string = '';
  rowcount: number = 0;
  total_registros: number = 0;
  cant_regs_pag: number = 25;
  bajalist: any[] = [];

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'sim_baja_individual/get_motibaja')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.bajalist = data.data.BAJAS;
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

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Número',
        field: 'sbajasimnumero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Fecha de Solicitud',
        field: 'sbajasimfecha_alta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        headerName: 'Usuario',
        field: 'nombre',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },

      {
        headerName: 'SIM Serie Número',
        field: 'simserienumero',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Telco',
        field: 'telconame',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Telco Plan',
        field: 'telcoplanname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Estado al Solicitar',
        field: 'configvalor',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Estado Actual',
        field: 'configvalor',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Motivo de Baja',
        field: 'motiname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Observación',
        field: 'sbajasimobs',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Vigencia',
        field: 'sbajasimanulado',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
        cellRenderer: params => {
          if (params.data.sbajasimanulado == 'f') {
            return (
              '<i class="material-icons" title="Vigente" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(42, 255, 78)"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Vigente' +
              '</a>'
            );
          } else {
            return (
              '<i class="material-icons" title="Anulado" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(255, 58, 58)"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Anulado' +
              '</a>'
            );
          }
        },
      },
      {
        headerName: 'Revisado',
        field: 'sbajasimrevisado',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
        cellRenderer: params => {
          if (params.data.sbajasimrevisado == 'f') {
            return (
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'No revisada' +
              '</a>'
            );
          } else {
            return (
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Revisada' +
              '</a>'
            );
          }
        },
      },
      {
        headerName: 'Fecha de Ejecución',
        field: 'sbajasimfecha_revisa',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ],

    pagination: true,
    paginationPageSize: this.cant_regs_pag,
    cacheBlockSize: this.cant_regs_pag,
    paginationAutoPageSize: false,
    rowModelType: 'serverSide',
    serverSideDatasource: this.serverSide,
    onGridReady: this.handleGridReady,
    overlayNoRowsTemplate: 'No hay filas para mostrar',
  };

  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.gridApi = event.api;
    this.gridApi.setDomLayout('autoHeight');

    //this.gridApi.rowModel.rowsToDisplay = this.rowcount;
    this.columnApi = event.columnApi;
    this.gridEvent = event;
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    let self = this;
    this.getEquipos();
    this.serverSide = {
      getRows(event: any): void {
        event.request.paginationSize = self.gridOptions.cacheBlockSize;
        self.pagina = Math.ceil(
          event.request.startRow / self.cant_regs_pag + 1
        );

        fetchReportesSerie(
          {
            simnumero: self.formFields.simnumero.value,
            motiid: self.formFields.motibaja.value,
            fechainicio: self.formFields.fechaInicio.value,
            fechafin: self.formFields.fechaFin.value,
          },
          'sim_baja_individual/inicio'
        )
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              if (response.data.MENSAJE_RESPUESTA === 'sin registros') {
                self.$snotify.error('Sin registros', { timeout: 3000 });
                event.successCallback([{}], 0);
                self.gridApi.showNoRowsOverlay();
              } else {
                event.successCallback(
                  response.data.data.LISTA,
                  Number(response.data.data.TOTAL_REGISTROS)
                );

                /* self.hashpaginacion = response.data.hash1; */
                /* self.rowcount =
               28; */

                /* self.total_registros =
                  response.data.data.TOTAL_REGISTROS === null
                    ? 0
                    : response.data.data.TOTAL_REGISTROS; */
                /* self.cant_regs_pag =
                  response.data.cant_regs_pag === null
                    ? 25
                    : response.data.cant_regs_pag; */

                self.gridApi.hideOverlay();
                self.autoSizeAll(true);
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
    this.gridApi.setServerSideDatasource(this.serverSide);
    this.getEquipos();
    this.clearFilters();
  }

  formFields: FormFieldDefMap = {
    simnumero: {
      label: 'SIM Serie Número',
      id: '',
      value: '',
    },
    motibaja: {
      label: 'Motivo de Baja',
      id: '',
      value: '',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: moment().subtract(1, 'month'),
    },
    fechaFin: {
      label: 'Fecha Fin',
      id: 'fechaFin',
      value: moment(),
    },
  };

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }
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
    this.formFields.simnumero.value = '';
    this.formFields.motibaja.value = '';
    this.formFields.fechaInicio.value = moment().subtract(1, 'month');
    this.formFields.fechaFin.value = moment();

    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionAnular: PermisoAccion = {
    accionCodigo: 94,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionAnular,
  ];

  filtroRequerimiento(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
  }
  async fetchRequermientosWidgets() {
    this.loadingService.showLoading();
  }
  constructor() {
    super();
    actionsEvent.onAnular(this.handleVerDetalleClick);
  }
  params: any;
  numero: any;

  handleVerDetalleClick(params: ICellRendererParams) {
    /*     this.simestadolistSeleccionado = this.simestadolist */
    this.mostrarModalVerDetalle = true;
    this.params = params;
    this.numero = params.data.sbajasimnumero;
    return this.params;
  }

  async confirmCallback(val: boolean, params: any) {
    if (params.data.sbajasimanulado == 't') {
      this.$snotify.error(
        'La solicitud ' + params.data.sbajasimnumero + ' ya ha sido anulada',
        { timeout: 3000 }
      );
      this.mostrarModalVerDetalle = false;
      return;
    }
    if (val) {
      this.mostrarModalVerDetalle = false;
      this.loadingService.showLoading();
      return fetchReportesSerie(
        {
          usuarioid_modifica: JSON.parse(localStorage.getItem('user')).id,
          usuariorut_modifica: JSON.parse(localStorage.getItem('user'))
            .rutClienteDefecto,
          numero: params.data.sbajasimnumero,
        },
        'sim_baja_individual/anular'
      )
        .then((data: any) => {
          if (data.data.MENSAJE_RESPUESTA == 'Estado Creado OK') {
            this.$snotify.success(
              'Ha anulado la solicitud con número ' +
                params.data.sbajasimnumero,
              { timeout: 3000 }
            );
            this.gridApi.setServerSideDatasource(this.serverSide);
          } else {
            this.$snotify.error(
              'La solicitud' +
                params.data.sbajasimnumero +
                ' ya ha sido revisada y no se puede anular',
              { timeout: 3000 }
            );
            return;
          }
        })
        .catch((error: any) => {
          alert('paso al cathc');
          return;
        })
        .finally(() => {
          this.loadingService.hideLoading();
          this.mostrarModalVerDetalle = false;
          return null;
        });
    }
  }

  handleCrearClick() {
    this.serverSide;
    this.mostrarModalCrear = true;
  }

  handleCierreModal() {
    this.mostrarModalCrear = false;
    //this.actualizarGrilla();
    this.gridApi.setServerSideDatasource(this.serverSide);
  }
}
</script>
<style scope>
.simBajaIndividual
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.simBajaIndividual div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.simBajaIndividual
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}

.resportesserie .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>

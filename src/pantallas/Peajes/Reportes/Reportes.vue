<template>
  <div class="tarifas">
    <v-dialog v-model="showInfoDialog" width="500">
      <v-toolbar dark color="primary">
        <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
          >Aplicaciones {{ infoTypeReport }}</v-toolbar-title
        >
      </v-toolbar>
      <v-card max-height="300" id="bodyDialogInfo">
        <div style="margin-left: 20px;">
          <div v-for="item in infoItems" :key="item.index" class="itemInfoDiv">
            <li>
              <!-- <strong style="margin-right: 7px">{{ item.key }}: </strong> -->
              {{ item.value }}
            </li>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <fieldset
      style="width: 100%;margin-bottom: 20px;display: flex;height: 95%;border: 1px solid rgb(220, 220, 220);"
    >
      <legend style="margin-left: 0.3rem; color: #9e9e9e;font-size: 0.8rem;">
        Generar Reporte
      </legend>
      <v-form
        style="display: flex; align-items: center; justify-content: center; width: 100%;"
        v-model="isFormValid"
      >
        <FormFieldsContainer
          style="display: flex; align-items: center; justify-content: center; width: 100%;"
        >
          <div style="margin: 20px; width: 50%; ">
            <v-autocomplete
              data-vv-name="flotaRequerido"
              v-validate="'required'"
              :error-messages="errors.collect('flotaRequerido')"
              required
              v-model="flotasSeleccionados"
              :items="flotas"
              label="Flotas"
              multiple
              chips
              deletable-chips
              dense
              @change="buscarVehiculos(flotasSeleccionados)"
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
            <v-autocomplete
              data-vv-name="vehiculoRequerido"
              v-validate="'required'"
              :error-messages="errors.collect('vehiculoRequerido')"
              required
              v-model="vehiculosSeleccionados"
              :items="vehiculos"
              label="Vehiculos"
              multiple
              chips
              deletable-chips
              dense
            >
              <template v-slot:prepend-item>
                <v-list-tile
                  ><v-checkbox
                    v-model="checkAllVehiculos"
                    label="Seleccionar todos"
                    @change="selectAllVehiculo()"
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
                  (+{{ vehiculosSeleccionados.length - 1 }})
                </span>
              </template>
            </v-autocomplete>
            <v-autocomplete
              data-vv-name="peajeRequerido"
              v-validate="'required'"
              :error-messages="errors.collect('peajeRequerido')"
              required
              v-model="peajesSeleccionados"
              :items="peajes"
              label="Peajes"
              multiple
              chips
              deletable-chips
              dense
            >
              <template v-slot:prepend-item>
                <v-list-tile
                  ><v-checkbox
                    v-model="checkAllPeajes"
                    label="Seleccionar todos"
                    @change="selectAllPeajes()"
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
                  (+{{ peajesSeleccionados.length - 1 }})
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
                  label="Hora Inicio"
                  v-model="horaHasta"
                  v-validate="'required'"
                />
              </div>
            </div>
            <div style="display: flex; justify-content: center;">
              <div>
                <v-radio-group v-model="row" row>
                  <v-radio label="PDF" value="pdf"></v-radio>
                  <v-radio label="EXCEL" value="xlsx"></v-radio>
                  <v-radio label="CSV" value="csv"></v-radio>
                  <v-btn color="#FFE700" @click="generarReporte()"
                    >Generar</v-btn
                  >
                </v-radio-group>
              </div>
            </div>
          </div>
        </FormFieldsContainer>
      </v-form>
    </fieldset>
    <v-flex sm12 md12 style="width: 30%;">
      <v-text-field
        v-model="buscarPeaje"
        label="Buscar..."
        @input="onFilterPeajes"
        @keydown="preventEnter"
      ></v-text-field>
    </v-flex>
    <div class="gridcard rounded-card">
      <AgGridVue
        ref="gridComponent"
        class="ag-theme-material"
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
    <!-- <VerDetalleModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :detalleSeleccionado="detalleSeleccionado"
      :peajeSeleccionado="peajeSeleccionado"
      :verDetalle="verDetalle"
    /> -->
    <MensajeValidacion
      :showDialog="showValidacionReporteRestricciones"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      :href="$t(mensajeHRef)"
      :mensajeBot="$t(mensajeValidacionBot)"
    ></MensajeValidacion>
    <app-confirmacion
      :show="showValidacionReporteTime"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      :textoBtnSi="$t('mensajes.mensajesInformes.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesInformes.btnCancelarGeneracion')"
    ></app-confirmacion>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Conecta/Clientes/FiltrosBusqueda.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { save_report } from '@/pantallas/Informes/partes/fetchSaveReport';
import { postReporteTime } from '@/pantallas/Informes/partes/postReporteTime';
import MensajeValidacionHRef from '@/pantallas/Informes/partes/MensajeValidacionHRef.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import MensajeValidacion from '../../../reusable/Mantenedor/MensajeValidacion.vue';
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
  fetchHistorico,
  fetchTarifas,
  fetchVehiculos,
  fetchFlotas,
  fetchPeajes,
  MsResponseData,
} from '@/pantallas/Peajes/Reportes/fetchData';
import VerDetalleModal from '@/pantallas/Peajes/Tarifas/VerDetalleModal.vue';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FiltrosBusqueda,
    VerDetalleModal,
    DatePicker,
    TimePicker,
    MensajeValidacion: MensajeValidacionHRef,
    FormFieldsContainer,
    AgGridVue,
  },
})
export default class TarifasPantalla extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesPeajes;
  loadingService = new LoadingService();

  requestsStart: number = 0;
  isFormValid: boolean = false;
  MsResponseData: MsResponseData = null;
  detalleSeleccionado: any = null;
  // peajeSeleccionado: number = 0;
  mostrarModalVerDetalle: boolean = false;
  infoItems: any[] = [];
  dataInforme: any = null;
  infoTypeReport: string = '';
  showInfoDialog: boolean = false;
  verDetalle: boolean = false;
  buscarPeaje: string = '';
  fechaDesde: any = moment(new Date()).add(-1, 'weeks');
  fechaHasta: any = moment();
  horaDesde: any = moment('00:00', 'HHmm');
  horaHasta: any = moment('23:59', 'HHmm');
  vehiculos: any[] = [];
  flotas: any[] = [];
  peajes: any[] = [];
  params: any[] = [];
  flotasSeleccionados: any[] = [];
  vehiculosSeleccionados: any[] = [];
  peajesSeleccionados: any[] = [];
  showBtnCancelar: boolean = false;
  showValidacionReporteRestricciones: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';
  row: string = 'pdf';
  mensajeValidacionBot: string = '';
  mensajeHRef: any = null;
  showValidacionReporteTime: boolean = false;
  checkAllFlotas: boolean = false;
  checkAllVehiculos: boolean = false;
  checkAllPeajes: boolean = false;

  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id_peaje_historico',
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre Peaje',
        field: 'nom_peaje',
        cellStyle: { textAlign: 'left' },
        width: 320,
      },
      {
        headerName: 'Ruta',
        field: 'nom_ruta',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Precio',
        field: 'val_precio',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Tarifa',
        field: 'nom_tipotarifa',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha ',
        field: 'val_fechahoraactividad',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Ubicación',
        field: 'val_ubicacion',
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Aplicaciones',
      //   field: 'aplicaciones',
      //   cellStyle: { textAlign: 'left' },
      //   type: 'medalColumn',
      //   tooltipField: 'country',
      //   cellRenderer: () => {
      //     return '<i class="material-icons" id="5545" title="Ver Filtros" style="width: 28px; height: 28px; margin-top: 10%" >info_outlined</i>';
      //   },
      //   onCellClicked: this.handleClickInfo,
      //   columnGroupShow: 'closed',
      // },
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

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    const cliente = localStorage.clienteDefecto;
    console.log(localStorage);
    this.buscarHistorico(cliente, '');
    this.buscarFlotas();
    this.buscarPeajes();
    // this.buscarVehiculos();
  }
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }
  accionesTotales: PermisoAccion[] = [];

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

  fetchHistorico(id: string, rut: string) {
    this.showLoading();
    return fetchHistorico(id, rut)
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

  fetchVehiculos(flotas: any) {
    this.showLoading();
    return fetchVehiculos(flotas)
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

  fetchPeajes() {
    this.showLoading();
    return fetchPeajes()
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

  async buscarHistorico(id: string, rut: string) {
    this.MsResponseData = (await this.fetchHistorico(id, rut)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.gridApi.setRowData(this.MsResponseData.data);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async buscarVehiculos(flotas: any) {
    this.MsResponseData = (await this.fetchVehiculos(flotas)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.vehiculos = this.MsResponseData.data;
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
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
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async buscarPeajes() {
    this.MsResponseData = (await this.fetchPeajes()) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          for (
            let index = 0;
            index < this.MsResponseData.data.length;
            index++
          ) {
            this.peajes.push(this.MsResponseData.data[index]['nom_peaje']);
          }
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  handleClickInfo(event: any) {
    var itemsInfo: any[] = [];
    if (event.value != '' && event.value != undefined && event.value != null) {
      for (var key in event.value) {
        if (event.value.hasOwnProperty(key)) {
          itemsInfo.push({ key: key, value: event.value[key].appname });
        }
      }
    }
    if (itemsInfo.length == 0) {
      itemsInfo.push({ key: 1, value: 'Sin Aplicaciones' });
    }
    this.infoItems = itemsInfo;
    this.infoTypeReport = event.data.nombre_reporte;
    this.showInfoDialog = true;
  }

  onFilterPeajes() {
    if (this.buscarPeaje.length > 1) {
      this.gridApi.setQuickFilter(this.buscarPeaje);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  preventEnter(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  filtroForm(filtros: any) {
    this.buscarHistorico('', filtros.rut.value);
  }
  // handleVerDetalleClick(params: ICellRendererParams) {
  //   this.verDetalle = true;
  //   this.detalleSeleccionado = params.data;
  //   this.peajeSeleccionado = this.detalleSeleccionado.id_peaje;
  //   this.buscarTarifas(this.detalleSeleccionado.id_peaje);
  // }

  // handleEditarClick(params: ICellRendererParams) {
  //   this.verDetalle = false;
  //   this.detalleSeleccionado = params.data;
  //   this.peajeSeleccionado = this.detalleSeleccionado.id_peaje;
  //   this.buscarTarifas(this.detalleSeleccionado.id_peaje);
  // }

  async buscarTarifas(id: number) {
    this.MsResponseData = (await this.fetchTarifas(id)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.detalleSeleccionado = this.MsResponseData.data;
          this.mostrarModalVerDetalle = true;
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  fetchTarifas(id_peaje: number) {
    this.showLoading();
    return fetchTarifas(id_peaje)
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

  handleCierreModalVerDetalle() {
    this.mostrarModalVerDetalle = false;
    this.buscarHistorico('', '');
  }
  clearForm() {
    this.buscarHistorico('', '');
  }

  constructor() {
    super();
    // actionsEvent.onEditar(this.handleEditarClick);
    // actionsEvent.onVerDetalle(this.handleVerDetalleClick);
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

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 14) {
      retorno = item.substr(0, 30) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  async generarReporte() {
    let f = [];
    for (let index = 0; index < this.flotasSeleccionados.length; index++) {
      f.push({ nombre: this.flotasSeleccionados[index] });
    }
    let v = [];
    for (let index = 0; index < this.vehiculosSeleccionados.length; index++) {
      v.push({ unidad: this.vehiculosSeleccionados[index] });
    }
    // if(f.length == 0 || v.length == 0 || this.peajesSeleccionados.length == 0 || this.peajesSeleccionados.length == 0){
    //     this.$snotify.error("Por Favor Complete Todos los Campos");
    //     return;
    // }
    var valid = await this.$validator.validateAll();
    if (!valid) {
      console.log('return');
      return;
    }
    this.dataInforme = {
      vehiculos_seleccionados: {
        flotas: f,
        vehiculos: v,
        etiquetas: '',
      },
      vehiculos: this.vehiculosSeleccionados,
      peajes: this.peajesSeleccionados,
      starting_date: this.fechaDesde.format('DD-MM-YYYY').toString(),
      starting_hour: this.horaDesde.format('HH:mm').toString(),
      ending_date: this.fechaHasta.format('DD-MM-YYYY').toString(),
      ending_hour: this.horaHasta.format('HH:mm').toString(),
      user: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).id
        : '',
      client: localStorage.clienteDefecto,
      report_type: 'peajes',
      nombreReporte: 'Peajes',
      formato: this.row,
      date_created: moment().utcOffset(0, true),
      hidden_columns: [],
      orientation: 'Portrait',
    };
    console.log(this.dataInforme);
    this.aceptaGeneraInforme(true);
  }

  aceptaGeneraInforme(val: any) {
    this.showBtnCancelar = false;
    this.showValidacionReporteRestricciones = false;
    if (val) {
      this.loadingService.showLoading();
      const res = postReporteTime(this.dataInforme, this.row)
        .then(async (resMin: any) => {
          const response = save_report(this.dataInforme, this.row)
            .then(async (response: any) => {
              if ('id_reporte' in response.data) {
                this.tituloValidacion = 'Informe Creado';
                this.mensajeValidacion =
                  'El informe ID ' +
                  response.data.id_reporte +
                  ' se ha solicitado exitosamente.';
                this.mensajeValidacionBot =
                  'Estará disponible en unos segundos en Histórico Informes.';
                this.mensajeHRef = '/informe-generado';
                this.showValidacionReporteRestricciones = true;
              } else {
                this.tituloValidacion = 'Error Generar Informe';
                this.mensajeValidacion =
                  'Hubo un error a la hora de generar el informe';
                this.showValidacionReporteRestricciones = true;
              }
            })
            .catch(() => {
              this.tituloValidacion = 'Error Generar Informe';
              this.mensajeValidacion =
                'Hubo un error a la hora de generar el informe';
              this.showValidacionReporteRestricciones = true;
              this.loadingService.hideLoading();
            })
            .finally(() => {
              this.loadingService.hideLoading();
            });
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
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
    this.buscarVehiculos(this.flotasSeleccionados);
  }

  selectAllVehiculo() {
    if (this.checkAllVehiculos === true) {
      this.vehiculos.forEach((x: any) => {
        const existe: boolean = this.vehiculosSeleccionados.some(a => a === x);
        if (existe === false) {
          this.vehiculosSeleccionados.push(x);
        }
      });
    } else {
      this.vehiculosSeleccionados = [];
    }
  }

  selectAllPeajes() {
    if (this.checkAllPeajes === true) {
      this.peajes.forEach((x: any) => {
        const existe: boolean = this.peajesSeleccionados.some(a => a === x);
        if (existe === false) {
          this.peajesSeleccionados.push(x);
        }
      });
    } else {
      this.peajesSeleccionados = [];
    }
  }

  get fechaMaxima() {
    const fechaMax = moment().format('YYYY-MM-DD h:mm:ss a');
    return fechaMax;
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
</style>

<template>
  <ModalMantenedor :show="showModal">
    <CabeceraModalCrear
      :titulo="'Generar Certificado'"
      @cerrar="handleCerrar()"
    >
      <v-btn
        class="button"
        @click="changeStep()"
        v-if="isDisableGenerar && templateSelected !== ''"
        :disabled="isDisableBtn || selected.length <= 0"
        >Continuar</v-btn
      >
      <v-btn class="button" @click="generarCert()" v-if="!isDisableGenerar"
        >Generar</v-btn
      >
    </CabeceraModalCrear>

    <div class="modal cardnew certificados_sucursal">
      <div align="center">
        <v-flex md10>
          <v-stepper v-model="e1">
            <v-stepper-header>
              <v-stepper-step :complete="e1 > 1" step="1"
                >Seleccionar Flota, Etiquetas o Vehículo</v-stepper-step
              >
              <v-divider></v-divider>
              <v-stepper-step :complete="e1 > 2" step="2"
                >Vista previa</v-stepper-step
              >
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card class="mb-5" height="100px">
                  <v-flex xs10>
                    <v-select
                      :items="listatipocertificado"
                      item-text="nombre"
                      item-value="id"
                      label="Tipo Certificado"
                      prepend-icon="find_in_page"
                      v-model="templateSelected"
                      @change="validation()"
                    ></v-select>
                    <!--<v-select
                      :items="empresas"
                      item-text="nombre"
                      item-value="id"
                      label="Empresa"
                      prepend-icon="find_in_page"
                      v-model="empresaSelected"
                      @change="validation()"
                    ></v-select>-->
                  </v-flex>
                </v-card>
                <v-card class="rounded-card mt-20">
                  <v-card-title
                    ><h2>Asociar Flotas o Vehículo</h2></v-card-title
                  >
                  <v-divider></v-divider>
                  <v-flex xs10>
                    <v-radio-group
                      row
                      v-model="radioSelect"
                      @change="handleAsociacionesChange($event)"
                    >
                      <v-radio
                        name="Flotas"
                        value="Flotas"
                        label="Flotas"
                      ></v-radio>
                      <v-radio
                        name="Vehiculos"
                        value="Vehiculos"
                        label="Vehículos"
                      ></v-radio>
                    </v-radio-group>
                    <v-text-field
                      prepend-icon="drive_eta"
                      label="Buscar Flota"
                      v-if="radioSelect == 'Flotas'"
                      v-model="codeVehiculo"
                    ></v-text-field>
                    <v-text-field
                      prepend-icon="drive_eta"
                      label="Buscar Vehículo"
                      v-if="radioSelect == 'Vehiculos'"
                      v-model="codeVehiculo"
                    ></v-text-field>
                  </v-flex>
                  <v-data-table
                    :headers="headers"
                    :items="dataTable"
                    :search="codeVehiculo"
                    v-model="selected"
                    class="table"
                    :pagination.sync="pagination"
                    select-all
                  >
                    <template v-slot:headers="props">
                      <tr>
                        <th>
                          <v-checkbox
                            :input-value="props.all"
                            :interminate="props.interminate"
                            primary
                            @click.stop="toggleAll()"
                            hide-details
                          ></v-checkbox>
                        </th>
                        <th
                          v-for="header in props.headers"
                          :key="header.text"
                          :class="[
                            'column sortable',
                            pagination.descending ? 'desc' : 'asc',
                            header.value === pagination.sortBy ? 'active' : '',
                          ]"
                        >
                          {{ header.text }}
                        </th>
                      </tr>
                    </template>
                    <template v-slot:items="props">
                      <td>
                        <v-checkbox
                          v-model="props.selected"
                          primary
                          hide-details
                        ></v-checkbox>
                      </td>
                      <td class="center">{{ props.item.id }}</td>
                      <td class="center">{{ props.item.nombre }}</td>
                    </template>
                    <template v-slot:no-data>
                      <template v-if="loadData.table">
                        <div class="text-xs-center">
                          <v-progress-circular
                            indeterminate
                            color="primary"
                            :size="50"
                          ></v-progress-circular>
                        </div>
                      </template>
                      <v-alert :value="true" type="info" icon="warning" outline>
                        Debe seleccionar una opción con datos disponibles
                      </v-alert>
                    </template>
                  </v-data-table>
                </v-card>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-card class="pb-5 mr-5" height="auto" width="auto">
                  <template v-if="!templateDisponible">
                    <div class="text-xs-center">
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        :size="50"
                      ></v-progress-circular>
                    </div>
                  </template>
                  <v-flex md8>
                    <div
                      class="d-flex mt-2"
                      v-if="templateDisponible && e1 == 2"
                      v-html="renderTemplate()"
                    ></div>
                  </v-flex>
                </v-card>
                <v-flex md2 offset-md10>
                  <v-btn class="outlined" @click="backStep()">Volver</v-btn>
                </v-flex>
                <v-dialog v-model="confirmationModal" width="500">
                  <v-card>
                    <v-card-title class="headline grey lighten-2" primary-title>
                      Generar Certificado
                    </v-card-title>

                    <v-card-text>
                      Se proceso su solicitud con exito.<br />Id de Solicitud:
                      {{ id_reporte }}
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" flat @click="handleCerrar()">
                        Aceptar
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-flex>
      </div>

      <div>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex md12>
              <div id="CertificadoPDF" v-if="mostrarPDF">
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card class="rounded-card mb-3">
                        <v-container grid-list-md>
                          <v-btn
                            depressed
                            color="primary"
                            elevation="2"
                            @click="IraEmision"
                          >
                            Salir
                          </v-btn>
                          <v-form class="col-md-12">
                            <embed
                              class="mipdf"
                              :src="urlPdf"
                              type="application/pdf"
                              width="100%"
                              height="600px"
                            />
                          </v-form>
                        </v-container>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import CheckActividad from '@/pantallas/Informes/InformeActividad/CheckActividad.vue';
import CheckDetalleViaje from '@/pantallas/Informes/InformeDetalleViaje/CheckDetalleViaje.vue';
import CheckResumenTiempos from '@/pantallas/Informes/InformeResumenTiempos/CheckResumenTiempos.vue';
import CheckExcesoVelodicad from '@/pantallas/Informes/InformeExcesoVelocidad/CheckExcesoVelocidad.vue';
import CheckTemperatura from '@/pantallas/Informes/InformeTemperatura/CheckTemperatura.vue';
import ContainerPlanMantenimiento from '@/pantallas/Informes/ContainerPlanMantenimiento/ContainerPlanMantenimiento.vue';
import ContainerInformeDescargas from '@/pantallas/Informes/ContainerInformeDescargas/ContainerInformeDescargas.vue';
import CheckSitio from '@/pantallas/Informes/InformeSitio/CheckSitio.vue';
import { generarInforme } from '@/pantallas/Informes/partes/generarInforme';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';

import config from '@/config/index';

import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Snotify } from '@/snotify/Snotify';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  ColDef,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import store from '@/store';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import {
  fetchTipoCertificado,
  TipoCertificado,
} from '@/pantallas/CertificadosEmision/fetchTipoCertificadoEmision';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import { AxiosResponse } from 'axios';
import { MSResponse } from '../../../interfaces/MS';
import { CertificadosServices } from './CertificadosSucursal.service';
import moment from 'moment';
import {
  BaseTemplate,
  FlotaI,
  MSNameEmpresa,
  MSresponseDispositivos,
  MSresponseSV,
  MSSaveCertificado,
  NombreEmpresa,
  PatentesI,
  Templates,
} from './CertificadosSucursal';

@Component({
  components: {
    AsociarFlotaEtiquetaVehiculoIndividual,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperHeader,
    CabeceraModalCrear,
    ModalMantenedor,
    ContinuarButton,
    VolverButton,
    Confirmation,
    FormFieldsContainer,
    CheckActividad,
    CheckDetalleViaje,
    CheckSitio,
    CheckResumenTiempos,
    CheckExcesoVelodicad,
    CheckTemperatura,
    ContainerPlanMantenimiento,
    ContainerInformeDescargas,
    MantenedorGrid,
    BuscadorOperacionCrud,
    'app-confirmacion': Confirmation,
  },
})
export default class CertificadosSucursal extends Vue {
  // Props
  @Prop({ required: true }) show: boolean;
  @Prop({ default: false }) disabled: boolean;

  certificadosServices = new CertificadosServices();

  listatipocertificado: any = [];

  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  // Data
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  isFormValid: boolean = false;
  primeraTabla: boolean = false;
  dialogConfirmacionClose: boolean = false;
  showValidacionReporteRestricciones: boolean = false;
  showValidacionReporteTime: boolean = false;
  e1: number = 1;
  typeSelected!: string;
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';
  isDisableGenerar: boolean = true;
  showModal: boolean = false;
  confirmationModal: boolean = false;
  id_reporte: any = '';
  empresas: any = '';
  empresaSelected: string = '';
  templateDisponible: boolean = false;
  codeVehiculo: string = '';

  mensajeProgramado: string =
    'No es posible generar el Informe en base a los parámetros ingresados (Fecha/Hora, Vehículos y  Tipo de informe).';
  mensajeProgramado2: string = 'Usted puede:';
  mensajeProgramado3: string =
    'Disminuir el periodo solicitado, la cantidad de vehículos o cambiar el tipo de informe.';
  mensajeProgramado4: string = 'Utilizar la opción de Informes Programados.';
  mensajeProgrmadoFinal: string =
    this.mensajeProgramado + this.mensajeProgramado2; //+'\n'+this.mensajeProgramado3+'\n'+this.mensajeProgramado4;
  itemsMensaje: string[] = [this.mensajeProgramado3, this.mensajeProgramado4];

  headers: any = [
    {
      text: 'Id',
      value: 'id',
      align: 'right',
    },
    {
      text: 'Nombre',
      value: 'nombre',
      align: 'right',
    },
  ];
  setData: any;
  dataTable: any = [];
  selected: any = [];
  templateSelected: any = '';
  isActividad: boolean = false;
  isDetalleViaje: boolean = false;
  report_type: string = '';
  isSitio: boolean = false;
  isResumenTiempos: boolean = false;
  isContainerMantenimiento: boolean = false;
  isExcesoVelocidad: boolean = false;
  velocidadValidada: boolean = false;
  isTemperatura: boolean = false;
  isDescargas: boolean = false;
  isAlerta: boolean = false;
  radios: string = 'flotas';
  row: string = 'pdf';
  items: any = [];
  itemsOrientacion: any[] = ['Vertical', 'Horizontal'];
  pagination: any = {
    rowsPerPage: 10,
  };
  clienteId: number = config.getClienteSesion();
  usuarioId: number = store.state.userId;
  rowsPerPage: any = [5, 10, 25, { text: 'Todos', value: -1 }];
  tiposInforme: any = null;
  tipoActividad: any = null;
  dataFVE: any = null;
  gridApiVehiculo: GridApi = null;
  gridApiEtiqueta: GridApi = null;
  gridApiFlota: GridApi = null;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  vehiculosSeleccionados: any = [];
  etiquetasSeleccionados: any = [];
  flotasSeleccionados: any = [];
  actividadesSeleccionadas: any = [];
  planesMantenimientoSeleccionadas: any = [];
  vehiculosSelect: any = [];
  sitiosSelect: any = [];
  sitiosSeleccionados: any = [];
  checkResumen: boolean = null;
  checkTemperatura: any = null;
  formsFieldcheckActividad: any = null;
  formsFieldDetalleViaje: boolean = false;
  formsFieldSitio: boolean = false;
  datoConfiable: boolean = false;
  formsFieldTemperatura: any = null;
  txtLimiteVelocidad: number = 0;
  timePickerResumenTiempo: any = null;
  txtMinimoDetencion: number = null;
  dictionaryFormErrors: any = {};
  dataGeneracionInforme: any;
  radioSelect: any = '';
  sincomillas: any = '';

  template: string = '';
  folio: string = '000045';
  razonSocial: string = '';
  rut: string = '';
  gpsInstalado: string = '';
  plataforma: string = '';
  patente: string[] = [];
  faena: string = '';
  fechaSol = moment().format('l') + ' ' + moment().format('LTS');
  fechaVen = moment(moment())
    .add(1, 'year')
    .calendar();
  base64: string =
    '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';
  isDisableBtn: boolean = true;

  asociacionesVehiculos: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };
  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      lockPinned: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];

  loadData = {
    table: false,
    preview: false,
  };
  proveedorSelect: any = [];
  clientesProveedorSelect: any = [];
  alertaBaseId: number = null;
  alertaBaseCliente: number = null;

  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  flotasAsignadas: IFlota[] = [];
  etiquetasAsignadas: IEtiqueta[] = [];

  htmlTemplate: string[] = [];
  urlPdf: string = null;

  lsVehiculo: any = null;
  idTipoCertificado: number;
  mostrarPDF: boolean = false;
  mostrarHTML: boolean = true;
  mostrarModal: boolean = false;
  axiosCertificadoEmision: AxiosVue = new AxiosVue(ServicioProxy.Comercial);

  pasoActivoIndex = 1;
  pasos: PasosCrud = {
    asociarVehiculos: {
      accion: 'otro',
      visible: true,
      step: 1,
      title: 'Seleccionar Flotas Etiquetas o Vehículos',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },

    visualizacionCertificado: {
      accion: 'otro2',
      visible: true,
      step: 2,
      title: 'Vista previa',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };
  pdfTemplate: any;
  codeFlota: any;

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.asociarVehiculosPermitirContinuar;
    this.pasos.visualizacionCertificado.permitirContinuar = this.visualizacionCertificadoPermitirContinuar;
    //this.obtieneFechaCertificado();
  }

  get currentUser() {
    return this.$store;
  }

  changeStep() {
    this.e1 = 2;
    this.loadData.preview = true;
    this.getTemplate(this.templateSelected);
    if (this.radioSelect === 'Flotas') {
      this.getDataByFlota(
        this.selected[0].id,
        JSON.parse(window.localStorage.user).clienteDefecto.toString(),
        ''
      );
    } else {
      this.getDataByPatente(
        this.selected[0].id,
        JSON.parse(window.localStorage.user).clienteDefecto.toString(),
        ''
      );
      this.getDispositivoGps(
        this.selected[0].id,
        JSON.parse(window.localStorage.user).clienteDefecto.toString(),
        ''
      );
      this.patente = this.selected.map((x: any) => x.id);
    }
    this.isDisableGenerar = false;
    //this.renderTemplate();
    //this.patente = this.selected.map(y => y.id);
  }

  backStep() {
    this.e1 = 1;
    this.isDisableGenerar = !this.isDisableGenerar;
  }

  generarCert() {
    this.isDisableGenerar = true;
    //if (this.radioSelect === 'Flotas') {
    this.sincomillas = this.rut;
    //} else {
    //  this.sincomillas = this.rut.split("'");
    //  this.sincomillas = this.sincomillas[1];
    //}
    const data = {
      id_usuario: this.usuarioId,
      id_cliente: this.clienteId,
      tipo_certificado: 'CERTIFICADO',
      formato: 'zip',
      vehiculos: [''],
      fecha_inicio: '10-08-2022',
      fecha_fin: '11-08-2022',
      razonSocial: this.razonSocial,
      plataforma: this.plataforma,
      flota: this.razonSocial,
      fechaSol: this.fechaSol,
      fechaVen: this.fechaVen,
      rut: this.sincomillas,
      gpsInstalado: this.gpsInstalado,
      id_template: this.templateSelected,
    };
    if (this.radioSelect === 'Flotas') {
      data.vehiculos = this.patente;
    } else {
      data.vehiculos = this.selected.map((item: any) => item.id);
    }
    this.confirmationModal = true;
    this.postSaveCertificado(data);
  }

  visualizacionCertificadoPermitirContinuar() {
    return true;
  }

  asociarVehiculosPermitirContinuar() {
    if (
      typeof this.idTipoCertificado === 'undefined' ||
      this.asociacionesVehiculos.vehiculos.length +
        this.asociacionesVehiculos.etiquetas.length +
        this.asociacionesVehiculos.flotas.length ===
        0
    ) {
      return false;
    } else {
      this.handleCertificadoPreview();
      return true;
    }
  }

  readonly gridOptionsVehiculo: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockVisible: true,
      },
      {
        headerName: 'Tipo de Vehículo',
        field: 'tipovehiculo',
      },
      {
        headerName: 'Marca',
        field: 'marca',
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
      },
      {
        headerName: 'Tipo de Combustible',
        field: 'tipoCombustible',
      },
      {
        headerName: 'Tipo de Transmisión',
        field: 'tipoTransmision',
      },
      {
        headerName: 'Año',
        field: 'ano',
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyVehiculo,
    onSelectionChanged: this.selectionChangedVehiculos,
  };
  readonly gridOptionsFlotas: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
      // {
      //   headerName: 'Padre',
      //   field: 'padreId',
      // },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyFlota,
    onSelectionChanged: this.selectionChangedFlotas,
  };
  readonly gridOptionsEtiquetas: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyEtiqueta,
    onSelectionChanged: this.selectionChangedEtiquetas,
  };

  formFields: FormFieldDefMap = {
    tipocertificado: {
      label: 'Tipo Certificado',
      id: 'IdTipoCertificado',
      value: '',
    },

    horaInicio: {
      label: 'Hora Desde',
      id: 'horaInicio',
      value: null,
    },
    horaHasta: {
      label: 'Hora Hasta',
      id: 'horaHasta',
      value: null,
    },
    checkSatelite: {
      label: 'Satélite',
      id: 'satelite',
      value: true,
    },
    checkHDOP: {
      label: 'HDOP',
      id: 'hdop',
      value: true,
    },
    checkLongYLat: {
      label: 'Latitud y Longitud',
      id: 'longYLat',
      value: true,
    },
    checkDatoConfiable: {
      label: 'Confiable',
      id: 'datoConfiable',
      value: true,
    },
    checkSoloResumen: {
      label: 'Sólo Resumen',
      id: 'soloResumen',
      value: false,
    },
    checkAgruparPorDia: {
      label: 'Agrupar por Día',
      id: 'agruparPorDia',
      value: false,
    },
    informeSeleccionado: {
      label: 'Tipo de Informe',
      id: 'informeSeleccionado',
      value: '',
    },
    orientacionPdf: {
      label: 'Orientación de Informe',
      id: 'orientacionPdf',
      value: 'Vertical',
    },
  };

  @Watch('formFields', { deep: true })
  handleFormChangeSeleccionCertificado() {
    this.idTipoCertificado = parseInt(
      this.formFields.tipocertificado.value.toString()
    );
  }

  // Methods
  clearFilters() {
    this.$emit('clear');
  }

  handleCerrar() {
    this.confirmationModal = false;
    this.dialogConfirmacionClose = true;
    this.$emit('close', false);
    this.showModal = false;
    this.e1 = 1;
    this.templateSelected = '';
    this.selected = [];
    this.isDisableGenerar = true;
    this.radioSelect = '';
    this.codeVehiculo = '';
    this.dataTable = [];
  }

  async handleReadyVehiculo(event: GridReadyEvent) {
    this.gridApiVehiculo = event.api;
  }
  async handleReadyFlota(event: GridReadyEvent) {
    this.gridApiFlota = event.api;
  }
  async handleReadyEtiqueta(event: GridReadyEvent) {
    this.gridApiEtiqueta = event.api;
  }

  limpiaGrillaVFE() {
    this.gridApiVehiculo.setRowData([]);
    this.gridApiFlota.setRowData([]);
    this.gridApiEtiqueta.setRowData([]);
  }

  clickRadio() {
    switch (this.radios) {
      case 'flotas':
        this.gridApiFlota.setRowData(this.dataFVE.flotas);
        break;
      case 'etiquetas':
        this.gridApiEtiqueta.setRowData(this.dataFVE.etiquetas);
        break;
      case 'vehiculos':
        this.gridApiVehiculo.setRowData(this.dataFVE.vehiculos);
        break;
    }
  }
  selectionChangedVehiculos() {
    this.vehiculosSeleccionados = this.gridApiVehiculo.getSelectedRows();
  }
  selectionChangedEtiquetas() {
    this.etiquetasSeleccionados = this.gridApiEtiqueta.getSelectedRows();
  }
  selectionChangedFlotas() {
    this.flotasSeleccionados = this.gridApiVehiculo.getSelectedRows();
  }

  handleAsociacionesChange(event: any) {
    this.typeSelected = event;
    this.loadData.table = true;
    if (this.typeSelected === 'Flotas') {
      this.getFlotas(this.clienteId.toString());
      this.getTypesTemplates();
    } else {
      this.getPatentes(this.clienteId.toString());
    }
  }

  generaInforme() {
    if (this.report_type != '') {
      if (this.row != '') {
        this.loadingService.showLoading();
        return generarInforme(this.dataGeneracionInforme, this.row)
          .then(async (res: any) => {
            if (this.row == 'pdf') {
              await this.generarPDF(res);
            } else if (this.row == 'xlsx') {
              await this.generarExcel(res);
            } else {
              await this.generarCsv(res);
            }
          })
          .finally(() => {
            this.loadingService.hideLoading();
          });
      } else {
        this.$snotify.warning(
          'Debe seleccionar un tipo de archivo de descarga',
          {
            timeout: 3000,
          }
        );
      }
    } else {
      this.$snotify.warning('Debe seleccionar un tipo de informe', {
        timeout: 3000,
      });
    }
  }

  generarPDF(res: any) {
    var file = new Blob([res.data], { type: 'application/pdf' });
    var fileURL = URL.createObjectURL(file);
    var fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', 'Reporte');
    document.body.appendChild(fileLink);

    fileLink.click();
  }

  generarCsv(res: any) {
    var blob = new Blob([res.data], { type: 'text/plain' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, 'Reporte.csv');
    } else {
      var a = window.document.createElement('a');

      a.href = window.URL.createObjectURL(blob);
      a.download = 'Reporte.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
  generarExcel(res: any) {
    var file = new Blob([res.data], { type: 'application/vnd.ms-excel' });
    var fileURL = URL.createObjectURL(file);
    var fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', 'Reporte');
    document.body.appendChild(fileLink);

    fileLink.click();
  }
  exportar(blob: any, fileName: any) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement('a');
    //anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }
  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        informeRequerido: {
          required: () => config.errorMensajes.textoRequerido,
        },
        orientacion: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  async obtieneFechaCertificado() {
    this.listatipocertificado = await this.getTypesTemplates();
  }

  fetchTipoCertificado() {
    // this.loadingService.showLoading();
    return fetchTipoCertificado()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los dispositivos',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  handleGuardar() {
    const isValid = true;
    this.mensajeConfirmacion =
      '¿Está seguro que desea generar este certificado? ';
    if (isValid) {
      this.dialogConfirmacionGuardar = true;
    }
  }

  IraEmision() {
    //this.$router.push('/emitir-certificado');
    this.pasoActivoIndex = 1;
    this.mostrarPDF = false;
    this.mostrarModal = false;
  }

  obtieneListaVehiculosEtiquetaFlota() {
    this.lsVehiculo = null;

    this.loadingService.showLoading();

    this.lsVehiculo = [];
    if (this.asociacionesVehiculos.vehiculos.length) {
      this.lsVehiculo = [];
      for (let z = 0; z < this.asociacionesVehiculos.vehiculos.length; z++) {
        this.lsVehiculo.push({
          Id: this.asociacionesVehiculos.vehiculos[z].id,
          TipoID: 'V',
        });
      }
    }
    if (this.asociacionesVehiculos.flotas.length) {
      for (let z = 0; z < this.asociacionesVehiculos.flotas.length; z++) {
        this.lsVehiculo.push({
          Id: this.asociacionesVehiculos.flotas[z].id,
          TipoID: 'F',
        });
      }
    }

    if (this.asociacionesVehiculos.etiquetas.length) {
      for (let z = 0; z < this.asociacionesVehiculos.etiquetas.length; z++) {
        this.lsVehiculo.push({
          Id: this.asociacionesVehiculos.etiquetas[z].id,
          TipoID: 'E',
        });
      }
    }
  }
  async handleCertificadoPreview() {
    try {
      this.obtieneListaVehiculosEtiquetaFlota();
      const certificados = await this.axiosCertificadoEmision.http.post(
        `CertificadoEmision/PostGeneraCertificado/${this.idTipoCertificado}`,
        this.lsVehiculo
      );
      this.htmlTemplate = certificados.data;
    } catch (error) {
      this.$snotify.error(
        'Ha ocurrido un error al intentar generar vista previa de los certificados',
        {
          timeout: 2000,
        }
      );
    } finally {
      this.loadingService.hideLoading();
      this.$snotify.success('Generando vista previa de los certificados', {
        timeout: 2000,
      });
    }
  }

  PermiteContinuarAsociarEvento() {
    this.mensajeValidacion = '';

    return true;
  }

  PermiteContinuarAsociarVehiculo() {
    return true;
  }
  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  async handleConfirmacionGuardar(val: boolean) {
    if (!val) {
      this.dialogConfirmacionGuardar = false;
    } else {
      try {
        this.dialogConfirmacionGuardar = false;
        this.obtieneListaVehiculosEtiquetaFlota();
        const certificadosPDF = await this.axiosCertificadoEmision.http.post(
          `CertificadoEmision/PostGeneraCertificadoPDF/${this.idTipoCertificado}`,
          this.lsVehiculo,
          { responseType: 'arraybuffer' }
        );
        var file = new Blob([certificadosPDF.data], {
          type: 'application/pdf',
        });
        if (file.size > 0) {
          var fileURL = URL.createObjectURL(file);

          this.urlPdf = fileURL;
          //var fileURL = URL.createObjectURL(file);
          var fileLink = document.createElement('a');
          fileLink.href = fileURL;
          fileLink.setAttribute('download', 'Certificado');
          document.body.appendChild(fileLink);

          fileLink.click();
          this.mostrarPDF = false;
        }
      } catch (error) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar generar los certificados',
          {
            timeout: 2000,
          }
        );
      } finally {
        this.loadingService.hideLoading();
        this.$snotify.success('Generando certificados', {
          timeout: 2000,
        });
      }
    }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      window.location.href = window.location.origin;
    }
  }

  async getFlotas(id: string) {
    const axiosResponse: AxiosResponse<
      MSResponse<FlotaI>
    > = await this.certificadosServices.getFlotas(id);
    const msResponse: MSResponse<FlotaI> = axiosResponse.data;
    if (msResponse.MENSAJE_RESPUESTA !== 'SIN_DATA') {
      this.loadData.table = false;
      this.dataTable = msResponse.data;
    } else {
      this.loadData.table = false;
      //TODO agregar notificacion notify
      this.dataTable = [];
      console.error(msResponse.MENSAJE_RESPUESTA);
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 2000,
      });
    }
  }

  async getPatentes(id: any) {
    const axiosResponse: AxiosResponse<
      MSResponse<PatentesI>
    > = await this.certificadosServices.getPatentes(id);
    const msResponse: MSResponse<PatentesI> = axiosResponse.data;
    if (msResponse.MENSAJE_RESPUESTA !== 'SIN_DATA') {
      this.loadData.table = false;
      this.dataTable = msResponse.data.filter(
        (data: { id: any; nombre: any }, index: any, j: any[]) =>
          index ===
          j.findIndex(
            (t: { id: any; nombre: any }) =>
              t.id === data.id && t.nombre === data.nombre
          )
      );
    } else {
      //TODO agregar notificacion notify
      this.loadData.table = false;
      this.dataTable = [];
      console.error(msResponse.MENSAJE_RESPUESTA);
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 2000,
      });
    }
  }

  async getTypesTemplates() {
    const axiosResponse: AxiosResponse<
      MSresponseSV<Templates>
    > = await this.certificadosServices.getTypesTemplates();
    const msResponse: MSresponseSV<Templates> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.listatipocertificado = msResponse.templates;
    } else {
      //TODO agregar notificacion notify
      console.error(msResponse.MENSAJE_RESPUESTA);
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 2000,
      });
    }
  }

  async getTemplate(id_template: string) {
    const axiosResponse: AxiosResponse<
      MSresponseSV<BaseTemplate>
    > = await this.certificadosServices.getTemplate(id_template);
    const msResponse: MSresponseSV<BaseTemplate> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.templateDisponible = true;
      this.template = decodeURIComponent(
        escape(atob(msResponse.templates[0].template))
      );
    } else {
      this.templateDisponible = false;
      //TODO agregar notificacion notify
      console.error(msResponse.MENSAJE_RESPUESTA);
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 2000,
      });
    }
  }

  async getDataByPatente(
    patente: string,
    id_cliente: string,
    rut_cliente: string
  ) {
    const axiosResponse: AxiosResponse<
      any
    > = await this.certificadosServices.getDataByPatente(
      patente,
      id_cliente,
      rut_cliente
    );
    const msResponse: any = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA == '1') {
      this.razonSocial = msResponse.data.razon_social;
      this.rut = msResponse.data.rut;
      this.plataforma = msResponse.data.plataforma;
      this.patente.push(msResponse.data.patente);
      this.faena = msResponse.data.flota;
    } else {
      this.e1 = 1;
      //TODO agregar notificacion notify
      this.$snotify.error('Error: ' + msResponse.MENSAJE_RESPUESTA, {
        timeout: 2000,
      });
      console.error(msResponse.MENSAJE_RESPUESTA);
    }
  }

  async getDataByFlota(flota: string, id_cliente: string, rut_cliente: string) {
    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.certificadosServices.getDataByFlota(
      flota,
      id_cliente,
      rut_cliente
    );
    const msResponse: any = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA == '1') {
      //this.razonSocial = '';
      this.razonSocial = msResponse.data[0].razon_social;
      this.rut = msResponse.data[0].rut;
      this.plataforma = msResponse.data[0].plataforma;
      this.patente = msResponse.data.map((x: any) => x.patente);
      this.faena = msResponse.data[0].flota;
      this.getDispositivoGps(this.patente[0], id_cliente, rut_cliente);
    } else {
      //TODO agregar notificacion notify
      this.$snotify.error('La flota seleccionada no posee datos asociados', {
        timeout: 5000,
      });
      console.error(msResponse.MENSAJE_RESPUESTA);
      this.handleCerrar();
    }
  }

  async postSaveCertificado(data: any) {
    const axiosResponse: AxiosResponse<
      MSSaveCertificado
    > = await this.certificadosServices.postSaveCertificado(data);
    const msResponse: MSSaveCertificado = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      //TODO agregar notificacion notifys
      console.error(msResponse.MENSAJE_RESPUESTA);
      this.id_reporte = msResponse.id_reporte;
      this.isDisableGenerar = true;
    } else {
      this.handleCerrar();
      //this.show = false
      //TODO agregar notificacion notify
      this.$snotify.error('Error al generar certificados', {
        timeout: 2000,
      });
      console.error(msResponse.MENSAJE_RESPUESTA);
    }
  }

  async getDispositivoGps(data: any, id_cliente: string, rut_cliente: string) {
    const axiosResponse: AxiosResponse<
      MSresponseDispositivos
    > = await this.certificadosServices.getDispositivoGps(
      data,
      id_cliente,
      rut_cliente
    );
    const msResponse: MSresponseDispositivos = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      //TODO agregar notificacion notifys
      if (msResponse.dispositivo) {
        this.gpsInstalado = msResponse.dispositivo;
      } else {
        this.gpsInstalado = 'No identificado';
        this.$snotify.error('Gps instalado no está identificado', {
          timeout: 2000,
        });
      }
      //console.error(msResponse.MENSAJE_RESPUESTA);
    } else {
      this.handleCerrar();
      //this.show = false
      //TODO agregar notificacion notify
      this.$snotify.error('Error al generar certificados', {
        timeout: 2000,
      });
    }
  }

  async getEmpresas(data: any) {
    const axiosResponse: AxiosResponse<
      MSNameEmpresa<NombreEmpresa>
    > = await this.certificadosServices.getEmpresas(data);
    const msResponse: MSNameEmpresa<NombreEmpresa> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      //TODO agregar notificacion notifys
      this.razonSocial = msResponse.data.nombre;
      console.error(msResponse.MENSAJE_RESPUESTA);
    } else {
      this.handleCerrar();
      //this.show = false
      //TODO agregar notificacion notify
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 2000,
      });
      console.error(msResponse.MENSAJE_RESPUESTA);
    }
  }

  renderTemplate() {
    if (this.template) {
      var aux = this.template.split('${var}');
      var templateAux =
        `${aux[0]}` +
        `${this.base64}` +
        `${aux[1]}` +
        `${this.folio}` +
        `${aux[2]}` +
        `${this.razonSocial}` +
        `${aux[3]}` +
        `${this.rut}` +
        `${aux[4]}` +
        `${this.gpsInstalado}` +
        `${aux[5]}` +
        `${this.plataforma}` +
        `${aux[6]}` +
        `${this.patente[0]}` +
        `${aux[7]}` +
        `${this.faena}` +
        `${aux[8]}` +
        `${this.fechaSol}` +
        `${aux[9]}` +
        `${this.razonSocial}` +
        `${aux[10]}` +
        `${this.razonSocial}` +
        `${aux[11]}` +
        `${this.razonSocial}` +
        `${aux[12]}` +
        `${this.fechaVen}` +
        `${aux[13]}`;
      return templateAux;
    }
    this.loadData.preview = false;
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    await this.getTypesTemplates();
    //await this.getEmpresas(this.usuarioId);
    this.showModal = value;
  }
  @Watch('showModal')
  async onPropertyChangedshowModal(value: boolean, oldValue: boolean) {
    this.$emit('show', value);
  }

  toggleAll() {
    if (this.selected.length) this.selected = [];
    else this.selected = this.dataTable.slice();
  }

  validation() {
    this.isDisableBtn = false;
  }

  getDate() {
    var todayDate = new Date();
    var anio = todayDate.getFullYear();
    var mes = todayDate.getMonth();
    var dia = todayDate.getDate();
    return anio + '/' + mes + '/' + dia;
  }

  searchFlota($event: any) {
    this.dataTable = this.dataTable.filter((x: any) => x.id === $event);
  }

  searchVehiculo($event: any) {
    this.dataTable = this.dataTable.filter((x: any) => x.id === $event);
  }

  getClienteFromUser() {
    this.axios.http.get(`usuario/${this.clienteId}/cliente`).then(res => {
      console.log(res);
    });
  }
}
</script>
<style scoped>
.button {
  background-color: #ffe800 !important;
  color: black !important;
  max-height: 75% !important;
}

.center {
  justify-content: center;
  align-items: center;
  text-align: center;
}

.table {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>

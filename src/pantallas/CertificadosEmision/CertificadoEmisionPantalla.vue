<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Emitir Certificado'" @cerrar="handleCerrar()">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>

    <div class="modal cardnew">
      <div align="center">
        <v-flex md10>
          <v-stepper v-model="pasoActivoIndex" v-if="!mostrarPDF">
            <CrudStepperHeader
              :pasos="pasos"
              :paso-activo-index="pasoActivoIndex"
            />

            <CrudStepperContent :paso="pasos.asociarVehiculos">
              <v-card class="rounded-card">
                <v-container grid-list-md>
                  <v-flex xs10 md10 lg10>
                    <v-select
                      v-model="formFields.tipocertificado.value"
                      :label="formFields.tipocertificado.label"
                      :items="listatipocertificado"
                      item-text="nombre"
                      item-value="id"
                      prepend-icon="find_in_page"
                      @seleccionarCertificado="
                        handleFormChangeSeleccionCertificado
                      "
                    />
                  </v-flex>
                </v-container>
              </v-card>

              <br />
              <br />
              <v-card class="rounded-card mt-20">
                <v-flex>
                  <AsociarFlotaEtiquetaVehiculoIndividual
                    :col-def-vehiculo="vehiculoColDefs"
                    @change="handleAsociacionesChange"
                  />
                </v-flex>
              </v-card>
            </CrudStepperContent>

            <CrudStepperContent :paso="pasos.visualizacionCertificado">
              <div>
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card
                        class="rounded-card mb-3"
                        v-for="(item, index) in htmlTemplate"
                        :key="index"
                      >
                        <v-container grid-list-md>
                          <v-form class="col-md-12">
                            <div v-html="item.template"></div>
                          </v-form>
                        </v-container>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </div>
            </CrudStepperContent>
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

    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Certificado' })"
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>

    <!-- <app-confirmacion
        :show="dialogConfirmacionClose"
        :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
        :mensaje="$t('mensajes.mensajesInformes.mensaje')"
        v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
        :textoBtnSi="$t('mensajes.mensajesInformes.btnAceptar')"
        :textoBtnNo="$t('mensajes.mensajesInformes.btnCancelar')"
      ></app-confirmacion> -->
  </ModalMantenedor>
</template>

<script lang="ts">
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Descargar from '@/pantallas/Informes/partes/Descargar.vue';
import CheckActividad from '@/pantallas/Informes/InformeActividad/CheckActividad.vue';
import CheckDetalleViaje from '@/pantallas/Informes/InformeDetalleViaje/CheckDetalleViaje.vue';
import CheckResumenTiempos from '@/pantallas/Informes/InformeResumenTiempos/CheckResumenTiempos.vue';
import CheckExcesoVelodicad from '@/pantallas/Informes/InformeExcesoVelocidad/CheckExcesoVelocidad.vue';
import CheckTemperatura from '@/pantallas/Informes/InformeTemperatura/CheckTemperatura.vue';
import ContainerPlanMantenimiento from '@/pantallas/Informes/ContainerPlanMantenimiento/ContainerPlanMantenimiento.vue';
import ContainerInformeDescargas from '@/pantallas/Informes/ContainerInformeDescargas/ContainerInformeDescargas.vue';
import CheckSitio from '@/pantallas/Informes/InformeSitio/CheckSitio.vue';
import { fetchTipoInforme } from '@/pantallas/Informes/partes/fetchTipoInforme';
import { generarInforme } from '@/pantallas/Informes/partes/generarInforme';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';

import config from '@/config/index';

import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Snotify } from '@/snotify/Snotify';
import moment from 'moment';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  ColDef,
} from 'ag-grid-community';
import { checkboxColumnDef } from '../../reusable/Grid/aggridColumnDefUtils';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoV2/AsociarFlotaEtiquetaVehiculo.vue';
import store from '../../store';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { Vehiculo } from '@/reusable/AsociarFlotaEtiquetaVehiculoV2/fetchFlotasEtiquetasVehiculos';
import { verify } from 'crypto';
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
export default class InformesMenu extends Vue {
  // Props
  @Prop({ required: true }) show: boolean;
  @Prop({ default: false }) disabled: boolean;

  listatipocertificado: TipoCertificado[] = [];

  // Data
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  isFormValid: boolean = false;
  primeraTabla: boolean = false;
  dialogConfirmacionClose: boolean = false;
  showValidacionReporteRestricciones: boolean = false;
  showValidacionReporteTime: boolean = false;

  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

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
    { text: 'Nombre', value: 'nombre', width: '500' },
    { text: 'Padre', value: 'padre' },
  ];
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
    rowsPerPage: -1,
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
  readonly pasos: PasosCrud = {
    asociarVehiculos: {
      accion: 'otro',
      visible: true,
      step: 1,
      title: 'Asociar Flotas Etiquetas o Vehículos',
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

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.asociarVehiculosPermitirContinuar;
    this.pasos.visualizacionCertificado.permitirContinuar = this.visualizacionCertificadoPermitirContinuar;
    this.obtieneFechaCertificado();
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
    this.dialogConfirmacionClose = true;

    window.location.href = window.location.origin;
  }

  // async mounted() {
  //   this.pasos.asociarVehiculos.permitirContinuar = this.asociarVehiculosPermitirContinuar;
  //   this.pasos.visualizacionCertificado.permitirContinuar = this.visualizacionCertificadoPermitirContinuar;
  //   this.obtieneFechaCertificado();
  // }

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

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
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
    console.log(res);
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
    this.listatipocertificado = (await this.fetchTipoCertificado()) || [];
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
    console.log('click');
    console.log(this.dialogConfirmacionGuardar);
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
      console.log('--------->previsualizar'); // borrar despues de las prubas
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
    console.log(val);
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
}
</script>
<style scoped>
.v-btn {
  margin-left: 40px !important;
  background-color: #ffe800 !important;
}
</style>

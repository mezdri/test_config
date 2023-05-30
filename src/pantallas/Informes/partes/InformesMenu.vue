<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="'Generar Informe'"
      @cerrar="handleCerrar()"
    ></CabeceraModal>
    <div class="modal cardnew">
      <div align="center">
        <v-flex md10>
          <v-form
            ref="form"
            v-model="isFormValid"
            lazy-validation
            class="col-md-12"
          >
            <br />

            <v-card class="rounded-card">
              <v-container grid-list-md>
                <FormFieldsContainer titulo="Información General">
                  <v-flex xs3 md3 lg3>
                    <v-autocomplete
                      v-model="formFields.informeSeleccionado.value"
                      :items="tiposInforme"
                      label="Tipo de Informe"
                      icon="fas fa-angle-down"
                      item-text="descripcion"
                      item-value="id"
                      @change="setTipoInforme()"
                      :error-messages="errors.collect('informeRequerido')"
                      v-validate="!disabled && 'required'"
                      data-vv-name="informeRequerido"
                      required
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs3 md3 lg3 v-if="isEstadoTransmision">
                    <v-switch
                      v-model="program"
                      :label="formFields.program.label"
                      :id="formFields.program.id"
                      color="green"
                      @change="switchProgram"
                      :hint="hint"
                      :persistent-hint="true"
                    ></v-switch>
                  </v-flex>
                  <v-flex xs3 md3 lg3 v-if="isEstadoTransmision && program">
                    <v-text-field
                      :hint="
                        'Puede ingresar varios correos separados por punto y coma (;)'
                      "
                      :label="formFields.emails.label"
                      v-model="formFields.emails.value"
                      v-validate="`required|emailValidate`"
                      :data-vv-name="'emailValidate'"
                      :id="formFields.emails.id"
                      :error-messages="errors.collect('emailValidate')"
                    />
                  </v-flex>
                  <v-flex
                    md2
                    v-if="
                      !isUltimaActividad &&
                        !mostrarAcumulado &&
                        !isEstadoTransmision
                    "
                  >
                    <DatePicker
                      label="Desde"
                      :error-messages="errors.collect(formFields.fechaDesde.id)"
                      :id="formFields.fechaDesde.id"
                      v-model="formFields.fechaDesde.value"
                      :min="fechaMinima"
                      :max="fechaMaxima"
                      v-validate="
                        !isUltimaActividad && !mostrarAcumulado
                          ? 'required'
                          : ''
                      "
                    />
                  </v-flex>

                  <v-flex
                    md2
                    v-show="
                      !isUltimaActividad &&
                        !mostrarAcumulado &&
                        !isEstadoTransmision
                    "
                  >
                    <TimePicker
                      v-model="formFields.horaInicio.value"
                      v-validate="
                        !isUltimaActividad && !mostrarAcumulado
                          ? 'required'
                          : ''
                      "
                      :label="formFields.horaInicio.label"
                      :error-messages="errors.collect(formFields.horaInicio.id)"
                      :id="formFields.horaInicio.id"
                      :disabled="disabled"
                    />
                  </v-flex>

                  <v-flex
                    md2
                    v-show="
                      !isUltimaActividad &&
                        !mostrarAcumulado &&
                        !isEstadoTransmision
                    "
                  >
                    <DatePicker
                      label="Hasta"
                      :error-messages="errors.collect(formFields.fechaHasta.id)"
                      :id="formFields.fechaHasta.id"
                      v-model="formFields.fechaHasta.value"
                      :min="fechaMinima"
                      :max="fechaMaxima"
                      v-validate="
                        !isUltimaActividad && !mostrarAcumulado
                          ? 'required'
                          : ''
                      "
                    />
                  </v-flex>

                  <v-flex
                    md2
                    v-show="
                      !isUltimaActividad &&
                        !mostrarAcumulado &&
                        !isEstadoTransmision
                    "
                  >
                    <TimePicker
                      v-model="formFields.horaHasta.value"
                      v-validate="
                        !isUltimaActividad && !mostrarAcumulado
                          ? 'required'
                          : ''
                      "
                      :label="formFields.horaHasta.label"
                      :error-messages="errors.collect(formFields.horaHasta.id)"
                      :id="formFields.horaHasta.id"
                      :disabled="disabled"
                    />
                  </v-flex>

                  <v-flex v-show="isVelocidadSitios" elevation="0">
                    <v-checkbox
                      label="Mostrar Etiqueta"
                      v-model="mostrarEtiqueta"
                    ></v-checkbox>
                    <v-checkbox
                      label="Modificar Semáforo"
                      v-model="semaforo"
                    ></v-checkbox>
                    <v-card elevation="0" v-show="semaforo">
                      <div style="display: flex">
                        <div class="divClassLabel">Verde &lt;=</div>
                        <v-text-field
                          type="number"
                          min="0"
                          label="Verde"
                          v-model.number="verde"
                          class="shrink"
                        >
                        </v-text-field>
                        <div class="divClassLabel">> Amarillo &lt;=</div>
                        <v-text-field
                          type="number"
                          min="0"
                          label="Amarillo"
                          class="shrink"
                          v-model.number="amarillo"
                        >
                        </v-text-field>
                        <div class="divClassLabel">> Rojo &lt;=</div>
                        <v-text-field
                          type="number"
                          min="0"
                          label="Rojo"
                          class="shrink"
                          v-model.number="rojo"
                        >
                        </v-text-field>
                        <div class="divClassLabel">> Rojo Oscuro</div>
                      </div>
                    </v-card>
                  </v-flex>

                  <v-card v-show="isDetencion" elevation="0">
                    <div style="display: flex; padding-left: 5px;">
                      Tiempo de detención mínimo
                    </div>
                    <div style="display: flex">
                      <v-text-field
                        label="Días"
                        class="text-detencion"
                        v-model="detentionDays"
                      >
                      </v-text-field>
                      <v-text-field
                        label="Horas"
                        class="text-detencion"
                        v-model="detentionHours"
                      >
                      </v-text-field>
                      <v-text-field
                        label="Minutos"
                        class="text-detencion"
                        v-model="detentionMinutes"
                      >
                      </v-text-field>
                      <v-checkbox
                        label="Mostrar Sitio"
                        v-model="mostrarSitio"
                      ></v-checkbox>
                    </div>
                  </v-card>
                </FormFieldsContainer>

                <CheckConsolidadoProveedor
                  v-show="isConsolidadoProveedor"
                ></CheckConsolidadoProveedor>

                <v-flex v-show="isHorometro" elevation="0">
                  <v-checkbox
                    label="Mostrar Solo Actual"
                    v-model="mostrarAcumulado"
                  ></v-checkbox>
                </v-flex>

                <CheckActividad v-show="isActividad"></CheckActividad>
                <v-flex v-show="isDetalleViaje" elevation="0">
                  <v-checkbox
                    label="Mostrar Etiqueta"
                    v-model="mostrarEtiqueta"
                  ></v-checkbox>
                </v-flex>
                <CheckDetalleViaje v-show="isDetalleViaje"></CheckDetalleViaje>

                <CheckSitio v-show="isSitio"></CheckSitio>

                <CheckResumenTiempos
                  v-show="isResumenTiempos"
                ></CheckResumenTiempos>

                <CheckExcesoVelodicad
                  v-show="isExcesoVelocidad"
                ></CheckExcesoVelodicad>

                <CheckTemperatura v-show="isTemperatura"></CheckTemperatura>

                <PantallaAlertas v-show="isAlerta"></PantallaAlertas>

                <FormFieldsContainer column v-show="primeraTabla">
                  <v-divider></v-divider>
                </FormFieldsContainer>
              </v-container>
            </v-card>
            <br />
            <containerPlanMantenimiento
              v-show="isContainerMantenimiento"
            ></containerPlanMantenimiento>
            <br v-show="isContainerMantenimiento" />

            <containerInformeDescargas
              v-show="isDescargas"
            ></containerInformeDescargas>

            <v-card class="rounded-card mt-20" v-show="report_type">
              <v-flex>
                <AsociarFlotaEtiquetaVehiculo
                  v-show="
                    !isContainerMantenimiento && !isDescargas && !isGeotec
                  "
                  @change="handleVehiculosChange"
                  :colDefVehiculo="colDefVehiculo"
                  :esInforme="true"
                  :reportType="report_type"
                />
              </v-flex>
            </v-card>

            <v-card class="rounded-card mt-20">
              <v-flex v-show="isContainerMantenimiento">
                <AsociarFlotaEtiquetaVehiculoXMantenimiento
                  @change="handleAsociacionesChange"
                ></AsociarFlotaEtiquetaVehiculoXMantenimiento>
              </v-flex>
            </v-card>

            <br />
            <v-card class="rounded-card mt-20">
              <v-container grid-list-md>
                <FormFieldsContainer titulo="Descargar Informe">
                  <v-radio-group v-model="row" row>
                    <v-radio
                      v-show="!isGeotec"
                      label="PDF"
                      value="pdf"
                    ></v-radio>
                    <v-radio
                      v-show="!isGeotec"
                      label="EXCEL"
                      value="xlsx"
                    ></v-radio>
                    <v-radio
                      v-show="!isGeotec"
                      label="CSV"
                      value="csv"
                    ></v-radio>
                    <v-btn @click="handleClick()">
                      <span>Generar Informe</span>
                    </v-btn>
                  </v-radio-group>
                </FormFieldsContainer>
                <div align="left" v-show="row == 'pdf'">
                  <v-flex md2>
                    <v-select
                      v-model="formFields.orientacionPdf.value"
                      :items="itemsOrientacion"
                      label="Orientación"
                      icon="fas fa-angle-down"
                      item-text="descripcion"
                      item-value="id"
                      :error-messages="errors.collect('orientacion')"
                      v-validate="this.row == 'pdf' ? 'required' : ''"
                      data-vv-name="orientacion"
                    />
                  </v-flex>
                </div>
              </v-container>
            </v-card>
          </v-form>
        </v-flex>
      </div>
      <app-confirmacion
        :show="dialogConfirmacionClose"
        :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
        :mensaje="$t('mensajes.mensajesInformes.mensaje')"
        v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
        :textoBtnSi="$t('mensajes.mensajesInformes.btnAceptar')"
        :textoBtnNo="$t('mensajes.mensajesInformes.btnCancelar')"
      ></app-confirmacion>
      <!-- <MensajeValidacion
        :showDialog="showValidacion"
        :titulo="$t(tituloValidacion)"
        :mensaje="$t(mensajeValidacion)"
        
        :href="$t(mensajeHRef)" 
        v-on:modalConfirmationEmit="showValidacion = false"
      ></MensajeValidacion> -->
      <MensajeValidacion
        :showDialog="showValidacionReporteRestricciones"
        :titulo="$t(tituloValidacion)"
        :mensaje="$t(mensajeValidacion)"
        :href="$t(mensajeHRef)"
        :mensajeBot="$t(mensajeValidacionBot)"
        @modalConfirmationEmit="confirmReporteTime($event)"
      ></MensajeValidacion>
      <app-confirmacion
        :show="showValidacionReporteTime"
        :titulo="$t(tituloValidacion)"
        :mensaje="$t(mensajeValidacion)"
        :textoBtnSi="$t('mensajes.mensajesInformes.btnAceptar')"
        :textoBtnNo="$t('mensajes.mensajesInformes.btnCancelarGeneracion')"
        @modalConfirmationEmit="confirmReporteTime($event)"
      ></app-confirmacion>
    </div>
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
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Descargar from '@/pantallas/Informes/partes/Descargar.vue';
import CheckActividad from '@/pantallas/Informes/InformeActividad/CheckActividad.vue';
import CheckConsolidadoProveedor from '@/pantallas/Informes/InformeConsolidadoProveedor/CheckConsolidadoProveedor.vue';
import CheckDetalleViaje from '@/pantallas/Informes/InformeDetalleViaje/CheckDetalleViaje.vue';
import CheckResumenTiempos from '@/pantallas/Informes/InformeResumenTiempos/CheckResumenTiempos.vue';
import CheckExcesoVelodicad from '@/pantallas/Informes/InformeExcesoVelocidad/CheckExcesoVelocidad.vue';
import CheckTemperatura from '@/pantallas/Informes/InformeTemperatura/CheckTemperatura.vue';
import ContainerPlanMantenimiento from '@/pantallas/Informes/ContainerPlanMantenimiento/ContainerPlanMantenimiento.vue';
import ContainerInformeDescargas from '@/pantallas/Informes/ContainerInformeDescargas/ContainerInformeDescargas.vue';
import CheckSitio from '@/pantallas/Informes/InformeSitio/CheckSitio.vue';
import { fetchTipoInforme } from '@/pantallas/Informes/partes/fetchTipoInforme';
import { generarInforme } from '@/pantallas/Informes/partes/generarInforme';
import { save_report } from '@/pantallas/Informes/partes/fetchSaveReport';
import { postReporteTime } from '@/pantallas/Informes/partes/postReporteTime';
import AsociarFlotaEtiquetaVehiculoXMantenimiento from '@/pantallas/Informes/partes/AsociarFlotaEtiquetaVehiculoXMantenimiento.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import PantallaAlertas from '@/pantallas/Informes/InformeAlertas/PantallaAlertas.vue';

import config from '@/config/index';

import { Vue, Component, Prop } from 'vue-property-decorator';
import { Snotify } from '@/snotify/Snotify';
import moment from 'moment';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  ColDef,
} from 'ag-grid-community';
import { checkboxColumnDef } from '../../../reusable/Grid/aggridColumnDefUtils';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoV2/AsociarFlotaEtiquetaVehiculo.vue';
import store from '../../../store';
import MensajeValidacionHRef from '@/pantallas/Informes/partes/MensajeValidacionHRef.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import {
  Etiqueta,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoV2/fetchFlotasEtiquetasVehiculos';

import { generarInformeHistorico } from '@/pantallas/Informes/partes/generarInformeHistorico';
import MensajeValidacion from '../../../reusable/Mantenedor/MensajeValidacion.vue';
import { Validator } from 'vee-validate';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    ContinuarButton,
    VolverButton,
    Confirmation,
    FormFieldsContainer,
    Descargar,
    DatePicker,
    TimePicker,
    CheckConsolidadoProveedor,
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
    AsociarFlotaEtiquetaVehiculo,
    MensajeValidacion: MensajeValidacionHRef,
    AsociarFlotaEtiquetaVehiculoXMantenimiento,
    PantallaAlertas,
  },
})
export default class InformesMenu extends Vue {
  // Props
  @Prop({ required: true }) show: boolean;
  @Prop({ default: false }) disabled: boolean;

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
  mensajeValidacionBot: string = '';
  mensajeHRef: any = null;
  mensajeProgramacion: string =
    'El informe es demasiado grande para el formato PDF, por favor seleccione otro formato. ';

  headers: any = [
    { text: 'Nombre', value: 'nombre', width: '500' },
    { text: 'Padre', value: 'padre' },
  ];
  isActividad: boolean = false;
  isConsolidadoProveedor: boolean = false;
  isDetalleViaje: boolean = false;
  report_type: string = '';
  isSitio: boolean = false;
  isConsolidado: boolean = false;
  isDetencion: boolean = false;
  isVelocidadSitios: boolean = false;
  zone_type: string = '';
  isResumenTiempos: boolean = false;
  isContainerMantenimiento: boolean = false;
  isExcesoVelocidad: boolean = false;
  velocidadValidada: boolean = false;
  hdopValidado: boolean = true;
  sateliteValidado: boolean = true;
  isTemperatura: boolean = false;
  isDescargas: boolean = false;
  isAlerta: boolean = false;
  isUltimaActividad: boolean = false;
  isGeotec: boolean = false;
  isHorometro: boolean = false;
  isEstadoTransmision: boolean = false;
  isEsmax: boolean = false;
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
  pautasActividadesSeleccionadas: any = [];
  vehiculosSelect: any = [];
  sitiosSelect: any = [];
  sitiosSeleccionados: any = [];
  checkResumen: boolean = null;
  checkTemperatura: any = null;
  formsFieldcheckActividad: any = null;
  formsFieldcheckAlerta: any = null;
  formsFieldDetalleViaje: boolean = false;
  formsFieldSitio: boolean = false;
  datoConfiable: boolean = false;
  formsFieldTemperatura: any = null;
  txtLimiteVelocidad: number = 0;
  timePickerResumenTiempo: any = null;
  txtMinimoDetencion: number = null;
  dictionaryFormErrors: any = {};
  nombreReporte: string = '';
  dataGeneracionInforme: any;
  vehiculos: AsociarFlotaEtiquetaVehiculoChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
    vehiculosDejadosDeRecibir: [],
  };
  proveedorSelect: any = [];
  clientesProveedorSelect: any = [];
  alertaBaseId: number = null;
  alertaBaseCliente: number = null;
  typeZone: string = 'Sitio';
  detentionDays: any = 0;
  detentionHours: any = 0;
  detentionMinutes: any = 0;
  precisionGps: boolean = false;
  precisionHdop: string = '0';
  precisionSatelites: string = '0';
  mostrarSitio: boolean = false;
  mostrarEtiqueta: boolean = false;
  mostrarAcumulado: boolean = false;

  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axContextoPostgres: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
  flotasAsignadas: IFlota[] = [];
  etiquetasAsignadas: IEtiqueta[] = [];
  vehiculosInforme: Vehiculo[] = [];
  servicioRespuesta: number = -1;
  showBtnCancelar: boolean = false;
  enviaInforme: boolean = false;
  selectionProveedor: any = '';
  tipoVehiculoSeleccionado: string = '';
  semaforo: boolean = false;
  rojo: number = 15;
  amarillo: number = 10;
  verde: number = 5;
  program: boolean = false;
  hint: string =
    'Al activar se enviará un email con el informe generado diariamente.';
  emailsError: string = '';

  readonly colDefVehiculo: Array<ColDef> = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      suppressMovable: true,
    },
    {
      headerName: 'Tipo de Vehículo',
      field: 'tipoVehiculo',
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
  ];

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
    fechaDesde: {
      label: 'Desde',
      id: 'fechaDesde',
      value: moment(this.fechaDesde),
    },
    fechaHasta: {
      label: 'Hasta',
      id: 'fechaHasta',
      value: moment(this.fechaMaxima),
    },
    horaInicio: {
      label: 'Hora Desde',
      id: 'horaInicio',
      value: moment('00:00', 'HHmm'),
    },
    horaHasta: {
      label: 'Hora Hasta',
      id: 'horaHasta',
      value: moment('23:59', 'HHmm'),
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
    program: {
      label: 'Programar emisión diaria',
      id: 'program',
      value: false,
    },
    emails: {
      label: 'Correo electrónico',
      id: 'emails',
      value: '',
    },
  };

  axiosPostgres = new AxiosVue(ServicioProxy.Metabase);

  // Computed
  get fechaMaxima() {
    const fechaMax = moment().format('YYYY-MM-DD h:mm:ss a');
    return fechaMax;
  }

  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }
  get fechaDesde() {
    let fechaDesde = moment(new Date())
      .add(-1, 'days')
      .toISOString()
      .substr(0, 10);
    return fechaDesde;
  }

  // Methods
  clearFilters() {
    this.$emit('clear');
  }

  handleCerrar() {
    this.dialogConfirmacionClose = true;
  }
  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      if (this.$route.path != '/Torre-Control/generar_informe')
        window.location.href = window.location.origin;
      else this.$router.push(`/Torre-Control/informes_generados`);
    }
  }

  confirmReporteTime(val: boolean) {
    this.generarInformeHistorico();
  }
  async mounted() {
    let self = this;
    if (this.$route.path == '/Torre-Control/generar_informe')
      await this.axiosPostgres.http
        .post(`Metabase/PostgenericA/torre_control/getReportType`, {})
        .then((response: any) => {
          if (response.data.CODIGO_RESPUESTA == '1') {
            this.tiposInforme = [];
            response.data.data.forEach((item: any) => {
              let new_item = { id: item.id, descripcion: item.nombre };
              self.tiposInforme.push(new_item);
            });
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
            this.tiposInforme = [];
          }
        })
        .catch((error: any) => {
          console.log(error);
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener la lista de tipos de informe'
          );
          this.tiposInforme = [];
        })
        .finally(() => this.loadingService.hideLoading());
    else this.tiposInforme = await fetchTipoInforme();
    console.log(await fetchTipoInforme());
  }

  created() {
    let self = this;
    InformeEventBus.$on(
      'ActividadesSeleccionChanged',
      (actividadesSeleccionadas: any[]) => {
        this.actividadesSeleccionadas = [];
        actividadesSeleccionadas.forEach(x => {
          this.actividadesSeleccionadas.push(x.tipoEvento);
        });
      }
    );
    InformeEventBus.$on('checkSoloResumen', (checkResumen: boolean) => {
      this.formsFieldDetalleViaje = checkResumen;
    });
    InformeEventBus.$on(
      'selectionPlanesMantenimiento',
      async (planesMantenimientoSeleccionadas: any[]) => {
        this.planesMantenimientoSeleccionadas = [];
        planesMantenimientoSeleccionadas.forEach(x => {
          this.planesMantenimientoSeleccionadas.push(x.id);
        });
      }
    );
    InformeEventBus.$on(
      'selectionPutasActividades',
      async (planesMantenimientoSeleccionadas: any[]) => {
        this.pautasActividadesSeleccionadas = [];
        planesMantenimientoSeleccionadas.forEach(x => {
          this.pautasActividadesSeleccionadas.push(x.id);
        });
      }
    );
    InformeEventBus.$on('txtLimiteVelocidad', (txtLimiteVelocidad: string) => {
      this.txtLimiteVelocidad = parseInt(txtLimiteVelocidad);
    });
    InformeEventBus.$on(
      'timePickerResumenTiempo',
      (timePickerResumenTiempo: any) => {
        if (timePickerResumenTiempo == null) {
          this.timePickerResumenTiempo = null;
          return;
        }
        var d = moment(new Date(timePickerResumenTiempo));
        this.timePickerResumenTiempo = d.hour() * 60 + d.minute();
      }
    );
    InformeEventBus.$on('txtMinimoDetencion', (txtMinimoDetencion: string) => {
      if (txtMinimoDetencion == null) {
        this.txtMinimoDetencion = null;
        return;
      }
      this.txtMinimoDetencion = parseInt(txtMinimoDetencion) * 60;
    });
    InformeEventBus.$on('selectionSitio', (selectionSitio: string) => {
      this.sitiosSeleccionados = selectionSitio;
    });
    InformeEventBus.$on('selectionProveedor', (selectionProveedor: string) => {
      this.selectionProveedor = selectionProveedor;
    });
    InformeEventBus.$on('checkSoloResumen', (selectionSitio: boolean) => {
      this.formsFieldSitio = selectionSitio;
    });
    InformeEventBus.$on('checkTemperatura', (checkTemperatura: string) => {
      this.formsFieldTemperatura = checkTemperatura;
    });
    InformeEventBus.$on('checkActividad', (checkActividad: any) => {
      this.formsFieldcheckActividad = checkActividad;
    });
    InformeEventBus.$on('checkAlerta', (checkAlerta: any) => {
      this.formsFieldcheckAlerta = checkAlerta;
    });
    InformeEventBus.$on('confiable', (confiable: boolean) => {
      this.datoConfiable = confiable;
    });
    InformeEventBus.$on('velocidadValidada', (validador: any) => {
      this.velocidadValidada = validador;
    });
    InformeEventBus.$on('typeZone', (info: string) => {
      this.typeZone = info;
    });
    InformeEventBus.$on('seleccionDataInformeDescargas', (info: any) => {
      this.proveedorSelect = info.infoProvedor;
      this.clientesProveedorSelect = info.infoClienteProveedor;
    });
    InformeEventBus.$on('tipoAlertaCliente', (info: number) => {
      this.alertaBaseCliente = info;
    });
    InformeEventBus.$on('tipoAlerta', (info: number) => {
      this.alertaBaseId = info;
    });
    InformeEventBus.$on('precisionGps', (info: boolean) => {
      this.precisionGps = info;
    });
    InformeEventBus.$on('precisionHdop', (info: string) => {
      this.precisionHdop = info;
    });
    InformeEventBus.$on('precisionSatelites', (info: string) => {
      this.precisionSatelites = info;
    });
    InformeEventBus.$on('validatePrecisionHdop', (info: boolean) => {
      this.hdopValidado = info;
    });
    InformeEventBus.$on('validatePrecisionSatelite', (info: boolean) => {
      this.sateliteValidado = info;
    });
    //id base y cliente alerta

    Validator.extend('emailValidate', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || `* ${self.emailsError}`;
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: self.validateEmail(value),
            data: self.validateEmail(value)
              ? undefined
              : { message: `* ${self.emailsError}` },
          });
        });
      },
    });
  }

  fetchTipoInforme() {
    this.loadingService.showLoading();
    return fetchTipoInforme()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de mantenimiento',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }
  async setTipoInforme() {
    this.mostrarAcumulado = false;
    const tipoInforme = this.tiposInforme.find(
      (x: any) => x.id === this.formFields.informeSeleccionado.value
    );
    console.log(tipoInforme.descripcion);
    this.nombreReporte = tipoInforme.descripcion;
    switch (this.formFields.informeSeleccionado.value.toString()) {
      case '4': //Actividades
        this.report_type = 'actividades';
        this.isActividad = true;
        this.primeraTabla = true;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '5': //Kilometraje
        this.report_type = 'kilometraje';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '6': //Detalle Viaje
        this.report_type = 'detalle_viaje';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = true;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '7': //Sitio
        this.report_type = 'sitios';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = true;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '8': //Resumen Tiempos
        this.report_type = 'resumen_tiempos';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = true;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '9': //Mantenimientos vencidos
        this.report_type = 'mantenimientos';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = true;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '10': //Vehiculos al dia y %
        this.report_type = 'cumplimiento';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = true;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '11': //Estado de mantenimiento
        this.report_type = 'estado_mantenimiento';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = true;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '12': //Exceso de velocidad
        this.report_type = 'exceso_velocidad';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = true;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '13': //Temperatura
        this.report_type = 'temperatura';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = true;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '14': //Descargar
        this.report_type = 'descargas';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = true;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '15': //Alertas
        this.report_type = 'alertas';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = true;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '16':
        this.report_type = 'consolidado_mensual';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = true;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '17':
        this.report_type = 'detencion';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = true;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '18':
        this.report_type = 'velocidad_sitios';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = true;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '19':
        this.report_type = 'ultima_actividad';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = true;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '20':
        this.report_type = 'consolidado_pelambres';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = true;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '21':
        this.report_type = 'geotec';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = true;
        this.isHorometro = false;
        this.row = 'xlsx';
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '22':
        this.report_type = 'horometro';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = true;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '23':
        this.report_type = 'odometro';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = true;
        this.isEsmax = false;
        this.isEstadoTransmision = false;
        break;
      case '24':
        this.report_type = 'detalle_detencion_puntos';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = true;
        this.isEstadoTransmision = false;
        break;
      case '25':
        this.report_type = 'kilometros_recorridos';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = true;
        this.isEstadoTransmision = false;
        break;
      default:
        break;
      case '26':
        this.report_type = 'estado_transmision';
        this.isActividad = false;
        this.primeraTabla = false;
        this.isDetalleViaje = false;
        this.isSitio = false;
        this.isResumenTiempos = false;
        this.isExcesoVelocidad = false;
        this.isTemperatura = false;
        this.isContainerMantenimiento = false;
        this.isDescargas = false;
        this.isAlerta = false;
        this.isConsolidado = false;
        this.isDetencion = false;
        this.isVelocidadSitios = false;
        this.isUltimaActividad = false;
        this.isConsolidadoProveedor = false;
        this.isGeotec = false;
        this.isHorometro = false;
        this.isEsmax = true;
        this.isEstadoTransmision = true;
        break;
    }
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
  handleVehiculosChange(event: AsociarFlotaEtiquetaVehiculoChangeEvent) {
    if (event.flotas.length > 0) this.flotasAsignadas = event.flotas;

    if (event.etiquetas.length > 0) this.etiquetasAsignadas = event.etiquetas;

    this.vehiculos = event;
  }
  handleAsociacionesChange(event: any) {
    this.vehiculosSeleccionados = event.vehiculos;
  }
  async handleClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    var hidden_columns = [];
    var summary = false;

    this.vehiculosInforme = [];
    if (this.vehiculos.flotas.length > 0) {
      this.tipoVehiculoSeleccionado = 'flota';
      this.loadingService.showLoading();
      if (
        this.report_type != 'detalle_detencion_puntos' &&
        this.report_type != 'estado_transmision' &&
        this.report_type != 'kilometros_recorridos'
      ) {
        await this.axContextoVehiculo.http
          .post('Flota/vehiculo/', this.vehiculos.flotas)

          .then(vm => {
            if (vm.data.length > 0) {
              vm.data.forEach((dt: any) => {
                let v: Vehiculo = {
                  id: dt.vehiculoId,
                  unidad: '',
                  flota: null,
                  etiquetas: null,
                  tipoVehiculo: '',
                  marca: '',
                  modelo: '',
                  tipoCombustible: '',
                  tipoTransmision: '',
                  ano: '',
                  poseeGps: true,
                };
                this.vehiculosInforme.push(v);
              });
            }
          })
          .catch(err => {
            this.loadingService.hideLoading();
          });
      } else {
        await this.axContextoPostgres.http
          .post(`Metabase/PostgenericA/track/getVehiclesByFleets`, {
            flotas: this.vehiculos.flotas,
            clientId: this.getClientID().toString(),
          })
          .then((response: any) => {
            if (response.data.CODIGO_RESPUESTA == '1') {
              this.vehiculosInforme = response.data.vehiculos;
            } else {
              this.$snotify.error(response.data.MENSAJE_RESPUESTA);
            }
          })
          .catch((err: any) => {
            this.loadingService.hideLoading();
          });
      }
      this.loadingService.hideLoading();
    }

    if (this.vehiculos.etiquetas.length > 0) {
      this.tipoVehiculoSeleccionado = 'etiquetas';
      this.loadingService.showLoading();
      for (var i = 0; i < this.vehiculos.etiquetas.length; i++) {
        const d = await this.setVehiculoEtiqueta(this.vehiculos.etiquetas[i]);
      }
      this.loadingService.hideLoading();
    }

    if (this.vehiculos.vehiculos.length > 0) {
      this.tipoVehiculoSeleccionado = 'vehiculo';
      this.vehiculos.vehiculos.forEach(a => {
        this.vehiculosInforme.push(a);
      });
    }

    var idVehiculos: any = [];
    this.vehiculosInforme.forEach((x: any) => {
      idVehiculos.push(x.id);
    });
    var uniq = [...new Set(idVehiculos)];

    if (this.isExcesoVelocidad) {
      if (!this.velocidadValidada) return;
    }
    if (this.isActividad) {
      hidden_columns =
        this.formsFieldcheckActividad == null
          ? []
          : this.formsFieldcheckActividad;
    }
    if (this.isAlerta) {
      hidden_columns =
        this.formsFieldcheckAlerta == null ? [] : this.formsFieldcheckAlerta;
    }
    if (this.isResumenTiempos) {
      InformeEventBus.$emit('validaResumenTiempo', true);
      if (
        this.timePickerResumenTiempo == null ||
        this.txtMinimoDetencion == null
      )
        return;

      var minimun_detencion =
        this.txtMinimoDetencion + this.timePickerResumenTiempo == 0
          ? 1
          : this.txtMinimoDetencion + this.timePickerResumenTiempo;
    }
    if (this.isDetalleViaje) {
      summary = this.formsFieldDetalleViaje;
    }
    if (this.isTemperatura) {
      hidden_columns =
        this.formsFieldTemperatura == null ? [] : this.formsFieldTemperatura;
    }
    if (resultadoValidacion) {
      this.vehiculosSelect = [];
      this.sitiosSelect = [];
      if (this.isSitio) {
        summary = this.formsFieldSitio;
        if (this.sitiosSeleccionados.length > 0) {
          this.sitiosSeleccionados.forEach((x: any) =>
            this.sitiosSelect.push(x.nombre)
          );
        }
      }
      if (this.isContainerMantenimiento) {
        //this.formFields.horaInicio.value = null;
        //this.formFields.horaHasta.value = null;
        if (this.planesMantenimientoSeleccionadas.length < 1) {
          this.tituloValidacion = 'Seleccionar Plan de Mantenimiento';
          this.mensajeValidacion =
            'Debe seleccionar al menos un plan de mantenimiento.';
          this.showValidacionReporteRestricciones = true;
          return;
        } else if (this.pautasActividadesSeleccionadas < 1) {
          this.tituloValidacion = 'Seleccionar Pautas de Actividades';
          this.mensajeValidacion =
            'Debe seleccionar al menos una pauta de actividades.';
          this.showValidacionReporteRestricciones = true;
          return;
        } else if (this.vehiculosSeleccionados < 1) {
          this.tituloValidacion = 'Seleccionar Vehículo';
          this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
          this.showValidacionReporteRestricciones = true;
          return;
        } else {
          this.vehiculosSelect = [];
          this.vehiculosSeleccionados.forEach((x: any) => {
            this.vehiculosSelect.push(x.id);
          });
        }
      } else {
        this.vehiculosSelect = [];
        if (uniq.length > 0) {
          uniq.forEach(x => {
            this.vehiculosSelect.push(x);
          });
        } else {
          this.vehiculos.vehiculosDejadosDeRecibir.forEach(x => {
            this.vehiculosSelect.push(x.id);
          });
        }
      }
      if (this.isActividad && this.actividadesSeleccionadas.length < 1) {
        if (this.vehiculosSelect.length < 1) {
          this.tituloValidacion = 'Seleccionar Actividad y Vehiculo';
          this.mensajeValidacion =
            'Debe seleccionar al menos una Actividad y un Vehículo.';
          this.showValidacionReporteRestricciones = true;
        } else {
          this.tituloValidacion = 'Seleccionar Actividad';
          this.mensajeValidacion = 'Debe seleccionar al menos una Actividad.';
          this.showValidacionReporteRestricciones = true;
        }
        return;
      } else if (
        this.vehiculosSelect.length < 1 &&
        !this.isDescargas &&
        !this.isGeotec //&&
        //!this.isEsmax
      ) {
        this.tituloValidacion = 'Seleccionar Vehículo';
        this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
        this.showValidacionReporteRestricciones = true;
        return;
      }
      if (this.isConsolidadoProveedor && this.selectionProveedor.length < 1) {
        this.tituloValidacion = 'Seleccionar Proveedor';
        this.mensajeValidacion = 'Debe seleccionar al menos un proveedor.';
        this.showValidacionReporteRestricciones = true;
        return;
      }

      var star_date = moment(this.formFields.fechaDesde.value.toString())
        .format('DD-MM-YYYY')
        .toString();
      var star_hour =
        this.formFields.horaInicio.value != null
          ? moment(this.formFields.horaInicio.value.toString())
              .format('HH:mm')
              .toString()
          : '00:00';
      var fechaInicio: moment.Moment = moment(
        star_date + ' ' + star_hour,
        'DD-MM-YYYY HH:mm'
      );
      var end_date = moment(this.formFields.fechaHasta.value.toString())
        .format('DD-MM-YYYY')
        .toString();
      var end_hour =
        this.formFields.horaHasta.value != null
          ? moment(this.formFields.horaHasta.value.toString())
              .format('HH:mm')
              .toString()
          : '23:59';
      var fechaFin: moment.Moment = moment(
        end_date + ' ' + end_hour,
        'DD-MM-YYYY HH:mm'
      );

      if (fechaInicio.isAfter(fechaFin)) {
        this.tituloValidacion = 'Fechas de Informe';
        this.mensajeValidacion =
          'La fecha y hora desde no puede ser mayor a la fecha y hora hasta.';
        this.showValidacionReporteRestricciones = true;
        return;
      }

      var totalDias = fechaFin.diff(fechaInicio, 'days');
      if (totalDias > 90) {
        this.tituloValidacion = 'Fechas de Informe';
        this.mensajeValidacion =
          'El informe es demasiado grande para ser obtenido, por favor seleccione un intervalo de tiempo menor a 90 días.';
        this.showValidacionReporteRestricciones = true;
        return;
      }

      if (this.isDescargas) {
        if (
          this.proveedorSelect.length < 1 &&
          this.clientesProveedorSelect.length < 1
        ) {
          this.tituloValidacion =
            'Seleccionar Servicio de Descarga, Proveedor o Cliente Proveedor';
          this.mensajeValidacion =
            'Debe seleccionar al menos un Servicio de Descarga, Proveedor o Cliente Proveedor.';
          this.showValidacionReporteRestricciones = true;
          return;
        }
      }

      if (this.alertaBaseCliente == null && this.isAlerta) {
        this.tituloValidacion = 'Seleccionar Tipo de Alerta según Alerta Base';
        this.mensajeValidacion =
          'Debe seleccionar una alerta de las configuradas.';
        this.showValidacionReporteRestricciones = true;
        return;
      }

      if (this.isVelocidadSitios || this.isDetalleViaje) {
        if (this.mostrarEtiqueta) {
          hidden_columns.push('etiqueta');
        } else {
          hidden_columns = [];
        }
      }

      if (this.isHorometro && this.mostrarAcumulado) {
        hidden_columns.push('acumulado');
      }

      // if( this.isSitio && (this.typeZone == null || this.typeZone == 'Todos') ){
      //   this.tituloValidacion = 'Seleccionar el Tipo de Sitio';
      //   this.mensajeValidacion =
      //     'Debe seleccionar un tipo de sitio para generar el informe.';
      //   this.showValidacion = true;
      //   return;
      // }

      if (this.isDetencion) {
        if (this.mostrarSitio) {
          hidden_columns.push('sitio');
        } else {
          hidden_columns = [];
        }
        if (
          this.detentionDays == null ||
          this.detentionHours == null ||
          this.detentionMinutes == null
        ) {
          this.tituloValidacion = 'Rellenar los Campos de Detención Mínima';
          this.mensajeValidacion =
            'No debe dejar ningún campo de detención mínima vacio';
          this.showValidacionReporteRestricciones = true;
          return;
        }
        if (
          !/^\d+$/.test(this.detentionDays) ||
          !/^\d+$/.test(this.detentionHours) ||
          !/^\d+$/.test(this.detentionMinutes)
        ) {
          this.tituloValidacion =
            'Los Campos de Detención Mínima deben ser numéricos';
          this.mensajeValidacion =
            'Solo puede ingresar caracteres numéricos en el campo de detención mínima';
          this.showValidacionReporteRestricciones = true;
          return;
        }
      }

      if (this.isExcesoVelocidad && this.precisionGps) {
        if (!this.hdopValidado || !this.sateliteValidado) {
          this.tituloValidacion = 'Los campos de precisión están incorrectos';
          this.mensajeValidacion =
            'Solo puede ingresar caracteres numéricos y dentro del intervalo en los campos de precisión';
          this.showValidacionReporteRestricciones = true;
          return;
        }
      }

      if (
        this.program &&
        !this.validateEmail(this.formFields.emails.value.toString())
      ) {
        this.tituloValidacion = 'Correo Electrónico invalido';
        this.mensajeValidacion = this.emailsError;
        this.showValidacionReporteRestricciones = true;
        return;
      }

      var detention_time: number =
        Number(this.detentionDays) * 86400 +
        Number(this.detentionHours) * 3600 +
        Number(this.detentionMinutes) * 60;
      let dataInforme: any = {
        date_created: moment().utcOffset(0, true),
        report_type: this.report_type,
        user: this.usuarioId.toString(),
        client: this.clienteId.toString(),
        starting_date: star_date,
        starting_hour: star_hour, //moment(this.formFields.horaInicio.value.toString()).format('HH:mm') ,
        ending_date: end_date,
        ending_hour: end_hour,
        vehicles: this.isDescargas ? [] : this.vehiculosSelect,
        hidden_columns: hidden_columns,
        trustworthy: this.datoConfiable,
        activities_types_list: this.isActividad
          ? this.actividadesSeleccionadas
          : [],
        summary: summary,
        day_grouping: true,
        zones: this.sitiosSelect,
        type_zone: this.isSitio ? this.typeZone : '',
        all_events: true,
        hdop: this.precisionHdop.toString(),
        satelites: this.precisionSatelites.toString(),
        minimum_detention_time: this.isResumenTiempos
          ? minimun_detencion
          : this.isDetencion
          ? detention_time
          : 0,
        maintenance_plans: this.isContainerMantenimiento
          ? this.planesMantenimientoSeleccionadas
          : [],
        activities_guidelines: this.isContainerMantenimiento
          ? this.pautasActividadesSeleccionadas
          : [],
        speed_limit: this.isExcesoVelocidad ? this.txtLimiteVelocidad : 0,
        orientation:
          this.row == 'pdf'
            ? this.formFields.orientacionPdf.value == 'Vertical'
              ? 'Portrait'
              : 'Landscape'
            : 'Portrait',
        client_provider: this.isDescargas ? this.clientesProveedorSelect : [],
        provider: this.isDescargas ? this.proveedorSelect : [],
        alertaBaseId: this.alertaBaseId,
        alertaBaseCliente: this.alertaBaseCliente,
        proveedores: this.selectionProveedor,
        nombreReporte: this.mostrarAcumulado
          ? this.nombreReporte + ' Actual'
          : this.nombreReporte,
        vehiculos_seleccionados: this.vehiculos,
        semaforo: {
          verde: parseInt(this.verde.toString()),
          amarillo: parseInt(this.amarillo.toString()),
          rojo: parseInt(this.rojo.toString()),
        },
        aplication:
          this.$route.path == '/Torre-Control/generar_informe'
            ? 'TC_INFORME_GENERADO'
            : '',
      };
      if (this.program) {
        dataInforme.is_programmed = this.program;
        dataInforme.programmed_date = '3000-01-01 16:30:00';
        dataInforme.client_prog = this.clienteId.toString();
        dataInforme.user_prog = this.usuarioId.toString();
        dataInforme.correos = this.formFields.emails.value;
      }
      this.dataGeneracionInforme = dataInforme;
      this.aceptaGeneraInforme(true);
      return;
    }
  }

  private async setVehiculoEtiqueta(element: Etiqueta) {
    const response = await this.axContextoVehiculo.http.get(
      'VehiculoEtiquetaVehiculo/' + element.id + '/vehiculos/'
    );

    if (response.data.length > 0) {
      response.data.forEach((dt: any) => {
        let v: Vehiculo = {
          id: dt.vehiculoId,
          unidad: '',
          flota: null,
          etiquetas: null,
          tipoVehiculo: '',
          marca: '',
          modelo: '',
          tipoCombustible: '',
          tipoTransmision: '',
          ano: '',
          poseeGps: true,
        };
        this.vehiculosInforme.push(v);
      });
    }
  }

  aceptaGeneraInforme(val: boolean) {
    this.showBtnCancelar = false;
    this.showValidacionReporteRestricciones = false;
    if (val) {
      this.loadingService.showLoading();
      const res = postReporteTime(this.dataGeneracionInforme, this.row)
        .then(async (resMin: any) => {
          if (resMin.data.servicioRespuesta != '1' && this.row == 'pdf') {
            this.tituloValidacion = 'Generar Informe';
            this.mensajeValidacion = this.mensajeProgramacion;
            this.showValidacionReporteRestricciones = true;
          } else {
            const response = save_report(this.dataGeneracionInforme, this.row)
              .then(async (response: any) => {
                if ('id_reporte' in response.data) {
                  this.tituloValidacion = 'Informe Creado';
                  this.mensajeValidacion =
                    'El informe ID ' +
                    response.data.id_reporte +
                    ' se ha solicitado exitosamente.';
                  this.mensajeValidacionBot =
                    'Estará disponible en unos segundos en Histórico Informes.';
                  this.mensajeHRef =
                    this.$route.path != '/Torre-Control/generar_informe'
                      ? '/informe-generado'
                      : '/Torre-Control/informes_generados';
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
          }
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  generaInforme() {
    if (this.report_type != '') {
      if (this.row != '') {
        this.loadingService.showLoading();
        return generarInforme(this.dataGeneracionInforme, this.row)
          .then(async (vm: any) => {
            var informeData = {
              ...this.dataGeneracionInforme,
              data: vm.data,
              name:
                (this.report_type == 'sitios'
                  ? this.typeZone
                  : this.report_type) +
                '_' +
                this.dataGeneracionInforme.date_created.format(
                  'DD_MM_YYYY_HH_mm_ss_SSS'
                ) +
                '.' +
                this.row,
            };
            if (this.row == 'pdf') {
              await this.generarPDF(informeData);
            } else if (this.row == 'xlsx') {
              await this.generarExcel(informeData);
            } else {
              await this.generarCsv(informeData);
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

  generarInformeHistorico() {
    const response = generarInformeHistorico(
      this.dataGeneracionInforme,
      this.row
    ).then(async (resp: any) => {
      this.showValidacionReporteRestricciones = false;
    });
  }

  generarPDF(fd: any) {
    var file = new Blob([fd.data], { type: 'application/pdf' });
    var fileURL = URL.createObjectURL(file);
    var fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', fd.name);
    document.body.appendChild(fileLink);
    fileLink.click();
  }

  generarCsv(fd: any) {
    var blob = new Blob([fd.data], { type: 'text/plain' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, fd.name);
    } else {
      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = fd.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  generarExcel(fd: any) {
    var file = new Blob([fd.data], { type: 'application/vnd.ms-excel' });
    var fileURL = URL.createObjectURL(file);
    var fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', fd.name);
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

  validateEmail(emails: string) {
    if (this.formFields.emails.value == '') {
      return false;
    }
    let listaCorreos = emails.split(';');
    for (var correo of listaCorreos) {
      if (
        //eslint-disable-next-line
        !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          correo.trim()
        )
      ) {
        this.emailsError = 'Correo ' + correo + ' no es válido';
        return false;
      }
    }
    return true;
  }
  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }

  switchProgram() {}
}
</script>
<style scoped>
.v-btn {
  margin-left: 40px !important;
  background-color: #ffe800 !important;
}
.text-detencion {
  margin-left: 5px;
  width: 90px;
  margin-right: 15px;
  padding-right: 5px;
}
.divClassLabel {
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

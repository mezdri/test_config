<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <FormFieldsContainer titulo="Información General">
              <v-layout row wrap>
                <v-flex xs12>
                  <v-switch
                    color="success"
                    :label="formFields.activo.label"
                    v-model="formFields.activo.value"
                    persistent-hint
                    :hint="mensajeEstado"
                    :readonly="accion === 3"
                  ></v-switch>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <CampoUnico
                    :label="formFields.nombreInforme.label"
                    v-model="formFields.nombreInforme.value"
                    v-validate="`required|max:80|${uniqueFieldRule}`"
                    :id="formFields.nombreInforme.id"
                    counter="80"
                    :error-messages="
                      errors.collect(formFields.nombreInforme.id)
                    "
                    :validate="validarNombreProgramacion"
                    message=" Ya existe una Programación de Informe con este nombre."
                    :disabled="accion === 3"
                  ></CampoUnico>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-autocomplete
                    :items="formFields.tipoInforme.items"
                    :label="formFields.tipoInforme.label"
                    v-model="formFields.tipoInforme.value"
                    @change="changeTipoInformeV2"
                    item-text="nombre"
                    item-value="id"
                    no-data-text="Datos no disponibles"
                    :disabled="accion !== 1"
                  />
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
            <InformeActividad
              v-show="nombreServicioInforme === 'actividades'"
              @checkActividad="handleCheckActividad"
              @actividadSeleccionada="handledActividad"
              :filtro="filtro"
              :actividadesAsignados="actividadesAsignados"
              :hiddenColumns="hiddenColumns"
              :accion="accion"
              :isProgrammed="true"
            />
            <v-card
              v-show="nombreServicioInforme === 'detencion'"
              elevation="0"
            >
              <div style="display: flex; padding-left: 5px;">
                Tiempo de detención mínimo
              </div>
              <div style="display: flex">
                <v-text-field
                  label="Días"
                  class="text-detencion"
                  v-model="detentionDays"
                  @change="emitFormChange"
                  v-validate="'required|numeric'"
                  data-vv-name="tiempo_dias"
                  :disabled="accion === 3"
                  :error-messages="errors.collect('tiempo_dias')"
                >
                </v-text-field>
                <v-text-field
                  label="Horas"
                  class="text-detencion"
                  v-model="detentionHours"
                  @change="emitFormChange"
                  v-validate="'required|numeric'"
                  data-vv-name="tiempo_horas"
                  :disabled="accion === 3"
                  :error-messages="errors.collect('tiempo_horas')"
                >
                </v-text-field>
                <v-text-field
                  label="Minutos"
                  class="text-detencion"
                  v-model="detentionMinutes"
                  @change="emitFormChange"
                  v-validate="'required|numeric'"
                  data-vv-name="tiempo_minutos"
                  :disabled="accion === 3"
                  :error-messages="errors.collect('tiempo_minutos')"
                >
                </v-text-field>
                <v-checkbox
                  label="Mostrar Sitio"
                  v-model="showSiteDetention"
                  :disabled="accion === 3"
                ></v-checkbox>
              </div>
            </v-card>
            <v-card
              v-show="
                nombreServicioInforme === 'odometro' ||
                  nombreServicioInforme === 'horometro'
              "
              elevation="0"
            >
              <v-checkbox
                label="Mostrar Solo Actual"
                v-model="mostrarAcumulado"
                @change="handleAcumulado"
              ></v-checkbox>
            </v-card>
            <v-card
              v-show="nombreServicioInforme === 'velocidad_sitios'"
              elevation="0"
            >
              <v-checkbox
                label="Mostrar Etiqueta"
                v-model="mostrarEtiqueta"
                @change="emitFormChange"
                :disabled="accion === 3"
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
                  <div class="divClassLabel">> Rojo</div>
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
            </v-card>
            <PantallaAlertas
              v-show="nombreServicioInforme === 'alertas'"
              :alertaBaseCliente="alertaBaseCliente"
              :alertaBaseId="alertaBaseId"
              :columnasOcultasAlertas="formsFieldcheckAlerta"
              :accion="accion"
            ></PantallaAlertas>
            <!-- <InformeDetalleViaje
              v-show="
                formFields.tipoInforme.value === tiposDeInforme.DetalleViaje
              "
              @checkDetalleViaje="handleCheckDetalleViaje"
              :filtro="filtro"
              :accion="accion"
            /> -->
            <CheckDetalleViaje
              v-show="nombreServicioInforme === 'detalle_viaje'"
              :formsFieldSitio="formsFieldSitio"
              :accion="accion"
            ></CheckDetalleViaje>
            <CheckConsolidadoProveedor
              v-show="nombreServicioInforme === 'consolidado_pelambres'"
            ></CheckConsolidadoProveedor>
            <CheckSitio
              v-show="nombreServicioInforme === 'sitios'"
              :sitiosSeleccionados="sitiosSeleccionados"
              :typeZone="typeZone"
              :isProgrammed="false"
              :accion="accion"
            ></CheckSitio>
            <!-- <InformeSitio
              v-show="formFields.tipoInforme.value === tiposDeInforme.Sitio"
              @checkSitio="handlecheckSitio"
              @zonasSeleccionadas="handleZonasSeleccionadas"
              :filtro="filtro"
              :zonasAsignadas="zonasAsignadas"
              :accion="accion"
            /> -->
            <!-- <ResumenTiempos
              v-show="
                nombreServicioInforme === ''"
              @change="handleFormChangeResumen"
              :filtro="filtro"
              :accion="accion"
            /> -->
            <CheckExcesoVelocidad
              v-show="nombreServicioInforme === 'exceso_velocidad'"
              :txtLimiteVelocidad="txtLimiteVelocidad"
              :precisionHdop="precisionHdop"
              :precisionSatelites="precisionSatelites"
              :precisionEV="precisionGps"
              :accion="accion"
            />
            <!-- <Temperatura
              v-show="
                formFields.tipoInforme.value === tiposDeInforme.Temperatura
              "
              @checkTemperatura="handleCheckTemperatura"
              :filtro="filtro"
              :accion="accion"
            /> -->
          </v-container>
        </v-form>
      </v-card>
      <br />

      <containerPlanMantenimiento
        v-show="esMantenimiento"
        @planSeleccionado="handlePlanesMantenimiento"
        :planesManteniminetoAsignados="planesManteniminetoAsignados"
        :accion="accion"
      ></containerPlanMantenimiento>

      <ContainerInformeDescargas
        v-show="esDescargas"
        @infoSeleccionado="handleInformeDescargas"
        :infoDescargasAsignados="infoDescargasAsignados"
        :infoProveedorAsignados="infoProveedorAsignados"
        :infoClientesProveedorAsignados="infoClientesProveedorAsignados"
        :esEditar="accion === 2 ? true : false"
        :readonly="accion === 3 ? true : false"
        :accion="accion"
      ></ContainerInformeDescargas>
      <br />

      <v-flex v-show="esMantenimiento && accion !== 3 && !esDescargas">
        <v-card class="rounded-card mt-20">
          <AsociarFlotaEtiquetaVehiculoXMantenimiento
            @change="handleAsociacionesChange"
            :vehiculosIdSeleccionar="vehiculosSeleccionadosMantenimiento"
            :esEditar="accion === 2 ? true : false"
            :readonly="accion === 3 ? true : false"
            :esInforme="true"
          ></AsociarFlotaEtiquetaVehiculoXMantenimiento>
        </v-card>
      </v-flex>
      <br />

      <v-flex v-show="(!esMantenimiento || accion === 3) && !esDescargas">
        <v-card class="rounded-card mt-20">
          <v-flex v-if="nombreServicioInforme != 'geotec'">
            <AsociarFlotaEtiquetaVehiculo
              :colDefVehiculo="colDefVehiculo"
              :vehiculosIdSeleccionar="
                vehiculosSeleccionados ? vehiculosSeleccionados : []
              "
              @change="handleVehiculosChange"
              :esEditar="accion === 2 ? true : false"
              :readonly="accion === 3 ? true : false"
              :esInforme="true"
              :reportType="nombreServicioInforme"
            />
          </v-flex>
        </v-card>
      </v-flex>
      <br />

      <v-flex md12>
        <v-card class="rounded-card">
          <v-form ref="form" lazy-validation class="col-md-12">
            <v-container
              grid-list-md
              text-xs-center
              v-if="nombreServicioInforme != 'geotec'"
            >
              <SeleccionFormatoInforme
                @change="handleFormChangeFormato"
                :formatoInformeProgramado="formatoInformeProgramado"
                :accion="accion"
              />
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
      <br />

      <v-flex md12>
        <v-card class="rounded-card">
          <v-form ref="form" lazy-validation class="col-md-12">
            <v-container
              grid-list-md
              text-xs-center
              v-if="
                nombreServicioInforme != 'ultima_actividad' || !mostrarAcumulado
              "
            >
              <FormFieldsContainer titulo="Periodo de Informe">
                <v-flex md2>
                  <v-text-field
                    type="time"
                    prepend-icon="access_time"
                    :label="formFields.horaDesde.label"
                    v-validate="'required'"
                    :error-messages="errors.collect(formFields.horaDesde.id)"
                    :data-vv-name="formFields.horaDesde.id"
                    v-model="formFields.horaDesde.value"
                    :disabled="accion === 3"
                  />
                </v-flex>
                <v-flex md2>
                  <v-text-field
                    type="time"
                    prepend-icon="access_time"
                    :label="formFields.horaHasta.label"
                    v-validate="'required'"
                    :error-messages="errors.collect(formFields.horaHasta.id)"
                    :data-vv-name="formFields.horaHasta.id"
                    v-model="formFields.horaHasta.value"
                    :disabled="accion === 3"
                  />
                </v-flex>
              </FormFieldsContainer>
              <v-divider />
              <br />
              <FormFieldsContainer>
                <v-flex md2 style="margin-top:26px;">
                  <span class="font-weight-medium">Seleccionar Periodo</span>
                </v-flex>
                <v-flex md3>
                  <v-select
                    :items="formFields.periodo.items"
                    :label="formFields.periodo.label"
                    v-model="formFields.periodo.value"
                    item-text="nombre"
                    item-value="id"
                    no-data-text="Sin Resultados"
                    :disabled="accion === 3"
                  />
                </v-flex>
                <v-flex md3 v-if="formFields.periodo.value === 1">
                  <DatePicker
                    :label="formFields.fechaDesde.label"
                    :error-messages="errors.collect(formFields.fechaDesde.id)"
                    :id="formFields.fechaDesde.id"
                    v-model="formFields.fechaDesde.value"
                    v-validate="'required'"
                    :disabled="accion === 3"
                  />
                </v-flex>
                <v-flex md3 v-if="formFields.periodo.value === 1">
                  <DatePicker
                    :label="formFields.fechaHasta.label"
                    :error-messages="errors.collect(formFields.fechaHasta.id)"
                    :id="formFields.fechaHasta.id"
                    v-model="formFields.fechaHasta.value"
                    v-validate="'required'"
                    :disabled="accion === 3"
                  />
                </v-flex>
                <v-flex md3 v-if="formFields.periodo.value !== 1">
                  <v-text-field
                    :label="formFields.multiploPeriodo.label"
                    :error-messages="
                      errors.collect(formFields.multiploPeriodo.id)
                    "
                    :data-vv-name="formFields.multiploPeriodo.id"
                    v-model="formFields.multiploPeriodo.value"
                    :disabled="accion === 3"
                  />
                </v-flex>
              </FormFieldsContainer>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
    </v-flex>
  </div>
</template>

<script lang="ts">
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { Validator } from 'vee-validate';
import { AxiosVue } from '@/AxiosVue';
import CheckDetalleViaje from '@/pantallas/Informes/InformeDetalleViaje/CheckDetalleViaje.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import InformeActividad from './TiposdeInformes/TipoInformeActividad/InformeActividad.vue';
import SeleccionFormatoInforme from './ComponentesInformes/SeleccionFormatoInforme.vue';
import CheckExcesoVelocidad from '@/pantallas/Informes/InformeExcesoVelocidad/CheckExcesoVelocidad.vue';
import CheckConsolidadoProveedor from '@/pantallas/Informes/InformeConsolidadoProveedor/CheckConsolidadoProveedor.vue';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import InformeDetalleViaje from './TiposdeInformes/TipoDetalleViaje/InformeDetalleViaje.vue';
import InformeSitio from './TiposdeInformes/TipoSitio/InformeSitio.vue';
import { ColDef } from 'ag-grid-community';
import ResumenTiempos from './TiposdeInformes/TipoResumenTiempos/ResumenTiempos.vue';
import GrillaPlanesMantenimiento from './ComponentesInformes/GrillaPlanesMantenimiento.vue';
import ExcesoVelocidad from './TiposdeInformes/TipoExcesoVelocidad/ExcesoVelocidad.vue';
import { fetchTipoInformeProgramacion, TipoInforme } from './fetchTipoInforme';
import Zonas from '../../views/plataforma/Zonas.vue';
import CheckSitio from '@/pantallas/Informes/InformeSitio/CheckSitio.vue';
import PantallaAlertas from '@/pantallas/Informes/InformeAlertas/PantallaAlertas.vue';
import {
  ProgramacionInforme,
  Filtros,
} from '@/pantallas/ProgramacionInforme/ProgramacionInforme';
import Temperatura from '@/pantallas/ProgramacionInforme/TiposdeInformes/TipoTemperatura/Temperatura.vue';
import { watch } from 'fs';
import {
  IInformeProgramadoBackend,
  actividadBackend,
  vehiculosBackend,
  FiltrosBackend,
  planMantenimientoBackend,
  zonasBackend,
  descargaBackend,
  proveedorBackend,
  clienteProveedorBackend,
} from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import AsociarFlotaEtiquetaVehiculoXMantenimiento from '@/pantallas/Informes/partes/AsociarFlotaEtiquetaVehiculoXMantenimiento.vue';
import ContainerPlanMantenimiento from '@/pantallas/ProgramacionInforme/TiposdeInformes/TipoMantenimiento/ContainerPlanMantenimiento.vue';
import ContainerInformeDescargas from '@/pantallas/ProgramacionInforme/TiposdeInformes/TipoDescargas/ContainerInformeDescargas.vue';
import moment from 'moment';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import CampoUnico, { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import { ServicioProxy } from '@/config/enums';

enum TiposDeInforme {
  Actividad = 1,
  Kilometraje = 2,
  DetalleViaje = 3,
  Sitio = 4,
  ResumenTiempos = 5,
  MantenimientosVencidos = 6,
  ExcesoVelocidad = 7,
  Temperatura = 8,
  VehiculosAlDia = 9,
  EstadoMantenimiento = 10,
  Descargas = 11,
  Alertas = 13,
  Consolidado_mensual = 14,
  Detencion = 15,
  Exceso_velocidad_sitio = 16,
  Ultima_actividad = 17,
  Geotec = 19,
  Horometro = 20,
  Odometro = 22,
}

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    InformeActividad,
    SeleccionFormatoInforme,
    AsociarFlotaEtiquetaVehiculo,
    DatePicker,
    InformeDetalleViaje,
    InformeSitio,
    ResumenTiempos,
    GrillaPlanesMantenimiento,
    CheckSitio,
    ExcesoVelocidad,
    CheckExcesoVelocidad,
    Temperatura,
    AsociarFlotaEtiquetaVehiculoXMantenimiento,
    ContainerPlanMantenimiento,
    CampoUnico,
    ContainerInformeDescargas,
    PantallaAlertas,
    CheckDetalleViaje,
    CheckConsolidadoProveedor,
  },
})
export default class ProgramacionInformeForm extends Vue {
  @Prop() informeProgramadoSeleccionado: IInformeProgramadoBackend;
  @Prop({ default: 1 }) accion: number;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  tipoInforme: TipoInforme[] = [];
  esMantenimiento: boolean = false;
  esDescargas: boolean = false;
  esGeotec: boolean = false;
  nombreServicioInforme: string = '';
  axiosPostgres = new AxiosVue(ServicioProxy.Metabase);

  mensajeEstado: string = '';
  uniqueFieldRule = uniqueFieldRule;

  tiposDeInforme = TiposDeInforme;

  formsFieldcheckAlerta: string[] = [];

  precisionGps: boolean = false;

  sitiosSeleccionados: any = [];
  selectionProveedor: any = [];

  actividadesTipos: string[] = [];
  txtLimiteVelocidad: number = 30;
  typeZone: string = 'Sitio';
  precisionHdop: string = '0';
  precisionSatelites: string = '0';
  hdopValidado: boolean = true;
  sateliteValidado: boolean = true;
  dictionaryFormErrors: any = {};

  mostrarEtiqueta: boolean = false;

  detentionDays: any = 0;
  detentionHours: any = 0;
  detentionMinutes: any = 0;
  showSiteDetention: boolean = false;

  hiddenColumns: string[] = [];

  alertaBaseId: number = null;
  alertaBaseCliente: any = null;

  formsFieldSitio: boolean = false;

  checkSateliteActividad: boolean = false;
  checkHDOPActividad: boolean = false;
  checkLongYLatActividad: boolean = false;
  checkDatoValidoActividad: boolean = false;
  mostrarAcumulado: boolean = false;

  checkResumenDetalle: boolean = false;
  checkAgruparDiaDetalle: boolean = false;

  checkResumenSitio: boolean = false;
  checkTodoTipoEventoSitio: boolean = false;

  checkSateliteTemperatura: boolean = false;
  checkHDOPTemperatura: boolean = false;
  checkLongYLatTemperatura: boolean = false;

  minimoDiasDetencion: number = 0;
  minimoTiempo: any;

  velocidadMaxima: number = 0;

  filtro: FiltrosBackend[] = [];

  formatoInformeProgramado: number = 0;

  planesMantenimientoIds: number[] = [];
  planesManteniminetoAsignados: planMantenimientoBackend[] = [];

  actividadesIds: number[] = [];
  actividadesAsignados: actividadBackend[] = [];

  zonasIds: number[] = [];
  zonasAsignadas: zonasBackend[] = [];
  vehiculosSeleccionados: number[] = [];
  vehiculosSeleccionadosMantenimiento: number[] = [];

  vehiculos: number[] = [];

  //InformeDescargas
  infoDescargasIds: number[] = [];
  infoProveedoresIds: number[] = [];
  infoClientesProveedorIds: number[] = [];
  infoDescargasAsignados: descargaBackend[] = [];
  infoProveedorAsignados: proveedorBackend[] = [];
  infoClientesProveedorAsignados: clienteProveedorBackend[] = [];
  semaforo: boolean = false;
  rojo: number = 15;
  amarillo: number = 10;
  verde: number = 5;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    nombreInforme: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    tipoInforme: {
      label: 'Tipo de Informe',
      id: 'proveedorGps',
      value: null,
      items: [],
    },
    formato: {
      label: '',
      id: 'formato',
      value: 1,
    },
    horaDesde: {
      label: 'Hora Desde',
      id: 'horaDesde',
      value: null,
    },
    horaHasta: {
      label: 'Hora Hasta',
      id: 'horaHasta',
      value: null,
    },
    periodo: {
      label: 'Periodo',
      id: 'periodo',
      value: 1,
      items: [
        {
          id: 1,
          nombre: 'Rango',
        },
        {
          id: 2,
          nombre: 'Días',
        },
        {
          id: 3,
          nombre: 'Semanas',
        },
        {
          id: 4,
          nombre: 'Meses',
        },
      ],
    },
    fechaDesde: {
      label: 'Desde',
      id: 'desde',
      value: null,
    },
    fechaHasta: {
      label: 'Hasta',
      id: 'hasta',
      value: null,
    },
    multiploPeriodo: {
      label: 'Cantidad',
      id: 'cantidad',
      value: '',
    },
  };

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

  /*Handles */

  handleFormChangeFormato(event: FormChangeEvent) {
    this.formFields.formato.value = event.entity.formato;
  }

  handleFormChangeResumen(event: FormChangeEvent) {
    this.minimoDiasDetencion = event.entity.minimoDiasDetencion;
    this.minimoTiempo = event.entity.tiempoMinimo;
    this.emitFormChange();
  }

  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        tiempo_dias: {
          required: () => 'Se requiere un valor para el tiempo',
          numeric: 'El valor debe ser numérico',
        },
        tiempo_horas: {
          required: () => 'Se requiere un valor para el tiempo',
          numeric: 'El valor debe ser numérico',
        },
        tiempo_minutos: {
          required: () => 'Se requiere un valor para el tiempo',
          numeric: 'El valor debe ser numérico',
        },
      },
    };
  }

  handleCheckActividad(
    satelite: boolean,
    checkHDOP: boolean,
    checkLongYLat: boolean,
    checkDatoValido: boolean
  ) {
    this.hiddenColumns = [];
    this.checkSateliteActividad = satelite;
    this.checkHDOPActividad = checkHDOP;
    this.checkLongYLatActividad = checkLongYLat;
    this.checkDatoValidoActividad = checkDatoValido;
    if (this.checkSateliteActividad) {
      this.hiddenColumns.push('numero_satelites');
    }
    if (this.checkHDOPActividad) {
      this.hiddenColumns.push('hdop');
    }
    if (this.checkLongYLatActividad) {
      this.hiddenColumns.push('latitud');
      this.hiddenColumns.push('longitud');
    }
    if (this.checkDatoValidoActividad) {
      this.hiddenColumns.push('trustworthy');
    }
    this.emitFormChange();
  }

  handleCheckDetalleViaje(checkResumen: boolean, checkAgruparDia: boolean) {
    this.checkResumenDetalle = checkResumen;
    this.checkAgruparDiaDetalle = checkAgruparDia;
    this.emitFormChange();
  }

  handleAcumulado() {
    this.hiddenColumns.push('acumulado');
    this.emitFormChange();
  }

  handledActividad(actividadesIds: number[], actividadesNombres: string[]) {
    this.actividadesIds = actividadesIds;
    this.actividadesTipos = actividadesNombres;
    this.emitFormChange();
  }

  handlecheckSitio(checkSoloResumen: boolean, checkTodoTipoEvento: boolean) {
    this.checkResumenSitio = checkSoloResumen;
    this.checkTodoTipoEventoSitio = checkTodoTipoEvento;
    this.emitFormChange();
  }

  @Watch('formFields')
  onChanged() {
    console.log(this.formFields.tipoInforme.value);
  }

  handleZonasSeleccionadas(zonasIds: number[]) {
    this.zonasIds = zonasIds;
    this.emitFormChange();
  }

  handleLimiteVelocidad(velocidadMaxima: number) {
    this.velocidadMaxima = velocidadMaxima;
    this.emitFormChange();
  }

  handlePlanesMantenimiento(planesIds: number[]) {
    this.planesMantenimientoIds = planesIds;
    this.emitFormChange();
  }

  handleInformeDescargas(info: any) {
    this.infoDescargasIds = info.infoDescarga;
    this.infoProveedoresIds = info.infoProvedor;
    this.infoClientesProveedorIds = info.infoClienteProveedor;
    this.emitFormChange();
  }

  handleCheckTemperatura(
    checkSatelite: boolean,
    checkHDOP: boolean,
    checkLongYLat: boolean
  ) {
    this.checkSateliteTemperatura = checkSatelite;
    this.checkHDOPTemperatura = checkHDOP;
    this.checkLongYLatTemperatura = checkLongYLat;
    this.emitFormChange();
  }

  handleVehiculosChange(event: AsociarFlotaEtiquetaVehiculoChangeEvent) {
    this.vehiculos = event.vehiculos.map(x => x.id);
    if (event.vehiculos.length === 0) {
      this.vehiculos = event.vehiculosDejadosDeRecibir.map(x => x.id);
    }
    this.emitFormChange();
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como Inactivo, no se permitirá recibir información';
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  @Watch('showSiteDetention', { deep: true })
  handleSiteDetentionChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: this.formFields.nombreInforme.value,
          nombreServicio: this.nombreServicioInforme,
          formato: this.esGeotec ? 2 : this.formFields.formato.value,
          tipoInformeId: this.formFields.tipoInforme.value,
          vehiculos: this.vehiculos,
          periodo: {
            horaDesde:
              this.formFields.horaDesde.value == null
                ? moment(new Date()).format('HH:MM')
                : this.formFields.horaDesde.value,
            horaHasta:
              this.formFields.horaHasta.value == null
                ? moment(new Date()).format('HH:MM')
                : this.formFields.horaHasta.value,
            periodoDesde:
              this.formFields.fechaDesde.value == null
                ? moment(new Date())
                    .add(-1, 'days')
                    .toISOString()
                : this.formFields.fechaDesde.value,
            periodoHasta:
              this.formFields.fechaHasta.value == null
                ? moment(new Date()).toISOString()
                : this.formFields.fechaHasta.value,
            multiploPeriodo: this.formFields.multiploPeriodo.value,
            tipo: this.formFields.periodo.value,
          },
          estado: this.formFields.activo.value
            ? EstadoEntidad.Activo
            : EstadoEntidad.Inactivo,
          actividadTipo: this.actividadesIds,
          checkSateliteActividad:
            this.checkSateliteActividad == null
              ? false
              : this.checkSateliteActividad,
          checkHDOPActividad:
            this.checkHDOPActividad == null ? false : this.checkHDOPActividad,
          checkLongYLatActividad:
            this.checkLongYLatActividad == null
              ? false
              : this.checkLongYLatActividad,
          checkDatoValidoActividad:
            this.checkDatoValidoActividad == null
              ? false
              : this.checkDatoValidoActividad,
          checkResumenDetalle:
            this.checkResumenDetalle == null ? false : this.checkResumenDetalle,
          checkAgruparDiaDetalle:
            this.checkAgruparDiaDetalle == null
              ? false
              : this.checkAgruparDiaDetalle,
          checkResumenSitio:
            this.checkResumenSitio == null ? false : this.checkResumenSitio,
          checkTodoTipoSitio:
            this.checkTodoTipoEventoSitio == null
              ? false
              : this.checkTodoTipoEventoSitio,

          checkSateliteTemperatura:
            this.checkSateliteTemperatura == null
              ? false
              : this.checkSateliteTemperatura,
          checkHDOPTemperatura:
            this.checkHDOPTemperatura == null
              ? false
              : this.checkHDOPTemperatura,
          checkLongYLatTemperatura:
            this.checkLongYLatTemperatura == null
              ? false
              : this.checkLongYLatTemperatura,
          zonas: this.zonasIds,
          minimoDiasDetencion: this.minimoDiasDetencion,
          minimoTiempo: this.minimoTiempo,
          velocidadMaxima: this.velocidadMaxima,
          planMantenimiento: this.planesMantenimientoIds,
          clienteProveedores: this.infoClientesProveedorIds,
          descargas: this.infoDescargasIds,
          zonasNombre: this.sitiosSeleccionados,
          actividadesTiposNombre: this.actividadesTipos,
          tipoZona: this.typeZone,
          precisionHdop: this.precisionGps ? this.precisionHdop : '0',
          precisionSatelites: this.precisionGps ? this.precisionSatelites : '0',
          tiempoDetencion:
            Number(this.detentionDays) * 86400 +
            Number(this.detentionHours) * 3600 +
            Number(this.detentionMinutes) * 60,
          diasDetencion: this.detentionDays,
          horasDetencion: this.detentionHours,
          minutosDetencion: this.detentionMinutes,
          alertaBaseId: this.alertaBaseId,
          alertaBaseCliente: this.alertaBaseCliente,
          columnasOcultas: this.hiddenColumns,
          columnasOcultasAlertas: this.formsFieldcheckAlerta,
          limiteVelocidad: this.txtLimiteVelocidad,
          mostrarSitioDetencion: this.showSiteDetention,
          mostrarSitioDetalleViaje: this.formsFieldSitio,
          mostrarEtiquetasEVS: this.mostrarEtiqueta,
          proveedores: this.selectionProveedor,
          semaforo: {
            verde: parseInt(this.verde.toString()),
            amarillo: parseInt(this.amarillo.toString()),
            rojo: parseInt(this.rojo.toString()),
          },
        } as ProgramacionInforme,
      },
      this
    );
  }

  async registerFilters(filters: any, tipoInforme: number) {
    //Actividades
    if (filters.hasOwnProperty('hidden_columns') && tipoInforme == 1) {
      this.hiddenColumns = filters.hidden_columns;
    }
    let countPrecision: number = 0;
    //Exceso_velocidad
    if (filters.hasOwnProperty('speed_limit')) {
      this.txtLimiteVelocidad = filters.speed_limit;
    }
    if (filters.hasOwnProperty('satelites')) {
      this.precisionSatelites = filters.satelites;
      if (filters.satelites != '0') {
        countPrecision += 1;
      }
    }

    if (filters.hasOwnProperty('hdop')) {
      this.precisionHdop = filters.hdop;
      if (filters.hdop != '0') {
        countPrecision += 1;
      }
    }

    this.precisionGps = countPrecision > 0 ? true : false;

    //Detencion
    if (filters.hasOwnProperty('hidden_columns') && tipoInforme == 15) {
      if (filters.hidden_columns.includes('sitio')) {
        this.showSiteDetention = true;
      } else {
        this.showSiteDetention = false;
      }
    }
    if (filters.hasOwnProperty('days_detention_time')) {
      this.detentionDays = filters.days_detention_time;
    }
    if (filters.hasOwnProperty('hours_detention_time')) {
      this.detentionHours = filters.hours_detention_time;
    }
    if (filters.hasOwnProperty('minutes_detention_time')) {
      this.detentionMinutes = filters.minutes_detention_time;
    }
    //Alertas
    if (filters.hasOwnProperty('alertaBaseCliente')) {
      var listArray: number[] = [];
      const resultArray = await Promise.all(
        filters.alertaBaseCliente.map(async (i: any) =>
          listArray.push(Number(i))
        )
      ).then(() => {
        this.alertaBaseCliente = listArray;
      });
    }
    if (filters.hasOwnProperty('alertaBaseId')) {
      this.alertaBaseId = filters.alertaBaseId;
    }
    if (filters.hasOwnProperty('hidden_columns') && tipoInforme == 13) {
      this.formsFieldcheckAlerta = filters.hidden_columns;
    }
    //Detalle_viaje
    if (filters.hasOwnProperty('summary')) {
      this.formsFieldSitio = filters.summary;
    }
    //Exceso_velocidad_sitio
    if (filters.hasOwnProperty('hidden_columns') && tipoInforme == 16) {
      if (filters.hidden_columns.includes('etiqueta')) {
        this.mostrarEtiqueta = true;
      } else {
        this.mostrarEtiqueta = false;
      }
    }
    //Zonas
    if (filters.hasOwnProperty('zones')) {
      this.sitiosSeleccionados = filters.zones;
      //console.log(filters.zones);
    }
    if (filters.hasOwnProperty('type_zone')) {
      this.typeZone = filters.type_zone;
    }
  }

  @Watch('formFields.tipoInforme.value')
  onTipoInformeChanged() {
    const informeSeleccionado: any[] = this.formFields.tipoInforme.items.filter(
      (x: any) => x.id == this.formFields.tipoInforme.value
    );
    if (informeSeleccionado.length == 1) {
      this.nombreServicioInforme = informeSeleccionado[0].nombreServicio;
    }
  }

  @Watch('informeProgramadoSeleccionado', { deep: true, immediate: true })
  async handleinformeProgramadoSeleccionadoChange() {
    if (this.informeProgramadoSeleccionado != undefined) {
      const jsonObj = JSON.parse(
        this.informeProgramadoSeleccionado.filtrosAdicionales
      );
      this.registerFilters(
        jsonObj,
        this.informeProgramadoSeleccionado.tipoInformeId
      );
    }
    if (this.informeProgramadoSeleccionado) {
      const {
        activo,
        nombreInforme,
        tipoInforme,
        formato,
        periodo,
        horaDesde,
        horaHasta,
        fechaDesde,
        fechaHasta,
        multiploPeriodo,
      } = this.formFields;

      activo.value = this.informeProgramadoSeleccionado.estado;
      nombreInforme.value = this.informeProgramadoSeleccionado.nombre;
      tipoInforme.value = this.informeProgramadoSeleccionado.tipoInformeId;

      periodo.value = this.informeProgramadoSeleccionado.periodo.tipo;
      horaDesde.value = this.informeProgramadoSeleccionado.periodo.horaDesde;
      horaHasta.value = this.informeProgramadoSeleccionado.periodo.horaHasta;
      if (this.informeProgramadoSeleccionado.periodo.tipo !== 1) {
        switch (this.informeProgramadoSeleccionado.periodo.tipo) {
          case 2:
            multiploPeriodo.value = this.informeProgramadoSeleccionado.periodo.multiploDias;
            break;
          case 3:
            multiploPeriodo.value = this.informeProgramadoSeleccionado.periodo.multiploSemanas;
            break;
          case 4:
            multiploPeriodo.value = this.informeProgramadoSeleccionado.periodo.multiploMes;
            break;
          default:
            break;
        }
      } else {
        fechaDesde.value = moment(
          this.informeProgramadoSeleccionado.periodo.periodoDesde
        );
        fechaHasta.value = moment(
          this.informeProgramadoSeleccionado.periodo.periodoHasta
        );
      }

      //formato
      this.formatoInformeProgramado = this.informeProgramadoSeleccionado.formato;

      //filtro
      this.filtro = this.informeProgramadoSeleccionado.filtros;

      //planes
      this.planesManteniminetoAsignados = this.informeProgramadoSeleccionado.planMantenimientos;

      //actividades
      this.actividadesAsignados = this.informeProgramadoSeleccionado.actividades;

      //zonas
      this.zonasAsignadas = this.informeProgramadoSeleccionado.zonas;

      //InformeDescargas
      this.infoDescargasAsignados = this.informeProgramadoSeleccionado.descargas.map(
        x => ({
          id: x.descargaId,
          estado: x.estado,
          descargaId: x.descargaId,
          nombre: x.proveedorNombre + '_' + x.clienteProveedorNombre,
        })
      );
      this.infoProveedorAsignados = this.informeProgramadoSeleccionado.proveedores.map(
        x => ({
          id: x.proveedorId,
          estado: x.estado,
          proveedorId: x.proveedorId,
          nombre: x.nombre,
        })
      );
      this.infoClientesProveedorAsignados = this.informeProgramadoSeleccionado.clienteProveedores.map(
        x => ({
          id: x.clienteProveedorId,
          estado: x.estado,
          clienteProveedorId: x.clienteProveedorId,
          nombre: x.nombre,
        })
      );

      this.changeTipoInformeV2();

      //Vehiculos
      if (this.esMantenimiento && this.accion !== 3) {
        this.informeProgramadoSeleccionado.vehiculos.forEach(x => {
          this.vehiculosSeleccionadosMantenimiento.push(x.vehiculoId);
        });
      } else {
        this.informeProgramadoSeleccionado.vehiculos.forEach(x => {
          this.vehiculosSeleccionados.push(x.vehiculoId);
        });
      }
    }
  }

  async changeTipoInformeV2() {
    var self = this;
    setTimeout(() => {
      self.changeTipoInforme();
    }, 200);
  }

  changeTipoInforme() {
    if (
      this.nombreServicioInforme === 'mantenimientos_vencidos' ||
      this.nombreServicioInforme === 'vehiculos_diarios' ||
      this.nombreServicioInforme === 'estado_mantenimiento'
    ) {
      this.esMantenimiento = true;
    } else {
      this.esMantenimiento = false;
    }

    if (this.nombreServicioInforme === 'descargas') {
      this.esDescargas = true;
    } else {
      this.esDescargas = false;
    }
    if (this.nombreServicioInforme === 'geotec') {
      this.esGeotec = true;
    } else {
      this.esGeotec = false;
    }
  }

  handleAsociacionesChange(event: any) {
    this.vehiculos = event.vehiculos.map((x: any) => x.id);
    this.emitFormChange();
  }

  /*life  cycle*/

  created() {
    this.cargarListasDesplegables();

    InformeEventBus.$on('tipoAlertaCliente', (info: number) => {
      this.alertaBaseCliente = info;
      this.emitFormChange();
    });
    InformeEventBus.$on('tipoAlerta', (info: number) => {
      this.alertaBaseId = info;
      this.emitFormChange();
    });
    InformeEventBus.$on('checkAlerta', (checkAlerta: any) => {
      this.formsFieldcheckAlerta = checkAlerta;
      this.emitFormChange();
    });

    InformeEventBus.$on('selectionProveedor', (selectionProveedor: string) => {
      this.selectionProveedor = selectionProveedor;
      this.emitFormChange();
    });

    InformeEventBus.$on('valideFilters', (valide: boolean) => {
      InformeEventBus.$emit('valides', valide);
      //this.alertaBaseCliente = info;
    });

    InformeEventBus.$on('txtLimiteVelocidad', (txtLimiteVelocidad: string) => {
      this.txtLimiteVelocidad = parseInt(txtLimiteVelocidad);
      this.emitFormChange();
    });

    InformeEventBus.$on('selectionSitio', (selectionSitio: any[]) => {
      this.sitiosSeleccionados = selectionSitio.map(x => x.nombre);
      this.emitFormChange();
    });

    InformeEventBus.$on('typeZone', (info: string) => {
      this.typeZone = info;
      this.emitFormChange();
    });

    InformeEventBus.$on('precisionGps', (info: boolean) => {
      this.precisionGps = info;
      this.emitFormChange();
    });

    InformeEventBus.$on('precisionHdop', (info: string) => {
      this.precisionHdop = info;
      this.emitFormChange();
    });
    InformeEventBus.$on('precisionSatelites', (info: string) => {
      this.precisionSatelites = info;
      this.emitFormChange();
    });
    InformeEventBus.$on('validatePrecisionHdop', (info: boolean) => {
      this.hdopValidado = info;
    });
    InformeEventBus.$on('validatePrecisionSatelite', (info: boolean) => {
      this.sateliteValidado = info;
    });
    InformeEventBus.$on('checkSoloResumen', (selectionSitio: boolean) => {
      this.formsFieldSitio = selectionSitio;
      this.emitFormChange();
    });
  }

  async cargarListasDesplegables() {
    let url = new URL(window.location.href);
    if (url.pathname.includes('torre-control')) {
      await this.axiosPostgres.http
        .post(`Metabase/PostgenericA/torre_control/getReportType`, {})
        .then((response: any) => {
          if (response.data.CODIGO_RESPUESTA == '1') {
            this.formFields.tipoInforme.items = response.data.data;
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
            this.formFields.tipoInforme.items = [];
          }
        })
        .catch((error: any) => {
          console.log(error);
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener la lista de tipos de informe'
          );
          this.formFields.tipoInforme.items = [];
        })
        .finally(() => this.loadingService.hideLoading());
      this.onTipoInformeChanged();
    } else {
      this.formFields.tipoInforme.items = (await this.fetchTipoInforme()) || [];
      this.onTipoInformeChanged();
    }
  }

  /*Util */

  async fetchTipoInforme() {
    this.loadingService.showLoading();
    return fetchTipoInformeProgramacion()
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la lista de tipos de informe'
        );
        return [];
      })
      .finally(() => this.loadingService.hideLoading());
  }

  validarNombreProgramacion(nombre: string) {
    let axios = new AxiosVue(ServicioProxy.Metabase);
    const id =
      this.informeProgramadoSeleccionado === undefined
        ? 0
        : this.informeProgramadoSeleccionado.id;
    return axios.http.get(
      `InformeProgramado/ChequearNombreUnico/${id}/${nombre}/`
    );
  }
}
</script>

<style scoped>
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

<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer :titulo="tituloModal">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  persistent-hint
                  @change="cambioEstadoSwitch"
                  :hint="mensajeEstado"
                  :readonly="modoVer"
                />
              </v-flex>

              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.serie.label"
                  :color="'success'"
                  v-model="formFields.serie.value"
                  persistent-hint
                  @change="cambioEstadoSerieSwitch"
                  :hint="mensajeEstadoSerie"
                  :readonly="modoVer"
                  :disabled="soloLectura"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.gps.label"
                  :color="'success'"
                  v-model="formFields.gps.value"
                  persistent-hint
                  @change="cambioEstadoGpsSwitch"
                  :hint="mensajeEstadoGps"
                  :readonly="modoVer"
                  :disabled="soloLectura"
                />
              </v-flex>
              <v-divider inset></v-divider>

              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.vehiculo.label"
                  :color="'success'"
                  v-model="formFields.vehiculo.value"
                  persistent-hint
                  @change="cambioEstadoVehiculoSwitch"
                  :hint="mensajeEstadoVehiculo"
                  :readonly="modoVer"
                />
              </v-flex>

              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.marca.label"
                  :color="'success'"
                  v-model="formFields.marca.value"
                  persistent-hint
                  @change="cambioEstadoMarcaSwitch"
                  :hint="mensajeEstadoMarca"
                  :readonly="modoVer"
                  :disabled="soloLecturaVehiculo"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.modelo.label"
                  :color="'success'"
                  v-model="formFields.modelo.value"
                  persistent-hint
                  @change="cambioEstadoModeloSwitch"
                  :hint="mensajeEstadoModelo"
                  :readonly="modoVer"
                  :disabled="soloLecturaVehiculo"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.anio.label"
                  :color="'success'"
                  v-model="formFields.anio.value"
                  persistent-hint
                  @change="cambioEstadoAnioSwitch"
                  :hint="mensajeEstadoAnio"
                  :readonly="modoVer"
                  :disabled="soloLecturaVehiculo"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.tipo.label"
                  :color="'success'"
                  v-model="formFields.tipo.value"
                  persistent-hint
                  @change="cambioEstadoTipoSwitch"
                  :hint="mensajeEstadoTipo"
                  :readonly="modoVer"
                  :disabled="soloLecturaVehiculo"
                />
              </v-flex>

              <!-- <v-flex xs12 sm12 md12>
                <v-autocomplete
                  :label="formFields.color.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.color.id)"
                  :data-vv-name="formFields.color.id"
                  v-model="formFields.color.value"
                  item-value="title"
                  item-text="title"
                  no-data-text="Sin resultados"
                  :items="colores"
                  class="styled-select"
                  :disabled="modoVer"
                >
                  <template v-slot:selection="data">
                    <v-avatar :color="data.item.icon" size="20"></v-avatar>
                    &nbsp;{{ data.item.title }}
                  </template>
                  <template v-slot:item="data">
                    <template v-if="typeof data.item !== 'object'">
                      <v-list-tile-content
                        v-text="data.item"
                      ></v-list-tile-content>
                    </template>
                    <template v-else>
                      <v-list-tile-avatar
                        :color="data.item.icon"
                      ></v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title
                          v-html="data.item.title"
                        ></v-list-tile-title>
                      </v-list-tile-content>
                    </template>
                  </template>
                </v-autocomplete>
              </v-flex> -->
            </FormFieldsContainer>

            <v-layout
              row
              wrap
              v-show="
                muestraAlertaMantencionPorVencer ||
                  muestraAlertaMantencionVencida
              "
            >
              <v-flex sm12 md6>
                <BuscadorOperacionCrud
                  :filter="
                    gridApiPlanes &&
                      gridApiPlanes.setQuickFilter.bind(gridApiPlanes)
                  "
                />
              </v-flex>
              <!-- <v-flex sm12 md12>
                <div align="left">
                  <MantenedorGridVerDetalle
                    v-if="modoVer"
                    :grid-options="gridOptionsPlanes"
                    :row-data="planes"
                  />
                  <AsociacionGrid
                    v-else
                    :grid-options="gridOptionsPlanes"
                    :row-data="planes"
                    :esEditar="!alertaSeleccionada ? false : true"
                  />
                </div>
              </v-flex> -->
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoAlertaBase } from '@/config/enums';
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import {
  emitFormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { EstadoEntidad } from '../../config/enums';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';

import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  CellClickedEvent,
  ValueGetterParams,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

import moment from 'moment';
import { intersectionBy } from 'lodash';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import NumericEditor from '@/reusable/Grid/Editors/NumericEditor.vue';
import Buscador from '@/reusable/Grid/Buscador.vue';
import CampoUnico from '@/reusable/Form/CampoUnico.vue';
import { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';

import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import {
  CertificadoBaseBackend,
  TiposCertificadosBackend,
  Gps,
  CertificadoBaseCliente,
} from './ConfiguracionBase';
import { fetchTiposCertificados } from '@/pantallas/CertificadosBase/fetchTiposCertificados';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    DatePicker,
    MantenedorGrid,
    Buscador,
    CampoUnico,
    MantenedorGridVerDetalle,
    AsociacionGrid,
    BuscadorOperacionCrud,
  },
})
export default class ConfigurarCertificadoFormGps extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: 'Datos Gps & Vehículo' }) tituloModal: boolean;
  @Prop() certificadoSeleccionado: CertificadoBaseCliente;

  isFormValid: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Comercial);
  readonly $snotify: Snotify;
  loadingService = new LoadingService();
  uniqueFieldRule = uniqueFieldRule;

  mensajeEstado: string = '';
  mensajeEstadoSerie: string = '';
  mensajeEstadoGps: string = '';
  mensajeEstadoVehiculo: string = '';
  mensajeEstadoMarca: string = '';
  mensajeEstadoModelo: string = '';
  mensajeEstadoAnio: string = '';
  mensajeEstadoTipo: string = '';

  nombre: string = '';
  maximoTiempo: number = 12;

  muestraAlertaGenerica: boolean = false;
  muestraAlertaZona: boolean = false;
  muestraAlertaRuta: boolean = false;
  muestraAlertaUsoNoAutorizado: boolean = false;
  muestraAlertaDetencionNoAutorizada: boolean = false;
  muestraAlertaMantencionVencida: boolean = false;
  muestraAlertaMantencionPorVencer: boolean = false;

  soloLectura: boolean = false;
  soloLecturaVehiculo: boolean = false;

  showEventos: boolean = true;
  showTemporalidad: boolean = true;

  esAcumulable: boolean = false;
  deshabilitaParametrosGenerales: boolean = false;
  deshabilitaDetencionVelocidad: boolean = true;

  gridApiZonas: GridApi = null;
  gridApiZonasRutas: GridApi = null;
  gridApiZonasDetencion: GridApi = null;
  gridApiPlanes: GridApi = null;

  idsPlanesSeleccionados: number[] = [];

  lstTipoCertificados: TiposCertificadosBackend[] = [];
  lstTipoCertificadosFiltro: TiposCertificadosBackend[] = [];

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: false,
    },
    serie: {
      label: 'Activo',
      id: 'serie',
      value: false,
    },
    gps: {
      label: 'Tipo Gps',
      id: 'gps',
      value: false,
    },
    vehiculo: {
      label: 'Vehículo',
      id: 'vehiculo',
      value: false,
    },
    marca: {
      label: 'Marca',
      id: 'marca',
      value: false,
    },
    modelo: {
      label: 'Modelo',
      id: 'modelo',
      value: false,
    },
    anio: {
      label: 'Año',
      id: 'anio',
      value: false,
    },
    tipo: {
      label: 'Tipo Vehículo',
      id: 'tipo',
      value: false,
    },
  };

  mounted() {
    this.handleFormGpsChange();
    this.handleFormGps(this.formFields);
    this.handleCertificadoSeleccionadoChange();
  }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje = '* El valor debe ser mayor a 0';

    this.$validator.localize('es', validator);
    this.handleFormGpsChange();
    this.handleFormGps(this.formFields);
    this.handleCertificadoSeleccionadoChange();
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo
      ? 'Incluir Datos GPS'
      : 'Ocultar Datos GPS';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrarán los datos de GPS.';
    this.soloLectura = isActivo ? false : true;
    this.handleSerieChange(isActivo);
    this.handleGpsChange(isActivo);
  }

  @Watch('formFields.serie.value', { immediate: true })
  handleSerieChange(isActivo: boolean) {
    this.formFields.serie.label = isActivo ? 'Serie GPS' : 'Serie GPS';
    this.mensajeEstadoSerie = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará la serie del GPS.';
  }

  @Watch('formFields.gps.value', { immediate: true })
  handleGpsChange(isActivo: boolean) {
    this.formFields.gps.label = isActivo ? 'Tipo GPS' : 'Tipo GPS';
    this.mensajeEstadoGps = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará el tipo de GPS.';
  }

  @Watch('formFields.marca.value', { immediate: true })
  handleMarcaChange(isActivo: boolean) {
    this.formFields.marca.label = isActivo ? 'Marca' : 'Marca';
    this.mensajeEstadoMarca = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará la marca del vehículo.';
  }
  @Watch('formFields.modelo.value', { immediate: true })
  handleModeloChange(isActivo: boolean) {
    this.formFields.modelo.label = isActivo ? 'Modelo' : 'Modelo';
    this.mensajeEstadoModelo = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará el modelo del vehículo.';
  }
  @Watch('formFields.anio.value', { immediate: true })
  handleAnioChange(isActivo: boolean) {
    this.formFields.anio.label = isActivo ? 'Año' : 'Año';
    this.mensajeEstadoAnio = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará el año del vehículo.';
  }
  @Watch('formFields.tipo.value', { immediate: true })
  handleTipoChange(isActivo: boolean) {
    this.formFields.tipo.label = isActivo ? 'Tipo Vehículo' : 'Tipo Vehículo';
    this.mensajeEstadoTipo = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará el tipo de vehículo.';
  }

  @Watch('formFields.vehiculo.value', { immediate: true })
  handleVehiculoChange(isActivo: boolean) {
    this.formFields.vehiculo.label = isActivo
      ? 'Incluir Datos Vehículo'
      : 'Ocultar Datos Vehículo';
    this.mensajeEstadoVehiculo = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrarán los datos del vehículo.';
    this.soloLecturaVehiculo = isActivo ? false : true;
    this.handleMarcaChange(isActivo);
    this.handleModeloChange(isActivo);
    this.handleAnioChange(isActivo);
    this.handleTipoChange(isActivo);
  }

  // @Watch('formFields', { deep: true })
  // handleFormGpsChange(fields: FormFieldDefMap) {
  //   //this.InformacionVehiculo.visible = fields.activo.value == 'true'?true:false;
  //   this.$emit('handleFormGpsChange', fields); // tiene el nombre del objeto a quien le devuelve el valor
  //  //this.$emit('handleFormGpsChange', this.JsonGps);
  // }

  @Watch('formFields', { deep: true })
  handleFormGpsChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        datosGps: this.formFields.activo.value,
        serieGps: this.formFields.serie.value,
        tipoGps: this.formFields.gps.value,
        datosVehiculo: this.formFields.vehiculo.value,
        marca: this.formFields.marca.value,
        modelo: this.formFields.modelo.value,
        anio: this.formFields.anio.value,
        tipovehiculo: this.formFields.tipo.value,
      } as Gps,
      //validator: this.$validator,
      //isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  @Watch('formFields', { deep: true })
  handleFormGps(fields: FormFieldDefMap) {
    const { formFields } = this;
    const gps = {
      datosGps: this.formFields.activo.value,
      serieGps: this.formFields.serie.value,
      tipoGps: this.formFields.gps.value,
      datosVehiculo: this.formFields.vehiculo.value,
      marca: this.formFields.marca.value,
      modelo: this.formFields.modelo.value,
      anio: this.formFields.anio.value,
      tipovehiculo: this.formFields.tipo.value,
    };
    this.$emit('handleFormGps', gps); // tiene el nombre del objeto a quien le devuelve el valor
  }

  @Watch('certificadoSeleccionado', { deep: true })
  handleCertificadoSeleccionadoChange() {
    if (this.certificadoSeleccionado) {
      this.formFields.activo.value = this.certificadoSeleccionado.contenido.informacionVehiculo.visible;
      this.formFields.serie.value = this.certificadoSeleccionado.contenido.informacionGps.serie.visible;
      this.formFields.gps.value = this.certificadoSeleccionado.contenido.informacionGps.tipoGps.visible;
      this.formFields.tipo.value = this.certificadoSeleccionado.contenido.informacionVehiculo.tipoVehiculo.visible;
      this.formFields.vehiculo.value = this.certificadoSeleccionado.contenido.informacionVehiculo.visible;
      this.formFields.marca.value = this.certificadoSeleccionado.contenido.informacionVehiculo.marca.visible;
      this.formFields.modelo.value = this.certificadoSeleccionado.contenido.informacionVehiculo.modelo.visible;
      this.formFields.anio.value = this.certificadoSeleccionado.contenido.informacionVehiculo.anio.visible;
    }
  }

  // @Watch('formFields', { deep: true })
  // handleFormGpsChange(fields: FormFieldDefMap) {

  //   emitFormChangeEvent(this.$emit.bind(this), {
  //     entity: {
  //       datosGps: fields.activo.value,
  //       serieGps: fields.serie.value,
  //       tipoGps: fields.gps.value,
  //       datosVehiculo: fields.vehiculo.value,
  //       marca: fields.marca.value,
  //       modelo: fields.modelo.value,
  //       anio: fields.anio.value,
  //       tipovehiculo: fields.tipo.value,
  //     }as Gps,
  //   });
  // }

  //   emitFormChangeEvent(
  //     this.$emit.bind(this),
  //     {

  //     this
  //   );
  // }

  // @Watch('formFields', { deep: true })
  // handleFormChange(fields: FormFieldDefMap) {
  //   emitFormChangeEvent(
  //     this.$emit.bind(this),
  //     {
  //       entity: this.setAlertaBackend(),
  //     },
  //     this
  //   );
  // }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    //this.handleFormChange(this.formFields);
  }

  // setAlertaBackend(): AlertaBackend {
  //   var fields = this.formFields;

  //   var alerta: AlertaBackend = {
  //     nombre: fields.nombre.value.toString(),
  //     alertaBaseId: Number(fields.tipo.value),
  //     color: fields.color.value.toString(),
  //     estado: fields.activo.value
  //       ? EstadoEntidad.Activo
  //       : EstadoEntidad.Inactivo,
  //   };

  //   alerta.parametroGeneral = Boolean(fields.parametrosGenerales.value);

  //   alerta.velMax = Number(fields.velocidad.value);
  //   alerta.tolerancia = Number(fields.tolerancia.value);

  //   alerta.eventos = Number(fields.eventos.value);
  //   alerta.temporalidad = Number(fields.temporalidad.value);
  //   //if (this.esAcumulable) {
  //   //alerta.eventos = Number(fields.eventos.value);
  //   //alerta.temporalidad = Number(fields.temporalidad.value);
  //   //}

  //   return alerta;
  // }

  cambioEstadoSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.activo.label = 'Incluir Datos GPS';
      this.mensajeEstado = '';
    } else {
      this.formFields.activo.label = 'Ocultar Datos GPS';
      this.soloLectura = isActivo;
      this.mensajeEstado =
        'Al dejar como inactivo, no se mostrarán los datos de GPS.';
    }
  }

  cambioEstadoSerieSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.serie.label = 'Serie GPS';
      this.mensajeEstadoSerie = '';
    } else {
      this.formFields.serie.label = 'Serie GPS';
      this.mensajeEstadoSerie =
        'Al dejar como inactivo, no se mostrarán los datos de Serie GPS.';
    }
  }
  cambioEstadoGpsSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.gps.label = 'Tipo GPS';
      this.mensajeEstadoGps = '';
    } else {
      this.formFields.gps.label = 'Tipo GPS';
      this.mensajeEstadoGps =
        'Al dejar como inactivo, no se mostrarán los datos del Tipo GPS.';
    }
  }

  cambioEstadoVehiculoSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.vehiculo.label = 'Incluir Datos Vehículo';
      this.mensajeEstadoVehiculo = '';
    } else {
      this.formFields.vehiculo.label = 'Ocultar Datos Vehículo';
      this.soloLecturaVehiculo = isActivo;
      this.mensajeEstadoVehiculo =
        'Al dejar como inactivo, no se mostrarán los datos del vehículo.';
    }
  }

  cambioEstadoMarcaSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.marca.label = 'Serie GPS';
      this.mensajeEstadoMarca = '';
    } else {
      this.formFields.marca.label = 'Serie GPS';
      this.mensajeEstadoMarca =
        'Al dejar como inactivo, no se mostrarán los datos de Serie GPS.';
    }
  }
  cambioEstadoModeloSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.modelo.label = 'Serie GPS';
      this.mensajeEstadoModelo = '';
    } else {
      this.formFields.modelo.label = 'Serie GPS';
      this.mensajeEstadoModelo =
        'Al dejar como inactivo, no se mostrarán los datos de Serie GPS.';
    }
  }
  cambioEstadoAnioSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.anio.label = 'Serie GPS';
      this.mensajeEstadoAnio = '';
    } else {
      this.formFields.anio.label = 'Serie GPS';
      this.mensajeEstadoAnio =
        'Al dejar como inactivo, no se mostrarán los datos de Serie GPS.';
    }
  }
  cambioEstadoTipoSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.tipo.label = 'Serie GPS';
      this.mensajeEstadoTipo = '';
    } else {
      this.formFields.tipo.label = 'Serie GPS';
      this.mensajeEstadoTipo =
        'Al dejar como inactivo, no se mostrarán los datos de Serie GPS.';
    }
  }

  async fetchTiposCertificados() {
    this.loadingService.showLoading();
    return fetchTiposCertificados()
      .then(res => {
        this.lstTipoCertificados = res;

        // this.lstTipoCertificados.push({
        //   id: 0,
        //   nombre: 'Todos',
        // });
        res.forEach(a => {
          this.lstTipoCertificadosFiltro.push(a);
        });
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de Certificados',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  tipo: number = 0;
  isExternalFilterPresent() {
    return this.tipo != 0;
  }

  doesExternalFilterPass(node: any) {
    return node.data.tipoZonaId == this.tipo;
  }

  /* Alerta Zona */

  /* Alerta ruta */

  handleFilterInputNumber(event: KeyboardEvent) {
    return event.keyCode === 8
      ? true
      : isNaN(Number(event.key))
      ? event.preventDefault()
      : false;
  }
}
</script>
<style scoped>
#tDiasHoras {
  border-collapse: collapse;
  width: 100%;
}

#tDiasHoras td,
#tDiasHoras th {
  border: 1px solid #ddd;
  padding: 8px;
  font-weight: 500;
}

#tDiasHoras tr:nth-child(even) {
  background-color: #f2f2f2;
}

.selecciona {
  background-color: rgb(12, 3, 131);
}

#tDiasHoras th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.54);
}
</style>

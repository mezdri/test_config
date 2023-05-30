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
              <v-flex xs12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombre.label"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  counter="80"
                  :disabled="modoVer"
                  :validate="validarNombre"
                  message="Ya existe un Certificado con este nombre"
                ></CampoUnico>
              </v-flex>

              <v-flex xs6 sm6 md6>
                <v-select
                  :label="formFields.tipo.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.tipo.id)"
                  :data-vv-name="formFields.tipo.id"
                  v-model="formFields.tipo.value"
                  :items="lstTipoCertificados"
                  @change="handlerChangeTipo"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-select
                  :label="formFields.firma.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.firma.id)"
                  :data-vv-name="formFields.firma.id"
                  v-model="formFields.firma.value"
                  :items="lstFirmaCertificados"
                  @change="handlerChangeFirma"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.expiracion.label"
                  :color="'success'"
                  v-model="formFields.expiracion.value"
                  persistent-hint
                  @change="cambioEstadoExpiracion"
                  :hint="mensajeEstadoExpiracion"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-switch
                  :label="formFields.qr.label"
                  :color="'success'"
                  v-model="formFields.qr.value"
                  persistent-hint
                  @change="cambioEstadoQr"
                  :hint="mensajeEstadoQr"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <img
                  :src="imageUrl"
                  height="83"
                  v-if="imageUrl"
                  alt="Logo Tercero"
                />
                <v-text-field
                  label="Seleccione Logo Mandante."
                  heigh
                  @click="$refs.image.click()"
                  v-model="imageName"
                  prepend-icon="attach_file"
                  readonly="readonly"
                ></v-text-field>
                <input
                  type="file"
                  style="display: none"
                  ref="image"
                  accept="image/png, image/jpeg"
                  @change="onFilePicked"
                  :key="idkey"
                  :readonly="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
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
  FirmasCertificadosBackend,
  CertificadoBaseCliente,
} from './ConfiguracionBase';
import { fetchTiposCertificados } from '@/pantallas/CertificadosBase/fetchTiposCertificados';
import { fetchFirmasCertificados } from '@/pantallas/CertificadosBase/fetchFirmasCertificados';

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
export default class ConfigurarCertificadoForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: false }) lstCertificadosBase: CertificadoBaseBackend[];
  @Prop() certificadoSeleccionado: CertificadoBaseCliente;
  //@Prop({ required: true }) lstTiposCertificados: TiposCertificadosBackend[];

  @Prop({ default: 'Configurar Certificado' }) tituloModal: boolean;

  isFormValid: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Comercial);
  readonly $snotify: Snotify;
  loadingService = new LoadingService();
  uniqueFieldRule = uniqueFieldRule;

  mensajeEstado: string = '';
  mensajeEstadoExpiracion: string = '';
  mensajeEstadoQr: string = '';
  nombre: string = '';
  maximoTiempo: number = 12;

  imageName: any = null;
  imageUrl: any = null;
  imageFile: any = null;
  FormDataSeleccionado: FormData;
  idkey: number = 0;

  muestraAlertaGenerica: boolean = false;
  muestraAlertaZona: boolean = false;
  muestraAlertaRuta: boolean = false;
  muestraAlertaUsoNoAutorizado: boolean = false;
  muestraAlertaDetencionNoAutorizada: boolean = false;
  muestraAlertaMantencionVencida: boolean = false;
  muestraAlertaMantencionPorVencer: boolean = false;

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

  lstFirmaCertificados: FirmasCertificadosBackend[] = [];
  lstFirmaCertificadosFiltro: FirmasCertificadosBackend[] = [];

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    tipo: {
      label: 'Título Certificado',
      id: 'tipo',
      value: '',
    },
    firma: {
      label: 'Firma Certificado',
      id: 'firma',
      value: '',
    },
    expiracion: {
      label: 'Mostrar fecha de Expiración',
      id: 'expiracion',
      value: true,
    },
    qr: {
      label: 'Mostrar QR',
      id: 'qr',
      value: true,
    },
    logoTercero: {
      label: 'Logo Tercero',
      id: 'logo',
      value: '',
    },
  };

  mounted() {
    this.registrarValidadores();
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.fetchTiposCertificados();
    this.fetchFirmasCertificados();
    this.handleCertificadoSeleccionadoChange();
  }

  // mounted() {
  //   this.fetchTiposCertificados();
  //   this.fetchFirmasCertificados();
  // }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje = '* El valor debe ser mayor a 0';

    // validator.custom.velocidad.min_value = mensaje;
    // validator.custom.velocidad.integer = '* Valor debe ser numérico';
    // validator.custom.eventos.min_value = mensaje;
    // validator.custom.temporalidad.min_value = mensaje;
    // validator.custom.horasMotor.min_value = mensaje;
    // validator.custom.kilometros.min_value = mensaje;
    // validator.custom.tiempo.min_value = mensaje;
    // validator.custom.tiempoDetencion.min_value = mensaje;

    this.$validator.localize('es', validator);
    this.registrarValidadores();
    this.handleCertificadoSeleccionadoChange();
  }

  registrarValidadores() {}

  validaTemporalidadDetencion(temporalidad: string, tiempoDetencion: string) {
    if (!temporalidad || !tiempoDetencion) {
      return true;
    }

    var temporalidadInt = parseInt(temporalidad);
    var tiempoDetencionInt = parseInt(tiempoDetencion);

    return temporalidadInt > tiempoDetencionInt;
  }

  validarNombre(nombre: string) {
    
    var id =
      this.certificadoSeleccionado != null
        ? this.certificadoSeleccionado.id
        : 0;
    //var id = 0;
    return this.axios.http.get(`CertificadosBase/${id}/${nombre}/NombreUnico`);
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará este certificado.';
  }

  @Watch('formFields.qr.value', { immediate: true })
  handleQrChange(isActivo: boolean) {
    this.formFields.qr.label = isActivo
      ? 'Mostrar QR (folio, patente, flota)'
      : 'No mostrar QR';
    this.mensajeEstadoQr = isActivo ? '' : 'No se mostrará este código QR.';
  }

  @Watch('formFields.expiracion.value', { immediate: true })
  handleExpiracionChange(isActivo: boolean) {
    this.formFields.expiracion.label = isActivo
      ? 'Mostrar fecha de Expiración'
      : 'Ocultar fecha de Expiración';
    this.mensajeEstadoExpiracion = isActivo
      ? ''
      : 'Fecha de expiración no se mostrará en el certificado.';
  }
  //
  @Watch('certificadoSeleccionado', { deep: true })
  handleCertificadoSeleccionadoChange() {
    if (this.certificadoSeleccionado) {
      this.formFields.nombre.value = this.certificadoSeleccionado.nombre;
      this.formFields.activo.value = this.certificadoSeleccionado.estado;
      this.formFields.logoTercero.value = this.certificadoSeleccionado.contenido.logoTercero;
      this.imageUrl = this.certificadoSeleccionado.contenido.logoTercero;
      this.formFields.tipo.value = this.certificadoSeleccionado.tipoCertificadoId;
      this.formFields.firma.value = this.certificadoSeleccionado.firmaCertificadoId;
      this.formFields.expiracion.value = this.certificadoSeleccionado.contenido.fechaExpiracion;
      this.formFields.qr.value = this.certificadoSeleccionado.contenido.codigoQr;
    }
  }

  // @Watch('formFields', { deep: true })
  // handleFormChange(fields: FormFieldDefMap) {
  //   emitFormChangeEvent(
  //     this.$emit.bind(this),
  //     {
  //       entity: this.formFields,
  //     },
  //     this
  //   );
  // }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const { formFields } = this;
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: formFields.nombre.value,
          tipoCertificado: formFields.tipo.value,
          firmaCertificado: formFields.firma.value,
          activo: formFields.activo.value,
          expiracion: formFields.expiracion.value,
          qr: formFields.qr.value,
          logoTercero: this.imageUrl,

          //esAcumulable: formFields.esAcumulable.value,
        },
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
  }

  onFilePicked(e: any) {
    var formData = new FormData();

    const files = e.target.files;
    if (files[0] !== undefined) {
      this.imageName = files[0].name;

      if (this.imageName.lastIndexOf('.') <= 0) {
        return;
      }

      const fr = new FileReader();
      fr.readAsDataURL(files[0]);

      fr.addEventListener('load', () => {
        this.imageUrl = fr.result;
        this.imageFile = files[0]; // Este es el Archivo que se envia al server.
        this.$emit('handleLogoTercero', this.imageUrl);
      });

      formData.append('LogoTerceros', files[0]);

      this.FormDataSeleccionado = formData;
    } else {
      this.imageName = null;
      this.imageFile = null;
      this.imageUrl = null;
    }
  }

  cambioEstadoSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.activo.label = 'Activo';
      this.mensajeEstado = '';
    } else {
      this.formFields.activo.label = 'Inactivo';
      this.mensajeEstado =
        'Al dejar como inactivo, no se mostrará este certificado.';
    }
  }

  cambioEstadoExpiracion(isActivo: boolean) {
    if (isActivo) {
      this.formFields.expiracion.label = 'Activo';
      this.mensajeEstadoExpiracion = '';
    } else {
      this.formFields.expiracion.label = 'Inactivo';
      this.mensajeEstadoExpiracion =
        'Fecha de expiración no se mostrará en certificado.';
    }
  }

  cambioEstadoQr(isActivo: boolean) {
    if (isActivo) {
      this.formFields.qr.label = 'Activo';
      this.mensajeEstadoQr = '';
    } else {
      this.formFields.qr.label = 'Inactivo';
      this.mensajeEstadoQr = 'No se mostrará este código QR.';
    }
  }

  handleParametrosGeneralesChange(isActivo: boolean) {
    if (isActivo) {
      this.deshabilitaParametrosGenerales = false;
      this.$emit('changeValidaCamposZonas', true);
    } else {
      this.deshabilitaParametrosGenerales = true;
    }
    this.limpiarParametrosGenerales();

    this.$emit('changeParametroGeneral', isActivo);
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

  async fetchFirmasCertificados() {
    this.loadingService.showLoading();
    return fetchFirmasCertificados()
      .then(res => {
        this.lstFirmaCertificados = res;

        // this.lstTipoCertificados.push({
        //   id: 0,
        //   nombre: 'Todos',
        // });
        res.forEach(a => {
          this.lstFirmaCertificadosFiltro.push(a);
        });
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las firmas creadas.',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  /* Tabla */

  formatEditable(params: ValueFormatterParams) {
    if (
      params.value === undefined ||
      params.value === null ||
      params.value === ''
    ) {
      if (params.node.isSelected()) {
        return '<i class="material-icons" style="font-size:19px;opacity:0.2;">create</i>';
      } else {
        return '';
      }
    }
    return params.value;
  }

  editCell(params: any) {
    if (!this.modoVer) {
      if (params.node.isSelected()) {
        if (
          this.muestraAlertaDetencionNoAutorizada === true &&
          this.formFields.vehiculoIgnicion.value === 'sinIgnicion'
        ) {
          if (
            params.column.colId === 'temporalidad' ||
            params.column.colId === 'eventos'
          ) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onCellValueChanged() {
    //this.lstVelZona = [];
  }

  handlerChangeTipo(value: number, modoCarga?: boolean) {
    // reiniciar la validacion al cambiar tipo de alerta
    this.$validator.reset();
    this.errors.clear();

    if (!modoCarga) {
      //this.resetTipoAlerta();
    }

    var certificadoBase: TiposCertificadosBackend = this.lstTipoCertificados.find(
      ab => ab.id == value
    );

    this.nombre = certificadoBase.nombre;

    //this.$emit('showAsociarVehiculos', true);
  }

  handlerChangeFirma(value: number, modoCarga?: boolean) {
    // reiniciar la validacion al cambiar tipo de alerta
    this.$validator.reset();
    this.errors.clear();

    if (!modoCarga) {
      //this.resetTipoAlerta();
    }

    var certificadoBase: FirmasCertificadosBackend = this.lstFirmaCertificados.find(
      ab => ab.id == value
    );

    this.nombre = certificadoBase.nombre;

    //this.$emit('showAsociarVehiculos', true);
  }

  limpiarParametrosGenerales() {
    this.formFields.velocidad.value = '';
    this.formFields.temporalidad.value = '';
    this.formFields.tolerancia.value = '';
    this.formFields.eventos.value = '';
    this.formFields.eventosDetencion.value = '';
    this.formFields.tiempoDetencion.value = '';

    //this.$emit('changeDatosZonas', zona);
  }

  setParametrosGenerales() {
    this.deshabilitaParametrosGenerales = true;
    this.formFields.velocidad.value = '';
    this.formFields.temporalidad.value = '';
    this.formFields.tolerancia.value = '';
    this.formFields.eventos.value = '';
    this.formFields.eventosDetencion.value = '';
    this.formFields.tiempoDetencion.value = '';
  }

  handleTipoZonaChange(tipoZona: number) {
    this.tipo = tipoZona;
  }

  tipo: number = 0;
  isExternalFilterPresent() {
    return this.tipo != 0;
  }

  doesExternalFilterPass(node: any) {
    return node.data.tipoZonaId == this.tipo;
  }

  // /* Alerta generica */

  // mostrarAlertaGenerica(value: number) {
  //   this.loadingService.showLoading();
  //   this.axios.http
  //     .get('Alerta/' + value + '/GetParamAlertaBase')
  //     .then(res => {
  //       if (res !== null && res !== undefined) {
  //         this.lstCampos = res.data;

  //         if (this.alertaSeleccionada) {
  //           this.alertaSeleccionada.campoDinamico.forEach(cd => {
  //             this.lstCampos.forEach(c => {
  //               if (cd.alertaCampoDinamicoId == c.id) {
  //                 c.valor = cd.valorCampoDinamico;
  //               }
  //             });
  //           });
  //         }

  //         this.muestraAlertaGenerica = true;
  //       }
  //     })
  //     .catch(error => {
  //       if (error.response !== undefined) {
  //         if (error.response.status !== 401) {
  //           this.$snotify.error('Ocurrió un error al obtener los campos.');
  //         }
  //       } else {
  //         this.$snotify.error('Ocurrió un error al obtener los campos.');
  //       }
  //     })
  //     .finally(() => {
  //       this.loadingService.hideLoading();
  //     });
  // }

  validaExpresionRegular(regexp: string, valor: string) {
    var re: RegExp = new RegExp(regexp);
    return re.test(valor);
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

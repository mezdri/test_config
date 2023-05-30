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
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-flex xs12 sm12 md12>
                    <v-textarea
                      v-on="on"
                      :label="formFields.glosa.label"
                      v-validate="'required'"
                      :error-messages="errors.collect(formFields.glosa.id)"
                      :data-vv-name="formFields.glosa.id"
                      v-model="formFields.glosa.value"
                      :disabled="modoVer"
                      hint="Glosa que contendrá el enunciado del certificado."
                    />
                  </v-flex>
                </template>
                <span
                  ><p>Puede usar los comodines:</p>
                  <ul>
                    <li>
                      <strong v-html="Flota">Flota </strong
                      >: Para insertar el nombre de la flota.
                    </li>
                    <li>
                      <strong v-html="Rut"></strong
                      >: Para insertar el rut de la flota.
                    </li>
                    <li>
                      <strong v-html="Direccion"></strong
                      >: Para insertar la direcci&oacute;n comercial.
                    </li>
                    <li>
                      <strong  v-html="Marca_GPS"></strong
                      >: Para insertar la marca del gps instalado.
                    </li>
                    <li>
                      <strong v-html="Modelo_Gps"></strong
                      >: Para insertar el modelo del gps instalado.
                    </li>
                    <li>
                      <strong v-html="sim"></strong
                      >: Para insertar el n&uacute;mero de Sim.
                    </li>
                    <li>
                      <strong v-html="telco"></strong
                      >: Para insertar la compa&ntilde;ia de telecomunicaciones.
                    </li>
                  </ul></span
                >
              </v-tooltip>
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
                <v-textarea
                  :label="formFields.anexo.label"
                  :error-messages="errors.collect(formFields.glosa.id)"
                  :data-vv-name="formFields.anexo.id"
                  v-model="formFields.anexo.value"
                  :disabled="soloLectura || modoVer"
                  hint="Anexo que contendra la bajada del certificado.."
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
  CertificadoBaseCliente,
  Contenido,
  Texto,
  TiposCertificadosBackend,
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
export default class ConfigurarCertificadoFormTexto extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: false }) lstCertificadosBase: CertificadoBaseBackend[];
  @Prop() certificadoSeleccionado: CertificadoBaseCliente;

  @Prop({ default: false }) modoAlertaVehiculo: boolean;
  @Prop({ default: 'Campos de Texto' }) tituloModal: boolean;

  isFormValid: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Comercial);
  readonly $snotify: Snotify;
  loadingService = new LoadingService();
  uniqueFieldRule = uniqueFieldRule;

  mensajeEstado: string = '';

  nombre: string = '';

  soloLectura: boolean = false;

  lstTipoCertificados: TiposCertificadosBackend[] = [];
  lstTipoCertificadosFiltro: TiposCertificadosBackend[] = [];
  Flota:string = "{{Flota}}";
  Rut:string = "{{Rut}}";
  Direccion:string = "{{Direccion}}";
  Marca_GPS:string = "{{Marca_GPS}}";
  Modelo_Gps:string = "{{Marca_Gps}}";
  sim:string = "{{sim}}";
  telco:string = "{{telco}}";

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Estado Anexo',
      id: 'activo',
      value: true,
    },
    glosa: {
      label: 'Glosa',
      id: 'glosa',
      value:
        'GPS CHILE SPA certifica a la empresa {{Flota}}, RUT {{Rut}}, con dirección comercial en {{Direccion}}.\n{{Flota}} tiene instalados y activados equipos GPS marca {{Marca_GPS}} modelo {{Modelo_Gps}}, SIM {{sim}}, compañía de telecomunicaciones {{telco}}, en sus vehículos que transitan en todo el territorio nacional.',
    },
    anexo: {
      label: 'Anexo',
      id: 'anexo',
      value:
        'El Cliente, autoriza a GPSCHILE SPA a transmitir y entregar diariamente, los datos obtenidos via GPS/GPRS, a la Plataforma del mandante, empresa MANDANTE conocida como "El Cliente Principal". \nSe extiende a solicitud del Cliente para ser presentado en las faenas correspondientes.',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));

    this.handleFormTextoChange(this.formFields);
    this.handleCertificadoSeleccionadoChange();
    this.handleFormChange(this.formFields);
    this.handleAnexoChange(this.formFields);
    this.handleGlosaChange(this.formFields);
    this.handleCertificadoSeleccionadoChange();
  }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje = '* El valor debe ser mayor a 0';
    this.handleCertificadoSeleccionadoChange();
    //this.handleFormTextoChange(this.formFields);

    this.$validator.localize('es', validator);
  }

  // @Watch('formFields', { deep: true })
  //   handleTexto(fields: FormFieldDefMap) {
  //     emitFormChangeEvent(
  //       this.$emit.bind(this),
  //       {
  //         entity: this.formFields,
  //       },
  //       this
  //     );
  //   }

  // @Watch('formFields', { deep: true })
  // handleTexto(fields: FormFieldDefMap) {
  //   const { formFields } = this;
  //   let texto = {
  //     glosa: formFields.glosa.value,
  //     activo: formFields.activo.value,
  //     anexo: formFields.anexo.value,
  //   };
  //   //this.InformacionVehiculo.visible = fields.activo.value == 'true'?true:false;
  //   this.$emit('handleTexto', texto); // tiene el nombre del objeto a quien le devuelve el valor
  //   //this.$emit('handleFormGpsChange', this.JsonGps);
  // }

  @Watch('formFields', { deep: true })
  handleTexto() {
    this.emitFormChange();
  }

  @Watch('certificadoSeleccionado', { deep: true })
  handleCertificadoSeleccionadoChange() {
    if (this.certificadoSeleccionado) {
      this.formFields.glosa.value = null;
      this.formFields.anexo.value = null;
      this.formFields.activo.value = this.certificadoSeleccionado.contenido.anexo.visible;
      this.formFields.glosa.value = this.certificadoSeleccionado.contenido.glosa;
      this.formFields.anexo.value = this.certificadoSeleccionado.contenido.anexo.contenido;
    }
  }

  emitFormChange() {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        glosa: this.formFields.glosa.value,
        activo: this.formFields.activo.value,
        anexo: this.formFields.anexo.value,
      } as Texto,
      //validator: this.$validator,
      //isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  // @Watch('formFields', { deep: true })
  // handleTexto() {
  //   const { formFields } = this;
  //    emitFormChangeEvent(
  //     this.$emit.bind(this),
  //     {
  //       entity: {
  //         glosa: formFields.glosa.value,
  //         activo: formFields.activo.value,
  //         anexo: formFields.anexo.value
  //       } as Contenido,
  //       isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
  //     },
  //     this
  //   );
  // }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Incluir Anexo' : 'Ocultar Anexo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se mostrará el anexo.';
    this.soloLectura = isActivo ? false : true;
  }

  // @Watch('formFields', { deep: true })
  // handleFormTextoChange(fields: FormFieldDefMap) {
  //   this.$emit('handleFormTextoChange', fields); // tiene el nombre del objeto a quien le devuelve el valor

  // }

  @Watch('formFields', { deep: true })
  handleAnexoChange(fields: FormFieldDefMap) {
    this.$emit('handleAnexoChange', fields); // tiene el nombre del objeto a quien le devuelve el valor
  }

  @Watch('formFields', { deep: true })
  handleGlosaChange(fields: FormFieldDefMap) {
    this.$emit('handleGlosaChange', fields); // tiene el nombre del objeto a quien le devuelve el valor
  }

  @Watch('formFields', { deep: true })
  handleFormTextoChange(fields: FormFieldDefMap) {
    const { formFields } = this;
    const texto = {
      glosa: formFields.glosa.value,
      activo: formFields.activo.value,
      anexo: formFields.anexo.value,
    };
    this.$emit('handleTexto', texto); // tiene el nombre del objeto a quien le devuelve el valor
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        glosa: fields.glosa.value,
        activo: fields.activo.value,
        anexo: fields.anexo.value,
      } as Texto,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some((key) => this.fields[key].dirty),
    });
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    //this.handleFormChange(this.formFields);
  }

  cambioEstadoSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.activo.label = 'Incluir Anexo';
      this.mensajeEstado = '';
    } else {
      this.formFields.activo.label = 'Ocultar Anexo';
      this.soloLectura = isActivo;
      this.mensajeEstado = 'Al dejar como inactivo, no se mostrará el anexo.';
    }
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

  handlerChangeTipo(value: number, modoCarga?: boolean) {
    // reiniciar la validacion al cambiar tipo de alerta
    this.$validator.reset();
    this.errors.clear();

    if (!modoCarga) {
      //this.resetTipoAlerta();
    }

    var certificadoBase: CertificadoBaseBackend = this.lstCertificadosBase.find(
      (ab) => ab.id == value
    );

    this.nombre = certificadoBase.nombre;

    this.$emit('showAsociarVehiculos', true);
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

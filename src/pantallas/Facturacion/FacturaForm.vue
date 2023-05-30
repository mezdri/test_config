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
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <FormFieldContainerFacturacion
              :titulo="'Detalle ' + tituloDocumento"
            >
              <slot name="prependInformacionGeneral" />
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  label="Folio"
                  :error-messages="errors.collect(formFields.folio.id)"
                  :data-vv-name="formFields.folio.id"
                  v-model="formFields.folio.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12 class="pl"></v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  label="Comuna"
                  :error-messages="errors.collect(formFields.comuna.id)"
                  :data-vv-name="formFields.comuna.id"
                  v-model="formFields.comuna.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-text-field
                  label="Ciudad"
                  :error-messages="errors.collect(formFields.ciudad.id)"
                  :data-vv-name="formFields.ciudad.id"
                  v-model="formFields.ciudad.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  :label="formFields.nombreRS.label"
                  :error-messages="errors.collect(formFields.nombreRS.id)"
                  :data-vv-name="formFields.nombreRS.id"
                  v-model="formFields.nombreRS.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-text-field
                  :label="formFields.rut.label"
                  :error-messages="errors.collect(formFields.rut.id)"
                  :data-vv-name="formFields.rut.id"
                  v-model="formFields.rut.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  :label="formFields.direccion.label"
                  :error-messages="errors.collect(formFields.direccion.id)"
                  :data-vv-name="formFields.direccion.id"
                  v-model="formFields.direccion.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-text-field
                  :label="formFields.giro.label"
                  :error-messages="errors.collect(formFields.giro.id)"
                  :data-vv-name="formFields.giro.id"
                  v-model="formFields.giro.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  :label="formFields.fechaEmision.label"
                  :error-messages="errors.collect(formFields.fechaEmision.id)"
                  :data-vv-name="formFields.fechaEmision.id"
                  v-model="formFields.fechaEmision.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-text-field
                  :label="formFields.condicionPago.label"
                  :error-messages="errors.collect(formFields.condicionPago.id)"
                  :data-vv-name="formFields.condicionPago.id"
                  v-model="formFields.condicionPago.value"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldContainerFacturacion>
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
import { ServicioProxy } from '@/config/enums';
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import moment from 'moment';
import {
  emitFormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
// import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import FormFieldContainerFacturacion from '@/pantallas/Facturacion/FormFieldContainerFacturacion.vue';
import { Snotify } from '@/snotify/Snotify';
import { EstadoEntidad } from '../../config/enums';
import ValidaRut from '@/config/validaRut';
import { LoadingService } from '@/services/loadingService';

import { fetchGiro } from '@/reusable/Giro/fetchGiro';
import { Giro } from '@/reusable/Giro/Giro';
import { Factura } from '@/pantallas/Facturacion/fetchFacturaciones';
import { ValueFormatterParams } from 'ag-grid-community';

@Component({
  components: {
    TextField,
    // FormFieldsContainer,
    FormFieldContainerFacturacion,
  },
})
export default class FacturaForm extends Vue {
  @Prop() facturaSeleccionada: Factura;
  @Prop() tipoDocumento: string;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly controller: string = 'Proveedor';
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Comercial);

  mensajeEstado: string = '';
  modoVer: boolean = true;
  esTipoDocumento: string;
  vr: ValidaRut = new ValidaRut();

  formFields: FormFieldDefMap = {
    folio: {
      label: 'Folio',
      id: 'folio',
      value: '',
    },
    comuna: {
      label: 'Comuna',
      id: 'comuna',
      value: '',
    },
    ciudad: {
      label: 'Ciudad',
      id: 'ciudad',
      value: '',
    },
    nombreRS: {
      label: 'Nombre o Razón Social',
      id: 'nombreRS',
      value: '',
    },
    rut: {
      label: 'Rut',
      id: 'rut',
      value: '',
    },
    direccion: {
      label: 'Dirección',
      id: 'direccion',
      value: '',
    },
    giro: {
      label: 'Giro',
      id: 'giro',
      value: '',
    },
    fechaEmision: {
      label: 'Fecha Emisión',
      id: 'fechaEmision',
      value: '',
      // valueFormatter: this.formatFecha,
    },
    condicionPago: {
      label: 'Condición de Pago',
      id: 'condicionPago',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    const self = this;
    let r = this.vr;

    this.handleFormChange(this.formFields);
    this.handlecalibracionSeleccionadaChange();
  }

  @Watch('facturaSeleccionada', { deep: true })
  handlecalibracionSeleccionadaChange() {
    if (!this.facturaSeleccionada) {
      return;
    }
    this.formFields.comuna.value = this.facturaSeleccionada.comunaReceptor;
    this.formFields.ciudad.value = this.facturaSeleccionada.ciudadReceptor;
    this.formFields.folio.value = this.facturaSeleccionada.folio;
    this.formFields.nombreRS.value = this.facturaSeleccionada.nombreReceptor;
    this.formFields.rut.value = this.facturaSeleccionada.rutReceptor;
    this.formFields.direccion.value = this.facturaSeleccionada.direccionReceptor;
    this.formFields.giro.value = this.facturaSeleccionada.giroReceptor;
    this.formFields.fechaEmision.value = this.facturaSeleccionada.fechaEmisionText;
    this.formFields.condicionPago.value = this.facturaSeleccionada.condicionDePago;
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {}

  formatFecha(params: ValueFormatterParams) {
    return params.value.format('DD/MM/YYYY');
  }

  get tituloDocumento() {
    if (this.tipoDocumento === 'FACTURA ELECTRONICA') {
      this.esTipoDocumento = 'Factura';
    } else if (this.tipoDocumento === 'NOTA DE CREDITO ELECTRONICA')
      this.esTipoDocumento = 'Nota de Crédito';
    return this.esTipoDocumento;
  }
}
</script>
<style scoped>
.pr {
  padding-right: 20px !important;
}
.pl {
  padding-left: 20px !important;
}
</style>

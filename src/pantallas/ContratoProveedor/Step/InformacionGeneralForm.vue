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
            <FormFieldsContainer titulo="Información General">
              <v-flex xs12>
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  persistent-hint
                  :hint="mensajeEstado"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex sm12 md12>
                <CampoUnico
                  :label="formFields.nombreContrato.label"
                  v-validate="!modoVer && `required|${uniqueFieldRule}|max:50`"
                  :error-messages="errors.collect(formFields.nombreContrato.id)"
                  :data-vv-name="formFields.nombreContrato.id"
                  v-model="formFields.nombreContrato.value"
                  :disabled="modoVer || modoEditar"
                  :validate="validarNombre"
                  message="Ya existe un contrato con este nombre"
                  counter="50"
                ></CampoUnico>
              </v-flex>
              <v-flex sm12 md12>
                <v-select
                  :label="formFields.proveedorGps.label"
                  :error-messages="errors.collect(formFields.proveedorGps.id)"
                  :data-vv-name="formFields.proveedorGps.id"
                  :items="formFields.proveedorGps.items"
                  :disabled="modoVer || modoEditar"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.proveedorGps.value"
                  v-validate="!modoVer && 'required'"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.tiempoMinTransmiciones.label"
                  :error-messages="
                    errors.collect(formFields.tiempoMinTransmiciones.id)
                  "
                  :data-vv-name="formFields.tiempoMinTransmiciones.id"
                  :disabled="modoVer"
                  v-model="formFields.tiempoMinTransmiciones.value"
                  v-validate="!modoVer && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.tiempoMaxTransmiciones.label"
                  :error-messages="
                    errors.collect(formFields.tiempoMaxTransmiciones.id)
                  "
                  :data-vv-name="formFields.tiempoMaxTransmiciones.id"
                  :disabled="modoVer"
                  v-model="formFields.tiempoMaxTransmiciones.value"
                  v-validate="!modoVer && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.bloqueEnvio.label"
                  :error-messages="errors.collect(formFields.bloqueEnvio.id)"
                  :data-vv-name="formFields.bloqueEnvio.id"
                  :disabled="modoVer"
                  v-model="formFields.bloqueEnvio.value"
                  v-validate="!modoVer && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.cantidadReintentos.label"
                  :error-messages="
                    errors.collect(formFields.cantidadReintentos.id)
                  "
                  :data-vv-name="formFields.cantidadReintentos.id"
                  :disabled="modoVer"
                  v-model="formFields.cantidadReintentos.value"
                  v-validate="!modoVer && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
            </FormFieldsContainer>
            <div align="left">
              <h3>
                Endpoint
                <v-btn
                  v-if="!modoVer"
                  flat
                  icon
                  small
                  @click="handleValidarEndpointClick"
                >
                  <v-icon color="#228B22">play_arrow</v-icon>
                </v-btn>
              </h3>
              <v-divider></v-divider>
              <br />
            </div>
            <v-layout wrap>
              <v-flex md12>
                <CodeView
                  @blur="handleEndpointBlur"
                  v-model="formFields.endpoint.value"
                  :readOnly="modoVer"
                ></CodeView>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <ValidarEndpointModal
      :show="muestraModalValidar"
      :script="formFields.endpoint.value"
      @blur="handleEndpointBlur"
      @cerrar="handleCierreModal"
    ></ValidarEndpointModal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { debounce } from 'lodash';
import moment from 'moment';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  FormState as BaseFormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import CampoContrasena from '@/reusable/Form/CampoContrasena.vue';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import {
  ClienteProveedorGps,
  fetchClientesProveedorGps,
} from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import CodeView from '@/reusable/CodeView/CodeView.vue';
import CampoUnico from '@/reusable/Form/CampoUnico.vue';
import { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';

import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';
import { chequearNombreContratoUnico } from '@/pantallas/ContratoProveedor/Services/chequearNombreContratoUnico';

import ValidarEndpointModal from '@/pantallas/ContratoProveedor/ValidarEndpointModal.vue';

export interface ContratoProveedorFormState extends BaseFormState {
  entity: Pick<
    ContratoProveedorBackend,
    Exclude<keyof ContratoProveedorBackend, 'id'>
  >;
}

@Component({
  components: {
    CampoContrasena,
    DatePicker,
    FormFieldsContainer,
    CampoUnico,
    CodeView,
    ValidarEndpointModal,
  },
})
export default class InformacionGeneralForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: false }) show!: boolean;
  @Prop() contratoProveedor: ContratoProveedorBackend;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    nombreContrato: {
      label: 'Nombre Contrato',
      id: 'nombreContrato',
      value: '',
      items: [],
    },
    proveedorGps: {
      label: 'Proveedor de GPS',
      id: 'proveedorGps',
      value: '',
      items: [],
    },
    tiempoMinTransmiciones: {
      label: 'Tiempo Mínimo entre Transmisiones (Segundos)',
      id: 'tiempoMinTransmiciones',
      value: '',
    },
    tiempoMaxTransmiciones: {
      label: 'Tiempo Máximo entre Transmisiones (Segundos)',
      id: 'tiempoMaxTransmiciones',
      value: '',
    },
    bloqueEnvio: {
      label: 'Tamaño del Bloque de envío',
      id: 'bloqueEnvio',
      value: '',
    },
    cantidadReintentos: {
      label: 'Cantidad de reintentos',
      id: 'cantidadReintentos',
      value: '',
    },
    endpoint: {
      label: '',
      id: 'endpoint',
      value: '',
    },
  };

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  muestraModalValidar: boolean = false;
  uniqueFieldRule = uniqueFieldRule;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje = '* El valor debe ser mayor a 0';
    validator.custom.tiempoMinTransmiciones.min_value = mensaje;
    validator.custom.tiempoMaxTransmiciones.min_value = mensaje;
    validator.custom.bloqueEnvio.min_value = mensaje;
    validator.custom.cantidadReintentos.min_value = mensaje;
    this.$validator.localize('es', validator);
    this.cargarListasDesplegables();
  }

  async validarNombre(nombre: string) {
    var id = this.contratoProveedor ? this.contratoProveedor.id : 0;
    return chequearNombreContratoUnico(id, nombre);
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const { formFields } = this;

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          estado: formFields.activo.value
            ? EstadoEntidad.Activo
            : EstadoEntidad.Inactivo,
          nombre: formFields.nombreContrato.value,
          proveedorId: Number(formFields.proveedorGps.value),
          tiempoMin: Number(formFields.tiempoMinTransmiciones.value),
          tiempoMax: Number(formFields.tiempoMaxTransmiciones.value),
          cantidadBloque: Number(formFields.bloqueEnvio.value),
          reintentos: Number(formFields.cantidadReintentos.value),
          endpoint: formFields.endpoint.value,
        },
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
  }

  @Watch('contratoProveedor', { deep: true, immediate: true })
  handleContratoProveedorChange() {
    if (this.contratoProveedor && this.show) {
      this.formFields.activo.value = this.contratoProveedor.estado;
      this.formFields.nombreContrato.value = this.contratoProveedor.nombre;
      this.formFields.tiempoMinTransmiciones.value = this.contratoProveedor.tiempoMin;
      this.formFields.tiempoMaxTransmiciones.value = this.contratoProveedor.tiempoMax;
      this.formFields.bloqueEnvio.value = this.contratoProveedor.cantidadBloque;
      this.formFields.cantidadReintentos.value = this.contratoProveedor.reintentos;
      this.formFields.endpoint.value = this.contratoProveedor.endpoint
        ? this.contratoProveedor.endpoint
        : '';
      this.formFields.proveedorGps.value = this.contratoProveedor.proveedorId;
    }
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se podrán realizar asociaciones.';
  }

  cargarListasDesplegables() {
    debounce(() => this.loadingService.showLoading());
    this.fetchProveedoresGps()
      .then(proveedoresGps => {
        this.formFields.proveedorGps.items = proveedoresGps.filter(
          p => p.estado == EstadoEntidad.Activo
        );
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchProveedoresGps() {
    return fetchProveedoresGps().catch(() => {
      this.$snotify.error(
        'Ha ocurrido un error al intentar obtener la lista de proveedores de gps',
        { timeout: 3000 }
      );
      return [];
    });
  }

  handleEndpointBlur(valor: string) {
    this.formFields.endpoint.value = valor;
  }

  handleValidarEndpointClick() {
    this.muestraModalValidar = true;
  }

  handleCierreModal() {
    this.muestraModalValidar = false;
  }
}
</script>
<style scoped>
h3 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

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
              <v-flex sm12 md6>
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
                  no-data-text="Datos no disponibles"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                  :label="formFields.contratos.label"
                  :error-messages="errors.collect(formFields.contratos.id)"
                  :data-vv-name="formFields.contratos.id"
                  :items="formFields.contratos.items"
                  :disabled="modoVer || modoEditar"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.contratos.value"
                  v-validate="!modoVer && 'required'"
                  no-data-text="Datos no disponibles"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-select
                  :label="formFields.clienteProveedorGps.label"
                  :error-messages="
                    errors.collect(formFields.clienteProveedorGps.id)
                  "
                  :data-vv-name="formFields.clienteProveedorGps.id"
                  :items="formFields.clienteProveedorGps.items"
                  :disabled="modoVer || modoEditar"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.clienteProveedorGps.value"
                  v-validate="!modoVer && 'required'"
                  no-data-text="Datos no disponibles"
                />
              </v-flex>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaInicio.label"
                  v-validate="!modoVer && 'required'"
                  :error-messages="errors.collect(formFields.fechaInicio.id)"
                  :id="formFields.fechaInicio.id"
                  v-model="formFields.fechaInicio.value"
                  :disabled="modoVer"
                  ref="fechaInicio"
                />
              </v-flex>
              <v-flex sm12 md6>
                <TimePicker
                  :label="formFields.horaInicio.label"
                  v-validate="!modoVer && 'required'"
                  :error-messages="errors.collect(formFields.horaInicio.id)"
                  :id="formFields.horaInicio.id"
                  v-model="formFields.horaInicio.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaTermino.label"
                  :error-messages="errors.collect(formFields.fechaTermino.id)"
                  :id="formFields.fechaTermino.id"
                  v-model="formFields.fechaTermino.value"
                  :disabled="modoVer"
                  v-validate="
                    !modoVer &&
                      formFields.horaTermino.value &&
                      'required|fechaTerminoMayor:fechaInicio'
                  "
                />
              </v-flex>
              <v-flex sm12 md6>
                <TimePicker
                  :label="formFields.horaTermino.label"
                  v-validate="
                    !modoVer && formFields.fechaTermino.value && 'required'
                  "
                  :error-messages="errors.collect(formFields.horaTermino.id)"
                  :id="formFields.horaTermino.id"
                  v-model="formFields.horaTermino.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.endpoint.label"
                  :error-messages="errors.collect(formFields.endpoint.id)"
                  :data-vv-name="formFields.endpoint.id"
                  :disabled="modoVer"
                  v-model="formFields.endpoint.value"
                  v-validate="!modoVer"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.login.label"
                  :error-messages="errors.collect(formFields.login.id)"
                  :data-vv-name="formFields.login.id"
                  :disabled="modoVer"
                  v-model="formFields.login.value"
                  v-validate="!modoVer && 'max:50'"
                  counter="50"
                />
              </v-flex>
              <v-flex sm12 md6>
                <CampoContrasena
                  :label="formFields.password.label"
                  :error-messages="errors.collect(formFields.password.id)"
                  :data-vv-name="formFields.password.id"
                  :disabled="modoVer"
                  v-model="formFields.password.value"
                  v-validate="!modoVer && 'max:50'"
                  counter="50"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.apiKey.label"
                  :error-messages="errors.collect(formFields.apiKey.id)"
                  :data-vv-name="formFields.apiKey.id"
                  :disabled="modoVer"
                  v-model="formFields.apiKey.value"
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
import DatePicker from '@/reusable/Form/DatePickerClearable.vue';
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
import { fetchContratosProveedores } from '@/pantallas/ContratoProveedor/Services/fetchContratosProveedores';

import { Envio } from '@/interfaces/Envio';
import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';

import { Validator } from 'vee-validate';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import TimePicker from '@/reusable/Form/TimePickerClearable.vue';

export interface EnvioFormState extends BaseFormState {
  entity: Pick<Envio, Exclude<keyof Envio, 'id'>>;
}

@Component({
  components: {
    CampoContrasena,
    DatePicker,
    FormFieldsContainer,
    TimePicker,
  },
})
export default class InformacionGeneralForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() envio: Envio;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    proveedorGps: {
      label: 'Proveedor',
      id: 'proveedor',
      value: '',
      items: [],
    },
    contratos: {
      label: 'Contrato',
      id: 'contratos',
      value: null,
      items: [],
    },
    clienteProveedorGps: {
      label: 'Cliente Proveedor',
      id: 'clienteProveedor',
      value: null,
      items: [],
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: null,
    },
    horaInicio: {
      label: 'Hora de Inicio',
      id: 'horaInicio',
      value: null,
    },
    fechaTermino: {
      label: 'Fecha Término',
      id: 'fechaTermino',
      value: null,
    },
    horaTermino: {
      label: 'Hora de Término',
      id: 'horaTermino',
      value: null,
    },
    endpoint: {
      label: 'Endpoint',
      id: 'endpoint',
      value: '',
    },
    login: {
      label: 'Login',
      id: 'login',
      value: '',
    },
    password: {
      label: 'Password',
      id: 'password',
      value: '',
    },
    apiKey: {
      label: 'APIkey',
      id: 'apiKey',
      value: '',
    },
  };

  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly controller: string = 'Integracion/Envio';
  codUnico: number = 0;

  isFormValid: boolean = false;
  mensajeEstado: string = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  clientesProveedorGps: Promise<ClienteProveedorGps[]> = null;
  contratosProveedores: Promise<ContratoProveedorBackend[]> = null;

  constructor() {
    super();
    this.registrarValidadores();
  }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    validator.custom.fechaTermino.fechaTerminoMayor =
      ' * Fecha de Término debe ser mayor a la fecha Inicio';
    this.$validator.localize('es', validator);
    this.cargarListasDesplegables();
  }

  registrarValidadores() {
    const self = this;

    Validator.extend(
      'fechaTerminoMayor',
      (fechaTermino: moment.Moment, [fechaInicioAnterior]: [moment.Moment]) => {
        return this.validarFechaTermino(fechaInicioAnterior, fechaTermino);
      },
      {
        hasTarget: true,
      }
    );

    Validator.extend('loginUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Login con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controller}/ChequearUsuarioUnico/${self.codUnico}/${value}`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message: '* Ya existe un Login con este nombre.',
                      },
                });
              });
            })
            .catch(err => {
              return true;
            });
        } else {
          return true;
        }
      },
    });
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
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
          proveedorId: formFields.proveedorGps.value,
          contratoId: formFields.contratos.value,
          clienteProveedorId: formFields.clienteProveedorGps.value,
          fechaIni: formFields.fechaInicio.value,
          fechaFin: formFields.fechaTermino.value,
          usuario: formFields.login.value,
          password: formFields.password.value,
          endpoint: formFields.endpoint.value,
          apiKey: formFields.apiKey.value,
          horaIni: formFields.horaInicio.value,
          horaFin: formFields.horaTermino.value,
        },
      },
      this
    );
  }

  @Watch('envio', { deep: true, immediate: true })
  handleRecepcionActividadChange() {
    if (this.envio) {
      this.codUnico = this.envio.id;

      this.formFields.activo.value = this.envio.estado;
      this.formFields.proveedorGps.value = this.envio.proveedorId;
      this.formFields.contratos.value = this.envio.contratoId;
      this.formFields.clienteProveedorGps.value = this.envio.clienteProveedorId;
      this.formFields.fechaInicio.value = this.envio.fechaIni;
      this.formFields.fechaTermino.value = this.envio.fechaFin;
      this.formFields.login.value = this.envio.usuario;
      this.formFields.password.value = this.envio.password;
      this.formFields.endpoint.value = this.envio.endpoint;
      this.formFields.apiKey.value = this.envio.apiKey;
      this.formFields.horaInicio.value = moment(this.envio.fechaIni);
      this.formFields.horaTermino.value = moment(this.envio.fechaFin);
    }
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se permitirá enviar información';
  }

  @Watch('formFields.proveedorGps.value', { immediate: true })
  handleProveedorGpsChange() {
    if (!this.clientesProveedorGps || !this.contratosProveedores) {
      // Watchers activos previo a inicialización de promesa
      return;
    }

    var proveedor = this.formFields.proveedorGps.value;

    this.contratosProveedores.then(contratosProveedores => {
      if (this.modoVer || this.modoEditar) {
        this.formFields.contratos.items = contratosProveedores.filter(
          c => c.proveedorId === proveedor
        );
      } else {
        this.formFields.contratos.items = contratosProveedores.filter(
          c => c.proveedorId === proveedor && c.estado == EstadoEntidad.Activo
        );
      }

      if (
        !this.formFields.contratos.items.find(
          (x: ContratoProveedorBackend) =>
            x.id === this.formFields.contratos.value
        )
      ) {
        this.formFields.contratos.value = null;
      }
    });

    this.clientesProveedorGps.then(clientesProveedorGps => {
      this.formFields.clienteProveedorGps.items = clientesProveedorGps.filter(
        clienteProveedor =>
          clienteProveedor.proveedoresId.find(x => x === proveedor) !==
          undefined
      );
      if (
        !this.formFields.clienteProveedorGps.items.find(
          (x: ClienteProveedorGps) =>
            x.id === this.formFields.clienteProveedorGps.value
        )
      ) {
        this.formFields.clienteProveedorGps.value = null;
      }
    });
  }

  cargarListasDesplegables() {
    this.clientesProveedorGps = this.fetchClientesProveedorGps();
    this.contratosProveedores = this.fetchContratosProveedores();

    /*
    Evitar destellos de modal de carga en casos de respuestas http cacheadas
     */
    debounce(() => this.loadingService.showLoading());
    Promise.all([
      this.fetchProveedoresGps(),
      this.clientesProveedorGps,
      this.contratosProveedores,
    ])
      .then(([proveedoresGps]) => {
        if (this.modoVer || this.modoEditar) {
          this.formFields.proveedorGps.items = proveedoresGps;
        } else {
          this.formFields.proveedorGps.items = proveedoresGps.filter(
            x => x.estado == EstadoEntidad.Activo
          );
        }
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

  fetchClientesProveedorGps() {
    return fetchClientesProveedorGps().catch(() => {
      this.$snotify.error(
        'Ha ocurrido un error al intentar obtener la lista de clientes proveedor de gps',
        { timeout: 3000 }
      );
      return [];
    });
  }

  fetchContratosProveedores() {
    return fetchContratosProveedores().catch(() => {
      this.$snotify.error(
        'Ha ocurrido un error al intentar obtener la lista de contratos de proveedores',
        { timeout: 3000 }
      );
      return [];
    });
  }

  validarFechaTermino(
    fechaInicioAnterior: moment.Moment,
    fechaTermino: moment.Moment
  ) {
    if (fechaTermino.isValid()) {
      const fechaInicio = this.formFields.fechaInicio.value as moment.Moment;
      return fechaInicio.isBefore(fechaTermino);
    }
    return true;
  }
}
</script>
<style scoped>
h3 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

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
                  :readonly="disabled"
                  :data-testid="`${testId}--estado`"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                  :label="formFields.proveedorGps.label"
                  :error-messages="errors.collect(formFields.proveedorGps.id)"
                  :data-vv-name="formFields.proveedorGps.id"
                  :data-testid="`${testId}--proveedor-gps`"
                  :items="formFields.proveedorGps.items"
                  :disabled="disabled || edicion"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.proveedorGps.value"
                  v-validate="!disabled && 'required'"
                  no-data-text="Datos no disponibles"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-select
                  :label="formFields.clienteProveedorGps.label"
                  :error-messages="
                    errors.collect(formFields.clienteProveedorGps.id)
                  "
                  :data-vv-name="formFields.clienteProveedorGps.id"
                  :data-testid="`${testId}--cliente-proveedor-gps`"
                  :items="formFields.clienteProveedorGps.items"
                  :disabled="disabled || edicion"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.clienteProveedorGps.value"
                  v-validate="!disabled && 'required'"
                  no-data-text="Datos no disponibles"
                />
              </v-flex>
            </FormFieldsContainer>

            <FormFieldsContainer titulo="Credenciales Conexión">
              <v-flex sm12 md6>
                <!--                TODO mover campo usuario a componente -->
                <v-text-field
                  :label="formFields.usuario.label"
                  :error-messages="errors.collect(formFields.usuario.id)"
                  :data-vv-name="formFields.usuario.id"
                  :data-testid="`${testId}--usuario`"
                  :counter="50"
                  :disabled="disabled"
                  v-model="formFields.usuario.value"
                  v-validate="!disabled && 'required|max:50|loginUnico'"
                />
              </v-flex>
              <v-flex sm12 md6>
                <CampoContrasena
                  :label="formFields.password.label"
                  :error-messages="errors.collect(formFields.password.id)"
                  :data-vv-name="formFields.password.id"
                  :test-id="`${testId}--contrasena`"
                  :counter="50"
                  :disabled="disabled"
                  v-model="formFields.password.value"
                  v-validate="!disabled && 'required|max:50'"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaInicio.label"
                  :error-messages="errors.collect(formFields.fechaInicio.id)"
                  :id="formFields.fechaInicio.id"
                  :test-id="`${testId}--fecha-inicio`"
                  :disabled="disabled"
                  v-model="formFields.fechaInicio.value"
                  v-validate="!disabled && 'required'"
                  :min="fechaMinima"
                  ref="fechaInicio"
                />
              </v-flex>
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaTermino.label"
                  :error-messages="errors.collect(formFields.fechaTermino.id)"
                  :id="formFields.fechaTermino.id"
                  :test-id="`${testId}--fecha-termino`"
                  :disabled="disabled"
                  v-model="formFields.fechaTermino.value"
                  v-validate="!disabled && 'fechaTerminoMayor:fechaInicio'"
                  :min="fechaMinima"
                />
              </v-flex>

              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.intervaloTransmiciones.label"
                  :error-messages="
                    errors.collect(formFields.intervaloTransmiciones.id)
                  "
                  :data-vv-name="formFields.intervaloTransmiciones.id"
                  :data-testid="`${testId}--intervalo-transmiciones`"
                  :disabled="disabled"
                  v-model="formFields.intervaloTransmiciones.value"
                  v-validate="!disabled && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
              <v-flex sm12 md6>
                <v-text-field
                  :label="formFields.cantidadActividadesPorBloque.label"
                  :error-messages="
                    errors.collect(formFields.cantidadActividadesPorBloque.id)
                  "
                  :data-vv-name="formFields.cantidadActividadesPorBloque.id"
                  :data-testid="`${testId}--cantidadActividadesBloque`"
                  :disabled="disabled"
                  v-model="formFields.cantidadActividadesPorBloque.value"
                  v-validate="!disabled && 'required|min_value:1'"
                  type="number"
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
import { RecepcionActividad } from '@/pantallas/Recepcion/RecepcionActividad';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { Validator } from 'vee-validate';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';

export interface RecepcionActividadFormState extends BaseFormState {
  entity: Pick<RecepcionActividad, Exclude<keyof RecepcionActividad, 'id'>>;
}

@Component({
  components: {
    CampoContrasena,
    DatePicker,
    FormFieldsContainer,
  },
})
export default class RecepcionActividadForm extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ default: false }) disabled: boolean;
  @Prop() recepcionActividad: RecepcionActividad;
  @Prop({ default: false }) edicion: boolean;

  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly controller: string = 'Integracion/recepciones';
  codUnico: number = 0;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    proveedorGps: {
      label: 'Proveedor de GPS',
      id: 'proveedorGps',
      value: '',
      items: [],
    },
    clienteProveedorGps: {
      label: 'Cliente Proveedor de GPS',
      id: 'clienteProveedorGps',
      value: null,
      items: [],
    },
    usuario: {
      label: 'Login',
      id: 'usuario',
      value: '',
    },
    password: {
      label: 'Password',
      id: 'password',
      value: '',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: null,
    },
    fechaTermino: {
      label: 'Fecha Término',
      id: 'fechaTermino',
      value: null,
    },
    intervaloTransmiciones: {
      label: 'Tiempo Mínimo entre Transmisiones (Segundos)',
      id: 'intervaloTransmiciones',
      value: '',
    },
    cantidadActividadesPorBloque: {
      label: 'Nro. Máximo de Registros por Bloque',
      id: 'cantidadActividadesPorBloque',
      value: '',
    },
  };
  isFormValid: boolean = false;
  mensajeEstado: string = '';
  clientesProveedorGps: Promise<ClienteProveedorGps[]> = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
    this.registrarValidadores();
  }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje = '* El valor debe ser mayor a 0';
    validator.custom.intervaloTransmiciones.min_value = mensaje;
    validator.custom.cantidadActividadesPorBloque.min_value = mensaje;
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
    const proveedor = formFields.proveedorGps.items.find(
      x => x.id === formFields.proveedorGps.value
    );
    const clienteProveedor = formFields.clienteProveedorGps.items.find(
      x => x.id === formFields.clienteProveedorGps.value
    );
    const estados = new EstadosService().getEstadosVisibles();
    const estado = formFields.activo.value
      ? estados.find(x => x.id === EstadoEntidad.Activo)
      : estados.find(x => x.id === EstadoEntidad.Inactivo);

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          proveedor,
          clienteProveedor,
          numeroRegistrosPorBloque: Number(
            formFields.cantidadActividadesPorBloque.value
          ),
          intervaloTransmiciones: formFields.intervaloTransmiciones.value,
          fechaInicio: formFields.fechaInicio.value as moment.Moment,
          fechaTermino: formFields.fechaTermino.value as moment.Moment,
          login: String(formFields.usuario.value),
          password: String(formFields.password.value),
          estado,
        },
      },
      this
    );
  }

  @Watch('recepcionActividad', { deep: true, immediate: true })
  handleRecepcionActividadChange() {
    if (!this.recepcionActividad) {
      return;
    }

    const { formFields, recepcionActividad } = this;

    this.codUnico = recepcionActividad.id;

    formFields.proveedorGps.value = recepcionActividad.proveedor.id;
    formFields.clienteProveedorGps.value =
      recepcionActividad.clienteProveedor.id;
    formFields.usuario.value = recepcionActividad.login;
    formFields.password.value = recepcionActividad.password;
    formFields.fechaInicio.value = recepcionActividad.fechaInicio;
    formFields.fechaTermino.value = recepcionActividad.fechaTermino;
    formFields.intervaloTransmiciones.value =
      recepcionActividad.intervaloTransmiciones;
    formFields.cantidadActividadesPorBloque.value =
      recepcionActividad.numeroRegistrosPorBloque;
    formFields.activo.value =
      recepcionActividad.estado.id === EstadoEntidad.Activo;
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como Inactivo, no se permitirá recibir información';
  }

  @Watch('formFields.proveedorGps.value', { immediate: true })
  handleProveedorGpsChange() {
    if (!this.clientesProveedorGps) {
      // Watchers activos previo a inicialización de promesa
      return;
    }

    const { value: proveedorGpsId } = this.formFields.proveedorGps;
    const { clienteProveedorGps } = this.formFields;

    this.clientesProveedorGps.then(clientesProveedorGps => {
      clienteProveedorGps.items = clientesProveedorGps.filter(
        clienteProveedor =>
          clienteProveedor.proveedoresId.find(x => x === proveedorGpsId) !==
          undefined
      );
      if (
        !clienteProveedorGps.items.find(
          (x: ClienteProveedorGps) => x.id === clienteProveedorGps.value
        )
      ) {
        /*
        Cubre casos en que el cliente proveedor obtenido desde prop no se
        encuentra asociado al proveedor. En lugar de mantener el valor y
        permitir continuar, limpiar campo para forzar selección de un nuevo
        cliente proveedor.
        */
        clienteProveedorGps.value = null;
      }
    });
  }

  cargarListasDesplegables() {
    this.clientesProveedorGps = this.fetchClientesProveedorGps();

    /*
    Evitar destellos de modal de carga en casos de respuestas http cacheadas
     */
    debounce(() => this.loadingService.showLoading());
    Promise.all([this.fetchProveedoresGps(), this.clientesProveedorGps])
      .then(([proveedoresGps]) => {
        this.formFields.proveedorGps.items = proveedoresGps.filter(
          x => x.estado == 1
        );
        this.handleProveedorGpsChange();
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

  get fechaMinima() {
    let fechaMin: any = new Date().toISOString().substr(0, 10);
    return fechaMin;
  }

  validarFechaTermino(
    fechaInicioAnterior: moment.Moment,
    fechaTermino: moment.Moment
  ) {
    const fechaInicio = this.formFields.fechaInicio.value as moment.Moment;
    return fechaInicio.isBefore(fechaTermino);
  }
}
</script>

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

            <FormFieldsContainer titulo="Inicio de la Autorización">
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaInicio.label"
                  :error-messages="errors.collect(formFields.fechaInicio.id)"
                  :id="formFields.fechaInicio.id"
                  :test-id="`${testId}--fecha-inicio`"
                  :disabled="disabled"
                  v-model="formFields.fechaInicio.value"
                  v-validate="!disabled && 'required'"
                  ref="fechaInicio"
                />
              </v-flex>
              <v-flex sm12 md6>
                <TimePicker
                  v-model="formFields.horaInicio.value"
                  v-validate="!disabled && 'required'"
                  :label="formFields.horaInicio.label"
                  :error-messages="errors.collect(formFields.horaInicio.id)"
                  :id="formFields.horaInicio.id"
                  :test-id="`${testId}--hora-inicio`"
                  :disabled="disabled"
                />
              </v-flex>
            </FormFieldsContainer>

            <FormFieldsContainer titulo="Fin de la Autorización">
              <v-flex sm12 md6>
                <DatePicker
                  :label="formFields.fechaTermino.label"
                  :error-messages="errors.collect(formFields.fechaTermino.id)"
                  :id="formFields.fechaTermino.id"
                  :test-id="`${testId}--fecha-termino`"
                  :disabled="disabled"
                  v-model="formFields.fechaTermino.value"
                  v-validate="
                    !disabled &&
                      formFields.horaTermino.value &&
                      'required|fechaTerminoMayor:fechaInicio'
                  "
                />
              </v-flex>
              <v-flex sm12 md6>
                <TimePicker
                  v-model="formFields.horaTermino.value"
                  :label="formFields.horaTermino.label"
                  :error-messages="errors.collect(formFields.horaTermino.id)"
                  :id="formFields.horaTermino.id"
                  :test-id="`${testId}--hora-termino`"
                  :disabled="disabled"
                  v-validate="
                    !disabled && formFields.fechaTermino.value && 'required'
                  "
                />
              </v-flex>

              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.maxConsultasPorDia.label"
                  :error-messages="
                    errors.collect(formFields.maxConsultasPorDia.id)
                  "
                  :data-vv-name="formFields.maxConsultasPorDia.id"
                  :data-testid="`${testId}--max-consultas-dia`"
                  :disabled="disabled"
                  v-model="formFields.maxConsultasPorDia.value"
                  v-validate="!disabled && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.maxConsultasPorHora.label"
                  :error-messages="
                    errors.collect(formFields.maxConsultasPorHora.id)
                  "
                  :data-vv-name="formFields.maxConsultasPorHora.id"
                  :data-testid="`${testId}--max-consultas-hora`"
                  :disabled="disabled"
                  v-model="formFields.maxConsultasPorHora.value"
                  v-validate="!disabled && 'required|min_value:1'"
                  type="number"
                />
              </v-flex>
              <v-flex sm12 md4>
                <v-text-field
                  :label="formFields.maxRegistrosPorBloque.label"
                  :error-messages="
                    errors.collect(formFields.maxRegistrosPorBloque.id)
                  "
                  :data-vv-name="formFields.maxRegistrosPorBloque.id"
                  :data-testid="`${testId}--max-registros-bloque`"
                  :disabled="disabled"
                  v-model="formFields.maxRegistrosPorBloque.value"
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
import TimePicker from '@/reusable/Form/TimePickerClearable.vue';
import { DescargaActividadForm as DescargaActividadFormType } from '@/pantallas/DescargaActividades/crud/DescargaActividadForm';
import { Validator } from 'vee-validate';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';

@Component({
  components: {
    TimePicker,
    CampoContrasena,
    DatePicker,
    FormFieldsContainer,
  },
})
export default class DescargaActividadForm extends Vue {
  @Prop({ required: true }) testId: string;
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: false }) edicion: boolean;
  @Prop({ default: 0 }) idServicio: number;
  @Prop() descargaActividad: DescargaActividadFormType;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    proveedorGps: {
      label: 'Proveedor de GPS',
      id: 'proveedorGps',
      value: null,
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
      label: 'Fecha de Inicio',
      id: 'fechaInicio',
      value: null,
    },
    horaInicio: {
      label: 'Hora de Inicio',
      id: 'horaInicio',
      value: null,
    },
    fechaTermino: {
      label: 'Fecha de Término',
      id: 'fechaTermino',
      value: null,
    },
    horaTermino: {
      label: 'Hora de Término',
      id: 'horaTermino',
      value: null,
    },
    maxConsultasPorDia: {
      label: 'Máx. de Consultas por día',
      id: 'maxConsultasPorDia',
      value: null,
    },
    maxConsultasPorHora: {
      label: 'Máx. de Consultas por hora',
      id: 'maxConsultasPorHora',
      value: null,
    },
    maxRegistrosPorBloque: {
      label: 'Máx. de Registros por bloque',
      id: 'maxRegistrosPorBloque',
      value: null,
    },
  };

  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly controller: string = 'Integracion/descarga';
  codUnico: number = 0;

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
    validator.custom.maxConsultasPorDia.min_value = mensaje;
    validator.custom.maxConsultasPorHora.min_value = mensaje;
    validator.custom.maxRegistrosPorBloque.min_value = mensaje;
    validator.custom.fechaTermino.fechaTerminoMayor =
      ' * Fecha de Término debe ser mayor a la fecha Inicio';
    this.$validator.localize('es', validator);
    this.cargarListasDesplegables();
  }

  mounted() {
    this.handleDescargaActividadChange();
  }

  registrarValidadores() {
    const self = this;
    Validator.extend(
      'fechaTerminoMayor',
      (fechaTermino: moment.Moment, [fechaInicioAnterior]: [moment.Moment]) => {
        /* Por algún motivo no comprendido, vee validate ejecuta la validación
         * contra la última fecha de inicio, no la fecha de inicio actual. */
        const fechaInicio = this.formFields.fechaInicio.value as moment.Moment;
        return fechaInicio.isBefore(fechaTermino);
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
    const mergeDiaHora = (dia: moment.Moment | null, hora: moment.Moment) => {
      if (dia === null) {
        return dia;
      }
      return hora ? dia.hour(hora.hour()).minute(hora.minute()) : dia;
    };

    const entity: DescargaActividadFormType = {
      estado,
      proveedor,
      clienteProveedor,
      usuario: String(formFields.usuario.value),
      password: String(formFields.password.value),
      fechaInicio: mergeDiaHora(
        formFields.fechaInicio.value as moment.Moment,
        formFields.horaInicio.value as moment.Moment
      ),
      fechaTermino: mergeDiaHora(
        formFields.fechaTermino.value as moment.Moment,
        formFields.horaTermino.value as moment.Moment
      ),
      maximoPeticionesDia: Number(formFields.maxConsultasPorDia.value),
      maximoPeticionesHora: Number(formFields.maxConsultasPorHora.value),
      maximoRegistrosBloque: Number(formFields.maxRegistrosPorBloque.value),
    };

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity,
      },
      this
    );
  }

  /* @Watch('descargaActividad', { deep: true, immediate: true }) */
  handleDescargaActividadChange() {
    if (!this.descargaActividad) {
      return;
    }
    const { formFields, descargaActividad } = this;

    this.codUnico = this.idServicio;

    formFields.activo.value = descargaActividad.estado.id;
    formFields.proveedorGps.value = descargaActividad.proveedor.id;
    formFields.clienteProveedorGps.value =
      descargaActividad.clienteProveedor.id;
    formFields.usuario.value = descargaActividad.usuario;
    formFields.password.value = descargaActividad.password;
    formFields.fechaInicio.value = descargaActividad.fechaInicio;
    formFields.horaInicio.value = descargaActividad.fechaInicio;
    formFields.fechaTermino.value = descargaActividad.fechaTermino;
    formFields.horaTermino.value = descargaActividad.fechaTermino;
    formFields.maxConsultasPorDia.value = descargaActividad.maximoPeticionesDia;
    formFields.maxConsultasPorHora.value =
      descargaActividad.maximoPeticionesHora;
    formFields.maxRegistrosPorBloque.value =
      descargaActividad.maximoRegistrosBloque;
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se permitirá descargar información';
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
        'Ha ocurrido un error al intentar obtener la lista de proveedores de gps'
      );
      return [];
    });
  }

  fetchClientesProveedorGps() {
    return fetchClientesProveedorGps().catch(() => {
      this.$snotify.error(
        'Ha ocurrido un error al intentar obtener la lista de clientes proveedor de gps'
      );
      return [];
    });
  }
}
</script>

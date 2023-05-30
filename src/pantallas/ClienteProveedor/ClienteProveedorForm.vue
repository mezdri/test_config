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
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.activo.value == 1 ? 'Activo' : 'Inactivo'"
                  color="#FDEF68"
                  v-model="formFields.activo.value"
                  persistent-hint
                  :hint="warningInactivo"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-validate="'required|max:80|NombreUnico'"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  counter="80"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field
                  :label="formFields.rut.label"
                  v-validate="'required|max:10|rut|rutFormato|RutUnico'"
                  :error-messages="errors.collect(formFields.rut.id)"
                  :data-vv-name="formFields.rut.id"
                  v-model="formFields.rut.value"
                  counter="10"
                  :disabled="modoVer || nuncaEdit"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-select
                  :label="formFields.giro.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.giro.id)"
                  :data-vv-name="formFields.giro.id"
                  v-model="formFields.giro.value"
                  :items="lstGiros"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.direccion.label"
                  v-validate="'max:250'"
                  :error-messages="errors.collect(formFields.direccion.id)"
                  :data-vv-name="formFields.direccion.id"
                  v-model="formFields.direccion.value"
                  counter="250"
                  :disabled="modoVer"
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
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { EstadoEntidad } from '../../config/enums';
import ValidaRut from '@/config/validaRut';
import { LoadingService } from '@/services/loadingService';

import { ClienteProveedor } from './ClienteProveedor';
import { Giro } from '@/reusable/Giro/Giro';
import { fetchGiro } from '@/reusable/Giro/fetchGiro';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class ClienteProveedoresForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) nuncaEdit: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() clienteProveedorSeleccionado: any;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly controller: string = 'ClienteProveedor';
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);

  mensajeEstado: string = '';
  warningInactivo: any = '';
  mensajeConfirmacionInactivo: any = '';

  vr: ValidaRut = new ValidaRut();

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: '1',
    },
    nombre: {
      label: 'Nombre o Razón Social',
      id: 'nombre',
      value: '',
    },
    rut: {
      label: 'Rut',
      id: 'rut',
      value: '',
    },
    giro: {
      label: 'Giro',
      id: 'giro',
      value: '',
    },
    direccion: {
      label: 'Dirección',
      id: 'direccion',
      value: '',
    },
  };

  lstGiros: Giro[] = [];
  codUnico: number = 0;

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    const self = this;
    let r = this.vr;

    Validator.extend('NombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Cliente Proveedor de GPS con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${
                self.controller
                //va 0 porque nunca se va a encontrar
              }/ChequearNombreUnico/${self.codUnico}/${value}`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data.value,
                  data: response.data.value
                    ? undefined
                    : {
                        message:
                          '* Ya existe un Cliente Proveedor de GPS con este nombre.',
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

    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.Rut(value),
            data: r.Rut(value)
              ? undefined
              : {
                  message: '* Rut inválido',
                },
          });
        });
      },
    });

    Validator.extend('rutFormato', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFormatoRut(value),
            data: r.validaFormatoRut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });

    Validator.extend('RutUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Cliente Proveedor de GPS con este Rut.';
      },
      validate(value: any) {
        if (value !== '' && value.length >= 9) {
          return self.axios.http
            .get(
              `${
                self.controller
                //va 0 porque nunca se va a encontrar
              }/ChequearRutUnico/${self.codUnico}/${value}`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data.value,
                  data: response.data.value
                    ? undefined
                    : {
                        message:
                          '* Ya existe un Cliente Proveedor de GPS con este Rut.',
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

    this.getGiros();
    this.handleFormChange(this.formFields);
    this.handlecalibracionSeleccionadaChange();
  }

  @Watch('clienteProveedorSeleccionado', { deep: true })
  handlecalibracionSeleccionadaChange() {
    if (!this.clienteProveedorSeleccionado) {
      return;
    }

    this.codUnico = this.clienteProveedorSeleccionado.id;

    const { formFields, clienteProveedorSeleccionado } = this;
    formFields.rut.value = clienteProveedorSeleccionado.rut;
    formFields.nombre.value = clienteProveedorSeleccionado.nombre;
    formFields.direccion.value = clienteProveedorSeleccionado.direccion;
    formFields.activo.value =
      clienteProveedorSeleccionado.estado === 1
        ? EstadoEntidad.Activo
        : EstadoEntidad.Inactivo;
    formFields.giro.value = clienteProveedorSeleccionado.giroId;
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          rut: fields.rut.value,
          nombre: fields.nombre.value,
          direccion: fields.direccion.value,
          estado: fields.activo.value
            ? EstadoEntidad.Activo
            : EstadoEntidad.Inactivo,
          idGiro: fields.giro.value,
        } as ClienteProveedor,
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange(this.formFields);
  }

  async getGiros() {
    this.lstGiros = (await this.cargarGiros()) || [];
  }

  cargarGiros() {
    this.loadingService.showLoading();
    return fetchGiro()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Giros',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    if (!isActivo) {
      if (this.tieneAsociaciones()) {
        this.warningInactivo =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
      } else {
        this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      }
    } else {
      this.warningInactivo = '';
    }
  }

  tieneAsociaciones() {
    if (!this.clienteProveedorSeleccionado) {
      return false;
    }
    if (this.clienteProveedorSeleccionado.proveedorId.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
</script>

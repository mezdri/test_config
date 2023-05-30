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
            <FormFieldsContainer titulo="Contacto Técnico">
              <slot name="prependContactoTecnico" />
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.tecnicoNombre.label"
                  v-validate="'max:80'"
                  :error-messages="errors.collect(formFields.tecnicoNombre.id)"
                  :data-vv-name="formFields.tecnicoNombre.id"
                  v-model="formFields.tecnicoNombre.value"
                  counter="80"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.tecnicoEmail.label"
                  v-validate="{
                    max: 200,
                    email: true,
                    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                  }"
                  :error-messages="errors.collect(formFields.tecnicoEmail.id)"
                  :data-vv-name="formFields.tecnicoEmail.id"
                  v-model="formFields.tecnicoEmail.value"
                  counter="200"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.tecnicoTelefono.label"
                  placeholder="56999999999"
                  v-validate="'max:11|telefonoFormato'"
                  :error-messages="
                    errors.collect(formFields.tecnicoTelefono.id)
                  "
                  :data-vv-name="formFields.tecnicoTelefono.id"
                  v-model="formFields.tecnicoTelefono.value"
                  counter="11"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer titulo="Contacto Comercial">
              <slot name="prependContactoTecnico" />
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.comercialNombre.label"
                  v-validate="'max:80'"
                  :error-messages="
                    errors.collect(formFields.comercialNombre.id)
                  "
                  :data-vv-name="formFields.comercialNombre.id"
                  v-model="formFields.comercialNombre.value"
                  counter="80"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.comercialEmail.label"
                  v-validate="{
                    max: 200,
                    email: true,
                    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                  }"
                  :error-messages="errors.collect(formFields.comercialEmail.id)"
                  :data-vv-name="formFields.comercialEmail.id"
                  v-model="formFields.comercialEmail.value"
                  counter="200"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.comercialTelefono.label"
                  placeholder="56999999999"
                  v-validate="'max:11|telefonoFormato'"
                  :error-messages="
                    errors.collect(formFields.comercialTelefono.id)
                  "
                  :data-vv-name="formFields.comercialTelefono.id"
                  v-model="formFields.comercialTelefono.value"
                  counter="11"
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

import { Proveedor } from './Proveedor';
import { fetchGiro } from '@/reusable/Giro/fetchGiro';
import { Giro } from '@/reusable/Giro/Giro';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class ProveedoresForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) nuncaEdit: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() proveedorSeleccionado: any;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly controller: string = 'Proveedor';
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
    tecnicoNombre: {
      label: 'Nombre',
      id: 'tecnicoNombre',
      value: '',
    },
    tecnicoEmail: {
      label: 'Correo Electrónico',
      id: 'tecnicoEmail',
      value: '',
    },
    tecnicoTelefono: {
      label: 'Teléfono Celular',
      id: 'tecnicoTelefono',
      value: '',
    },
    comercialNombre: {
      label: 'Nombre',
      id: 'comercialNombre',
      value: '',
    },
    comercialEmail: {
      label: 'Correo Electrónico',
      id: 'comercialEmail',
      value: '',
    },
    comercialTelefono: {
      label: 'Teléfono Celular',
      id: 'comercialTelefono',
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
        return '* Ya existe un Proveedor de GPS con este nombre.';
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
                          '* Ya existe un Proveedor de GPS con este nombre.',
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

    Validator.extend('telefonoFormato', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Campo contiene caracteres o formato inválido'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaFormatoTelefono(value),
            data: r.validaFormatoTelefono(value)
              ? undefined
              : { message: '* Campo contiene caracteres o formato inválido' },
          });
        });
      },
    });

    Validator.extend('RutUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Proveedor de GPS con este Rut.';
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
                          '* Ya existe un Proveedor de GPS con este Rut.',
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

  @Watch('proveedorSeleccionado', { deep: true })
  handlecalibracionSeleccionadaChange() {
    if (!this.proveedorSeleccionado) {
      return;
    }

    this.codUnico = this.proveedorSeleccionado.id;

    const { formFields, proveedorSeleccionado } = this;
    formFields.rut.value = proveedorSeleccionado.rut;
    formFields.nombre.value = proveedorSeleccionado.nombre;
    formFields.direccion.value = proveedorSeleccionado.direccion;
    formFields.comercialNombre.value = proveedorSeleccionado.comercialNombre;
    formFields.comercialTelefono.value =
      proveedorSeleccionado.comercialTelefono;
    formFields.comercialEmail.value = proveedorSeleccionado.comercialEmail;
    formFields.tecnicoNombre.value = proveedorSeleccionado.tecnicoNombre;
    formFields.tecnicoTelefono.value = proveedorSeleccionado.tecnicoTelefono;
    formFields.tecnicoEmail.value = proveedorSeleccionado.tecnicoEmail;
    formFields.activo.value =
      proveedorSeleccionado.estado === 1
        ? EstadoEntidad.Activo
        : EstadoEntidad.Inactivo;
    formFields.giro.value = proveedorSeleccionado.giroId;
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
          comercialNombre: fields.comercialNombre.value,
          comercialTelefono: fields.comercialTelefono.value,
          comercialEmail: fields.comercialEmail.value,
          tecnicoNombre: fields.tecnicoNombre.value,
          tecnicoTelefono: fields.tecnicoTelefono.value,
          tecnicoEmail: fields.tecnicoEmail.value,
          estado: fields.activo.value
            ? EstadoEntidad.Activo
            : EstadoEntidad.Inactivo,
          idGiro: fields.giro.value,
        } as Proveedor,
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
          'Al dejar como inactivo, no se podrán realizar asociaciones';
      } else {
        this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      }
    } else {
      this.warningInactivo = '';
    }
  }

  tieneAsociaciones() {
    if (!this.proveedorSeleccionado) {
      return false;
    }
    if (this.proveedorSeleccionado.clienteProveedorId.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
</script>

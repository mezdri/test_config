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
          <v-container grid-list-md style="padding: 50px 90px 70px 90px;">
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs6 sm6 md6 class="pr" v-show="modoVer">
                <v-text-field
                  :label="formFields.nroCaso.label"
                  :error-messages="errors.collect(formFields.nroCaso.id)"
                  :data-vv-name="formFields.nroCaso.id"
                  v-model="formFields.nroCaso.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12></v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  :label="formFields.nombre.label"
                  v-validate="'required|max:80'"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  counter="80"
                  :disabled="modoVer"
                  readonly
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-text-field
                  :label="formFields.apellido.label"
                  v-validate="'required|max:80'"
                  :error-messages="errors.collect(formFields.apellido.id)"
                  :data-vv-name="formFields.apellido.id"
                  v-model="formFields.apellido.value"
                  counter="80"
                  :disabled="modoVer"
                  readonly
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  :label="formFields.telefono.label"
                  placeholder="56999999999"
                  v-validate="'required|max:11|telefonoFormato'"
                  :error-messages="errors.collect(formFields.telefono.id)"
                  :data-vv-name="formFields.telefono.id"
                  v-model="formFields.telefono.value"
                  counter="11"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-text-field
                  :label="formFields.correoElectronico.label"
                  v-validate="{
                    email: true,
                    max: 200,
                    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                  }"
                  :error-messages="
                    errors.collect(formFields.correoElectronico.id)
                  "
                  :data-vv-name="formFields.correoElectronico.id"
                  v-model="formFields.correoElectronico.value"
                  counter="200"
                  :disabled="modoVer"
                  readonly
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-select
                  :label="formFields.categoria.label"
                  :error-messages="errors.collect(formFields.categoria.id)"
                  :data-vv-name="formFields.categoria.id"
                  v-model="formFields.categoria.value"
                  :items="lstCategorias"
                  item-text="categoria"
                  item-value="idCategoria"
                  @change="getSubCategorias(formFields.categoria.value)"
                  v-validate="'required'"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pl">
                <v-select
                  :label="formFields.subCategoria.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.subCategoria.id)"
                  :data-vv-name="formFields.subCategoria.id"
                  v-model="formFields.subCategoria.value"
                  :items="subfiltradas"
                  item-text="subcategoria"
                  item-value="idSubcategoria"
                  :disabled="modoVer || formFields.categoria.value === ''"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 class="pr">
                <v-text-field
                  :label="formFields.titulo.label"
                  v-validate="'max:80'"
                  :error-messages="errors.collect(formFields.titulo.id)"
                  :data-vv-name="formFields.titulo.id"
                  v-model="formFields.titulo.value"
                  counter="80"
                  :disabled="modoVer"
                  v-show="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-textarea
                  :label="formFields.descripcion.label"
                  v-validate="'required|max:1000'"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  counter="1000"
                  :readonly="modoVer"
                  :auto-grow="true"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-divider class="spacer"></v-divider>
              </v-flex>
              <v-flex xs6 sm6 md6 v-show="modoVer" class="pr">
                <v-text-field
                  :label="formFields.estadoCaso.label"
                  :error-messages="errors.collect(formFields.estadoCaso.id)"
                  :data-vv-name="formFields.estadoCaso.id"
                  v-model="formFields.estadoCaso.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 v-show="modoVer" class="pl">
                <v-text-field
                  :label="formFields.fechaResolucion.label"
                  :error-messages="
                    errors.collect(formFields.fechaResolucion.id)
                  "
                  :data-vv-name="formFields.fechaResolucion.id"
                  v-model="formFields.fechaResolucion.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12 v-show="modoVer">
                <v-textarea
                  :label="formFields.resolucion.label"
                  v-validate="'max:1000'"
                  :error-messages="errors.collect(formFields.resolucion.id)"
                  :data-vv-name="formFields.resolucion.id"
                  v-model="formFields.resolucion.value"
                  :readonly="modoVer"
                  :auto-grow="true"
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
import store from '@/store';
import { Validator } from 'vee-validate';
// import HandleErrors from '@/config/handleErrors';
import moment from 'moment';
import {
  emitFormChangeEvent,
  // formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { EstadoEntidad } from '../../config/enums';
import ValidaRut from '@/config/validaRut';
import { LoadingService } from '@/services/loadingService';
import _ from 'lodash';

// import { Proveedor } from './Proveedor';//borrar
import { Solicitud } from './Solicitud';
import {
  fetchCategorias,
  Categorias,
} from '@/pantallas/Solicitudes/fetchCategorias';
import {
  fetchSubCategorias,
  SubCategorias,
} from '@/pantallas/Solicitudes/fetchSubcategorias';
import { CreacionSolicitud } from '@/pantallas/Solicitudes/crearSolicitud';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class SolicitudForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop() solicitudSeleccionada: any;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  mensajeEstado: string = '';
  bloquedoCategoria: boolean = true;

  vr: ValidaRut = new ValidaRut();

  formFields: FormFieldDefMap = {
    nroCaso: {
      label: 'Nro. de Caso',
      id: 'nroCaso',
      value: '',
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    apellido: {
      label: 'Apellido',
      id: 'rut',
      value: '',
    },
    telefono: {
      label: 'Teléfono',
      id: 'telefono',
      value: '',
    },
    correoElectronico: {
      label: 'Correo Electrónico',
      id: 'correoElectronico',
      value: '',
    },
    categoria: {
      label: 'Categoría',
      id: 'categoria',
      value: '',
    },
    subCategoria: {
      label: 'Subcategoría',
      id: 'subCategoria',
      value: '',
    },
    titulo: {
      label: 'Titulo',
      id: 'titulo',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    estadoCaso: {
      label: 'Estado del Caso',
      id: '',
      value: '',
    },
    fechaResolucion: {
      label: 'Fecha de Resolución',
      id: '',
      value: '',
    },
    resolucion: {
      label: 'Resolucion',
      id: '',
      value: '',
    },
  };

  lstCategorias: Categorias[] = [];
  ltsSubCategorias: SubCategorias[] = [];
  subfiltradas: SubCategorias[] = [];

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    const self = this;
    let r = this.vr;
    var _ = require('lodash');

    if (this.modoVer) {
      this.getSubCategorias();
    }

    const { formFields } = this;
    formFields.nombre.value = store.state.user.nombre;
    formFields.apellido.value =
      store.state.user.apellidoPaterno + ' ' + store.state.user.apellidoMaterno;
    formFields.correoElectronico.value = store.state.user.email;
    //formFields.telefono.value = store.state.user.nombre;

    this.getCategorias();
    if (this.modoVer) {
      this.getSubCategoriasModoVer();
    }
    this.handleFormChange();
    this.handlecalibracionSeleccionadaChange();

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
  }

  @Watch('solicitudSeleccionada', { deep: true })
  handlecalibracionSeleccionadaChange() {
    if (!this.solicitudSeleccionada) {
      return;
    }

    let categoria: any = {};
    let subCategoria: any = {};
    categoria.idCategoria = this.solicitudSeleccionada.idCategoria
      ? this.solicitudSeleccionada.idCategoria
      : '';
    categoria.categoria = this.solicitudSeleccionada.categoria
      ? this.solicitudSeleccionada.categoria
      : '';
    subCategoria.idSubcategoria = this.solicitudSeleccionada.idSubcategoria
      ? this.solicitudSeleccionada.idSubcategoria
      : '';
    subCategoria.subcategoria = this.solicitudSeleccionada.subcategoria
      ? this.solicitudSeleccionada.subcategoria
      : '';

    const { formFields, solicitudSeleccionada } = this;
    formFields.nroCaso.value = this.solicitudSeleccionada.numeroResolucion
      ? this.solicitudSeleccionada.numeroResolucion
      : '';
    formFields.nombre.value = this.solicitudSeleccionada.nombres
      ? this.solicitudSeleccionada.nombres
      : '';
    formFields.apellido.value = this.solicitudSeleccionada.apellidos
      ? this.solicitudSeleccionada.apellidos
      : '';
    formFields.telefono.value = this.solicitudSeleccionada.telefono
      ? this.solicitudSeleccionada.telefono
      : '';
    formFields.correoElectronico.value = this.solicitudSeleccionada.email
      ? this.solicitudSeleccionada.email
      : '';
    formFields.categoria.value = categoria.idCategoria;
    formFields.subCategoria.value = subCategoria.idSubcategoria;
    formFields.titulo.value = this.solicitudSeleccionada.titulo
      ? this.solicitudSeleccionada.titulo
      : '';
    formFields.descripcion.value = this.solicitudSeleccionada.descripcion
      ? this.solicitudSeleccionada.descripcion
      : '';
    formFields.estadoCaso.value = this.solicitudSeleccionada.estado
      ? this.solicitudSeleccionada.estado
      : '';
    formFields.fechaResolucion.value = this.solicitudSeleccionada
      .fechaResolucion
      ? this.solicitudSeleccionada.fechaResolucion
      : '';
    formFields.resolucion.value = this.solicitudSeleccionada.resolucion
      ? this.solicitudSeleccionada.resolucion
      : '';
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          ContactoNombre: this.formFields.nombre.value,
          ContactoApellidos: this.formFields.apellido.value,
          ContactoTelefono: this.formFields.telefono.value,
          ContactoEmail: this.formFields.correoElectronico.value,
          Titulo: this.formFields.titulo.value,
          Descripcion: this.formFields.descripcion.value,
          Categoria: this.formFields.categoria.value,
          Subcategoria: this.formFields.subCategoria.value,
        } as any, //type CreacionSolicitud
      },
      this
    );
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  async getCategorias() {
    this.lstCategorias = (await this.cargarCategorias()) || [];
  }

  cargarCategorias() {
    this.loadingService.showLoading();
    return fetchCategorias()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Categorias',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  async getSubCategorias(categoria?: string) {
    this.bloquedoCategoria = false;
    this.subfiltradas = [];
    this.ltsSubCategorias = (await this.cargarSubcategorias()) || [];
    this.ltsSubCategorias.map(x => {
      if (x.idCategoria == categoria) {
        this.subfiltradas.push(x);
      }
    });
  }

  async getSubCategoriasModoVer(categoria?: string) {
    this.subfiltradas = [];
    this.subfiltradas = (await this.cargarSubcategorias()) || [];
  }

  cargarSubcategorias() {
    this.loadingService.showLoading();
    return fetchSubCategorias()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de Subcategorias',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>
<style scoped>
.pr {
  padding-right: 25px !important;
}
.pl {
  padding-left: 25px !important;
}
.spacer {
  margin: 30px 0 30px 0 !important;
}
</style>

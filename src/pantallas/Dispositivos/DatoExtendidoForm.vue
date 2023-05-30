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
            <FormFieldsContainer :titulo="titulo[editar]">
              <v-flex sm6 md6>
                <v-text-field
                  :label="formFields.trama.label"
                  :error-messages="errors.collect(formFields.trama.id)"
                  :data-vv-name="formFields.trama.id"
                  v-model="formFields.trama.value"
                  v-validate="'required|max:10|SinEspacioTrama'"
                  :counter="10"
                  :disabled="esEditar"
                  :data-testid="`${testId}--trama`"
                />
              </v-flex>
              <v-flex sm6 md6>
                <v-text-field
                  :label="formFields.posicion.label"
                  :error-messages="errors.collect(formFields.posicion.id)"
                  :data-vv-name="formFields.posicion.id"
                  v-model="formFields.posicion.value"
                  v-validate="'required|numeric|max:10'"
                  :counter="10"
                  :disabled="esEditar"
                  :data-testid="`${testId}--posicion`"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="
                    `max:80|required|NombreUnicoFront|NombreUnicoBack|alpha_dash`
                  "
                  :data-vv-name="formFields.nombre.id"
                  :id="formFields.nombre.id"
                  counter="80"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-testid="`${testId}--nombre`"
                />
              </v-flex>
              <v-flex sm6 md6>
                <v-select
                  :items="tiposMedida"
                  :label="formFields.medida.label"
                  :data-vv-name="formFields.medida.id"
                  v-model="formFields.medida.value"
                  no-data-text="Sin resultados"
                  item-text="nombre"
                  item-value="id"
                  :data-testid="`${testId}--tipoMedida`"
                ></v-select>
              </v-flex>
              <v-flex sm6 md6>
                <v-text-field
                  :label="formFields.descripcion.label"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  v-validate="'max:200|required'"
                  :counter="200"
                  :data-testid="`${testId}--descripcion`"
                />
              </v-flex>
              <v-flex sm6 md6>
                <v-text-field
                  :label="formFields.link.label"
                  :error-messages="errors.collect(formFields.link.id)"
                  :data-vv-name="formFields.link.id"
                  v-validate="'max:2000|SinEspacioLink'"
                  :counter="2000"
                  v-model="formFields.link.value"
                  :data-testid="`${testId}--link`"
                />
              </v-flex>
              <v-flex sm1 md1 v-if="iconoUrl !== ''">
                <img
                  v-if="iconoUrl !== ''"
                  :src="iconoUrl"
                  height="50"
                  alt="icono"
                />
              </v-flex>
              <v-flex
                :sm5="iconoUrl !== ''"
                :sm6="iconoUrl == ''"
                :md5="iconoUrl !== ''"
                :md6="iconoUrl == ''"
              >
                <v-text-field
                  label="Ícono"
                  heigh
                  @click="$refs.image.click()"
                  v-model="icono.name"
                  prepend-icon="attach_file"
                  readonly="readonly"
                ></v-text-field>
                <input
                  type="file"
                  style="display: none;"
                  ref="image"
                  accept="image/png, image/jpeg"
                  @change="onFilePicked"
                />
              </v-flex>
              <v-flex md12>
                <div align="left">
                  <h2>
                    Condición Visible
                    <v-btn flat icon small @click="handleValidarRespuestaClick">
                      <v-icon color="#228B22">play_arrow</v-icon>
                    </v-btn>
                  </h2>
                </div>
                <v-divider></v-divider>
              </v-flex>
              <v-flex md12>
                <CodeView
                  @blur="handleMapeoRespuestaBlur"
                  v-model="formFields.valorScript.value"
                  :data-vv-name="formFields.valorScript.id"
                ></CodeView>
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
      <ValidarRespuestaModal
        :show="muestraModalValidar"
        :script="formFields.valorScript.value"
        @cerrar="handleCierreModal($event)"
      ></ValidarRespuestaModal>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { fetchTiposMedida } from '@/pantallas/TipoMedida/fetchTiposDeMedida';
import CodeView from '@/reusable/CodeView/CodeView.vue';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import {
  DatoExtendido,
  DatoExtendidoNuevo,
} from '@/pantallas/Dispositivos/Dispositivos';
import { TipoMedidaNuevo as TipoMedidaType } from '@/pantallas/TipoMedida/TipoMedida';
import ValidarRespuestaModal from '@/pantallas/Dispositivos/ValidarRespuestaModal.vue';

@Component({
  components: {
    FormFieldsContainer,
    CodeView,
    ValidarRespuestaModal,
  },
})
export default class DatoExtendidoForm extends Vue {
  @Prop({ required: false }) datoSeleccionado: DatoExtendido;
  @Prop({ required: false }) testId: string;
  @Prop({ required: false }) datoExtendido: DatoExtendido[];
  @Prop({ required: false }) dispositivoId: number;
  @Prop({ required: true }) editar: number;
  @Prop({}) esEditar: boolean;

  isFormValid: boolean = false;
  idDispositivo: number =
    this.dispositivoId == undefined ? 0 : this.dispositivoId;
  iconoUrl = '';
  iconoBase64: string = '';
  icono: any = {};
  tiposMedida: TipoMedidaType[] = [];
  message = [
    '* Ya existe un Dato Extendido con este nombre.',
    '* El campo Trama no debe contener espacios',
    '* El campo Link no debe contener espacios',
  ];
  titulo = ['Agregar Dato Extendido', 'Editar Dato Extendido'];
  nombreActual = '';

  valorScript: string = '';
  muestraModalValidar: boolean = false;

  handleMapeoRespuestaBlur(valor: string) {
    this.valorScript = valor;
    this.formFields.valorScript.value = valor;
    //this.$emit('blur', valor);
  }

  handleValidarRespuestaClick() {
    this.muestraModalValidar = true;
  }

  handleCierreModal(script: string) {
    this.muestraModalValidar = false;
    this.formFields.valorScript.value = script;
  }

  formFields: FormFieldDefMap = {
    trama: {
      label: 'Trama',
      id: 'trama',
      value: '',
    },
    posicion: {
      label: 'Posición',
      id: 'posicion',
      value: '',
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    medida: {
      label: 'Medida',
      id: 'medida',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    icono: {
      label: 'Ícono',
      id: 'icono',
      value: '',
    },
    link: {
      label: 'Link',
      id: 'link',
      value: '',
    },
    valorScript: {
      label: 'Condición Visible',
      id: 'valorScript',
      value: '',
    },
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* handle */

  @Watch('datoSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    this.tiposMedida = (await this.fetchTipoMedidas()) || [];
    if (!this.datoSeleccionado) {
      this.formFields.valorScript.value = 'true';
      return;
    }
    if (this.datoSeleccionado.iconoBase64 != '') {
      this.iconoUrl =
        'data:image/jpg;base64,' + this.datoSeleccionado.iconoBase64;
    }
    this.nombreActual = this.datoSeleccionado.nombre;
    this.formFields.nombre.value = this.datoSeleccionado.nombre;
    this.formFields.descripcion.value = this.datoSeleccionado.descripcion;
    this.formFields.trama.value = this.datoSeleccionado.trama;
    this.iconoBase64 = this.datoSeleccionado.iconoBase64;
    this.formFields.link.value = this.datoSeleccionado.link;
    this.formFields.posicion.value = this.datoSeleccionado.posicion;
    this.formFields.medida.value = this.datoSeleccionado.tipoMedidaId;
    this.formFields.valorScript.value = this.datoSeleccionado.scriptMostrar;
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: this.formFields.nombre.value,
          trama: this.formFields.trama.value,
          posicion: this.formFields.posicion.value,
          descripcion: this.formFields.descripcion.value,
          link: this.formFields.link.value,
          iconoBase64: this.iconoBase64,
          tipoMedidaId: this.formFields.medida.value,
          dispositivoId: this.idDispositivo,
          scriptMostrar: this.formFields.valorScript.value,
        } as DatoExtendidoNuevo,
      },
      this
    );
  }

  fetchTipoMedidas() {
    this.loadingService.showLoading();
    return fetchTiposMedida()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de dispositivos. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  constructor() {
    super();
    this.registrarValidadores();
  }

  registrarValidadores() {
    const self = this;

    Validator.extend('NombreUnicoFront', {
      getMessage(field: any, params: any, data: any) {
        return self.message[0];
      },
      validate(value: string) {
        const index = self.datoExtendido.findIndex(
          item => item.nombre === value
        );
        if (value === self.nombreActual) {
          return true;
        }
        if (index === -1) {
          return true;
        } else {
          return false;
        }
      },
    });
    Validator.extend('SinEspacioTrama', {
      getMessage(field: any, params: any, data: any) {
        return self.message[1];
      },
      validate(value: string) {
        const resultado = value.indexOf(' ');
        if (resultado === -1) {
          return true;
        } else {
          return false;
        }
      },
    });
    Validator.extend('SinEspacioLink', {
      getMessage(field: any, params: any, data: any) {
        return self.message[2];
      },
      validate(value: string) {
        const resultado = value.indexOf(' ');
        if (resultado === -1) {
          return true;
        } else {
          return false;
        }
      },
    });
    Validator.extend('NombreUnicoBack', {
      getMessage(field: any, params: any, data: any) {
        return self.message[0];
      },
      validate(value: any) {
        const axios = new AxiosVue(ServicioProxy.Dispositivo);
        if (value === self.nombreActual) {
          return true;
        }
        return axios.http
          .get(
            `dispositivo/ChequearNombreUnicoDae/${self.dispositivoId}/${value}`
          )
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: !response.data,
                data: !response.data
                  ? undefined
                  : {
                      message: self.message,
                    },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
  }

  mounted() {
    const validator = makeValidatorDictionary(this.formFields);
    validator.custom.nombre.alpha_dash =
      '* El campo Nombre de Dato Extendido solo debe contener letras, números y/o guiones bajos.';
    this.$validator.localize('es', validator);
    this.handleFormChange();
    this.handleSeleccionadoChange();
  }

  /*Util */

  async onFilePicked(e: any) {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (files[0] !== undefined) {
      const file = e.target.files[0];
      fileReader.readAsDataURL(file);

      await fileReader.addEventListener('load', () => {
        this.icono = file;
        this.iconoUrl = String(fileReader.result);
        this.iconoBase64 = String(fileReader.result).split(',')[1];
        this.emitFormChangeIcono(this.iconoBase64);
      });
    } else {
      this.icono = {};
      this.iconoUrl = '';
      this.iconoBase64 = '';
      this.emitFormChange();
    }
  }

  emitFormChangeIcono(base64: any) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        nombre: this.formFields.nombre.value,
        trama: this.formFields.trama.value,
        posicion: this.formFields.posicion.value,
        descripcion: this.formFields.descripcion.value,
        link: this.formFields.link.value,
        iconoBase64: base64,
        tipoMedidaId: this.formFields.medida.value,
        dispositivoId: this.idDispositivo,
        scriptMostrar: this.formFields.valorScript.value,
      } as DatoExtendidoNuevo,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

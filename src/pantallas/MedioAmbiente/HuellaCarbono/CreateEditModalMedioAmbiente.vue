<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="modal_title" @cerrar="handleCloseModal">
      <v-btn class="button" id="btnGuardar" @click="handleSaveComand">
        <span class="text">
          <slot>Guardar</slot>
        </span>
      </v-btn>
    </CabeceraModalCrear>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.informacionGeneral.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.informacionGeneral.visible"
          color="primary"
          flat
          :value="pasos.informacionGeneral.step"
        >
          <v-icon
            small
            style="margin-bottom: -10px !important; margin-top: 6px !important;"
            >{{ getIconModal }}
          </v-icon>
          <span>{{ modal_title }}</span>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew">
      <br />
      <div id="formDiv">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-form
              ref="form"
              v-model="isFormValid"
              lazy-validation
              class="col-md-12"
            >
              <v-container grid-list-md>
                <FormFieldsContainer :titulo="modal_title">
                  <slot name="prependInformacionGeneral" />
                  <v-flex xs12 sm6 md6>
                    <v-combobox
                      :label="formFields.marca.label"
                      v-model="formFields.marca.value"
                      :items="formFields.marca.items"
                      item-text="configvalor"
                      item-value="configid"
                      @input="handleInputValue"
                      @change="loadModel"
                      v-validate="'required'"
                      :disabled="modal_action == 'editar'"
                    ></v-combobox>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-combobox
                      :label="formFields.modelo.label"
                      v-model="formFields.modelo.value"
                      :items="formFields.modelo.items"
                      item-text="configvalor"
                      item-value="configid"
                      v-validate="'required'"
                      :disabled="modal_action == 'editar'"
                      @input="handleInputValue"
                    ></v-combobox>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="formFields.emision_co2.value"
                      :label="formFields.emision_co2.label"
                      @input="handleInputValue"
                      v-validate="'required|co2|max:10'"
                      :error-messages="errors.collect('co2')"
                      data-vv-name="co2"
                      required
                    ></v-text-field>
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </div>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { LoadingService } from '@/services/loadingService';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { HuellaCarbonoService } from '@/pantallas/MedioAmbiente/HuellaCarbono/HuellaCarbonoService';
import MedioAmbienteInstance from '@/pantallas/MedioAmbiente/comunes/Instances';
import config from '@/config';
import { Validator } from 'vee-validate';

@Component({
  name: 'CreateEditModalMedioAmbiente',
  components: { ModalMantenedor, CabeceraModalCrear, FormFieldsContainer },
})
export default class CreateEditModalMedioAmbiente extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: '' }) modal_title: string;
  @Prop({ default: '' }) modal_action: string;
  @Prop({ default: {} }) parametros: any;
  //@ts-ignore
  $snotify: any;
  pasoActivoIndex = 1;
  huellaCarbonoService = new HuellaCarbonoService();
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  isLoading: boolean = false;
  validForm: boolean = true;
  isFormValid: boolean = false;
  loadingService = new LoadingService();
  formFields: {
    marca: { items: any[]; value: any; label: string };
    modelo: { modelDict: any; items: any[]; value: any; label: string };
    emision_co2: { value: any; label: string };
  } = {
    marca: {
      items: [],
      value: null,
      label: 'Seleccione la marca o ingrese una diferente',
    },
    modelo: {
      modelDict: {},
      items: [],
      value: null,
      label: 'Seleccione el modelo o ingrese uno diferente',
    },
    emision_co2: { label: 'Introduzca la emisión de co2', value: null },
  };

  clientId: string = '';
  dictionaryFormErrors: any = {};
  validaDigitos: any = (rut: string): boolean => {
    let re: RegExp = new RegExp('^\\d+(\\.\\d+)?$');
    return re.test(rut);
  };

  created() {
    let _self = this;
    Validator.extend('co2', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Co2 inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: _self.validaDigitos(value),
            data: _self.validaDigitos(value)
              ? undefined
              : {
                  message: '* Co2 inválido',
                },
          });
        });
      },
    });
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        co2: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  handleCloseModal() {
    this.clearForm();
    this.$emit('closeModal');
  }

  async handleInputValue() {}

  async handleSaveComand() {
    const valideFields: boolean = await this.$validator.validateAll();
    if (valideFields) {
      var body: any = {
        marca: this.formFields.marca.value,
        modelo: this.formFields.modelo.value.hasOwnProperty('cod')
          ? this.formFields.modelo.value.cod
          : this.formFields.modelo.value,
        emision_co2: this.formFields.emision_co2.value,
        emision_co2_id: this.parametros.hasOwnProperty('emision_co2_id')
          ? this.parametros.emision_co2_id
          : '',
        id_usuario: this.getUserID().toString(),
        id_cliente: this.getClientID().toString(),
        action: this.modal_action,
      };
      this.saveData(body);
    } else {
      this.$snotify.error('Existen campos sin rellenar');
    }
  }

  async saveData(body: any) {
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.huellaCarbonoService.save_vehiculo(body);
    this.isLoading = false;
    const msRespose: any = axiosResponse.data;
    if (
      !msRespose.hasOwnProperty('CODIGO_RESPUESTA') ||
      msRespose.CODIGO_RESPUESTA != '1'
    ) {
      this.$snotify.error(
        this.modal_action == 'editar'
          ? 'Error al Actualizar'
          : 'Error al registrar el Vehiculo'
      );
    } else {
      this.$snotify.success(msRespose.MENSAJE_RESPUESTA);
      this.handleCloseModal();
      MedioAmbienteInstance.$emit('setServerSideDatasource');
    }
    this.loadingService.hideLoading();
  }

  clearForm() {
    this.validForm = false;
    this.formFields = {
      marca: { items: [], value: '', label: 'Seleccione una marca' },
      modelo: {
        modelDict: {},
        items: [],
        value: '',
        label: 'Seleccione un modelo',
      },
      emision_co2: { value: '', label: 'Introduzca la emisión de co2' },
    };
    this.$validator.reset();
  }

  @Watch('show', { immediate: true })
  onModalOpen() {
    if (this.show) {
      this.clientId = localStorage.getItem('clienteDefecto');
      this.loadMarks().finally(() => {
        this.loadModel().finally(() => {
          if (this.modal_action == 'editar') {
            this.loadEditParams();
          }
        });
      });
    }
  }

  loadEditParams() {
    let _self = this;
    this.formFields.emision_co2.value = this.parametros.hasOwnProperty(
      'emision_co2'
    )
      ? this.parametros.emision_co2
      : '';
    this.formFields.marca.value = this.parametros.hasOwnProperty('marca_id')
      ? this.formFields.marca.items.find(item => {
          return item.configid == this.parametros.marca_id;
        })
      : '';
    this.loadModel().finally(() => {
      _self.formFields.modelo.value = _self.parametros.hasOwnProperty(
        'modelo_id'
      )
        ? _self.formFields.modelo.items.find(item => {
            return item.configid == _self.parametros.modelo_id;
          })
        : '';
    });
  }

  async loadMarks() {
    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.huellaCarbonoService.get_marcas(this.clientId);
    this.isLoading = false;
    const msRespose: any = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA == '1') {
      this.formFields.marca.items = msRespose.marcas;
    } else {
      this.formFields.marca.items = [];
    }
  }

  async loadModel() {
    let self = this;
    let marca = this.formFields.marca.value;
    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.huellaCarbonoService.get_modelos(this.clientId, marca);
    this.isLoading = false;
    const msRespose: any = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA == '1') {
      this.formFields.modelo.items = msRespose.MODELO;
    } else {
      this.formFields.modelo.items = [];
    }
  }

  handleInfoGeneral() {}

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }

  get getIconModal() {
    let iconName: string = '';
    switch (this.modal_action) {
      case 'crear':
        iconName = 'add';
        break;
      case 'editar':
        iconName = 'edit';
        break;
    }
    return iconName;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
}
</script>

<style scoped>
.button {
  background-color: #ff6c00 !important;
  max-height: 75% !important;
}
</style>

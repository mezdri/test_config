<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="modal_title" @cerrar="handleCloseModal">
      <v-btn class="button" id="btnGuardar" @click="handleSaveComand">
        <span class="text">
          <slot>Guardar</slot>
        </span>
      </v-btn></CabeceraModalCrear
    >
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
            >{{ getIconModal }}</v-icon
          >
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
                      :items="formFields.marca.items"
                      v-model="formFields.marca.value"
                      :label="formFields.marca.label"
                      @change="onChangeMark"
                      @input="handleInputValue"
                      v-validate="'required'"
                      data-vv-name="marcaComandoSMSValidar"
                      :error-messages="errors.collect('marcaComandoSMSValidar')"
                      required
                    ></v-combobox>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-combobox
                      :items="formFields.modelo.items"
                      v-model="formFields.modelo.value"
                      :label="formFields.modelo.label"
                      @input="handleInputValue"
                      item-text="desc"
                      item-value="cod"
                      v-validate="'required'"
                      data-vv-name="modeloComandoSMSValidar"
                      :error-messages="
                        errors.collect('modeloComandoSMSValidar')
                      "
                      required
                    ></v-combobox>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-autocomplete
                      :items="formFields.tipo_envio.items"
                      v-model="formFields.tipo_envio.value"
                      :label="formFields.tipo_envio.label"
                      @input="handleInputValue"
                      item-text="desc"
                      item-value="cod"
                      v-validate="'required'"
                      data-vv-name="tipoEnvioComandoSMSValidar"
                      :error-messages="
                        errors.collect('tipoEnvioComandoSMSValidar')
                      "
                      required
                    ></v-autocomplete>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="formFields.tipo_comando.value"
                      :label="formFields.tipo_comando.label"
                      @input="handleInputValue"
                      v-validate="'required'"
                      data-vv-name="tipoComandoSMSValidar"
                      :error-messages="errors.collect('tipoComandoSMSValidar')"
                      required
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="formFields.descripcion.value"
                      :label="formFields.descripcion.label"
                      @input="handleInputValue"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="formFields.comando_sms.value"
                      :label="formFields.comando_sms.label"
                      @input="handleInputValue"
                      v-validate="'required'"
                      data-vv-name="comandoSMSRequeridoValidar"
                      :error-messages="
                        errors.collect('comandoSMSRequeridoValidar')
                      "
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
import { fetchSMS } from '@/pantallas/TorreControl/fetchSMS';
import { LoadingService } from '@/services/loadingService';

@Component({
  components: { ModalMantenedor, CabeceraModalCrear, FormFieldsContainer },
})
export default class ConfiguracionComandosSMSModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: '' }) modal_title: string;
  @Prop({ default: '' }) modal_action: string;
  @Prop({ default: {} }) command_data: any;
  //@ts-ignore
  $snotify: any;
  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  validForm: boolean = true;
  isFormValid: boolean = false;
  loadingService = new LoadingService();
  formFields: {
    marca: { items: any[]; value: any; label: string };
    modelo: { modelDict: any; items: any[]; value: any; label: string };
    tipo_envio: { items: any[]; value: any; label: string };
    tipo_comando: { value: string; label: string };
    descripcion: { value: string; label: string };
    comando_sms: { value: string; label: string };
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
    tipo_envio: {
      items: [
        { desc: 'Sms', cod: 'sms' },
        { desc: 'Bluetooth', cod: 'bluetooth' },
      ],
      value: null,
      label: 'Seleccione el tipo de envío de comando',
    },
    tipo_comando: { value: '', label: 'Ingrese el tipo de comando' },
    descripcion: { value: '', label: 'Ingrese la descripción del comando' },
    comando_sms: { value: '', label: 'Ingrese el comando' },
  };

  handleCloseModal() {
    this.$emit('closeModal');
    this.clearForm();
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
        tipo_comando: this.formFields.tipo_comando.value,
        descripcion: this.formFields.descripcion.value,
        comando: this.formFields.comando_sms.value,
        id_usuario: this.getUserID().toString(),
        id_cliente: this.getClientID().toString(),
        tipo_envio: this.formFields.tipo_envio.value,
      };
      if (this.modal_action == 'crear') {
        this.saveComand(body);
      } else {
        body.id_comando = this.command_data.id;
        this.updateCommand(body);
      }
    }
  }

  saveComand(body: any) {
    this.loadingService.showLoading();
    fetchSMS(body, 'save_command')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al insertar el comando'
          );
        } else {
          this.$snotify.success(
            `El comando id ${response.data.id} se ha insertado con éxito`
          );
          this.handleCloseModal();
          this.$emit('reloadGrid');
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta del comando [save_command]'
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  updateCommand(body: any) {
    this.loadingService.showLoading();
    fetchSMS(body, 'update_command')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al actualizar el comando'
          );
        } else {
          this.$snotify.success(
            `El comando id ${response.data.id} se ha actualizado con éxito`
          );
          this.handleCloseModal();
          this.$emit('reloadGrid');
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta del comando [update_command]'
        );
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
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
      tipo_comando: { value: '', label: 'Ingrese el tipo de comando' },
      tipo_envio: {
        items: [
          { desc: 'Sms', cod: 'sms' },
          { desc: 'Bluetooth', cod: 'bluetooth' },
        ],
        value: null,
        label: 'Seleccione el tipo de envío de comando',
      },
      descripcion: { value: '', label: 'Ingrese la descripción del comando' },
      comando_sms: { value: '', label: 'Ingrese el comando' },
    };
    this.$validator.reset();
  }

  @Watch('show', { immediate: true })
  onModalOpen() {
    if (this.show) {
      this.loadMarks();
      this.loadModel();
      if (this.modal_action == 'editar') {
        this.loadEditParams();
      }
    }
  }

  loadEditParams() {
    this.formFields.comando_sms.value = this.command_data.hasOwnProperty(
      'comando'
    )
      ? this.command_data.comando
      : '';
    this.formFields.descripcion.value = this.command_data.hasOwnProperty(
      'descripcion'
    )
      ? this.command_data.descripcion
      : '';
    this.formFields.tipo_comando.value = this.command_data.hasOwnProperty(
      'tipo_comando'
    )
      ? this.command_data.tipo_comando
      : '';
    this.formFields.tipo_envio.value = this.command_data.hasOwnProperty(
      'tipo_envio'
    )
      ? this.command_data.tipo_envio
      : '';
    this.formFields.marca.value = this.command_data.hasOwnProperty('marca')
      ? this.command_data.marca
      : '';
    this.formFields.modelo.value = this.command_data.hasOwnProperty('modelo')
      ? this.command_data.modelo
      : '';
  }

  onChangeMark() {
    console.log(this.formFields.marca.value);
    if (
      this.formFields.modelo.modelDict[this.formFields.marca.value] == undefined
    ) {
      this.formFields.modelo.items = [];
    } else {
      this.formFields.modelo.items = this.formFields.modelo.modelDict[
        this.formFields.marca.value
      ];
    }
  }

  async loadMarks() {
    fetchSMS({}, 'get_mark')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener las marcas del gps'
          );
        } else {
          this.formFields.marca.items = response.data.data;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de las marcas [get_mark]'
        );
      })
      .finally(() => {});
  }

  async loadModel() {
    fetchSMS({}, 'get_model')
      .then((response: any) => {
        if (
          !response.data.hasOwnProperty('CODIGO_RESPUESTA') ||
          response.data.CODIGO_RESPUESTA != '1'
        ) {
          this.$snotify.error(
            response.data.hasOwnProperty('MENSAJE_RESPUESTA')
              ? response.data.MENSAJE_RESPUESTA
              : '[1] Error al obtener los modelos del gps'
          );
        } else {
          this.formFields.modelo.modelDict = response.data.data;
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error(
          'Error al obtener la respuesta de los modelos [get_model]'
        );
      })
      .finally(() => {
        if (this.modal_action == 'editar') {
          this.onChangeMark();
        }
      });
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

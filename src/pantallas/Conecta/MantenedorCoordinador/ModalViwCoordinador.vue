<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Detalle coordinador" @cerrar="handlePopUp">
      <div class="numero_sim">
        <div class="btn-editar">
          <v-btn @click="handleAdd" :disabled="anulado">
            {{ Object.keys(data).length === 0 ? 'Guardar' : 'Guardar Cambios' }}
          </v-btn>
        </div>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />

    <div align="center">
      <v-flex md10>
        <v-card class="rounded-card">
          <v-form ref="form" lazy-validation class="col-md-12">
            <v-container grid-list-md pt-30 px-40 pb-50>
              <FormFieldsContainer
                :titulo="
                  Object.keys(data).length === 0
                    ? 'Crear Coordinador'
                    : 'Editar Coordinador'
                "
              >
                <slot name="prependInformacionGeneral" />

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    label="Nombre Coordinador"
                    v-model="formFields.coorname.value"
                    :error="invalidName"
                    @input="validateName"
                    :disabled="anulado"
                    :class="{ 'red--text': invalidName }"
                  />
                  <div v-if="invalidName" class="alerta--error">
                    <span>*</span> {{ messageName }}
                  </div>
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    label="Apellido Coordinador"
                    v-model="formFields.coorapellido.value"
                    :error="invalidLastName"
                    @input="validateLastName"
                    :disabled="anulado"
                    :class="{ 'red--text': invalidLastName }"
                  />
                  <div v-if="invalidLastName" class="alerta--error">
                    <span>*</span> {{ messageLastName }}
                  </div>
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    label="Fecha Alta"
                    v-model="formFields.coorfecha_alta.value"
                    disabled
                  />
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-autocomplete
                    label="Estado"
                    v-model="formFields.coorbaja.value"
                    :items="opciones"
                    item-text="value"
                    item-value="id"
                    :disabled="!Object.keys(data).length || anulado"
                  />
                </v-flex>
              </FormFieldsContainer>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
    </div>

    <app-confirmacion
      :show="dialogPopUp"
      :titulo="'Confirmación'"
      :mensaje="
        `Al cerrar esta ventana toda la información
        ${Object.keys(data).length === 0 ? 'ingresada' : 'editada'}
        se perderá.
        ¿Está seguro que desea cerrar sin guardar?`
      "
      @modalConfirmationEmit="showPopuP($event)"
      :textoBtnSi="$t('No Guardar')"
      :textoBtnNo="
        $t(
          `${
            Object.keys(data).length === 0
              ? 'Continuar Creando'
              : 'Continuar Editando'
          }`
        )
      "
    >
    </app-confirmacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import { Vue, Component, Prop } from 'vue-property-decorator';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';

import { fetchMantenedorCoordinador } from '@/pantallas/Conecta/MantenedorCoordinador/fetchMantenedorCoordinador';
import { getDate } from './helpers/getDate';
import { getUserId } from './helpers/getUserId';
import { messagesError } from './helpers/messagesError';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    FormFieldsContainer,
    'app-confirmacion': Confirmation,
  },
})
export default class ModalViewCoordinador extends Vue {
  @Prop({ default: true, type: Boolean }) show: boolean;
  @Prop({ default: {}, type: Object }) data: any;
  @Prop({ default: true, type: Boolean }) anulado: any;

  readonly funcionalidad: Funcionalidades = Funcionalidades.coordinador;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  invalidName: boolean = false;
  invalidLastName: boolean = false;
  messageName: string = '';
  dialogPopUp: boolean = false;
  messageLastName: string = '';

  opciones: any[] = [
    { id: 'Vigente', value: 'Vigente' },
    { id: 'Anulado', value: 'Anulado' },
  ];

  formFields: FormFieldDefMap = {
    coorname: {
      label: 'Nombre del coordinador',
      id: '',
      value: Object.keys(this.data).length === 0 ? '' : this.data.coorname,
    },
    coorapellido: {
      label: 'Apellido del coordinador',
      id: '',
      value: Object.keys(this.data).length === 0 ? '' : this.data.coorapellido,
    },
    coorfecha_alta: {
      label: 'Fecha Alta',
      id: '',
      value:
        Object.keys(this.data).length === 0
          ? getDate()
          : this.data.coorfecha_alta.substring(0, 19),
    },
    coorbaja: {
      label: 'Estado',
      id: '',
      value:
        Object.keys(this.data).length === 0 ? 'Vigente' : this.data.coorbaja,
    },
  };

  validateName() {
    const pattern: RegExp = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;
    const validate: string = (this.formFields.coorname.value as string)
      .trim()
      .replace(/\s+/g, ' ');
    if (!pattern.test(this.formFields.coorname.value as any)) {
      this.invalidName = true;
      this.messageName = messagesError.validateCoorName;
    } else if (!validate) {
      this.invalidName = true;
      this.messageName = messagesError.blanckCoorName;
    } else {
      this.invalidName = false;
      this.messageName = '';
    }
  }

  validateLastName() {
    const pattern: RegExp = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;
    const validate: string = (this.formFields.coorapellido.value as string)
      .trim()
      .replace(/\s+/g, ' ');
    if (!pattern.test(this.formFields.coorapellido.value as any)) {
      this.invalidLastName = true;
      this.messageLastName = messagesError.validateCoorApellido;
    } else if (!validate) {
      this.invalidLastName = true;
      this.messageLastName = messagesError.blanckCoorApellido;
    } else {
      this.invalidLastName = false;
      this.messageLastName = '';
    }
  }

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Editar Coordinador',
      visible: true,
      step: 1,
      title: 'Asignación de detalle',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  handleAdd() {
    if (
      !this.formFields.coorname.value &&
      !this.formFields.coorapellido.value
    ) {
      this.invalidName = true;
      this.messageName = messagesError.blanckCoorName;
      this.invalidLastName = true;
      this.messageLastName = messagesError.blanckCoorApellido;
    } else if (!this.formFields.coorname.value) {
      this.invalidName = true;
      this.messageName = messagesError.blanckCoorName;
    } else if (!this.formFields.coorapellido.value) {
      this.invalidLastName = true;
      this.messageLastName = messagesError.blanckCoorApellido;
    }
    this.addCoordinadores();
  }

  handlePopUp(event: any) {
    if (this.anulado) {
      this.handleClosed();
    } else {
      this.dialogPopUp = !this.dialogPopUp;
      if (event) {
        this.handleClosed();
      }
    }
  }

  handleClosed() {
    this.$emit('cerrar');
  }

  showPopuP(event: any) {
    this.dialogPopUp = !this.dialogPopUp;
    if (event) {
      this.handleClosed();
    }
  }

  async addCoordinadores() {
    let self = this;

    const requestData: any = {
      coorname: this.formFields.coorname.value,
      coorapellido: this.formFields.coorapellido.value,
    };

    if (Object.keys(this.data).length !== 0) {
      requestData.coorid = Number(this.data.coorid);
      requestData.usuarioid_modifica = getUserId();
      requestData.usuariorut_modifica = localStorage.getItem('clienteDefecto');
      requestData.coorbaja =
        this.formFields.coorbaja.value == 'Vigente' ? 'f' : 't';
      requestData.previus_data = this.data;
    } else {
      requestData.usuarioid_alta = getUserId();
      requestData.usuariorut_alta = localStorage.getItem('clienteDefecto');
    }
    return fetchMantenedorCoordinador(
      requestData,
      'api_coordinadores/add_coordinador'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '2') {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return;
        }
        if (data.data.MENSAJE_RESPUESTA !== '') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.handleClosed();
        } else {
          this.handleClosed();
        }
      })
      .catch((error: any) => {})
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
}
</script>

<style scoped>
.numero_sim {
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 16px;
}

.btn-editar {
  height: 37px;
}

.btn-editar button {
  background-color: rgb(255, 108, 0) !important;
  border-color: rgb(255, 108, 0) !important;
  padding-right: 20px;
  display: block;
  margin: 0 0 0 auto;
}

.red--text {
  color: red !important;
  border-color: red !important;
}

div.red--text .v-input__control,
div.red--text .v-input__slot:hover:before,
div.red--text input {
  color: red !important;
  border-color: red !important;
}

.alerta--error {
  color: red !important;
  border-color: red !important;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
}

.alerta--error span {
  font-size: 15px !important;
  font-weight: 600;
}
</style>

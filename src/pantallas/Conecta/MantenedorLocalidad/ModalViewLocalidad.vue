<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Detalle Localidad" @cerrar="handlePopUp">
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
                    ? 'Crear Localidad'
                    : 'Editar Localidad'
                "
              >
                <slot name="prependInformacionGeneral" />

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    label="Localidad"
                    v-model="formFields.locaname.value"
                    @input="validateLocaname"
                    :disabled="anulado"
                    :error="invalidate"
                    :class="{ 'red--text': invalidate }"
                  />
                  <div v-if="invalidate" class="alerta--error">
                    <span>*</span> {{ messageError }}
                  </div>
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    label="Fecha Alta"
                    v-model="formFields.locafecha_alta.value"
                    disabled
                  />
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-autocomplete
                    label="Estado"
                    v-model="formFields.locabaja.value"
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
import { Watch } from 'vue-property-decorator';
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

import { fetchMantenedorLocalidad } from './fetchMantenedorLocalidad';
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
export default class ModalViewLocalidad extends Vue {
  @Prop({ default: true, type: Boolean }) show: boolean;
  @Prop({ default: {}, type: Object }) data: any;
  @Prop({ default: true, type: Boolean }) anulado: boolean;

  readonly funcionalidad: Funcionalidades = Funcionalidades.localidad;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  invalidate: boolean = false;
  dialogPopUp: boolean = false;
  messageError: string = '';
  opciones: any[] = [
    { id: 'Vigente', value: 'Vigente' },
    { id: 'Anulado', value: 'Anulado' },
  ];

  addCeroStart(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  handleAdd() {
    if (!this.formFields.locaname.value) {
      this.invalidate = true;
      this.messageError = messagesError.blanckLocaName;
    }
    this.addLocalidades();
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

  validateLocaname() {
    const pattern: any = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;
    const validateLocaname: string = (this.formFields.locaname.value as string)
      .trim()
      .replace(/\s+/g, ' ');
    if (!pattern.test(this.formFields.locaname.value)) {
      this.invalidate = true;
      this.messageError = messagesError.validateLocaName;
    } else if (!validateLocaname) {
      this.invalidate = true;
      this.messageError = messagesError.blanckLocaName;
    } else {
      this.invalidate = false;
      this.messageError = '';
    }
  }

  formFields: FormFieldDefMap = {
    locaname: {
      label: 'Localidad',
      id: '',
      value: Object.keys(this.data).length === 0 ? '' : this.data.locaname,
    },
    locafecha_alta: {
      label: 'Fecha Alta',
      id: '',
      value:
        Object.keys(this.data).length === 0
          ? getDate()
          : this.data.locafecha_alta.substring(0, 19),
    },
    locabaja: {
      label: 'Estado',
      id: '',
      value:
        Object.keys(this.data).length === 0 ? 'Vigente' : this.data.locabaja,
    },
  };

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Editar Localidad',
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

  async addLocalidades() {
    let self = this;

    const requestData: any = {
      locaname: this.formFields.locaname.value,
    };

    if (Object.keys(this.data).length !== 0) {
      requestData.locaid = Number(this.data.locaid);
      requestData.usuarioid_modifica = getUserId();
      requestData.usuariorut_modifica = localStorage.getItem('clienteDefecto');
      requestData.locabaja =
        this.formFields.locabaja.value == 'Vigente' ? 'f' : 't';
      requestData.previus_data = this.data;
    } else {
      requestData.usuarioid_alta = getUserId();
      requestData.usuariorut_alta = localStorage.getItem('clienteDefecto');
    }
    return fetchMantenedorLocalidad(requestData, 'api_localidad/add_localidad')
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

<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Crear Lista de Distribución" @cerrar="handleCerrar">
      <GuardarButton
        @click="handleGuardarClick"
        :disabled="form.isDirty ? hasErrors : false"
      />
    </CabeceraModal>
    <v-stepper v-model="pasoActivoIndex">
      <v-stepper-header>
        <v-stepper-step
          v-show="pasos.informacionGeneral.visible"
          :complete="pasoActivoIndex > pasos.informacionGeneral.step"
          :step="pasos.informacionGeneral.step"
          >Información General</v-stepper-step
        >
      </v-stepper-header>
      <v-stepper-items class="cardnew">
        <v-stepper-content
          v-show="pasos.informacionGeneral.visible"
          :step="pasos.informacionGeneral.step"
        >
          <ListaDistribucionForm
            @change="handleFormChange"
            @estadoSwitch="handleEstadoSwitch"
          />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Lista de Distribución' })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ListaDistribucionForm from '@/pantallas/ListaDistribucion/ListaDistribucionForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  ListaDistribucion,
  ListaDistribucionNueva,
} from '@/pantallas/ListaDistribucion/ListaDistribucion';
import { crearListaDistribucion } from '@/pantallas/ListaDistribucion/crearListaDistribucion';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';

type CrearListaDistribucionFormState = {
  entity: ListaDistribucionNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    ListaDistribucionForm,
    ModalMantenedor,
    GuardarButton,
  },
})
export default class CrearListaDistribucionModal extends Vue {
  @Prop({ default: true }) show: boolean;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: CrearListaDistribucionFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };
  dialogConfirmacionClose: boolean = false;
  disableBtnContinuar: boolean = false;
  hasErrors = false;
  isValid = false;
  dialogConfirmacion: boolean = false;
  mensajeConfirmacionInactivo: any = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.dialogConfirmacionClose = true;
  }

  handleCierreConfirmacionCerrar(isConfirmado: boolean) {
    this.dialogConfirmacionClose = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('cerrar');
  }

  async handleGuardarClick() {
    this.isValid = await this.form.validator.validateAll();
    this.hasErrors = true;
    if (this.isValid) {
      this.handleEstadoSwitch(this.form.entity.estado);
      this.dialogConfirmacion = true;
    } else {
      this.form.isDirty = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.hasErrors = false;
    if (val) {
      this.loadingService.showLoading();
      return crearListaDistribucion(this.form.entity)
        .then(() =>
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Lista de Distribución',
              creadoA: 'creada',
            })
          )
        )
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar crear la lista de distribución.`,
            { timeout: 3000 }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
          this.$emit('cerrarBtnGuardar');
        });
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'la Lista de Distribución',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Lista de Distribución' }
      );
    }
  }
}
</script>

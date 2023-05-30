<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Agregar Calendario" @cerrar="handleCerrar">
      <GuardarButton
        @click="handleGuardarClick"
        :disabled="form.isDirty ? hasErrors : false"
      />
    </CabeceraModal>

    <v-stepper v-model="pasoActivoIndex">
      <v-stepper-items class="cardnew">
        <v-stepper-content
          v-show="pasos.informacionGeneral.visible"
          :step="pasos.informacionGeneral.step"
        >
          <CalendarioForm
            @change="handleFormChange"
            @estadoSwitch="handleEstadoSwitch"
            :mostrarActivo="false"
          />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.agregar.titulo', { entidad: 'Calendario' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.agregar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.agregar.btnCancelar')"
    ></Confirmation>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      textoBtnNo="Continuar Agregando"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';

import CalendarioForm from '@/pantallas/Calendarios/CalendarioForm.vue';
import { crearCalendario } from '@/pantallas/Calendarios/crearCalendario';
import {
  Calendario,
  CalendarioNuevoForm,
} from '@/pantallas/Calendarios/Calendario';

type CrearCalendarioFormState = {
  entity: CalendarioNuevoForm;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    CalendarioForm,
    ModalMantenedor,
    GuardarButton,
  },
})
export default class AgregarCalendarioModal extends Vue {
  @Prop({ required: true }) show: boolean;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: CrearCalendarioFormState = {
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
      if (
        this.form.entity.frecuenciaSeleccionada === 1 &&
        this.form.entity.semanalDiasSemana.length === 0
      ) {
        this.$snotify.error('Debe seleccionar al menos un día de la semana');
      } else {
        this.handleEstadoSwitch(this.form.entity.estado);
        this.dialogConfirmacion = true;
      }
    } else {
      this.form.isDirty = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.hasErrors = false;
    if (val) {
      this.loadingService.showLoading();
      return crearCalendario(this.form.entity)
        .then(() =>
          this.$snotify.success('Calendario ha sido agregado de forma exitosa')
        )
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar agregar el calendario.`,
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
    this.isValid = true;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.agregar.mensaje', {
          entidad: 'el Calendario',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.agregar.mensaje',
        { entidad: 'el Calendario' }
      );
    }
  }
}
</script>

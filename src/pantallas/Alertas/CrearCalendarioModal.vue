<template>
  <v-layout row justify-center v-if="show">
    <v-dialog
      v-model="show"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <CabeceraModalCrear titulo="Agregar Calendario" @cerrar="handleCerrar">
          <GuardarButton
            @click="handleGuardarClick"
            :disabled="form.isDirty ? hasErrors : false"
          />
        </CabeceraModalCrear>
        <ContenidoModal>
          <CalendarioForm :mostrarActivo="false" @change="handleFormChange" />
          <Confirmation
            :show="dialogConfirmacionGuardar"
            :titulo="
              $t('mensajes.crud.agregar.titulo', { entidad: 'Calendario' })
            "
            :mensaje="
              $t('mensajes.crud.agregar.mensaje', { entidad: 'el Calendario' })
            "
            v-on:modalConfirmationEmit="confirmCallback($event)"
            :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
            :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
          ></Confirmation>
        </ContenidoModal>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import {
  typeNuevosCampo,
  typeTipoCampo,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import {
  emitFormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { Snotify } from '@/snotify/Snotify';

import CalendarioForm from '@/pantallas/Calendarios/CalendarioForm.vue';
import { CalendarioNuevoForm } from '@/pantallas/Calendarios/Calendario';

type CrearCalendarioFormState = {
  entity: CalendarioNuevoForm;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModalCrear,
    GuardarButton,
    ModalMantenedor,
    ContenidoModal,
    CalendarioForm,
    Confirmation,
  },
})
export default class CrearCalendarioModal extends Vue {
  @Prop({ default: false }) show!: boolean;

  form: CrearCalendarioFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  dialogConfirmacionGuardar: boolean = false;
  hasErrors: boolean = false;
  isValid: boolean = false;
  readonly $snotify: Snotify;

  handleCerrar() {
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
        this.dialogConfirmacionGuardar = true;
      }
    } else {
      this.form.isDirty = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacionGuardar = false;
    this.hasErrors = false;
    if (val) {
      this.$emit('nuevoCalendario', this.form.entity);
      this.handleCerrar();
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    this.isValid = true;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }
}
</script>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Agregar Dato Extendido" @cerrar="handleCerrar">
      <GuardarButton
        @click="handleGuardarClick"
        :disabled="hasErrors"
        data-testid="GuardarDato"
      />
    </CabeceraModal>
    <v-stepper v-model="pasoActivoIndex">
      <v-stepper-items class="cardnew">
        <v-stepper-content
          v-show="pasos.informacionGeneral.visible"
          :step="pasos.informacionGeneral.step"
        >
          <DatoExtendidoForm
            @change="handleFormChange"
            test-id="CrearDatoExtendidoModal"
            :datoExtendido="datoExtendido"
            :dispositivoId="dispositivoId"
            editar="0"
          />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      titulo="
        Agregar Dato Extendido
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      test-id="ConfirmacionGuardarDato"
    ></Confirmation>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></Confirmation>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t('Condición Visible')"
      :mensaje="$t('Debe ingresar valor en campo Condición Visible')"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import DatoExtendidoForm from '@/pantallas/Dispositivos/DatoExtendidoForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import {
  emitFormChangeEvent,
  FormChangeEvent,
  formErrors,
  FormErrors,
  FormFieldDefMap,
  FormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import {
  DatoExtendidoNuevo,
  DatoExtendido,
} from '@/pantallas/Dispositivos/Dispositivos';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
type CrearTipoDatoExtendidoFormState = {
  entity: DatoExtendidoNuevo;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    DatoExtendidoForm,
    ModalMantenedor,
    GuardarButton,
    MensajeValidacion,
  },
})
export default class CrearTipoDatoExtendidoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) datoExtendido: DatoExtendido[];
  @Prop({ required: false }) dispositivoId: number;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: CrearTipoDatoExtendidoFormState = {
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
  showValidacion: boolean = false;

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
    if (this.isValid) {
      if (this.form.entity.scriptMostrar != '') {
        this.hasErrors = true;
        this.mensajeConfirmacionInactivo =
          '¿Está seguro que desea agregar el Dato Extendido al Dispositivo?';
        this.dialogConfirmacion = true;
      } else {
        this.showValidacion = true;
      }
    } else {
      this.form.isDirty = true;
      this.hasErrors = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.hasErrors = false;
    if (val) {
      this.$emit('cerrarBtnGuardar', {
        entity: this.form.entity as DatoExtendidoNuevo,
      });
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.crear', {
          entidad: 'Dato Extendido',
          creadoA: 'agregado',
        })
      );
      return this.form.entity;
    }
  }

  emitFormChange() {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: this.form.entity as DatoExtendidoNuevo,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }
}
</script>

<style scoped>
.cardnew {
  background-color: #e9ebee;
  min-height: 92vh;
  height: 100% !important;
}
</style>

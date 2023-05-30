<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Dato Extendido" @cerrar="handleCerrar">
      <GuardarCambiosButton
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
          <DatoExtendidoForm
            @change="handleFormChange"
            :datoSeleccionado="datoSeleccionado"
            :dispositivoId="dispositivoId"
            :datoExtendido="datoExtendido"
            editar="1"
            :esEditar="true"
            test-id="EditarDispositivoModal"
          />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      :titulo="'Editar Dato Extendido: ' + this.nombre"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></Confirmation>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
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
import { Vue, Component, Prop } from 'vue-property-decorator';
import DatoExtendidoForm from '@/pantallas/Dispositivos/DatoExtendidoForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import {
  emitFormChangeEvent,
  FormChangeEvent,
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
type EditarDatoExtendidoFormState = {
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
    GuardarCambiosButton,
    MensajeValidacion,
  },
})
export default class EditarDatoExtendidoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) datoSeleccionado: DatoExtendidoNuevo;
  @Prop({ required: true }) datoExtendido: DatoExtendido[];
  @Prop({ default: false }) dispositivoId: number;

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: EditarDatoExtendidoFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };
  dialogConfirmacionClose: boolean = false;
  showValidacion: boolean = false;
  disableBtnContinuar: boolean = false;
  hasErrors = false;
  isValid = false;
  dialogConfirmacion: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  nombre: string = this.datoSeleccionado.nombre;

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
        this.nombre = this.form.entity.nombre;
        this.hasErrors = true;
        this.mensajeConfirmacionInactivo = this.$t(
          'mensajes.crud.editar.mensaje',
          { entidad: 'el de dato extendido' }
        );
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
        this.$t('mensajes.mensajesExito.editar', {
          entidad: 'Dato Extendido',
          creadoA: 'editado',
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

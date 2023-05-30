<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Tipo de Dispositivo" @cerrar="handleCerrar">
      <GuardarCambiosButton
        @click="handleGuardarClick"
        v-show="showGuardar"
        :disabled="form.isDirty ? hasErrors : false"
      />
    </CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.informacionGeneral.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.informacionGeneral.visible"
          :value="pasos.informacionGeneral.step"
          color="primary"
          flat
        >
          <span>Información General</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />
      <TipoDispositivoForm
        @change="handleFormChange"
        :tipoSeleccionado="tipoSeleccionado"
        :isEditar="true"
        test-id="EditarTipoDispositivoModal"
      />
    </div>

    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Tipo de Dispositivo',
          nombreEntidad: tipoSeleccionado.nombre,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
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
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { editarTipoDispositivo } from '@/pantallas/TipoDispositivo/editarTipoDispositivo';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';

import TipoDispositivoForm from '@/pantallas/TipoDispositivo/TipoDispositivoForm.vue';
import { TipoDispositivoNuevo } from '@/pantallas/TipoDispositivo/TipoDispositivo';

type EditarTipoDispositivoFormState = {
  entity: TipoDispositivoNuevo;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    TipoDispositivoForm,
    ModalMantenedor,
    VolverButton,
    ContinuarButton,
    GuardarCambiosButton,
  },
})
export default class EditarTipoDispositivoModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) tipoSeleccionado: TipoDispositivoNuevo;

  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: EditarTipoDispositivoFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };
  showInfo: boolean = true;
  showGuardar: boolean = true;
  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  disableBtnContinuar: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  hasErrors = false;
  isValid = false;
  estadoSwitch: boolean = true;

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

  handleConfirmacionGuardar(isConfirmado: boolean) {
    this.dialogConfirmacionGuardar = false;
    this.hasErrors = false;
    if (!isConfirmado) {
      return;
    }
    this.loadingService.showLoading();
    const tipoEditado: TipoDispositivoNuevo = {
      ...this.form.entity,
      id: this.tipoSeleccionado.id,
    };
    return editarTipoDispositivo(tipoEditado)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.editar', {
            entidad: 'Tipo de Dispositivo',
            creadoA: 'editado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar editar el tipo de dispositivo.`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('cerrarBtnGuardar');
      });
  }

  async handleGuardarClick() {
    if (this.estadoSwitch) {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el tipo de dispositivo' }
      );
    }
    this.isValid = await this.form.validator.validateAll();
    if (this.isValid) {
      this.hasErrors = true;
      this.dialogConfirmacionGuardar = true;
    } else {
      this.form.isDirty = true;
      this.hasErrors = true;
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }
}
</script>

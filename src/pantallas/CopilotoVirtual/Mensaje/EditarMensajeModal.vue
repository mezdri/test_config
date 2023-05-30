<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Mensaje"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Mensaje'"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <MensajeForm
        @change="handleFormChange"
        :mensajeSeleccionado="mensajeSeleccionado"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :esEditar="true"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';

import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import MensajeForm from '@/pantallas/CopilotoVirtual/Mensaje/MensajeForm.vue';
import {
  Mensaje,
  MnsajeNuevo,
} from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';

import { editarMensaje } from '@/pantallas/CopilotoVirtual/Mensaje/editarMensaje';

type EditarMensajeFormState = {
  entity: Mensaje;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalEditar,
    ModalMantenedor,
    GuardarCambiosButton,
    Confirmation,
    MensajeForm,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class EditarMensajeModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) mensajeSeleccionado: Mensaje;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  modificable: boolean = true;

  form: EditarMensajeFormState = {
    entity: null,
    validator: null,
  };

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Información General',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  /* Event Handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    var mensaje: Mensaje = {
      ...this.pasos.informacionGeneral.formState.entity,
      id: this.mensajeSeleccionado.id,
    };

    this.loadingService.showLoading();
    return editarMensaje(mensaje)
      .then(() => {
        this.$snotify.success(
          'Los cambios han sido guardados de forma exitosa',
          {
            timeout: 3000,
          }
        );
        this.handleCerrar();
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar editar el mensaje',
          {
            timeout: 3000,
          }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (
      //this.mensajeSeleccionado.totalAsociados2 > 0 &&
      this.pasos.informacionGeneral.formState.entity.estado == 0
    ) {
      this.modificable = false;
    } else {
      this.modificable = true;
    }
  }

  handleInactivo() {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
  }
}
</script>

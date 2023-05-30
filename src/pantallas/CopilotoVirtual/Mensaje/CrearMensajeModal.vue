<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Crear Mensaje'" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <MensajeForm
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Mensaje' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      test-id="CrearDispositivo"
    />
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import MensajeForm from '@/pantallas/CopilotoVirtual/Mensaje/MensajeForm.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import { MnsajeNuevo } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { crearMensaje } from '@/pantallas/CopilotoVirtual/Mensaje/crearMensaje';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

type CrearMensajeFormState = {
  entity: MnsajeNuevo;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    MensajeForm,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
  },
})
export default class CrearDispositivoModal extends Vue {
  @Prop({ required: true }) show: boolean;

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
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  dialogConfirmacion: boolean = false;

  form: CrearMensajeFormState = {
    entity: null,
    validator: null,
  };

  /* Event Handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();

    if (isValid) {
      this.handleSwitch(this.pasos.informacionGeneral.formState.entity.estado);
      this.dialogConfirmacion = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacion = false;
    if (isConfirm) {
      this.loadingService.showLoading();
      return crearMensaje(this.pasos.informacionGeneral.formState.entity)
        .then(() => {
          this.$snotify.success('Mensaje ha sido creado de forma exitosa', {
            timeout: 3000,
          });
          this.handleCerrar();
        })
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar crear el mensaje',
            {
              timeout: 3000,
            }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
          this.$emit('cerrarBtnGuardar');
        });
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Mensaje',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        {
          entidad: 'el Mensaje',
        }
      );
    }
  }
}
</script>

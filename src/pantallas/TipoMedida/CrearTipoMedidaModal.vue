<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear titulo="Crear Tipo de Medida" @cerrar="handleCerrar">
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
          <TipoMedidaForm
            @change="handleFormChange"
            test-id="CrearTipoMedidaModal"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Tipo de Medida' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

import TipoMedidaForm from '@/pantallas/TipoMedida/TipoMedidaForm.vue';
import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
import { crearTipoMedida } from '@/pantallas/TipoMedida/crearTipoMedida';

type CrearTipoMedidaFormState = {
  entity: TipoMedidaNuevo;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModalCrear,
    TipoMedidaForm,
    ModalMantenedor,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
  },
})
export default class CrearTipoMedidaModal extends Vue {
  @Prop({ default: true }) show: boolean;

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
  form: CrearTipoMedidaFormState = {
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
    this.$emit('cerrar');
  }

  handleCierreConfirmacionCerrar(isConfirmado: boolean) {
    this.dialogConfirmacionClose = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('cerrar');
  }

  async handleGuardar() {
    this.isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();
    this.hasErrors = true;
    if (this.isValid) {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        {
          entidad: 'el Tipo de Medida',
        }
      );
      this.dialogConfirmacion = true;
    } else {
      this.pasos.informacionGeneral.formState.isDirty = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.hasErrors = false;
    if (val) {
      this.loadingService.showLoading();
      return crearTipoMedida(this.pasos.informacionGeneral.formState.entity)
        .then(() =>
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Tipo de Medida',
              creadoA: 'creado',
            })
          )
        )
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar crear el tipo de medida.`,
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
    this.pasos.informacionGeneral.formState = event;
  }
}
</script>

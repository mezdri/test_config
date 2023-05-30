<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      :titulo="'Crear Tipo de Mantenimiento'"
      @cerrar="handleCerrar"
    >
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
          <TipoMantenimientoForm
            @change="handleFormChange"
            @estadoSwitch="handleEstadoSwitch"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Tipo de Mantenimiento' })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

import {
  TipoMantenimiento,
  makeTipoMantenimientoPasos,
} from '@/pantallas/TipoMantenimiento/TipoMantenimiento';
import TipoMantenimientoForm from '@/pantallas/TipoMantenimiento/TipoMantenimientoForm.vue';
import { crearTipoMantenimiento } from '@/pantallas/TipoMantenimiento/crearTipoMantenimiento';

type CrearFormState = {
  entity: TipoMantenimiento;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    TipoMantenimientoForm,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
  },
})
export default class CrearTipoMantenimientoModal extends Vue {
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

  form: CrearFormState = {
    entity: null,
    validator: null,
  };

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();

    if (isValid) {
      this.handleEstadoSwitch(
        this.pasos.informacionGeneral.formState.entity.estado
      );
      this.dialogConfirmacion = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacion = false;
    if (isConfirm) {
      this.loadingService.showLoading();
      return crearTipoMantenimiento(
        this.pasos.informacionGeneral.formState.entity
      )
        .then(() => {
          this.$snotify.success(
            'Tipo de Mantenimiento ha sido creado de forma exitosa',
            {
              timeout: 3000,
            }
          );
          this.handleCerrar();
        })
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar crear el tipo mantenimiento',
            { timeout: 3000 }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Tipo de Mantenimiento',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Tipo de Mantenimiento' }
      );
    }
  }
}
</script>

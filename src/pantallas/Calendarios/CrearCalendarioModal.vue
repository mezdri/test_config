<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear titulo="Crear Calendario" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardarClick"
      />
    </CabeceraModalCrear>

    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <CalendarioForm
            @change="handleFormChange"
            @estadoSwitch="handleEstadoSwitch"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Calendario' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';

import CalendarioForm from '@/pantallas/Calendarios/CalendarioForm.vue';
import { crearCalendario } from '@/pantallas/Calendarios/crearCalendario';
import {
  Calendario,
  CalendarioNuevoForm,
  makeCalendarioPasos,
} from '@/pantallas/Calendarios/Calendario';

type CrearCalendarioFormState = {
  entity: CalendarioNuevoForm;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CalendarioForm,
    ModalMantenedor,
    GuardarButton,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    CabeceraModalCrear,
  },
})
export default class CrearCalendarioModal extends Vue {
  @Prop({ required: true }) show: boolean;

  pasoActivoIndex = 1;

  readonly pasos: PasosCrud = makeCalendarioPasos();

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
    this.$emit('cerrar');
  }

  async handleGuardarClick() {
    this.isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();
    this.hasErrors = true;
    if (this.isValid) {
      if (
        this.pasos.informacionGeneral.formState.entity
          .frecuenciaSeleccionada === 1 &&
        this.pasos.informacionGeneral.formState.entity.semanalDiasSemana
          .length === 0
      ) {
        this.$snotify.error('Debe seleccionar al menos un día de la semana');
      } else {
        this.handleEstadoSwitch(
          this.pasos.informacionGeneral.formState.entity.estado
        );
        this.dialogConfirmacion = true;
      }
    } else {
      this.pasos.informacionGeneral.formState.isDirty = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.hasErrors = false;
    if (val) {
      this.loadingService.showLoading();
      return crearCalendario(this.pasos.informacionGeneral.formState.entity)
        .then(() =>
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Calendario',
              creadoA: 'creado',
            })
          )
        )
        .catch(() =>
          this.$snotify.error(
            `Ha ocurrido un error al intentar crear el Calendario.`,
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

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Calendario',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Calendario' }
      );
    }
  }
}
</script>

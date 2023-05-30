<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Tipo de Mantenimiento"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Tipo de Mantenimiento'"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <TipoMantenimientoForm
        @change="handleFormChange"
        :tipoMantenimientoSeleccionado="tipoMantenimientoSeleccionado"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
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

import { TipoMantenimiento } from './TipoMantenimiento';
import TipoMantenimientoForm from '@/pantallas/TipoMantenimiento/TipoMantenimientoForm.vue';
import { editarTipoMantenimiento } from '@/pantallas/TipoMantenimiento/editarTipoMantenimiento';

type EditarFormState = {
  entity: TipoMantenimiento;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalEditar,
    ModalMantenedor,
    GuardarCambiosButton,
    Confirmation,
    TipoMantenimientoForm,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class EditarTipoMantenimientoModal extends Vue {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) tipoMantenimientoSeleccionado: TipoMantenimiento;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  modificable: boolean = true;
  estadoEntidad: boolean = true;

  form: EditarFormState = {
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

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    var tipoMantenimiento: TipoMantenimiento = {
      ...this.pasos.informacionGeneral.formState.entity,
      id: this.tipoMantenimientoSeleccionado.id,
    };

    this.loadingService.showLoading();
    return editarTipoMantenimiento(tipoMantenimiento)
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
          'Ha ocurrido un error al intentar editar el tipo mantenimiento',
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (
      this.tipoMantenimientoSeleccionado.totalAsociados > 0 &&
      this.pasos.informacionGeneral.formState.entity.estado == 0
    ) {
      this.modificable = false;
    } else {
      this.modificable = true;
    }
    if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
      this.estadoEntidad = false;
    } else {
      this.estadoEntidad = true;
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

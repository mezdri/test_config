<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Tipo de Medida"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Tipo de Medida'"
      :inactivable="modificable"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <TipoMedidaForm
        @change="handleFormChange"
        :tipoSeleccionado="tipoSeleccionado"
        :isEditar="true"
        test-id="EditarTipoMedidaModal"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import TipoMedidaForm from '@/pantallas/TipoMedida/TipoMedidaForm.vue';
import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
import { editarTipoMedida } from '@/pantallas/TipoMedida/editarTipoMedida';

type EditarTipoMedidaFormState = {
  entity: TipoMedidaNuevo;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModalEditar,
    TipoMedidaForm,
    ModalMantenedor,
    VolverButton,
    ContinuarButton,
    ContenidoModal,
    CrudStepsNavBar,
  },
})
export default class EditarTipoMedidaModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) tipoSeleccionado: TipoMedidaNuevo;

  modificable: boolean = true;
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

  form: EditarTipoMedidaFormState = {
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
    this.$emit('cerrar');
  }

  handleCierreConfirmacionCerrar(isConfirmado: boolean) {
    this.dialogConfirmacionClose = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('cerrar');
  }

  handleGuardar() {
    this.loadingService.showLoading();
    const tipoEditado: TipoMedidaNuevo = {
      ...this.pasos.informacionGeneral.formState.entity,
      id: this.tipoSeleccionado.id,
    };
    return editarTipoMedida(tipoEditado)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.editar', {
            entidad: 'Tipo de Medida',
            creadoA: 'editado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar editar el tipo de medida.`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('cerrarBtnGuardar');
      });
  }

  async handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }
}
</script>

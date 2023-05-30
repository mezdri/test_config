<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Lista de Distribución" @cerrar="handleCerrar">
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
      <ListaDistribucionForm
        @change="handleFormChange"
        :listaSeleccionada="listaSeleccionada"
        @estadoSwitch="handleEstadoSwitch"
      />
    </div>

    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Lista de Distribución',
          nombreEntidad: nombreEditado,
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
import ListaDistribucionForm from '@/pantallas/ListaDistribucion/ListaDistribucionForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  ListaDistribucion,
  ListaDistribucionNueva,
  ListaDistribucionAsociacion,
  ContactoAsociado,
} from '@/pantallas/ListaDistribucion/ListaDistribucion';
import { editarListaDistribucion } from '@/pantallas/ListaDistribucion/editarListaDistribucion';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';

type CrearListaDistribucionFormState = {
  entity: ListaDistribucionNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    ListaDistribucionForm,
    ModalMantenedor,
    VolverButton,
    ContinuarButton,
    GuardarCambiosButton,
  },
})
export default class EditarListaDistribucionModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) listaSeleccionada: ListaDistribucion;

  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  form: CrearListaDistribucionFormState = {
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
  warningInactivo: string = '';
  hasErrors = false;
  isValid = false;
  estadoSwitch: boolean = true;
  contactosAsociados: ContactoAsociado[] = [];
  nombreEditado: string = '';

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
    const listaEditada: ListaDistribucionNueva = {
      ...this.form.entity,
      id: this.listaSeleccionada.id,
    };
    return editarListaDistribucion(listaEditada)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.editar', {
            entidad: 'Lista de Distribución',
            creadoA: 'editada',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar editar la lista de distribución.`,
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
        { entidad: 'la Lista de Distribución' }
      );
    } else {
      this.warningInactivo =
        'Al dejar como inactivo, no se podrán realizar asociaciones.';
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'la Lista de Distribución',
        });
    }
    this.isValid = await this.form.validator.validateAll();
    this.hasErrors = true;
    if (this.isValid) {
      this.nombreEditado = this.form.entity.nombre;
      this.dialogConfirmacionGuardar = true;
    } else {
      this.form.isDirty = true;
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    if (this.form.isDirty) {
      this.hasErrors = this.form.validator.errors.items.length > 0;
    }
  }

  async disabledButton() {
    const isValid = await this.form.validator.errors.count();
    if (isValid === 0) {
      this.disableBtnContinuar = false;
    } else {
      this.disableBtnContinuar = true;
    }
  }

  handleEstadoSwitch(estadoSwitch: boolean) {
    this.estadoSwitch = estadoSwitch;
  }
}
</script>

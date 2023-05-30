<template>
  <div>
    <CabeceraModal :titulo="titulo" @cerrar="handleCerrar">
      <slot />
      <GuardarCambiosButton
        @click="handleGuardar"
        :disabled="isGuardarDisabled"
      />
    </CabeceraModal>

    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="tituloEliminar"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></Confirmation>

    <Confirmation
      :show="dialogNoGuardaInactivo"
      :titulo="tituloEliminar"
      :mensaje="mensajeGuardarInactivo"
      v-on:modalConfirmationEmit="handleIncativeGuardar"
      :mostrarBoton="false"
      :textoBtnSi="'Aceptar'"
    ></Confirmation>

    <Confirmation
      :show="showConfirmacionCerrar"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="handleConfirmarCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Confirmation from '@/components/Confirmation.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import { FormState } from '@/reusable/Form/formUtils';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { PasosCrud } from '../Mantenedor/mantenedorUtils';
import { isPasoValido } from '../Mantenedor/isPasoValido';
import { TranslateResult } from 'vue-i18n';

@Component({
  components: { GuardarCambiosButton, CabeceraModal, Confirmation },
})
export default class CabeceraModalEditarBase extends Vue {
  @Prop({ required: true }) titulo: string;
  @Prop({ required: true }) tituloEliminar: TranslateResult;
  @Prop({ required: true }) entidad: string;
  @Prop({ required: true }) pasos: PasosCrud;
  @Prop({ required: true }) pasoActivoIndex: number;
  @Prop({ default: true }) inactivable: boolean;
  @Prop({ default: true }) estadoEntidad: boolean;
  @Prop({ default: true }) inactivoSinAsociacion: boolean;
  @Prop({ default: 'El ' }) pronombre: string;
  @Prop({ default: '' }) mensajeInactivo: string;
  @Prop({}) form: FormState;

  /* state */

  showConfirmacionCerrar = false;
  dialogConfirmacionGuardar = false;
  dialogNoGuardaInactivo = false;
  mensajeConfirmacionInactivo: any = '';
  mensajeGuardarInactivo: any = '';

  mounted() {
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: this.entidad,
    });
    this.mensajeGuardarInactivo =
      this.pronombre +
      this.entidad +
      ' tiene asociaciones activas, por esta razón no se podrá dejar inactivo.';
  }

  /* event handlers */

  handleCerrar() {
    this.showConfirmacionCerrar = true;
  }

  handleConfirmarCerrar(isConfirmado: boolean) {
    this.showConfirmacionCerrar = false;
    if (isConfirmado) {
      this.$emit('cerrar');
    }
  }

  handleConfirmacionGuardar(isConfirmado: boolean) {
    this.dialogConfirmacionGuardar = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('guardar');
  }

  handleIncativeGuardar(isConfirmado: boolean) {
    this.dialogNoGuardaInactivo = false;
    if (!isConfirmado) {
      return;
    }
    this.$emit('inactivo');
  }

  async handleGuardar() {
    if (!(await isPasoValido(this.pasoActivo))) {
      return;
    }

    if (!this.inactivable) {
      this.dialogNoGuardaInactivo = true;
    } else {
      if (this.estadoEntidad === true) {
        this.mensajeConfirmacionInactivo = this.$t(
          'mensajes.crud.editar.mensaje',
          {
            entidad: this.entidad,
          }
        );
      } else {
        if (this.inactivoSinAsociacion) {
          this.mensajeConfirmacionInactivo =
            (this.mensajeInactivo === ''
              ? this.$t('mensajes.crud.inactivo.mensaje', {
                  entidad: this.entidad,
                })
              : this.mensajeInactivo) +
            ' ' +
            this.$t('mensajes.crud.editar.mensaje', {
              entidad: this.entidad,
            });
        } else {
          this.mensajeConfirmacionInactivo = this.$t(
            'mensajes.crud.inactivoAsociado.mensaje'
          );
          +this.$t('mensajes.crud.editar.mensaje', {
            entidad: this.entidad,
          });
        }
      }
      this.dialogConfirmacionGuardar = true;
    }
  }

  get isGuardarDisabled() {
    const { form } = this;
    if (!form) {
      return false;
    }
    return form.isDirty ? form.hasErrors : false;
  }

  get pasoActivo() {
    return Object.values(this.pasos).find(x => x.step === this.pasoActivoIndex);
  }
}
</script>

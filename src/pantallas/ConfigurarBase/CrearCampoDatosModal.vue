<template>
  <ModalMantenedor :show="show">
    <CabeceraModal :titulo="titulo" @cerrar="handleCerrar">
      <GuardarButton v-if="!modoEditar" @click="handleGuardar" />
      <GuardarCambiosButton v-if="modoEditar" @click="handleGuardar" />
    </CabeceraModal>
    <ContenidoModal>
      <div align="center">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-container fluid grid-list-md>
              <div align="left">
                <v-flex md12>
                  <h2 class="h2_title" style="margin-top: 12px!important;">
                    Campo de Datos
                  </h2>
                </v-flex>
              </div>
              <v-divider></v-divider>
              <br />
              <v-layout wrap>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    :label="formFields.codigo.label"
                    v-validate="'required|max:100'"
                    :error-messages="errors.collect(formFields.codigo.id)"
                    :data-vv-name="formFields.codigo.id"
                    v-model="formFields.codigo.value"
                    :counter="100"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md6>
                  <v-checkbox
                    :label="formFields.requerido.label"
                    v-model="formFields.requerido.value"
                    :data-vv-name="formFields.requerido.id"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm6 md6>
                  <v-select
                    :label="formFields.tipo.label"
                    v-validate="'required'"
                    :error-messages="errors.collect(formFields.tipo.id)"
                    :data-vv-name="formFields.tipo.id"
                    v-model="formFields.tipo.value"
                    :items="lstTipoDato"
                    item-text="campo"
                    item-value="id"
                  />
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    :label="formFields.descripcion.label"
                    v-validate="'required|max:200'"
                    :error-messages="errors.collect(formFields.descripcion.id)"
                    :data-vv-name="formFields.descripcion.id"
                    v-model="formFields.descripcion.value"
                    :counter="200"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    :label="formFields.regExp.label"
                    v-validate="'required|max:100'"
                    :error-messages="errors.collect(formFields.regExp.id)"
                    :data-vv-name="formFields.regExp.id"
                    v-model="formFields.regExp.value"
                    :counter="100"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    :label="formFields.mensajeError.label"
                    v-validate="'required|max:200'"
                    :error-messages="errors.collect(formFields.mensajeError.id)"
                    :data-vv-name="formFields.mensajeError.id"
                    v-model="formFields.mensajeError.value"
                    :counter="200"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </div>
    </ContenidoModal>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Campo de Datos' })"
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'el Campo de Datos' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="dialogConfirmacionGuardarEditar"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Campo de Datos',
          nombreEntidad: campoSeleccionado.codigoCampo,
        })
      "
      :mensaje="
        $t('mensajes.crud.editar.mensaje', { entidad: 'el Campo de Datos' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import {
  typeNuevosCampo,
  typeTipoCampo,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import {
  emitFormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    CabeceraModal,
    GuardarButton,
    GuardarCambiosButton,
    ModalMantenedor,
    Confirmation,
    ContenidoModal,
  },
})
export default class CrearCampoDatosModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() lstTipoDato: typeTipoCampo;
  @Prop() campoSeleccionado: typeNuevosCampo;

  titulo: string = 'Agregar Campos de Datos';
  dialogConfirmacionGuardar: boolean = false;
  dialogConfirmacionGuardarEditar: boolean = false;

  formFields: FormFieldDefMap = {
    codigo: {
      label: 'Código',
      id: 'codigo',
      value: '',
    },
    tipo: {
      label: 'Tipo de dato',
      id: 'tipo',
      value: '',
    },
    requerido: {
      label: 'Campo requerido',
      id: 'requerido',
      value: false,
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
    regExp: {
      label: 'Expresión regular',
      id: 'regExp',
      value: '',
    },
    mensajeError: {
      label: 'Mensaje error',
      id: 'mensajeError',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
  }

  handleCerrar() {
    this.formFields.codigo.value = '';
    this.formFields.tipo.value = '';
    this.formFields.descripcion.value = '';
    this.formFields.regExp.value = '';
    this.formFields.requerido.value = false;
    this.$emit('cerrar');
  }

  @Watch('modoEditar', { deep: true })
  handleModoEditarChange() {
    this.titulo = !this.modoEditar
      ? 'Agregar Campos de Datos'
      : 'Editar Campos de Datos: ';
  }

  @Watch('campoSeleccionado', { deep: true })
  handleCampoSeleccionadoChange() {
    if (this.campoSeleccionado) {
      this.formFields.codigo.value = this.campoSeleccionado.codigoCampo;
      this.formFields.tipo.value = this.campoSeleccionado.tipoCampo;
      this.formFields.descripcion.value = this.campoSeleccionado.descripcionCampo;
      this.formFields.regExp.value = this.campoSeleccionado.regExp;
      this.formFields.requerido.value = this.campoSeleccionado.requerido;
      this.formFields.mensajeError.value = this.campoSeleccionado.mensajeErrorFormato;
      this.titulo += this.modoEditar ? this.campoSeleccionado.codigoCampo : '';
    }
  }

  async handleGuardar() {
    const isValid = await this.$validator.validateAll();

    if (isValid) {
      if (!this.modoEditar) {
        this.dialogConfirmacionGuardar = true;
      } else {
        this.dialogConfirmacionGuardarEditar = true;
      }
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacionGuardar = false;
    this.dialogConfirmacionGuardarEditar = false;

    if (val) {
      var nuevoCampo: typeNuevosCampo = {
        codigoCampo: this.formFields.codigo.value.toString(),
        tipoCampo: Number(this.formFields.tipo.value.toString()),
        descripcionCampo: this.formFields.descripcion.value.toString(),
        regExp: this.formFields.regExp.value.toString(),
        requerido: Boolean(this.formFields.requerido.value),
        mensajeErrorFormato: this.formFields.mensajeError.value.toString(),
      };

      if (!this.modoEditar) {
        this.$emit('crear', nuevoCampo);
      } else {
        this.$emit('editar', nuevoCampo);
      }

      this.handleCerrar();
    }
  }
}
</script>

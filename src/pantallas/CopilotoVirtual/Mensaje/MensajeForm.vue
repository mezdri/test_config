<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Crear Mensaje">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <v-switch
                  v-model="estado"
                  :label="formFields.estado.label"
                  :id="formFields.estado.id"
                  color="yellow"
                  :readonly="isVerDetalle"
                  @change="cambio"
                  :hint="hint"
                  :persistent-hint="true"
                ></v-switch>
              </v-flex>

              <v-flex xs12 sm12 md12>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:50`"
                  :data-vv-name="formFields.nombre.id"
                  :id="formFields.nombre.id"
                  counter="50"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.nombre.id)"
                />
              </v-flex>

              <v-flex sm9 md9>
                <v-card>
                  <v-toolbar color="primary" dark>
                    <v-toolbar-title class="subheading"
                      >Redactar el mensaje</v-toolbar-title
                    >
                  </v-toolbar>
                  <v-textarea
                    v-model="formFields.mensaje.value"
                    :data-vv-name="formFields.mensaje.id"
                    :error-messages="errors.collect(formFields.mensaje.id)"
                    v-validate="'max:200'"
                    :counter="200"
                    :disabled="isVerDetalle"
                    class="mx-2 white"
                    rows="10"
                    prepend-icon="mdi-comment"
                  ></v-textarea>
                </v-card>
              </v-flex>
              <v-flex sm3 md3>
                <v-card>
                  <v-toolbar color="primary" dark>
                    <v-toolbar-title class="subheading"
                      >Variables</v-toolbar-title
                    >
                  </v-toolbar>
                  <v-list>
                    <v-list-tile
                      v-for="item in this.vVariables"
                      :key="item.Id"
                      :disabled="isVerDetalle"
                      icon
                      @click="concatenateString(item)"
                    >
                      <v-list-tile-content>
                        <v-list-tile-title
                          v-text="item.nombreMostrar"
                        ></v-list-tile-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn color="primary" fab small dark>
                          <v-icon>add</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>
                  </v-list>
                </v-card>
              </v-flex>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import {
  emitFormChangeEvent,
  FormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';

import {
  Mensaje,
  Variables,
} from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { MnsajeNuevo } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { fetchVariables } from '@/pantallas/CopilotoVirtual/Mensaje/fetchVariables';
import { OperacionesCrud } from '../../../reusable/Mantenedor/mantenedorUtils';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class MensajeForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ required: false }) mensajeSeleccionado: Mensaje;
  @Prop({ default: false }) esEditar: boolean;

  /* state */

  isFormValid: boolean = false;
  vVariables: Variables[] = [];

  mostrarConfirmacionEliminar: boolean = false;
  mostrarDatos: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;

  icono: any = {};
  iconoUrl = '';
  iconoBase64: string = '';
  nombre: string = '';
  mensaje: string[] = ['* Ya existe un Mensaje con este nombre.'];
  hint: string = '';
  estado: boolean = true;
  seleccionEstado: number = 0;

  modalCrudActivo: OperacionesCrud = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Título',
      id: 'id',
      value: '',
    },
    mensaje: {
      label: 'Mensaje',
      id: 'id',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'id',
      value: '',
    },
  };

  mounted() {
    const validator = makeValidatorDictionary(this.formFields);
    this.$validator.localize('es', validator);
    this.handleSeleccionadoChange();
    this.getVariables();
  }

  async getVariables() {
    this.vVariables = (await this.fetchVariables()) || [];
  }

  handleCrearClick() {
    this.$validator.errors.clear();
    this.mostrarModalCrear = true;
  }
  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar(e: FormChangeEvent) {
    this.mostrarModalCrear = false;
  }
  async handleCierreModalBtnGuardarEditar(e: FormChangeEvent) {}

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  @Watch('mensajeSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    if (!this.mensajeSeleccionado) {
      return;
    }
    this.formFields.nombre.value = this.mensajeSeleccionado.titulo;
    this.formFields.mensaje.value = this.mensajeSeleccionado.mensaje;
    this.estado = this.estado;
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          titulo: this.formFields.nombre.value,
          mensaje: this.formFields.mensaje.value,
          estado: this.formFields.estado.value,
        } as MnsajeNuevo,
      },
      this
    );
  }

  fetchVariables() {
    this.loadingService.showLoading();
    return fetchVariables()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las variables',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  constructor() {
    super();
  }
  created() {
    this.cambio();
  }

  cambio() {
    if (this.estado) {
      this.formFields.estado.value = 1;
      this.seleccionEstado = 1;
      this.formFields.estado.label = 'Activo';
      this.hint = '';
    } else {
      this.formFields.estado.value = 0;
      this.seleccionEstado = 2;
      this.formFields.estado.label = 'Inactivo';
      this.hint = 'Al dejar como inactivo, no se podrán realizar asociaciones.';
    }
    this.$emit('estadoSwitch', this.estado);
  }

  concatenateString(item: Variables) {
    this.formFields.mensaje.value += ' ' + item.nombreVariable;
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>

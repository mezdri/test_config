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
            <FormFieldsContainer titulo="Información General">
              <v-flex xs12>
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  persistent-hint
                  :hint="mensajeEstado"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex sm12 md12>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-validate="'required|max:80'"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  :counter="80"
                  :disabled="modoVer"
                ></v-text-field>
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer titulo="Script">
              <v-flex sm12 md12>
                <CodeView
                  @blur="handleBlur"
                  v-model="valorScript"
                  :readOnly="modoVer"
                ></CodeView>
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { debounce } from 'lodash';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  FormState as BaseFormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { Validator } from 'vee-validate';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { FuncionGlobal } from './servicios/Funciones';
import CodeView from '@/reusable/CodeView/CodeView.vue';

@Component({
  components: {
    FormFieldsContainer,
    CodeView,
  },
})
export default class InformacionGeneral extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop() funcionGlobal: FuncionGlobal;

  codUnico: number = 0;

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
  };
  isFormValid: boolean = false;
  mensajeEstado: string = '';

  valorScript: string = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    this.$validator.localize('es', validator);
  }

  mounted() {
    this.handleFormChange();
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const { formFields } = this;

    const nombre = formFields.nombre;
    const estados = new EstadosService().getEstadosVisibles();
    const estado = formFields.activo.value
      ? estados.find(x => x.id === EstadoEntidad.Activo)
      : estados.find(x => x.id === EstadoEntidad.Inactivo);

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre,
          estado,
        },
      },
      this
    );
  }

  @Watch('funcionGlobal', { deep: true, immediate: true })
  handleRecepcionActividadChange() {
    if (!this.funcionGlobal) {
      return;
    }
    const { formFields, funcionGlobal } = this;

    formFields.nombre.value = funcionGlobal.nombre;
    formFields.activo.value = funcionGlobal.estado;
    this.valorScript = funcionGlobal.script ? funcionGlobal.script : '';
  }

  handleBlur(valor: string) {
    this.$emit('setScript', valor);
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como Inactivo, no se permitirá aplicar la función.';
  }
}
</script>

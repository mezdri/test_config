<template>
  <ModalMantenedor :show="show">
    <CabeceraModal :titulo="titulo" @cerrar="handleCerrar">
      <GuardarButton @click="handleGuardar" />
    </CabeceraModal>
    <ContenidoModal>
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Información General">
              <v-flex xs12 sm12 md12>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-validate="'required|max:100'"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  :counter="100"
                ></v-text-field>
              </v-flex>
            </FormFieldsContainer>
            <div align="left">
              <h3>
                Código fuente (Javascript)
              </h3>
              <v-divider></v-divider>
              <br />
            </div>
            <v-layout wrap>
              <v-flex xs12 sm12 md12>
                <CodeView
                  @blur="handleBlur"
                  v-model="formFields.script.value"
                ></CodeView>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import {
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { ScriptValidacion } from '@/interfaces/ContratoProveedor';
import CodeView from '@/reusable/CodeView/CodeView.vue';

@Component({
  components: {
    CabeceraModal,
    GuardarButton,
    ModalMantenedor,
    ContenidoModal,
    FormFieldsContainer,
    CodeView,
  },
})
export default class CrearScriptModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() scriptSeleccionado: ScriptValidacion;
  @Prop() titulo: string;

  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    script: {
      label: '',
      id: 'script',
      value: '',
    },
  };

  beforeMount() {
    this.handleScriptSeleccionadoChange();
  }

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
  }

  @Watch('scriptSeleccionado', { deep: true })
  handleScriptSeleccionadoChange() {
    if (this.scriptSeleccionado) {
      this.formFields.nombre.value = this.scriptSeleccionado.nombre;
      this.formFields.script.value = this.scriptSeleccionado.script;
    }
  }

  handleCerrar() {
    this.formFields.nombre.value = '';
    this.formFields.script.value = '';
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.$validator.validateAll();

    if (isValid) {
      var scriptValidacion: ScriptValidacion = {
        nombre: this.formFields.nombre.value.toString(),
        script: this.formFields.script.value.toString(),
      };

      if (!this.modoEditar) {
        this.$emit('crear', scriptValidacion);
      } else {
        this.$emit('editar', scriptValidacion);
      }

      this.handleCerrar();
    }
  }

  handleBlur(valor: string) {
    this.formFields.script.value = valor;
  }
}
</script>
<style scoped>
h3 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Agregar Cabeceras HTTP" @cerrar="handleCerrar">
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
              <v-flex xs12 sm12 md12>
                <v-text-field
                  :label="formFields.valor.label"
                  v-validate="'required|max:100'"
                  :error-messages="errors.collect(formFields.valor.id)"
                  :data-vv-name="formFields.valor.id"
                  v-model="formFields.valor.value"
                  :counter="100"
                ></v-text-field>
              </v-flex>
            </FormFieldsContainer>
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

@Component({
  components: {
    CabeceraModal,
    GuardarButton,
    ContenidoModal,
    ModalMantenedor,
    FormFieldsContainer,
  },
})
export default class CrearCabeceraHttpModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() cabeceraSeleccionada: ScriptValidacion;

  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    valor: {
      label: 'Valor',
      id: 'valor',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
  }

  @Watch('cabeceraSeleccionada', { deep: true })
  handleCabeceraSeleccionadaChange() {
    if (this.cabeceraSeleccionada) {
      this.formFields.nombre.value = this.cabeceraSeleccionada.nombre;
      this.formFields.valor.value = this.cabeceraSeleccionada.script;
    }
  }

  handleCerrar() {
    this.formFields.nombre.value = '';
    this.formFields.valor.value = '';
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.$validator.validateAll();

    if (isValid) {
      var cabeceraHttp: ScriptValidacion = {
        nombre: this.formFields.nombre.value.toString(),
        script: this.formFields.valor.value.toString(),
      };

      if (!this.modoEditar) {
        this.$emit('crear', cabeceraHttp);
      } else {
        this.$emit('editar', cabeceraHttp);
      }

      this.handleCerrar();
    }
  }
}
</script>

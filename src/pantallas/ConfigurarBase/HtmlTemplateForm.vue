<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <FormFieldsContainer titulo="Mensaje">
              <slot name="prependHtmlTemplate" />
              <v-layout row wrap>
                <v-flex md12>
                  <v-textarea
                    solo
                    :rows="3"
                    :error-messages="errors.collect(formFields.mensaje.id)"
                    :data-vv-name="formFields.mensaje.id"
                    :no-resize="modoVer"
                    v-model="formFields.mensaje.value"
                    :disabled="modoVer"
                    @change="handleChangeMensaje"
                  ></v-textarea>
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
            <FormFieldsContainer titulo="HTML Template">
              <slot name="prependHtmlTemplate" />
              <v-layout row wrap>
                <v-flex md12>
                  <CodeView
                    :language="'text/html'"
                    :readOnly="modoVer"
                    v-model="formFields.html.value"
                    @blur="handleBlurHtml"
                  ></CodeView>
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import CodeView from '@/reusable/CodeView/CodeView.vue';

import {
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';

@Component({
  components: {
    StepTitle,
    FormFieldsContainer,
    CodeView,
  },
})
export default class HTMLTemplateForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() htmlTemplate: string;
  @Prop() mensaje: string;

  formFields: FormFieldDefMap = {
    mensaje: {
      label: '',
      id: 'mensaje',
      value: '',
    },
    html: {
      label: '',
      id: 'html',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleHTMLTemplateChange();
    this.handleMensajeChange();
  }

  @Watch('htmlTemplate', { deep: true })
  handleHTMLTemplateChange() {
    if (this.htmlTemplate) {
      this.formFields.html.value = this.htmlTemplate ? this.htmlTemplate : '';
    }
  }

  @Watch('mensaje', { deep: true })
  handleMensajeChange() {
    if (this.mensaje) {
      this.formFields.mensaje.value = this.mensaje;
    }
  }

  handleChangeMensaje(valor: string) {
    this.$emit('setMensaje', valor);
  }

  handleBlurHtml(valor: string) {
    this.$emit('setHtml', valor);
  }
}
</script>

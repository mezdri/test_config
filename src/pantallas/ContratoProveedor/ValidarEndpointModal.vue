<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Validar Script" @cerrar="handleCerrar">
    </CabeceraModal>
    <ContenidoModal>
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Validar Script">
              <v-flex xs12 sm12 md12>
                <v-text-field
                  :label="formFields.endpoint.label"
                  :data-vv-name="formFields.endpoint.id"
                  v-model="formFields.endpoint.value"
                ></v-text-field>
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer titulo="Endpoint">
              <v-layout row wrap>
                <v-flex xs12 sm12 md12>
                  <CodeView
                    @blur="handleScriptBlur"
                    v-model="script"
                  ></CodeView>
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
            <div align="left">
              <h2>
                Resultado
                <v-btn flat icon small @click="handleValidarEndpointClick">
                  <v-icon color="#228B22">play_arrow</v-icon>
                </v-btn>
              </h2>
              <v-divider></v-divider>
              <h3>{{ formFields.resultado.value }}</h3>
              <br />
            </div>
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
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CodeView from '@/reusable/CodeView/CodeView.vue';

import { ScriptValidacion, Evaluaciones } from '@/interfaces/ContratoProveedor';
import { evaluarScriptEndpoint } from '@/pantallas/ContratoProveedor/Services/evaluarScriptEndpoint';

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
export default class ValidarEndpointModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ required: true, default: '' }) script: string;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    endpoint: {
      label: 'Metadata Endpoint',
      id: 'endpoint',
      value: '',
    },
    resultado: {
      label: '',
      id: 'resultado',
      value: '',
    },
  };
  handleCerrar() {
    this.$emit('cerrar');
  }

  @Watch('show', { deep: true })
  handleShowChange() {
    this.formFields.endpoint.value = '';
    this.formFields.resultado.value = '';
  }

  handleScriptBlur(valor: string) {
    this.script = valor;
    this.$emit('blur', valor);
  }

  handleValidarEndpointClick() {
    this.loadingService.showLoading();
    evaluarScriptEndpoint({
      script: this.script,
      metadata: {
        usuario: 'usuario',
        password: 'password',
        endpoint: this.formFields.endpoint.value.toString(),
      },
    })
      .then((res: Evaluaciones) => {
        this.formFields.resultado.value = res.respuesta;
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

<style scoped>
h2 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

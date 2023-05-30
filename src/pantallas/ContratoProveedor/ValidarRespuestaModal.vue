<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Verificación de Respuesta" @cerrar="handleCerrar">
    </CabeceraModal>
    <ContenidoModal>
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md>
            <FormFieldsContainer>
              <v-flex md12>
                <div align="left">
                  <h2>
                    Mi Script
                    <v-btn flat icon small @click="handleValidarScriptClick">
                      <v-icon color="#228B22">play_arrow</v-icon>
                    </v-btn>
                  </h2>
                </div>
                <v-layout wrap>
                  <v-flex md12>
                    <v-textarea
                      solo
                      :rows="3"
                      v-model="formFields.scriptValidar.value"
                    ></v-textarea>
                  </v-flex>
                </v-layout>
              </v-flex>
            </FormFieldsContainer>
            <br />
            <table id="tRespuestas" aria-hidden="true">
              <tr>
                <th id="thStatus">Status HTTP</th>
                <th id="thRespuesta">Respuesta de servicio</th>
                <th id="thResultado">Resultado</th>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    :data-vv-name="formFields.statusHttp1.id"
                    v-model="formFields.statusHttp1.value"
                  />
                </td>
                <td>
                  <v-textarea
                    solo
                    :rows="3"
                    v-model="formFields.respuesta1.value"
                  ></v-textarea>
                </td>
                <td>{{ formFields.resultado1.value }}</td>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    :data-vv-name="formFields.statusHttp2.id"
                    v-model="formFields.statusHttp2.value"
                  />
                </td>
                <td>
                  <v-textarea
                    solo
                    :rows="3"
                    v-model="formFields.respuesta2.value"
                  ></v-textarea>
                </td>
                <td>{{ formFields.resultado2.value }}</td>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    :data-vv-name="formFields.statusHttp3.id"
                    v-model="formFields.statusHttp3.value"
                  />
                </td>
                <td>
                  <v-textarea
                    solo
                    :rows="3"
                    v-model="formFields.respuesta3.value"
                  ></v-textarea>
                </td>
                <td>{{ formFields.resultado3.value }}</td>
              </tr>
            </table>
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
import {
  Evaluaciones,
  ScriptValidacionRespuesta,
} from '@/interfaces/ContratoProveedor';
import CodeView from '@/reusable/CodeView/CodeView.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { evaluarScriptRespuesta } from '@/pantallas/ContratoProveedor/Services/evaluarScriptRespuesta';

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
export default class ValidarRespuestaModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ required: true, default: '' }) script: string;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    statusHttp1: {
      label: '',
      id: 'statusHttp1',
      value: '200',
    },
    statusHttp2: {
      label: '',
      id: 'statusHttp2',
      value: '200',
    },
    statusHttp3: {
      label: '',
      id: 'statusHttp3',
      value: '500',
    },
    respuesta1: {
      label: '',
      id: 'respuesta1',
      value: '<resp><cod>0</cod><msg>OK</msg></resp>',
    },
    respuesta2: {
      label: '',
      id: 'respuesta2',
      value: '<resp><cod>0</cod><msg>Error</msg></resp>',
    },
    respuesta3: {
      label: '',
      id: 'respuesta3',
      value: 'Sin body',
    },
    resultado1: {
      label: '',
      id: 'resultado1',
      value: '',
    },
    resultado2: {
      label: '',
      id: 'resultado2',
      value: '',
    },
    resultado3: {
      label: '',
      id: 'resultado3',
      value: '',
    },
    scriptValidar: {
      label: '',
      id: 'scriptValidar',
      value: '',
    },
  };

  handleCerrar() {
    this.$emit('cerrar');
  }

  @Watch('script', { deep: true })
  handleScriptChange() {
    if (this.script) {
      this.formFields.scriptValidar.value = this.script;
      this.handleValidarScriptClick();
    }
  }

  handleValidarScriptClick() {
    this.loadingService.showLoading();

    let scriptValidacionRespuesta: ScriptValidacionRespuesta = {
      script: this.formFields.scriptValidar.value.toString(),
      ejemplos: [
        {
          status: this.formFields.statusHttp1.value.toString(),
          headers: [],
          body: this.formFields.respuesta1.value.toString(),
        },
        {
          status: this.formFields.statusHttp2.value.toString(),
          headers: [],
          body: this.formFields.respuesta2.value.toString(),
        },
        {
          status: this.formFields.statusHttp3.value.toString(),
          headers: [],
          body: this.formFields.respuesta3.value.toString(),
        },
      ],
    };

    evaluarScriptRespuesta(scriptValidacionRespuesta)
      .then((res: Evaluaciones[]) => {
        this.formFields.resultado1.value = res[0] ? res[0].respuesta : '';
        this.formFields.resultado2.value = res[1] ? res[1].respuesta : '';
        this.formFields.resultado3.value = res[2] ? res[2].respuesta : '';
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

<style scoped>
#tRespuestas th,
#tRespuestas td {
  padding: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.54);
  width: 800px;
}
</style>

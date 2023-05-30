<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Verificación de Respuesta"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <div align="center" class="cardnew">
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md>
            <div align="left">
              <v-flex md12>
                <h2 class="h2_title" style="margin-top: 12px!important;">
                  Verificación de Respuesta
                </h2>
              </v-flex>
            </div>
            <v-divider></v-divider>
            <br />
            <table id="tRespuestas" aria-hidden="true">
              <tr>
                <th id="thEjemplo">Ejemplo Actividad con Dispositivo</th>
                <th id="thScript">
                  Script
                  <v-btn flat icon small @click="habldevalidarRespuesta">
                    <v-icon color="#228B22">play_arrow</v-icon>
                  </v-btn>
                </th>
                <th id="thResultado">Resultado</th>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    :data-vv-name="formFields.actividad1.id"
                    v-model="formFields.actividad1.value"
                  />
                </td>
                <td :rowspan="3">
                  <v-textarea
                    solo
                    :rows="12"
                    v-model="formFields.respuesta1.value"
                  ></v-textarea>
                </td>
                <td>{{ formFields.resultado1.value }}</td>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    :data-vv-name="formFields.actividad2.id"
                    v-model="formFields.actividad2.value"
                  />
                </td>
                <td>{{ formFields.resultado2.value }}</td>
              </tr>
              <tr>
                <td>
                  <v-text-field
                    :data-vv-name="formFields.actividad3.id"
                    v-model="formFields.actividad3.value"
                  />
                </td>
                <td>{{ formFields.resultado3.value }}</td>
              </tr>
            </table>
          </v-container>
        </v-card>
      </v-flex>
    </div>
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
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  Evaluaciones,
  ScriptValidacionRespuesta,
} from '@/interfaces/ContratoProveedor';
import CodeView from '@/reusable/CodeView/CodeView.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';

import { evaluarScriptRespuesta } from '@/pantallas/ContratoProveedor/Services/evaluarScriptRespuesta';

@Component({
  components: {
    CabeceraModal,
    GuardarButton,
    ModalMantenedor,
    FormFieldsContainer,
    CodeView,
  },
})
export default class ValidarRespuestaModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ required: true, default: '' }) script: string;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios = new AxiosVue(ServicioProxy.Dispositivo);

  formFields: FormFieldDefMap = {
    actividad1: {
      label: '',
      id: 'actividad1',
      value: '',
    },
    actividad2: {
      label: '',
      id: 'actividad2',
      value: '',
    },
    actividad3: {
      label: '',
      id: 'actividad3',
      value: '',
    },
    respuesta1: {
      label: '',
      id: 'respuesta1',
      value: '',
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
  };

  handleCerrar() {
    this.$emit('cerrar', this.formFields.respuesta1.value);
  }

  @Watch('script', { deep: true })
  handleScriptChange() {
    if (this.script) {
      this.formFields.respuesta1.value = this.script;
    }
  }

  async habldevalidarRespuesta() {
    let model: any = {
      Script: this.formFields.respuesta1.value,
      Ejemplos: [
        this.formFields.actividad1.value.toString(),
        this.formFields.actividad2.value.toString(),
        this.formFields.actividad3.value.toString(),
      ],
    };
    const res: any = await this.axios.http.post(
      'dispositivo/evaluavalidacion',
      model
    );
    let cont = 1;
    res.data.value.ejemplos.forEach((x: any) => {
      switch (cont) {
        case 1:
          this.formFields.resultado1.value =
            x.mensaje != '' ? x.mensaje : x.valor;
          break;
        case 2:
          this.formFields.resultado2.value =
            x.mensaje != '' ? x.mensaje : x.valor;
          break;
        case 3:
          this.formFields.resultado3.value =
            x.mensaje != '' ? x.mensaje : x.valor;
          break;

        default:
          break;
      }
      cont++;
    });
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

.h2_title {
  font-weight: normal;
}
</style>

<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Prueba de Filtro de Actividad"
      @cerrar="handleCerrar"
    >
    </CabeceraModal>
    <ContenidoModal>
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md>
            <table id="tFiltro" aria-hidden="true">
              <tr>
                <th id="thActividad">Actividad</th>
                <th id="thFiltro">Filtro</th>
                <th id="thResultado">Resultado</th>
              </tr>
              <tr>
                <td>
                  <v-textarea
                    solo
                    :rows="3"
                    v-model="formFields.actividad1.value"
                  ></v-textarea>
                </td>
                <td rowspan="2">
                  <v-textarea solo :rows="10" v-model="script"></v-textarea>
                </td>
                <td>
                  <strong>{{ formFields.resultado1.value }}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <v-textarea
                    solo
                    :rows="3"
                    v-model="formFields.actividad2.value"
                  ></v-textarea>
                </td>
                <td>
                  <strong>{{ formFields.resultado2.value }}</strong>
                </td>
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
import { ScriptValidacion, Evaluaciones } from '@/interfaces/ContratoProveedor';
import CodeView from '@/reusable/CodeView/CodeView.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { evaluarScriptFiltro } from '@/pantallas/ContratoProveedor/Services/evaluarScriptFiltro';

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
export default class ValidarFiltroActividadModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ required: true, default: '' }) script: string;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    actividad1: {
      label: '',
      id: 'actividad1',
      value: '{"id": 1, "gpsValid" : 1}',
    },
    actividad2: {
      label: '',
      id: 'actividad2',
      value: '{"id": 2, "gpsValid" : 2}',
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
  };

  @Watch('script', { deep: true })
  handleScriptChange() {
    if (this.script) {
      this.handleValidarScriptClick();
    }
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleValidarScriptClick() {
    this.loadingService.showLoading();
    evaluarScriptFiltro({
      script: this.script,
      ejemplos: [
        this.formFields.actividad1.value.toString(),
        this.formFields.actividad2.value.toString(),
      ],
    })
      .then((res: Evaluaciones[]) => {
        this.formFields.resultado1.value = res[0] ? res[0].respuesta : '';
        this.formFields.resultado2.value = res[1] ? res[1].respuesta : '';
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

<style scoped>
#tFiltro th,
#tFiltro td {
  padding: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.54);
  width: 800px;
}
</style>

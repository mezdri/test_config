<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Modal de Prueba de Mapeo de Body"
      @cerrar="handleCerrar"
    >
    </CabeceraModal>
    <ContenidoModal>
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Modal de Prueba">
              <v-flex md4>
                <div align="left">
                  <v-select
                    :data-vv-name="formFields.ejemplos.id"
                    :items="formFields.ejemplos.items"
                    item-text="nombre"
                    item-value="id"
                    v-model="formFields.ejemplos.value"
                    @change="handleEjemplosChange"
                  />
                </div>
                <v-layout wrap>
                  <v-flex md12>
                    <v-textarea
                      solo
                      :rows="10"
                      v-model="formFields.ejemplo.value"
                    ></v-textarea>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex md4>
                <div align="left">
                  <h3>
                    Mi Script
                    <v-btn flat icon small @click="handleValidarScriptClick">
                      <v-icon color="#228B22">play_arrow</v-icon>
                    </v-btn>
                  </h3>
                  <v-divider></v-divider>
                  <br />
                </div>
                <v-layout wrap>
                  <v-flex md12>
                    <v-textarea
                      solo
                      :rows="10"
                      v-model="formFields.scriptValidar.value"
                    ></v-textarea>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex md4>
                <div align="left">
                  <h3 class="ajuste">Resultado</h3>
                  <v-divider></v-divider>
                  <br />
                </div>
                <v-layout wrap>
                  <v-flex md12>
                    <v-textarea
                      solo
                      :rows="10"
                      v-model="formFields.resultado.value"
                    ></v-textarea>
                  </v-flex>
                </v-layout>
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
import { ScriptValidacion, Evaluaciones } from '@/interfaces/ContratoProveedor';
import CodeView from '@/reusable/CodeView/CodeView.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import { evaluarScriptBody } from '@/pantallas/ContratoProveedor/Services/evaluarScriptBody';

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
export default class ValidarBodyModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ required: true, default: '' }) script: string;
  @Prop() tipo: string;

  language: string = 'text/javascript';
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    ejemplos: {
      label: '',
      id: 'ejemplos',
      value: 0,
      items: [
        {
          id: 0,
          nombre: 'Body',
          ejemplo:
            '[{"id": "1", "patente": "AABB11"}, {"id": "2", "patente" : "AABB22"}]',
        },
      ],
    },
    ejemplo: {
      label: 'Ejemplo',
      id: 'ejemplo',
      value: '',
    },
    scriptValidar: {
      label: '',
      id: 'script',
      value: '',
    },
    resultado: {
      label: '',
      id: 'resultado',
      value: '',
    },
  };

  beforeMount() {
    this.handleScriptChange();
    this.handleTipoChange();
    this.formFields.ejemplo.value =
      '[{"id": "1", "patente": "AABB11"}, {"id": "2", "patente" : "AABB22"}]';
  }

  @Watch('script', { deep: true })
  handleScriptChange() {
    this.formFields.scriptValidar.value = this.script;
  }

  @Watch('tipo', { deep: true })
  handleTipoChange() {
    this.language =
      this.tipo == 'template' ? 'application/xml' : 'text/javascript';
  }

  handleCerrar() {
    this.formFields.resultado.value = '';
    this.$emit('cerrar');
  }

  handleEjemploBlur(value: string) {
    this.formFields.ejemplo.value = value;
  }

  handleScriptBlur(value: string) {
    this.formFields.scriptValidar.value = value;
  }

  handleEjemplosChange(value: number) {
    this.formFields.ejemplo.value = this.formFields.ejemplo.items.find(
      i => i.id == value
    ).ejemplo;
  }

  handleValidarScriptClick() {
    this.loadingService.showLoading();
    evaluarScriptBody({
      script: this.formFields.scriptValidar.value.toString(),
      ejemplos: [this.formFields.ejemplo.value.toString()],
      tipo: this.tipo,
    })
      .then((res: Evaluaciones[]) => {
        this.formFields.resultado.value = res[0] ? res[0].respuesta : '';
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>

<style scoped>
h3 {
  font-weight: normal;
  margin-top: 12px !important;
}

.ajuste {
  padding-bottom: 16px;
}
</style>

<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" class="col-md-12">
          <v-container grid-list-md>
            <div align="left">
              <h2>
                Configuración de Mapeos
              </h2>
              <v-divider></v-divider>
              <br />
            </div>
            <div align="left">
              <h3>
                Mapeos de Body JS
                <v-btn
                  v-if="!modoVer"
                  flat
                  icon
                  small
                  @click="handleValidarScript('js')"
                >
                  <v-icon color="#228B22">play_arrow</v-icon>
                </v-btn>
              </h3>
              <v-divider></v-divider>
              <br />
            </div>
            <v-layout wrap>
              <v-flex md12>
                <CodeView
                  @blur="handleMapeoJsBlur"
                  v-model="mapeoJs"
                  :readOnly="modoVer"
                ></CodeView>
              </v-flex>
            </v-layout>
            <div align="left">
              <h3>
                Mapeos de Body Template
                <v-btn
                  v-if="!modoVer"
                  flat
                  icon
                  small
                  @click="handleValidarScript('template')"
                >
                  <v-icon color="#228B22">play_arrow</v-icon>
                </v-btn>
              </h3>
              <v-divider></v-divider>
              <br />
            </div>
            <v-layout wrap>
              <v-flex md12>
                <CodeView
                  @blur="handleMapeoTemplateBlur"
                  v-model="mapeoTemplate"
                  :language="'application/xml'"
                  :readOnly="modoVer"
                ></CodeView>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <ValidarBodyModal
      :show="muestraModalValidar"
      :script="scriptValidar"
      :tipo="tipo"
      @cerrar="handleCierreModal"
    ></ValidarBodyModal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { debounce } from 'lodash';
import moment from 'moment';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  FormState as BaseFormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import CampoContrasena from '@/reusable/Form/CampoContrasena.vue';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import {
  ClienteProveedorGps,
  fetchClientesProveedorGps,
} from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import CodeView from '@/reusable/CodeView/CodeView.vue';

import {
  ContratoProveedorBackend,
  MapeosBody,
} from '@/interfaces/ContratoProveedor';
import ValidarBodyModal from '@/pantallas/ContratoProveedor/ValidarBodyModal.vue';

@Component({
  components: {
    CampoContrasena,
    DatePicker,
    FormFieldsContainer,
    CodeView,
    ValidarBodyModal,
  },
})
export default class MapeoRespuesta extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop() mapeoJsEditarVer: MapeosBody;
  @Prop() mapeoTemplateEditarVer: MapeosBody;

  scriptValidar: string = '';
  tipo: string = 'js';
  mapeoJs: string = '';
  mapeoTemplate: string = '';
  muestraModalValidar: boolean = false;

  beforeMount() {
    this.handleMapeoJsEditarVerChange();
    this.handleMapeoTemplateEditarVerChange();
  }

  @Watch('mapeoJsEditarVer', { deep: true, immediate: true })
  handleMapeoJsEditarVerChange() {
    if (this.mapeoJsEditarVer) {
      this.mapeoJs = this.mapeoJsEditarVer.script;
    }
  }

  @Watch('mapeoTemplateEditarVer', { deep: true, immediate: true })
  handleMapeoTemplateEditarVerChange() {
    if (this.mapeoTemplateEditarVer) {
      this.mapeoTemplate = this.mapeoTemplateEditarVer.script;
    }
  }

  handleMapeoJsBlur(valor: string) {
    this.mapeoJs = valor;
    this.$emit('blurMapeoJs', valor);
  }

  handleMapeoTemplateBlur(valor: string) {
    this.mapeoTemplate = valor;
    this.$emit('blurMapeoTemplate', valor);
  }

  handleValidarScript(tipo: string) {
    this.scriptValidar = tipo == 'js' ? this.mapeoJs : this.mapeoTemplate;
    this.tipo = tipo;
    this.muestraModalValidar = true;
  }

  handleCierreModal() {
    this.muestraModalValidar = false;
  }
}
</script>
<style scoped>
h2,
h3 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" class="col-md-12">
          <v-container grid-list-md>
            <div align="left">
              <h2>
                Mapeo de Respuesta
                <v-btn
                  v-if="!modoVer"
                  flat
                  icon
                  small
                  @click="handleValidarRespuestaClick"
                >
                  <v-icon color="#228B22">play_arrow</v-icon>
                </v-btn>
              </h2>
              <v-divider></v-divider>
              <br />
            </div>
            <v-layout wrap>
              <v-flex md12>
                <CodeView
                  @blur="handleMapeoRespuestaBlur"
                  v-model="valorScript"
                  :readOnly="modoVer"
                ></CodeView>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <ValidarRespuestaModal
      :show="muestraModalValidar"
      :script="valorScript"
      @cerrar="handleCierreModal"
    ></ValidarRespuestaModal>
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

import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';
import ValidarRespuestaModal from '@/pantallas/ContratoProveedor/ValidarRespuestaModal.vue';

@Component({
  components: {
    CampoContrasena,
    DatePicker,
    FormFieldsContainer,
    CodeView,
    ValidarRespuestaModal,
  },
})
export default class MapeoRespuesta extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop() contratoRespuesta: string;

  valorScript: string = '';
  muestraModalValidar: boolean = false;

  mounted() {
    this.handleContratoProveedorChange();
  }

  @Watch('contratoRespuesta', { deep: true })
  handleContratoProveedorChange() {
    if (this.contratoRespuesta) {
      this.valorScript = this.contratoRespuesta;
    }
  }

  handleMapeoRespuestaBlur(valor: string) {
    this.valorScript = valor;
    this.$emit('blur', valor);
  }

  handleValidarRespuestaClick() {
    this.muestraModalValidar = true;
  }

  handleCierreModal() {
    this.muestraModalValidar = false;
  }
}
</script>
<style scoped>
h2 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>

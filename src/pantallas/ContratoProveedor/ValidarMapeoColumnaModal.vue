<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Modal de Prueba de Mapeo de Columna"
      @cerrar="handleCerrar"
    >
    </CabeceraModal>
    <ContenidoModal>
      <v-flex md10>
        <v-card class="rounded-card">
          <v-container grid-list-md text-xs-center>
            <FormFieldsContainer titulo="Modal de Prueba">
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
              <br /><br />
            </FormFieldsContainer>
            <v-layout row wrap>
              <v-flex md12>
                <v-card>
                  <MantenedorGrid :grid-options="gridOptions" />
                </v-card>
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
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { ScriptValidacion, Evaluaciones } from '@/interfaces/ContratoProveedor';
import CodeView from '@/reusable/CodeView/CodeView.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
} from 'ag-grid-community';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';

import { evaluarScriptCampo } from '@/pantallas/ContratoProveedor/Services/evaluarScriptCampo';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    ContenidoModal,
    FormFieldsContainer,
    CodeView,
    MantenedorGrid,
  },
})
export default class ValidarMapeoColumnaModal extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop() scriptSeleccionado: ScriptValidacion;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    scriptValidar: {
      label: '',
      id: 'scriptValidar',
      value: '',
    },
  };

  columnApi: ColumnApi;
  gridApi: GridApi = null;

  lstActividades: any[] = [
    {
      actividad: 'Actividad con vehiculo detenido',
      script: '{"id":"01","campoNuevo":"01-NUEVO"}',
      resultado: '',
    },
    {
      actividad: 'Actividad con botón de pánico',
      script: '{"id":"02","campoNuevo":"02-NUEVO"}',
      resultado: '',
    },
    {
      actividad: 'Actividad con exceso de velocidad',
      script: '{"id":"03","campoNuevo":"03-NUEVO"}',
      resultado: '',
    },
  ];

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Actividad',
        field: 'actividad',
      },
      {
        headerName: 'Resultado',
        field: 'resultado',
      },
    ],
    onGridReady: this.handleGridReady,
  };

  beforeMount() {
    this.handleScriptChange();
  }

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.lstActividades);
  }

  @Watch('scriptSeleccionado', { deep: true })
  handleScriptChange() {
    this.formFields.scriptValidar.value = this.scriptSeleccionado.script;
  }

  handleCerrar() {
    this.lstActividades[0].resultado = '';
    this.lstActividades[1].resultado = '';
    this.lstActividades[2].resultado = '';
    this.$emit('cerrar');
  }

  handleScriptBlur(value: string) {
    this.formFields.scriptValidar.value = value;
  }

  handleValidarScriptClick() {
    this.loadingService.showLoading();
    evaluarScriptCampo({
      nombre: this.scriptSeleccionado.nombre,
      script: this.formFields.scriptValidar.value.toString(),
      ejemplos: [
        this.lstActividades[0].script,
        this.lstActividades[1].script,
        this.lstActividades[2].script,
      ],
    })
      .then((res: Evaluaciones[]) => {
        this.lstActividades[0].resultado = res[0] ? res[0].respuesta : '';
        this.lstActividades[1].resultado = res[1] ? res[1].respuesta : '';
        this.lstActividades[2].resultado = res[2] ? res[2].respuesta : '';
        this.gridApi.setRowData(this.lstActividades);
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

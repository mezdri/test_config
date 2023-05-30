<template>
  <FormFieldsContainer>
    <v-flex md3>
      <v-text-field
        :label="formFields.minimoDiasDetencion.label"
        v-model="formFields.minimoDiasDetencion.value"
        v-validate="'numeric'"
        :error-messages="errors.collect('numSim')"
        data-vv-name="numSim"
        :disabled="accion === 3"
      />
    </v-flex>
    <v-flex md2>
      <v-text-field
        v-model="formFields.minimoTiempo.value"
        v-validate="!false && 'required'"
        :label="formFields.minimoTiempo.label"
        :error-messages="errors.collect('minimoTiempo')"
        :id="formFields.minimoTiempo.id"
        :disabled="accion === 3"
        type="time"
      />
    </v-flex>
  </FormFieldsContainer>
</template>

<script lang="ts">
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import config from '@/config/index';
import { FiltrosBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import InformeEventBus from '../../../Informes/partes/InformeEventBus';
import moment from 'moment';

@Component({
  components: {
    FormFieldsContainer,
    TimePicker,
  },
})
export default class ResumenTiempos extends Vue {
  @Prop({ default: (): [] => [] }) filtro: FiltrosBackend[];
  @Prop({ default: 1 }) accion: number;

  formFields: FormFieldDefMap = {
    minimoDiasDetencion: {
      label: 'Mínimo días de detención',
      id: '9',
      value: null,
    },
    minimoTiempo: {
      label: 'Mínimo de tiempo',
      id: '10',
      value: null,
    },
  };

  dictionaryFormErrors: any = {};

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          minimoDiasDetencion: this.formFields.minimoDiasDetencion.value,
          tiempoMinimo: this.formFields.minimoTiempo.value
            ? this.formFields.minimoTiempo.value.toString()
            : null,
        } as any,
      },
      this
    );
  }

  @Watch('filtro', { deep: true, immediate: true })
  handlefiltro() {
    if (this.filtro) {
      const { minimoDiasDetencion, minimoTiempo } = this.formFields;

      const minimoDias = this.filtro.find(
        x => x.reporteFiltroId === parseInt(minimoDiasDetencion.id)
      );

      const minimoTiempoD = this.filtro.find(
        x => x.reporteFiltroId == parseInt(minimoTiempo.id)
      );

      minimoDiasDetencion.value =
        minimoDias == undefined ? null : minimoDias.value;

      minimoTiempo.value =
        minimoTiempoD == undefined ? null : minimoTiempoD.value;
    }
  }

  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        numSim: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
        minimoTiempo: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
}
</script>

<style scoped></style>

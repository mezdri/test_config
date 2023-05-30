<template>
  <v-form ref="form" v-model="isFormValid" lazy-validation class="col-md-12">
    <FormFieldsContainer>
      <v-flex md3>
        <v-text-field
          :label="formFields.limiteVelocidad.label"
          :id="formFields.limiteVelocidad.id"
          v-model="formFields.limiteVelocidad.value"
          prepend-icon="network_check"
          @change="limiteVelocidad"
          :error-messages="errors.collect('velMax')"
          data-vv-name="velMax"
          v-validate="'required|numeric|max:3|max_value:120|min_value:1'"
          :counter="3"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex md2>
        <v-checkbox
          :label="formFields.precision.label"
          v-model="formFields.precision.value"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-card elevation="0" v-show="formFields.precision.value">
        <div style="display: flex">
          <div class="divClassLabel">Excluir</div>
          <div class="divClassLabel">HDOP >=</div>
          <v-text-field
            :label="formFields.hdop.label"
            class="text-speeding"
            v-model="formFields.hdop.value"
            v-validate="'required|decimal|max_value:10|min_value:0.1'"
            data-vv-name="precisionHdop"
            :error-messages="errors.collect('precisionHdop')"
            :disabled="accion === 3"
          >
          </v-text-field>
          <div class="divClassLabel">N° Satélites &lt;=</div>
          <v-text-field
            :label="formFields.satelites.label"
            class="text-speeding"
            v-model="formFields.satelites.value"
            v-validate="'required|decimal|max_value:100|min_value:2'"
            data-vv-name="precisionSatelite"
            :error-messages="errors.collect('precisionSatelite')"
            :disabled="accion === 3"
          >
          </v-text-field>
        </div>
      </v-card>
    </FormFieldsContainer>
  </v-form>
</template>
<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import InformeEventBus from '../partes/InformeEventBus';
import { Validator } from 'vee-validate';
import config from '../../../config';

@Component({
  components: {
    FormFieldsContainer,
  },
})
export default class CheckExcesoVelocidad extends Vue {
  @Prop() txtLimiteVelocidad: any;
  @Prop({ default: 1.5 }) precisionHdop: any;
  @Prop({ default: 8 }) precisionSatelites: any;
  @Prop() precisionEV: boolean;
  @Prop({ default: 1 }) accion: number;
  isFormValid: boolean = false;
  dictionaryFormErrors: any = {};
  formFields: FormFieldDefMap = {
    limiteVelocidad: {
      label: 'Límite de Velocidad',
      id: 'limiteVelocidad',
      value: 30,
    },
    precision: {
      label: 'Precisión de GPS',
      id: 'precisionid',
      value: false,
    },
    hdop: {
      label: 'HDOP',
      id: 'hdopid',
      value: 1.5,
    },
    satelites: {
      label: 'Nro satélites',
      id: 'satelitesid',
      value: 8,
    },
  };

  @Watch('txtLimiteVelocidad', { deep: true, immediate: true })
  onSpeedLimitChanged() {
    this.formFields.limiteVelocidad.value = this.txtLimiteVelocidad;
  }
  @Watch('precisionHdop', { deep: true, immediate: true })
  onHdopPrecisionChanged() {
    this.formFields.hdop.value = this.precisionHdop;
  }
  @Watch('precisionSatelites', { deep: true, immediate: true })
  onSateliteChanged() {
    this.formFields.satelites.value = this.precisionSatelites;
  }

  @Watch('precisionEV', { deep: true, immediate: true })
  onPrecisionEVChanged() {
    this.formFields.precision.value = this.precisionEV;
  }

  @Watch('formFields.limiteVelocidad.value')
  async onSpeedChanged(value: string, lastValue: string) {
    this.limiteVelocidad();
    this.handleValidate();
  }

  @Watch('formFields.precision.value')
  async onValueChanged(value: boolean, lastValue: boolean) {
    InformeEventBus.$emit('precisionGps', value);
    if (value) {
      if (Number(this.formFields.hdop.value) == 0) {
        this.formFields.hdop.value = 1.5;
      }
      if (Number(this.formFields.satelites.value) == 0) {
        this.formFields.satelites.value = 8;
      }
      InformeEventBus.$emit(
        'precisionHdop',
        this.formFields.hdop.value.toString()
      );
      InformeEventBus.$emit(
        'precisionSatelites',
        this.formFields.satelites.value.toString()
      );
    } else {
      InformeEventBus.$emit('precisionHdop', '0');
      InformeEventBus.$emit('precisionSatelites', '0');
    }
  }
  @Watch('formFields.hdop.value')
  async onHdopChanged(value: string, lastValue: string) {
    InformeEventBus.$emit('precisionHdop', value);
    this.handleValidatePrecisionHdop();
  }
  @Watch('formFields.satelites.value')
  async onSatelitesChanged(value: string, lastValue: string) {
    InformeEventBus.$emit('precisionSatelites', value);
    this.handleValidatePrecisionSatelites();
  }

  limiteVelocidad() {
    InformeEventBus.$emit(
      'txtLimiteVelocidad',
      this.formFields.limiteVelocidad.value
    );
  }
  async handleValidate() {
    const valid = await this.$validator.validate('velMax');
    InformeEventBus.$emit('velocidadValidada', valid);
  }
  async handleValidatePrecisionHdop() {
    const valideHdop = await this.$validator.validate('precisionHdop');
    InformeEventBus.$emit('validatePrecisionHdop', valideHdop);
  }
  async handleValidatePrecisionSatelites() {
    const valideSatelites = await this.$validator.validate('precisionSatelite');
    InformeEventBus.$emit('validatePrecisionSatelite', valideSatelites);
  }
  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        velMax: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
          max_value: () =>
            '* Limite de Velocidad debe ser mayor a 0 y menor a 120 km/h.',
          min_value: () =>
            '* Limite de Velocidad debe ser mayor a 0 y menor a 120 km/h.',
        },
        precisionHdop: {
          required: () => config.errorMensajes.textoRequerido,
          decimal: config.errorMensajes.soloNumeros,
          max_value: () => '* El Hdop debe ser mayor o igual a 0 y menor a 10.',
          min_value: () => '* El Hdop debe ser mayor o igual a 0 y menor a 10.',
        },
        precisionSatelite: {
          required: () => config.errorMensajes.textoRequerido,
          decimal: config.errorMensajes.soloNumeros,
          max_value: () =>
            '* El número de satélites debe ser mayor a 2 y menor a 100.',
          min_value: () =>
            '* El número de satélites debe ser mayor a 2 y menor a 100.',
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    InformeEventBus.$on('validaVelocidadMaxima', (validador: any) => {
      this.handleValidate();
    });
  }
}
</script>
<style scoped>
.text-speeding {
  margin-left: 5px;
  width: 100px;
  margin-right: 15px;
  padding-right: 5px;
}
.divClassLabel {
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

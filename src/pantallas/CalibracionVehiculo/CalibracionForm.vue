<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Información Recalibración">
              <slot name="prependInformacionGeneral" />
              <v-flex xs6 sm6 md6>
                <DatePicker
                  :label="formFields.fecha.label"
                  :error-messages="errors.collect(formFields.fecha.id)"
                  :id="formFields.fecha.id"
                  v-model="formFields.fecha.value"
                  v-validate="'required'"
                  :disabled="modoVer"
                  :max="fechaMaxima"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  type="time"
                  prepend-icon="access_time"
                  :label="formFields.hora.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.hora.id)"
                  :data-vv-name="formFields.hora.id"
                  v-model="formFields.hora.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 v-if="objeto == 'odometro'">
                <v-text-field
                  :label="formFields.valorOdometro.label"
                  v-validate="'required|max:7|numeric|valorValido'"
                  :error-messages="errors.collect(formFields.valorOdometro.id)"
                  :data-vv-name="formFields.valorOdometro.id"
                  v-model="formFields.valorOdometro.value"
                  counter="7"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6 v-if="objeto == 'horometro'">
                <v-text-field
                  :label="formFields.valorHorometro.label"
                  v-validate="'required|max:7|numeric|valorValido'"
                  :error-messages="errors.collect(formFields.valorHorometro.id)"
                  :data-vv-name="formFields.valorHorometro.id"
                  v-model="formFields.valorHorometro.value"
                  counter="7"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import moment from 'moment';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { Snotify } from '@/snotify/Snotify';
import { CalibracionVehiculo, UltimaCalibracion } from './CalibracionVehiculo';
import { Validator } from 'vee-validate';
import { fetchUltimaCalibracion } from '@/pantallas/CalibracionVehiculo/Services/fetchUltimaCalibracion';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    DatePicker,
    TimePicker,
  },
})
export default class CalibracionForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ required: true }) objeto: string;
  @Prop() calibracionSeleccionada: CalibracionVehiculo;
  @Prop({ default: 0 }) idVehiculo: number;

  isFormValid: boolean = false;
  readonly $snotify: Snotify;

  timeHoraInicio: any = null;
  horaInicioModel: any = false;
  vehiculoId: number = 0;

  formFields: FormFieldDefMap = {
    fecha: {
      label: 'Fecha Registro Calibración',
      id: 'fecha',
      value: null,
    },
    hora: {
      label: 'Hora Registro Calibración',
      id: 'hora',
      value: null,
    },
    valorOdometro: {
      label: 'Valor actual del Odómetro',
      id: 'valorOdometro',
      value: '',
    },
    valorHorometro: {
      label: 'Valor actual del Horómetro',
      id: 'valorHorometro',
      value: '',
    },
  };

  constructor() {
    super();
    this.registrarValidadores();
  }

  registrarValidadores() {
    const self = this;
    Validator.extend(
      'valorValido',
      (value: number) => {
        return this.validarValor(value);
      },
      {
        hasTarget: true,
      }
    );
  }

  validarValor(valor: number) {
    let esEditar: boolean = false;
    if (!this.calibracionSeleccionada) {
      this.vehiculoId = this.idVehiculo;
    } else {
      this.vehiculoId = this.calibracionSeleccionada.vehiculoId;
      esEditar = true;
    }
    return fetchUltimaCalibracion(this.vehiculoId, this.objeto, esEditar)
      .then((res: UltimaCalibracion) => {
        if (res.fecha) {
          if (res.valor >= valor) {
            return false;
          }
        }
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange(this.formFields);
  }

  mounted() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje =
      '* Valor actual del ' +
      this.objeto +
      ' debe ser mayor al último ingresado';
    validator.custom.valorOdometro.valorValido = mensaje;
    validator.custom.valorHorometro.valorValido = mensaje;
    this.$validator.localize('es', validator);

    this.handleFormChange(this.formFields);
    this.handlecalibracionSeleccionadaChange();
  }

  @Watch('calibracionSeleccionada', { deep: true })
  handlecalibracionSeleccionadaChange() {
    if (this.calibracionSeleccionada) {
      this.formFields.fecha.value = this.calibracionSeleccionada.fecha;
      this.formFields.hora.value = this.calibracionSeleccionada.fecha.format(
        'HH:mm'
      );
      this.formFields.valorOdometro.value = this.calibracionSeleccionada.odometroPlataforma;
      this.formFields.valorHorometro.value = this.calibracionSeleccionada.horasMotorPlataforma;
      this.$validator.reset();
    }
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    const mergeDiaHora = (dia: moment.Moment | null, hora: string | null) => {
      if (dia === null) {
        return dia;
      }
      return hora
        ? dia
            .hour(Number(hora.split(':')[0]))
            .minute(Number(hora.split(':')[1]))
        : dia;
    };

    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        fecha: mergeDiaHora(
          fields.fecha.value as moment.Moment,
          fields.hora.value ? fields.hora.value.toString() : null
        ),
        odometroPlataforma: fields.valorOdometro.value,
        horasMotorPlataforma: fields.valorHorometro.value,
      } as CalibracionVehiculo,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

  get fechaMaxima() {
    const today = new Date();
    let fechaMax =
      today.getFullYear() +
      '-' +
      this.setCeros((today.getMonth() + 1).toString()) +
      '-' +
      this.setCeros(today.getDate().toString());

    return fechaMax;
  }

  setCeros(valor: string) {
    return valor.length == 1 ? '0' + valor : valor;
  }
}
</script>

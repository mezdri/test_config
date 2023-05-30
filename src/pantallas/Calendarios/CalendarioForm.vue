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
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12 v-show="mostrarActivo">
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  @change="cambioEstadoSwitch"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.activo.id)"
                  :data-vv-name="formFields.activo.id"
                  :hint="mensajeEstado"
                  persistent-hint
                  :readonly="isVerDetalle"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombreCalendario.label"
                  v-model="formFields.nombreCalendario.value"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :id="formFields.nombreCalendario.id"
                  counter="80"
                  :disabled="isVerDetalle"
                  :error-messages="
                    errors.collect(formFields.nombreCalendario.id)
                  "
                  :validate="validarNombreCalendario"
                  message=" Ya existe un Calendario con este nombre."
                ></CampoUnico>
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer titulo="Frecuencia">
              <slot name="prependFrecuencia" />
              <v-flex xs12 md12 lg12>
                <v-radio-group
                  :disabled="isVerDetalle"
                  v-model="formFields.frecuenciaSeleccionada.value"
                  row
                  @change="handleFrecuenciaSeleccionada()"
                >
                  <v-radio label="Diaria" :value="0"></v-radio>
                  <v-radio label="Semanal" :value="1"></v-radio>
                  <v-radio label="Mensual" :value="2"></v-radio>
                  <v-radio label="Anual" :value="3"></v-radio>
                </v-radio-group>
              </v-flex>
              <!-- Frecuencia Diaria -->
              <v-layout
                wrap
                v-show="formFields.frecuenciaSeleccionada.value === 0"
              >
                <v-flex xs12 sm6 md6>
                  <v-radio-group
                    v-model="formFields.diariaCantidadDiasRadio.value"
                    :disabled="isVerDetalle"
                    column
                    hide-details
                    class="radio-group-full-width"
                  >
                    <v-layout align-center>
                      <v-radio class="marginRadio" :value="0"></v-radio>Repetir
                      Cada:&nbsp;&nbsp;
                      <v-select
                        :label="formFields.diariaNumDias.label"
                        v-model="formFields.diariaNumDias.value"
                        v-validate="{
                          rules: {
                            required:
                              formFields.diariaCantidadDiasRadio.value === 0 &&
                              !isVerDetalle &&
                              formFields.frecuenciaSeleccionada.value === 0,
                          },
                        }"
                        :error-messages="
                          errors.collect(formFields.diariaNumDias.id)
                        "
                        :data-vv-name="formFields.diariaNumDias.id"
                        required
                        :disabled="
                          isVerDetalle ||
                            formFields.diariaCantidadDiasRadio.value == 1
                        "
                        :items="diasMes"
                      />
                    </v-layout>
                    <v-layout align-center>
                      <v-radio
                        label="Todos los días laborales de la semana."
                        :value="1"
                      ></v-radio>
                    </v-layout>
                  </v-radio-group>
                </v-flex>
              </v-layout>
              <!-- Frecuencia Semanal -->
              <v-layout
                wrap
                v-show="formFields.frecuenciaSeleccionada.value === 1"
              >
                <v-flex xs12 sm12 md6>
                  <v-select
                    :label="formFields.semanalCantidadSemanas.label"
                    v-model="formFields.semanalCantidadSemanas.value"
                    required
                    :disabled="isVerDetalle"
                    v-validate="{
                      rules: {
                        required:
                          !isVerDetalle &&
                          formFields.frecuenciaSeleccionada.value === 1,
                      },
                    }"
                    :error-messages="
                      errors.collect(formFields.semanalCantidadSemanas.id)
                    "
                    :data-vv-name="formFields.semanalCantidadSemanas.id"
                    :items="semanasAnio"
                  />
                </v-flex>
                <v-flex xs12 sm12 md6></v-flex>
                <v-flex xs12 sm12 md1>
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Lunes"
                    :value="1"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm12 md1>
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Martes"
                    :value="2"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm12 md1>
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Miércoles"
                    :value="3"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm12 md1 class="marginJueves">
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Jueves"
                    :value="4"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm12 md1>
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Viernes"
                    :value="5"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm12 md1>
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Sábado"
                    :value="6"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm12 md1>
                  <v-checkbox
                    v-model="formFields.semanalDiasSemana.value"
                    label="Domingo"
                    :value="7"
                    :disabled="isVerDetalle"
                  ></v-checkbox>
                </v-flex>
              </v-layout>
              <!-- Frecuencia Mensual -->
              <v-layout
                wrap
                v-show="formFields.frecuenciaSeleccionada.value === 2"
              >
                <v-flex xs12 sm12 md9>
                  <v-radio-group
                    v-model="formFields.mensualRadio.value"
                    :disabled="isVerDetalle"
                    column
                    hide-details
                    class="radio-group-full-width"
                  >
                    <v-layout align-center>
                      <v-radio class="marginRadio" :value="0"></v-radio
                      >El&nbsp;&nbsp;
                      <v-select
                        :label="formFields.mensualDiaMes.label"
                        v-model="formFields.mensualDiaMes.value"
                        required
                        :disabled="
                          isVerDetalle || formFields.mensualRadio.value == 1
                        "
                        v-validate="{
                          rules: {
                            required:
                              formFields.frecuenciaSeleccionada.value === 2 &&
                              formFields.mensualRadio.value === 0 &&
                              !isVerDetalle,
                          },
                        }"
                        :error-messages="
                          errors.collect(formFields.mensualDiaMes.id)
                        "
                        :data-vv-name="formFields.mensualDiaMes.id"
                        :items="diasMes"
                      />&nbsp;&nbsp;cada
                      <v-select
                        :label="formFields.mensualCantMeses.label"
                        v-model="formFields.mensualCantMeses.value"
                        required
                        :disabled="
                          isVerDetalle || formFields.mensualRadio.value == 1
                        "
                        v-validate="{
                          rules: {
                            required:
                              !isVerDetalle &&
                              formFields.frecuenciaSeleccionada.value === 2 &&
                              formFields.mensualRadio.value === 0,
                          },
                        }"
                        :error-messages="
                          errors.collect(formFields.mensualCantMeses.id)
                        "
                        :data-vv-name="formFields.mensualCantMeses.id"
                        class="margenIzquierdo"
                        :items="mesesAnio"
                      />
                    </v-layout>
                    <v-layout align-center>
                      <v-radio class="marginRadio" :value="1"></v-radio
                      >El&nbsp;&nbsp;
                      <v-select
                        :label="formFields.mensualDiaSemanaNum.label"
                        v-model="formFields.mensualDiaSemanaNum.value"
                        :items="diaSemanaPosicion"
                        item-text="posicion"
                        item-value="id"
                        required
                        :disabled="
                          isVerDetalle || formFields.mensualRadio.value == 0
                        "
                        v-validate="{
                          rules: {
                            required:
                              !isVerDetalle &&
                              formFields.frecuenciaSeleccionada.value === 2 &&
                              formFields.mensualRadio.value === 1,
                          },
                        }"
                        :error-messages="
                          errors.collect(formFields.mensualDiaSemanaNum.id)
                        "
                        :data-vv-name="formFields.mensualDiaSemanaNum.id"
                      />
                      <v-select
                        :label="formFields.mensualDiaSemanaNombre.label"
                        v-model="formFields.mensualDiaSemanaNombre.value"
                        :items="diaSemanaNombre"
                        item-text="nombre"
                        item-value="id"
                        required
                        :disabled="
                          isVerDetalle || formFields.mensualRadio.value == 0
                        "
                        v-validate="{
                          rules: {
                            required:
                              !isVerDetalle &&
                              formFields.frecuenciaSeleccionada.value === 2 &&
                              formFields.mensualRadio.value === 1,
                          },
                        }"
                        :error-messages="
                          errors.collect(formFields.mensualDiaSemanaNombre.id)
                        "
                        :data-vv-name="formFields.mensualDiaSemanaNombre.id"
                        class="margenIzquierdo"
                      />
                      <div class="margenIzquierdo">&nbsp;&nbsp;cada</div>
                      <v-select
                        :label="formFields.mensualNumMeses.label"
                        v-model="formFields.mensualNumMeses.value"
                        required
                        :disabled="
                          isVerDetalle || formFields.mensualRadio.value == 0
                        "
                        class="margenIzquierdo"
                        :items="mesesAnio"
                        v-validate="{
                          rules: {
                            required:
                              !isVerDetalle &&
                              formFields.frecuenciaSeleccionada.value === 2 &&
                              formFields.mensualRadio.value === 1,
                          },
                        }"
                        :error-messages="
                          errors.collect(formFields.mensualNumMeses.id)
                        "
                        :data-vv-name="formFields.mensualNumMeses.id"
                      />
                    </v-layout>
                  </v-radio-group>
                </v-flex>
              </v-layout>
              <!-- Frecuencia Anual -->
              <v-layout
                wrap
                v-show="formFields.frecuenciaSeleccionada.value === 3"
              >
                <v-flex xs12 sm12 md6>
                  <v-select
                    :label="formFields.anualCantAnios.label"
                    v-model="formFields.anualCantAnios.value"
                    required
                    :disabled="isVerDetalle"
                    :items="anios"
                    v-validate="{
                      rules: {
                        required:
                          !isVerDetalle &&
                          formFields.frecuenciaSeleccionada.value === 3,
                      },
                    }"
                    :error-messages="
                      errors.collect(formFields.anualCantAnios.id)
                    "
                    :data-vv-name="formFields.anualCantAnios.id"
                  />
                </v-flex>
                <v-flex xs12 sm12 md6></v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    :label="formFields.anualNumDiaMes.label"
                    v-model="formFields.anualNumDiaMes.value"
                    required
                    :disabled="isVerDetalle"
                    :items="diasMes"
                    v-validate="{
                      rules: {
                        required:
                          !isVerDetalle &&
                          formFields.frecuenciaSeleccionada.value === 3,
                      },
                    }"
                    :error-messages="
                      errors.collect(formFields.anualNumDiaMes.id)
                    "
                    :data-vv-name="formFields.anualNumDiaMes.id"
                  />
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    :label="formFields.anualCantMeses.label"
                    v-model="formFields.anualCantMeses.value"
                    required
                    :disabled="isVerDetalle"
                    :items="mesesAnio"
                    v-validate="{
                      rules: {
                        required:
                          !isVerDetalle &&
                          formFields.frecuenciaSeleccionada.value === 3,
                      },
                    }"
                    :error-messages="
                      errors.collect(formFields.anualCantMeses.id)
                    "
                    :data-vv-name="formFields.anualCantMeses.id"
                  />
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
            <br />
            <FormFieldsContainer titulo="Intervalo de Repetición">
              <slot name="prependIntervalo" />
              <v-flex xs12 md6 class="marginFlex">
                <DatePicker
                  :label="formFields.fechaInicio.label"
                  :id="formFields.fechaInicio.id"
                  v-model="formFields.fechaInicio.value"
                  :disabled="isVerDetalle"
                  v-validate="{
                    rules: {
                      required: !isVerDetalle,
                    },
                  }"
                  :min="fechaMinimaInicio.format('YYYY-MM-DD')"
                  :max="
                    fechaMaximaInicio != null
                      ? fechaMaximaInicio.format('YYYY-MM-DD')
                      : ''
                  "
                  :error-messages="errors.collect(formFields.fechaInicio.id)"
                  :data-vv-name="formFields.fechaInicio.id"
                  :format="'dddd,DD/MM/YYYY'"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-radio-group
                  v-model="formFields.radioFechaFin.value"
                  :disabled="isVerDetalle"
                  column
                  hide-details
                  class="radio-group-full-width"
                >
                  <v-layout align-center>
                    <v-radio :value="0" class="marginRadio"></v-radio>
                    <DatePicker
                      :label="formFields.fechaFin.label"
                      :id="formFields.fechaFin.id"
                      v-model="formFields.fechaFin.value"
                      class="marginDatePicker"
                      :disabled="
                        isVerDetalle || formFields.radioFechaFin.value !== 0
                      "
                      v-validate="{
                        rules: {
                          required:
                            !isVerDetalle &&
                            formFields.radioFechaFin.value === 0,
                        },
                      }"
                      :error-messages="errors.collect(formFields.fechaFin.id)"
                      :data-vv-name="formFields.fechaFin.id"
                      :min="fechaMinimaFin.format('YYYY-MM-DD')"
                      :format="'dddd,DD/MM/YYYY'"
                    />
                  </v-layout>
                  <v-layout
                    align-center
                    v-show="formFields.frecuenciaSeleccionada.value !== 3"
                    class="paddingTop"
                  >
                    <v-radio
                      class="marginRadio"
                      :value="1"
                      :readonly="formFields.frecuenciaSeleccionada.value === 3"
                    ></v-radio>
                    <v-text-field
                      v-model="formFields.numRepeticiones.value"
                      :disabled="
                        isVerDetalle || formFields.radioFechaFin.value !== 1
                      "
                      :label="formFields.numRepeticiones.label"
                      v-validate="{
                        rules: {
                          required:
                            !isVerDetalle &&
                            formFields.radioFechaFin.value == 1,
                          numeric: true,
                          min_value: 1,
                          max_value: 999,
                        },
                      }"
                      :error-messages="
                        errors.collect(formFields.numRepeticiones.id)
                      "
                      :data-vv-name="formFields.numRepeticiones.id"
                      class="paddingText"
                    ></v-text-field>
                  </v-layout>
                  <v-layout align-center class="paddingTop">
                    <v-radio
                      label="Sin fecha de finalización"
                      :value="2"
                    ></v-radio>
                  </v-layout>
                </v-radio-group>
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
import config from '@/config/index';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import { ServicioProxy } from '../../config/enums';
import {
  emitFormChangeEvent,
  FormErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { CalendarioNuevoForm } from '@/pantallas/Calendarios/Calendario';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import CampoUnico, { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';
import { TipoFrecuenciasCalendario } from '@/config/enums';
import { AxiosVue } from '../../AxiosVue';
import moment from 'moment';

@Component({
  components: {
    FormFieldsContainer,
    CabeceraTabla,
    DatePicker,
    CampoUnico,
  },
})
export default class CalendarioForm extends Vue {
  @Prop() calendarioSeleccionado: CalendarioNuevoForm;
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: true }) mostrarActivo: boolean;

  isFormValid: boolean = false;
  mensajeEstado: string = '';
  fechaMinimaInicio: moment.Moment = moment();
  fechaMaximaInicio: moment.Moment = null;
  fechaMinimaFin: moment.Moment = moment();

  uniqueFieldRule = uniqueFieldRule;
  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: 'false',
    },
    nombreCalendario: {
      label: 'Nombre',
      id: 'nombreCalendario',
      value: '',
    },
    frecuenciaSeleccionada: {
      label: 'Frecuencia',
      id: 'frecuencia',
      value: 0,
    },
    diariaCantidadDiasRadio: {
      label: 'Cantidad de Días Radio',
      id: 'diariaCantidadDiasRadio',
      value: 0,
    },
    diariaNumDias: {
      label: 'Número de Días',
      id: 'diariaNumDias',
      value: '',
    },
    semanalCantidadSemanas: {
      label: 'Número de Semanas a Repetir',
      id: 'semanalCantidadSemanas',
      value: '',
    },
    semanalDiasSemana: {
      label: 'Días Semana',
      id: 'semanalDiasSemana',
      value: [],
    },
    mensualRadio: {
      label: '',
      id: 'mensualRadio',
      value: 0,
    },
    mensualDiaMes: {
      label: 'Día del Mes',
      id: 'mensualDiaMes',
      value: '',
    },
    mensualCantMeses: {
      label: 'Número de Meses',
      id: 'mensualCantMeses',
      value: '',
    },
    mensualDiaSemanaNum: {
      label: 'Dia semana',
      id: 'mensualDiaSemanaNum',
      value: '',
    },
    mensualDiaSemanaNombre: {
      label: 'Día semana nombre',
      id: 'mensualDiaSemanaNombre',
      value: '',
    },
    mensualNumMeses: {
      label: 'Cantidad Meses',
      id: 'mensualNumMeses',
      value: '',
    },
    anualCantAnios: {
      label: 'Número de Años a Repetir',
      id: 'anualCantAnios',
      value: '',
    },
    anualNumDiaMes: {
      label: 'Día del mes a Repetir',
      id: 'anualNumDiaMes',
      value: '',
    },
    anualCantMeses: {
      label: 'Número de Meses a Repetir',
      id: 'anualCantMeses',
      value: '',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: '',
    },
    radioFechaFin: {
      label: 'Fecha Fin',
      id: 'radioFechaFin',
      value: 0,
    },
    fechaFin: {
      label: 'Fecha Fin',
      id: 'fechaFin',
      value: '',
    },
    numRepeticiones: {
      label: 'Número de Repeticiones',
      id: 'numRepeticiones',
      value: '',
    },
  };

  /* data */
  frecuenciaSeleccionada: TipoFrecuenciasCalendario =
    TipoFrecuenciasCalendario.Diaria;
  diaSemanaPosicion: any = [
    { id: 1, posicion: 'Primer' },
    { id: 2, posicion: 'Segundo' },
    { id: 3, posicion: 'Tercer' },
    { id: 4, posicion: 'Cuarto' },
    { id: 5, posicion: 'Quinto' },
  ];
  diaSemanaNombre: any = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 7, nombre: 'Domingo' },
  ];
  diasMes: number[] = Array.from({ length: 31 }, (v, k) => k + 1);
  semanasAnio: number[] = Array.from({ length: 52 }, (v, k) => k + 1);
  mesesAnio: number[] = Array.from({ length: 12 }, (v, k) => k + 1);
  anios: number[] = Array.from({ length: 100 }, (v, k) => k + 1);

  totalAsociados: number = 0;

  /* handle */

  @Watch('calendarioSeleccionado', { deep: true })
  handleCalendarioSeleccionadaChange() {
    if (!this.calendarioSeleccionado) {
      this.frecuenciaSeleccionada = TipoFrecuenciasCalendario.Diaria;
      this.fechaMinimaInicio = moment();
      this.fechaMinimaFin = moment();
      this.totalAsociados = 0;
      return;
    }
    const dateFormat = 'YYYY-MM-DD';
    this.formFields.nombreCalendario.value = this.calendarioSeleccionado.nombreCalendario;
    this.formFields.activo.value = this.calendarioSeleccionado.estado;
    this.formFields.frecuenciaSeleccionada.value = this.calendarioSeleccionado.frecuenciaSeleccionada;
    this.formFields.diariaCantidadDiasRadio.value = this.calendarioSeleccionado
      .diariaCantidadDiasRadio
      ? this.calendarioSeleccionado.diariaCantidadDiasRadio
      : 0;
    this.formFields.diariaNumDias.value = this.calendarioSeleccionado.diariaNumDias;
    this.formFields.semanalCantidadSemanas.value = this.calendarioSeleccionado.semanalCantidadSemanas;
    this.formFields.semanalDiasSemana.value = this.calendarioSeleccionado
      .semanalDiasSemana
      ? this.calendarioSeleccionado.semanalDiasSemana
      : [];
    this.formFields.mensualRadio.value = this.calendarioSeleccionado
      .mensualRadio
      ? this.calendarioSeleccionado.mensualRadio
      : 0;
    this.formFields.mensualDiaMes.value = this.calendarioSeleccionado.mensualDiaMes;
    this.formFields.mensualCantMeses.value = this.calendarioSeleccionado.mensualCantMeses;
    this.formFields.mensualDiaSemanaNum.value = this.calendarioSeleccionado.mensualDiaSemanaNum;
    this.formFields.mensualDiaSemanaNombre.value = this.calendarioSeleccionado.mensualDiaSemanaNombre;
    this.formFields.mensualDiaSemanaNombre.value = this.calendarioSeleccionado.mensualDiaSemanaNombre;
    this.formFields.mensualNumMeses.value = this.calendarioSeleccionado.mensualNumMeses;
    this.formFields.anualCantAnios.value = this.calendarioSeleccionado.anualCantAnios;
    this.formFields.anualNumDiaMes.value = this.calendarioSeleccionado.anualNumDiaMes;
    this.formFields.anualCantMeses.value = this.calendarioSeleccionado.anualCantMeses;
    this.formFields.fechaInicio.value = this.calendarioSeleccionado.fechaInicio;
    this.formFields.radioFechaFin.value = this.calendarioSeleccionado.radioFechaFin;
    this.formFields.fechaFin.value = this.calendarioSeleccionado.fechaFin;
    this.formFields.numRepeticiones.value = this.calendarioSeleccionado.numRepeticiones;
    this.totalAsociados = this.calendarioSeleccionado.totalAsociados;
    this.cambioEstadoSwitch(this.formFields.activo.value);
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();

    if (this.calendarioSeleccionado) {
      return;
    }
    this.fechaMinimaFin = this.formFields.fechaInicio.value as moment.Moment;

    // FIXME corregir
    this.fechaMinimaFin = moment(this.formFields.fechaInicio.value.toString());
    this.fechaMaximaInicio =
      moment(this.formFields.fechaFin.value.toString()) !== moment()
        ? moment(this.formFields.fechaFin.value.toString())
        : moment();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombreCalendario: this.formFields.nombreCalendario.value,
          estado: this.formFields.activo.value,
          frecuenciaSeleccionada: this.formFields.frecuenciaSeleccionada.value,
          diariaCantidadDiasRadio: this.formFields.diariaCantidadDiasRadio
            .value,
          diariaNumDias: this.formFields.diariaNumDias.value,
          semanalCantidadSemanas: this.formFields.semanalCantidadSemanas.value,
          semanalDiasSemana: this.formFields.semanalDiasSemana.value,
          mensualRadio: this.formFields.mensualRadio.value,
          mensualDiaMes: this.formFields.mensualDiaMes.value,
          mensualCantMeses: this.formFields.mensualCantMeses.value,
          mensualDiaSemanaNum: this.formFields.mensualDiaSemanaNum.value,
          mensualDiaSemanaNombre: this.formFields.mensualDiaSemanaNombre.value,
          mensualNumMeses: this.formFields.mensualNumMeses.value,
          anualCantAnios: this.formFields.anualCantAnios.value,
          anualNumDiaMes: this.formFields.anualNumDiaMes.value,
          anualCantMeses: this.formFields.anualCantMeses.value,
          fechaInicio: this.formFields.fechaInicio.value,
          radioFechaFin: this.formFields.radioFechaFin.value,
          fechaFin: this.formFields.fechaFin.value,
          numRepeticiones: this.formFields.numRepeticiones.value,
        } as CalendarioNuevoForm,
      },
      this
    );
  }

  validarNombreCalendario(nombre: string) {
    const axios = new AxiosVue(ServicioProxy.Calendario);
    const id =
      this.calendarioSeleccionado === undefined
        ? 0
        : this.calendarioSeleccionado.id;
    return axios.http.get(
      `Calendario/ChequearNombreUnico/${id}/${nombre}/${config.getClienteSesion()}`
    );
  }

  cambioEstadoSwitch(isActivo: boolean) {
    this.fields[this.formFields.activo.id].dirty = true;
    this.handleFormChange();
    if (isActivo) {
      this.mensajeEstado = '';
      this.formFields.activo.label = 'Activo';
    } else {
      if (this.totalAsociados === 0) {
        this.mensajeEstado =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
      }
      this.formFields.activo.label = 'Inactivo';
    }
    this.$emit('estadoSwitch', isActivo);
  }

  handleFrecuenciaSeleccionada() {
    if (this.formFields.frecuenciaSeleccionada.value === 3) {
      if (this.formFields.radioFechaFin.value == 1) {
        this.formFields.radioFechaFin.value = 2;
      }
    }
  }

  mounted() {
    const validator = makeValidatorDictionary(this.formFields);
    validator.custom.numRepeticiones.min_value =
      'Numero de repeticiones debe ser mayor a 0 y menor a 1000.';
    validator.custom.numRepeticiones.max_value =
      'Numero de repeticiones debe ser mayor a 0 y menor a 1000.';
    this.$validator.localize('es', validator);
    this.handleFormChange();
    this.handleCalendarioSeleccionadaChange();
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
  margin-top: 12px !important;
}

.marginRadio {
  margin-right: 0px;
}

.radio-group-full-width >>> .v-input__control {
  width: 100%;
  padding-left: 8px;
}

.marginFlex {
  margin-top: 15px;
}

.paddingTop {
  padding-top: 13px;
}

.paddingText {
  padding-top: 0;
}

.marginJueves {
  margin-left: 13px;
}

.margenIzquierdo {
  margin-left: 10px;
}

.marginDatePicker {
  width: 100%;
}
</style>

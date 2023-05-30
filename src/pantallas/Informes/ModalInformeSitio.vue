<template>
  <ModalMantenedor :show="show">
    <CabeceraModal :titulo="titulo" @cerrar="handleCerrar()"> </CabeceraModal>
    <div class="modal cardnew">
      <div align="center">
        <v-flex md10>
          <v-form
            ref="form"
            v-model="isFormValid"
            lazy-validation
            class="col-md-12"
          >
            <v-card class="rounded-card">
              <v-container grid-list-md>
                <FormFieldsContainer titulo="Información General">
                  <v-flex>
                    <DatePicker
                      label="Desde"
                      :error-messages="errors.collect(formFields.fechaDesde.id)"
                      :id="formFields.fechaDesde.id"
                      v-model="formFields.fechaDesde.value"
                      :min="fechaMinima"
                      :max="fechaMaxima"
                    />
                  </v-flex>

                  <v-flex>
                    <TimePicker
                      v-model="formFields.horaInicio.value"
                      v-validate="!disabled && 'required'"
                      :label="formFields.horaInicio.label"
                      :error-messages="errors.collect(formFields.horaInicio.id)"
                      :id="formFields.horaInicio.id"
                      :disabled="disabled"
                    />
                  </v-flex>

                  <v-flex>
                    <DatePicker
                      label="Hasta"
                      :error-messages="errors.collect(formFields.fechaHasta.id)"
                      :id="formFields.fechaHasta.id"
                      v-model="formFields.fechaHasta.value"
                      :min="fechaMinima"
                      :max="fechaMaxima"
                    />
                  </v-flex>

                  <v-flex>
                    <TimePicker label="Hora" />
                  </v-flex>

                  <v-flex>
                    <v-select
                      :label="'Tipo de zona'"
                      :items="['Zona 1', 'Zona 2']"
                      item-text="nombre"
                      item-value="nombre"
                    />
                  </v-flex>

                  <v-flex>
                    <v-radio-group row>
                      <v-radio
                        label="Usar todos los tipos de eventos"
                        value="eventos"
                      ></v-radio>
                    </v-radio-group>
                  </v-flex>
                </FormFieldsContainer>

                <FormFieldsContainer column>
                  <v-divider></v-divider>

                  <v-flex>
                    <v-text-field
                      label="Buscar tipos de zonas..."
                    ></v-text-field>
                  </v-flex>

                  <v-flex>
                    <v-data-table
                      :headers="headersZonas"
                      :items="items"
                      :pagination.sync="pagination"
                      :rows-per-page-items="rowsPerPage"
                      rows-per-page-text="Filas por página"
                      class="elevation-1"
                    >
                      <template slot="items" slot-scope="props">
                        <td class="text-xs-left">{{ props.item.columna }}</td>
                        <td class="text-xs-left">
                          <v-text-field
                            v-model="props.item.orden"
                            type="number"
                            min="1"
                            max="99"
                          ></v-text-field>
                        </td>
                        <td class="justify-center layout px-2">
                          <v-switch v-model="props.item.estado"></v-switch>
                        </td>
                      </template>
                    </v-data-table>
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-card>

            <v-card class="rounded-card mt-20">
              <v-container grid-list-md>
                <FormFieldsContainer
                  titulo="Asociar Flotas, Etiquetas o Vehículos"
                  column
                >
                  <v-flex>
                    <v-radio-group row>
                      <v-radio label="Flotas" value="flotas"></v-radio>
                      <v-radio label="Etiquetas" value="etiquetas"></v-radio>
                      <v-radio label="Vehículos" value="vehiculos"></v-radio>
                    </v-radio-group>
                  </v-flex>

                  <v-divider></v-divider>

                  <v-flex>
                    <v-text-field label="Buscar..."></v-text-field>
                  </v-flex>

                  <v-flex>
                    <v-data-table
                      :headers="headers"
                      :items="items"
                      :pagination.sync="pagination"
                      :rows-per-page-items="rowsPerPage"
                      rows-per-page-text="Filas por página"
                      class="elevation-1"
                    >
                      <template slot="items" slot-scope="props">
                        <td class="text-xs-left">{{ props.item.columna }}</td>
                        <td class="text-xs-left">
                          <v-text-field
                            v-model="props.item.orden"
                            type="number"
                            min="1"
                            max="99"
                          ></v-text-field>
                        </td>
                        <td class="justify-center layout px-2">
                          <v-switch v-model="props.item.estado"></v-switch>
                        </td>
                      </template>
                    </v-data-table>
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-card>

            <v-card class="rounded-card mt-20">
              <v-container grid-list-md>
                <FormFieldsContainer titulo="Descargar Informe">
                  <Descargar />
                </FormFieldsContainer>
              </v-container>
            </v-card>
          </v-form>
        </v-flex>
      </div>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Descargar from '@/pantallas/Informes/partes/Descargar.vue';

import config from '@/config/index';

import { Vue, Component, Prop } from 'vue-property-decorator';
import { Snotify } from '@/snotify/Snotify';
import moment from 'moment';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    ContinuarButton,
    VolverButton,
    Confirmation,
    FormFieldsContainer,
    Descargar,
    DatePicker,
    TimePicker,
  },
})
export default class CrearSolicitudModal extends Vue {
  // Props
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) titulo: string;
  @Prop({ default: false }) disabled: boolean;

  // Data
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  isFormValid: boolean = false;
  headersZonas: any = [
    { text: 'Nombre', value: 'nombre' },
    { text: 'Descripción', value: 'descripcion' },
    { text: 'Nombre Cliente', value: 'cliente' },
    { text: 'Grupo de Zona', value: 'grupo' },
    { text: 'Tipo de Zona', value: 'tipo' },
  ];
  headers: any = [
    { text: 'Nombre', value: 'nombre', width: '500' },
    { text: 'Padre', value: 'padre' },
  ];
  items: any = [];
  pagination: any = {
    rowsPerPage: -1,
  };
  rowsPerPage: any = [5, 10, 25, { text: 'Todos', value: -1 }];

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';

  formFields: FormFieldDefMap = {
    fechaDesde: {
      label: 'Fecha Desde',
      id: 'fechaDesde',
      value: moment(this.fechaMinima),
    },
    fechaHasta: {
      label: 'Fecha Hasta',
      id: 'fechaHasta',
      value: moment(this.fechaMaxima),
    },
    horaInicio: {
      label: 'Hora de Inicio',
      id: 'horaInicio',
      value: null,
    },
  };

  // Computed
  get fechaMaxima() {
    let fechaMax: any = new Date().toISOString().substr(0, 10);
    return fechaMax;
  }

  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }

  // Methods
  clearFilters() {
    this.$emit('clear');
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>

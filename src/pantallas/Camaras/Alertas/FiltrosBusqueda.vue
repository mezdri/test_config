<template>
  <div class="flex sm10 md10">
    <FormFieldsContainer>
      <v-flex sm10 md10 layout wrap>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-autocomplete
              v-model="formFields.tipoAlerta.value"
              :label="formFields.tipoAlerta.label"
              :items="listaTiposAlerta"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              v-model="formFields.flota.value"
              :label="formFields.flota.label"
              :items="listaFlotas"
              item-text="nombre"
              item-value="id"
              @change="changeFlota($event)"
            />
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              v-model="formFields.grupo.value"
              :label="formFields.grupo.label"
              :items="listaGrupos"
              item-text="nombre"
              item-value="id"
              @change="changeGrupo($event)"
            />
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              v-model="formFields.patente.value"
              :label="formFields.patente.label"
              :items="listaPatentes"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
        </v-flex>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm3 md3>
            <v-subheader
              class="v-subheader-velocidad v-label v-label--active theme--light"
              >{{ formFields.velocidad.label }}</v-subheader
            >
            <v-slider
              v-model="formFields.velocidad.value"
              hide-details
              min="0"
              max="200"
              thumb-label="always"
              :thumb-size="24"
            ></v-slider>
          </v-flex>
          <v-flex sm3 md3 hide>
            <v-autocomplete
              v-model="formFields.tipoFecha.value"
              :label="formFields.tipoFecha.label"
              :items="[
                { id: 'ingreso', nombre: 'Ingreso' },
                { id: 'alerta', nombre: 'Alerta' },
              ]"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm3 md3>
            <DatePicker
              :label="formFields.fechaInicio.label"
              :error-messages="errors.collect(formFields.fechaInicio.id)"
              :id="formFields.fechaInicio.id"
              v-model="formFields.fechaInicio.value"
              :min="fechaMinima"
              :max="fechaMaximaInicio.format('YYYY-MM-DD')"
            />
          </v-flex>
          <v-flex sm3 md3>
            <TimePicker
              :label="formFields.horaInicio.label"
              v-model="formFields.horaInicio.value"
              v-validate="'required'"
              data-vv-name="horaInicioRequerida"
              :error-messages="errors.collect('horaInicioRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3>
            <DatePicker
              :label="formFields.fechaFin.label"
              :error-messages="errors.collect(formFields.fechaFin.id)"
              :id="formFields.fechaFin.id"
              v-model="formFields.fechaFin.value"
              :min="fechaMinima"
              :max="fechaMaximaInicio.format('YYYY-MM-DD')"
            />
          </v-flex>
          <v-flex sm3 md3>
            <TimePicker
              :label="formFields.horaFin.label"
              v-model="formFields.horaFin.value"
              v-validate="'required'"
              data-vv-name="horaFinRequerida"
              :error-messages="errors.collect('horaFinRequerida')"
              required
            />
          </v-flex>
          <v-flex sm3 md3>
            <v-autocomplete
              v-model="formFields.tipoEvidencia.value"
              :label="formFields.tipoEvidencia.label"
              :items="[
                { id: 'ambos', nombre: 'Todos' },
                { id: 'jpg', nombre: 'Foto' },
                { id: 'mp4', nombre: 'Video' },
              ]"
              item-text="nombre"
              item-value="id"
            />
          </v-flex>
          <v-flex sm3 md3 hide>
            <v-text-field
              v-model="formFields.cantidadRegistros.value"
              :label="formFields.cantidadRegistros.label"
              single-line
              hide-details
            />
          </v-flex>
        </v-flex>
      </v-flex>
      <v-flex sm1 md1>
        <div class="text-sm-center">
          <v-btn flat icon small @click="handleBuscarClick">
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn flat icon small @click="clearFilters">
            <v-icon>clear</v-icon>
          </v-btn>
        </div>
      </v-flex>
      <div class="clearfix" style="width:100%"></div>
    </FormFieldsContainer>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { isFunction } from 'lodash';
import { GridApi } from 'ag-grid-community';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { ConfigTiposAlerta } from '@/pantallas/Camaras/Alertas/fetchTipoAlerta';
import {
  ConfigFlotas,
  ConfigGrupos,
} from '@/pantallas/Camaras/Alertas/fetchFlota';
import { ConfigPatente } from '@/pantallas/Camaras/Alertas/fetchPatentes';

@Component({
  components: {
    DatePicker,
    TimePicker,
    FormFieldsContainer,
  },
})
export default class FiltrosBusqueda extends Vue {
  @Prop() listaTiposAlerta: ConfigTiposAlerta[];
  @Prop() listaFlotas: ConfigFlotas[];
  @Prop() listaGrupos: ConfigGrupos[];
  @Prop() listaPatentes: ConfigPatente[];
  @Prop() formFields: FormFieldDefMap;

  /*formFields: FormFieldDefMap = {
    tipoAlerta: {
      label: 'Tipo Alerta',
      id: 'tipoAlerta',
      value: '',
    },
    flota: {
      label: 'Flota',
      id: 'flota',
      value: '',
    },
    grupo: {
      label: 'Grupo',
      id: 'grupo',
      value: '',
    },
    patente: {
      label: 'Patente',
      id: 'patente',
      value: '',
    },
    velocidad: {
      label: 'Velocidad Mín.',
      id: 'velocidad',
      value: '0',
    },
    tipoFecha: {
      label: 'Tipo Fecha',
      id: 'tipoFecha',
      value: 'alerta',
      items: [],
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: moment(this.fechaMaxima),
    },
    fechaFin: {
      label: 'Fecha Fin',
      id: 'fechaFin',
      value: moment(this.fechaMaxima),
    },
    cantidadRegistros: {
      label: 'Cantidad Registros',
      id: 'cantidadRegistros',
      value: '',
    },
  };
  */

  async handleBuscarClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    if (resultadoValidacion) {
      this.$emit('resultadoBusqueda', true);
    }
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        fechaInicio: fields.fechaInicio.value,
        fechaFin: fields.fechaFin.value,
      } as any,
    });
  }

  changeFlota(e: any) {
    this.$emit('changeFlota', this.formFields);
  }
  changeGrupo(e: any) {
    this.$emit('changeGrupo', this.formFields);
  }

  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }

  get fechaMaximaInicio() {
    //let fechaMax = this.formFields.fechaInicio.value;
    //console.log(fechaMax);
    //console.log(moment(this.fechaMaxima));
    return moment(this.fechaMaxima) as moment.Moment;
    //return fechaMax as moment.Moment;
  }

  get fechaMinimaInicio() {
    let fechaIni = this.formFields.fechaInicio.value;
    return fechaIni as moment.Moment;
  }

  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }

  clearFilters() {
    this.formFields.patente.value = '';
    this.formFields.flota.value = '';
    this.formFields.tipoAlerta.value = '';
    this.formFields.fechaInicio.value = moment(this.fechaMaxima);
    this.formFields.fechaFin.value = moment(this.fechaMaxima);
    this.formFields.cantidadRegistros.value = '';
    this.formFields.tipoFecha.value = 'alerta';
    this.formFields.velocidad.value = '0';
    this.$emit('clear');
  }
}
</script>
<style>
.v-subheader-velocidad {
  font-size: 12px;
  font-weight: normal;
  height: auto;
}
.widgets .v-input--slider {
  margin-top: 20px;
}
</style>

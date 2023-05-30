<template>
  <v-flex sm8 md8 v-show="showFilters">
    <FormFieldsContainer>
      <v-flex sm4 md4>
        <v-select
          v-model="formFields.empresa.value"
          :label="formFields.empresa.label"
          :items="listaEmpresas"
          item-text="nombre"
          item-value="id"
          v-on:change="searchDataEmpresa"
        />
      </v-flex>
      <v-flex sm4 md4>
        <v-select
          v-model="formFields.estado.value"
          :label="formFields.estado.label"
          :items="listaEstados"
          item-text="nombre"
          item-value="id"
        />
      </v-flex>
      <v-flex sm4 md4>
        <v-combobox
          :items="activos"
          :label="formFields.patente.label"
          v-model="formFields.patente.value"
          item-text="nombre"
          item-value="id"
          @change="patenteBlur"
          dense
        ></v-combobox>
      </v-flex>
      <v-flex sm4 md4>
        <DatePicker
          :label="formFields.fechaInicio.label"
          v-model="formFields.fechaInicio.value"
        />
      </v-flex>
      <v-flex sm4 md4>
        <DatePicker
          :label="formFields.fechaFin.label"
          v-model="formFields.fechaFin.value"
        />
      </v-flex>
      <v-flex sm4 md4>
        <div class="text-sm-center botones-filtros">
          <v-btn @click="handleBuscarClick">
            <v-icon>search</v-icon>Filtrar
          </v-btn>
          <v-btn @click="clearFilters"> <v-icon>clear</v-icon>Limpiar </v-btn>
        </div>
      </v-flex>
    </FormFieldsContainer>
  </v-flex>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
/* import { isFunction } from 'lodash';
import { GridApi } from 'ag-grid-community'; */
import DatePicker from '@/reusable/Form/DatePicker.vue';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { ConfigEmpresas } from '@/pantallas/SucursalVirtual/MisSolicitudes/fetchConfigInicial';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import {
  Activos,
  fetchActivos,
} from '@/pantallas/SucursalVirtual/NuevaSolicitud/fetchActivos';

@Component({
  components: {
    DatePicker,
    FormFieldsContainer,
  },
})
export default class FiltrosBusqueda extends Vue {
  @Prop() listaEmpresas: ConfigEmpresas[];
  @Prop() listaEstados: any[];
  @Prop() listaPatentes: any[];
  /* TODO: estas variables solo se utilizan aqui, tal vez no deban ser Properties */
  @Prop({ default: 140390003 }) defaultEstado!: number;
  @Prop({ default: '' }) rutClienteDefecto!: string;
  @Prop({ default: '' }) defaultPatente!: string;

  activos: string[] = [];
  activosSelected: string[] = [];

  formFields: FormFieldDefMap = {
    empresa: {
      label: 'Empresa',
      id: 'empresa',
      value: this.rutClienteDefecto,
    },
    estado: {
      label: 'Estado',
      id: 'estado',
      value: this.defaultEstado,
    },
    patente: {
      label: 'Patente',
      id: 'patente',
      value: '',
      items: [],
    },
    fechaInicio: {
      label: 'Fecha de Inicio del Caso',
      id: 'fechaInicio',
      value: '',
    },
    fechaFin: {
      label: 'Fecha de Fin del Caso',
      id: 'fechaFin',
      value: '',
    },
  };

  mounted() {
    this.searchDataEmpresa(this.rutClienteDefecto);
  }

  handleBuscarClick() {
    this.$emit('resultadoBusqueda', this.formFields);
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {} as any,
    });
  }

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  validateActivosSelected(activo: string) {
    //eslint-disable-next-line
    if (
      !/^([a-zA-Z]{4}\-{1}[0-9]{2})|([a-zA-Z]{2}\-{1}[0-9]{4})$/.test(activo)
    ) {
      this.$snotify.error(
        'La patente ' +
          activo +
          ' no tiene un formato valido (AAAA-00, AA-0000)',
        {
          timeout: 5000,
        }
      );
      return false;
    }
    return true;
  }
  patenteBlur(a: string) {
    if (
      this.formFields.patente.value == '' ||
      this.formFields.patente.value == undefined
    ) {
      console.log('entro patenteBlur if');
      this.formFields.patente.value = a;
    }
    return false;
    this.activosSelected.forEach(i => {
      this.validateActivosSelected(i);
    });
  }

  fetchDeActivos(cliente: string) {
    this.loadingService.showLoading();
    return fetchActivos(cliente)
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los activos',
          })
        );
        return;
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  get fechaMaxima() {
    let fechaMax: any = new Date().toISOString().substr(0, 10);
    console.log(fechaMax);
    return fechaMax;
  }

  get fechaMaximaInicio() {
    //let fechaMax: any = new Date().toISOString().substr(0, 10);
    let fechaMax = this.formFields.fechaHasta.value;
    return fechaMax as moment.Moment;
  }

  get fechaMinimaInicio() {
    //let fechaMax: any = new Date().toISOString().substr(0, 10);
    let fechaIni = this.formFields.fechaDesde.value;
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
    this.formFields.empresa.value = this.rutClienteDefecto;
    this.formFields.estado.value = this.defaultEstado;
    console.log(this.formFields.patente.value);
    this.formFields.patente.value = '';
    console.log(this.formFields.patente.value);
    this.formFields.fechaInicio.value = '';
    this.formFields.fechaFin.value = '';
    this.$emit('clear');
  }

  searchDataEmpresa(a: string) {
    this.searchDataActivos(a);
  }

  async searchDataActivos(cliente: string) {
    this.activos = (await this.fetchActivos(cliente)) || [];
    this.formFields.patente.items = this.activos;
  }

  fetchActivos(cliente: string) {
    this.loadingService.showLoading();
    return fetchActivos(cliente)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los activos',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  showFilters: boolean = true;

  showAdvancedFilters: boolean = true;
  AdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
}
</script>
<style>
.botones-filtros button {
  font-size: 11px;
}
</style>

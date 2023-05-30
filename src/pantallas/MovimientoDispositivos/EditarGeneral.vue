<template>
  <v-layout row justify-center>
    <v-flex>
      <v-form>
        <v-container>
          <div align="left">
            <v-flex>
              <h2 class="h2_title" style="margin-top: 12px !important">
                General
              </h2>
            </v-flex>
          </div>
          <v-divider></v-divider>
          <br />
          <v-layout wrap>
            <v-flex xs4 sm4 md4>
              <v-text-field
                class="mr-2"
                name="movimiento"
                :label="formFields.movimiento.label"
                v-model="formFields.movimiento.value"
                :disabled="true"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                class="mr-2"
                :label="formFields.usuario.label"
                v-model="formFields.usuario.value"
                :disabled="true"
                :counter="80"
                v-validate="'max:80'"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                class="mr-2"
                :label="formFields.operacion.label"
                v-model="formFields.operacion.value"
                :items="operaciones"
                item-text="configvalor"
                item-value="configid"
                :disabled="true"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                class="mr-2"
                :label="formFields.origen.label"
                v-model="formFields.origen.value"
                :items="destinos"
                item-text="tipoubicaname"
                item-value="tipoubicaid"
                :disabled="true"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                class="mr-2"
                :label="formFields.destino.label"
                v-model="formFields.destino.value"
                :items="destinos"
                :disabled="true"
                item-text="tipoubicaname"
                item-value="tipoubicaid"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <DatePicker
                class="mr-2"
                :label="formFields.fechaAlta.label"
                v-model="formFields.fechaAlta.value"
                :disabled="true"
                data-vv-name="fechaRecepcionRequerida"
                :error-messages="errors.collect('fechaRecepcionRequerida')"
              />
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                clearable
                :label="formFields.despacho.label"
                v-model="formFields.despacho.value"
                :items="despachos"
                item-text="despaseguimiento"
                :disabled="anulado"
                item-value="despanumero"
                @change="$emit('despacho', formFields.despacho.value)"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                class="mr-2"
                :label="formFields.caja.label"
                v-model="formFields.caja.value"
                :disabled="anulado"
                @change="$emit('caja', formFields.caja.value)"
                :hint="cajaEdited != edited.movicajanro ? 'Valor Editado' : ''"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                class="mr-2"
                :label="formFields.estado.label"
                v-model="formFields.estado.value"
                :items="estado"
                @change="$emit('estado', formFields.estado.value)"
                :disabled="anulado"
                item-text="configvalor"
                item-value="configid"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-textarea
                class="mr-2"
                :label="formFields.observacion.label"
                v-model="formFields.observacion.value"
                :counter="250"
                :disabled="true"
                v-validate="'max:250'"
              ></v-textarea>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { fetchMovimientos } from './fetchMovimientos';
import { AxiosVue } from '@/AxiosVue'; //
import { LoadingService } from '@/services/loadingService';
import { ServicioProxy } from '@/config/enums'; //
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { EstadoEntidad } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue'; //
import { TranslateResult } from 'vue-i18n';
import { GridReadyEvent, GridApi } from 'ag-grid-community';

@Component({
  components: {
    DatePicker,
    'app-confirmacion': Confirmation,
  },
})
export default class EditarGeneral extends Vue {
  @Prop({ default: false }) despachoIsEdit: boolean;
  @Prop({ default: false }) cajaIsEdit: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ required: true }) anuladoId: number;
  @Prop({ required: true }) recibidoId: number;
  @Prop({ required: true }) estadoSelected: number;
  @Prop({ default: false }) despachoEdited: string;
  @Prop({ default: false }) cajaEdited: string;
  @Prop({ required: true }) estado: any;
  @Prop({ required: true }) operaciones: any;
  @Prop({ default: false }) destinos!: any;
  @Prop({ default: false }) edited!: any;
  @Prop({ required: true }) despachos: any;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  accion!: any;
  ordesList2: any;
  step = 'general';

  anulado: boolean = false;

  getMovimiento() {
    this.formFields.usuario.value = this.edited.nombre;
    this.formFields.fechaAlta.value = moment(this.edited.movifecha_alta);
    this.formFields.movimiento.value = this.edited.movinumero;
    this.formFields.observacion.value = this.edited.moviobs;
    this.formFields.operacion.value = this.edited.moviopera_tipo;
    this.formFields.destino.value = this.edited.tipoubicaid;
    this.formFields.origen.value = this.edited.tipoubicaorigen;
    //Despacho
    this.formFields.despacho.value = this.despachoIsEdit
      ? this.despachoEdited
      : this.edited.despanumero;
    //Caja
    this.formFields.caja.value = this.cajaIsEdit
      ? this.cajaEdited
      : this.edited.movicajanro;
    //Estado
    this.formFields.estado.value =
      this.estadoSelected && this.edited.moviestado != this.estadoSelected
        ? this.estadoSelected
        : this.edited.moviestado;

    if (
      this.edited.moviestado == this.anuladoId ||
      this.edited.moviestado == this.recibidoId
    ) {
      this.anulado = true;
      this.$emit('anularBoton', true);
    }
  }

  mounted() {
    this.getMovimiento();
    this.$emit('despacho', this.formFields.despacho.value);
    this.$emit('caja', this.formFields.caja.value);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  onSelectionChanged(params: any) {}

  formFields: {
    fechaAlta: any;
    movimiento: any;
    usuario: any;
    origen: any;
    operacion: any;
    observacion: any;
    destino: any;
    caja: any;
    despacho: any;
    estado: any;
  } = {
    estado: {
      label: 'Estado (Obligatorio)',
      value: '',
    },
    despacho: {
      label: 'Número Orden Despacho',
      value: '',
    },
    caja: {
      label: 'Caja Número',
      value: '',
    },
    destino: {
      label: 'Destino (Obligatorio)',
      value: '',
    },
    observacion: {
      label: 'Observación',
      value: '',
    },
    fechaAlta: {
      label: 'Fecha Alta',
      value: moment(),
    },
    movimiento: {
      label: 'Movimiento',
      value: '',
    },
    usuario: {
      label: 'Usuario',
      value: '',
    },
    origen: {
      label: 'Origen',
      value: '',
    },
    operacion: {
      label: 'Operación',
      value: '5',
    },
  };

  //abstract
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.MovimientoDispositivos;

  //propiedades globales
  loadingService = new LoadingService();
  gridApi: GridApi;
  $snotify: any;
  dialog: boolean = true;

  //Interface
  estadoSwitch: boolean = false;

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //@Watch('show')
  async onPropertyChanged(value: boolean) {
    this.dialog = value;
  }
}
</script>

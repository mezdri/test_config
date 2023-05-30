<template>
  <v-layout row justify-center>
    <v-flex>
      <v-form v-model="validForm" @input="$emit('validForm', validForm)">
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
              <v-text-field
                class="mr-2"
                :label="formFields.operacion.label"
                v-model="formFields.operacion.value"
                :disabled="true"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                class="mr-2"
                :label="formFields.origen.label"
                v-model="formFields.origen.value"
                :disabled="true"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                class="mr-2"
                :label="formFields.destino.label"
                v-model="formFields.destino.value"
                :disabled="true"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                class="mr-2"
                :label="formFields.estado.label"
                v-model="formFields.estado.value"
                :items="estados"
                :disabled="true"
                item-text="configvalor"
                item-value="configid"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <DatePicker
                class="mr-2"
                :label="formFields.fechaAlta.label"
                v-model="formFields.fechaAlta.value"
                :disabled="true"
              />
            </v-flex>
            <v-flex xs4 sm4 md4>
              <DatePicker
                class="mr-2"
                :label="formFields.fechaRecepcion.label"
                v-model="formFields.fechaRecepcion.value"
                :disabled="true"
              />
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-text-field
                class="mr-2"
                :label="formFields.caja.label"
                v-model="formFields.caja.value"
                :disabled="true"
              ></v-text-field>
            </v-flex>
            <v-flex xs4 sm4 md4>
              <v-autocomplete
                clearable
                :label="formFields.despacho.label"
                v-model="formFields.despacho.value"
                :items="despachos"
                item-text="despaseguimiento"
                item-value="despanumero"
                :disabled="true"
              ></v-autocomplete>
            </v-flex>
            <v-flex xs4 sm4 md4 v-if="formFields.despacho.value != ''">
              <v-text-field
                class="mr-2"
                :label="formFields.receptor.label"
                v-model="formFields.receptor.value"
                :disabled="!esEdicion || edited.despareceptor != ''"
                :rules="[rules.required]"
                @change="$emit('receptor', formFields.receptor.value)"
              ></v-text-field>
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
      <v-btn
        depressed
        @click="
          $emit('edicion', true);
          $emit('textoModal', textoConDespacho);
        "
        class="btn-grabar white--text"
        :disabled="!validForm"
        v-if="
          esEdicion &&
            formFields.despacho.value != '' &&
            edited.despareceptor == ''
        "
        >Guardar Cambios</v-btn
      >
      <v-btn
        depressed
        @click="
          $emit('edicion', true);
          $emit('textoModal', textoSinDespacho);
        "
        class="btn-grabar white--text"
        v-else-if="esEdicion && edited.moviestado != recibido"
        >Confirmar Recepción</v-btn
      >
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { fetchRecepcion } from '../fetchRecepcion';
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
  @Prop({ default: false }) esEdicion: boolean;
  @Prop({ required: true }) recibido: number;
  @Prop({ required: true }) receptor: string;
  @Prop({ required: true }) edited: any;
  @Prop({ required: true }) despachos: any;
  @Prop({ required: true }) estados: any;
  @Prop({ required: true }) usuarioActivo: any;
  validForm: boolean = true;
  accion!: any;
  ordesList2: any;
  step = 'general';

  anulado: boolean = false;
  textoConDespacho =
    "El estado será actualizado a 'RECIBIDO' con recepción en fecha actual y el receptor seleccionado";
  textoSinDespacho = "El estado será actualizado a 'RECIBIDO' ";

  rules = {
    required: (value: any) => {
      if (this.formFields.despacho.value != '') {
        return !!value || 'Required.';
      }
    },
  };

  getMovimiento() {
    this.formFields.usuario.value = this.edited.nombre;
    this.formFields.fechaAlta.value = moment(this.edited.movifecha_alta);
    this.formFields.movimiento.value = this.edited.movinumero;
    this.formFields.observacion.value = this.edited.moviobs;
    this.formFields.operacion.value = this.edited.operacion;
    this.formFields.destino.value = this.edited.destinoname;
    this.formFields.origen.value = this.edited.origen;
    this.formFields.estado.value = this.edited.moviestado;
    console.log('Recibido: ', this.recibido);
    console.log('Estado: ', this.edited.moviestado);
    this.formFields.despacho.value = this.edited.despanumero;
    this.formFields.fechaRecepcion.value =
      this.edited.movifecha_recibe == ' '
        ? this.edited.movifecha_recibe
        : moment();

    if (this.receptor == '') {
      this.formFields.receptor.value =
        this.formFields.despacho.value != '' &&
        this.edited.despareceptor == '' &&
        this.esEdicion
          ? this.usuarioActivo.nombre + ' ' + this.usuarioActivo.apellidopaterno
          : this.edited.despareceptor;
    } else {
      this.formFields.receptor.value = this.receptor;
    }

    this.$emit('receptor', this.formFields.receptor.value);
  }

  editar() {
    alert(this.formFields.receptor.value);
  }

  mounted() {
    this.getMovimiento();
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
    fechaRecepcion: any;
    receptor: any;
  } = {
    receptor: {
      label: 'Receptor en Despacho',
      value: '',
    },
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
      label: 'Destino',
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
    fechaRecepcion: {
      label: 'Fecha Recepción',
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

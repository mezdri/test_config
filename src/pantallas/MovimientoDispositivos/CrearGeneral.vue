<template>
  <v-layout
    row
    justify-center
    v-show="mostrarGeneral"
    class="crearGeneralMovimiento"
  >
    <div align="center">
      <v-flex>
        <v-card>
          <v-form>
            <v-container>
              <div align="left">
                <v-flex>
                  <h2 class="h2_title" style="margin-top: 12px !important">
                    Movimiento de Equipos
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
                    :items="destinosPosibles"
                    item-text="tipoubicaname"
                    item-value="tipoubicaid"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-autocomplete
                    clearable
                    :label="formFields.despacho.label"
                    v-model="formFields.despacho.value"
                    :items="despachos"
                    item-text="despaseguimiento"
                    item-value="despanumero"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    class="mr-2"
                    :label="formFields.caja.label"
                    v-model="formFields.caja.value"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-autocomplete
                    class="mr-2"
                    :label="formFields.estado.label"
                    v-model="formFields.estado.value"
                    :items="estado"
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
                    v-validate="'max:250'"
                    :rules="[rules.counter]"
                  ></v-textarea>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { fetchMovimientos } from './fetchMovimientos';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';

import { LoadingService } from '@/services/loadingService';

import { Validator } from 'vee-validate';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { AccionesInterface, IAccionesPadre } from '@/interfaces/Acciones';

import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  GridReadyEvent,
  SelectionChangedEvent,
  SelectionController,
  RowNode,
  CellClickedEvent,
  RowSelectedEvent,
  CellClassParams,
} from 'ag-grid-community';
import { differenceBy } from 'lodash';
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    DatePicker,
  },
})
export default class CrearGeneral extends ComponenteBaseStepper {
  @Prop({ required: true }) operaciones: any;
  @Prop({ required: true }) estado: any;
  @Prop({ required: true }) destinos: any;
  @Prop({ required: true }) anuladoId: number;
  @Prop({ required: true }) nuevoCodigo: number;
  @Prop({ required: true }) usuarioActivo: any;
  @Prop({ default: false }) mostrarGeneral: boolean;
  @Prop({ required: true }) despachos: any;

  permisosActuales: PermisoAccionVm[] = [];
  permisosTotales: PermisoAccionVm[] = [];
  destinosPosibles: any = [];

  async getEnviadoid() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      { '': '' },
      'conectaMoviDispositivos/get_enviado_id'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.configid;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async cargarEnviado() {
    this.formFields.estado.value = await this.getEnviadoid();
  }

  mounted() {
    this.destinosPosibles = this.destinos.filter(
      (e: any) => e.tipoubicaid != this.usuarioActivo.tipoubicaid
    );
    this.cargarEnviado();
  }

  rules = {
    counter: (value: any) => value.length <= 250 || 'Maximo 250 caracteres',
  };

  formFields: {
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
    movimiento: {
      label: 'Movimiento',
      value: this.nuevoCodigo,
    },
    usuario: {
      label: 'Usuario',
      value: this.usuarioActivo.nombre,
    },
    origen: {
      label: 'Origen',
      value: this.usuarioActivo.tipoubicaid,
    },
    operacion: {
      label: 'Operación',
      value: '5',
    },
  };

  async crearMovimiento(): Promise<boolean> {
    let self = this;
    return fetchMovimientos(
      {
        movimiento: this.nuevoDato.movimiento,
        usuario: this.nuevoDato.usuario,
        rut: this.nuevoDato.rut,
        operacion: this.nuevoDato.operacion,
        origen: this.nuevoDato.origen,
        destino: this.nuevoDato.destino,
        despacho: this.nuevoDato.despacho,
        /* this.despachoSelec && this.despachoSelec.despanumero
            ? this.despachoSelec.despanumero
            : '', */
        caja: this.nuevoDato.caja,
        observacion: this.nuevoDato.observacion,
        estado: this.nuevoDato.estado,
        movimientoAnterior: this.nuevoCodigo - 1,
      },
      'conectaMoviDispositivos/crear'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success('Creación exitosa', { timeout: 3000 });
          this.nuevoCodigo = this.nuevoCodigo + 1;
          return true;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return false;
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Error al crear el movimiento', {
          timeout: 3000,
        });
        return false;
      });
  }

  nuevoDato: any = {};

  async CrearMovimientos() {
    this.nuevoDato = {
      movimiento: this.formFields.movimiento.value,
      usuario: parseInt(this.usuarioActivo.id),
      rut: this.usuarioActivo.rut,
      operacion: this.formFields.operacion.value,
      origen: this.formFields.origen.value,
      destino: this.formFields.destino.value,
      despacho: this.formFields.despacho.value || '',
      caja: this.formFields.caja.value,
      observacion: this.formFields.observacion.value,
      estado: this.formFields.estado.value,
    };

    if (this.nuevoDato.observacion.length > 250) {
      this.$snotify.error(
        'La observación no puede superar los 250 caracteres',
        {
          timeout: 3000,
        }
      );
      return;
    }

    if (this.nuevoDato.destino == '' || this.nuevoDato.estado == '') {
      this.$snotify.error(
        'Por favor ingrese los campos obligatorios en la sección general',
        {
          timeout: 3000,
        }
      );
      return;
    }
    let crear = false;

    crear = await this.crearMovimiento();
    return crear;
  }

  // Globales
  $snotify: any;
  e1: number = 1;
  actual: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = true;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  warningInactivo: any = '';
  dialogConfirmacion: boolean = false;
  dictionaryFormErrors: any = {};
  disabledAccion: boolean = false;
  mensajeConfirmacion: any = '';

  //Interface
  editedItem: IFuncionalidad = {};

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'ModuloAccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
}
</script>

<style scoped>
.crearGeneralMovimiento #alinear {
  text-align: justify;
}

.crearGeneralMovimiento .h2_title {
  font-weight: normal;
}
</style>

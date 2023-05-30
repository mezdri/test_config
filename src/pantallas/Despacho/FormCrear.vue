<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivModulos">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Despacho</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn @click="crear()" class="btn-grabar">
              <span>Guardar</span>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              v-show="crearDespacho.visible"
              :complete="e1 > crearDespacho.step"
              :step="crearDespacho.step"
              >Crear Despacho</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="crearDespacho.visible"
              :step="crearDespacho.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-form
                      ref="form"
                      v-model="validForm"
                      lazy-validation
                      class="col-md-12"
                    >
                      <v-container grid-list-md>
                        <div align="left">
                          <v-flex md12>
                            <h2
                              class="h2_title"
                              style="margin-top: 12px !important"
                            >
                              Despacho
                            </h2>
                          </v-flex>
                        </div>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.nuevoCodigo.label"
                              v-model="formFields.nuevoCodigo.value"
                              :disabled="true"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <DatePicker
                              :label="formFields.fechaEnvio.label"
                              v-model="formFields.fechaEnvio.value"
                              data-vv-name="fechaEnvioRequerida"
                              :error-messages="
                                errors.collect('fechaEnvioRequerida')
                              "
                            />
                          </v-flex>

                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.usuario.label"
                              v-model="formFields.usuario.value"
                              :disabled="true"
                              :counter="80"
                              v-validate="'max:80'"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-autocomplete
                              :label="formFields.curier.label"
                              v-model="formFields.curier.value"
                              :items="courrierList"
                              item-text="configvalor"
                              item-value="configid"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.ordenSeguimiento.label"
                              v-model="formFields.ordenSeguimiento.value"
                              :counter="50"
                              v-validate="'max:50'"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-autocomplete
                              :label="formFields.localidad.label"
                              v-model="formFields.localidad.value"
                              :items="localidadList"
                              item-text="locaname"
                              item-value="locaname"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-autocomplete
                              :label="formFields.coordinador.label"
                              v-model="formFields.coordinador.value"
                              :items="coordinadorList"
                              item-text="coorname"
                              item-value="coorname"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-autocomplete
                              :label="formFields.tecnico.label"
                              v-model="formFields.tecnico.value"
                              :items="tecnicoList"
                              item-text="tecniconame"
                              item-value="tecniconame"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.observacion.label"
                              v-model="formFields.observacion.value"
                              :counter="100"
                              v-validate="'max:100'"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs1 sm1 md1>
                            <v-checkbox
                              :label="formFields.costo.label"
                              v-model="formFields.costo.value"
                            ></v-checkbox>
                            <!-- <v-text-field
                              :label="formFields.sn.label"
                              :counter="2"
                              v-validate="'max:2'"
                            ></v-text-field> -->
                          </v-flex>
                          <v-flex xs3 sm3 md3>
                            <v-text-field
                              :label="formFields.valor.label"
                              v-model="formFields.valor.value"
                              :disabled="!formFields.costo.value"
                              :counter="50"
                              type="Number"
                              v-validate="'max:50'"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <DatePicker
                              :label="formFields.fechaRecepcion.label"
                              v-model="formFields.fechaRecepcion.value"
                              data-vv-name="fechaRecepcionRequerida"
                              :error-messages="
                                errors.collect('fechaRecepcionRequerida')
                              "
                            />
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              :label="formFields.receptor.label"
                              v-model="formFields.receptor.value"
                              :counter="50"
                              v-validate="'max:50'"
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import { fetchDespacho } from './fetchDespacho';
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
const { AgGridVue } = require('ag-grid-vue');
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
import Confirmation from '@/components/Confirmation.vue'; //
import { SubAccion } from '../../views/base/VariablesPermisos';

@Component({
  components: {
    DatePicker,
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class FormCrearDespacho extends ComponenteBaseStepper {
  @Prop({ required: true }) nuevoCodigo: number;
  @Prop({ required: true }) usuarioActivo: any;
  @Prop({ default: false }) coordinadorList!: any;
  @Prop({ default: false }) courrierList!: any;
  @Prop({ default: false }) localidadList!: any;
  @Prop({ default: false }) tecnicoList!: any;

  @Prop({ default: false }) show: boolean;

  formFields: {
    fechaEnvio: any;
    usuario: any;
    curier: any;
    ordenSeguimiento: any;
    localidad: any;
    coordinador: any;
    tecnico: any;
    observacion: any;
    costo: any;
    valor: any;
    fechaRecepcion: any;
    receptor: any;
    nuevoCodigo: any;
  } = {
    nuevoCodigo: {
      label: 'Código',
      value: this.nuevoCodigo,
    },
    fechaEnvio: {
      label: 'Fecha Envio',
      value: moment(),
      selectedValue: '',
    },
    usuario: {
      label: 'Usuario',
      value: this.usuarioActivo.nombre,
    },
    curier: {
      label: 'Courier (Obligatorio)',
      value: '',
    },
    ordenSeguimiento: {
      label: 'Orden de Seguimiento (Obligatorio)',
      value: '',
    },
    localidad: {
      label: 'Localidad (Obligatorio)',
      id: '',
      value: '',
    },
    coordinador: {
      label: 'Coordinador (Obligatorio)',
      id: 'coorid',
      value: '',
    },
    tecnico: {
      label: 'Técnico (Obligatorio)',
      id: 'tecnicoid',
      value: '',
    },
    observacion: {
      label: 'Observación',
      value: '',
    },
    costo: {
      label: 'Costo',
      value: false,
    },
    valor: {
      label: 'Valor',
      value: '',
    },
    fechaRecepcion: {
      label: 'Fecha Recepción',
      value: '',
      selectedValue: '',
    },
    receptor: {
      label: 'Receptor',
      value: '',
    },
  };

  async validarOrden(): Promise<boolean> {
    let self = this;
    return fetchDespacho(
      {
        seguimiento: this.nuevoDato.ordenSeguimiento,
        courrier: this.nuevoDato.curier,
      },
      'conectaDespacho/validar_orden'
    )
      .then((data: any) => {
        //console.log(data.data);
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.despaseguimiento_exists == 't';
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return false;
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Error al crear el despacho', { timeout: 3000 });
        return false;
      });
    /*.finally(() => {
        return null;
      });  */
  }

  async crearDespa() {
    let self = this;
    if (
      this.nuevoDato.curier != '' &&
      this.nuevoDato.ordenSeguimiento != '' &&
      this.nuevoDato.localidad != '' &&
      this.nuevoDato.coordinador != '' &&
      this.nuevoDato.tecnico != ''
    ) {
      let validar = await this.validarOrden();
      if (validar) {
        self.$snotify.error(
          'La orden de compra se encuetra registrada con ese Courier',
          { timeout: 3000 }
        );
        return;
      }
      return fetchDespacho(
        {
          despaAnterior: this.nuevoCodigo - 1,
          despanumero: this.nuevoDato.codigo,
          fechaEnvio: this.nuevoDato.fechaEnvio,
          usuario: this.nuevoDato.usuario,
          rut: this.nuevoDato.rut,
          curier: this.nuevoDato.curier,
          ordenSeguimiento: this.nuevoDato.ordenSeguimiento,
          localidad: this.nuevoDato.localidad,
          coordinador: this.nuevoDato.coordinador,
          tecnico: this.nuevoDato.tecnico,
          observacion: this.nuevoDato.observacion,
          costo: this.nuevoDato.costo,
          valor: this.nuevoDato.valor,
          fechaRecepcion: this.nuevoDato.fechaRecepcion,
          receptor: this.nuevoDato.receptor,
        },
        'conectaDespacho/crear'
      )
        .then((data: any) => {
          //console.log(data.data);
          if (data.data.CODIGO_RESPUESTA == '1') {
            self.$snotify.success('Creación exitosa', { timeout: 3000 });
            this.closeModal(false);
            //this.nuevoCodigo= this.nuevoCodigo+1
            return null;
          } else {
            self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
            return [];
          }
        })
        .catch((error: any) => {
          self.$snotify.error('Error al crear el despacho', { timeout: 3000 });
        });
      /*.finally(() => {
        return null;
      });  */
    } else {
      self.$snotify.error('Por favor ingrese todos los campos obligatorios', {
        timeout: 3000,
      });
    }
  }

  nuevoDato: any = {};

  crear() {
    let localidadSelected = {
      locaid: ' ',
    };
    let coordinadorSelected = {
      coorid: ' ',
    };
    let tecnicoSelected = {
      tecnicoid: '',
    };
    localidadSelected =
      this.formFields.localidad.value != ' '
        ? this.localidadList.find(
            (e: any) => e.locaname == this.formFields.localidad.value
          )
        : '';
    coordinadorSelected =
      this.formFields.coordinador.value != ''
        ? this.coordinadorList.find(
            (coor: any) => coor.coorname == this.formFields.coordinador.value
          )
        : '';
    tecnicoSelected =
      this.formFields.tecnico.value != ''
        ? this.tecnicoList.find(
            (tec: any) => tec.tecniconame == this.formFields.tecnico.value
          )
        : '';

    this.nuevoDato = {
      codigo: this.nuevoCodigo,
      fechaEnvio:
        this.formFields.fechaEnvio.value != ''
          ? moment(this.formFields.fechaEnvio.value).format('YYYY-MM-DD')
          : '',
      usuario: this.usuarioActivo.id,
      rut: this.usuarioActivo.rut,
      curier: this.formFields.curier.value,
      ordenSeguimiento: this.formFields.ordenSeguimiento.value,
      localidad:
        localidadSelected && localidadSelected.locaid
          ? localidadSelected.locaid
          : '',
      coordinador:
        coordinadorSelected && coordinadorSelected.coorid
          ? coordinadorSelected.coorid
          : '',
      tecnico:
        tecnicoSelected && tecnicoSelected.tecnicoid
          ? tecnicoSelected.tecnicoid
          : '',
      observacion: this.formFields.observacion.value,
      costo: this.formFields.costo.value ? '1' : '0',
      valor: this.formFields.valor.value,
      fechaRecepcion:
        this.formFields.fechaRecepcion.value != ''
          ? moment(this.formFields.fechaRecepcion.value).format('YYYY-MM-DD')
          : '',
      receptor: this.formFields.receptor.value,
    };
    //console.log(this.nuevoDato)
    //console.log(this.usuarioActivo);
    this.crearDespa();
  }

  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  crearDespacho: PermisoAccionVm = {
    accion: 'Crear - Crear Despacho',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 19,
  };

  asociarAcciones: PermisoAccionVm = {
    accion: 'Crear - Asociar Acciones',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 20,
  };

  asociarSubAcciones: PermisoAccionVm = {
    accion: 'Crear - Asociar SubAcciones',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 21,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.crearDespacho,
    this.asociarAcciones,
    this.asociarSubAcciones,
  ];

  // Globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = true;
  validForm: boolean = false;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  estadoSeleccionado: any = null;
  AccionesAsignados: AccionesInterface[] = [];
  //Interface
  editedItem: IFuncionalidad = {};

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'ModuloAccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //@Watch('show')

  closeModal(val: boolean) {
    document.getElementById('cardDivModulos').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('datoCreado', true);
    this.$emit('modalAsociacionEmit', false);
    //Reset Validaciones
    this.dialog = false;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.show = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }
}
</script>

<style scoped>
#alinear {
  text-align: justify;
}

.h2_title {
  font-weight: normal;
}
</style>

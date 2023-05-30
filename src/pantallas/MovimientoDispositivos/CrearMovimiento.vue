<template>
  <v-layout row justify-center class="crearMovimiento">
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

          <v-toolbar-title>Crear Movimiento</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <div v-if="actual == 1" class="mt-2" style="height: inherit">
              <v-btn @click="nextGeneral()" :class="btnClass">
                <span>Siguiente</span>
              </v-btn>
            </div>
            <div v-else-if="actual == 2" class="mt-2" style="height: inherit">
              <v-btn @click="nextSerie('previous')" class="btn-volver mr-2">
                <span>Volver</span>
              </v-btn>
              <v-btn @click="nextSerie('next')" :class="btnClass">
                <span>Siguiente</span>
              </v-btn>
            </div>
            <div v-else-if="actual == 3" class="mt-2" style="height: inherit">
              <v-btn @click="nextNoSerie('previous')" class="btn-volver mr-2">
                <span>Volver</span>
              </v-btn>

              <v-btn @click="nextNoSerie('next')" :class="btnClass">
                <span>Siguiente</span>
              </v-btn>
            </div>
            <div v-else class="mt-2" style="height: inherit">
              <v-btn
                @click="CrearMovimientos('previous')"
                class="btn-volver mr-2"
              >
                <span>Volver</span>
              </v-btn>
              <v-btn @click="CrearMovimientos('next')" class="btn-grabar">
                <span>Guardar</span>
              </v-btn>
            </div>
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              v-show="true"
              :complete="e1 > generalMovi.step"
              :step="generalMovi.step"
              >{{ generalMovi.accion }}</v-stepper-step
            >
            <v-divider></v-divider>
            <v-stepper-step
              v-show="true"
              :complete="e1 > serieMovi.step"
              :step="serieMovi.step"
              >{{ serieMovi.accion }}</v-stepper-step
            >
            <v-divider></v-divider>
            <v-stepper-step
              v-show="true"
              :complete="e1 > noSerieMovi.step"
              :step="noSerieMovi.step"
              >{{ noSerieMovi.accion }}</v-stepper-step
            >
            <v-divider></v-divider>
            <v-stepper-step
              v-show="true"
              :complete="e1 == simMovi.step"
              :step="simMovi.step"
              >{{ simMovi.accion }}</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="generalMovi.visible"
              :step="generalMovi.step"
            >
              <div align="center">
                <v-flex md10>
                  <!-- <v-card class="rounded-card"> -->
                  <!-- Cambio de todo -->
                  <CrearGeneral
                    ref="CrearGeneral"
                    :anuladoId="anuladoId"
                    :mostrarGeneral="true"
                    :despachos="despachos"
                    :estado="estadosSinAnulado"
                    :nuevoCodigo="nuevoCodigo"
                    :destinos="destinos"
                    :usuarioActivo="usuarioActivo"
                    :operaciones="operaciones"
                    @CrearMovimientos="CrearMovimientos"
                  />
                  <!-- </v-card> -->
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content
              v-show="serieMovi.visible"
              :step="serieMovi.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <!-- Cambio de todo -->
                    <TablaSerie
                      :mostrarSerie="true"
                      ref="dispositivosSeriados"
                      :nuevoCodigo="nuevoCodigo"
                    />
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content
              v-show="noSerieMovi.visible"
              :step="noSerieMovi.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <!-- Cambio de todo -->
                    <TablaNoSeriada
                      :mostrarNoSerie="true"
                      ref="dispositivosNoSeriados"
                      :nuevoCodigo="nuevoCodigo"
                    />
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content v-show="simMovi.visible" :step="simMovi.step">
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <!-- Cambio de todo -->
                    <TablaSim
                      :mostrarSim="true"
                      ref="dispositivosSim"
                      :usuarioActivo="usuarioActivo"
                      :nuevoCodigo="nuevoCodigo"
                    ></TablaSim>
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
import TablaSim from './TablaSim.vue';
import TablaNoSeriada from './TablaNoSeriada.vue';
import TablaSerie from './TablaSerie.vue';
import CrearGeneral from './CrearGeneral.vue';
import { fetchMovimientos } from './fetchMovimientos';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadoInterface } from '@/interfaces/Estado';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
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
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    TablaSim,
    TablaNoSeriada,
    TablaSerie,
    CrearGeneral,
    DatePicker,
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class FormCrearMovimiento extends ComponenteBaseStepper {
  @Prop({ required: true }) estado: any;
  @Prop({ required: true }) operaciones: any;
  @Prop({ required: true }) anuladoId: number;
  @Prop({ required: true }) destinos: any;
  @Prop({ required: true }) nuevoCodigo: number;
  @Prop({ required: true }) usuarioActivo: any;
  @Prop({ default: false }) show: boolean;
  @Prop({ required: true }) despachos: any;

  /* Pasos de la creacion */
  general: any;
  seriados: any;
  noSeriados: any;
  sim: any;
  estadosSinAnulado: any = [];

  mounted() {
    this.general = this.$refs.CrearGeneral;
    this.seriados = this.$refs.dispositivosSeriados;
    this.noSeriados = this.$refs.dispositivosNoSeriados;
    this.sim = this.$refs.dispositivosSim;
    this.estadosSinAnulado = this.estado.filter(
      (e: any) => e.configid != this.anuladoId
    );
  }

  nuevoDato: any = {};

  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  generalMovi: PermisoAccionVm = {
    accion: 'General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  serieMovi: PermisoAccionVm = {
    accion: 'Dispositivos Seriados',
    visible: false,
    step: 2,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  noSerieMovi: PermisoAccionVm = {
    accion: 'Dispositivos No Seriados',
    visible: false,
    step: 3,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  simMovi: PermisoAccionVm = {
    accion: 'SIM',
    visible: false,
    step: 4,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.generalMovi,
    this.serieMovi,
    this.noSerieMovi,
    this.simMovi,
  ];

  nextGeneral() {
    !this.generalMovi.visible;
    !this.serieMovi.visible;
    this.e1 = 2;
    this.actual++;
  }

  nextSerie(data: string) {
    if (data == 'next') {
      !this.serieMovi.visible;
      !this.noSerieMovi.visible;
      this.e1++;
      this.actual++;
    } else {
      !this.serieMovi.visible;
      !this.noSerieMovi.visible;
      this.e1--;
      this.actual--;
    }
  }

  nextNoSerie(data: string) {
    if (data == 'next') {
      !this.noSerieMovi.visible;
      !this.simMovi.visible;
      this.e1++;
      this.actual++;
    } else {
      !this.noSerieMovi.visible;
      !this.simMovi.visible;
      this.e1--;
      this.actual--;
    }
  }
  async CrearMovimientos(data: string) {
    if (data == 'next') {
      if (
        !this.seriados.dataSelected.length &&
        !this.noSeriados.seleccionados.length &&
        !this.sim.simsSelected.length
      ) {
        this.$snotify.error('Por favor ingrese al menos un dispositivo', {
          timeout: 3000,
        });
        return;
      }

      let creacionMovimiento = await this.general.CrearMovimientos();
      if (!creacionMovimiento) {
        return;
      }

      let dispositivosSeriados = this.seriados.guardarSeriados(
        this.general.formFields.destino.value
      );
      if (!dispositivosSeriados) {
        return;
      }

      let dispositivosNoSeriados = this.noSeriados.guardarNoSeriados();
      if (!dispositivosNoSeriados) {
        return;
      }

      let dispositivosSim = this.sim.guardarSims(
        this.general.formFields.destino.value
      );
      if (!dispositivosSim) {
        return;
      } else {
        this.closeModal(false);
      }
    } else {
      !this.noSerieMovi.visible;
      !this.simMovi.visible;
      this.e1--;
      this.actual--;
    }
  }

  // Globales
  $snotify: any;
  e1: number = 1;
  actual: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = true;
  validForm: boolean = false;
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacion: any = '';

  //Interface
  editedItem: IFuncionalidad = {};

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'ModuloAccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //@Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value; //Estado Activo0
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivModulos').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('datoCreado', true);
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset(); //Reset Validaciones
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
.crearMovimiento #alinear {
  text-align: justify;
}

.crearMovimiento .h2_title {
  font-weight: normal;
}
</style>

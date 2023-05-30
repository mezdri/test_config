<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivTV">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="
              !esEdicion ? closeModal(false) : (dialogConfirmacionClose = true)
            "
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title> Editar Movimiento </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              @click="grabarEdicion()"
              class="btn-grabar"
              :disabled="guardarAnulado"
              v-if="esEdicion"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br /><br /><br />
        <div>
          <div align="center" class="cardnew">
            <br />
            <v-flex md10>
              <v-tabs>
                <v-tab @click="step = 'general'">General</v-tab>
                <v-tab @click="step = 'seriados'">Equipos Seriados</v-tab>
                <v-tab @click="step = 'noSeriados'">Equipos No Seriados</v-tab>
                <v-tab @click="step = 'sim'">SIM</v-tab>
              </v-tabs>
              <v-card class="rounded-card" v-if="step == 'general'">
                <EditarGeneral
                  ref="FormularioInformacionGeneral"
                  :anuladoId="anuladoId"
                  :recibidoId="recibidoId"
                  :estado="estado"
                  :operaciones="operaciones"
                  :edited="data"
                  :destinos="destinos"
                  :estadoSelected="estadoSelected"
                  :cajaEdited="caja"
                  :despachos="despachos"
                  :despachoEdited="despacho"
                  :despachoIsEdit="despachoIsEdit"
                  :cajaIsEdit="cajaIsEdit"
                  v-on:despacho="guardarDespacho($event)"
                  v-on:caja="guardarCaja($event)"
                  v-on:estado="guardarEstado($event)"
                  v-on:anularBoton="anularBoton($event)"
                />
              </v-card>
              <v-card class="rounded-card" v-if="step == 'seriados'">
                <EditarTablaSeriados
                  :mostrarSerie="true"
                  :codigo="data.movinumero"
                />
              </v-card>
              <v-card class="rounded-card" v-if="step == 'noSeriados'">
                <EditarTablaNoSeriados
                  :mostrarNoSerie="true"
                  :codigo="data.movinumero"
                />
              </v-card>
              <v-card class="rounded-card" v-if="step == 'sim'">
                <EditarSim :mostrarSim="true" :codigo="data.movinumero" />
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import EditarGeneral from './EditarGeneral.vue';
import EditarTablaSeriados from './EditarTablaSeriados.vue';
import EditarTablaNoSeriados from './EditarTablaNoSeriados.vue';
import EditarSim from './EditarSim.vue';

import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { fetchMovimientos } from './fetchMovimientos';
import { AxiosVue } from '@/AxiosVue'; //
import { LoadingService } from '@/services/loadingService';
import { ServicioProxy } from '@/config/enums'; //
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue'; //
import { TranslateResult } from 'vue-i18n';
import { GridReadyEvent, GridApi } from 'ag-grid-community';

@Component({
  components: {
    DatePicker,
    'app-confirmacion': Confirmation,
    EditarTablaSeriados,
    EditarGeneral,
    EditarTablaNoSeriados,
    EditarSim,
  },
})
export default class EditarMovimiento extends Vue {
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ required: true }) anuladoId: number;
  @Prop({ required: true }) recibidoId: number;
  @Prop({ required: true }) estado: any;
  @Prop({ required: true }) operaciones: any;
  @Prop({ required: true }) despachos: any;
  @Prop({ default: false }) destinos!: any;
  @Prop({ default: false }) edited!: any;
  @Prop({ required: true }) usuarioActivo: any;

  accion!: any;
  ordesList2: any;
  data: any = {};
  step = '';
  informacionGeneral: any = {};
  caja: string = '';
  cajaIsEdit: boolean = false;
  despacho: string = '';
  despachoIsEdit: boolean = false;
  estadoSelected: number;

  guardarEstado(data: number) {
    this.estadoSelected = data;
  }

  guardarAnulado: boolean = false;

  anularBoton(data: boolean) {
    if (data) {
      this.guardarAnulado = data;
    }
  }

  guardarDespacho(data: string) {
    this.despacho = data;
    this.despachoIsEdit = true;
  }

  guardarCaja(data: string) {
    this.caja = data;
    this.cajaIsEdit = true;
  }

  async getMovimientoSeleccionado() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMovimientos(
      { movimientoId: this.edited },
      'conectaMoviDispositivos/inicio'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
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

  async getMovimiento() {
    this.ordesList2 = (await this.getMovimientoSeleccionado()) || [];
    this.data = this.ordesList2[0];
    this.step = 'general';
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

  //abstract
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.MovimientoDispositivos;

  //propiedades globales
  loadingService = new LoadingService();
  gridApi: GridApi;
  $snotify: any;
  dialog: boolean = true;
  dialogConfirmacionClose: boolean = false;
  validForm: boolean = false;
  dialogConfirmacion: boolean = false;
  btnBloquear: Boolean = false;

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
    this.dialog = value;
    // permisos
    this.setBotonNav();
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
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

  closeModal(val: boolean) {
    this.$validator.reset();
    document.getElementById('cardDivTV').scrollIntoView(true);
    this.$emit('modalAsociacionEmit', false);
    this.$emit('datoEditado', true);
    this.dialog = false;
    this.btnBloquear = false;
  }

  confirmCallback(val: any) {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  datosEditados: any = {};

  async grabarEdicion() {
    this.datosEditados = {
      despacho: this.despacho ? this.despacho : '',
      cajaNumero: this.caja,
      estado: this.estadoSelected ? this.estadoSelected : '',
    };

    await this.editar();
  }

  async editar() {
    let self = this;
    return fetchMovimientos(
      {
        despacho: this.datosEditados.despacho,
        cajaNumero: this.datosEditados.cajaNumero,
        movimiento: this.edited,
        estado: this.datosEditados.estado,
        usuario: this.usuarioActivo.id,
        usuarioRut: this.usuarioActivo.rut,
      },
      'conectaMoviDispositivos/editar_movimiento'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.closeModal(false);
          self.$snotify.success('Actualización exitosa', { timeout: 3000 });
          return;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return;
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
  }
}
</script>

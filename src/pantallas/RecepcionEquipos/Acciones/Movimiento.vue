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

          <v-toolbar-title>
            {{ esEdicion ? 'Editar Movimiento ' : 'Ver Movimiento ' }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items> </v-toolbar-items>
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
                <informacionGeneral
                  :edited="data"
                  :despachos="despachosList"
                  :estados="estados"
                  :esEdicion="esEdicion"
                  :usuarioActivo="usuarioActivo"
                  :receptor="receptorSelected"
                  :recibido="recibido"
                  ref="general"
                  v-on:receptor="receptorSelected = $event"
                  v-on:edicion="dialogGuardar = $event"
                  v-on:textoModal="textoConfirmacion = $event"
                />
              </v-card>
              <v-card class="rounded-card" v-if="step == 'seriados'">
                <DispositivosSeriadosEdicion
                  v-if="esEdicion"
                  :codigo="data.movinumero"
                  :mostrarSerie="true"
                />
                <DispositivosSeriadosDetalles
                  v-else
                  :codigo="data.movinumero"
                  :mostrarSerie="true"
                />
              </v-card>
              <v-card class="rounded-card" v-if="step == 'noSeriados'">
                <DispositivosNoSeriadosEdicion
                  v-if="esEdicion"
                  :codigo="data.movinumero"
                  :mostrarNoSerie="true"
                  :esEdicion="esEdicion"
                />
                <DispositivosNoSeriadosDetalles
                  v-else
                  :codigo="data.movinumero"
                  :mostrarNoSerie="true"
                />
              </v-card>
              <v-card class="rounded-card" v-if="step == 'sim'">
                <DispositivosSim
                  :codigo="data.movinumero"
                  :mostrarSim="true"
                  :esEdicion="esEdicion"
                />
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="
        'Al cerrar esta ventana toda la información editable se perderá ¿Esta seguro que desea cerrar sin guardar? '
      "
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogGuardar"
      :titulo="`Editar el movimiento número ${data.movinumero}`"
      :mensaje="textoConfirmacion"
      v-on:modalConfirmationEmit="editarMovimiento($event)"
      :textoBtnSi="'Guardar cambios'"
      :textoBtnNo="'Cancelar'"
    ></app-confirmacion>
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
import Confirmation from '@/components/Confirmation.vue'; //
import { TranslateResult } from 'vue-i18n';
import { GridReadyEvent, GridApi } from 'ag-grid-community';
import informacionGeneral from './InformacionGeneral.vue';
import DispositivosSeriadosEdicion from './DispositivosSeriadosEdicion.vue';
import DispositivosSeriadosDetalles from './DispositivosSeriadosDetalles.vue';
import DispositivosNoSeriadosEdicion from './DispositivosNoSeriadosEdicion.vue';
import DispositivosNoSeriadosDetalles from './DispositivosNoSeriadosDetalles.vue';
import DispositivosSim from './DispositivosSim.vue';

@Component({
  components: {
    DatePicker,
    'app-confirmacion': Confirmation,
    informacionGeneral,
    DispositivosSeriadosEdicion,
    DispositivosSeriadosDetalles,
    DispositivosNoSeriadosEdicion,
    DispositivosNoSeriadosDetalles,
    DispositivosSim,
  },
})
export default class Movimiento extends Vue {
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ required: true }) recibido: number;
  @Prop({ required: true }) edited: any;
  @Prop({ required: true }) estados: any;
  @Prop({ required: true }) usuarioActivo: any;
  textoConfirmacion = '';
  receptorSelected: string = '';
  dialogGuardar: boolean = false;
  accion!: any;
  ordesList2: any;
  data: any = {};
  step = '';

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

  despachosList: any = [];
  async getOperaciones() {
    let self = this;
    return fetchRecepcion({}, 'conecta_recepcion_equipos/get_despachos')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.despachosList = data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        return null;
      });
  }

  async getMovimientoSeleccionado() {
    let self = this;
    this.loadingService.showLoading();
    return fetchRecepcion(
      { movimiento: this.edited },
      'conecta_recepcion_equipos/inicio'
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
  informacionGeneral: any;

  mounted() {
    this.getMovimiento();
    this.getOperaciones();
    this.informacionGeneral = this.$refs.general;
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
    this.dialog = val;
    this.btnBloquear = val;
  }

  confirmCallback(val: any) {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  datosEditados: any = {};

  async editar(): Promise<Boolean> {
    let self = this;
    return fetchRecepcion(
      {
        receptor: this.receptorSelected,
        usuario: this.usuarioActivo.id,
        movimiento: this.data.movinumero,
      },
      'conecta_recepcion_equipos/editar_despacho'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.closeModal(false);
          self.$snotify.success('Actualización exitosa', { timeout: 3000 });
          return true;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return false;
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
        return false;
      });
  }

  async editarMovimiento(data: boolean) {
    if (data == true) {
      let editar = await this.editar();
      this.$emit('actualizar', editar);
    }
    this.dialogGuardar = false;
  }
}
</script>

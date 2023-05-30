<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivE">
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="close()">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Detalle Notificación</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <br />
        <br />
        <br />

        <div align="center" class="cardnew">
          <v-flex md10>
            <v-card class="rounded-card">
              <v-container text-xs-center grid-list-md>
                <div align="center">
                  <v-flex md12>
                    <span v-html="detalleNotificacion.cuerpoHtml"></span>
                  </v-flex>
                </div>
                <v-divider></v-divider>
                <br />
                <br />
              </v-container>
            </v-card>
          </v-flex>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script lang="ts">
import Vue from 'vue';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';

import { IEtiqueta } from '@/interfaces/Etiquetas';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { ITipoActividad } from '@/interfaces/TipoActividad';
import { ServicioProxy, HomeFiltros } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import moment, { Duration } from 'moment';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { Validator } from 'vee-validate';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import store from '@/store';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

const iconoTrack = require('@/assets/LogoTrackInvertido.png');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
  },
})
export default class DetalleNotificacion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: 0 }) id: number;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Notificaciones;
  permisosActuales: PermisoAccionVm[] = [];

  permisosTotales: PermisoAccionVm[] = [];

  //Variables globales
  dialog: boolean = false;
  loadingService = new LoadingService();

  columnDefsNotificados: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig; //
  localeText: any = config.agGridTextos; //

  detalleNotificacion: any = {};
  contactosRespaldo: any[] = [];
  isNoData: boolean = false;
  dictionaryFormErrors: any = {};
  validForm: boolean = false;
  usuarioId: number = store.state.userId;
  filtroMes: string = '';
  filtroAnio: string = '';

  gridApi: GridApi;
  columnApi: ColumnApi;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  serverSide: any;
  $snotify: any;

  //AXIOS
  axiosNotificacion: AxiosVue = new AxiosVue(ServicioProxy.Notificacion);

  close() {
    this.dialog = false;
    this.$emit('modalDetalleEmit', false);
  }
  constructor() {
    super();
  }

  @Watch('show')
  async onPropertyChangedS(value: boolean, oldValue: boolean) {
    this.dialog = value;
    const self = this;

    if (value) {
      this.loadingService.showLoading();
      this.getdetalles();
      this.loadingService.hideLoading();
    }
  }

  async getdetalles() {
    const res: any = await this.axiosNotificacion.http
      .get(`Notificacion/${this.id}/GetDetalleNotificacion`)
      .then(response => {
        this.detalleNotificacion = response.data;
      });
  }
}
</script>

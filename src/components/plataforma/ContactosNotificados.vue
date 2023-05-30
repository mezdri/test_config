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

          <v-toolbar-title>Contactos Notificados</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div align="center" class="cardnew">
          <br />
          <v-flex md10>
            <v-card class="rounded-card">
              <v-container text-xs-center grid-list-md>
                <div align="left">
                  <v-flex md12>
                    <h2
                      class="h2_title"
                      style="margin-top: 12px!important; font-weight: normal"
                    >
                      Contactos Notificados
                    </h2>
                  </v-flex>
                </div>
                <v-divider></v-divider>
                <br />

                <v-form ref="form" v-model="validForm" lazy-validation>
                  <v-card-text>
                    <v-flex md12>
                      <div class="gridcard rounded-card">
                        <ag-grid-vue
                          :columnDefs="columnDefsNotificados"
                          :rowData="contactosRespaldo"
                          style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          pagination="true"
                          paginationPageSize="5"
                          suppressRowClickSelection="true"
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReady"
                          :postProcessPopup="onClickCell"
                          suppressCopyRowsToClipboard="true"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                        ></ag-grid-vue>
                      </div>
                    </v-flex>
                  </v-card-text>
                </v-form>
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
export default class ContactosNotificados extends ComponenteBaseStepper {
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
    this.$emit('modalAsociacionEmit', false);
  }

  onGridReadyAlertas(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  constructor() {
    super();

    this.columnDefsNotificados = [
      {
        headerName: 'Nombre del Contacto',
        field: 'contactoNombre',
        suppressMovable: true,
        lockVisible: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Lista de Distribución',
        field: 'listaDistribucionText',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Notificado Correo Electrónico',
        field: 'notificaEmail',
        resizable: true,
        width: 250,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left', 'padding-left': '90px' },
        cellRenderer: this.createMailIcono,
      },
      {
        headerName: 'Notificado Track',
        field: 'notificaGps',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left', 'padding-left': '40px' },
        cellRenderer: this.crearTrackIcono,
      },
      {
        headerName: 'Notificado Navegador',
        field: 'notificaNavegador',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left', 'padding-left': '65px' },
        cellRenderer: this.crearNavegadorIcono,
      },
    ];
  }

  //////////////////////////////////////
  ///Grilla

  @Watch('show')
  async onPropertyChangedS(value: boolean, oldValue: boolean) {
    this.dialog = value;
    const self = this;

    if (value) {
      this.loadingService.showLoading();
      this.getContactos();
      this.loadingService.hideLoading();
    }
  }

  async getContactos() {
    this.contactosRespaldo = [];
    const res: any = await this.axiosNotificacion.http.get(
      `Notificacion/${this.id}/GetEstadoNotificacion`
    );
    if (res.data.notificaContactoVm) {
      this.contactosRespaldo = res.data.notificaContactoVm;
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  createMailIcono(params: any) {
    if (!params.data.notificaEmail) {
      return '';
    }
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'email';
    eSpan.className = 'material-icons';
    eSpan.id = params.data.id;
    eSpan.style.cssText =
      'cursor:default;color:#27488E;font-size: 25px;padding-top:5px;';
    return eSpan;
  }

  crearTrackIcono(params: any) {
    if (!params.data.notificaGps) {
      return '';
    }
    return `<img src='${iconoTrack}' style='height: 25px;width: 50px;padding-top:5px;'/>`;
  }

  crearNavegadorIcono(params: any) {
    if (!params.data.notificaGps) {
      return '';
    }

    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'language';
    eSpan.className = 'material-icons';
    eSpan.id = params.data.id;
    eSpan.style.cssText =
      'cursor:default;color:#27488E;font-size: 25px;padding-top:5px;';
    return eSpan;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

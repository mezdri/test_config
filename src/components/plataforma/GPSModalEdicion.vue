<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivRT">
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

          <v-toolbar-title>{{
            esEdicion ? 'Editar GPS' : 'Ver Detalle'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion(), (btnBloquear = true)"
              :disabled="!validForm || btnBloquear"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                :value="informacionGeneral.step"
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (asociarDispositivo.visible && esEdicion) ||
                    (asociarDispositivoVerDetalle.visible && !esEdicion)
                "
                :value="asociarDispositivo.step"
              >
                <span>Asociar Dispositivo</span>
                <v-icon>my_location</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((informacionGeneral.visible && esEdicion) ||
                  (informacionGeneralVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
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
                          style="margin-top: 12px!important;"
                        >
                          Informaci&oacute;n General
                        </h2>
                      </v-flex>
                    </div>
                    <v-divider></v-divider>
                    <br />
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|max:20|alpha_num'"
                          v-model="editedItem.numeroSerie"
                          :error-messages="errors.collect('numeroSerie')"
                          data-vv-name="Número serie"
                          label="Nro. Serie"
                          type="text"
                          min="1"
                          :disabled="true"
                          :counter="20"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="marcaSeleccionada"
                          :items="marcasGps"
                          item-text="nombre"
                          item-value="id"
                          label="Marca de GPS"
                          v-validate="'required'"
                          :error-messages="errors.collect('marca')"
                          data-vv-name="marca"
                          @change="changeMarca"
                          :disabled="!esEdicion || this.tieneVehiculo != 0"
                          no-data-text="Sin resultados"
                          required
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="modeloSeleccionado"
                          :items="modelosGps"
                          item-text="nombre"
                          item-value="id"
                          label="Modelo de GPS"
                          v-validate="'required'"
                          :error-messages="errors.collect('modelo')"
                          data-vv-name="modelo"
                          :disabled="!esEdicion || this.tieneVehiculo != 0"
                          no-data-text="Sin resultados"
                          required
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|max:15|IMEI|IMEIUnicoEditar'"
                          v-model="editedItem.imei"
                          :error-messages="errors.collect('imei')"
                          data-vv-name="imei"
                          label="IMEI"
                          type="text"
                          :disabled="!esEdicion || this.tieneVehiculo != 0"
                          :counter="15"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="estadoSeleccionado"
                          :items="estados"
                          label="Estado"
                          item-value="id"
                          item-text="nombre"
                          v-validate="'required'"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('estado')"
                          data-vv-name="estado"
                          required
                          @change="selectedEstado"
                          no-data-text="Sin resultados"
                          persistent-hint
                          :hint="warningInactivo"
                        ></v-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>

          <div
            align="center"
            v-show="
              bottomNav == asociarDispositivo.step &&
                ((asociarDispositivo.visible && esEdicion) ||
                  (asociarDispositivoVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md text-xs-center>
                  <v-layout row wrap>
                    <div align="left">
                      <v-flex md12>
                        <h2 class="h2_title">Asociar Dispositivo</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarDispositivoEditar"
                        prepend-icon="person"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px; font-family: Asap, sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnDefs"
                          :rowData="dispositivos"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="5"
                          cacheBlockSize="10000"
                          suppressRowClickSelection="true"
                          supresscopyRowsToClipboard="true"
                          :sideBar="false"
                          :localeText="localeText"
                          :onGridReady="onGridReady"
                          :postProcessPopup="onClickCell"
                          @selection-changed="onSelectionChanged($event)"
                          :getRowNodeId="getRowNodeId"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                        ></ag-grid-vue>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'GPS',
          nombreEntidad: gps.numeroSerie,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { ISim } from '@/interfaces/Sim';
import { IGPS } from '@/interfaces/GPS';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoSim, MarcaGps } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { Snotify, SnotifyType } from 'vue-snotify';
import { ValidarIMEI } from '@/config/validarIMEI.ts';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

import { Dispositivo as DispositivoType } from '../../reusable/Dispositivos/dispositivos';
import { differenceBy } from 'lodash';
import { fetchDispositivos } from '@/reusable/Dispositivos/fetchDispositivos';

import { IGeocerca } from '@/interfaces/Geocerca';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'app-confirmacion': Confirmation,
    'ag-grid-vue': AgGridVue,
  },
})
export default class GPSModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, numeroSIM: '', estado: 0 }) }) gps!: IGPS;
  @Prop({ default: false }) esEdicion!: boolean;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.GPS;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarDispositivo: PermisoAccionVm = {
    accion: 'Editar - Asociar Dispositivo',
    visible: true,
    step: 2,
    codigoSubAccion: 78,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarDispositivoVerDetalle: PermisoAccionVm = {
    accion: 'Editar - Asociar Dispositivo',
    visible: true,
    step: 2,
    codigoSubAccion: 78,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarDispositivo,
    this.informacionGeneralVerDetalle,
    this.asociarDispositivoVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IGPS = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  tiposSim: any = [];
  marcaSeleccionada: any = null;
  modeloSeleccionado: any = null;
  estadoSeleccionado: any = null;
  dialogConfirmacionClose: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosDispositivos: AxiosVue = new AxiosVue(ServicioProxy.Dispositivo);
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  tieneVehiculo: number = 0;
  tieneGeocerca: number = 0;
  tieneSim: number = 0;

  dispositivos: DispositivoType[] = [];
  dispositivoId: any = { listDispositivoId: [] };
  buscarDispositivoEditar: string = '';
  dispositivosAsignados: DispositivoType[] = [];
  listDispositivoIdEdit: number[] = [];
  dispositivosVerDetalle: DispositivoType[] = [];

  //grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  //data
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();
  marcasGps: any = [];
  modelosGps: any = [];

  //Guardar GPS Inactivo
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  //---

  //controllers
  readonly GpsController: string = 'Gps';

  validarIMEI: ValidarIMEI = new ValidarIMEI();

  constructor() {
    super();
    this.registrarValidadores();

    let self = this;

    Validator.extend('IMEI', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* IMEI inválido.';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: self.validarIMEI.validar(value.toString()),
            data: self.validarIMEI.validar(value.toString())
              ? undefined
              : { message: '* IMEI inválido.' },
          });
        });
      },
    });

    this.dictionaryFormErrors = {
      custom: {
        serie: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          numeroSerieUnico: 'Número de serie se encuentra en uso.',
          alpha_num: () =>
            '* El Número de serie solo debe contener números y/o letras.',
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        marca: {
          required: () => config.errorMensajes.textoRequerido,
        },
        modelo: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        imei: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          IMEIUnicoEditar: 'IMEI se encuentra en uso.',
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  initialize() {
    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        width: 120,
        minWidth: 80,
        lockPinned: true,
        resizable: false,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo de Dispositivo',
        field: 'tipoDispositivoText',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'GPS',
        field: 'isGpsText',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
    ];
    if (!this.esEdicion) {
      this.columnDefs.shift();
    }
  }
  onSelectionChanged() {
    this.dispositivosAsignados = this.gridApi.getSelectedRows();
    const dispositivosSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));
    const dispositivosNoSeleccionados = differenceBy(
      this.dispositivos,
      dispositivosSeleccionados,
      dispositivo => dispositivo.id
    ).map(dispositivo => ({
      ...dispositivo,
      checked: false,
    }));

    this.gridApi.updateRowData({
      update: [...dispositivosNoSeleccionados, ...dispositivosSeleccionados],
    });
  }
  getRowNodeId(dispositivo: DispositivoType) {
    if (!dispositivo) {
      return;
    }
    return dispositivo.id;
  }
  onFilterTextBoxChanged() {
    if (this.buscarDispositivoEditar.length > 1) {
      this.gridApi.setQuickFilter(this.buscarDispositivoEditar);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  async mounted() {
    this.initialize();
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.bottomNav = '1';

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    const self = this;
    self.listDispositivoIdEdit = [];
    if (value == true) {
      this.loadingService.showLoading();
      await this.getMarcas();
      await this.getDispositivos();

      await this.axios.http
        .get<IGPS>(`${this.GpsController}/${this.gps.id}`)
        .then(gps => {
          self.listDispositivoIdEdit = gps.data.listDispositivoId;
          self.setSeleccionados();
          self.editedItem = gps.data;
          delete self.editedItem.listDispositivoId;
          self.marcaSeleccionada = gps.data.marca;
          self.estadoSeleccionado = gps.data.estado;

          //Validación
          self.tieneGeocerca = gps.data.gpsCoordenada.length;
          self.tieneSim = gps.data.gpsSims.length;
          self.tieneVehiculo = gps.data.gpsVehiculos.filter(
            (x: any) => x.fechaFinAsociacion === null
          ).length;
          //Valida Mensaje Inicial
          if (self.estadoSeleccionado === EstadoEntidad.Inactivo) {
            if (self.tieneAsociaciones())
              self.warningInactivo = self.$t(
                'mensajes.crud.inactivoAsociado.mensaje'
              );
            else
              self.warningInactivo = self.$t('mensajes.crud.inactivo.mensaje');
            self.guardarInactivo = true;
            self.mensajeConfirmacionInactivo =
              self.warningInactivo +
              ' ' +
              self.$t('mensajes.crud.editar.mensaje', { entidad: 'el GPS' });
          } else {
            this.warningInactivo = '';
            this.guardarInactivo = false;
            this.mensajeConfirmacionInactivo = this.$t(
              'mensajes.crud.editar.mensaje',
              { entidad: 'el GPS' }
            );
          }
          //---

          //recupera marca del gps
          self.axios.http
            .get('gpsModelo/getMarcaFromModelo/' + gps.data.gpsModeloId)
            .then(res => {
              let marca = self.marcasGps.find(
                (x: any) => x.id === res.data.gpsMarcaId
              );
              self.marcaSeleccionada = marca;

              //carga modelos de la marca
              self.axios.http
                .get('gpsModelo/' + marca.id)
                .then(modelos => {
                  self.modelosGps = modelos.data.filter(
                    (x: any) => x.estado === EstadoEntidad.Activo
                  );
                  let modeloSel = self.modelosGps.filter(
                    (x: any) => x.id === gps.data.gpsModeloId
                  );

                  if (modeloSel.length > 0) {
                    self.modeloSeleccionado = modeloSel[0];
                  }
                  this.loadingService.hideLoading();
                })
                .catch(err => {
                  this.loadingService.hideLoading();
                });
            })
            .catch(err => {
              this.loadingService.hideLoading();
            });
        })
        .catch(err => {
          this.loadingService.hideLoading();
          if (err.response !== undefined) {
            if (err.response.status !== 401) {
              this.handleErrors.showError(err);
            }
          } else {
            this.handleErrors.showError(err);
          }
        });
    }
    this.initialize();
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;
    if (!this.esEdicion) {
      accion = 'Ver Detalle';
    }
    this.permisosTotales.forEach(obj => {
      if (obj.visible && obj.accion.includes(accion) && !evaluado) {
        this.bottomNav = obj.step;
        evaluado = true;
      }
    });
  }

  private registrarValidadores() {
    const self = this;
    Validator.extend('IMEIUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* IMEI se encuentra en uso.';
      },
      validate(value: any) {
        return self.axios.http
          .get(
            `${self.GpsController}/${self.editedItem.id}/${value}/ChequearIMEI`
          )
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* IMEI se encuentra en uso.' },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
  }

  grabarEdicion() {
    //grabar
    this.$validator.validateAll().then(gps => {
      if (gps) {
        this.dialogConfirmacion = true;
      }
    });
  }

  closeModal(val: boolean) {
    this.$validator.reset();
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.tieneVehiculo = 0;
    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: 'el GPS',
    });
    this.listDispositivoIdEdit = [];
    this.dispositivosAsignados = [];
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.loadingService.showLoading();
      let he = new HandleErrors();
      this.editedItem.marca = this.marcaSeleccionada;
      this.editedItem.estado = this.estadoSeleccionado;
      this.editedItem.clienteId = this.clienteId;
      this.editedItem.gpsModeloId =
        this.modeloSeleccionado.id !== undefined
          ? this.modeloSeleccionado.id
          : this.modeloSeleccionado;
      await this.Seleccionados();
      this.axios.http
        .put(`${this.GpsController}/`, this.editedItem)
        .then(res => {
          this.axiosDispositivos.http
            .put(`DispositivoGps/${res.data.id}`, this.dispositivoId)
            .then(resp => {})
            .catch(err => {
              this.$snotify.error(
                `Ha ocurrido un error al intentar asociar los dispositivos.`,
                { timeout: 3000 }
              );
            });
          this.loadingService.hideLoading();
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.editar', {
              entidad: 'GPS',
              creadoA: 'editado',
            })
          );
          this.closeModal(false);
          this.dialogConfirmacion = false;
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.editar', {
                  entidad: 'el GPS',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.editar', {
                entidad: 'el GPS',
              })
            );
          }
        });
    }
    this.loadingService.hideLoading();
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async getDispositivos() {
    this.dispositivos = (await this.fetchDispositivos()) || [];
    this.dispositivos = this.dispositivos.filter(
      dispositivo => dispositivo.estado === 1
    );
  }

  async getMarcas() {
    this.axios.http
      .get('gpsMarca')
      .then(res => {
        this.marcasGps = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo
        );
      })
      .catch(err => {
        this.loadingService.hideLoading();
      });
  }

  changeMarca(marca: any) {
    this.modeloSeleccionado = null;
    this.axios.http
      .get('gpsModelo/' + marca)
      .then(res => {
        this.modelosGps = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo
        );
      })
      .catch(err => {
        this.loadingService.hideLoading();
      });
  }

  //########## Guardar GPS Inactivo ##########
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      if (this.tieneAsociaciones())
        this.warningInactivo = this.$t(
          'mensajes.crud.inactivoAsociado.mensaje'
        );
      else this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'el GPS' });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el GPS' }
      );
    }
  }

  tieneAsociaciones() {
    if (
      this.tieneVehiculo === 0 &&
      this.tieneGeocerca === 0 &&
      this.tieneSim === 0
    )
      return false;
    else return true;
  }

  /* Util */
  fetchDispositivos() {
    this.loadingService.showLoading();
    return fetchDispositivos()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los dispositivos.',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }
  async Seleccionados() {
    this.dispositivoId.listDispositivoId = [];
    var seleccionados = this.gridApi.getSelectedNodes();

    for (let i = 0; i < seleccionados.length; i++) {
      this.dispositivoId.listDispositivoId.push(seleccionados[i].data.id);
    }
  }
  setSeleccionados() {
    this.dispositivosVerDetalle = [];
    var seleccionados = this.listDispositivoIdEdit;
    this.gridApi.forEachNode(node => {
      for (let i = 0; i < this.listDispositivoIdEdit.length; i++) {
        if (String(this.listDispositivoIdEdit[i]) == node.id) {
          node.setSelected(true);
          this.dispositivosVerDetalle.push(node.data);
        }
      }
    });
    if (!this.esEdicion) {
      this.dispositivos = this.dispositivosVerDetalle;
    }
  }
  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivGPS').scrollIntoView(true);
        if (this.e1 === this.permisosTotales.length) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
        } else if (this.e1 === this.permisosTotales.length - 1) {
          this.e1 += 1;
          this.btnText = 'Guardar';
          this.btnClass = 'btn-grabar';
        } else {
          this.e1 += 1;
        }
      }
    });
  }
  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivGPS').scrollIntoView(true);
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
.h2_title {
  font-weight: normal;
}
</style>

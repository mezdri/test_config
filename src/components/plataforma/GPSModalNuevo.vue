<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivGPS">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear GPS</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenu()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenu()"
              :disabled="!validForm || btnBloquear"
            >
              <span
                :style="[
                  btnText == 'Guardar'
                    ? { color: 'white' }
                    : { color: 'black' },
                ]"
                >{{ btnText }}</span
              >
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step
              v-show="informacionGeneral.visible"
              :complete="e1 > informacionGeneral.step"
              :step="informacionGeneral.step"
              >Información General</v-stepper-step
            >
            <v-divider v-show="informacionGeneral.visible"></v-divider>
            <v-stepper-step
              v-show="asociarDispositivo.visible"
              :complete="e1 > asociarDispositivo.step"
              :step="asociarDispositivo.step"
              >Asociar Dispositivo</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="informacionGeneral.visible"
              :step="informacionGeneral.step"
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
                              v-validate="
                                'required|max:20|numeroSerieUnico|alpha_num'
                              "
                              v-model="editedItem.numeroSerie"
                              :error-messages="errors.collect('serie')"
                              data-vv-name="serie"
                              label="Nro. Serie"
                              type="text"
                              min="1"
                              :counter="20"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="selectedTipoSim"
                              :items="marcasGps"
                              item-text="nombre"
                              item-value="id"
                              label="Marca de GPS"
                              v-validate="'required'"
                              :error-messages="errors.collect('marca')"
                              data-vv-name="marca"
                              required
                              no-data-text="Sin resultados"
                              @change="changeMarca"
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="selectedModelo"
                              :items="modelosGps"
                              item-text="nombre"
                              item-value="id"
                              label="Modelo de GPS"
                              v-validate="'required'"
                              :error-messages="errors.collect('modelo')"
                              data-vv-name="modelo"
                              no-data-text="Sin resultados"
                              required
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'required|max:15|IMEI|IMEIUnico'"
                              v-model="editedItem.imei"
                              :error-messages="errors.collect('imei')"
                              data-vv-name="imei"
                              label="IMEI"
                              type="text"
                              :counter="15"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              :items="estados"
                              v-model="estadoSeleccionado"
                              label="Estado"
                              item-value="id"
                              item-text="nombre"
                              v-validate="'required'"
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
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarDispositivo.visible"
              :step="asociarDispositivo.step"
            >
              <v-flex xs12 sm12 md12>
                <div align="center">
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
                        <br />
                        <v-layout row wrap>
                          <v-flex md6>
                            <v-text-field
                              v-model="buscarDispositivo"
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
              </v-flex>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'GPS' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { IGPS } from '@/interfaces/GPS';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { ValidarIMEI } from '@/config/validarIMEI';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { LoadingService } from '@/services/loadingService';
import { DispositivoNuevo as DispositivoType } from '@/pantallas/Dispositivos/Dispositivos';
import { fetchDispositivos } from '@/reusable/Dispositivos/fetchDispositivos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

import { IGeocerca } from '@/interfaces/Geocerca';
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Dispositivo } from '../../reusable/Dispositivos/dispositivos';
import { differenceBy } from 'lodash';

@Component({
  components: {
    'app-confirmacion': Confirmation,
    'ag-grid-vue': AgGridVue,
  },
})
export default class GPSModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, numeroSIM: '', estado: 0 }) }) gps!: IGPS;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.GPS;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };
  asociarDispositivo: PermisoAccionVm = {
    accion: 'Crear - Asociar Dispositivo',
    visible: true,
    step: 2,
    codigoSubAccion: 78,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarDispositivo,
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
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  tiposSim: any = [];
  selectedTipoSim: any = null;
  selectedModelo: any = null;
  dialogConfirmacionClose: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosDispositivos: AxiosVue = new AxiosVue(ServicioProxy.Dispositivo);
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;

  dispositivos: DispositivoType[] = [];
  DispositivoId: any = { listDispositivoId: [] };
  buscarDispositivo: string = '';
  dispositivosAsignados: DispositivoType[] = [];

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
  estadoSeleccionado: any = null;

  //Guardar GPS Inactivo
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  //---

  //controllers
  readonly SimController: string = 'Sim';
  readonly GpsController: string = 'Gps';
  readonly GpsSimController: string = 'GpsSim';

  validarIMEI: ValidarIMEI = new ValidarIMEI();

  constructor() {
    super();
    this.registrarValidadores();
  }

  created() {
    this.chequearPermisos();
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
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.marcasGps = [];
    this.modelosGps = [];
    this.$validator.reset();
    if (value) {
      this.loadingService.showLoading();
      this.getMarcas();
      this.getDispositivos();
    }
    this.estadoSeleccionado = EstadoEntidad.Activo; //Estado Activo

    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el GPS',
    });
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

  closeModal(val: boolean) {
    document.getElementById('cardDivGPS').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.selectedTipoSim = null; //Limpiar v-select Tipo Sim
    this.$validator.reset(); //Reset Validaciones
    this.DispositivoId = { listDispositivoId: [] };
    this.dialog = false;
    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el GPS',
    });
  }

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.loadingService.showLoading();
      let he = new HandleErrors();
      this.Seleccionados();
      this.editedItem.id = 0;
      this.editedItem.marca = this.selectedTipoSim;
      this.editedItem.clienteId = this.clienteId;
      this.editedItem.gpsModeloId = this.selectedModelo;
      this.editedItem.estado = this.estadoSeleccionado;

      this.loadingService.showLoading();
      this.axios.http
        .post(`${this.GpsController}/`, this.editedItem)
        .then(res => {
          this.axiosDispositivos.http
            .post(`DispositivoGps/${res.data.id}`, this.DispositivoId)
            .then(resp => {})
            .catch(err => {
              this.$snotify.error(
                `Ha ocurrido un error al intentar asociar los dispositivos.`,
                { timeout: 3000 }
              );
            });
          this.loadingService.hideLoading();
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'GPS',
              creadoA: 'creado',
            })
          );
          this.closeModal(false);
          this.dialogConfirmacion = false;
        })
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'el GPS',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
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
  getMarcas() {
    this.axios.http
      .get('gpsMarca')
      .then(res => {
        this.marcasGps = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo
        );
        this.loadingService.hideLoading();
      })
      .catch(err => {
        this.loadingService.hideLoading();
      });
  }

  changeMarca(marca: any) {
    this.axios.http
      .get('gpsModelo/' + marca)
      .then(res => {
        this.modelosGps = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo
        );
      })
      .catch(err => {});
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
          IMEIUnico: 'IMEI se encuentra en uso.',
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
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
  getRowNodeId(dispositivo: Dispositivo) {
    if (!dispositivo) {
      return;
    }
    return dispositivo.id;
  }
  onFilterTextBoxChanged() {
    if (this.buscarDispositivo.length > 1) {
      this.gridApi.setQuickFilter(this.buscarDispositivo);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('numeroSerieUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Número de serie se encuentra en uso.';
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.GpsController}/0/${self.clienteId}/${value}`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* Número de serie se encuentra en uso.' },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });

    Validator.extend('IMEIUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* IMEI se encuentra en uso.';
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.GpsController}/0/${value}/ChequearIMEI`)
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
  }

  //########## Guardar GPS Inactivo ##########
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', { entidad: 'el GPS' });
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el GPS' }
      );
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    }
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
  Seleccionados() {
    var seleccionados = this.gridApi.getSelectedNodes();

    for (let i = 0; i < seleccionados.length; i++) {
      this.DispositivoId.listDispositivoId.push(seleccionados[i].data.id);
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

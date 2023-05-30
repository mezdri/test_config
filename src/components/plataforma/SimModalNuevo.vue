<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivS">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Crear SIM</v-toolbar-title>
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
              v-show="asociarGps.visible"
              :complete="e1 > asociarGps.step"
              :step="asociarGps.step"
              >Asociar GPS</v-stepper-step
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
                                'required|numeroSimUnico|numeric|max:20'
                              "
                              v-model="editedItem.numeroSIM"
                              :error-messages="errors.collect('numSim')"
                              data-vv-name="numSim"
                              label="Número SIM"
                              :counter="20"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="selectedTipoSim"
                              :items="tiposSim"
                              item-text="nombre"
                              item-value="id"
                              label="Tipo SIM"
                              v-validate="'required'"
                              :error-messages="errors.collect('tipoSim')"
                              data-vv-name="tipoSim"
                              @change="changeTipoSIM"
                              required
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-autocomplete
                              v-model="selectedCia"
                              v-validate="'required|max:20'"
                              :error-messages="errors.collect('cia')"
                              data-vv-name="cia"
                              :items="companiasTelco"
                              color="primary"
                              :clearable="true"
                              item-text="nombre"
                              item-value="id"
                              label="Cía. Telecomunicaciones"
                              no-data-text="Sin resultados"
                              required
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="{
                                max: 11,
                                regex: /^(569)[0-9]\d{7}$/,
                              }"
                              v-model="editedItem.numeroTelefonico"
                              :error-messages="
                                errors.collect('numeroTelefonico')
                              "
                              data-vv-name="numeroTelefonico"
                              label="Teléfono Celular"
                              placeholder="56999999999"
                              type="text"
                              :counter="11"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="selectedEstado"
                              :items="estados"
                              item-text="nombre"
                              item-value="id"
                              label="Estado"
                              v-validate="'required'"
                              :error-messages="errors.collect('estado')"
                              data-vv-name="estado"
                              :disabled="true"
                              v-show="false"
                              required
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
              v-show="asociarGps.visible"
              :step="asociarGps.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar GPS</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarGpsNuevo"
                            @input="onFilterTextBoxChangedGps"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                        <!-- <v-flex md6 style="padding-top:22px">
                          <div align="right">
                            <v-btn flat small color="primary">
                              <v-icon class="btn-asociar-icon" left>cloud_upload</v-icon>
                              <span class="btn-asociar-texto">Asociar desde Archivo</span>
                            </v-btn>
                          </div>
                        </v-flex>-->
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefs"
                              :rowData="gpsRespaldo"
                              rowSelection="single"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReady"
                              :postProcessPopup="onClickCell"
                              suppressCopyRowsToClipboard="true"
                              @selection-changed="onSelectedChangeGps"
                              :getRowNodeId="getRowNodeId"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentGps
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassGps
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'SIM' })"
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: 'la SIM' })"
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
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ISim } from '@/interfaces/Sim';
import { IGPS } from '@/interfaces/GPS';
import { EstadoInterface } from '@/interfaces/Estado';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoSim, MarcaGps } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { LoadingService } from '@/services/loadingService';
import { differenceBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class SimModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, numeroSIM: '', estado: 0 }) }) sim!: ISim;

  //permisos
  funcionalidad: Funcionalidades = Funcionalidades.SIM;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarGps: PermisoAccionVm = {
    accion: 'Crear - Asociar GPS',
    visible: true,
    step: 2,
    codigoSubAccion: 34,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarGps,
  ];

  //controllers
  readonly controllerSim: string = 'Sim';
  readonly controllerGpsSim: string = 'GpsSim';
  readonly controllerGps: string = 'Gps';

  //Variables clase
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ISim = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  tiposSim: any = [];
  selectedTipoSim: any = null;
  dialogConfirmacionClose: boolean = false;
  btnBloquear: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  estados: EstadoInterface[] = [];
  selectedEstado: any = null;
  clienteId: number = config.getClienteSesion();
  companiasTelco: any = [];
  selectedCia: any = [];
  loadingService = new LoadingService();
  buscarGpsNuevo: string = '';

  gpsAsignadosModel: any = [];
  gpsAsignados: IGPS[] = [];
  gpsRespaldo: IGPS[] = [];

  //grilla
  autoGroupColumnDef: any = null;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;

  constructor() {
    super();

    this.registrarValidadores();

    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        lockPinned: true,
        minWidth: 80,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nro. Serie',
        field: 'numeroSerie',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Marca',
        field: 'gpsModelo.gpsMarca.nombre',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Modelo',
        field: 'gpsModelo.nombre',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'IMEI',
        field: 'imei',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   minWidth: 80,
      //   pinned: 'right',
      //   cellRenderer: this.createButtonCell,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.dictionaryFormErrors = {
      custom: {
        cia: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
        },
        tipoSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numeroTelefonico: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          regex: config.errorMensajes.regex,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  created() {
    this.chequearPermisos();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivS').scrollIntoView(true);
  }

  mounted() {
    for (let item in TipoSim) {
      if (!isNaN(Number(item))) {
        let nombre = TipoSim[item];
        this.tiposSim.push({
          id: Number(item),
          nombre: nombre,
        });
      }
    }

    var estadosClass: EstadosService = new EstadosService();
    this.estados = estadosClass.getEstados();
    this.estados.sort(function(vote1, vote2) {
      if (vote1.nombre > vote2.nombre) return 1;
      if (vote1.nombre < vote2.nombre) return -1;
    });
  }

  nombreCompletoGps(gps: any): string {
    return gps.numeroSerie !== undefined
      ? gps.numeroSerie + ' - ' + '(' + gps.gpsModelo.gpsMarca.nombre + ')'
      : '';
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnBloquear = false;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.gpsAsignadosModel = [];
    this.gpsAsignados = [];
    this.gpsRespaldo = [];
    if (value) {
      try {
        this.loadingService.showLoading();
        await this.getGPS();
        this.selectedTipoSim = TipoSim.Nacional; //Tipo Sim Nacional
        await this.cargaInicialTipoSIM(this.selectedTipoSim); //Carga de Compañía
      } catch (err) {
        if (err.response !== undefined) {
          if (err.response.status !== 401) {
            this.handleErrors.showError(err);
          }
        } else {
          this.handleErrors.showError(err);
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }
  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
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

  onGpsChange(gps: any) {
    if (gps !== undefined) {
      if (this.gpsAsignados.length > 0) {
        for (let x = this.gpsAsignados.length - 1; x >= 0; x--) {
          let borrar = true;
          if (this.gpsAsignados[x].id == gps) {
            borrar = false;
          }
          if (borrar) {
            this.gpsAsignados.splice(x, 1);
          }
        }
      }
    } else if (gps === undefined) {
      this.gpsAsignados = []; //Borrado con la "X" del listado de selección
    }
  }

  onGpsInput(gps: any) {
    if (gps !== null && gps !== undefined) {
      let gpsId = this.gpsRespaldo.find(x => x.id == gps);
      this.gpsAsignados = []; //Siempre en 1 solo GPS asignado
      this.gpsAsignados.push(gpsId);
    }
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivS').scrollIntoView(true);
        if (this.e1 === this.permisosActuales.length) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
        } else if (this.e1 === this.permisosActuales.length - 1) {
          this.e1 += 1;
          this.btnText = 'Guardar';
          this.btnClass = 'btn-grabar';
        } else {
          this.e1 += 1;
        }
      }
    });
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('numeroSimUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* SIM se encuentra en uso.';
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.controllerSim}/0/${value}/ChequearSim`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* SIM se encuentra en uso.' },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
  }

  grabarAsociacionesGps(idSimNuevo: number) {
    if (this.gpsAsignados.length > 0) {
      let index = 0;
      let he = new HandleErrors();
      this.gpsAsignados.forEach((gps: any, idx: number) => {
        let model: any = {
          Id: 0,
          GpsId: gps.id,
          SimId: idSimNuevo,
          FechaInicioAsociacion: new Date(),
          FechaFinAsociacion: null,
          UsuarioCreadorId: 0,
          UsuarioModificacionId: null,
          FechaCreacion: new Date(),
          FechaModificacion: null,
        };

        this.axios.http
          .post(this.controllerGpsSim, model)
          .then(res => {
            index = index + 1;
            if (index == this.gpsAsignados.length) {
              this.loadingService.hideLoading();
              this.$snotify.success(
                this.$t('mensajes.mensajesExito.crear', {
                  entidad: 'SIM',
                  creadoA: 'creado',
                })
              );
              this.closeModal(false);
              this.dialogConfirmacion = false;
            }
          })
          .catch(error => {
            this.loadingService.hideLoading();
            this.btnBloquear = false;
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.$snotify.error(
                  'Ocurrió un error al grabar la asociación de GPS.'
                );
              }
            } else {
              this.$snotify.error(
                'Ocurrió un error al grabar la asociación de GPS.'
              );
            }
            throw idx;
          });
      });
    } else {
      this.loadingService.hideLoading();
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.crear', {
          entidad: 'SIM',
          creadoA: 'creado',
        })
      );
      this.closeModal(false);
      this.dialogConfirmacion = false;
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivS').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.buscarGpsNuevo = '';
    this.gridApi.setQuickFilter('');
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.selectedTipoSim = null; //Limpiar v-select Tipo Sim
    this.selectedCia = null; //Limpiar v-select Compañía Telecomunicaciones
    this.$validator.reset(); //Reset Validaciones
    this.dialog = false;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  async getGPS() {
    const res: any = await this.axios.http.get(
      `${this.controllerGps}/${this.clienteId}/GetGpsPorCliente`
    );
    /*res.data = res.data.filter(
      (x: IGPS) =>
        x.estado === EstadoEntidad.Activo && x.clienteId === this.clienteId
    );*/

    res.data = res.data.map((node: any) => ({
      ...node,
      estadoTxt: EstadoEntidad[node.estado],
    }));

    res.data.forEach((item: any) => {
      if (item.gpsSims.length == 0) {
        this.gpsRespaldo.push(item);
      } else {
        let canAdd = item.gpsSims.filter(
          (x: any) => x.fechaFinAsociacion === null
        );
        if (canAdd.length === 0) {
          this.gpsRespaldo.push(item);
        } else if (canAdd[0].simId === this.sim.id) {
          this.gpsRespaldo.push(item);
        }
      }
    });
  }

  changeTipoSIM(tipoSim: number) {
    this.axios.http
      .get(`${this.controllerSim}/${tipoSim}/telcos`)
      .then(res => {
        this.companiasTelco = res.data;
        this.selectedCia = [];
        this.$validator.reset(); //Reset Validaciones
      })
      .catch(err => {
        this.companiasTelco = [];
      });
  }

  async cargaInicialTipoSIM(tipoSim: number) {
    this.axios.http
      .get('sim/' + tipoSim + '/telcos')
      .then(res => {
        this.companiasTelco = res.data;
      })
      .catch(err => {
        this.companiasTelco = [];
      });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.loadingService.showLoading();
      let nombreCia = this.companiasTelco.find(
        (x: any) => x.id === this.selectedCia
      );

      this.btnBloquear = true;
      let he = new HandleErrors();
      this.editedItem.id = 0;
      this.editedItem.tipoSim = this.selectedTipoSim;
      this.editedItem.estado = this.selectedEstado;
      this.editedItem.clienteId = this.clienteId;
      this.editedItem.empresaTelcoId = this.selectedCia;
      this.editedItem.companiaTelecomunicaciones = nombreCia.nombre;
      this.editedItem.estado = EstadoEntidad.Activo;
      this.axios.http
        .post(this.controllerSim, this.editedItem)
        .then(res => {
          this.grabarAsociacionesGps(res.data.id);
        })
        .catch(error => {
          this.loadingService.hideLoading();
          this.btnBloquear = false;
          //this.handleErrors.showError(error);
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'el SIM',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el SIM',
              })
            );
          }
        });
    } else {
      this.btnBloquear = false;
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  createButtonCell(params: any) {
    const item = this.gpsRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', `btnU${params.data.id}`);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerGpsAsignacion(item);
    });

    return eButton;
  }

  removerGpsAsignacion(item: IGPS) {
    for (let i = 0; i < this.gpsAsignados.length; i++) {
      if (this.gpsAsignados[i].id == item.id) {
        this.gpsAsignados.splice(i, 1);
        break;
      }
    }

    if (item !== undefined && item !== null) {
      this.gpsAsignadosModel = null;
    }
  }

  onFilterTextBoxChangedGps() {
    this.gridApi.onFilterChanged();
    // if (this.buscarGpsNuevo.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarGpsNuevo);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }

  onSelectedChangeGps() {
    this.gpsAsignados = this.gridApi.getSelectedRows();
    const gpsSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const gpsNoSeleccionados = differenceBy(
      this.gpsRespaldo,
      gpsSeleccionados,
      gps => gps.id
    ).map(gps => ({
      ...gps,
      checked: false,
    }));
    this.gridApi.updateRowData({
      update: [...gpsNoSeleccionados, ...gpsSeleccionados],
    });
  }
  getRowNodeId(gps: IGPS) {
    if (!gps) {
      return;
    }
    return gps.id;
  }

  isExternalFilterPresentGps(): boolean {
    return true;
  }

  doesExternalFilterPassGps(node: RowNode): boolean {
    if (this.gpsRespaldo.length > 0 && this.buscarGpsNuevo.length > 1) {
      let busqueda = this.buscarGpsNuevo.toLowerCase();
      return (
        node.data.numeroSerie.toLowerCase().includes(busqueda) ||
        node.data.gpsModelo.gpsMarca.nombre.toLowerCase().includes(busqueda) ||
        node.data.gpsModelo.nombre.toLowerCase().includes(busqueda) ||
        node.data.imei.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

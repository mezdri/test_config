<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivCI">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="
              !modalEsVerDetalle
                ? (dialogConfirmacionClose = true)
                : closeModal(false)
            "
            v-on:keydown.enter.prevent
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>{{
            modalEsVerDetalle ? 'Ver Detalle' : 'Compartir Información'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items v-if="!modalEsVerDetalle">
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenu()"
              :disabled="e1 <= 1"
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
        <v-stepper v-model="e1" v-if="!modalEsVerDetalle">
          <v-stepper-header>
            <v-stepper-step
              v-show="cliente.visible"
              :complete="e1 > cliente.step"
              :step="cliente.step"
              >Cliente</v-stepper-step
            >

            <v-divider></v-divider>

            <v-stepper-step
              v-show="informacionCompartir.visible"
              :complete="e1 > informacionCompartir.step"
              :step="informacionCompartir.step"
              >Compartir Información</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="cardnew">
            <v-stepper-content
              v-show="informacionCompartir.visible"
              :step="informacionCompartir.step"
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
                      <v-container grid-list-md text-xs-center>
                        <v-layout row wrap>
                          <div align="left">
                            <v-flex md12>
                              <h2 class="h2_title">Compartir Información</h2>
                            </v-flex>
                          </div>
                        </v-layout>
                        <v-divider></v-divider>

                        <v-layout wrap>
                          <v-flex xs12 md12 lg12 class="estilo-radio">
                            <v-radio-group
                              v-model="radios"
                              row
                              @change="changeTipo"
                            >
                              <v-radio label="Flotas" value="Flotas"></v-radio>
                              <v-radio
                                label="Vehículos"
                                value="Vehículos"
                              ></v-radio>
                            </v-radio-group>
                          </v-flex>
                        </v-layout>

                        <div v-show="tipoCompartirInformacion === 1">
                          <v-layout row wrap>
                            <v-flex md6 class="estilo-buscar">
                              <v-text-field
                                label="Buscar..."
                                v-model="buscarFlotas"
                                @input="onFilterTextBoxChangedFlotas"
                                prepend-icon="commute"
                                append-icon="search"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                          <br />
                          <v-layout row wrap>
                            <v-flex md12>
                              <v-card>
                                <ag-grid-vue
                                  style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                                  class="ag-theme-material"
                                  :columnDefs="columnDefsFlotas"
                                  :rowData="flotasRespaldo"
                                  rowSelection="single"
                                  rowMultiSelectWithClick="false"
                                  pagination="true"
                                  paginationPageSize="10"
                                  suppressRowClickSelection="true"
                                  :sideBar="sideBar"
                                  :localeText="localeText"
                                  :onGridReady="onGridReadyFlotas"
                                  :postProcessPopup="onClickCell"
                                  @selection-changed="onSelectedChangeFlota()"
                                  :getRowNodeId="getRowNodeIdFlota"
                                  suppressCopyRowsToClipboard="true"
                                  :suppressCsvExport="true"
                                  :suppressExcelExport="true"
                                  :suppressNoRowsOverlay="true"
                                  :isExternalFilterPresent="
                                    isExternalFilterPresentFlota
                                  "
                                  :doesExternalFilterPass="
                                    doesExternalFilterPassFlota
                                  "
                                ></ag-grid-vue>
                              </v-card>
                            </v-flex>
                          </v-layout>
                        </div>

                        <div v-show="tipoCompartirInformacion === 2">
                          <v-layout row wrap>
                            <v-flex md6 class="estilo-buscar">
                              <v-autocomplete
                                v-model="etiquetasAsignados"
                                prepend-icon="label"
                                :items="etiquetasRespaldo"
                                color="primary"
                                :clearable="true"
                                item-text="nombre"
                                chips
                                :deletable-chips="true"
                                item-value="id"
                                label="Etiquetas"
                                @change="onEtiquetaChange"
                                no-data-text="Sin resultados"
                                multiple
                              >
                                <template v-slot:selection="{ item, index }">
                                  <v-chip v-if="index === 0">
                                    <span>{{
                                      textoComprimido(item.nombre)
                                    }}</span>
                                  </v-chip>
                                  <span
                                    v-if="index === 1"
                                    class="grey--text caption"
                                    >(+{{
                                      etiquetasAsignados.length - 1
                                    }}
                                    otros)</span
                                  >
                                </template>
                              </v-autocomplete>
                            </v-flex>
                            <v-flex md6 class="estilo-buscar2">
                              <v-text-field
                                label="Buscar..."
                                v-model="buscarVehiculos"
                                @input="onFilterTextBoxChangedVehiculos"
                                prepend-icon="directions_car"
                                append-icon="search"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                          <br />
                          <v-layout row wrap>
                            <v-flex md12>
                              <v-card>
                                <ag-grid-vue
                                  style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                                  class="ag-theme-material"
                                  :columnDefs="columnDefsVehiculosCompartir"
                                  :rowData="vehiculosRespaldo"
                                  rowSelection="multiple"
                                  rowMultiSelectWithClick="false"
                                  pagination="true"
                                  paginationPageSize="10"
                                  suppressRowClickSelection="true"
                                  :sideBar="sideBar"
                                  :localeText="localeText"
                                  :onGridReady="onGridReadyVehiculosCompartir"
                                  :postProcessPopup="onClickCell"
                                  :suppressCsvExport="true"
                                  :suppressExcelExport="true"
                                  @selection-changed="
                                    onSelectedChangeVehiculos()
                                  "
                                  :getRowNodeId="getRowNodeIdVehiculo"
                                  suppressCopyRowsToClipboard="true"
                                  :suppressNoRowsOverlay="true"
                                  :isExternalFilterPresent="
                                    isExternalFilterPresent
                                  "
                                  :doesExternalFilterPass="
                                    doesExternalFilterPass
                                  "
                                ></ag-grid-vue>
                              </v-card>
                            </v-flex>
                          </v-layout>
                        </div>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content v-show="cliente.visible" :step="cliente.step">
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-form
                      ref="form2"
                      v-model="validForm2"
                      lazy-validation
                      class="col-md-12"
                    ></v-form>
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Cliente</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6 class="estilo-buscar">
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarClientes"
                            @input="onFilterTextBoxChangedCliente"
                            prepend-icon="person"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsClientes"
                              :rowData="clientesRespaldo"
                              rowSelection="single"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReadyClientes"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectedChangeCliente()"
                              :getRowNodeId="getRowNodeIdCliente"
                              suppressCopyRowsToClipboard="true"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :suppressNoRowsOverlay="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentCliente
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassCliente
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

        <div v-if="modalEsVerDetalle">
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn color="primary" flat value="1">
                <span>Información</span>
                <v-icon>info</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div align="center" v-show="bottomNav == '1'" class="cardnew">
            <br />
            <div align="center">
              <v-flex md10>
                <v-card class="rounded-card">
                  <v-form
                    ref="form"
                    v-model="validForm"
                    lazy-validation
                    class="col-md-12"
                  >
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Información</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <div align="left">
                        <br />
                        <v-layout row wrap>
                          <v-flex md12>
                            <v-card>
                              <ag-grid-vue
                                style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                                class="ag-theme-material"
                                :columnDefs="columnDefsVerDetalle"
                                :rowData="vehiculosVerDetalle"
                                rowSelection="multiple"
                                rowMultiSelectWithClick="false"
                                pagination="true"
                                paginationPageSize="10"
                                suppressRowClickSelection="true"
                                :sideBar="sideBar"
                                :localeText="localeText"
                                :onGridReady="onGridReadyVehiculosDetalle"
                                :postProcessPopup="onClickCell"
                                :suppressCsvExport="true"
                                :suppressExcelExport="true"
                              ></ag-grid-vue>
                            </v-card>
                          </v-flex>
                          <v-flex md12 v-if="motivoRechazo !== ''">
                            <v-flex md12>
                              <v-textarea
                                name="input-7-1"
                                :label="estadorechazo"
                                :value="motivoRechazo"
                                readonly
                                box
                                :rows="3"
                                :hint="`Usuario: ${usuarioModificador}`"
                                persistent-hint
                              ></v-textarea>
                            </v-flex>
                          </v-flex>
                        </v-layout>
                      </div>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.compartirInformacion.titulo')"
      :mensaje="
        $t('mensajes.crud.compartirInformacion.mensaje', {
          nombre_cliente: nombreCliente,
        })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.compartirInformacion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.compartirInformacion.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>

    <!-- DISPONIBILIDAD ENTIDAD -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaSinEntidad" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Compartir Flota o Vehículos</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text
            >No existe información disponible para compartir con el Cliente
            seleccionado</v-card-text
          >
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="confirmCallbackSinEntidad()">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->

    <!-- SELECCION CLIENTE -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaCliente" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Seleccionar Cliente</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>Debe seleccionar un Cliente</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="confirmCallbackCliente()">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->

    <!-- SELECCION ENTIDAD -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaEntidad" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Seleccionar Flota o Vehículos</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>Debe seleccionar una Flota o Vehículos</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="confirmCallbackEntidad()">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->

    <!-- CAMBIO DE TIPO -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaChangeTipo" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Compartir Información</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text
            >Al cambiar la selección toda la información se perderá. ¿Está
            seguro que desea continuar?</v-card-text
          >
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="white" depressed small @click="closeChangeTipo()">
              <span style="color: #526da5">Cancelar</span>
            </v-btn>
            <v-btn color="#526da5" small @click="confirmCallbackChangeTipo()">
              <span style="color: white;">Continuar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import {
  ServicioProxy,
  EstadoCompartirInformacion,
  EstadoEntidad,
  TipoCompartir,
} from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import store from '@/store';
import { LoadingService } from '@/services/loadingService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { differenceBy } from 'lodash';
import { IClientes } from '../../interfaces/Clientes';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class CompartirInformacionModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0 }) }) _id!: number;
  @Prop({ default: false }) modalEsVerDetalle!: boolean;

  readonly funcionalidad: Funcionalidades =
    Funcionalidades.CompartirInformacion;
  permisosActuales: PermisoAccionVm[] = [];

  cliente: PermisoAccionVm = {
    accion: 'Crear - Cliente',
    visible: true,
    step: 1,
    codigoSubAccion: 28,
    codigoAccionPadre: CodigoAccion.Compartir,
  };

  informacionCompartir: PermisoAccionVm = {
    accion: 'Crear - Compartir información',
    visible: true,
    step: 2,
    codigoSubAccion: 29,
    codigoAccionPadre: CodigoAccion.Compartir,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.cliente,
    this.informacionCompartir,
  ];

  controller: string = 'CompartirInformacion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosUsuarios: AxiosVue = new AxiosVue(ServicioProxy.Auth);

  //Variables globales
  bottomNav: any = '1';
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  validForm2: boolean = false;
  dictionaryFormErrors: any = {};
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  clienteId: number = config.getClienteSesion();
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();
  localeText: any = config.agGridTextos;
  sideBar: any = config.agGridDefaultConfig;
  tipoCompartirInformacion: number = 0;
  radios: string = '';
  motivoRechazo: string = '';
  estadorechazo: string = '';
  usuarioModificador: string = '';
  nombreCliente: string = '';
  idCliente: number = 0;
  idClienteResp: number = 0;
  nombreFlota: string = '';
  idFlota: number = 0;

  gridApiFlotas: GridApi;
  columnApiFlotas: ColumnApi;
  columnDefsFlotas: Array<ColDef> = [];

  gridApiClientes: GridApi;
  columnApiClientes: ColumnApi;
  columnDefsClientes: Array<ColDef> = [];

  gridApiVehiculosDetalle: GridApi;
  columnApiVehiculosDetalle: ColumnApi;
  columnDefsVerDetalle: Array<ColDef> = [];

  gridApiVehiculosCompartir: GridApi;
  columnApiVehiculosCompartir: ColumnApi;
  columnDefsVehiculosCompartir: Array<ColDef> = [];

  showAlertaSinEntidad: boolean = false;
  showAlertaEntidad: boolean = false;
  showAlertaCliente: boolean = false;
  showAlertaChangeTipo: boolean = false;

  buscarClientes: string = '';
  clientesAsignados: any[] = [];
  clientesRespaldo: any[] = [];

  buscarFlotas: string = '';
  flotasAsignados: any[] = [];
  flotasRespaldo: any[] = [];
  flotasRespaldoAll: any[] = [];

  etiquetasAsignados: any = [];
  etiquetasRespaldo: any[] = [];

  buscarVehiculos: string = '';
  vehiculosAsignados: any[] = [];
  vehiculosRespaldo: any[] = [];
  vehiculosRespaldoAll: any[] = [];

  vehiculosVerDetalle: any[] = [];
  compartirInfo: any[] = [];

  mounted() {
    this.chequearPermisos();
    this.initialize();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnBloquear = false; //Se muestra habilitado
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.cleanAll(true);

    if (value) {
      this.loadingService.showLoading();

      try {
        this.bottomNav = '1';
        this.tipoCompartirInformacion = 1;
        this.radios = 'Flotas';

        if (this.modalEsVerDetalle) {
          await this.getVerDetalle();
        } else {
          await this.getClientes();
        }
      } catch (error) {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(error);
          }
        } else {
          this.handleErrors.showError(error);
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  async changeTipo() {
    if (this.radios === 'Vehículos' && this.flotasAsignados.length > 0)
      this.showAlertaChangeTipo = true;
    else if (this.radios === 'Flotas' && this.vehiculosAsignados.length > 0)
      this.showAlertaChangeTipo = true;
    else this.confirmCallbackChangeTipo();
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  onEtiquetaChange(etiqueta: any) {
    this.gridApiVehiculosCompartir.onFilterChanged();
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

  async continuar() {
    if (this.e1 == 1) {
      if (this.clientesAsignados.length > 0) {
        //Si cambia de cliente o es la primera vez, se pierde la seleccion de Flotas o Vehiculos
        if (this.idCliente !== this.idClienteResp) {
          this.cleanAll(false);
          this.tipoCompartirInformacion = 1;
          this.radios = 'Flotas';
          await this.getFlotas();
          await this.getVehiculos();
        }
        //---
        this.e1 = 2;
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
        this.$validator.errors.clear();
        document.getElementById('cardDivCI').scrollIntoView(true);
        if (
          this.flotasRespaldo.length === 0 &&
          this.vehiculosRespaldo.length === 0
        )
          this.showAlertaSinEntidad = true;
      } else {
        this.showAlertaCliente = true;
      }
    } else if (this.e1 == 2) {
      document.getElementById('cardDivCI').scrollIntoView(true);

      if (this.radios === 'Flotas') {
        if (this.flotasAsignados.length > 0) {
          this.dialogConfirmacion = true;
        } else {
          this.showAlertaEntidad = true;
        }
      } else {
        if (this.vehiculosAsignados.length > 0) {
          this.dialogConfirmacion = true;
        } else {
          this.showAlertaEntidad = true;
        }
      }
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivCI').scrollIntoView(true);
    this.btnBloquear = false;
    this.e1 = 1;
    this.cleanAll(true);
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  confirmCallbackSinEntidad() {
    this.showAlertaSinEntidad = false;
    this.volver();
  }

  confirmCallbackEntidad() {
    this.showAlertaEntidad = false;
  }

  confirmCallbackCliente() {
    this.showAlertaCliente = false;
  }

  closeChangeTipo() {
    this.showAlertaChangeTipo = false;
    if (this.radios === 'Flotas') {
      this.tipoCompartirInformacion = 2;
      this.radios = 'Vehículos';
    } else {
      this.tipoCompartirInformacion = 1;
      this.radios = 'Flotas';
    }
  }

  confirmCallbackChangeTipo() {
    this.showAlertaChangeTipo = false;
    this.cleanAll(false);

    if (this.radios === 'Flotas') {
      this.tipoCompartirInformacion = 1;
      this.flotasRespaldo = this.flotasRespaldoAll;
      this.gridApiFlotas.refreshCells({ force: true });
    } else {
      this.tipoCompartirInformacion = 2;
      this.vehiculosRespaldo = this.vehiculosRespaldoAll;
      this.gridApiVehiculosCompartir.refreshCells({ force: true });
    }
  }

  onGridReadyFlotas(params: GridReadyEvent) {
    this.gridApiFlotas = params.api;
    this.columnApiFlotas = params.columnApi;
    //this.gridApiFlotas.sizeColumnsToFit();
  }

  onGridReadyClientes(params: GridReadyEvent) {
    this.gridApiClientes = params.api;
    this.columnApiClientes = params.columnApi;
    //this.gridApiClientes.sizeColumnsToFit();
  }

  onGridReadyVehiculosCompartir(params: GridReadyEvent) {
    this.gridApiVehiculosCompartir = params.api;
    this.columnApiVehiculosCompartir = params.columnApi;
    //this.gridApiVehiculosCompartir.sizeColumnsToFit();
  }

  onGridReadyVehiculosDetalle(params: GridReadyEvent) {
    this.gridApiVehiculosDetalle = params.api;
    this.columnApiVehiculosDetalle = params.columnApi;
    //this.gridApiVehiculosDetalle.sizeColumnsToFit();
  }

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      let he = new HandleErrors();
      this.btnBloquear = true;
      this.loadingService.showLoading();

      let model = this.preparaModel(this.radios);

      this.axios.http
        .post(this.controller, model)
        .then(res => {
          this.compartirInfo = res.data;
          this.enviarCorreos();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          this.btnBloquear = false;
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              he.showError(error);
            }
          } else {
            he.showError(error);
          }
        });
    }
    this.btnBloquear = false;
  }

  preparaModel(tipo: string): any[] {
    let modelBuilder: any = [];
    if (tipo === 'Flotas') {
      let item = {
        Id: 0,
        IdentificadorId: this.idFlota,
        Funcionalidad: TipoCompartir.Flota,
        ClienteComparteId: this.clienteId,
        ClienteAceptacionId: this.idCliente,
        UsuarioComparteId: this.usuarioId,
        Descripcion: '',
        //FechaInicioAsociacion: new Date(),
        EstadoCompartirInformacion:
          EstadoCompartirInformacion.PendienteDeAceptacion,
        Estado: EstadoEntidad.Activo,
        NombreUsuarioComparte:
          this.$store.state.name + ' ' + this.$store.state.lastname,
        NombreMandante: this.nombreCliente,
        IdentificadorNombre: this.nombreFlota,
      };
      modelBuilder.push(item);
    } else {
      this.vehiculosAsignados.forEach((v: any) => {
        let item = {
          Id: 0,
          IdentificadorId: v.id,
          Funcionalidad: TipoCompartir.Vehículo,
          ClienteComparteId: this.clienteId,
          ClienteAceptacionId: this.idCliente,
          UsuarioComparteId: this.usuarioId,
          Descripcion: '',
          //FechaInicioAsociacion: new Date(),
          EstadoCompartirInformacion:
            EstadoCompartirInformacion.PendienteDeAceptacion,
          Estado: EstadoEntidad.Activo,
          NombreUsuarioComparte:
            this.$store.state.name + ' ' + this.$store.state.lastname,
          NombreMandante: this.nombreCliente,
          IdentificadorNombre: v.unidad,
        };
        modelBuilder.push(item);
      });
    }
    return modelBuilder;
  }

  async enviarCorreos() {
    //URL ACEPTAR INFORMACION
    let url: string = '';
    url = window.location.origin + '/aceptarinformacion';
    //---

    let modelEmail: any = [];
    this.compartirInfo.forEach((ci: any) => {
      let itemEmail: any = {
        encodeIdUsuario: '',
        from: '',
        to: '',
        subject: '',
        message: '',
        encodedFechaEnvio: url,
        url: '',
        idEntidad: 0,
        clienteUsuariosId: ci.clienteAceptacionId,
        funcionalidad: ci.funcionalidad,
        identificadorId: ci.identificadorId,
        compartirInformacionId: ci.id,
      };
      modelEmail.push(itemEmail);
    });

    const res: any = await this.axiosUsuarios.http.post(
      `Email/CompartirInformacion`,
      modelEmail
    );

    this.loadingService.hideLoading();
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.compartir', {
        nombre_cliente: this.nombreCliente,
      })
    );
    this.closeModal(false);
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivCI').scrollIntoView(true);
    this.idClienteResp = this.idCliente;
  }

  initialize() {
    this.columnDefsClientes = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
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
        resizable: false,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        minWidth: 80,
        resizable: true,
        sortable: true,
        lockPinned: true,
        lockVisible: true,
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
    ];

    this.columnDefsFlotas = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        lockPinned: true,
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
        pinned: 'left',
        lockPinned: true,
        resizable: false,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        lockVisible: true,
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
    ];

    this.columnDefsVehiculosCompartir = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        lockPinned: true,
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
        pinned: 'left',
        lockPinned: true,
        resizable: false,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        lockVisible: true,
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
        headerName: 'Flota',
        field: 'flota',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
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
        headerName: 'Etiquetas',
        field: 'etiquetasTxt',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
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
    ];

    this.columnDefsVerDetalle = [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        width: 120,
        minWidth: 80,
        pinned: 'left',
        lockPinned: true,
        resizable: false,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo',
        field: 'tipoInformacion',
        resizable: true,
        width: 385,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre Flota',
        field: 'nombreTipoInformacion',
        resizable: true,
        width: 384,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
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
        headerName: 'Unidad', //09-2019: Desarrollo Compartir Información
        field: 'unidad', //09-2019: Desarrollo Compartir Información
        resizable: true,
        width: 384,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        lockVisible: true,
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
    ];
  }

  async getFlotas() {
    try {
      this.loadingService.showLoading();
      this.flotasRespaldo = [];
      const res: any = await this.axios.http.get(
        'flota/cliente/' + this.idCliente + '/compartido/2'
      );
      this.flotasRespaldo = res.data;
      this.flotasRespaldoAll = res.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
    /*finally {
      //this.loadingService.hideLoading();
    }*/
  }

  async getVehiculos() {
    try {
      //this.loadingService.showLoading();
      this.vehiculosRespaldo = [];
      const res: any = await this.axios.http.get(
        'vehiculo/cliente/' + this.idCliente + '/compartido'
      );
      //Se crea EtiquetasTxt
      res.data = res.data.map((x: any) => ({
        ...x,
        etiquetasTxt: x.etiquetas
          .map((x: any) => x.nombre)
          .toString()
          .split(',')
          .join(', '),
      }));
      //---

      this.vehiculosRespaldo = res.data;
      this.vehiculosRespaldoAll = res.data;

      //Obtiene Etiquetas ordenadas Alfabéticamente
      let etiquetasTotales: any = [];
      res.data.forEach((e: any) => {
        if (e.etiquetas.length > 0) {
          e.etiquetas.forEach((z: any) => {
            const existe = etiquetasTotales.find((x: any) => x.id === z.id);
            if (existe === undefined) etiquetasTotales.push(z);
          });
        }
      });

      if (etiquetasTotales.length > 0)
        this.etiquetasRespaldo = etiquetasTotales.sort((x: any, y: any) =>
          x.nombre
            .toLowerCase()
            .localeCompare(y.nombre.toLowerCase(), 'es', { numeric: true })
        );
      //---
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async getClientes() {
    const res: any = await this.axiosCliente.http.get('cliente');
    this.clientesRespaldo = res.data.filter(
      (x: any) => x.estado === EstadoEntidad.Activo && x.id !== this.clienteId
    );
  }

  async getVerDetalle() {
    //1. Obtener el registro del Compartir Información
    const resDetalle: any = await this.axios.http.get(
      `${this.controller}/${this._id}`
    );
    //---

    //2. Si es Tipo Flota, obtener datos de Flota y sus Vehiculos
    if (resDetalle.data.funcionalidad === TipoCompartir.Flota) {
      const resFlota: any = await this.axios.http.get(
        `flota/${resDetalle.data.identificadorId}`
      );
      const resVehiculosFlota: any = await this.axios.http.get(
        `flota/${resDetalle.data.identificadorId}/vehiculo/`
      );

      resVehiculosFlota.data.forEach((element: any) => {
        element.tipoInformacion = TipoCompartir[resDetalle.data.funcionalidad];
        element.nombreTipoInformacion = resFlota.data.nombre;
      });

      this.vehiculosVerDetalle = resVehiculosFlota.data;
    }
    //---

    //3. Si es Tipo Vehículos, obtener datos del Vehículo y su Flota
    if (resDetalle.data.funcionalidad === TipoCompartir.Vehículo) {
      let nombreFlota: string = '';
      let resVehiculo: any = await this.axios.http.get(
        `vehiculo/${resDetalle.data.identificadorId}`
      );

      let resFlotaVeh: any = await this.axios.http.get(
        `vehiculoFlota/${resDetalle.data.identificadorId}/${resDetalle.data.clienteComparteId}/flota`
      );

      if (resFlotaVeh.data !== null && resFlotaVeh.data !== undefined) {
        if (
          resFlotaVeh.data.flotaId !== null &&
          resFlotaVeh.data.flotaId !== undefined
        ) {
          const resFlota: any = await this.axios.http.get(
            `flota/${resFlotaVeh.data.flotaId}`
          );
          nombreFlota = resFlota.data.nombre;
        }
      }

      resVehiculo.data.tipoInformacion =
        TipoCompartir[resDetalle.data.funcionalidad];
      resVehiculo.data.nombreTipoInformacion = nombreFlota;

      this.vehiculosVerDetalle.push(resVehiculo.data);
    }
    //---

    //4. Obtener Motivo al Rechazar, Dejar de Recibir y Dejar de Compartir
    this.usuarioModificador = resDetalle.data.usuarioModificadorNombre;
    let estadoActual = resDetalle.data.estadoCompartirInformacion;

    if (
      estadoActual === EstadoCompartirInformacion.Rechazada ||
      estadoActual === EstadoCompartirInformacion.DejarDeCompartir ||
      estadoActual === EstadoCompartirInformacion.DejarDeRecibir
    ) {
      const resEventos: any = await this.axios.http.get(
        `${this.controller}/${this._id}/getEventosCompartir`
      );
      this.motivoRechazo = resEventos.data[0].descripcion;
      this.estadorechazo =
        estadoActual === EstadoCompartirInformacion.Rechazada
          ? 'Motivo de rechazo por el cliente'
          : estadoActual === EstadoCompartirInformacion.DejarDeCompartir
          ? 'Motivo por el que se deja de compartir'
          : 'Motivo por el que se deja de recibir';
    }
    //---
  }

  onSelectedChangeFlota() {
    this.flotasAsignados = this.gridApiFlotas.getSelectedRows();
    if (this.flotasAsignados.length > 0) {
      this.nombreFlota = this.flotasAsignados[0].nombre;
      this.idFlota = this.flotasAsignados[0].id;
    } else {
      this.nombreFlota = '';
      this.idFlota = 0;
    }

    //Orden de Checks
    const flotasSeleccionados = this.gridApiFlotas
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const flotasNoSeleccionados = differenceBy(
      this.flotasRespaldo,
      flotasSeleccionados,
      flo => flo.id
    ).map(flo => ({
      ...flo,
      checked: false,
    }));
    this.gridApiFlotas.updateRowData({
      update: [...flotasNoSeleccionados, ...flotasSeleccionados],
    });
    //---
  }

  onSelectedChangeCliente() {
    this.clientesAsignados = this.gridApiClientes.getSelectedRows();
    if (this.clientesAsignados.length > 0) {
      this.nombreCliente = this.clientesAsignados[0].nombre;
      this.idCliente = this.clientesAsignados[0].id;
    } else {
      this.nombreCliente = '';
      this.idCliente = 0;
    }

    //Orden de Checks
    const clientesSeleccionados = this.gridApiClientes
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const clientesNoSeleccionados = differenceBy(
      this.clientesRespaldo,
      clientesSeleccionados,
      cli => cli.id
    ).map(cli => ({
      ...cli,
      checked: false,
    }));
    this.gridApiClientes.updateRowData({
      update: [...clientesNoSeleccionados, ...clientesSeleccionados],
    });
    //---
  }

  onSelectedChangeVehiculos() {
    this.vehiculosAsignados = this.gridApiVehiculosCompartir.getSelectedRows();

    //Orden de Checks
    const vehiculosSeleccionados = this.gridApiVehiculosCompartir
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const vehiculosNoSeleccionados = differenceBy(
      this.vehiculosRespaldo,
      vehiculosSeleccionados,
      veh => veh.id
    ).map(veh => ({
      ...veh,
      checked: false,
    }));
    this.gridApiVehiculosCompartir.updateRowData({
      update: [...vehiculosNoSeleccionados, ...vehiculosSeleccionados],
    });
    //---
  }

  onFilterTextBoxChangedFlotas() {
    this.gridApiFlotas.onFilterChanged();
    // if (this.buscarFlotas.length > 1) {
    //   this.gridApiFlotas.setQuickFilter(this.buscarFlotas);
    // } else {
    //   this.gridApiFlotas.setQuickFilter('');
    // }
  }

  onFilterTextBoxChangedCliente() {
    this.gridApiClientes.onFilterChanged();
    // if (this.buscarClientes.length > 1) {
    //   this.gridApiClientes.setQuickFilter(this.buscarClientes);
    // } else {
    //   this.gridApiClientes.setQuickFilter('');
    // }
  }

  onFilterTextBoxChangedVehiculos() {
    this.gridApiVehiculosCompartir.onFilterChanged();
    // if (this.buscarVehiculos.length > 1) {
    //   this.gridApiVehiculosCompartir.setQuickFilter(this.buscarVehiculos);
    // } else {
    //   this.gridApiVehiculosCompartir.setQuickFilter('');
    // }
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 41) {
      retorno = item.substr(0, 40) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehiculos.length > 1) {
      let busqueda = this.buscarVehiculos.toLowerCase();
      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.flota.toLowerCase().includes(busqueda) ||
        node.data.etiquetasTxt.toLowerCase().includes(busqueda)
      );
    }

    if (this.etiquetasAsignados.length > 0) {
      return (
        this.etiquetasAsignados.some(
          (x: any) =>
            node.data.etiquetas.map((x: any) => x.id).indexOf(x) !== -1
        ) === true
      );
    }
    return true;
  }

  cleanAll(all: boolean) {
    if (all) {
      this.buscarClientes = '';
      this.gridApiClientes.setQuickFilter('');
      this.clientesAsignados = [];
      this.clientesRespaldo = [];
      this.etiquetasRespaldo = [];
      this.tipoCompartirInformacion = 1;
      this.vehiculosVerDetalle = [];
      this.motivoRechazo = '';
      this.estadorechazo = '';
      this.usuarioModificador = '';
      this.idCliente = 0;
      this.idClienteResp = 0;
    }
    this.showAlertaSinEntidad = false;
    this.flotasAsignados = [];
    this.flotasRespaldo = [];
    this.vehiculosAsignados = [];
    this.vehiculosRespaldo = [];
    this.etiquetasAsignados = [];
    this.buscarFlotas = '';
    this.buscarVehiculos = '';
    this.gridApiFlotas.setQuickFilter('');
    this.gridApiVehiculosCompartir.setQuickFilter('');
  }

  getRowNodeIdCliente(cliente: any) {
    if (!cliente) {
      return;
    }
    return cliente.id;
  }

  getRowNodeIdFlota(flota: any) {
    if (!flota) {
      return;
    }
    return flota.id;
  }

  getRowNodeIdVehiculo(vehiculo: any) {
    if (!vehiculo) {
      return;
    }
    return vehiculo.id;
  }

  isExternalFilterPresentFlota(): boolean {
    return true;
  }

  doesExternalFilterPassFlota(node: RowNode): boolean {
    if (this.flotasRespaldo.length > 0 && this.buscarFlotas.length > 1) {
      let busqueda = this.buscarFlotas.toLowerCase();
      return node.data.nombre.toLowerCase().includes(busqueda);
    }
    return true;
  }

  isExternalFilterPresentCliente(): boolean {
    return true;
  }

  doesExternalFilterPassCliente(node: RowNode): boolean {
    if (this.clientesRespaldo.length > 0 && this.buscarClientes.length > 1) {
      let busqueda = this.buscarClientes.toLowerCase();
      return node.data.nombre.toLowerCase().includes(busqueda);
    }
    return true;
  }

  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehiculos.length > 1) {
      let busqueda = this.buscarVehiculos.toLowerCase();
      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.flota.toLowerCase().includes(busqueda) ||
        node.data.etiquetasTxt.toLowerCase().includes(busqueda)
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
.estilo-radio {
  padding: 5px 8px 0px 8px !important;
}
.estilo-buscar {
  padding: 0px 8px 8px 8px !important;
}
.estilo-buscar2 {
  padding: 10px 0 8px !important;
}
</style>

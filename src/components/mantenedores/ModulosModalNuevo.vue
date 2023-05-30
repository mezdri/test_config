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

          <v-toolbar-title>Crear Módulo</v-toolbar-title>

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
              :disabled="!validForm || btnBloquear ? true : false"
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
              v-show="asociarAcciones.visible"
              :complete="e1 > asociarAcciones.step"
              :step="asociarAcciones.step"
              >Asociar Acciones</v-stepper-step
            >
            <v-divider
              v-show="
                asociarSubAcciones.visible && CheckSeleccionados.length > 0
              "
            ></v-divider>
            <v-stepper-step
              v-show="
                asociarSubAcciones.visible && CheckSeleccionados.length > 0
              "
              :complete="e1 > asociarSubAcciones.step"
              :step="asociarSubAcciones.step"
              >Asociar Subacciones</v-stepper-step
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
                              v-validate="'required|moduloNombreUnico|max:80'"
                              v-model="editedItem.nombre"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              min="1"
                              :counter="80"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'max:200'"
                              v-model="editedItem.descripcion"
                              :error-messages="errors.collect('descripcion')"
                              data-vv-name="descripcion"
                              label="Descripción"
                              type="text"
                              min="1"
                              :counter="200"
                            ></v-text-field>
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
                                no-data-text="Sin resultados"
                                @change="seleccionarEstado"
                                :hint="warningInactivo"
                                persistent-hint
                              ></v-select>
                            </v-flex>
                            <!-- <v-flex xs12 sm12 md12>
                              <v-switch
                                :label="'Pantalla Principal'"
                                v-model="estadoSwitch"
                                title="Pantalla Principal"
                                color="success"
                              ></v-switch>
                            </v-flex> -->
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarAcciones.visible"
              :step="asociarAcciones.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Acciones</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarAccion"
                            prepend-icon="lock_open"
                            label="Buscar..."
                            append-icon="search"
                            @input="onFilterTextBoxChanged"
                          ></v-text-field>
                        </v-flex>
                        <v-flex md3 style="padding-top:22px"></v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsAcciones"
                              :rowData="AccionesRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadyAcciones"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectionChanged($event)"
                              @row-selected="onRowSelectedAccion($event)"
                              :getRowNodeId="getRowNodeId"
                              :processCellForClipboard="procesarFecha"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentAcciones
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassAcciones
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
            <v-stepper-content
              v-show="asociarSubAcciones.visible"
              :step="asociarSubAcciones.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Subacciones</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-select
                            :items="AccionesPadreCheck"
                            label="Acciones"
                            item-value="id"
                            item-text="nombre"
                            v-model="AccionPadreId"
                            @change="accionesAsignadasChange"
                            no-data-text="Sin resultados"
                          ></v-select>
                        </v-flex>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarSubAccion"
                            prepend-icon="lock_open"
                            label="Buscar..."
                            append-icon="search"
                            @input="onFilterTextBoxChangedSubAcciones"
                          ></v-text-field>
                        </v-flex>
                        <v-flex md3 style="padding-top:22px"></v-flex>
                      </v-layout>

                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsSubAcciones"
                              :rowData="SubAccionesRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadySubAcciones"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectionChangedSubAccion($event)
                              "
                              :getRowNodeId="getRowNodeId"
                              :processCellForClipboard="procesarFecha"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentSubAcciones
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassSubAcciones
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Módulo' })"
      :mensaje="mensajeConfirmacion"
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

    <!-- sin subAcciones-->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaSinSubAcciones" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Seleccionar Subacciones</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text
            >Debe seleccionar al menos una Subacción por Acción</v-card-text
          >
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="confirmCallbackSinSubAcciones()"
            >
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->
  </v-layout>
</template>

<script lang="ts">
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
import Confirmation from '@/components/Confirmation.vue'; //
import { SubAccion } from '../../views/base/VariablesPermisos';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ModulosModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Funcionalidades;
  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
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
    this.informacionGeneral,
    this.asociarAcciones,
    this.asociarSubAcciones,
  ];

  // Globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  warningInactivo: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dictionaryFormErrors: any = {};
  estadoElecto: any = '';
  disabledAccion: boolean = false;
  mensajeConfirmacion: any = '';
  showAlertaSinSubAcciones: boolean = false;
  sinSubAcciones: boolean = false;

  // Grilla
  buscarAccion: string = '';
  buscarSubAccion: string = '';
  gridApiAcciones: GridApi;
  columnApiAcciones: ColumnApi;
  columnDefsAcciones: Array<ColDef> = [];
  gridApiSubAcciones: GridApi;
  columnApiSubAcciones: ColumnApi;
  columnDefsSubAcciones: Array<ColDef> = [];
  localeText = config.agGridTextos;

  //data
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();
  estadoSeleccionado: any = null;
  AccionesRespaldo: any[] = [];
  AccionesAsignados: AccionesInterface[] = [];
  SubAccionesSeleccionadas: any[] = [];
  SubAccionesRespaldo: any[] = [];
  CheckSeleccionados: any[] = [];
  AccionesPadreCheck: any[] = [];
  modeloAccionSubAccion: any[] = [];
  AccionPadreId: any = {};
  estadoSwitch: boolean = false;
  isHome: string = 'No';

  //Interface
  editedItem: IFuncionalidad = {};

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'ModuloAccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  constructor() {
    super();
    this.registrarValidadores();
  }

  created() {
    this.chequearPermisos();
  }

  mounted() {
    this.initialize();
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('moduloNombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Módulo con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controllerModuloAccion}/${0}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message: '* Ya existe un Módulo con este nombre.',
                      },
                });
              });
            })
            .catch(err => {
              return true;
            });
        } else {
          return true;
        }
      },
    });
  }

  initialize() {
    this.generarColumnasGrilla();
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_num: () =>
            '* El Número de serie solo debe contener números y/o letras.',
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_num: () =>
            '* El Número de serie solo debe contener números y/o letras.',
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  generarColumnasGrilla() {
    this.columnDefsAcciones = [
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
        //cellStyle: { textAlign: 'left' },
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
        cellStyle: (x: CellClassParams) =>
          x.data.id === CodigoAccion.Consultar
            ? { textAlign: 'left', 'pointer-events': 'none' }
            : { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        lockVisible: true,
        rowDrag: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        lockPinned: true,
        rowDrag: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        rowDrag: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Subacciones',
        cellRenderer: this.createCheckboxCellSubAccion,
        rowDrag: true,
        enablePivot: false,
        lockPinned: true,
        resizable: true,
        width: 150,
        minWidth: 80,
        sortable: true,
        lockVisible: true,
        cellStyle: {
          textAlign: 'left',
        },
      },
    ];

    this.columnDefsSubAcciones = [
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
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        lockVisible: true,
        rowDrag: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        lockPinned: true,
        rowDrag: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        rowDrag: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.AccionesRespaldo = [];
    this.AccionesAsignados = [];
    this.SubAccionesSeleccionadas = [];
    this.estadoSeleccionado = EstadoEntidad.Activo; //Estado Activo0

    if (value) {
      await this.getAcciones();
    }

    this.gridApiAcciones.forEachNode((node: RowNode) => {
      if (node.data.id == CodigoAccion.Consultar) {
        node.setSelected(true);
      }
    });
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivModulos').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset(); //Reset Validaciones
    this.dialog = false;
    this.warningInactivo = '';
    this.mensajeConfirmacion = '';
    this.buscarAccion = '';
    this.buscarSubAccion = '';
    this.gridApiSubAcciones.setQuickFilter('');
    this.gridApiAcciones.setQuickFilter('');
    this.CheckSeleccionados = [];
    this.AccionesPadreCheck = [];
    this.modeloAccionSubAccion = [];
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.showAlertaSinSubAcciones = false;
    this.sinSubAcciones = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  seleccionarEstado(tipoEstado: any) {
    this.estadoElecto = tipoEstado;

    switch (this.estadoElecto) {
      case 1: // estado Activo
        this.warningInactivo = '';
        this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Módulo',
        });
        this.disabledAccion = false;
        this.btnText = 'Continuar';
        this.btnClass = 'btn-continuar';
        break;

      case 0: // estado Inactivo
        this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
        this.disabledAccion = true;
        break;
    }
  }

  onGridReadyAcciones(params: GridReadyEvent) {
    this.gridApiAcciones = params.api;
    this.columnApiAcciones = params.columnApi;

    params.api.addGlobalListener((type: any, event: any) => {
      if (
        type.indexOf('selectionChanged') >= 0 ||
        type === 'filterChanged' ||
        type === 'sortChanged' ||
        type === 'paginationChanged' ||
        type === 'gridSizeChanged' ||
        type === 'animationQueueEmpty'
      ) {
        this.habilitarCheckSubAcciones();
        this.setCheckSubAcciones();
      }
    });
  }

  onGridReadySubAcciones(params: GridReadyEvent) {
    this.gridApiSubAcciones = params.api;
    this.columnApiSubAcciones = params.columnApi;
  }

  onFilterTextBoxChanged() {
    this.gridApiAcciones.onFilterChanged();

    // if (this.buscarAccion.length > 1) {
    //   this.gridApiAcciones.setQuickFilter(this.buscarAccion);
    // } else {
    //   this.gridApiAcciones.setQuickFilter('');
    // }
  }

  onFilterTextBoxChangedSubAcciones() {
    this.gridApiSubAcciones.onFilterChanged();
    // if (this.buscarSubAccion.length > 1) {
    //   this.gridApiSubAcciones.setQuickFilter(this.buscarSubAccion);
    // } else {
    //   this.gridApiSubAcciones.setQuickFilter('');
    // }
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  getRowNodeId(acc: AccionesInterface) {
    if (!acc) {
      return;
    }
    return acc.id;
  }

  procesarFecha(params: any) {
    if (
      params.column.getColDef().field === 'fechaCreacion' ||
      params.column.getColDef().field === 'fechaModificacion'
    ) {
      return this.$options.filters.formatDate(params.value);
    } else {
      return params.value;
    }
  }

  isExternalFilterPresentAcciones(): boolean {
    return true;
  }

  doesExternalFilterPassAcciones(node: RowNode): boolean {
    if (this.AccionesRespaldo.length > 0 && this.buscarAccion.length > 1) {
      let busqueda = this.buscarAccion.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentSubAcciones(): boolean {
    return true;
  }

  doesExternalFilterPassSubAcciones(node: RowNode): boolean {
    if (
      this.SubAccionesRespaldo.length > 0 &&
      this.buscarSubAccion.length > 1
    ) {
      let busqueda = this.buscarSubAccion.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      document.getElementById('cardDivModulos').scrollIntoView(true);
      if (resultado) {
        this.validarSubAcciones();
        if (this.disabledAccion) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
          this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
          this.mensajeConfirmacion =
            this.warningInactivo +
            ' ' +
            this.$t('mensajes.crud.crear.mensaje', {
              entidad: 'el Módulo',
            });
        } else if (
          this.sinSubAcciones === true &&
          this.e1 === this.permisosActuales.length
        ) {
          this.showAlertaSinSubAcciones = true;
        } else if (this.e1 === this.permisosActuales.length) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
          this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
            entidad: 'el Módulo',
          });
        } else if (
          this.e1 === this.permisosActuales.length - 1 &&
          this.CheckSeleccionados.length === 0
        ) {
          this.btnText = 'Guardar';
          this.btnClass = 'btn-grabar';
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
          this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
            entidad: 'el Módulo',
          });
        } else {
          if (this.CheckSeleccionados.length > 0) {
            this.e1 += 1;
            if (this.e1 == 3) {
              this.btnText = 'Guardar';
              this.btnClass = 'btn-grabar';
            }
          } else {
            this.e1 += 1;
            this.btnText = 'Guardar';
            this.btnClass = 'btn-grabar';
          }
        }
      }
    });
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivModulos').scrollIntoView(true);
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      await this.postModulo();
    }
    this.btnBloquear = false;
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  async getAcciones() {
    try {
      const response = await this.axios.http.get(`${this.controllerAccion}`);
      if (response !== null && response !== undefined) {
        response.data = response.data.map((node: any) => ({
          ...node,
          estadoTxt: EstadoEntidad[node.estado],
          descripcion: node.descripcion === null ? '' : node.descripcion,
        }));
      }
      this.AccionesRespaldo = response.data;
      this.SubAccionesRespaldo = response.data.filter(
        (x: any) => x.id !== CodigoAccion.Consultar
      );
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener acciones.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener acciones.');
      }
    }
  }

  createCheckboxCellSubAccion(params: any) {
    const item = this.AccionesRespaldo.find(x => x.id == params.data.id);

    let eCheck = document.createElement('input');
    eCheck.setAttribute('id', 'btnLSubAccionPrincN' + params.data.id);
    eCheck.setAttribute('role', 'checkbox');
    eCheck.setAttribute('type', 'checkbox');
    eCheck.setAttribute('disabled', 'true');

    eCheck.innerHTML =
      '<div class="v-input--selection-controls__input"><div class="v-input--selection-controls__ripple"></div><i aria-hidden="true" class="v-icon material-icons theme--light">check_box_outline_blank</i></div>';

    eCheck.addEventListener('click', () => {
      this.GuardarCheckSubAcciones(item.id);
    });
    return eCheck;
  }

  async habilitarCheckSubAcciones() {
    this.AccionesRespaldo.forEach((accion: any) => {
      let idCheckbox = `btnLSubAccionPrincN${accion.id}`;
      let c: any = document.getElementById(idCheckbox);
      let existe = this.AccionesAsignados.filter(
        (x: any) => x.id === accion.id
      );
      if (c != undefined) {
        if (existe.length > 0) {
          c.disabled = false;
        } else {
          c.checked = false;
          c.disabled = true;
          this.eliminarCheck(accion.id);
        }
      }
    });

    //accion consultar
    this.AccionesRespaldo.forEach((accion: any) => {
      let idCheckbox = `btnLSubAccionPrincN${accion.id}`;
      let c: any = document.getElementById(idCheckbox);
      let existe = this.AccionesAsignados.filter(
        (x: any) => x.id === accion.id && x.id === CodigoAccion.Consultar
      );
      if (c != undefined) {
        if (existe.length > 0) {
          c.disabled = true;
          c.checked = false;
        }
      }
    });
  }

  async GuardarCheckSubAcciones(id: number) {
    this.AccionesAsignados.forEach((e: AccionesInterface) => {
      if (id === e.id) {
        let idCheckbox = `btnLSubAccionPrincN${e.id}`;
        let c: any = document.getElementById(idCheckbox);
        if (c != null) {
          if (c.checked) {
            this.agregarAccionesPadre(id);
            this.CheckSeleccionados.push(id);
          } else {
            this.removerAccionesPadre(id);
            this.eliminarCheck(id);
          }
        }
      }
    });

    if (this.CheckSeleccionados.length > 0) {
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    } else if (this.CheckSeleccionados.length === 0) {
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    }
  }

  async setCheckSubAcciones() {
    this.AccionesAsignados.forEach((accion: any) => {
      let idCheckbox = `btnLSubAccionPrincN${accion.id}`;
      let c: any = document.getElementById(idCheckbox);

      let existe = this.CheckSeleccionados.filter((x: any) => x === accion.id);
      if (c != undefined) {
        if (existe.length > 0) {
          c.checked = true;
        } else {
          c.checked = false;
        }
      }
    });
  }

  agregarAccionesPadre(idCheck: number) {
    const agregarAccionPadre = this.AccionesAsignados.filter(
      accion => accion.id === idCheck
    )
      .map(node => node)
      .reduce(accion => accion);

    this.AccionesPadreCheck.push(agregarAccionPadre);
    this.AccionesPadreCheck.sort((x, y) => x.nombre.localeCompare(y.nombre));

    if (this.AccionesPadreCheck.length > 0) {
      this.AccionPadreId = this.AccionesPadreCheck[0].id;
    } else {
      this.AccionPadreId = [];
    }
  }

  removerAccionesPadre(idCheck: number) {
    const elementPos = this.AccionesPadreCheck.map(function(x) {
      return x.id;
    }).indexOf(idCheck);

    if (elementPos > -1) {
      this.AccionesPadreCheck.splice(elementPos, 1);
    }

    // grilla SubAcciones
    let vacio: any[] = [];
    this.modeloAccionSubAccion.forEach((x: any) => {
      if (x.moduloId === idCheck) x.subAcciones = vacio;
    });

    if (this.AccionesPadreCheck.length > 0) {
      this.AccionPadreId = this.AccionesPadreCheck[0].id;
      this.accionesAsignadasChange();
    } else {
      this.gridApiSubAcciones.deselectAll();
      this.AccionPadreId = [];
    }
  }

  eliminarCheck(id: number) {
    // elimina checkSubAcciones
    const index = this.CheckSeleccionados.indexOf(id);
    if (index > -1) {
      this.CheckSeleccionados.splice(index, 1);
    }
  }

  removerAccionSeleccionada(id: number) {
    const index = this.modeloAccionSubAccion.findIndex(x => x.moduloId === id);

    if (index > -1) {
      this.modeloAccionSubAccion.splice(index, 1);
    }
  }

  onRowSelectedAccion(event: RowSelectedEvent) {
    let seleccionado = event.node;
    if (seleccionado.isSelected()) {
      let vacio: any[] = [];

      let modeloSubAccion = {
        moduloId: seleccionado.data.id,
        subAcciones: vacio,
      };
      this.modeloAccionSubAccion.push(modeloSubAccion);
    } else {
      this.removerAccionSeleccionada(seleccionado.data.id);
      this.eliminarCheck(seleccionado.data.id);
      this.removerAccionesPadre(seleccionado.data.id);
    }

    if (event.data.id === CodigoAccion.Consultar) {
      event.node.setSelected(true);
    }
  }

  async onSelectionChanged(event: SelectionChangedEvent) {
    this.AccionesAsignados = this.gridApiAcciones
      .getSelectedNodes()
      .map(node => ({ ...node.data }));

    if (this.AccionesAsignados.length === 0) {
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    }
    await this.habilitarCheckSubAcciones();
  }

  async onSelectionChangedSubAccion(event: SelectionChangedEvent) {
    if (this.AccionPadreId > 0) {
      this.SubAccionesSeleccionadas = this.gridApiSubAcciones
        .getSelectedNodes()
        .map(node => ({ ...node.data }));

      let modeloSubAccion = {
        moduloId: this.AccionPadreId,
        subAcciones: this.SubAccionesSeleccionadas,
      };

      let existe = this.modeloAccionSubAccion.filter(
        x => x.moduloId === this.AccionPadreId
      );
      // guarda seleccionados
      if (existe.length > 0) {
        this.modeloAccionSubAccion.forEach((accion: any) => {
          if (accion.moduloId === this.AccionPadreId)
            accion.subAcciones = this.SubAccionesSeleccionadas;
        });
      } else {
        this.modeloAccionSubAccion.push(modeloSubAccion);
      }
    }
  }

  accionesAsignadasChange() {
    this.gridApiSubAcciones.deselectAll();

    const existe = this.modeloAccionSubAccion
      .filter(x => x.moduloId === this.AccionPadreId)
      .map(node => node.subAcciones);

    const self = this;
    // pinta filas seleccionadas previamente
    if (existe.length > 0) {
      this.gridApiSubAcciones.forEachNode((node: RowNode) => {
        let index = existe[0].findIndex((x: any) => x.id === node.data.id);
        if (index !== -1) {
          node.setSelected(true);
        } else {
          node.setSelected(false);
        }
      });
    }
  }

  async postModulo() {
    let model = {
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.estadoSeleccionado,
      PantallaPrincipal: this.estadoSwitch ? 1 : 0, //por defecto false peticion pantalla principal siempre menu
    };

    try {
      const res: any = await this.axios.http.post(`${this.controller}/`, model);
      await this.postAccionSubAcciones(res.data);

      this.$snotify.success(
        this.$t('mensajes.mensajesExito.crear', {
          entidad: 'Módulo',
          creadoA: 'creado',
        })
      );
      this.closeModal(false);
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Modulo' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Modulo' })
        );
      }
    } finally {
      this.btnBloquear = false;
      this.loadingService.hideLoading();
    }
  }

  async postAccionSubAcciones(nuevoModuloId: number) {
    if (this.modeloAccionSubAccion.length > 0) {
      await this.axios.http.post(
        `${this.controllerModuloAccion}/${nuevoModuloId}/postAccionSubAcciones`,
        this.modeloAccionSubAccion
      );
    }
  }

  confirmCallbackSinSubAcciones() {
    this.showAlertaSinSubAcciones = false;
  }

  async validarSubAcciones() {
    this.AccionesPadreCheck.forEach(accionesPadre => {
      let tieneSubAcciones = this.modeloAccionSubAccion.find(
        x => x.moduloId === accionesPadre.id
      );

      if (tieneSubAcciones.subAcciones.length > 0) {
        this.sinSubAcciones = false;
      } else {
        this.sinSubAcciones = true;
      }
    });
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

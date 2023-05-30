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

          <v-toolbar-title>{{
            esEdicion ? 'Editar Módulo' : 'Ver Detalle Módulo'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              @click="grabarEdicion()"
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br /><br /><br />
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn
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
                v-show="
                  (asociarAcciones.visible && esEdicion) ||
                    (asociarAccionesVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="asociarAcciones.step"
              >
                <span>Asociar Acciones</span>
                <v-icon>note_add</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                v-show="
                  (asociarSubAcciones.visible &&
                    esEdicion &&
                    this.CheckSeleccionados.length > 0) ||
                    (asociarSubAccionesVerDetalle.visible &&
                      !esEdicion &&
                      this.CheckSeleccionados.length > 0)
                "
                color="primary"
                flat
                :value="asociarSubAcciones.step"
              >
                <span>Asociar Subacciones</span>
                <v-icon>add_to_photos</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            class="cardnew"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((informacionGeneral.visible && esEdicion) ||
                  (informacionGeneralVerDetalle.visible && !esEdicion))
            "
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
                          label="Código"
                          :counter="80"
                          v-model="editedItem.id"
                          type="text"
                          :disabled="true"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|ModuloNombreUnicoEditar|max:80'"
                          v-model="editedItem.nombre"
                          :error-messages="errors.collect('nombre')"
                          data-vv-name="nombre"
                          label="Nombre"
                          type="text"
                          :counter="80"
                          :disabled="!esEdicion"
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
                          :counter="200"
                          :disabled="!esEdicion"
                        ></v-text-field>
                      </v-flex>
                      <!-- <v-flex xs12 sm12 md12>
                        <v-flex xs12 sm12 md12>
                          <v-switch
                            :label="estadoSwitch ? 'Si' : 'No'"
                            v-model="estadoSwitch"
                            title="Pantalla Principal"
                            color="success"
                          ></v-switch>
                        </v-flex>
                      </v-flex> -->
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == asociarAcciones.step &&
                ((asociarAcciones.visible && esEdicion) ||
                  (asociarAccionesVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Acciones</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        label="Buscar..."
                        v-model="buscarAccion"
                        @input="onFilterTextBoxChanged"
                        prepend-icon="lock_open"
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <br />
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
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
                          :onGridReady="onGridReadyAccionesEditar"
                          :postProcessPopup="onClickCell"
                          :processCellForClipboard="procesarFecha"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          @selection-changed="
                            onSelectionChangedAcciones($event)
                          "
                          @row-selected="onRowSelectedAccion($event)"
                          :getRowNodeId="getRowNodeIdAccion"
                          :singleClickEdit="true"
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
          <div
            align="center"
            v-show="
              bottomNav == asociarSubAcciones.step &&
                ((asociarSubAcciones.visible && esEdicion) ||
                  (asociarSubAccionesVerDetalle.visible && !esEdicion))
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
                        item-value="accionId"
                        item-text="nombre"
                        v-model="AccionPadreId"
                        no-data-text="Sin resultados"
                        @change="accionesAsignadasChange"
                      ></v-select>
                    </v-flex>
                    <v-flex md6>
                      <v-text-field
                        label="Buscar..."
                        v-model="buscarSubAccion"
                        @input="onFilterTextBoxChangedSubAcciones"
                        prepend-icon="lock_open"
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <br />
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
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
                          :onGridReady="onGridReadySubAccionesEditar"
                          :postProcessPopup="onClickCell"
                          :processCellForClipboard="procesarFecha"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          @selection-changed="
                            onSelectionChangedSubAccion($event)
                          "
                          :getRowNodeId="getRowNodeIdSubAccion"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Módulo',
          nombreEntidad: this.editedItem.nombre,
        })
      "
      :mensaje="mensajeConfirmacion"
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
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { EstadoEntidad } from '@/config/enums';
import { differenceBy } from 'lodash';
import {
  AccionesInterface,
  IAccionesPadre,
  ISubAccion,
  IModuloAccionSubAccion,
} from '@/interfaces/Acciones';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
  SelectionChangedEvent,
  CellClassParams,
  RowSelectedEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');
import Confirmation from '@/components/Confirmation.vue'; //
import { TranslateResult } from 'vue-i18n';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ModulosModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  accion!: any;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Funcionalidades;
  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 19,
  };

  asociarAcciones: PermisoAccionVm = {
    accion: 'Editar - Asociar Acciones',
    visible: true,
    step: 2,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 20,
  };

  asociarSubAcciones: PermisoAccionVm = {
    accion: 'Editar - Asociar SubAcciones',
    visible: true,
    step: 3,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 21,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    codigoSubAccion: 19,
  };

  asociarAccionesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Acciones',
    visible: true,
    step: 2,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    codigoSubAccion: 20,
  };

  asociarSubAccionesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar SubAcciones',
    visible: true,
    step: 3,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    codigoSubAccion: 21,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarAcciones,
    this.asociarSubAcciones,
    this.informacionGeneralVerDetalle,
    this.asociarAccionesVerDetalle,
    this.asociarSubAccionesVerDetalle,
  ];

  //propiedades globales
  $snotify: any;
  dialog: boolean = false;
  dialogConfirmacionClose: boolean = false;
  bottomNav: any = '1';
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  validForm: boolean = false;
  dialogConfirmacion: boolean = false;
  loadingService = new LoadingService();
  btnBloquear: Boolean = false;
  warningInactivo: any = '';
  estadoElecto: any = '';
  disabledAccion: boolean = false;
  dialogCambioEstado: boolean = false;
  mensajeConfirmacion: TranslateResult = '';
  showAlertaSinSubAcciones: boolean = false;
  cargaDataGrilla: boolean = false;

  //Interface
  editedItem: IFuncionalidad = {};
  estadoSwitch: boolean = false;

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
  estado: EstadoInterface[] = this.estadosServices.getEstadosVisibles();
  estadoSeleccionado: any = 0;
  AccionesRespaldo: any[] = [];
  AccionesAsignados: AccionesInterface[] = [];
  SubAccionesSeleccionadas: any[] = [];
  SubAccionesRespaldo: AccionesInterface[] = [];
  SubAccionesRespaldoAux: AccionesInterface[] = [];
  CheckSeleccionados: any[] = [];
  AccionSubAccionCargados: IModuloAccionSubAccion[] = [];
  AccionesPadreCheck: any[] = [];
  modeloAccionSubAccion: any[] = [];
  modeloAccionSubAccionAux: any[] = [];
  cantAsignadas: number = 0;
  AccionPadreId: any = {};

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.dialog = value;
    this.AccionesRespaldo = [];
    this.SubAccionesRespaldo = [];
    this.SubAccionesRespaldoAux = [];
    this.AccionesAsignados = [];
    this.SubAccionesSeleccionadas = [];
    this.CheckSeleccionados = [];
    this.AccionesPadreCheck = [];
    this.modeloAccionSubAccion = [];
    this.modeloAccionSubAccionAux = [];
    this.AccionSubAccionCargados = [];
    this.showAlertaSinSubAcciones = false;
    this.estadoSeleccionado = EstadoEntidad.Activo; //Estado Activo
    this.cantAsignadas = 0;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.editedItem = this.accion;
      this.estadoSwitch = false; //this.editedItem.pantallaPrincipal //== 1 ? true : false; //siempre false peticion pantalla principal = menu
      this.estadoSeleccionado = this.editedItem.estado;

      await this.getAccionesEditar();
      await this.getAccionesSubAcciones();
      await this.elementosChequeadosGrilla();
    }

    this.generarColumnasGrilla();

    // mostrar mensaje inactivo
    this.seleccionarEstado(this.editedItem.estado);

    this.gridApiAcciones.forEachNode((node: RowNode) => {
      if (node.data.id == CodigoAccion.Consultar) {
        node.setSelected(true);
      }
    });
  }

  created() {
    this.registrarValidadores();
  }

  mounted() {
    this.initialize();
  }

  onGridReadyAccionesEditar(params: GridReadyEvent) {
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
        if (this.esEdicion) {
          this.habilitarCheckSubAcciones();
          this.setCheckSubAcciones();
        }

        if (!this.esEdicion && this.cargaDataGrilla === true) {
          this.habilitarCheckSubAccionesVerDetalle();
          this.setCheckSubAccionesVerDetalle();
        }
      }
    });
  }

  onGridReadySubAccionesEditar(params: GridReadyEvent) {
    this.gridApiSubAcciones = params.api;
    this.columnApiSubAcciones = params.columnApi;
  }

  onFilterTextBoxChangedSubAcciones() {
    this.gridApiSubAcciones.onFilterChanged();
    // if (this.buscarSubAccion.length > 1) {
    //   this.gridApiSubAcciones.setQuickFilter(this.buscarSubAccion);
    // } else {
    //   this.gridApiSubAcciones.setQuickFilter('');
    // }
  }

  onFilterTextBoxChanged() {
    this.gridApiAcciones.onFilterChanged();

    // if (this.buscarAccion.length > 1) {
    //   this.gridApiAcciones.setQuickFilter(this.buscarAccion);
    // } else {
    //   this.gridApiAcciones.setQuickFilter('');
    // }
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
        sort: 'desc',
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
        sort: 'desc',
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

    if (!this.esEdicion) {
      this.columnDefsAcciones.shift();
      this.columnDefsSubAcciones.shift();
    }
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('ModuloNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Módulo con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controllerModuloAccion}/${self.editedItem.id}/${value}/ChequearNombreUnico`
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

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
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

  closeModal(val: boolean) {
    this.$validator.reset();
    this.editedItem = {};
    document.getElementById('cardDivTV').scrollIntoView(true);
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.btnBloquear = false;
    this.warningInactivo = '';
    this.buscarAccion = '';
    this.buscarSubAccion = '';
    this.cargaDataGrilla = false;
    this.gridApiAcciones.setQuickFilter('');
    this.gridApiSubAcciones.setQuickFilter('');
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  seleccionarEstado(tipoEstado: any) {
    this.estadoElecto = tipoEstado;
    if (this.estadoElecto === 1) {
      this.warningInactivo = '';
      this.mensajeConfirmacion = this.$t('mensajes.crud.editar.mensaje');
      this.disabledAccion = false;
    } else {
      if (this.cantAsignadas > 0) {
        this.warningInactivo = this.$t(
          'mensajes.crud.inactivoAsociado.mensaje'
        );
        this.mensajeConfirmacion =
          this.warningInactivo + ' ' + this.$t('mensajes.crud.editar.mensaje');
      } else {
        this.warningInactivo =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
        this.mensajeConfirmacion =
          this.warningInactivo + ' ' + this.$t('mensajes.crud.editar.mensaje');
      }
      this.disabledAccion = true;
    }
  }

  async getAccionesEditar() {
    this.loadingService.showLoading();
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
      this.SubAccionesRespaldoAux = response.data.filter(
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
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async getAccionesSubAcciones() {
    this.loadingService.showLoading();

    try {
      const response = await this.axios.http.get(
        `${this.controllerModuloAccion}/${this.editedItem.id}/getAccionesModulo`
      );
      this.modeloAccionSubAccion = response.data;
      this.modeloAccionSubAccionAux = response.data;
      this.cantAsignadas = response.data.length;

      this.CheckSeleccionados = this.modeloAccionSubAccion
        .filter(x => x.subAcciones.length > 0)
        .map(x => x.codigo);

      await this.accionesSeleccionadasInicial();
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener acciones.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener acciones.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async accionesSeleccionadasInicial() {
    if (this.esEdicion) {
      // grilla Acciones
      this.gridApiAcciones.forEachNode((node: RowNode) => {
        let index = this.modeloAccionSubAccion.find(
          (x: any) => x.accionId === node.data.id
        );
        if (index !== undefined) {
          node.setSelected(true);
        } else {
          node.setSelected(false);
        }
      });
      //
    }

    this.modeloAccionSubAccion.forEach((accion: any) => {
      if (accion.subAcciones.length > 0) {
        this.AccionesPadreCheck.push(accion);
      }
    });

    this.AccionesPadreCheck.sort((x, y) => x.nombre.localeCompare(y.nombre));

    if (this.AccionesPadreCheck.length > 0) {
      this.AccionPadreId = this.AccionesPadreCheck[0].accionId;
    } else {
      this.AccionPadreId = [];
    }

    // grilla SubAcciones

    const existe = this.modeloAccionSubAccion
      .filter(x => x.accionId === this.AccionPadreId)
      .map(node => node.subAcciones);

    const self = this;
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

    //
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  getRowNodeIdAccion(accionesEditar: AccionesInterface) {
    if (!accionesEditar) {
      return;
    }
    return accionesEditar.id;
  }

  getRowNodeIdSubAccion(subAccionesEditar: AccionesInterface) {
    if (!subAccionesEditar) {
      return;
    }
    return subAccionesEditar.id;
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
      let existe = this.modeloAccionSubAccion.filter(
        (x: any) => x.accionId === accion.id
      );
      if (c != undefined) {
        if (existe.length > 0) {
          c.disabled = false;
        } else {
          c.checked = false;
          c.disabled = true;
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

  async setCheckSubAcciones() {
    this.modeloAccionSubAccion.forEach((accion: any) => {
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

  async habilitarCheckSubAccionesVerDetalle() {
    this.AccionesRespaldo.forEach((accion: any) => {
      let idCheckbox = `btnLSubAccionPrincN${accion.id}`;
      let c: any = document.getElementById(idCheckbox);
      let existe = this.modeloAccionSubAccionAux.filter(
        (x: any) => x.accionId === accion.id
      );
      if (c != undefined) {
        if (existe.length > 0) {
          c.disabled = true;
        } else {
          c.checked = false;
          c.disabled = true;
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

  async setCheckSubAccionesVerDetalle() {
    if (this.modeloAccionSubAccionAux.length > 0) {
      this.modeloAccionSubAccionAux.forEach((accion: any) => {
        if (accion.subAcciones.length > 0) {
          let idCheckbox = `btnLSubAccionPrincN${accion.accionId}`;
          let c: any = document.getElementById(idCheckbox);
          if (c !== null && c !== undefined) {
            c.checked = true;
            c.disabled = true;
          }
        }
      });
    }
  }

  async GuardarCheckSubAcciones(id: number) {
    this.modeloAccionSubAccion.forEach((e: AccionesInterface) => {
      if (id === e.accionId) {
        let idCheckbox = `btnLSubAccionPrincN${e.accionId}`;
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
  }

  agregarAccionesPadre(idCheck: number) {
    const agregarAccionPadre = this.modeloAccionSubAccion
      .filter(accion => accion.accionId === idCheck)
      .map(node => node)
      .reduce(accion => accion);

    this.AccionesPadreCheck.push(agregarAccionPadre);
    this.AccionesPadreCheck.sort((x, y) => x.nombre.localeCompare(y.nombre));

    if (this.AccionesPadreCheck.length > 0) {
      this.AccionPadreId = this.AccionesPadreCheck[0].accionId;
      this.accionesAsignadasChange();
    } else {
      this.AccionPadreId = [];
    }
  }

  removerAccionesPadre(idCheck: number) {
    const elementPos = this.AccionesPadreCheck.map(function(x) {
      return x.accionId;
    }).indexOf(idCheck);

    if (elementPos > -1) {
      this.AccionesPadreCheck.splice(elementPos, 1);
    }

    // grilla SubAcciones
    let vacio: any[] = [];
    this.modeloAccionSubAccion.forEach((x: any) => {
      if (x.accionId === idCheck) x.subAcciones = vacio;
    });

    // this.AccionesPadreCheck.sort((x, y) => x.nombre.localeCompare(y.nombre));
    if (this.AccionesPadreCheck.length > 0) {
      this.AccionPadreId = this.AccionesPadreCheck[0].accionId;
      this.accionesAsignadasChange();
      //
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

    this.modeloAccionSubAccion.forEach(x => {
      if (x.accionId === id) {
        x.subAcciones = [];
      }
    });
  }

  removerAccionSeleccionada(id: number) {
    const index = this.modeloAccionSubAccion.findIndex(x => x.accionId === id);

    if (index > -1) {
      this.modeloAccionSubAccion.splice(index, 1);
    }
  }

  onRowSelectedAccion(event: RowSelectedEvent) {
    let seleccionado = event.node;
    if (seleccionado.isSelected()) {
      let vacio: any[] = [];
      let modeloSubAccion = {
        accionId: seleccionado.data.id,
        nombre: seleccionado.data.nombre,
        subAcciones: vacio,
      };

      let existe = this.modeloAccionSubAccion.find(
        x => x.accionId === seleccionado.data.id
      );

      if (existe === undefined) {
        this.modeloAccionSubAccion.push(modeloSubAccion);
      }
    } else {
      this.removerAccionSeleccionada(seleccionado.data.id);
      this.eliminarCheck(seleccionado.data.id);
      this.removerAccionesPadre(seleccionado.data.id);
    }

    if (event.data.id === CodigoAccion.Consultar) {
      event.node.setSelected(true);
    }
  }

  async onSelectionChangedAcciones(event: SelectionChangedEvent) {
    this.AccionesAsignados = this.gridApiAcciones
      .getSelectedNodes()
      .map(node => ({ ...node.data }));

    const funcionalidadSeleccionados = this.gridApiAcciones
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const funcionalidadNoSeleccionados = differenceBy(
      this.AccionesRespaldo,
      funcionalidadSeleccionados,
      func => func.id
    ).map(func => ({
      ...func,
      checked: false,
    }));

    this.gridApiAcciones.updateRowData({
      update: [...funcionalidadNoSeleccionados, ...funcionalidadSeleccionados],
    });

    if (this.AccionesAsignados.length === 0) {
      this.gridApiSubAcciones.deselectAll();
      this.AccionPadreId = [];
    }

    await this.habilitarCheckSubAcciones();
  }

  async onSelectionChangedSubAccion(event: SelectionChangedEvent) {
    if (this.AccionPadreId > 0 && this.esEdicion) {
      this.SubAccionesSeleccionadas = this.gridApiSubAcciones
        .getSelectedNodes()
        .map(node => ({ ...node.data }));

      let modeloSubAccion = {
        accionId: this.AccionPadreId,
        subAcciones: this.SubAccionesSeleccionadas,
      };

      const funcionalidadSeleccionados = this.gridApiSubAcciones
        .getSelectedNodes()
        .map(node => ({ ...node.data, checked: true }));

      const funcionalidadNoSeleccionados = differenceBy(
        this.SubAccionesRespaldo,
        funcionalidadSeleccionados,
        func => func.id
      ).map(func => ({
        ...func,
        checked: false,
      }));

      this.gridApiSubAcciones.updateRowData({
        update: [
          ...funcionalidadNoSeleccionados,
          ...funcionalidadSeleccionados,
        ],
      });

      let existe = this.modeloAccionSubAccion.filter(
        x => x.accionId === this.AccionPadreId
      );

      // guarda seleccionados
      if (existe.length > 0) {
        this.modeloAccionSubAccion.forEach((accion: any) => {
          if (accion.accionId === this.AccionPadreId)
            accion.subAcciones = this.SubAccionesSeleccionadas;
        });
      } else {
        this.modeloAccionSubAccion.push(modeloSubAccion);
      }
    }
  }

  accionesAsignadasChange() {
    if (this.esEdicion) {
      this.gridApiSubAcciones.deselectAll();
      const existe = this.modeloAccionSubAccion
        .filter(x => x.accionId === this.AccionPadreId)
        .map(node => node.subAcciones);
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

    if (!this.esEdicion) {
      const existeVerDetalle = this.modeloAccionSubAccion
        .filter(x => x.accionId === this.AccionPadreId)
        .flatMap(node => node.subAcciones);

      let subAccionModulo: AccionesInterface[] = [];
      if (existeVerDetalle.length > 0) {
        this.SubAccionesRespaldoAux.forEach(subAccion => {
          let tiene = existeVerDetalle.find((x: any) => x.id === subAccion.id);
          if (tiene !== undefined && tiene !== null) {
            subAccionModulo.push(subAccion);
          }
        });
      }
      this.SubAccionesRespaldo = subAccionModulo;
    }
  }

  confirmCallbackSinSubAcciones() {
    this.showAlertaSinSubAcciones = false;
  }

  async grabarEdicion() {
    const responseValidacion: boolean = await this.$validator.validateAll();
    // this.seleccionarEstado(this.editedItem.estado);
    if (responseValidacion) {
      if (
        this.SubAccionesSeleccionadas.length === 0 &&
        this.CheckSeleccionados.length > 0
      ) {
        this.bottomNav = this.asociarSubAcciones.step;
        this.showAlertaSinSubAcciones = true;
      } else {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    }
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      try {
        this.loadingService.showLoading();
        const resultadoValidacion = await this.$validator.validateAll();

        if (resultadoValidacion) {
          this.btnBloquear = true;
          await this.putModulo();
          if (this.editedItem.estado === 1) {
            await this.putModuloAccionSubAccion();
          }
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
        }
      } catch (e) {
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
        this.loadingService.hideLoading();
      } finally {
        this.btnBloquear = false;
        this.closeModal(false);
        this.loadingService.hideLoading();
      }
    }

    this.btnBloquear = false;
  }

  async putModulo() {
    let modelModulo = {
      Id: this.editedItem.id,
      Nombre: this.editedItem.nombre,
      Descripcion: this.editedItem.descripcion,
      Estado: this.editedItem.estado,
      PantallaPrincipal: false, // this.estadoSwitch ? 1 : 0, siempre false, peticion para pantalla principal menu
    };

    await this.axios.http.put(`${this.controllerModuloAccion}/`, modelModulo);
  }

  async putModuloAccionSubAccion() {
    let modelAccionSubAccion = this.modeloAccionSubAccion;

    await this.axios.http.put(
      `${this.controllerModuloAccion}/${this.editedItem.id}/PutModulo`,
      modelAccionSubAccion
    );
  }

  async eliminarAsociaciones() {
    await this.axios.http.delete(
      `${this.controllerModuloAccion}/${this.editedItem.id}`
    );
  }

  async elementosChequeadosGrilla() {
    if (!this.esEdicion) {
      this.cargaDataGrilla = true;
      this.AccionesRespaldo = this.modeloAccionSubAccionAux;

      await this.setCheckSubAccionesVerDetalle();
      this.accionesAsignadasChange();
    }
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

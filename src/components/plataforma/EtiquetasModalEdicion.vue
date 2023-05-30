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
          <v-btn icon dark @click="cerrarOperacion()" :disabled="btnBloquear">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{
            esEdicion ? 'Editar Etiqueta' : 'Ver Detalle Etiqueta'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear"
              @click="grabarEdicion()"
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
                  (asociarVehiculos.visible && esEdicion) ||
                    (asociarVehiculosVerDetalle.visible && !esEdicion)
                "
                :value="asociarVehiculos.step"
              >
                <span>Asociar Vehículos</span>
                <v-icon>drive_eta</v-icon>
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
                          style="margin-top: 12px!important; font-weight: normal"
                        >
                          Información General
                        </h2>
                      </v-flex>
                    </div>
                    <v-divider></v-divider>
                    <br />
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.id"
                          label="Código"
                          disabled
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.nombre"
                          label="Nombre"
                          v-validate="
                            'required|max:80|etiquetaNombreUnicoEditar'
                          "
                          :counter="80"
                          :error-messages="errors.collect('nombre')"
                          data-vv-name="nombre"
                          type="text"
                          :disabled="!esEdicion"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.descripcion"
                          label="Descripción"
                          v-validate="'required|max:50'"
                          :counter="50"
                          :error-messages="errors.collect('descripcion')"
                          data-vv-name="descripcion"
                          type="text"
                          :disabled="!esEdicion"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-autocomplete
                          v-model="estadoSeleccionado"
                          :items="estado"
                          color="primary"
                          item-text="nombre"
                          item-value="id"
                          label="Estado"
                          v-validate="'required'"
                          :error-messages="errors.collect('estado')"
                          data-vv-name="estado"
                          required
                          :disabled="!esEdicion"
                          @change="selectedEstado"
                          no-data-text="Sin resultados"
                          persistent-hint
                          :hint="warningInactivo"
                        ></v-autocomplete>
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
              bottomNav == asociarVehiculos.step &&
                ((asociarVehiculos.visible && esEdicion) ||
                  (asociarVehiculosVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Vehículos</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarVehiculo"
                        prepend-icon="directions_car"
                        @input="onFilterTextBoxChanged"
                        label="Buscar..."
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                    <!-- <v-flex md3 v-show="this.muestraVehiculo">
                      <div align="right">
                        <v-btn
                          v-if="!seleccionoTodos"
                          color="primary"
                          @click="marcarTodosVehiculos(true)"
                        >Seleccionar Todos</v-btn>
                        <v-btn
                          v-else-if="seleccionoTodos"
                          color="primary"
                          @click="marcarTodosVehiculos(false)"
                        >Deseleccionar Todos</v-btn>
                      </div>
                    </v-flex>-->
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
                          style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnVehiculosDefs"
                          :rowData="vehiculosRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="false"
                          :localeText="localeText"
                          :onGridReady="onGridReady"
                          :postProcessPopup="onClickCell"
                          @selection-changed="onSelectionChanged($event)"
                          :getRowNodeId="getRowNodeId"
                          suppressCopyRowsToClipboard="true"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentVehiculo
                          "
                          :doesExternalFilterPass="
                            doesExternalFilterPassVehiculo
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
          entidad: 'Etiqueta',
          nombreEntidad: editedItem.nombre,
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
import moment from 'moment';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { EstadoEntidad } from '@/config/enums';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { IVehiculo, IVehiculoEtiquetaVehiculo } from '@/interfaces/Vehiculos';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { LoadingService } from '@/services/loadingService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { Validator } from 'vee-validate';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { differenceBy } from 'lodash';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class EtiquetasModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  etiquetas!: IEtiqueta;

  readonly controllerVehiculoEtiquetaVehiculo: string =
    'VehiculoEtiquetaVehiculo';
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerVehiculoEtiqueta: string = 'VehiculoEtiqueta';

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.EtiquetaVehiculos;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarVehiculos: PermisoAccionVm = {
    accion: 'Editar - Asociar Vehículos',
    visible: true,
    step: 2,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarVehiculosVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Vehículos',
    visible: true,
    step: 2,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarVehiculos,
    this.informacionGeneralVerDetalle,
    this.asociarVehiculosVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IEtiqueta = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  clienteId: number = config.getClienteSesion();
  asignados: any = [];
  loadingService = new LoadingService();
  etiquetasVehiculo: IVehiculoEtiquetaVehiculo[] = [];
  search: string = '';
  buscarVehiculo: string = '';
  //ASOCIACIONES -------------------------------------------------------------------------------------

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosAsignadosResp: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  seleccionoTodos: boolean = true;
  muestraVehiculo: boolean = false;
  variableMensaje: string = '';
  //SELECT--------------------------------------------------------------------------------------------
  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();
  estadoSeleccionado: any = 0;

  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  columnVehiculosDefs: Array<ColDef> = [];
  localeText: any = config.agGridTextos;
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  nombreRespaldo: any = '';
  descRespaldo: any = '';
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;

  btnBloquear: Boolean = false;
  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  //Guardar Etiqueta Inactivo
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  //---

  created() {
    this.registrarValidadores();
  }

  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  marcarTodosVehiculos(value: boolean) {
    this.vehiculosAsignadosModel = [];
    this.vehiculosAsignados = [];
    if (value) {
      this.vehiculosRespaldo.forEach((veh: any) => {
        this.vehiculosAsignadosModel.push(veh.id);
        this.vehiculosAsignados.push(veh);
        veh.selected = true;
      });
    } else {
      this.vehiculosRespaldo.forEach((veh: any) => {
        veh.selected = false;
      });
    }
    this.seleccionoTodos = value;
  }

  initialize() {
    this.columnVehiculosDefs = [
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
        resizable: true,
        sortable: true,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        field: 'esCompartido',
        headerName: '',
        width: 70,
        cellRenderer: this.createButtonCellVehiculoAlerta,
        enablePivot: false,
        resizable: true,
        lockPinned: true,
        sortable: true,
        minWidth: 80,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
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
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'VIN',
        field: 'vin',
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
        headerName: 'Unidad',
        field: 'unidad',
        width: 200,
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
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
        headerName: 'Referencia',
        field: 'referencia',
        width: 200,
        minWidth: 80,
        lockPinned: true,
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
      {
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
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
        headerName: 'Tipo Peaje',
        field: 'tipoPeaje',
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
        field: 'modelo',
        resizable: true,
        lockPinned: true,
        sortable: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Año',
        field: 'ano',
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Combustible',
        field: 'tipoCombustible',
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
        headerName: 'Tipo Transmisión',
        field: 'tipoTransmision',
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
        headerName: 'Nro. Motor',
        field: 'numeroMotor',
        lockPinned: true,
        resizable: true,
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
    ];

    //this.getVehiculos();
    // this.setRemoveButton();

    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    this.estadoSeleccionado = this.editedItem.estado;

    if (!this.esEdicion) {
      this.columnVehiculosDefs.shift();
    }
  }

  textoVehiculo(item: any) {
    let retorno: string = '';
    if (item !== undefined && item !== null) {
      if (item.patente !== null && item.patente !== '') retorno = item.patente;
      else if (item.vin !== null && item.vin !== '') retorno = item.vin;
    }
    return retorno;
  }

  mounted() {
    this.initialize();
  }

  private registrarValidadores(): void {
    const self = this;
    Validator.extend('etiquetaNombreUnicoEditar', {
      getMessage() {
        return '* Ya existe una Etiqueta con este nombre.';
      },
      validate(value: any) {
        const etiquetaId = self.etiquetas.id;
        if (value !== '') {
          return self.axContextoVehiculo.http
            .get(
              `${
                self.controllerVehiculoEtiqueta
              }/${etiquetaId}/${config.getClienteSesion()}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : { message: '* Ya existe una Etiqueta con este nombre.' },
                });
              });
            })
            .catch(() => {
              return true;
            });
        } else {
          return true;
        }
      },
    });
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar';
    this.editedItem = this.etiquetas;
    this.bottomNav = '1';

    this.vehiculosAsignadosModel = [];
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosResp = [];
    this.nombreRespaldo = this.editedItem.nombre;
    this.descRespaldo = this.editedItem.descripcion;

    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: 'la Etiqueta',
    });

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();

      try {
        await this.getVehiculos();
        // await this.setEtiquetaVehiculos();
        this.setSeleccionadosSelect();
        // this.setRemoveButton();
        this.seleccionoTodos = false;
        this.loadingService.hideLoading();

        const self = this;
        this.gridApi.forEachNode(function(node: any) {
          var index = self.vehiculosAsignados.findIndex(
            x => x.id == node.data.id
          );
          if (index !== -1) {
            node.setSelected(true);
            self.contadorEventoGrilla++;
          }
        });

        this.initialize();

        this.gridApi.refreshCells({ force: true });
      } catch (e) {
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.handleErrors.showError(e);
          }
        } else {
          this.handleErrors.showError(e);
        }
        this.loadingService.hideLoading();
      } finally {
        this.loadingService.hideLoading();
      }
    }
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
  seteaAsignadosVerDetalle() {
    if (!this.esEdicion) {
      this.vehiculosRespaldo = this.vehiculosAsignados;
    }
  }

  async changeVehiculo(vehiculo: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (vehiculo !== undefined) {
      let asignado: any = this.vehiculosAsignados.filter(
        (x: any) => x.id === vehiculo.id
      );
      if (asignado.length > 0) {
        for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
          if (this.vehiculosAsignados[i].id === vehiculo.id) {
            this.vehiculosAsignados[i].selected = false;
            this.vehiculosAsignados.splice(i, 1);
            break;
          }
        }

        for (let i = this.vehiculosAsignadosModel.length - 1; i >= 0; i--) {
          if (this.vehiculosAsignadosModel[i] === vehiculo.id) {
            this.vehiculosAsignadosModel.splice(i, 1);
            break;
          }
        }
      } else {
        this.vehiculosAsignados.push(vehiculo);
        this.vehiculosAsignadosModel.push(vehiculo.id);

        for (let i: number = 0; i <= this.vehiculosAsignados.length - 1; i++) {
          if (this.vehiculosAsignados[i].id === vehiculo.id) {
            this.vehiculosAsignados[i].selected = true;
            break;
          }
        }
      }
    }
    if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length)
      this.seleccionoTodos = true;
    else this.seleccionoTodos = false;
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

  onClearVehiculos() {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    for (let i = this.vehiculosAsignados.length - 1; i >= 0; i--) {
      this.vehiculosAsignados[i].selected = false;
      this.vehiculosAsignados.splice(i, 1);
    }

    for (let i = this.vehiculosAsignadosModel.length - 1; i >= 0; i--) {
      this.vehiculosAsignadosModel.splice(i, 1);
    }
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.buscarVehiculo = '';
    this.gridApi.setQuickFilter('');
    this.gridApi.resetQuickFilter();
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
    this.warningInactivo = '';
    this.contadorEventoGrilla = 0;
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: 'la Etiqueta',
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  //FUNCIONES ---------------------------------------------------------------
  formatDate(fecha: Date): string {
    if (!fecha) return null;
    return moment(fecha).format('DD/MM/YYYY');
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  setSeleccionadosSelect() {
    this.estadoSeleccionado = this.editedItem.estado;
    if (this.estadoSeleccionado === EstadoEntidad.Inactivo) {
      if (this.tieneAsociaciones())
        this.warningInactivo = this.$t(
          'mensajes.crud.inactivoAsociado.mensaje'
        );
      else this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'la Etiqueta' });
    }
  }

  // async setEtiquetaVehiculos() {
  //   if (this.editedItem.id != undefined) {
  //     const res: any = await this.axContextoVehiculo.http.get(
  //       `${this.controllerVehiculoEtiquetaVehiculo}/${this.editedItem.id}/vehiculos/`
  //     );
  //     this.etiquetasVehiculo = res.data;

  //     this.etiquetasVehiculo.forEach((cv: any) => {
  //       this.vehiculosAsignados.push(
  //         this.vehiculosRespaldo.find(x => x.id == cv.vehiculoId)
  //       );
  //       this.vehiculosAsignadosModel.push(cv.vehiculoId);
  //     });
  //     this.vehiculosAsignadosResp = Object.assign([], this.vehiculosAsignados);
  //   }
  // }

  // createButtonCellVehiculos(params: any) {
  //   let evento = this.removerVehiculosAsignacion;
  //   const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

  //   let eButton = document.createElement('button');
  //   eButton.setAttribute('id', 'btnLic' + params.data.id);
  //   eButton.setAttribute('title', 'Remover');

  //   if (this.esEdicion) {
  //     eButton.setAttribute(
  //       'class',
  //       'v-btn v-btn--flat v-btn--icon theme--light'
  //     );
  //   } else {
  //     eButton.setAttribute('disabled', 'true');
  //     eButton.setAttribute(
  //       'class',
  //       'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
  //     );
  //   }

  //   eButton.innerHTML =
  //     '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

  //   eButton.addEventListener('click', function() {
  //     evento(item);
  //   });

  //   return eButton;
  // }

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.cierraMenu();
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    });
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      const res: any = await this.$validator.validateAll();
      if (res) {
        this.loadingService.showLoading();

        try {
          if (this.guardarInactivo) {
            this.vehiculosAsignados = [];
            this.vehiculosAsignadosModel = [];
          }

          this.btnBloquear = true;
          await this.actualizacionEtiquetas();
          await this.actualizacionVehiculos();

          this.closeSuccess();
        } catch (e) {
          this.loadingService.hideLoading();
          if (e.response !== undefined) {
            if (e.response.status !== 401) {
              this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
            }
          } else {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } finally {
          this.btnBloquear = false;
          this.loadingService.hideLoading();
        }
      }
    }
    this.btnBloquear = false;
  }

  async getVehiculos() {
    this.vehiculosRespaldo = [];
    let resActivos: any[] = [];

    //05-05-2020: [Entrega3 - B559] Etiquetas - Crear/Editar
    const res: any = await this.axContextoVehiculo.http.get(
      `${this.controllerVehiculo}/${this.clienteId}/getVehiculosParaEtiquetas`
    );

    resActivos = res.data;

    if (this.editedItem.id != undefined) {
      const resA: any = await this.axContextoVehiculo.http.get(
        `${this.controllerVehiculoEtiquetaVehiculo}/${this.editedItem.id}/vehiculos/`
      );

      resActivos.forEach((vehiculo: any) => {
        const et: any = resA.data.find(
          (x: any) => x.vehiculoId === vehiculo.id
        );
        if (et !== undefined) {
          vehiculo.selected = true;
        } else {
          vehiculo.selected = false;
        }
      });

      this.vehiculosRespaldo = resActivos;
      this.etiquetasVehiculo = resA.data;
      this.vehiculosAsignados = [];

      this.etiquetasVehiculo.forEach((cv: any) => {
        let vehAsig: any = this.vehiculosRespaldo.find(
          x => x.id == cv.vehiculoId
        );
        if (vehAsig !== undefined) {
          this.vehiculosAsignados.push(vehAsig);
          this.vehiculosAsignadosModel.push(cv.vehiculoId);
        }
      });
      this.vehiculosAsignadosResp = Object.assign([], this.vehiculosAsignados);
    } else {
      this.vehiculosRespaldo = resActivos;
    }

    this.vehiculosRespaldo.forEach(veh => {
      let exists: any = this.vehiculosAsignados.filter(
        (x: any) => x.id === veh.id
      );
      if (exists.length == 0) {
        veh.checked = false;
      } else {
        veh.checked = true;
      }
    });
    await this.seteaAsignadosVerDetalle();
  }

  removerVehiculosAsignacion(item: IVehiculo) {
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      if (this.vehiculosAsignados[i].id == item.id) {
        this.vehiculosAsignados[i].selected = false;
        this.vehiculosAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.vehiculosAsignadosModel.length - 1; i++) {
      if (this.vehiculosAsignadosModel[i] == item.id) {
        this.vehiculosAsignadosModel.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
      if (this.vehiculosRespaldo[i].id == item.id) {
        this.vehiculosRespaldo[i].selected = false;
        break;
      }
    }
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  async actualizacionEtiquetas() {
    let model = {
      id: this.editedItem.id,
      nombre: this.etiquetas.nombre,
      descripcion: this.etiquetas.descripcion,
      clienteId: this.clienteId,
      estado: this.estadoSeleccionado,
    };
    await this.axContextoVehiculo.http.put(
      `${this.controllerVehiculoEtiqueta}/`,
      model
    );
  }
  async actualizacionEtiquetasEstado() {
    let model = {
      id: this.editedItem.id,
      nombre: this.nombreRespaldo,
      descripcion: this.descRespaldo,
      clienteId: this.clienteId,
      estado: this.estadoSeleccionado,
    };
    await this.axContextoVehiculo.http.put(
      `${this.controllerVehiculoEtiqueta}/`,
      model
    );
  }

  close() {
    this.closeModal(false);
    this.dialogConfirmacion = false;
  }

  async actualizacionVehiculos() {
    let vehiculoModelListPUT: any = [];
    let vehiculoModelListPOST: any = [];
    let vehiculoModelListDELETE: any = [];

    this.vehiculosAsignados.forEach((vehiculo: any) => {
      let vehiculoModel = vehiculo;
      let exists = this.etiquetasVehiculo.find(
        x => x.vehiculoId == vehiculoModel.id
      );

      if (exists == null) {
        vehiculoModel = {
          vehiculoId: vehiculo.id,
          vehiculoEtiquetaId: this.editedItem.id,
        };
        vehiculoModelListPOST.push(vehiculoModel);
      } else {
        vehiculoModel = {
          id: exists.id,
          vehiculoId: vehiculo.id,
          vehiculoEtiquetaId: this.editedItem.id,
        };
        vehiculoModelListPUT.push(vehiculoModel);
      }
    });

    this.etiquetasVehiculo.forEach((cv: any) => {
      let cvModel = cv;
      let exists = this.vehiculosAsignados.find(
        x => x.id == cvModel.vehiculoId
      );

      if (exists == null) {
        let vehiculoModel = { id: cvModel.id };
        vehiculoModelListDELETE.push(vehiculoModel);
      }
    });

    if (vehiculoModelListDELETE.length > 0) {
      await this.axContextoVehiculo.http.delete(
        `${this.controllerVehiculoEtiquetaVehiculo}/`,
        { data: vehiculoModelListDELETE }
      );
    }

    if (!this.guardarInactivo) {
      if (vehiculoModelListPUT.length > 0) {
        await this.axContextoVehiculo.http.put(
          `${this.controllerVehiculoEtiquetaVehiculo}/`,
          vehiculoModelListPUT
        );
      }

      if (vehiculoModelListPOST.length > 0) {
        await this.axContextoVehiculo.http.post(
          `${this.controllerVehiculoEtiquetaVehiculo}/`,
          vehiculoModelListPOST
        );
      }
    }
  }

  closeSuccess() {
    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
    this.closeModal(false);
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  errorMSG(error: any, he: HandleErrors) {
    he.showError(error);
    this.btnBloquear = false;
  }

  createButtonCellVehiculoAlerta(params: any) {
    const item: any = this.vehiculosRespaldo.find(x => x.id === params.data.id);
    let eButton = document.createElement('i');
    if (item.esCompartido === true) {
      eButton.setAttribute(
        'title',
        'Vehículo Compartido por: ' + item.compartidoPor
      );
      eButton.innerHTML =
        '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i>';
      return eButton;
    }
  }

  // setRemoveButton() {
  //   //if (this.esEdicion) {
  //   let a1 = this.columnVehiculosDefs.filter(
  //     (x: ColDef) => x.headerName == 'Desasociar'
  //   );

  //   if (a1.length == 0) {
  //     this.columnVehiculosDefs.push({
  //       headerName: 'Desasociar',
  //       cellRenderer: this.createButtonCellVehiculos,
  //       enablePivot: false,
  //       width: 150,
  //       minWidth: 150,
  //       filter: false,
  //       suppressMovable: true,
  //       resizable: false,
  //       sortable: false,
  //       lockVisible: true,
  //       pinned: 'right',
  //       cellStyle: {
  //         textAlign: 'left',
  //       },
  //     });
  //   }
  //   /*} else {
  //     //remueve columnas de desasociar, si existen
  //     this.columnVehiculosDefs = config.returnGrillaCeldasDesasociar(this.columnVehiculosDefs, 'Desasociar');
  //   }*/
  // }

  //########## Guardar Etiqueta Inactivo ##########
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
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'la Etiqueta' });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'la Etiqueta' }
      );
    }
  }

  tieneAsociaciones() {
    if (this.etiquetasVehiculo.length === 0) return false;
    else return true;
  }
  onSelectionChanged(e: any) {
    this.contadorEventoGrillaSelection++;
    if (
      this.vehiculosAsignados.length == 0 ||
      this.vehiculosAsignados.length == 1
    ) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }
    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.vehiculosAsignados = this.gridApi.getSelectedRows();
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
      const vehiculosSeleccionados = this.gridApi
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
      this.gridApi.updateRowData({
        update: [...vehiculosNoSeleccionados, ...vehiculosSeleccionados],
      });
    }
  }
  onFilterTextBoxChanged() {
    this.gridApi.onFilterChanged();
    // if (this.buscarVehiculo.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarVehiculo);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }
  getRowNodeId(veh: IVehiculo) {
    if (!veh) {
      return;
    }
    return veh.id;
  }

  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehiculo.length > 1) {
      let busqueda = this.buscarVehiculo.toLowerCase();
      return (
        node.data.patente.toLowerCase().includes(busqueda) ||
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.referencia.toLowerCase().includes(busqueda) ||
        node.data.tipoVehiculo.toLowerCase().includes(busqueda) ||
        node.data.tipoPeaje.toLowerCase().includes(busqueda) ||
        node.data.modelo.toLowerCase().includes(busqueda) ||
        node.data.ano.toLowerCase().includes(busqueda) ||
        node.data.tipoCombustible.toLowerCase().includes(busqueda) ||
        node.data.tipoTransmision.toLowerCase().includes(busqueda) ||
        node.data.numeroMotor.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  //##########
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

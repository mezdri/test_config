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
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Etiqueta</v-toolbar-title>

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
            <v-divider></v-divider>
            <v-stepper-step
              v-show="asociarVehiculos.visible"
              :complete="e1 > asociarVehiculos.step"
              :step="asociarVehiculos.step"
              >Asociar Vehículos</v-stepper-step
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
                              style="margin-top: 12px!important; font-weight: normal"
                            >
                              Información General
                            </h2>
                          </v-flex>
                        </div>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12 v-show="false">
                            <v-text-field
                              label="Codigo"
                              disabled
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.nombre"
                              label="Nombre"
                              v-validate="
                                'etiquetaNombreUnicoCrear|required|max:80'
                              "
                              :counter="80"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              type="text"
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
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-autocomplete
                              :items="estado"
                              v-model="editedItem.estado"
                              label="Estado"
                              item-value="id"
                              item-text="nombre"
                              v-validate="'required'"
                              :error-messages="errors.collect('estado')"
                              data-vv-name="estado"
                              @change="selectedEstado"
                              required
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
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarVehiculos.visible"
              :step="asociarVehiculos.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title" style="font-weight: normal">
                              Asociar Vehículos
                            </h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarVehiculo"
                            prepend-icon="directions_car"
                            color="primary"
                            label="Buscar..."
                            @input="onFilterTextBoxChanged"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                        <!-- <v-flex md3 v-show="this.muestraVehiculo">
                          <div align="right">
                            <v-btn
                              v-if="!seleccionoTodos"
                              color="primary"
                              @click="marcarTodosVehiculos(true)"
                              >Seleccionar Todos</v-btn
                            >
                            <v-btn
                              v-else-if="seleccionoTodos"
                              color="primary"
                              @click="marcarTodosVehiculos(false)"
                              >Deseleccionar Todos</v-btn
                            >
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
                              :columnDefs="columnVehiculosDefs"
                              :rowData="vehiculosRespaldo"
                              style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
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
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Etiqueta' })"
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
import Vue from 'vue';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { Validator } from 'vee-validate';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
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
import { differenceBy } from 'lodash';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class EtiquetasModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  etiquetas!: IEtiqueta;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.EtiquetaVehiculos;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarVehiculos: PermisoAccionVm = {
    accion: 'Crear - Asociar Vehículos',
    visible: true,
    step: 2,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarVehiculos,
  ];

  readonly controllerVehiculoEtiquetaVehiculo: string =
    'VehiculoEtiquetaVehiculo';
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerVehiculoEtiqueta: string = 'VehiculoEtiqueta';

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IEtiqueta = {};
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  search: string = '';
  buscarVehiculo: string = '';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  muestraVehiculo: boolean = false;

  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  seleccionoTodos: boolean = true;

  //grilla
  localeText: any = config.agGridTextos;
  sideBar: any = config.agGridDefaultConfig;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnVehiculosDefs: Array<ColDef> = [];
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;
  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axContextoUsuario: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //Guardar Etiqueta Inactivo
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  //---

  created() {
    this.chequearPermisos();
    this.registrarValidadores();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivE').scrollIntoView(true);
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

  private registrarValidadores(): void {
    const self = this;

    Validator.extend('etiquetaNombreUnicoCrear', {
      getMessage() {
        return '* Ya existe una Etiqueta con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axContextoVehiculo.http
            .get(
              `${
                self.controllerVehiculoEtiqueta
              }/0/${config.getClienteSesion()}/${value}/ChequearNombreUnico`
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
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';

    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];
    this.seleccionoTodos = false;
    this.editedItem.estado = EstadoEntidad.Activo; //Estado Activo

    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'la Etiqueta',
    });

    if (value) {
      await this.getVehiculos();
    }
  }

  //VEHICULOS         ---------------------------------------------------------------------
  async getVehiculos() {
    try {
      this.vehiculosRespaldo = [];
      this.loadingService.showLoading();

      //05-05-2020: [Entrega3 - B559] Etiquetas - Crear/Editar
      const res: any = await this.axContextoVehiculo.http.get(
        `${this.controllerVehiculo}/${this.clienteId}/getVehiculosParaEtiquetas`
      );

      this.vehiculosRespaldo = res.data;

      this.loadingService.hideLoading();
    } catch (e) {
      this.loadingService.hideLoading();
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.handleErrors.showError(e);
        }
      } else {
        this.handleErrors.showError(e);
      }
    } finally {
      this.loadingService.hideLoading();
    }
    if (this.vehiculosRespaldo.length > 0) {
      this.muestraVehiculo = true;
    } else {
      this.muestraVehiculo = false;
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
      if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length)
        this.seleccionoTodos = true;
      else this.seleccionoTodos = false;
    }
  }

  cierraModal() {
    this.editedItem.estado = EstadoEntidad.Activo;
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
    if (this.vehiculosAsignadosModel.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
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

  closeModal(val: boolean) {
    document.getElementById('cardDivE').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarVehiculo = '';
    this.gridApi.setQuickFilter('');
    this.$validator.errors.clear();
    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'la Etiqueta',
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  async continuar() {
    const resVal: any = await this.$validator.validateAll();
    if (resVal) {
      document.getElementById('cardDivE').scrollIntoView(true);
      if (this.btnText == 'Guardar') {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      } else if (this.e1 === this.permisosActuales.length) {
        //Valida nombre etiqueta
        const res: any = await this.axContextoVehiculo.http.get(
          `${this.controllerVehiculoEtiqueta}/${this.clienteId}/cliente`
        );
        let etiq: any = res.data.find(
          (x: any) =>
            x.nombre.toLowerCase().trim() ===
              this.editedItem.nombre.toLowerCase().trim() &&
            x.estado != EstadoEntidad.Eliminado
        );
        if (etiq !== null && etiq !== undefined) {
          this.$snotify.error('Nombre de etiqueta se encuentra en uso.');
        } else {
          this.dialogConfirmacion = true;
          this.btnBloquear = true;
        }
      } else if (this.e1 === this.permisosActuales.length - 1) {
        this.e1 += 1;
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
      } else {
        this.e1 += 1;
      }
    }
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
        minWidth: 80,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        field: 'esCompartido',
        width: 90,
        minWidth: 90,
        cellRenderer: this.createButtonCellVehiculoAlerta,
        enablePivot: false,
        lockPinned: true,
        resizable: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
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
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'VIN',
        field: 'vin',
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
        headerName: 'Unidad',
        field: 'unidad',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
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
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
        resizable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
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
        headerName: 'Año',
        width: 200,
        field: 'ano',
        minWidth: 80,
        lockPinned: true,
        resizable: true,
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
        conductorGrupoSel: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  createButtonCellVehiculos(params: any) {
    let evento = this.removerVehiculosAsignacion;
    const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item);
    });

    return eButton;
  }

  formatDate(fecha: Date): string {
    if (!fecha) return null;
    const [year, month, day] = fecha.toString().split('-');
    return `${day}/${month}/${year}`;
  }

  async nuevo() {
    let he = new HandleErrors();
    this.loadingService.showLoading();

    let model = {
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      clienteId: this.clienteId,
      estado: this.editedItem.estado,
    };

    try {
      this.btnBloquear = true;
      const res: any = await this.axContextoVehiculo.http.post(
        `${this.controllerVehiculoEtiqueta}/`,
        model
      );

      if (!this.guardarInactivo) {
        await this.grabarAsociacionesVehiculo(res.data.id);
      }

      this.close();
    } catch (e) {
      this.loadingService.hideLoading();
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'la Etiqueta' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'la Etiqueta' })
        );
      }
    } finally {
      this.btnBloquear = false;
      this.loadingService.hideLoading();
    }
  }

  async grabarAsociacionesVehiculo(idEtiqueta: number) {
    let etiquetaVehiculoModelListPost: any = [];

    if (this.vehiculosAsignados.length > 0) {
      this.vehiculosAsignados.forEach((vehiculo: any) => {
        let vehiculoModel = vehiculo;
        vehiculoModel = {
          vehiculoEtiquetaId: idEtiqueta,
          vehiculoId: vehiculo.id,
        };

        etiquetaVehiculoModelListPost.push(vehiculoModel);
      });

      if (etiquetaVehiculoModelListPost.length > 0) {
        await this.axContextoVehiculo.http.post(
          `${this.controllerVehiculoEtiquetaVehiculo}/`,
          etiquetaVehiculoModelListPost
        );
      }
    }
  }

  close() {
    this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Etiqueta',
        creadoA: 'creada',
      })
    );
  }

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    let he = new HandleErrors();

    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          let boolError = this.nuevo();
        }
      });
    }
    this.btnBloquear = false;
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

  //########## Guardar Etiqueta Inactivo ##########
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', { entidad: 'la Etiqueta' });
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Etiqueta' }
      );
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    }
  }
  onSelectionChanged() {
    this.vehiculosAsignados = this.gridApi.getSelectedRows();
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
  getRowNodeId(veh: IVehiculo) {
    if (!veh) {
      return;
    }
    return veh.id;
  }
  onFilterTextBoxChanged() {
    this.gridApi.onFilterChanged();
    // if (this.buscarVehiculo.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarVehiculo);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
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
.dropbox {
  outline: 2px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 200px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}
</style>

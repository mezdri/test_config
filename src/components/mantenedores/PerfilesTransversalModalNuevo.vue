<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivPT">
        <v-toolbar dark color="primary" fixed ref="toolbarCmp">
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Perfil Transversal</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              style="max-height: 75%;"
              color="#526da5"
              @click="volver(), cierraMenuPerfilTransversal()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              style="max-height: 75%;"
              :color="btnColor"
              @click="continuar(), cierraMenuPerfilTransversal()"
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
              v-show="asociarModulos.visible"
              :complete="e1 > asociarModulos.step"
              :step="asociarModulos.step"
              >Asociar Módulos</v-stepper-step
            >
            <v-divider v-show="asociarModulos.visible"></v-divider>

            <v-stepper-step
              v-show="asociarAcciones.visible"
              :complete="e1 > asociarAcciones.step"
              :step="asociarAcciones.step"
              >Asociar Acciones</v-stepper-step
            >
          </v-stepper-header>

          <v-divider light></v-divider>

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
                              Información General
                            </h2>
                          </v-flex>
                        </div>
                        <v-divider></v-divider>
                        <br />
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="
                                'required|PerfilNombreUnicoNuevo|max:80'
                              "
                              v-model="editedItem.nombre"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              :counter="80"
                              required
                              @keydown="preventEnterPerfilesT"
                            ></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>

            <v-stepper-content
              v-show="asociarModulos.visible"
              :step="asociarModulos.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Módulos</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarModulo"
                            prepend-icon="lock_open"
                            label="Buscar..."
                            @input="onFilterTextBoxChanged"
                            append-icon="search"
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex md3 style="padding-top:22px"> </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsFuncionalidades"
                              :rowData="modulosAccionRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadyFuncionalidad"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectionChanged($event)"
                              :getRowNodeId="getRowNodeId"
                              :processCellForClipboard="procesarFecha"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentModulo
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassModulo
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
              v-show="asociarAcciones.visible"
              :step="asociarAcciones.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md>
                      <v-layout row wrap>
                        <v-flex xs6>
                          <div align="left">
                            <h2 class="h2_title">
                              Asociar Acciones por Módulo
                            </h2>
                          </div>
                        </v-flex>
                        <v-flex xs6>
                          <div align="right">
                            <v-btn
                              v-if="!seleccionoTodos"
                              color="primary"
                              @click="marcarTodasAcciones(true)"
                              >Seleccionar Todas</v-btn
                            >
                            <v-btn
                              v-else-if="seleccionoTodos"
                              color="primary"
                              @click="marcarTodasAcciones(false)"
                              >Deseleccionar Todas</v-btn
                            >
                          </div>
                        </v-flex>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <div align="left">
                        <v-treeview
                          id="arbolPermisos"
                          :items="accionesTreeView"
                          v-model="accionesSeleccionadasArbol"
                          selectable
                          selected-color="indigo"
                        ></v-treeview>
                      </div>
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
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Perfil Transversal' })
      "
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'el Perfil Transversal' })
      "
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

    <!-- SELECCION MODULO -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaModulo" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size:17px;margin-left: 10px !important"
              >{{ tituloMsjAlerta }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>{{ textoMsjAlerta }}</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="confirmCallbackModulo()">
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
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import { differenceBy, intersectionBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class PerfilesTransversalModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '', estado: '' }) })
  perfil!: PerfilesInterface;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.PerfilTransversal; //EMR //Funcionalidades.RolesTransversal;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarModulos: PermisoAccionVm = {
    accion: 'Crear - Asociar Módulos',
    visible: true,
    step: 2,
    codigoSubAccion: 22,
    codigoAccionPadre: CodigoAccion.Crear,
    validacion: this.arbolPerfiles,
  };

  asociarAcciones: PermisoAccionVm = {
    accion: 'Crear - Asociar Acciones',
    visible: true,
    step: 3,
    codigoSubAccion: 20,
    codigoAccionPadre: CodigoAccion.Crear,
    validacion: this.arbolPerfiles,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarModulos,
    this.asociarAcciones,
  ];

  accionesTreeView: any = [];
  PerfilTransversalController: string = 'PerfilTransversal';
  controller: string = 'Perfil';
  funcionalidadAccionController: string = 'funcionalidadAccion';
  loadingService = new LoadingService();

  //Variables globales
  localeText = config.agGridTextos;
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnColor: string = '#ffe800'; //'#669933'
  dialog: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  validForm: boolean = false;
  btnBloquear: boolean = false;
  editedItem: PerfilesInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  acciones: any = [];
  seleccionoTodos: boolean = false;
  clienteId: number = config.getClienteSesion();
  funcRules: any = [];
  search: string = '';
  buscarModulo: string = '';
  arbolNuevo: any = [];
  textoMsjAlerta: string = '';
  tituloMsjAlerta: string = '';
  tieneAccionesCheck: boolean = true;

  gridApiFuncionalidades: GridApi;
  columnApiFuncionalidades: ColumnApi;
  columnDefsFuncionalidades: Array<ColDef> = [];

  gridApiUsuarios: GridApi;
  columnApiUsuarios: ColumnApi;
  columnDefsUsuarios: Array<ColDef> = [];

  funcionalidadAccionAsignadosModel: any = [];
  modulosAccionAsignados: any[] = [];
  modulosAccionRespaldo: any[] = [];
  accionesSeleccionadasArbol: any[] = [];
  accionesSeleccionadas: any[] = [];
  accionesGuardadas: any[] = [];
  seleccionoTodosModulos: boolean = false;

  boolModulos: boolean = false;
  showAlertaModulo: boolean = false;

  initialize() {
    this.columnDefsFuncionalidades = [
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
        resizable: false,
        lockPinned: true,
        sortable: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        lockVisible: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacion',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        valueFormatter: this.fechaFilter,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => null,
      },
      {
        headerName: 'Fecha Modificación',
        field: 'fechaModificacion',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        valueFormatter: this.fechaFilter,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => null,
      },
      {
        field: 'fechaCreacionTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
      {
        field: 'fechaModificacionTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
    ];

    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        funcionalidad: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  created() {
    this.chequearPermisos();
    this.registrarValidadores();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnColor = '#ffe800';
    document.getElementById('cardDivPT').scrollIntoView(true);
    if (this.accionesSeleccionadasArbol.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadasArbol;
    }
  }

  mounted() {
    this.initialize();
    this.funcRules = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) =>
        this.validarAlMenosUnaFuncionalidad() ||
        '* Debe seleccionar al menos un Módulo.',
    ];
    if (
      this.accionesSeleccionadas.length === this.modulosAccionAsignados.length
    ) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  private arbolPerfiles() {
    const loadingKey = 'arbolPerfiles';
    this.loadingService.showLoading(undefined, loadingKey);
    const formVal: any = this.$refs;
    this.arbolNuevo = [];
    this.accionesSeleccionadasArbol = [];

    this.modulosAccionAsignados.forEach(modulo => {
      this.arbolNuevo.push({
        id: modulo.id,
        name: modulo.nombre,
        children: [],
        accionesChildren: modulo.children,
      });
    });

    this.arbolNuevo.forEach((tv: any) => {
      let childrenAcciones: any = {};
      if (tv.accionesChildren.length > 0) {
        tv.accionesChildren.forEach((accion: any) => {
          childrenAcciones = {
            id: accion.id,
            name: accion.nombre,
            children: [],
          };

          // selecciono todos los consultar
          if (
            accion.accionCodigo === CodigoAccion.Consultar ||
            accion.accionCodigo === CodigoAccion.GenerarGenerarInforme ||
            accion.accionCodigo === CodigoAccion.GenerarInformaciónGeneral ||
            accion.accionCodigo ===
              CodigoAccion.GenerarAsociarFlotasEtiquetasVehículos
          ) {
            this.accionesSeleccionadasArbol.push(accion.id);
          }

          // tiene SubAcciones
          if (accion.children !== null) {
            accion.children.forEach((subAccion: any) => {
              let childrenSubAcciones: any = {};
              childrenSubAcciones = {
                id: subAccion.id,
                name: subAccion.nombre,
                children: [],
              };

              childrenAcciones.children.push(childrenSubAcciones);
            });
          }

          tv.children.push(childrenAcciones);
        });
      }
    });

    this.accionesTreeView = this.arbolNuevo;

    setTimeout(() => {
      this.habilitaCheckConsultar();
      this.loadingService.hideLoading(loadingKey);
    }, 2000);

    // setTimeout(this.habilitaCheckConsultar, 6000);

    return formVal.form.validate();
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('PerfilNombreUnicoNuevo', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Perfil con este nombre.';
      },
      validate(value: any) {
        return self.axiosCliente.http
          .get(`${self.PerfilTransversalController}/${0}/${value}/nombreUnico`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* Ya existe un Perfil con este nombre.' },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
  }
  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuPerfilTransversal(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  validarAlMenosUnaFuncionalidad(): boolean {
    if (this.e1 === this.asociarModulos.step) {
      return this.modulosAccionAsignados.length > 0;
    }
    return true;
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.btnBloquear = false;
    this.dialog = value;
    this.btnText = 'Continuar';
    this.modulosAccionAsignados = [];
    this.funcionalidadAccionAsignadosModel = [];
    this.modulosAccionRespaldo = [];
    this.accionesSeleccionadas = [];
    this.accionesGuardadas = [];
    this.accionesTreeView = [];
    this.accionesSeleccionadasArbol = [];
    this.textoMsjAlerta = '';
    this.tituloMsjAlerta = '';

    if (value) {
      try {
        this.loadingService.showLoading();
        this.$validator.reset();
        await this.obtenerFuncionalidadAcciones();
        this.seleccionoTodos = false;
        this.seleccionoTodosModulos = false;
        this.btnText = 'Continuar';
        this.btnColor = '#ffe800';
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  marcarTodasAcciones(value: boolean) {
    this.accionesSeleccionadasArbol = [];

    if (value) {
      this.modulosAccionRespaldo.forEach((modulo: any) => {
        modulo.children.forEach((accion: any) => {
          this.accionesSeleccionadasArbol.push(accion.id);
          accion.children.forEach((subAccion: any) => {
            this.accionesSeleccionadasArbol.push(subAccion.id);
          });
        });
        this.accionesSeleccionadasArbol.push(modulo.id);
      });
    } else {
      this.modulosAccionRespaldo.forEach((modulo: any) => {
        modulo.children.forEach((accion: any) => {
          if (
            accion.accionCodigo === CodigoAccion.Consultar ||
            accion.accionCodigo === CodigoAccion.GenerarGenerarInforme ||
            accion.accionCodigo === CodigoAccion.GenerarInformaciónGeneral ||
            accion.accionCodigo ===
              CodigoAccion.GenerarAsociarFlotasEtiquetasVehículos
          ) {
            this.accionesSeleccionadasArbol.push(accion.id);
          }
        });
      });
    }
    this.seleccionoTodos = value;
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivPT').scrollIntoView(true);

        if (this.e1 > 1 && !this.boolModulos) {
          this.showAlertaModulo = true;
          this.tituloMsjAlerta = 'Seleccionar Módulo';
          this.textoMsjAlerta = 'Debe seleccionar al menos un Módulo.';
        } else {
          if (this.e1 === this.permisosActuales.length) {
            this.validarAccionCheck();
            if (this.tieneAccionesCheck) {
              this.btnBloquear = true;
              this.dialogConfirmacion = true;
            } else {
              this.showAlertaModulo = true;
              this.tituloMsjAlerta = 'Seleccionar Acción';
              this.textoMsjAlerta =
                'Debe seleccionar al menos una acción por Módulo.';
            }
            if (this.accionesSeleccionadas.length > 0) {
              this.accionesGuardadas = this.accionesSeleccionadas;
            }
          } else if (this.e1 === this.permisosActuales.length - 1) {
            const permiso = this.permisosActuales[this.e1 - 1];

            if (
              permiso.validacion !== undefined &&
              permiso.validacion !== null
            ) {
              if (permiso.validacion()) {
                this.e1 += 1;
                this.btnColor = '#ff6c00';
                this.btnText = 'Guardar';

                this.seleccionoTodos = false;
              }
            } else {
              this.e1 += 1;
              this.btnText = 'Guardar';
              this.seleccionoTodos = false;
            }
          } else {
            const permiso = this.permisosActuales[this.e1 - 1];

            if (
              permiso.validacion !== undefined &&
              permiso.validacion !== null
            ) {
              if (permiso.validacion()) {
                this.e1 += 1;
              }
            } else {
              this.e1 += 1;
            }
          }
        }
      }
    });
  }

  validarAccionCheck() {
    //valida que cada modulo tenga al menos una accion asignada
    this.tieneAccionesCheck = true;
    this.modulosAccionAsignados.forEach((modulo: any) => {
      let tieneSeleccionado = false;
      if (modulo.children.length > 0) {
        modulo.children.forEach((accion: any) => {
          let existeAccionCheck = this.accionesSeleccionadasArbol.find(
            x => x === accion.id
          );
          if (existeAccionCheck) {
            if (!tieneSeleccionado) {
              tieneSeleccionado = true;
            }
          }
        });
      }
      if (!tieneSeleccionado) {
        this.tieneAccionesCheck = false;
      }
    });
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async confirmCallback(confirmacion: boolean) {
    this.dialogConfirmacion = false;

    if (confirmacion) {
      this.loadingService.showLoading();
      const resultadoValidador = await this.$validator.validateAll();

      if (resultadoValidador) {
        let he = new HandleErrors();
        this.btnBloquear = true;

        let model = {
          Id: this.editedItem.id,
          Nombre: this.editedItem.nombre,
          Estado: EstadoEntidad.Activo,
          ClienteId: this.clienteId,
        };
        this.loadingService.showLoading();
        //Graba Nuevo Perfil
        try {
          const response = await this.axiosCliente.http.post(
            `${this.PerfilTransversalController}/`,
            model
          );
          model.Id = response.data.id;
          await this.guardarAsignacionModulosAccion(response.data.id);
        } catch (error) {
          this.btnBloquear = false;
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
    this.btnBloquear = false;
  }

  async guardarAsignacionModulosAccion(perfilId: any) {
    if (this.accionesSeleccionadasArbol.length > 0) {
      let model: any = [];

      //Graba Asignacion de funcionalidades acciones
      this.modulosAccionAsignados.forEach((modulo: any) => {
        //Módulos con Acciones
        if (modulo.children.length > 0) {
          modulo.children.forEach((accion: any) => {
            //Acciones sin Subacciones
            let existeAccionCheck = this.accionesSeleccionadasArbol.find(
              x => x === accion.id && accion.children.length === 0
            );
            if (existeAccionCheck !== undefined) {
              model.push(accion);
            }

            //Acciones con Subacciones
            accion.children.forEach((subAccion: any) => {
              let existeSubAccionCheck = this.accionesSeleccionadasArbol.find(
                x => x === subAccion.id
              );
              if (existeSubAccionCheck !== undefined) {
                model.push(subAccion);
              }
            });
          });
        }
      });

      try {
        const response = await this.axios.http.post(
          `${this.funcionalidadAccionController}/${perfilId}/grabaFuncionalidadAccionesNuevo`,
          model
        );
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Perfil Transversal',
            creadoA: 'creado',
          })
        );
        this.closeModal(false);
      } catch (error) {
        this.btnBloquear = false;
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Perfil Transversal',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'el Perfil Transversal',
            })
          );
        }
      }
    } else {
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.crear', {
          entidad: 'Perfil Transversal',
          creadoA: 'creado',
        })
      );

      this.closeModal(false);
    }
    this.loadingService.hideLoading();
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivPT').scrollIntoView(true);
    this.$validator.reset();
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarModulo = '';
    this.showAlertaModulo = false;
    this.gridApiFuncionalidades.setQuickFilter('');
    this.boolModulos = false;
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyFuncionalidad(params: GridReadyEvent) {
    this.gridApiFuncionalidades = params.api;
    this.columnApiFuncionalidades = params.columnApi;
  }

  async obtenerFuncionalidadAcciones() {
    try {
      this.modulosAccionRespaldo = [];
      const response = await this.axios.http.get(
        `${
          this.funcionalidadAccionController
        }/${0}/${0}/getFuncionalidadAcciones`
      );

      //[COPIAR PEGAR] Track 3.0 - Grillas
      response.data.forEach((acc: any) => {
        acc.estadoTxt =
          acc.estado === EstadoEntidad.Sistema
            ? EstadoEntidad[EstadoEntidad.Activo]
            : EstadoEntidad[acc.estado];
        acc.fechaCreacionTxt = this.$options.filters.formatDate(
          acc.fechaCreacion
        );
        acc.fechaModificacionTxt =
          acc.fechaModificacion !== null
            ? this.$options.filters.formatDate(acc.fechaModificacion)
            : '';
      });
      //---

      this.modulosAccionRespaldo = response.data;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener las acciones.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener las acciones.');
      }
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  //Aplica estilos para bloqueos de checkConsultar
  setCheckConsultar() {
    var claseCheck =
      'v-icon v-treeview-node__checkbox v-icon--link material-icons theme--light indigo--text';
    var labelElemento = document.getElementsByClassName(
      'v-treeview-node__label'
    ) as HTMLCollectionOf<HTMLElement>;

    if (labelElemento.length > 0) {
      for (let item of labelElemento) {
        const rootNode = item.parentElement.parentElement;
        if (
          item.innerText.toUpperCase() == 'CONSULTAR' ||
          item.innerText.toUpperCase() == 'GENERAR - INFORMACIÓN GENERAL' ||
          item.innerText.toUpperCase() ==
            'GENERAR - ASOCIAR FLOTAS ETIQUETAS O VEHÍCULOS' ||
          item.innerText.toUpperCase() == 'GENERAR - GENERAR INFORME'
        ) {
          let iconos = rootNode.getElementsByTagName('i') as HTMLCollectionOf<
            HTMLElement
          >;
          for (let icono of iconos) {
            if (icono.classList.contains('v-treeview-node__toggle')) {
              icono.addEventListener('click', this.setCheckConsultar);
              continue;
            }
            icono.className = claseCheck;
            icono.textContent = 'check_box';
            icono.style.cursor = 'default';
            icono.style.setProperty('color', '#9e9e9e', 'important');

            icono.outerHTML =
              '<div disabled="disabled">' + icono.outerHTML + '</div>';
          }
        }
      }
    }
  }

  habilitaCheckConsultar() {
    let arbolPermisos = document.getElementById('arbolPermisos');
    let aqui = this;
    aqui.setCheckConsultar();
    for (let elemento1 of arbolPermisos.children) {
      if (elemento1.children.length > 0) {
        for (let elemento2 of elemento1.children) {
          if (elemento2.children[1]) {
            elemento2.children[1].addEventListener('click', function() {
              aqui.reestableceConsultarCheck();
              aqui.setCheckConsultar();
            });
          }
          if (elemento2.children[0]) {
            elemento2.children[0].addEventListener('click', function() {
              aqui.reestableceConsultarCheck();
              aqui.setCheckConsultar();
            });
          }
        }
      }
    }
    //TODO

    if (this.accionesGuardadas.length != 0) {
      let a = this.accionesSeleccionadasArbol.concat(this.accionesGuardadas);
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j] || a[j] < 0) a.splice(j--, 1);
        }
      }
      this.accionesSeleccionadasArbol = a;
    }
  }
  //Se reestablecen los elementos
  reestableceConsultarCheck() {
    this.modulosAccionAsignados.forEach(modulo => {
      modulo.children.forEach((accion: any) => {
        if (
          accion.accionCodigo === CodigoAccion.Consultar ||
          accion.accionCodigo === CodigoAccion.GenerarGenerarInforme ||
          accion.accionCodigo ===
            CodigoAccion.GenerarAsociarFlotasEtiquetasVehículos ||
          accion.accionCodigo === CodigoAccion.GenerarInformaciónGeneral
        ) {
          this.accionesSeleccionadasArbol.push(accion.id);
        }
      });
    });
  }

  preventEnterPerfilesT(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }
  onSelectionChanged() {
    this.accionesTreeView = [];
    this.modulosAccionAsignados = this.gridApiFuncionalidades.getSelectedRows();

    if (this.modulosAccionAsignados.length) this.boolModulos = true;
    else this.boolModulos = false;

    const modulosSeleccionados = this.gridApiFuncionalidades
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const modulosNoSeleccionados = differenceBy(
      this.modulosAccionRespaldo,
      modulosSeleccionados,
      func => func.id
    ).map(func => ({
      ...func,
      checked: false,
    }));

    this.gridApiFuncionalidades.updateRowData({
      update: [...modulosNoSeleccionados, ...modulosSeleccionados],
    });
  }
  onFilterTextBoxChanged() {
    this.gridApiFuncionalidades.onFilterChanged();
    // if (this.buscarModulo.length > 1) {
    //   this.gridApiFuncionalidades.setQuickFilter(this.buscarModulo);
    // } else {
    //   this.gridApiFuncionalidades.setQuickFilter('');
    // }
  }

  getRowNodeId(func: IFuncionalidad) {
    if (!func) {
      return;
    }
    return func.id;
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

  confirmCallbackModulo() {
    this.showAlertaModulo = false;
  }

  @Watch('accionesSeleccionadasArbol')
  async changeAcciones() {
    let accionesSeleccionadas: number[] = [];

    const accionesModulos = this.modulosAccionAsignados.flatMap(
      acciones => acciones.children
    );

    const subAccionesModulos = accionesModulos.flatMap(
      subAccion => subAccion.children
    );

    const accionesTotales: number =
      accionesModulos.length + subAccionesModulos.length;

    const filtrarAccionesTotales = accionesModulos.filter(accion => {
      let existe = this.accionesSeleccionadasArbol.find(x => x == accion.id);
      if (existe !== undefined) {
        accionesSeleccionadas.push(existe);
      }
    });

    const filtrarSubAccionesTotales = subAccionesModulos.filter(accion => {
      let existe = this.accionesSeleccionadasArbol.find(x => x == accion.id);
      if (existe !== undefined) {
        accionesSeleccionadas.push(existe);
      }
    });

    if (accionesTotales === accionesSeleccionadas.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  isExternalFilterPresentModulo(): boolean {
    return true;
  }

  doesExternalFilterPassModulo(node: RowNode): boolean {
    if (this.modulosAccionRespaldo.length > 0 && this.buscarModulo.length > 1) {
      let busqueda = this.buscarModulo.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaCreacionTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaModificacionTxt.toLowerCase().includes(busqueda)
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
.app-toolbar {
  position: sticky;
  position: -webkit-sticky; /* For macOS/iOS Safari */
  top: 0; /* Sets the sticky toolbar to be on top */
  z-index: 999; /* Ensure that your app's content doesn't overlap the toolbar */
}
</style>

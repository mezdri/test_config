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
            :disabled="btnBloquearC"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{
            esEdicion ? 'Editar Perfil' : 'Ver Detalle Perfil'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              style="max-height: 75%;"
              depressed
              color="#ff6c00"
              v-if="esEdicion"
              @click="grabarEdicion()"
              :disabled="!validForm || btnBloquear"
            >
              <span style="color:white;">Guardar Cambios</span>
            </v-btn>
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
                @click="cierraMenuPefil"
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
                color="primary"
                flat
                v-show="
                  (asociarModulos.visible && esEdicion) ||
                    (asociarModulosVerDetalle.visible && !esEdicion)
                "
                :value="asociarModulos.step"
                @click="asignarModulos(), cierraMenuPefil()"
              >
                <span>Asociar Módulos</span>
                <v-icon>lock_open</v-icon>
              </v-btn>
              <v-btn
                color="primary"
                flat
                v-show="
                  (asociarAcciones.visible && esEdicion) ||
                    (asociarAccionesVerDetalle.visible && !esEdicion)
                "
                :value="asociarAcciones.step"
                @click="asignaAcciones(), cierraMenuPefil()"
              >
                <span>Asociar Acciones</span>
                <v-icon>note_add</v-icon>
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
                          Información General
                        </h2>
                      </v-flex>
                    </div>
                    <v-divider></v-divider>
                    <br />
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|PerfilNombreUnicoEditar|max:80'"
                          v-model="editedItem.nombre"
                          :error-messages="errors.collect('nombre')"
                          data-vv-name="nombre"
                          label="Nombre"
                          type="text"
                          :counter="80"
                          :disabled="!esEdicion"
                          required
                          @keydown="preventEnterPerfiles"
                        ></v-text-field>
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
              bottomNav == asociarModulos.step &&
                ((asociarModulos.visible && esEdicion) ||
                  (asociarModulosVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Módulos</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        label="Buscar..."
                        v-model="buscarModulosEditar"
                        @input="onFilterTextBoxChangedModulosEditar"
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
                          :columnDefs="columnDefsFuncionalidades"
                          :rowData="modulosRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          suppressCopyRowsToClipboard="true"
                          :sideBar="false"
                          :localeText="localeText"
                          :onGridReady="onGridReadyFuncionalidades"
                          :postProcessPopup="onClickCell"
                          @selection-changed="
                            onSelectedChangeFuncionalidadesEditar
                          "
                          :getRowNodeId="getRowNodeId"
                          :processCellForClipboard="procesarFecha"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentModulo
                          "
                          :doesExternalFilterPass="doesExternalFilterPassModulo"
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
                    <v-flex xs6>
                      <div align="left">
                        <h2 class="h2_title">Asociar Acciones por Módulo</h2>
                      </div>
                    </v-flex>
                    <v-flex xs6 v-if="esEdicion">
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
                      :style="[
                        esEdicion
                          ? { 'pointer-events': 'auto' }
                          : { 'pointer-events': 'none' },
                      ]"
                      v-if="showTreeView"
                      :items="acc"
                      v-model="accionesSeleccionadasArbol"
                      selectable
                      :open-all="!esEdicion"
                      :selected-color="esEdicion ? 'indigo' : 'grey'"
                      id="arbolPermisos"
                    ></v-treeview>
                  </div>
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
          entidad: 'Perfil',
          nombreEntidad: perfil.nombre,
        })
      "
      :mensaje="$t('mensajes.crud.editar.mensaje', { entidad: 'Perfil' })"
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
import Confirmation from '@/components/Confirmation.vue';
import HandleErrors from '@/config/handleErrors';
import config from '@/config/index';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { differenceBy } from 'lodash';
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
export default class PerfilesModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '', estado: '' }) })
  perfil!: PerfilesInterface;

  readonly controller: string = 'Perfil';
  readonly funcionalidadController: string = 'funcionalidad';
  readonly accionController: string = 'accion';
  readonly funcionalidadAccionController: string = 'funcionalidadAccion';
  readonly PerfilTransversalController: string = 'PerfilTransversal';
  readonly controllerUsuario: string = 'usuario';

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Perfiles;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarModulos: PermisoAccionVm = {
    accion: 'Editar - Asociar Módulos',
    visible: true,
    step: 2,
    codigoSubAccion: 22,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarAcciones: PermisoAccionVm = {
    accion: 'Editar - Asociar Acciones',
    visible: true,
    step: 3,
    codigoSubAccion: 20,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarModulosVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Módulos',
    visible: true,
    step: 2,
    codigoSubAccion: 22,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarAccionesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Acciones',
    visible: true,
    step: 3,
    codigoSubAccion: 20,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarModulos,
    this.asociarAcciones,
    this.informacionGeneralVerDetalle,
    this.asociarModulosVerDetalle,
    this.asociarAccionesVerDetalle,
  ];

  //Variables globales
  showTreeView: boolean = false;
  localeText = config.agGridTextos;
  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: PerfilesInterface = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  btnBloquear: boolean = false;
  btnBloquearC: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  seleccionoTodos: boolean = false;
  clienteId: number = config.getClienteSesion();
  funcRules: any = [];
  loadingService = new LoadingService();
  search: string = '';
  textoMsjAlerta: string = '';
  tituloMsjAlerta: string = '';
  tieneAccionesCheck: boolean = false;

  funcionalidadesAsignadosModel: any = [];
  modulosAsignados: IFuncionalidad[] = [];
  funcionalidadesAsignadosResp: IFuncionalidad[] = [];
  modulosRespaldo: IFuncionalidad[] = [];

  accionesRespaldo: any[] = [];
  acciones: any = [];
  acc: any = [];
  accionesSeleccionadas: any[] = [];
  accionesSeleccionadasArbol: any[] = [];
  dataAll: any = [];
  accionesGuardadas: any[] = [];
  modulosAsignadosResp: any[] = [];
  llamadaActividades: boolean = true;

  gridApiFuncionalidades: GridApi;
  columnApiFuncionalidades: ColumnApi;
  columnDefsFuncionalidades: Array<ColDef> = [];
  buscarModulosEditar: string = '';

  seleccionoTodosModulos: boolean = false;
  modulosTotal: any = [];
  arbolEditar: any = [];
  funcionesValidadas: any = [];
  responserolesUsuarioEditar: any = {};
  usuarioId: number = store.state.userId;
  showAlertaModulo: boolean = false;

  mounted() {
    this.registrarValidadores();
    this.initialize();
    this.funcRules = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) =>
        this.validaAlMenosUnaFuncionalidad() ||
        '* Debe seleccionar al menos un Módulo.',
    ];

    this.obtenerRolesAsignados(this.usuarioId);
  }

  validaAlMenosUnaFuncionalidad(): boolean {
    return this.modulosAsignados.length > 0;
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('PerfilNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Perfil con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controller}/${self.editedItem.id}/${clienteId}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message: '* Ya existe un Perfil con este nombre.',
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

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.editedItem = this.perfil;
    this.bottomNav = '1';
    this.funcionalidadesAsignadosModel = [];
    this.funcionalidadesAsignadosResp = [];
    this.modulosAsignados = [];
    this.modulosRespaldo = [];
    this.accionesRespaldo = [];
    this.acciones = [];
    this.accionesSeleccionadas = [];
    this.accionesSeleccionadasArbol = [];
    this.modulosAsignadosResp = [];
    this.accionesGuardadas = [];
    this.acc = [];
    this.dataAll = [];
    this.modulosTotal = [];
    this.funcionesValidadas = [];
    this.arbolEditar = [];
    this.textoMsjAlerta = '';
    this.tituloMsjAlerta = '';

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        this.btnBloquear = false;
        this.btnBloquearC = false;
        await this.obtenerFuncionalidades();
        // await this.obtenerAcciones();
        await this.obtenerPerfilFuncionalidadAccion();

        this.initialize();
        this.gridApiFuncionalidades.sizeColumnsToFit();

        if (this.modulosAsignados.length === this.modulosRespaldo.length) {
          this.seleccionoTodosModulos = true;
        } else {
          this.seleccionoTodosModulos = false;
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

  marcarTodasAcciones(value: boolean) {
    this.accionesSeleccionadasArbol = [];

    if (value) {
      this.modulosRespaldo.forEach((modulo: any) => {
        modulo.children.forEach((accion: any) => {
          this.accionesSeleccionadasArbol.push(accion.id);
          accion.children.forEach((subAccion: any) => {
            this.accionesSeleccionadasArbol.push(subAccion.id);
          });
        });
        this.accionesSeleccionadasArbol.push(modulo.id);
      });
    } else {
      this.modulosRespaldo.forEach((modulo: any) => {
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

  grabarEdicion() {
    const formVal: any = this.$refs;
    this.btnBloquearC = true;

    if (this.accionesSeleccionadasArbol.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadasArbol;
    }
    this.$validator.validateAll().then(res => {
      if (res) {
        if (this.modulosAsignados.length === 0) {
          this.showAlertaModulo = true;
          this.tituloMsjAlerta = 'Seleccionar Módulo';
          this.textoMsjAlerta = 'Debe seleccionar al menos un Módulo.';
        } else {
          if (formVal.form.validate()) {
            if (
              (this.bottomNav == '1' || this.bottomNav == '2') &&
              this.accionesSeleccionadasArbol.length === 0
            ) {
              this.asignaAcciones();
            }
            this.validarAccionCheck();
            if (this.accionesSeleccionadasArbol.length === 0) {
              if (this.bottomNav !== this.asociarAcciones.step) {
                this.asignaAcciones();
              }
              this.showAlertaModulo = true;
              this.tituloMsjAlerta = 'Seleccionar Acción';
              this.textoMsjAlerta =
                'Debe seleccionar al menos una acción por Módulo.';
              this.btnBloquear = true;

              this.bottomNav = this.asociarAcciones.step;
            } else {
              if (this.tieneAccionesCheck) {
                this.dialogConfirmacion = true;
              } else {
                this.showAlertaModulo = true;
                this.tituloMsjAlerta = 'Seleccionar Acción';
                this.textoMsjAlerta =
                  'Debe seleccionar al menos una acción por Módulo.';
                this.btnBloquear = true;

                // if (this.bottomNav !== this.asociarAcciones.step) {
                //   this.asignaAcciones();
                // }

                this.bottomNav = this.asociarAcciones.step;
              }
            }
          } else {
            this.bottomNav = this.asociarModulos.step;
          }
        }
      }
    });
    this.btnBloquear = false;
  }

  isExternalFilterPresentModulo(): boolean {
    return true;
  }

  doesExternalFilterPassModulo(node: RowNode): boolean {
    if (
      this.modulosRespaldo.length > 0 &&
      this.buscarModulosEditar.length > 1
    ) {
      let busqueda = this.buscarModulosEditar.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaCreacionTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaModificacionTxt.includes(busqueda)
      );
    }
    return true;
  }

  validarAccionCheck() {
    this.tieneAccionesCheck = true;
    this.modulosAsignados.forEach((modulo: any) => {
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

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.btnBloquearC = false;
    this.loadingService.showLoading();

    try {
      if (val) {
        const resVal: any = await this.$validator.validateAll();
        if (resVal) {
          this.btnBloquear = true;
          this.btnBloquearC = true;
          //Edición
          await this.editarPerfilLocal();
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.closeModal(false);
        }
      }
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
      this.loadingService.hideLoading();
    }

    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.$validator.reset();
    this.showTreeView = false;
    this.btnBloquear = false;
    this.editedItem = {};
    this.llamadaActividades = true;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarModulosEditar = '';
    this.showAlertaModulo = false;
    this.gridApiFuncionalidades.setQuickFilter('');
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyFuncionalidades(params: GridReadyEvent) {
    this.gridApiFuncionalidades = params.api;
    this.columnApiFuncionalidades = params.columnApi;
    this.gridApiFuncionalidades.sizeColumnsToFit();
  }

  async obtenerRolesAsignados(usuarioId: number) {
    try {
      this.responserolesUsuarioEditar = await this.axios.http.get(
        `${this.controllerUsuario}/${usuarioId}/clienterol/`
      );
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los roles asignados.'
          );
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener los roles asignados.');
      }
    }
  }

  async obtenerFuncionalidades() {
    try {
      // const response = await this.axios.http.get(
      //   `${this.funcionalidadController}`
      // );
      // this.modulosTotal = response.data;

      const response = await this.axios.http.get(
        `${this.funcionalidadAccionController}/${0}/${
          this.clienteId
        }/${'getFuncionalidadAccionesTransversal'}`
      );
      this.modulosRespaldo = JSON.parse(response.data);

      //[COPIAR PEGAR] Track 3.0 - Grillas
      this.modulosRespaldo.forEach((func: any) => {
        func.estadoTxt =
          func.estado === EstadoEntidad.Sistema
            ? EstadoEntidad[EstadoEntidad.Activo]
            : EstadoEntidad[func.estado];
        func.fechaCreacionTxt = this.$options.filters.formatDate(
          func.fechaCreacion
        );
        func.fechaModificacionTxt =
          func.fechaModificacion !== null
            ? this.$options.filters.formatDate(func.fechaModificacion)
            : '';
      });
      //---
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener las funcionalidades.'
          );
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener las funcionalidades.');
      }
    }
  }
  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  async obtenerPerfilFuncionalidadAccion() {
    try {
      //Busca el universo de Funcionalidad-Accion del Perfil Rol Transversal
      const response = await this.axios.http.get(
        `${this.funcionalidadAccionController}/${0}/${
          this.clienteId
        }/getFuncionalidadAccionesTransversal`
      );
      this.dataAll = JSON.parse(response.data);

      //Buscar las acciones del Perfil Actual
      const responsePfa = await this.axiosCliente.http.get(
        `${this.PerfilTransversalController}/${this.perfil.id}/funcionalidadAccion`
      );
      const data = responsePfa.data;
      this.modulosAsignadosResp = data;

      if (data.length > 0) {
        // carga datos a variable asignados
        if (this.modulosAsignadosResp.length > 0) {
          this.modulosAsignadosResp.forEach((modulo: any) => {
            let add = this.modulosRespaldo.find(
              x => x.moduloId === modulo.moduloId
            );
            if (add !== undefined && add !== null) {
              this.modulosAsignados.push(add);
            }
          });
        }

        // se realiza check de las funcionalidades asignadas
        this.modulosRespaldo.forEach(funcionalidades => {
          let exists: any = this.modulosAsignados.filter(
            (x: any) => x.id === funcionalidades.id
          );
          if (exists.length == 0) {
            funcionalidades.checked = false;
          } else {
            funcionalidades.checked = true;
          }
        });

        // refresco grilla
        if (this.gridApiFuncionalidades != undefined) {
          this.gridApiFuncionalidades.refreshCells({ force: true });
        }

        await this.seteaAsignadosVerDetalle();

        // selecciono la data para solucionar problema check header
        const self = this;
        this.gridApiFuncionalidades.forEachNode(function(node: any) {
          var index = self.modulosAsignados.findIndex(
            x => x.id == node.data.id
          );
          if (index !== -1) {
            node.setSelected(true);
          }
        });
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
    }
  }
  seteaAsignadosVerDetalle() {
    if (!this.esEdicion) {
      this.modulosRespaldo = this.modulosAsignados;
    }
  }

  asignarModulos() {
    if (this.accionesSeleccionadasArbol.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadasArbol;
    }
  }

  asignaAcciones() {
    const loadingKey = 'asignaAcciones';
    this.loadingService.showLoading(undefined, loadingKey);
    this.arbolEditar = [];
    this.accionesSeleccionadasArbol = [];
    this.modulosAsignados.forEach(modulo => {
      this.arbolEditar.push({
        id: modulo.id,
        name: modulo.nombre,
        children: [],
        accionesChildren: modulo.children,
      });
    });

    this.arbolEditar.forEach((tv: any) => {
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
    this.acc = this.arbolEditar;

    if (this.llamadaActividades) {
      let modulosCargados = this.modulosAsignadosResp.flatMap(x => x);
      let accionCargadas = this.modulosAsignadosResp.flatMap(x => x.children);
      let subAccionesCargadas = accionCargadas.flatMap(x => x.children);

      this.acc.forEach((modulo: any) => {
        if (modulo.children.length > 0) {
          modulo.accionesChildren.forEach((acciones: any) => {
            let valorAccion = accionCargadas.find(
              (x: any) =>
                x.moduloId === acciones.moduloId &&
                x.accionId === acciones.accionId &&
                x.accionCodigo !== CodigoAccion.Consultar &&
                acciones.children.length === 0
            );

            if (valorAccion !== null && valorAccion !== undefined) {
              this.accionesSeleccionadasArbol.push(acciones.id);
            }
            acciones.children.forEach((subaccion: any) => {
              let valorSubaccion = subAccionesCargadas.find(
                (y: any) =>
                  y.moduloId === subaccion.moduloId &&
                  y.subAccionId === subaccion.subAccionId
              );
              if (valorSubaccion !== null && valorSubaccion !== undefined) {
                this.accionesSeleccionadasArbol.push(subaccion.id);
              }
            });
          });
        } else {
          let existeModuloCheck = modulosCargados.find(
            x => x.codigo === modulo.codigo && x.moduloId === modulo.moduloId
          );
          if (existeModuloCheck !== undefined) {
            this.accionesSeleccionadasArbol.push(modulo.id);
          }
        }
      });
      this.llamadaActividades = false;
    }

    this.showTreeView = true;

    setTimeout(() => {
      this.habilitaCheckConsultar();
      this.loadingService.hideLoading(loadingKey);
    }, 2000);
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuPefil() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  initialize(): void {
    this.columnDefsFuncionalidades = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: this.esEdicion,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        sort: 'desc',
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
        cellStyle: params =>
          !this.esEdicion
            ? {
                textAlign: 'left',
                'pointer-events': 'none',
              }
            : { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        resizable: false,
        sortable: true,
        lockPinned: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        width: 130,
        field: 'nombre',
        resizable: true,
        sortable: true,
        minWidth: 80,
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
    if (!this.esEdicion) {
      this.columnDefsFuncionalidades.shift();
    }

    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  /////////////////////////////////////////////////////////////////////////////
  //Aplica estilos para bloqueos de checkConsultar
  setCheckConsultar() {
    var claseCheck =
      'v-icon v-treeview-node__checkbox v-icon--link material-icons theme--light indigo--text';
    var arrowDropDown =
      'v-icon v-treeview-node__toggle v-icon--link material-icons theme--light v-treeview-node__toggle--open';
    var labelElemento = document.getElementsByClassName(
      'v-treeview-node__label'
    ) as HTMLCollectionOf<HTMLElement>;

    if (labelElemento.length > 0) {
      let padre = null;
      let boolModificarCheck = false;
      for (let item of labelElemento) {
        const nodeRoot = item.parentElement.parentElement;
        if (
          item.innerText.toUpperCase() == 'CONSULTAR' ||
          item.innerText.toUpperCase() == 'GENERAR - INFORMACIÓN GENERAL' ||
          item.innerText.toUpperCase() ==
            'GENERAR - ASOCIAR FLOTAS ETIQUETAS O VEHÍCULOS' ||
          item.innerText.toUpperCase() == 'GENERAR - GENERAR INFORME'
        ) {
          let iconos = nodeRoot.getElementsByTagName('i') as HTMLCollectionOf<
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
            boolModificarCheck = true;

            icono.outerHTML =
              '<div disabled="disabled">' + icono.outerHTML + '</div>';
          }
        }
      }
    }
  }

  habilitaCheckConsultar() {
    var indeterminateCheckBox =
      'v-icon v-treeview-node__checkbox v-icon--link material-icons theme--light';
    let arbolPermisos = document.getElementById('arbolPermisos');

    let aqui = this;
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

    // pinta acciones guardadas
    if (this.accionesGuardadas.length != 0) {
      let a = this.accionesSeleccionadasArbol.concat(this.accionesGuardadas);
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j] || a[j] < 0) a.splice(j--, 1);
        }
      }
      this.accionesSeleccionadasArbol = a;
    }

    this.loadingService.hideLoading();
  }
  //Se reestablecen los elementyos Default
  reestableceConsultarCheck() {
    this.modulosAsignados.forEach(modulo => {
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

  preventEnterPerfiles(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  @Watch('accionesSeleccionadasArbol')
  async changeAcciones() {
    let accionesSeleccionadas: number[] = [];

    const accionesModulos = this.modulosAsignados.flatMap(
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

  onFilterTextBoxChangedModulosEditar() {
    this.gridApiFuncionalidades.onFilterChanged();

    // if (this.buscarModulosEditar.length > 1) {
    //   this.gridApiFuncionalidades.setQuickFilter(this.buscarModulosEditar);
    // } else {
    //   this.gridApiFuncionalidades.setQuickFilter('');
    // }
  }

  onSelectedChangeFuncionalidadesEditar() {
    this.acc = [];
    this.modulosAsignados = this.gridApiFuncionalidades.getSelectedRows();

    const modulosSeleccionados = this.gridApiFuncionalidades
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const modulosdNoSeleccionados = differenceBy(
      this.modulosRespaldo,
      modulosSeleccionados,
      func => func.id
    ).map(func => ({
      ...func,
      checked: false,
    }));

    this.gridApiFuncionalidades.updateRowData({
      update: [...modulosdNoSeleccionados, ...modulosSeleccionados],
    });
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
    this.btnBloquear = false;
    this.btnBloquearC = false;
  }

  async editarPerfilLocal() {
    try {
      let perfilLocal = {
        Id: this.editedItem.id,
        Nombre: this.editedItem.nombre,
      };

      let model: any = [];

      this.modulosAsignados.forEach((modulo: any) => {
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

      let body = {
        Perfil: perfilLocal,
        ModuloAcciones: model,
      };

      await this.axios.http.put(
        `${this.funcionalidadAccionController}/${this.perfil.id}/actualizarPerfil`,
        body
      );
    } catch (error) {
      this.btnBloquear = false;
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
    }
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

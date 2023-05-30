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
          <v-toolbar-title>
            {{
              esEdicion
                ? 'Editar Perfil Transversal'
                : 'Ver Detalle Perfil Transversal'
            }}
          </v-toolbar-title>
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
                @click="cierraMenuPerfilTransversal"
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
                @click="asignarModulos(), cierraMenuPerfilTransversal()"
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
                @click="asignaAcciones(), cierraMenuPerfilTransversal()"
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
                          v-validate="'required|PerfilNombreUnico|max:80'"
                          v-model="editedItem.nombre"
                          :error-messages="errors.collect('nombre')"
                          data-vv-name="nombre"
                          label="Nombre"
                          type="text"
                          :counter="80"
                          :disabled="!esEdicion"
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
                        v-model="buscarModulo"
                        prepend-icon="lock_open"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
                        append-icon="search"
                      >
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <br />
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
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
                          @selection-changed="onSelectionChangedEditar($event)"
                          :getRowNodeId="getRowNodeIdEditar"
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
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { differenceBy, intersectionBy, intersectionWith } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Accion } from '../../views/base/ComponenteBase';
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
export default class PerfilesTransversalModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '', estado: '' }) })
  perfil!: PerfilesInterface;

  readonly controller: string = 'Perfil';
  readonly funcionalidadController: string = 'funcionalidad';
  readonly accionController: string = 'accion';
  readonly funcionalidadAccionController: string = 'funcionalidadAccion';
  readonly PerfilTransversalController: string = 'PerfilTransversal';
  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.PerfilTransversal; //EMR //Funcionalidades.RolesTransversal;
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
  buscarModulo: string = '';
  tieneAccionesCheck: boolean = false;
  textoMsjAlerta: string = '';
  tituloMsjAlerta: string = '';

  funcionalidadesAsignadosModel: any = [];
  funcionalidadesAsignados: IFuncionalidad[] = [];
  funcionalidadesAsignadosResp: IFuncionalidad[] = [];
  funcionalidadesRespaldo: IFuncionalidad[] = [];
  modulosAsignados: any[] = [];
  modulosAsignadosResp: any[] = [];
  modulosRespaldo: any[] = [];
  arbolEditar: any = [];
  accionesSeleccionadasArbol: any[] = [];
  accionesTreeView: any = [];

  accionesRespaldo: any[] = [];
  acciones: any = [];
  acc: any = [];
  accionesSeleccionadas: any[] = [];
  accionesGuardadas: any[] = [];
  accionPerfilFuncResp: any = [];
  dataAll: any = [];
  llamadaActividades: boolean = true;

  gridApiFuncionalidades: GridApi;
  columnApiFuncionalidades: ColumnApi;
  columnDefs: Array<ColDef> = [];
  columnDefsFuncionalidades: Array<ColDef> = [];
  seleccionoTodosModulos: boolean = false;
  showAlertaModulo: boolean = false;

  created() {}

  mounted() {
    this.initialize();
    this.funcRules = [
      (v: any) => !!v || config.errorMensajes.textoRequerido,
      (v: any) =>
        this.validarAlMenosUnaFuncionalidad() ||
        '* Debe seleccionar al menos un Módulo.',
    ];
    if (
      this.accionesSeleccionadasArbol.length ===
      this.funcionalidadesAsignados.length
    ) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  validarAlMenosUnaFuncionalidad(): boolean {
    return this.funcionalidadesAsignados.length > 0;
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.editedItem = this.perfil;
    this.bottomNav = '1';
    this.funcionalidadesAsignadosModel = [];
    this.funcionalidadesAsignadosResp = [];
    this.funcionalidadesAsignados = [];
    this.funcionalidadesRespaldo = [];
    this.accionesRespaldo = [];
    this.acciones = [];
    this.accionesSeleccionadas = [];
    this.accionesGuardadas = [];
    this.acc = [];
    this.accionPerfilFuncResp = [];
    this.dataAll = [];
    this.modulosAsignados = [];
    this.modulosAsignadosResp = [];
    this.modulosRespaldo = [];
    this.arbolEditar = [];
    this.accionesSeleccionadasArbol = [];
    this.accionesTreeView = [];

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.btnBloquear = false;
      await this.obtenerFuncionalidades();
      await this.obtenerAcciones();
      await this.obtenerPerfilFuncionalidadAccion();

      // this.funcionalidadesRespaldo.forEach(func => {
      //   let exists: any = this.funcionalidadesAsignados.filter(
      //     (x: any) => x.id === func.id
      //   );
      //   if (exists.length == 0) {
      //     func.checked = false;
      //   } else {
      //     func.checked = true;
      //   }
      // });

      await this.seteaAsignados();

      const self = this;
      this.gridApiFuncionalidades.forEachNode(function(node: any) {
        var index = self.modulosAsignados.findIndex(x => x.id == node.data.id);
        if (index !== -1) {
          node.setSelected(true);
        }
      });
      this.initialize();

      this.loadingService.hideLoading();
    }
  }

  seteaAsignados() {
    if (!this.esEdicion) {
      this.modulosRespaldo = this.modulosAsignados;
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

  grabarEdicion() {
    const formVal: any = this.$refs;

    if (this.accionesSeleccionadasArbol.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadasArbol;
    }

    this.$validator.validateAll().then(resultadoValidacion => {
      if (this.modulosAsignados.length === 0) {
        this.showAlertaModulo = true;
        this.tituloMsjAlerta = 'Seleccionar Módulo';
        this.textoMsjAlerta = 'Debe seleccionar al menos un Módulo.';
      } else {
        if (resultadoValidacion) {
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

              this.bottomNav = this.asociarAcciones.step;
              this.btnBloquear = true;
            } else {
              if (this.tieneAccionesCheck) {
                this.dialogConfirmacion = true;
                this.btnBloquear = true;
              } else {
                // if (this.bottomNav !== this.asociarAcciones.step) {
                //   this.asignaAcciones();
                // }
                this.showAlertaModulo = true;
                this.tituloMsjAlerta = 'Seleccionar Acción';
                this.textoMsjAlerta =
                  'Debe seleccionar al menos una acción por Módulo.';

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
    try {
      this.dialogConfirmacion = false;

      if (val) {
        const validador = await this.$validator.validateAll();
        if (validador) {
          this.loadingService.showLoading();
          this.btnBloquear = true;

          await this.editarPerfilTransversal();
          this.loadingService.hideLoading();
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.closeModal(false);
        }
      }
    } catch (error) {
      this.btnBloquear = false;
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
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
    this.buscarModulo = '';
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

  async obtenerFuncionalidades() {
    try {
      const response = await this.axios.http.get(
        `${this.funcionalidadController}`
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
      this.funcionalidadesRespaldo = response.data;
    } catch (error) {
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

  async obtenerAcciones() {
    try {
      const response = await this.axios.http.get(`${this.accionController}/`);
      response.data.forEach((accion: any) => {
        accion.selected = false;
      });
      this.acciones = response.data;
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
  async obtenerPerfilFuncionalidadAccion() {
    try {
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
      this.dataAll = response.data;

      this.modulosRespaldo = response.data;

      const responseAcciones = await this.axiosCliente.http.get(
        `${this.PerfilTransversalController}/${this.perfil.id}/funcionalidadAccion`
      );
      this.accionPerfilFuncResp = responseAcciones.data;

      // variable respaldo
      this.modulosAsignadosResp = responseAcciones.data;

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

      this.gridApiFuncionalidades.sizeColumnsToFit();
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  asignarModulos() {
    if (this.accionesSeleccionadasArbol.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadasArbol;
    }
  }

  private asignaAcciones() {
    const loadingKey = 'asignaAcciones';
    this.loadingService.showLoading(undefined, loadingKey);
    this.arbolEditar = [];
    this.accionesSeleccionadasArbol = [];

    this.modulosAsignados.forEach(modulo => {
      this.arbolEditar.push({
        id: modulo.id,
        moduloId: modulo.moduloId,
        codigo: modulo.codigo,
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

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('PerfilNombreUnico', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Perfil con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosCliente.http
            .get(
              `${self.PerfilTransversalController}/${self.editedItem.id}/${value}/nombreUnico`
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

  initialize(): void {
    this.registrarValidadores();

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
        lockPinned: true,
        resizable: false,
        sortable: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        width: 164,
        field: 'nombre',
        resizable: true,
        minWidth: 80,
        lockVisible: true,
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
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 255,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacion',
        resizable: true,
        width: 255,
        minWidth: 80,
        sortable: true,
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
        width: 255,
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
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
    if (!this.esEdicion) {
      this.columnDefsFuncionalidades.shift();
    }
  }

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

            icono.outerHTML =
              '<div disabled="disabled">' + icono.outerHTML + '</div>';
          }
        }
      }
    }
  }

  habilitaCheckConsultar() {
    this.loadingService.showLoading();
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
  //Se reestablecen los elementyos Default ///////////////////////////////////////////////////
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

  preventEnterPerfilesT(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }
  onSelectionChangedEditar() {
    this.acc = [];
    // this.funcionalidadesAsignados = this.gridApiFuncionalidades.getSelectedRows();

    this.modulosAsignados = this.gridApiFuncionalidades.getSelectedRows();

    const funcionalidadSeleccionados = this.gridApiFuncionalidades
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const funcionalidadNoSeleccionados = differenceBy(
      this.modulosRespaldo,
      funcionalidadSeleccionados,
      func => func.id
    ).map(func => ({
      ...func,
      checked: false,
    }));

    this.gridApiFuncionalidades.updateRowData({
      update: [...funcionalidadNoSeleccionados, ...funcionalidadSeleccionados],
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

  getRowNodeIdEditar(func: IFuncionalidad) {
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

  isExternalFilterPresentModulo(): boolean {
    return true;
  }

  doesExternalFilterPassModulo(node: RowNode): boolean {
    if (this.modulosRespaldo.length > 0 && this.buscarModulo.length > 1) {
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

  async editarPerfilTransversal() {
    try {
      let perfilTransversal = {
        Id: this.editedItem.id,
        Nombre: this.editedItem.nombre,
      };

      let model: any = [];

      this.modulosAsignados.forEach((modulo: any) => {
        //Módulos con acciones
        if (modulo.children.length > 0) {
          //Acciones sin Subacciones
          modulo.children.forEach((accion: any) => {
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
        Perfil: perfilTransversal,
        ModuloAcciones: model,
      };

      await this.axios.http.put(
        `${this.funcionalidadAccionController}/${this.perfil.id}/actualizarPerfil`,
        body
      );

      //Se actualizan las asociaciones de los Perfiles Locales correspondientes
      await this.axios.http.post(
        `${this.funcionalidadAccionController}/${this.perfil.id}/actualizarFuncionalidadAcciones`
      );
      //---
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

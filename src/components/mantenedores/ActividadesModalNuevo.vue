<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivP">
        <v-toolbar dark color="primary" fixed ref="toolbarCmp">
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Actividad</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              style="max-height: 75%;"
              color="#526da5"
              @click="volver(), cierraMenuPerfil()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              style="max-height: 75%;"
              @click="continuar(), cierraMenuPerfil()"
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
              v-show="asociarPauta.visible"
              :complete="e1 > asociarPauta.step"
              :step="asociarPauta.step"
              >Asociar Pauta</v-stepper-step
            >
            <v-divider
              v-show="asociarPauta.visible && !informacionGeneral.visible"
            ></v-divider>
          </v-stepper-header>

          <!-- <v-divider light></v-divider> -->

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
                        <v-switch
                          v-model="estado"
                          color="#FDEF68"
                          :label="estado ? 'Activo' : 'Inactivo'"
                          @change="selectedEstado"
                          :hint="warningInactivo"
                          persistent-hint
                        ></v-switch>

                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="
                                'required|max:80|PerfilNombreUnicoCrear'
                              "
                              v-model="editedItem.nombreActividad"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              :counter="80"
                              required
                            ></v-text-field>
                            <v-text-field
                              v-validate="'required|max:200'"
                              v-model="editedItem.descripcion"
                              :error-messages="errors.collect('descripcion')"
                              data-vv-name="descripcion"
                              label="Descripción"
                              type="text"
                              :counter="200"
                              required
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
              v-show="asociarPauta.visible"
              :step="asociarPauta.step"
              align-right
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Pauta</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-flex md6>
                        <v-form ref="form" lazy-validation>
                          <v-text-field
                            prepend-icon="lock_open"
                            label="Buscar..."
                            v-model="buscarModulosNuevo"
                            @input="onFilterTextBoxChangedModulos"
                            append-icon="search"
                          ></v-text-field>
                        </v-form>
                      </v-flex>
                      <br />
                      <v-flex md12>
                        <v-card>
                          <ag-grid-vue
                            style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                            class="ag-theme-material"
                            :columnDefs="columnDefsFuncionalidades"
                            :rowData="pautasRespaldo"
                            rowSelection="multiple"
                            rowMultiSelectWithClick="false"
                            pagination="true"
                            paginationPageSize="10"
                            suppressRowClickSelection="true"
                            suppressCopyRowsToClipboard="true"
                            :sideBar="false"
                            :localeText="localeText"
                            :onGridReady="onGridReadyFuncionalidad"
                            @selection-changed="onSelectedChangeFuncionalidades"
                            :postProcessPopup="onClickCell"
                            :getRowNodeId="getRowNodeId"
                            :processCellForClipboard="procesarFecha"
                            :suppressCsvExport="true"
                            :suppressExcelExport="true"
                            :singleClickEdit="true"
                          ></ag-grid-vue>
                        </v-card>
                      </v-flex>
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Actividad' })"
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
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoActividadesMantenimiento } from '@/config/enums';
import { IActividadesInterface } from '@/interfaces/Actividades';
import { IPautaActividadesInterface } from '@/interfaces/PautasActividades';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad, TipoRol } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import { RolesInterface } from '@/interfaces/Roles';
import store from '@/store';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { date } from 'yup';
import { CodigoAccion } from '../../views/base/VariablesPermisos';

const { AgGridVue } = require('ag-grid-vue');
const tiposActividad = ['Cambiar', 'Realizar', 'Inspeccionar'];

type PautaActividad = {
  id: number;
  tipoActividadMant: number;
  tipoActividadMantNombre: string;
  estdo: EstadoEntidad;
};

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ActividadesModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ nombreActividad: '', descripcion: '' }) })
  actividades!: IActividadesInterface;

  //abstract permisos
  readonly funcionalidad: Funcionalidades = Funcionalidades.Actividades;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    visible: true,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 19,
    step: 1,
  };

  asociarPauta: PermisoAccionVm = {
    visible: true,
    step: 2,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 57,
    validacion: this.asociarModulosValidador,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarPauta,
  ];

  acc: any = [];
  actividadesMantController: string = 'actividadesMant';
  pautaActividadController: string = 'pautaActividad';
  readonly controllerClienteRol: string = 'clienterol';
  readonly rolTransversalController: string = 'RolTransversal';
  readonly controllerUsuario: string = 'usuario';
  loadingService = new LoadingService();

  //Variables globales
  localeText = config.agGridTextos;
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  search: string = '';
  dialog: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  validForm: boolean = false;
  btnBloquear: boolean = false;
  editedItem: IActividadesInterface = {};
  editedItemPautas: IPautaActividadesInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Mantenimiento);
  acciones: any = [];
  seleccionoTodos: boolean = false;
  clienteId: number = config.getClienteSesion();
  varAux: number = 0;
  clickMenu: boolean = false;

  gridApiFuncionalidades: GridApi;
  columnApiFuncionalidades: ColumnApi;
  columnDefsFuncionalidades: Array<ColDef> = [];

  funcionalidadAccionAsignadosModel: any = [];
  funcionalidadAccionAsignados: any[] = [];
  funcionalidadAccionRespaldo: any[] = [];
  accionesSeleccionadas: any[] = [];
  seleccionoTodosModulos: boolean = false;
  pautasRespaldo: any[] = [];
  pautasAsignadas: any[] = [];
  aux: boolean = false;
  usuarioId: number = store.state.userId;
  responserolesUsuario: any = {};
  accionesGuardadas: any[] = [];
  idPautas: PautaActividad[] = [];

  //Data
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;
  btnClass: string = 'btn-continuar';

  //Roles Transversales
  rolesRespaldo: RolesInterface[] = [];

  buscarModulosNuevo: string = '';

  created() {
    this.chequearPermisos();
    this.registrarValidadores();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivP').scrollIntoView(true);
    if (this.accionesSeleccionadas.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadas;
    }
  }

  mounted() {
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
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
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
        field: 'nombrePauta',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        // cellRenderer: this.createNombre,
      },
      {
        headerName: 'Acción',
        field: 'tipoActividadMantNombre',
        width: 150,
        editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: this.formatLista,
        cellEditorParams: {
          values: tiposActividad,
        },
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

  private asociarModulosValidador() {
    const formVal: any = this.$refs;

    //creo objeto para asignacion de treeview
    let indexNegativo: number = -1;
    let tview: any = [];

    this.funcionalidadAccionAsignados.forEach(modulo => {
      tview.push({
        id: indexNegativo,
        moduloId: modulo.id,
        name: modulo.nombre,
        children: [],
        acciones: modulo.acciones,
        accionesCrear: modulo.accionesCrear,
        accionesVerDetalle: modulo.accionesVerDetalle,
        accionesEditar: modulo.accionesEditar,
      });

      indexNegativo -= 1;
    });

    tview.forEach((tv: any) => {
      let childrenCrear: any = {};
      if (tv.accionesCrear.length > 1) {
        childrenCrear = { id: indexNegativo, name: 'Crear', children: [] };
        indexNegativo -= 1;

        tv.accionesCrear.forEach((accion: any) => {
          childrenCrear.children.push({
            id: accion.id,
            name: accion.nombre.replace('Crear - ', ''),
          });
        });
      } else if (tv.accionesCrear.length === 1) {
        childrenCrear = {
          id: tv.accionesCrear[0].id,
          name: 'Crear',
          children: [],
        };
      }

      let childrenVerDetalle: any = {};
      if (tv.accionesVerDetalle.length > 1) {
        childrenVerDetalle = {
          id: indexNegativo,
          name: 'Ver Detalle',
          children: [],
        };
        indexNegativo -= 1;

        tv.accionesVerDetalle.forEach((accion: any) => {
          childrenVerDetalle.children.push({
            id: accion.id,
            name: accion.nombre.replace('Ver Detalle - ', ''),
          });
        });
      } else if (tv.accionesVerDetalle.length === 1) {
        childrenVerDetalle = {
          id: tv.accionesVerDetalle[0].id,
          name: 'Ver Detalle',
          children: [],
        };
      }

      let childrenEditar: any = {};
      if (tv.accionesEditar.length > 1) {
        childrenEditar = {
          id: indexNegativo,
          name: 'Editar',
          children: [],
        };
        indexNegativo -= 1;

        tv.accionesEditar.forEach((accion: any) => {
          childrenEditar.children.push({
            id: accion.id,
            name: accion.nombre.replace('Editar - ', ''),
          });
        });
      } else if (tv.accionesEditar.length === 1) {
        childrenEditar = {
          id: tv.accionesEditar[0].id,
          name: 'Editar',
          children: [],
        };
      }

      let childrenRestantes: any = {};
      if (tv.acciones.length > 1) {
        childrenRestantes = {
          id: indexNegativo,
          name: 'Acciones',
          children: [],
        };
        indexNegativo -= 1;

        tv.acciones.forEach((accion: any) => {
          let objeto = {
            id: accion.id,
            name: accion.nombre,
            selected: false,
            active: true,
          };

          if (
            accion.nombre.trim().toLowerCase() === 'consultar' ||
            accion.nombre.trim().toLowerCase() ===
              'generar - información general' ||
            accion.nombre.trim().toLowerCase() ===
              'generar - asociar flotas etiquetas o vehículos' ||
            accion.nombre.trim().toLowerCase() === 'generar - generar informe'
          ) {
            objeto.selected = true;
            objeto.active = false;
            this.accionesSeleccionadas.push(objeto.id); //seleccionamos automaticamente el consultar.
          }

          childrenRestantes.children.push(objeto);
          tv.children.push(objeto);
        });
      } else if (tv.acciones.length === 1) {
        childrenRestantes = {
          id: tv.acciones[0].id,
          name: tv.acciones[0].nombre,
          children: [],
        };
        tv.children.push(childrenRestantes);
        if (tv.acciones[0].nombre.trim().toLowerCase() === 'consultar') {
          childrenRestantes.selected = true;
          this.accionesSeleccionadas.push(childrenRestantes.id); //seleccionamos automaticamente el consultar.
        }
      }

      if (childrenEditar.name !== undefined) {
        tv.children.push(childrenEditar);
      }
      if (childrenVerDetalle.name !== undefined) {
        tv.children.push(childrenVerDetalle);
      }
      if (childrenCrear.name !== undefined) {
        tv.children.push(childrenCrear);
      }
    });

    this.acc = tview;

    return formVal.form.validate();
  }

  private asociarAccionesValidador() {
    let retorno = true;
    if (this.accionesSeleccionadas.length === 0) {
      this.$snotify.warning('Debe seleccionar al menos una acción por módulo.');
      retorno = false;
    } else {
      if (this.validaGrabar()) {
        this.$validator.validateAll().then(res => {
          if (res) {
            this.dialogConfirmacion = true;
            retorno = true;
          }
        });
      } else {
        this.$snotify.warning(
          'Debe seleccionar al menos una acción por módulo.'
        );
        retorno = false;
      }
    }

    return retorno;
  }

  formatLista(params: ValueFormatterParams) {
    return `<div style="display: flex;">${params.value}
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
  }

  registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('PerfilNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Actividad con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${
                self.actividadesMantController
                //va 0 porque nunca se va a encontrar
              }/ChequearNombreUnico/${0}/${value}`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: !response.data,
                  data: !response.data
                    ? undefined
                    : { message: '* Ya existe una Actividad con este nombre.' },
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
    this.btnBloquear = false;
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.funcionalidadAccionAsignados = [];
    this.funcionalidadAccionAsignadosModel = [];
    this.funcionalidadAccionRespaldo = [];
    this.accionesSeleccionadas = [];
    this.accionesGuardadas = [];
    this.acc = [];
    this.$validator.reset();
    if (value) {
      try {
        this.loadingService.showLoading();
        await this.obtenerPautas();
        this.seleccionoTodos = false;
        this.seleccionoTodosModulos = false;
        this.estado = true; //this.editedItem.estado === true ? true : false;
      } finally {
        this.loadingService.hideLoading();
      }
    }
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'la Actividad',
    });
  }

  onFuncionalidadChange(funcionalidad: any) {
    this.acc = [];
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      funcionalidad !== undefined &&
      funcionalidad.length !== this.funcionalidadAccionAsignados.length
    ) {
      for (let x = this.funcionalidadAccionAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= funcionalidad.length - 1; i++) {
          if (this.funcionalidadAccionAsignados[x].id == funcionalidad[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.funcionalidadAccionAsignados.splice(x, 1);
        }
      }

      if (
        this.funcionalidadAccionAsignados.length ===
        this.funcionalidadAccionRespaldo.length
      )
        this.seleccionoTodosModulos = true;
      else this.seleccionoTodosModulos = false;
    }
  }

  onFuncionalidadInput(funcionalidad: any) {
    this.acc = [];
    if (funcionalidad !== undefined) {
      for (let i = 0; i <= funcionalidad.length - 1; i++) {
        const added = this.funcionalidadAccionAsignados.filter(
          x => x.id == funcionalidad[i]
        );

        if (added.length === 0) {
          const funcionalidadAgregar = this.funcionalidadAccionRespaldo.find(
            x => x.id == funcionalidad[i]
          );
          this.funcionalidadAccionAsignados.push(funcionalidadAgregar);

          if (
            this.funcionalidadAccionAsignados.length ===
            this.funcionalidadAccionRespaldo.length
          )
            this.seleccionoTodosModulos = true;
          else this.seleccionoTodosModulos = false;
        }
      }
    }
  }

  marcarTodosModulos(value: boolean) {
    this.acc = [];
    this.funcionalidadAccionAsignados = [];
    this.funcionalidadAccionAsignadosModel = [];
    if (value) {
      this.funcionalidadAccionRespaldo.forEach((funcionalidad: any) => {
        this.funcionalidadAccionAsignados.push(funcionalidad);
        this.funcionalidadAccionAsignadosModel.push(funcionalidad.id);
      });
    }
    this.seleccionoTodosModulos = value;
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivP').scrollIntoView(true);

        if (this.guardarInactivo) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
        } else {
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
      }
    });
  }

  validaGrabar(): boolean {
    //valida que cada modulo tenga al menos una accion asignada
    let puedeContinuar: boolean = false;

    for (
      let x: number = 0;
      x <= this.funcionalidadAccionAsignados.length - 1;
      x++
    ) {
      puedeContinuar = false;

      let accionesCrear: any = this.funcionalidadAccionAsignados[x]
        .accionesCrear;

      for (let i: number = 0; i <= accionesCrear.length - 1; i++) {
        const added = this.accionesSeleccionadas.filter(
          (x: any) => x === accionesCrear[i].id
        ).length;

        if (added > 0) {
          puedeContinuar = true;
          break;
        }
      }

      if (!puedeContinuar) {
        let accionesEditar: any = this.funcionalidadAccionAsignados[x]
          .accionesEditar;
        for (let i: number = 0; i <= accionesEditar.length - 1; i++) {
          let added = this.accionesSeleccionadas.filter(
            (x: any) => x === accionesEditar[i].id
          ).length;
          if (added > 0) {
            puedeContinuar = true;
            break;
          }
        }

        if (!puedeContinuar) {
          let accionesRestantes: any = this.funcionalidadAccionAsignados[x]
            .acciones;
          for (let i: number = 0; i <= accionesRestantes.length - 1; i++) {
            let added = this.accionesSeleccionadas.filter(
              (x: any) => x === accionesRestantes[i].id
            ).length;
            if (added > 0) {
              puedeContinuar = true;
              break;
            }
          }

          if (!puedeContinuar) {
            break;
          }
        }
      }
    }

    return puedeContinuar;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.loadingService.showLoading();
          this.btnBloquear = true;
          this.onActividadesChange(); //Actualiza con la seleccion de Accion Nuevamente

          if (this.guardarInactivo) {
            this.idPautas = [];
          }
          let model = {
            NombreActividad: this.editedItem.nombreActividad,
            Descripcion: this.editedItem.descripcion,
            estado: this.estado === true ? 1 : 0,
            PautaActividadMants: this.idPautas,
          };
          //Graba Nuevo Actividad
          this.axios.http
            .post(`${this.actividadesMantController}/`, model)
            .then(res => {
              model.NombreActividad = res.data.nombre;
              this.grabaAsignacionFuncionalidadesAccion(res.data.nombre);
              this.closeModal(false);
            })
            .catch(error => {
              this.loadingService.hideLoading();
              this.btnBloquear = false;
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.handleErrors.showError(error);
                }
              } else {
                this.handleErrors.showError(error);
              }
            })
            .finally(() => this.loadingService.hideLoading());
        }
      });
    }
    this.btnBloquear = false;
  }

  grabaAsignacionFuncionalidadesAccion(idPerfil: any) {
    //Graba Asignacion de funcionalidades acciones
    if (this.accionesSeleccionadas.length > 0) {
      let model: any = [];

      this.accionesSeleccionadas.forEach((accion: any) => {
        if (accion > 0) {
          model.push({
            UsuarioCreadorId: 0,
            FechaCreacion: new Date(),
            Id: 0,
            PerfilId: idPerfil,
            FuncionalidadId: 0,
            AccionId: accion,
            FechaInicioAsociacion: new Date(),
          });
        }
      });

      this.axios.http
        .post(
          `${this.pautaActividadController}/${idPerfil}/grabaFuncionalidadAccionesNuevo`,
          model
        )
        .then(res => {
          this.loadingService.hideLoading();
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Actividad',
              creadoA: 'creada',
            })
          );
          this.closeModal(false);
        })
        .catch(err => {
          this.loadingService.hideLoading();
          this.btnBloquear = false;
          if (err.response !== undefined) {
            if (err.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'Actividad',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'Actividad',
              })
            );
          }
        });
    } else {
      this.loadingService.hideLoading();
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.crear', {
          entidad: 'Actividad',
          creadoA: 'creada',
        })
      );
      this.closeModal(false);
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

  cierraMenuPerfil() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  //para dejar en vacío
  closeModal(val: boolean) {
    document.getElementById('cardDivP').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.editedItemPautas = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset();
    this.dialog = false;
    this.buscarModulosNuevo = '';
    this.gridApiFuncionalidades.setQuickFilter('');
    this.warningInactivo = '';
    this.estado = true;
    this.guardarInactivo = false;
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyFuncionalidad(params: GridReadyEvent) {
    this.gridApiFuncionalidades = params.api;
    this.columnApiFuncionalidades = params.columnApi;
  }

  async obtenerPautas() {
    this.pautasRespaldo = [];
    try {
      const response = await this.axios.http.get(
        `${this.pautaActividadController}`,
        { params: { clienteId: 1 } }
      );

      this.pautasRespaldo = response.data;

      //Selecciono solo pautas Activas
      this.pautasRespaldo = this.pautasRespaldo.filter(
        (x: any) => x.estado === EstadoEntidad.Activo
      );

      this.pautasRespaldo = this.pautasRespaldo.map(pauta => ({
        ...pauta,
        tipoActividadMantNombre: tiposActividad[0],
      }));

      this.pautasRespaldo.forEach((func: any) => {
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
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  createButtonCellFuncionalidad(params: any) {
    const item = this.funcionalidadAccionRespaldo.find(
      x => x.id == params.data.id
    );

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light" style="color: black;">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerFuncionalidadAsignacion(item);
    });

    return eButton;
  }

  removerFuncionalidadAsignacion(item: IFuncionalidad) {
    this.acc = [];
    for (let i = 0; i <= this.funcionalidadAccionAsignados.length - 1; i++) {
      if (this.funcionalidadAccionAsignados[i].id == item.id) {
        this.funcionalidadAccionAsignados.splice(i, 1);
        break;
      }
    }

    for (
      let i = 0;
      i <= this.funcionalidadAccionAsignadosModel.length - 1;
      i++
    ) {
      if (this.funcionalidadAccionAsignadosModel[i] == item.id) {
        this.funcionalidadAccionAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (
      this.funcionalidadAccionAsignados.length ===
      this.funcionalidadAccionRespaldo.length
    )
      this.seleccionoTodosModulos = true;
    else this.seleccionoTodosModulos = false;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //Aplica estilos para bloqueos de checkConsultar
  setCheckConsultar() {
    var claseCheck =
      'v-icon v-treeview-node__checkbox v-icon--link material-icons theme--light indigo--text';
    var arrowDropDown =
      'v-icon v-treeview-node__toggle v-icon--link material-icons theme--light v-treeview-node__toggle--open';
    var labelElemento = document.getElementsByClassName(
      'v-treeview-node__label'
    ) as HTMLCollectionOf<HTMLElement>;

    let y = 0;
    let boolConsultarModificado = false;

    if (labelElemento.length > 0) {
      let padre = null;
      let boolModificarCheck = false;
    }
  }

  @Watch('accionesSeleccionadas')
  async onPropertyChangedA() {
    let model: any = [];
    this.accionesSeleccionadas.forEach((accion: any) => {
      if (accion > 0) {
        model.push({
          UsuarioCreadorId: 0,
          FechaCreacion: new Date(),
          Id: 0,
          ActividadId: this.actividades.nombreActividad,
          FuncionalidadId: 0,
          AccionId: accion,
          FechaInicioAsociacion: new Date(),
        });
      }
    });

    if (
      this.e1 === this.permisosActuales.length &&
      this.cuentaAccionesDisponibles(this.funcionalidadAccionAsignados) ==
        model.length
    ) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
  }

  cuentaAccionesDisponibles(funci: any) {
    let acciones = 0;
    funci.forEach((funcionalidad: any) => {
      funcionalidad.acciones.forEach((a: any) => {
        acciones++;
      });
      funcionalidad.accionesCrear.forEach((a: any) => {
        acciones++;
      });
      funcionalidad.accionesVerDetalle.forEach((a: any) => {
        acciones++;
      });
      funcionalidad.accionesEditar.forEach((a: any) => {
        acciones++;
      });
    });
    return acciones;
  }

  onFilterTextBoxChangedModulos() {
    if (this.buscarModulosNuevo.length > 1) {
      this.gridApiFuncionalidades.setQuickFilter(this.buscarModulosNuevo);
    } else {
      this.gridApiFuncionalidades.setQuickFilter('');
    }
  }

  makePautaActividadesMantenimiento(rowData: PautaActividad) {
    const getTipoActividadId = (nombreTipoActividad: string) => {
      switch (nombreTipoActividad) {
        case 'Cambiar':
          return TipoActividadesMantenimiento.Cambiar;
        case 'Realizar':
          return TipoActividadesMantenimiento.Realizar;
        case 'Inspeccionar':
          return TipoActividadesMantenimiento.Inspeccionar;
      }
    };

    return {
      id: rowData.id,
      estado: 1, //rowData.estado,
      tipoActividadMant: getTipoActividadId(rowData.tipoActividadMantNombre),
    };
  }

  onActividadesChange() {
    const pautas: any[] = this.gridApiFuncionalidades
      .getSelectedNodes()
      .map(node => this.makePautaActividadesMantenimiento(node.data));

    this.idPautas = pautas;
  }

  onSelectionChanged() {
    this.onActividadesChange();
  }

  onSelectedChangeFuncionalidades() {
    this.acc = [];
    this.idPautas = [];
    this.pautasAsignadas = this.gridApiFuncionalidades.getSelectedRows();
    this.pautasAsignadas.forEach(x => {
      this.idPautas.push(x.id);
    });

    const funcionalidadSeleccionados = this.gridApiFuncionalidades
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const funcionalidadNoSeleccionados = differenceBy(
      this.funcionalidadAccionRespaldo,
      funcionalidadSeleccionados,
      func => func.id
    ).map(func => ({
      ...func,
      checked: false,
    }));

    this.gridApiFuncionalidades.updateRowData({
      update: [...funcionalidadNoSeleccionados, ...funcionalidadSeleccionados],
    });
    this.onActividadesChange();
  }
  getRowNodeId(func: IFuncionalidad) {
    if (!func) {
      return;
    }
    return func.id;
  }

  createNombre(params: any) {
    let name = '';
    return name;
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

  selectedEstado(isActivo: boolean) {
    if (!isActivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'la Actividad',
        });
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Actividad' }
      );
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

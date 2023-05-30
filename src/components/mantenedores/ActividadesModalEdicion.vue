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
          <v-toolbar-title>{{
            esEdicion ? 'Editar Actividad ' : 'Ver Detalle de Actividad'
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
                  (asociarPauta.visible && esEdicion) ||
                    (asociarPautaVerDetalle.visible && !esEdicion)
                "
                :value="asociarPauta.step"
                :disabled="!validForm || btnBloquear"
                @click="asignarModulos(), cierraMenuPerfilTransversal()"
              >
                <span>Asociar Pauta</span>
                <v-icon>assignment</v-icon>
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
                    <v-switch
                      v-model="estado"
                      color="#FDEF68"
                      :label="estado ? 'Activo' : 'Inactivo'"
                      @change="selectedEstado"
                      :hint="warningInactivo"
                      persistent-hint
                      :readonly="!esEdicion"
                    ></v-switch>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|max:80|PerfilNombreUnicoEditar'"
                          v-model="editedItem.nombreActividad"
                          :error-messages="errors.collect('nombre')"
                          data-vv-name="nombre"
                          label="Nombre"
                          type="text"
                          :counter="80"
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          required
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
              bottomNav == asociarPauta.step &&
                ((asociarPauta.visible && esEdicion) ||
                  (asociarPautaVerDetalle.visible && !esEdicion))
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
                        v-model="buscarModulo"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
                        append-icon="search"
                      ></v-text-field>
                    </v-form>
                  </v-flex>
                  <br />
                  <v-flex md12>
                    <v-card>
                      <ag-grid-vue
                        style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                        class="ag-theme-material"
                        :columnDefs="columnDefsFuncionalidades"
                        :rowData="accionesPauta"
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
                        @selection-changed="onSelectionChanged($event)"
                        @row-selected="onRowSelected($event)"
                        :getRowNodeId="getRowNodeIdEditar"
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
        </div>
      </v-card>
    </v-dialog>
    <!-- close guardar cambio -->
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Actividad',
          nombreEntidad: actividad.nombreActividad,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>
    <!-- close (x) -->
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </v-layout>
</template>

<script lang="ts">
import Confirmation from '@/components/Confirmation.vue';
import HandleErrors from '@/config/handleErrors';
import config from '@/config/index';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoActividadesMantenimiento } from '@/config/enums';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IActividadesInterface } from '../../interfaces/Actividades';
import { CodigoAccion } from '../../views/base/VariablesPermisos';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
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
    MensajeValidacion,
  },
})
export default class ActividadesModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '', estado: '' }) })
  actividad!: IActividadesInterface;

  readonly controller: string = 'actividadesMant';
  readonly funcionalidadController: string = 'funcionalidad';
  readonly accionController: string = 'accion';
  readonly funcionalidadAccionController: string = 'funcionalidadAccion';
  readonly PerfilTransversalController: string = 'PerfilTransversal';
  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Actividades; //EMR //Funcionalidades.RolesTransversal;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 19,
  };

  asociarPauta: PermisoAccionVm = {
    accion: 'Editar - Asociar Módulos',
    visible: true,
    step: 2,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 57,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    codigoSubAccion: 19,
  };

  asociarPautaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Módulos',
    visible: true,
    step: 2,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    codigoSubAccion: 57,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarPauta,
    this.informacionGeneralVerDetalle,
    this.asociarPautaVerDetalle,
  ];

  //Variables globales
  showTreeView: boolean = false;
  localeText = config.agGridTextos;
  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IActividadesInterface = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Mantenimiento);
  pautaActividadController: string = 'pautaActividad';
  seleccionoTodos: boolean = false;
  clienteId: number = config.getClienteSesion();
  funcRules: any = [];
  loadingService = new LoadingService();
  search: string = '';
  buscarModulo: string = '';

  funcionalidadesAsignadosModel: any = [];
  funcionalidadesAsignados: IFuncionalidad[] = [];
  funcionalidadesAsignadosResp: IFuncionalidad[] = [];
  funcionalidadesRespaldo: IFuncionalidad[] = [];
  accionesPauta: any[] = [];
  pautasAsignadas: any[] = [];

  accionesRespaldo: any[] = [];
  acciones: any = [];
  acc: any = [];
  accionesSeleccionadas: any[] = [];
  accionesGuardadas: any[] = [];
  accionPerfilFuncResp: any = [];
  dataAll: any = [];
  llamadaActividades: boolean = true;
  nombreMant: string = '';

  gridApiFuncionalidades: GridApi;
  columnApiFuncionalidades: ColumnApi;
  columnDefs: Array<ColDef> = [];
  columnDefsFuncionalidades: Array<ColDef> = [];
  seleccionoTodosModulos: boolean = false;
  idPautas: PautaActividad[] = [];
  gridApi: GridApi;
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;

  /*Validacion*/
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  //data
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;
  estadoSeleccionado: any = 0;

  created() {
    this.registrarValidadores();
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
      this.accionesSeleccionadas.length === this.funcionalidadesAsignados.length
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
    this.editedItem = this.actividad;
    this.nombreMant = this.editedItem.nombreActividad;
    this.bottomNav = '1';
    this.accionesRespaldo = [];
    this.acciones = [];
    this.accionesSeleccionadas = [];
    this.accionesGuardadas = [];
    this.acc = [];
    this.accionPerfilFuncResp = [];
    this.dataAll = [];
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: 'la Actividad',
    });

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.btnBloquear = false;
      this.estado = this.editedItem.estadoTxt === 'Activo' ? true : false;
      this.estadoSeleccionado = this.editedItem.estado;
      this.warningInactivo = '';
      this.initialize();

      // console.log('this.editedItem', this.editedItem);
      this.estado = this.editedItem.estadoTxt === 'Activo' ? true : false;
      // this.setRemoveButton();
      //this.initialize();

      //Pautas Asignadas de la Actividad
      await this.obtenerPautasAsignadas();

      //Todas las Pautas
      await this.obtenerPautas();

      //Selecciona Pautas Asignadas
      this.setPautasAsignadas();

      //Acciones Ver Detalle
      this.detalleAcciones();

      //Setea Mensaje Switch
      this.setSeleccionadosSelect();

      this.loadingService.hideLoading();
    }
  }

  setPautasAsignadas() {
    const self = this;
    this.gridApiFuncionalidades.forEachNode(function(node: any) {
      var index = self.pautasAsignadas.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        self.contadorEventoGrilla++;
      }
    });
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
    this.contadorEventoGrillaSelection++;
    if (this.pautasAsignadas.length == 0 || this.pautasAsignadas.length == 1) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }

    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;

      const pautasSeleccionadas = this.gridApiFuncionalidades
        .getSelectedNodes()
        .map(node => ({ ...node.data, checked: true }));

      const pauasNoSeleccionadas = differenceBy(
        this.accionesPauta,
        pautasSeleccionadas,
        pau => pau.id
      ).map(pau => ({
        ...pau,
        checked: false,
      }));
      this.gridApiFuncionalidades.updateRowData({
        update: [...pauasNoSeleccionadas, ...pautasSeleccionadas],
      });
      this.onActividadesChange();
    }
  }

  async onRowSelected(e: any) {
    if (e.node.selected === false && this.editedItem.id != 0) {
      const axios = new AxiosVue(ServicioProxy.Mantenimiento);
      const idPauta = e.data.id;
      const res = await axios.http.get(
        `PautaActividad/ChequearAsociacionActividadMant/${idPauta}/${this.editedItem.id}`
      );
      if (res.data == 1) {
        this.gridApiFuncionalidades.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Pauta de Actividades';
        this.mensajeValidacion =
          'La Pauta de Actividades que se desea desasociar tiene un Registro de Mantenimiento Preventivo, por esta razón no se puede desasociar.';
        this.showValidacion = true;
      }
    }
  }

  async obtenerPautasAsignadas() {
    const response = await this.axios.http.get(
      `${this.controller}/${this.editedItem.id}`
    );
    this.pautasAsignadas = response.data.pautaActividadMants;
  }

  detalleAcciones() {
    if (!this.esEdicion) {
      const pautasVerDetalle: any = [];

      this.accionesPauta.forEach((x: any) => {
        var existe = this.pautasAsignadas.find((p: any) => p.id === x.id);
        if (existe !== null && existe !== undefined) pautasVerDetalle.push(x);
      });
      this.accionesPauta = pautasVerDetalle;

      this.accionesPauta = this.accionesPauta
        .filter(
          accionesPauta =>
            this.pautasAsignadas.find(x => x.id === accionesPauta.id) !==
            undefined
        )
        .map(pautaRespaldo => ({
          ...pautaRespaldo,
          tipoActividadMantNombre:
            tiposActividad[
              this.pautasAsignadas.find(x => x.id === pautaRespaldo.id)
                .tipoActividadMant
            ],
        }));
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

  onFuncionalidadChange(funcionalidad: any) {
    this.acc = [];
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      funcionalidad !== undefined &&
      funcionalidad.length !== this.funcionalidadesAsignados.length
    ) {
      for (let x = this.funcionalidadesAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= funcionalidad.length - 1; i++) {
          if (this.funcionalidadesAsignados[x].id == funcionalidad[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.funcionalidadesAsignados.splice(x, 1);
        }
      }

      if (
        this.funcionalidadesAsignados.length ===
        this.funcionalidadesRespaldo.length
      )
        this.seleccionoTodosModulos = true;
      else this.seleccionoTodosModulos = false;
    }
  }

  onFuncionalidadInput(funcionalidad: any) {
    this.acc = [];
    if (funcionalidad !== undefined) {
      for (let i = 0; i <= funcionalidad.length - 1; i++) {
        const added = this.funcionalidadesAsignados.filter(
          x => x.id == funcionalidad[i]
        );

        if (added.length === 0) {
          const funcionalidadAgregar = this.funcionalidadesRespaldo.find(
            x => x.id == funcionalidad[i]
          );
          this.funcionalidadesAsignados.push(funcionalidadAgregar);

          if (
            this.funcionalidadesAsignados.length ===
            this.funcionalidadesRespaldo.length
          )
            this.seleccionoTodosModulos = true;
          else this.seleccionoTodosModulos = false;
        }
      }
    }
  }

  marcarTodosModulos(value: boolean) {
    this.acc = [];
    this.funcionalidadesAsignados = [];
    this.funcionalidadesAsignadosModel = [];
    if (value) {
      this.funcionalidadesRespaldo.forEach((funcionalidad: any) => {
        this.funcionalidadesAsignados.push(funcionalidad);
        this.funcionalidadesAsignadosModel.push(funcionalidad.id);
      });
    }
    this.seleccionoTodosModulos = value;
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

    if (this.pautasAsignadas.length > 0) {
      this.accionesGuardadas = this.pautasAsignadas;
    }

    this.$validator.validateAll().then(resultadoValidacion => {
      if (resultadoValidacion) {
        if (formVal.form.validate()) {
          this.dialogConfirmacion = true;
        }
      }
      this.btnBloquear = false;
    });
  }

  validarGrabar(): boolean {
    //valida que cada modulo tenga al menos una accion asignada
    let puedeContinuar: boolean = false;

    for (
      let x: number = 0;
      x <= this.funcionalidadesAsignados.length - 1;
      x++
    ) {
      puedeContinuar = false;

      const funcionalidad: any = this.funcionalidadesAsignados[x];
      let accionesCrear: any = funcionalidad.accionesCrear;

      for (let i: number = 0; i <= accionesCrear.length - 1; i++) {
        let added = this.accionesSeleccionadas.filter(
          (x: any) => x === accionesCrear[i].id
        ).length;
        if (added > 0) {
          puedeContinuar = true;
          break;
        }
      }

      if (!puedeContinuar) {
        let _accionesEditar: any = this.funcionalidadesAsignados[x];
        let accionesEditar: any = _accionesEditar.accionesEditar;
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
          let _accionesRestantes: any = this.funcionalidadesAsignados[x];
          let accionesRestantes: any = _accionesRestantes.acciones;
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

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (!val) {
      return;
    }

    try {
      if (val) {
        const validador = await this.$validator.validateAll();
        if (validador) {
          this.loadingService.showLoading();
          this.btnBloquear = true;
          this.onActividadesChange(); //Actualiza Pautas

          if (!this.estado) this.idPautas = [];

          let model = {
            id: this.editedItem.id,
            nombreActividad: this.editedItem.nombreActividad,
            descripcion: this.editedItem.descripcion,
            estado: this.estado === true ? 1 : 0,
            pautaActividadMants: this.idPautas,
          };

          //Edición
          await this.axios.http.put(`${this.controller}/`, model);
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.editar', {
              entidad: 'Actividad',
            })
          );
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
    } finally {
      this.loadingService.hideLoading();
      this.closeModal(false);
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
    this.gridApiFuncionalidades.setQuickFilter('');
    this.warningInactivo = ' ';
    this.estado = true;
    this.contadorEventoGrilla = 0;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: 'la Actividad',
    });
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyFuncionalidades(params: GridReadyEvent) {
    this.gridApiFuncionalidades = params.api;
    this.columnApiFuncionalidades = params.columnApi;
    this.gridApiFuncionalidades.sizeColumnsToFit();
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

  asignarModulos() {
    if (this.accionesSeleccionadas.length > 0) {
      this.accionesGuardadas = this.accionesSeleccionadas;
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  createButtonCellFuncionalidad(params: any) {
    const item = this.funcionalidadesRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--icon theme--light'
      );
    } else {
      eButton.setAttribute('disabled', 'true');
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
      );
    }

    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerFuncionalidadAsignacion(item);
    });

    return eButton;
  }

  removerFuncionalidadAsignacion(item: IFuncionalidad) {
    this.acc = [];
    for (
      let i: number = 0;
      i <= this.funcionalidadesAsignados.length - 1;
      i++
    ) {
      if (this.funcionalidadesAsignados[i].id == item.id) {
        this.funcionalidadesAsignados.splice(i, 1);
        break;
      }
    }

    for (
      let i: number = 0;
      i <= this.funcionalidadesAsignadosModel.length - 1;
      i++
    ) {
      if (this.funcionalidadesAsignadosModel[i] == item.id) {
        this.funcionalidadesAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (
      this.funcionalidadesAsignados.length ===
      this.funcionalidadesRespaldo.length
    )
      this.seleccionoTodosModulos = true;
    else this.seleccionoTodosModulos = false;
  }

  registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('PerfilNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Actividad con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controller}/ChequearNombreUnico/${self.editedItem.id}/${value}`
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
        field: 'nombrePauta',
        resizable: true,
        minWidth: 80,
        lockVisible: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        // cellRenderer: this.createNombre,
      },
      {
        headerName: 'Acción',
        field: 'tipoActividadMantNombre',
        width: 150,
        editable: this.esEdicion,
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: this.formatLista,
        cellEditorParams: {
          values: tiposActividad,
        },
      },
    ];

    // this.setRemoveButton();

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

    let y = 0;
    let boolConsultarModificado = false;

    if (labelElemento.length > 0) {
      let padre = null;
      let boolModificarCheck = false;
      for (let item of labelElemento) {
        padre = item.parentElement.parentElement;
        if (
          item.innerText.toUpperCase() == 'CONSULTAR' ||
          item.innerText.toUpperCase() == 'GENERAR - INFORMACIÓN GENERAL' ||
          item.innerText.toUpperCase() ==
            'GENERAR - ASOCIAR FLOTAS ETIQUETAS O VEHÍCULOS' ||
          item.innerText.toUpperCase() == 'GENERAR - GENERAR INFORME'
        ) {
          let checks = item.parentElement.parentElement.getElementsByTagName(
            'i'
          ) as HTMLCollectionOf<HTMLElement>;
          for (let chk of checks) {
            chk.className = claseCheck;
            chk.textContent = 'check_box';
            chk.style.cursor = 'default';
            chk.style.setProperty('color', '#9e9e9e', 'important');
            boolModificarCheck = true;

            chk.parentElement.parentElement.outerHTML =
              '<div disabled="disabled">' +
              chk.parentElement.parentElement.outerHTML +
              '</div>';
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
          elemento2.children[1].addEventListener('click', function() {
            // aqui.reestableceConsultarCheck();
            aqui.setCheckConsultar();
          });
          elemento2.children[0].addEventListener('click', function() {
            // aqui.reestableceConsultarCheck();
            aqui.setCheckConsultar();
          });
        }
      }
    }
    //TODO

    if (this.accionesGuardadas.length != 0) {
      let a = this.accionesSeleccionadas.concat(this.accionesGuardadas);
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j] || a[j] < 0) a.splice(j--, 1);
        }
      }
      this.accionesSeleccionadas = a;
    }

    this.loadingService.hideLoading();
  }

  preventEnterPerfilesT(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  onFilterTextBoxChanged() {
    if (this.buscarModulo.length > 1) {
      this.gridApiFuncionalidades.setQuickFilter(this.buscarModulo);
    } else {
      this.gridApiFuncionalidades.setQuickFilter('');
    }
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
  async obtenerPautas() {
    this.accionesPauta = [];
    try {
      const response = await this.axios.http.get(
        `${this.pautaActividadController}`,
        { params: { clienteId: 1 } }
      );
      this.accionesPauta = response.data;

      //Selecciono solo pautas Activas
      this.accionesPauta = this.accionesPauta.filter(
        (x: any) => x.estado === EstadoEntidad.Activo
      );

      //se valida  con el Pautas Asigandos
      /*this.accionesPauta = this.accionesPauta.map(pauta => ({
        ...pauta,
        tipoActividadMantNombre: tiposActividad[0],
      }));*/

      this.accionesPauta.forEach((pauta: any) => {
        var index = this.pautasAsignadas.find(x => x.id == pauta.id);
        if (index !== undefined) {
          pauta.tipoActividadMantNombre =
            tiposActividad[index.tipoActividadMant];
        } else {
          pauta.tipoActividadMantNombre = tiposActividad[0];
        }
      });
      //---

      this.accionesPauta.forEach((func: any) => {
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
      // console.log("this.accionesPauta", this.accionesPauta)
    } catch (error) {
      this.loadingService.hideLoading();
    }
  }

  setSeleccionadosSelect() {
    if (this.estado === false) {
      if (this.tieneAsociaciones())
        this.warningInactivo = this.$t(
          'mensajes.crud.inactivoAsociado.mensaje'
        );
      else this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se podrán realizar asociaciones. ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'la Actividad' });
    } else {
      this.warningInactivo = '';

      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'la Actividad' });
    }
  }

  selectedEstado(e: any) {
    if (e === false) {
      if (this.tieneAsociaciones())
        this.warningInactivo = this.$t(
          'mensajes.crud.inactivoAsociado.mensaje'
        );
      else this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'la Actividad' });
    } else {
      this.warningInactivo = '';
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'la Actividad' });
    }
  }

  tieneAsociaciones() {
    if (this.pautasAsignadas.length === 0) return false;
    else return true;
  }

  formatLista(params: ValueFormatterParams) {
    if (!this.esEdicion) {
      return params.value;
    }
    return `<div style="display: flex;">${params.value}
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

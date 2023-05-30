<!-- version 1.1 -->
<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivTLI">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Grupo de Conductores</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenu()"
              :disabled="!validForm || btnBloquear"
              >{{ btnText }}</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-step
            v-show="informacionGeneral.visible"
            :step="informacionGeneral.step"
            >Información General</v-stepper-step
          >
          <v-divider></v-divider>
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
                          <h2
                            class="h2_title"
                            style="margin-top: 12px!important; font-weight: normal"
                          >
                            Información General
                          </h2>
                          <v-divider></v-divider>
                        </div>
                        <br />
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Nombre"
                              v-validate="
                                'required|GrupoConductorNombreUnicoCrear|max:80'
                              "
                              :counter="80"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              v-model="editedItem.nombre"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Descripción"
                              :counter="200"
                              v-validate="'max:200|required'"
                              data-vv-name="descripcion"
                              v-model="editedItem.descripcion"
                              type="text"
                              :error-messages="errors.collect('descripcion')"
                              required
                            ></v-text-field>
                          </v-flex>
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
                              @change="selectedEstado"
                              :hint="warningInactivo"
                              no-data-text="Sin resultados"
                              persistent-hint
                            ></v-select>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
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
        $t('mensajes.crud.crear.titulo', { entidad: 'Grupo de Conductores' })
      "
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
import { ITipoLugar } from '@/interfaces/Zonas';
import { IClientes } from '@/interfaces/Clientes';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { EstadoEntidad, TipoLugarAlcance, ServicioProxy } from '@/config/enums';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { Validator } from 'vee-validate';
import { differenceBy } from 'lodash';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';

import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import { IConductorGrupo } from '../../interfaces/Conductores';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class GrupoConductoresModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '' }) })
  grupoConductores!: IConductorGrupo;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeConductores;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [this.informacionGeneral];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ITipoLugar = {};
  controller: string = 'conductorGrupo';
  loadingService = new LoadingService();
  search: string = '';
  seleccionoTodosClientes: boolean = false;
  buscarCliente: string = '';
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  muestraClientes: boolean = false;

  usuarioId: number = store.state.userId;

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();
  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefsCliente: Array<ColDef> = [];

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;
  estadoSeleccionado: any = null;
  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  clienteId: number = config.getClienteSesion();
  //---------------------------------------------------------------------------------------------------------

  async mounted() {
    await this.initialize();
    this.chequearPermisos();
    //console.log('chequea', this.chequearPermisos());
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar';
    this.btnClass = 'btn-grabar';
    this.btnBloquear = false;
    this.estadoSeleccionado = EstadoEntidad.Activo; //Estado Activo
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el Grupo de Conductores',
    });
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivTLI').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.buscarCliente = '';
    this.warningInactivo = '';
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }

  async initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          GrupoConductorNombreUnicoCrear:
            '* Ya existe un Grupo de Conductores con este nombre.',
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          max: config.errorMensajes.maxLength,
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  created() {
    this.registrarValidadores();
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('GrupoConductorNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Nombre ya se encuentra creado.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(`${self.controller}/${0}/${value}/ChequearNombreUnico`)
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : { message: '* Nombre ya se encuentra creado.' },
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

  //GRABAR --------------------------------------------------------------------------------------

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

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      const resultadoValidacion = await this.$validator.validateAll();

      if (resultadoValidacion) {
        this.btnBloquear = true;
        await this.nuevo();
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

  closeSuccess() {
    this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Grupo de Conductores',
        creadoA: 'creado',
      })
    );
  }

  async nuevo() {
    const he = new HandleErrors();

    const modelGrupodeConductores = {
      id: 0,
      clienteId: this.clienteId,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.estadoSeleccionado,
    };

    try {
      this.loadingService.showLoading();
      const response = await this.axios.http.post(
        this.controller,
        modelGrupodeConductores
      );
      this.closeSuccess();
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar crear el Grupo de Conductores.'
          );
        }
      } else {
        this.errorMSG(
          error,
          he,
          'Ha ocurrido un problema al intentar crear el Grupo de Conductores.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
  //GRABAR --------------------------------------------------------------------------------------
  continuar() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    });
  }
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Grupo de Conductores',
        });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Grupo de Conductores' }
      );
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

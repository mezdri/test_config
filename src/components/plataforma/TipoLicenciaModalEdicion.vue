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

          <v-toolbar-title>
            {{
              esEdicion
                ? 'Editar Tipo de Licencia'
                : 'Ver Detalle Tipo de Licencia'
            }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              v-if="esEdicion"
              @click="
                e1 -= 1;
                btnText = 'Continuar';
                btnClass = 'btn-continuar';
              "
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
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
                          label="Código"
                          :counter="80"
                          v-model="editedItem.id"
                          type="text"
                          :disabled="true"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Clase"
                          v-validate="'required|ClaseUnicoEditar|max:80'"
                          :counter="80"
                          :error-messages="errors.collect('claseLicencia')"
                          data-vv-name="claseLicencia"
                          v-model="editedItem.clase"
                          :disabled="!esEdicion"
                          type="text"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Nombre"
                          v-validate="'required|max:80'"
                          :counter="80"
                          data-vv-name="nombre"
                          v-model="editedItem.nombre"
                          type="text"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('nombre')"
                          required
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Descripción"
                          :counter="200"
                          data-vv-name="descripcion"
                          v-validate="'max:200'"
                          v-model="editedItem.descripcion"
                          type="text"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('descripcion')"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          :items="estados"
                          v-model="editedItem.estado"
                          label="Estado"
                          item-value="id"
                          item-text="nombre"
                          v-validate="'required'"
                          :error-messages="errors.collect('estado')"
                          data-vv-name="estado"
                          required
                          @change="selectedEstado"
                          :disabled="!esEdicion"
                          no-data-text="Sin resultados"
                          persistent-hint
                          :hint="warningInactivo"
                        ></v-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
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
          entidad: 'Tipo de Licencia',
          nombreEntidad: editedItem.nombre,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
      :width="450"
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
import { IClientes } from '@/interfaces/Clientes';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';

import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { EstadoEntidad, ServicioProxy } from '@/config/enums';
import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Validator } from 'vee-validate';
import { differenceBy } from 'lodash';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { ITipoLicencia } from '../../interfaces/Vehiculos';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class TipoLicenciaModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({
      id: 0,
      nombre: '',
      descripcion: '',
      estado: EstadoEntidad.Activo,
    }),
  })
  tipoLicencia!: ITipoLicencia;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoLicencia;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.informacionGeneralVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ITipoLicencia = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();
  seleccionoTodosClientes: boolean = false;
  muestraClientes: boolean = false;
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';

  handleErrors: HandleErrors = new HandleErrors();

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;
  btnBloquear: Boolean = false;
  controller: string = 'licenciaTipo';
  estadoSeleccionado: any = null;
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  clienteId: number = config.getClienteSesion();

  //---------------------------------------------------------------------------------------------------------
  //lOAD ---------------------------------------------------------------------------
  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,

          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          max: config.errorMensajes.maxLength,
          required: () => config.errorMensajes.textoRequerido,
        },
        claseLicencia: {
          max: config.errorMensajes.maxLength,
          required: () => config.errorMensajes.textoRequerido,
          ClaseUnicoEditar: '* Ya existe una Clase con este nombre.',
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  mounted() {
    this.initialize();
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('ClaseUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Clase ya se encuentra creado.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controller}/${self.editedItem.id}/${value}/ChequearClaseUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : { message: '* Clase ya se encuentra creado.' },
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
  created() {
    this.registrarValidadores();
  }

  //EVENTOS -----------------------------------------------------------------------
  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar Cambios';
    this.bottomNav = '1';
    this.btnBloquear = false;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        const tipoLinc = await this.axios.http.get<ITipoLicencia>(
          `${this.controller}/${this.tipoLicencia.id}`
        );
        this.editedItem = tipoLinc.data;
        if (!this.esEdicion) {
          this.editedItem.estado =
            this.editedItem.estado == EstadoEntidad.Sistema
              ? EstadoEntidad.Activo
              : this.editedItem.estado;
        }
        if (this.editedItem.estado == EstadoEntidad.Inactivo) {
          this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
          this.mensajeConfirmacionInactivo =
            this.warningInactivo +
            ' ' +
            this.$t('mensajes.crud.editar.mensaje', {
              entidad: 'el Tipo de Licencia',
            });
        } else {
          this.mensajeConfirmacionInactivo = this.$t(
            'mensajes.crud.editar.mensaje',
            {
              entidad: 'el Tipo de Licencia',
            }
          );
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
      } finally {
        this.loadingService.hideLoading();
      }
      this.initialize();
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

  //MODAL -------------------------------------------------------------------
  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.warningInactivo = ' ';
    this.contadorEventoGrillaSelection = 0;
    this.contadorEventoGrilla = 0;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    });
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      try {
        this.loadingService.showLoading();
        const resultadoValidacion = await this.$validator.validateAll();

        if (resultadoValidacion) {
          this.btnBloquear = true;
          await this.actualizacionTipoLicencia();
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }

    this.btnBloquear = false;
  }
  async actualizacionTipoLicencia() {
    let model = {
      id: this.editedItem.id,
      Clase: this.editedItem.clase,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.editedItem.estado,
    };
    const self = this;
    try {
      const res = await self.axios.http.put(`${self.controller}`, model);
      this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
    } catch (error) {
      this.handleErrors.showError(error);
      this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
    } finally {
      this.closeModal(false);
      this.loadingService.hideLoading();
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

  confirmCallbackConfirm(aceptado: boolean) {
    this.dialogConfirmacionClose = false;

    if (aceptado) {
      this.closeModal(false);
    }
  }

  close() {
    this.loadingService.hideLoading();
    this.btnBloquear = false;
    this.closeModal(false);
    this.dialogConfirmacion = false;

    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
  }

  //ASOCIACIONES /////////////////////////////////////////////////////////////////////////////////////////////

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      this.guardarInactivo = true;
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'el Tipo de Licencia',
        });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el Tipo de Licencia' }
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

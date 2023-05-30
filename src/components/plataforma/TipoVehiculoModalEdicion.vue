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
            esEdicion
              ? 'Editar Tipo de Vehículo'
              : 'Ver Detalle Tipo de Vehículo'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion()"
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
                          v-validate="
                            'required|tipoVehiculoNombreUnicoEditar|max:80'
                          "
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
                          v-validate="'required|max:200'"
                          v-model="editedItem.descripcion"
                          :error-messages="errors.collect('descripcion')"
                          data-vv-name="descripcion"
                          label="Descripción"
                          type="text"
                          :counter="200"
                          :disabled="!esEdicion"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="editedItem.estado"
                          :items="estado"
                          label="Estado"
                          item-text="nombre"
                          item-value="id"
                          v-validate="'required'"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('estado')"
                          data-vv-name="estado"
                          required
                          no-data-text="Sin resultados"
                          @change="seleccionarEstado"
                          :hint="mensajeCambioEstado"
                          persistent-hint
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
          entidad: 'Tipo de Vehículo',
          nombreEntidad: tipoVehiculo.nombre,
        })
      "
      :mensaje="$t('mensajes.crud.editar.mensaje')"
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

    <app-confirmacion
      :show="dialogCambioEstado"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Tipo de Vehículo',
          nombreEntidad: tipoVehiculo.nombre,
        })
      "
      :mensaje="
        $t('mensajes.crud.inactivo.mensaje') +
          ' ' +
          $t('mensajes.crud.editar.mensaje')
      "
      v-on:modalConfirmationEmit="confirmCallbackEstado($event, false)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { EstadoEntidad, TipoSim, MarcaGps } from '@/config/enums';
import { ITipoVehiculo } from '../../interfaces/Vehiculos';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { Funcionalidades } from '@/config/funcionalidades';
import HandleErrors from '@/config/handleErrors';
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');
import Confirmation from '@/components/Confirmation.vue'; //

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class ModulosModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  tipoVehiculo!: ITipoVehiculo;

  readonly controller: string = 'VehiculoTipo';

  // permisos
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoDeVehiculo;
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

  //propiedades globales
  $snotify: any;
  dialog: boolean = false;
  dialogConfirmacionClose: boolean = false;
  bottomNav: any = '1';
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();
  validForm: boolean = false;
  editedItem: ITipoVehiculo = {};
  dialogConfirmacion: boolean = false;
  loadingService = new LoadingService();
  btnBloquear: Boolean = false;
  mensajeCambioEstado: string = '';
  estadoElecto: any = '';
  disabledTipoVehiculo: boolean = false;
  dialogCambioEstado: boolean = false;

  // data
  estadoSeleccionado: any = 0;
  estadosServices: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosServices.getEstadosVisibles();

  // axios
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  created() {
    this.registrarValidadores();
  }

  mounted() {
    this.initialize();
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

  private registrarValidadores() {
    const self = this;

    Validator.extend('tipoVehiculoNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Tipo de Vehículo con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axios.http
            .get(
              `${self.controller}/${self.editedItem.id}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message:
                          '* Ya existe un Tipo de Vehículo con este nombre.',
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
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.bottomNav = '1';
    this.btnBloquear = false;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.editedItem = this.tipoVehiculo;
      this.estadoSeleccionado = this.editedItem.estado;
    }

    // mostrar mensaje inactivo
    if (this.editedItem.estado === 0) {
      this.mensajeCambioEstado =
        'Al dejar como inactivo, no se podrán realizar asociaciones.';
    } else {
      this.mensajeCambioEstado = '';
    }
  }

  grabarEdicion() {
    //grabar
    this.$validator.validateAll().then(res => {
      if (res) {
        this.axios.http
          .get(this.controller)
          .then(res => {
            const tipos = res.data.filter(
              (x: any) =>
                x.nombre
                  .toString()
                  .toUpperCase()
                  .trim() ===
                  this.editedItem.nombre
                    .toString()
                    .toUpperCase()
                    .trim() &&
                x.estado !== EstadoEntidad.Eliminado &&
                x.id !== this.editedItem.id
            );
            if (tipos.length === 0 && this.editedItem.estado === 0) {
              this.dialogConfirmacion = false;
              this.btnBloquear = true;
              this.dialogCambioEstado = true;
            } else if (tipos.length === 0) {
              this.dialogConfirmacion = true;
              this.btnBloquear = true;
              this.dialogCambioEstado = false;
            } else {
              this.loadingService.hideLoading();
              this.$snotify.error(
                'Ya existe un Tipo de Vehículo con este nombre'
              );
            }
          })
          .catch(error => {
            this.loadingService.hideLoading();
          });
      }
    });
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    this.dialogCambioEstado = false;

    if (val) {
      this.loadingService.showLoading();

      try {
        await this.actualizarTipoVehiculo();

        this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
        this.closeModal(false);
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
    }
    this.btnBloquear = false;
  }

  closeModal(val: boolean) {
    this.$validator.reset();
    this.editedItem = {};
    document.getElementById('cardDivTV').scrollIntoView(true);
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.btnBloquear = false;
    this.mensajeCambioEstado = '';
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async actualizarTipoVehiculo() {
    let model = {
      id: this.editedItem.id,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.editedItem.estado,
    };

    this.axios.http
      .put(`${this.controller}/`, model)
      .then(tipoVehiculo => {
        this.loadingService.hideLoading();
        this.closeModal(false);
        this.dialogConfirmacion = false;
      })
      .catch(error => {
        this.loadingService.hideLoading();
        this.closeModal(false);
        this.dialogConfirmacion = false;
      });
  }

  seleccionarEstado(tipoEstado: any) {
    this.estadoElecto = tipoEstado;

    switch (this.estadoElecto) {
      case 1: // estado Activo
        this.mensajeCambioEstado = '';
        this.disabledTipoVehiculo = false;

        break;

      case 0: // estado Inactivo
        this.mensajeCambioEstado =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
        this.disabledTipoVehiculo = true;
        break;
    }
  }

  confirmCallbackEstado(aceptado: boolean) {
    this.dialogCambioEstado = false;

    if (aceptado === true) {
      this.confirmCallback(aceptado);
      this.disabledTipoVehiculo = true;
    } else {
      this.editedItem.estado = 0;
      this.btnBloquear = false;
      this.disabledTipoVehiculo = true;
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

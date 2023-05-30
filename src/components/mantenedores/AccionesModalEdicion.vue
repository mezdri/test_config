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
            esEdicion ? 'Editar Acción' : 'Ver Detalle Acción'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              @click="grabarEdicion()"
              class="btn-grabar"
              v-if="esEdicion"
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
                          v-validate="'required|accionNombreUnicoEditar|max:80'"
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
                          v-validate="'max:200'"
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
                          :hint="warningInactivo"
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
          entidad: 'Acción',
          nombreEntidad: this.editedItem.nombre,
        })
      "
      :mensaje="mensajeConfirmacion"
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
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import { AccionesInterface } from '@/interfaces/Acciones';
import { EstadoEntidad } from '@/config/enums';
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
import { Accion } from '../../views/base/ComponenteBase';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class AccionesModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  accion!: AccionesInterface;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Acciones;
  // permisos
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 19,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    codigoSubAccion: 19,
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
  dialogConfirmacion: boolean = false;
  loadingService = new LoadingService();
  btnBloquear: Boolean = false;
  warningInactivo: any = '';
  estadoElecto: any = '';
  disabledAccion: boolean = false;
  dialogCambioEstado: boolean = false;
  mensajeConfirmacion: string = '';
  cantidadModulos: number = 0;

  // Interfaces
  editedItem: AccionesInterface = {};

  // data
  estadoSeleccionado: any = 0;
  estadosServices: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosServices.getEstadosVisibles();

  // axios
  readonly controller: string = 'Accion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

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

    Validator.extend('accionNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Acción con este nombre.';
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
                        message: '* Ya existe una Acción con este nombre.',
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
    this.dialog = value;
    this.bottomNav = '1';
    this.btnBloquear = false;
    this.cantidadModulos = 0;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.editedItem = this.accion;
      this.estadoSeleccionado = this.editedItem.estado;
      await this.accionModulos();
      await this.seleccionarEstado(this.editedItem.estado);
    }

    // mostrar mensaje inactivo
    if (this.editedItem.estado === 0) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
    } else {
      this.warningInactivo = '';
    }
  }

  async seleccionarEstado(tipoEstado: any) {
    this.estadoElecto = tipoEstado;

    if (this.estadoElecto === 1) {
      this.warningInactivo = '';
      this.mensajeConfirmacion =
        '¿Está seguro que desea guardar los cambios realizados?';
      this.disabledAccion = false;
    } else if (this.estadoElecto === 0 && this.cantidadModulos > 0) {
      this.warningInactivo =
        'Al dejar como inactivo, terminarán todas las asociaciones.';
      this.mensajeConfirmacion =
        'Al dejar como inactivo, terminarán todas las asociaciones. ¿Está seguro que desea guardar los cambios realizados?';
      this.disabledAccion = true;
    } else {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.mensajeConfirmacion =
        'Al dejar como inactivo, no se podrán realizar asociaciones. ¿Está seguro que desea guardar los cambios realizados? ';
    }
  }

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    });
  }

  closeModal(val: boolean) {
    this.$validator.reset();
    this.editedItem = {};
    document.getElementById('cardDivTV').scrollIntoView(true);
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.btnBloquear = false;
    this.warningInactivo = '';
    this.mensajeConfirmacion = '';
    this.cantidadModulos = 0;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      try {
        this.loadingService.showLoading();
        const resultadoValidacion = await this.$validator.validateAll();

        if (resultadoValidacion) {
          this.btnBloquear = true;
          await this.putAccion();
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }

    this.btnBloquear = false;
  }

  async putAccion() {
    let model = {
      id: this.editedItem.id,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.editedItem.estado,
    };

    this.axios.http
      .put(`${this.controller}/`, model)
      .then(tipoVehiculo => {
        this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
      })
      .catch(error => {
        this.closeModal(false);
        this.handleErrors.showError(error);
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        this.loadingService.hideLoading();
      })
      .finally(() => {
        this.loadingService.hideLoading();
        this.closeModal(false);
      });
  }

  async accionModulos() {
    let model: any = [];
    model.push({
      AccionId: this.editedItem.id,
    });

    try {
      const response = await this.axios.http.post(
        `${this.controller}/accionModulos/`,
        model
      );
      this.cantidadModulos = response.data.cantidadModulos;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener acciones.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener acciones.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }
}
</script>

<style scoped>
#alinear {
  text-align: justify;
}

.h2_title {
  font-weight: normal;
}
</style>

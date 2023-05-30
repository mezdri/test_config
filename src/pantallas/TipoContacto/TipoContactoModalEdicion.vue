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

          <v-toolbar-title>
            {{
              esEdicion
                ? 'Editar Tipo de Contacto'
                : 'Ver Detalle Tipo de Contacto'
            }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion()"
              :disabled="!validForm || btnBloquear"
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
                      <!-- <v-flex xs12 sm12 md12>
                        <v-switch
                          :label="estado ? 'Activo' : 'Inactivo'"
                          v-model="estado"
                          color="success"
                          @change="selectedEstado"
                          :hint="warningInactivo"
                          persistent-hint
                          :readonly="!esEdicion"
                        ></v-switch>
                      </v-flex>-->
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.nombre"
                          v-validate="'required|max:20|nombreUnicoEditar'"
                          :error-messages="errors.collect('nombre')"
                          data-vv-name="nombre"
                          label="Nombre"
                          type="text"
                          :counter="20"
                          required
                          :disabled="!esEdicion"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.descripcion"
                          v-validate="'required|max:200'"
                          :error-messages="errors.collect('descripcion')"
                          data-vv-name="descripcion"
                          label="Descripción"
                          type="text"
                          :counter="200"
                          required
                          :disabled="!esEdicion"
                        ></v-text-field>
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
          entidad: 'Tipo de Contacto',
          nombreEntidad: tipoContacto.nombre,
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
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import config from '@/config/index';
import { ITipoContacto } from '@/interfaces/TipoContacto';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { Funcionalidades } from '@/config/funcionalidades';
import HandleErrors from '@/config/handleErrors';
import { ComponenteBaseStepper } from '../../views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import Confirmation from '@/components/Confirmation.vue'; //
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class TipoContactioModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '' }),
  })
  tipoContacto!: ITipoContacto;

  //controllers
  readonly controller: string = 'TipoContactos';

  // permisos
  readonly funcionalidad: Funcionalidades = Funcionalidades.TipoDeContacto;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
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
  editedItem: ITipoContacto = {};
  dialogConfirmacion: boolean = false;
  loadingService = new LoadingService();
  btnBloquear: Boolean = false;

  // axios
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);

  //data
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;

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
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  private registrarValidadores() {
    const self = this;
    //enviar ID
    Validator.extend('nombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Tipo de Contacto con este nombre.';
      },
      validate(value: any) {
        return self.axios.http
          .get(
            `${self.controller}/ChequearNombreUnico/${self.editedItem.id}/${value}`
          )
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : {
                      message:
                        '* Ya existe un Tipo de Contacto con este nombre.',
                    },
              });
            });
          })
          .catch(err => {
            return true;
          });
      },
    });
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.bottomNav = '1';
    this.btnBloquear = false;

    // permisos
    //this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.editedItem = this.tipoContacto;
      this.estado = this.editedItem.estado === 1 ? true : false;
      if (this.editedItem.estado == EstadoEntidad.Inactivo) {
        this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
        this.mensajeConfirmacionInactivo =
          this.warningInactivo +
          ' ' +
          this.$t('mensajes.crud.editar.mensaje', {
            entidad: 'el Tipo de Contacto',
          });
      } else {
        this.mensajeConfirmacionInactivo = this.$t(
          'mensajes.crud.editar.mensaje',
          {
            entidad: 'el Tipo de Contacto',
          }
        );
      }
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

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.loadingService.showLoading();
      try {
        let model = {
          id: this.editedItem.id,
          nombre: this.editedItem.nombre,
          descripcion: this.editedItem.descripcion,
          estado: this.estado === true ? 1 : 0,
        };

        this.axios.http
          .put(`${this.controller}`, model)
          .then(tipoContacto => {
            this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
            this.closeModal(false);
          })
          .catch(error => {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          });
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
    this.warningInactivo = ' ';
    this.estado = true;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  selectedEstado(isActivo: boolean) {
    if (!isActivo) {
      this.guardarInactivo = true;

      this.warningInactivo =
        'Al dejar como inactivo, no se podrán realizar asociaciones.';
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'el Tipo de Contacto',
        });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el Tipo de Contacto' }
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

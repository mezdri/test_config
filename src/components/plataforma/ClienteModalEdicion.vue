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
            esEdicion ? 'Editar Cliente' : 'Ver Detalle Cliente'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              @click="(dialogConfirmacion = true), (btnBloquear = true)"
              v-if="esEdicion"
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
                :value="informacionGeneral.step"
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>

              <v-btn
                color="primary"
                flat
                :value="configurarCliente.step"
                v-show="
                  (configurarCliente.visible && esEdicion) ||
                    (configurarClienteVerDetalle.visible && !esEdicion)
                "
              >
                <span>Configurar Cliente</span>
                <v-icon>settings</v-icon>
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
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <div align="left">
                            <h2
                              class="h2_title"
                              style="margin-top: 12px!important;"
                            >
                              Información General
                            </h2>
                          </div>
                          <v-divider></v-divider>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.id"
                            label="Código"
                            type="text"
                            :counter="80"
                            :disabled="true"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.nombre"
                            label="Nombre"
                            type="text"
                            :counter="80"
                            :disabled="true"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.rut"
                            label="Rut"
                            type="text"
                            :counter="80"
                            :disabled="true"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.giro"
                            label="Giro"
                            type="text"
                            :counter="80"
                            :disabled="true"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.direccion"
                            label="Dirección"
                            type="text"
                            :counter="80"
                            :disabled="true"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.telefono1"
                            label="Teléfono 1"
                            type="text"
                            :counter="80"
                            :disabled="true"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.email"
                            label="Correo Electrónico"
                            type="text"
                            :disabled="true"
                            :counter="80"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            label="Estado"
                            v-model="editedItem.estadoTxt"
                            type="text"
                            :counter="80"
                            :disabled="true"
                            required
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </div>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == configurarCliente.step &&
                ((configurarCliente.visible && esEdicion) ||
                  (configurarClienteVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <div align="left">
                      <v-flex md12>
                        <h2 class="h2_title">Configurar Cliente</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout>
                    <v-flex align-center d-flex xs8 sm8 md8>Parámetro</v-flex>
                    <v-flex align-center d-flex xs2 sm2 md2>Valor</v-flex>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-layout>
                    <v-flex align-center d-flex xs8 sm8 md8
                      >Acceso a Usuarios</v-flex
                    >
                    <v-flex d-flex xs4 sm4 md4>
                      <v-switch
                        v-model="editedItem.accesoUsuarios"
                        :readonly="!esEdicion"
                        color="success"
                      ></v-switch>
                    </v-flex>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-layout>
                    <v-flex align-center d-flex xs8 sm8 md8
                      >Recepción de Actividades</v-flex
                    >
                    <v-flex d-flex xs4 sm4 md4>
                      <v-switch
                        v-model="editedItem.recepcionActividades"
                        :readonly="!esEdicion"
                        color="success"
                      ></v-switch>
                    </v-flex>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-layout>
                    <v-flex align-center d-flex xs8 sm8 md8
                      >Sincronización CRM</v-flex
                    >
                    <v-flex d-flex xs4 sm4 md4>
                      <v-switch
                        v-model="editedItem.sincronizarCrm"
                        :readonly="!esEdicion"
                        color="success"
                      ></v-switch>
                    </v-flex>
                  </v-layout>
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
          entidad: 'Cliente',
          nombreEntidad: cliente.nombre,
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
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { IClientes } from '@/interfaces/Clientes';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class ClienteModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  cliente!: IClientes;

  readonly controllerCliente: string = 'cliente';

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Clientes;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  configurarCliente: PermisoAccionVm = {
    accion: 'Editar - Configurar Cliente',
    visible: true,
    step: 2,
    codigoSubAccion: 31,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  configurarClienteVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Configurar Cliente',
    visible: true,
    step: 2,
    codigoSubAccion: 31,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.configurarCliente,
    this.informacionGeneralVerDetalle,
    this.configurarClienteVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  bottomNav: any = '1';
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IClientes = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  btnBloquear: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();

  //Axios
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);

  mounted() {
    this.initialize();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.bottomNav = '1';
    this.btnText = 'Continuar';

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.btnBloquear = false;
      this.editedItem = this.cliente;

      this.editedItem.accesoUsuariosTxt == 'No'
        ? (this.editedItem.accesoUsuarios = false)
        : (this.editedItem.accesoUsuarios = true);

      this.editedItem.recepcionActividadesTxt == 'No'
        ? (this.editedItem.recepcionActividades = false)
        : (this.editedItem.recepcionActividades = true);

      this.editedItem.sincronizarCrmTxt == 'No'
        ? (this.editedItem.sincronizarCrm = false)
        : (this.editedItem.sincronizarCrm = true);

      this.initialize();
      this.loadingService.hideLoading();
    }
    const self = this;
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

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.btnBloquear = true;
      this.loadingService.showLoading();

      let model = this.editedItem;

      await this.axiosClientes.http
        .put(`Cliente`, model)
        .then(res => {
          this.editedItem.id = res.data.id;

          this.$snotify.success(
            this.$t('mensajes.mensajesExito.editar', {
              entidad: 'El cliente',
              creadoA: 'editado',
            })
          );
          this.closeModal(false);
        })
        .catch(error => {
          //he.showError(error);
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.editar', {
                  entidad: 'el cliente',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.editar', {
                entidad: 'el cliente',
              })
            );
          }
        });
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  //performance
  errorCallback(error: any) {
    this.btnBloquear = false;
    this.loadingService.hideLoading();
    this.handleErrors.showError(error);
  }

  closeModal(val: boolean) {
    this.$validator.reset();
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        clienteId: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        cliente: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

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
      <v-card id="cardDivTL">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Grupo de Zonas</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              :class="btnClass"
              @click="continuar()"
              :disabled="!validForm || btnBloquear"
              >{{ btnText }}</v-btn
            >
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
          </v-stepper-header>
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
                                'required|GrupoZonaNombreUnicoCrear|max:80'
                              "
                              :counter="80"
                              data-vv-name="nombre"
                              v-model="editedItem.nombre"
                              type="text"
                              :error-messages="errors.collect('nombre')"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Descripción"
                              :counter="200"
                              v-validate="'max:200'"
                              data-vv-name="descripcion"
                              v-model="editedItem.descripcion"
                              type="text"
                              :error-messages="errors.collect('descripcion')"
                            ></v-text-field>
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Grupo de Zonas' })"
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'el Grupo de Zonas' })
      "
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

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class TipolugarModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '' }) }) tiposlugar!: ITipoLugar;

  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeZona;
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
  btnText: string = 'Guardar';
  btnClass: string = 'btn-grabar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ITipoLugar = {};
  controller: string = 'grupodezona';
  controllerCliente: string = 'grupodeinteres';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: any;
  columnApi: any;

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;

  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  mounted() {
    this.initialize();
  }

  created() {
    this.registrarValidadores();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar';
    this.btnClass = 'btn-grabar';
    this.btnBloquear = false;
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivTL').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('GrupoZonaNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Grupo de Zonas con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosGps.http
            .get(
              `${
                self.controllerCliente
              }/${0}/${clienteId}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message:
                          '* Ya existe un Grupo de Zonas con este nombre.',
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

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          GrupoZonaNombreUnicoCrear:
            '* Ya existe un Grupo de Zonas con este nombre.',
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          max: config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  //GRABAR --------------------------------------------------------------------------------------
  continuar() {
    this.$validator.validateAll().then(res => {
      if (res) {
        //valida nombre del grupo de zonas
        this.axiosGps.http
          .get(this.controller)
          .then(res => {
            let tipos = res.data.filter(
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
                x.tipoLugarAlcance === TipoLugarAlcance.Cliente &&
                x.clienteId === this.getClienteID()
            );
            if (tipos.length === 0) {
              this.btnBloquear = true;
              this.dialogConfirmacion = true;
            } else {
              this.$snotify.error(
                'Ya existe un Grupo de Zonas con este nombre.'
              );
            }
          })
          .catch(error => {
            this.btnBloquear = true;
            this.dialogConfirmacion = true;
          });
      }
    });
  }

  getClienteID() {
    return config.getClienteSesion();
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      const resultadoValidacion = await this.$validator.validateAll();

      if (resultadoValidacion) {
        this.btnBloquear = true;
        await this.nuevo();
      }
    }

    this.btnBloquear = false;
  }

  confirmCallbackConfirm(aceptado: boolean) {
    this.dialogConfirmacionClose = false;

    if (aceptado) {
      this.closeModal(false);
    }
  }

  closeSuccess() {
    this.loadingService.hideLoading();
    this.closeModal(false);

    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Grupo de Zonas',
        creadoA: 'creado',
      })
    );
  }

  async nuevo() {
    const he = new HandleErrors();
    this.loadingService.showLoading();

    const modelTipoLugar = {
      id: 0,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      clienteId: this.getClienteID(),
      tipoLugarAlcance: TipoLugarAlcance.Cliente,
    };

    try {
      await this.axiosGps.http.post(this.controller, modelTipoLugar);
      this.closeSuccess();
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar crear el Grupo de Zonas.'
          );
        }
      } else {
        this.errorMSG(
          error,
          he,
          'Ha ocurrido un problema al intentar crear el Grupo de Zonas.'
        );
      }
    }
  }

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
}
</script>

<style scoped></style>

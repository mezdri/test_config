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
              esEdicion ? 'Editar Grupo de Zonas' : 'Ver Detalle Grupo de Zonas'
            }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
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
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Nombre"
                          v-validate="
                            'required|GrupoZonaNombreUnicoEditar|max:80'
                          "
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
                          v-model="editedItem.descripcion"
                          v-validate="'max:200'"
                          type="text"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('descripcion')"
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
          entidad: 'Grupo de Zonas',
          nombreEntidad: editedItem.nombre,
        })
      "
      :mensaje="
        $t('mensajes.crud.editar.mensaje', { entidad: 'el Grupo de Zonas' })
      "
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
import moment from 'moment';
import { ITipoLugar } from '../../interfaces/Zonas';
import config from '../../config/index';
import HandleErrors from '../../config/handleErrors';
import Confirmation from '../../components/Confirmation.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { EstadoEntidad, TipoLugarAlcance, ServicioProxy } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class TipolugarModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '' }) }) tiposlugar!: ITipoLugar;

  //permisos
  funcionalidad: Funcionalidades = Funcionalidades.GrupoDeZona;
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
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ITipoLugar = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();
  //SELECT--------------------------------------------------------------------------------------------

  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: any;
  columnApi: any;
  gridApi2: any;
  columnApi2: any;
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;
  controller: string = 'grupodezona';
  controllerCliente: string = 'grupodeinteres';
  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axContextoGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
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
          GrupoZonaNombreUnicoEditar:
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
  mounted() {
    this.initialize();
  }

  created() {
    this.registrarValidadores();
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('GrupoZonaNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe un Grupo de Zonas con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axContextoGps.http
            .get(
              `${self.controllerCliente}/${self.editedItem.id}/${clienteId}/${value}/ChequearNombreUnico`
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

  //EVENTOS -----------------------------------------------------------------------
  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar Cambios';
    this.bottomNav = '1';
    this.btnBloquear = false;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    let self = this;

    if (value == true) {
      this.loadingService.showLoading();
      this.axContextoGps.http
        .get<ITipoLugar>(`${this.controller}/${this.tiposlugar.id}`)
        .then(tipolugar => {
          self.editedItem = tipolugar.data;
          this.loadingService.hideLoading();
        })
        .catch(err => {
          this.loadingService.hideLoading();
          if (err.response !== undefined) {
            if (err.response.status !== 401) {
              this.handleErrors.showError(err);
            }
          } else {
            this.handleErrors.showError(err);
          }
        });
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
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }
  //-------------------------------------------------------------------------

  //GRID  -------------------------------------------------------------------
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  //FUNCIONES ---------------------------------------------------------------
  formatDate(fecha: Date): string {
    if (!fecha) return null;
    return moment(fecha).format('DD/MM/YYYY');
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  //MODIFICACION --------------------------------------------------------
  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.axContextoGps.http
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
                x.id !== this.editedItem.id &&
                x.tipoLugarAlcance === TipoLugarAlcance.Cliente &&
                x.clienteId === this.getClienteID()
            );
            if (tipos.length === 0) {
              this.btnBloquear = true;
              this.dialogConfirmacion = true;
            } else {
              this.$snotify.error(
                'Ya existe un Grupo de Zonas con este nombre'
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

  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    let he = new HandleErrors();
    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.btnBloquear = true;
          let boolError = this.actualizacionTipoLugar();
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

  actualizacionTipoLugar(): boolean {
    this.loadingService.showLoading();
    let he = new HandleErrors();
    let boolError = false;
    let model = {
      Id: this.editedItem.id,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      clienteId: this.editedItem.clienteId,
      tipoLugarAlcance: TipoLugarAlcance.Cliente,
    };
    //Edición

    this.axContextoGps.http
      .put(`${this.controller}/`, model)
      .then(res => {
        this.close();
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.errorMSG(
              error,
              he,
              'Ha ocurrido un problema al intentar guardar los cambios'
            );
          }
        } else {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar guardar los cambios'
          );
        }
      });
    return boolError;
  }

  close() {
    this.loadingService.hideLoading();
    this.btnBloquear = false;
    this.closeModal(false);
    this.dialogConfirmacion = false;

    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
  }

  //GET-------------------------------------------------------------------------------
  getClienteID() {
    return config.getClienteSesion();
  }

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

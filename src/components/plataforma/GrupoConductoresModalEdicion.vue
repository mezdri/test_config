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
                ? 'Editar Grupo de Conductores'
                : 'Ver Detalle Grupo de Conductores'
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
                @click="cierraMenu()"
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
                            'required|GrupoConductoresNombreUnicoEditar|max:80'
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
                          v-validate="'max:200|required'"
                          v-model="editedItem.descripcion"
                          type="text"
                          :disabled="!esEdicion"
                          :error-messages="errors.collect('descripcion')"
                          required
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
          entidad: 'Grupo de Conductores',
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
import { CodigoAccion } from '@/views/base/VariablesPermisos';
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
import { IConductorGrupo } from '../../interfaces/Conductores';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class GrupoConductoresModalEdicion extends ComponenteBaseStepper {
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
  grupoConductores!: IConductorGrupo;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeConductores;
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
  editedItem: IConductorGrupo = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();
  search: string = '';
  seleccionoTodosClientes: boolean = false;
  muestraClientes: boolean = false;
  buscarCliente: string = '';
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
  columnDefsCliente: Array<ColDef> = [];
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;
  cantidadConductoresAsociados: number = 0;

  btnBloquear: Boolean = false;
  controller: string = 'conductorGrupo';
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
    //if (this.esEdicion) {
    this.columnDefsCliente = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
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
        rowDrag: true,
        hide: true,
        lockPinned: true,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        lockPinned: true,
        lockVisible: true,
        width: 200,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          GrupoConductoresNombreUnicoEditar:
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

    if (!this.esEdicion) {
      this.columnDefsCliente.shift();
    }
  }

  mounted() {
    this.initialize();
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('GrupoConductoresNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Nombre ya se encuentra creado.';
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
        const grupoCond = await this.axios.http.get<IConductorGrupo>(
          `${this.controller}/${this.grupoConductores.id}`
        );
        this.editedItem = grupoCond.data;
        if (!this.esEdicion) {
          this.editedItem.estado =
            this.editedItem.estado == EstadoEntidad.Sistema
              ? EstadoEntidad.Activo
              : this.editedItem.estado;
        }
        await this.axios.http
          .get(`${this.controller}/asociacion/${this.editedItem.id}`)
          .then(res => {
            this.cantidadConductoresAsociados = res.data.length;
          });
        if (this.editedItem.estado == EstadoEntidad.Inactivo) {
          this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
          this.mensajeConfirmacionInactivo =
            this.warningInactivo +
            ' ' +
            this.$t('mensajes.crud.editar.mensaje', {
              entidad: 'el Grupo de Conductores',
            });
        } else {
          this.mensajeConfirmacionInactivo = this.$t(
            'mensajes.crud.editar.mensaje',
            {
              entidad: 'el Grupo de Conductores',
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
    // this.clientesRespaldo.forEach(cliente => {
    //   let exists: any = this.clientesAsignados.filter(
    //     (x: any) => x.id === cliente.id
    //   );
    //   if (exists.length == 0) {
    //     cliente.checked = false;
    //   } else {
    //     cliente.checked = true;
    //   }
    // });
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
    this.buscarCliente = '';
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
        this.axios.http
          .get(this.controller)
          .then(res => {
            // const tipos = res.data.filter(
            //   (x: any) =>
            //     x.nombre
            //       .toString()
            //       .toUpperCase()
            //       .trim() ===
            //       this.editedItem.nombre
            //         .toString()
            //         .toUpperCase()
            //         .trim() &&
            //     x.estado !== EstadoEntidad.Eliminado &&
            //     x.id !== this.editedItem.id
            // );

            // if (tipos.length === 0) {
            this.dialogConfirmacion = true;
            this.btnBloquear = true;
            // } else {
            //   this.loadingService.hideLoading();
            //   this.$snotify.error(
            //     'Ya existe un Grupo de Conductores con este nombre'
            //   );
            // }
          })
          .catch(error => {
            this.loadingService.hideLoading();
          });
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
          await this.actualizacionGrupoConductor();
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }

    this.btnBloquear = false;
  }
  async actualizacionGrupoConductor() {
    let model = {
      id: this.editedItem.id,
      clienteId: this.editedItem.clienteId,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      estado: this.editedItem.estado,
    };
    const self = this;
    try {
      await self.axios.http.put(`${self.controller}`, model);
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
  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
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

      if (this.cantidadConductoresAsociados > 0) {
        this.warningInactivo =
          'Al dejar como inactivo, terminarán todas las asociaciones.';
      } else {
        this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      }
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'el Grupo de Conductores',
        });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
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

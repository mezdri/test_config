<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivR">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Rol Transversal</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenuRolTransversal()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenuRolTransversal()"
              :disabled="!validForm || btnBloquear"
            >
              <span
                :style="[
                  btnText == 'Guardar'
                    ? { color: 'white' }
                    : { color: 'black' },
                ]"
                >{{ btnText }}</span
              >
            </v-btn>
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
            <v-divider v-show="informacionGeneral.visible"></v-divider>

            <v-stepper-step
              v-show="asociarPerfiles.visible"
              :complete="e1 > asociarPerfiles.step"
              :step="asociarPerfiles.step"
              >Asociar Perfiles</v-stepper-step
            >

            <v-divider v-show="selectedTipoRol === idRolCliente"></v-divider>
            <v-stepper-step
              v-show="selectedTipoRol === idRolCliente"
              :complete="e1 > asociarPerfiles.step + 1"
              :step="asociarPerfiles.step + 1"
              >Asociar Clientes</v-stepper-step
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
                        <v-layout wrap>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-validate="'required|max:80|RolNombreUnico'"
                              v-model="editedItem.name"
                              :error-messages="errors.collect('name')"
                              data-vv-name="name"
                              label="Nombre"
                              type="text"
                              :counter="80"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-select
                              v-model="selectedTipoRol"
                              :items="tiposRol"
                              item-text="nombre"
                              item-value="id"
                              label="Tipo de Rol"
                              v-validate="'required'"
                              :error-messages="errors.collect('tipoRol')"
                              data-vv-name="tipoRol"
                              required
                            ></v-select>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarPerfiles.visible"
              :step="asociarPerfiles.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Perfiles</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarPerfil"
                            prepend-icon="person"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedPerfil"
                            append-icon="search"
                          >
                            <template slot="selection" slot-scope="data">
                              <v-chip
                                close
                                class="chip--select-multi"
                                @input="removerPerfilAsignacion(data.item)"
                              >
                                {{ formatoTextoAsociacion(data.item.nombre) }}
                              </v-chip>
                            </template>
                          </v-text-field>
                        </v-flex>
                        <!-- <v-flex md3 style="padding-top:22px">
                          <div align="right">
                            <v-btn
                              v-if="!seleccionoTodosPerfiles"
                              color="primary"
                              @click="marcarTodosPerfiles(true)"
                              >Seleccionar Todos
                            </v-btn>
                            <v-btn
                              v-else-if="seleccionoTodosPerfiles"
                              color="primary"
                              @click="marcarTodosPerfiles(false)"
                              >Deseleccionar Todos
                            </v-btn>
                          </div>
                        </v-flex>-->
                        <!-- <v-flex md3 style="padding-top:22px">
                          <div align="right">
                            <v-btn flat small color="primary">
                              <v-icon class="btn-asociar-icon" left>cloud_upload</v-icon>
                              <span class="btn-asociar-texto">Asociar desde Archivo</span>
                            </v-btn>
                          </div>
                        </v-flex>-->
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsPerfil"
                              :rowData="perfilesRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReadyPerfil"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectionChangedPerfil($event)
                              "
                              :getRowNodeId="getRowNodeIdPerfil"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentPerfil
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassPerfil
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarUsuarios.visible"
              :step="asociarUsuarios.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Clientes</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarCliente"
                            prepend-icon="person"
                            label="Buscar..."
                            @input="onFilterTextBoxChanged"
                            append-icon="search"
                          >
                            <template slot="selection" slot-scope="data">
                              <v-chip
                                close
                                class="chip--select-multi"
                                @input="removerClienteAsignacion(data.item)"
                              >
                                {{
                                  formatoTextoAsociacion(
                                    nombreCompleto(data.item)
                                  )
                                }}
                              </v-chip>
                            </template>
                          </v-text-field>
                        </v-flex>
                        <!-- <v-flex md3 style="padding-top:22px">
                          <div align="right">
                            <v-btn
                              v-if="!seleccionoTodosClientes"
                              color="primary"
                              @click="marcarTodosClientes(true)"
                              >Seleccionar Todos
                            </v-btn>
                            <v-btn
                              v-else-if="seleccionoTodosClientes"
                              color="primary"
                              @click="marcarTodosClientes(false)"
                              >Deseleccionar Todos
                            </v-btn>
                          </div>
                        </v-flex>-->
                        <!-- <v-flex md3 style="padding-top:22px">
                          <div align="right">
                            <v-btn flat small color="primary">
                              <v-icon class="btn-asociar-icon" left>cloud_upload</v-icon>
                              <span class="btn-asociar-texto">Asociar desde Archivo</span>
                            </v-btn>
                          </div>
                        </v-flex>-->
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                              class="ag-theme-material"
                              :columnDefs="columnDefs"
                              :rowData="clientesTotales"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="false"
                              :localeText="localeText"
                              :onGridReady="onGridReady"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectionChanged($event)"
                              :getRowNodeId="getRowNodeId"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentCliente
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassCliente
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-container>
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Rol Transversal' })"
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'el Rol Transversal' })
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
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoRol } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import store from '@/store';
import { RolesInterface } from '@/interfaces/Roles';
import { PerfilesInterface, PerfilRolInterface } from '@/interfaces/Perfiles';
import { IClientes } from '@/interfaces/Clientes';
import { LoadingService } from '@/services/loadingService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Validator } from 'vee-validate';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class RolesTransversalModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  rol!: RolesInterface;

  readonly controller: string = 'Rol';
  readonly rolTransversalController: string = 'RolTransversal';
  readonly perfilTransversalController: string = 'PerfilTransversal';
  readonly clienteController: string = 'cliente';
  readonly clienteRolController: string = 'ClienteRol';
  readonly perfilController: string = 'perfil';

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.RolesTransversal;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarPerfiles: PermisoAccionVm = {
    accion: 'Crear - Asociar Perfiles',
    visible: true,
    step: 2,
    codigoSubAccion: 23,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarUsuarios: PermisoAccionVm = {
    accion: 'Crear - Asociar Clientes',
    visible: true,
    step: 3,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarPerfiles,
    this.asociarUsuarios,
  ];

  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: RolesInterface = {};
  dictionaryFormErrors: any = {};
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  search: string = '';
  buscarCliente: string = '';
  buscarPerfil: string = '';

  clienteId: number = config.getClienteSesion();
  usuarioId: number = store.state.userId;
  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];

  clientesTotales: IClientes[] = [];

  loadingService = new LoadingService();

  perfilesAsignadosModel: any = [];
  perfilesAsignados: PerfilesInterface[] = [];
  perfilesRespaldo: PerfilesInterface[] = [];

  // grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiPerfil: GridApi;
  columnApiPerfil: ColumnApi;
  columnDefsPerfil: Array<ColDef> = [];

  //Tipos de Rol
  tiposRol: any = [];
  selectedTipoRol: any = null;
  idRolCliente = TipoRol.Cliente;

  //Seleccionar Todos (Perfiles y Clientes)
  seleccionoTodosPerfiles: boolean = false;
  seleccionoTodosClientes: boolean = false;

  created(): void {
    this.chequearPermisos();
    this.registrarValidadores();
  }

  async mounted() {
    this.initialize();

    try {
      this.loadingService.showLoading();

      //Tipo Rol
      for (let item in TipoRol) {
        if (!isNaN(Number(item))) {
          if (Number(item) > 0) {
            let nombre = TipoRol[item];
            this.tiposRol.push({
              id: Number(item),
              nombre: nombre,
            });
          }
        }
      }
      //---

      await this.obtenerClientes();
      await this.obtenerPerfiles();
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al cargar rol transversal.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al cargar rol transversal.');
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivR').scrollIntoView(true);
  }
  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  cierraMenuRolTransversal(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  private registrarValidadores(): void {
    const self = this;

    Validator.extend('RolNombreUnico', {
      getMessage() {
        return '* El nombre del Rol ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosCliente.http
          .get(`${self.rolTransversalController}/${0}/${value}/nombreUnico`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* El nombre del Rol ya se encuentra en uso.' },
              });
            });
          })
          .catch(() => {
            return true;
          });
      },
    });
  }

  @Watch('show')
  async onPropertyChanged(value: boolean) {
    this.dialog = value;
    this.btnBloquear = false;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.clientesAsignados = [];
    this.clientesAsignadosModel = [];
    this.perfilesAsignados = [];
    this.perfilesAsignadosModel = [];

    if (value) {
      try {
        this.loadingService.showLoading();
        this.seleccionoTodosPerfiles = false;
        this.seleccionoTodosClientes = false;
        this.selectedTipoRol = null;
        this.$validator.reset();
        await this.obtenerPerfiles();
        await this.obtenerClientes();
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al cargar.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al cargar.');
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  nombreCompleto(cliente: IClientes): string {
    return cliente.nombre;
  }

  onUserChange(user: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (user !== undefined && user.length !== this.clientesAsignados.length) {
      for (let x = this.clientesAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= user.length - 1; i++) {
          if (this.clientesAsignados[x].id == user[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.clientesAsignados.splice(x, 1);
        }
      }

      if (this.clientesAsignados.length === this.clientesTotales.length) {
        this.seleccionoTodosClientes = true;
      } else {
        this.seleccionoTodosClientes = false;
      }
    }
  }

  onUserInput(user: any) {
    if (user !== undefined) {
      for (let i = 0; i <= user.length - 1; i++) {
        const added = this.clientesAsignados.filter(x => x.id == user[i]);

        if (added.length === 0) {
          const cliente = this.clientesTotales.find(x => x.id == user[i]);
          this.clientesAsignados.push(cliente);

          if (this.clientesAsignados.length === this.clientesTotales.length)
            this.seleccionoTodosClientes = true;
          else this.seleccionoTodosClientes = false;
        }
      }
    }
  }

  marcarTodosClientes(value: boolean) {
    this.clientesAsignados = [];
    this.clientesAsignadosModel = [];
    if (value) {
      this.clientesTotales.forEach((cliente: any) => {
        this.clientesAsignados.push(cliente);
        this.clientesAsignadosModel.push(cliente.id);
      });
    }

    this.seleccionoTodosClientes = value;
  }

  onPerfilChange(perfil: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      perfil !== undefined &&
      perfil.length !== this.perfilesAsignados.length
    ) {
      for (let x = this.perfilesAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= perfil.length - 1; i++) {
          if (this.perfilesAsignados[x].id == perfil[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.perfilesAsignados.splice(x, 1);
        }
      }

      if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
        this.seleccionoTodosPerfiles = true;
      else this.seleccionoTodosPerfiles = false;
    }
  }

  onPerfilInput(perfil: any) {
    if (perfil !== undefined) {
      for (let i = 0; i <= perfil.length - 1; i++) {
        const added = this.perfilesAsignados.filter(x => x.id == perfil[i]);

        if (added.length === 0) {
          const perfilAsignar = this.perfilesRespaldo.find(
            x => x.id == perfil[i]
          );

          this.perfilesAsignados.push(perfilAsignar);

          if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
            this.seleccionoTodosPerfiles = true;
          else this.seleccionoTodosPerfiles = false;
        }
      }
    }
  }

  marcarTodosPerfiles(value: boolean) {
    this.perfilesAsignados = [];
    this.perfilesAsignadosModel = [];
    if (value) {
      this.perfilesRespaldo.forEach((perfil: any) => {
        this.perfilesAsignados.push(perfil);
        this.perfilesAsignadosModel.push(perfil.id);
      });
    }
    this.seleccionoTodosPerfiles = value;
  }

  async continuar() {
    const resultado = await this.$validator.validateAll();

    if (resultado) {
      document.getElementById('cardDivR').scrollIntoView(true);

      let longPermisosActuales = this.permisosActuales.length;
      if (this.selectedTipoRol !== this.idRolCliente) {
        longPermisosActuales = longPermisosActuales - 1;
      }

      if (this.e1 === longPermisosActuales) {
        this.btnBloquear = true;
        this.dialogConfirmacion = true;
      } else if (this.e1 === longPermisosActuales - 1) {
        this.e1 += 1;
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
      } else {
        this.e1 += 1;
      }
    }
  }

  async grabarAsociacionesClienteRol(rolId: number) {
    this.loadingService.showLoading();
    this.clientesAsignados.forEach(async (cliente: IClientes) => {
      try {
        const clienteRolVm = {
          id: 0,
          rolId: rolId,
          clienteId: cliente.id,
          fechaInicioAsociacion: new Date(),
          fechaCreacion: new Date(),
        };

        const response = await this.axiosCliente.http.post(
          `${this.clienteRolController}`,
          clienteRolVm
        );
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Rol transversal',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'el Rol transversal',
            })
          );
        }
        this.btnBloquear = false;
      }
    });
    this.loadingService.hideLoading();
  }

  async grabarAsociacionesClienteRolV2(rolId: number) {
    this.loadingService.showLoading();
    let ids: number[] = [];
    this.clientesAsignados.forEach(async (cliente: IClientes) => {
      try {
        ids.push(cliente.id);
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Rol transversal',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'el Rol transversal',
            })
          );
        }
        this.btnBloquear = false;
      }
    });

    if (ids.length > 0) {
      let datos = {
        rolId: rolId,
        clientesId: ids,
      };

      await this.axiosCliente.http.post(
        `${this.clienteRolController}/CreaClienteRol`,
        datos
      );
    }
    this.loadingService.hideLoading();
  }

  async grabarAsociacionesPerfil(rolId: number) {
    this.perfilesAsignados.forEach(async (perfil: PerfilesInterface) => {
      try {
        const response = await this.axios.http.post(
          `${this.perfilController}/${perfil.id}/rol/${rolId}`
        );
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Rol transversal',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'el Rol transversal',
            })
          );
        }
        this.btnBloquear = false;
      }
    });
  }

  async guardarRolTransversal() {
    let retorno = 0;

    const vm = {
      Id: 0,
      Name: this.editedItem.name,
      Estado: EstadoEntidad.Sistema,
      Tipo: this.selectedTipoRol,
    };

    try {
      const response = await this.axiosCliente.http.post(
        this.rolTransversalController,
        vm
      );
      retorno = response.data.id;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'el Rol transversal',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', {
            entidad: 'el Rol transversal',
          })
        );
      }
      this.btnBloquear = false;
    }
    return retorno;
  }

  closeModal() {
    document.getElementById('cardDivR').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarCliente = '';
    this.buscarPerfil = '';
    this.gridApi.setQuickFilter('');
    this.gridApiPerfil.setQuickFilter('');
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyPerfil(params: GridReadyEvent) {
    this.gridApiPerfil = params.api;
    this.columnApiPerfil = params.columnApi;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  async obtenerClientes(): Promise<void> {
    try {
      const responseClientes = await this.axiosCliente.http.get(
        this.clienteController
      );

      responseClientes.data = responseClientes.data.map((node: any) => ({
        ...node,
        estadoTxt: EstadoEntidad[node.estado],
        rut: node.rut === null ? '' : node.rut,
        nombre: node.nombre === null ? '' : node.nombre,
        giro: node.giro === null ? '' : node.giro,
        direccion: node.direccion === null ? '' : node.direccion,
        telefonoParticular:
          node.telefonoParticular === null ? '' : node.telefonoParticular,
      }));

      this.clientesTotales = responseClientes.data;
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener clientes.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener clientes.');
      }
    }
  }

  async obtenerPerfiles(): Promise<void> {
    try {
      const responsePerfiles = await this.axiosCliente.http.get<
        PerfilesInterface[]
      >(this.perfilTransversalController);
      //TEST
      responsePerfiles.data.forEach((perfil: PerfilesInterface) => {
        if (
          perfil.estado === EstadoEntidad.Activo ||
          perfil.estado === EstadoEntidad.Sistema
        )
          perfil.estadoTxt = 'Activo';
        else perfil.estadoTxt = 'Inactivo';
      });
      //---
      this.perfilesRespaldo = responsePerfiles.data;
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener Perfiles.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener Perfiles.');
      }
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.btnBloquear = true;

      try {
        this.loadingService.showLoading();
        const rolId = await this.guardarRolTransversal();

        if (this.selectedTipoRol === this.idRolCliente) {
          //await this.grabarAsociacionesClienteRol(rolId);
          await this.grabarAsociacionesClienteRolV2(rolId);
        }

        await this.grabarAsociacionesPerfil(rolId);

        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Rol Transversal',
            creadoA: 'creado',
          })
        );

        this.closeModal();
        this.dialogConfirmacion = false;
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Rol Transversal',
              })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'el Rol Transversal',
            })
          );
        }
        this.btnBloquear = false;
      } finally {
        this.loadingService.hideLoading();
      }
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal();
    }
  }

  createButtonCell(params: any) {
    let evento = this.removerClienteAsignacion;
    const item = this.clientesTotales.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      evento(item);
    });

    return eButton;
  }

  createButtonCellPerfil(params: any) {
    let evento = this.removerPerfilAsignacion;
    const item = this.perfilesRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      evento(item);
    });

    return eButton;
  }

  removerClienteAsignacion(item: IClientes): void {
    for (let i = 0; i <= this.clientesAsignados.length - 1; i++) {
      if (this.clientesAsignados[i].id === item.id) {
        this.clientesAsignados.splice(i, 1);
        this.clientesAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.clientesAsignados.length === this.clientesTotales.length)
      this.seleccionoTodosClientes = true;
    else this.seleccionoTodosClientes = false;
  }

  removerPerfilAsignacion(item: PerfilRolInterface): void {
    for (let i = 0; i <= this.perfilesAsignados.length - 1; i++) {
      if (this.perfilesAsignados[i].id === item.id) {
        this.perfilesAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.perfilesAsignadosModel.length - 1; i++) {
      if (this.perfilesAsignadosModel[i] === item.id) {
        this.perfilesAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
      this.seleccionoTodosPerfiles = true;
    else this.seleccionoTodosPerfiles = false;
  }

  initialize() {
    this.columnDefs = [
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
        width: 120,
        minWidth: 80,
        lockPinned: true,
        resizable: false,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        lockVisible: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Giro',
        field: 'giro',
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Dirección',
        field: 'direccion',
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Teléfono',
        field: 'telefonoParticular',
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        lockPinned: true,
        // cellRenderer: (r: any) => {
        //   if (r.data.estado === EstadoEntidad.Sistema)
        //     return EstadoEntidad[EstadoEntidad.Activo];
        //   else return EstadoEntidad[r.data.estado];
        // },
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   minWidth: 80,
      //   cellRenderer: this.createButtonCell,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.columnDefsPerfil = [
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
        width: 120,
        minWidth: 80,
        lockPinned: true,
        hide: true,
        resizable: false,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        width: 200,
        minWidth: 80,
        lockVisible: true,
        resizable: true,
        lockPinned: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        // cellRenderer: (r: any) => {
        //   if (r.data.estado === EstadoEntidad.Sistema)
        //     return EstadoEntidad[EstadoEntidad.Activo];
        //   else return EstadoEntidad[r.data.estado];
        // },
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   minWidth: 80,
      //   cellRenderer: this.createButtonCellPerfil,
      //   enablePivot: false,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'right' },
      // },
    ];

    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          regex: config.errorMensajes.regex,
        },
        tipoRol: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  onFilterTextBoxChanged() {
    this.gridApi.onFilterChanged();
    // if (this.buscarCliente.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarCliente);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }
  onSelectionChanged() {
    this.clientesAsignados = this.gridApi.getSelectedRows();
    const clientesSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const clientesNoSeleccionados = differenceBy(
      this.clientesTotales,
      clientesSeleccionados,
      cliente => cliente.id
    ).map(cliente => ({
      ...cliente,
      checked: false,
    }));

    this.gridApi.updateRowData({
      update: [...clientesNoSeleccionados, ...clientesSeleccionados],
    });
  }
  onFilterTextBoxChangedPerfil() {
    this.gridApiPerfil.onFilterChanged();
    // if (this.buscarPerfil.length > 1) {
    //   this.gridApiPerfil.setQuickFilter(this.buscarPerfil);
    // } else {
    //   this.gridApiPerfil.setQuickFilter('');
    // }
  }
  onSelectionChangedPerfil() {
    this.perfilesAsignados = this.gridApiPerfil.getSelectedRows();
    const perfilesSeleccionados = this.gridApiPerfil
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const perfilesNoSeleccionados = differenceBy(
      this.perfilesRespaldo,
      perfilesSeleccionados,
      perfil => perfil.id
    ).map(perfil => ({
      ...perfil,
      checked: false,
    }));

    this.gridApiPerfil.updateRowData({
      update: [...perfilesNoSeleccionados, ...perfilesSeleccionados],
    });
  }
  getRowNodeIdPerfil(perfil: PerfilesInterface) {
    if (!perfil) {
      return;
    }
    return perfil.id;
  }
  getRowNodeId(cliente: IClientes) {
    if (!cliente) {
      return;
    }
    return cliente.id;
  }

  isExternalFilterPresentPerfil(): boolean {
    return true;
  }

  doesExternalFilterPassPerfil(node: RowNode): boolean {
    if (this.perfilesRespaldo.length > 0 && this.buscarPerfil.length > 1) {
      let busqueda = this.buscarPerfil.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentCliente(): boolean {
    return true;
  }

  doesExternalFilterPassCliente(node: RowNode): boolean {
    if (this.clientesTotales.length > 0 && this.buscarCliente.length > 1) {
      let busqueda = this.buscarCliente.toLowerCase();
      return (
        node.data.rut.toLowerCase().includes(busqueda) ||
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.giro.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

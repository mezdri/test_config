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

          <v-toolbar-title>
            {{
              esEdicion
                ? 'Editar Rol Transversal'
                : 'Ver Detalle Rol Transversal'
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
                @click="cierraMenuRolTransversal"
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

              <v-btn
                @click="cierraMenuRolTransversal"
                color="primary"
                flat
                v-show="
                  (asociarPerfiles.visible && esEdicion) ||
                    (asociarPerfilesVerDetalle.visible && !esEdicion)
                "
                :value="asociarPerfiles.step"
              >
                <span>Asociar Perfiles</span>
                <v-icon>group_add</v-icon>
              </v-btn>

              <v-btn
                @click="cierraMenuRolTransversal"
                color="primary"
                flat
                v-show="
                  (editedItem.tipo === idRolCliente &&
                    asociarClientes.visible &&
                    esEdicion) ||
                    (editedItem.tipo === idRolCliente &&
                      asociarClientesVerDetalle.visible &&
                      !esEdicion)
                "
                :value="asociarClientes.step"
              >
                <span>Asociar Clientes</span>
                <v-icon>person_add</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((esEdicion && informacionGeneral.visible) ||
                  (!esEdicion && informacionGeneralVerDetalle.visible))
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
                      <!--regex: /^[\w\-\.\s]+$/-->
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|max:80|RolNombreUnicoEditar'"
                          v-model="editedItem.name"
                          :error-messages="errors.collect('name')"
                          data-vv-name="name"
                          label="Nombre"
                          type="text"
                          :counter="80"
                          :disabled="!esEdicion"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="editedItem.tipo"
                          :items="tiposRol"
                          item-text="nombre"
                          item-value="id"
                          label="Tipo de Rol"
                          v-validate="'required'"
                          :error-messages="errors.collect('tipoRol')"
                          data-vv-name="tipoRol"
                          :disabled="true"
                          required
                        ></v-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == asociarPerfiles.step &&
                ((esEdicion && asociarPerfiles.visible) ||
                  (!esEdicion && asociarPerfilesVerDetalle.visible))
            "
            class="cardnew"
          >
            <br />
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
                        v-model="buscarPerfilEditar"
                        prepend-icon="person"
                        label="Buscar..."
                        @input="onFilterTextBoxChangedPerfil"
                        append-icon="search"
                      >
                        <!-- <template slot="selection" slot-scope="data">
                          <v-chip
                            close
                            class="chip--select-multi"
                            @input="removerPerfilAsignacion(data.item)"
                          >
                            {{ formatoTextoAsociacion(data.item.nombre) }}
                          </v-chip>
                        </template>-->
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
                          :columnDefs="columnDefsPerfiles"
                          :rowData="perfilesRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          cacheBlockSize="10000"
                          suppressRowClickSelection="true"
                          suppressCopyRowsToClipboard="true"
                          :sideBar="false"
                          :localeText="localeText"
                          :onGridReady="onGridReadyPerfiles"
                          :postProcessPopup="onClickCell"
                          @selection-changed="
                            onSelectionChangedPerfilEditar($event)
                          "
                          :getRowNodeId="getRowNodeIdPerfilEditar"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentPerfil
                          "
                          :doesExternalFilterPass="doesExternalFilterPassPerfil"
                        ></ag-grid-vue>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == asociarClientes.step &&
                ((editedItem.tipo === idRolCliente &&
                  asociarClientes.visible &&
                  esEdicion) ||
                  (editedItem.tipo === idRolCliente &&
                    asociarClientesVerDetalle.visible &&
                    !esEdicion))
            "
            class="cardnew"
          >
            <br />
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
                        v-model="buscarClienteEditar"
                        prepend-icon="person"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <br />
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnDefs"
                          :rowData="clientesRespaldo"
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
                          @selection-changed="onSelectionChangeEditar($event)"
                          :getRowNodeId="getRowNodeIdEditar"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Rol Transversal',
          nombreEntidad: rol.name,
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
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoRol } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { RolesInterface } from '@/interfaces/Roles';
import { PerfilesInterface } from '@/interfaces/Perfiles';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { IClientes } from '@/interfaces/Clientes';
import { Validator } from 'vee-validate';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { differenceBy } from 'lodash';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class RolesTransversalModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
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
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarPerfiles: PermisoAccionVm = {
    accion: 'Editar - Asociar Perfiles',
    visible: true,
    step: 2,
    codigoSubAccion: 23,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarClientes: PermisoAccionVm = {
    accion: 'Editar - Asociar Clientes',
    visible: true,
    step: 3,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarPerfilesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Perfiles',
    visible: true,
    step: 2,
    codigoSubAccion: 23,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarClientesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Clientes',
    visible: true,
    step: 3,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarPerfiles,
    this.asociarClientes,
    this.informacionGeneralVerDetalle,
    this.asociarPerfilesVerDetalle,
    this.asociarClientesVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: RolesInterface = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  loadingService = new LoadingService();
  search: string = '';
  buscarClienteEditar: string = '';
  buscarPerfilEditar: string = '';
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;
  contadorEventoGrillaPerfil: number = 0;
  contadorEventoGrillaSelectionPerfil: number = 0;

  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];
  clientesAsignadosRespaldo: IClientes[] = [];
  clientesRespaldo: IClientes[] = [];
  clientesAsignadosAux: IClientes[] = [];

  perfilesAsignadosModel: any = [];
  perfilesAsignados: PerfilesInterface[] = [];
  perfilesAsignadosResp: PerfilesInterface[] = [];
  perfilesRespaldo: PerfilesInterface[] = [];

  localeText: any = config.agGridTextos;
  autoGroupColumnDef: any = null;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiPerfiles: GridApi;
  columnApiPerfiles: ColumnApi;
  columnDefsPerfiles: Array<ColDef> = [];
  clienteId: number = config.getClienteSesion();

  //Tipos de Rol
  tiposRol: any = [];
  idRolCliente = TipoRol.Cliente;
  a: number = 0;

  //Seleccionar Todos (Perfiles y Clientes)
  // seleccionoTodosPerfiles: boolean = false;
  // seleccionoTodosClientes: boolean = false;

  mounted() {
    this.a = 0;
    this.initialize();
  }

  nombreCompleto(cliente: IClientes): string {
    return cliente.nombre;
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.editedItem = this.rol;
    this.bottomNav = '1';
    this.clientesAsignadosModel = [];
    this.clientesAsignadosRespaldo = [];
    this.clientesAsignados = [];
    this.perfilesAsignadosModel = [];
    this.perfilesAsignadosResp = [];
    this.perfilesAsignados = [];

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      await this.$validator.reset();
      this.registrarValidadoresEditar();
      this.btnBloquear = false;

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

        if (this.editedItem.tipo != 3 && this.editedItem.tipo != 2) {
          await this.obtenerClientes();
        }
        await this.obtenerPerfiles();

        //recupera clientes asignados al rol
        if (this.rol.id > 0) {
          if (this.editedItem.tipo != 3 && this.editedItem.tipo != 2) {
            const responseClientes = await this.axiosCliente.http.get(
              `${this.rolTransversalController}/${this.rol.id}/clientes`
            );

            if (responseClientes.data.length > 0) {
              this.clientesAsignados = responseClientes.data;
              this.clientesAsignadosAux = this.clientesAsignados;

              // this.clientesAsignadosRespaldo = Object.assign(
              //   [],
              //   this.clientesAsignados
              // );

              this.clientesAsignados.forEach(cliente => {
                this.clientesAsignadosModel.push(cliente.id);
              });
            }
          }

          const responsePerfil = await this.axiosCliente.http.get(
            `${this.rolTransversalController}/${this.rol.id}/perfiles`
          );

          if (responsePerfil.data.length > 0) {
            this.perfilesAsignados = responsePerfil.data;
            this.perfilesAsignadosResp = Object.assign(
              [],
              this.perfilesAsignados
            );

            this.perfilesAsignados.forEach(perfil => {
              this.perfilesAsignadosModel.push(perfil.id);
            });
          }
        }
        this.perfilesRespaldo.forEach(perfil => {
          let exists: any = this.perfilesAsignados.filter(
            (x: any) => x.id === perfil.id
          );
          if (exists.length == 0) {
            perfil.checked = false;
          } else {
            perfil.checked = true;
          }
        });

        // selecciono la data para solucionar problema check header
        const self = this;
        this.gridApiPerfiles.forEachNode(function(node: any) {
          var index = self.perfilesAsignados.findIndex(
            x => x.id == node.data.id
          );
          if (index !== -1) {
            node.setSelected(true);
            self.contadorEventoGrillaPerfil++;
          }
        });
        this.gridApi.forEachNode(function(node: any) {
          var index = self.clientesAsignados.findIndex(
            x => x.id == node.data.id
          );
          if (index !== -1) {
            node.setSelected(true);
            self.contadorEventoGrilla++;
          }
        });
        await this.seteaAsignados();
      } catch (error) {
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
    // if (this.clientesAsignados.length == this.clientesRespaldo.length) {
    //   this.seleccionoTodosClientes = true;
    // } else {
    //   this.seleccionoTodosClientes = false;
    // }
    // if (this.perfilesAsignados.length == this.perfilesRespaldo.length) {
    //   this.seleccionoTodosPerfiles = true;
    // } else {
    //   this.seleccionoTodosPerfiles = false;
    // }
  }

  seteaAsignados() {
    if (!this.esEdicion) {
      this.perfilesRespaldo = this.gridApiPerfiles.getSelectedRows();
      this.clientesRespaldo = this.gridApi.getSelectedRows();
    }
    this.gridApi.paginationGoToFirstPage(); //Primera Página Grilla Clientes
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
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
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

      // if (this.clientesAsignados.length === this.clientesRespaldo.length)
      //   this.seleccionoTodosClientes = true;
      // else this.seleccionoTodosClientes = false;
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

  onUserInput(user: any) {
    if (user !== undefined) {
      for (let i = 0; i <= user.length - 1; i++) {
        let added = this.clientesAsignados.filter(x => x.id == user[i]);
        if (added.length == 0) {
          let usuario = this.clientesRespaldo.filter(x => x.id == user[i]);
          this.clientesAsignados.push(usuario[0]);

          // if (this.clientesAsignados.length === this.clientesRespaldo.length)
          //   this.seleccionoTodosClientes = true;
          // else this.seleccionoTodosClientes = false;
        }
      }
    }
  }

  marcarTodosClientes(value: boolean) {
    this.clientesAsignados = [];
    this.clientesAsignadosModel = [];
    if (value) {
      this.clientesRespaldo.forEach((cliente: any) => {
        this.clientesAsignados.push(cliente);
        this.clientesAsignadosModel.push(cliente.id);
      });
    }
    // this.seleccionoTodosClientes = value;
  }

  private registrarValidadoresEditar(): void {
    const self = this;

    Validator.extend('RolNombreUnicoEditar', {
      getMessage() {
        return '* El nombre del Rol ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosCliente.http
          .get(
            `${self.rolTransversalController}/${self.editedItem.id}/${value}/nombreUnico`
          )
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
      // this.seleccionoTodosPerfiles = this.perfilesAsignados.length === this.perfilesRespaldo.length;
    }
  }

  onPerfilInput(perfil: any) {
    if (perfil !== undefined) {
      for (let i = 0; i <= perfil.length - 1; i++) {
        let added = this.perfilesAsignados.filter(x => x.id == perfil[i]);
        if (added.length == 0) {
          let perfilAgregar = this.perfilesRespaldo.find(
            x => x.id == perfil[i]
          );
          this.perfilesAsignados.push(perfilAgregar);

          // this.seleccionoTodosPerfiles =  this.perfilesAsignados.length === this.perfilesRespaldo.length;
        }
      }
    }
  }

  // marcarTodosPerfiles(value: boolean) {
  //   this.perfilesAsignados = [];
  //   this.perfilesAsignadosModel = [];
  //   if (value) {
  //     this.perfilesRespaldo.forEach((perfil: any) => {
  //       this.perfilesAsignados.push(perfil);
  //       this.perfilesAsignadosModel.push(perfil.id);
  //     });
  //   }
  //   // this.seleccionoTodosPerfiles = value;
  // }

  async grabarEdicion() {
    const resultadoValidacion = await this.$validator.validateAll();
    if (resultadoValidacion) {
      this.dialogConfirmacion = true;
      this.btnBloquear = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      const resultadoValidacion = await this.$validator.validateAll();

      if (resultadoValidacion) {
        this.btnBloquear = true;
        const model = {
          Id: this.editedItem.id,
          Name: this.editedItem.name,
          Estado: this.editedItem.estado,
          ClienteId: this.clienteId,
          Tipo: this.editedItem.tipo,
        };

        //Edición
        try {
          this.loadingService.showLoading();
          const responsePut = await this.axios.http.put(
            `${this.controller}/`,
            model
          );

          if (this.editedItem.tipo === this.idRolCliente) {
            /*await this.eliminarAsociacionesCliente();
            await this.guardarAsociacionesClientes();*/
            await this.eliminarAsociacionesClienteV2();
            await this.guardarAsociacionesClientesV2();
          }

          //await this.eliminarAsociacionPerfiles();
          //await this.guardarAsociacionesPerfiles();
          // await this.eliminarAsociacionPerfilesV2();
          // await this.guardarAsociacionesPerfilesV2();
          await this.actualizarAsociacionesRolPerfiles();

          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.closeModal(false);
          this.dialogConfirmacion = false;
        } catch (error) {
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

  async eliminarAsociacionesCliente() {
    let clientesEliminar: any = [];

    try {
      this.clientesRespaldo.forEach(cliente => {
        let exists = this.clientesAsignados.filter(z => z.id == cliente.id);

        if (exists.length === 0) {
          clientesEliminar.push(cliente.id);
        }
      });

      clientesEliminar = clientesEliminar.filter(
        (v: any, i: any, a: any) => a.indexOf(v) === i
      );

      clientesEliminar.forEach(async (cliente: any) => {
        await this.axiosCliente.http.delete(
          `${this.rolTransversalController}/${cliente}/${this.rol.id}`
        );
      });
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  // async guardarAsociacionesClientes() {
  //   try {
  //     this.clientesAsignados.forEach( async (usuarios: any, idx: number) => {
  //       const existe = this.clientesAsignadosRespaldo.filter(
  //         x => x.id == usuarios.id
  //       );

  //       if (existe.length === 0) {
  //         await this.axios.http.post(`${this.controller}/${this.rol.id}/usuario/${usuarios.id}`,{});
  //       }
  //     });
  //   } catch (error) {
  //     this.$snotify.error(this.$t("mensajes.mensajesError.editar"));
  //     this.btnBloquear = false;
  //   }
  // }

  //performance
  async eliminarAsociacionesClienteV2() {
    let clienteId: number[] = [];

    try {
      this.clientesAsignadosAux.forEach(cliente => {
        let exists = this.clientesAsignados.find(z => z.id === cliente.id);

        if (exists === null || exists === undefined) {
          clienteId.push(cliente.id);
        }
      });

      let modelDemo = {
        RolId: this.rol.id,
        ClienteId: clienteId,
      };

      if (clienteId.length > 0) {
        await this.axiosCliente.http.delete(
          `${this.rolTransversalController}/eliminarAsociacionesClienteV2`,
          {
            data: modelDemo,
          }
        );
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  async guardarAsociacionesClientes() {
    this.clientesAsignados.forEach(async cliente => {
      let existe = this.clientesAsignadosRespaldo.filter(
        x => x.id === cliente.id
      );

      try {
        if (existe.length === 0) {
          const clienteRolVm = {
            id: 0,
            rolId: this.rol.id,
            clienteId: cliente.id,
            fechaInicioAsociacion: new Date(),
            fechaCreacion: new Date(),
          };

          const response = await this.axiosCliente.http.post(
            `${this.clienteRolController}`,
            clienteRolVm
          );
        }
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

  //performance
  async guardarAsociacionesClientesV2() {
    let clienteId: number[] = [];

    this.clientesAsignados.forEach(async cliente => {
      let exists = this.clientesAsignadosAux.find(x => x.id === cliente.id);

      if (exists === null || exists === undefined) {
        clienteId.push(cliente.id);
      }
    });

    let datos = {
      rolId: this.rol.id,
      clientesId: clienteId,
    };

    if (clienteId.length > 0) {
      await this.axiosCliente.http.post(
        `${this.clienteRolController}/CreaClienteRol`,
        datos
      );
    }
  }

  async grabarAsociacionesPerfil(rolId: number) {
    this.perfilesAsignados.forEach(
      async (perfil: PerfilesInterface, idx: number) => {
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
      }
    );
  }

  async guardarAsociacionPerfilUsuario() {
    let promesas: Array<Promise<any>> = [];

    this.perfilesAsignados.forEach((perfil: PerfilesInterface, idx: number) => {
      this.clientesAsignados.forEach((cliente: IClientes, index: number) => {
        promesas.push(
          this.axios.http.post(
            `${this.perfilController}/${perfil.id}/usuario/${cliente.id}`
          )
        );
      });
    });

    return Promise.all(promesas);
  }

  async eliminarAsociacionPerfiles() {
    let perfilesDesasociados: any = [];

    this.perfilesAsignadosResp.forEach((perfil: any) => {
      const exists = this.perfilesAsignados.filter(z => z.id == perfil.id);

      if (exists.length === 0) {
        perfilesDesasociados.push({ id: perfil.id });
      }
    });
    try {
      perfilesDesasociados.forEach(async (perfil: any) => {
        const model: any = {
          id: perfil.id,
          nombre: 'perfil',
          estado: EstadoEntidad.Activo,
          perfilRoles: [
            {
              Id: 1,
              PerfilId: perfil.id,
              RolId: this.rol.id,
              NombreRol: '',
              FechaInicioAsociacion: new Date(),
              FechaFinAsociacion: new Date(
                new Date().getFullYear() + 1,
                10,
                10
              ),
            },
          ],
          perfilUsuarios: [],
          usuarios: [],
          roles: [],
        };

        const response = await this.axios.http.delete(
          `${this.perfilController}/${perfil.id}/rol`,
          { data: model }
        );
      });
    } catch (error) {
      this.btnBloquear = false;
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
    }
  }

  //performance
  async eliminarAsociacionPerfilesV2() {
    try {
      let perfilesDesasociados: number[] = [];

      this.perfilesAsignadosResp.forEach((perfil: any) => {
        const exists = this.perfilesAsignados.filter(z => z.id == perfil.id);
        if (exists.length === 0) {
          perfilesDesasociados.push(perfil.id);
        }
      });

      let model = {
        perfilIds: perfilesDesasociados,
        rolId: this.rol.id,
      };
      await this.axios.http.delete(`${this.perfilController}/eliminaRoles`, {
        data: model,
      });
    } catch (error) {
      this.btnBloquear = false;
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
    }
  }

  async guardarAsociacionesPerfiles() {
    try {
      this.perfilesAsignados.forEach(async (perfil: any, idx: number) => {
        const existe = this.perfilesAsignadosResp.filter(
          x => x.id == perfil.id
        );

        if (existe.length === 0) {
          await this.axios.http.post(
            `${this.perfilController}/${perfil.id}/rol/${this.rol.id}`
          );
        }
      });
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  //performance
  async guardarAsociacionesPerfilesV2() {
    try {
      let idPerfiles: number[] = [];
      this.perfilesAsignados.forEach(async (perfil: any, idx: number) => {
        const existe = this.perfilesAsignadosResp.filter(
          x => x.id == perfil.id
        );

        if (existe.length === 0) {
          idPerfiles.push(perfil.id);
        }
      });

      if (idPerfiles.length > 0) {
        let model = {
          perfilIds: idPerfiles,
          rolId: this.rol.id,
        };
        await this.axios.http.post(
          `${this.perfilController}/postPerfiles`,
          model
        );
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.buscarClienteEditar = '';
    this.buscarPerfilEditar = '';
    this.gridApi.setQuickFilter('');
    this.gridApiPerfiles.setQuickFilter('');
    this.contadorEventoGrilla = 0;
    this.contadorEventoGrillaSelection = 0;
    this.clientesAsignados = [];
    this.clientesAsignadosAux = [];
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onGridReadyPerfiles(params: GridReadyEvent) {
    this.gridApiPerfiles = params.api;
    this.columnApiPerfiles = params.columnApi;
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

      this.clientesRespaldo = responseClientes.data;
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

  async obtenerPerfiles() {
    try {
      const response = await this.axiosCliente.http.get<PerfilesInterface[]>(
        `${this.perfilTransversalController}`
      );
      //TEST
      response.data.forEach((perfil: PerfilesInterface) => {
        if (
          perfil.estado === EstadoEntidad.Activo ||
          perfil.estado === EstadoEntidad.Sistema
        )
          perfil.estadoTxt = 'Activo';
        else perfil.estadoTxt = 'Inactivo';
      });
      //---
      this.perfilesRespaldo = response.data;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener los Perfiles.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener los Perfiles.');
      }
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  createButtonCell(params: any) {
    let evento = this.removerClienteAsignacion;
    const item = this.clientesRespaldo.find(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--icon theme--light'
      );
    } else {
      eButton.setAttribute('disabled', 'true');
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
      );
    }

    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
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

    if (this.esEdicion) {
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--icon theme--light'
      );
    } else {
      eButton.setAttribute('disabled', 'true');
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
      );
    }

    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item);
    });

    return eButton;
  }

  removerClienteAsignacion(item: IClientes) {
    this.loadingService.showLoading();
    for (let i = 0; i <= this.clientesAsignados.length - 1; i++) {
      if (this.clientesAsignados[i].id == item.id) {
        this.clientesAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.clientesAsignadosModel.length - 1; i++) {
      if (this.clientesAsignadosModel[i] == item.id) {
        this.clientesAsignadosModel.splice(i, 1);
        break;
      }
    }

    // if (this.clientesAsignados.length === this.clientesRespaldo.length) {
    //   this.seleccionoTodosClientes = true;
    // } else {
    //   this.seleccionoTodosClientes = false;
    // }

    this.loadingService.hideLoading();
  }

  removerPerfilAsignacion(item: PerfilesInterface) {
    for (let i = 0; i <= this.perfilesAsignados.length - 1; i++) {
      if (this.perfilesAsignados[i].id == item.id) {
        this.perfilesAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.perfilesAsignadosModel.length - 1; i++) {
      if (this.perfilesAsignadosModel[i] == item.id) {
        this.perfilesAsignadosModel.splice(i, 1);
        break;
      }
    }

    // if (this.perfilesAsignados.length === this.perfilesRespaldo.length)
    //   this.seleccionoTodosPerfiles = true;
    // else this.seleccionoTodosPerfiles = false;
  }

  initialize() {
    this.columnDefs = [
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
        hide: true,
        width: 120,
        lockPinned: true,
        resizable: false,
        sortable: true,
        minWidth: 80,
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
        width: 200,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        lockVisible: true,
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
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 200,
        minWidth: 80,
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
      //   enablePivot: false,
      //   resizable: false,
      //   suppressMovable: true,
      //   sortable: false,
      //   pinned: 'right',
      //   lockVisible: true,
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.columnDefsPerfiles = [
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
        width: 120,
        lockPinned: true,
        hide: true,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        lockVisible: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
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
      //   cellRenderer: this.createButtonCellPerfil,
      //   enablePivot: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   pinned: 'right',
      //   lockVisible: true,
      //   cellStyle: { textAlign: 'left' },
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

    if (!this.esEdicion) {
      this.columnDefs.shift();
      this.columnDefsPerfiles.shift();
    }
  }
  onFilterTextBoxChanged() {
    this.gridApi.onFilterChanged();
    // if (this.buscarClienteEditar.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarClienteEditar);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }

  onSelectionChangeEditar() {
    this.contadorEventoGrillaSelection++;
    if (this.clientesAsignados.length == 0) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }
    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.clientesAsignados = this.gridApi.getSelectedRows();
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
      const clientesSeleccionados = this.gridApi
        .getSelectedNodes()
        .map(node => ({ ...node.data, checked: true }));

      const clientesNoSeleccionados = differenceBy(
        this.clientesRespaldo,
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
  }

  getRowNodeIdEditar(cliente: IClientes) {
    if (!cliente) {
      return;
    }
    return cliente.id;
  }
  getRowNodeIdPerfilEditar(perfil: PerfilesInterface) {
    if (!perfil) {
      return;
    }
    return perfil.id;
  }

  onFilterTextBoxChangedPerfil() {
    this.gridApiPerfiles.onFilterChanged();
    // if (this.buscarPerfilEditar.length > 1) {
    //   this.gridApiPerfiles.setQuickFilter(this.buscarPerfilEditar);
    // } else {
    //   this.gridApiPerfiles.setQuickFilter('');
    // }
  }
  onSelectionChangedPerfilEditar() {
    this.contadorEventoGrillaSelectionPerfil++;
    if (this.perfilesAsignados.length === 0) {
      this.contadorEventoGrillaSelectionPerfil = 0;
      this.contadorEventoGrillaPerfil = 0;
    }
    if (
      this.contadorEventoGrillaSelectionPerfil ===
      this.contadorEventoGrillaPerfil
    ) {
      this.contadorEventoGrillaSelectionPerfil = 0;
      this.contadorEventoGrillaPerfil = 0;
      this.contadorEventoGrillaPerfil++;
      this.perfilesAsignados = this.gridApiPerfiles.getSelectedRows();
      const perfilesSeleccionados = this.gridApiPerfiles
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

      this.gridApiPerfiles.updateRowData({
        update: [...perfilesNoSeleccionados, ...perfilesSeleccionados],
      });
    }
  }

  isExternalFilterPresentPerfil(): boolean {
    return true;
  }

  doesExternalFilterPassPerfil(node: RowNode): boolean {
    if (
      this.perfilesRespaldo.length > 0 &&
      this.buscarPerfilEditar.length > 1
    ) {
      let busqueda = this.buscarPerfilEditar.toLowerCase();
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
    if (
      this.clientesRespaldo.length > 0 &&
      this.buscarClienteEditar.length > 1
    ) {
      let busqueda = this.buscarClienteEditar.toLowerCase();
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

  async actualizarAsociacionesRolPerfiles() {
    try {
      let perfilesDesasociados: number[] = [];

      this.perfilesAsignadosResp.forEach((perfil: any) => {
        const exists = this.perfilesAsignados.filter(z => z.id == perfil.id);
        if (exists.length === 0) {
          perfilesDesasociados.push(perfil.id);
        }
      });

      let perfilesEliminados = {
        perfilIds: perfilesDesasociados,
        rolId: this.rol.id,
      };

      let idPerfiles: number[] = [];
      let perfilesAgregados = {};
      this.perfilesAsignados.forEach(async (perfil: any, idx: number) => {
        const existe = this.perfilesAsignadosResp.filter(
          x => x.id == perfil.id
        );

        if (existe.length === 0) {
          idPerfiles.push(perfil.id);
        }
      });

      if (idPerfiles.length > 0) {
        perfilesAgregados = {
          perfilIds: idPerfiles,
          rolId: this.rol.id,
        };
      }

      let body = {
        perfilesEliminados: perfilesEliminados,
        perfilesAgregados: perfilesAgregados,
      };

      await this.axios.http.put(
        `${this.perfilController}/${this.rol.id}/actualizarRolPerfil`,
        body
      );
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } else {
        this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
      }
      this.btnBloquear = false;
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

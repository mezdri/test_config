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
                ? 'Editar Grupo de Interés'
                : 'Ver Detalle Grupo de Interés'
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
              <v-btn
                @click="cierraMenu()"
                color="primary"
                flat
                v-show="
                  (asociarCliente.visible && esEdicion) ||
                    (asociarClienteVerDetalle.visible && !esEdicion)
                "
                :value="asociarCliente.step"
              >
                <span>Asociar Clientes</span>
                <v-icon>group</v-icon>
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
                            'required|GrupoInteresNombreUnicoEditar|max:80'
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
                          v-validate="'max:200'"
                          v-model="editedItem.descripcion"
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
          <div
            align="center"
            v-show="
              bottomNav == asociarCliente.step &&
                ((asociarCliente.visible && esEdicion) ||
                  (asociarClienteVerDetalle.visible && !esEdicion))
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
                        v-model="buscarCliente"
                        prepend-icon="group"
                        color="primary"
                        @input="onFilterTextBoxChangedEdicion"
                        label="Buscar..."
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <br />
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnDefsCliente"
                          :rowData="clientesRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReady"
                          :postProcessPopup="onClickCell"
                          suppressCopyRowsToClipboard="true"
                          @selection-changed="
                            onSelectionChangeEdicionTipoLugar($event)
                          "
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Grupo de Interés',
          nombreEntidad: editedItem.nombre,
        })
      "
      :mensaje="
        $t('mensajes.crud.editar.mensaje', { entidad: 'el Grupo de Interés' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
      :width="390"
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
import { ITipoLugar, ITipoLugarCliente } from '@/interfaces/Zonas';
import { IClientes } from '@/interfaces/Clientes';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { EstadoEntidad, TipoLugarAlcance, ServicioProxy } from '@/config/enums';
import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Validator } from 'vee-validate';
import { differenceBy } from 'lodash';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class TipoLugarInteresModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '' }) })
  tiposlugarinteres!: ITipoLugar;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeInteres;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarCliente: PermisoAccionVm = {
    accion: 'Editar - Asociar Clientes',
    visible: true,
    step: 2,
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

  asociarClienteVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Clientes',
    visible: true,
    step: 2,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarCliente,
    this.informacionGeneralVerDetalle,
    this.asociarClienteVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ITipoLugar = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();
  search: string = '';
  seleccionoTodosClientes: boolean = false;
  muestraClientes: boolean = false;
  buscarCliente: string = '';

  handleErrors: HandleErrors = new HandleErrors();

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];
  clientesRespaldo: IClientes[] = [];
  clientesAsignadosResp: IClientes[] = [];

  tipoLugarInteresCliente: ITipoLugarCliente[] = [];
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

  btnBloquear: Boolean = false;
  controller: string = 'grupodezona';
  controllerCliente: string = 'cliente';
  controllerTipoLugarCliente: string = 'grupodeinteres';

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);

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
    ];

    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          GrupoInteresNombreUnicoEditar:
            '* Ya existe un Grupo de Interés con este nombre.',
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          max: config.errorMensajes.maxLength,
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
  marcarTodosClientes(value: boolean) {
    this.clientesAsignados = [];
    this.clientesAsignadosModel = [];
    if (value) {
      this.clientesRespaldo.forEach((cliente: any) => {
        this.clientesAsignados.push(cliente);
        this.clientesAsignadosModel.push(cliente.id);
      });
    }

    this.seleccionoTodosClientes = value;
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('GrupoInteresNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Nombre ya se encuentra creado.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosGps.http
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
    this.clientesAsignadosModel = [];
    this.clientesAsignados = [];
    this.clientesRespaldo = [];
    this.clientesAsignadosResp = [];

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        await this.obtenerClientes();

        const tipolugar = await this.axiosGps.http.get<ITipoLugar>(
          `${this.controller}/${this.tiposlugarinteres.id}`
        );
        this.editedItem = tipolugar.data;

        await this.obtenerTipoLugarInteresClientes();
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
    await this.seteaAsignados();
    const self = this;
    this.gridApi.forEachNode(function(node: any) {
      var index = self.clientesAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        self.contadorEventoGrilla++;
      }
    });
    this.gridApi.refreshCells({ force: true });
  }

  seteaAsignados() {
    if (!this.esEdicion) {
      this.clientesRespaldo = this.clientesAsignados;
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
    this.buscarCliente = '';
    this.contadorEventoGrillaSelection = 0;
    this.contadorEventoGrilla = 0;
    this.gridApi.setQuickFilter('');
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  //-------------------------------------------------------------------------

  //GRID  -------------------------------------------------------------------
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  //FUNCIONES ---------------------------------------------------------------
  formatDate(fecha: Date): string {
    if (!fecha) return null;
    return moment(fecha).format('DD/MM/YYYY');
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  crearBotonCeldaClientes(params: any) {
    const item = this.clientesRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
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

    eButton.addEventListener('click', () => {
      this.removerClienteAsignacion(item);
    });

    return eButton;
  }

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.axiosGps.http
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
                x.id !== this.editedItem.id &&
                x.tipoLugarAlcance === TipoLugarAlcance.GPS
            );

            if (tipos.length === 0) {
              this.clientesAsignados.length > 0;
              this.dialogConfirmacion = true;
              this.btnBloquear = true;
            } else {
              this.loadingService.hideLoading();
              this.$snotify.error(
                'Ya existe un Grupo de Interés con este nombre'
              );
            }
          })
          .catch(error => {
            this.loadingService.hideLoading();
            if (this.clientesAsignados.length > 0) {
              this.dialogConfirmacion = true;
              this.btnBloquear = true;
            } else {
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.$snotify.error('Debe asociar un cliente.');
                }
              } else {
                this.$snotify.error('Debe asociar un cliente.');
              }
            }
          });
      }
    });
  }

  async obtenerTipoLugarInteresClientes() {
    let he = new HandleErrors();
    let cont = 0;

    if (this.editedItem.id !== undefined) {
      try {
        const response = await this.axiosGps.http.get(
          `${this.controllerTipoLugarCliente}/${this.editedItem.id}/clientes`
        );
        this.tipoLugarInteresCliente = response.data;

        this.tipoLugarInteresCliente.forEach((cl: any) => {
          cont = cont + 1;
          this.clientesAsignados.push(
            this.clientesRespaldo.find(x => x.id == cl.clienteId)
          );
          this.clientesAsignadosModel.push(cl.clienteId);
          if (cont == this.tipoLugarInteresCliente.length) {
            this.initialize();
          }
        });

        this.clientesAsignadosResp = Object.assign([], this.clientesAsignados);
      } catch (error) {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.errorMSG(
              error,
              he,
              'Ha ocurrido un problema al intentar recuperar los clientes asociados'
            );
          }
        } else {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar recuperar los clientes asociados'
          );
        }
      }
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
          await this.actualizacionTipoLugarInteres();
          await this.actualizarClientes();
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }

    this.btnBloquear = false;
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

  async actualizacionTipoLugarInteres() {
    let he = new HandleErrors();

    try {
      const model = {
        Id: this.editedItem.id,
        nombre: this.editedItem.nombre,
        descripcion: this.editedItem.descripcion,
        tipoLugarAlcance: TipoLugarAlcance.GPS,
      };

      await this.axiosGps.http.put(`${this.controller}/`, model);
    } catch (error) {
      this.loadingService.hideLoading();
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
  async obtenerClientes() {
    let he = new HandleErrors();

    try {
      this.loadingService.showLoading();
      const response = await this.axiosCliente.http.get(
        `${this.controllerCliente}`
      );
      this.clientesRespaldo = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al recuperar clientes'
          );
        }
      } else {
        this.errorMSG(
          error,
          he,
          'Ha ocurrido un problema al recuperar clientes'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }

    if (this.clientesRespaldo.length > 0) {
      this.muestraClientes = true;
    } else {
      this.muestraClientes = false;
    }
  }

  async actualizarClientes() {
    //Ingresa/Actualiza/Elimina (Desasocia)
    let he = new HandleErrors();

    let clienteModelListPost: any = [];
    let clienteModelListPut: any = [];
    let clienteModelListDelete: any = [];

    if (this.clientesAsignados == undefined) {
      this.clientesAsignados = [];
    }

    this.clientesAsignados.forEach((cliente: any) => {
      let clienteModel = cliente;
      let exists = this.tipoLugarInteresCliente.find(
        x => x.clienteId == cliente.id
      );

      if (exists == null) {
        clienteModel = {
          clienteId: cliente.id,
          grupoId: this.editedItem.id,
        };

        clienteModelListPost.push(clienteModel);
      } else {
        clienteModel = {
          id: exists.id,
          clienteId: cliente.id,
          grupoId: this.editedItem.id,
        };

        clienteModelListPut.push(clienteModel);
      }
    });

    this.tipoLugarInteresCliente.forEach((cl: any) => {
      let clModel = cl;
      let exists = this.clientesAsignados.find(x => x.id == clModel.clienteId);
      if (exists == null) {
        let clienteModel = {
          id: clModel.id,
        };

        clienteModelListDelete.push(clModel);
      }
    });

    try {
      if (clienteModelListDelete.length > 0) {
        await this.axiosGps.http.delete(this.controllerTipoLugarCliente, {
          data: clienteModelListDelete,
        });

        if (clienteModelListPut.length > 0) {
          await this.axiosGps.http.put(
            this.controllerTipoLugarCliente,
            clienteModelListPut
          );

          if (clienteModelListPost.length > 0) {
            await this.axiosGps.http.post(
              this.controllerTipoLugarCliente,
              clienteModelListPost
            );
            this.close();
          } else {
            this.close();
          }
        } else if (clienteModelListPost.length > 0) {
          await this.axiosGps.http.post(
            this.controllerTipoLugarCliente,
            clienteModelListPost
          );
          this.close();
        } else {
          this.close();
        }
      } else if (clienteModelListPut.length > 0) {
        await this.axiosGps.http.put(
          this.controllerTipoLugarCliente,
          clienteModelListPut
        );

        if (clienteModelListPost.length > 0) {
          await this.axiosGps.http.post(
            this.controllerTipoLugarCliente,
            clienteModelListPost
          );
          this.close();
        } else {
          this.close();
        }
      } else if (clienteModelListPost.length > 0) {
        await this.axiosGps.http.post(
          this.controllerTipoLugarCliente,
          clienteModelListPost
        );
        this.close();
      } else {
        this.close();
      }
    } catch (error) {
      this.loadingService.hideLoading();
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
    }
  }

  onClienteChange(obj: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (obj != undefined && obj.length != this.clientesAsignados.length) {
      for (let x = this.clientesAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= obj.length - 1; i++) {
          if (this.clientesAsignados[x].id == obj[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.clientesAsignados.splice(x, 1);
        }
      }
      if (this.clientesAsignados.length === this.clientesRespaldo.length) {
        this.seleccionoTodosClientes = true;
      } else {
        this.seleccionoTodosClientes = false;
      }
    }
  }

  onClienteInput(obj: any) {
    if (obj != undefined) {
      for (let i = 0; i <= obj.length - 1; i++) {
        let added = this.clientesAsignados.filter(x => x.id == obj[i]);
        if (added.length == 0) {
          let _obj = this.clientesRespaldo.filter(x => x.id == obj[i]);
          this.clientesAsignados.push(_obj[0]);
          if (this.clientesAsignados.length === this.clientesRespaldo.length) {
            this.seleccionoTodosClientes = true;
          } else {
            this.seleccionoTodosClientes = false;
          }
        }
      }
    }
  }

  removerClienteAsignacion(item: IClientes) {
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
    if (this.clientesAsignados.length === this.clientesRespaldo.length) {
      this.seleccionoTodosClientes = true;
    } else {
      this.seleccionoTodosClientes = false;
    }
  }

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
  onFilterTextBoxChangedEdicion() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarCliente.length > 1) {
      this.gridApi.setQuickFilter(this.buscarCliente);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }
  async onSelectionChangeEdicionTipoLugar() {
    this.contadorEventoGrillaSelection++;
    if (this.clientesAsignados.length == 0) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }
    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
      await this.bulk();
      this.clientesAsignados = this.gridApi.getSelectedRows();
    }
  }

  getRowNodeId(cliente: IClientes) {
    if (!cliente) {
      return;
    }
    return cliente.id;
  }
  bulk() {
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

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentCliente(): boolean {
    return true;
  }

  doesExternalFilterPassCliente(node: RowNode): boolean {
    if (this.clientesRespaldo.length > 0 && this.buscarCliente.length > 1) {
      let busqueda = this.buscarCliente.toLowerCase();
      return node.data.nombre.toLowerCase().includes(busqueda);
    }
    return true;
  }
  //---
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

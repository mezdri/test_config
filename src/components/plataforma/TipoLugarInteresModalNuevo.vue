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
      <v-card id="cardDivTLI">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Grupo de Interés</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-volver"
              @click="volver(), cierraMenu()"
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
              >Volver</v-btn
            >&nbsp;&nbsp;
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenu()"
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
            <v-divider v-show="informacionGeneral.visible"></v-divider>
            <v-stepper-step
              :v-show="asociarCliente.visible"
              :complete="e1 > asociarCliente.step"
              :step="asociarCliente.step"
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
                                'required|GrupoInteresNombreUnicoCrear|max:80'
                              "
                              :counter="80"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              v-model="editedItem.nombre"
                              type="text"
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
            <v-stepper-content
              v-show="asociarCliente.visible"
              :step="asociarCliente.step"
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
                            prepend-icon="group"
                            color="primary"
                            @input="onFilterTextBoxChanged"
                            @change="onClienteChange"
                            label="Buscar..."
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
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
                            @selection-changed="onSelectionChanged($event)"
                            :getRowNodeId="getRowNodeIdTipoLugar"
                            :suppressCsvExport="true"
                            :suppressExcelExport="true"
                            :isExternalFilterPresent="
                              isExternalFilterPresentCliente
                            "
                            :doesExternalFilterPass="
                              doesExternalFilterPassCliente
                            "
                          ></ag-grid-vue>
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
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Grupo de Interés' })
      "
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'el Grupo de Interés' })
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
import { IClientes } from '@/interfaces/Clientes';
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
import { differenceBy } from 'lodash';

import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class TipoLugarInteresModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '' }) }) tiposlugar!: ITipoLugar;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.GrupoDeInteres;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarCliente: PermisoAccionVm = {
    accion: 'Crear - Asociar Clientes',
    visible: true,
    step: 2,
    codigoSubAccion: 25,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarCliente,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ITipoLugar = {};
  controller: string = 'grupodezona';
  controllerCliente: string = 'cliente';
  controllerTipoLugarCliente: string = 'grupodeinteres';
  loadingService = new LoadingService();
  search: string = '';
  seleccionoTodosClientes: boolean = false;
  buscarCliente: string = '';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  muestraClientes: boolean = false;

  usuarioId: number = store.state.userId;

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefsCliente: Array<ColDef> = [];

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  clientesAsignadosModel: any = [];
  clientesAsignados: IClientes[] = [];
  clientesRespaldo: IClientes[] = [];
  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  //---------------------------------------------------------------------------------------------------------

  async mounted() {
    await this.initialize();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.btnBloquear = false;
    this.clientesAsignadosModel = [];
    this.clientesAsignados = [];
    if (value) {
      await this.obtenerClientes();
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivTLI').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.buscarCliente = '';
    this.gridApi.setQuickFilter('');
    this.clientesRespaldo = [];
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivTLI').scrollIntoView(true);
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
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

  async initialize() {
    await this.obtenerClientes();
    this.generaColumnasGrilla();
    this.dictionaryFormErrors = {
      custom: {
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          GrupoInteresNombreUnicoCrear:
            '* Ya existe un Grupo de Interés con este nombre.',
          max: config.errorMensajes.maxLength,
        },
        descripcion: {
          max: config.errorMensajes.maxLength,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  generaColumnasGrilla() {
    this.columnDefsCliente = [
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
  }

  createButtonCellClientes(params: any) {
    const item = this.clientesRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerClienteAsignacion(item);
    });
    return eButton;
  }

  created() {
    this.registrarValidadores();
    this.chequearPermisos();
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('GrupoInteresNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Nombre ya se encuentra creado.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosGps.http
            .get(`${self.controller}/${0}/${value}/ChequearNombreUnico`)
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

  //GRABAR --------------------------------------------------------------------------------------
  continuar() {
    document.getElementById('cardDivTLI').scrollIntoView(true);
    if (this.e1 === this.informacionGeneral.step) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.e1 = 2;
          this.btnText = 'Guardar';
          this.btnClass = 'btn-grabar';
          //valida nombre del grupo de interes
          /*this.axiosGps.http
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
                  x.tipoLugarAlcance === TipoLugarAlcance.GPS
              );
              if (tipos.length === 0) { 
                this.e1 = 2;
                this.btnText = 'Guardar';
                this.btnClass = 'btn-grabar';
              } else {
                this.$snotify.error(
                  'Ya existe un Grupo de Interés con este nombre'
                );
              }
            })
            .catch(error => {
              this.e1 = 2;
              this.btnText = 'Guardar';
              this.btnClass = 'btn-grabar';
            });*/
        }
      });
    } else if (this.e1 === this.asociarCliente.step) {
      //grabar
      this.$validator.validateAll().then(res => {
        if (res) {
          this.clientesAsignados.length > 0;
          this.dialogConfirmacion = true;
          this.btnBloquear = true;
        }
      });
    }
  }

  async obtenerClientes() {
    try {
      this.loadingService.showLoading();
      const response = await this.axiosCliente.http.get(this.controllerCliente);
      this.clientesRespaldo = response.data;
      let clientes: any = [];

      response.data.forEach((element: any) => {
        clientes.push({
          Id: 0,
          ClienteId: element.id,
        });
      });
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener el listado de clientes'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener el listado de clientes'
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

  onClienteChange(obj: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (obj !== undefined && obj.length !== this.clientesAsignados.length) {
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
    if (obj !== undefined) {
      for (let i = 0; i <= obj.length - 1; i++) {
        let added = this.clientesAsignados.filter(x => x.id == obj[i]);

        if (added.length === 0) {
          const clienteAsignar = this.clientesRespaldo.find(
            x => x.id == obj[i]
          );
          this.clientesAsignados.push(clienteAsignar);
          if (this.clientesAsignados.length === this.clientesRespaldo.length)
            this.seleccionoTodosClientes = true;
          else this.seleccionoTodosClientes = false;
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

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      const resultadoValidacion = await this.$validator.validateAll();

      if (resultadoValidacion) {
        this.btnBloquear = true;
        await this.nuevo();
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

  closeSuccess() {
    this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Grupo de Interés',
        creadoA: 'creado',
      })
    );
  }

  async nuevo() {
    const he = new HandleErrors();

    const modelTipoLugarInteres = {
      id: 0,
      nombre: this.editedItem.nombre,
      descripcion: this.editedItem.descripcion,
      tipoLugarAlcance: TipoLugarAlcance.GPS,
    };

    try {
      this.loadingService.showLoading();
      const response = await this.axiosGps.http.post(
        this.controller,
        modelTipoLugarInteres
      );
      await this.grabarAsociacionesCliente(response.data.id);
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar crear el Grupo de interés.'
          );
        }
      } else {
        this.errorMSG(
          error,
          he,
          'Ha ocurrido un problema al intentar crear el Grupo de interés.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async grabarAsociacionesCliente(tipoLugarId: number) {
    let tipolugarClienteModelListPost: any = [];

    if (this.clientesAsignados.length > 0) {
      let he = new HandleErrors();

      this.clientesAsignados.forEach((cliente: any) => {
        let clienteModel = cliente;
        clienteModel = {
          grupoId: tipoLugarId,
          clienteId: cliente.id,
        };

        tipolugarClienteModelListPost.push(clienteModel);
      });

      if (tipolugarClienteModelListPost.length > 0) {
        try {
          await this.axiosGps.http.post(
            `${this.controllerTipoLugarCliente}/`,
            tipolugarClienteModelListPost
          );
          this.closeSuccess();
        } catch (error) {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.errorMSG(
                error,
                he,
                'Ha ocurrido un problema al intentar crear el Grupo de interés.'
              );
            }
          } else {
            this.errorMSG(
              error,
              he,
              'Ha ocurrido un problema al intentar crear el Grupo de interés.'
            );
          }
        }
      } else {
        this.closeSuccess();
      }
    } else {
      this.closeSuccess();
    }
  }

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
  onSelectionChanged(e: any) {
    this.clientesAsignados = this.gridApi.getSelectedRows();
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
  onFilterTextBoxChanged() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarCliente.length > 1) {
      this.gridApi.setQuickFilter(this.buscarCliente);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }
  getRowNodeIdTipoLugar(cliente: IClientes) {
    if (!cliente) {
      return;
    }
    return cliente.id;
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

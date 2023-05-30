<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivLista">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Contacto</v-toolbar-title>

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
              v-show="asociarLista.visible"
              :complete="e1 > asociarLista.step"
              :step="asociarLista.step"
              >Asociar Lista de Distribución</v-stepper-step
            >
            <v-divider
              v-show="asociarLista.visible && !informacionGeneral.visible"
            ></v-divider>
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
                            ></v-switch>
                          </v-flex>-->
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.correo"
                              v-validate="{
                                rules: {
                                  required: true,
                                  max: 200,
                                  email: true,
                                  regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                                  correoUsuario: true,
                                },
                              }"
                              :error-messages="
                                errors.collect('correo electrónico')
                              "
                              data-vv-name="correo electrónico"
                              :counter="200"
                              label="Correo Electrónico"
                              @input="getContacto()"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.rut"
                              label="Rut"
                              placeholder="EJ: 11111111-1"
                              v-validate="{
                                rules: {
                                  max: 10,
                                  rut: true,
                                  rutFormato: true,
                                },
                              }"
                              :counter="10"
                              :error-messages="errors.collect('rut')"
                              data-vv-name="rut"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.nombre"
                              v-validate="'required|max:80'"
                              :error-messages="errors.collect('nombre')"
                              data-vv-name="nombre"
                              label="Nombre"
                              type="text"
                              :counter="80"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-select
                              v-model="editedItem.tipoContactoId"
                              item-text="nombre"
                              item-value="id"
                              :items="tiposContacto"
                              v-validate="'required'"
                              label="Tipo Contacto"
                              :error-messages="errors.collect('tipoContacto')"
                              data-vv-name="tipoContacto"
                              no-data-text="Sin resultados"
                              required
                            ></v-select>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.fono"
                              label="Teléfono"
                              placeholder="56999999999"
                              v-validate="{
                                max: 11,
                                regex: /^(569)[0-9]\d{7}$/,
                              }"
                              :counter="11"
                              :error-messages="
                                errors.collect('Teléfono Contacto')
                              "
                              data-vv-name="Teléfono Contacto"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.empresa"
                              v-validate="'max:80'"
                              :error-messages="errors.collect('empresa')"
                              data-vv-name="empresa"
                              label="Empresa"
                              type="text"
                              :counter="80"
                              required
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
              v-show="asociarLista.visible"
              :step="asociarLista.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">
                              Asociar Lista de Distribución
                            </h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-form ref="form" lazy-validation>
                            <v-text-field
                              label="Buscar..."
                              v-model="buscarListaDistribucion"
                              @input="onFilterTextBoxChangedLista"
                              prepend-icon="group"
                              append-icon="search"
                            ></v-text-field>
                          </v-form>
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
                              :rowData="listasRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReady"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onSelectionChanged($event)"
                              :getRowNodeId="getRowNodeId"
                              suppressCopyRowsToClipboard="true"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Contacto' })"
      :mensaje="mensajeConfirmacionInactivo"
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
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
const { AgGridVue } = require('ag-grid-vue');
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import ValidaRut from '@/config/validaRut';
import { Contacto } from '@/pantallas/Contactos/Contacto';
import { ITipoContacto } from '../../interfaces/TipoContacto';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { differenceBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { ListaDistribucion } from '../../pantallas/ListaDistribucion/ListaDistribucion';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ContactoModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Contactos;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarLista: PermisoAccionVm = {
    accion: 'Crear - Asociar Lista de Distribución',
    visible: true,
    step: 2,
    codigoSubAccion: 58,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarLista,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: Contacto = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dialogConfirmacionClose: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  vr: ValidaRut = new ValidaRut();

  //controllers
  readonly Controller: string = 'Contactos';

  //Data
  tiposContacto: ITipoContacto[] = [];
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;

  //Grilla
  buscarListaDistribucion: string = '';
  columnDefs: Array<ColDef> = [];
  listasAsignados: ListaDistribucion[] = [];
  listasRespaldo: ListaDistribucion[] = [];
  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;

  constructor() {
    super();

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
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        lockPinned: true,
        minWidth: 80,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
    ];
  }

  created() {
    this.chequearPermisos();
  }

  mounted() {
    this.initialize();
    this.registrarValidadores();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.$validator.reset();
    if (value) {
      this.loadingService.showLoading();
      this.editedItem.estado = EstadoEntidad.Activo;
      this.registrarValidadores();
      await this.getTipoContacto(0);
      await this.getListasDistribucion();
      this.loadingService.hideLoading();
    }
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el Contacto',
    });
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivLista').scrollIntoView(true);
        if (this.guardarInactivo) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
        } else {
          if (this.e1 === this.permisosActuales.length) {
            this.btnBloquear = true;
            this.dialogConfirmacion = true;
          } else if (this.e1 === this.permisosActuales.length - 1) {
            this.e1 += 1;
            this.btnText = 'Guardar';
            this.btnClass = 'btn-grabar';
          } else {
            this.e1 += 1;
          }
        }
      }
    });
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivLista').scrollIntoView(true);
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset();
    this.dialog = false;
    this.warningInactivo = '';
    this.estado = true;
    this.listasAsignados = [];
    this.listasRespaldo = [];
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.loadingService.showLoading();
      this.editedItem.listaDistribucionId = this.listasAsignados.map(
        lista => lista.id
      );
      this.axios.http
        .post(`${this.Controller}/${this.clienteId}`, this.editedItem)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Contacto',
              creadoA: 'creado',
            })
          );
          this.closeModal(false);
          this.dialogConfirmacion = false;
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'Contacto',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'Contacto',
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

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        'correo electrónico': {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        tipoContacto: {
          required: () => config.errorMensajes.textoRequerido,
        },
        'Teléfono Contacto': {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        empresa: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  registrarValidadores() {
    const validarRut = this.vr;
    const self = this;

    Validator.extend('rut', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: validarRut.Rut(value),
            data: validarRut.Rut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });

    Validator.extend('rutFormato', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Rut inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: validarRut.validaFormatoRut(value),
            data: validarRut.validaFormatoRut(value)
              ? undefined
              : { message: '* Rut inválido' },
          });
        });
      },
    });

    Validator.extend('correoUsuario', {
      getMessage(field: any, params: any, data: any) {
        return '* Correo Electrónico ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axios.http
          .get(`${self.Controller}/validaCorreo/${value}/${self.clienteId}`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data.value,
                data: response.data.value
                  ? undefined
                  : {
                      message: '* Correo Electrónico ya se encuentra en uso.',
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

  async getTipoContacto(id: number) {
    try {
      const response = await this.axios.http.get(
        `${this.Controller}/${id}/${this.clienteId}/tiposContacto`
      );
      this.tiposContacto = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  onFilterTextBoxChangedLista() {
    if (this.buscarListaDistribucion.length > 1) {
      this.gridApi.setQuickFilter(this.buscarListaDistribucion);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  onSelectionChanged() {
    this.listasAsignados = this.gridApi.getSelectedRows();
    const listasSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const listasNoSeleccionados = differenceBy(
      this.listasRespaldo,
      listasSeleccionados,
      lista => lista.id
    ).map(lista => ({
      ...lista,
      checked: false,
    }));
    this.gridApi.updateRowData({
      update: [...listasNoSeleccionados, ...listasSeleccionados],
    });
  }

  getRowNodeId(lista: any) {
    if (!lista) {
      return;
    }
    return lista.id;
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivLista').scrollIntoView(true);
  }

  async getContacto() {
    if (!this.$validator.errors.items.find(error => error.id == '2')) {
      const self = this;
      self.axios.http
        .get(
          `${self.Controller}/BuscaContactoPorCorreo/${this.editedItem.correo}/${self.clienteId}`
        )
        .then(response => {
          if (response.data != '') {
            this.editedItem = response.data;
            this.estado = this.editedItem.estado === 1 ? true : false;
            this.selectedEstado(this.estado);
            this.getTipoContacto(this.editedItem.tipoContactoId);
            this.$validator.errors.clear();
          }
        })
        .catch(err => {
          return true;
        });
    }
  }

  async getListasDistribucion() {
    const res: any = await this.axios.http.get(
      `ListaDistribucionB/listaDistribucionActivas/${config.getClienteSesion()}`
    );
    this.listasRespaldo = res.data;
  }

  selectedEstado(isActivo: boolean) {
    if (!isActivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Contacto',
        });
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Contacto' }
      );
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

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
            esEdicion ? 'Editar Contacto' : 'Ver Detalle Contacto'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion(), (btnBloquear = true)"
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
                @click="cierraMenu"
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
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (asociarLista.visible && esEdicion) ||
                    (asociarListaVerDetalle.visible && !esEdicion)
                "
                :value="asociarLista.step"
                :disabled="!validForm || btnBloquear"
              >
                <span>Asociar Lista de Distribución</span>
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
                      <v-flex xs12 sm12 md6>
                        <v-text-field
                          v-model="editedItem.correo"
                          v-validate="{
                            rules: {
                              required: true,
                              max: 200,
                              email: true,
                              regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                            },
                          }"
                          :error-messages="errors.collect('correo electrónico')"
                          data-vv-name="correo electrónico"
                          :counter="200"
                          label="Correo Electrónico"
                          :disabled="true"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md6>
                        <v-text-field
                          v-model="editedItem.rut"
                          label="Rut Contacto"
                          :placeholder="!esEdicion ? '' : 'EJ: 11111111-1'"
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
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          required
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md6>
                        <v-text-field
                          v-model="editedItem.fono"
                          label="Teléfono"
                          :placeholder="!esEdicion ? '' : '56999999999'"
                          v-validate="{
                            max: 11,
                            regex: /^(569)[0-9]\d{7}$/,
                          }"
                          :counter="11"
                          :error-messages="errors.collect('Teléfono Contacto')"
                          data-vv-name="Teléfono Contacto"
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
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
          <div
            align="center"
            v-show="
              bottomNav == asociarLista.step &&
                ((asociarLista.visible && esEdicion) ||
                  (asociarListaVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Lista de Distribución</h2>
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
                          v-model="buscaListaEditar"
                          @input="onFilterTextBoxChangedGpsEditar"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Contacto',
          nombreEntidad: contacto.nombre,
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
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, true)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Contacto } from '@/pantallas/Contactos/Contacto';
import { ITipoContacto } from '../../interfaces/TipoContacto';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { ListaDistribucion } from '../../pantallas/ListaDistribucion/ListaDistribucion';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ContactoModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0 }) }) contacto!: Contacto;

  //permisos
  funcionalidad: Funcionalidades = Funcionalidades.Contactos;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarLista: PermisoAccionVm = {
    accion: 'Editar - Asociar Lista de Distribución',
    visible: true,
    step: 2,
    codigoSubAccion: 58,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarListaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Lista de Distribución',
    visible: true,
    step: 2,
    codigoSubAccion: 58,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarLista,
    this.informacionGeneralVerDetalle,
    this.asociarListaVerDetalle,
  ];

  //controller
  readonly Controller: string = 'Contactos';

  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: Contacto = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  btnBloquear: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();

  //Data
  tiposContacto: ITipoContacto[] = [];
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;
  sideBar: any = config.agGridDefaultConfig;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  listasAsignados: ListaDistribucion[] = [];
  listasRespaldo: ListaDistribucion[] = [];
  localeText: any = config.agGridTextos;
  buscaListaEditar: string = '';

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.bottomNav = '1';
    this.$validator.reset();

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.editedItem = this.contacto;
      this.estado = this.editedItem.estado === 1 ? true : false;
      await this.getTipoContacto();
      await this.getListasDistribucion();
      this.selectedEstado(this.estado);
      this.initialize();
      this.btnBloquear = false;
      this.editedItem.listaDistribucionId;
      await this.seteaAsignados();
      this.loadingService.hideLoading();
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

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
        this.btnBloquear = false;
      }
    });
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.loadingService.showLoading();
      try {
        this.editedItem.estado = 1;
        this.editedItem.listaDistribucionId = this.listasAsignados.map(
          lista => lista.id
        );
        this.axios.http
          .put(
            `${this.Controller}/${config.getClienteSesion()}`,
            this.editedItem
          )
          .then(contacto => {
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

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
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

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.buscaListaEditar = '';
    //this.gridApi.setQuickFilter('');
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.warningInactivo = ' ';
    this.estado = true;
    this.listasAsignados = [];
    this.listasRespaldo = [];
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
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
        sort: 'desc',
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

    this.dictionaryFormErrors = {
      custom: {
        cia: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
        },
        tipoSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numeroTelefonico: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          regex: config.errorMensajes.regex,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    if (!this.esEdicion) {
      this.columnDefs.shift();
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

  getRowNodeId(lista: any) {
    if (!lista) {
      return;
    }
    return lista.id;
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

  onFilterTextBoxChangedGpsEditar() {
    if (this.buscaListaEditar.length > 1) {
      this.gridApi.setQuickFilter(this.buscaListaEditar);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  async getTipoContacto() {
    try {
      const response = await this.axios.http.get(
        `${this.Controller}/${this.editedItem.tipoContactoId}/${this.clienteId}/tiposContacto`
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

  selectedEstado(isActivo: boolean) {
    if (!isActivo) {
      this.guardarInactivo = true;

      this.warningInactivo =
        'Al dejar como inactivo, no se podrán realizar asociaciones.';
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'el Contacto',
        });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el Contacto' }
      );
    }
  }

  async getListasDistribucion() {
    const res: any = await this.axios.http.get(
      `ListaDistribucionB/listaDistribucionActivas/${config.getClienteSesion()}`
    );
    this.listasRespaldo = res.data;
  }

  seteaAsignados() {
    this.listasRespaldo.forEach(lista => {
      let id = this.editedItem.listaDistribucionId.find(id => id === lista.id);
      if (id) {
        this.listasAsignados.push(lista);
        lista.checked = true;
      } else {
        lista.checked = false;
      }
    });

    if (!this.esEdicion) {
      this.listasRespaldo = this.listasAsignados;
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

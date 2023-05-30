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
            {{ esEdicion ? 'Editar Flota' : 'Ver Detalle Flota' }}
          </v-toolbar-title>
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
                  (asociarUsuario.visible && esEdicion) ||
                    (asociarUsuarioVerDetalle.visible && !esEdicion)
                "
                :value="asociarUsuario.step"
              >
                <span>Asociar Usuarios</span>
                <v-icon>person_add</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (asociarVehiculos.visible && esEdicion) ||
                    (asociarVehiculosVerDetalle.visible && !esEdicion)
                "
                :value="asociarVehiculos.step"
              >
                <span>Asociar Vehículos</span>
                <v-icon>directions_car</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (asociarSubFlota.visible && esEdicion) ||
                    (asociarSubFlotaVerDetalle.visible && !esEdicion)
                "
                :value="asociarSubFlota.step"
              >
                <span>Asociar Subflotas</span>
                <v-icon>commute</v-icon>
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
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
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
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <v-text-field
                            v-validate="
                              'required|FlotaNombreUnicoEditar|max:80'
                            "
                            v-model="editedItem.nombre"
                            :error-messages="errors.collect('nombre')"
                            data-vv-name="nombre"
                            label="Nombre"
                            type="text"
                            :counter="80"
                            :disabled="!esEdicion"
                            required
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <v-text-field
                            v-validate="'max:200'"
                            v-model="editedItem.descripcion"
                            :error-messages="errors.collect('descripcion')"
                            data-vv-name="descripcion"
                            label="Descripción"
                            type="text"
                            :counter="200"
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <v-autocomplete
                            v-validate="'required'"
                            v-model="selectedCliente"
                            :error-messages="errors.collect('cliente')"
                            data-vv-name="cliente"
                            :items="clientes"
                            label="Cliente"
                            item-text="nombre"
                            item-value="id"
                            persistent-hint
                            :clearable="true"
                            :disabled="true"
                            no-data-text="Sin resultados"
                            required
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <v-autocomplete
                            v-model="selectedFlotaPadre"
                            :items="flotasPadre"
                            label="Flota Padre"
                            item-text="nombre"
                            item-value="id"
                            persistent-hint
                            :clearable="true"
                            no-data-text="Sin resultados"
                            :disabled="!esEdicion"
                            @change="changeFlotaPadre"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <br />

                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <div align="left">
                            <h2 class="h2_title">Responsables</h2>
                          </div>
                          <v-divider></v-divider>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <v-autocomplete
                            v-model="selectedResponsableFlota"
                            :items="usuariosRespaldo"
                            label="Responsable de la flota"
                            :item-text="nombreCompleto"
                            item-value="id"
                            persistent-hint
                            :clearable="true"
                            prepend-icon="person"
                            :disabled="!esEdicion"
                            no-data-text="Sin resultados"
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout align-center justify-center row>
                        <v-flex xs8 sm8 md8>
                          <v-autocomplete
                            v-model="selectedResponsableMantencion"
                            :items="usuariosRespaldo"
                            label="Responsable de mantención de la flota"
                            :item-text="nombreCompleto"
                            item-value="id"
                            persistent-hint
                            :clearable="true"
                            prepend-icon="person"
                            :disabled="!esEdicion"
                            no-data-text="Sin resultados"
                          ></v-autocomplete>
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
              bottomNav == asociarUsuario.step &&
                ((asociarUsuario.visible && esEdicion) ||
                  (asociarUsuarioVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Usuarios</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarUsuario"
                        prepend-icon="person"
                        color="primary"
                        label="Buscar..."
                        @input="onFilterTextBoxChangedAsociarUsuarios"
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                    <!-- <v-flex md6 style="padding-top:22px">
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
                          :rowData="usuariosRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReady"
                          :postProcessPopup="onClickCell"
                          @selection-changed="
                            onSelectedChangeUsuariosEdicion($event)
                          "
                          :getRowNodeId="getRowNodeIdUsuario"
                          suppressCopyRowsToClipboard="true"
                          :processCellForClipboard="procesarFecha"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentUsuario
                          "
                          :doesExternalFilterPass="
                            doesExternalFilterPassUsuario
                          "
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
              bottomNav == asociarVehiculos.step &&
                ((asociarVehiculos.visible && esEdicion) ||
                  (asociarVehiculosVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Vehículos</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-alert
                    v-if="cantidadVehiculosYaAsociados > 0"
                    :value="true"
                    color="error"
                    icon="warning"
                    :dismissible="true"
                    outline
                  >
                    ADVERTENCIA: Existen
                    {{ cantidadVehiculosYaAsociados }} vehículos que ya poseen
                    una asociación, si continua con esta operación serán
                    re-asociados a la flota actual.
                  </v-alert>
                  <h3
                    style="font-size: 1.6vmin; font-weight: 400; width: fit-content;"
                  >
                    Tipo de Asociación:
                  </h3>
                  <v-checkbox
                    v-model="duplicateVehicle"
                    label="Si desmarca esta opción, los vehículos permanecerán tanto en la flota actual como en la nueva"
                  ></v-checkbox>
                  <br />
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarVehiculo"
                        prepend-icon="directions_car"
                        color="primary"
                        label="Buscar..."
                        @input="onFilterTextBoxChangedAsociarVehiculo"
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                    <!-- <v-flex md6 style="padding-top:22px">
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
                          style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnDefsVehiculos"
                          :rowData="vehiculosRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBarVehiculos"
                          :localeText="localeText"
                          :onGridReady="onGridReadyVehiculoEdicion"
                          :postProcessPopup="onClickCell"
                          @row-selected="
                            onSelectedChangeVehiculosEdicion($event)
                          "
                          @selection-changed="
                            onSelectedChangeVehiculosMasivoEdicion
                          "
                          :getRowNodeId="getRowNodeIdVehiculosEdicion"
                          suppressCopyRowsToClipboard="true"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentVehiculo
                          "
                          :doesExternalFilterPass="
                            doesExternalFilterPassVehiculo
                          "
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
              bottomNav == asociarSubFlota.step &&
                ((asociarSubFlota.visible && esEdicion) ||
                  (asociarSubFlotaVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar Subflotas</h2>
                      </v-flex>
                      <p>
                        (Opcional, las Flotas asociadas quedarán guardadas como
                        subflotas de esta)
                      </p>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-alert
                    v-if="!puedeAsociarSubFlotas"
                    :value="true"
                    color="error"
                    icon="warning"
                    :dismissible="true"
                    outline
                  >
                    ADVERTENCIA: No es posible asignar Subflotas, si la flota
                    actual posee una Flota Padre.
                  </v-alert>
                  <br />
                  <v-layout row wrap v-show="puedeAsociarSubFlotas">
                    <v-flex md6>
                      <v-text-field
                        v-model="buscarSubFlota"
                        prepend-icon="commute"
                        color="primary"
                        label="Buscar..."
                        @input="onFilterTextBoxChangedAsociarSubFlota"
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
                          :columnDefs="columnDefsSubFlotas"
                          :rowData="subFlotasRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBarSubFlotas"
                          :localeText="localeText"
                          :onGridReady="onGridReadySubFlota"
                          :postProcessPopup="onClickCell"
                          @selection-changed="onSelectedChangeSubFlota($event)"
                          :getRowNodeId="getRowNodeIdSubFlotas"
                          suppressCopyRowsToClipboard="true"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="
                            isExternalFilterPresentSubFlota
                          "
                          :doesExternalFilterPass="
                            doesExternalFilterPassSubFlota
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
          entidad: 'Flota',
          nombreEntidad: flota.nombre,
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

    <v-dialog
      v-model="dialogVehiculoCompartido"
      persistent
      max-width="450"
      style="z-index: 250 !important"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Vehículo Compartido</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text style="text-align: justify">{{
          dialogVehiculoCompartidoText
        }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" depressed small v-if="btnRechazoShow">
            <span style="color: #526da5">Rechazar</span>
          </v-btn>
          <v-btn
            color="white"
            depressed
            small
            @click="remueveVehiculoCompartido()"
            v-if="!btnRechazoShow"
          >
            <span style="color: #526da5">Rechazar</span>
          </v-btn>
          <v-btn color="#526da5" depressed small>
            <span style="color: white;" @click="inicializaIndices()"
              >Aceptar</span
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogVehiculoCompartidoMasivo"
      persistent
      max-width="450"
      style="z-index: 1000006  !important"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Vehículo Compartido</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text style="text-align:justify; ">{{
          dialogVehiculoCompartidoText
        }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" depressed small>
            <span
              style="color: #526da5"
              @click="remueveVehiculoCompartidoMasivo()"
              >Rechazar</span
            >
          </v-btn>
          <v-btn
            color="#526da5"
            depressed
            small
            @click="dialogVehiculoCompartidoMasivo = false"
          >
            <span style="color: white;" @click="inicializaIndicesMasivo"
              >Aceptar</span
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import {
  ServicioProxy,
  EstadoEntidad,
  EstadoCompartirInformacion,
  TipoCompartir,
} from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { FlotaInterface } from '@/interfaces/Flota';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { IClientes } from '@/interfaces/Clientes';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { Validator } from 'vee-validate';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { differenceBy, uniqBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
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
export default class FlotasModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  flota!: FlotaInterface;

  readonly controller: string = 'flota';
  readonly controllerFlotaCompartida: string = 'flotaCompartida';
  readonly controllerUsuario: string = 'usuario';
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerCliente: string = 'cliente';
  readonly controllerVehiculoFlota: string = 'VehiculoFlota';

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Flotas;
  permisosActuales: PermisoAccionVm[] = [];
  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarUsuario: PermisoAccionVm = {
    accion: 'Editar - Asociar Usuarios',
    visible: true,
    step: 2,
    codigoSubAccion: 11,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarVehiculos: PermisoAccionVm = {
    accion: 'Editar - Asociar Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarSubFlota: PermisoAccionVm = {
    accion: 'Editar - Asociar Sub-Flotas',
    visible: true,
    step: 4,
    codigoSubAccion: 33,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarUsuarioVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Usuarios',
    visible: true,
    step: 2,
    codigoSubAccion: 11,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarVehiculosVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Vehículos',
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarSubFlotaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Sub-Flotas',
    visible: true,
    step: 4,
    codigoSubAccion: 33,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  duplicateVehicle: boolean = true;

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarUsuario,
    this.asociarVehiculos,
    this.asociarSubFlota,
    this.informacionGeneralVerDetalle,
    this.asociarUsuarioVerDetalle,
    this.asociarVehiculosVerDetalle,
    this.asociarSubFlotaVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  bottomNav: any = '1';
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: FlotaInterface = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  flotas: FlotaInterface[] = [];
  clientes: any = [];
  btnBloquear: boolean = false;
  btnRechazoShow: boolean = false;
  listaVehiculosBack: any = [];
  puedeAsociarSubFlotas: boolean = true;
  dialogConfirmacionClose: boolean = false;
  dialogVehiculoCompartido: boolean = false;
  dialogVehiculoCompartidoMasivo: boolean = false;
  cantidadVehiculosYaAsociados: number = 0;
  dialogVehiculoCompartidoText: string = '';
  dialogVehiculoCompartidoCaso2: boolean = false;
  dialogVehiculoCompartidoClear: boolean = false;
  dialogVehiculoDeseleccionar: boolean = false;
  dialogVehiculoCompartidoTextCaso2: string = '';
  idVehiculoCompartidoCaso2: number = 0;
  vehiculoIdCompartidoDes: number = 0;
  idCliente: number = config.getClienteSesion();
  loadingService = new LoadingService();
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosMetabase: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  search: string = '';
  //seleccionoTodosUsuarios: boolean = true;
  buscarUsuario: string = '';
  buscarVehiculo: string = '';
  buscarSubFlota: string = '';
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;
  contadorEventoGrillaUsuario: number = 0;
  contadorEventoGrillaSelectionUsuario: number = 0;
  contadorEventoGrillaSub: number = 0;
  contadorEventoGrillaSelectionSub: number = 0;
  aux: number = 0;

  seleccionoTodosVehiculo: boolean = true;
  seleccionoTodosSub: boolean = true;
  vehCompartidos: any = [];
  indexVehiculo: number = 0;

  //usuariosAsignadosModel: any = [];
  usuariosAsignados: UsuariosInterface[] = [];
  usuariosRespaldo: UsuariosInterface[] = [];
  usuariosAsignadosResp: UsuariosInterface[] = [];
  muestraVehiculos: boolean = false;
  muestraSub: boolean = false;

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: any[] = []; //IVehiculo[] = []; //09-2019: Desarrollo Compartir Información
  vehiculosRespaldo: IVehiculo[] = [];
  vehiculosAsignadosResp: IVehiculo[] = [];
  vehiculosNoAsignados: IVehiculo[] = [];
  vehiculosAsignadosAux: IVehiculo[] = [];
  vehiculosAsignadosRespaldoGrilla: IVehiculo[] = [];
  vehiculosAsignadosRespaldoGrillaCall: IVehiculo[] = [];
  eData: any;

  subFlotassAsignadosModel: any = [];
  subFlotasAsignados: FlotaInterface[] = [];
  subFlotasRespaldo: FlotaInterface[] = [];
  subFlotasAsignadosResp: FlotaInterface[] = [];

  //grilla
  autoGroupColumnDef: any = null;
  localeText: any = config.agGridTextos;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  gridApiVehiculosEdicion: GridApi;
  columnApiVehiculos: ColumnApi;
  columnDefsVehiculos: Array<ColDef> = [];
  sideBarVehiculos: any = config.agGridDefaultConfig;

  gridApiSubFlotas: GridApi;
  columnApiSubFlotas: ColumnApi;
  columnDefsSubFlotas: Array<ColDef> = [];
  sideBarSubFlotas: any = config.agGridDefaultConfig;

  selectedCliente: any = null;
  selectedFlotaPadre: any = null;
  selectedResponsableFlota: any = null;
  selectedResponsableMantencion: any = null;
  esFlotaCompartida: boolean = false;

  textoVehiculo(item: any) {
    let retorno: string = '';
    if (item !== undefined && item !== null) {
      if (item.patente !== null && item.patente !== '') retorno = item.patente;
      else if (item.vin !== null && item.vin !== '') retorno = item.vin;
    }
    return retorno;
  }

  created() {
    this.registrarValidadores();
  }

  mounted() {
    this.initialize();
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

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();

    Validator.extend('FlotaNombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Flota con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosVehiculo.http
            .get(
              `${self.controller}/${self.flota.id}/${clienteId}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : { message: '* Ya existe una Flota con este nombre.' },
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

  nombreCompleto(user: UsuariosInterface): string {
    return (
      (user.nombre != undefined ? user.nombre : '') +
      ' ' +
      (user.apellidoPaterno != undefined ? user.apellidoPaterno : '') +
      ' ' +
      (user.apellidoMaterno != undefined ? user.apellidoMaterno : '')
    );
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.bottomNav = '1';
    this.cantidadVehiculosYaAsociados = 0;
    this.btnText = 'Continuar';
    this.usuariosAsignados = [];
    //this.usuariosAsignadosModel = [];
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];
    this.vehiculosNoAsignados = [];
    this.subFlotasAsignados = [];
    this.subFlotassAsignadosModel = [];
    this.selectedFlotaPadre = [];
    this.selectedCliente = null;
    this.selectedResponsableFlota = [];
    this.selectedResponsableMantencion = [];
    this.btnRechazoShow = false;
    this.esFlotaCompartida = false;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.btnBloquear = false;
      this.seleccionoTodosVehiculo = false;
      //this.seleccionoTodosUsuarios = false;
      this.seleccionoTodosSub = false;
      this.idCliente = config.getClienteSesion();
      this.editedItem = this.flota;

      //Se ordena la llamada de carga de listados y seteado de datos
      await this.getClientes();
      await this.flotaCompartida();
      await this.getUsuarios();
      await this.getVehiculos();
      await this.getFlotas();
      await this.getDataInicial();
      //---

      if (this.flota.clienteId !== null) {
        this.selectedCliente = this.flota.clienteId;
      }
      if (this.flota.padreId !== null) {
        this.selectedFlotaPadre = this.flota.padreId;
      }

      if (this.flota.responsableFlotaId !== null) {
        this.selectedResponsableFlota = this.flota.responsableFlotaId;
      }

      if (this.flota.responsableMantenimientoFlotaId !== null) {
        this.selectedResponsableMantencion = this.flota.responsableMantenimientoFlotaId;
      }
      this.initialize();
    }
    this.vehiculosRespaldo.forEach(veh => {
      let exists: any = this.vehiculosAsignados.filter(
        (x: any) => x.id === veh.id
      );
      if (exists.length == 0) {
        veh.checked = false;
      } else {
        veh.checked = true;
      }
    });
    await this.seteaAsignadosVerDetalleVehiculo();
    const self = this;
    this.gridApiVehiculosEdicion.forEachNode(function(node: any) {
      var index = self.vehiculosAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        self.contadorEventoGrilla++;
      }
    });
  }

  @Watch('selectedFlotaPadre')
  onflotaPadreChanged(value: any, oldValue: any) {
    if (this.selectedFlotaPadre == null) {
      this.puedeAsociarSubFlotas = true;
    } else if (this.selectedFlotaPadre.length === 0) {
      this.puedeAsociarSubFlotas = true;
    } else {
      this.puedeAsociarSubFlotas = false;
    }
  }

  seteaAsignadosVerDetalleUsuario() {
    if (!this.esEdicion) {
      this.usuariosRespaldo = this.usuariosAsignados;
    }
  }

  seteaAsignadosVerDetalleSubFlota() {
    if (!this.esEdicion) {
      this.subFlotasRespaldo = this.subFlotasAsignados;
    }
  }
  seteaAsignadosVerDetalleVehiculo() {
    if (!this.esEdicion) {
      window.setTimeout(() => {
        const arr = this.vehiculosAsignados;
        this.vehiculosRespaldo = arr;
      }, 1000);
    }
  }

  // se valida si la flota a editar esta compartida (aceptada o pendiente)
  async flotaCompartida() {
    let clientSession: any = config.getClienteSesion();
    const consultaFlotaCompartida = await this.axiosVehiculo.http.get(
      'flota/' + this.editedItem.id + '/' + clientSession + '/flotaEsCompartido'
    );

    //723 - Compartir Información - Editar Flota
    let numFlotaAceptada = consultaFlotaCompartida.data.length;
    //---

    if (numFlotaAceptada > 0) {
      this.esFlotaCompartida = true;
    } else {
      this.esFlotaCompartida = false;
    }
  }

  get flotasPadre() {
    return this.flotas.filter(x => x.id != this.flota.id);
  }

  get subflotasFiltro() {
    return this.subFlotasRespaldo.filter(x => x.id != this.flota.id);
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

  changeFlotaPadre(flotaPadre: number) {
    if (this.subFlotasAsignados.length > 0) {
      this.$snotify.warning(
        'No es posible asignar una Flota Padre cuando se han asignado Subflotas'
      );
      this.$nextTick(() => {
        this.selectedFlotaPadre = null;
      });
    }
  }

  /*onUserChange(user: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (user !== undefined && user.length !== this.usuariosAsignados.length) {
      for (let x = this.usuariosAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= user.length - 1; i++) {
          if (this.usuariosAsignados[x].id == user[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.usuariosAsignados.splice(x, 1);
        }
      }
    }
    if (this.usuariosAsignados.length === this.usuariosRespaldo.length) {
      this.seleccionoTodosUsuarios = true;
    } else {
      this.seleccionoTodosUsuarios = false;
    }
  }*/

  async changeVehiculobEdicion() {
    let vehSinCompartir: any = [];
    this.vehCompartidos = [];
    this.vehiculosAsignados.forEach(async (veh: any, idx: number) => {
      if (veh.loComparto && this.flota.id != veh.flotaActual.id) {
        this.vehCompartidos.push(veh);
      }
    });

    if (this.vehCompartidos.length > 0) {
      this.dialogVehiculoCompartidoText =
        'Existen Vehículos que se encuentran actualmente en una flota compartida, por lo que si desasocia los vehículos los clientes dejarán de recibir información. ¿Desea continuar?';
      this.dialogVehiculoCompartidoMasivo = true;
    }
  }

  remueveVehiculoCompartidoMasivo() {
    this.dialogVehiculoCompartidoMasivo = false;
    this.gridApiVehiculosEdicion.forEachNode(nodo => {
      let existe = this.vehCompartidos.filter(
        (x: any) => x.id === nodo.data.id
      );

      if (existe.length > 0) {
        this.gridApiVehiculosEdicion.deselectIndex(nodo.rowIndex);
      }
    });

    // this.dialogVehiculoCompartidoText = '';
    let vehiculosCompartidos: any = [];
    this.indexVehiculo = 0;
    let vehiculosAsignadosNoCompartidos: any = [];
    var cont = 0;
    this.vehiculosAsignados.forEach((veh: any, i: number) => {
      cont++;
      var vehiculo = this.vehCompartidos.filter((x: any) => x.id === veh.id);
      if (vehiculo.length === 0) {
        vehiculosAsignadosNoCompartidos.push(veh);
      }
      if (cont === this.vehiculosAsignados.length) {
        this.vehiculosAsignados = vehiculosAsignadosNoCompartidos;
        this.vehiculosAsignadosModel = vehiculosAsignadosNoCompartidos;
      }
    });

    this.vehCompartidos.forEach((vehC: any, i: number) => {
      vehC.selected = false;
    });
  }

  async validaTodoEditar(vehiculo: any) {
    if (vehiculo !== undefined) {
      if (vehiculo.loComparto && this.flota.id != vehiculo.flotaActual.id) {
        this.dialogVehiculoCompartidoText = '';

        if (vehiculo.loCompartoList.length == 1) {
          this.dialogVehiculoCompartidoText =
            'El Vehículo se encuentra actualmente compartido con el Cliente ' +
            vehiculo.loCompartoList[0] +
            ', por lo que si desasocia el Vehículo el Cliente dejará de recibir información ¿Desea continuar?';
        } else {
          this.dialogVehiculoCompartidoText =
            'El Vehículo se encuentra actualmente compartido con los Clientes ';

          vehiculo.loCompartoList.forEach((element: any, index: number) => {
            if (vehiculo.loCompartoList.length - index > 1) {
              this.dialogVehiculoCompartidoText += element + ', ';
            } else {
              this.dialogVehiculoCompartidoText += ' y ' + element;
            }
          });

          this.dialogVehiculoCompartidoText +=
            ', por lo que si desasocia el Vehículo los Clientes dejarán de recibir información ¿Desea continuar?';
        }

        this.dialogVehiculoCompartido = true;
      }
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.btnBloquear = true;
      this.loadingService.showLoading();

      let model = {
        Id: this.flota.id,
        ClienteId: this.selectedCliente,
        ResponsableFlotaId:
          this.selectedResponsableFlota === undefined ||
          this.selectedResponsableFlota.length == 0
            ? 0
            : this.selectedResponsableFlota,
        ResponsableMantenimientoFlotaId:
          this.selectedResponsableMantencion === undefined ||
          this.selectedResponsableMantencion.length == 0
            ? 0
            : this.selectedResponsableMantencion,
        Nombre: this.editedItem.nombre,
        Descripcion: this.editedItem.descripcion,
        Estado: EstadoEntidad.Activo,
        PadreId:
          this.selectedFlotaPadre === null ||
          this.selectedFlotaPadre === undefined ||
          this.selectedFlotaPadre.length == 0
            ? 0
            : this.selectedFlotaPadre,
      };

      try {
        await this.axiosVehiculo.http.put(this.controller, model);
        /*await this.eliminaAsociacionesUsuarios();
        await this.grabarAsociacionesUsuarios();
        await this.eliminaAsociacionesVehiculos();
        await this.grabaAsociacionesVehiculos();        
        await this.eliminaAsociacionesSubFlotas();
        await this.grabaAsociacionesSubFlotas();*/

        await this.eliminaAsociacionesUsuariosV2();
        await this.grabarAsociacionesUsuariosV2();
        await this.eliminaAsociacionesVehiculosV3(); //08-04-2020 Performance
        await this.grabaAsociacionesVehiculosV3(); //08-04-2020 Performance
        await this.eliminaAsociacionesSubFlotasV2();
        await this.grabaAsociacionesSubFlotasV2();

        this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
        this.closeModal(false);
      } catch (e) {
        this.loadingService.hideLoading();
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } finally {
        this.loadingService.hideLoading();
        this.btnBloquear = false;
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

  async enviarCorreoAgregar(vehiculosIds: number[], flotaId: number) {
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: '',
      url: '',
      idEntidad: flotaId,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: flotaId,
      compartirInformacionId: 0,
      vehiculosIds: vehiculosIds,
    };

    const res: any = await this.axiosAuth.http.post(
      `Email/AgregarVehiculos`,
      modelEmail
    );
  }

  async enviarCorreoRemover(vehiculosIds: number[], flotaId: number) {
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: '',
      url: '',
      idEntidad: flotaId,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: flotaId,
      compartirInformacionId: 0,
      vehiculosIds: vehiculosIds,
    };

    const res: any = await this.axiosAuth.http.post(
      `Email/RemoverVehiculos`,
      modelEmail
    );
  }

  async eliminaAsociacionesUsuarios() {
    let usuariosEliminar: any = [];

    if (this.usuariosAsignadosResp.length > 0) {
      for (let user of this.usuariosAsignadosResp) {
        let exists = this.usuariosAsignados.filter(z => z.id == user.id);
        if (exists.length == 0) {
          await this.axiosVehiculo.http.delete(
            `${this.controller}/${this.flota.id}/usuario/${user.id}`
          );
        }
      }
    }
  }

  //performance
  async eliminaAsociacionesUsuariosV2() {
    let usuariosEliminar: any = [];

    if (this.usuariosAsignadosResp.length > 0) {
      for (let user of this.usuariosAsignadosResp) {
        let exists = this.usuariosAsignados.filter(z => z.id == user.id);
        if (exists.length == 0) {
          const data = {
            idUsuario: user.id,
            nombre: user.nombre,
            apellidoPaterno: user.apellidoPaterno,
          };
          usuariosEliminar.push(data);
        }
      }

      if (usuariosEliminar.length > 0) {
        let modelAsociacionesUsuarios = {
          flotaId: this.flota.id,
          usuariosId: usuariosEliminar,
        };

        await this.axiosVehiculo.http.delete(`${this.controller}/usuarios`, {
          data: modelAsociacionesUsuarios,
        });
      }
    }
  }

  async eliminaAsociacionesVehiculos() {
    let vehiculosEliminar: any = [];

    this.vehiculosAsignadosResp.forEach(vehiculo => {
      const exists = this.vehiculosAsignados.filter(z => z.id == vehiculo.id);
      if (exists.length === 0) {
        vehiculosEliminar.push({ id: vehiculo.id });
      }
    });

    if (vehiculosEliminar.length > 0) {
      let vehiculosId: number[] = [];
      for (let vehiculo of vehiculosEliminar) {
        vehiculosId.push(vehiculo.id);
        await this.axiosVehiculo.http.delete(
          `${this.controller}/${this.flota.id}/${this.idCliente}/vehiculo/${vehiculo.id}`
        );
      }

      if (vehiculosId.length > 0) {
        await this.enviarCorreoRemover(vehiculosId, this.editedItem.id);
      }
    }
  }

  //performance
  /*async eliminaAsociacionesVehiculosV2() {
    let vehiculosEliminar: any = [];
    let vehiculosId: number[] = [];
    this.vehiculosAsignadosResp.forEach(vehiculo => {
      const exists = this.vehiculosAsignados.filter(z => z.id == vehiculo.id);
      if (exists.length === 0) {
        vehiculosId.push(vehiculo.id);
        const data = {
          idVehiculo: vehiculo.id,
          unidad: vehiculo.unidad,
          patente: vehiculo.patente,
        };
        vehiculosEliminar.push(data);
      }
    });

    if (vehiculosEliminar.length > 0) {
      let modelAsociacionesVehiculos = {
        flotaId: this.flota.id,
        clienteId: this.idCliente,
        vehiculosId: vehiculosEliminar,
      };

      await this.axiosVehiculo.http.delete(`${this.controller}/vehiculos`, {
        data: modelAsociacionesVehiculos,
      });

      if (vehiculosId.length > 0) {
        await this.enviarCorreoRemover(vehiculosId, this.editedItem.id);
      }
    }
  }*/

  //performance V3 - 08-04-2020
  async eliminaAsociacionesVehiculosV3() {
    const vehiculosEliminar = differenceBy(
      this.vehiculosAsignadosResp,
      this.vehiculosAsignados,
      veh => veh.id
    ).map(veh => ({
      idVehiculo: veh.id,
      unidad: veh.unidad,
      patente: veh.patente,
    }));

    const vehiculosId = differenceBy(
      this.vehiculosAsignadosResp,
      this.vehiculosAsignados,
      veh => veh.id
    ).map(veh => veh.id);

    if (vehiculosEliminar.length > 0) {
      let modelAsociacionesVehiculos = {
        flotaId: this.flota.id,
        clienteId: this.idCliente,
        vehiculosId: vehiculosEliminar,
      };

      await this.axiosVehiculo.http.delete(`${this.controller}/vehiculos`, {
        data: modelAsociacionesVehiculos,
      });

      if (vehiculosId.length > 0) {
        await this.enviarCorreoRemover(vehiculosId, this.editedItem.id);
      }
    }
  }
  //---

  //performance
  async eliminaAsociacionesSubFlotasV2() {
    let subflotasliminar: any = [];

    this.subFlotasAsignadosResp.forEach(subflota => {
      const exists = this.subFlotasAsignados.filter(z => z.id == subflota.id);

      if (exists.length === 0) {
        subflotasliminar.push({
          Id: subflota.id,
          ClienteId: subflota.clienteId,
          ResponsableFlotaId: 0,
          ResponsableMantenimientoFlotaId: 0,
          Nombre: subflota.nombre,
          Descripcion: subflota.descripcion,
          Estado: EstadoEntidad.Activo,
        });
      }
    });

    if (subflotasliminar.length > 0) {
      await this.axiosVehiculo.http.delete(
        `${this.controller}/${this.flota.id}/subflota/`,
        { data: subflotasliminar }
      );
    }
  }

  async eliminaAsociacionesSubFlotas() {
    let subflotasliminar: any = [];

    this.subFlotasAsignadosResp.forEach(subflota => {
      const exists = this.subFlotasAsignados.filter(z => z.id == subflota.id);

      if (exists.length === 0) {
        subflotasliminar.push({
          Id: subflota.id,
          ClienteId: subflota.clienteId,
          ResponsableFlotaId: 0,
          ResponsableMantenimientoFlotaId: 0,
          Nombre: subflota.nombre,
          Descripcion: subflota.descripcion,
          Estado: EstadoEntidad.Activo,
        });
      }
    });

    if (subflotasliminar.length > 0) {
      await this.axiosVehiculo.http.delete(
        `${this.controller}/${this.flota.id}/subflota/`,
        { data: subflotasliminar }
      );
    }
  }

  async grabarAsociacionesUsuarios() {
    if (this.usuariosAsignados.length > 0) {
      for (let usuario of this.usuariosAsignados) {
        const existe = this.usuariosAsignadosResp.filter(
          x => x.id == usuario.id
        );

        if (existe.length === 0) {
          await this.axiosVehiculo.http.post(
            `${this.controller}/${this.flota.id}/usuario/${usuario.id}`,
            {}
          );
        }
      }
    }
  }

  //performance
  async grabarAsociacionesUsuariosV2() {
    if (this.usuariosAsignados.length > 0) {
      let idsUsuarios: any[] = [];
      for (let usuario of this.usuariosAsignados) {
        const existe = this.usuariosAsignadosResp.filter(
          x => x.id == usuario.id
        );

        if (existe.length === 0) {
          const data = {
            idUsuario: usuario.id,
            nombre: usuario.nombre,
            apellidoPaterno: usuario.apellidoPaterno,
          };
          idsUsuarios.push(data);
        }
      }

      if (idsUsuarios.length > 0) {
        let modelAsociacionesUsuarios = {
          flotaId: this.flota.id,
          usuariosId: idsUsuarios,
        };
        await this.axiosVehiculo.http.post(
          `${this.controller}/usuarios`,
          modelAsociacionesUsuarios
        );
      }
    }
  }

  //09-2019: Desarrollo Compartir Información
  /*async grabaAsociacionesVehiculos() {
    if (this.vehiculosAsignados.length > 0) {
      let vehiculosId: number[] = [];
      
      for (let vehiculo of this.vehiculosAsignados) {
        let existe = this.vehiculosAsignadosResp.filter(
          x => x.id == vehiculo.id
        );
        if (existe.length == 0) {
          vehiculosId.push(vehiculo.id);
          await this.axiosVehiculo.http.post(
            `${this.controller}/${this.flota.id}/vehiculo/${vehiculo.id}`,
            {}
          );
        }
      }
      if (vehiculosId.length > 0) {
        await this.enviarCorreoAgregar(vehiculosId, this.editedItem.id);
      }
    }
  }*/

  async grabaAsociacionesVehiculos() {
    if (this.vehiculosAsignados.length > 0) {
      let vehiculosId: number[] = [];
      let vehiculosFlotaNotificacion: any = [];

      for (let vehiculo of this.vehiculosAsignados) {
        let existe = this.vehiculosAsignadosResp.filter(
          x => x.id == vehiculo.id
        );
        if (existe.length == 0) {
          vehiculosId.push(vehiculo.id);
          vehiculosFlotaNotificacion.push({
            flotaId: vehiculo.flotaActual.id,
            vehiculoId: vehiculo.id,
          });
        }
      }

      if (vehiculosId.length > 0) {
        //1. Se debe recorrer antes de asociar para identificar los vehiculos compartidos
        const flotasActualesCompartidas = vehiculosFlotaNotificacion.map(
          (x: any) => x.flotaId
        );
        flotasActualesCompartidas.forEach(async (f: any) => {
          this.axiosVehiculo.http
            .get(
              'flota/' +
                f +
                '/' +
                config.getClienteSesion() +
                '/flotaEsCompartido'
            )
            .then(async res => {
              if (res.data.length > 0) {
                let vehiculosCompartidas = vehiculosFlotaNotificacion.filter(
                  (x: any) => x.flotaId == f
                );
                if (vehiculosCompartidas.length > 0) {
                  const vehiculosModel = vehiculosCompartidas.map(
                    (x: any) => x.vehiculoId
                  );
                  await this.enviarCorreoRemover(vehiculosModel, f);
                }
              }
            });
        });
        //---

        //2. Recorro los veiculos y los asocio a la nueva flota
        vehiculosId.forEach(async (vehiculo: any) => {
          await this.axiosVehiculo.http.post(
            `${this.controller}/${this.flota.id}/vehiculo/${vehiculo}`,
            {}
          );
        });
        //---

        //3. Notificacion por correo
        await this.enviarCorreoAgregar(vehiculosId, this.editedItem.id);
        //---
      }
    }
  }
  //---

  //performance
  /*async grabaAsociacionesVehiculosV2() {
    if (this.vehiculosAsignados.length > 0) {
      let vehiculosId: number[] = [];
      let vehiculosFlotaNotificacion: any = [];
      let idsVehiculos: any[] = [];

      for (let vehiculo of this.vehiculosAsignados) {
        let existe = this.vehiculosAsignadosResp.filter(
          x => x.id == vehiculo.id
        );
        if (existe.length == 0) {
          idsVehiculos.push({
            idVehiculo: vehiculo.id,
            unidad: vehiculo.unidad,
            patente: vehiculo.patente,
          });
          vehiculosId.push(vehiculo.id);
          vehiculosFlotaNotificacion.push({
            flotaId: vehiculo.flotaActual.id,
            vehiculoId: vehiculo.id,
          });
        }
      }

      if (vehiculosId.length > 0) {
        //1. Se debe recorrer antes de asociar para identificar los vehiculos compartidos
        const flotasActualesCompartidas = vehiculosFlotaNotificacion.map(
          (x: any) => x.flotaId
        );
        flotasActualesCompartidas.forEach(async (f: any) => {
          this.axiosVehiculo.http
            .get(
              'flota/' +
                f +
                '/' +
                config.getClienteSesion() +
                '/flotaEsCompartido'
            )
            .then(async res => {
              if (res.data.length > 0) {
                let vehiculosCompartidas = vehiculosFlotaNotificacion.filter(
                  (x: any) => x.flotaId == f
                );
                if (vehiculosCompartidas.length > 0) {
                  const vehiculosModel = vehiculosCompartidas.map(
                    (x: any) => x.vehiculoId
                  );
                  await this.enviarCorreoRemover(vehiculosModel, f);
                }
              }
            });
        });
        //---

        //2. Recorro los vehiculos y los asocio a la nueva flota
        if (idsVehiculos.length > 0) {
          //TEST EMR
          let vehiculosFlotaModelListPost: any = [];

          for (let vehiculo of idsVehiculos) {
            let flotaModel = {
              flotaId: this.flota.id,
              vehiculoId: vehiculo.idVehiculo,
              clienteId: config.getClienteSesion(),
            };
            vehiculosFlotaModelListPost.push(flotaModel);
          }

          if (vehiculosFlotaModelListPost.length > 0) {
            await this.axiosVehiculo.http.post(
              `${this.controllerVehiculoFlota}/asocia/`,
              vehiculosFlotaModelListPost
            );
          }
        }
        //---

        //3. Notificacion por correo
        if (vehiculosId.length > 0) {
          await this.enviarCorreoAgregar(vehiculosId, this.editedItem.id);
        }
        //---
      }
    }
  }
  //---*/

  //Performance V3 08-04-2020
  async grabaAsociacionesVehiculosV3() {
    if (this.vehiculosAsignados.length > 0) {
      //1. Obtener Vehículos Nuevos a Asignar
      const vehiculosFlotaActual = differenceBy(
        this.vehiculosAsignados,
        this.vehiculosAsignadosResp,
        veh => veh.id
      ).map(veh => ({
        flotaId: veh.flotaActual.id,
        vehiculoId: veh.id,
        compartida: veh.loComparto,
        unidad: veh.unidad,
      }));

      if (vehiculosFlotaActual.length > 0) {
        if (this.duplicateVehicle) {
          //2. Notifico por correo si estoy robando Vehículos de una Flota Compartida
          const lstFlotasCompartidas = vehiculosFlotaActual.filter(
            (x: any) => x.loComparto === true
          );
          const flotasCompartidas = uniqBy(lstFlotasCompartidas, 'flotaId');
          flotasCompartidas.forEach(async (fc: any) => {
            let vehiculosModel = vehiculosFlotaActual
              .filter((x: any) => x.flotaId == fc)
              .map(v => v.vehiculoId);
            await this.enviarCorreoRemover(vehiculosModel, fc);
          });
          //---
        }

        //3. Asocio Vehículos a la Nueva Flota
        const flotasActuales = uniqBy(vehiculosFlotaActual, 'flotaId');
        let vehiculosFlotaModel: any = [];

        flotasActuales.forEach((fa: any) => {
          let vehiculos = vehiculosFlotaActual
            .filter((x: any) => x.flotaId == fa.flotaId)
            .map((veh: any) => ({
              idVehiculo: veh.vehiculoId,
              unidad: veh.unidad,
            }));
          let vfModel = {
            flotaDestinoId: this.flota.id,
            flotaOrigenId: fa.flotaId,
            esOrigenCompartido: fa.compartida,
            vehiculosId: vehiculos,
            clienteId: config.getClienteSesion(),
          };
          vehiculosFlotaModel.push(vfModel);
        });

        if (vehiculosFlotaModel.length > 0) {
          if (this.duplicateVehicle) {
            await this.axiosVehiculo.http.post(
              `${this.controllerVehiculoFlota}/asociav2/`,
              vehiculosFlotaModel
            );
          } else {
            await this.axiosMetabase.http
              .post('Metabase/PostgenericA/track/assignFleetv2', {
                vehicles: vehiculosFlotaModel,
                id_user: this.getUserID().toString(),
              })
              .then((response: any) => {
                if (response.data.CODIGO_RESPUESTA == '1') {
                  this.$snotify.success(response.data.message);
                } else {
                  this.$snotify.error(response.data.MENSAJE_RESPUESTA);
                }
              })
              .catch((error: any) => {
                console.log(error);
                this.$snotify.error(
                  'Ocurrió un error al asociar los vehículos a la flota.'
                );
              })
              .finally(() => {
                this.duplicateVehicle = true;
              });
          }
        }
        //---

        //4. Si la Flota Editada es Compartida, se debe notificar por correo
        let vehiculosId = vehiculosFlotaActual.map(x => x.vehiculoId);
        await this.enviarCorreoAgregar(vehiculosId, this.editedItem.id);
        //---
      }
    }
  }
  //---

  async grabaAsociacionesSubFlotas() {
    if (this.subFlotasAsignados.length > 0) {
      let model: any = [];

      this.subFlotasAsignados.forEach(subflota => {
        const existe = this.subFlotasAsignadosResp.filter(
          x => x.id == subflota.id
        );

        if (existe.length === 0) {
          model.push({
            Id: subflota.id,
            ClienteId: subflota.clienteId,
            ResponsableFlotaId: 0,
            ResponsableMantenimientoFlotaId: 0,
            Nombre: subflota.nombre,
            Descripcion: subflota.descripcion,
            Estado: EstadoEntidad.Activo,
          });
        }
      });

      if (model.length > 0) {
        await this.axiosVehiculo.http.put(
          `${this.controller}/${this.flota.id}/subflota/`,
          model
        );
      }
    }
  }

  //performance
  async grabaAsociacionesSubFlotasV2() {
    if (this.subFlotasAsignados.length > 0) {
      let model: any = [];

      this.subFlotasAsignados.forEach(subflota => {
        const existe = this.subFlotasAsignadosResp.filter(
          x => x.id == subflota.id
        );

        if (existe.length === 0) {
          model.push({
            Id: subflota.id,
            ClienteId: subflota.clienteId,
            ResponsableFlotaId: 0,
            ResponsableMantenimientoFlotaId: 0,
            Nombre: subflota.nombre,
            Descripcion: subflota.descripcion,
            Estado: EstadoEntidad.Activo,
          });
        }
      });

      if (model.length > 0) {
        await this.axiosVehiculo.http.put(
          `${this.controller}/${this.flota.id}/subflota/`,
          model
        );
      }
    }
  }

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
    this.buscarUsuario = '';
    this.buscarVehiculo = '';
    this.buscarSubFlota = '';
    this.gridApiVehiculosEdicion.setQuickFilter('');
    this.gridApiSubFlotas.setQuickFilter('');
    this.gridApi.setQuickFilter('');
    this.usuariosRespaldo = [];
    this.$emit('modalAsociacionEmit', false);
    this.usuariosAsignados = [];
    this.vehiculosRespaldo = [];
    this.vehiculosAsignados = [];
    this.subFlotasRespaldo = [];
    this.subFlotasAsignados = [];
    this.contadorEventoGrilla = 0;
    this.contadorEventoGrillaSelection = 0;
    this.contadorEventoGrillaUsuario = 0;
    this.contadorEventoGrillaSelectionUsuario = 0;
    this.contadorEventoGrillaSub = 0;
    this.contadorEventoGrillaSelectionSub = 0;
    this.dialog = false;
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReadyVehiculoEdicion(params: GridReadyEvent) {
    this.gridApiVehiculosEdicion = params.api;
    this.columnApiVehiculos = params.columnApi;
  }

  onGridReadySubFlota(params: GridReadyEvent) {
    this.gridApiSubFlotas = params.api;
    this.columnApiSubFlotas = params.columnApi;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  getUsuarios() {
    let clientSession: any = config.getClienteSesion();
    this.axiosGestionUsuarios.http
      .get(`${this.controllerUsuario}/${clientSession}/usuariosAsignar`)
      .then(res => {
        //Solo Usuarios Activos
        res.data = res.data.filter(
          (x: any) => x.estado == EstadoEntidad.Activo
        );
        this.usuariosRespaldo = res.data;
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener lista de Usuarios'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Usuarios');
        }
      });
  }

  async getVehiculos() {
    const res: any = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculo}/${this.idCliente}/vehiculosClienteV2`
    );
    const resA: any = await this.axiosVehiculo.http.get(
      `${this.controller}/${this.flota.id}/vehiculo/`
    );
    const self = this;

    //Se filtran los vehículos Activos para las asociaciones
    let resActivos: any[] = [];
    resActivos = res.data; //Ya vienen los activos

    let resAactivos: any[] = [];
    if (resA.data.length > 0)
      resAactivos = resA.data.filter(
        (x: any) => x.estado === EstadoEntidad.Activo
      );
    //---

    resActivos.forEach((vehiculo: IVehiculo) => {
      const v: IVehiculo = resAactivos.find(
        (x: IVehiculo) => x.id === vehiculo.id
      );
      if (v !== undefined) {
        vehiculo.selected = true;
      }
    });

    resAactivos.forEach((vehiculo: any) => {
      vehiculo.selected = true;
    });

    // valida si la flota es compartida
    if (this.esFlotaCompartida) {
      this.vehiculosRespaldo = resActivos.filter(
        (v: any) => v.esCompartido === false
      );
    } else {
      this.vehiculosRespaldo = resActivos;
    }

    this.vehiculosAsignados = resAactivos;
    this.vehiculosAsignadosAux = resActivos;
    this.vehiculosAsignadosResp = Object.assign([], this.vehiculosAsignados);

    if (this.vehiculosRespaldo.length > 0) {
      this.muestraVehiculos = true;
    } else {
      this.muestraVehiculos = false;
    }

    if (
      this.vehiculosAsignados.length === this.vehiculosRespaldo.length &&
      this.vehiculosAsignados.length > 0
    ) {
      this.seleccionoTodosVehiculo = true;
    }

    this.vehiculosAsignados.forEach((vehiculo: any) => {
      this.vehiculosAsignadosModel.push(vehiculo.id);
    });
    this.vehiculosRespaldo.forEach((vehiculo: any) => {
      const veh = this.vehiculosAsignados.find(
        (x: IVehiculo) => x.id === vehiculo.id
      );
      if (veh === undefined) {
        this.vehiculosNoAsignados.push(vehiculo);
      }
    });

    await this.getClientes();
  }

  async getFlotas() {
    await this.axiosVehiculo.http
      //.get(this.controller)
      .get(`${this.controller}/FlotasPorCliente/`)
      .then(async res => {
        //let clienteSesion = config.getClienteSesion();
        res.data = res.data.map((flota: FlotaInterface) => ({
          ...flota,
          estadoTxt: EstadoEntidad[flota.estado],
        }));
        this.flotas = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo //&& x.clienteId === clienteSesion
        );
        this.subFlotasRespaldo = res.data.filter(
          (x: any) => x.estado === EstadoEntidad.Activo //&& x.clienteId === clienteSesion
        );

        this.subFlotasRespaldo.forEach((flota: FlotaInterface) => {
          if (flota.descripcion === null) {
            flota.descripcion = '';
          }
        });
        //await this.getDataInicial();

        if (this.subFlotasRespaldo.length > 0) {
          this.muestraSub = true;
        } else {
          this.muestraSub = false;
        }
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener lista de Flotas');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Flotas');
        }
      });
  }

  async getClientes() {
    const clienteId = config.getClienteSesion();
    await this.axiosClientes.http
      //.get(this.controllerCliente)
      .get(`${this.controllerCliente}/${clienteId}/ClientePorId`)
      .then(async res => {
        this.clientes = res.data;
        //await this.getFlotas();
      })
      .catch(error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener lista de Clientes'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener lista de Clientes');
        }
      });
  }

  async getDataInicial() {
    //recupera usuarios asignados a la flota
    if (this.flota.id > 0) {
      //Usuarios
      this.axiosVehiculo.http
        .get(`${this.controller}/${this.flota.id}/usuario/`)
        .then(res => {
          let dataUsuario: any = [];
          res.data.forEach((user: any) => {
            let item = this.usuariosRespaldo.filter(
              x => x.id == user.usuarioId
            );
            if (item.length > 0) {
              dataUsuario.push(item[0]);
            }
          });

          this.usuariosAsignados = dataUsuario;
          this.usuariosAsignadosResp = Object.assign(
            [],
            this.usuariosAsignados
          );
          /*this.usuariosAsignadosModel = [];
          this.usuariosAsignados.forEach((usuarios: any) => {
            this.usuariosAsignadosModel.push(usuarios.id);
          });*/

          /*if (
            this.usuariosAsignados.length === this.usuariosRespaldo.length &&
            this.usuariosAsignados.length > 0
          ) {
            this.seleccionoTodosUsuarios = true;
          }*/

          this.usuariosRespaldo.forEach(us => {
            let exists: any = this.usuariosAsignados.filter(
              (x: any) => x.id === us.id
            );
            if (exists.length == 0) {
              us.checked = false;
            } else {
              us.checked = true;
            }
          });

          this.seteaAsignadosVerDetalleUsuario();
          const self = this;
          this.gridApi.forEachNode(function(node: any) {
            var index = self.usuariosAsignados.findIndex(
              x => x.id == node.data.id
            );
            if (index !== -1) {
              node.setSelected(true);
              self.contadorEventoGrillaUsuario++;
            }
          });
          //---

          //recupera sub flotas asignadas a la flota
          this.axiosVehiculo.http
            .get(`${this.controller}/${this.flota.id}/subflota`)
            .then(async res => {
              res.data = res.data.map((subFlota: FlotaInterface) => ({
                ...subFlota,
                estadoTxt: EstadoEntidad[subFlota.estado],
              }));
              this.subFlotasAsignados = res.data;
              this.subFlotasAsignadosResp = Object.assign(
                [],
                this.subFlotasAsignados
              );

              this.subFlotasAsignados.forEach((subflota: any) => {
                this.subFlotassAsignadosModel.push(subflota.id);
              });

              //this.loadingService.hideLoading();

              this.subFlotasRespaldo.forEach(sf => {
                let exists: any = this.subFlotasAsignados.filter(
                  (x: any) => x.id === sf.id
                );
                if (exists.length == 0) {
                  sf.checked = false;
                } else {
                  sf.checked = true;
                }
              });
              await this.seteaAsignadosVerDetalleSubFlota();
              const self = this;
              this.gridApiSubFlotas.forEachNode(function(node: any) {
                var index = self.subFlotasAsignados.findIndex(
                  x => x.id == node.data.id
                );
                if (index !== -1) {
                  node.setSelected(true);
                  self.contadorEventoGrillaSub++;
                }
              });
              //---

              this.loadingService.hideLoading();
            })
            .catch(err => {
              this.loadingService.hideLoading();
            });
        })
        .catch(err => {
          this.loadingService.hideLoading();
        });
    } else {
      this.loadingService.hideLoading();
    }
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  fechaFilterTxt(r: any) {
    return this.$options.filters.formatDate(r);
  }

  /*createButtonCell(params: any) {
    const item = this.usuariosRespaldo.find(x => x.id == params.data.id);

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

    eButton.addEventListener('click', () => {
      this.removerUsuarioAsignacion(item);
    });

    return eButton;
  }*/

  createButtonCellVehiculo(params: any) {
    const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

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

    eButton.addEventListener('click', () => {
      this.removerVehiculoAsignacion(item);
    });

    return eButton;
  }

  /*createButtonCellVehiculoAlerta(params: any) {
    if (this.vehiculosRespaldo.length > 0) {
      let evento = this.removerVehiculoAsignacion;
      const item: any = this.vehiculosRespaldo.find(
        x => x.id == params.data.id
      );

      if (item !== undefined && item !== null) {
        if (item.vehiculosFlotas !== undefined) {
          const vehiculosasociados = item.vehiculosFlotas.filter(
            (y: any) =>
              y.vehiculoId == params.data.id &&
              y.flotaId != this.flota.id &&
              y.fechaFinAsociacion == null
          );

          if (vehiculosasociados.length > 0) {
            if (this.esEdicion) {
              if (
                item.flotaActual.clienteId !== undefined &&
                item.flotaActual.clienteId === this.idCliente &&
                item.flotaActual.id !== this.flota.id
              ) {
                var eButton = document.createElement('i');
                eButton.setAttribute(
                  'title',
                  'Asignado a Flota: ' + item.flotaActual.nombre
                );
                eButton.innerHTML =
                  '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
                return eButton;
              }
            }
          }
        }
      }
    }
  }*/

  createButtonCellVehiculoAlerta(params: any) {
    if (this.esEdicion) {
      if (this.vehiculosRespaldo.length > 0) {
        let evento = this.removerVehiculoAsignacion;
        const item: any = this.vehiculosRespaldo.find(
          x => x.id == params.data.id
        );

        if (item !== undefined && item !== null) {
          if (item.vehiculosFlotas !== undefined) {
            const vehiculosasociados = item.vehiculosFlotas.filter(
              (y: any) =>
                y.vehiculoId == params.data.id &&
                y.flotaId != this.flota.id &&
                y.fechaFinAsociacion == null
            );

            if (vehiculosasociados.length > 0) {
              if (
                item.flotaActual.clienteId !== undefined &&
                item.flotaActual.clienteId === this.idCliente &&
                item.flotaActual.id !== this.flota.id
              ) {
                var eButton = document.createElement('i');
                eButton.setAttribute(
                  'title',
                  'Asignado a Flota: ' + item.flotaActual.nombre
                );
                eButton.innerHTML =
                  '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
                return eButton;
              }
            }
          }
        }
      }
    }
  }

  createButtonCellVehiculoCompartido(params: any) {
    if (this.vehiculosRespaldo.length > 0) {
      if (params.data.esCompartido === true) {
        const compartidoPor: any = this.vehiculosRespaldo.find(
          (x: any) => x.id === params.data.id
        );
        var eButton = document.createElement('i');
        eButton.setAttribute(
          'title',
          'Vehículo compartido por: ' + compartidoPor.compartidoPor
        );
        eButton.innerHTML =
          '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon" >directions_car</i>';
        return eButton;
      }
    }
  }

  createButtonCellSubFlota(params: any) {
    let evento = this.removerSubFlotaAsignacion;
    const item = this.subFlotasRespaldo.find(x => x.id == params.data.id);

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

  createButtonCellSubFlotaAlerta(params: any) {
    if (this.esEdicion) {
      if (this.subFlotasRespaldo.length > 0) {
        const item: any = this.subFlotasRespaldo.find(
          x => x.id == params.data.id
        );
        if (item !== undefined && item !== null) {
          if (item.padreId != 0 && item.padreId != this.flota.id) {
            var eButton = document.createElement('i');
            eButton.setAttribute('title', 'Asignada a otra Flota');
            eButton.innerHTML =
              '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
            return eButton;
          }
        }
      }
    }
  }

  /*removerUsuarioAsignacion(item: UsuariosInterface) {
    for (let i = 0; i <= this.usuariosAsignados.length - 1; i++) {
      if (this.usuariosAsignados[i].id == item.id) {
        this.usuariosAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.usuariosAsignadosModel.length - 1; i++) {
      if (this.usuariosAsignadosModel[i] == item.id) {
        this.usuariosAsignadosModel.splice(i, 1);
        break;
      }
    }

    if (this.usuariosAsignadosModel.length == this.usuariosRespaldo.length) {
      this.seleccionoTodosUsuarios = true;
    } else {
      this.seleccionoTodosUsuarios = false;
    }
  }*/

  async removerVehiculoAsignacion(item: IVehiculo) {
    let estaCompartido: boolean = false;
    const response: any = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculo}/${item.id}/${this.idCliente}/vehiculoEsCompartido`
    );
    if (response.data.length > 0) {
      let arrVehInFlotas: any = response.data.filter(
        (y: any) => y.id === item.id
      );
      if (arrVehInFlotas.length === 1) {
        let veh: any = arrVehInFlotas.find(
          (x: any) =>
            x.id === item.id &&
            x.esCompartido === true &&
            x.flotaActual.id === this.editedItem.id
        );
        if (veh !== undefined) {
          this.vehiculoIdCompartidoDes = veh.id;
          this.dialogVehiculoCompartidoText =
            'El Vehículo se encuentra actualmente compartido con el Cliente ' +
            veh.compartidoPor +
            ', por lo que si desasocia el Vehículo el Cliente dejará de recibir información.';
          if (veh.flotaActual.id === this.editedItem.id) {
            this.dialogVehiculoCompartido = true;
            estaCompartido = true;
          } else {
            this.dialogVehiculoCompartido = false;
            estaCompartido = false;
          }
        }
      } else {
        this.dialogVehiculoCompartidoText =
          'El Vehículo se encuentra actualmente compartido con los Clientes ';

        arrVehInFlotas.forEach((element: any, index: number) => {
          if (index + 1 === arrVehInFlotas.length) {
            this.dialogVehiculoCompartidoText += element.compartidoPor;
            this.vehiculoIdCompartidoDes = element.id;
            if (element.flotaActual.id === this.editedItem.id) {
              estaCompartido = true;
              this.dialogVehiculoCompartido = true;
            } else {
              estaCompartido = false;
              this.dialogVehiculoCompartido = false;
            }
          } else if (index + 1 === arrVehInFlotas.length - 1) {
            this.dialogVehiculoCompartidoText += element.compartidoPor + ' y ';
          } else {
            this.dialogVehiculoCompartidoText += element.compartidoPor + ', ';
          }
        });
        this.dialogVehiculoCompartidoText +=
          ', por lo que si desasocia el Vehículo los Clientes dejarán de recibir información ¿Desea continuar?';
      }
    }

    if (!estaCompartido) {
      for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
        if (this.vehiculosAsignados[i].id == item.id) {
          this.vehiculosAsignados[i].selected = false;
          this.vehiculosAsignados.splice(i, 1);
          break;
        }
      }

      for (let i = 0; i <= this.vehiculosAsignadosModel.length - 1; i++) {
        if (this.vehiculosAsignadosModel[i] == item.id) {
          this.vehiculosAsignadosModel.splice(i, 1);
          break;
        }
      }

      for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
        if (this.vehiculosRespaldo[i].id === item.id) {
          this.vehiculosRespaldo[i].selected = false;
          break;
        }
      }

      const v: any = item;
      const va = v.vehiculosFlotas.filter((y: any) => y.vehiculoId == item.id);
      if (va.length > 0 && this.cantidadVehiculosYaAsociados > 0) {
        this.cantidadVehiculosYaAsociados -= 1;
      }
    }
  }

  removerSubFlotaAsignacion(item: FlotaInterface) {
    for (let i = 0; i <= this.subFlotasAsignados.length - 1; i++) {
      if (this.subFlotasAsignados[i].id == item.id) {
        this.subFlotasAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.subFlotassAsignadosModel.length - 1; i++) {
      if (this.subFlotassAsignadosModel[i] == item.id) {
        this.subFlotassAsignadosModel.splice(i, 1);
        break;
      }
    }
    if (this.subFlotasAsignados.length === this.subFlotasRespaldo.length)
      this.seleccionoTodosSub = true;
    else this.seleccionoTodosSub = false;
  }

  remueveVehiculoCompartido() {
    this.dialogVehiculoCompartido = false;
    // this.dialogVehiculoCompartidoText = '';
    this.gridApiVehiculosEdicion.deselectIndex(this.indexVehiculo);
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
          if (r.data.checked !== undefined) {
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
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        resizable: true,
        lockPinned: true,
        sortable: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Correo Electrónico',
        field: 'email',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
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
        headerName: 'Dirección',
        field: 'direccion',
        resizable: true,
        lockPinned: true,
        sortable: true,
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
      {
        headerName: 'Teléfono',
        field: 'telefonoParticular',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Fecha Nac.',
        field: 'fechaNacimiento',
        valueFormatter: this.fechaFilter,
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => null,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        field: 'fechaNacimientoTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
    ];

    this.columnDefsVehiculos = [
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
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        minWidth: 80,
        resizable: true,
        lockPinned: true,
        sortable: true,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 90,
        minWidth: 90,
        cellRenderer: this.createButtonCellVehiculoAlerta,
        enablePivot: false,
        lockPinned: true,
        filter: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
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
        headerName: '',
        field: 'esCompartido',
        cellRenderer: this.createButtonCellVehiculoCompartido,
        enablePivot: false,
        suppressMenu: false,
        minWidth: 80,
        width: 70,
        lockPinned: true,
        filter: false,
        lockVisible: true,
        sortable: true,
        resizable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'tipoVehiculo',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
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
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.columnDefsSubFlotas = [
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
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        lockPinned: true,
        sortable: true,
        hide: true,
        width: 200,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        field: 'subflota',
        width: 90,
        minWidth: 90,
        lockPinned: true,
        cellRenderer: this.createButtonCellSubFlotaAlerta,
        enablePivot: false,
        resizable: false,
        sortable: false,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Descripción',
        field: 'descripcion',
        lockPinned: true,
        resizable: true,
        sortable: true,
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
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    if (!this.esEdicion) {
      this.columnDefs.shift();
      this.columnDefsVehiculos.shift();
      this.columnDefsVehiculos.splice(1, 1);
      this.columnDefsSubFlotas.shift();

      //Elimino columna de "Warning SubFlota"
      for (let i = 0; i <= this.columnDefsSubFlotas.length - 1; i++) {
        if (this.columnDefsSubFlotas[i].field === 'subflota') {
          this.columnDefsSubFlotas.splice(i, 1);
          break;
        }
      }
      //---
    }

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
    if (this.vehiculosAsignados.length === this.vehiculosRespaldo.length) {
      this.seleccionoTodosVehiculo = true;
    } else {
      this.seleccionoTodosVehiculo = false;
    }
  }
  onSelectedChangeSubFlota() {
    if (this.contadorEventoGrillaSub != 0) {
      this.contadorEventoGrillaSelectionSub++;
    }
    if (
      this.contadorEventoGrillaSelectionSub === this.contadorEventoGrillaSub
    ) {
      this.contadorEventoGrillaSelectionSub = 0;
      this.contadorEventoGrillaSub = 0;
      this.contadorEventoGrillaSub++;
      this.subFlotasAsignados = this.gridApiSubFlotas.getSelectedRows();

      const SubSeleccionados = this.gridApiSubFlotas
        .getSelectedNodes()
        .map(node => ({ ...node.data, checked: true }));

      const SubFlotasNoSeleccionados = differenceBy(
        this.subFlotasRespaldo,
        SubSeleccionados,
        sub => sub.id
      ).map(sub => ({
        ...sub,
        checked: false,
      }));

      this.gridApiSubFlotas.updateRowData({
        update: [...SubFlotasNoSeleccionados, ...SubSeleccionados],
      });
    }
  }
  onFilterTextBoxChangedAsociarSubFlota() {
    this.gridApiSubFlotas.onFilterChanged();
    // if (this.buscarSubFlota.length > 1) {
    //   this.gridApiSubFlotas.setQuickFilter(this.buscarSubFlota);
    // } else {
    //   this.gridApiSubFlotas.setQuickFilter('');
    // }
  }
  onSelectedChangeUsuariosEdicion() {
    if (this.contadorEventoGrillaUsuario != 0) {
      this.contadorEventoGrillaSelectionUsuario++;
    }
    if (
      this.contadorEventoGrillaSelectionUsuario ===
      this.contadorEventoGrillaUsuario
    ) {
      this.contadorEventoGrillaSelectionUsuario = 0;
      this.contadorEventoGrillaUsuario = 0;
      this.contadorEventoGrillaUsuario++;
      this.usuariosAsignados = this.gridApi.getSelectedRows();

      const UsuariosSeleccionados = this.gridApi
        .getSelectedNodes()
        .map(node => ({ ...node.data, checked: true }));

      const UsuariosNoSeleccionados = differenceBy(
        this.usuariosRespaldo,
        UsuariosSeleccionados,
        veh => veh.id
      ).map(veh => ({
        ...veh,
        checked: false,
      }));

      this.gridApi.updateRowData({
        update: [...UsuariosNoSeleccionados, ...UsuariosSeleccionados],
      });
    }
  }
  onFilterTextBoxChangedAsociarUsuarios() {
    this.gridApi.onFilterChanged();
    // if (this.buscarUsuario.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarUsuario);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }
  async onSelectedChangeVehiculosEdicion(e: any) {
    this.eData = e;
  }
  async onSelectedChangeVehiculosMasivoEdicion() {
    this.contadorEventoGrillaSelection++;
    if (
      this.vehiculosAsignados.length === 0 ||
      this.vehiculosAsignados.length === 1
    ) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }
    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
      await this.actualizarbulk();
      this.vehiculosAsignados = this.gridApiVehiculosEdicion.getSelectedRows();
      this.aux =
        this.vehiculosAsignados.length -
        this.vehiculosAsignadosRespaldoGrilla.length;
      if (this.aux > 1) {
        await this.changeVehiculobEdicion();
      } else {
        await this.callEditar();
      }
    }

    this.vehiculosAsignadosRespaldoGrilla = this.vehiculosAsignados;
  }

  actualizarbulk() {
    const vehiculosSeleccionados = this.gridApiVehiculosEdicion
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const vehiculosNoSeleccionados = differenceBy(
      this.vehiculosRespaldo,
      vehiculosSeleccionados,
      veh => veh.id
    ).map(veh => ({
      ...veh,
      checked: false,
    }));

    this.gridApiVehiculosEdicion.updateRowData({
      update: [...vehiculosNoSeleccionados, ...vehiculosSeleccionados],
    });
    this.gridApiVehiculosEdicion.forEachNode(n => {
      if (n.data.id === this.eData.data.id) {
        this.indexVehiculo = n.rowIndex;
      }
    });
  }

  async callEditar() {
    this.aux =
      this.vehiculosAsignados.length -
      this.vehiculosAsignadosRespaldoGrillaCall.length;
    if (this.aux == 1 || this.aux == 0) {
      this.vehiculosAsignados.forEach(async (veh: any) => {
        let existe = this.vehiculosAsignadosRespaldoGrillaCall.filter(
          x => x.id === veh.id
        );
        if (existe.length === 0) {
          await this.validaTodoEditar(veh);
        }
      });
      // } else if (
      //   this.aux > 1) {

      //   await this.changeVehiculob();
      // }
    }
    this.vehiculosAsignadosRespaldoGrillaCall = this.vehiculosAsignados;
  }
  onFilterTextBoxChangedAsociarVehiculo() {
    this.gridApiVehiculosEdicion.onFilterChanged();
    // if (this.buscarVehiculo.length > 1) {
    //   this.gridApiVehiculosEdicion.setQuickFilter(this.buscarVehiculo);
    // } else {
    //   this.gridApiVehiculosEdicion.setQuickFilter('');
    // }
  }
  getRowNodeIdVehiculosEdicion(veh: IVehiculo) {
    if (!veh) {
      return;
    }
    return veh.id;
  }
  getRowNodeIdUsuario(us: UsuariosInterface) {
    if (!us) {
      return;
    }
    return us.id;
  }
  getRowNodeIdSubFlotas(sf: FlotaInterface) {
    if (!sf) {
      return;
    }
    return sf.id;
  }
  inicializaIndices() {
    this.dialogVehiculoCompartido = false;
    this.indexVehiculo = 0;
  }
  inicializaIndicesMasivo() {
    this.dialogVehiculoCompartidoMasivo = false;
    this.indexVehiculo = 0;
  }

  procesarFecha(params: any) {
    if (params.column.getColDef().field === 'fechaNacimiento') {
      return this.$options.filters.formatDate(params.value);
    } else {
      return params.value;
    }
  }

  isExternalFilterPresentUsuario(): boolean {
    return true;
  }

  doesExternalFilterPassUsuario(node: RowNode): boolean {
    if (this.usuariosRespaldo.length > 0 && this.buscarUsuario.length > 1) {
      let busqueda = this.buscarUsuario.toLowerCase();
      return (
        node.data.rut.toLowerCase().includes(busqueda) ||
        node.data.nombreCompleto.toLowerCase().includes(busqueda) ||
        node.data.email.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda) ||
        node.data.telefonoParticular.includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaNacimientoTxt.includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehiculo.length > 1) {
      let busqueda = this.buscarVehiculo.toLowerCase();
      return (
        node.data.patente.toLowerCase().includes(busqueda) ||
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.tipoVehiculo.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  isExternalFilterPresentSubFlota(): boolean {
    return true;
  }

  doesExternalFilterPassSubFlota(node: RowNode): boolean {
    if (this.subFlotasRespaldo.length > 0 && this.buscarSubFlota.length > 1) {
      let busqueda = this.buscarSubFlota.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>

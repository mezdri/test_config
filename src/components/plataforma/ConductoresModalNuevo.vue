<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivC">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Crear Conductor</v-toolbar-title>
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
              :disabled="!validForm || btnBloquear ? true : false"
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
              v-show="asociarLicencias.visible"
              :complete="e1 > asociarLicencias.step"
              :step="asociarLicencias.step"
              >Asociar Licencias</v-stepper-step
            >
            <!-- <v-divider v-show="asociarLicencias.visible"></v-divider>
            <v-stepper-step
              v-show="asociarCopilotoVirtual.visible"
              :complete="e1 > asociarCopilotoVirtual.step"
              :step="asociarCopilotoVirtual.step"
              >Copiloto Virtual</v-stepper-step
            > -->
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
                            style="
                              margin-top: 12px !important;
                              font-weight: normal;
                            "
                          >
                            Información General
                          </h2>
                          <v-divider></v-divider>
                        </div>
                        <br />

                        <v-layout wrap>
                          <v-flex xs4 sm4 md4>
                            <img
                              :src="imageUrl"
                              height="83"
                              v-if="imageUrl"
                              alt="Imagen Conductor"
                            />
                            <v-text-field
                              label="Seleccione Foto."
                              heigh
                              @click="$refs.image.click()"
                              v-model="imageName"
                              prepend-icon="attach_file"
                              readonly="readonly"
                            ></v-text-field>
                            <input
                              type="file"
                              style="display: none"
                              ref="image"
                              accept="image/png, image/jpeg"
                              @change="onFilePicked"
                              :key="idkey"
                            />
                          </v-flex>
                          <v-flex xs4 sm4 md4></v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              v-model="editedItem.rut"
                              label="Rut"
                              placeholder="EJ: 11111111-1"
                              v-validate="{
                                rules: {
                                  required: true,
                                  max: 10,
                                  rut: true,
                                  rutFormato: true,
                                  rutUnicoPorCliente: true,
                                },
                              }"
                              :counter="10"
                              :error-messages="errors.collect('rut')"
                              data-vv-name="rut"
                              required
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              v-model="editedItem.codigoConductor"
                              label="Código Autorización"
                              v-validate="'max:50'"
                              :counter="50"
                              :error-messages="
                                errors.collect('codigoConductor')
                              "
                              data-vv-name="codigoConductor"
                              required
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs4 sm4 md4>
                            <v-menu
                              :close-on-content-click="false"
                              v-model="menuDatePickerVencimientoRut"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              max-width="290px"
                              min-width="290px"
                            >
                              <v-text-field
                                slot="activator"
                                v-model="computedDateFormattedVencimientoRut"
                                label="Vencimiento Cédula"
                                persistent-hint
                                prepend-icon="event"
                                readonly
                                v-validate="''"
                                :error-messages="
                                  errors.collect('vencimientoRut')
                                "
                                data-vv-name="vencimientoRut"
                              ></v-text-field>
                              <v-date-picker
                                v-model="editedItem.fechaVencimientoRut"
                                first-day-of-week="1"
                                locale="es-cl"
                                scrollable
                                :key="keyDatePickers"
                                @input="menuDatePickerVencimientoRut = false"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>

                          <v-flex xs4 sm4 md4>
                            <v-menu
                              :close-on-content-click="false"
                              v-model="menuDatePickerNacimiento"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              max-width="290px"
                              min-width="290px"
                            >
                              <v-text-field
                                slot="activator"
                                v-model="computedDateFormattedNacimiento"
                                label="Fecha Nacimiento"
                                persistent-hint
                                prepend-icon="event"
                                readonly
                                v-validate="
                                  'required|fechaNacimiento|mayorDeEdad'
                                "
                                :error-messages="
                                  errors.collect('fechaNacimiento')
                                "
                                data-vv-name="fechaNacimiento"
                                required
                              ></v-text-field>
                              <v-date-picker
                                v-model="editedItem.fechaNacimiento"
                                first-day-of-week="1"
                                locale="es-cl"
                                scrollable
                                :key="keyDatePickers"
                                @input="menuDatePickerNacimiento = false"
                              ></v-date-picker>
                            </v-menu>
                          </v-flex>

                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.nombre"
                              label="Nombre"
                              v-validate="'required|max:80|alpha_spaces'"
                              :counter="80"
                              :error-messages="errors.collect('Nombre')"
                              data-vv-name="Nombre"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.apellidoPaterno"
                              label="Apellido Paterno"
                              v-validate="'required|max:20|alpha_spaces'"
                              :counter="20"
                              :error-messages="
                                errors.collect('Apellido Paterno')
                              "
                              data-vv-name="Apellido Paterno"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.apellidoMaterno"
                              label="Apellido Materno"
                              v-validate="'required|max:20|alpha_spaces'"
                              :counter="20"
                              :error-messages="
                                errors.collect('Apellido Materno')
                              "
                              data-vv-name="Apellido Materno"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              v-model="editedItem.referencia"
                              label="Referencia"
                              v-validate="'max:20'"
                              :counter="20"
                              :error-messages="errors.collect('referencia')"
                              data-vv-name="referencia"
                              type="text"
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs6 sm6 md6>
                            <v-select
                              v-model="editedItem.estado"
                              :items="estado"
                              item-text="nombre"
                              item-value="id"
                              label="Estado"
                              v-validate="'required'"
                              :error-messages="errors.collect('estado')"
                              data-vv-name="estado"
                              required
                              @change="seleccionarEstado"
                              :hint="mensajeCambioEstado"
                              persistent-hint
                            ></v-select>
                          </v-flex>

                          <v-flex xs12 sm12 md12>
                            <v-autocomplete
                              :items="conductorGrupo"
                              v-model="editedItem.conductorGrupoId"
                              color="primary"
                              item-text="nombre"
                              item-value="id"
                              label="Grupos"
                              v-validate="'required'"
                              :error-messages="errors.collect('conductorGrupo')"
                              @change="selectedGrupoId"
                              required
                              data-vv-name="conductorGrupo"
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.horasDisponibleConduccion"
                              label="Horas Disponibles de Conducción"
                              v-validate="'numeric|min_value:0|max_value:24'"
                              :error-messages="
                                errors.collect('horasDisponible')
                              "
                              data-vv-name="horasDisponible"
                              type="numeric"
                            ></v-text-field>
                          </v-flex>
                          <v-flex md12>
                            <div align="left">
                              <h2 class="h2_title" style="font-weight: normal">
                                Contacto
                              </h2>
                              <br />
                            </div>
                          </v-flex>

                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.email"
                              label="Correo Electrónico"
                              v-validate="{
                                rules: {
                                  required: true,
                                  max: 200,
                                  email: true,
                                  EmailConductorUnicoPorCliente: true,
                                  regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                                },
                              }"
                              :counter="200"
                              :error-messages="
                                errors.collect('correo electrónico')
                              "
                              data-vv-name="correo electrónico"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>

                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.telefono"
                              label="Teléfono Celular"
                              placeholder="56999999999"
                              v-validate="{
                                required: true,
                                max: 11,
                                regex: /^(569)[0-9]\d{7}$/,
                              }"
                              :counter="11"
                              :error-messages="
                                errors.collect('Teléfono Celular')
                              "
                              data-vv-name="Teléfono Celular"
                              type="text"
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
              v-show="asociarLicencias.visible"
              :step="asociarLicencias.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Licencias</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            v-model="buscarLicencia"
                            prepend-icon="credit_card"
                            color="primary"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedLicencia"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                        <v-flex md3 v-show="this.muestraLicencia">
                          <v-menu
                            :close-on-content-click="false"
                            v-model="menuDatePicker"
                            :nudge-right="40"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            max-width="290px"
                            min-width="290px"
                          >
                            <v-text-field
                              slot="activator"
                              v-model="computedDateFormatted"
                              label="Fecha de Renovación"
                              persistent-hint
                              prepend-icon="event"
                              readonly
                              required
                              v-validate="{
                                rules: {
                                  required: setRequired,
                                },
                              }"
                              :error-messages="errors.collect('fechaRenova')"
                              data-vv-name="fechaRenova"
                            ></v-text-field>
                            <v-date-picker
                              v-model="editedItem.fechaRenovacionDocumento"
                              first-day-of-week="1"
                              locale="es-cl"
                              scrollable
                              @input="menuDatePicker = false"
                              @change="flagDate = false"
                            ></v-date-picker>
                          </v-menu>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              :columnDefs="columnDefsLicencia"
                              :rowData="licenciaRespaldo"
                              style="
                                width: 100%;
                                height: 380px;
                                font-family: 'Asap', sans-serif;
                              "
                              class="ag-theme-material"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              singleClickEdit="true"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReady"
                              :postProcessPopup="onClickCell"
                              @selection-changed="
                                onSelectionChangedConductor($event)
                              "
                              :getRowNodeId="getRowNodeIdLicencia"
                              suppressCopyRowsToClipboard="true"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentLicencia
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassLicencia
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
            <!-- Copiloto virtual -->
            <!-- <v-stepper-content
              v-show="asociarCopilotoVirtual.visible"
              :step="asociarCopilotoVirtual.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Habilitar Copiloto Virtual</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex xs6 sm6 md6>
                          <v-select
                            v-model="editItemCopiloto.estado"
                            :items="estado"
                            item-text="nombre"
                            item-value="id"
                            label="Estado"
                          ></v-select>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs6 sm6 md6>
                          <v-text-field
                            v-model="editItemCopiloto.password"
                            :items="editItemCopiloto.password"
                            prepend-icon="lock_open"
                            autocomplete="new-password"
                            readonly
                            onfocus="this.removeAttribute('readonly');"
                            :append-icon="
                              show3 ? 'visibility' : 'visibility_off'
                            "
                            label="Nueva Contraseña"
                            :type="show3 ? 'text' : 'password'"
                            @click:append="show3 = !show3"
                            :counter="20"
                            required
                          ></v-text-field>
                        </v-flex>

                        <v-flex xs6 sm6 md6>
                          <v-text-field
                            prepend-icon="lock_open"
                            autocomplete="new-password"
                            readonly
                            onfocus="this.removeAttribute('readonly');"
                            :append-icon="
                              show4 ? 'visibility' : 'visibility_off'
                            "
                            data-vv-name="contrasena3"
                            label="Repita Contraseña"
                            :type="show4 ? 'text' : 'password'"
                            @click:append="show4 = !show4"
                            :counter="20"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex md12>
                          <ConfigurarNotificacionConductor
                            @distribucionSelect="handleDistribucionSelect"
                            @tipoNotificacionSeleccionado="
                              handledTipoNotificacion
                            "
                          />
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap style="padding: 0px 10px 0px 10px">
                        <v-flex sm4 md2>
                          <v-checkbox
                            v-model="tipoNotificacion"
                            label="WhatsApp"
                            value="WhatsApp"
                            hide-details
                            @change="CheckNotificacion($event)"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex sm4 md2>
                          <v-checkbox
                            v-model="tipoNotificacion"
                            label="SMS"
                            value="SMS"
                            hide-details
                            @change="CheckNotificacion($event)"
                          ></v-checkbox>
                        </v-flex> 
                        <v-flex sm4 md2>
                          <v-checkbox
                            v-model="tipoNotificacion"
                            label="Email"
                            value="Email"
                            hide-details
                            @change="CheckNotificacion($event)"
                          ></v-checkbox>
                        </v-flex>
                      </v-layout>
                    </v-container>
                    <br />
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content> -->

            <!-- End Cvirtual -->
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Conductor' })"
      :mensaje="$t('mensajes.crud.crear.mensaje', { entidad: 'el Conductor' })"
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
    <app-confirmacion
      :show="dialogCambioEstado"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Conductor' })"
      :mensaje="
        $t('mensajes.mensajeCambioEstadoConductor.mensaje', {
          entidad: 'el Conductor',
        })
      "
      v-on:modalConfirmationEmit="confirmCallbackEstado($event, false)"
      :textoBtnSi="$t('mensajes.mensajeCambioEstadoConductor.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajeCambioEstadoConductor.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import {
  IConductor,
  IConductorGrupo,
  IConductorFile,
  IConductorCopiloto,
} from '@/interfaces/Conductores';
import { ILicenciaTipo } from '@/interfaces/Licencia';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Validator } from 'vee-validate';
import moment from 'moment';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import ValidaRut from '@/config/validaRut';
import { EstadoEntidad } from '@/config/enums';
import ConfigurarNotificacionConductor from '@/pantallas/Conductor/ConfigurarNotificacionConductor.vue';
import { LoadingService } from '@/services/loadingService';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { AlertaBackend } from '@/interfaces/Alertas';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    ConfigurarNotificacionConductor,
  },
})
export default class ConductoresModalguardarNuevoConductor extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 1 }) })
  conductores!: IConductor;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Conductores;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarLicencias: PermisoAccionVm = {
    accion: 'Crear - Asociar Licencia',
    visible: true,
    step: 2,
    codigoSubAccion: 30,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarCopilotoVirtual: PermisoAccionVm = {
    accion: 'Crear - Asociar Copiloto Virtual',
    visible: true,
    step: 3,
    codigoSubAccion: 30,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarLicencias,
    this.asociarCopilotoVirtual,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IConductor = {};
  search: string = '';
  buscarLicencia: string = '';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dialogCambioEstado: boolean = false;
  estadoSeleccionado: any = '';

  licenciaAsignadosModel: any = [];
  licenciaAsignados: ILicenciaTipo[] = [];
  licenciaRespaldo: ILicenciaTipo[] = [];

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];

  conductorGrupoSelected: number;
  conductorGrupo: IConductorGrupo[] = [];

  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  mensajeCambioEstado: string = '';
  disabledLicencia: boolean = false;
  mostrarMensajeCambioEstado: boolean = true;

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefsLicencia: Array<ColDef> = [];
  columnDefsVehiculos: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  vr: ValidaRut = new ValidaRut();
  loadingService = new LoadingService();

  //CALENDARIOS
  menuDatePickerVencimientoRut: boolean = false;
  menuDatePickerNacimiento: boolean = false;
  menuDatePicker: Boolean = false;
  // fechaRenovacionLicencia: any; //= moment(new Date()).format('YYYY-MM-DD');
  defaultDate: any = moment(new Date()).format('YYYY-MM-DD');
  setRequired: boolean = false;
  seleccionoTodos: boolean = true;

  //Upload File - FormData
  uploadedFiles: any = [];
  uploadError: any = null;
  currentStatus: any = null;
  uploadFieldName: string = 'photos';

  FormDataSeleccionado: FormData;
  conductorFile: IConductorFile = {};
  imageName: any = null;
  imageUrl: any = null;
  imageFile: any = null;
  msg: string = 'Por favor espere...';
  idkey: number = 0;
  muestraLicencia: boolean = false;

  btnBloquear: Boolean = false;

  keyDatePickers: number = 0;

  //controllers
  readonly controllerConductorGrupo: string = 'conductorgrupo';
  readonly controllerConductorLicencia: string = 'ConductorLicencia';
  readonly controllerConductorVehiculo: string = 'ConductorVehiculo';
  readonly controllerConductor: string = 'conductor';
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerLicenciaTipo: string = 'LicenciaTipo';
  readonly ControllerNotificacion: string;

  //copiloto virtual
  show3: boolean = false;
  show4: boolean = false;
  editItemCopiloto: IConductorCopiloto = {};
  alerta: AlertaBackend = {};
  tipoNotificacion: string[] = [];

  tipoNotificacionSeleccionado: number = 1;
  listaDistribucionSeleccionados: number[] = [];
  contactosSeleccionados: number[] = [];
  idsPlanesSeleccionados: number[] = [];
  usuariosSeleccionados: number[] = [];
  lsCheckSelected: number[] = [];
  camposZonaEmpty: any = '';

  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosUsuario: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  selectedGrupoId(e: any) {
    this.conductorGrupoSelected = e;
  }

  created() {
    this.chequearPermisos();
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

  marcarTodoslicencia(value: boolean) {
    this.licenciaAsignadosModel = [];
    this.licenciaAsignados = [];
    if (value) {
      this.licenciaRespaldo.forEach((cliente: any) => {
        this.licenciaAsignadosModel.push(cliente.id);
        this.licenciaAsignados.push(cliente);
      });
    } else {
      this.licenciaRespaldo.forEach((cliente: any) => {
        cliente.fechaRenovacionDocumento = null;
      });
    }
    this.seleccionoTodos = value;
  }

  volver() {
    this.e1 -= 1;
    this.$validator.errors.clear();
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivC').scrollIntoView(true);
  }

  existeValorTodasCeldaguardarNuevoConductor(grid: any, nombreColumna: string) {
    let res: any = true;
    if (grid != undefined) {
      grid.forEachNode(function(rowNode: any) {
        if (
          (rowNode.data[nombreColumna] === null ||
            rowNode.data[nombreColumna] === '') &&
          res
        ) {
          res = false;
        }
      });
    }

    return res;
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.idkey += 1;
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.setRequired = false;

    this.licenciaAsignados = [];
    this.licenciaAsignadosModel = [];
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosModel = [];

    this.FormDataSeleccionado = null;
    //this.editedItem.estado = EstadoEntidad.Activo;

    this.imageName = null;
    this.imageUrl = null;
    this.imageFile = null;

    if (value) {
      this.loadingService.showLoading();
      this.editedItem = {};
      this.$validator.reset();
      this.$validator.errors.clear();
      this.registrarValidadores();

      try {
        this.editedItem.estado = EstadoEntidad.Activo;
        await this.obtenerLicencias();
        //await this.obtenerVehiculos();
        await this.obtenerGrupoConductores();
        this.seleccionoTodos = false;
        this.editItemCopiloto.estado = EstadoEntidad.Activo;
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
    }
  }

  async obtenerGrupoConductores() {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${
          this.controllerConductorGrupo
        }/${config.getClienteSesion()}/GrupoConductoresCliente`
      );
      this.conductorGrupo = response.data;
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

  async obtenerLicencias() {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerLicenciaTipo}/`
      );
      this.licenciaRespaldo = response.data;
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
    if (this.licenciaRespaldo.length > 0) {
      this.muestraLicencia = true;
    } else {
      this.muestraLicencia = false;
    }
  }

  onLicenciaChange(lic: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (lic !== undefined && lic.length !== this.licenciaAsignados.length) {
      for (let x = this.licenciaAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= lic.length - 1; i++) {
          if (this.licenciaAsignados[x].id == lic[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.licenciaAsignados[x].fechaRenovacionDocumento = null; //Actualiza Fecha Renovacion Licencia
          this.licenciaAsignados.splice(x, 1);
        }
        if (this.licenciaAsignados.length === this.licenciaRespaldo.length)
          this.seleccionoTodos = true;
        else this.seleccionoTodos = false;
      }
    }
  }

  onLicenciaInput(lic: any) {
    if (lic !== undefined) {
      for (let i = 0; i <= lic.length - 1; i++) {
        let added = this.licenciaAsignados.filter(x => x.id == lic[i]);

        if (added.length === 0) {
          let licenciaAsignar = this.licenciaRespaldo.find(x => x.id == lic[i]);
          this.licenciaAsignados.push(licenciaAsignar);
          if (this.licenciaAsignados.length === this.licenciaRespaldo.length)
            this.seleccionoTodos = true;
          else this.seleccionoTodos = false;
        }
      }
    }
  }

  removerLicenciaAsignacion(item: ILicenciaTipo) {
    for (let i = 0; i <= this.licenciaAsignadosModel.length - 1; i++) {
      if (this.licenciaAsignadosModel[i] == item.id) {
        this.licenciaAsignadosModel.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i <= this.licenciaAsignados.length - 1; i++) {
      if (this.licenciaAsignados[i].id == item.id) {
        this.licenciaAsignados.splice(i, 1);
        break;
      }
    }
    if (this.licenciaAsignadosModel.length === this.licenciaRespaldo.length) {
      this.seleccionoTodos = true;
    } else {
      this.seleccionoTodos = false;
    }
    var appBanners = document.getElementsByClassName(
      'fechaRenovacionDocumento'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length === 1) {
      appBanners[0].remove();
    }
  }

  async obtenerVehiculos() {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${
          this.controllerVehiculo
        }/${config.getClienteSesion()}/vehiculosCliente`
      );
      this.vehiculosRespaldo = response.data;
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

  onVehiculosChange(vehiculo: any) {
    if (
      vehiculo != undefined &&
      vehiculo.length != this.vehiculosAsignados.length
    ) {
      for (let x = this.vehiculosAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= vehiculo.length - 1; i++) {
          if (this.vehiculosAsignados[x].id == vehiculo[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.vehiculosAsignados.splice(x, 1);
        }
      }
    }
  }

  onVehiculosInput(vehiculo: any) {
    if (vehiculo != undefined) {
      for (let i = 0; i <= vehiculo.length - 1; i++) {
        let added = this.vehiculosAsignados.filter(x => x.id == vehiculo[i]);
        if (added.length == 0) {
          let _vehiculo = this.vehiculosRespaldo.filter(
            x => x.id == vehiculo[i]
          );
          this.vehiculosAsignados.push(_vehiculo[0]);
        }
      }
    }
  }

  removerVehiculosAsignacion(item: IVehiculo) {
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      if (this.vehiculosAsignados[i].id == item.id) {
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
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivC').scrollIntoView(true);
    this.$validator.reset();
    this.$validator.errors.clear();
    this.setRequired = false;
    this.btnBloquear = false;
    this.buscarLicencia = '';
    this.gridApi.setQuickFilter('');
    this.editedItem = {};
    this.FormDataSeleccionado = null;
    this.e1 = 1;
    this.keyDatePickers += 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  async continuar() {
    const resultado = await this.$validator.validateAll();
    // debugger;
    if (resultado) {
      document.getElementById('cardDivC').scrollIntoView(true);
      if (this.e1 === this.permisosActuales.length - 1) {
        console.log('Estoy aquí -  1');
        this.btnBloquear = true;
        this.dialogConfirmacion = true;
      } else if (
        this.e1 === this.permisosActuales.length - 2 &&
        this.disabledLicencia === false
      ) {
        console.log('Estoy aquí -  2 ' + this.permisosActuales);
        this.e1 += 1;
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
      } else if (
        this.e1 === this.permisosActuales.length - 2 &&
        this.disabledLicencia === true
      ) {
        console.log('Estoy aquí -  3');
        this.btnBloquear = true;
        this.dialogCambioEstado = true;
      } else {
        this.e1 += 1;
      }
    }
  }

  async initialize() {
    //this.editedItem.estado = EstadoEntidad.Activo;
    this.columnDefsLicencia = [
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
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        minWidth: 80,
        resizable: true,
        hide: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Clase',
        field: 'clase',
        rowDrag: false,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
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
        headerName: 'Nombre',
        field: 'nombre',
        rowDrag: true,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
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
    ];

    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        Nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Nombre solo debe contener letras y/o espacios.',
        },
        'Apellido Paterno': {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Paterno solo debe contener letras y/o espacios.',
        },
        'Apellido Materno': {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Materno solo debe contener letras y/o espacios.',
        },
        referencia: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
        conductorGrupo: {
          required: () => config.errorMensajes.textoRequerido,
        },
        'correo electrónico': {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        'Teléfono Celular': {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        vencimientoRut: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaNacimiento: {
          mayorDeEdad: () => config.errorMensajes.fechaMayoriaEdad,
          fechaNacimiento: () => config.errorMensajes.fechaNacimientoMenorAHoy,
          required: () => config.errorMensajes.textoRequerido,
        },
        FechaRenovacion: {
          ValidadorFechaRenovacionguardarNuevoConductor: () =>
            config.errorMensajes.faltaFechaRenovacion,
        },
        codigoConductor: {
          max: () => config.errorMensajes.maxLength,
        },
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        fechaRenova: {
          required: () => config.errorMensajes.textoRequerido,
        },
        horasDisponible: {
          numeric: config.errorMensajes.soloNumeros,
          max_value: () => config.errorMensajes.maxLength,
          min_value: () => '* El valor no puede ser negativo.',
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  createButtonCellLicencias(params: any) {
    const item = this.licenciaRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      item.fechaRenovacionDocumento = null;
      this.removerLicenciaAsignacion(item);
    });

    return eButton;
  }

  createButtonCellVehiculos(params: any) {
    const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerVehiculosAsignacion(item);
    });

    return eButton;
  }

  formatDate(fecha: Date): string {
    if (!fecha) return null;
    const [year, month, day] = fecha.toString().split('-');
    return `${day}/${month}/${year}`;
  }

  async guardarNuevoConductor() {
    const he = new HandleErrors();

    const model = {
      rut: this.editedItem.rut,
      nombre: this.editedItem.nombre,
      apellidoPaterno: this.editedItem.apellidoPaterno,
      apellidoMaterno: this.editedItem.apellidoMaterno,
      referencia: this.editedItem.referencia,
      email: this.editedItem.email,
      telefono: this.editedItem.telefono,
      fechaNacimiento: this.editedItem.fechaNacimiento,
      fechaVencimientoRut: this.editedItem.fechaVencimientoRut,
      conductorGrupoId: this.conductorGrupoSelected,
      idElectroctonico: '0',
      estado: this.editedItem.estado,
      codigoConductor: this.editedItem.codigoConductor,
      horasDisponibleConduccion: this.editedItem.horasDisponibleConduccion,
    };

    try {
      this.loadingService.showLoading();
      const response = await this.axiosVehiculo.http.post(
        `${this.controllerConductor}/`,
        model
      );

      if (this.FormDataSeleccionado != null) {
        await this.upFile(response.data.id, this.FormDataSeleccionado);
      }

      // guarda licencias cuando el estado se encuentra Activo
      if (this.editedItem.estado === 0) {
        this.licenciaAsignados = [];
      }

      await this.guardarAsociacionesLicencia(response.data.id);
      //await this.guardarCopilotoVirtual(response.data.id);
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(error, he);
        }
      } else {
        this.errorMSG(error, he);
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async guardarAsociacionesLicencia(conductorId: number) {
    let conductorLicenciaModelListPost: any = [];

    if (this.licenciaAsignados.length > 0) {
      const he = new HandleErrors();

      this.licenciaAsignados.forEach((licencias: any) => {
        let licenciaModel = licencias;
        licenciaModel = {
          licenciaTipoId: licencias.id,
          conductorId: conductorId,
          fechaRenovacionDocumento: this.editedItem.fechaRenovacionDocumento,
        };

        conductorLicenciaModelListPost.push(licenciaModel);
      });

      if (conductorLicenciaModelListPost.length > 0) {
        try {
          const response = await this.axiosVehiculo.http.post(
            `${this.controllerConductorLicencia}`,
            conductorLicenciaModelListPost
          );

          this.close();
        } catch (error) {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.errorMSG(error, he);
            }
          } else {
            this.errorMSG(error, he);
          }
        }
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }

  async guardarCopilotoVirtual(conductorId: number) {
    const copilotoModel = {
      conductorId: conductorId,
      notificaEmail: this.editItemCopiloto.email,
      notificaWhatsApp: this.editItemCopiloto.whatsApp,
      notificaSms: this.editItemCopiloto.sms,
      estado: this.editItemCopiloto.estado,
      password: this.editItemCopiloto.password,
      usuarios: this.alerta.notificacionUsuario,
      contactos: this.alerta.notificacionContacto,
      listaDistribucion: this.alerta.notificacionListaDistribucion,
    };

    const response = await this.axiosVehiculo.http.post(
      `${this.controllerConductor}/asociarCopiloto`,
      copilotoModel
    );
  }

  async guardarAsociacionesVehiculo(conductorId: number) {
    let conductorVehiculoModelListPost: any = [];

    if (this.vehiculosAsignados.length > 0) {
      const he = new HandleErrors();

      this.vehiculosAsignados.forEach((vehiculo: any) => {
        let vehiculoModel = vehiculo;

        vehiculoModel = {
          vehiculoId: vehiculo.id,
          conductorId: conductorId,
          fechaInicialAsignacion: new Date(),
        };

        conductorVehiculoModelListPost.push(vehiculoModel);
      });

      if (conductorVehiculoModelListPost.length > 0) {
        try {
          const response = await this.axiosVehiculo.http.post(
            `${this.controllerConductorVehiculo}/`,
            conductorVehiculoModelListPost
          );

          this.close();
        } catch (error) {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.errorMSG(error, he);
            }
          } else {
            this.errorMSG(error, he);
          }
        }
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }

  seleccionarEstado(tipoEstado: any) {
    this.estadoSeleccionado = tipoEstado;

    switch (this.estadoSeleccionado) {
      case 1: // estado Activo
        this.disabledLicencia = false;
        this.mensajeCambioEstado = '';
        this.btnText = 'Continuar';
        this.btnClass = 'btn-continuar';
        break;

      case 0: // estado Inactivo
        this.disabledLicencia = true;
        this.mensajeCambioEstado =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
        this.btnText = 'Guardar';
        this.btnClass = 'btn-grabar';
        this.vehiculosAsignados = [];
        this.vehiculosAsignadosModel = [];
        break;
    }
  }

  confirmCallbackEstado(aceptado: boolean) {
    this.dialogCambioEstado = false;

    if (aceptado === true) {
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
      this.confirmCallback(aceptado);
      this.disabledLicencia = true;
    } else {
      this.editedItem.estado = 0;
      this.btnBloquear = false;
      this.disabledLicencia = true;
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    }
  }

  close() {
    this.editedItem.fechaVencimientoRut = new Date();
    this.editedItem.fechaNacimiento = new Date();
    this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Conductor',
        creadoA: 'creado',
      })
    );
  }

  //COMPUTED
  get computedDateFormattedVencimientoRut() {
    return this.formatDate(this.editedItem.fechaVencimientoRut);
  }

  get computedDateFormattedNacimiento() {
    return this.formatDate(this.editedItem.fechaNacimiento);
  }
  get computedDateFormatted() {
    return this.formatDate(this.editedItem.fechaRenovacionDocumento);
  }

  reset() {
    this.uploadedFiles = [];
    this.uploadError = null;
  }

  async upFile(id: number, formData: any) {
    const he = new HandleErrors();
    try {
      const response = await this.axiosVehiculo.http.put(
        `${this.controllerConductor}/${id}/foto`,
        formData
      );
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(error, he);
        }
      } else {
        this.errorMSG(error, he);
      }
    }
  }

  onFilePicked(e: any) {
    var formData = new FormData();

    const files = e.target.files;
    if (files[0] !== undefined) {
      this.imageName = files[0].name;

      if (this.imageName.lastIndexOf('.') <= 0) {
        return;
      }

      const fr = new FileReader();
      fr.readAsDataURL(files[0]);

      fr.addEventListener('load', () => {
        this.imageUrl = fr.result;
        this.imageFile = files[0]; // Este es el Archivo que se envia al server.
      });

      formData.append('ConductorFile', files[0]);

      this.FormDataSeleccionado = formData;
    } else {
      this.imageName = null;
      this.imageFile = null;
      this.imageUrl = null;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    const he = new HandleErrors();

    if (val) {
      const resultadoValidacion = await this.$validator.validateAll();
      this.btnBloquear = true;
      const boolError = await this.guardarNuevoConductor();
    }

    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  errorMSG(error: any, he: HandleErrors) {
    //he.showError(error);
    this.$snotify.error(
      this.$t('mensajes.mensajesError.crear', { entidad: 'el Conductor' })
    );
    this.btnBloquear = false;
  }

  registrarValidadores() {
    const validarRut = this.vr;
    const item = this.editedItem;
    const self = this;
    // debugger;
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

    Validator.extend('rutUnicoPorCliente', {
      getMessage() {
        return '* El RUT ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(
            `${
              self.controllerConductor
            }/0/${config.getClienteSesion()}/${value}/rutUnicoPorCliente`
          )
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* El RUT ya se encuentra en uso.' },
              });
            });
          })
          .catch(() => {
            return true;
          });
      },
    });

    Validator.extend('EmailConductorUnicoPorCliente', {
      getMessage() {
        return '* El correo ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(
            `${
              self.controllerConductor
            }/0/${config.getClienteSesion()}/${value}/EmailUnicoPorCliente`
          )
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* El correo ya se encuentra en uso.' },
              });
            });
          })
          .catch(() => {
            return true;
          });
      },
    });

    Validator.extend('ValidadorFechaRenovacionguardarNuevoConductor', {
      getMessage(field: any, params: any, data: any) {
        //return (data && data.message) || '* Seleccione la Fecha de Renovación del Documento';
        return '* Seleccione la Fecha de Renovación del Documento';
      },
      validate(value: any) {
        if (self.e1 != 1) {
          return self.existeValorTodasCeldaguardarNuevoConductor(
            self.gridApi,
            'fechaRenovacionDocumento'
          );
        } else {
          return true;
        }
      },
    });

    Validator.extend('fechaNacimiento', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Fecha Nacimiento no puede ser mayor a hoy'
        );
      },
      validate(value: any) {
        return validarRut.validaFechaNacimiento(value);
      },
    });

    Validator.extend('mayorDeEdad', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* Fecha Nacimiento no cumple con mayoría de edad'
        );
      },
      validate(value: any) {
        return validarRut.validaMayorEdad(value);
      },
    });
  }

  fechaRDFilter(r: any) {
    if (r.value == null) return this.celdaFechaRenovacionTemplate('');

    if (r.value.length < 11) {
      if (r.value.indexOf('-') > -1) {
        const [year, month, day] = r.value.split('-');

        return this.celdaFechaRenovacionTemplate(`${day}/${month}/${year}`);
      } else {
        return this.celdaFechaRenovacionTemplate(r.value);
      }
    }

    return this.celdaFechaRenovacionTemplate(
      this.$options.filters.formatDate(r.value)
    );
  }

  celdaFechaRenovacionTemplate(fecha: any) {
    let divPadre = document.createElement('div');

    let div = document.createElement('div');
    div.style.width = '15%';
    div.style.cssFloat = 'left';

    let divInputPrepend = document.createElement('div');
    divInputPrepend.className = 'v-input__prepend-outer';
    divInputPrepend.style.paddingTop = '5px !important';

    let divInputIcon = document.createElement('div');
    divInputIcon.className = 'v-input__icon v-input__icon--prepend';

    let imagen = document.createElement('i');
    imagen.className = 'v-icon material-icons theme--light';
    imagen.innerText = 'event';
    imagen.setAttribute('aria-hidden', 'true');

    div.appendChild(divInputPrepend);
    divInputPrepend.appendChild(divInputIcon);
    divInputIcon.appendChild(imagen);

    let divFecha = document.createElement('div');
    divFecha.style.width = '82%';
    divFecha.style.cssFloat = 'left';
    divFecha.style.paddingLeft = '5px';
    divFecha.innerText = fecha;

    divPadre.appendChild(div);
    div.insertAdjacentElement('afterend', divFecha);

    return divPadre;
  }
  async onSelectionChangedConductor() {
    await this.ordena();
    this.licenciaAsignados = this.gridApi.getSelectedRows();
    if (this.licenciaAsignados.length > 0) {
      this.setRequired = true;
    } else {
      if (this.editedItem.fechaRenovacionDocumento != undefined) {
        this.editedItem.fechaRenovacionDocumento = undefined;
      }
      this.setRequired = false;
    }
  }
  getRowNodeIdLicencia(lic: ILicenciaTipo) {
    if (!lic) {
      return;
    }
    return lic.id;
  }
  onFilterTextBoxChangedLicencia() {
    this.gridApi.onFilterChanged();
    // if (this.buscarLicencia.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarLicencia);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }
  ordena() {
    const licenciasSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const licenciasNoSeleccionados = differenceBy(
      this.licenciaRespaldo,
      licenciasSeleccionados,
      licenc => licenc.id
    ).map(licenc => ({
      ...licenc,
      licenc: false,
    }));
    this.gridApi.updateRowData({
      update: [...licenciasNoSeleccionados, ...licenciasSeleccionados],
    });
  }

  isExternalFilterPresentLicencia(): boolean {
    return true;
  }

  doesExternalFilterPassLicencia(node: RowNode): boolean {
    if (this.licenciaRespaldo.length > 0 && this.buscarLicencia.length > 1) {
      let busqueda = this.buscarLicencia.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.clase.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  //

  handledTipoNotificacion(tipoNotificacion: number) {
    this.tipoNotificacionSeleccionado = tipoNotificacion;
  }

  handleDistribucionSelect(
    lstNotificacion: number[],
    tipoNotificacion: number
  ) {
    console.log('tiponotifca', tipoNotificacion);
    if (tipoNotificacion == 1) {
      this.alerta.notificacionListaDistribucion = lstNotificacion;
      this.listaDistribucionSeleccionados = lstNotificacion;
    } else if (tipoNotificacion == 2) {
      this.alerta.notificacionContacto = lstNotificacion;
      this.contactosSeleccionados = lstNotificacion;
    } else {
      this.alerta.notificacionUsuario = lstNotificacion;
      this.usuariosSeleccionados = lstNotificacion;
    }
  }
  CheckNotificacion(e: Event) {
    this.editItemCopiloto.whatsApp = this.tipoNotificacion.includes('WhatsApp')
      ? true
      : false;
    this.editItemCopiloto.sms = this.tipoNotificacion.includes('SMS')
      ? true
      : false;
    this.editItemCopiloto.email = this.tipoNotificacion.includes('Email')
      ? true
      : false;

    // if (this.tipoNotificacion.includes('WhatsApp')) {
    //   this.editItemCopiloto.whatsApp = true;
    // }

    // if (this.tipoNotificacion.includes('SMS')) {
    //   this.editItemCopiloto.sms = true;
    // }

    // if (this.tipoNotificacion.includes('Email')) {
    //   this.editItemCopiloto.email = true;
    // }
  }
}
</script>

<style scoped>
.dropbox {
  outline: 2px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 200px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}

.h2_title {
  font-weight: normal;
}
</style>

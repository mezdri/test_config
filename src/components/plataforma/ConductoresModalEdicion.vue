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
          <v-toolbar-title>{{
            esEdicion ? 'Editar Conductor' : 'Ver Detalle Conductor'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear"
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
                  (asociarLicencias.visible && esEdicion) ||
                    (asociarLicenciasVerDetalle.visible && !esEdicion)
                "
                :value="asociarLicencias.step"
              >
                <span>Asociar Licencias</span>
                <v-icon>credit_card</v-icon>
              </v-btn>
              <!-- <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (asociarCopilotoVirtual.visible && esEdicion) ||
                    (asociarCopilotoVirtualVerDetalle.visible && !esEdicion)
                "
                :value="asociarCopilotoVirtual.step"
              >
                <span>Copiloto Virtual</span>
                <v-icon>phonelink_ring</v-icon>
              </v-btn> -->
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
                        style="margin-top: 12px !important; font-weight: normal"
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
                          :disabled="!esEdicion"
                        ></v-text-field>
                        <input
                          type="file"
                          style="display: none"
                          ref="image"
                          accept="image/png, image/jpeg"
                          @change="onFilePicked"
                          :disabled="!esEdicion"
                          :key="idkey"
                        />
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          v-model="editedItem.id"
                          label="Código"
                          :disabled="true"
                        ></v-text-field>
                      </v-flex>
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
                              rutUnicoPorCliente: true,
                            },
                          }"
                          :counter="10"
                          :error-messages="errors.collect('rut')"
                          data-vv-name="rut"
                          required
                          :disabled="true"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          v-model="editedItem.codigoConductor"
                          label="Código Autorización"
                          v-validate="'max:50'"
                          :counter="50"
                          :error-messages="errors.collect('codigoConductor')"
                          data-vv-name="codigoConductor"
                          required
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                        >
                          <v-text-field
                            slot="activator"
                            v-model="computedDateFormattedVencimientoRut"
                            label="Vencimiento Cédula"
                            persistent-hint
                            prepend-icon="event"
                            readonly
                            v-validate="''"
                            :disabled="!esEdicion"
                            :error-messages="errors.collect('vencimientoRut')"
                            data-vv-name="vencimientoRut"
                          ></v-text-field>
                          <v-date-picker
                            v-model="fechaVencimientoRut"
                            first-day-of-week="1"
                            locale="es-cl"
                            scrollable
                            :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
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
                            :disabled="!esEdicion"
                            v-validate="'required|fechaNacimiento|mayorDeEdad'"
                            :error-messages="errors.collect('fechaNacimiento')"
                            data-vv-name="fechaNacimiento"
                            required
                          ></v-text-field>
                          <v-date-picker
                            v-model="fechaNacimiento"
                            first-day-of-week="1"
                            locale="es-cl"
                            scrollable
                            :disabled="!esEdicion"
                            :key="keyDatePickersNac"
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
                          :disabled="!esEdicion"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs12 sm12 md6>
                        <v-text-field
                          v-model="editedItem.apellidoPaterno"
                          label="Apellido Paterno"
                          v-validate="'required|max:20|alpha_spaces'"
                          :counter="20"
                          :error-messages="errors.collect('Apellido Paterno')"
                          data-vv-name="Apellido Paterno"
                          type="text"
                          required
                          :disabled="!esEdicion"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs12 sm12 md6>
                        <v-text-field
                          v-model="editedItem.apellidoMaterno"
                          label="Apellido Materno"
                          v-validate="'required|max:20|alpha_spaces'"
                          :counter="20"
                          :error-messages="errors.collect('Apellido Materno')"
                          data-vv-name="Apellido Materno"
                          type="text"
                          required
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          @change="seleccionarEstado"
                          :hint="mensajeCambioEstadoEditar"
                          persistent-hint
                        ></v-select>
                      </v-flex>

                      <v-flex xs12 sm12 md12>
                        <v-autocomplete
                          v-model="conductorGrupoSeleccionado"
                          :items="conductorGrupo"
                          color="primary"
                          item-text="nombre"
                          item-value="id"
                          :disabled="!esEdicion"
                          label="Grupos"
                          v-validate="'required'"
                          :error-messages="errors.collect('conductorGrupo')"
                          required
                          data-vv-name="conductorGrupo"
                          no-data-text="Sin resultados"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.horasDisponibleConduccion"
                          label="Horas Disponibles de Conducción"
                          :disabled="!esEdicion"
                          v-validate="'numeric|min_value:0|max_value:24'"
                          :error-messages="errors.collect('horasDisponible')"
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
                              EmailConductorUnicoPorClienteEditar: true,
                              regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                            },
                          }"
                          :counter="200"
                          :error-messages="errors.collect('correo electrónico')"
                          data-vv-name="correo electrónico"
                          type="text"
                          :disabled="!esEdicion"
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
                          :error-messages="errors.collect('Teléfono Celular')"
                          data-vv-name="Teléfono Celular"
                          type="text"
                          required
                          :disabled="!esEdicion"
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
              bottomNav == asociarLicencias.step &&
                ((asociarLicencias.visible && esEdicion) ||
                  (asociarLicenciasVerDetalle.visible && !esEdicion))
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
                  <v-container grid-list-md text-xs-center>
                    <v-layout row grap>
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
                          v-model="buscarLicenciaEdicion"
                          prepend-icon="credit_card"
                          color="primary"
                          label="Buscar..."
                          @input="onFilterTextBoxChangedLicenciaEdicion"
                          append-icon="search"
                        ></v-text-field>
                      </v-flex>
                      <v-flex md3>
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
                          :disabled="!esEdicion"
                        >
                          <v-text-field
                            slot="activator"
                            v-model="computedDateFormattedEdicion"
                            label="Fecha de Renovación"
                            persistent-hint
                            prepend-icon="event"
                            readonly
                            v-validate="{
                              rules: {
                                required: setRequiredEdicion,
                              },
                            }"
                            :error-messages="
                              errors.collect('fechaRenovaEdicion')
                            "
                            data-vv-name="fechaRenovaEdicion"
                            required
                            :disabled="!esEdicion"
                          ></v-text-field>
                          <v-date-picker
                            v-model="fechaRenovacionLicencia"
                            first-day-of-week="1"
                            locale="es-cl"
                            scrollable
                            @input="menuDatePicker = false"
                            :disabled="!esEdicion"
                          ></v-date-picker>
                        </v-menu>
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
                    <br v-show="esEdicion" />
                    <v-layout row wrap>
                      <v-flex md12>
                        <v-card>
                          <ag-grid-vue
                            style="
                              width: 100%;
                              height: 380px;
                              font-family: 'Asap', sans-serif;
                            "
                            class="ag-theme-material"
                            :columnDefs="columnLicenciaDefs"
                            :rowData="licenciaRespaldo"
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
                              onSelectionChangedConductorLicencia($event)
                            "
                            :getRowNodeId="getRowNodeIdLicenciaEdicion"
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
                </v-form>
              </v-card>
            </v-flex>
          </div>
          <!-- <div
            align="center"
            v-show="
              bottomNav == asociarCopilotoVirtual.step &&
                ((asociarCopilotoVirtual.visible && esEdicion) ||
                  (asociarCopilotoVirtualVerDetalle.visible && !esEdicion))
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
                <FormFieldsContainer>
                  <v-container grid-list-md >
                    
                    <v-layout row grap>
                      <div align="left">
                        <v-flex md12>
                          <h2 class="h2_title">Copiloto Virtual</h2>
                        </v-flex>
                      </div>
                    </v-layout>
                    <v-divider></v-divider>
                    <br />
                    <v-layout row wrap>
                      <v-flex xs6 sm6 md6>
                        <v-select
                          v-model="formFields.estadoCP.value"
                          :items="estado"
                          :id="formFields.estadoCP.id"
                          item-text="nombre"
                          item-value="id"
                          label="Estado"
                          @change="cambio"
                          data-vv-name="estado"
                          :disabled="!esEdicion"
                        ></v-select>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          v-model="formFields.password.value"
                          :items="editItemCopiloto.password"
                          prepend-icon="lock_open"
                          autocomplete="new-password"
                          readonly
                          onfocus="this.removeAttribute('readonly');"
                          :append-icon="show3 ? 'visibility' : 'visibility_off'"
                          label="Nueva Contraseña"
                          :type="show3 ? 'text' : 'password'"
                          @click:append="show3 = !show3"
                          :counter="20"
                          required
                           :data-vv-name="formFields.password.id"
                          :disabled="!esEdicion"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs6 sm6 md6>
                        <v-text-field
                          prepend-icon="lock_open"
                          autocomplete="new-password"
                          readonly
                          onfocus="this.removeAttribute('readonly');"
                          :append-icon="show4 ? 'visibility' : 'visibility_off'"
                           v-model="formFields.password2.value"
                          label="Repita Contraseña"
                          :type="show4 ? 'text' : 'password'"
                          @click:append="show4 = !show4"
                          :counter="20"
                          :disabled="!esEdicion"
                           :data-vv-name="formFields.password2.id"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex md12>
                        <ConfigurarNotificacionConductor 
                        :modoVer="false"
                        :modoEditar="true" 
                        :alertaSeleccionada="editItemCopiloto"
                        :editItemCopiloto="editItemCopiloto"
                        :conductor="editedItem"
                        @distribucionSelect="handleDistribucionSelect"
                            @tipoNotificacionSeleccionado="handledTipoNotificacion"                       
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
                          :disabled="!esEdicion"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex sm4 md2>
                        <v-checkbox
                          v-model="tipoNotificacion"
                          label="SMS"
                          value="SMS"
                          hide-details
                          @change="CheckNotificacion($event)"
                          :disabled="!esEdicion"
                        ></v-checkbox>
                      </v-flex> 
                      <v-flex sm4 md2>
                       <v-checkbox
                         
                           :data-vv-name="formFields.email.id"
                          label="Email"
                          
                          hide-details
                          @change="CheckNotificacion(formFields.email.value)"
                          :disabled="!esEdicion"
                         v-model="formFields.email.value"
                        ></v-checkbox>
                      </v-flex>
                    </v-layout>
                   
                  </v-container>
                   </FormFieldsContainer>
                </v-form>
              </v-card>
            </v-flex>
          </div> -->
        </div>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :width="520"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Conductor',
          nombreEntidad:
            editedItem.nombre +
            ' ' +
            editedItem.apellidoPaterno +
            ' ' +
            editedItem.apellidoMaterno,
        })
      "
      :mensaje="$t('mensajes.crud.editar.mensaje', { entidad: 'el Conductor' })"
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
    <app-confirmacion
      :show="dialogCambioEstado"
      :width="520"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Conductor',
          nombreEntidad:
            editedItem.nombre +
            ' ' +
            editedItem.apellidoPaterno +
            ' ' +
            editedItem.apellidoMaterno,
        })
      "
      :mensaje="mensajeConfirmacionEditar"
      v-on:modalConfirmationEmit="confirmCallbackEstado($event, false)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      :items="itemsNoValidos"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </v-layout>
</template>

<script lang="ts">
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { EstadoEntidad } from '@/config/enums';
import moment from 'moment';
import { differenceBy } from 'lodash';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import {
  IConductor,
  IConductorCopiloto,
  IConductorGrupo,
  IConductorLicencia,
  IConductorVehiculo,
} from '@/interfaces/Conductores';
import { ILicenciaTipo } from '@/interfaces/Licencia';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import ValidaRut from '@/config/validaRut';
import CalendarEditor from '@/components/CalendarioCellPopupEditor.vue';
import { Validator } from 'vee-validate';
import { LoadingService } from '@/services/loadingService';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  GridOptions,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import ConfigurarNotificacionConductor from '@/pantallas/Conductor/ConfigurarNotificacionConductor.vue';
import { AlertaBackend } from '@/interfaces/Alertas';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    ConfigurarNotificacionConductor,
    FormFieldsContainer,
    MensajeValidacion,
  },
})
export default class ConductoresModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  conductores!: IConductor;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Conductores;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarLicencias: PermisoAccionVm = {
    accion: 'Editar - Asociar Licencia',
    visible: true,
    step: 2,
    codigoSubAccion: 30,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarCopilotoVirtual: PermisoAccionVm = {
    accion: 'Crear - Asociar Copiloto Virtual',
    visible: true,
    step: 3,
    codigoSubAccion: 30,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarLicenciasVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Licencia',
    visible: true,
    step: 2,
    codigoSubAccion: 30,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarCopilotoVirtualVerDetalle: PermisoAccionVm = {
    accion: 'Crear - Asociar Copiloto Virtual',
    visible: true,
    step: 3,
    codigoSubAccion: 30,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarLicencias,
    this.informacionGeneralVerDetalle,
    this.asociarLicenciasVerDetalle,
    this.asociarCopilotoVirtualVerDetalle,
  ];

  formFields: FormFieldDefMap = {
    estadoCP: {
      label: 'Estado',
      id: 'id',
      value: 0,
    },
    password: {
      label: 'Password',
      id: 'password',
      value: '',
    },
    password2: {
      label: 'Password',
      id: 'password2',
      value: '',
    },
    email: {
      label: 'EMail',
      id: 'email',
      value: false,
    },
  };

  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  showValidacion: boolean = false;
  itemsNoValidos: string[] = [];

  //Variables globales
  $snotify: any;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IConductor = {};

  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  search: string = '';
  idkey: number = 0;
  muestraLicencia: boolean = false;
  buscarLicenciaEdicion: string = '';
  menuDatePicker: Boolean = false;
  // fechaRenovacionLicencia: any; //= moment(new Date()).format('YYYY-MM-DD');
  setRequiredEdicion: boolean = false;

  asignados: any = [];

  conductoresAsignadosModel: any = [];
  conductoresAsignados: IConductor[] = [];
  conductoresAsignadosResp: IConductor[] = [];
  conductoresRespaldo: IConductor[] = [];

  conductorLicencia: IConductorLicencia[] = [];
  conductorVehiculo: IConductorVehiculo[] = [];
  conductorCopiloto: IConductorCopiloto;

  conductorConFoto: IConductor = {};
  //ASOCIACIONES -------------------------------------------------------------------------------------
  licenciaAsignadosModel: any = [];
  licenciaAsignados: ILicenciaTipo[] = [];
  licenciaAsignadosResp: ILicenciaTipo[] = [];
  licenciaRespaldo: ILicenciaTipo[] = [];

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosAsignadosResp: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  seleccionoTodos: boolean = true;
  mensajeCambioEstadoEditar: any = '';
  mensajeConfirmacionEditar: any = '';

  //--------------------------------------------------------------------------------------------------
  //SELECT--------------------------------------------------------------------------------------------
  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();
  estadoSeleccionado: any = 1;

  conductorGrupoSeleccionado: any = 0;
  conductorGrupo: IConductorGrupo[] = [];
  vehAsignados: any = 0;
  //--------------------------------------------------------------------------------------------------

  handleErrors: HandleErrors = new HandleErrors();
  loadingService = new LoadingService();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;

  columnDefs: Array<ColDef> = [];
  columnLicenciaDefs: Array<ColDef> = [];
  columnVehiculosDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  vr: ValidaRut = new ValidaRut();
  menuDatePickerVencimientoRut: boolean = false;
  menuDatePickerNacimiento: boolean = false;
  fechaNacimiento: any = null;
  fechaVencimientoRut: any = null;
  fechaRenovacionLicencia: any = null;

  FormDataSeleccionado: FormData;
  imageName: any = null;
  imageUrl: any = null;
  imageFile: any = null;

  btnBloquear: Boolean = false;

  dialogCambioEstadoEditar: boolean = false;
  dialogCambioEstado: boolean = false;

  frameworkComponents: any = null;
  gridOptions: GridOptions = null;

  keyDatePickers: number = 0;
  keyDatePickersNac: number = 1;

  //controllers
  controllerConductorGrupo: string = 'conductorgrupo';
  controllerConductorLicencia: string = 'ConductorLicencia';
  controllerConductorVehiculo: string = 'ConductorVehiculo';
  controllerConductorCopiloto: string = 'ConductorCopiloto';
  controllerConductor: string = 'Conductor';
  controllerLicenciaTipo: string = 'LicenciaTipo';
  controllerVehiculo: string = 'vehiculo';

  // Copiloto
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
  estadoCP: any = 1;
  seleccionEstado: number = 0;

  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  constructor() {
    super();

    let validador = this.$validator.validateAll;
  }

  created() {
    this.registrarValidadores();
  }

  cambio() {
    if (this.estadoCP === 1) {
      this.estadoCP = 0;
      this.formFields.estadoCP.value = 0;
    } else {
      this.estadoCP = 1;
      this.formFields.estadoCP.value = 1;
    }

    // if (this.estadoCP) {

    //   this.formFields.estadoCP.value = 1;
    //   //this.seleccionEstado = 1;
    //   this.formFields.estadoCP.label = 'Activo';

    // } else {
    //   this.formFields.estadoCP.value = 0;
    //   //this.seleccionEstado = 2;
    //   this.formFields.estadoCP.label = 'Inactivo';
    //   //this.hint = 'Al dejar como inactivo, no se podrán realizar asociaciones.';
    //}
    this.$emit('estadoSwitch', this.estadoCP);
  }

  private registrarValidadores() {
    const self = this;
    const validarRut = this.vr;

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

    Validator.extend('rutUnicoPorClienteEditar', {
      getMessage() {
        return '* El RUT ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(
            `${self.controllerConductor}/${
              self.editedItem.id
            }/${config.getClienteSesion()}/${value}/rutUnicoPorCliente`
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

    Validator.extend('EmailConductorUnicoPorClienteEditar', {
      getMessage() {
        return '* El correo ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(
            `${self.controllerConductor}/${
              self.editedItem.id
            }/${config.getClienteSesion()}/${value}/EmailUnicoPorCliente`
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

    Validator.extend('ValidadorFechaRenovacion', {
      getMessage(field: any, params: any, data: any) {
        //return (data && data.message) || '* Seleccione la Fecha de Renovación del Documento';
        return '* Seleccione la Fecha de Renovación del Documento';
      },
      validate(value: any) {
        return self.existeValorTodasCelda(
          self.gridApi,
          'fechaRenovacionDocumento'
        );
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

  async initialize() {
    this.columnLicenciaDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: this.esEdicion,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        sort: 'desc',
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
        cellStyle: params =>
          !this.esEdicion
            ? {
                textAlign: 'left',
                'pointer-events': 'none',
              }
            : { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        rowDrag: false,
        enablePivot: true,
        lockPinned: true,
        resizable: true,
        minWidth: 80,
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
        rowDrag: false,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
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
      /*,
      {
        headerName: "Fecha Renovación",
        field: "fechaRenovacionDocumento",
        minWidth: 80,
        cellRenderer: this.fechaRDFilter,
        cellEditorFramework: CalendarEditor,
        cellEditorParams: {
          validacion: this.$validator
        },
        editable: true,
        cellClassRules: {
          "grid-celda-vacia": "x === '' || x === null ",
          "": "x !== ''"
        },
        rowDrag: false,
        enablePivot: true,
        cellStyle: { textAlign: "left" },
        filter: false
      }*/
    ];

    this.columnVehiculosDefs = [
      {
        headerName: 'Código',
        field: 'id',
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        minWidth: 80,
        hide: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Patente',
        field: 'patente',
        minWidth: 80,
        rowDrag: true,
        lockPinned: true,
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
      {
        headerName: 'VIN',
        field: 'vin',
        minWidth: 80,
        lockPinned: true,
        rowDrag: true,
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
        conductorGrupoSel: {
          required: () => config.errorMensajes.textoRequerido,
        },
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        teléfono: {
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
          ValidadorFechaRenovacion: () =>
            config.errorMensajes.faltaFechaRenovacion,
        },
        conductorGrupo: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaRenovaEdicion: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    if (!this.esEdicion) {
      this.columnLicenciaDefs.shift();
    }
  }

  mounted() {
    this.initialize();
  }

  @Watch('editedItem', { deep: true })
  handeConductor() {
    this.$emit('editedItem', this.editedItem);
    if (this.conductorCopiloto != null) {
      this.editItemCopiloto = this.conductorCopiloto;
    }
  }

  //EVENTOS -----------------------------------------------------------------------
  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.idkey += 1;
    this.dialog = value;
    this.btnText = 'Guardar';
    this.setRequiredEdicion = false;
    this.$validator.reset();

    this.editedItem = this.conductores;
    this.bottomNav = '1';
    this.conductoresAsignadosModel = [];
    this.conductoresAsignadosResp = [];
    this.conductoresAsignados = [];

    this.licenciaAsignadosModel = [];
    this.licenciaAsignados = [];
    this.licenciaAsignadosResp = [];

    this.vehiculosAsignadosModel = [];
    this.vehiculosAsignados = [];
    this.vehiculosAsignadosResp = [];

    this.conductorLicencia = [];

    this.imageName = null;
    this.imageUrl = null;
    this.imageFile = null;

    this.menuDatePickerVencimientoRut = false;
    this.menuDatePickerNacimiento = false;
    this.$validator.reset();
    this.$validator.errors.clear();

    this.fechaNacimiento = moment(this.editedItem.fechaNacimiento).format(
      'YYYY-MM-DD'
    );

    // permisos
    this.chequearPermisosEditarDetalle();

    this.setBotonNav();

    if (this.editedItem.fechaVencimientoRut != null) {
      this.fechaVencimientoRut = moment(
        this.editedItem.fechaVencimientoRut
      ).format('YYYY-MM-DD');
    }

    this.conductorConFoto = {};

    if (value) {
      try {
        this.loadingService.showLoading();
        await this.obtenerGrupoConductores();
        await this.obtenerLicencias();
        await this.obtenerConductorPorId(this.editedItem.id);

        await this.obtenerConductorCopiloto();
        // this.AgregarColumnaFechaRenovacion(); //Desactivar Fecha Renovacion en Ver Detalle

        //await this.obtenerConductorVehiculos();
        this.initialize();

        this.seleccionoTodos = false;
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
    if (
      this.licenciaAsignadosResp.length >= 1 &&
      this.estadoSeleccionado === 0
    ) {
      this.mensajeCambioEstadoEditar = this.$t(
        'mensajes.crud.inactivoAsociado.mensaje'
      );
    } else if (this.vehAsignados.length > 0 && this.estadoSeleccionado === 0) {
      this.mensajeCambioEstadoEditar = this.$t(
        'mensajes.crud.inactivoAsociado.mensaje'
      );
    } else if (
      this.estadoSeleccionado === 0 &&
      this.licenciaAsignadosResp.length == 0
    ) {
      this.mensajeCambioEstadoEditar = this.$t(
        'mensajes.crud.inactivo.mensaje'
      );
    } else {
      this.mensajeCambioEstadoEditar = '';
    }
    this.mensajeConfirmacionEditar =
      this.mensajeCambioEstadoEditar +
      ' ¿Está seguro que desea guardar los cambios realizados?';
    await this.$validator.validateAll();
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

  onConductorChange(user: any) {
    if (
      user !== undefined &&
      user.length !== this.conductoresAsignados.length
    ) {
      for (let x = this.conductoresAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= user.length - 1; i++) {
          if (this.conductoresAsignados[x].id == user[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.conductoresAsignados.splice(x, 1);
        }
      }
    }
  }

  onConductorInput(user: any) {
    if (user !== undefined) {
      for (let i = 0; i <= user.length - 1; i++) {
        let added = this.conductoresAsignados.filter(x => x.id == user[i]);

        if (added.length == 0) {
          let usuario = this.conductoresRespaldo.filter(x => x.id == user[i]);
          this.conductoresAsignados.push(usuario[0]);
        }
      }
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
          const licenciaAgregar = this.licenciaRespaldo.find(
            x => x.id == lic[i]
          );
          this.licenciaAsignados.push(licenciaAgregar);
        }
      }
    }
  }

  onVehiculoChange(vehiculo: any) {
    if (
      vehiculo !== undefined &&
      vehiculo.length !== this.vehiculosAsignados.length
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

  onVehiculoInput(vehiculo: any) {
    if (vehiculo !== undefined) {
      for (let i = 0; i <= vehiculo.length - 1; i++) {
        let added = this.vehiculosAsignados.filter(x => x.id == vehiculo[i]);

        if (added.length == 0) {
          const vehiculoAgregar = this.vehiculosRespaldo.find(
            x => x.id == vehiculo[i]
          );
          this.vehiculosAsignados.push(vehiculoAgregar);
        }
      }
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.fechaNacimiento = null;
    this.fechaVencimientoRut = null;
    this.editedItem = {};
    this.editItemCopiloto = {};
    this.setRequiredEdicion = false;
    this.$validator.reset();
    this.buscarLicenciaEdicion = '';
    this.gridApi.setQuickFilter('');
    this.FormDataSeleccionado = null;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.reset();
    this.$validator.errors.clear();
    this.keyDatePickers += 1;
    this.keyDatePickersNac += 1;
  }

  seleccionarEstado(tipoEstado: any) {
    this.estadoSeleccionado = tipoEstado;
    switch (this.estadoSeleccionado) {
      case 1: // estado Activo
        this.mensajeCambioEstadoEditar = '';
        break;

      case 0: // estado Inactivo
        if (this.licenciaAsignadosResp.length >= 1) {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivoAsociado.mensaje'
          );
        } else if (this.vehAsignados.length > 0) {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivoAsociado.mensaje'
          );
        } else {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivo.mensaje'
          );
        }
        this.mensajeConfirmacionEditar =
          this.mensajeCambioEstadoEditar +
          ' ¿Está seguro que desea guardar los cambios realizados?';

        break;
    }
  }

  async confirmCallbackEstado(val: boolean) {
    this.dialogCambioEstado = false;
    let permisoStepLicencia: boolean = false;

    if (val === true) {
      this.licenciaAsignados = [];
      this.licenciaAsignadosModel = [];
      await this.desasociarVehiculoLicencia();
      this.close();
    } else {
      this.editedItem.estado = 0;
    }
  }

  async desasociarVehiculoLicencia() {
    try {
      const responseDesasociar = await this.axiosVehiculo.http.post(
        `${this.controllerConductor}/${this.editedItem.id}/vehiculoLicencia`
      );
    } catch (error) {
      if (error.responseDesasociar !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  fechaRDFilter(r: any) {
    if (r.value === null) {
      return this.celdaFechaRenovacionTemplate('');
    }

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

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  removerConductorAsignacion(item: IConductor) {
    for (let i = 0; i <= this.conductoresAsignados.length - 1; i++) {
      if (this.conductoresAsignados[i].id == item.id) {
        this.conductoresAsignados.splice(i, 1);
        return;
      }
    }
  }

  setSeleccionadosSelect() {
    this.conductorGrupoSeleccionado = this.editedItem.conductorGrupoId;
    this.estadoSeleccionado = this.editedItem.estado;
    //this.fechaRenovacionLicencia = this.editedItem.
  }

  async obtenerConductorCopiloto() {
    try {
      if (this.editedItem.id !== undefined) {
        const response = await this.axiosVehiculo.http.get(
          `${this.controllerConductor}/GetConductor/${this.editedItem.id}`
        );
        let respConductor = response.data;

        let copi: IConductorCopiloto = {};

        this.editItemCopiloto.estado = respConductor.estado === true ? 1 : 0;
        this.formFields.estadoCP.value = respConductor.estado === true ? 1 : 0;
        this.estadoCP = respConductor.estado === true ? 1 : 0;

        this.editItemCopiloto.id = this.editedItem.id;
        //this.editItemCopiloto.password = this.conductorCopiloto.password;
        this.editItemCopiloto.email = respConductor.notificaEmail;
        this.formFields.email.value = respConductor.notificaEmail;
        this.editItemCopiloto.usuarios = respConductor.usuarios;
        this.editItemCopiloto.contactos = respConductor.contactos;
        this.editItemCopiloto.listaDistribucion =
          respConductor.listaDistribucion;

        copi.id = this.editedItem.id;
        copi.usuarios = respConductor.usuarios;
        copi.contactos = respConductor.contactos;
        copi.listaDistribucion = respConductor.listaDistribucion;

        this.editItemCopiloto = copi;
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
  }
  async obtenerConductorLicencias() {
    try {
      if (this.editedItem.id !== undefined) {
        const response = await this.axiosVehiculo.http.get(
          `${this.controllerConductorLicencia}/${this.editedItem.id}/licenciasTipo/`
        );

        this.conductorLicencia = response.data;
        this.conductorLicencia.forEach((cl: any) => {
          this.licenciaAsignados.push(cl.licenciaTipo);
          this.licenciaAsignadosModel.push(cl.licenciaTipoId);
        });

        this.licenciaAsignadosResp = Object.assign([], this.licenciaAsignados);
        if (
          this.licenciaAsignadosResp.length >= 1 &&
          this.estadoSeleccionado === 0
        ) {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivoAsociado.mensaje'
          );
        } else if (
          this.estadoSeleccionado === 0 &&
          this.licenciaAsignadosResp.length == 0
        ) {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivo.mensaje'
          );
        } else {
          this.mensajeCambioEstadoEditar = '';
        }
        if (this.licenciaAsignados.length > 0) {
          this.fechaRenovacionLicencia = this.licenciaAsignados[0].fechaRenovacionDocumento;
          this.fechaRenovacionLicencia = moment(
            this.fechaRenovacionLicencia
          ).format('YYYY-MM-DD');
        } else {
          this.fechaRenovacionLicencia = '';
        }
        // this.fechaRDFilter(this.fechaRenovacionLicencia);
        this.mensajeConfirmacionEditar =
          this.mensajeCambioEstadoEditar +
          ' ¿Está seguro que desea guardar los cambios realizados?';
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
    }
  }

  async obtenerConductorVehiculos() {
    try {
      if (this.editedItem.id !== undefined) {
        const response = await this.axiosVehiculo.http.get(
          `${this.controllerConductorVehiculo}/${this.editedItem.id}/vehiculos/`
        );
        this.vehAsignados = response.data;

        this.conductorVehiculo = response.data;

        this.conductorVehiculo.forEach((cv: IConductorVehiculo) => {
          this.vehiculosAsignados.push(
            this.vehiculosRespaldo.find(x => x.id == cv.vehiculoId)
          );
          this.vehiculosAsignadosModel.push(cv.vehiculoId);
        });

        this.vehiculosAsignadosResp = Object.assign(
          [],
          this.vehiculosAsignados
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
    }
  }

  createButtonCellLicencias(params: any) {
    const item = this.licenciaRespaldo.find(x => x.id == params.data.id);

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
      item.fechaRenovacionDocumento = null;
      this.removerLicenciaAsignacion(item);
      eButton.remove();
    });

    return eButton;
  }

  createButtonCellVehiculos(params: any) {
    let evento = this.removerVehiculosAsignacion;
    const item = this.vehiculosRespaldo.find(x => x.id == params.data.id);

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

    eButton.addEventListener('click', function() {
      evento(item);
    });

    return eButton;
  }

  createButtonCell(params: any) {
    let evento = this.removerConductorAsignacion;
    const item = this.conductoresRespaldo.find(x => x.id == params.data.id);

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

  async grabarEdicion() {
    const resultadoValidador = await this.$validator.validateAll();

    if (resultadoValidador) {
      // si el estado del conductor es activo guarda sin restricciones
      if (this.editedItem.estado === 1) {
        this.btnBloquear = true;
        this.dialogConfirmacion = true;
        this.gridApi.redrawRows();
      } else {
        this.dialogCambioEstado = true;
      }
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.btnBloquear = true;
      let responseValidator = await this.$validator.validateAll();

      if (this.formFields.password.value != this.formFields.password2.value) {
        this.tituloValidacion = 'Editar Copiloto';
        this.mensajeValidacion = 'Contraseñas deben de ser iguales.';
        this.showValidacion = true;
        responseValidator = false;
      }

      if (responseValidator) {
        await this.actualizarCopiloto();
        let boolError = this.actualizacionConductor();
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
  //COMPUTED
  get computedDateFormattedVencimientoRut() {
    if (this.fechaVencimientoRut !== null) {
      return this.formatDate(this.fechaVencimientoRut);
    }
    return null;
  }

  get computedDateFormattedNacimiento() {
    return this.formatDate(this.fechaNacimiento);
  }
  get computedDateFormattedEdicion() {
    return this.formatDate(this.fechaRenovacionLicencia);
  }

  async obtenerConductores() {
    try {
      const response = await this.axiosVehiculo.http.get(
        this.controllerConductor
      );
      this.conductoresRespaldo = response.data;
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

  async obtenerConductorPorId(id: number) {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerConductor}/${id}`
      );

      this.conductorConFoto = response.data;
      this.editedItem.conductorGrupoId = response.data.conductorGrupoId;
      this.setSeleccionadosSelect();

      if (response.data.foto !== '') {
        var contentType = 'image/*';
        this.setImage(this.base64toBlob(response.data.foto, contentType));
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
      this.conductorGrupoSeleccionado = this.editedItem.conductorGrupoId;
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
        `${this.controllerLicenciaTipo}/conductorlicencias/${this.editedItem.id}`
      );
      this.licenciaRespaldo = response.data;
      await this.obtenerConductorLicencias();
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
    await this.seteaAsignados();
    const self = this;
    this.gridApi.forEachNode(function(node: any) {
      var index = self.licenciaAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
      }
    });
  }
  seteaAsignados() {
    if (!this.esEdicion) {
      this.licenciaRespaldo = this.licenciaAsignados;
    }
  }

  removerVehiculosAsignacion(item: IVehiculo) {
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      if (this.vehiculosAsignados[i].id === item.id) {
        this.vehiculosAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.vehiculosAsignadosModel.length - 1; i++) {
      if (this.vehiculosAsignadosModel[i] === item.id) {
        this.vehiculosAsignadosModel.splice(i, 1);
        break;
      }
    }
  }

  removerLicenciaAsignacion(item: ILicenciaTipo) {
    for (let i = 0; i <= this.licenciaAsignados.length - 1; i++) {
      if (this.licenciaAsignados[i].id === item.id) {
        this.licenciaAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.licenciaAsignadosModel.length - 1; i++) {
      if (this.licenciaAsignadosModel[i] === item.id) {
        this.licenciaAsignadosModel.splice(i, 1);
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

  async actualizacionConductor() {
    let boolError = false;

    const model = {
      id: this.editedItem.id,
      conductorGrupoId: this.conductorGrupoSeleccionado,
      rut: this.editedItem.rut,
      nombre: this.editedItem.nombre,
      apellidoPaterno: this.editedItem.apellidoPaterno,
      apellidoMaterno: this.editedItem.apellidoMaterno,
      referencia: this.editedItem.referencia,
      idElectroctonico: this.editedItem.idElectroctonico,
      email: this.editedItem.email,
      telefono: this.editedItem.telefono,
      fechaNacimiento: new Date(this.fechaNacimiento),
      fechaVencimientoRut:
        this.fechaVencimientoRut != null
          ? new Date(this.fechaVencimientoRut)
          : null,
      codigoConductor: this.editedItem.codigoConductor,
      estado: this.editedItem.estado,
      horasDisponibleConduccion: this.editedItem.horasDisponibleConduccion,
    };

    try {
      this.loadingService.showLoading();
      const response = await this.axiosVehiculo.http.put(
        this.controllerConductor,
        model
      );

      if (this.FormDataSeleccionado != null) {
        await this.upFile(response.data.id, this.FormDataSeleccionado);
      }
      //await this.actualizarCopiloto();
      await this.actualizarLicencias();
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG();
        }
      } else {
        this.errorMSG();
      }
    } finally {
      this.loadingService.hideLoading();
    }

    return boolError;
  }

  async actualizarLicencias() {
    let he = new HandleErrors();

    let licenciaModelListPost: any = [];
    let licenciaModelListPut: any = [];
    let licenciaModelListDelete: any = [];

    this.licenciaAsignados.forEach((licencias: any) => {
      let licenciaModel = licencias;
      let exists = this.conductorLicencia.find(
        x => x.licenciaTipoId == licencias.id
      );

      if (exists === null || exists === undefined) {
        licenciaModel = {
          licenciaTipoId: licencias.id,
          conductorId: this.editedItem.id,
          fechaRenovacionDocumento: this.fechaRenovacionLicencia,
        };

        licenciaModelListPost.push(licenciaModel);
      } else {
        licenciaModel = {
          id: exists.id,
          licenciaTipoId: licencias.id,
          conductorId: this.editedItem.id,
          fechaRenovacionDocumento: this.fechaRenovacionLicencia,
        };

        licenciaModelListPut.push(licenciaModel);
      }
    });

    this.conductorLicencia.forEach((cl: IConductorLicencia) => {
      let clModel = cl;
      let exists = this.licenciaAsignados.find(
        x => x.id == clModel.licenciaTipoId
      );

      if (exists === undefined || exists === null) {
        let licenciaModel = {
          id: clModel.id,
        };
        licenciaModelListDelete.push(licenciaModel);
      }
    });

    try {
      if (licenciaModelListDelete.length > 0) {
        const response = await this.axiosVehiculo.http.delete(
          this.controllerConductorLicencia,
          {
            data: licenciaModelListDelete,
          }
        );

        if (licenciaModelListPut.length > 0) {
          const responseConductorLicencia = await this.axiosVehiculo.http.put(
            this.controllerConductorLicencia,
            licenciaModelListPut
          );

          if (licenciaModelListPost.length > 0) {
            const responsePost = await this.axiosVehiculo.http.post(
              this.controllerConductorLicencia,
              licenciaModelListPost
            );
            this.close();
          } else {
            this.close();
          }
        } else if (licenciaModelListPost.length > 0) {
          const response = await this.axiosVehiculo.http.post(
            this.controllerConductorLicencia,
            licenciaModelListPost
          );

          this.close();
        } else {
          this.close();
        }
      } else if (licenciaModelListPut.length > 0) {
        const response = await this.axiosVehiculo.http.put(
          this.controllerConductorLicencia,
          licenciaModelListPut
        );

        if (licenciaModelListPost.length > 0) {
          const response = await this.axiosVehiculo.http.post(
            this.controllerConductorLicencia,
            licenciaModelListPost
          );

          this.close();
        } else {
          this.close();
        }
      } else if (licenciaModelListPost.length > 0) {
        const response = await this.axiosVehiculo.http.post(
          this.controllerConductorLicencia,
          licenciaModelListPost
        );

        this.close();
      } else {
        this.close();
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
    }
  }

  async actualizarCopiloto() {
    try {
      this.loadingService.showLoading();

      let estado = this.estadoCP == 1 ? true : false;

      let model = {
        conductorid: this.editedItem.id,
        estado: estado,
        password: this.formFields.password.value,
        sms: false,
        notificaEmail: this.formFields.email.value,
        whatsApp: false,
        Usuarios: this.usuariosSeleccionados,
        Contactos: this.contactosSeleccionados,
        ListaDistribucion: this.listaDistribucionSeleccionados,
      };

      const response = await this.axiosVehiculo.http.put(
        `${this.controllerConductor}/PutConductor`,
        model
      );
    } catch (error) {
      this.loadingService.hideLoading();
    } finally {
      this.loadingService.hideLoading();
    }
  }

  lista: any = { usuarios: [], contactos: [], listas: [] };
  handleDistribucionSelect(
    lstNotificacion: number[],
    tipoNotificacion: number
  ) {
    if (tipoNotificacion == 1) {
      this.alerta.notificacionListaDistribucion = lstNotificacion;
      this.listaDistribucionSeleccionados = lstNotificacion;
      this.lista.listas = lstNotificacion;
    } else if (tipoNotificacion == 2) {
      this.alerta.notificacionContacto = lstNotificacion;
      this.contactosSeleccionados = lstNotificacion;
      this.lista.contactos = lstNotificacion;
    } else {
      this.alerta.notificacionUsuario = lstNotificacion;
      this.usuariosSeleccionados = lstNotificacion;
      this.lista.usuarios = lstNotificacion;
    }
  }

  handledTipoNotificacion(tipoNotificacion: number) {
    this.tipoNotificacionSeleccionado = tipoNotificacion;
  }

  close() {
    this.formFields.estadoCP.value = '';
    this.formFields.password.value = '';
    this.formFields.password2.value = '';
    this.usuariosSeleccionados = [];
    this.contactosSeleccionados = [];
    this.listaDistribucionSeleccionados = [];
    this.alerta.notificacionUsuario = [];
    this.alerta.notificacionContacto = [];
    this.alerta.notificacionListaDistribucion = [];

    this.loadingService.hideLoading();
    this.closeModal(false);
    this.dialogConfirmacion = false;

    //this.formFields = {};

    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
  }

  async actualizarVehiculos() {
    //Ingresa/Actualiza/Elimina (Desasocia)
    let he = new HandleErrors();
    let vehiculoModelListPUT: any = [];
    let vehiculoModelListPOST: any = [];
    let vehiculoModelListDELETE: any = [];

    this.vehiculosAsignados.forEach((vehiculo: any) => {
      let vehiculoModel = vehiculo;
      const exists = this.conductorVehiculo.find(
        x => x.vehiculoId == vehiculoModel.id
      );

      if (exists === null) {
        vehiculoModel = {
          vehiculoId: vehiculo.id,
          conductorId: this.editedItem.id,
          fechaInicioAsociacion: new Date(),
        };

        vehiculoModelListPOST.push(vehiculoModel);
      } else {
        vehiculoModel = {
          id: exists.id,
          vehiculoId: vehiculo.id,
          conductorId: this.editedItem.id,
        };
        vehiculoModelListPUT.push(vehiculoModel);
      }
    });

    this.conductorVehiculo.forEach((cv: IConductorVehiculo) => {
      let cvModel = cv;
      const exists = this.vehiculosAsignados.find(
        x => x.id == cvModel.vehiculoId
      );

      if (exists === null) {
        let vehiculoModel = {
          id: cvModel.id,
        };

        vehiculoModelListDELETE.push(vehiculoModel);
      }
    });

    if (vehiculoModelListDELETE.length > 0) {
      const responseDelete = await this.axiosVehiculo.http.delete(
        this.controllerConductorVehiculo,
        { data: vehiculoModelListDELETE }
      );

      if (vehiculoModelListPUT.length > 0) {
        const response = await this.axiosVehiculo.http.put(
          this.controllerConductorVehiculo,
          vehiculoModelListPUT
        );

        if (vehiculoModelListPOST.length > 0) {
          const response = await this.axiosVehiculo.http.post(
            this.controllerConductorVehiculo,
            vehiculoModelListPOST
          );

          await this.actualizarLicencias();
        } else {
          await this.actualizarLicencias();
        }
      } else {
        if (vehiculoModelListPOST.length > 0) {
          const responsePost = await this.axiosVehiculo.http.post(
            this.controllerConductorVehiculo,
            vehiculoModelListPOST
          );
          await this.actualizarLicencias();
        } else {
          await this.actualizarLicencias();
        }
      }
    } else if (vehiculoModelListPUT.length > 0) {
      const responsePut = await this.axiosVehiculo.http.put(
        this.controllerConductorVehiculo,
        vehiculoModelListPUT
      );

      if (vehiculoModelListPOST.length > 0) {
        const response = await this.axiosVehiculo.http.post(
          this.controllerConductorVehiculo,
          vehiculoModelListPOST
        );
        await this.actualizarLicencias();
      } else {
        await this.actualizarLicencias();
      }
    } else if (vehiculoModelListPOST.length > 0) {
      const responseVehiculoPost = await this.axiosVehiculo.http.post(
        this.controllerConductorVehiculo,
        vehiculoModelListPOST
      );
      await this.actualizarLicencias();
    } else {
      await this.actualizarLicencias();
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

  base64toBlob(base64Data: any, contentType: any) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);

      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  setImage(foto: any) {
    const files = foto;

    if (files !== undefined) {
      const fr = new FileReader();
      fr.readAsDataURL(files);
      fr.addEventListener('load', () => {
        this.imageUrl = fr.result;
        this.imageFile = files;
        this.imageName = files.name;
      });
    } else {
      this.imageName = '';
      this.imageFile = '';
      this.imageUrl = '';
    }
  }

  errorMSG() {
    this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
    this.btnBloquear = false;
  }

  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  async upFile(id: number, formData: any) {
    try {
      const response = await this.axiosVehiculo.http.put(
        `${this.controllerConductor}/${id}/foto`,
        formData
      );
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG();
        }
      } else {
        this.errorMSG();
      }
    }
  }

  existeValorTodasCelda(grid: any, nombreColumna: string) {
    let res: any = true;

    if (grid != undefined) {
      grid.forEachNode(function(rowNode: any, index: number) {
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

  AgregarColumnaFechaRenovacion() {
    let a1 = this.columnLicenciaDefs.filter(
      (x: any) => x.headerName === 'Fecha Renovación'
    );

    if (a1.length > 0) {
      this.columnLicenciaDefs = config.returnGrillaCeldasDesasociar(
        this.columnLicenciaDefs,
        'Fecha Renovación'
      );
    }

    if (this.esEdicion) {
      this.columnLicenciaDefs.push({
        headerName: 'Fecha Renovación',
        field: 'fechaRenovacionDocumento',
        minWidth: 80,
        width: 200,
        resizable: true,
        lockPinned: true,
        cellRenderer: this.fechaRDFilter,
        cellEditorFramework: CalendarEditor,
        cellEditorParams: {
          validacion: this.$validator,
        },
        editable: true,
        cellClassRules: {
          'grid-celda-vacia': "x === '' || x === null ",
          '': "x !== ''",
        },
        rowDrag: false,
        sortable: true,
        enablePivot: true,
        cellStyle: { textAlign: 'left' },
        filter: false,
      });
    } else {
      this.columnLicenciaDefs.push({
        headerName: 'Fecha Renovación',
        field: 'fechaRenovacionDocumento',
        minWidth: 80,
        lockPinned: true,
        cellRenderer: this.fechaRDFilter,
        cellEditorFramework: CalendarEditor,
        cellEditorParams: {
          validacion: this.$validator,
        },
        editable: false,
        suppressNavigable: true,
        cellClassRules: {
          'grid-celda-vacia': "x === '' || x === null ",
          '': "x !== ''",
        },
        rowDrag: false,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        filter: false,
      });
    }
  }

  DesasociarBoton() {
    //if (this.esEdicion) {
    let a1 = this.columnLicenciaDefs.filter(
      (x: any) => x.headerName === 'Desasociar'
    );

    if (a1.length == 0) {
      this.columnLicenciaDefs.push({
        headerName: 'Desasociar',
        cellRenderer: this.createButtonCellLicencias,
        enablePivot: false,
        width: 150,
        minWidth: 150,
        filter: false,
        suppressMovable: true,
        resizable: false,
        sortable: false,
        lockVisible: true,
        sort: 'desc',
        pinned: 'right',
        cellStyle: {
          textAlign: 'left',
        },
      });
    }
    /* }
    else {
      //remueve columnas de desasociar, si existen
      this.columnLicenciaDefs = config.returnGrillaCeldasDesasociar(
        this.columnLicenciaDefs,
        "Desasociar"
      );
    }*/
  }
  async onSelectionChangedConductorLicencia() {
    this.licenciaAsignados = this.gridApi.getSelectedRows();

    if (this.licenciaAsignados.length > 0) {
      this.setRequiredEdicion = true;
    } else {
      this.setRequiredEdicion = false;
      this.$validator.reset();
      this.fechaRenovacionLicencia = null;
    }
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
  getRowNodeIdLicenciaEdicion(lic: ILicenciaTipo) {
    if (!lic) {
      return;
    }
    return lic.id;
  }
  onFilterTextBoxChangedLicenciaEdicion() {
    this.gridApi.onFilterChanged();
    // if (this.buscarLicenciaEdicion.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarLicenciaEdicion);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }
  fechaFormat(x: any) {
    return moment(x).format('YYYY-MM-DD');
  }

  isExternalFilterPresentLicencia(): boolean {
    return true;
  }

  doesExternalFilterPassLicencia(node: RowNode): boolean {
    if (
      this.licenciaRespaldo.length > 0 &&
      this.buscarLicenciaEdicion.length > 1
    ) {
      let busqueda = this.buscarLicenciaEdicion.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.clase.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }

  CheckNotificacion(e: Event) {
    // this.editItemCopiloto.whatsApp = this.tipoNotificacion.includes('WhatsApp')
    //   ? true
    //   : false;
    // this.editItemCopiloto.sms = this.tipoNotificacion.includes('SMS')
    //   ? true
    //   : false;
    // this.editItemCopiloto.email = this.tipoNotificacion.includes('Email')
    //   ? true
    //   : false;
    //this.formFields.email.value = this.editItemCopiloto.email;
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
.h2_title {
  font-weight: normal;
}
</style>

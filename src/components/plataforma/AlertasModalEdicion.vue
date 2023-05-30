<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      fullscreen
      persistent
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivRT">
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="cerrarOperacion()" :disabled="btnBloquear">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{ esEdicion ? 'Editar Alerta' : 'Ver Detalle Alerta' }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
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
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="informacionGeneral.step"
              >
                <span>Configurar Alerta</span>
                <v-icon>info</v-icon>
              </v-btn>
              <v-btn
                v-show="
                  (asociarVehiculoFlota.visible && esEdicion) ||
                    (asociarVehiculoFlotaVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="asociarVehiculoFlota.step"
              >
                <span>Asociar</span>
                <v-icon>drive_eta</v-icon>
              </v-btn>
              <v-btn
                v-show="
                  (configuracionNotificaciones.visible && esEdicion) ||
                    (configuracionNotificacionesVerDetalle.visible &&
                      !esEdicion)
                "
                color="primary"
                flat
                :value="configuracionNotificaciones.step"
              >
                <span>Configurar Notificaciones</span>
                <v-icon>person</v-icon>
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
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Configurar Alerta</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout wrap>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="editedItem.nombre"
                            v-validate="{
                              rules: {
                                required: true,
                                max: 100,
                                NombreUnicoEditar: true,
                                regex: regexEmoji,
                              },
                            }"
                            :error-messages="errors.collect('nombre')"
                            data-vv-name="nombre"
                            :counter="100"
                            label="Nombre Alerta"
                            type="text"
                            @keydown="preventPunto"
                            @paste="preventPunto"
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-select
                            v-model="tipoAlerta"
                            v-validate="'required'"
                            :error-messages="errors.collect('tipoAlerta')"
                            data-vv-name="tipoAlerta"
                            label="Tipo De Alerta"
                            :items="tiposAlertas"
                            class="styled-select"
                            readonly
                            :disabled="!esEdicion"
                          ></v-select>
                        </v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-autocomplete
                            v-model="tipificacion"
                            v-validate="'required'"
                            :error-messages="errors.collect('tipificacion')"
                            data-vv-name="tipificacion"
                            label="Color Tipificación"
                            item-text="title"
                            item-value="title"
                            :items="colores"
                            class="styled-select"
                            no-data-text="Sin resultados"
                            :disabled="!esEdicion"
                          >
                            <template v-slot:selection="data">
                              <v-avatar
                                :color="data.item.icon"
                                size="20"
                              ></v-avatar>
                              &nbsp;{{ data.item.title }}
                            </template>
                            <template v-slot:item="data">
                              <template v-if="typeof data.item !== 'object'">
                                <v-list-tile-content
                                  v-text="data.item"
                                ></v-list-tile-content>
                              </template>
                              <template v-else>
                                <v-list-tile-avatar
                                  :color="data.item.icon"
                                ></v-list-tile-avatar>
                                <v-list-tile-content>
                                  <v-list-tile-title
                                    v-html="data.item.title"
                                  ></v-list-tile-title>
                                </v-list-tile-content>
                              </template>
                            </template>
                          </v-autocomplete>
                        </v-flex>
                      </v-layout>
                      <v-layout wrap>
                        <!--Configuracion de alerta de tipo Exceso de velocidad-->
                        <v-flex xs12 sm12 md6>
                          <v-text-field
                            v-model="velocidadMaxima.velocidadMaxima"
                            menu-props="auto"
                            v-validate="
                              'required|numeric|integer|max:3|max_value:240|min_value:0'
                            "
                            :error-messages="
                              errors.collect('velocidadAdicional')
                            "
                            data-vv-name="velocidadAdicional"
                            :counter="3"
                            class="styled-select"
                            label="Velocidad Máxima en km/h"
                            type="text"
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md6>
                          <v-text-field
                            v-model="velocidadMaxima.tolerancia"
                            v-validate="
                              'required|numeric|integer|max:2|max_value:99|min_value:0'
                            "
                            :error-messages="errors.collect('tolerancia')"
                            data-vv-name="tolerancia"
                            class="styled-select"
                            label="Tolerancia en km/h"
                            type="text"
                            :counter="2"
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>

                        <v-flex xs122 sm12 md6>
                          <v-text-field
                            v-model="editedItem.cantidadEventos"
                            v-validate="{
                              rules: {
                                required:
                                  !editedItem.temporalidad ||
                                  editedItem.temporalidad == 0
                                    ? true
                                    : false,
                                numeric: true,
                                max: 3,
                                min_value: editedItem.temporalidad < 1 ? 1 : 0,
                                integer: true,
                              },
                            }"
                            :error-messages="
                              errors.collect('numeroRepeticiones')
                            "
                            data-vv-name="numeroRepeticiones"
                            :counter="3"
                            class="styled-select"
                            label="Número de Eventos"
                            type="text"
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm12 md6>
                          <v-text-field
                            v-model="editedItem.temporalidad"
                            v-validate="{
                              rules: {
                                required:
                                  !editedItem.cantidadEventos ||
                                  editedItem.cantidadEventos == 0
                                    ? true
                                    : false,
                                numeric: true,
                                max: 3,
                                min_value:
                                  editedItem.cantidadEventos < 1 ? 1 : 0,
                                integer: true,
                              },
                            }"
                            :error-messages="errors.collect('temporalidad')"
                            data-vv-name="temporalidad"
                            :counter="3"
                            label="Temporalidad en min."
                            type="text"
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>
                        <!---->
                        <v-flex xs12 sm12 md12>
                          <v-switch
                            :label="estadoAlerta ? 'Activo' : 'Inactivo'"
                            :readonly="!esEdicion"
                            v-model="estadoAlerta"
                            color="success"
                          ></v-switch>
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
              bottomNav == asociarVehiculoFlota.step &&
                ((asociarVehiculoFlota.visible && esEdicion) ||
                  (asociarVehiculoFlotaVerDetalle.visible && !esEdicion))
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
                    <v-container grid-list-md text-xs-center>
                      <div align="left">
                        <v-flex md5 xd5>
                          <h2 class="h2_title">
                            Asociar Flotas, Etiquetas o Vehículos
                          </h2>
                        </v-flex>
                      </div>
                      <v-layout wrap>
                        <v-flex xs12 md12 lg12>
                          <v-radio-group
                            v-model="radiosVF"
                            row
                            @change="selectedRB"
                          >
                            <v-radio label="Flotas" value="rdbFlota"></v-radio>
                            <v-radio
                              label="Etiquetas"
                              value="rdbEtiquetas"
                            ></v-radio>
                            <v-radio
                              label="Vehículos"
                              value="rdbVehiculos"
                            ></v-radio>
                          </v-radio-group>
                        </v-flex>
                      </v-layout>
                      <v-divider></v-divider>
                      <v-layout
                        wrap
                        v-if="configAsociar == 1 && esEdicion == true"
                      >
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarFlota"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedFlotas"
                            @keydown="preventEnter"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        row
                        wrap
                        v-if="configAsociar == 1 && esEdicion == true"
                      >
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsFlotas"
                              :rowData="flotasRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onRowSelectedF"
                              :onGridReady="onGridReadyFlo"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridFlo"
                              :isExternalFilterPresent="
                                isExternalFilterPresentFlota
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassFlota
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        wrap
                        v-if="configAsociar == 2 && esEdicion == true"
                      >
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarEti"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedEti"
                            @keydown="preventEnter"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        row
                        wrap
                        v-if="configAsociar == 2 && esEdicion == true"
                      >
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefEtiquetas"
                              :rowData="etiquetasRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onRowSelectedE"
                              :onGridReady="onGridReadyEti"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridEti"
                              :isExternalFilterPresent="
                                isExternalFilterPresentEtiqueta
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassEtiqueta
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        wrap
                        v-if="configAsociar == 3 && esEdicion == true"
                      >
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarVehi"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedVehi"
                            @keydown="preventEnter"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        row
                        wrap
                        v-if="configAsociar == 3 && esEdicion == true"
                      >
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefVehiculos"
                              :rowData="vehiculosRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              @selection-changed="onRowSelectedV"
                              :onGridReady="onGridReadyVehi"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridVehi"
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

                      <v-layout
                        wrap
                        v-if="configAsociar == 1 && esEdicion == false"
                      >
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarFlota"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedFlotas"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        row
                        wrap
                        v-if="configAsociar == 1 && esEdicion == false"
                      >
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsFlotasD"
                              :rowData="flotasAsignados"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              :onGridReady="onGridReadyFlo"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridFlo"
                              :isExternalFilterPresent="
                                isExternalFilterPresentFlota
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassFlota
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        wrap
                        v-if="configAsociar == 2 && esEdicion == false"
                      >
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarEti"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedEti"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        row
                        wrap
                        v-if="configAsociar == 2 && esEdicion == false"
                      >
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefEtiquetasD"
                              :rowData="etiquetasAsignados"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              :onGridReady="onGridReadyEti"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridEti"
                              :isExternalFilterPresent="
                                isExternalFilterPresentEtiqueta
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassEtiqueta
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        wrap
                        v-if="configAsociar == 3 && esEdicion == false"
                      >
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarVehi"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedVehi"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout
                        row
                        wrap
                        v-if="configAsociar == 3 && esEdicion == false"
                      >
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefVehiculosD"
                              :rowData="vehiculosAsignados"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              :onGridReady="onGridReadyVehi"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridVehi"
                              :isExternalFilterPresent="
                                isExternalFilterPresentVehiculoD
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassVehiculoD
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
          </div>

          <div
            align="center"
            v-show="
              bottomNav == configuracionNotificaciones.step &&
                ((configuracionNotificaciones.visible && esEdicion) ||
                  (configuracionNotificacionesVerDetalle.visible && !esEdicion))
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
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Configurar Notificaciones</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <v-layout row wrap>
                        <v-flex xs12 sm6 md6>
                          <v-text-field
                            v-model="buscarUsu"
                            label="Buscar..."
                            @input="onFilterTextBoxChangedUsu"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap v-if="esEdicion == true">
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsUsu"
                              :rowData="usuariosRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              :onGridReady="onGridReady"
                              @selection-changed="onSelectionChanged($event)"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridUsu"
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
                      <v-layout row wrap v-if="esEdicion == false">
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="width: 100%; height: 350px;"
                              class="ag-theme-material"
                              :columnDefs="columnDefsUsuD"
                              :rowData="usuariosAsignados"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              suppressCopyRowsToClipboard="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :postProcessPopup="onClickCell"
                              :onGridReady="onGridReady"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              key="gridUsuD"
                              :isExternalFilterPresent="
                                isExternalFilterPresentUsuarioD
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassUsuarioD
                              "
                            ></ag-grid-vue>
                          </v-card>
                        </v-flex>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">
                              Notificar vía Correo Electrónico
                            </h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex md12></v-flex>
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            v-model="alertaMail.emailEnvio"
                            label="Correos Electrónicos"
                            v-validate="{
                              rules: {
                                regex: /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4};?)+$/,
                                max: 2000,
                              },
                            }"
                            :error-messages="
                              errors.collect('Correo Electrónico')
                            "
                            data-vv-name="Correo Electrónico"
                            type="text"
                            hint='Escriba los correos separados por "punto y coma"(;) sin espacios'
                            :counter="2000"
                            persistent-hint
                            :disabled="!esEdicion"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Alerta',
          nombreEntidad: editedItem.nombre,
        })
      "
      :mensaje="$t('mensajes.crud.editar.mensaje', { entidad: 'la Alerta' })"
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
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import HandleErrors from '@/config/handleErrors'; //
import Confirmation from '@/components/Confirmation.vue'; //
import { Component, Prop, Watch } from 'vue-property-decorator'; //
import { Funcionalidades } from '@/config/funcionalidades'; //
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm'; //
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper'; //
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import {
  AlertasInterface,
  VelocidadMaximaInterface,
  AlertaMailInterface,
} from '@/interfaces/Alertas';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import store from '@/store';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class AlertasModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean; //
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  alerta!: AlertasInterface; //
  @Prop({ default: false }) esEdicion!: boolean;

  //abstract
  readonly usuarioController: string = 'Usuario';
  readonly funcionalidad: Funcionalidades = Funcionalidades.Alertas; //
  readonly controllerVehiculo: string = 'vehiculo';
  readonly controllerFlota: string = 'flota';
  readonly controllerEtiqueta: string = 'VehiculoEtiqueta';
  permisosActuales: PermisoAccionVm[] = [];

  //Modales
  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Configurar Alerta',
    visible: true,
    step: 1,
    codigoSubAccion: 40,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarVehiculoFlota: PermisoAccionVm = {
    accion: 'Editar - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 2,
    codigoSubAccion: 41,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  configuracionNotificaciones: PermisoAccionVm = {
    accion: 'Editar - Configurar Notificaciones',
    visible: true,
    step: 3,
    codigoSubAccion: 42,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Configurar Alerta',
    visible: true,
    step: 1,
    codigoSubAccion: 40,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarVehiculoFlotaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 2,
    codigoSubAccion: 41,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  configuracionNotificacionesVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Configurar Notificaciones',
    visible: true,
    step: 3,
    codigoSubAccion: 42,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarVehiculoFlota,
    this.configuracionNotificaciones,
    this.informacionGeneralVerDetalle,
    this.asociarVehiculoFlotaVerDetalle,
    this.configuracionNotificacionesVerDetalle,
  ];

  //Variables globales
  $snotify: any; //
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  btnBloquear: boolean = false;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  loadingService = new LoadingService();
  usuarioId: number = store.state.userId;
  clienteId: number = config.getClienteSesion();
  bottomNav: any = '1';

  //Se importan la validacion para que en el input de nombre no existan emojis
  vr: ValidaRut = new ValidaRut();
  regexEmoji: any = this.vr.regexEmoji;

  //AXIOS
  axiosAlertas: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //grilla
  localeText: any = config.agGridTextos; //
  gridApi: GridApi; //
  columnApi: ColumnApi; //
  columnDefs: Array<ColDef> = []; //
  sideBar: any = config.agGridDefaultConfig; //

  mounted() {
    this.initialize(); //
    this.registrarValidadores();
  }

  initialize() {
    this.columnDefsFlotas = [
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
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código Flota',
        field: 'id',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
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
        headerName: 'Código Padre',
        field: 'padre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Padre',
        field: 'nombrePadre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
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
    ];

    this.columnDefEtiquetas = [
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
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        width: 950,
        minWidth: 950,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
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
    ];

    this.columnDefVehiculos = [
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
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
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
        headerName: 'Código Flota',
        field: 'flota',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Flota',
        field: 'flotaNombre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
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
    ];

    this.columnDefsFlotasD = [
      {
        headerName: 'Código Flota',
        field: 'id',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
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
        headerName: 'Código Padre',
        field: 'padre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Padre',
        field: 'nombrePadre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
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
    ];

    this.columnDefEtiquetasD = [
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        rowDrag: true,
        width: 1000,
        minWidth: 1000,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
        suppressMenu: true,
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

    this.columnDefVehiculosD = [
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
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
        headerName: 'Código Flota',
        field: 'flota',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Flota',
        field: 'flotaNombre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
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
    ];

    this.columnDefsUsu = [
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
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        resizable: true,
        sortable: true,
        width: 200,
        minWidth: 200,
        cellStyle: { textAlign: 'left' },
        suppressMovable: true,
        lockVisible: true,
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
        minWidth: 200,
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
        lockPinned: true,
        width: 200,
        minWidth: 200,
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
    ];

    this.columnDefsUsuD = [
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        width: 200,
        minWidth: 200,
        resizable: true,
        sortable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
        suppressMovable: true,
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
        minWidth: 200,
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
        lockPinned: true,
        width: 200,
        minWidth: 200,
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
    ];

    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        nombreAlerta: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        tipoAlerta: {
          required: () => config.errorMensajes.textoRequerido,
        },
        tipificacion: {
          required: () => config.errorMensajes.textoRequerido,
        },
        usuarios: {
          required: () => config.errorMensajes.textoRequerido,
        },
        'Correo Electrónico': {
          required: () => config.errorMensajes.textoRequerido,
          regex: () => '* Correo Electrónico inválido.',
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();
    Validator.extend('NombreUnicoEditar', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Alerta con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axiosAlertas.http
            .get(
              `AlertaConfiguracion/${self.alerta.id}/${clienteId}/${value}/ChequearNombreUnico`
            )
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : {
                        message: '* Ya existe una Alerta con este nombre.',
                      },
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

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value; //
    this.btnBloquear = false; //
    this.btnText = 'Continuar'; //
    this.btnClass = 'btn-continuar'; //
    this.bottomNav = '1';
    let self = this;
    this.setBotonNav();

    //this.editedItem.tipoAlerta = "Exceso de velocidad";
    this.tipificacion = '';
    this.alertaMail.emailEnvio = '';

    if (value) {
      this.loadingService.showLoading();
      await this.$validator.reset();

      await this.getVehiculosFlotasEtiquetas();
      await this.getUsuarios();

      // permisos
      this.chequearPermisosEditarDetalle();
      this.setBotonNav();

      await this.axiosAlertas.http
        .get<AlertasInterface>(
          `AlertaConfiguracion/${this.clienteId}/${this.alerta.id}`
        )
        .then(res => {
          this.editedItem = res.data;
          this.velocidadMaxima = res.data.alertaConfiguracionVelocidad;
          this.alertaMail = res.data.alertaConfiguracionEnvioEmail;
          this.tipoConfig = this.editedItem.tipoConfiguracion;
          this.estadoAlerta = this.editedItem.estado === 1 ? true : false;
          this.loadingService.hideLoading();
        })
        .catch(err => {
          this.loadingService.hideLoading();
          if (err.response !== undefined) {
            if (err.response.status !== 401) {
              this.handleErrors.showError(err);
            }
          } else {
            this.handleErrors.showError(err);
          }
        });

      this.configAsociar = 0;
      await this.cargaColor();
      await this.cargaVFE();
      this.configAsociar = 1;
      await this.cargaUsuarios();
    }
  }

  cargaUsuarios() {
    const self = this;
    for (
      let i = 0;
      i <= this.editedItem.alertaConfiguracionNotificacionUsuarioIds.length - 1;
      i++
    ) {
      var usuario = this.usuariosRespaldo.find(
        x =>
          x.id == this.editedItem.alertaConfiguracionNotificacionUsuarioIds[i]
      );
      if (usuario != null && usuario != undefined) {
        this.usuariosAsignados.push(usuario);
      }
    }
    this.usuariosRespaldo.forEach(usuario => {
      let exists: any = this.usuariosAsignados.filter(
        (x: any) => x.id === usuario.id
      );
      if (exists.length == 0) {
        usuario.checked = false;
      } else {
        usuario.checked = true;
      }
    });

    this.gridApi.forEachNode(function(node: any) {
      var index = self.usuariosAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApi.selectNode(node, true);
      }
    });
    this.initialize();
  }

  cargaColor() {
    switch (this.editedItem.color) {
      case 'Amarilla':
        this.tipificacion = 'Amarilla';
        break;
      case 'Roja':
        this.tipificacion = 'Roja';
        break;
      case 'Verde':
        this.tipificacion = 'Verde';
        break;
    }
  }

  async cargaVFE() {
    const self = this;

    if (self.esEdicion === true) {
      this.cargandoDatos = true;

      for (let i = 0; i <= self.editedItem.flotaIds.length - 1; i++) {
        var flota = self.flotasRespaldo.find(
          x => x.id == self.editedItem.flotaIds[i]
        );
        if (flota != null && flota != undefined) {
          self.flotasAsignados.push(flota);
        }
      }

      await this.cargaCheckedFlotas();

      await this.gridApiFlo.forEachNode(function(node: any) {
        var index = self.editedItem.flotaIds.findIndex(x => x == node.data.id);
        if (index !== -1) {
          node.setSelected(true);
          //self.gridApiFlo.selectNode(node, true);
        }
      });

      for (let i = 0; i <= self.editedItem.vehiculoIds.length - 1; i++) {
        var vehiculo = self.vehiculosRespaldo.find(
          x => x.id == self.editedItem.vehiculoIds[i]
        );
        if (vehiculo != null && vehiculo != undefined) {
          self.vehiculosAsignados.push(vehiculo);
        }
      }

      for (let i = 0; i <= self.editedItem.etiquetaIds.length - 1; i++) {
        var etiqueta = self.etiquetasRespaldo.find(
          x => x.id == self.editedItem.etiquetaIds[i]
        );
        if (etiqueta != null && etiqueta != undefined) {
          self.etiquetasAsignados.push(etiqueta);
        }
      }

      this.cargaCheckedVehiculos();
      this.cargaCheckedEtiquetas();
    } else {
      for (let i = 0; i <= self.editedItem.flotaIds.length - 1; i++) {
        flota = self.flotasRespaldo.find(
          x => x.id == self.editedItem.flotaIds[i]
        );
        if (flota != null && flota != undefined) {
          self.flotasAsignados.push(flota);
        }
      }

      for (let i = 0; i <= self.editedItem.vehiculoIds.length - 1; i++) {
        vehiculo = self.vehiculosRespaldo.find(
          x => x.id == self.editedItem.vehiculoIds[i]
        );
        if (vehiculo != null && vehiculo != undefined) {
          self.vehiculosAsignados.push(vehiculo);
        }
      }

      for (let i = 0; i <= self.editedItem.etiquetaIds.length - 1; i++) {
        etiqueta = self.etiquetasRespaldo.find(
          x => x.id == self.editedItem.etiquetaIds[i]
        );
        if (etiqueta != null && etiqueta != undefined) {
          self.etiquetasAsignados.push(etiqueta);
        }
      }
      self.flotasRespaldo = self.flotasAsignados;
      self.vehiculosRespaldo = self.vehiculosAsignados;
      self.etiquetasRespaldo = self.etiquetasAsignados;
    }
  }

  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.tipificacion = '';
    this.btnBloquear = false;
    this.$validator.reset();
    this.cont = 0;
    this.cargandoDatos = false;

    this.editedItem = {};
    this.velocidadMaxima = {};
    this.tipoConfig = 0;
    this.estadoAlerta = false;

    this.flotasAsignados = [];
    this.etiquetasAsignados = [];
    this.vehiculosAsignados = [];

    this.vehiculosRespaldo = [];
    this.flotasRespaldo = [];
    this.etiquetasRespaldo = [];

    this.radiosVF = 'rdbFlota';
    this.configAsociar = 1;
    this.buscarFlota = '';
    this.buscarVehi = '';
    this.buscarEti = '';

    if (this.gridApiFlo !== undefined) this.gridApiFlo.setQuickFilter('');
    if (this.gridApiVehi !== undefined) this.gridApiVehi.setQuickFilter('');
    if (this.gridApiEti !== undefined) this.gridApiEti.setQuickFilter('');

    this.usuariosRespaldo = [];
    this.usuariosAsignadosModel = [];
    this.usuariosAsignados = [];
    this.alertaMail = {};
    this.gridApiVehi = undefined;
    this.gridApiEti = undefined;
    this.buscarUsu = '';
    this.gridApi.setQuickFilter('');

    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
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

  //#region Informacion General
  velocidadMaxima: VelocidadMaximaInterface = {};
  editedItem: AlertasInterface = {};
  tipificacion: any = '';
  tiposAlertas: any[] = ['Exceso de velocidad'];
  estadoAlerta: boolean = true;
  selected: any[] = [];
  tipoAlerta: string = 'Exceso de velocidad';
  tipoConfig: number = 0;
  colores: any = [
    {
      title: 'Roja',
      icon: 'red',
    },
    {
      title: 'Amarilla',
      icon: 'yellow',
    },
    {
      title: 'Verde',
      icon: 'green',
    },
  ];

  //Funcion que trae los tipos de alertas
  async getTiposAlertas() {
    try {
      this.loadingService.showLoading();
      const response = await this.axiosAlertas.http.get('AlertaTipo');
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

  preventPunto(event: any) {
    if (event.key == '.') {
      if (
        this.editedItem.nombre == undefined ||
        this.editedItem.nombre.length == 0
      ) {
        event.preventDefault();
      }
    }
    if (event.type == 'paste') {
      if (
        this.editedItem.nombre == undefined ||
        this.editedItem.nombre.length == 0
      ) {
        event.preventDefault();
      }
    }
  }

  preventEnter(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  ////////////////////////////////
  //Exceso de Velocidad
  velocidadAdic: number[] = Array.from(
    { length: (240 - 10) / 10 + 1 },
    (_, i) => 10 + i * 10
  );
  tolerancia: number[] = Array.from(
    { length: (50 - 0) / 5 + 1 },
    (_, i) => 0 + i * 5
  );

  //#region

  //#region Relacionar Vehiculos, Flotas y etiquetas
  radiosVF: any = 'rdbFlota';
  configAsociar: number = 1;
  columnDefsFlotas: Array<ColDef> = [];
  columnDefEtiquetas: Array<ColDef> = [];
  columnDefVehiculos: Array<ColDef> = [];
  columnDefsFlotasD: Array<ColDef> = [];
  columnDefEtiquetasD: Array<ColDef> = [];
  columnDefVehiculosD: Array<ColDef> = [];
  flotasAsignados: IFlota[] = [];
  etiquetasAsignados: IEtiqueta[] = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  flotasRespaldo: IFlota[] = [];
  etiquetasRespaldo: IEtiqueta[] = [];
  vehiculosRespaldoBase: IVehiculo[] = [];
  vehiculosRespaldoTrasFiltro: IVehiculo[] = [];
  etiquetaRespaldoTrasFiltro: IEtiqueta[] = [];
  flotasRespaldoBase: IFlota[] = [];
  etiquetaRespaldoBase: IEtiqueta[] = [];
  flotaSeleccionadaPadre: IFlota[] = [];
  flotaIngresadaHija: IFlota[] = [];

  //Respaldos temporales
  vehiculosRespaldoTemporalF: IVehiculo[] = [];
  flotasRespaldoTemporal: IFlota[] = [];
  etiquetasRespaldoTemporalF: IEtiqueta[] = [];
  flotasRespaldoTemporalV: IFlota[] = [];
  etiquetasRespaldoTemporalV: IEtiqueta[] = [];
  vehiculosRespaldoTemporalE: IVehiculo[] = [];
  flotasRespaldoTemporalE: IFlota[] = [];

  todasFlotas: boolean = false;
  todasEtiquetas: boolean = false;
  todosVehiculos: boolean = false;

  axContextoReporte: AxiosVue = new AxiosVue(ServicioProxy.Reporte);
  readonly controllerReporte: string = 'Reporte';
  readonly controllerReporteGeoSitio: string = 'ReporteGeoSitio';

  gridApiFlo: GridApi;
  gridApiVehi: GridApi;
  gridApiEti: GridApi;
  columnApiFlo: ColumnApi;
  columnApiVehi: ColumnApi;
  columnApiEti: ColumnApi;
  buscarFlota: string = '';
  buscarVehi: string = '';
  buscarEti: string = '';
  cargandoDatos: boolean = true;
  cont: number = 0;

  selectedRB(e: any) {
    switch (e) {
      case 'rdbFlota':
        this.configAsociar = 1;
        break;
      case 'rdbEtiquetas':
        this.configAsociar = 2;
        break;
      case 'rdbVehiculos':
        this.configAsociar = 3;
        break;
    }
  }

  async onGridReadyFlo(params: any) {
    this.cargandoDatos = true;
    this.gridApiFlo = params.api;
    this.columnApiFlo = params.columnApi;
    const self = this;
    await this.cargaCheckedFlotas();
    this.gridApiFlo.forEachNode(function(node: any) {
      var index = self.flotasAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApiFlo.selectNode(node, true);
      }
    });
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 500);
  }

  async onGridReadyVehi(params: any) {
    this.cargandoDatos = true;
    this.gridApiVehi = params.api;
    this.columnApiVehi = params.columnApi;
    this.cargaCheckedVehiculos();
    const self = this;
    this.gridApiVehi.forEachNode(function(node: any) {
      var index = self.vehiculosAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApiVehi.selectNode(node, true);
      }
    });
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 500);
  }

  async onGridReadyEti(params: any) {
    this.cargandoDatos = true;
    this.gridApiEti = params.api;
    this.columnApiEti = params.columnApi;
    const self = this;
    await this.cargaCheckedEtiquetas();
    this.gridApiEti.forEachNode(function(node: any) {
      var index = self.etiquetasAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApiEti.selectNode(node, true);
      }
    });
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 500);
  }

  onFilterTextBoxChangedFlotas() {
    this.gridApiFlo.onFilterChanged();
    /*if (this.buscarFlota.length > 1) {
      this.gridApiFlo.setQuickFilter(this.buscarFlota);
    } else {
      this.gridApiFlo.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedVehi() {
    this.gridApiVehi.onFilterChanged();
    /*if (this.buscarVehi.length > 1) {
      this.gridApiVehi.setQuickFilter(this.buscarVehi);
    } else {
      this.gridApiVehi.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedEti() {
    this.gridApiEti.onFilterChanged();
    /*if (this.buscarEti.length > 1) {
      this.gridApiEti.setQuickFilter(this.buscarEti);
    } else {
      this.gridApiEti.setQuickFilter('');
    }*/
  }

  onRowSelectedF() {
    if (this.cargandoDatos == false) {
      this.btnBloquear = false;
      this.flotasAsignados = this.gridApiFlo.getSelectedRows();
      if (this.flotasAsignados.length > 0) {
        //Se filtra el listado de vehiculos por flota seleccionada
        let respaldo = this.vehiculosRespaldo;
        if (this.etiquetasAsignados.length == 0) {
          respaldo = this.vehiculosRespaldoBase;
        } else if (
          this.etiquetasAsignados.length > 0 &&
          this.flotasAsignados.length > 1
        ) {
          respaldo = this.vehiculosRespaldoTemporalE;
        }
        this.vehiculosRespaldo = [];
        this.flotaSeleccionadaPadre = [];
        this.flotaIngresadaHija = [];
        //Se filtran los vehiculos de las subflotas seleccionadas
        for (let i = 0; i <= this.flotasAsignados.length - 1; i++) {
          var flotaseleccionada = this.flotasRespaldo.find(
            x => x.id == this.flotasAsignados[i].id
          );
          if (flotaseleccionada != undefined) {
            if (flotaseleccionada.padre != null) {
              let vehiculosAIngresar = respaldo.filter(
                x => x.flota == flotaseleccionada.id
              );
              for (let i = 0; i <= vehiculosAIngresar.length - 1; i++) {
                var index = this.vehiculosRespaldo.findIndex(
                  x => x.id == vehiculosAIngresar[i].id
                );
                if (index === -1) {
                  this.vehiculosRespaldo.push(vehiculosAIngresar[i]);
                }
              }
              this.flotaIngresadaHija.push(flotaseleccionada);
            } else {
              this.flotaSeleccionadaPadre.push(flotaseleccionada);
            }
          }
        }
        //Se filtran los vehiculos de las flotas padre seleccioandas
        for (let i = 0; i <= this.flotaSeleccionadaPadre.length - 1; i++) {
          var hijasIngresadas = this.flotaIngresadaHija.filter(
            x => x.padre == this.flotaSeleccionadaPadre[i].id
          );
          let vehiculosAIngresar = respaldo.filter(
            x => x.flota == this.flotaSeleccionadaPadre[i].id
          );
          for (let i = 0; i <= vehiculosAIngresar.length - 1; i++) {
            var inde = this.vehiculosRespaldo.findIndex(
              x => x.id == vehiculosAIngresar[i].id
            );
            if (inde === -1) {
              this.vehiculosRespaldo.push(vehiculosAIngresar[i]);
            }
          }
          if (hijasIngresadas.length == 0) {
            let flotasHijas = this.flotasRespaldo.filter(
              x => x.padre == this.flotaSeleccionadaPadre[i].id
            );
            flotasHijas.forEach((f: any) => {
              this.vehiculosRespaldo.push(
                ...respaldo.filter(x => x.flota == f.id)
              );
            });
          }
        }

        //filtraran las etiquetas segun las flotas seleccionadas
        let respaldoEtiqueta = this.etiquetasRespaldo;
        if (this.vehiculosAsignados.length == 0) {
          respaldoEtiqueta = this.etiquetaRespaldoBase;
        } else if (
          this.vehiculosAsignados.length > 0 &&
          this.flotasRespaldo.length > 1
        ) {
          respaldoEtiqueta = this.etiquetasRespaldoTemporalV;
        }

        this.etiquetasRespaldo = [];
        for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
          let etiquetasVehiculo = this.vehiculosRespaldo[i].etiquetas;
          for (let y = 0; y <= etiquetasVehiculo.length - 1; y++) {
            let etiquetasAingresar = respaldoEtiqueta.find(
              x => x.id == etiquetasVehiculo[y]
            );
            if (etiquetasAingresar != undefined) {
              var en = this.etiquetasRespaldo.findIndex(
                x => x.id == etiquetasAingresar.id
              );
              if (en === -1) {
                this.etiquetasRespaldo.push(etiquetasAingresar);
              }
            }
          }
        }
        this.vehiculosRespaldoTrasFiltro = this.vehiculosRespaldo;
        this.etiquetaRespaldoTrasFiltro = this.etiquetasRespaldo;
        //Si existia un vehiculo seleccionado de una flota y esta es desmarcada se eliminara el vehiculo de los asignados
        if (this.vehiculosAsignados.length > 0) {
          for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
            var ind = this.vehiculosRespaldo.findIndex(
              x => x.id == this.vehiculosAsignados[i].id
            );
            if (ind === -1) {
              this.vehiculosAsignados.splice(i, 1);
            }
          }
        }
        this.vehiculosRespaldoTemporalF = this.vehiculosRespaldo;
        this.etiquetasRespaldoTemporalF = this.etiquetasRespaldo;
      } else if (this.flotasAsignados.length === 0) {
        if (this.vehiculosAsignados.length == 0) {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
        } else {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
          this.onRowSelectedV();
        }

        if (this.etiquetasAsignados.length == 0) {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
        } else {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
          this.onRowSelectedE();
        }
      }
      this.cargaCheckedFlotas();
    }
  }

  onRowSelectedE() {
    if (this.cargandoDatos == false) {
      this.btnBloquear = false;
      if (this.gridApiEti != undefined) {
        this.etiquetasAsignados = this.gridApiEti.getSelectedRows();
      }
      if (this.etiquetasAsignados.length > this.etiquetasRespaldo.length) {
        this.etiquetasAsignados = this.etiquetasRespaldo;
      }
      if (this.etiquetasAsignados.length > 0) {
        // Se filtra el listado de vehiculos por etiqueta seleccionada
        let respaldo = this.vehiculosRespaldo;
        if (this.flotasAsignados.length == 0) {
          respaldo = this.vehiculosRespaldoBase;
        } else if (
          this.flotasAsignados.length > 0 &&
          this.etiquetasAsignados.length > 1
        ) {
          respaldo = this.vehiculosRespaldoTemporalF;
        }

        this.vehiculosRespaldo = [];
        for (let i = 0; i <= this.etiquetasAsignados.length - 1; i++) {
          let vehiculosAIngresar = respaldo.filter(x =>
            x.etiquetas.includes(this.etiquetasAsignados[i].id)
          );
          for (let i = 0; i <= vehiculosAIngresar.length - 1; i++) {
            var index = this.vehiculosRespaldo.findIndex(
              x => x.id == vehiculosAIngresar[i].id
            );
            if (index === -1) {
              this.vehiculosRespaldo.push(vehiculosAIngresar[i]);
            }
          }
        }
        //Se filtran las flotas por etiqueta seleccionada
        let respaldoFlotas = this.flotasRespaldo;
        if (this.vehiculosAsignados.length == 0) {
          respaldoFlotas = this.flotasRespaldoBase;
        } else if (
          this.vehiculosAsignados.length > 0 &&
          this.etiquetasAsignados.length > 1
        ) {
          respaldoFlotas = this.flotasRespaldoTemporalV;
        }
        this.flotasRespaldo = [];
        for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
          //let vehiculoSeleccionado = this.vehiculosRespaldo.find(x => x.id == this.vehiculosRespaldo[i].id);
          let flota = respaldoFlotas.find(
            x => x.id == this.vehiculosRespaldo[i].flota
          );
          if (flota != undefined) {
            var inde = this.flotasRespaldo.findIndex(x => x.id == flota.id);
            if (inde === -1) {
              this.flotasRespaldo.push(flota);
            }
          }
        }
        this.vehiculosRespaldoTemporalE = this.vehiculosRespaldo;
        this.flotasRespaldoTemporalE = this.flotasRespaldo;
      } else if (this.etiquetasAsignados.length === 0) {
        if (this.flotasAsignados.length == 0) {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
        } else {
          this.flotasRespaldo = this.flotasRespaldoBase;
          this.onRowSelectedF();
        }

        if (this.vehiculosAsignados.length == 0) {
          this.flotasRespaldo = this.flotasRespaldoBase;
        } else {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
          this.onRowSelectedV();
        }
      }
      this.cargaCheckedEtiquetas();
    }
  }

  onRowSelectedV() {
    if (this.cargandoDatos == false) {
      this.btnBloquear = false;
      if (this.gridApiVehi != undefined) {
        this.vehiculosAsignados = this.gridApiVehi.getSelectedRows();
      }
      if (this.vehiculosAsignados.length > 0) {
        let respaldo = this.flotasRespaldo;
        if (this.etiquetasAsignados.length == 0) {
          respaldo = this.flotasRespaldoBase;
        } else if (
          this.etiquetasAsignados.length > 0 &&
          this.vehiculosAsignados.length > 1
        ) {
          respaldo = this.flotasRespaldoTemporalE;
        }

        let respaldoEtiqueta = this.etiquetasRespaldo;
        if (this.flotasAsignados.length == 0) {
          respaldoEtiqueta = this.etiquetaRespaldoBase;
        } else if (
          this.flotasAsignados.length > 0 &&
          this.vehiculosAsignados.length > 1
        ) {
          respaldoEtiqueta = this.etiquetasRespaldoTemporalF;
        }

        this.flotasRespaldo = [];
        this.etiquetasRespaldo = [];
        for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
          //Se filtran las flotas por los vehiculos seleccionadas
          let vehiculoSeleccionado = this.vehiculosRespaldo.find(
            x => x.id == this.vehiculosAsignados[i].id
          );
          if (vehiculoSeleccionado != undefined) {
            let flota = respaldo.find(x => x.id == vehiculoSeleccionado.flota);
            if (flota != undefined) {
              var index = this.flotasRespaldo.findIndex(x => x.id == flota.id);
              if (index === -1) {
                this.flotasRespaldo.push(flota);
              }
            }
          }
          //filtraran las etiquetas segun los vehiculos seleccionados
          let etiquetasVehiculo = this.vehiculosAsignados[i].etiquetas;
          for (let y = 0; y <= etiquetasVehiculo.length - 1; y++) {
            let etiquetasAingresar = respaldoEtiqueta.find(
              x => x.id == etiquetasVehiculo[y]
            );
            if (etiquetasAingresar != undefined) {
              var en = this.etiquetasRespaldo.findIndex(
                x => x.id == etiquetasAingresar.id
              );
              if (en === -1) {
                this.etiquetasRespaldo.push(etiquetasAingresar);
              }
            }
          }
        }
        this.etiquetasRespaldoTemporalV = this.etiquetasRespaldo;
        this.flotasRespaldoTemporalV = this.flotasRespaldo;
      } else if (this.vehiculosAsignados.length === 0) {
        if (this.etiquetasAsignados.length == 0) {
          this.flotasRespaldo = this.flotasRespaldoBase;
        } else {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
          this.onRowSelectedE();
        }

        if (this.flotasAsignados.length == 0) {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
        } else {
          this.flotasRespaldo = this.flotasRespaldoBase;
          this.onRowSelectedF();
        }
      }
      this.cargaCheckedVehiculos();
    }
  }

  async cargaCheckedFlotas() {
    await this.flotasRespaldo.forEach(flota => {
      let exists: any = this.flotasAsignados.filter(
        (x: any) => x.id === flota.id
      );
      if (exists.length == 0) {
        flota.checked = false;
      } else {
        flota.checked = true;
      }
    });

    if (this.gridApiFlo != undefined) {
      this.gridApiFlo.refreshCells({ force: true });
    }
  }

  async cargaCheckedVehiculos() {
    await this.vehiculosRespaldo.forEach(vehiculo => {
      let exists: any = this.vehiculosAsignados.filter(
        (x: any) => x.id === vehiculo.id
      );
      if (exists.length == 0) {
        vehiculo.checked = false;
      } else {
        vehiculo.checked = true;
      }
    });

    if (this.gridApiVehi != undefined) {
      this.gridApiVehi.refreshCells({ force: true });
    }
  }

  async cargaCheckedEtiquetas() {
    await this.etiquetasRespaldo.forEach(etiqueta => {
      let exists: any = this.etiquetasAsignados.filter(
        (x: any) => x.id === etiqueta.id
      );
      if (exists.length == 0) {
        etiqueta.checked = false;
      } else {
        etiqueta.checked = true;
      }
    });

    if (this.gridApiEti != undefined) {
      this.gridApiEti.refreshCells({ force: true });
    }
  }

  async getVehiculosFlotasEtiquetas() {
    try {
      const response = await this.axContextoReporte.http.get(
        `${this.controllerReporte}/${this.usuarioId}/${this.clienteId}`
      );
      this.vehiculosRespaldo = response.data.vehiculos;
      this.flotasRespaldo = response.data.flotas;
      this.etiquetasRespaldo = response.data.etiquetas;
      this.vehiculosRespaldoBase = response.data.vehiculos;
      this.flotasRespaldoBase = response.data.flotas;
      this.etiquetaRespaldoBase = response.data.etiquetas;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  //#region

  //#region Notificar
  search: string = '';
  columnDefsUsu: Array<ColDef> = [];
  columnDefsUsuD: Array<ColDef> = [];
  usuariosAsignados: UsuariosInterface[] = [];
  usuariosRespaldo: UsuariosInterface[] = [];
  usuariosAsignadosModel: any[] = [];
  alertaMail: AlertaMailInterface = {};
  buscarUsu: string = '';

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onFilterTextBoxChangedUsu() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarUsu.length > 1) {
      this.gridApi.setQuickFilter(this.buscarUsu);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }

  async getUsuarios() {
    try {
      /*const response = await this.axiosAlertas.http.get(
        `Usuarios/${this.usuarioId}/${this.clienteId}`
      );*/
      const response = await this.axios.http.get(
        `Usuario/${this.usuarioId}/${this.clienteId}/getUsuariosAuditoria`
      );
      this.usuariosRespaldo = response.data;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }

  onSelectionChanged() {
    this.usuariosAsignados = this.gridApi.getSelectedRows();
  }

  nombreCompleto(user: any): string {
    return (
      (user.nombre != undefined ? user.nombre : '') +
      ' ' +
      (user.apellidoPaterno != undefined ? user.apellidoPaterno : '') +
      ' ' +
      (user.apellidoMaterno != undefined ? user.apellidoMaterno : '')
    );
  }

  //#region

  //#region Generacion de Alerta
  async grabarEdicion() {
    const responseValidacion: boolean = await this.$validator.validateAll();

    if (responseValidacion) {
      if (
        this.flotasAsignados.length == 0 &&
        this.etiquetasAsignados.length == 0 &&
        this.vehiculosAsignados.length == 0
      ) {
        this.$snotify.error(
          'Debe asociar al menos una Flota, Etiqueta o Vehículo'
        );
      } else if (
        this.usuariosAsignados.length == 0 &&
        this.alertaMail.emailEnvio.length == 0
      ) {
        this.$snotify.error(
          'Debe seleccionar al menos un destinatario a notificar.'
        );
      } else {
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      try {
        this.loadingService.showLoading();
        let he = new HandleErrors();
        this.btnBloquear = true;

        this.editedItem.color = this.tipificacion;

        if (
          this.editedItem.temporalidad == undefined ||
          this.editedItem.temporalidad == null ||
          this.editedItem.temporalidad.toString() == ''
        ) {
          this.editedItem.temporalidad = 0;
        }
        if (
          this.editedItem.cantidadEventos == undefined ||
          this.editedItem.cantidadEventos == null ||
          this.editedItem.cantidadEventos.toString() == ''
        ) {
          this.editedItem.cantidadEventos = 0;
        }
        if (
          this.editedItem.temporalidad == 0 ||
          this.editedItem.cantidadEventos == 0
        ) {
          this.tipoConfig = 1;
        } else {
          this.tipoConfig = 0;
        }

        let model = {
          id: this.editedItem.id,
          nombre: this.editedItem.nombre,
          color: this.editedItem.color,
          cantidadEventos: this.editedItem.cantidadEventos,
          temporalidad: this.editedItem.temporalidad,
          tipoConfiguracion: this.tipoConfig,
          estado: this.estadoAlerta === true ? 1 : 0,
          clienteId: this.clienteId,
          alertaTipoId: 1, //VelocidadMaxima Unica
        };

        let cont: boolean = true;
        await this.axiosAlertas.http
          .put('AlertaConfiguracion', model)
          .then(res => {
            this.editedItem.id = res.data.id;

            this.$snotify.success(
              this.$t('mensajes.mensajesExito.editar', {
                entidad: 'La Alerta',
                creadoA: 'editada',
              })
            );
          })
          .catch(error => {
            //he.showError(error);
            if (error.response !== undefined) {
              if (error.response.status !== 401) {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.editar', {
                    entidad: 'la Alerta',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.editar', {
                  entidad: 'el Alerta',
                })
              );
            }
            cont = false;
          });

        if (cont) {
          await this.grabarUsuarios();
          await this.grabarEmails();
          await this.grabarEFVZ();
          await this.grabarVelocidadMaxima();
          this.closeModal(false);
          this.dialogConfirmacion = false;
        }
      } catch (error) {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.editar', { entidad: 'la Alerta' })
            );
          }
        } else {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.editar', { entidad: 'el Alerta' })
          );
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
    this.btnBloquear = false;
  }

  async grabarUsuarios() {
    let idsUsuarios: number[] = [];

    for (let i = 0; i <= this.usuariosAsignados.length - 1; i++) {
      idsUsuarios.push(this.usuariosAsignados[i].id);
    }

    let modelUsuarios = {
      alertaConfiguracionId: this.editedItem.id,
      usuarioIds: idsUsuarios,
    };
    await this.axiosAlertas.http.put(
      'AlertaConfiguracionNotificacionUsuario',
      modelUsuarios
    );
  }

  async grabarEmails() {
    let modelEmail = {
      id: 0,
      alertaConfiguracionId: this.editedItem.id,
      emailEnvio: this.alertaMail.emailEnvio,
    };
    await this.axiosAlertas.http.put(
      'AlertaConfiguracionEnvioEmail',
      modelEmail
    );
  }

  async grabarVelocidadMaxima() {
    let modelVelocidad = {
      id: 0,
      velocidadMaxima: this.velocidadMaxima.velocidadMaxima,
      tolerancia: this.velocidadMaxima.tolerancia,
      alertaConfiguracionId: this.editedItem.id,
    };
    await this.axiosAlertas.http.put(
      'AlertaConfiguracionVelocidad',
      modelVelocidad
    );
  }

  async grabarEFVZ() {
    let idsFlotas: number[] = [];
    let idsVehiculos: number[] = [];
    let idsEtiquetas: number[] = [];
    let idsZonas: number[] = [];

    for (let i = 0; i <= this.flotasAsignados.length - 1; i++) {
      idsFlotas.push(this.flotasAsignados[i].id);
    }
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      idsVehiculos.push(this.vehiculosAsignados[i].id);
    }
    for (let i = 0; i <= this.etiquetasAsignados.length - 1; i++) {
      idsEtiquetas.push(this.etiquetasAsignados[i].id);
    }

    let modelTrasnportes = {
      alertaConfiguracionId: this.editedItem.id,
      etiquetaIds: idsEtiquetas,
      flotaIds: idsFlotas,
      vehiculoIds: idsVehiculos,
      zonaIds: idsZonas,
    };
    await this.axiosAlertas.http.put('AlertaEfvz', modelTrasnportes);
  }

  //#region

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentFlota(): boolean {
    return true;
  }

  doesExternalFilterPassFlota(node: RowNode): boolean {
    if (this.flotasRespaldo.length > 0 && this.buscarFlota.length > 1) {
      let busqueda = this.buscarFlota.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.nombrePadre.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentEtiqueta(): boolean {
    return true;
  }

  doesExternalFilterPassEtiqueta(node: RowNode): boolean {
    if (this.etiquetasRespaldo.length > 0 && this.buscarEti.length > 1) {
      let busqueda = this.buscarEti.toLowerCase();
      return (
        this.etiquetasRespaldo.some((x: any) =>
          //node.data.id.includes(busqueda) ||
          node.data.nombre.toLowerCase().includes(busqueda)
        ) === true
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehi.length > 1) {
      let busqueda = this.buscarVehi.toLowerCase();
      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.flotaNombre.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentVehiculoD(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculoD(node: RowNode): boolean {
    if (this.vehiculosAsignados.length > 0 && this.buscarVehi.length > 1) {
      let busqueda = this.buscarVehi.toLowerCase();
      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.flotaNombre.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentUsuario(): boolean {
    return true;
  }

  doesExternalFilterPassUsuario(node: RowNode): boolean {
    if (this.usuariosRespaldo.length > 0 && this.buscarUsu.length > 1) {
      let busqueda = this.buscarUsu.toLowerCase();
      return (
        node.data.nombreCompleto.toLowerCase().includes(busqueda) ||
        node.data.email.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentUsuarioD(): boolean {
    return true;
  }

  doesExternalFilterPassUsuarioD(node: RowNode): boolean {
    if (this.usuariosAsignados.length > 0 && this.buscarUsu.length > 1) {
      let busqueda = this.buscarUsu.toLowerCase();
      return (
        node.data.nombreCompleto.toLowerCase().includes(busqueda) ||
        node.data.email.toLowerCase().includes(busqueda) ||
        node.data.direccion.toLowerCase().includes(busqueda)
      );
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
html {
  overflow-y: hidden;
}
</style>

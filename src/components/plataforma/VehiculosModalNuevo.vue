0<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivV">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Vehículo</v-toolbar-title>

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
              v-show="asociarEtiqueta.visible"
              :complete="e1 > asociarEtiqueta.step"
              :step="asociarEtiqueta.step"
              >Asociar Etiquetas</v-stepper-step
            >
            <v-divider v-show="asociarEtiqueta.visible"></v-divider>
            <v-stepper-step
              v-show="asociarGPS.visible"
              :complete="e1 > asociarGPS.step"
              :step="asociarGPS.step"
              >Asociar GPS</v-stepper-step
            >
            <v-divider v-if="asociarGPS.visible"></v-divider>
            <v-stepper-step
              v-show="asociarGeocerca.visible"
              :complete="e1 > asociarGeocerca.step"
              :step="asociarGeocerca.step"
              >Asociar Geocercas</v-stepper-step
            >
            <v-divider v-if="asociarGeocerca.visible"></v-divider>
            <v-stepper-step
              v-show="asociarConductor.visible"
              :complete="e1 > asociarConductor.step"
              :step="asociarConductor.step"
              >Asociar Conductor</v-stepper-step
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
                          <v-flex xs4 sm4 md4></v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              v-model="editedItem.patente"
                              label="Patente"
                              v-validate="{
                                rules: {
                                  required: editedItem.vin ? false : true,
                                  max: 6,
                                  patenteUnica: true,
                                  min: 5,
                                  regex: '[A-Z0-9]+',
                                },
                              }"
                              :counter="6"
                              :change="patenteInput()"
                              placeholder="EJ: AAZZ00"
                              :error-messages="errors.collect('patente')"
                              data-vv-name="patente"
                              type="text"
                              required
                              @keypress="
                                $event.keyCode < 48 ||
                                ($event.keyCode > 57 && $event.keyCode < 65) ||
                                ($event.keyCode > 90 && $event.keyCode < 97) ||
                                $event.keyCode > 122
                                  ? $event.preventDefault()
                                  : false
                              "
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs4 sm4 md4>
                            <v-text-field
                              v-model="editedItem.vin"
                              label="VIN"
                              v-validate="{
                                rules: {
                                  required: editedItem.patente ? false : true,
                                  max: 20,
                                  vinUnico: true,
                                },
                              }"
                              :counter="20"
                              :error-messages="errors.collect('vin')"
                              data-vv-name="vin"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.unidad"
                              label="Unidad"
                              v-validate="'max:20'"
                              :counter="20"
                              :error-messages="errors.collect('unidad')"
                              data-vv-name="unidad"
                              type="text"
                              :disabled="true"
                              v-if="false"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-autocomplete
                              :items="Flotas"
                              v-model="editedItem.vehiculoFlotaId"
                              label="Asociar a Flota"
                              item-value="id"
                              item-text="nombre"
                              v-validate="'required'"
                              :error-messages="errors.collect('flota')"
                              data-vv-name="flota"
                              @change="selectedFlotaId"
                              autocomplete
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-autocomplete
                              :items="estado"
                              v-model="editedItem.estado"
                              label="Estado"
                              item-value="id"
                              item-text="nombre"
                              v-validate="'required'"
                              :error-messages="errors.collect('estado')"
                              data-vv-name="estado"
                              required
                              no-data-text="Sin resultados"
                              @change="selectedEstado"
                              persistent-hint
                              :hint="warningInactivo"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              v-model="editedItem.referencia"
                              label="Referencia"
                              v-validate="'max:20'"
                              :counter="20"
                              :error-messages="errors.collect('referencia')"
                              data-vv-name="referencia"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs5 sm5 md5>
                            <v-autocomplete
                              :items="VehiculoTipo"
                              v-model="editedItem.vehiculoTipoId"
                              label="Tipo Vehículo"
                              item-value="id"
                              item-text="nombre"
                              v-validate
                              :error-messages="errors.collect('vehiculoTipo')"
                              data-vv-name="vehiculoTipo"
                              @change="selectedTipoVehiculoId"
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs5 sm5 md5>
                            <v-autocomplete
                              :items="TipoPeaje"
                              v-model="editedItem.vehiculoTipoPeajeId"
                              label="Tipo Peaje"
                              item-value="id"
                              item-text="descripcion"
                              v-validate
                              :error-messages="errors.collect('tipopeaje')"
                              data-vv-name="tipopeaje"
                              @change="selectedTipoPeajeId"
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs2 sm2 md2>
                            <v-checkbox
                              v-model="editedItem.poseeTag"
                              label="TAG"
                            ></v-checkbox>
                          </v-flex>
                          <v-flex xs3 sm3 md3>
                            <v-autocomplete
                              :items="Marca"
                              v-model="vehiculoMarcaId"
                              label="Marca"
                              item-value="id"
                              item-text="nombre"
                              v-validate
                              :error-messages="errors.collect('marca')"
                              data-vv-name="marca"
                              @change="obtenerModelos"
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs5 sm5 md5>
                            <v-autocomplete
                              :items="Modelo"
                              v-model="editedItem.vehiculoModeloId"
                              label="Modelo"
                              item-value="id"
                              item-text="nombre"
                              v-validate
                              :error-messages="errors.collect('modelo')"
                              data-vv-name="modelo"
                              @change="establecerAnoModelo"
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs2 sm2 md2>
                            <v-text-field
                              v-model="editedItem.ano"
                              label="Año"
                              maxlength="4"
                              v-validate="'numeric|anioMaximo'"
                              :error-messages="errors.collect('ano')"
                              data-vv-name="ano"
                              type="text"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs2 sm2 md2>
                            <v-text-field
                              v-model="editedItem.color"
                              label="Color"
                              v-validate="'max:20'"
                              :counter="20"
                              :error-messages="errors.collect('color')"
                              data-vv-name="color"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md4>
                            <v-autocomplete
                              :items="TipoTransmision"
                              v-model="editedItem.vehiculoTipoTransmisionId"
                              label="Tipo Transmisión"
                              item-value="id"
                              item-text="nombre"
                              v-validate
                              :error-messages="
                                errors.collect('tipotransmision')
                              "
                              data-vv-name="tipotransmision"
                              @change="selectedTipoTransmisionId"
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs6 sm6 md4>
                            <v-text-field
                              label="Valor de RPM"
                              v-model="editedItem.valorRPM"
                              v-validate="'numeric|min_value:0|max_value:99999'"
                              :error-messages="errors.collect('valorRPM')"
                              data-vv-name="valorRPM"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs6 sm6 md4>
                            <v-text-field
                              label="Horas Disponible"
                              v-model="editedItem.horasDisponible"
                              v-validate="'numeric|min_value:0|max_value:24'"
                              :error-messages="
                                errors.collect('horasDisponible')
                              "
                              data-vv-name="horasDisponible"
                              required
                            ></v-text-field>
                          </v-flex>
                          <!-- <v-flex xs12 sm12 md12>
                                                                          <v-autocomplete
                                                                              :items="TipoCombustible"
                                                                              v-model="editedItem.vehiculoTipoCombustibleId"
                                                                              label="Tipo Combustible"
                                                                              item-value="id"
                                                                              item-text="nombre"
                                                                              v-validate="'required'"
                                                                              :error-messages="errors.collect('tipocombustible')"
                                                                              data-vv-name="tipocombustible"
                                                                              @change="selectedTipoCombustibleId"
                                                                              required
                                                                              no-data-text="Sin resultados"
                                                                              ></v-autocomplete>
                          </v-flex>-->
                          <v-flex xs6 sm6 md6>
                            <!-- <v-text-field
                                                                            v-model="editedItem.numeroChasis"
                                                                            label="Número de chasis"
                                                                            v-validate="'max:20'"
                                                                            :counter="20"
                                                                            :error-messages="errors.collect('numerodechasis')"
                                                                            data-vv-name="numerodechasis"
                                                                            type="text"
                            required></v-text-field>-->
                            <v-autocomplete
                              :items="TipoCombustible"
                              v-model="editedItem.vehiculoTipoCombustibleId"
                              label="Tipo Combustible"
                              item-value="id"
                              item-text="nombre"
                              v-validate
                              :error-messages="
                                errors.collect('tipocombustible')
                              "
                              data-vv-name="tipocombustible"
                              @change="selectedTipoCombustibleId"
                              required
                              no-data-text="Sin resultados"
                            ></v-autocomplete>
                          </v-flex>
                          <v-flex xs6 sm6 md6>
                            <v-text-field
                              v-model="editedItem.numeroMotor"
                              label="Número de Motor"
                              v-validate="'max:20'"
                              :counter="20"
                              :error-messages="errors.collect('numerodemotor')"
                              data-vv-name="numerodemotor"
                              type="text"
                              required
                            ></v-text-field>
                          </v-flex>
                          <!--<v-flex xs12 sm12 md12>
                                                      <v-autocomplete
                                                        :items="Flotas"
                                                        v-model="editedItem.vehiculoFlotaId"
                                                        label="Asociar a Flota"
                                                        item-value="id"
                                                        item-text="nombre"
                                                        v-validate="'required'"
                                                        :error-messages="errors.collect('flota')"
                                                        data-vv-name="flota"
                                                        @change="selectedFlotaId"
                                                        autocomplete
                                                        required
                                                        no-data-text="Sin resultados"
                                                      ></v-autocomplete>
                                                    </v-flex>
                                                    <v-flex xs12 sm12 md12>
                                                      <v-autocomplete
                                                        :items="estado"
                                                        v-model="editedItem.estado"
                                                        label="Estado"
                                                        item-value="id"
                                                        item-text="nombre"
                                                        v-validate="'required'"
                                                        :error-messages="errors.collect('estado')"
                                                        data-vv-name="estado"
                                                        required
                                                        no-data-text="Sin resultados"
                                                      ></v-autocomplete>
                          </v-flex>-->
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarEtiqueta.visible"
              :step="asociarEtiqueta.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Etiquetas</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarEtiquetas"
                            @input="onFilterTextBoxChangedEtiquetas"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="
                                width: 100%;
                                height: 350px;
                                font-family: 'Asap', sans-serif;
                              "
                              class="ag-theme-material"
                              :columnDefs="columnDefsEtiqueta"
                              :rowData="etiquetaRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReadyEtiquetas"
                              :postProcessPopup="onClickCell"
                              suppressCopyRowsToClipboard="true"
                              @selection-changed="onSelectedChangeEtiquetas"
                              :getRowNodeId="getRowNodeIdEtiqueta"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
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
                    </v-container>
                  </v-card>
                </v-flex>
              </div>
            </v-stepper-content>
            <v-stepper-content
              v-show="asociarGPS.visible"
              :step="asociarGPS.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar GPS</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-alert
                        :value="showMessage"
                        color="primary"
                        icon="priority_high"
                        outline
                      >
                        Cualquier modificación que realice en los GPSs afectará
                        a las Geocercas asociadas
                      </v-alert>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarGps"
                            @input="onFilterTextBoxChangedGps"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="
                                width: 100%;
                                height: 350px;
                                font-family: 'Asap', sans-serif;
                              "
                              class="ag-theme-material"
                              :columnDefs="columnDefsGPS"
                              :rowData="gpsRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReadyGps"
                              :postProcessPopup="onClickCell"
                              suppressCopyRowsToClipboard="true"
                              @selection-changed="onSelectedChangeGps"
                              :getRowNodeId="getRowNodeIdGps"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentGps
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassGps
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
              v-show="asociarGeocerca.visible"
              :step="asociarGeocerca.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Geocercas</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarGeocerca"
                            @input="onFilterTextBoxChangedGeocerca"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="
                                width: 100%;
                                height: 350px;
                                font-family: 'Asap', sans-serif;
                              "
                              class="ag-theme-material"
                              :columnDefs="columnDefsGeocerca"
                              :rowData="geocercaRespaldo"
                              rowSelection="multiple"
                              rowMultiSelectWithClick="false"
                              pagination="true"
                              paginationPageSize="10"
                              suppressRowClickSelection="true"
                              :sideBar="sideBar"
                              :localeText="localeText"
                              :onGridReady="onGridReadyGeo"
                              :postProcessPopup="onClickCell"
                              suppressCopyRowsToClipboard="true"
                              @selection-changed="
                                onSelectedChangeGeocerca($event)
                              "
                              @row-selected="onRowSelectedGeocerca($event)"
                              :getRowNodeId="getRowNodeIdGeocerca"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentGeocerca
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassGeocerca
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
              v-show="asociarConductor.visible"
              :step="asociarConductor.step"
            >
              <div align="center">
                <v-flex md10>
                  <v-card class="rounded-card">
                    <v-container grid-list-md text-xs-center>
                      <v-layout row wrap>
                        <div align="left">
                          <v-flex md12>
                            <h2 class="h2_title">Asociar Conductor</h2>
                          </v-flex>
                        </div>
                      </v-layout>
                      <v-divider></v-divider>
                      <br />
                      <v-layout row wrap>
                        <v-flex md6>
                          <v-text-field
                            label="Buscar..."
                            v-model="buscarConductor"
                            @input="onFilterTextBoxChangedConductor"
                            prepend-icon="lock_open"
                            append-icon="search"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <br />
                      <v-layout row wrap>
                        <v-flex md12>
                          <v-card>
                            <ag-grid-vue
                              style="
                                width: 100%;
                                height: 350px;
                                font-family: 'Asap', sans-serif;
                              "
                              class="ag-theme-material"
                              :columnDefs="columnDefsConductor"
                              :rowData="conductorRespaldo"
                              rowSelection="single"
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
                                onSelectedChangeConductor($event)
                              "
                              :getRowNodeId="getRowNodeIdConductor"
                              :suppressCsvExport="true"
                              :suppressExcelExport="true"
                              :isExternalFilterPresent="
                                isExternalFilterPresentConductor
                              "
                              :doesExternalFilterPass="
                                doesExternalFilterPassConductor
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
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Vehículo' })"
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
    <app-confirmacion
      :show="showModalGeocercas"
      :titulo="
        $t('mensajes.crud.sinAsociacion.titulo', { entidad: 'Geocerca' })
      "
      :mensaje="
        $t('mensajes.crud.sinAsociacion.mensaje', {
          entidad: 'Geocercas',
          entidadAsociada: 'GPS Principal del Vehículo.',
        })
      "
      v-on:modalConfirmationEmit="confirmCallbackMensajeGeocerca($event)"
      :textoBtnSi="$t('mensajes.crud.sinAsociacion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.sinAsociacion.btnCancelar')"
    ></app-confirmacion>

    <!--<app-confirmacion
      :show="showAlertaGpsPrincipal"
      :titulo="
        $t('mensajes.crud.sinSeleccion.titulo', { entidad: 'GPS Principal' })
      "
      :mensaje="
        $t('mensajes.crud.sinSeleccion.mensaje', { entidad: 'GPS Principal' })
      "
      v-on:modalConfirmationEmit="confirmCallbackGpsPrincipal($event)"
      :textoBtnSi="$t('mensajes.crud.sinSeleccion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.sinSeleccion.btnCancelar')"
    ></app-confirmacion>-->

    <div class="text-xs-center">
      <v-dialog v-model="showAlertaRobarConductor" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >Asociar Conductor</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text>{{ mensajeRobarConductor }}</v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="confirmCallbackRobarConductor()"
            >
              <span style="color: white">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorWarningCond" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >Error al Asociar Geocercas</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            No se ha podido realizar la asociación de geocercas con el vehículo.
            Favor revisar los casos con Atención.
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="dialogErrorWarningCond = false"
            >
              <span style="color: white">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text-xs-center">
      <v-dialog v-model="dialogErrorWarningGuardar" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >Error al Asociar Geocercas</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            No se ha podido realizar la carga de las geocercas al vehículo.
            Favor revisar los casos con Atención.
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="dialogErrorWarningGuardar = false"
            >
              <span style="color: white">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- SELECCION GPS PRINCIPAL -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaGpsPrincipal" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >Seleccionar GPS Principal</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>Debe seleccionar GPS Principal</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#526da5"
              small
              @click="confirmCallbackGpsPrincipal(true)"
            >
              <span style="color: white">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->
  </v-layout>
</template>

<script lang="ts">
import {
  IVehiculo,
  ITipoVehiculo,
  ITipoPeaje,
  ITipoCombustible,
  ITipoTransmision,
  IMarca,
  IModelo,
  IEtiqueta,
} from '@/interfaces/Vehiculos';
import { IConductor } from '@/interfaces/Conductores';
import { IGeocerca } from '@/interfaces/Geocerca';
import { IZona } from '@/interfaces/Zonas';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import {
  EstadoEntidad,
  TipoGeometria,
  EstadoEnvioGps,
  TipoCompartir,
} from '@/config/enums';
import { IGPS } from '@/interfaces/GPS';
import { IFlota } from '@/interfaces/Flota';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';

import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoCompartirInformacion } from '@/config/enums';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  GridReadyEvent,
  SelectionChangedEvent,
  SelectionController,
  RowNode,
} from 'ag-grid-community';
import { differenceBy } from 'lodash';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class VehiculosModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) })
  vehiculos!: IVehiculo;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Vehiculos;
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 19,
  };

  asociarEtiqueta: PermisoAccionVm = {
    accion: 'Crear - Asociar Etiqueta',
    visible: true,
    step: 2,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 39,
  };

  asociarGPS: PermisoAccionVm = {
    accion: 'Crear - Asociar GPS',
    visible: true,
    step: 3,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 34,
  };

  asociarGeocerca: PermisoAccionVm = {
    accion: 'Crear - Asociar GeoCerca',
    visible: true,
    step: 4,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 37,
  };

  asociarConductor: PermisoAccionVm = {
    accion: 'Crear - Asociar Conductor',
    visible: true,
    step: 5,
    codigoAccionPadre: CodigoAccion.Crear,
    codigoSubAccion: 36,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarEtiqueta,
    this.asociarGPS,
    this.asociarGeocerca,
    this.asociarConductor,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IVehiculo = {};
  hayPrincipal: boolean = false;
  showAlertaGpsPrincipal: boolean = false;
  search: string = '';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  showModalGeocercas: boolean = false;
  dialogErrorWarningCond: boolean = false;
  dialogErrorWarningGuardar: boolean = false;

  usuarioId: number = store.state.userId;
  gpsPrincipal: number = 0;
  vr: ValidaRut = new ValidaRut();
  loadingService: LoadingService;

  buscarEtiquetas: string = '';
  buscarGps: string = '';
  buscarGeocerca: string = '';
  buscarConductor: string = '';
  geosCount: number = 0;
  geoSelected: any = null;

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  etiquetaAsignadosModel: any = [];
  etiquetaAsignados: IEtiqueta[] = [];
  etiquetaRespaldo: IEtiqueta[] = [];

  gpsAsignadosModel: any = [];
  gpsAsignados: IGPS[] = [];
  gpsRespaldo: IGPS[] = [];
  mostrarGps: Boolean = false;
  mostrarGeocerca: Boolean = false;
  mostrarEtiqueta: Boolean = false;

  geocercaAsignadosModel: any = [];
  geocercaAsignados: IZona[] = [];
  geocercaRespaldo: IZona[] = [];
  geoSeleccionadas: IZona[] = [];
  geoSeleccionadasAux: IZona[] = [];

  conductorAsignadosModel: any = [];
  conductorAsignados: IConductor[] = [];
  conductorRespaldo: IConductor[] = [];
  vehiculoConductorEliminar: any[] = []; //Para "Robar" el conductor a otro vehiculo

  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////
  VehiculoTipo: ITipoVehiculo[] = [];

  TipoPeaje: ITipoPeaje[] = [];
  Marca: IMarca[] = [];
  Modelo: IModelo[] = [];
  TipoTransmision: ITipoTransmision[] = [];
  TipoCombustible: ITipoCombustible[] = [];
  Flotas: IFlota[] = [];

  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();
  seleccionoTodosEtiquetas: boolean = true;
  seleccionoTodosGps: boolean = true;
  seleccionoTodosGeo: boolean = true;

  vehiculoMarcaId: number = 0;
  vehiculoTipoId: number;
  vehiculoModeloId: number;
  vehiculoTipoCombustibleId: number;
  vehiculoTipoPeajeId: number;
  vehiculoTipoTransmisionId: number;
  vehiculoFlotaId: number;
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  gridApiGeo: GridApi;
  columnApiGeo: ColumnApi;
  gridApiEtiquetas: GridApi;
  columnApiEtiquetas: ColumnApi;
  gridApiConductor: GridApi;
  columnApiConductor: ColumnApi;

  columnDefsEtiqueta: Array<ColDef> = [];
  columnDefsGPS: Array<ColDef> = [];
  columnDefsGeocerca: Array<ColDef> = [];
  columnDefsConductor: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;

  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);

  controllerGpsCoordenada: string = 'gpscoordenada';
  controllerCoordenada: string = 'coordenada';
  controllerVehiculo: string = 'Vehiculo';
  controllerVehiculoTipo: string = 'vehiculoTipo';
  controllerVehiculoEtiqueta: string = 'VehiculoEtiqueta';
  controllerVehiculoTipoPeaje: string = 'VehiculoTipoPeaje';
  controllerVehiculoTipoTransmision: string = 'VehiculoTipoTransmision';
  controllerVehiculoMarca: string = 'vehiculoMarca';
  controllerConductor: string = 'Conductor';
  controllerFlota: string = 'flota';
  controllerGps: string = 'gps';
  controllerVehiculoFlota: string = 'VehiculoFlota';

  showMessage: Boolean = false;
  showMessageGeocercas: Boolean = false;

  //Guardar Vehículo Inactivo
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  //---

  showAlertaRobarConductor: boolean = false;
  mensajeRobarConductor: string = '';
  usuario: any = store.state.user;

  constructor() {
    super();

    this.loadingService = new LoadingService();
  }

  created() {
    this.chequearPermisos();
  }

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivV').scrollIntoView(true);
  }

  mounted() {
    this.initialize();
    this.registrarValidadores();
  }
  // marcarTodosEtiquetas(value: boolean) {
  //   this.etiquetaAsignadosModel = [];
  //   this.etiquetaAsignados = [];
  //   if (value) {
  //     this.etiquetaRespaldo.forEach((eti: any) => {
  //       this.etiquetaAsignadosModel.push(eti.id);
  //       this.etiquetaAsignados.push(eti);
  //     });
  //   }
  //   this.seleccionoTodosEtiquetas = value;
  // }
  // marcarTodosGps(value: boolean) {
  //   this.gpsAsignadosModel = [];
  //   this.gpsAsignados = [];
  //   if (value) {
  //     this.gpsRespaldo.forEach((gp: any) => {
  //       this.gpsAsignadosModel.push(gp.id);
  //       this.gpsAsignados.push(gp);
  //     });
  //   } else {
  //     this.gpsPrincipal = 0;
  //     this.validateAllGeocercasForPrincipal(); //EMR - Geocercas Compartidas
  //   }
  //   this.seleccionoTodosGps = value;
  // }
  // marcarTodosGeo(value: boolean) {
  //   this.geocercaAsignadosModel = [];
  //   this.geocercaAsignados = [];
  //   if (value) {
  //     this.geocercaRespaldo.forEach((geo: any) => {
  //       this.validaGeocercaForPrincipal(geo);
  //     });
  //     this.geocercaAsignados.forEach((geo: any) => {
  //       this.geocercaAsignadosModel.push(geo.id);
  //     });
  //   }
  //   this.seleccionoTodosGeo = value;
  // }

  private registrarValidadores() {
    const self = this;

    const r = this.vr;
    Validator.extend('anioMaximo', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Año no puede ser mayor al próximo';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaAnioVehiculo(value),
            data: r.validaAnioVehiculo(value)
              ? undefined
              : { message: '* Año no puede ser mayor al próximo' },
          });
        });
      },
    });

    Validator.extend('patenteUnica', {
      getMessage() {
        return '* La Patente ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(`${self.controllerVehiculo}/0/${value}/patenteUnica`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* La Patente ya se encuentra en uso.' },
              });
            });
          })
          .catch(() => {
            return true;
          });
      },
    });

    Validator.extend('vinUnico', {
      getMessage() {
        return '* El VIN ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(`${self.controllerVehiculo}/0/${value}/vinUnico`)
          .then(response => {
            return new Promise(resolve => {
              resolve({
                valid: response.data,
                data: response.data
                  ? undefined
                  : { message: '* La Patente ya se encuentra en uso.' },
              });
            });
          })
          .catch(() => {
            return true;
          });
      },
    });
  }

  nombreCompleto(user: any): string {
    return this.formatoTextoAsociacion(
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
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.btnBloquear = false;
    this.showMessage = false;
    this.showMessageGeocercas = false;

    this.conductorAsignados = [];
    this.conductorAsignadosModel = {};
    this.etiquetaAsignados = [];
    this.etiquetaAsignadosModel = [];
    this.gpsAsignados = [];
    this.gpsAsignadosModel = [];
    this.geocercaAsignados = [];
    this.geocercaAsignadosModel = [];
    this.geoSeleccionadas = [];
    this.geoSeleccionadasAux = [];
    this.vehiculoMarcaId = 0;
    this.geoSelected = null;
    this.geosCount = 0;
    this.gpsPrincipal = 0;

    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el Vehículo',
    });

    if (value) {
      this.editedItem = {};
      this.editedItem.estado = EstadoEntidad.Activo; //Estado Activo

      this.editedItem.vehiculoTipoId = 0;
      this.vehiculoTipoId = 0; //null;

      this.editedItem.vehiculoTipoPeajeId = 0;
      this.vehiculoTipoPeajeId = 0; //null;

      this.editedItem.vehiculoModeloId = 0;
      this.vehiculoModeloId = 0;

      this.vehiculoMarcaId = 0; //null;

      this.editedItem.vehiculoTipoTransmisionId = 0;
      this.vehiculoTipoTransmisionId = 0;
      this.editedItem.vehiculoTipoCombustibleId = 0;
      this.vehiculoTipoCombustibleId = 0;

      try {
        this.loadingService.showLoading();
        await this.$validator.reset();
        await this.obtenerConductores();
        await this.obtenerEtiquetas();
        await this.obtenerGPS();
        await this.obtenerGeocercas();
        await this.obtenerFlotas();
        await this.obtenerVehiculosTipo();
        await this.obtenerTipoPeajes();
        await this.obtenerTipoTransmision();
        await this.obtenerTipoCombustible();
        await this.obtenerMarcas();
        await this.obtenerModelos(this.vehiculoMarcaId);
        this.seleccionoTodosGeo = false;
        this.seleccionoTodosEtiquetas = false;
        this.seleccionoTodosGps = false;
      } finally {
        this.loadingService.hideLoading();
      }
    }
  }

  patenteInput() {
    if (this.editedItem.patente !== undefined) {
      this.editedItem.patente = this.editedItem.patente.toUpperCase();
    }
  }

  validarModalGeocercaAsociada() {
    if (this.gpsAsignados !== null && this.gpsAsignados !== undefined) {
      if (this.gpsAsignados.length > 0) {
        if (
          this.geocercaRespaldo !== null &&
          this.geocercaRespaldo !== undefined
        ) {
          if (this.geocercaRespaldo.length <= 0) this.showModalGeocercas = true;
          else {
            this.showModalGeocercas = false;
          }
        }
      }
    }
  }

  validarGpsPrincipalSeleccionada() {
    this.hayPrincipal = false;

    if (this.gpsAsignados !== null && this.gpsAsignados !== undefined) {
      if (this.gpsAsignados.length > 0) {
        this.gpsAsignados.forEach((e: any) => {
          let idCheckbox = 'btnLGpsPrincN' + e.id;
          let c: any = document.getElementById(idCheckbox);
          if (c != null) {
            if (c.checked) {
              this.hayPrincipal = true;
            }
          }
        });
      }
      if (!this.hayPrincipal && this.gpsAsignados.length > 0) {
        this.showAlertaGpsPrincipal = true;
        this.btnBloquear = true;
        //this.limpiarGeocercasSeleccionadas(); //Limpiar Geocercas
      } else {
        this.btnBloquear = false;
      }
      this.validateAllGeocercasForPrincipal();
    }
  }

  confirmCallbackGpsPrincipal(val: boolean) {
    this.showAlertaGpsPrincipal = false;
  }

  confirmCallbackMensajeGeocerca(val: boolean) {
    this.showModalGeocercas = false;
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

  closeModal(val: boolean) {
    // this.loadingService.hideLoading();
    document.getElementById('cardDivV').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.e1 = 1;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el Vehículo',
    });
    this.buscarEtiquetas = '';
    this.buscarGps = '';
    this.buscarGeocerca = '';
    this.buscarConductor = '';
    this.gridApiEtiquetas.setQuickFilter('');
    this.gridApi.setQuickFilter('');
    this.gridApiGeo.setQuickFilter('');
    this.gridApiConductor.setQuickFilter('');
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  onGridReady(params: any) {
    this.gridApiConductor = params.api;
    this.columnApiConductor = params.columnApi;
  }

  onGridReadyGeo(params: any) {
    this.gridApiGeo = params.api;
    this.columnApiGeo = params.columnApi;
  }

  onGridReadyGps(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    let ExisteSeleccionado: boolean = false;
    params.api.addGlobalListener((type: any, event: any) => {
      if (
        type.indexOf('selectionChanged') >= 0 ||
        type === 'filterChanged' ||
        type === 'sortChanged' ||
        type === 'paginationChanged'
      ) {
        this.gpsRespaldo.forEach((gps: any) => {
          let idCheckbox = 'btnLGpsPrincN' + gps.id;
          let c: any = document.getElementById(idCheckbox);
          let existe = this.gpsAsignados.filter((x: any) => x.id === gps.id);
          if (c != undefined) {
            if (existe.length > 0) {
              c.disabled = false;
            } else {
              c.disabled = true;
              c.checked = false;
            }
          }
        });
        if (this.gpsAsignados.length >= 1) {
          ExisteSeleccionado = false;
          this.gpsAsignados.forEach((e: any) => {
            if (e.id === this.gpsPrincipal) {
              let idCheckbox = 'btnLGpsPrincN' + e.id;
              let c: any = document.getElementById(idCheckbox);
              ExisteSeleccionado = true;
              if (c != null) {
                c.checked = true;
                c.disabled = false;
                this.setGpsPrincipal(e.id); //Llena las Geocercas del Principal cuando se chequea automaticamente
              }
            }
          });
          if (!ExisteSeleccionado) {
            //if (this.gpsAsignados.length === 1) {
            const item = this.gpsAsignados[0];
            if (item !== null) {
              let idCheckbox = 'btnLGpsPrincN' + item.id;
              let c: any = document.getElementById(idCheckbox);
              if (c != null) {
                c.checked = true;
                c.disabled = false;
                this.setGpsPrincipal(item.id); //Llena las Geocercas del Principal cuando se chequea automaticamente
                ExisteSeleccionado = true;
              }
            }
            //}
          }
        }
      }
    });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  async setGpsPrincipal(id: number) {
    this.gpsAsignados = this.gridApi.getSelectedRows();
    let checkBoxIdPressed = `btnLGpsPrincN${id}`;
    let objChk: any = document.getElementById(checkBoxIdPressed);
    this.gpsPrincipal = id;
    if (objChk != null) {
      if (!objChk.checked) this.gpsPrincipal = 0;
    }
    this.gpsAsignados.forEach(async (e: any) => {
      if (e.id !== id) {
        let idCheckbox = 'btnLGpsPrincN' + e.id;
        let c: any = document.getElementById(idCheckbox);
        if (c != null) {
          c.checked = false;
          //this.limpiarGeocercasSeleccionadas(); //Limpiar Geocercas
        }
      }
    });
    await this.validateAllGeocercasForPrincipal();
  }

  async obtenerGeocercas() {
    this.geocercaRespaldo = [];
    this.geocercaAsignadosModel = [];
    this.geocercaAsignados = [];
    try {
      const responseCoordenadas = await this.axiosGps.http.get(
        `${this.controllerCoordenada}/${this.clienteId()}/geocercas`
      );
      responseCoordenadas.data = responseCoordenadas.data.map((node: any) => ({
        ...node,
        tipoGeometriaTxt: TipoGeometria[node.tipoGeometria],
      }));

      responseCoordenadas.data.forEach((x: IZona) => {
        this.geocercaRespaldo.push(x);
      });

      this.showMessageGeocercas = this.geocercaRespaldo.length == 0;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener las geocercas del cliente'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener las geocercas del cliente'
        );
      }
    }
    if (this.geocercaRespaldo.length > 0) {
      this.mostrarGeocerca = true;
    } else {
      this.mostrarGeocerca = false;
    }
  }

  async validaGeocercaForPrincipal(geocerca: IZona) {
    let limitePuntos: number = 0;
    let limiteCirculos: number = 0;
    let limiteGeocercas: number = 0;
    let limitePuntosPorGeocerca: number = 0;
    let puntosAlmacenados: number = 0;
    let circulosAlmacenados: number = 0;
    let geocercasAlmacenadas: number = 0;
    let poligonosAlmacenados: number = 0;
    let maximoPoligonos: number = 0;

    this.gpsAsignados.forEach(async (e: any) => {
      if (e.id === this.gpsPrincipal) {
        limitePuntos = e.gpsModelo.maximoPoligonos;
        limiteCirculos = e.gpsModelo.maximaCircular;
        limiteGeocercas = e.gpsModelo.maximoGeocercas;
        limitePuntosPorGeocerca = e.gpsModelo.maximoPuntosPorGeocerca;
        maximoPoligonos = e.gpsModelo.maximoPoligonos;
      }
    });

    this.gridApiGeo.getSelectedNodes().forEach(e => {
      puntosAlmacenados += e.data.puntos;
      circulosAlmacenados += e.data.circulos;
      geocercasAlmacenadas += 1;
    });

    let gpsModel = { GpsId: this.gpsPrincipal };
    let cont = 0;
    poligonosAlmacenados =
      geocerca.tipoGeometria == 1
        ? (poligonosAlmacenados = +1)
        : poligonosAlmacenados;

    try {
      if (this.gpsPrincipal > 0) {
        geocerca.warnGeocercas = false;
        geocerca.warnPuntos = false;
        geocerca.warnCirculos = false;
        geocerca.warnGps = false;
        geocerca.warnSoportaCirculos = false;
        geocerca.warnPuntosPorGeo = false;
        geocercasAlmacenadas > limiteGeocercas
          ? (geocerca.warnGeocercas = true)
          : (geocerca.warnGeocercas = false);
        poligonosAlmacenados > maximoPoligonos
          ? (geocerca.warnPuntos = true)
          : (geocerca.warnPuntos = false);
        circulosAlmacenados > limiteCirculos && limiteCirculos > 0
          ? (geocerca.warnCirculos = true)
          : (geocerca.warnCirculos = false);
        limiteCirculos == 0 && geocerca.circulos > 0
          ? (geocerca.warnSoportaCirculos = true)
          : (geocerca.warnSoportaCirculos = false);
        geocerca.puntos > limitePuntosPorGeocerca
          ? (geocerca.warnPuntosPorGeo = true)
          : (geocerca.warnPuntosPorGeo = false);
      } else {
        geocerca.warnGps = true;
      }
      this.gridApiGeo.refreshCells({ force: true });

      //this.geocercaAsignados.push(geocerca);
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los datos almacenados en el GPS principal'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los datos almacenados en el GPS principal'
        );
      }
    }
  }

  async validateAllGeocercasForPrincipal() {
    let limitePuntos: number = 0;
    let limiteCirculos: number = 0;
    let limiteGeocercas: number = 0;
    let limitePuntosPorGeocerca: number = 0;
    let puntosAlmacenados: number = 0;
    let circulosAlmacenados: number = 0;
    let geocercasAlmacenadas: number = 0;
    let poligonosAlmacenados: number = 0;
    let maximoPoligonos: number = 0;

    this.gpsAsignados.forEach(async (e: any) => {
      if (e.id === this.gpsPrincipal) {
        limitePuntos = e.gpsModelo.maximoPoligonos;
        limiteCirculos = e.gpsModelo.maximaCircular;
        limiteGeocercas = e.gpsModelo.maximoGeocercas;
        limitePuntosPorGeocerca = e.gpsModelo.maximoPuntosPorGeocerca;
        maximoPoligonos = e.gpsModelo.maximoPoligonos;
      }
    });
    let gpsModel = { GpsId: this.gpsPrincipal };
    let cont = 0;

    try {
      if (this.gpsPrincipal > 0) {
        this.geoSeleccionadas.forEach(async (e: any) => {
          puntosAlmacenados = puntosAlmacenados + e.puntos;
          circulosAlmacenados = circulosAlmacenados + e.circulos;
          geocercasAlmacenadas = geocercasAlmacenadas + 1;
          poligonosAlmacenados =
            e.tipoGeometria == 1
              ? (poligonosAlmacenados = +1)
              : poligonosAlmacenados;
          e.warnGeocercas = false;
          e.warnPuntos = false;
          e.warnCirculos = false;
          e.warnGps = false;
          e.warnSoportaCirculos = false;
          e.warnPuntosPorGeo = false;
          geocercasAlmacenadas > limiteGeocercas
            ? (e.warnGeocercas = true)
            : (e.warnGeocercas = false);
          poligonosAlmacenados > maximoPoligonos && e.tipoGeometria == 1
            ? (e.warnPuntos = true)
            : (e.warnPuntos = false);
          circulosAlmacenados > limiteCirculos && limiteCirculos > 0
            ? (e.warnCirculos = true)
            : (e.warnCirculos = false);
          limiteCirculos == 0 && e.circulos > 0
            ? (e.warnSoportaCirculos = true)
            : (e.warnSoportaCirculos = false);
          e.puntos > limitePuntosPorGeocerca
            ? (e.warnPuntosPorGeo = true)
            : (e.warnPuntosPorGeo = false);
        });
        this.gridApiGeo.refreshCells({ force: true });
      } else {
        this.geoSeleccionadas.forEach(async (e: any) => {
          e.warnGeocercas = false;
          e.warnPuntos = false;
          e.warnCirculos = false;
          e.warnGps = true;
          e.warnSoportaCirculos = false;
          e.warnPuntosPorGeo = false;
        });
      }
      this.gridApiGeo.refreshCells({ force: true });
      this.btnBloquear = false;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener los datos almacenados en el GPS principal'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener los datos almacenados en el GPS principal'
        );
      }
    }
  }

  initialize() {
    this.generarColumnasGrilla();
    this.dictionaryFormErrors = {
      custom: {
        patente: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          min: () => '* El campo Patente debe tener al menos 5 caracteres.',
        },
        referencia: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        vin: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        unidad: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        vehiculoTipo: {
          required: () => config.errorMensajes.textoRequerido,
        },
        tipopeaje: {
          required: () => config.errorMensajes.textoRequerido,
        },
        marca: {
          required: () => config.errorMensajes.textoRequerido,
        },
        modelo: {
          required: () => config.errorMensajes.textoRequerido,
        },
        ano: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
        color: {
          required: () => config.errorMensajes.textoRequerido,
        },
        tipotransmision: {
          required: () => config.errorMensajes.textoRequerido,
        },
        tipocombustible: {
          required: () => config.errorMensajes.textoRequerido,
        },
        numerodechasis: {
          required: () => config.errorMensajes.textoRequerido,
        },
        numerodemotor: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        etiqueta: {
          required: () => config.errorMensajes.textoRequerido,
        },
        flota: {
          required: () => config.errorMensajes.textoRequerido,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
        valorRPM: {
          numeric: config.errorMensajes.soloNumeros,
          max_value: () => config.errorMensajes.maxLength,
          min_value: () => '* El valor no puede ser negativo.',
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

  generarColumnasGrilla() {
    this.columnDefsEtiqueta = [
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
        lockPinned: true,
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
        hide: true,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        lockVisible: true,
        rowDrag: true,
        width: 200,
        minWidth: 80,
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
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        rowDrag: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        lockPinned: true,
        rowDrag: true,
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
      // {
      //   headerName: 'Desasociar',
      //   cellRenderer: this.createButtonCellEtiquetas,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   width: 150,
      //   minWidth: 80,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.columnDefsGPS = [
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
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        resizable: true,
        hide: true,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'GPS Principal',
        cellRenderer: this.createCheckboxCellGps,
        rowDrag: true,
        enablePivot: false,
        lockPinned: true,
        resizable: true,
        width: 150,
        minWidth: 80,
        sortable: true,
        lockVisible: true,
        cellStyle: {
          textAlign: 'left',
        },
      },
      {
        headerName: 'Nro. Serie',
        field: 'numeroSerie',
        sortable: true,
        resizable: true,
        lockVisible: true,
        rowDrag: true,
        width: 200,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Marca',
        field: 'gpsModelo.gpsMarca.nombre',
        rowDrag: true,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        /*cellRenderer: (r: any) => {
                      return MarcaGps[r.data.marca];
                    },*/
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
        headerName: 'Modelo',
        field: 'gpsModelo.nombre',
        rowDrag: true,
        lockPinned: true,
        resizable: true,
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
        headerName: 'IMEI',
        field: 'imei',
        sortable: true,
        rowDrag: true,
        width: 200,
        resizable: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Desasociar',
      //   cellRenderer: this.createButtonCellGps,
      //   filter: false,
      //   minWidth: 80,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   width: 150,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.columnDefsGeocerca = [
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
        rowDrag: true,
        enablePivot: true,
        hide: true,
        lockPinned: true,
        resizable: true,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 40,
        cellRenderer: this.crearBotonWarning,
        enablePivot: false,
        resizable: false,
        minWidth: 40,
        sortable: false,
        lockVisible: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
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
        headerName: 'Tipo Geometría',
        field: 'tipoGeometriaTxt',
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        resizable: true,
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
        headerName: 'Fecha Asign. Geocerca',
        field: 'fechaInicioAsociacion',
        rowDrag: true,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        getQuickFilterText: () => null,
      },
      {
        headerName: 'Estado Asociación',
        field: 'estadoAsociacion',
        lockPinned: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        cellRenderer: (r: any) => {
          if (EstadoEnvioGps[r.data.estadoAsociacion] != undefined) {
            return EstadoEnvioGps[r.data.estadoAsociacion].replace(/_/g, ' ');
          } else {
            return '';
          }
        },
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
      // {
      //   headerName: 'Desasociar',
      //   cellRenderer: this.createButtonCellGeocerca,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   width: 150,
      //   minWidth: 80,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.columnDefsConductor = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: false,
        sortable: false,
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
        hide: true,
        lockPinned: true,
        resizable: true,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 90,
        minWidth: 90,
        cellRenderer: this.createButtonCellConductoresAlerta,
        enablePivot: false,
        lockPinned: true,
        resizable: true,
        sortable: false,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        rowDrag: true,
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        lockVisible: true,
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
        // cellRenderer: (params: any) => {
        //   return `<span>${params.data.nombre} ${params.data.apellidoPaterno}  ${params.data.apellidoMaterno}</span>`;
        // },
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
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
      {
        headerName: 'Correo Electrónico',
        field: 'email',
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
      {
        headerName: 'Teléfono',
        field: 'telefono',
        lockPinned: true,
        rowDrag: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      // {
      //   headerName: 'Desasociar',
      //   cellRenderer: this.createButtonCellConductores,
      //   filter: false,
      //   minWidth: 80,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   width: 150,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'left' },
      // },
    ];
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        document.getElementById('cardDivV').scrollIntoView(true);

        //Guardar Vehículo Inactivo
        if (this.guardarInactivo) {
          this.btnBloquear = true;
          this.dialogConfirmacion = true;
        } else {
          if (this.e1 === this.permisosActuales.length) {
            this.btnBloquear = true;
            if (this.conductorAsignados.length > 0) {
              const item: any = this.conductorRespaldo.find(
                x => x.id == this.conductorAsignados[0].id
              );
              this.mensajeRobarConductor =
                'El Conductor seleccionado se encuentra actualmente asociado al Vehículo ' +
                item.unidadVehiculo +
                ', al guardar los cambios se perderá la asociación existente.';

              if (this.conductorAsignados[0].cantidadVehiculosAsociados > 0) {
                this.showAlertaRobarConductor = true;
              } else {
                this.dialogConfirmacion = true;
              }
            } else {
              this.dialogConfirmacion = true;
            }
          } else if (this.e1 === this.permisosActuales.length - 1) {
            let flagError = false;
            this.geoSeleccionadas.forEach((geo: any) => {
              if (
                geo.warnPuntos ||
                geo.warnCirculos ||
                geo.warnGeocercas ||
                geo.warnGps ||
                geo.warnSoportaCirculos ||
                geo.warnPuntosPorGeo
              ) {
                flagError = true;
              }
            });
            if (!flagError) {
              this.e1 += 1;
              this.btnText = 'Guardar';
              this.btnClass = 'btn-grabar';
            } else {
              this.dialogErrorWarningCond = true;
            }
          } else if (this.e1 === this.asociarGeocerca.step - 1) {
            this.validarGpsPrincipalSeleccionada();
            if (!this.hayPrincipal && this.gpsAsignados.length > 0) {
              this.showAlertaGpsPrincipal = true;
              //this.limpiarGeocercasSeleccionadas(); //Limpiar Geocercas
            } else {
              this.e1 += 1;
              this.validarModalGeocercaAsociada();
            }
          } else {
            this.e1 += 1;
          }
        }
      }
    });
  }

  createButtonCellEtiquetas(params: any) {
    const item = this.etiquetaRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerEtiquetaAsignacion(item);
    });

    return eButton;
  }

  createButtonCellGps(params: any) {
    const item = this.gpsRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerGpsAsignacion(item);
    });

    return eButton;
  }

  crearBotonWarning(params: any) {
    const item: any = this.geoSeleccionadas.find(
      x =>
        x.id === params.data.id &&
        (x.warnPuntos === true ||
          x.warnCirculos === true ||
          x.warnGeocercas === true ||
          x.warnGps === true ||
          x.warnSoportaCirculos === true ||
          x.warnPuntosPorGeo === true)
    );
    const mensajePlural: string =
      'La geocerca no cumple con las siguientes validaciones:\n\n';
    const mensajeSingular: string =
      'La geocerca no cumple con las siguientes validaciones:\n\n';
    let cont: number = 0;
    let mensajeValidaciones: string = '';
    let mensaje: string = '';
    if (item !== undefined) {
      if (item.warnPuntos) {
        cont += 1;
        mensajeValidaciones =
          '- GPS asociado al vehículo excede límite de polígonos permitidos.\n';
      }
      if (item.warnCirculos) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo excede límite de geocercas circulares permitidas.\n';
      }
      if (item.warnGeocercas) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo excede límite de geocercas permitidas.\n';
      }
      if (item.warnGps) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- La geocerca no puede ser asociada a un vehículo sin GPS.\n';
      }
      if (item.warnPuntosPorGeo) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo excede límite de vértices permitidos por geocerca.\n';
      }
      if (item.warnSoportaCirculos) {
        cont += 1;
        mensajeValidaciones =
          mensajeValidaciones +
          '- GPS asociado al vehículo no permite asociar geocercas circulares.\n';
      }
      if (cont > 1) {
        mensaje = mensajePlural + mensajeValidaciones;
      } else {
        mensaje = mensajeSingular + mensajeValidaciones;
      }
      let eButton = document.createElement('i');
      eButton.setAttribute('title', mensaje);
      eButton.setAttribute('id', 'warningGeocerca' + params.data.id);
      eButton.innerHTML =
        '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
      return eButton;
    }
  }

  createCheckboxCellGps(params: any) {
    const item = this.gpsRespaldo.find(x => x.id == params.data.id);

    let eCheck = document.createElement('input');
    eCheck.setAttribute('id', 'btnLGpsPrincN' + params.data.id);
    eCheck.setAttribute('role', 'checkbox');
    eCheck.setAttribute('type', 'checkbox');
    eCheck.setAttribute('disabled', 'true');

    eCheck.innerHTML =
      '<div class="v-input--selection-controls__input"><div class="v-input--selection-controls__ripple"></div><i aria-hidden="true" class="v-icon material-icons theme--light">check_box_outline_blank</i></div>';

    eCheck.addEventListener('click', () => {
      this.setGpsPrincipal(item.id);
    });
    return eCheck;
  }

  createButtonCellGeocerca(params: any) {
    const item = this.geocercaRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerGeocercaAsignacion(item);
    });

    return eButton;
  }

  createButtonCellConductores(params: any) {
    const item = this.conductorRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLic' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerConductorAsignacion(item);
    });

    return eButton;
  }

  createButtonCellConductoresAlerta(params: any) {
    if (this.conductorRespaldo.length > 0) {
      const item: any = this.conductorRespaldo.find(
        x => x.id == params.data.id
      );

      if (item !== undefined && item !== null) {
        if (item.cantidadVehiculosAsociados > 0) {
          var eButton = document.createElement('i');
          eButton.setAttribute(
            'title',
            'Asignado a Vehículo: ' + item.unidadVehiculo
          );
          eButton.innerHTML =
            '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
          return eButton;
        }
      }
    }
  }

  //GET-------------------------------------------------------------------------------
  clienteId() {
    return config.getClienteSesion();
  }

  async obtenerVehiculosTipo() {
    try {
      const response = await this.axiosVehiculo.http.get(
        this.controllerVehiculoTipo
      );
      this.VehiculoTipo = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener tipos de vehiculos.'
          );
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener tipos de vehiculos.');
      }
    }
  }

  async obtenerMarcas() {
    try {
      const response = await this.axiosVehiculo.http.get(
        this.controllerVehiculoMarca
      );
      this.Marca = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener marcas.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener marcas.');
      }
    }
  }

  async obtenerModelos(e: any) {
    this.Modelo = [];
    this.editedItem.ano = null;
    this.vehiculoMarcaId = e;

    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerVehiculoMarca}/${e}/modelos`
      );
      response.data.forEach((x: IModelo) => {
        if (x.nombre == 'NO DEFINIDO') {
          this.Modelo.unshift(x);
          this.editedItem.vehiculoModeloId = x.id;
          this.vehiculoModeloId = x.id;
        } else {
          x.nombre = `${x.nombre} - ${x.ano}`;
          this.Modelo.push(x);
        }
      });
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener modelos.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener modelos.');
      }
    }
  }

  async obtenerTipoPeajes() {
    try {
      const response = await this.axiosVehiculo.http.get(
        this.controllerVehiculoTipoPeaje
      );
      this.TipoPeaje = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener peajes.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener peajes.');
      }
    }
  }

  async obtenerTipoTransmision() {
    try {
      const response = await this.axiosVehiculo.http.get(
        this.controllerVehiculoTipoTransmision
      );
      this.TipoTransmision = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener transmisión.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener transmisión.');
      }
    }
  }

  async obtenerTipoCombustible() {
    try {
      const response = await this.axiosVehiculo.http.get(
        'VehiculoTipoCombustible/'
      );
      this.TipoCombustible = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            'Ocurrió un error al obtener tipos de combustible.'
          );
        }
      } else {
        this.$snotify.error(
          'Ocurrió un error al obtener tipos de combustible.'
        );
      }
    }
  }

  async obtenerEtiquetas() {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerVehiculoEtiqueta}/${this.clienteId()}/cliente`
      );
      if (response !== null && response !== undefined) {
        response.data = response.data.map((node: any) => ({
          ...node,
          estadoTxt: EstadoEntidad[node.estado],
        }));
        this.etiquetaRespaldo = response.data;
        this.etiquetaRespaldo = this.etiquetaRespaldo.filter(
          x => x.estado != EstadoEntidad.Eliminado
        );
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener etiquetas.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener etiquetas.');
      }
    }
    if (this.etiquetaRespaldo.length > 0) {
      this.mostrarEtiqueta = true;
    } else {
      this.mostrarEtiqueta = false;
    }
  }

  onEtiquetaChange(obj: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (obj != undefined && obj.length != this.etiquetaAsignados.length) {
      for (let x = this.etiquetaAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= obj.length - 1; i++) {
          if (this.etiquetaAsignados[x].id == obj[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.etiquetaAsignados.splice(x, 1);
          if (this.etiquetaAsignados.length === this.etiquetaRespaldo.length)
            this.seleccionoTodosEtiquetas = true;
          else this.seleccionoTodosEtiquetas = false;
        }
      }
    }
  }

  onEtiquetaInput(obj: any) {
    if (obj !== undefined) {
      for (let i = 0; i <= obj.length - 1; i++) {
        let added = this.etiquetaAsignados.filter(x => x.id == obj[i]);
        if (added.length == 0) {
          let _obj = this.etiquetaRespaldo.filter(x => x.id == obj[i]);
          this.etiquetaAsignados.push(_obj[0]);
        }
      }
    }
    if (this.etiquetaAsignados.length === this.etiquetaRespaldo.length)
      this.seleccionoTodosEtiquetas = true;
    else this.seleccionoTodosEtiquetas = false;
  }

  removerEtiquetaAsignacion(item: IEtiqueta) {
    for (let i = 0; i <= this.etiquetaAsignados.length - 1; i++) {
      if (this.etiquetaAsignados[i].id == item.id) {
        this.etiquetaAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.etiquetaAsignadosModel.length - 1; i++) {
      if (this.etiquetaAsignadosModel[i] == item.id) {
        this.etiquetaAsignadosModel.splice(i, 1);
        break;
      }
    }
    if (this.etiquetaAsignadosModel.length === this.etiquetaRespaldo.length)
      this.seleccionoTodosEtiquetas = true;
    else this.seleccionoTodosEtiquetas = false;
  }

  async obtenerGPS() {
    try {
      const response = await this.axiosGps.http.get(
        `${this.controllerGps}/0/disponibles`
      );
      if (response !== null && response !== undefined) {
        this.gpsRespaldo = response.data;
        this.gpsRespaldo = this.gpsRespaldo.filter(
          x => x.clienteId == this.clienteId()
        );
      }
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener gps.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener gps.');
      }
    }
    if (this.gpsRespaldo.length > 0) {
      this.mostrarGps = true;
    } else {
      this.mostrarGps = false;
    }
  }

  // onGpsChange(obj: any) {
  //   window.setTimeout(() => {
  //     this.search = '';
  //   }, 100);
  //   if (obj !== undefined && obj.length !== this.gpsAsignados.length) {
  //     for (let x = this.gpsAsignados.length - 1; x >= 0; x--) {
  //       let borrar = true;
  //       for (let i = 0; i <= obj.length - 1; i++) {
  //         if (this.gpsAsignados[x].id == obj[i]) {
  //           borrar = false;
  //         }
  //       }
  //       if (borrar) {
  //         this.gpsAsignados.splice(x, 1);
  //         if (this.gpsAsignados.length == 0) {
  //           this.gpsPrincipal = 0;
  //           this.validateAllGeocercasForPrincipal(); //EMR - Geocercas Compartidas
  //           /*this.geocercaAsignados = [];
  //           this.geocercaAsignadosModel = [];
  //           this.geocercaRespaldo = [];
  //           this.showMessageGeocercas = false;*/
  //         }
  //       }
  //     }
  //   }
  //   if (this.gpsAsignados.length === this.gpsRespaldo.length)
  //     this.seleccionoTodosGps = true;
  //   else this.seleccionoTodosGps = false;
  // }

  async onGpsInput(obj: any) {
    if (obj !== undefined) {
      for (let i = 0; i <= obj.length - 1; i++) {
        let added = this.gpsAsignados.filter(x => x.id == obj[i]);

        if (added.length === 0) {
          let _obj = this.gpsRespaldo.filter(x => x.id == obj[i]);
          this.gpsAsignados.push(_obj[0]);
          if (this.gpsAsignados.length === 1)
            await this.setGpsPrincipal(obj[i]);
        }
      }
    }
    if (this.gpsAsignadosModel.length === this.gpsRespaldo.length)
      this.seleccionoTodosGps = true;
    else this.seleccionoTodosGps = false;
  }

  removerGpsAsignacion(item: IGPS) {
    // if (item.id == this.gpsPrincipal) {
    //     this.geocercaAsignados = [];
    //     this.geocercaAsignadosModel = [];
    //     this.geocercaRespaldo = []; //Limpio las Geocercas si no hay GPS
    // }
    for (let i = 0; i <= this.gpsAsignados.length - 1; i++) {
      if (this.gpsAsignados[i].id == item.id) {
        this.gpsAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.gpsAsignadosModel.length - 1; i++) {
      if (this.gpsAsignadosModel[i] == item.id) {
        this.gpsAsignadosModel.splice(i, 1);
        break;
      }
    }
    if (this.gpsAsignados.length === 0) {
      this.gpsPrincipal = 0;
      this.validateAllGeocercasForPrincipal();
    }
  }

  onGeocercaChange(obj: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (obj !== undefined && obj.length !== this.geocercaAsignados.length) {
      for (let x = this.geocercaAsignados.length - 1; x >= 0; x--) {
        let borrar = true;

        for (let i = 0; i <= obj.length - 1; i++) {
          if (this.geocercaAsignados[x].id == obj[i]) {
            borrar = false;
          }
        }

        if (borrar) {
          this.geocercaAsignados.splice(x, 1);
          if (this.geocercaAsignados.length === this.geocercaRespaldo.length)
            this.seleccionoTodosGeo = true;
          else this.seleccionoTodosGeo = false;
        }
      }
    }
  }

  // onGeocercaInput(obj: any) {
  //   if (obj !== undefined) {
  //     for (let i = 0; i <= obj.length - 1; i++) {
  //       let added = this.geocercaAsignados.filter(x => x.id == obj[i]);
  //       if (added.length == 0) {
  //         let _obj = this.geocercaRespaldo.filter(x => x.id == obj[i]);
  //         this.validaGeocercaForPrincipal(_obj[0]);
  //         //this.geocercaAsignados.push(_obj[0]);
  //         //this.showMessage = true;
  //       }
  //     }
  //   }
  //   if (this.geocercaAsignados.length === this.geocercaRespaldo.length)
  //     this.seleccionoTodosGeo = true;
  //   else this.seleccionoTodosGeo = false;
  // }

  removerGeocercaAsignacion(item: IGeocerca) {
    for (let i = 0; i <= this.geocercaAsignados.length - 1; i++) {
      if (this.geocercaAsignados[i].id == item.id) {
        this.geocercaAsignados.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i <= this.geocercaAsignadosModel.length - 1; i++) {
      if (this.geocercaAsignadosModel[i] == item.id) {
        this.geocercaAsignadosModel.splice(i, 1);
        break;
      }
    }
    this.validateAllGeocercasForPrincipal();
  }

  async obtenerFlotas() {
    try {
      const responseFlotas = await this.axiosVehiculo.http.get(
        `${this.controllerFlota}/cliente/${this.clienteId()}/compartido/0`
      );
      this.Flotas = responseFlotas.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener flotas.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener flotas.');
      }
    }
  }

  async obtenerConductores() {
    try {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerConductor}/${this.clienteId()}/cliente`
      );
      this.conductorRespaldo = response.data;
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al obtener conductores.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al obtener conductores.');
      }
    }
  }

  onConductorChange(conductor: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (this.conductorAsignados.length > 0) {
      for (let x = this.conductorAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        if (this.conductorAsignados[x].id == conductor) {
          borrar = false;
        }
        if (borrar) {
          this.conductorAsignados.splice(x, 1);
        }
      }
    }
  }

  onConductorInput(conductor: any) {
    if (conductor !== undefined && conductor !== null) {
      let itemGps = this.conductorRespaldo.find(x => x.id == conductor);
      this.conductorAsignados = []; //Siempre en 1 solo GPS asignado
      this.conductorAsignados.push(itemGps);
    }
  }

  removerConductorAsignacion(item: IConductor) {
    for (let i = 0; i <= this.conductorAsignados.length - 1; i++) {
      if (this.conductorAsignados[i].id == item.id) {
        this.conductorAsignados.splice(i, 1);
        break;
      }
    }

    this.conductorAsignadosModel = {};
  }

  //FIN ASOCIACIONES /////////////////////////////////////////////////////////////////////////////////////////
  //GET-FIN------------------------------------------------------------------------------------
  establecerAnoModelo(e: any) {
    this.vehiculoModeloId = e;
    let valor = this.Modelo.find(x => x.id == e);
    this.editedItem.ano = valor.ano.toString();
  }

  selectedTipoTransmisionId(e: any) {
    this.vehiculoTipoTransmisionId = e;
  }

  selectedTipoCombustibleId(e: any) {
    this.vehiculoTipoCombustibleId = e;
  }

  selectedTipoVehiculoId(e: any) {
    this.vehiculoTipoId = e;
  }

  selectedTipoPeajeId(e: any) {
    this.vehiculoTipoPeajeId = e;
  }

  selectedFlotaId(e: any) {
    this.vehiculoFlotaId = e;
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;
    this.showAlertaRobarConductor = false;
    this.mensajeRobarConductor = '';

    if (aceptado) {
      const res = await this.$validator.validateAll();
      if (res) {
        this.btnBloquear = true;
        await this.nuevo();
      }
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(aceptado: boolean) {
    this.dialogConfirmacionClose = false;
    if (aceptado) {
      this.closeModal(false);
    }
  }

  closeSuccess() {
    // this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.crear', {
        entidad: 'Vehículo',
        creadoA: 'creado',
      })
    );
  }

  async nuevo() {
    try {
      this.loadingService.showLoading();

      //Validacion Unidad
      this.editedItem.unidad = '';
      if (
        this.editedItem.patente !== null &&
        this.editedItem.patente !== undefined &&
        this.editedItem.patente !== ''
      ) {
        this.editedItem.unidad = this.editedItem.patente;
      } else if (
        this.editedItem.vin !== null &&
        this.editedItem.vin !== undefined &&
        this.editedItem.vin !== ''
      ) {
        this.editedItem.unidad = this.editedItem.vin;
      }

      const modelVehiculos = {
        id: 0,
        vehiculoTipoId: this.vehiculoTipoId,
        vehiculoModeloId: this.vehiculoModeloId,
        vehiculoTipoCombustibleId: this.vehiculoTipoCombustibleId,
        vehiculoTipoPeajeId: this.vehiculoTipoPeajeId,
        vehiculoTipoTransmisionId: this.vehiculoTipoTransmisionId,
        color: this.editedItem.color,
        ano: this.editedItem.ano,
        patente: this.editedItem.patente == null ? '' : this.editedItem.patente,
        referencia: this.editedItem.referencia,
        numeroMotor: this.editedItem.numeroMotor,
        numeroChasis: this.editedItem.numeroChasis,
        vin: this.editedItem.vin == null ? '' : this.editedItem.vin,
        unidad: this.editedItem.unidad,
        poseeTag: this.editedItem.poseeTag,
        estado: this.editedItem.estado,
        valorRPM: this.editedItem.valorRPM,
        horasDisponible: this.editedItem.horasDisponible,
      };
      let cont: boolean = true;
      const res: any = await this.axiosVehiculo.http
        .post('vehiculo/', modelVehiculos)
        .catch(err => {
          cont = false;
          if (err.response !== undefined) {
            if (err.response.data.errors !== undefined) {
              if (err.response.status !== 401) {
                this.handleErrors.showError(err);
              }
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'el Vehículo',
              })
            );
          }
          this.loadingService.hideLoading();
        });

      if (cont) {
        await this.grabarAsociacionVehiculoFlota(res.data.id);

        if (!this.guardarInactivo) {
          await this.grabarAsociacionesEtiqueta(res.data.id);
          await this.grabarAsociacionesGps(res.data.id);
          await this.grabarAsociacionesGeocerca(res.data.id, this.gpsPrincipal);
          await this.grabarAsociacionesConductor(res.data.id);
        }
        this.closeSuccess();
      }
    } catch (e) {
      this.loadingService.hideLoading();
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', { entidad: 'el Vehículo' })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', { entidad: 'el Vehículo' })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  /*async grabarAsociacionVehiculoFlota(vehiculoId: number) {
    let model: number[] = [];
    model.push(vehiculoId);

    await this.axiosVehiculo.http.post(
      `${this.controllerFlota}/${this.vehiculoFlotaId}/vehiculo/${vehiculoId}`
    );
    await this.enviarCorreos(model, this.vehiculoFlotaId);
  }*/

  //09-2019: Desarrollo Compartir Información
  async grabarAsociacionVehiculoFlota(vehiculoId: number) {
    let model: number[] = [];
    model.push(vehiculoId);

    let vehiculosFlotaModelListPost: any = [];
    let flotaModel: any = {};
    flotaModel = {
      flotaId: this.vehiculoFlotaId,
      vehiculoId: vehiculoId,
      clienteId: config.getClienteSesion(),
    };
    vehiculosFlotaModelListPost.push(flotaModel);

    if (vehiculosFlotaModelListPost.length > 0) {
      await this.axiosVehiculo.http.post(
        `${this.controllerVehiculoFlota}/asocia/`,
        vehiculosFlotaModelListPost
      );

      await this.enviarCorreos(model, this.vehiculoFlotaId);
    }
  }
  //---

  async enviarCorreos(vehiculosIds: number[], flotaId: number) {
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

  async grabarAsociacionesEtiqueta(idVehiculo: number) {
    if (this.etiquetaAsignados.length > 0) {
      let vehiculoEtiquetasModelListPost: any = [];

      this.etiquetaAsignados.forEach((etiquetas: any) => {
        let etiquetaModel = etiquetas;
        etiquetaModel = {
          vehiculoEtiquetaId: etiquetas.id,
          vehiculoId: idVehiculo,
        };
        vehiculoEtiquetasModelListPost.push(etiquetaModel);
      });

      if (vehiculoEtiquetasModelListPost.length > 0) {
        await this.axiosVehiculo.http.post(
          'VehiculoEtiquetaVehiculo/',
          vehiculoEtiquetasModelListPost
        );
      }
    }
  }

  async grabarAsociacionesGps(idVehiculo: number) {
    if (this.gpsAsignados.length > 0) {
      let vehiculoGpsModelListPost: any = [];

      this.gpsAsignados.forEach((gpss: any) => {
        let gpsPrincipals: boolean =
          this.gpsPrincipal === gpss.id ? true : false;

        let gpsModel = gpss;
        gpsModel = {
          gpsId: gpss.id,
          vehiculoId: idVehiculo,
          gpsPrincipal: gpsPrincipals,
        };
        vehiculoGpsModelListPost.push(gpsModel);
      });

      if (vehiculoGpsModelListPost.length > 0) {
        await this.axiosGps.http.post('GpsVehiculo/', vehiculoGpsModelListPost);
      }
    }
  }

  async grabarAsociacionesConductor(idVehiculo: number) {
    if (this.conductorAsignados.length > 0) {
      let vehiculoConductorModelListPost: any = [];

      this.conductorAsignados.forEach((conductores: any) => {
        let conductorModel = conductores;
        conductorModel = {
          conductorId: conductores.id,
          vehiculoId: idVehiculo,
        };
        vehiculoConductorModelListPost.push(conductorModel);
      });

      //"Robar Conductor" - Se elimina la asociacion del conductor de otro vehiculo (si existiera)
      let conductorModelListDelete: any = [];
      const res = await this.axiosVehiculo.http.get('ConductorVehiculo');
      this.vehiculoConductorEliminar = res.data;
      this.conductorAsignados.forEach((conductores: any) => {
        let eliminar = this.vehiculoConductorEliminar.find(
          x => x.vehiculoId != idVehiculo && x.conductorId == conductores.id
        );
        if (eliminar != null) {
          let conductorModel = {
            id: eliminar.id,
          };
          conductorModelListDelete.push(conductorModel);
        }
      });

      if (conductorModelListDelete.length > 0) {
        await this.axiosVehiculo.http.delete('ConductorVehiculo/', {
          data: conductorModelListDelete,
        });
      }

      if (vehiculoConductorModelListPost.length > 0) {
        await this.axiosVehiculo.http.post(
          'ConductorVehiculo/',
          vehiculoConductorModelListPost
        );
      }
    }
  }

  async grabarAsociacionesGeocerca(idVehiculo: number, idGps: number) {
    if (this.geocercaAsignados.length > 0) {
      let gpsCoordenadaModelListPost: any = [];
      this.geocercaAsignados.forEach((geocerca: any) => {
        let gpsCoordenadaModel = geocerca;
        gpsCoordenadaModel = {
          GpsId: idGps,
          VehiculoId: idVehiculo,
          CoordenadaId: geocerca.id,
          Vertices: geocerca.puntos,
          Circulos: geocerca.circulos,
          TipoGeometria: geocerca.tipoGeometria,
          FormaJson: geocerca.formaJson,
          VelocidadMaxGeo: geocerca.velocidadMaxGeo,
        };
        gpsCoordenadaModelListPost.push(gpsCoordenadaModel);
      });

      if (gpsCoordenadaModelListPost.length > 0) {
        await this.axiosGps.http.post(
          `${this.controllerGpsCoordenada}/`,
          gpsCoordenadaModelListPost
        );
      }
    }
  }

  //########## Guardar Vehículo Inactivo ##########
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', { entidad: 'el Vehículo' });
      this.btnText = 'Guardar';
      this.btnClass = 'btn-grabar';
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Vehículo' }
      );
      this.btnText = 'Continuar';
      this.btnClass = 'btn-continuar';
    }
  }

  limpiarListadosAsociaciones() {
    this.etiquetaAsignados = [];
    this.etiquetaAsignadosModel = [];
    this.gpsAsignados = [];
    this.gpsAsignadosModel = [];
    this.geocercaAsignados = [];
    this.geocercaAsignadosModel = [];
    this.conductorAsignados = [];
    this.conductorAsignadosModel = {};
  }
  //##########
  onGridReadyEtiquetas(params: any) {
    this.gridApiEtiquetas = params.api;
    this.columnApiEtiquetas = params.columnApi;
  }

  async onSelectedChangeEtiquetas() {
    await this.actualizarGrillaEtiqueta();
    this.etiquetaAsignados = this.gridApiEtiquetas.getSelectedRows();
  }

  // Metodo grilla GPS
  async onSelectedChangeGps() {
    this.gpsAsignados = this.gridApi.getSelectedRows();
    await this.actualizarGrillaGps();

    if (this.gpsAsignados.length === 0) {
      this.gpsPrincipal = 0;
      this.validateAllGeocercasForPrincipal();
    }

    this.gpsRespaldo.forEach((gps: any) => {
      let idCheckbox = 'btnLGpsPrincN' + gps.id;
      let c: any = document.getElementById(idCheckbox);
      let existe = this.gpsAsignados.filter((x: any) => x.id === gps.id);
      if (c != undefined) {
        if (existe.length > 0) {
          c.disabled = false;
        } else {
          c.disabled = true;
          c.checked = false;
        }
      }
    });
  }

  onRowSelectedGeocerca(event: any) {
    this.geoSelected = event.node;
    if (this.geoSelected.selected) {
      this.geoSeleccionadasAux.push(this.geoSelected.data);
    }
    this.geosCount++;
  }

  async onSelectedChangeGeocerca(event: SelectionChangedEvent) {
    await this.actualizarGrillaGeocerca();
    this.geocercaAsignados = this.gridApiGeo.getSelectedRows();
    // validaciones geocercas seleccion unitaria
    if (this.geosCount === 1 && this.geoSelected != null) {
      if (this.geoSelected.selected) {
        this.geocercaAsignados.forEach(async (e: any) => {
          if (e.id === this.geoSelected.data.id) {
            e.warnGeocercas = false;
            e.warnPuntos = false;
            e.warnCirculos = false;
            e.warnSoportaCirculos = false;
            e.warnPuntosPorGeo = false;
            this.geoSeleccionadas.push(e); // ordenar seleccion del usuario
            await this.validaGeocercaForPrincipal(e);
          }
        });
        // validaciones geocercas deseleccion unitaria
      } else {
        this.geoSeleccionadas.forEach(async (e: any) => {
          e.warnGeocercas = false;
          e.warnPuntos = false;
          e.warnCirculos = false;
          e.warnSoportaCirculos = false;
          e.warnPuntosPorGeo = false;
        });
        await this.eliminarGeoSeleccionadas(this.geoSelected.data); // eliminar deseleccion del usuario
        await this.validateAllGeocercasForPrincipal();
        this.gridApiGeo.refreshCells({ force: true });
      }

      // validaciones geocercas seleccion masiva
    } else if (this.geosCount > 1 && this.geoSelected != null) {
      this.geoSeleccionadasAux.forEach(async (e: any) => {
        let geoNoExiste = this.geoSeleccionadas.filter(
          (x: any) => x.id === e.id
        );
        if (geoNoExiste.length === 0) {
          this.geoSeleccionadas.push(e);
        }
      });
      await this.validateAllGeocercasForPrincipal();
      this.gridApiGeo.refreshCells({ force: true });
    }
    // al deseleccionar masivamente, limpio
    if (this.geocercaAsignados.length === 0) {
      this.geoSeleccionadas = [];
    }

    const self = this;
    this.gridApiGeo.forEachNode(function(node: any) {
      let selected = node.isSelected();
      let idWarning = 'warningGeocerca' + node.data.id;
      let warningGeocercaGrilla: any = document.getElementById(idWarning);
      if (warningGeocercaGrilla != undefined) {
        if (!selected) {
          warningGeocercaGrilla.style.display = 'none';
        }
      }
    });

    this.geoSeleccionadasAux = [];
    this.geosCount = 0;
  }

  eliminarGeoSeleccionadas(item: any) {
    for (let i = 0; i <= this.geoSeleccionadas.length - 1; i++) {
      if (this.geoSeleccionadas[i].id == item.id) {
        this.geoSeleccionadas.splice(i, 1);
        break;
      }
    }
  }

  async onSelectedChangeConductor() {
    this.conductorAsignados = this.gridApiConductor.getSelectedRows();
    await this.actualizarGrillaConductor();
  }

  getRowNodeIdEtiqueta(rowIdEtiqueta: IEtiqueta) {
    if (!rowIdEtiqueta) {
      return;
    }
    return rowIdEtiqueta.id;
  }

  getRowNodeIdGps(rowIdGps: IGPS) {
    if (!rowIdGps) {
      return;
    }
    return rowIdGps.id;
  }

  getRowNodeIdGeocerca(geocerca: IZona) {
    if (!geocerca) {
      return;
    }
    return geocerca.id;
  }

  getRowNodeIdConductor(rowIdConductor: IConductor) {
    if (!rowIdConductor) {
      return;
    }
    return rowIdConductor.id;
  }

  actualizarGrillaEtiqueta() {
    const etiquetasSeleccionadasNuevo = this.gridApiEtiquetas
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const etiquetasNoSeleccionadasNuevo = differenceBy(
      this.etiquetaRespaldo,
      etiquetasSeleccionadasNuevo,
      eti => eti.id
    ).map(eti => ({
      ...eti,
      checked: false,
    }));

    this.gridApiEtiquetas.updateRowData({
      update: [
        ...etiquetasNoSeleccionadasNuevo,
        ...etiquetasSeleccionadasNuevo,
      ],
    });
  }

  actualizarGrillaGps() {
    const gpsSeleccionadosNuevo = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const gpsNoSeleccionadosNuevo = differenceBy(
      this.gpsRespaldo,
      gpsSeleccionadosNuevo,
      gps => gps.id
    ).map(gps => ({
      ...gps,
      checked: false,
    }));

    this.gridApi.updateRowData({
      update: [...gpsNoSeleccionadosNuevo, ...gpsSeleccionadosNuevo],
    });
  }

  actualizarGrillaGeocerca() {
    const geocercasSeleccionadas = this.gridApiGeo
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const geocercasNoSeleccionadas = differenceBy(
      this.geocercaRespaldo,
      geocercasSeleccionadas,
      geo => geo.id
    ).map(geo => ({
      ...geo,
      checked: false,
    }));

    this.gridApiGeo.updateRowData({
      update: [...geocercasNoSeleccionadas, ...geocercasSeleccionadas],
    });
  }

  actualizarGrillaConductor() {
    const conductoresSeleccionados = this.gridApiConductor
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const conductoresNoSeleccionados = differenceBy(
      this.conductorRespaldo,
      conductoresSeleccionados,
      conductor => conductor.id
    ).map(conductor => ({
      ...conductor,
      checked: false,
    }));

    this.gridApiConductor.updateRowData({
      update: [...conductoresNoSeleccionados, ...conductoresSeleccionados],
    });
  }

  onFilterTextBoxChangedEtiquetas() {
    this.gridApiEtiquetas.onFilterChanged();
    /*if (this.buscarEtiquetas.length > 1) {
      this.gridApiEtiquetas.setQuickFilter(this.buscarEtiquetas);
    } else {
      this.gridApiEtiquetas.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedGps() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarGps.length > 1) {
      this.gridApi.setQuickFilter(this.buscarGps);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedGeocerca() {
    this.gridApiGeo.onFilterChanged();
    /*if (this.buscarGeocerca.length > 1) {
      this.gridApiGeo.setQuickFilter(this.buscarGeocerca);
    } else {
      this.gridApiGeo.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedConductor() {
    this.gridApiConductor.onFilterChanged();
    /*if (this.buscarConductor.length > 1) {
      this.gridApiConductor.setQuickFilter(this.buscarConductor);
    } else {
      this.gridApiConductor.setQuickFilter('');
    }*/
  }

  limpiarGeocercasSeleccionadas() {
    this.geocercaAsignados.forEach((geo: any) => {
      geo.checked = false;
    });
  }

  confirmCallbackRobarConductor() {
    this.showAlertaRobarConductor = false;
    this.dialogConfirmacion = true;
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentEtiqueta(): boolean {
    return true;
  }

  doesExternalFilterPassEtiqueta(node: RowNode): boolean {
    if (this.etiquetaRespaldo.length > 0 && this.buscarEtiquetas.length > 1) {
      let busqueda = this.buscarEtiquetas.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.descripcion.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentGps(): boolean {
    return true;
  }

  doesExternalFilterPassGps(node: RowNode): boolean {
    if (this.gpsRespaldo.length > 0 && this.buscarGps.length > 1) {
      let busqueda = this.buscarGps.toLowerCase();
      return (
        node.data.numeroSerie.toLowerCase().includes(busqueda) ||
        node.data.gpsModelo.gpsMarca.nombre.toLowerCase().includes(busqueda) ||
        node.data.gpsModelo.nombre.toLowerCase().includes(busqueda) ||
        node.data.imei.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentGeocerca(): boolean {
    return true;
  }

  doesExternalFilterPassGeocerca(node: RowNode): boolean {
    if (this.geocercaRespaldo.length > 0 && this.buscarGeocerca.length > 1) {
      let busqueda = this.buscarGeocerca.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.tipoGeometriaTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentConductor(): boolean {
    return true;
  }

  doesExternalFilterPassConductor(node: RowNode): boolean {
    if (this.conductorRespaldo.length > 0 && this.buscarConductor.length > 1) {
      let busqueda = this.buscarConductor.toLowerCase();
      return (
        node.data.rut.toLowerCase().includes(busqueda) ||
        node.data.nombreCompleto.toLowerCase().includes(busqueda) ||
        node.data.referencia.toLowerCase().includes(busqueda) ||
        node.data.email.toLowerCase().includes(busqueda) ||
        node.data.telefono.includes(busqueda)
      );
    }
    return true;
  }
  //---
}
</script>

<style scoped>
#alinear {
  text-align: justify;
}

.h2_title {
  font-weight: normal;
}
</style>

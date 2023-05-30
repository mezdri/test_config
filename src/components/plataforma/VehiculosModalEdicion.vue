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
            @click="cerrarOperacion()"
            :disabled="btnBloquearCerrar"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>
            {{ esEdicion ? 'Editar Vehículo' : 'Ver Detalle Vehículo' }}
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
              @click="grabarEdicion(), (btnBloquear = true)"
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
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="informacionGeneral.step"
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                v-show="
                  (asociarEtiqueta.visible && esEdicion) ||
                    (asociarEtiquetaVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="asociarEtiqueta.step"
              >
                <span>Asociar Etiquetas</span>
                <v-icon>label</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                v-show="
                  (asociarGPS.visible && esEdicion) ||
                    (asociarGPSVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="asociarGPS.step"
              >
                <span>Asociar GPS</span>
                <v-icon>gps_fixed</v-icon>
              </v-btn>
              <v-btn
                @click="validarModalGeocercaAsociada(), cierraMenu()"
                v-show="
                  (asociarGeocerca.visible && esEdicion) ||
                    (asociarGeocercaVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="asociarGeocerca.step"
              >
                <span>Asociar Geocercas</span>
                <v-icon>group_work</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu()"
                v-show="
                  (asociarConductor.visible && esEdicion) ||
                    (asociarConductorVerDetalle.visible && !esEdicion)
                "
                color="primary"
                flat
                :value="asociarConductor.step"
              >
                <span>Asociar Conductor</span>
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
                        <v-text-field
                          label="Código"
                          v-model="editedItem.id"
                          disabled
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          v-model="editedItem.patente"
                          label="Patente"
                          v-validate="{
                            rules: {
                              required: editedItem.vin ? false : true,
                              max: 6,
                              patenteUnicaEditar: true,
                              min: 5,
                              regex: '[A-Z0-9]+',
                            },
                          }"
                          :counter="6"
                          placeholder="EJ: AAZZ00"
                          :error-messages="errors.collect('patente')"
                          data-vv-name="patente"
                          :change="patenteInput()"
                          type="text"
                          :disabled="!esEdicion || vehiculos.esCompartido"
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
                              vinUnicoEditar: true,
                            },
                          }"
                          :counter="20"
                          :error-messages="errors.collect('vin')"
                          data-vv-name="vin"
                          type="text"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.unidad"
                          label="Unidad"
                          v-validate="'required|max:20'"
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
                          :items="flota"
                          v-model="flotaSeleccionado"
                          label="Asociar a Flota"
                          item-value="id"
                          item-text="nombre"
                          v-validate="'required'"
                          :error-messages="errors.collect('flota')"
                          data-vv-name="flota"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          autocomplete
                          :clearable="true"
                          required
                          no-data-text="Sin resultados"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-autocomplete
                          :items="estado"
                          v-model="estadoSeleccionado"
                          label="Estado"
                          item-value="id"
                          item-text="nombre"
                          v-validate="'required'"
                          :error-messages="errors.collect('estado')"
                          data-vv-name="estado"
                          required
                          no-data-text="Sin resultados"
                          :disabled="!esEdicion || vehiculos.esCompartido"
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
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs5 sm5 md5>
                        <v-autocomplete
                          :items="tipoVehiculo"
                          v-model="tipoVehiculoSeleccionado"
                          label="Tipo Vehículo"
                          item-value="id"
                          item-text="nombre"
                          v-validate
                          :error-messages="errors.collect('vehiculoTipo')"
                          data-vv-name="vehiculoTipo"
                          :clearable="true"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                          no-data-text="Sin resultados"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs5 sm5 md5>
                        <v-autocomplete
                          :items="tipoPeaje"
                          v-model="tipoPeajeSeleccionado"
                          label="Tipo Peaje"
                          item-value="id"
                          item-text="descripcion"
                          v-validate
                          :error-messages="errors.collect('tipopeaje')"
                          data-vv-name="tipopeaje"
                          :clearable="true"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                          no-data-text="Sin resultados"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs2 sm2 md2>
                        <v-checkbox
                          v-model="editedItem.poseeTag"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          label="TAG"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs3 sm3 md3>
                        <v-autocomplete
                          :items="marca"
                          v-model="marcaSeleccionado"
                          label="Marca"
                          item-value="id"
                          item-text="nombre"
                          v-validate
                          :error-messages="errors.collect('marca')"
                          data-vv-name="marca"
                          :clearable="true"
                          @change="obtenerModelos"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                          no-data-text="Sin resultados"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs5 sm5 md5>
                        <v-autocomplete
                          :items="modelo"
                          v-model="modeloSeleccionado"
                          label="Modelo"
                          item-value="id"
                          item-text="nombre"
                          v-validate
                          :error-messages="errors.collect('modelo')"
                          data-vv-name="modelo"
                          :clearable="true"
                          @change="establecerAnoModelo"
                          :disabled="!esEdicion || vehiculos.esCompartido"
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
                          :disabled="!esEdicion || vehiculos.esCompartido"
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
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md4>
                        <v-autocomplete
                          :items="tipoTransmision"
                          v-model="tipoTransmisionSeleccionado"
                          label="Tipo Transmisión"
                          item-value="id"
                          item-text="nombre"
                          v-validate
                          :error-messages="errors.collect('tipotransmision')"
                          data-vv-name="tipotransmision"
                          :clearable="true"
                          :disabled="!esEdicion || vehiculos.esCompartido"
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
                          :disabled="!esEdicion || vehiculos.esCompartido"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6 sm6 md4>
                        <v-text-field
                          label="Horas Disponible"
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          v-model="editedItem.horasDisponible"
                          v-validate="'numeric|min_value:0|max_value:24'"
                          :error-messages="errors.collect('horasDisponible')"
                          data-vv-name="horasDisponible"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6 sm6 md6>
                        <v-autocomplete
                          :items="tipoCombustible"
                          v-model="tipoCombustibleSeleccionado"
                          label="Tipo Combustible"
                          item-value="id"
                          item-text="nombre"
                          v-validate
                          :error-messages="errors.collect('tipocombustible')"
                          data-vv-name="tipocombustible"
                          :clearable="true"
                          :disabled="!esEdicion || vehiculos.esCompartido"
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
                          :disabled="!esEdicion || vehiculos.esCompartido"
                          required
                        ></v-text-field>
                      </v-flex>
                      <!--<v-flex xs12 sm12 md12>
                                              <v-autocomplete
                                                :items="flota"
                                                v-model="flotaSeleccionado"
                                                label="Asociar a Flota"
                                                item-value="id"
                                                item-text="nombre"
                                                v-validate="'required'"
                                                :error-messages="errors.collect('flota')"
                                                data-vv-name="flota"
                                                :disabled="!esEdicion || vehiculos.esCompartido"
                                                autocomplete
                                                :clearable="true"
                                                required
                                                no-data-text="Sin resultados"
                                              ></v-autocomplete>
                                            </v-flex>
                                            <v-flex xs12 sm12 md12>
                                              <v-autocomplete
                                                :items="estado"
                                                v-model="estadoSeleccionado"
                                                label="Estado"
                                                item-value="id"
                                                item-text="nombre"
                                                v-validate="'required'"
                                                :error-messages="errors.collect('estado')"
                                                data-vv-name="estado"
                                                required
                                                no-data-text="Sin resultados"
                                                :disabled="!esEdicion || vehiculos.esCompartido"
                                              ></v-autocomplete>
                      </v-flex>-->
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == asociarEtiqueta.step &&
                ((asociarEtiqueta.visible && esEdicion) ||
                  (asociarEtiquetaVerDetalle.visible && !esEdicion))
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
                        v-model="buscarEtiquetasEditar"
                        @input="onFilterTextBoxChangedEtiquetasEditar"
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
                            height: 380px;
                            font-family: 'Asap', sans-serif;
                          "
                          class="ag-theme-material"
                          :columnDefs="columnDefsEtiquetas"
                          :rowData="etiquetaRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReadyEtiqueta"
                          :postProcessPopup="onClickCell"
                          suppressCopyRowsToClipboard="true"
                          @selection-changed="onSelectedChangeEtiquetasEditar"
                          :getRowNodeId="getRowNodeIdEtiquetaEditar"
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
          <div
            align="center"
            v-show="
              bottomNav == asociarGPS.step &&
                ((asociarGPS.visible && esEdicion) ||
                  (asociarGPSVerDetalle.visible && !esEdicion))
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
                        <h2 class="h2_title">Asociar GPS</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        label="Buscar..."
                        v-model="buscarGpsEditar"
                        @input="onFilterTextBoxChangedGpsEditar"
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
                            height: 380px;
                            font-family: 'Asap', sans-serif;
                          "
                          class="ag-theme-material"
                          :columnDefs="columnDefsGps"
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
                          @selection-changed="onSelectedChangeGpsEditar"
                          :getRowNodeId="getRowNodeIdGpsEditar"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="isExternalFilterPresentGps"
                          :doesExternalFilterPass="doesExternalFilterPassGps"
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
              bottomNav == asociarGeocerca.step &&
                ((asociarGeocerca.visible && esEdicion) ||
                  (asociarGeocercaVerDetalle.visible && !esEdicion))
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
                        v-model="buscarGeocercaEditar"
                        @input="onFilterTextBoxChangedGeocercaEditar"
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
                            height: 380px;
                            font-family: 'Asap', sans-serif;
                          "
                          class="ag-theme-material"
                          :columnDefs="columnDefsGeocercas"
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
                            onSelectedChangeGeocercaEditar($event)
                          "
                          @row-selected="onRowSelectedGeocercaEditar($event)"
                          :getRowNodeId="getRowNodeIdGeocercaEditar"
                          :processCellForClipboard="procesarFecha"
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
          <div
            align="center"
            v-show="
              bottomNav == asociarConductor.step &&
                ((asociarConductor.visible && esEdicion) ||
                  (asociarConductorVerDetalle.visible && !esEdicion))
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
                        v-model="buscarConductorEditar"
                        @input="onFilterTextBoxChangedConductorEditar"
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
                            height: 380px;
                            font-family: 'Asap', sans-serif;
                          "
                          class="ag-theme-material"
                          :columnDefs="columnDefsConductores"
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
                            onSelectedChangeConductorEditar($event)
                          "
                          :getRowNodeId="getRowNodeIdConductorEditar"
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
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Vehículo',
          nombreEntidad: editedItem.unidad,
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
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
    <app-confirmacion
      :show="showAdvertenciaVehiculoCompartido"
      titulo="Confirmación"
      :mensaje="msgAdvertenciaVehiculoCompartido"
      v-on:modalConfirmationEmit="confirmCallbackVehiculoCompartido($event)"
      :textoBtnSi="$t('mensajes.crud.sinSeleccion.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.sinSeleccion.btnCancelar')"
    ></app-confirmacion>

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
      <v-dialog v-model="dialogErrorWarningGuardar" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >Error al Asociar Geocercas</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>{{ mensajeAsociarGeocercas }}</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="closeErrorWarningGuardar()">
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
import moment from 'moment';
import {
  IVehiculo,
  ITipoVehiculo,
  ITipoCombustible,
  ITipoTransmision,
  IMarca,
  IModelo,
  IEtiqueta,
  IVehiculoEtiquetaVehiculo,
  IVehiculoFlota,
  IVehiculoGPS,
} from '@/interfaces/Vehiculos';
import { IConductor, IConductorVehiculo } from '@/interfaces/Conductores';
import { IGeocerca } from '@/interfaces/Geocerca';
import { IZona, ICoordenadaVehiculo } from '@/interfaces/Zonas';
import {
  EstadoEntidad,
  TipoGeometria,
  EstadoEnvioGps,
  ServicioProxy,
  EstadoCompartirInformacion,
  TipoCompartir,
} from '@/config/enums';
import store from '@/store';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { IGPS } from '@/interfaces/GPS';
import { IFlota } from '@/interfaces/Flota';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  SelectionChangedEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { differenceBy, uniqBy } from 'lodash';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class VehiculosModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  vehiculos!: IVehiculo;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Vehiculos;
  permisosActuales: PermisoAccionVm[] = [];

  // Declarar todas las posibles subAcciones
  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarEtiqueta: PermisoAccionVm = {
    accion: 'Editar - Asociar Etiqueta',
    visible: true,
    step: 2,
    codigoSubAccion: 39,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarGPS: PermisoAccionVm = {
    accion: 'Editar - Asociar GPS',
    visible: true,
    step: 3,
    codigoSubAccion: 34,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarGeocerca: PermisoAccionVm = {
    accion: 'Editar - Asociar GeoCerca',
    visible: true,
    step: 4,
    codigoSubAccion: 37,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarConductor: PermisoAccionVm = {
    accion: 'Editar - Asociar Conductor',
    visible: true,
    step: 5,
    codigoSubAccion: 36,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarEtiquetaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Etiqueta',
    visible: true,
    step: 2,
    codigoSubAccion: 39,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarGPSVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar GPS',
    visible: true,
    step: 3,
    codigoSubAccion: 34,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarGeocercaVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar GeoCerca',
    visible: true,
    step: 4,
    codigoSubAccion: 37,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarConductorVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar Conductor',
    visible: true,
    step: 5,
    codigoSubAccion: 36,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarEtiqueta,
    this.asociarGPS,
    this.asociarGeocerca,
    this.asociarConductor,
    this.informacionGeneralVerDetalle,
    this.asociarEtiquetaVerDetalle,
    this.asociarGPSVerDetalle,
    this.asociarGeocercaVerDetalle,
    this.asociarConductorVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IVehiculo = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  vr: ValidaRut = new ValidaRut();
  asignados: any = [];
  loadingService = new LoadingService();
  startedFlota: number = 0;
  showModalGeocercas: boolean = false;
  hayPrincipal: boolean = false;
  showAlertaGpsPrincipal: boolean = false;
  dialogErrorWarningGuardar: boolean = false;
  buscarEtiquetasEditar: string = '';
  buscarGpsEditar: string = '';
  buscarGeocercaEditar: string = '';
  buscarConductorEditar: string = '';
  geosCountEditar: number = 0;
  contadorEventoGrilla = 0;
  contadorEventoGrillaSelection = 0;
  contadorValidacionesGeo = 0;

  showAdvertenciaVehiculoCompartido: boolean = false;
  msgAdvertenciaVehiculoCompartido: string = '';
  search: string = '';

  vehiculosAsignadosModel: any = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosAsignadosResp: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];

  VehiculoTipo: ITipoVehiculo[] = [];

  Modelo: IModelo[] = [];
  vehiculoEtiqueta: IVehiculoEtiquetaVehiculo[] = [];
  vehiculoGps: IVehiculoGPS[] = [];
  vehiculoConductor: IConductorVehiculo[] = [];
  vehiculoFlota: IVehiculoFlota[] = [];

  //ASOCIACIONES -------------------------------------------------------------------------------------
  etiquetaAsignadosModel: any = [];
  etiquetaAsignados: IEtiqueta[] = [];
  etiquetaAsignadosResp: IEtiqueta[] = [];
  etiquetaRespaldo: IEtiqueta[] = [];

  gpsAsignadosModel: any = [];
  gpsAsignados: IGPS[] = [];
  gpsAsignadosResp: IGPS[] = [];
  gpsRespaldo: IGPS[] = [];

  geocercaAsignadosModel: any = [];
  geocercaAsignados: IZona[] = [];
  geocercaAsignadosResp: IZona[] = [];
  geocercaRespaldo: IZona[] = [];
  geoSeleccionadas: IZona[] = [];
  geoSeleccionadasAux: IZona[] = [];

  conductorAsignadosModel: any = [];
  conductorAsignados: IConductor[] = [];
  //conductorAsignadosResp: IConductor[] = []; //No se usa
  conductorRespaldo: IConductor[] = [];
  vehiculoConductorEliminar: any[] = []; //Para "Robar" el conductor a otro vehiculo
  geocercaAsignadosOC: any[] = []; //EMR - Geocercas Compartidas

  //SELECT--------------------------------------------------------------------------------------------
  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstadosVisibles();
  estadoSeleccionado: any = 0;
  seleccionoTodosEtiquetas: boolean = true;
  seleccionoTodosGps: boolean = true;
  seleccionoTodosGeo: boolean = true;

  marcaSeleccionado: any = 0;
  marca: IMarca[] = [];
  tipoVehiculoSeleccionado: any = 0;
  tipoVehiculo: ITipoVehiculo[] = [];
  modeloSeleccionado: any = 0;
  modelo: IModelo[] = [];
  tipoCombustibleSeleccionado: any = 0;
  tipoCombustible: ITipoCombustible[] = [];
  tipoPeajeSeleccionado: any = 0;
  tipoPeaje: ITipoCombustible[] = [];
  tipoTransmisionSeleccionado: any = 0;
  tipoTransmision: ITipoTransmision[] = [];
  flotaSeleccionado: any = 0;
  flota: IFlota[] = [];
  gpsPrincipal: number = 0;
  //--------------------------------------------------------------------------------------------------
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  gridApi2: GridApi;
  columnApi2: ColumnApi;
  gridApiGeo: GridApi;
  columnApiGeo: ColumnApi;
  gridApiEtiqueta: GridApi;
  columnApiEtiqueta: ColumnApi;
  columnDefsEtiquetas: Array<ColDef> = [];
  columnDefsGps: Array<ColDef> = [];
  columnDefsGeocercas: Array<ColDef> = [];
  columnDefsConductores: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  mostrarGps: Boolean = false;
  mostrarGeocerca: Boolean = false;
  mostrarEtiqueta: Boolean = false;
  geoSelectedEditar: any = null;

  showMessage: Boolean = false;
  showMessageGeocercas: Boolean = false;

  vehiculoCoordenadas: ICoordenadaVehiculo[] = [];

  btnBloquear: Boolean = false;
  btnBloquearCerrar: boolean = false;

  controllerVehiculoEtiquetaVehiculo: string = 'VehiculoEtiquetaVehiculo';
  controllerVehiculoTipoCombustible: string = 'VehiculoTipoCombustible';
  controllerVehiculoTipoTransmision: string = 'VehiculoTipoTransmision';
  controllerVehiculoTipoPeaje: string = 'VehiculoTipoPeaje';
  controllerVehiculoMarca: string = 'VehiculoMarca';
  controllerVehiculoTipo: string = 'vehiculoTipo';
  controllerVehiculoEtiqueta: string = 'VehiculoEtiqueta';
  controllerVehiculoFlota: string = 'VehiculoFlota';
  controllerVehiculo: string = 'Vehiculo';
  controllerGpsCoordenada: string = 'gpscoordenada';
  controllerCoordenada: string = 'coordenada';
  controllerGps: string = 'gps';
  controllerGpsVehiculo: string = 'GpsVehiculo';
  controllerConductor: string = 'Conductor';
  controllerConductorVehiculo: string = 'ConductorVehiculo';
  controllerFlota: string = 'flota';

  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);

  //Guardar Vehículo Inactivo
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  //---

  //Concurrencia Geocercas
  mensajeAsociarGeocercas: any = '';
  boolCierraModal: boolean = false;
  //---

  showAlertaRobarConductor: boolean = false;
  mensajeRobarConductor: string = '';

  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }
  marcarTodosEtiquetas(value: boolean) {
    this.etiquetaAsignadosModel = [];
    this.etiquetaAsignados = [];
    if (value) {
      this.etiquetaRespaldo.forEach((eti: any) => {
        this.etiquetaAsignadosModel.push(eti.id);
        this.etiquetaAsignados.push(eti);
      });
    }
    this.seleccionoTodosEtiquetas = value;
  }
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

  marcarTodosGeo(value: boolean) {
    this.geocercaAsignadosModel = [];
    this.geocercaAsignados = [];
    if (value) {
      this.geocercaRespaldo.forEach((geo: any) => {
        this.geocercaAsignados.push(geo); //EMR - Geocercas Compartidas
      });
      this.validateAllGeocercasForPrincipal(); //EMR - Geocercas Compartidas

      this.geocercaAsignados.forEach((geo: any) => {
        this.geocercaAsignadosModel.push(geo.id);
      });
    }
    this.seleccionoTodosGeo = value;
  }

  initialize() {
    this.generarColumnasGrilla();

    this.dictionaryFormErrors = {
      custom: {
        patente: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
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
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  mounted() {
    this.registrarValidadores();
    this.initialize();
  }

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

    Validator.extend('patenteUnicaEditar', {
      getMessage() {
        return '* La Patente ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(
            `${self.controllerVehiculo}/${self.editedItem.id}/${value}/patenteUnica`
          )
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

    Validator.extend('vinUnicoEditar', {
      getMessage() {
        return '* El VIN ya se encuentra en uso.';
      },
      validate(value: any) {
        return self.axiosVehiculo.http
          .get(
            `${self.controllerVehiculo}/${self.editedItem.id}/${value}/vinUnico`
          )
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

  patenteInput() {
    if (this.editedItem.patente !== undefined) {
      this.editedItem.patente = this.editedItem.patente.toUpperCase();
    }
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar Cambios';
    this.editedItem = this.vehiculos;

    this.bottomNav = '1';
    this.btnBloquear = false;
    this.btnBloquearCerrar = false;
    this.showMessage = false;

    this.etiquetaAsignadosModel = [];
    this.etiquetaAsignados = [];
    this.etiquetaAsignadosResp = [];

    this.gpsAsignadosModel = [];
    this.gpsAsignados = [];
    this.gpsAsignadosResp = [];

    this.conductorAsignadosModel = {};
    this.conductorAsignados = [];
    //this.conductorAsignadosResp = [];

    this.geocercaAsignadosModel = [];
    this.geocercaAsignados = [];
    this.geocercaAsignadosResp = [];
    this.geocercaAsignadosOC = []; //EMR - Geocercas Compartidas
    this.geoSeleccionadas = [];
    this.geoSeleccionadasAux = [];

    this.VehiculoTipo = [];
    this.geosCountEditar = 0;
    this.geoSelectedEditar = null;
    this.contadorValidacionesGeo = 0;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();

        await this.$validator.reset();
        this.gpsPrincipal = 0;

        // await this.setRemoveButton();
        await this.obtenerVehiculosTipo();
        await this.obtenerTipoPeajes();
        await this.obtenerMarcas();
        await this.obtenerTipoTransmision();
        await this.obtenerTipoCombustible();
        await this.obtenerFlotas();
        await this.obtenerGPS();
        await this.obtenerGeocercas();
        await this.establecerVehiculoGps();
        await this.obtenerConductores();
        await this.establecerVehiculoConductores();
        await this.obtenerEtiquetas();
        await this.establecerVehiculoEtiquetas();
        await this.setSeleccionadosSelect();
        await this.elementosChequeadosGrilla();
        this.seleccionoTodosGeo = false;
        this.seleccionoTodosEtiquetas = false;
        this.seleccionoTodosGps = false;

        //Valida Vehículo Inactivo
        if (this.editedItem.estado === EstadoEntidad.Inactivo) {
          if (this.tieneAsociaciones())
            this.warningInactivo = this.$t(
              'mensajes.crud.inactivoAsociado.mensaje'
            );
          else this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
          this.guardarInactivo = true;
          this.mensajeConfirmacionInactivo =
            this.warningInactivo +
            ' ' +
            this.$t('mensajes.crud.editar.mensaje', { entidad: 'el Vehículo' });
        } else {
          this.warningInactivo = '';
          this.guardarInactivo = false;
          this.mensajeConfirmacionInactivo = this.$t(
            'mensajes.crud.editar.mensaje',
            { entidad: 'el Vehículo' }
          );
        }
        //---
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
      this.generarColumnasGrilla();
      await this.$validator.validateAll();
    }
    if (this.etiquetaAsignados.length == this.etiquetaRespaldo.length) {
      this.seleccionoTodosEtiquetas = true;
    } else {
      this.seleccionoTodosEtiquetas = false;
    }
    if (this.gpsAsignados.length == this.gpsRespaldo.length) {
      this.seleccionoTodosGps = true;
    } else {
      this.seleccionoTodosGps = false;
    }
    if (this.geocercaAsignados.length == this.geocercaRespaldo.length) {
      this.seleccionoTodosGeo = true;
    } else {
      this.seleccionoTodosGeo = false;
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

  onEtiquetaChange(etiqueta: any) {
    window.setTimeout(() => {
      this.search = '';
    }, 100);
    if (
      etiqueta !== undefined &&
      etiqueta.length !== this.etiquetaAsignados.length
    ) {
      for (let x = this.etiquetaAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= etiqueta.length - 1; i++) {
          if (this.etiquetaAsignados[x].id == etiqueta[i]) {
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

  onEtiquetaInput(etiqueta: any) {
    if (etiqueta !== undefined) {
      for (let i = 0; i <= etiqueta.length - 1; i++) {
        let added = this.etiquetaAsignados.filter(x => x.id == etiqueta[i]);
        if (added.length == 0) {
          let etiquetaAgregado = this.etiquetaRespaldo.find(
            x => x.id == etiqueta[i]
          );

          this.etiquetaAsignados.push(etiquetaAgregado);
        }
      }
    }
    if (this.etiquetaAsignados.length === this.etiquetaRespaldo.length)
      this.seleccionoTodosEtiquetas = true;
    else this.seleccionoTodosEtiquetas = false;
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

  async validaGeocercaForPrincipal(geocerca: IZona) {
    let limiteCirculos: number = 0;
    let limiteGeocercas: number = 0;
    let limitePuntosPorGeocerca: number = 0;
    let puntosAlmacenados: number = 0;
    let circulosAlmacenados: number = 0;
    let geocercasAlmacenadas: number = 0;
    let poligonosAlmacenados: number = 0;
    let maximoPoligonos: number = 0;

    let puntosAlmacenadosOC: number = 0;
    let circulosAlmacenadosOC: number = 0;
    let geocercasAlmacenadasOC: number = 0;
    let geocercasGPSOTrosClientes: any = [];
    this.geoSeleccionadas = uniqBy(this.geoSeleccionadas, 'id');

    this.gpsAsignados.forEach(async (e: any) => {
      if (e.id === this.gpsPrincipal) {
        maximoPoligonos = e.gpsModelo.maximoPoligonos;
        limiteCirculos = e.gpsModelo.maximaCircular;
        limiteGeocercas = e.gpsModelo.maximoGeocercas;
        limitePuntosPorGeocerca = e.gpsModelo.maximoPuntosPorGeocerca;
        geocercasGPSOTrosClientes = e.gpsCoordenada;
      }
    });

    geocercasGPSOTrosClientes.forEach(async (geoOC: any) => {
      let exists: any = this.geocercaRespaldo.filter(
        (x: any) => x.id === geoOC.coordenadaId
      );
      if (exists.length === 0) {
        puntosAlmacenadosOC = puntosAlmacenadosOC + geoOC.vertices;
        circulosAlmacenadosOC = circulosAlmacenadosOC + geoOC.circulos;
        geocercasAlmacenadasOC = geocercasAlmacenadasOC + 1;
      }
    });
    puntosAlmacenados = puntosAlmacenadosOC;
    circulosAlmacenados = circulosAlmacenadosOC;
    geocercasAlmacenadas = geocercasAlmacenadasOC;

    this.gridApiGeo.getSelectedNodes().forEach(async e => {
      puntosAlmacenados += e.data.puntos; //MaximoPoligonos
      circulosAlmacenados += e.data.circulos;
      geocercasAlmacenadas += 1;
    });
    let gpsModel = { GpsId: this.gpsPrincipal };
    let cont = 0;
    poligonosAlmacenados = geocerca.tipoGeometria == 1 ? 1 : 0;

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

  async validateAllGeocercasForPrincipal() {
    let limitePuntos: number = 0;
    let limiteCirculos: number = 0;
    let limiteGeocercas: number = 0;
    let limitePuntosPorGeocerca: number = 0;
    let puntosAlmacenados: number = 0;
    let circulosAlmacenados: number = 0;
    let geocercasAlmacenadas: number = 0;
    let puntosAlmacenadosOC: number = 0;
    let circulosAlmacenadosOC: number = 0;
    let geocercasAlmacenadasOC: number = 0;
    let geocercasGPSOTrosClientes: any = [];
    let poligonosAlmacenados: number = 0;
    let maximoPoligonos: number = 0;

    this.gpsAsignados.forEach(async (e: any) => {
      if (e.id === this.gpsPrincipal) {
        limitePuntos = e.gpsModelo.maximoPoligonos;
        limiteCirculos = e.gpsModelo.maximaCircular;
        limiteGeocercas = e.gpsModelo.maximoGeocercas;
        limitePuntosPorGeocerca = e.gpsModelo.maximoPuntosPorGeocerca;
        geocercasGPSOTrosClientes = e.gpsCoordenada;
        maximoPoligonos = e.gpsModelo.maximoPoligonos;
      }
    });

    //EMR - Geocercas Compartidas
    this.geocercaAsignadosOC.forEach(async (geoOC: any) => {
      puntosAlmacenadosOC = puntosAlmacenadosOC + geoOC.vertices;
      circulosAlmacenadosOC = circulosAlmacenadosOC + geoOC.circulos;
      geocercasAlmacenadasOC = geocercasAlmacenadasOC + 1;
    });
    puntosAlmacenados = puntosAlmacenadosOC;
    circulosAlmacenados = circulosAlmacenadosOC;
    geocercasAlmacenadas = geocercasAlmacenadasOC;
    //---
    let gpsModel = { GpsId: this.gpsPrincipal };
    let cont = 0;

    try {
      if (this.gpsPrincipal > 0) {
        this.geoSeleccionadas.forEach(async (e: any) => {
          e.warnGps = false;
          puntosAlmacenados = puntosAlmacenados + e.puntos;
          circulosAlmacenados = circulosAlmacenados + e.circulos;
          poligonosAlmacenados = e.tipoGeometria == 1 ? 1 : 0;
          geocercasAlmacenadas = geocercasAlmacenadas + 1;
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
      } else {
        this.geoSeleccionadas.forEach(async (e: any) => {
          e.warnGps = true;
          e.warnGeocercas = false;
          e.warnPuntos = false;
          e.warnCirculos = false;
          e.warnPuntosPorGeo = false;
          e.warnSoportaCirculos = false;
        });
      }
      this.gridApiGeo.refreshCells({ force: true });
      // this.btnBloquear = false;
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
      let itemConductor = this.conductorRespaldo.find(x => x.id == conductor);
      this.conductorAsignados = []; //Siempre en 1 solo GPS asignado
      this.conductorAsignados.push(itemConductor);
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.btnBloquearCerrar = false;
    this.editedItem = {};
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
    this.warningInactivo = '';
    this.guardarInactivo = false;
    this.geocercaAsignadosOC = []; //EMR - Geocercas Compartidas
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.editar.mensaje', {
      entidad: 'el Vehículo',
    });
    this.buscarEtiquetasEditar = '';
    this.buscarGpsEditar = '';
    this.buscarGeocercaEditar = '';
    this.buscarConductorEditar = '';
    this.gridApiEtiqueta.setQuickFilter('');
    this.gridApiGeo.setQuickFilter('');
    this.gridApi.setQuickFilter('');
    this.gridApi2.setQuickFilter('');
    this.contadorEventoGrilla = 0;
    this.contadorEventoGrillaSelection = 0;
  }

  formatoTextoAsociacion(texto: string) {
    return config.largoTextoAsociacion(texto);
  }

  validarModalGeocercaAsociada() {
    if (this.esEdicion) {
      if (this.gpsAsignados !== null && this.gpsAsignados !== undefined) {
        if (this.gpsAsignados.length > 0) {
          if (
            this.geocercaRespaldo !== null &&
            this.geocercaRespaldo !== undefined
          ) {
            this.showModalGeocercas = this.geocercaRespaldo.length < 1;
          }
        }
      }
    }
  }

  confirmCallbackMensajeGeocerca(val: boolean) {
    this.showModalGeocercas = false;
  }

  validarGpsPrincipalSeleccionada() {
    this.hayPrincipal = false;

    if (this.gpsAsignados !== null && this.gpsAsignados !== undefined) {
      if (this.gpsAsignados.length > 0) {
        this.gpsAsignados.forEach((e: any) => {
          let idCheckbox = 'btnLGpsPrinc' + e.id;
          let c: any = document.getElementById(idCheckbox);
          if (c != null) {
            if (c.checked) {
              this.hayPrincipal = true;
              this.btnBloquear = false;
            }
          }
        });
      }
      if (!this.hayPrincipal && this.gpsAsignados.length > 0) {
        this.showAlertaGpsPrincipal = true;
        this.btnBloquear = true;
        this.btnBloquearCerrar = false;
        //this.limpiarGeocercasSeleccionadas(); //Limpiar Geocercas
      } else {
        this.btnBloquear = false;
        this.btnBloquearCerrar = false;
      }
      this.validateAllGeocercasForPrincipal();
    }
  }

  confirmCallbackGpsPrincipal(val: boolean) {
    this.showAlertaGpsPrincipal = false;
  }

  onGridReadyEtiqueta(params: GridReadyEvent) {
    this.gridApiEtiqueta = params.api;
    this.columnApiEtiqueta = params.columnApi;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onGridReadyGeo(params: GridReadyEvent) {
    this.gridApiGeo = params.api;
    this.columnApiGeo = params.columnApi;
  }

  onGridReadyGps(params: GridReadyEvent) {
    this.gridApi2 = params.api;
    this.columnApi2 = params.columnApi;
    let ExisteSeleccionado: boolean = false;

    params.api.addGlobalListener((type: any, event: any) => {
      if (
        type.indexOf('selectionChanged') >= 0 ||
        type === 'filterChanged' ||
        type === 'sortChanged' ||
        type === 'paginationChanged'
      ) {
        this.gpsRespaldo.forEach((gps: any) => {
          if (!this.editedItem.esCompartido) {
            let idCheckbox = 'btnLGpsPrinc' + gps.id;
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
          }
        });
        if (this.gpsAsignados.length >= 1) {
          ExisteSeleccionado = false;
          this.gpsAsignados.forEach((e: any) => {
            if (e.id === this.gpsPrincipal) {
              if (!this.editedItem.esCompartido) {
                let idCheckbox = `btnLGpsPrinc${e.id}`;
                let c: any = document.getElementById(idCheckbox);
                ExisteSeleccionado = true;
                if (c != null) {
                  c.checked = true;
                  c.disabled = false;
                  this.btnBloquear = false;
                  this.hayPrincipal = true; //Existe Principal Seleccionado
                }
              } else {
                let idCheckbox = `btnLGpsPrinc${e.id}`;
                let c: any = document.getElementById(idCheckbox);
                ExisteSeleccionado = true;
                if (c != null) {
                  c.checked = true;
                  c.disabled = true;
                  this.btnBloquear = false;
                  this.hayPrincipal = true; //Existe Principal Seleccionado
                }
              }
            }
          });

          if (!ExisteSeleccionado) {
            //if (this.gpsAsignados.length === 1) {
            const item = this.gpsAsignados[0];
            if (item !== null) {
              let idCheckbox = 'btnLGpsPrinc' + item.id;
              let c: any = document.getElementById(idCheckbox);
              if (c != null) {
                c.checked = true;
                c.disabled = false;
                this.btnBloquear = false;
                this.hayPrincipal = true; //Existe Principal Seleccionado
                ExisteSeleccionado = true;
                //this.removerGeocercasAsignadas(); //Limpiar Geocercas
                this.establecerGpsPrincipal(item.id); //Llena las Geocercas del Principal cuando se chequea automaticamente
              }
            }
            //}
          }
        }

        //Ver Detalle checkGps
        if (!this.editedItem.esCompartido && !this.esEdicion) {
          if (this.gpsRespaldo.length >= 1) {
            this.gpsRespaldo.forEach((e: any) => {
              if (e.id === this.gpsPrincipal) {
                let idCheckbox = 'btnLGpsPrinc' + e.id;
                let c: any = document.getElementById(idCheckbox);
                if (c != null) {
                  c.checked = true;
                  c.disabled = true;
                } else {
                  c.checked = false;
                  c.disabled = true;
                }
              } else {
                //Si es compartido y no es GPS principal debe ir deshabilitado
                let idCheckbox = 'btnLGpsPrinc' + e.id;
                let c: any = document.getElementById(idCheckbox);
                if (c != null) {
                  c.checked = false;
                  c.disabled = true;
                }
                //---
              }
            });
          }
        }
      }
    });
  }

  removerGeocercasAsignadas() {
    this.geocercaAsignados = [];
    this.geocercaAsignadosModel = [];
    /*for (let i = 0; i <= this.geocercaAsignados.length - 1; i++) {
              this.geocercaAsignados.splice(i, 1);
            }
            for (let i = 0; i <= this.geocercaAsignadosModel.length - 1; i++) {
               this.geocercaAsignadosModel.splice(i, 1);
            }*/
  }

  formatDate(fecha: Date): string {
    if (!fecha) return null;
    return moment(fecha).format('DD/MM/YYYY');
  }

  formatDateString(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  fechaFilterTxt(r: any) {
    return this.$options.filters.formatDate(r);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }

  removerEtiquetasAsignacion(item: IEtiqueta) {
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

  removerGpsAsignacion(item: IGPS) {
    if (item.id == this.gpsPrincipal) {
      // this.geocercaAsignados = [];
      // this.geocercaAsignadosModel = [];
      // this.geocercaRespaldo = []; //Limpio las Geocercas si no hay GPS Ppal
      this.btnBloquear = false; //Habilito Boton de Guardar si no hay GPS Ppal
    }
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

  removerConductorAsignacion(item: IConductor) {
    for (let i = 0; i <= this.conductorAsignados.length - 1; i++) {
      if (this.conductorAsignados[i].id == item.id) {
        this.conductorAsignados.splice(i, 1);
        break;
      }
    }
    this.conductorAsignadosModel = {};
  }

  async setSeleccionadosSelect() {
    this.tipoVehiculoSeleccionado = this.editedItem.vehiculoTipoId;
    this.modeloSeleccionado = this.editedItem.vehiculoModeloId;
    this.tipoCombustibleSeleccionado = this.editedItem.vehiculoTipoCombustibleId;
    this.tipoPeajeSeleccionado = this.editedItem.vehiculoTipoPeajeId;
    this.tipoTransmisionSeleccionado = this.editedItem.vehiculoTipoTransmisionId;

    this.estadoSeleccionado = this.editedItem.estado;

    await this.establecerModelo(this.editedItem.vehiculoModeloId);
  }

  async establecerModelo(modeloId: any) {
    if (modeloId !== null && modeloId !== undefined) {
      const response = await this.axiosVehiculo.http.get(
        `vehiculomodelo/${modeloId}`
      );
      await this.obtenerModelos(response.data.marcaId);

      this.marcaSeleccionado = response.data.marcaId;
      this.modeloSeleccionado = this.editedItem.vehiculoModeloId;
    }
  }

  async establecerFlota() {
    if (this.editedItem.id !== undefined) {
      const res: any = await this.axiosVehiculo.http.get(
        'vehiculoflota/' +
          this.editedItem.id +
          '/' +
          this.clienteId() +
          '/flota/'
      );
      this.flotaSeleccionado = res.data.flotaId;
      this.startedFlota = res.data.flotaId;
      // if (this.editedItem.esCompartido) {
      //     const res: any = await this.axiosVehiculo.http.get("vehiculoflota/" + this.editedItem.id + "/" + this.clienteId() + "/flota/");
      //     this.flotaSeleccionado = res.data.flotaId;
      //     this.startedFlota = res.data.flotaId;
      // } else {
      //     // const res: any = await this.axiosVehiculo.http.get("vehiculoflota/" + this.editedItem.id + "/flota/");
      //     // this.flotaSeleccionado = res.data.flotaId;
      //     // this.startedFlota = res.data.flotaId;
      //
      //     this.axiosVehiculo.http.get("vehiculoflota/" + this.editedItem.id + "/flota/").then(res => {
      //         this.flotaSeleccionado = res.data.flotaId;
      //         this.startedFlota = res.data.flotaId;
      //     }).catch(err => {
      //         let sd = err;
      //     });
      // }
    }
  }

  async establecerVehiculoEtiquetas() {
    if (this.editedItem.id != undefined) {
      const res: any = await this.axiosVehiculo.http.get(
        'VehiculoEtiquetaVehiculo/' + this.editedItem.id + '/etiquetas/'
      );
      this.vehiculoEtiqueta = res.data.filter(
        (x: any) => x.clienteId === this.clienteId()
      );

      this.vehiculoEtiqueta.forEach((cl: any) => {
        this.etiquetaAsignados.push(
          this.etiquetaRespaldo.find(x => x.id == cl.vehiculoEtiquetaId)
        );
        this.etiquetaAsignadosModel.push(cl.vehiculoEtiquetaId);
      });
      this.etiquetaAsignadosResp = Object.assign([], this.etiquetaAsignados);
    }
  }

  async establecerVehiculoGps() {
    if (this.editedItem.id !== undefined) {
      const response = await this.axiosGps.http.get(
        `${this.controllerGpsVehiculo}/${this.editedItem.id}/gpss/`
      );
      this.vehiculoGps = response.data;

      let seteado: boolean = false;
      let cont: number = 0;
      this.vehiculoGps.forEach((cv: any) => {
        if (!seteado) {
          this.gpsPrincipal = cv.gpsPrincipal === true ? cv.gpsId : 0;
        }
        if (this.gpsPrincipal > 0) {
          seteado = true;
        }
        this.gpsAsignados.push(this.gpsRespaldo.find(x => x.id == cv.gpsId));
        this.gpsAsignadosModel.push(cv.gpsId);
        cont += 1;
        // if (cont === this.vehiculoGps.length && !this.esEdicion) {
        //   this.establecerGpsPrincipal(this.gpsPrincipal);
        // }
      });
      this.gpsAsignadosResp = Object.assign([], this.gpsAsignados);

      //Si es compartido solo se listan los GPS asignados
      if (this.editedItem.esCompartido) {
        this.gpsRespaldo = this.gpsAsignados;
      }
      //---
    }
  }

  async establecerVehiculoConductores() {
    if (this.editedItem.id !== undefined) {
      const response = await this.axiosVehiculo.http.get(
        `${this.controllerConductorVehiculo}/${this.editedItem.id}/conductores/`
      );
      this.vehiculoConductor = response.data;

      if (this.vehiculoConductor.length > 0) {
        this.vehiculoConductor.forEach((cl: any) => {
          let cond: any = this.conductorRespaldo.find(
            (x: any) => x.id == cl.conductorId
          );

          if (cond !== undefined) {
            this.conductorAsignados.push(cond);
            this.conductorAsignadosModel = cond.id;
            if (this.editedItem.esCompartido) {
              this.conductorRespaldo = this.conductorAsignados;
            }
          }
        });
      } else {
        if (this.editedItem.esCompartido) {
          this.conductorRespaldo = [];
        }
      }
    }
  }

  async establecerGpsPrincipal(id: number) {
    let checkBoxIdPressed = `btnLGpsPrinc${id}`;
    let objChk: any = document.getElementById(checkBoxIdPressed);
    this.gpsPrincipal = id;
    if (objChk != null) {
      if (!objChk.checked) this.gpsPrincipal = 0;
    }
    this.gpsAsignados.forEach((e: any) => {
      let checkboxId = `btnLGpsPrinc${e.id}`;
      let c: any = document.getElementById(checkboxId);

      if (e.id !== id) {
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
    const self = this;
    try {
      const responseCoordenadas = await this.axiosGps.http.get(
        `${this.controllerCoordenada}/${this.clienteId()}/geocercas`
      );

      responseCoordenadas.data = responseCoordenadas.data.map((node: any) => ({
        ...node,
        tipoGeometriaTxt: TipoGeometria[node.tipoGeometria],
        fechaInicioAsociacionTxt: '',
        fechaAsociacionFisicaTxt: '',
        estadoAsociacionTxt: '',
      }));

      responseCoordenadas.data.forEach((x: IZona) => {
        this.geocercaRespaldo.push(x);
      });
      this.showMessageGeocercas = this.geocercaRespaldo.length == 0;
      await this.setVehiculoCoordenadas();
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

  // ButtonCell - Source -------------------------------------------------------
  createButtonCellEtiquetas(params: any) {
    const item = this.etiquetaRespaldo.find(x => x.id == params.data.id);
    if (item !== undefined) {
      let eButton = document.createElement('button');
      eButton.setAttribute('id', 'btnEtique' + params.data.id);
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
        this.removerEtiquetasAsignacion(item);
      });

      return eButton;
    }
  }

  createButtonCellGps(params: any) {
    const item = this.gpsRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnLGps' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      if (this.editedItem.esCompartido) {
        eButton.setAttribute('disabled', 'true');
        eButton.setAttribute(
          'class',
          'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
        );
      } else {
        eButton.setAttribute(
          'class',
          'v-btn v-btn--flat v-btn--icon theme--light'
        );
      }
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
      this.removerGpsAsignacion(item);
    });

    return eButton;
  }

  createCheckboxCellGps(params: any) {
    const item = this.gpsRespaldo.find(x => x.id == params.data.id);

    let eCheck = document.createElement('input');
    eCheck.setAttribute('id', 'btnLGpsPrinc' + params.data.id);
    eCheck.setAttribute('role', 'checkbox');
    eCheck.setAttribute('type', 'checkbox');
    eCheck.setAttribute('disabled', 'true');
    if (this.editedItem.esCompartido) {
      eCheck.disabled = true;
    }
    eCheck.innerHTML =
      '<div class="v-input--selection-controls__input"><div class="v-input--selection-controls__ripple"></div><i aria-hidden="true" class="v-icon material-icons theme--light">check_box_outline_blank</i></div>';

    eCheck.addEventListener('click', () => {
      this.establecerGpsPrincipal(item.id);
      this.validarGpsPrincipalSeleccionada(); //Validar la seleccion de principal al modificar Check
    });
    return eCheck;
  }

  createButtonCellGeocerca(params: any) {
    const item = this.geocercaRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnGeo' + params.data.id);
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
      this.removerGeocercaAsignacion(item);
    });

    return eButton;
  }

  createButtonCellConductores(params: any) {
    const item = this.conductorRespaldo.find(x => x.id == params.data.id);

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnCon' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      if (this.editedItem.esCompartido) {
        eButton.setAttribute('disabled', 'true');
        eButton.setAttribute(
          'class',
          'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
        );
      } else {
        eButton.setAttribute(
          'class',
          'v-btn v-btn--flat v-btn--icon theme--light'
        );
      }
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
        if (item.conductorVehiculo.length > 0) {
          let veh = item.conductorVehiculo.find(
            (cond: any) => cond.vehiculoId !== this.editedItem.id
          );
          if (veh !== undefined && veh !== null) {
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
  }

  async grabarEdicion() {
    const responseValidacion: boolean = await this.$validator.validateAll();

    if (responseValidacion) {
      if (this.startedFlota !== this.flotaSeleccionado) {
        //recupera data vehiculo compartido y despliega modal de advertencia cambio por vehiculo compartido
        const resVeh = await this.axiosVehiculo.http.get(
          `${this.controllerVehiculo}/${
            this.editedItem.id
          }/${this.clienteId()}/vehiculoEsCompartido`
        );
        resVeh.data = resVeh.data.filter(
          (x: any) =>
            x.id === this.editedItem.id &&
            x.compartirTipo === TipoCompartir.Flota
        );

        if (resVeh.data.length > 0) {
          this.msgAdvertenciaVehiculoCompartido =
            'El Vehículo se encuentra actualmente compartido con ' +
            (resVeh.data.length === 1 ? 'el Cliente ' : 'los Clientes ');

          resVeh.data.forEach((v: any, index: number) => {
            if (index === resVeh.data.length - 1) {
              this.msgAdvertenciaVehiculoCompartido += `${
                v.compartidoPor
              }, por lo que si desasocia el Vehículo ${
                resVeh.data.length === 1
                  ? 'el Cliente dejará'
                  : 'los Clientes dejarán'
              } de recibir información ¿Desea continuar?`;
            } else if (index < resVeh.data.length - 1) {
              this.msgAdvertenciaVehiculoCompartido += `${v.compartidoPor}, `;
            }
          });

          this.showAdvertenciaVehiculoCompartido = true;
        } else {
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
            this.btnBloquear = true;
            this.btnBloquearCerrar = true;
            if (this.validaRobarConductor())
              this.showAlertaRobarConductor = true;
            else this.dialogConfirmacion = true;
          } else {
            this.bottomNav = this.asociarGeocerca.step;
            this.boolCierraModal = false;
            this.mensajeAsociarGeocercas = this.$t(
              'mensajes.mensajesError.cargaGeocercasVehiculo'
            );
            this.dialogErrorWarningGuardar = true;
          }
        }
      } else {
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
          this.btnBloquear = true;
          this.btnBloquearCerrar = true;
          if (this.validaRobarConductor()) this.showAlertaRobarConductor = true;
          else this.dialogConfirmacion = true;
        } else {
          this.bottomNav = this.asociarGeocerca.step;
          this.boolCierraModal = false;
          this.mensajeAsociarGeocercas = this.$t(
            'mensajes.mensajesError.cargaGeocercasVehiculo'
          );
          this.dialogErrorWarningGuardar = true;
        }
      }
    }
  }

  async confirmCallbackVehiculoCompartido(aceptado: boolean) {
    this.showAdvertenciaVehiculoCompartido = false;
    if (aceptado) {
      await this.confirmCallback(aceptado);
    } else {
      this.btnBloquear = false; //Compartir Información - Revisión # 1 (DES)
      this.btnBloquearCerrar = false;
    }
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;
    this.showAlertaRobarConductor = false;

    if (aceptado) {
      try {
        this.loadingService.showLoading();
        const resVal: any = await this.$validator.validateAll();
        if (resVal) {
          this.btnBloquear = true;
          this.btnBloquearCerrar = true;
          await this.actualizarVehiculo();

          if (this.startedFlota !== this.flotaSeleccionado) {
            await this.actualizarFlotas();
          }

          if (!this.guardarInactivo) {
            await this.actualizarGPSs();
            await this.actualizarEtiquetas();
            await this.actualizarConductores();
            await this.actualizarGeocercas();
          } else {
            await this.desasociarTodo();
          }

          if (!this.dialogErrorWarningGuardar) {
            this.close();
          }
        }
      } catch (e) {
        if (e.response !== undefined) {
          if (e.response.status !== 401) {
            this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
          }
        } else {
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
        }
      } finally {
        this.btnBloquear = false;
        this.btnBloquearCerrar = false;
        this.loadingService.hideLoading();
      }
    } else {
      this.btnBloquear = false;
      this.btnBloquearCerrar = false;
    }
    this.btnBloquear = false;
    this.btnBloquearCerrar = false;
  }

  confirmCallbackConfirm(aceptar: boolean) {
    this.dialogConfirmacionClose = false;
    if (aceptar) {
      this.closeModal(false);
    }
    this.btnBloquear = false;
    this.btnBloquearCerrar = false;
  }

  async obtenerEtiquetas() {
    try {
      const responseEtiquetas = await this.axiosVehiculo.http.get(
        `${this.controllerVehiculoEtiqueta}/${this.clienteId()}/cliente`
      );
      if (responseEtiquetas !== null && responseEtiquetas !== undefined) {
        responseEtiquetas.data = responseEtiquetas.data.map((node: any) => ({
          ...node,
          estadoTxt: EstadoEntidad[node.estado],
        }));
        this.etiquetaRespaldo = responseEtiquetas.data;

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

  async obtenerGPS() {
    if (this.editedItem.id !== undefined) {
      const responseGps = await this.axiosGps.http.get(
        `${this.controllerGps}/${this.editedItem.id}/disponibles`
      );
      if (responseGps !== null && responseGps !== undefined) {
        this.gpsRespaldo = responseGps.data;
        if (this.editedItem.esCompartido) {
          this.gpsRespaldo = this.gpsRespaldo.filter(
            x => x.clienteId == this.editedItem.clienteCompartioId
          );
        } else {
          this.gpsRespaldo = this.gpsRespaldo.filter(
            x => x.clienteId == this.clienteId()
          );
        }
      }
    }
    if (this.gpsRespaldo.length > 0) {
      this.gpsRespaldo.forEach((x: any) => {
        x.gpsCoordenada = x.gpsCoordenada.filter(
          (geo: any) => geo.fechaFinAsociacion === null
        );
      });
      this.mostrarGps = true;
    } else {
      this.mostrarGps = false;
    }
  }

  async obtenerConductores() {
    if (this.editedItem.esCompartido) {
      const responseConductores = await this.axiosVehiculo.http.get(
        `${this.controllerConductor}/${this.editedItem.clienteCompartioId}/cliente`
      );
      this.conductorRespaldo = responseConductores.data;
    } else {
      const responseConductores = await this.axiosVehiculo.http.get(
        `${this.controllerConductor}/${this.clienteId()}/cliente`
      );
      this.conductorRespaldo = responseConductores.data;
    }
  }

  async obtenerFlotas() {
    const responseFlotas = await this.axiosVehiculo.http.get(
      `${this.controllerFlota}/cliente/${this.clienteId()}/compartido/0`
    );
    this.flota = responseFlotas.data;
    this.establecerFlota();
  }

  async obtenerVehiculosTipo() {
    if (
      this.editedItem.vehiculoTipoId === null ||
      this.editedItem.vehiculoTipoId === undefined
    ) {
      this.editedItem.vehiculoTipoId = -1;
    }

    const responseVehiculoTipoEditar = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculoTipo}/${this.editedItem.vehiculoTipoId}/tiposVehiculo`
    );

    this.tipoVehiculo = responseVehiculoTipoEditar.data;
  }

  async obtenerMarcas() {
    const responseMarcas = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculoMarca}/`
    );
    this.marca = responseMarcas.data;
  }

  async obtenerModelos(e: any) {
    console.log('VAlor e :' + e);
    this.modelo = [];
    const responseModelos = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculoMarca}/${e}/modelos`
    );
    responseModelos.data.forEach((x: IModelo) => {
      if (x.nombre == 'NO DEFINIDO') {
        this.modelo.unshift(x);
        this.modeloSeleccionado = x.id;
        //this.vehiculoModeloId = x.id;
      } else {
        x.nombre = `${x.nombre} - ${x.ano}`;
        this.modelo.push(x);
      }
    });
    // responseModelos.data.forEach((x: IModelo) => {
    //   x.nombre = `${x.nombre} - ${x.ano}`;
    //   this.modelo.push(x);
    // });
  }

  async obtenerTipoPeajes() {
    const responseTipoPeajes = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculoTipoPeaje}/`
    );
    this.tipoPeaje = responseTipoPeajes.data;
  }

  async obtenerTipoTransmision() {
    const responseTipoTransmision = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculoTipoTransmision}/`
    );
    this.tipoTransmision = responseTipoTransmision.data;
  }

  async obtenerTipoCombustible() {
    const responseTipoCombustible = await this.axiosVehiculo.http.get(
      `${this.controllerVehiculoTipoCombustible}/`
    );
    this.tipoCombustible = responseTipoCombustible.data;
  }

  async actualizarVehiculo() {
    //Validacion Unidad
    this.editedItem.unidad = '';
    if (this.editedItem.patente.length > 0) {
      this.editedItem.unidad = this.editedItem.patente;
    } else if (this.editedItem.vin.length > 0) {
      this.editedItem.unidad = this.editedItem.vin;
    }

    const model = {
      Id: this.editedItem.id,
      vehiculoTipoId: this.tipoVehiculoSeleccionado,
      vehiculoModeloId: this.modeloSeleccionado,
      vehiculoTipoCombustibleId: this.tipoCombustibleSeleccionado,
      vehiculoTipoPeajeId: this.tipoPeajeSeleccionado,
      vehiculoTipoTransmisionId: this.tipoTransmisionSeleccionado,
      color: this.editedItem.color,
      ano: this.editedItem.ano,
      patente: this.editedItem.patente,
      referencia: this.editedItem.referencia,
      numeroMotor: this.editedItem.numeroMotor,
      numeroChasis: this.editedItem.numeroChasis,
      vin: this.editedItem.vin,
      unidad: this.editedItem.unidad,
      poseeTag: this.editedItem.poseeTag,
      estado: this.estadoSeleccionado, //this.editedItem.estado
      valorRPM: this.editedItem.valorRPM,
      horasDisponible: this.editedItem.horasDisponible,
    };

    await this.axiosVehiculo.http.put(`${this.controllerVehiculo}/`, model);
  }

  async actualizarEtiquetas() {
    let etiquetaModelListPost: any = [];
    let etiquetaModelListPut: any = [];
    let etiquetaModelListDelete: any = [];

    this.etiquetaAsignados.forEach((etiquetas: any) => {
      let etiquetaModel = etiquetas;
      let exists = this.vehiculoEtiqueta.find(
        x => x.vehiculoEtiquetaId == etiquetas.id
      );

      if (exists == null) {
        etiquetaModel = {
          vehiculoEtiquetaId: etiquetas.id,
          vehiculoId: this.editedItem.id,
        };
        etiquetaModelListPost.push(etiquetaModel);
      } else {
        etiquetaModel = {
          id: exists.id,
          vehiculoEtiquetaId: etiquetas.id,
          vehiculoId: this.editedItem.id,
        };
        etiquetaModelListPut.push(etiquetaModel);
      }
    });

    this.vehiculoEtiqueta.forEach((cl: any) => {
      let exists = this.etiquetaAsignados.find(
        x => x.id == cl.vehiculoEtiquetaId
      );
      if (exists == null) {
        let etiquetaModel = { id: cl.id };
        etiquetaModelListDelete.push(etiquetaModel);
      }
    });

    if (etiquetaModelListDelete.length > 0) {
      await this.axiosVehiculo.http.delete(
        `${this.controllerVehiculoEtiquetaVehiculo}/`,
        { data: etiquetaModelListDelete }
      );
    }

    if (etiquetaModelListPut.length > 0) {
      await this.axiosVehiculo.http.put(
        `${this.controllerVehiculoEtiquetaVehiculo}/`,
        etiquetaModelListPut
      );
    }

    if (etiquetaModelListPost.length > 0) {
      await this.axiosVehiculo.http.post(
        `${this.controllerVehiculoEtiquetaVehiculo}/`,
        etiquetaModelListPost
      );
    }
  }

  async actualizarGPSs() {
    let gpsModelListPost: any = [];
    let gpsModelListPut: any = [];
    let gpsModelListDelete: any = [];

    if (this.gpsAsignados[0] !== undefined) {
      this.gpsAsignados.forEach((gpss: any) => {
        let gpsModel = gpss;
        let exists = this.vehiculoGps.find(x => x.gpsId == gpss.id);

        let gpsPrincipals: boolean =
          this.gpsPrincipal === gpss.id ? true : false;

        if (exists == null) {
          gpsModel = {
            gpsId: gpss.id,
            vehiculoId: this.editedItem.id,
            gpsPrincipal: gpsPrincipals,
          };
          gpsModelListPost.push(gpsModel);
        } else {
          gpsModel = {
            id: exists.id,
            gpsId: gpss.id,
            vehiculoId: this.editedItem.id,
            gpsPrincipal: gpsPrincipals,
          };
          gpsModelListPut.push(gpsModel);
        }
      });
    }

    this.vehiculoGps.forEach((cl: any) => {
      let exists = null;
      if (this.gpsAsignados[0] != undefined)
        exists = this.gpsAsignados.find(x => x.id == cl.gpsId);

      if (exists == null) {
        let gpsModel = { id: cl.id };
        gpsModelListDelete.push(gpsModel);
      }
    });

    if (gpsModelListDelete.length > 0) {
      await this.axiosGps.http.delete(
        `${this.controllerGpsVehiculo}/vehiculo/`,
        {
          data: gpsModelListDelete,
        }
      );
    }

    if (gpsModelListPut.length > 0) {
      await this.axiosGps.http.put(
        `${this.controllerGpsVehiculo}/`,
        gpsModelListPut
      );
    }

    if (gpsModelListPost.length > 0) {
      await this.axiosGps.http.post(
        `${this.controllerGpsVehiculo}/`,
        gpsModelListPost
      );
    }
  }

  async actualizarGeocercas() {
    let geocercaModelListPost: any = [];
    let geocercaModelListPut: any = [];
    let geocercaModelListDelete: any = [];
    let geocercaModelListDeleteAux: any = [];

    if (this.geocercaAsignados == undefined) this.geocercaAsignados = [];
    this.geocercaAsignados.forEach((geocerca: any) => {
      let geocercaModel = geocerca;
      let exists = this.vehiculoCoordenadas.find(
        x => x.coordenadaId == geocerca.id && x.gpspId == this.gpsPrincipal
      );

      if (exists == null) {
        geocercaModel = {
          CoordenadaId: geocerca.id,
          VehiculoId: this.editedItem.id,
          GpsId: this.gpsPrincipal,
          Vertices: geocerca.puntos,
          Circulos: geocerca.circulos,
          TipoGeometria: geocerca.tipoGeometria,
          FormaJson: geocerca.formaJson,
          VelocidadMaxGeo: geocerca.velocidadMaxGeo,
        };
        geocercaModelListPost.push(geocercaModel);
      } else {
        geocercaModel = {
          CoordenadaId: exists.coordenadaId,
          VehiculoId: this.editedItem.id,
          GpsId: this.gpsPrincipal,
          Vertices: geocerca.puntos,
          Circulos: geocerca.circulos,
          TipoGeometria: geocerca.tipoGeometria,
          FormaJson: geocerca.formaJson,
          VelocidadMaxGeo: geocerca.velocidadMaxGeo,
        };
        geocercaModelListPut.push(geocercaModel);
      }
    });

    //Valida que no hayan Geocercas
    let notifica = false;
    if (geocercaModelListPost.length === 0 && geocercaModelListPut.length === 0)
      notifica = true;
    //---

    this.vehiculoCoordenadas.forEach((cl: any) => {
      let clModel = cl;
      //Elimino todas las coordenadas que no pertenezcan al GPS Principal
      if (clModel.gpsId !== this.gpsPrincipal && this.gpsPrincipal > 0) {
        let geocercaModel = {
          CoordenadaId: clModel.coordenadaId,
          VehiculoId: this.editedItem.id,
          GpsId: clModel.gpsId,
          notificaGps: notifica, //Valida que no hayan Geocercas
          moduloLlamado: 'vehículos',
        };
        geocercaModelListDeleteAux.push(geocercaModel);
      }
      //---

      //Elimino las Geocercas no Seleccionadas
      let exists = this.geocercaAsignados.find(
        x => x.id == clModel.coordenadaId
      );
      if (exists === null || exists === undefined) {
        let geocercaModel = {
          CoordenadaId: clModel.coordenadaId,
          VehiculoId: this.editedItem.id,
          GpsId: clModel.gpsId,
          notificaGps: notifica, //Valida que no hayan Geocercas
          moduloLlamado: 'vehículos',
        };
        geocercaModelListDeleteAux.push(geocercaModel);
      }
      //---
    });

    //No eliminar Geocercas Compartidas
    if (geocercaModelListDeleteAux.length > 0) {
      geocercaModelListDeleteAux.forEach((cl: any) => {
        let exists = this.geocercaAsignadosOC.find(
          x => x.coordenadaId === cl.CoordenadaId
        );
        if (exists === null || exists === undefined) {
          geocercaModelListDelete.push(cl);
        }
      });
    }
    //---

    if (geocercaModelListDelete.length > 0) {
      await this.axiosGps.http.delete(`${this.controllerGpsCoordenada}/`, {
        data: geocercaModelListDelete,
      });
    }

    if (geocercaModelListPut.length > 0) {
      await this.axiosGps.http.put(
        `${this.controllerGpsCoordenada}/`,
        geocercaModelListPut
      );
    }

    if (geocercaModelListPost.length > 0) {
      let res = await this.axiosGps.http.post(
        `${this.controllerGpsCoordenada}/`,
        geocercaModelListPost
      );

      //634 - [INTERNA] - Definir solución para concurrencia en asignación de geocercas en vehículo que están compartido
      if (res.data) {
        if (!res.data.respuesta) {
          this.boolCierraModal = true;
          var messageError: any = this.$t(
            'mensajes.mensajesError.concurrenciaGeocercasVehiculo'
          );
          this.mensajeAsociarGeocercas = res.data.hasOwnProperty('mensaje')
            ? res.data.mensaje
            : messageError;
          this.dialogErrorWarningGuardar = true;
        }
      }
      //---
    }
  }

  async setVehiculoCoordenadas() {
    const self = this;
    if (this.editedItem.id != undefined) {
      const res: { data: IZona[] } = await this.axiosGps.http.get(
        `${this.controllerGpsCoordenada}/${this.editedItem.id}/coordsbyvehicle`
      );

      res.data = res.data.map(zona => ({
        ...zona,
        fechaInicioAsociacionTxt: self.fechaFilterTxt(
          zona.fechaInicioAsociacion
        ),
        fechaAsociacionFisicaTxt: self.fechaFilterTxt(
          zona.fechaAsociacionFisica
        ),
        estadoAsociacionTxt: EstadoEnvioGps[zona.estadoEnvioGps].replace(
          /_/g,
          ' '
        ),
      }));

      this.vehiculoCoordenadas = res.data;
      this.vehiculoCoordenadas.forEach((cl: any) => {
        let objCoordenada = this.geocercaRespaldo.find(
          x => x.id == cl.coordenadaId
        );
        if (objCoordenada !== undefined) {
          objCoordenada.fechaInicioAsociacion = cl.fechaInicioAsociacion;
          objCoordenada.fechaInicioAsociacionTxt = cl.fechaInicioAsociacionTxt;
          // this.formatDateString(
          //   cl.fechaInicioAsociacion.substr(0, 10)
          // );
          if (cl.fechaAsociacionFisica !== null) {
            objCoordenada.fechaAsociacionFisica = cl.fechaAsociacionFisica;
            objCoordenada.fechaAsociacionFisicaTxt =
              cl.fechaAsociacionFisicaTxt;
            // this.formatDateString(
            //   cl.fechaAsociacionFisica.substr(0, 10)
            // );
          } else {
            objCoordenada.fechaAsociacionFisica = '';
            objCoordenada.fechaAsociacionFisicaTxt = '';
          }

          objCoordenada.estadoAsociacion = cl.estadoEnvioGps;
          objCoordenada.estadoAsociacionTxt = cl.estadoAsociacionTxt;

          this.geocercaAsignados.push(objCoordenada);
          this.geocercaAsignadosModel.push(cl.coordenadaId);
          this.geoSeleccionadas.push(objCoordenada);
          //this.showMessage = true;
        } else {
          this.geocercaAsignadosOC.push(cl); //EMR - Geocercas Compartidas
        }
      });

      this.geocercaAsignadosResp = Object.assign([], this.geocercaAsignados);
    }
  }

  async actualizarConductores() {
    let conductorModelListPost: any = [];
    let conductorModelListPut: any = [];
    let conductorModelListDelete: any = [];

    if (this.conductorAsignados === undefined) this.conductorAsignados = [];

    this.conductorAsignados.forEach((conductores: any) => {
      let conductorModel = conductores;
      let exists = this.vehiculoConductor.find(
        x => x.conductorId == conductores.id
      );

      if (exists == null) {
        conductorModel = {
          conductorId: conductores.id,
          vehiculoId: this.editedItem.id,
        };
        conductorModelListPost.push(conductorModel);
      } else {
        conductorModel = {
          id: exists.id,
          conductorId: conductores.id,
          vehiculoId: this.editedItem.id,
        };
        conductorModelListPut.push(conductorModel);
      }
    });

    this.vehiculoConductor.forEach((cl: any) => {
      let clModel = cl;
      let exists = this.conductorAsignados.find(
        x => x.id == clModel.conductorId
      );
      if (exists === null || exists === undefined) {
        let conductorModel = {
          id: clModel.id,
        };
        conductorModelListDelete.push(conductorModel);
      }
    });

    //"Robar Conductor" - Se elimina la asociacion del conductor de otro vehiculo (si existiera)
    const res: any = await this.axiosVehiculo.http.get('ConductorVehiculo');
    this.vehiculoConductorEliminar = res.data;
    this.conductorAsignados.forEach((conductores: any) => {
      let eliminar = this.vehiculoConductorEliminar.find(
        x =>
          x.vehiculoId != this.editedItem.id && x.conductorId == conductores.id
      );
      if (eliminar !== undefined && eliminar !== null) {
        let conductorModel = {
          id: eliminar.id,
        };
        conductorModelListDelete.push(conductorModel);
      }
    });

    if (conductorModelListDelete.length > 0) {
      await this.axiosVehiculo.http.delete(
        `${this.controllerConductorVehiculo}/`,
        { data: conductorModelListDelete }
      );
    }

    if (conductorModelListPut.length > 0) {
      await this.axiosVehiculo.http.put(
        `${this.controllerConductorVehiculo}/`,
        conductorModelListPut
      );
    }

    if (conductorModelListPost.length > 0) {
      await this.axiosVehiculo.http.post(
        `${this.controllerConductorVehiculo}/`,
        conductorModelListPost
      );
    }
  }

  async actualizarFlotas() {
    let vehiculosFlotaModelListPost: any = [];

    let flotaModel: any = {};
    flotaModel = {
      flotaId: this.flotaSeleccionado,
      vehiculoId: this.editedItem.id,
      clienteId: config.getClienteSesion(),
    };
    vehiculosFlotaModelListPost.push(flotaModel);

    if (vehiculosFlotaModelListPost.length > 0) {
      if (this.startedFlota !== this.flotaSeleccionado) {
        const model: number[] = [this.editedItem.id];

        //1. Valido si el Vehiculo es Compartido en la Flota/Individual
        const response1: any = await this.axiosVehiculo.http.get(
          `${this.controllerVehiculo}/${
            this.editedItem.id
          }/${this.clienteId()}/vehiculoEsCompartido`
        );
        const vehiculoCompartido1: any = response1.data.filter(
          (x: any) => x.id === this.editedItem.id
        );
        //---

        //2. Asocio a nueva Flota
        await this.axiosVehiculo.http.post(
          `${this.controllerVehiculoFlota}/asocia/`,
          vehiculosFlotaModelListPost
        );
        //---

        //3. Valido si es compartido en la nueva Flota/Individual
        const response2: any = await this.axiosVehiculo.http.get(
          `${this.controllerVehiculo}/${
            this.editedItem.id
          }/${this.clienteId()}/vehiculoEsCompartido`
        );
        const vehiculoCompartido2: any = response2.data.filter(
          (x: any) => x.id === this.editedItem.id
        );
        //---

        //4. Notifico si se elimino de flota compartida
        if (vehiculoCompartido1.length > 0) {
          //estaba compartido
          if (vehiculoCompartido1[0].compartirTipo === TipoCompartir.Flota) {
            await this.enviarCorreoRemover(model, this.startedFlota);
          }
        }
        //---

        //5. Notifico si se agrega a nueva flota compartida
        if (vehiculoCompartido2.length > 0) {
          //pasa a nueva flota compartida
          if (vehiculoCompartido2[0].compartirTipo === TipoCompartir.Flota) {
            await this.enviarCorreoAgregar(model, this.flotaSeleccionado);
          }
        }
        //---
      } else {
        await this.axiosVehiculo.http.post(
          `${this.controllerVehiculoFlota}/asocia/`,
          vehiculosFlotaModelListPost
        );
      }
    }
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

  close() {
    this.loadingService.hideLoading();
    this.btnBloquear = false;
    this.btnBloquearCerrar = false;
    this.closeModal(false);
    this.dialogConfirmacion = false;
    this.showAlertaRobarConductor = false;
    this.mensajeRobarConductor = '';
    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
  }

  closeErrorWarningGuardar() {
    this.dialogErrorWarningGuardar = false;
    this.btnBloquear = false;
    if (this.boolCierraModal) {
      this.close();
    }
  }

  generarColumnasGrilla() {
    this.columnDefsEtiquetas = [
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
        sort: 'desc',
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
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        rowDrag: true,
        resizable: true,
        lockVisible: true,
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
        headerName: 'Estado',
        lockPinned: true,
        field: 'estadoTxt',
        rowDrag: true,
        minWidth: 80,
        width: 200,
        resizable: true,
        enablePivot: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
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

    this.columnDefsGps = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: !this.editedItem.esCompartido,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        sort: 'desc',
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
        cellStyle: params =>
          this.editedItem.esCompartido
            ? { textAlign: 'left', 'pointer-events': 'none' }
            : { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        rowDrag: true,
        enablePivot: true,
        lockPinned: true,
        resizable: true,
        minWidth: 80,
        hide: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'GPS Principal',
        cellRenderer: this.createCheckboxCellGps,
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
        lockPinned: true,
        sortable: true,
        resizable: true,
        lockVisible: true,
        width: 200,
        field: 'numeroSerie',
        minWidth: 80,
        cellStyle: {
          textAlign: 'left',
        },
      },
      {
        headerName: 'Marca',
        field: 'gpsModelo.gpsMarca.nombre',
        rowDrag: true,
        resizable: true,
        lockPinned: true,
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
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        rowDrag: true,
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
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        rowDrag: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      /*,
                {
                  headerName: "",
                  enablePivot: false,
                  rowDrag: false,
                  pinned: "right",
                  sortable: false,
                  cellStyle: { textAlign: "left" }
                }*/
    ];

    this.columnDefsGeocercas = [
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
        sort: 'desc',
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
        headerName: '',
        width: 40,
        cellRenderer: this.crearBotonWarning,
        enablePivot: false,
        resizable: true,
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
        lockPinned: true,
        resizable: true,
        enablePivot: true,
        lockVisible: true,
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
        headerName: 'Tipo Geometría',
        field: 'tipoGeometriaTxt',
        rowDrag: true,
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
      {
        headerName: 'Fecha Asign. Geocerca',
        field: 'fechaInicioAsociacion',
        valueFormatter: this.fechaFilter,
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
        headerName: 'Fecha Asign. Física',
        field: 'fechaAsociacionFisica',
        valueFormatter: this.fechaFilter,
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
        field: 'estadoAsociacionTxt',
        sortable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
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
        field: 'fechaInicioAsociacionTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
      {
        field: 'fechaAsociacionFisicaTxt',
        hide: true,
        filter: false,
        lockVisible: true,
        suppressToolPanel: true,
      },
    ];

    this.columnDefsConductores = [
      {
        headerName: '',
        field: 'checked',
        width: 75,
        minWidth: 75,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        sort: 'desc',
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
        cellStyle: params =>
          this.editedItem.esCompartido
            ? { textAlign: 'left', 'pointer-events': 'none' }
            : { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        rowDrag: true,
        lockPinned: true,
        enablePivot: true,
        resizable: true,
        minWidth: 80,
        hide: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: '',
        width: 70,
        minWidth: 80,
        cellRenderer: this.createButtonCellConductoresAlerta,
        lockPinned: true,
        enablePivot: false,
        resizable: false,
        sortable: false,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Rut',
        field: 'rut',
        lockPinned: true,
        rowDrag: true,
        enablePivot: true,
        resizable: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombreCompleto',
        lockPinned: true,
        resizable: true,
        minWidth: 80,
        width: 200,
        rowDrag: true,
        lockVisible: true,
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
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
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
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        lockPinned: true,
        resizable: true,
        width: 200,
        minWidth: 80,
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
    ];

    if (!this.esEdicion) {
      this.columnDefsEtiquetas.shift();
      this.columnDefsGps.shift();
      this.columnDefsGeocercas.shift();
      this.columnDefsGeocercas.splice(1, 1);
      this.columnDefsConductores.shift();
      this.columnDefsConductores.splice(1, 1);
    } else if (this.editedItem.esCompartido) {
      this.columnDefsGps.shift();
    }

    // this.setRemoveButton();
  }

  clienteId() {
    return config.getClienteSesion();
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
          '- GPS asociado al vehículo excede límite de Polígonos permitidos.\n';
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
      eButton.setAttribute('id', 'warningGeocercaEditar' + params.data.id);
      eButton.innerHTML =
        '<i aria-hidden="true" class="v-icon material-icons v-alert__icon">warning</i>';
      return eButton;
    }
  }

  establecerAnoModelo(e: any) {
    const valor = this.modelo.find(x => x.id == e);
    this.editedItem.ano = valor.ano.toString();
  }

  selectedTipoTransmisionId(e: any) {
    //this.vehiculoTipoTransmisionId = e
  }

  selectedTipoCombustibleId(e: any) {
    //this.vehiculoTipoCombustibleId = e
  }

  selectedTipoVehiculoId(e: any) {
    //this.vehiculoTipoId = e
  }

  selectedTipoPeajeId(e: any) {
    // this.vehiculoTipoPeajeId = e
  }

  selectedFlotaId(e: any) {
    // this.vehiculoFlotaId = e
  }

  //########## Guardar Vehículo Inactivo ##########
  selectedEstado(e: any) {
    if (e === EstadoEntidad.Inactivo) {
      if (this.tieneAsociaciones())
        this.warningInactivo = this.$t(
          'mensajes.crud.inactivoAsociado.mensaje'
        );
      else this.warningInactivo = this.$t('mensajes.crud.inactivo.mensaje');
      this.guardarInactivo = true;
      this.mensajeConfirmacionInactivo =
        this.warningInactivo +
        ' ' +
        this.$t('mensajes.crud.editar.mensaje', { entidad: 'el Vehículo' });
    } else {
      this.warningInactivo = '';
      this.guardarInactivo = false;
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.editar.mensaje',
        { entidad: 'el Vehículo' }
      );
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

  tieneAsociaciones() {
    if (
      this.etiquetaAsignados.length > 0 ||
      this.gpsAsignados.length > 0 ||
      this.geocercaAsignados.length > 0 ||
      this.conductorAsignados.length > 0
    )
      return true;
    else return false;
  }

  async desasociarTodo() {
    try {
      let rem = await this.axiosVehiculo.http.post(
        `${this.controllerVehiculo}/${
          this.editedItem.id
        }/${this.clienteId()}/removerAsociacionesVehiculo`
      );
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        this.handleErrors.showError(error);
      } else {
        this.handleErrors.showError(error);
      }
    }
  }
  //##########
  async onSelectedChangeEtiquetasEditar() {
    this.etiquetaAsignados = this.gridApiEtiqueta.getSelectedRows();

    await this.actualizarGrillaEtiquetaEditar();
  }

  async onSelectedChangeGpsEditar() {
    this.gpsAsignados = this.gridApi2.getSelectedRows();
    await this.actualizarGrillaGpsEditar();
    if (!this.editedItem.esCompartido && this.esEdicion) {
      if (this.gpsAsignados.length === 0) {
        this.btnBloquear = false;
        this.btnBloquearCerrar = false;
        this.gpsPrincipal = 0;
        this.validateAllGeocercasForPrincipal();
      }

      this.gpsRespaldo.forEach((gps: any) => {
        let idCheckbox = 'btnLGpsPrinc' + gps.id;
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
    } else {
      //Ver Detalle y Editar de Compartidos - 20191014 AM - Observaciones Compartir Información
      if (this.gpsRespaldo.length >= 1) {
        this.gpsRespaldo.forEach((e: any) => {
          if (e.id === this.gpsPrincipal) {
            let idCheckbox = 'btnLGpsPrinc' + e.id;
            let c: any = document.getElementById(idCheckbox);
            if (c != null) {
              c.checked = true;
              c.disabled = true;
            } else {
              c.checked = false;
              c.disabled = true;
            }
          } else {
            //Si es compartido y no es GPS principal debe ir deshabilitado
            let idCheckbox = 'btnLGpsPrinc' + e.id;
            let c: any = document.getElementById(idCheckbox);
            if (c != null) {
              c.checked = false;
              c.disabled = true;
            }
            //---
          }
        });
      }
    }
  }

  onRowSelectedGeocercaEditar(event: any) {
    this.geoSelectedEditar = event.node;
    if (this.geoSelectedEditar.selected) {
      this.geoSeleccionadasAux.push(this.geoSelectedEditar.data);
    }
    this.geosCountEditar++;
  }

  async onSelectedChangeGeocercaEditar(event: SelectionChangedEvent) {
    this.contadorEventoGrillaSelection++;
    if (this.geocercaAsignados.length === 0) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
    }

    if (this.contadorEventoGrillaSelection === this.contadorEventoGrilla) {
      this.contadorEventoGrillaSelection = 0;
      this.contadorEventoGrilla = 0;
      this.contadorEventoGrilla++;
      this.contadorValidacionesGeo++;
      await this.actualizarGrillaGeocercaEditar();
      this.geocercaAsignados = this.gridApiGeo.getSelectedRows();
      this.geoSeleccionadas = uniqBy(this.geoSeleccionadas, 'id');

      // validaciones geocercas seleccionadas
      if (this.geosCountEditar === 1 && this.geoSelectedEditar != null) {
        if (this.geoSelectedEditar.selected) {
          this.geocercaAsignados.forEach(async (e: any) => {
            if (e.id === this.geoSelectedEditar.data.id) {
              e.warnGeocercas = false;
              e.warnPuntos = false;
              e.warnCirculos = false;
              e.warnSoportaCirculos = false;
              e.warnPuntosPorGeo = false;
              this.geoSeleccionadas.push(e);
              await this.validaGeocercaForPrincipal(e);
            }
          });
          this.gridApiGeo.refreshCells({ force: true });
        } else {
          this.geoSeleccionadas.forEach(async (e: any) => {
            e.warnGeocercas = false;
            e.warnPuntos = false;
            e.warnCirculos = false;
            e.warnSoportaCirculos = false;
            e.warnPuntosPorGeo = false;
          });
          await this.eliminarGeoSeleccionadas(this.geoSelectedEditar.data); // eliminar deseleccion del usuario
          this.validateAllGeocercasForPrincipal();
          this.gridApiGeo.refreshCells({ force: true });
        }
      } else if (this.geosCountEditar > 1 && this.geoSelectedEditar != null) {
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
        let idWarning = 'warningGeocercaEditar' + node.data.id;
        let warningGeocercaGrilla: any = document.getElementById(idWarning);
        if (warningGeocercaGrilla != undefined) {
          if (!selected) {
            warningGeocercaGrilla.style.display = 'none';
          }
        }
      });
      this.geoSeleccionadasAux = [];
    }

    this.geosCountEditar = 0;
  }

  eliminarGeoSeleccionadas(item: any) {
    for (let i = 0; i <= this.geoSeleccionadas.length - 1; i++) {
      if (this.geoSeleccionadas[i].id == item.id) {
        this.geoSeleccionadas.splice(i, 1);
        break;
      }
    }
  }

  async onSelectedChangeConductorEditar() {
    this.conductorAsignados = this.gridApi.getSelectedRows();
    await this.actualizarGrillaConductorEditar();
  }

  onFilterTextBoxChangedEtiquetasEditar() {
    this.gridApiEtiqueta.onFilterChanged();
    /*f (this.buscarEtiquetasEditar.length > 1) {
      this.gridApiEtiqueta.setQuickFilter(this.buscarEtiquetasEditar);
    } else {
      this.gridApiEtiqueta.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedGpsEditar() {
    this.gridApi2.onFilterChanged();
    /*if (this.buscarGpsEditar.length > 1) {
      this.gridApi2.setQuickFilter(this.buscarGpsEditar);
    } else {
      this.gridApi2.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedGeocercaEditar() {
    this.gridApiGeo.onFilterChanged();
    /*if (this.buscarGeocercaEditar.length > 1) {
      this.gridApiGeo.setQuickFilter(this.buscarGeocercaEditar);
    } else {
      this.gridApiGeo.setQuickFilter('');
    }*/
  }

  onFilterTextBoxChangedConductorEditar() {
    this.gridApi.onFilterChanged();
    /*if (this.buscarConductorEditar.length > 1) {
      this.gridApi.setQuickFilter(this.buscarConductorEditar);
    } else {
      this.gridApi.setQuickFilter('');
    }*/
  }

  elementosChequeadosGrilla() {
    const self = this;

    if (!this.esEdicion) {
      this.etiquetaRespaldo = this.etiquetaAsignados;
    }

    this.gridApiEtiqueta.forEachNode(function(node: any) {
      var index = self.etiquetaAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
      }
    });

    this.gridApi2.forEachNode(function(node: any) {
      var index = self.gpsAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
      }
    });

    if (!this.esEdicion) {
      this.gpsRespaldo = this.gridApi2.getSelectedRows();
    }

    if (!this.esEdicion) {
      this.geocercaRespaldo = this.geocercaAsignados;
    }

    this.gridApiGeo.forEachNode(function(node: any) {
      var index = self.geocercaAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        self.contadorEventoGrilla++;
      }
    });

    if (!this.esEdicion) {
      this.conductorRespaldo = this.conductorAsignados;
    }

    this.gridApi.forEachNode(function(node: any) {
      var index = self.conductorAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
      }
    });
  }

  actualizarGrillaEtiquetaEditar() {
    const etiquetasSeleccionadas = this.gridApiEtiqueta
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const etiquetasNoSeleccionadas = differenceBy(
      this.etiquetaRespaldo,
      etiquetasSeleccionadas,
      eti => eti.id
    ).map(eti => ({
      ...eti,
      checked: false,
    }));

    this.gridApiEtiqueta.updateRowData({
      update: [...etiquetasNoSeleccionadas, ...etiquetasSeleccionadas],
    });
  }

  actualizarGrillaGpsEditar() {
    const gpsSeleccionados = this.gridApi2
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const gpsNoSeleccionados = differenceBy(
      this.gpsRespaldo,
      gpsSeleccionados,
      gps => gps.id
    ).map(gps => ({
      ...gps,
      checked: false,
    }));

    this.gridApi2.updateRowData({
      update: [...gpsNoSeleccionados, ...gpsSeleccionados],
    });
  }

  actualizarGrillaGeocercaEditar() {
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

  actualizarGrillaConductorEditar() {
    const conductoresSeleccionados = this.gridApi
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

    this.gridApi.updateRowData({
      update: [...conductoresNoSeleccionados, ...conductoresSeleccionados],
    });
  }

  getRowNodeIdEtiquetaEditar(rowIdEtiquetaEditar: IEtiqueta) {
    if (!rowIdEtiquetaEditar) {
      return;
    }
    return rowIdEtiquetaEditar.id;
  }

  getRowNodeIdGpsEditar(rowIdGpsEditar: IGPS) {
    if (!rowIdGpsEditar) {
      return;
    }
    return rowIdGpsEditar.id;
  }

  getRowNodeIdGeocercaEditar(rowIdGeocercaEditar: IZona) {
    if (!rowIdGeocercaEditar) {
      return;
    }
    return rowIdGeocercaEditar.id;
  }

  getRowNodeIdConductorEditar(rowIdConductorEditar: IConductor) {
    if (!rowIdConductorEditar) {
      return;
    }
    return rowIdConductorEditar.id;
  }

  limpiarGeocercasSeleccionadas() {
    this.geocercaAsignados.forEach((geo: any) => {
      geo.checked = false;
    });
  }

  procesarFecha(params: any) {
    if (
      params.column.getColDef().field === 'fechaInicioAsociacion' ||
      params.column.getColDef().field === 'fechaAsociacionFisica'
    ) {
      return this.$options.filters.formatDate(params.value);
    } else {
      return params.value;
    }
  }

  validaRobarConductor() {
    this.mensajeRobarConductor = '';
    if (this.conductorAsignados.length > 0) {
      if (this.conductorAsignados[0].cantidadVehiculosAsociados > 0) {
        const item: any = this.conductorRespaldo.find(
          x => x.id == this.conductorAsignados[0].id
        );

        this.mensajeRobarConductor =
          'El Conductor seleccionado se encuentra actualmente asociado al Vehículo ' +
          item.unidadVehiculo +
          ', al guardar los cambios se perderá la asociación existente.';

        if (this.vehiculoConductor.length > 0) {
          if (
            this.conductorAsignados[0].id ===
            this.vehiculoConductor[0].conductorId
          )
            return false;
          else return true;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
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
    if (
      this.etiquetaRespaldo.length > 0 &&
      this.buscarEtiquetasEditar.length > 1
    ) {
      let busqueda = this.buscarEtiquetasEditar.toLowerCase();
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
    if (this.gpsRespaldo.length > 0 && this.buscarGpsEditar.length > 1) {
      let busqueda = this.buscarGpsEditar.toLowerCase();
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
    if (
      this.geocercaRespaldo.length > 0 &&
      this.buscarGeocercaEditar.length > 1
    ) {
      let busqueda = this.buscarGeocercaEditar.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.tipoGeometriaTxt.toLowerCase().includes(busqueda) ||
        node.data.fechaInicioAsociacionTxt.includes(busqueda) ||
        node.data.fechaAsociacionFisicaTxt.toLowerCase().includes(busqueda) ||
        node.data.estadoAsociacionTxt.toLowerCase().includes(busqueda)
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
    if (
      this.conductorRespaldo.length > 0 &&
      this.buscarConductorEditar.length > 1
    ) {
      let busqueda = this.buscarConductorEditar.toLowerCase();
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
.v-dialog--active {
  overflow: auto !important;
}
</style>

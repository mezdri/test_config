<template>
  <!-- FUNCIONALIDAD VER DETALLE -->
  <div>
    <v-layout row wrap>
      <template v-if="verDetalleActivo">
        <v-flex md3>
          <div
            align="right"
            class="text-xs-center animated fadeIn fast"
            style="border: 1px solid #f5f5f5"
            id="divRepetirDia2"
          >
            <v-card class="rounded-card" style="height: 390px; width: 100%">
              <v-card-title>
                <v-layout row>
                  <v-switch
                    title="Repetir día"
                    v-model="repetirDia.swicthRepetirDia"
                    label="Repetir Día"
                    @change="handleSwitchChange()"
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-switch>
                </v-layout>
                <v-layout row>
                  <v-switch
                    v-show="trazarRutaInferida.visible"
                    title="Trazar Ruta Inferida"
                    v-model="repetirDia.generaRuta"
                    label="Trazar Ruta Inferida"
                    color="warning"
                    @change="makeRutaInferida()"
                    :disabled="
                      !repetirDia.reproducirRepetirDia ||
                        !repetirDia.swicthRepetirDia
                    "
                  ></v-switch>
                </v-layout>

                <v-layout row wrap>
                  <v-flex md6 xs6>
                    <v-menu
                      :close-on-content-click="true"
                      v-model="repetirDia.menuDatePickerDesdeVD"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                      :disabled="
                        !repetirDia.reproducirRepetirDia ||
                          !repetirDia.swicthRepetirDia
                      "
                    >
                      <v-text-field
                        slot="activator"
                        v-model="computedDateFormattedDesde"
                        label="Desde"
                        persistent-hint
                        prepend-icon="event"
                        readonly
                        required
                        @change="buscarRepetirDia(1)"
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      ></v-text-field>
                      <v-date-picker
                        title="Fecha Desde"
                        v-model="repetirDia.dateDesde"
                        first-day-of-week="1"
                        locale="es-cl"
                        scrollable
                        @input="
                          repetirDia.menuDatePickerDesde = false;
                          buscarRepetirDia(1);
                        "
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      ></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex md6 xs6>
                    <v-menu
                      :close-on-content-click="true"
                      v-model="repetirDia.menuDatePickerHastaVD"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                      :disabled="
                        !repetirDia.reproducirRepetirDia ||
                          !repetirDia.swicthRepetirDia
                      "
                    >
                      <v-text-field
                        slot="activator"
                        v-model="computedDateFormattedHasta"
                        :rules="repetirDia.fechaRules"
                        label="Hasta"
                        persistent-hint
                        prepend-icon="event"
                        readonly
                        required
                        @change="buscarRepetirDia(2)"
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      ></v-text-field>
                      <v-date-picker
                        title="Fecha Hasta"
                        v-model="repetirDia.dateHasta"
                        first-day-of-week="1"
                        locale="es-cl"
                        scrollable
                        required
                        :max="repetirDia.fechaFinOld"
                        @input="
                          repetirDia.menuDatePickerHasta = false;
                          buscarRepetirDia(2);
                        "
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      ></v-date-picker>
                    </v-menu>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex md6 xs6>
                    <v-dialog
                      ref="dialogVerDetalleHoraInicio"
                      v-model="repetirDia.isVerDetalleHoraInicioOpen"
                      :return-value.sync="repetirDia.timeHoraInicio"
                      persistent
                      lazy
                      full-width
                      width="250px"
                      :disabled="
                        !repetirDia.reproducirRepetirDia ||
                          !repetirDia.swicthRepetirDia
                      "
                    >
                      <v-text-field
                        slot="activator"
                        v-model="repetirDia.timeHoraInicio"
                        label="Hora Inicio"
                        prepend-icon="access_time"
                        readonly
                        @change="buscarRepetirDia(3)"
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      ></v-text-field>
                      <v-time-picker
                        format="24hr"
                        v-if="repetirDia.isVerDetalleHoraInicioOpen"
                        v-model="repetirDia.timeHoraInicio"
                        full-width
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          flat
                          color="primary"
                          @click="repetirDia.isVerDetalleHoraInicioOpen = false"
                          >Cancelar</v-btn
                        >
                        <v-btn flat color="primary" @click="referenciaInicio()"
                          >Aceptar</v-btn
                        >
                      </v-time-picker>
                    </v-dialog>
                  </v-flex>
                  <v-flex md6 xs6>
                    <v-dialog
                      ref="dialogVerDetalleHoraTermino"
                      v-model="repetirDia.isVerDetalleHoraTerminoOpen"
                      :return-value.sync="repetirDia.timeHoraFin"
                      persistent
                      lazy
                      full-width
                      width="250px"
                      :disabled="
                        !repetirDia.reproducirRepetirDia ||
                          !repetirDia.swicthRepetirDia
                      "
                    >
                      <v-text-field
                        slot="activator"
                        v-model="repetirDia.timeHoraFin"
                        label="Hora Fin"
                        prepend-icon="access_time"
                        readonly
                        :disabled="
                          !repetirDia.reproducirRepetirDia ||
                            !repetirDia.swicthRepetirDia
                        "
                      ></v-text-field>
                      <v-time-picker
                        format="24hr"
                        v-if="repetirDia.isVerDetalleHoraTerminoOpen"
                        v-model="repetirDia.timeHoraFin"
                        full-width
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          flat
                          color="primary"
                          @click="
                            repetirDia.isVerDetalleHoraTerminoOpen = false
                          "
                          :disabled="!repetirDia.swicthRepetirDia"
                          >Cancelar</v-btn
                        >
                        <v-btn
                          flat
                          color="primary"
                          @click="referenciaFin()"
                          :disabled="
                            !repetirDia.reproducirRepetirDia ||
                              !repetirDia.swicthRepetirDia
                          "
                          >Aceptar</v-btn
                        >
                      </v-time-picker>
                    </v-dialog>
                  </v-flex>
                </v-layout>
                <v-layout row wrap>
                  <v-flex md12>
                    <v-subheader>Intervalo de tiempo entre puntos</v-subheader>
                    <v-slider
                      v-model="repetirDia.invervaloRepetirDiaSeleccionado"
                      :max="2"
                      :tick-labels="
                        repetirDia.intervalosRepetirDia.map(x => `${x} (s)`)
                      "
                      :disabled="
                        !repetirDia.reproducirRepetirDia ||
                          !repetirDia.swicthRepetirDia
                      "
                      class="v-slider"
                    ></v-slider>
                  </v-flex>

                  <v-flex md4 xs4 style="text-align: center">
                    <v-btn
                      outline
                      block
                      :disabled="
                        !repetirDia.btnAtrasEnabled ||
                          !repetirDia.swicthRepetirDia ||
                          repetirDia.btnDisabled
                      "
                      @click="nextPrev(-1)"
                    >
                      <v-icon>skip_previous</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex md4 xs4 style="text-align: center">
                    <v-btn
                      outline
                      block
                      @click="
                        repetirDia.btnPlayEvento === true ? play() : pause()
                      "
                      :disabled="
                        !repetirDia.btnPlayEnabled ||
                          !repetirDia.swicthRepetirDia ||
                          repetirDia.btnDisabled
                      "
                    >
                      <v-icon v-if="repetirDia.reproducirRepetirDia"
                        >play_circle_outline</v-icon
                      >
                      <v-icon v-else>pause_circle_outline</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex md4 xs4 style="text-align: center">
                    <v-btn
                      outline
                      block
                      @click="nextPrev(1, true)"
                      :disabled="
                        !repetirDia.btnSiguienteEnabled ||
                          !repetirDia.swicthRepetirDia ||
                          repetirDia.btnDisabled
                      "
                    >
                      <v-icon>skip_next</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-card-title>
            </v-card>

            <v-card class="rounded-card" style="height: 170px; width: 100%">
              <v-container>
                <v-layout row wrap>
                  <v-flex md12 sm12 xs12>
                    <v-text-field
                      readonly
                      style="font-size: 11px; padding-top: 0px; margin-top: 0px"
                      label="Conductor"
                      :value="
                        actividadMasReciente && actividadMasReciente.conductor
                      "
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout row wrap>
                  <v-flex md6 sm6 xs6>
                    <v-text-field
                      data-testid="ultima_transmision"
                      readonly
                      style="font-size: 11px; padding-top: 0px; margin-top: 0px"
                      label="Última Transmisión"
                      :value="
                        actividadMasReciente && actividadMasReciente.fecha
                      "
                    ></v-text-field>
                  </v-flex>
                  <v-flex md6 sm6 xs6>
                    <v-text-field
                      readonly
                      style="font-size: 11px; padding-top: 0px; margin-top: 0px"
                      label="Velocidad"
                      :value="
                        actividadMasReciente && actividadMasReciente.velocidad
                      "
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout row wrap>
                  <v-flex md12 sm12 xs12>
                    <v-text-field
                      readonly
                      style="font-size: 11px; padding-top: 0px; margin-top: 0px"
                      label="Última Localización"
                      :value="
                        actividadMasReciente && actividadMasReciente.ubicacion
                      "
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <br />
              </v-container>
            </v-card>
          </div>
        </v-flex>
      </template>

      <v-flex v-if="verDetalleActivo" md9>
        <div
          id="mapContainer"
          :class="verDetalleActivo ? 'mapContainerVerDetalle' : 'mapContainer'"
        ></div>
      </v-flex>
      <v-flex v-else md12>
        <div
          id="mapContainer"
          :class="verDetalleActivo ? 'mapContainerVerDetalle' : 'mapContainer'"
        ></div>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex md12 v-show="verDetalleActivo">
        <DetalleTabs :verDetalleActivo="verDetalleActivo" />
      </v-flex>
    </v-layout>

    <div class="google-map" v-show="false"></div>

    <!-- INICIO MODAL REPETIR DIA -->
    <corteIgnicion :show="dataComunicacion" />
    <div
      align="right"
      class="text-xs-center animated fadeIn fast"
      style="border: 1px solid #f5f5f5"
      id="divRepetirDia"
      v-show="repetirDia.showRepetirDia && !verDetalleActivo"
    >
      <v-card max-width="290">
        <v-form ref="form" lazy-validation>
          <v-toolbar card prominent style="height: 39px">
            <v-btn
              small
              icon
              style="margin-top: -18px"
              @click="repetirDiaModalCloseHandlerButton()"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-title>
            <v-layout row wrap>
              <v-flex md6 xs6>
                <v-menu
                  :close-on-content-click="false"
                  v-model="repetirDia.menuDatePickerDesde"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                  :disabled="!repetirDia.reproducirRepetirDia"
                >
                  <v-text-field
                    slot="activator"
                    v-model="computedDateFormattedDesde"
                    label="Desde"
                    persistent-hint
                    prepend-icon="event"
                    readonly
                    required
                    @change="buscarRepetirDia(1)"
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-text-field>
                  <v-date-picker
                    v-model="repetirDia.dateDesde"
                    first-day-of-week="1"
                    locale="es-cl"
                    scrollable
                    @input="
                      repetirDia.menuDatePickerDesde = false;
                      buscarRepetirDia(1);
                    "
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex md6 xs6>
                <v-menu
                  :close-on-content-click="false"
                  v-model="repetirDia.menuDatePickerHasta"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                  :disabled="!repetirDia.reproducirRepetirDia"
                >
                  <v-text-field
                    slot="activator"
                    v-model="computedDateFormattedHasta"
                    label="Hasta"
                    persistent-hint
                    prepend-icon="event"
                    readonly
                    required
                    @change="buscarRepetirDia(2)"
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-text-field>
                  <v-date-picker
                    v-model="repetirDia.dateHasta"
                    first-day-of-week="1"
                    locale="es-cl"
                    scrollable
                    required
                    :max="repetirDia.fechaFinOld"
                    @input="
                      repetirDia.menuDatePickerHasta = false;
                      buscarRepetirDia(2);
                    "
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex md6 xs6>
                <v-dialog
                  ref="dialogHoraInicio"
                  v-model="repetirDia.isHoraInicioOpen"
                  :return-value.sync="repetirDia.timeHoraInicio"
                  persistent
                  lazy
                  full-width
                  width="250px"
                  :disabled="!repetirDia.reproducirRepetirDia"
                >
                  <v-text-field
                    slot="activator"
                    v-model="repetirDia.timeHoraInicio"
                    label="Hora Inicio"
                    prepend-icon="access_time"
                    readonly
                    @change="buscarRepetirDia(3)"
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-text-field>
                  <v-time-picker
                    format="24hr"
                    v-if="repetirDia.isHoraInicioOpen"
                    v-model="repetirDia.timeHoraInicio"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      flat
                      color="primary"
                      @click="repetirDia.isHoraInicioOpen = false"
                      >Cancelar</v-btn
                    >
                    <v-btn flat color="primary" @click="referenciaInicio()"
                      >Aceptar</v-btn
                    >
                  </v-time-picker>
                </v-dialog>
              </v-flex>
              <v-flex md6 xs6>
                <v-dialog
                  ref="dialogHoraTermino"
                  v-model="repetirDia.isHoraTerminoOpen"
                  :return-value.sync="repetirDia.timeHoraFin"
                  persistent
                  lazy
                  full-width
                  width="250px"
                  :disabled="!repetirDia.reproducirRepetirDia"
                >
                  <v-text-field
                    slot="activator"
                    v-model="repetirDia.timeHoraFin"
                    label="Hora Fin"
                    prepend-icon="access_time"
                    readonly
                    :disabled="!repetirDia.reproducirRepetirDia"
                  ></v-text-field>
                  <v-time-picker
                    format="24hr"
                    v-if="repetirDia.isHoraTerminoOpen"
                    v-model="repetirDia.timeHoraFin"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      flat
                      color="primary"
                      @click="repetirDia.isHoraTerminoOpen = false"
                      >Cancelar</v-btn
                    >
                    <v-btn flat color="primary" @click="referenciaFin()"
                      >Aceptar</v-btn
                    >
                  </v-time-picker>
                </v-dialog>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-switch
                v-show="trazarRutaInferida.visible"
                title="Trazar Ruta Inferida"
                v-model="repetirDia.generaRuta"
                label="Trazar Ruta Inferida"
                color="warning"
                @change="makeRutaInferida()"
                :disabled="!repetirDia.reproducirRepetirDia"
              ></v-switch>
            </v-layout>

            <v-layout>
              <v-flex md12>
                <v-subheader>Intervalo de tiempo entre puntos</v-subheader>
                <v-slider
                  v-model="repetirDia.invervaloRepetirDiaSeleccionado"
                  :max="2"
                  :tick-labels="
                    repetirDia.intervalosRepetirDia.map(x => `${x} (s)`)
                  "
                  :disabled="!repetirDia.reproducirRepetirDia"
                  class="v-slider"
                ></v-slider>
              </v-flex>
            </v-layout>

            <v-layout row wrap>
              <v-flex md4 xs4 style="text-align: center">
                <v-btn
                  outline
                  block
                  :disabled="
                    !repetirDia.btnAtrasEnabled || repetirDia.btnDisabled
                  "
                  @click="nextPrev(-1)"
                >
                  <v-icon>skip_previous</v-icon>
                </v-btn>
              </v-flex>
              <v-flex md4 xs4 style="text-align: center">
                <v-btn
                  outline
                  block
                  @click="repetirDia.btnPlayEvento === true ? play() : pause()"
                  :disabled="
                    !repetirDia.btnPlayEnabled || repetirDia.btnDisabled
                  "
                >
                  <v-icon v-if="repetirDia.reproducirRepetirDia"
                    >play_circle_outline</v-icon
                  >
                  <v-icon v-else>pause_circle_outline</v-icon>
                </v-btn>
              </v-flex>
              <v-flex md4 xs4 style="text-align: center">
                <v-btn
                  outline
                  block
                  @click="nextPrev(1, true)"
                  :disabled="
                    !repetirDia.btnSiguienteEnabled || repetirDia.btnDisabled
                  "
                >
                  <!-- || actividadesRepetirDia.length === 0 -->
                  <v-icon>skip_next</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-title>
        </v-form>
      </v-card>
    </div>
    <!-- FIN MODAL REPETIR DIA -->

    <!-- INICIO 9 MENU PUNTOS -->
    <div align="right" class="text-xs-center" id="xxxHome">
      <v-btn
        tile
        outlined
        class="text-center"
        style="
          text-transform: capitalize;
          font-size: 13px;
          opacity: 0.7;
          font-weight: 900;
        "
        v-show="zona.drawingToolBar"
        >{{ currentMouseLat }} , {{ currentMouseLng }}</v-btn
      >

      <v-snackbar
        v-model="snackbar"
        color="primary"
        :timeout="timeout"
        :bottom="'bottom'"
        >{{ snackbarMessage }}</v-snackbar
      >

      <v-menu
        v-model="zona.menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
        left
      >
        <v-btn style="min-width: 10px" slot="activator" color="default" small>
          <v-icon>apps</v-icon>
        </v-btn>

        <v-card>
          <v-card-actions>
            <v-layout wrap align-center>
              <v-flex md6 sm6 xs12 d-flex>
                <v-select
                  small
                  id="sel"
                  v-model="zona.selected"
                  item-text="nombre"
                  item-value="valor"
                  :items="zona.tipoMapa"
                  hide-details
                  @change="changeTipoMapa"
                  label="Tipo de Vista"
                ></v-select>
              </v-flex>

              <v-flex md5 sm5 xs12 d-flex>
                <v-text-field
                  id="searchInputHome"
                  v-model="zona.autocompleteText"
                  placeholder="Buscar Ubicación"
                  single-line
                  hide-details
                ></v-text-field>
              </v-flex>
              <v-flex md1 sm1 xs12>
                <v-btn
                  flat
                  icon
                  style="margin-left: 10px; margin-top: 10px"
                  id="btnSearchHome"
                >
                  <v-icon>search</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
    <!-- FIN MENU 9 PUNTOS -->

    <!-- INICIO MODAL CREAR ZONAS -->
    <div
      class="animated fadeIn fast"
      id="divDrawingBtns"
      v-show="zona.drawingToolBar"
    >
      <v-btn
        @click="toggleDrawingControlsVisibility"
        dark
        color="#777777"
        small
        style="font-size: 12px; margin: 4px 4px"
        >Cancelar</v-btn
      >
      <v-btn
        @click="mostrarCrearZona()"
        dark
        color="primary"
        :disabled="!zona.enabledBtnContinue"
        small
        style="font-size: 12px; margin: 4px 4px"
        >Continuar</v-btn
      >
    </div>

    <div align="right" class="text-xs-center" id="divCrearZona">
      <v-btn
        @click="toggleDrawingControlsVisibility()"
        dark
        color="#777777"
        style="width: 42px; min-width: 42px"
        v-show="acciondibujar.visible"
      >
        <v-icon>layers</v-icon>
      </v-btn>
    </div>

    <div class="text-xs-center">
      <v-dialog v-model="zona.dialogErrorAsoc" persistent max-width="390">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title
              style="font-size: 17px; margin-left: 10px !important"
              >{{ zona.titleEliminarItem }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <div id="alinear">
            <v-card-text v-show="zona.cantidadVehiculosAsociados === 1">
              La Geocerca está asociada a un Vehículo, por esta razón no se
              podrá realizar la eliminación.
            </v-card-text>
            <v-card-text v-show="zona.cantidadVehiculosAsociados > 1">
              La Geocerca está asociada a
              {{ zona.cantidadVehiculosAsociados }} Vehículos, por esta razón no
              se podrá realizar la eliminación.
            </v-card-text>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="zona.dialogErrorAsoc = false">
              <span style="color: white">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- FIN MODAL CREAR ZONAS   -->

    <!-- PROPS MODALES ZONAS -->

    <app-confirmacion
      :show="zona.dialogEliminar"
      :titulo="zona.titleEliminarItem"
      :mensaje="zona.mensajeConfirmacionIndividual"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
      :width="390"
    ></app-confirmacion>

    <app-crear-zona
      :show="zona.showCrearZona"
      :tipogeometria="zona.tipoGeometriaModal"
      :strCoords="zona.strCoordsModal"
      :tipoMapaSelected="zona.mapType"
      :zoomMap="zona.zoom"
      v-on:modalAsociacionEmit="zonaModalCallback($event)"
    ></app-crear-zona>

    <app-editar-zona
      :show="zona.showEditarZona"
      :zona="zona.editedItem"
      :esEdicion="zona.modalEsEdicion"
      v-on:modalAsociacionEmit="zonaModalCallbackEditar($event)"
    ></app-editar-zona>
    <!-- FIN PROPS MODALES ZONAS -->
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import MarkerClusterer, { ClusterIconStyle } from '@google/markerclustererplus';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import {
  smVehiculo,
  Vehiculo,
} from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import config from '@/config/index';
import {
  EstadoTransmision,
  TipoGeometria,
  ServicioProxy,
  TipoLugarAlcance,
  TiposZonas,
  TipoSitiosSugal,
} from '@/config/enums';
import VehiculoMarker from '@/pantallas/Inicio/Mapa/VehiculoMarker';
import ActividadMarker, {
  ActividadMarkerOptions,
} from '@/pantallas/Inicio/Mapa/ActividadMarker';
import {
  createInfoWindowContent,
  createInfoWindowContentActividad,
} from '@/pantallas/Inicio/Mapa/infoWindow';
import actividadEventBus from '@/pantallas/Inicio/ActividadesData/ActividadEventBus';
import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';

import repetirDiaAlertaEventBus from '@/pantallas/Inicio/RepetirDiaData/RepetirDiaAlertaEventBus';

import repetirDiaEventBus from '@/pantallas/Inicio/RepetirDiaData/RepetirDiaEventBus';
import {
  RepetirDia,
  RepetirDiaRequest,
  fetchRepetirDia,
} from '@/pantallas/Inicio/RepetirDiaData/fetchRepetirDia';
import RDEventBusActividad, {
  RepetirDiaActividad,
} from '@/eventBus/repetirDiaActividadEventBus';
import { LoadingService } from '@/services/loadingService';
import moment from 'moment';
import RepetirDiaFuncionalidades from '@/pantallas/Inicio/RepetirDiaData/serviciosRepetirDia';
import ActividadesMarkerEventBus, {
  actividadesMarkerEvents,
} from '@/eventBus/actividadesMarkerEventBus';
import Confirmation from '../../../components/Confirmation.vue';
import store from '../../../store';
import { AxiosVue } from '../../../AxiosVue';
import { filtroHomeEventBus } from '../../../setup';
import ZonaEventBus from '../../../eventBus/zonaEventBus';
import { InfoZonaVm } from '../../../interfaces/InfoZonaVm';
import { Funcionalidades } from '../../../config/funcionalidades';
import { Zona, RepetirDiaMapa } from '@/pantallas/Inicio/Mapa/VariblesMapa';
import ActividadesEventBus from '../../../eventBus/actividadesEventBus';
import { differenceBy, find } from 'lodash';
import DetalleTabs from '@/pantallas/Inicio/DetalleVehiculo/DetalleTabs.vue';

import CorteIgnicion from '@/components/CorteIgnicion.vue';
import CortaCorrienteEventBus from '@/pantallas/Inicio/CortaCorrienteData/CortaCorrienteEventBus';

import {
  CodigoAccion,
  PermisoAccion,
} from '../../../views/base/VariablesPermisos';
import { fetchSitiosSugal } from '@/pantallas/Sugal/fetchSitiosSugal';
import { fetchTarifasPlantas } from '@/pantallas/Sugal/fetchTarifasPlantas';

const jsts = require('jsts');

interface VehiculoMarkerOptions extends google.maps.MarkerOptions {
  /*
  Cada campo debe ser agregado a VehiculoMarker
   */
  infoWindow: google.maps.InfoWindow;
  isSeleccionado: boolean;
  // vehiculo: Vehiculo;
}

const getIcon = config.getIconoMarker;
const markerIcons = {
  seleccionado: getIcon(EstadoTransmision.Seleccionado),
  transmitiendo: getIcon(EstadoTransmision.Transmitiendo),
  sinTransmitir: getIcon(EstadoTransmision.SinTransmitir),
};

const ActividadMarkerIconos = {
  seleccionado: getIcon(EstadoTransmision.Seleccionado),
};

// declare var MarkerClusterer: any;
declare var OverlappingMarkerSpiderfier: any;
const marcadorPlus = require('@/assets/pin-plus.png');
const m1 = require('@/assets/cluster_imagenes/1.png');
const m2 = require('@/assets/cluster_imagenes/2.png');
const m3 = require('@/assets/cluster_imagenes/3.png');
const m4 = require('@/assets/cluster_imagenes/4.png');
const m5 = require('@/assets/cluster_imagenes/5.png');

const markerClustererMaxZoom = 17;

@Component({
  components: {
    'app-crear-zona': () =>
      import('@/components/plataforma/ZonasModalNuevo.vue'),
    'app-editar-zona': () =>
      import('@/components/plataforma/ZonasModalEdicion.vue'),
    'app-confirmacion': Confirmation,
    corteIgnicion: CorteIgnicion,
    DetalleTabs,
  },
})
export default class Mapa extends ComponenteBaseStepper {
  // campos ComponenteBaseStepper
  readonly funcionalidad: Funcionalidades = Funcionalidades.Zonas;
  permisosActuales: PermisoAccionVm[] = [];

  acciondibujar: PermisoAccionVm = {
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  dibujarEditar: PermisoAccionVm = {
    visible: true,
    step: 1,
    codigoSubAccion: 35,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralEditar: PermisoAccionVm = {
    visible: true,
    step: 2,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarVehiculosEditar: PermisoAccionVm = {
    visible: true,
    step: 3,
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  trazarRutaInferida: PermisoAccion = {
    visible: true,
    moduloCodigo: Funcionalidades.Inicio,
    accionCodigo: CodigoAccion.TrazarRutaInferida,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.acciondibujar,
    this.dibujarEditar,
    this.informacionGeneralEditar,
    this.asociarVehiculosEditar,
  ];

  map: google.maps.Map;
  markerClusterer: MarkerClusterer;
  markerClustererActividad: MarkerClusterer;
  oms: any;
  /* Caché de último vehículo seleccionado, necesario para restablecer vehículo
  previamente seleccionado en caso de haber desaparecido temporalmente del mapa
  E.g.
  - Seleccionar vehículo
  - Filtrar flota con objetivo de que vehículo desaparezca
  - Restablecer filtro
  - Vehículo debería mantenerse seleccionado
  */
  vehiculoMarkerSeleccionado: VehiculoMarker;
  seleccionActividad: boolean = false;
  fechaUltimaTransmission: any;
  vehiculoYaSeleccionado: number;
  isInfoWindowsAbierto: Element = null;
  // mapName: string = `${this.name}-map`;

  // Genericos:

  loadingService = new LoadingService();
  $snotify: any;
  vehiculos: Vehiculo[] = [];
  clienteId: number = config.getClienteSesion();
  mostrarBtnVerDetalle: boolean = true;
  coordenadasInicio: google.maps.LatLng;
  zoomInicio: number = 0;
  showCorteIgnicion: boolean = false;
  dataComunicacion: any = null;
  verDetalleActivo: boolean = false;
  tarifas: any = null;

  //VerDetalle
  rdVerDetalle: boolean = false; //Usado para establecer desde donde se inicializa ver detalle.
  vehiculoSeleccionado: Vehiculo = null;
  actividadSeleccionada: any = null;

  //Latitud y longitud mouse event
  currentMouseLat: string = '';
  currentMouseLng: string = '';
  snackbar: boolean = false;
  snackbarMessage: string = '';
  timeout: number = 3000;
  tilesloadedAtivado = false;

  // Campos Repetir Dia.

  actividadMasReciente: {
    conductor: string;
    fecha: string;
    ubicacion: string;
    velocidad: string;
  } = {
    conductor: undefined,
    fecha: undefined,
    ubicacion: undefined,
    velocidad: undefined,
  };

  repetirDia: RepetirDiaMapa = {
    map: null,
    showRepetirDia: false,
    menuDatePickerDesde: false,
    menuDatePickerHasta: false,
    menuDatePickerDesdeVD: false,
    menuDatePickerHastaVD: false,
    reproducirRepetirDia: true,
    isHoraInicioOpen: false,
    isVerDetalleHoraInicioOpen: false,
    isHoraTerminoOpen: false,
    isVerDetalleHoraTerminoOpen: false,
    timeHoraInicio: null,
    timeHoraFin: null,
    horaFinOld: null,
    horaInicioOld: null,
    dateDesde: null,
    dateHasta: null,
    invervaloRepetirDiaSeleccionado: 1.0,
    intervalosRepetirDia: [0.5, 1.0, 1.5],
    btnAtrasEnabled: false,
    btnPlayEnabled: true,
    btnSiguienteEnabled: false,
    actividadesRepetirDia: [],
    vehiculoSeleccionadoRepetirDia: null,
    rdFuncionalidades: new RepetirDiaFuncionalidades(),
    actividadMarkers: [],
    rutasResponseSTR: [],
    indexMarcadorRuta: 0,
    btnPlayEvento: true,
    markerFlechasShow: false,
    nombreComponente: 'mapts',
    marcadorPosicion: null,
    actividadesRespuestaSnap: [],
    tramosActividadCoordenadas: [],
    fechaInicioOld: null,
    fechaFinOld: null,
    btnPlayEventoOld: null,
    btnPlayEnabledOld: null,
    btnSiguienteEnabledOld: null,
    btnAtrasEnabledOld: null,
    generaRuta: false,
    actividadMarkersDetalle: [],
    primeraCarga: null,
    repeticionInterval: null,
    createInfoWindowBtn: this.createInfoWindowBtn,
    infoWindows: [],
    repetirDiaMarkers: [],
    polylinesActividad: [],
    snappedCoordinates: [],
    swicthRepetirDia: false,
    fechaRules: [],
    btnDisabled: true,
  };

  // Campos Dibujo de Zonas.

  zona: Zona = {
    drawingManager: null,
    mapType: 'roadmap',
    zoom: '',
    controllerTipoLugar: 'grupodezona',
    controllerCoordenada: 'coordenada',
    controllerGpsCoordenada: 'GpsCoordenada',
    capasDeInformacion: [],
    capasSeleccionadas: [],
    lugares: [],
    selectedCapas: [],
    tipoMapa: [],
    selected: [],
    menu: false,
    drawingToolBar: false,
    showCrearZona: false,
    showEditarZona: false,
    modalEsEdicion: true,
    editedItem: {},
    axios: new AxiosVue(ServicioProxy.Gps),
    enabledBtnContinue: false,
    tipoGeometriaModal: 0,
    strCoordsModal: '',
    dialogErrorAsoc: false,
    editedName: '',
    dialogEliminar: false,
    editedIndex: -1,
    editedCapaId: -1,
    titleEliminarItem: '',
    mensajeConfirmacionIndividual: '',
    mensajeExitoEliminacion: '',
    mensajeErrorEliminacion: '',
    autocompleteText: '',
    marcadorBuscador: null,
    overlay: null,
    overlaybkp: null,
    hidden: false,
    markerZona: [],
    circles: [],
    polylines: [],
    infoWindowsZonas: [],
    mapEventListenerList: [],
    loadMapaTs: false, //Carga de Mapa
    windowHeight: 0,
    cantidadVehiculosAsociados: 0,
    directionsService: new google.maps.DirectionsService(),
    directionsDisplayContinua: new google.maps.DirectionsRenderer(),
    walkingLineSymbol: {},
    directionsDisplayDiscontinua: new google.maps.DirectionsRenderer(),
    directionsDisplayArray: [],
    directionsDisplayDiscontinuaArray: [],
  };

  baseVehiculos: Vehiculo[];

  created() {
    // permisoSwitch Trazar ruta inferida
    this.trazarRutaInferida.visible = this.chequearPermisoModuloAccion(
      this.trazarRutaInferida.accionCodigo,
      this.trazarRutaInferida.moduloCodigo
    );
  }

  beforeMount() {
    this.chequearPermisos();
  }

  mounted() {
    store.commit('setPermisoCrearZonaHome', this.acciondibujar.visible);
    this.map = new google.maps.Map(document.getElementById('mapContainer'), {
      center: { lat: -33.4372, lng: -70.6506 },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      gestureHandling: 'greedy',
      mapTypeControl: false,
      maxZoom: 20,
      minZoom: 2,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    const cluster_styles: any[] = [
      {
        width: 53,
        height: 52,
        url: m1,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 56,
        height: 55,
        url: m2,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 66,
        height: 65,
        url: m3,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 78,
        height: 77,
        url: m4,
        textColor: 'black',
        textSize: 11,
      },
      {
        width: 90,
        height: 89,
        url: m5,
        textColor: 'black',
        textSize: 11,
      },
    ];

    this.repetirDia.map = this.map;
    this.markerClusterer = new MarkerClusterer(this.map, [], {
      styles: cluster_styles,
      maxZoom: markerClustererMaxZoom,
    });

    this.markerClustererActividad = new MarkerClusterer(this.map, [], {
      imagePath:
        'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      maxZoom: markerClustererMaxZoom,
    });

    this.zona.tipoMapa = [
      {
        id: 1,
        nombre: 'Mapa',
        valor: 'roadmap',
      },
      {
        id: 2,
        nombre: 'Satelital',
        valor: 'satellite',
      },
      {
        id: 3,
        nombre: 'Híbrido',
        valor: 'hybrid',
      },
      {
        id: 4,
        nombre: 'Relieve',
        valor: 'terrain',
      },
    ];

    //Setea el mapa con el zoom y las coordenadas correspondientes
    filtroHomeEventBus.$on(
      'centrarMapaEstadoInicio',
      (coordenadas: google.maps.LatLng, zoom: number) => {
        this.closeInfoWindows();
        this.coordenadasInicio = coordenadas;
        this.map.setCenter(this.coordenadasInicio);
        this.zoomInicio = zoom;
        this.map.setZoom(zoom);
      }
    );
    //---

    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);

    filtroHomeEventBus.$on('centrarMapaCambioFlota', (primerVehiculo: any) => {
      const lat = primerVehiculo.ultimaActividad.latitud;
      const lng = primerVehiculo.ultimaActividad.longitud;

      const latlng = new google.maps.LatLng(lat, lng);
      this.map.setCenter(latlng);
    });

    //Setea Tipo de Mapa por Usuario/Cliente
    filtroHomeEventBus.$on('setTipoMapa', (valTipoMapa: any) => {
      if (valTipoMapa !== null && valTipoMapa !== undefined) {
        this.map.setMapTypeId(valTipoMapa);
        this.zona.mapType = valTipoMapa;
        let seleccionado = this.zona.tipoMapa.find(
          (x: any) => x.valor === valTipoMapa
        );
        if (seleccionado !== null && seleccionado !== undefined) {
          this.zona.selected = seleccionado;
        } else {
          this.zona.selected = this.zona.tipoMapa[0];
        }
      } else {
        this.map.setMapTypeId(this.zona.tipoMapa[0].valor);
        this.zona.mapType = this.zona.tipoMapa[0].valor;
        this.zona.selected = this.zona.tipoMapa[0];
      }
    });
    //---

    filtroHomeEventBus.$on(
      'recargarTipoLugarCliente',
      async (clienteId: number) => {
        await this.GetZonasClientes();
      }
    );

    filtroHomeEventBus.$on('cerrarCrearZonaHome', () => {
      this.zona.drawingManager.setOptions({
        drawingControl: false,
      });
      this.zona.drawingToolBar = false;
    });

    filtroHomeEventBus.$on('showCrearZonaDet', (obj: any) => {
      if (obj !== null) {
        this.zona.tipoGeometriaModal = obj.tipoGeometriaModal;
        this.zona.strCoordsModal = obj.strCoordsModal;
        this.zona.mapType = obj.mapType;
        this.zona.zoom = obj.zoom;
        this.setShowCrearZona(true);
      }
    });

    filtroHomeEventBus.$on('showEditarZonaDet', (obj: any) => {
      if (obj !== null) {
        this.zona.showEditarZona = true;

        this.zona.editedItem.id = obj.id;
        this.zona.editedItem.tipoGeometria = obj.tipogeometria;
        this.zona.editedItem.tipoZonaId = obj.tipozonaid;
        this.zona.editedItem.formaJson = obj.formaJson;
        this.zona.editedCapaId = obj.grupoId;
      }
    });

    filtroHomeEventBus.$on('eliminarZonaDet', (obj: InfoZonaVm) => {
      if (obj !== null) {
        this.zona.editedIndex = obj.id;
        this.eliminarZona(obj);
      }
    });

    filtroHomeEventBus.$on('changeFundoCenter', (obj: any) => {
      if (obj !== null) {
        this.handleChangeFundoCenter(obj);
      }
    });

    var input = document.getElementById('searchInputHome');
    var searchBox: google.maps.places.SearchBox = new google.maps.places.SearchBox(
      input as HTMLInputElement
    );

    document.getElementById('btnSearchHome').onclick = () => {
      google.maps.event.trigger(input, 'focus', {});
      google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
      google.maps.event.trigger(this, 'focus', {});
    };

    //Autocomplete de Google Maps
    input.addEventListener('keypress', this.onBuscarKeyPress, {
      passive: true,
    });

    input.addEventListener('keyup', this.onBuscarKeyUp, { passive: true });

    this.zona.mapEventListenerList.push(
      this.map.addListener('bounds_changed', () => {
        searchBox.setBounds(this.map.getBounds());
      })
    );

    /*this.zona.mapEventListenerList.push(
      google.maps.event.addDomListener(this.map, 'bounds_changed', () => {
        var objMapNew = document.getElementsByClassName('google-map')[0];
        var objMapEdit = document.getElementsByClassName('google-map')[1];
        var objDiv = document.getElementById('xxxHome');
        if (objDiv !== null) {
          if (
            !(
              objMapNew.clientHeight === window.screenTop &&
              objMapNew.clientWidth === window.screenY
            ) &&
            !(
              objMapEdit.clientHeight === window.screenTop &&
              objMapEdit.clientWidth === window.screenY
            )
          ) {
            objDiv.style.display = 'block';
            var es_chrome =
              navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
            if (es_chrome) {
              objDiv.style.display = 'none';
            }
          } else {
            objDiv.style.display = 'flex';
            var es_firefox =
              navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (es_firefox) {
              objDiv.style.display = 'none';
            }
          }
        }
      })
    );*/

    //Evento que se ejecuta cuando el mapa se carga por completo
    this.zona.mapEventListenerList.push(
      this.map.addListener('tilesloaded', () => {
        this.tilesloadedAtivado = true;

        // this.zona.loadMapaTs = true;

        // //Tipo Mapa
        // store.commit('setSeleccionarTipoMapa', this.zona.mapType); //Guarda el tipo mapa en la mutación
        // filtroHomeEventBus.tipoMapa = this.zona.mapType;

        // //Zoom Mapa
        // const zoom: number = this.map.getZoom(); //Obtiene el zoom del mapa
        // store.commit('setSeleccionarZoom', zoom); //Guarda el zoom del mapa en la mutación
        // filtroHomeEventBus.zoom = zoom;

        // //Centro Mapa
        // const center: google.maps.LatLng = this.map.getCenter(); //Obtiene el centro del mapa
        // store.commit('setSeleccionarCoordenadas', center); //Guarda el centro del mapa en la mutación
        // filtroHomeEventBus.coordenadas = center;

        // filtroHomeEventBus.$emit('guardarEstadoHome'); //Guarda tipo mapa, zoom y centro en la BBDD
      })
    );

    this.zona.mapEventListenerList.push(
      this.map.addListener('mouseout', () => {
        if (this.tilesloadedAtivado) {
          this.tilesloadedAtivado = false;
          //this.guardaEstadoMapa();
        }
      })
    );

    this.zona.mapEventListenerList.push(
      this.map.addListener('dragend', () => {
        if (this.tilesloadedAtivado) {
          this.tilesloadedAtivado = false;
          //this.guardaEstadoMapa();
        }
      })
    );

    //---

    this.zona.mapEventListenerList.push(
      this.map.addListener('click', () => {
        this.repetirDia.infoWindows.forEach(
          (infoWin: google.maps.InfoWindow) => {
            infoWin.close();
          }
        );
      })
    );

    this.zona.walkingLineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 1,
      scale: 2,
    };

    this.zona.directionsDisplayContinua = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#27488e',
      },
      map: this.map,
    });

    this.zona.directionsDisplayDiscontinua = new (google.maps
      .DirectionsRenderer as any)({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#27488e',
        strokeOpacity: 0,
        fillOpacity: 0,
        icons: [
          {
            icon: this.zona.walkingLineSymbol,
            offset: '0',
            repeat: '10px',
          },
        ],
      },
      map: this.map,
    });

    this.zona.mapEventListenerList.push(
      searchBox.addListener('places_changed', () => {
        var places: google.maps.places.PlaceResult[] = searchBox.getPlaces();

        if (places.length == 0) {
          if (this.zona.marcadorBuscador != null) {
            this.zona.marcadorBuscador.setMap(null);
          }
          this.$snotify.warning(
            'No se han encontrado resultados para la búsqueda.'
          );
          return;
        } else {
          this.zona.autocompleteText = places[0].formatted_address;
          this.map.setCenter(places[0].geometry.location);
          let iconourl =
            'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
          let icon = {
            url: iconourl,
            scaledSize: new google.maps.Size(32, 51),
          };
          var marker = new google.maps.Marker({
            map: this.map,
            position: places[0].geometry.location,
            icon: icon,
            //animation: google.maps.Animation.DROP
          });
          if (this.zona.marcadorBuscador != null) {
            this.zona.marcadorBuscador.setMap(null);
          }
          this.zona.marcadorBuscador = marker;
          var bounds = new google.maps.LatLngBounds();
          bounds.extend(places[0].geometry.location);
          this.map.fitBounds(bounds);
          this.map.setZoom(markerClustererMaxZoom + 1);
        }
      })
    );

    //TIPO MAPA - Escucha si hay cambios en la mutacion
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setSeleccionarTipoMapa') {
        if (this.zona.loadMapaTs) {
          this.map.setMapTypeId(mutation.payload);
          this.zona.mapType = mutation.payload;
          this.zona.selected = this.zona.mapType;
        }
      }
    });
    //---

    //ZOOM - Escucha si hay cambios en la mutacion
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setSeleccionarZoom') {
        if (this.zona.loadMapaTs) {
          this.map.setZoom(mutation.payload);
        }
      }
    });
    //---

    //CENTRO (COORDENADAS) - Escucha si hay cambios en la mutacion
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setSeleccionarCoordenadas') {
        if (this.zona.loadMapaTs) {
          if (mutation.payload.lat() === 0 || mutation.payload.lng() === 0) {
            //Se fix coordenadas al no haber vehiculo en filtro.
            this.map.setCenter(this.coordenadasInicio);
            this.map.setZoom(this.zoomInicio);
            return;
          }
          this.map.setCenter(mutation.payload);
        }
      }
    });

    document
      .getElementById('mapContainer')
      .addEventListener('mousemove', this.updateMouseCoordinates, {
        passive: true,
      });

    this.map.addListener('click', ($event: any) => {
      if (this.zona.drawingToolBar == true) {
        this.copyToClipboard();
      }
    });

    CortaCorrienteEventBus.onAbrirCortaCorriente(this.handleCortaCorriente);

    vehiculoEventBus.onActualizacionVehiculos(
      this.handleActualizacionVehiculos
    );
    vehiculoEventBus.onCargaFlotaVehiculos(this.handleCargaFlotaVehiculos);
    vehiculoEventBus.onSeleccionar(this.handleSeleccionExternaVehiculo);
    actividadEventBus.onSeleccionar(this.handleSeleccionExternaActividad);
    repetirDiaEventBus.onAbrirRepetirDiaHome(this.handleRepetirDiaBusqueda);

    this.oms = new OverlappingMarkerSpiderfier(this.map, {
      nearbyDistance: 1,
    });

    // Crea control lateral para filtros
    let centerControlDiv = document.createElement('div');
    let centerControl = this.CenterControl(centerControlDiv, this.map);

    let centerControlDiv2 = document.createElement('div');
    let centerControl2 = this.CreateCrearZonaBtn(centerControlDiv2, this.map);

    let centerControlDiv3 = document.createElement('div');
    let centerControl3 = this.CreateDrawingControlBtns(
      centerControlDiv3,
      this.map
    );

    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
      centerControlDiv
    );

    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
      centerControlDiv2
    );

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      centerControlDiv3
    );

    let centerControlDivRepDia = document.createElement('div');
    let centerControlRepDia = this.CreateRepetirDiaControl(
      centerControlDivRepDia,
      this.map
    );

    let centerControlDivCortaCorriente = document.createElement('div');
    let centerCortaCorriente = this.CreateCortaCorrienteControl(
      centerControlDivCortaCorriente,
      this.map
    );

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      centerControlDivRepDia
    );

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
      centerControlDivCortaCorriente
    );

    this.habilitaDrawing();
    this.getSitiosSugal();
  }

  private guardaEstadoMapa() {
    this.zona.loadMapaTs = true;

    //Tipo Mapa
    store.commit('setSeleccionarTipoMapa', this.zona.mapType); //Guarda el tipo mapa en la mutación
    filtroHomeEventBus.tipoMapa = this.zona.mapType;

    //Zoom Mapa
    const zoom: number = this.map.getZoom(); //Obtiene el zoom del mapa
    store.commit('setSeleccionarZoom', zoom); //Guarda el zoom del mapa en la mutación
    filtroHomeEventBus.zoom = zoom;

    //Centro Mapa
    const center: google.maps.LatLng = this.map.getCenter(); //Obtiene el centro del mapa
    store.commit('setSeleccionarCoordenadas', center); //Guarda el centro del mapa en la mutación
    filtroHomeEventBus.coordenadas = center;

    filtroHomeEventBus.$emit('guardarEstadoHome'); //Guarda tipo mapa, zoom y centro en la BBDD
  }

  private async handleAbrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    //Fix - [Entrega3 - B530] Home/Ver Detalle - Tooltips
    if (!this.isInfoWindowsAbierto) {
      this.isInfoWindowsAbierto = document.querySelector(
        '.gm-style-iw.gm-style-iw-c'
      );
    }

    this.actividadSeleccionada = this.$store.getters.getActividadSeleccionada.actividadSeleccionada;
    const ultimaActividadBarra = this.$store.getters.getUltimaActividad
      .ultimaActividad;

    this.actividadMasReciente = this.createActividadReciente(
      ultimaActividadBarra
    );
    this.verDetalleActivo = show;
    if (this.repetirDia.markerFlechasShow) {
      this.pause();
    }

    this.repetirDia.vehiculoSeleccionadoRepetirDia = vehiculo;

    const isVerDetalleBtn = document.querySelector('[id^="btnVerDetalle"]');
    const isCortaCorrienteDiv = document.getElementById('divCortaCorriente');

    if (!show) {
      if (isVerDetalleBtn !== null) {
        document
          .querySelector('[id^="btnVerDetalle"]')
          .removeAttribute('hidden');
        //@ts-ignore
        document.querySelector('[id^="btnVerDetalle"]').style.display = 'block';
      }

      if (!this.isRepetirDiaAbierto()) {
        this.setVisibilidadVehiculos(true);

        this.markerClustererActividad.clearMarkers();
        const marker = this.findVehiculoMarker(this.vehiculoSeleccionado);
        google.maps.event.trigger(marker, 'click');

        // this.handleSeleccionExternaVehiculo(this.vehiculoSeleccionado)
      }
      //Se espera hasta que se termine de renderizar el infowindows.
      if (!this.isInfoWindowsAbierto) {
        this.closeInfoWindows();
      }
    } else {
      this.vehiculoSeleccionado = vehiculo;
      setTimeout(() => {
        if (isVerDetalleBtn !== null) {
          document
            .querySelector('[id^="btnVerDetalle"]')
            .setAttribute('hidden', 'true');
          //@ts-ignore
          document.querySelector('[id^="btnVerDetalle"]').style.display =
            'none';
        }
        //Al mostrar Ver Detalle, siempre se debe ocultar CortaCorriente
        if (isCortaCorrienteDiv !== null) {
          isCortaCorrienteDiv.style.display = 'none';
        }
      }, 1000);
      // document.querySelector('[id^="btnVerDetalle"]').hidden = true;
      this.repetirDia.menuDatePickerDesdeVD = false;
      this.repetirDia.menuDatePickerHastaVD = false;
      this.repetirDia.menuDatePickerDesde = false;
      this.repetirDia.menuDatePickerHasta = false;

      //Al mostrar Ver Detalle, siempre se debe ocultar CortaCorriente
      //if (isCortaCorrienteDiv) isCortaCorrienteDiv.style.display = 'none';

      if (!this.actividadMasReciente || !this.actividadMasReciente.ubicacion) {
        this.markerClusterer.clearMarkers();
      } else {
        this.actividadMasReciente = this.createActividadReciente(
          ultimaActividadBarra
        );
      }

      if (!this.actividadSeleccionada) {
        this.setVisibilidadVehiculos(false);
        return;
      }

      if (!this.isRepetirDiaAbierto()) {
        this.handleSeleccionExternaActividad(this.actividadSeleccionada);
      }

      this.actividadMasReciente = this.createActividadReciente(
        ultimaActividadBarra
      );

      //Fix - [Entrega3 - B530] Home/Ver Detalle - Tooltips
      if (!this.isInfoWindowsAbierto) {
        this.closeInfoWindows();
      }
    }
    setTimeout(() => {
      this.isInfoWindowsAbierto = null;
    }, 3000);
    // this.closeInfoWindows();
  }

  private isRepetirDiaAbierto() {
    return this.$store.getters.getRepetirDiaAbierto.repetirDiaAbierto;
  }

  /*
  Event Handlers
   */

  /**
   * @param vehiculos - Vehiculos a **mostrar**, no a actualizar. Cualquier
   * vehículo no presente será eliminado
   */
  private handleActualizacionVehiculos(vehiculos: Vehiculo[]) {
    const vehiculosTransmitiendo = vehiculos.filter(
      x => x.ultimaActividad.transmitiendo === true
    );
    const vehInMap = this.getVehiculos();

    const vehInMapTrans = this.getVehiculos().filter(
      x => x.smVehiculo.transmitiendo === true
    );

    this.destruirVehiculos(vehInMapTrans);

    this.agregarVehiculos(vehiculosTransmitiendo);
  }

  private handleCortaCorriente(vehiculo: any[]) {
    this.dataComunicacion = vehiculo;
    return;
  }

  private handleCargaFlotaVehiculos(vehiculos: Vehiculo[]) {
    this.baseVehiculos = vehiculos;

    this.repetirDiaModalCloseHandler();
    if (!this.vehiculoMarkerSeleccionado) {
      this.markerClusterer.clearMarkers();

      this.agregarVehiculos(vehiculos);

      this.centrarVehiculosMapa();
      return;
    }

    const isSeleccionado = (x: smVehiculo) =>
      x.id === this.vehiculoMarkerSeleccionado.smVehiculo.id;

    /* Omitir vehículo seleccionado de la destrucción y creación de marcadores
    para no interferir en el estado de la UI del marcador. */

    this.destruirVehiculos(
      this.getVehiculos().filter(x => !isSeleccionado(x.smVehiculo))
    );
    this.agregarVehiculos(
      vehiculos.filter(
        x => x.id != this.vehiculoMarkerSeleccionado.smVehiculo.id
      )
    );

    //this.agregarVehiculos(vehiculos.filter(x => !isSeleccionado(x.id)));

    const vehiculo = vehiculos.find(
      x => x.id === this.vehiculoMarkerSeleccionado.smVehiculo.id
    );
    if (vehiculo) {
      /* Actualizar datos de vehículo seleccionado de acuerdo a nueva flota.
      Necesario ya que el resto de los marcadores son recreados como nuevos. */
      this.vehiculoMarkerSeleccionado.infoWindow.setContent(
        createInfoWindowContent(vehiculo)
      );
      const { ultimaActividad } = vehiculo;
      this.vehiculoMarkerSeleccionado.setPosition({
        lat: ultimaActividad.latitud,
        lng: ultimaActividad.longitud,
      });
      this.vehiculoMarkerSeleccionado.smVehiculo = {
        id: vehiculo.id,
        transmitiendo: vehiculo.ultimaActividad.transmitiendo,
      };
    } else {
      /* infoWindow de vehículo no perteneciente a la nueva flota no debería
      permanecer abierta. Alternativamente se podría esconder en lugar de
      eliminar del DOM, con el objetivo de mantenerla abierta en caso de que el
      vehículo desaparezca del mapa y reaparezca (actualización o filtrado). */
      this.vehiculoMarkerSeleccionado.infoWindow.close();
    }
    this.vehiculoMarkerSeleccionado.setVisible(!!vehiculo);
  }

  centrarVehiculosMapa() {
    let markerBounds = new google.maps.LatLngBounds();

    this.markerClusterer.markers_.forEach((marker: VehiculoMarker) => {
      const vehiculo = this.baseVehiculos.find(
        x => x.id === marker.smVehiculo.id
      );
      let point = new google.maps.LatLng(
        vehiculo.ultimaActividad.latitud,
        vehiculo.ultimaActividad.longitud
      );
      markerBounds.extend(point);
    });

    this.map.fitBounds(markerBounds);
  }

  private handleSeleccionExternaVehiculo(vehiculo: Vehiculo) {
    //En caso de haber un infowindows ya abierto, debe de cerrarlo.
    this.closeInfoWindows();
    const marker = this.findVehiculoMarker(vehiculo);
    this.repetirDiaModalCloseHandler();
    if (!marker) {
      /*
      Marcador de vehículo podría no existir por falta de coordenadas de
      geolocación, ver creación de marcadores de flota de vehículos.
       */
      return;
    }

    this.centrarVehiculo(marker);
    this.seleccionarVehiculo(marker);
  }

  private handleCerrarVerDetalle(
    vehiculo: Vehiculo,
    actividad: Actividad,
    show: boolean
  ) {}

  private handleSeleccionExternaActividad(actividad: Actividad) {
    if (this.repetirDia.showRepetirDia) {
      this.repetirDia.rdFuncionalidades.rutaParcialPorActividad(
        this.repetirDia,
        actividad
      );
      this.repetirDia.rdFuncionalidades.pause(this.repetirDia);
      this.limpiarInfoWindowsRepetirDia();

      const marker: any = this.repetirDia.repetirDiaMarkers.find(
        (x: any) => x.actividadId === actividad.id
      );

      //  marker.infoWindow.open(this.map, marker);
      this.repetirDia.repetirDiaMarkers.forEach((x: any) => {
        if (x.actividadId === actividad.id) {
          x.infoWindow.open(this.map, x);
        }
      });

      return;
    }

    this.setVisibilidadVehiculos(false);
    this.markerClustererActividad.clearMarkers();

    const marker = this.crearActividad(actividad);
    store.commit('setActividadSeleccionada', actividad);
    if (!marker) {
      /*
      Marcador de actividad podría no existir por falta de coordenadas de
      geolocación
       */
      return;
    }
    this.seleccionarActividad(marker);
    this.panMapToMarker(marker);
    if (!this.verDetalleActivo) {
      this.seleccionActividad = true;
    }
  }

  createActividadReciente(actividad: any) {
    if (!actividad) {
      return actividad;
    }
    const formatConductor = (nombre = '', rut = '') => {
      if (rut) {
        return `${nombre.trim()} - ${rut.trim()}`;
      }
      return nombre;
    };

    return {
      conductor: formatConductor(
        actividad.nombreConductor !== null ? actividad.nombreConductor : '',
        actividad.rutConductor !== null ? actividad.rutConductor : ''
      ),
      fecha: moment(actividad.fechaActividad).format('DD/MM/YYYY HH:mm:ss'),
      ubicacion: actividad.ubicacion,
      velocidad:
        actividad.velocidadActual || actividad.velocidadActual == 0
          ? `${actividad.velocidadActual} Km/h`
          : '',
    };
  }

  crearActividad(actividad: Actividad) {
    /* TODO evaluar la posibilidad de compartir función con creación marcador
        de actividad en mapa de detalle de vehículo. */
    this.markerClustererActividad.clearMarkers();

    if (actividad.latitud === null || actividad.longitud === null) {
      return;
    }

    const infoWindow = new google.maps.InfoWindow({
      content: createInfoWindowContentActividad(actividad),
      maxWidth: 300,
    });
    const marker = new google.maps.Marker({
      icon: ActividadMarkerIconos.seleccionado,
      position: {
        lat: actividad.latitud,
        lng: actividad.longitud,
      },
      title:
        /*
        El identificador de vehículo es utilizado para buscar el elemento en
        DOM correspondiente al marcador durante pruebas de integración.
        */
        process.env.NODE_ENV === 'development'
          ? actividad.vehiculoId.toString()
          : undefined,

      // Atributos extendidos
      actividad,
      infoWindow,
    } as ActividadMarkerOptions) as ActividadMarker;

    const eventListeners = [
      google.maps.event.addListener(
        marker,
        'click',
        // Callback de google maps no pasa marcador completo como parámetro
        () => {
          this.seleccionarActividad(marker);
          actividadEventBus.seleccionarActividadMarker(marker);
        }
      ),
      //   google.maps.event.addListener(infoWindow, 'domready', () => {

      // this.createInfoWindowBtn(_vehiculo)
      //   }
      // ),
    ];
    marker.cleanup = () => eventListeners.forEach(x => x.remove());

    this.markerClustererActividad.addMarker(marker);
    return marker;
  }

  /*
  Utility methods
   */

  private agregarVehiculos(vehiculos: Vehiculo[]) {
    const markers = vehiculos
      .filter(
        ({ ultimaActividad: { latitud, longitud } }) =>
          latitud !== null && longitud !== null
      )
      .map(vehiculo => {
        /* Mantener sincronizado con datos de actualización de marcador:
        Ver `vehiculoEventBus.actualizarVehiculos()`.
        */
        const { ultimaActividad } = vehiculo;
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(vehiculo),
          maxWidth: 300,
        });

        return new google.maps.Marker({
          icon: Mapa.getDefaultVehiculoIcon(
            vehiculo.ultimaActividad.transmitiendo
          ),
          position: {
            lat: ultimaActividad.latitud,
            lng: ultimaActividad.longitud,
          },
          title:
            /* El identificador de vehículo es utilizado para buscar el
            elemento en DOM correspondiente al marcador durante pruebas de
            integración. */
            process.env.NODE_ENV === 'development'
              ? vehiculo.id.toString()
              : undefined,

          // Atributos extendidos
          infoWindow,
          isSeleccionado: false,
          smVehiculo: {
            id: vehiculo.id,
            transmitiendo: vehiculo.ultimaActividad.transmitiendo,
          },
        } as VehiculoMarkerOptions) as VehiculoMarker;
      })
      .map(marker => {
        const eventListeners = [
          google.maps.event.addListener(
            marker,
            'click',
            // Callback de google maps no pasa marcador completo como parámetro
            () => {
              this.seleccionarVehiculo(marker);
              this.openVehiculoInfoWindow(marker);
              vehiculoEventBus.seleccionarVehiculoMarker(marker);
              this.centrarVehiculo(marker);
            }
          ),
          //google.maps.event.addListener(marker.infoWindow, 'domready', () =>{

          //this.createInfoWindowBtn(_vehiculo)
          // }
          // ),
        ];

        marker.cleanup = () => eventListeners.forEach(x => x.remove());
        return marker;
      });
    const addMarkers = () => {
      markers.forEach(x => this.oms.addMarker(x));
      this.markerClusterer.addMarkers(markers);
    };
    addMarkers();

    this.map.setZoom(this.map.getZoom() - 1);
    this.map.setZoom(this.map.getZoom() + 1);

    return markers;
  }

  private centrarVehiculo(marker: VehiculoMarker) {
    // Asegurar que el marcador sea visible, no su cluster

    if (this.vehiculoYaSeleccionado !== marker.smVehiculo.id) {
      this.map.setCenter(marker.getPosition());
      this.vehiculoYaSeleccionado = marker.smVehiculo.id;
      this.map.setZoom(markerClustererMaxZoom + 1);
    }
  }

  private vehiculobyId(idVehiculo: number) {
    return this.baseVehiculos.find(x => x.id === idVehiculo);
  }

  private centrarActividad(marker: ActividadMarker) {
    this.map.setCenter(marker.getPosition());
  }

  private static getDefaultVehiculoIcon(trasmitiendo: boolean) {
    return trasmitiendo ? markerIcons.transmitiendo : markerIcons.sinTransmitir;
  }

  private findVehiculoMarker(vehiculo: Vehiculo) {
    return this.getVehiculos().find(x => x.smVehiculo.id === vehiculo.id);
  }

  private findActividadMarker(actividad: Actividad) {
    return this.getActividades().find(x => x.actividad.id === actividad.id);
  }

  private seleccionarVehiculo(marker: VehiculoMarker) {
    const setEstadoSeleccion = (
      marker: VehiculoMarker,
      seleccionado: boolean
    ) => {
      marker.isSeleccionado = seleccionado;
      marker.setIcon(
        seleccionado
          ? markerIcons.seleccionado
          : Mapa.getDefaultVehiculoIcon(marker.smVehiculo.transmitiendo)
      );
    };

    // Solo es permitido un vehículo seleccionado a la vez
    this.getVehiculos()
      .filter(x => x.isSeleccionado)
      .forEach(x => setEstadoSeleccion(x, false));

    this.vehiculoMarkerSeleccionado = marker;
    setEstadoSeleccion(marker, true);
  }

  private seleccionarActividad(marker: ActividadMarker) {
    this.openActividadInfoWindow(marker);
  }

  private openVehiculoInfoWindow(marker: VehiculoMarker) {
    // Solo es permitida una infoWindow abierta a la vez
    this.closeInfoWindows();
    marker.infoWindow.open(this.map, marker);
  }

  private openActividadInfoWindow(marker: ActividadMarker) {
    // Solo es permitida una infoWindow abierta a la vez
    this.closeInfoWindows();
    marker.infoWindow.open(this.map, marker);
  }

  private closeInfoWindows() {
    this.getVehiculos().forEach(x => x.infoWindow.close());
    this.getActividades().forEach(x => x.infoWindow.close());
  }

  private getVehiculos() {
    return this.markerClusterer.getMarkers() as VehiculoMarker[];
  }

  private getActividades() {
    return this.markerClustererActividad.getMarkers() as ActividadMarker[];
  }

  private setVisibilidadVehiculos(visible: boolean) {
    if (!this.isInfoWindowsAbierto) {
      this.isInfoWindowsAbierto = document.querySelector(
        '.gm-style-iw.gm-style-iw-c'
      );
    }

    this.getVehiculos().forEach(marker => {
      marker.setVisible(visible);
      if (!visible) {
        marker.infoWindow.close();
      }
    });
    if (visible) {
      this.markerClustererActividad.clearMarkers();
      this.limpiarMarcadoresRepetirDia();
    }
    this.markerClusterer.ignoreHidden_ = true;
    this.markerClusterer.repaint();
  }

  private destruirVehiculosTodos() {
    this.getVehiculos().forEach(x => x.cleanup());
    this.markerClusterer.clearMarkers();
    this.oms.clearMarkers();
  }

  private destruirVehiculo(marker: VehiculoMarker) {
    if (!marker) {
      return;
    }
    marker.cleanup();
    this.oms.removeMarker(marker);
    this.markerClusterer.removeMarker(marker);
  }

  private destruirVehiculos(markers: VehiculoMarker[]) {
    markers.forEach(marker => {
      marker.cleanup();
      this.oms.removeMarker(marker);
    });
    this.markerClusterer.removeMarkers(markers);
  }

  private panMapToMarker(marker: ActividadMarker | VehiculoMarker) {
    this.map.panToBounds(new google.maps.LatLngBounds(marker.getPosition()));
  }

  //Funciones Repetir Dia

  get computedDateFormattedDesde(): string {
    return this.formatDate(this.repetirDia.dateDesde);
  }

  get computedDateFormattedHasta(): string {
    return this.formatDate(this.repetirDia.dateHasta);
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  makeRutaInferida() {
    if (!this.repetirDia.generaRuta) {
      this.repetirDia.polylinesActividad.forEach((polylines: any) => {
        polylines.polyline.setOptions({
          visible: false,
        });
      });
      return;
    }
    this.loadingService.showLoading();
    this.repetirDia.rdFuncionalidades.despliegeRutaInferida(this.repetirDia);

    setTimeout(() => {
      this.loadingService.hideLoading();
    }, 2000);
  }

  handleRepetirDiaBusqueda(vehiculo: Vehiculo) {
    if (!vehiculo) {
      this.repetirDiaModalCloseHandler();
      return;
    }

    this.limpiarMarcadoresRepetirDia();
    this.markerClustererActividad.clearMarkers();
    this.setVisibilidadVehiculos(false);
    this.repetirDia.generaRuta = false;
    this.repetirDia.showRepetirDia = true;
    this.repetirDia.swicthRepetirDia = true;
    this.repetirDia.vehiculoSeleccionadoRepetirDia = vehiculo;
    this.repetirDia.timeHoraInicio = '00:00';
    this.repetirDia.isHoraInicioOpen = false;
    this.repetirDia.isVerDetalleHoraInicioOpen = false;
    this.repetirDia.timeHoraFin = '23:59';
    this.repetirDia.isHoraTerminoOpen = false;
    this.repetirDia.isVerDetalleHoraTerminoOpen = false;
    this.repetirDia.menuDatePickerDesde = false;
    this.repetirDia.menuDatePickerHasta = false;
    this.repetirDia.menuDatePickerDesdeVD = false;
    this.repetirDia.menuDatePickerHastaVD = false;

    if (
      vehiculo.fechaUltimaActividad !== null &&
      vehiculo.fechaUltimaActividad !== undefined
    ) {
      let dateIf: Date = new Date(1900, 0, 1);

      let dateA = moment(dateIf).format('DD/MM/YYYY');
      let dateR = moment(vehiculo.fechaUltimaActividad).format('DD/MM/YYYY');

      if (dateA === dateR) {
        this.repetirDia.dateDesde = new Date().toISOString().substr(0, 10);
        this.repetirDia.dateHasta = new Date().toISOString().substr(0, 10);
      } else {
        this.repetirDia.dateDesde = moment(
          vehiculo.fechaUltimaActividad
        ).format('YYYY-MM-DD');
        this.repetirDia.dateHasta = moment(
          vehiculo.fechaUltimaActividad
        ).format('YYYY-MM-DD');
      }
    } else {
      this.repetirDia.dateDesde = new Date().toISOString().substr(0, 10);
      this.repetirDia.dateHasta = new Date().toISOString().substr(0, 10);
    }
    this.buscarRepetirDia(3);

    this.mapeaValoresFiltros();

    this.setVisibilidadVehiculos(false);
  }

  async buscarRepetirDia(tipo: any) {
    this.loadingService.showLoading();
    if (tipo === 1) {
      this.repetirDia.dateHasta = null;
    }

    if (tipo === 2) {
      this.loadingService.showLoading();
      RDEventBusActividad.$emit('rdEventBusDetalle', false);
    }

    if (
      this.repetirDia.dateDesde === null ||
      this.repetirDia.dateHasta === null ||
      this.repetirDia.timeHoraInicio === null ||
      this.repetirDia.timeHoraFin === null
    ) {
      this.loadingService.hideLoading();
      this.repetirDia.btnPlayEnabled = false;
      this.repetirDia.btnDisabled = true;
      this.limpiarMarcadoresRepetirDia();
      return;
    }

    const fechaDesde =
      this.repetirDia.dateDesde + 'T' + this.repetirDia.timeHoraInicio;
    const fechaHasta =
      this.repetirDia.dateHasta + 'T' + this.repetirDia.timeHoraFin;

    const fD = moment(fechaDesde, 'YYYY/MM/DD HH:mm');
    const fH = moment(fechaHasta, 'YYYY/MM/DD HH:mm');

    const diffMins = fH.diff(fD, 'minutes');
    const hora48 = 2880;

    if (fD > fH) {
      this.$snotify.error('El rango de fechas es inválido');
      this.repetirDia.btnPlayEnabled = false;
      RDEventBusActividad.$emit(
        'rdEventBusActividad',
        this.repetirDia.actividadesRepetirDia
      );
      //this.limpiaMapa();
      this.reestableceValoresAnterioresEnFiltro();
    }

    if (diffMins > hora48) {
      this.$snotify.error('El rango de búsqueda no debe superar las 48 horas');
      this.repetirDia.btnPlayEnabled = false;

      RDEventBusActividad.$emit(
        'rdEventBusActividad',
        this.repetirDia.actividadesRepetirDia
      );
      //this.limpiaMapa(); comentado.
      this.reestableceValoresAnterioresEnFiltro();
      this.repetirDia.timeHoraFin = this.repetirDia.horaFinOld;
    }

    const [yearDesde, monthDesde, dayDesde] = this.repetirDia.dateDesde.split(
      '-'
    );
    const [yearHasta, monthHasta, dayHasta] = this.repetirDia.dateHasta.split(
      '-'
    );

    const [horaDesde, minuteDesde] = this.repetirDia.timeHoraInicio.split(':');
    const [horaHasta, minuteHasta] = this.repetirDia.timeHoraFin.split(':');

    const model: RepetirDiaRequest = {
      clienteId: this.clienteId,
      vehiculoId: this.repetirDia.vehiculoSeleccionadoRepetirDia.id,
      fechaInicio: new Date(fechaDesde),
      fechaTermino: new Date(fechaHasta),
      orderDescending: false,
    };

    let response: RepetirDia[] = await fetchRepetirDia(model);

    response = response.sort(
      // @ts-ignore
      (a, b) => new Date(a.fechaActividad) - new Date(b.fechaActividad)
    );

    this.repetirDia.actividadesRepetirDia = response;

    if (this.repetirDia.actividadesRepetirDia.length > 0) {
      this.limpiarMarcadoresRepetirDia();
      await this.repetirDia.rdFuncionalidades.busquedaYDespliegueRuta(
        this.repetirDia
      );

      this.map.setCenter(this.repetirDia.repetirDiaMarkers[0].getPosition());
      this.map.setZoom(12);

      // const actividadMasReciente = this.repetirDia.actividadesRepetirDia[0];
      // this.map.setCenter(
      //   new google.maps.LatLng(
      //     actividadMasReciente.latitud,
      //     actividadMasReciente.longitud
      //   )
      // );
      this.repetirDia.btnPlayEnabled = true;
      this.repetirDia.btnDisabled = false;
      let act: any = this.repetirDia.actividadesRepetirDia[
        this.repetirDia.actividadesRepetirDia.length - 1
      ];
      let data: RepetirDiaActividad = {};
      if (act !== undefined) {
        data.id = this.repetirDia.vehiculoSeleccionadoRepetirDia.id;
        data.fDesde = this.repetirDia.dateDesde;
        data.fHasta = this.repetirDia.dateHasta;
        data.hDesde = this.repetirDia.timeHoraInicio;
        data.hHasta = this.repetirDia.timeHoraFin;
        data.patente = act !== undefined ? act.patente : '';
        data.ultimaActividad = act;
        data.estado = {
          rutasResponseSTR: this.repetirDia.rutasResponseSTR,
          actividadesRespuestaSnap: this.repetirDia.actividadesRespuestaSnap,
          tramosActividadCoordenadas: this.repetirDia
            .tramosActividadCoordenadas,
          btnAtrasEnabled: this.repetirDia.btnAtrasEnabled,
          btnSiguienteEnabled: this.repetirDia.btnSiguienteEnabled,
          btnPlayEvento: this.repetirDia.btnPlayEvento,
          btnPlayEnabled: this.repetirDia.btnPlayEnabled,
          indexMarcadorRuta: this.repetirDia.indexMarcadorRuta,
          actividadesRepetirDia: this.repetirDia.actividadesRepetirDia,
        };

        let actGrillaRepetirDia = response.filter(
          (x: RepetirDia) =>
            x.fechaActividad <=
            this.repetirDia.vehiculoSeleccionadoRepetirDia.fechaUltimaActividad
        );
        repetirDiaAlertaEventBus.cargarAlertasRepetirDia(model); // carga los parametros para ver la grilla de alertas en los dias seleccionados
        repetirDiaEventBus.cargarActividadesRepetirDia(actGrillaRepetirDia);
        // RDEventBusActividad.actividadesEncontradas(actGrillaRepetirDia, data);
      } else {
        RDEventBusActividad.$emit('rdEventBusActividad', {
          id: this.repetirDia.vehiculoSeleccionadoRepetirDia.id,
        });
        vehiculoEventBus.seleccionar(
          this.repetirDia.vehiculoSeleccionadoRepetirDia
        );
      }
    } else {
      this.reestableceValoresAnterioresEnFiltro();
      this.$snotify.warning(
        'No se han encontrado resultados para la búsqueda.'
      );
      this.loadingService.hideLoading();
    }

    if (tipo === 2) {
      setTimeout(() => {
        this.loadingService.hideLoading();
        RDEventBusActividad.$emit('rdEventBusDetalle', true);
      }, 1000);
    }
  }

  mapeaValoresFiltros() {
    this.repetirDia.fechaInicioOld = this.repetirDia.dateDesde;
    this.repetirDia.fechaFinOld = this.repetirDia.dateHasta;
    this.repetirDia.horaInicioOld = this.repetirDia.timeHoraInicio;
    this.repetirDia.horaFinOld = this.repetirDia.timeHoraFin;

    this.repetirDia.btnSiguienteEnabledOld = this.repetirDia.btnSiguienteEnabled;
    this.repetirDia.btnAtrasEnabledOld = this.repetirDia.btnAtrasEnabled;
    this.repetirDia.btnPlayEventoOld = this.repetirDia.btnPlayEvento;
    this.repetirDia.btnPlayEnabledOld = this.repetirDia.btnPlayEnabled;
  }
  reestableceValoresAnterioresEnFiltro() {
    this.repetirDia.dateDesde = this.repetirDia.fechaInicioOld;
    this.repetirDia.dateHasta = this.repetirDia.fechaFinOld;
    this.repetirDia.timeHoraInicio = this.repetirDia.horaInicioOld;
    this.repetirDia.timeHoraFin = this.repetirDia.horaFinOld;

    this.repetirDia.btnSiguienteEnabled = this.repetirDia.btnSiguienteEnabledOld;
    this.repetirDia.btnAtrasEnabled = this.repetirDia.btnAtrasEnabledOld;
    this.repetirDia.btnPlayEvento = this.repetirDia.btnPlayEventoOld;
    this.repetirDia.btnPlayEnabled = this.repetirDia.btnPlayEnabledOld;
  }

  repetirDiaModalCloseHandler() {
    this.limpiarMarcadoresRepetirDia();
    this.repetirDia.showRepetirDia = false;
    this.repetirDia.swicthRepetirDia = false;
    this.repetirDia.generaRuta = false;
    if (this.verDetalleActivo) {
      this.crearActividad(this.actividadSeleccionada);
    } else {
      this.setVisibilidadVehiculos(true);
    }
  }

  handleSwitchChange() {
    if (this.repetirDia.swicthRepetirDia) {
      store.commit('setRepetirDiaAbierto', true);
      store.commit('setCortaCorrienteAbiertoAux', false); //Se cierra el Corta Corriente
      this.handleRepetirDiaBusqueda(this.vehiculoSeleccionado);
      this.rdVerDetalle = true;
    } else {
      const modelAlertaOff: RepetirDiaRequest = {
        clienteId: this.clienteId,
        vehiculoId: this.repetirDia.vehiculoSeleccionadoRepetirDia.id,
        fechaInicio: null,
        fechaTermino: null,
        orderDescending: false,
      };
      repetirDiaAlertaEventBus.cargarAlertasRepetirDia(modelAlertaOff);
      this.repetirDiaModalCloseHandlerButton();
      store.commit('setRepetirDiaAbierto', false);
    }
  }

  repetirDiaModalCloseHandlerButton() {
    this.repetirDiaModalCloseHandler();
    if (!this.verDetalleActivo) {
      vehiculoEventBus.seleccionar(
        this.repetirDia.vehiculoSeleccionadoRepetirDia
      );
    }
  }

  referenciaInicio() {
    const fechaDesde =
      this.repetirDia.dateDesde + 'T' + this.repetirDia.timeHoraInicio;
    const fechaHasta =
      this.repetirDia.dateHasta + 'T' + this.repetirDia.timeHoraFin;

    const fD = moment(fechaDesde, 'YYYY/MM/DD HH:mm');
    const fH = moment(fechaHasta, 'YYYY/MM/DD HH:mm');

    const diffMins = fH.diff(fD, 'minutes');

    const horas48 = 2880;

    const refHoraInicio: any = this.$refs.dialogHoraInicio;
    const refHoraInicioVerDetalle: any = this.$refs.dialogVerDetalleHoraInicio;
    if (diffMins > horas48) {
      if (refHoraInicio) {
        refHoraInicio.save(this.repetirDia.horaInicioOld);
      }
      if (refHoraInicioVerDetalle) {
        refHoraInicioVerDetalle.save(this.repetirDia.horaInicioOld);
      }
    } else {
      if (refHoraInicio) {
        refHoraInicio.save(this.repetirDia.timeHoraInicio);
      }
      if (refHoraInicioVerDetalle) {
        refHoraInicioVerDetalle.save(this.repetirDia.timeHoraInicio);
      }
    }
    this.buscarRepetirDia(3);
  }

  referenciaFin() {
    const fechaDesde =
      this.repetirDia.dateDesde + 'T' + this.repetirDia.timeHoraInicio;
    const fechaHasta =
      this.repetirDia.dateHasta + 'T' + this.repetirDia.timeHoraFin;

    const fD = moment(fechaDesde, 'YYYY/MM/DD HH:mm');
    const fH = moment(fechaHasta, 'YYYY/MM/DD HH:mm');

    const diffMins = fH.diff(fD, 'minutes');

    const horas48 = 2880;

    const refHoraTermino: any = this.$refs.dialogHoraTermino;
    const refHoraTerminoVerDetalle: any = this.$refs
      .dialogVerDetalleHoraTermino;
    if (diffMins > horas48) {
      if (refHoraTermino) {
        refHoraTermino.save(this.repetirDia.horaFinOld);
      }
      if (refHoraTerminoVerDetalle) {
        refHoraTerminoVerDetalle.save(this.repetirDia.horaFinOld);
      }
    } else {
      if (refHoraTermino) {
        refHoraTermino.save(this.repetirDia.timeHoraFin);
      }
      if (refHoraTerminoVerDetalle) {
        refHoraTerminoVerDetalle.save(this.repetirDia.timeHoraFin);
      }
    }
    this.buscarRepetirDia(3);
  }

  play() {
    this.repetirDia.infoWindows.forEach(x => x.close());
    this.repetirDia.rdFuncionalidades.play(this.repetirDia);
  }

  pause() {
    this.repetirDia.rdFuncionalidades.pause(this.repetirDia);
  }

  nextPrev(incremento: number, next: boolean = false, play: boolean = false) {
    const isInfoWindowsAbierto = document.querySelector(
      '.gm-style-iw.gm-style-iw-c'
    );

    const isVerDetalleBtn = document.querySelector('[id^="btnVerDetalle"]');

    this.repetirDia.infoWindows.forEach(x => x.close());
    this.repetirDia.rdFuncionalidades.nextPrev(
      this.repetirDia,
      incremento,
      next,
      play
    );

    ActividadesMarkerEventBus.$emit(
      actividadesMarkerEvents.seleccionarActividad,
      this.$store.getters.getActividadActual.actividadActual
    );

    if (isInfoWindowsAbierto) {
      return;
    }

    const actividadActual: Actividad = this.$store.getters.getActividadActual
      .actividadActual;

    const marker: any = this.repetirDia.repetirDiaMarkers.find(
      (x: any) => x.actividadId === actividadActual.id
    );

    marker.infoWindow.open(this.map, marker);

    if (this.verDetalleActivo) {
      // if (document.querySelector('[id^="btnVerDetalle"]') !== null) {
      // document
      //   .querySelector('[id^="btnVerDetalle"]')
      //   .setAttribute('hidden', 'true');
      //@ts-ignore
      // document.querySelector('[id^="btnVerDetalle"]').style.display = 'none';
      // }
    } else {
      // if (document.querySelector('[id^="btnVerDetalle"]') !== null) {
      // document
      //   .querySelector('[id^="btnVerDetalle"]')
      //   .removeAttribute('hidden');
      //@ts-ignore
      // document.querySelector('[id^="btnVerDetalle"]').style.display = 'block';
      // }
    }
  }

  limpiarMarcadoresRepetirDia() {
    if (this.repetirDia.repetirDiaMarkers.length === 0) {
      return;
    }
    if (this.repetirDia.showRepetirDia) {
      this.pause();
      this.repetirDia.repetirDiaMarkers.forEach(
        (marker: google.maps.Marker) => {
          marker.setMap(null);
          google.maps.event.clearListeners(marker, 'click');
        }
      );
      this.repetirDia.repetirDiaMarkers = [];
      this.repetirDia.marcadorPosicion.setMap(null);
    }

    // Se limpia ruta Inferida

    this.repetirDia.polylinesActividad.forEach((polylines: any) => {
      polylines.polyline.setMap(null);
    });
    this.repetirDia.polylinesActividad = [];
  }

  limpiarInfoWindowsRepetirDia() {
    this.repetirDia.repetirDiaMarkers.forEach((x: any) => {
      x.infoWindow.close();
    });
  }

  //#RepetirDiaControl
  CreateRepetirDiaControl(controlDiv: any, map: any) {
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('divRepetirDia');
    controlUI.appendChild(centerControlDiv);
  }

  CreateCortaCorrienteControl(controlDiv: any, map: any) {
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('divCortaCorriente');
    controlUI.appendChild(centerControlDiv);
  }

  createInfoWindowBtn(vehiculo: Vehiculo) {
    // if (this.verDetalleActivo) {
    //   return;
    // }

    let existButton = document.getElementById('btnVerDetalle' + vehiculo.id);

    if (existButton === null) {
      let eButton = document.createElement('a');
      eButton.setAttribute('id', 'btnVerDetalle' + vehiculo.id);
      eButton.setAttribute(
        'data-testid',
        `map__infoWindow-verDetalle--${vehiculo.id}`
      );
      eButton.innerText = 'Ver Detalle >';
      eButton.setAttribute('data-testid', `ver_detalle_test2`);

      if (this.verDetalleActivo) {
        eButton.setAttribute('hidden', 'true');
        eButton.style.display = 'none';
      }

      // TODO limpiar listeners al eliminar
      eButton.addEventListener(
        'click',
        () => {
          if (document.fullscreen) {
            document.exitFullscreen();
          }

          // TODO refactorizar y pasar siempre actividad completa en lugar de ids
          /*vehiculoEventBus.abrirDetalleVehiculo(
          vehiculo,
          // @ts-ignore
          { id: vehiculo.ultimaActividad.actividadId }
        );*/

          //Cerrar Corta Corriente
          if (this.isCortaCorrienteAbierto) this.cerrarCortaCorriente();

          vehiculoEventBus.abrirDetalleVehiculo(
            vehiculo,
            null,
            null,
            true,
            '0'
          );
        },
        { passive: true }
      );

      let table: any = document.getElementById('vvvTable' + vehiculo.id);

      let _row = table.insertRow(2);
      let _cell1 = _row.insertCell(0);
      let _cell2 = _row.insertCell(1);
      _cell1.innerHTML = '';
      _cell2.setAttribute('align', 'right');
      _cell2.appendChild(eButton);

      return eButton;
    } else {
      if (this.verDetalleActivo) {
        existButton.style.display = 'none';
      } else {
        existButton.style.display = 'block';
      }
      return existButton;
    }
  }

  // Region dibujo de Zonas.

  deleteItemCallback(val: boolean) {
    this.zona.dialogEliminar = false;
    if (val) {
      this.loadingService.showLoading();
      //Eliminación
      this.zona.axios.http
        .delete(`${this.zona.controllerCoordenada}/${this.zona.editedIndex}`)
        .then(res => {
          this.removeOverlay(this.zona.editedIndex);
          filtroHomeEventBus.$emit('removeOverlay', this.zona.editedIndex);
          this.loadingService.hideLoading();
          this.$snotify.success(this.zona.mensajeExitoEliminacion);
        })
        .catch(error => {
          this.$snotify.error(this.zona.mensajeErrorEliminacion);
        });
    }
  }

  private onBuscarKeyPress() {
    let searchActivated = false;
    if (!searchActivated) {
      let listObjPacContainer: any = document.getElementsByClassName(
        'pac-container'
      );
      for (let item of listObjPacContainer) {
        item.style.zIndex = '1015004';
      }
    }
  }

  private onBuscarKeyUp() {
    if (this.zona.autocompleteText == '') {
      if (this.zona.marcadorBuscador != null) {
        this.zona.marcadorBuscador.setMap(null);
      }
    }
  }

  private onWindowResize() {
    this.zona.windowHeight = window.innerHeight;
  }

  private removeAllEventListeners() {
    window.removeEventListener('resize', this.onWindowResize);
    const input = document.getElementById('searchInputHome');
    input.removeEventListener('keypress', this.onBuscarKeyPress);
    input.removeEventListener('keyup', this.onBuscarKeyUp);
    this.zona.mapEventListenerList.forEach(x => x.remove());
  }

  changeTipoMapa(val: any) {
    if (val !== undefined && val !== '') {
      this.map.setMapTypeId(val);
      this.zona.mapType = val;
    }
  }

  CenterControl(controlDiv: any, map: any) {
    // Set CSS for the control border.
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('xxxHome');
    controlUI.appendChild(centerControlDiv);
  }

  CreateDrawingControlBtns(controlDiv: any, map: any) {
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    //controlUI.title = "Crear Zona";
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('divDrawingBtns');
    controlUI.appendChild(centerControlDiv);
  }

  habilitaDrawing() {
    let icon = {
      url: 'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png', // url
      scaledSize: new google.maps.Size(32, 51),
    };

    this.zona.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
      markerOptions: {
        icon: icon,
        position: new google.maps.LatLng(null, null),
      },
      circleOptions: {
        fillColor: '#3A01DF',
        strokeColor: '#3A01DF',
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: '#3A01DF',
        strokeColor: '#3A01DF',
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: '#3A01DF',
        strokeColor: '#3A01DF',
        strokeWeight: 1,
        clickable: false,
        zIndex: 1,
      },
    });

    this.zona.mapEventListenerList.push(
      this.zona.drawingManager.addListener('overlaycomplete', ($event: any) => {
        if ($event.type === 'polygon') {
          if ($event.overlay.getPath().getArray().length > 2) {
            var intersects = this.findSelfIntersects($event.overlay.getPath());
            if (!(intersects && intersects.length)) {
              if (this.zona.overlay != null) {
                //this.overlaybkp = this.overlay;
                this.zona.overlay.setMap(null);
              }
              if (this.zona.marcadorBuscador != null) {
                this.zona.marcadorBuscador.setMap(null);
              }
              this.zona.overlay = $event.overlay;
              this.zona.drawingManager.setDrawingMode(null);
              this.zona.enabledBtnContinue = true;
            } else {
              if (this.zona.overlay != null) {
                //this.overlaybkp = this.overlay;
                this.zona.overlay.setMap(null);
              }
              if (this.zona.marcadorBuscador != null) {
                this.zona.marcadorBuscador.setMap(null);
              }
            }
          } else {
            if (this.zona.overlay != null) {
              //this.overlaybkp = this.overlay;
              this.zona.overlay.setMap(null);
            }
            if (this.zona.marcadorBuscador != null) {
              this.zona.marcadorBuscador.setMap(null);
            }
          }
        } else {
          if (this.zona.overlay != null) {
            //this.overlaybkp = this.overlay;
            this.zona.overlay.setMap(null);
          }
          if (this.zona.marcadorBuscador != null) {
            this.zona.marcadorBuscador.setMap(null);
          }
          this.zona.overlay = $event.overlay;
          this.zona.drawingManager.setDrawingMode(null);
          this.zona.enabledBtnContinue = true;
        }
      })
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addDomListener(document, 'keyup', ($e: any) => {
        var code = $e.keyCode ? $e.keyCode : $e.which;
        if (code === 27) {
          this.zona.drawingManager.setDrawingMode(null);
          if (this.zona.overlay != null) {
            this.zona.overlay.setMap(null);
          }
          this.zona.enabledBtnContinue = false;
        }
      })
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'polygoncomplete',
        ($polygon: google.maps.Polyline) => {
          this.addPolygonEditListeners($polygon);
          if ($polygon.getPath().getArray().length > 2) {
            var intersects = this.findSelfIntersects($polygon.getPath());
            if (intersects && intersects.length) {
              this.$snotify.error(
                'El polígono que está trazando no es válido.'
              );
              $polygon.setMap(null);
              if (this.zona.overlaybkp != null) {
                this.zona.overlaybkp.setMap(this.map);
              }
              this.zona.enabledBtnContinue = false;
            } else {
              $polygon.setEditable(true);
              let pathArray: google.maps.LatLng[] = $polygon
                .getPath()
                .getArray();
              this.TransformCoordsPolygon(pathArray);
              this.zona.drawingManager.setDrawingMode(null);
            }
          } else {
            this.$snotify.error('El polígono que está trazando no es válido.');
            $polygon.setMap(null);
            if (this.zona.overlaybkp != null) {
              this.zona.overlaybkp.setMap(this.map);
            }
            this.zona.enabledBtnContinue = false;
          }
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'rectanglecomplete',
        ($rectangle: google.maps.Rectangle) => {
          this.addRectangleEditListeners($rectangle);
          let bounds: google.maps.LatLngBounds = $rectangle.getBounds();
          this.TransformCoordsRectangle(bounds);
          this.zona.drawingManager.setDrawingMode(null);
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'markercomplete',
        ($marker: google.maps.Marker) => {
          this.zona.drawingManager.setDrawingMode(null);
          let position: google.maps.LatLng = $marker.getPosition();
          this.TransformCoordsMarker(position);
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'circlecomplete',
        ($circle: google.maps.Circle) => {
          this.addCircleEditListeners($circle);
          this.TransformCoordsCircle($circle);
          this.zona.drawingManager.setDrawingMode(null);
        }
      )
    );

    this.zona.mapEventListenerList.push(
      google.maps.event.addListener(
        this.zona.drawingManager,
        'drawingmode_changed',
        ($e: any) => {
          if (this.zona.drawingManager.getDrawingMode() != null) {
            this.zona.enabledBtnContinue = false;
          }
        }
      )
    );

    this.zona.drawingManager.setMap(this.map);

    this.zona.drawingManager.setOptions({
      drawingControl: false,
    });
  }

  //#region ZONAS
  mostrarCrearZona() {
    ZonaEventBus.$emit('crearZona-abrir');
    if (document.fullscreen) {
      document.exitFullscreen();
    }
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.setShowCrearZona(true);
  }

  editarZona(zona: InfoZonaVm) {
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.zona.showEditarZona = true;
    this.zona.editedItem.id = zona.id;
    this.zona.editedItem.tipoGeometria = zona.tipogeometria;
    this.zona.editedItem.tipoZonaId = zona.tipozonaid;
    this.zona.editedItem.formaJson = zona.formaJson;
    this.zona.editedCapaId = zona.grupoId;
  }
  eliminarZona(zona: InfoZonaVm) {
    this.zona.editedName = zona.nombre;
    this.zona.axios.http
      .get(`${this.zona.controllerGpsCoordenada}/${zona.id}/activeAsoc`)
      .then(res => {
        this.zona.cantidadVehiculosAsociados = res.data.length;
        if (this.zona.cantidadVehiculosAsociados == 0) {
          this.zona.dialogEliminar = true;
          this.zona.editedIndex = zona.id;
          this.zona.editedCapaId = zona.grupoId;
          this.zona.titleEliminarItem = this.$t(
            'mensajes.crud.eliminar.titulo',
            {
              entidad: zona.tipo,
              nombreEntidad: zona.nombre,
            }
          );
          let msjEliminacion = '';
          if (zona.tipozonaid == TiposZonas.Geocerca) {
            msjEliminacion = 'la ' + zona.tipo; // + ': ' + zona.nombre;
            this.zona.mensajeExitoEliminacion =
              'La ' +
              zona.tipo +
              ': ' +
              zona.nombre +
              ' ha sido eliminada de forma exitosa';
            this.zona.mensajeErrorEliminacion =
              'Ha ocurrido un problema al intentar eliminar la ' +
              zona.tipo +
              ': ' +
              zona.nombre;
          } else {
            msjEliminacion = 'el ' + zona.tipo; // + ': ' + zona.nombre;
            this.zona.mensajeExitoEliminacion =
              'El ' +
              zona.tipo +
              ': ' +
              zona.nombre +
              ' ha sido eliminado de forma exitosa';
            this.zona.mensajeErrorEliminacion =
              'Ha ocurrido un problema al intentar eliminar el ' +
              zona.tipo +
              ': ' +
              zona.nombre;
          }
          this.zona.mensajeConfirmacionIndividual = this.$t(
            'mensajes.crud.eliminar.mensaje',
            { entidad: msjEliminacion }
          );
        } else {
          this.zona.titleEliminarItem = this.$t(
            'mensajes.crud.eliminar.titulo',
            {
              entidad: zona.tipo,
              nombreEntidad: zona.nombre,
            }
          );
          this.zona.dialogErrorAsoc = true;
        }
      })
      .catch(error => {
        this.$snotify.error(
          'Ha ocurrido un problema al intentar eliminar la zona'
        );
      });
  }
  CreateCrearZonaBtn(controlDiv: any, map: any) {
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = 'none';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = 'none';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Crear Zona';

    /*if (!this.dibujar.visible) {
      controlUI.style.display = 'none';
    }*/
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let centerControlDiv = document.getElementById('divCrearZona');
    controlUI.appendChild(centerControlDiv);
  }

  addPolygonEditListeners(polygon: any) {
    let self = this;
    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.zona.enabledBtnContinue = false;
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
        self.zona.enabledBtnContinue = true;
      }
    });
    google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.zona.enabledBtnContinue = false;
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
        self.zona.enabledBtnContinue = true;
      }
    });
    google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
      let intersects = self.findSelfIntersects(polygon.getPath());
      if (intersects && intersects.length) {
        self.$snotify.error('El polígono que está trazando no es válido.');
        self.zona.enabledBtnContinue = false;
      } else {
        let pathArray: google.maps.LatLng[] = polygon.getPath().getArray();
        self.TransformCoordsPolygon(pathArray);
        self.zona.enabledBtnContinue = true;
      }
    });
  }

  addRectangleEditListeners(rectangle: any) {
    let self = this;
    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(rectangle, 'bounds_changed', function() {
      let bounds: google.maps.LatLngBounds = rectangle.getBounds();
      self.TransformCoordsRectangle(bounds);
    });
  }

  addCircleEditListeners(circle: any) {
    let self = this;

    // TODO limpiar listeners al eliminar
    //Resize del Circulo
    google.maps.event.addListener(circle, 'radius_changed', function() {
      self.TransformCoordsCircle(circle);
    });

    //Desplazado del Circulo
    google.maps.event.addListener(circle, 'center_changed', function() {
      self.TransformCoordsCircle(circle);
    });
  }

  findSelfIntersects(googlePolygonPath: any) {
    var coordinates = this.googleMaps2JTS(googlePolygonPath);
    var geometryFactory = new jsts.geom.GeometryFactory();
    var shell = geometryFactory.createLinearRing(coordinates);
    var jstsPolygon = geometryFactory.createPolygon(shell);

    // if the geometry is aleady a simple linear ring, do not
    // try to find self intersection points.
    var validator = new jsts.operation.IsSimpleOp(jstsPolygon);
    if (validator.isSimpleLinearGeometry(jstsPolygon)) {
      return;
    }

    var res = [];
    var graph = new jsts.geomgraph.GeometryGraph(0, jstsPolygon);
    var cat = new jsts.operation.valid.ConsistentAreaTester(graph);
    var r = cat.isNodeConsistentArea();
    if (!r) {
      var pt = cat.getInvalidPoint();
      res.push([pt.x, pt.y]);
    }
    return res;
  }

  googleMaps2JTS(boundaries: any) {
    var coordinates = [];
    for (var i = 0; i < boundaries.getLength(); i++) {
      coordinates.push(
        new jsts.geom.Coordinate(
          boundaries.getAt(i).lat(),
          boundaries.getAt(i).lng()
        )
      );
    }
    coordinates.push(coordinates[0]);
    return coordinates;
  }

  toggleDrawingControlsVisibility() {
    this.zona.drawingManager.setOptions({
      drawingControl: !this.zona.drawingToolBar,
    });

    this.zona.drawingToolBar = !this.zona.drawingToolBar;
    this.zona.enabledBtnContinue = false;

    if (this.zona.overlay !== null) {
      this.zona.overlay.setMap(null);
    }

    if (this.zona.drawingToolBar === false) {
      ZonaEventBus.$emit('controlDibujo-cerrar');
      if (this.zona.drawingManager != null) {
        this.zona.drawingManager.setDrawingMode(null);
      }
    } else {
      ZonaEventBus.$emit('controlDibujo-abrir');
    }
  }

  hideDrawingControls() {
    this.zona.drawingToolBar = true;
    this.toggleDrawingControlsVisibility();
  }

  zonaModalCallback(val: boolean) {
    this.reloadCapas(false);
    if (this.zona.drawingManager != null) {
      this.zona.drawingManager.setDrawingMode(null);
    }
    if (this.zona.overlay != null) {
      this.zona.overlay.setMap(null);
      this.zona.overlay = null;
    }
    this.zona.overlaybkp = null;
    this.toggleDrawingControlsVisibility(); //Se descomenta esta función que oculta el panel de dibujo en el mapa
    this.setShowCrearZona(false);
    //document.getElementsByTagName("html")[0].style.overflow = "auto";
    this.zona.showEditarZona = false;
    this.zona.drawingToolBar = false;
    this.zona.enabledBtnContinue = false;
    filtroHomeEventBus.$emit('clearDrawerTools');
  }

  zonaModalCallbackEditar(val: boolean) {
    this.reloadEditedCapa();
    filtroHomeEventBus.$emit('reloadEditedCapa', this.zona.editedCapaId);
    this.zona.showEditarZona = false;
  }

  TransformCoordsPolygon(patharray: google.maps.LatLng[]) {
    let coordenadas = '';

    patharray.forEach((coordenada: google.maps.LatLng) => {
      let latitud = coordenada.lat().toString();
      let longitud = coordenada.lng().toString();
      coordenadas += latitud + ';' + longitud + '|';
    });

    this.zona.tipoGeometriaModal = TipoGeometria.Poligono;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  TransformCoordsRectangle(bounds: google.maps.LatLngBounds) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const coordenadas: string = `${ne.lat()};${ne.lng()}|${sw.lat()};${ne.lng()}|${sw.lat()};${sw.lng()}|${ne.lat()};${sw.lng()}`;

    this.zona.tipoGeometriaModal = TipoGeometria.Rectangulo;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  TransformCoordsMarker(position: google.maps.LatLng) {
    let coordenadas = `${position.lat()};${position.lng()}`;

    this.zona.tipoGeometriaModal = TipoGeometria.Marcador;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  TransformCoordsCircle(circle: google.maps.Circle) {
    let center = circle.getCenter();
    let radius = circle.getRadius();
    let coordenadas = `${center.lat()};${center.lng()};${radius}`;

    this.zona.tipoGeometriaModal = TipoGeometria.Circunferencia;
    this.zona.strCoordsModal = coordenadas;
    //this.mapType = this.selected;
    this.zona.zoom = this.map.getZoom();
  }

  async GetZonasClientes() {
    this.onClearCapas();
    this.zona.capasDeInformacion = [];
    const clienteId = config.getClienteSesion();
    try {
      const response = await this.zona.axios.http.get(
        `${this.zona.controllerTipoLugar}/${clienteId}/tiposlugarCliente`
      );
      if (response.data.length > 0) {
        let data: any = [];
        let tiposLugar: [] = response.data.filter(
          (x: any) => x.tipoLugarAlcance === 1
        );

        const tiposLugarInteres: any = response.data.filter(
          (x: any) => x.tipoLugarAlcance === 2
        );

        if (tiposLugar.length > 0) {
          data.push({ header: 'Grupos de Zonas' });
          tiposLugar.forEach((element: any, idx: number) => {
            data.push({
              id: element.id,
              nombre: element.nombre,
              grupo: 'Grupos de Zonas',
              selected: false,
            });
          });
        }

        if (tiposLugarInteres.length > 0) {
          data.push({ divider: true });
          data.push({ header: 'Grupos de Interés' });

          tiposLugarInteres.forEach((element: any, idx: number) => {
            data.push({
              id: element.id,
              nombre: element.nombre,
              grupo: 'Grupos de Interés',
              selected: false,
            });
          });
        }

        this.zona.capasDeInformacion = data;
      }
    } catch (error) {
      return;
    }
  }
  //#region

  //#region CAPAS
  onClearCapas() {
    if (this.zona.capasSeleccionadas != null) {
      for (
        let x: number = this.zona.capasSeleccionadas.length - 1;
        x >= 0;
        x--
      ) {
        this.remueveCapas(this.zona.capasSeleccionadas[x].id);
        this.zona.capasSeleccionadas.splice(x, 1);
      }
    }
    if (this.zona.selectedCapas != null) {
      for (let x: number = this.zona.selectedCapas.length - 1; x >= 0; x--) {
        this.remueveCapas(this.zona.selectedCapas[x]);
        this.zona.selectedCapas.splice(x, 1);
      }
    }
  }

  removeCapa(capa: any) {
    this.remueveCapas(capa.id);

    for (let x: number = this.zona.capasSeleccionadas.length - 1; x >= 0; x--) {
      if (this.zona.capasSeleccionadas[x].id === capa.id) {
        this.zona.capasSeleccionadas.splice(x, 1);
        break;
      }
    }

    for (let x: number = this.zona.selectedCapas.length - 1; x >= 0; x--) {
      if (this.zona.selectedCapas[x] === capa.id) {
        this.zona.selectedCapas.splice(x, 1);
        break;
      }
    }
  }

  onCapaInput(capa: any) {
    if (capa !== undefined) {
      for (let i: number = 0; i <= capa.length - 1; i++) {
        let added = this.zona.capasSeleccionadas.filter(
          (x: any) => x.id == capa[i]
        );
        if (added.length == 0) {
          let capaAgregar = this.zona.capasDeInformacion.find(
            (x: any) => x.id == capa[i]
          );
          this.zona.capasSeleccionadas.push(capaAgregar);
          this.getTiposLugarPorCliente(capaAgregar, false);
        }
      }
    }
  }

  async changeCapa(capa: any) {
    if (capa !== undefined) {
      this.loadingService.showLoading(); //447 - Track 3.0 - Mapas
      let added = this.zona.capasSeleccionadas.filter(
        (x: any) => x.id == capa.id
      );
      if (added.length == 0) {
        let capaAgregar = this.zona.capasDeInformacion.find(
          (x: any) => x.id == capa.id
        );
        this.zona.capasSeleccionadas.push(capaAgregar);
        this.getTiposLugarPorCliente(capaAgregar, false);
        capa.selected = true;
      } else {
        capa.selected = false;
        for (
          let x: number = this.zona.capasSeleccionadas.length - 1;
          x >= 0;
          x--
        ) {
          if (this.zona.capasSeleccionadas[x].id == capa.id) {
            this.remueveCapas(capa.id);
            this.zona.capasSeleccionadas.splice(x, 1);
          }
        }
      }
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 1000); //447 - Track 3.0 - Mapas
    }
  }

  onCapaChange(capa: any) {
    if (
      capa !== undefined &&
      capa.length !== this.zona.capasSeleccionadas.length
    ) {
      let id: number = 0;

      for (
        let x: number = this.zona.capasSeleccionadas.length - 1;
        x >= 0;
        x--
      ) {
        let borrar = true;

        if (capa.length === 0) {
          id = this.zona.capasSeleccionadas[0].id;
        }

        for (let i: number = 0; i <= capa.length - 1; i++) {
          if (this.zona.capasSeleccionadas[x].id == capa[i]) {
            borrar = false;
          } else {
            id = this.zona.capasSeleccionadas[x].id;
          }
        }

        if (borrar) {
          this.remueveCapas(id);
          this.zona.capasSeleccionadas.splice(x, 1);
        }
      }
    }
  }

  reloadEditedCapa() {
    let capaRecargar = this.zona.capasDeInformacion.find(
      (x: any) => x.id == this.zona.editedCapaId
    );
    this.remueveCapas(this.zona.editedCapaId);
    this.getTiposLugarPorCliente(capaRecargar, false);
  }

  reloadCapas(marcador: boolean) {
    //Antes utilizaba this.selectedCapas
    if (this.zona.capasSeleccionadas.length > 0) {
      this.zona.capasSeleccionadas.forEach((capa: any, idx: number) => {
        let capaRecargar = this.zona.capasDeInformacion.find(
          (x: any) => x.id == capa.id
        );
        if (capaRecargar !== undefined && capaRecargar !== null) {
          if (marcador) {
            this.getTiposLugarPorCliente(capaRecargar, true);
          } else {
            this.remueveCapas(capaRecargar.id);
            this.getTiposLugarPorCliente(capaRecargar, false);
          }
        }
      });
    }
  }

  limpiarCapas() {
    this.zona.capasDeInformacion.forEach((x: any) => this.remueveCapas(x.id));
    this.zona.capasSeleccionadas.forEach((x: any) => this.remueveCapas(x.id));
  }

  async getSitiosSugal() {
    this.tarifas = await fetchTarifasPlantas().then((t: any) => t.data.tarifas);
    let sitios: any = [];
    await fetchSitiosSugal().then((x: any) => {
      x.data.sitios.forEach((s: any) => {
        this.dibujaCapasInformacion(s, this.map);
        sitios.push(s);
      });
    });
    if (sitios != null) {
      filtroHomeEventBus.$emit('sitiosSugal', sitios);
    }
  }

  getTiposLugarPorCliente(tipo: any, marcador: boolean) {
    const clienteId = config.getClienteSesion();
    this.zona.axios.http
      .get(`${this.zona.controllerCoordenada}/${clienteId}/${tipo.id}/cliente`)
      .then(res => {
        // Dibujar nueva capa sobre capas antiguas
        this.zona.lugares = JSON.parse(res.data);
        this.zona.lugares.forEach((elem: any) => {
          if (marcador) {
            this.dibujaCapasInformacionMarcador(elem, this.map);
          } else {
            this.dibujaCapasInformacion(elem, this.map);
          }
        });
      })
      .catch(err => {});
  }

  remueveCapas(capaId: number) {
    this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
      infoWin.close();
    });

    for (let i = this.zona.polylines.length - 1; i >= 0; i--) {
      let polyline: any = this.zona.polylines[i];
      if (polyline.grupoId === capaId) {
        polyline.setMap(null);
        this.zona.polylines.splice(i, 1);
      }
    }

    for (let i = this.zona.circles.length - 1; i >= 0; i--) {
      let circle: any = this.zona.circles[i];
      if (circle.grupoId === capaId) {
        circle.setMap(null);
        this.zona.circles.splice(i, 1);
      }
    }

    for (let i = this.zona.markerZona.length - 1; i >= 0; i--) {
      let marker: any = this.zona.markerZona[i];
      if (marker.grupoId === capaId) {
        this.removeEventListeners(marker);
        marker.setMap(null);
        this.zona.markerZona.splice(i, 1);
      }
    }
  }

  removeOverlay(Id: number) {
    this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
      infoWin.close();
    });

    for (let i = this.zona.polylines.length - 1; i >= 0; i--) {
      let polyline: any = this.zona.polylines[i];
      if (polyline.id === Id) {
        polyline.setMap(null);
        this.zona.polylines.splice(i, 1);
        return;
      }
    }

    for (let i = this.zona.circles.length - 1; i >= 0; i--) {
      let circle: any = this.zona.circles[i];
      if (circle.id === Id) {
        circle.setMap(null);
        this.zona.circles.splice(i, 1);
        return;
      }
    }

    for (let i = this.zona.markerZona.length - 1; i >= 0; i--) {
      let marker: any = this.zona.markerZona[i];
      if (marker.id === Id) {
        this.removeEventListeners(marker);
        marker.setMap(null);
        this.zona.markerZona.splice(i, 1);
        return;
      }
    }
  }

  dibujaCapasInformacion(el: any, map: google.maps.Map) {
    switch (el.tipoGeometria) {
      case TipoGeometria.Poligono:
        this.dibujarPoligono(el, map);
        break;
      case TipoGeometria.Circunferencia:
        this.dibujarCircunferencia(el, map);
        break;
      case TipoGeometria.Rectangulo:
        this.dibujarRectangulo(el, map);
        break;
      case TipoGeometria.Marcador:
        this.dibujarMarcadorCapa(el, map);
        break;
    }
  }

  dibujaCapasInformacionMarcador(el: any, map: google.maps.Map) {
    switch (el.tipoGeometria) {
      case TipoGeometria.Marcador:
        this.dibujarMarcadorCapa(el, map);
        break;
    }
  }

  dibujarPoligono(capa: any, map: google.maps.Map) {
    let coordenadas: any = [];
    let item = capa.formaJson.split('|');

    item.forEach((coord: any) => {
      let latlng = coord.split(';');

      if (latlng.length >= 2) {
        let latitud = parseFloat(latlng[0]);
        let longitud = parseFloat(latlng[1]);
        coordenadas.push({ lat: latitud, lng: longitud });
      }
    });

    let poligonoCoords = coordenadas;
    let color = '#FF0000'; //rojo  Sitio Prohibido
    let linecolor = '#FF0000'; //rojo
    if (capa.tipositiocliente == TipoSitiosSugal.Punto_Prohibido) {
      color = '#FF0000'; //Rojo
      linecolor = '#FF0000'; //Rojo
    } else if (capa.tipositiocliente == TipoSitiosSugal.Fundo) {
      color = '#3A01DF'; //amarillo
      linecolor = '#3A01DF'; //azul
    } else if (
      capa.tipositiocliente == TipoSitiosSugal.Planta_Talca ||
      capa.tipoSitioCliente == TipoSitiosSugal.Planta_Tilcoco
    ) {
      color = '#ffff00'; //amarillo
      linecolor = '#3A01DF'; //azul
    }

    let poligono = new (google.maps.Polygon as any)({
      grupoId: capa.grupoId,
      paths: poligonoCoords,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
      id: capa.id,
    });

    let dataInfoWinZona: InfoZonaVm = {
      id: capa.id,
      tipoalcance: capa.tipoAlcance,
      tipo: capa.tipoZonaNombre,
      tipolugar: capa.tipoLugarNombre,
      nombre: capa.nombre,
      tipodibujo: 'Polígono',
      tipogeometria: TipoGeometria.Poligono,
      formaJson: capa.formaJson,
      grupoId: capa.grupoId,
      tipozonaid: capa.tipositiocliente,
    };
    let tarifa: any = {
      id: capa.id,
      tarifaTalca: this.getTarifaPlanta(capa.id, 642775),
      tarifaQuinta: this.getTarifaPlanta(capa.id, 627550),
      //tarifaProducto: this.getTarifaPlanta(capa.id, 'Planta Producto'),
    };

    let infowindowzona = new google.maps.InfoWindow({
      content: config.createInfoWindowFundo(dataInfoWinZona, tarifa),
    });

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(infowindowzona, 'closeclick', () => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      ZonaEventBus.$emit('controlDibujo-cerrar');
    });

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(poligono, 'click', (e: any) => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      infowindowzona.setPosition(e.latLng);
      infowindowzona.open(this.map);
      this.zona.infoWindowsZonas.push(infowindowzona);
    });
    this.zona.polylines.push(poligono);
    poligono.setMap(map);
  }

  getTarifaPlanta(id: number, codPlanta: number) {
    let tarifa = this.tarifas.filter(
      (x: any) => x.cod_sitio == id && x.cod_planta == codPlanta
    );
    if (tarifa.length > 0) return tarifa[0].nro_tarifa;
    else return;
  }

  dibujarRectangulo(capa: any, map: google.maps.Map) {
    let item = capa.formaJson.split('|');
    let flagCoor = 0;
    let cont = 1;
    let north = 0;
    let west = 0;
    let south = 0;
    let east = 0;

    item.forEach((coord: any) => {
      let latlng = coord.split(';');

      if (latlng.length >= 2) {
        if (cont == 1) {
          north = parseFloat(latlng[0]);
        }
        if (cont == 2) {
          west = parseFloat(latlng[1]);
        }
        if (cont == 3) {
          south = parseFloat(latlng[0]);
        }
        if (cont == 4) {
          east = parseFloat(latlng[1]);
        }
      }
      cont++;
    });

    let ne = new google.maps.LatLng(north, east);
    let sw = new google.maps.LatLng(south, west);
    let recBounds = new google.maps.LatLngBounds(ne, sw);
    let color = '#FF0000'; //rojo
    let linecolor = '#FF0000'; //rojo
    if (capa.tipoAlcance == TipoLugarAlcance.GPS) {
      color = '#ffff00'; //amarillo
      linecolor = '#3A01DF'; //azul
    } else {
      if (capa.tipoZonaId == TiposZonas.Sitio) {
        color = '#3A01DF'; //azul
        linecolor = '#3A01DF'; //azul
      } else {
        //color = "#50555b" //gris
        color = '#FF0000'; //rojo
        linecolor = '#FF0000'; //azul
      }
    }

    let rectangulo = new (google.maps.Rectangle as any)({
      grupoId: capa.grupoId,
      bounds: recBounds,
      strokeColor: linecolor,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
      id: capa.id,
    });

    let dataInfoWinZona: InfoZonaVm = {
      id: capa.id,
      tipoalcance: capa.tipoAlcance,
      tipo: capa.tipoZonaNombre,
      tipolugar: capa.tipoLugarNombre,
      nombre: capa.nombre,
      tipodibujo: 'Rectángulo',
      tipogeometria: TipoGeometria.Rectangulo,
      formaJson: capa.formaJson,
      grupoId: capa.grupoId,
      tipozonaid: capa.tipositiocliente,
    };
    let tarifa: any = {
      id: capa.id,
      tarifaTalca: this.getTarifaPlanta(capa.id, 642775),
      tarifaQuinta: this.getTarifaPlanta(capa.id, 627550),
      //tarifaProducto: this.getTarifaPlanta(capa.id, 'Planta Producto'),
    };

    let infowindowzona = new google.maps.InfoWindow({
      content: config.createInfoWindowFundo(dataInfoWinZona, tarifa),
    });

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(infowindowzona, 'closeclick', () => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });
      ZonaEventBus.$emit('controlDibujo-cerrar');
    });

    // TODO limpiar listeners al eliminar
    google.maps.event.addListener(rectangulo, 'click', (e: any) => {
      this.zona.infoWindowsZonas.forEach((infoWin: google.maps.InfoWindow) => {
        infoWin.close();
      });

      infowindowzona.setPosition(e.latLng);
      infowindowzona.open(this.map);
      this.zona.infoWindowsZonas.push(infowindowzona);
    });

    this.zona.polylines.push(rectangulo);
    rectangulo.setMap(map);
  }

  dibujarCircunferencia(capa: any, map: google.maps.Map) {
    let latlng = capa.formaJson.split(';');

    if (latlng.length >= 3) {
      let coordenadas = {
        center: {
          lat: parseFloat(latlng[0]),
          lng: parseFloat(latlng[1]),
        },
        population: parseFloat(latlng[2]),
      };

      let color = '#FF0000'; //rojo
      let linecolor = '#FF0000'; //rojo
      if (capa.tipoAlcance == TipoLugarAlcance.GPS) {
        color = '#ffff00'; //amarillo
        linecolor = '#3A01DF'; //azul
      } else {
        if (capa.tipoZonaId == TiposZonas.Sitio) {
          color = '#3A01DF'; //azul
          linecolor = '#3A01DF'; //azul
        } else {
          //color = "#50555b" //gris
          color = '#FF0000'; //rojo
          linecolor = '#FF0000'; //azul
        }
      }
      let cityCircle = new (google.maps.Circle as any)({
        grupoId: capa.grupoId,
        id: capa.id,
        strokeColor: linecolor,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        center: coordenadas.center,
        radius: coordenadas.population, //Math.sqrt(coordenadas.population) * 100
      });

      let dataInfoWinZona: InfoZonaVm = {
        id: capa.id,
        tipoalcance: capa.tipoAlcance,
        tipo: capa.tipoZonaNombre,
        tipolugar: capa.tipoLugarNombre,
        nombre: capa.nombre,
        tipodibujo: 'Circunferencia',
        tipogeometria: TipoGeometria.Circunferencia,
        formaJson: capa.formaJson,
        grupoId: capa.grupoId,
        tipozonaid: capa.tipositiocliente,
      };
      let tarifa: any = {
        id: capa.id,
        tarifaTalca: this.getTarifaPlanta(capa.id, 642775),
        tarifaQuinta: this.getTarifaPlanta(capa.id, 627550),
        //tarifaProducto: this.getTarifaPlanta(capa.id, 'Planta Producto'),
      };

      let infowindowzona = new google.maps.InfoWindow({
        content: config.createInfoWindowFundo(dataInfoWinZona, tarifa),
      });

      // TODO limpiar listeners al eliminar
      google.maps.event.addListener(infowindowzona, 'closeclick', () => {
        this.zona.infoWindowsZonas.forEach(
          (infoWin: google.maps.InfoWindow) => {
            infoWin.close();
          }
        );
        ZonaEventBus.$emit('controlDibujo-cerrar');
      });

      // TODO limpiar listeners al eliminar
      google.maps.event.addListener(cityCircle, 'click', (e: any) => {
        this.zona.infoWindowsZonas.forEach(
          (infoWin: google.maps.InfoWindow) => {
            infoWin.close();
          }
        );
        infowindowzona.setPosition(cityCircle.getCenter());
        infowindowzona.open(this.map);
        this.zona.infoWindowsZonas.push(infowindowzona);
      });

      this.zona.circles.push(cityCircle);
    }
  }

  dibujarMarcadorCapa(capa: any, map: google.maps.Map) {
    let coordenadas: any = {};
    let latlng = capa.formaJson.split(';');

    if (capa.formaJson !== '0;0') {
      if (latlng.length >= 2) {
        let latitud = parseFloat(latlng[0]);
        let longitud = parseFloat(latlng[1]);
        coordenadas = { lat: latitud, lng: longitud };
        let iconourl =
          'http://www.clker.com/cliparts/G/R/Y/M/S/g/map-pin-yellow-th.png';
        // if (capa.tipoAlcance == TipoLugarAlcance.GPS){
        //   iconourl = "http://www.clker.com/cliparts/3/5/y/O/U/I/blue-pin-th.png";
        // }
        let icon = {
          url: iconourl,
          scaledSize: new google.maps.Size(32, 51),
        };

        let marker = new (google.maps.Marker as any)({
          grupoId: capa.grupoId,
          id: capa.id,
          vehiculoId: capa.vehiculoId,
          transmitiendo: capa.transmitiendo,
          position: coordenadas,
          map: map,
          icon: icon,
          title: '',
          //animation: google.maps.Animation.DROP
        });

        let dataInfoWinZona: InfoZonaVm = {
          id: capa.id,
          tipoalcance: capa.tipoAlcance,
          tipo: capa.tipoZonaNombre,
          tipolugar: capa.tipoLugarNombre,
          nombre: capa.nombre,
          tipodibujo: 'Marcador',
          tipogeometria: TipoGeometria.Marcador,
          formaJson: capa.formaJson,
          grupoId: capa.grupoId,
          tipozonaid: capa.tipositiocliente,
        };
        let tarifa: any = {
          id: capa.id,
          tarifaTalca: this.getTarifaPlanta(capa.id, 642775),
          tarifaQuinta: this.getTarifaPlanta(capa.id, 627550),
          //tarifaProducto: this.getTarifaPlanta(capa.id, 'Planta Producto'),
        };

        let infowindowzona = new google.maps.InfoWindow({
          content: config.createInfoWindowFundo(dataInfoWinZona, tarifa),
        });

        const eventListeners = [];

        eventListeners.push(
          google.maps.event.addListener(infowindowzona, 'closeclick', () => {
            this.zona.infoWindowsZonas.forEach(
              (infoWin: google.maps.InfoWindow) => {
                infoWin.close();
              }
            );
            ZonaEventBus.$emit('controlDibujo-cerrar');
          })
        );

        eventListeners.push(
          google.maps.event.addListener(marker, 'click', (e: any) => {
            this.zona.infoWindowsZonas.forEach(
              (infoWin: google.maps.InfoWindow) => {
                infoWin.close();
              }
            );

            infowindowzona.setPosition(e.latLng);
            infowindowzona.open(this.map);
            this.zona.infoWindowsZonas.push(infowindowzona);
          })
        );

        marker.gps = {
          eventListeners,
        };

        this.zona.markerZona.push(marker);
      }
    }
  }

  handleChangeFundoCenter(obj: any) {
    var tienePipe = obj.split('|');
    var latitud = 0;
    var longitud = 0;
    var latlong;

    if (tienePipe != null) {
      latlong = tienePipe[0].split(';');
      latitud = latlong[0];
      longitud = latlong[1];
    } else {
      latlong = obj.split(';');
      latitud = latlong[0];
      longitud = latlong[1];
    }

    var location = new google.maps.LatLng(latitud, longitud);
    this.map.setCenter(location);
    this.map.setZoom(13);
  }

  private setShowCrearZona(showCrearZona: boolean) {
    window.setTimeout(() => {
      ZonaEventBus.$emit(`crearZona-${showCrearZona ? 'abrir' : 'cerrar'}`);
      this.zona.showCrearZona = showCrearZona;
    });
  }

  private removeEventListeners(marker: any) {
    marker.gps.eventListeners.forEach((listener: any) => listener.remove());
  }

  beforeDestroy() {
    this.removeAllEventListeners();
  }

  copyToClipboard() {
    this.snackbar = true;

    this.snackbarMessage =
      'Copiado: ' + this.currentMouseLat + ', ' + this.currentMouseLng;
    var el = document.createElement('textarea');
    el.value = this.currentMouseLat + ',' + this.currentMouseLng;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  updateMouseCoordinates(event: MouseEvent) {
    const point2LatLng = (point: google.maps.Point) => {
      const { map } = this;
      const topRight = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getNorthEast());
      const bottomLeft = map
        .getProjection()
        .fromLatLngToPoint(map.getBounds().getSouthWest());
      const scale = Math.pow(2, map.getZoom());
      const worldPoint = new google.maps.Point(
        point.x / scale + bottomLeft.x,
        point.y / scale + topRight.y
      );
      return map.getProjection().fromPointToLatLng(worldPoint);
    };

    const mouseLatLng = point2LatLng(
      new google.maps.Point(event.clientX, event.clientY)
    );
    this.currentMouseLat = mouseLatLng.lat().toString();
    this.currentMouseLng = mouseLatLng.lng().toString();
  }

  private isCortaCorrienteAbierto() {
    return this.$store.getters.getcortaCorrienteAbierto.cortaCorrienteAbierto;
  }

  cerrarCortaCorriente() {
    const data: any = {
      show: false,
      vehiculoId: 0,
      showCorteIgnicion: false,
      fechaRecepcion: null,
      usuarioId: 0,
      dataComunicacion: {
        mensajeTxt: '',
        fechaSolicitudTxt: '',
        estadoTxt: '',
        usuarioTxt: '',
      },
    };
    CortaCorrienteEventBus.abrirCortaCorrienteHome(data);
    store.commit('setCortaCorrienteAbierto', false);
  }
}
</script>

<style scoped>
.mapContainer {
  width: 100%;
  height: 1020px;
}
.mapContainerVerDetalle {
  width: 100%;
  height: 560px;
}

.google-map {
  width: 100%;
  height: 110vh;
  margin: 0 auto;
  background: gray;
}

.theme--dark.v-btn.v-btn--disabled:not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline) {
  background-color: #526da5 !important;
}
.primary--text {
  color: #ffe800 !important;
  caret-color: #ffe800 !important;
}
/* .v-dialog--active {
      overflow: auto !important;
    } */
.v-slider {
  font-size: 14px;
}

.v-icon--right {
  margin-left: 1px !important;
}
.menuable__content__active {
  z-index: 1015000 !important; /*1000 !important;*/
  width: 664px !important;
}
.v-dialog--active {
  overflow: hidden !important;
}
#divRepetirDia {
  font: 400 11px Asap, sans-serif !important;
}
#divRepetirDia2 {
  font: 400 11px Asap, sans-serif !important;
}
</style>

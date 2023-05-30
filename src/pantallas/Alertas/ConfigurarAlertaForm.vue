<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer :titulo="tituloModal">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  persistent-hint
                  @change="cambioEstadoSwitch"
                  :hint="mensajeEstado"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombre.label"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  counter="80"
                  :disabled="modoVer"
                  :validate="validarNombre"
                  message="Ya existe una Alerta con este nombre"
                ></CampoUnico>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-select
                  :label="formFields.tipo.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.tipo.id)"
                  :data-vv-name="formFields.tipo.id"
                  v-model="formFields.tipo.value"
                  :items="lstAlertasBase"
                  @change="handlerChangeTipo"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer || modoEditar"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-autocomplete
                  :label="formFields.color.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.color.id)"
                  :data-vv-name="formFields.color.id"
                  v-model="formFields.color.value"
                  item-value="title"
                  item-text="title"
                  no-data-text="Sin resultados"
                  :items="colores"
                  class="styled-select"
                  :disabled="modoVer"
                >
                  <template v-slot:selection="data">
                    <v-avatar :color="data.item.icon" size="20"></v-avatar>
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
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaGenerica">
              <v-flex xs12 sm6 md6>
                <!--v-if="esAcumulable"-->
                <v-text-field
                  :label="formFields.eventos.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaGenerica &&
                        (!formFields.temporalidad.value ||
                          formFields.temporalidad.value == 0)
                          ? true
                          : false,
                      numeric: true,
                      max: 2,
                      min_value:
                        muestraAlertaGenerica &&
                        formFields.temporalidad.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.eventos.id)"
                  :data-vv-name="formFields.eventos.id"
                  v-model="formFields.eventos.value"
                  :disabled="modoVer"
                  counter="2"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <!--v-if="esAcumulable"-->
                <v-text-field
                  :label="formFields.temporalidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaGenerica &&
                        (!formFields.eventos.value ||
                          formFields.eventos.value == 0)
                          ? true
                          : false,
                      numeric: true,
                      max: 3,
                      min_value:
                        muestraAlertaGenerica && formFields.eventos.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.temporalidad.id)"
                  :data-vv-name="formFields.temporalidad.id"
                  v-model="formFields.temporalidad.value"
                  :disabled="modoVer"
                  counter="3"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md6
                v-for="campo in lstCampos"
                v-bind:key="campo.id"
              >
                <v-text-field
                  v-if="campo.tipoCampo != 4"
                  :label="campo.descripcionCampo"
                  v-validate="{
                    rules: {
                      required: campo.requerido,
                    },
                  }"
                  :error-messages="errors.collect(`${campo.id}`)"
                  :data-vv-name="campo.id"
                  v-bind:ref="campo.id"
                  v-model="campo.valor"
                  @change="handleCamposChange(campo.id, $event)"
                  @keyup="handleCamposKeyUp(campo.id, $event)"
                  :disabled="modoVer"
                />
                <v-switch
                  v-if="campo.tipoCampo == 4"
                  :label="campo.descripcionCampo"
                  :color="'success'"
                  v-model="campo.valor"
                  persistent-hint
                  @change="handleCamposChange(campo.id, $event)"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaZona">
              <v-flex xs6 sm6 md6>
                <DatePicker
                  :label="formFields.desde.label"
                  v-validate="{
                    rules: {
                      required: muestraAlertaZona ? true : false,
                      validaFecha: muestraAlertaZona ? true : false,
                    },
                  }"
                  :error-messages="errors.collect(formFields.desde.id)"
                  :id="formFields.desde.id"
                  v-model="formFields.desde.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <DatePicker
                  :label="formFields.hasta.label"
                  v-validate="{
                    rules: {
                      required: muestraAlertaZona ? true : false,
                      validaFecha: muestraAlertaZona ? true : false,
                    },
                  }"
                  :error-messages="errors.collect(formFields.hasta.id)"
                  :id="formFields.hasta.id"
                  v-model="formFields.hasta.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.parametrosGenerales.label"
                  :color="'success'"
                  v-model="formFields.parametrosGenerales.value"
                  persistent-hint
                  :readonly="modoVer"
                  @change="handleParametrosGeneralesChange"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.velocidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      min_value: 1,
                      numeric: true,
                      max: 3,
                      max_value: 240,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.velocidad.id)"
                  :data-vv-name="formFields.velocidad.id"
                  v-model="formFields.velocidad.value"
                  @change="handleVelocidadChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tolerancia.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 2,
                      max_value: 99,
                      min_value: 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.tolerancia.id)"
                  :data-vv-name="formFields.tolerancia.id"
                  v-model="formFields.tolerancia.value"
                  @change="handleToleranciaChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="2"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <!-- es nuevo -->

              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.hdopdesde.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      max: 3,
                      max_value: 9.9,
                      min_value: 0.1,
                      decimal: 1,
                    },
                  }"
                  :error-messages="errors.collect(formFields.hdopdesde.id)"
                  :data-vv-name="formFields.hdopdesde.id"
                  v-model="formFields.hdopdesde.value"
                  @change="handlehDopdesdeChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumberDecimal($event)"
                />
              </v-flex>

              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.hdophasta.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      max: 3,
                      max_value: 9.9,
                      min_value: formFields.hdopdesde.value,
                      decimal: 1,
                    },
                  }"
                  :error-messages="errors.collect(formFields.hdophasta.id)"
                  :data-vv-name="formFields.hdophasta.id"
                  v-model="formFields.hdophasta.value"
                  @change="handlehDophastaChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumberDecimal($event)"
                />
              </v-flex>

              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.nsatelites.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 99,
                      max_value: 99,
                      min_value: 3,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.nsatelites.id)"
                  :data-vv-name="formFields.nsatelites.id"
                  v-model="formFields.nsatelites.value"
                  @change="handlenSatelitesChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="2"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>

              <v-flex xs12 sm6 md6>
                <!--v-if="esAcumulable"-->
                <v-text-field
                  :label="formFields.eventos.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona &&
                        (!formFields.temporalidad.value ||
                          formFields.temporalidad.value == 0) &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 2,
                      min_value:
                        muestraAlertaZona && formFields.temporalidad.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.eventos.id)"
                  :data-vv-name="formFields.eventos.id"
                  v-model="formFields.eventos.value"
                  @change="handleEventosChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="2"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <!--v-if="esAcumulable"-->
                <v-text-field
                  :label="formFields.temporalidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaZona &&
                        (!formFields.eventos.value ||
                          formFields.eventos.value == 0) &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 3,
                      min_value:
                        muestraAlertaZona && formFields.eventos.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.temporalidad.id)"
                  :data-vv-name="formFields.temporalidad.id"
                  v-model="formFields.temporalidad.value"
                  @change="handleTemporalidadChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-select
                  :label="formFields.tipoZona.label"
                  :error-messages="errors.collect(formFields.tipoZona.id)"
                  :data-vv-name="formFields.tipoZona.id"
                  v-model="formFields.tipoZona.value"
                  :items="lstTipoZonas"
                  item-text="nombre"
                  item-value="id"
                  @change="handleTipoZonaChange"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <Buscador
                  :filter="
                    gridApiZonas &&
                      gridApiZonas.setQuickFilter.bind(gridApiZonas)
                  "
                />
              </v-flex>
              <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                  <v-flex md12>
                    <v-card>
                      <MantenedorGridVerDetalle
                        v-if="modoVer"
                        :grid-options="gridOptionsZonas"
                        :row-data="lstZonasVerDetalle"
                      />
                      <AsociacionGrid
                        v-else
                        :grid-options="gridOptionsZonas"
                        :esEditar="!alertaSeleccionada ? false : true"
                        :headerCheckbox="false"
                      />
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaRuta">
              <v-flex xs6 sm6 md6>
                <DatePicker
                  :label="formFields.desde.label"
                  v-validate="{
                    rules: {
                      required: muestraAlertaRuta ? true : false,
                      validaFecha: muestraAlertaRuta ? true : false,
                    },
                  }"
                  :error-messages="errors.collect(formFields.desde.id)"
                  :id="formFields.desde.id"
                  v-model="formFields.desde.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <DatePicker
                  :label="formFields.hasta.label"
                  v-validate="{
                    rules: {
                      required: muestraAlertaRuta ? true : false,
                      validaFecha: muestraAlertaRuta ? true : false,
                    },
                  }"
                  :error-messages="errors.collect(formFields.hasta.id)"
                  :id="formFields.hasta.id"
                  v-model="formFields.hasta.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.parametrosGenerales.label"
                  :color="'success'"
                  v-model="formFields.parametrosGenerales.value"
                  persistent-hint
                  @change="handleParametrosGeneralesChange"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.velocidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaRuta && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      min_value: 1,
                      integer: true,
                      max_value: 240,
                      max: 3,
                    },
                  }"
                  :error-messages="errors.collect(formFields.velocidad.id)"
                  :data-vv-name="formFields.velocidad.id"
                  v-model="formFields.velocidad.value"
                  @change="handleVelocidadChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tolerancia.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaRuta && !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 2,
                      max_value: 99,
                      min_value: 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.tolerancia.id)"
                  :data-vv-name="formFields.tolerancia.id"
                  v-model="formFields.tolerancia.value"
                  @change="handleToleranciaChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="2"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <!-- v-if="esAcumulable" -->
                <v-text-field
                  :label="formFields.eventos.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaRuta &&
                        (!formFields.temporalidad.value ||
                          formFields.temporalidad.value == 0) &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 2,
                      min_value:
                        muestraAlertaRuta && formFields.temporalidad.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.eventos.id)"
                  :data-vv-name="formFields.eventos.id"
                  v-model="formFields.eventos.value"
                  @change="handleEventosChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <!--v-if="esAcumulable"-->
                <v-text-field
                  :label="formFields.temporalidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaRuta &&
                        (!formFields.eventos.value ||
                          formFields.eventos.value == 0) &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 3,
                      min_value:
                        muestraAlertaRuta && formFields.eventos.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.temporalidad.id)"
                  :data-vv-name="formFields.temporalidad.id"
                  v-model="formFields.temporalidad.value"
                  @change="handleTemporalidadChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-select
                  :label="formFields.tipoZona.label"
                  :error-messages="errors.collect(formFields.tipoZona.id)"
                  :data-vv-name="formFields.tipoZona.id"
                  v-model="formFields.tipoZona.value"
                  :items="lstTipoZonas"
                  item-text="nombre"
                  item-value="id"
                  @change="handleTipoZonaChange"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <Buscador
                  :filter="
                    gridApiZonasRutas &&
                      gridApiZonasRutas.setQuickFilter.bind(gridApiZonasRutas)
                  "
                />
              </v-flex>
              <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                  <v-flex md12>
                    <v-card>
                      <MantenedorGridVerDetalle
                        v-if="modoVer"
                        :grid-options="gridOptionsZonasRutas"
                        :row-data="lstZonasVerDetalle"
                      />
                      <AsociacionGrid
                        v-else
                        :grid-options="gridOptionsZonasRutas"
                        :esEditar="!alertaSeleccionada ? false : true"
                        :headerCheckbox="false"
                      />
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaUsoNoAutorizado">
              <v-flex xs12 sm6 md6>
                <v-select
                  :label="formFields.zona.label"
                  :error-messages="errors.collect(formFields.zona.id)"
                  :data-vv-name="formFields.zona.id"
                  v-model="formFields.zona.value"
                  :items="lstZonas"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer"
                  clearable
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tolerancia.label"
                  v-validate="{
                    rules: {
                      required: muestraAlertaUsoNoAutorizado ? true : false,
                      numeric: true,
                      max: 2,
                      max_value: 99,
                      min_value: 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.tolerancia.id)"
                  :data-vv-name="formFields.tolerancia.id"
                  v-model="formFields.tolerancia.value"
                  :disabled="modoVer"
                  counter="2"
                />
              </v-flex>
              <v-flex xs12 sm6 md6 v-if="esAcumulable">
                <v-text-field
                  :label="formFields.eventos.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaUsoNoAutorizado &&
                        (!formFields.temporalidad.value ||
                          formFields.temporalidad.value == 0)
                          ? true
                          : false,
                      numeric: true,
                      max: 2,
                      min_value:
                        muestraAlertaUsoNoAutorizado &&
                        formFields.temporalidad.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.eventos.id)"
                  :data-vv-name="formFields.eventos.id"
                  v-model="formFields.eventos.value"
                  :disabled="modoVer"
                  counter="2"
                />
              </v-flex>
              <v-flex xs12 sm6 md6 v-if="esAcumulable">
                <v-text-field
                  :label="formFields.temporalidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaUsoNoAutorizado &&
                        (!formFields.eventos.value ||
                          formFields.eventos.value == 0)
                          ? true
                          : false,
                      numeric: true,
                      max: 3,
                      min_value:
                        muestraAlertaUsoNoAutorizado &&
                        formFields.eventos.value < 1
                          ? 1
                          : 0,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.temporalidad.id)"
                  :data-vv-name="formFields.temporalidad.id"
                  v-model="formFields.temporalidad.value"
                  :disabled="modoVer"
                  counter="3"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <table id="tDiasHoras" aria-hidden="true">
                  <thead>
                    <tr>
                      <th id="thHora"></th>
                      <th v-for="dia in dias" :key="dia.id" :id="dia.id">
                        {{ dia.value }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="hora in horas" :key="hora">
                      <th :id="hora">{{ hora }}</th>
                      <td
                        v-for="dia in dias"
                        :key="dia.value"
                        :id="dia.id + '_' + hora"
                        @click="handleClickDiaHora(dia.id, hora, modoVer)"
                        :disabled="modoVer"
                      ></td>
                    </tr>
                  </tbody>
                </table>
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaDetencionNoAutorizada">
              <v-flex xs12 md6 lg6>
                <v-radio-group
                  v-model="formFields.vehiculoIgnicion.value"
                  row
                  @change="handlerChangeIgnicion"
                  :disabled="modoVer"
                >
                  <v-radio
                    label="Vehículo sin ignición"
                    value="sinIgnicion"
                  ></v-radio>
                  <v-radio
                    label="Vehículo con ignición"
                    value="conIgnicion"
                  ></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.velocidadIgnicion.label"
                  v-validate="'numeric'"
                  :error-messages="
                    errors.collect(formFields.velocidadIgnicion.id)
                  "
                  :data-vv-name="formFields.velocidadIgnicion.id"
                  v-model="formFields.velocidadIgnicion.value"
                  :disabled="deshabilitaDetencionVelocidad || modoVer"
                />
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-switch
                  :label="formFields.parametrosGenerales.label"
                  :color="'success'"
                  v-model="formFields.parametrosGenerales.value"
                  persistent-hint
                  @change="handleParametrosGeneralesChange"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm6 md6 v-if="esAcumulable && showEventos">
                <v-text-field
                  :label="formFields.eventos.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaDetencionNoAutorizada &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      min_value: 1,
                      max: 2,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.eventos.id)"
                  :data-vv-name="formFields.eventos.id"
                  v-model="formFields.eventosDetencion.value"
                  @change="handleEventosChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="2"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6 v-if="esAcumulable && showTemporalidad">
                <v-text-field
                  :label="formFields.temporalidad.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaDetencionNoAutorizada &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 3,
                      min_value:
                        muestraAlertaDetencionNoAutorizada &&
                        formFields.eventos.value < 1
                          ? 1
                          : 0,
                      integer: true,
                      temporalidad_mayor: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.temporalidad.id)"
                  :data-vv-name="formFields.temporalidad.id"
                  v-model="formFields.temporalidad.value"
                  @change="handleTemporalidadChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tiempoDetencion.label"
                  v-validate="{
                    rules: {
                      required:
                        muestraAlertaDetencionNoAutorizada &&
                        !deshabilitaParametrosGenerales
                          ? true
                          : false,
                      numeric: true,
                      max: 3,
                      min_value: 1,
                      integer: true,
                      temporalidad_mayor:
                        deshabilitaDetencionVelocidad === true ? false : true,
                    },
                  }"
                  :error-messages="
                    errors.collect(formFields.tiempoDetencion.id)
                  "
                  :data-vv-name="formFields.tiempoDetencion.id"
                  v-model="formFields.tiempoDetencion.value"
                  @change="handleTiempoDetencionChange"
                  :disabled="modoVer || deshabilitaParametrosGenerales"
                  counter="3"
                  @keypress="handleFilterInputNumber($event)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6></v-flex>
              <v-flex xs12 sm6 md6>
                <v-select
                  :label="formFields.tipoZona.label"
                  :error-messages="errors.collect(formFields.tipoZona.id)"
                  :data-vv-name="formFields.tipoZona.id"
                  v-model="formFields.tipoZona.value"
                  :items="lstTipoZonas"
                  item-text="nombre"
                  item-value="id"
                  @change="handleTipoZonaChange"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <Buscador
                  :filter="
                    gridApiZonasDetencion &&
                      gridApiZonasDetencion.setQuickFilter.bind(
                        gridApiZonasDetencion
                      )
                  "
                />
              </v-flex>
              <v-container grid-list-md text-xs-center>
                <v-layout row wrap>
                  <v-flex md12>
                    <v-card>
                      <MantenedorGridVerDetalle
                        v-if="modoVer"
                        :grid-options="gridOptionsZonasDetencion"
                        :row-data="lstZonasVerDetalle"
                      />
                      <AsociacionGrid
                        v-else
                        :grid-options="gridOptionsZonasDetencion"
                        :esEditar="!alertaSeleccionada ? false : true"
                      />
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaMantencionPorVencer">
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.horasMotor.label"
                  v-validate="{
                    rules: {
                      required:
                        (muestraAlertaMantencionPorVencer ? true : false) &&
                        formFields.kilometros.value === '' &&
                        formFields.tiempo.value === '',
                      numeric: true,
                      min_value: 1,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.horasMotor.id)"
                  :data-vv-name="formFields.horasMotor.id"
                  v-model="formFields.horasMotor.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.kilometros.label"
                  v-validate="{
                    rules: {
                      required:
                        (muestraAlertaMantencionPorVencer ? true : false) &&
                        formFields.horasMotor.value === '' &&
                        formFields.tiempo.value === '',
                      numeric: true,
                      min_value: 1,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.kilometros.id)"
                  :data-vv-name="formFields.kilometros.id"
                  v-model="formFields.kilometros.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tiempo.label"
                  v-validate="{
                    rules: {
                      required:
                        (muestraAlertaMantencionPorVencer ? true : false) &&
                        formFields.kilometros.value === '' &&
                        formFields.horasMotor.value === '',
                      numeric: true,
                      max_value: maximoTiempo,
                      min_value: 1,
                      integer: true,
                    },
                  }"
                  :error-messages="errors.collect(formFields.tiempo.id)"
                  :data-vv-name="formFields.tiempo.id"
                  v-model="formFields.tiempo.value"
                  :disabled="modoVer"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-select
                  :label="formFields.unidadTiempo.label"
                  :error-messages="errors.collect(formFields.unidadTiempo.id)"
                  v-validate="{
                    rules: {
                      required: muestraAlertaMantencionPorVencer ? true : false,
                    },
                  }"
                  :data-vv-name="formFields.unidadTiempo.id"
                  v-model="formFields.unidadTiempo.value"
                  :items="formFields.unidadTiempo.items"
                  @change="handleUnidadTiempo"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
            <v-layout
              row
              wrap
              v-show="
                muestraAlertaMantencionPorVencer ||
                  muestraAlertaMantencionVencida
              "
            >
              <v-flex sm12 md6>
                <BuscadorOperacionCrud
                  :filter="
                    gridApiPlanes &&
                      gridApiPlanes.setQuickFilter.bind(gridApiPlanes)
                  "
                />
              </v-flex>
              <v-flex sm12 md12>
                <div align="left">
                  <MantenedorGridVerDetalle
                    v-if="modoVer"
                    :grid-options="gridOptionsPlanes"
                    :row-data="planes"
                  />
                  <AsociacionGrid
                    v-else
                    :grid-options="gridOptionsPlanes"
                    :row-data="planes"
                    :esEditar="!alertaSeleccionada ? false : true"
                  />
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoAlertaBase } from '@/config/enums';
import SwitchForm from '@/reusable/Form/SwitchForm.vue';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import HandleErrors from '@/config/handleErrors';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import {
  emitFormChangeEvent,
  formErrors,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { EstadoEntidad } from '../../config/enums';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';

import {
  AlertaBackend,
  CampoDinamico,
  UsoNoAutorizado,
  ZonaAlerta,
  ZonaRow,
} from '@/interfaces/Alertas';
import { IZona, ITipoZona } from '@/interfaces/Zonas';
import {
  AlertasBaseBackend,
  typeNuevosCampo,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  CellClickedEvent,
  ValueGetterParams,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

import moment from 'moment';
import { intersectionBy } from 'lodash';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import NumericEditor from '@/reusable/Grid/Editors/NumericEditor.vue';
import Buscador from '@/reusable/Grid/Buscador.vue';
import CampoUnico from '@/reusable/Form/CampoUnico.vue';
import { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';

import { fetchZonas } from '@/pantallas/Alertas/Services/fetchZonas';
import { fetchPlanes, Plan } from '@/pantallas/Alertas/Services/fetchPlanes';
import numericEditorBus from '@/reusable/Grid/Editors/NumericEditorBus';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    DatePicker,
    MantenedorGrid,
    Buscador,
    CampoUnico,
    MantenedorGridVerDetalle,
    AsociacionGrid,
    BuscadorOperacionCrud,
  },
})
export default class ConfigurarAlertaForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];
  @Prop() alertaSeleccionada: AlertaBackend;
  @Prop({ default: false }) modoAlertaVehiculo: boolean;
  @Prop({ default: 'Configurar Alerta' }) tituloModal: boolean;

  isFormValid: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  readonly $snotify: Snotify;
  loadingService = new LoadingService();
  uniqueFieldRule = uniqueFieldRule;

  lstCampos: typeNuevosCampo[] = [];
  lstUsoNoAutorizado: UsoNoAutorizado[] = [];
  lstZonas: ZonaRow[] = [];
  lstZonasVerDetalle: ZonaRow[] = [];
  lstTipoZonas: ITipoZona[] = [];
  lstVelZona: ZonaAlerta[] = [];
  mensajeEstado: string = '';
  tipoBase: number = -1;
  maximoTiempo: number = 12;

  muestraAlertaGenerica: boolean = false;
  muestraAlertaZona: boolean = false;
  muestraAlertaRuta: boolean = false;
  muestraAlertaUsoNoAutorizado: boolean = false;
  muestraAlertaDetencionNoAutorizada: boolean = false;
  muestraAlertaMantencionVencida: boolean = false;
  muestraAlertaMantencionPorVencer: boolean = false;

  showEventos: boolean = true;
  showTemporalidad: boolean = true;

  esAcumulable: boolean = false;
  deshabilitaParametrosGenerales: boolean = false;
  deshabilitaDetencionVelocidad: boolean = true;

  gridApiZonas: GridApi = null;
  gridApiZonasRutas: GridApi = null;
  gridApiZonasDetencion: GridApi = null;
  gridApiPlanes: GridApi = null;

  planes: Plan[] = [];
  idsPlanesSeleccionados: number[] = [];

  readonly gridOptionsZonas: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipoZonaNombre',
      },
      {
        headerName: 'Velocidad en km/h',
        field: 'velocidad',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Tolerancia en km/h',
        field: 'tolerancia',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Hdop desde',
        field: 'hdopdesde',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Hdop hasta',
        field: 'hdophasta',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'N° de Satelites',
        field: 'nsatelites',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Nº de Eventos',
        field: 'eventos',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Temporalidad',
        field: 'temporalidad',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
    ],
    onGridReady: this.handleGridZonaReady,
    onCellValueChanged: this.onCellValueChanged,
    onSelectionChanged: this.onCellValueChanged,
    singleClickEdit: true,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  readonly gridOptionsZonasRutas: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipoZonaNombre',
      },
      {
        headerName: 'Velocidad en km/h',
        field: 'velocidad',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Tolerancia en km/h',
        field: 'tolerancia',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Nº de Eventos',
        field: 'eventos',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
      {
        headerName: 'Temporalidad',
        field: 'temporalidad',
        editable: this.editCell,
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
        cellEditorParams: { parentName: this.$options.name },
      },
    ],
    onGridReady: this.handleGridZonaRutasReady,
    onCellValueChanged: this.onCellValueChanged,
    onSelectionChanged: this.onCellValueChanged,
    singleClickEdit: true,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  readonly gridOptionsZonasDetencion: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipoZonaNombre',
      },
      {
        headerName: 'Nº de Eventos',
        field: 'eventos',
        editable: this.editCell,
        cellEditorParams: { parentName: this.$options.name },
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
      },
      {
        headerName: 'Temporalidad',
        field: 'temporalidad',
        editable: this.editCell,
        cellEditorParams: { parentName: this.$options.name },
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
      },
      {
        headerName: 'Tiempo de detención',
        field: 'tiempoDetencion',
        editable: this.editCell,
        cellEditorParams: { parentName: this.$options.name },
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
      },
    ],
    onGridReady: this.handleGridZonaDetencionReady,
    onCellValueChanged: this.onCellValueChanged,
    onSelectionChanged: this.onCellValueChanged,
    singleClickEdit: true,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };

  readonly gridOptionsPlanes: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
    ],
    rowSelection: 'single',
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReadyPlanes,
    onSelectionChanged: this.onPlanesChange,
  };

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: true,
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    tipo: {
      label: 'Tipo Alerta',
      id: 'tipo',
      value: '',
    },
    color: {
      label: 'Color Tipificación',
      id: 'color',
      value: '',
    },
    desde: {
      label: 'Desde',
      id: 'desde',
      value: '',
    },
    hasta: {
      label: 'Hasta',
      id: 'hasta',
      value: '',
    },
    parametrosGenerales: {
      label: 'Parámetros Generales',
      id: 'parametrosGenerales',
      value: true,
    },
    velocidad: {
      label: 'Velocidad en km/h',
      id: 'velocidad',
      value: '',
    },
    tolerancia: {
      label: 'Tolerancia en km/h',
      id: 'tolerancia',
      value: '',
    },
    hdopdesde: {
      label: 'Hdop desde',
      id: 'hdopdesde',
      value: '',
    },
    hdophasta: {
      label: 'Hdop hasta',
      id: 'hdophasta',
      value: '',
    },
    nsatelites: {
      label: 'Número de Satelites',
      id: 'nsatelites',
      value: '',
    },
    eventos: {
      label: 'Nº de Eventos',
      id: 'eventos',
      value: '',
    },
    eventosDetencion: {
      label: 'Nº de Eventos',
      id: 'eventos',
      value: '',
    },
    temporalidad: {
      label: 'Temporalidad',
      id: 'temporalidad',
      value: '',
    },
    vehiculoIgnicion: {
      label: 'Vehículo sin ignición',
      id: 'vehiculoIgnicion',
      value: 'sinIgnicion',
    },
    velocidadIgnicion: {
      label: 'Velocidad en km/h',
      id: 'velocidadIgnicion',
      value: '',
    },
    zona: {
      label: 'Selección de Zona',
      id: 'zona',
      value: '',
    },
    tipoZona: {
      label: 'Filtro por Tipo de Zona',
      id: 'tipoZona',
      value: 0,
    },
    planes: {
      label: 'Planes De Mantenimiento',
      id: 'planesDeMantenimiento',
      value: '',
    },
    kilometros: {
      label: 'Kilómetros menor igual a',
      id: 'kilometros',
      value: '',
    },
    horasMotor: {
      label: 'Horas de motor menor igual a',
      id: 'horasMotor',
      value: '',
    },
    tiempo: {
      label: 'Tiempo menor igual a',
      id: 'tiempo',
      value: '',
    },
    unidadTiempo: {
      label: 'Unidad de Tiempo',
      id: 'unidadTiempo',
      value: '',
      items: [
        { id: 1, nombre: 'Dias' },
        { id: 2, nombre: 'Semanas' },
        { id: 3, nombre: 'Meses' },
      ],
    },
    tiempoDetencion: {
      label: 'Tiempo de detención permitida en minutos',
      id: 'tiempoDetencion',
      value: '',
    },
  };

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

  dias: any[] = [
    {
      id: 1,
      value: 'Lunes',
    },
    {
      id: 2,
      value: 'Martes',
    },
    {
      id: 3,
      value: 'Miércoles',
    },
    {
      id: 4,
      value: 'Jueves',
    },
    {
      id: 5,
      value: 'Viernes',
    },
    {
      id: 6,
      value: 'Sábado',
    },
    {
      id: 7,
      value: 'Domingo',
    },
  ];

  horas: string[] = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];

  mounted() {
    this.handleFormChange(this.formFields);
    this.handleAlertaSeleccionadaChange();
    this.getLstTipoZonas();
  }

  created() {
    const validator = makeValidatorDictionary(this.formFields);
    const mensaje = '* El valor debe ser mayor a 0';

    validator.custom.velocidad.min_value = mensaje;
    validator.custom.velocidad.integer = '* Valor debe ser numérico';
    validator.custom.eventos.min_value = mensaje;
    validator.custom.temporalidad.min_value = mensaje;
    validator.custom.horasMotor.min_value = mensaje;
    validator.custom.kilometros.min_value = mensaje;
    validator.custom.tiempo.min_value = mensaje;
    validator.custom.tiempoDetencion.min_value = mensaje;
    validator.custom.nsatelites.min_value = 'El valor debe ser mayor a 2';
    validator.custom.hdopdesde.min_value = mensaje;
    validator.custom.hdophasta.min_value =
      '* El valor no puede ser menor al rango inicial de hdop';
    this.$validator.localize('es', validator);
    this.registrarValidadores();
  }

  registrarValidadores() {
    let f = this.formFields;
    let mensajeFecha = ' * Fecha término debe ser mayor a la fecha inicio';
    let mensajeTemporalidad =
      ' * Temporalidad debe ser mayor a tiempo de detención';
    const t = this;

    Validator.extend('validaFecha', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || mensajeFecha;
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: t.validarFecha(),
            data: t.validarFecha()
              ? undefined
              : {
                  message: mensajeFecha,
                },
          });
        });
      },
    });

    Validator.extend('temporalidad_mayor', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || mensajeTemporalidad;
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: t.validaTemporalidadDetencion(
              f.temporalidad.value.toString(),
              f.tiempoDetencion.value.toString()
            ),
            data: t.validaTemporalidadDetencion(
              f.temporalidad.value.toString(),
              f.tiempoDetencion.value.toString()
            )
              ? undefined
              : {
                  message: mensajeTemporalidad,
                },
          });
        });
      },
    });
  }

  validaTemporalidadDetencion(temporalidad: string, tiempoDetencion: string) {
    if (!temporalidad || !tiempoDetencion) {
      return true;
    }

    var temporalidadInt = parseInt(temporalidad);
    var tiempoDetencionInt = parseInt(tiempoDetencion);

    return temporalidadInt > tiempoDetencionInt;
  }

  validarNombre(nombre: string) {
    var id = this.alertaSeleccionada ? this.alertaSeleccionada.id : 0;
    return this.axios.http.get(`Alerta/${id}/${nombre}/NombreUnico`);
  }

  validarFecha() {
    if (!this.formFields.desde.value || !this.formFields.hasta.value) {
      return true;
    }

    const fechaDesde = this.formFields.desde.value as moment.Moment;
    const fechaHasta = this.formFields.hasta.value as moment.Moment;
    return fechaDesde.isBefore(fechaHasta);
  }

  getLstTipoZonas() {
    this.loadingService.showLoading();
    this.axios.http
      .get('Alerta/GetListTipoZona')
      .then(res => {
        this.lstTipoZonas.push({
          id: 0,
          nombre: 'Todos',
        });

        if (res !== null && res !== undefined) {
          res.data.forEach((a: ITipoZona) => {
            this.lstTipoZonas.push(a);
          });
        }
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener el tipo de zonas.'
            );
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener el tipo de zonas.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  @Watch('formFields.activo.value', { immediate: true })
  handleActivoChange(isActivo: boolean) {
    this.formFields.activo.label = isActivo ? 'Activo' : 'Inactivo';
    this.mensajeEstado = isActivo
      ? ''
      : 'Al dejar como inactivo, no se permitirá recibir notificaciones de esta Alerta.';
  }

  @Watch('alertaSeleccionada', { deep: true })
  handleAlertaSeleccionadaChange() {
    if (this.alertaSeleccionada) {
      this.formFields.activo.value =
        this.alertaSeleccionada.estado == EstadoEntidad.Activo ? true : false;
      this.formFields.nombre.value = this.alertaSeleccionada.nombre;
      this.formFields.tipo.value = this.alertaSeleccionada.alertaBaseId;
      this.formFields.color.value = this.alertaSeleccionada.color;

      this.handlerChangeTipo(this.alertaSeleccionada.alertaBaseId, true);

      this.formFields.parametrosGenerales.value = this.alertaSeleccionada.parametroGeneral;
      if (!this.alertaSeleccionada.parametroGeneral) {
        this.setParametrosGenerales();
      }

      this.formFields.eventos.value = this.alertaSeleccionada.eventos;
      this.formFields.temporalidad.value = this.alertaSeleccionada.temporalidad;
      //if (this.esAcumulable) {
      //this.formFields.eventos.value = this.alertaSeleccionada.eventos;
      //this.formFields.temporalidad.value = this.alertaSeleccionada.temporalidad;
      //}

      this.formFields.tolerancia.value = this.alertaSeleccionada.tolerancia;

      this.formFields.desde.value = this.alertaSeleccionada.desde;
      this.formFields.hasta.value = this.alertaSeleccionada.hasta;

      switch (this.tipoBase) {
        case TipoAlertaBase.AlertaZona:
          this.formFields.nsatelites.value = this.alertaSeleccionada.zonas[0].nsatelites;
          this.formFields.hdophasta.value = this.alertaSeleccionada.zonas[0].hdophasta;
          this.formFields.hdopdesde.value = this.alertaSeleccionada.zonas[0].hdopdesde;
          this.formFields.velocidad.value = this.alertaSeleccionada.velMax;
          break;
        case TipoAlertaBase.AlertaRuta:
          this.formFields.velocidad.value = this.alertaSeleccionada.velMax;

          break;
        case TipoAlertaBase.AlertaUsoNoAutorizado:
          this.formFields.zona.value =
            this.alertaSeleccionada.zonas && this.alertaSeleccionada.zonas[0]
              ? this.alertaSeleccionada.zonas[0].coordenadaId
              : 0;

          var horaInicio;
          this.alertaSeleccionada.usoNoAutorizado.forEach(u => {
            horaInicio =
              (u.horaInicio.length == 1 ? '0' + u.horaInicio : u.horaInicio) +
              ':00';

            this.handleClickDiaHora(u.dia, horaInicio, false);
          });

          break;
        case TipoAlertaBase.AlertaMantencionPorVencer:
          this.formFields.horasMotor.value = this.alertaSeleccionada.horasMotorMenor;
          this.formFields.kilometros.value = this.alertaSeleccionada.kilometrosMenor;
          this.formFields.tiempo.value = this.alertaSeleccionada.tiempoMenor;
          this.formFields.unidadTiempo.value = this.alertaSeleccionada.unidadMedidaTiempo;
          this.idsPlanesSeleccionados = this.alertaSeleccionada.planesMantenimientoId;
          break;
        case TipoAlertaBase.AlertaMantencionVencida:
          this.idsPlanesSeleccionados = this.alertaSeleccionada.planesMantenimientoId;
          break;
        case TipoAlertaBase.AlertaDetencionNoAutorizada:
          this.formFields.tiempoDetencion.value = this.alertaSeleccionada.tiempoDetencion;
          this.formFields.eventosDetencion.value = this.alertaSeleccionada.eventos;
          this.formFields.vehiculoIgnicion.value = this.alertaSeleccionada
            .estadoIgnicion
            ? 'conIgnicion'
            : 'sinIgnicion';
          this.formFields.velocidadIgnicion.value = this.alertaSeleccionada.ignicionVelocidad;
          if (this.formFields.vehiculoIgnicion.value === 'conIgnicion') {
            this.deshabilitaDetencionVelocidad = false;
            this.showEventos = true;
            this.showTemporalidad = true;
          } else {
            this.deshabilitaDetencionVelocidad = true;
            this.showEventos = false;
            this.showTemporalidad = false;
          }
          break;
      }
    }
  }

  async setZonasSeleccionadas(tipo: number = 0) {
    if (this.tipoBase == tipo) {
      this.lstZonasVerDetalle = [];

      if (this.alertaSeleccionada) {
        if (this.alertaSeleccionada.zonas) {
          this.alertaSeleccionada.zonas.forEach(zs => {
            this.lstZonas.forEach(z => {
              if (zs.coordenadaId == z.id) {
                z.velocidad = zs.velocidad;
                z.tolerancia = zs.tolerancia;
                z.eventos = zs.eventos;
                z.temporalidad = zs.temporalidad;
                z.tiempoDetencion = zs.tiempoDetencion;
                z.hdopdesde = zs.hdopdesde;
                z.hdophasta = zs.hdophasta;
                z.nsatelites = zs.nsatelites;
                this.lstZonasVerDetalle.push(z);
              }
            });
          });

          await this.setGridZonas();

          const self = this;
          if (this.tipoBase == TipoAlertaBase.AlertaZona) {
            this.gridApiZonas.forEachNode(function(node: any) {
              var index = self.alertaSeleccionada.zonas.findIndex(
                x => x.coordenadaId == node.data.id
              );
              if (index !== -1) {
                console.log('entro en ' + node.data.id);
                node.setSelected(true);
              }
            });
          } else if (this.tipoBase == TipoAlertaBase.AlertaRuta) {
            this.alertaSeleccionada.zonas.forEach(zs => {
              this.gridApiZonasRutas.forEachNode(function(node: any) {
                if (node.data.id == zs.coordenadaId) {
                  node.setSelected(true);
                }
              });
            });
          } else if (
            this.tipoBase == TipoAlertaBase.AlertaDetencionNoAutorizada
          ) {
            this.alertaSeleccionada.zonas.forEach(zs => {
              this.gridApiZonasDetencion.forEachNode(function(node: any) {
                if (node.data.id == zs.coordenadaId) {
                  node.setSelected(true);
                }
              });
            });
          }
        }
      }
    }
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: this.setAlertaBackend(),
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange(this.formFields);
  }

  setAlertaBackend(): AlertaBackend {
    var fields = this.formFields;

    var alerta: AlertaBackend = {
      nombre: fields.nombre.value.toString(),
      alertaBaseId: Number(fields.tipo.value),
      color: fields.color.value.toString(),
      estado: fields.activo.value
        ? EstadoEntidad.Activo
        : EstadoEntidad.Inactivo,
    };

    alerta.parametroGeneral = Boolean(fields.parametrosGenerales.value);

    alerta.velMax = Number(fields.velocidad.value);
    alerta.tolerancia = Number(fields.tolerancia.value);

    alerta.eventos = Number(fields.eventos.value);
    alerta.temporalidad = Number(fields.temporalidad.value);
    //if (this.esAcumulable) {
    //alerta.eventos = Number(fields.eventos.value);
    //alerta.temporalidad = Number(fields.temporalidad.value);
    //}

    switch (this.tipoBase) {
      case TipoAlertaBase.AlertaZona:
        alerta.desde = fields.desde.value as moment.Moment;
        alerta.hasta = fields.hasta.value as moment.Moment;
        alerta.hdopdesde = Number(fields.hdopdesde.value);
        alerta.hdophasta = Number(fields.hdophasta.value);
        alerta.nsatelites = Number(fields.nsatelites.value);

        break;
      case TipoAlertaBase.AlertaRuta:
        alerta.desde = fields.desde.value as moment.Moment;
        alerta.hasta = fields.hasta.value as moment.Moment;

        break;
      case TipoAlertaBase.AlertaDetencionNoAutorizada:
        alerta.tiempoDetencion = Number(fields.tiempoDetencion.value);
        alerta.estadoIgnicion =
          fields.vehiculoIgnicion.value == 'conIgnicion' ? true : false;
        alerta.ignicionVelocidad = Number(fields.velocidadIgnicion.value);
        alerta.eventos = Number(fields.eventosDetencion.value);
        if (this.formFields.vehiculoIgnicion.value === 'conIgnicion') {
          this.showEventos = true;
          this.showTemporalidad = true;
        } else {
          this.showEventos = false;
          this.showTemporalidad = false;
        }
        break;
      case TipoAlertaBase.AlertaUsoNoAutorizado:
        alerta.tolerancia = Number(fields.tolerancia.value);

        var zona: ZonaAlerta[] = [
          {
            velocidad: 0,
            coordenadaId: Number(fields.zona.value),
            eventos: alerta.eventos,
            temporalidad: alerta.temporalidad,
            nsatelites: alerta.nsatelites,
            hdopdesde: alerta.hdopdesde,
            hdophasta: alerta.hdophasta,
            tiempoDetencion: 0,
          },
        ];

        this.$emit('changeDatosZonas', zona);
        break;
      case TipoAlertaBase.AlertaMantencionPorVencer:
        if (fields.horasMotor.value) {
          alerta.horasMotorMenor = Number(fields.horasMotor.value);
        }
        if (fields.kilometros.value) {
          alerta.kilometrosMenor = Number(fields.kilometros.value);
        }
        if (fields.tiempo.value) {
          alerta.tiempoMenor = Number(fields.tiempo.value);
        }
        alerta.unidadMedidaTiempo = Number(fields.unidadTiempo.value);
        break;
    }

    return alerta;
  }

  cambioEstadoSwitch(isActivo: boolean) {
    if (isActivo) {
      this.formFields.activo.label = 'Activo';
      this.mensajeEstado = '';
    } else {
      this.formFields.activo.label = 'Inactivo';
      this.mensajeEstado =
        'Al dejar como inactivo, no se permitirá recibir notificaciones de esta Alerta.';
    }
  }

  handleParametrosGeneralesChange(isActivo: boolean) {
    if (isActivo) {
      this.deshabilitaParametrosGenerales = false;
      this.$emit('changeValidaCamposZonas', true);
    } else {
      this.deshabilitaParametrosGenerales = true;
    }
    this.limpiarParametrosGenerales();
    this.deselectedGrillaZonas();
    this.$emit('changeParametroGeneral', isActivo);
  }

  handleVelocidadChange(value: number) {
    this.lstZonas.forEach(z => {
      z.velocidad = value;
    });

    this.setGridZonas();
  }

  handleToleranciaChange(value: number) {
    this.lstZonas.forEach(z => {
      z.tolerancia = value;
    });

    this.setGridZonas();
  }
  handlenSatelitesChange(value: number) {
    this.lstZonas.forEach(z => {
      z.nsatelites = value;
    });

    this.setGridZonas();
  }
  handlehDopdesdeChange(value: number) {
    this.lstZonas.forEach(z => {
      z.hdopdesde = value;
    });

    this.setGridZonas();
  }
  handlehDophastaChange(value: number) {
    this.lstZonas.forEach(z => {
      z.hdophasta = value;
    });

    this.setGridZonas();
  }

  handleEventosChange(value: number) {
    this.lstZonas.forEach(z => {
      z.eventos = value;
    });

    this.setGridZonas();
    this.clearSelectedZonas();
  }

  handleTemporalidadChange(value: number) {
    if (this.$validator.errors.items[0]) {
      if (
        this.$validator.errors.items.find(x => x.rule == 'temporalidad_mayor')
      ) {
        this.$validator.validate('tiempoDetencion');
      }
    }
    this.lstZonas.forEach(z => {
      z.temporalidad = value;
    });

    this.setGridZonas();
    this.clearSelectedZonas();
  }

  handleTiempoDetencionChange(value: number) {
    if (this.$validator.errors.items[0]) {
      if (
        this.$validator.errors.items.find(x => x.rule == 'temporalidad_mayor')
      ) {
        this.$validator.validate('temporalidad');
      }
    }
    this.lstZonas.forEach(z => {
      z.tiempoDetencion = value;
    });

    this.setGridZonas();
    this.clearSelectedZonas();
  }

  setGridZonas() {
    if (this.tipoBase == TipoAlertaBase.AlertaZona)
      this.gridApiZonas.setRowData(this.lstZonas);
    else if (this.tipoBase == TipoAlertaBase.AlertaRuta)
      this.gridApiZonasRutas.setRowData(this.lstZonas);
    else if (this.tipoBase == TipoAlertaBase.AlertaDetencionNoAutorizada)
      this.gridApiZonasDetencion.setRowData(this.lstZonas);

    this.$emit('changeDatosZonas', []);
  }

  async fetchZonas() {
    this.loadingService.showLoading();
    return await fetchZonas()
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener zonas.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener zonas.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async fetchPlanes() {
    this.loadingService.showLoading();
    return fetchPlanes()
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener los planes.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener los planes.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  /* Tabla */

  async handleGridZonaReady(event: GridReadyEvent) {
    this.gridApiZonas = event.api;
    numericEditorBus.handleFocusout(this.$options.name, () =>
      this.gridApiZonas.stopEditing()
    );
    this.lstZonas = (await this.fetchZonas()) || [];
    this.gridApiZonas.setRowData(this.lstZonas);

    this.setZonasSeleccionadas(TipoAlertaBase.AlertaZona);
  }

  async handleGridZonaRutasReady(event: GridReadyEvent) {
    this.gridApiZonasRutas = event.api;
    numericEditorBus.handleFocusout(this.$options.name, () =>
      this.gridApiZonasRutas.stopEditing()
    );
    this.lstZonas = (await this.fetchZonas()) || [];
    this.gridApiZonasRutas.setRowData(this.lstZonas);

    this.setZonasSeleccionadas(TipoAlertaBase.AlertaRuta);
  }

  async handleGridZonaDetencionReady(event: GridReadyEvent) {
    this.gridApiZonasDetencion = event.api;

    numericEditorBus.handleFocusout(this.$options.name, () =>
      this.gridApiZonasDetencion.stopEditing()
    );
    this.lstZonas = (await this.fetchZonas()) || [];
    this.gridApiZonasDetencion.setRowData(this.lstZonas);

    this.setZonasSeleccionadas(TipoAlertaBase.AlertaDetencionNoAutorizada);
  }

  formatEditable(params: ValueFormatterParams) {
    if (
      params.value === undefined ||
      params.value === null ||
      params.value === ''
    ) {
      if (params.node.isSelected()) {
        return '<i class="material-icons" style="font-size:19px;opacity:0.2;">create</i>';
      } else {
        return '';
      }
    }
    return params.value;
  }

  editCell(params: any) {
    if (!this.modoVer) {
      if (params.node.isSelected()) {
        if (
          this.muestraAlertaDetencionNoAutorizada === true &&
          this.formFields.vehiculoIgnicion.value === 'sinIgnicion'
        ) {
          if (
            params.column.colId === 'temporalidad' ||
            params.column.colId === 'eventos'
          ) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onCellValueChanged() {
    this.lstVelZona = [];

    if (this.tipoBase == TipoAlertaBase.AlertaZona) {
      this.setZonaAlerta(this.gridApiZonas.getSelectedRows());
      this.gridApiZonasDetencion.refreshCells({ force: true });
    } else if (this.tipoBase == TipoAlertaBase.AlertaRuta) {
      this.setZonaAlerta(this.gridApiZonasRutas.getSelectedRows());
      this.gridApiZonasDetencion.refreshCells({ force: true });
    } else {
      this.setZonaAlerta(this.gridApiZonasDetencion.getSelectedRows());
      this.gridApiZonasDetencion.refreshCells({ force: true });
    }
  }

  setZonaAlerta(rowSelected: any[]) {
    var validaDatos = false;

    rowSelected.forEach(zona => {
      validaDatos = this.validaZonaAlerta(zona);
      if (validaDatos) {
        this.lstVelZona.push({
          velocidad: zona.velocidad ? zona.velocidad : 0,
          coordenadaId: zona.id,
          eventos:
            zona.eventos === null ? 0 : zona.eventos === '' ? 0 : zona.eventos,
          tolerancia: zona.tolerancia === null ? 0 : zona.tolerancia,
          temporalidad: zona.temporalidad ? zona.temporalidad : 0,
          tiempoDetencion: zona.tiempoDetencion ? zona.tiempoDetencion : 0,
          hdopdesde: zona.hdopdesde,
          hdophasta: zona.hdophasta,
          nsatelites: zona.nsatelites,
        });
      } else {
        this.lstVelZona.push({
          velocidad: zona.velocidad ? zona.velocidad : 0,
          coordenadaId: zona.id,
          eventos:
            zona.eventos === null ? 0 : zona.eventos === '' ? 0 : zona.eventos,
          tolerancia: zona.tolerancia === null ? 0 : zona.tolerancia,
          temporalidad: zona.temporalidad ? zona.temporalidad : 0,
          tiempoDetencion: zona.tiempoDetencion ? zona.tiempoDetencion : 0,
          hdopdesde: zona.hdopdesde,
          hdophasta: zona.hdophasta,
          nsatelites: zona.nsatelites,
        });
        return false;
      }
    });

    if (validaDatos || this.lstVelZona.length == 0) {
      this.$emit('changeDatosZonas', this.lstVelZona);
    } else {
      this.$emit('changeValidaCampos', false);
    }

    if (!this.formFields.parametrosGenerales.value) {
      this.validaCamposSinParametros(this.lstVelZona);
    } else {
      this.validaCamposConParametros(this.lstVelZona);
    }
  }

  validaCamposConParametros(listaVelZona: ZonaAlerta[]) {
    if (this.tipoBase === TipoAlertaBase.AlertaDetencionNoAutorizada) {
      this.validaCamposGrillaAlertaDetencion(this.lstVelZona);
    }

    if (this.tipoBase !== TipoAlertaBase.AlertaDetencionNoAutorizada) {
      const camposVaciosZonas = listaVelZona.find(
        x =>
          x.velocidad == 0 ||
          String(x.tolerancia) == '' ||
          x.tolerancia == undefined ||
          ((x.eventos == 0 || x.eventos == undefined) &&
            (x.temporalidad == 0 || x.temporalidad == null))
      );

      if (camposVaciosZonas) {
        this.$emit('changeValidaCamposZonas', false);
        this.$emit('camposZonaEmpty', camposVaciosZonas);
      } else {
        this.$emit('changeValidaCamposZonas', true);
      }
    }
  }

  validaCamposSinParametros(listaVelZona: ZonaAlerta[]) {
    if (this.tipoBase === TipoAlertaBase.AlertaDetencionNoAutorizada) {
      this.validaCamposGrillaAlertaDetencion(this.lstVelZona);
    } else {
      const camposVaciosZonasNoAutorizada = listaVelZona.find(
        x =>
          x.tolerancia == 0 ||
          x.velocidad == 0 ||
          (x.eventos == 0 && x.temporalidad == 0)
      );

      if (camposVaciosZonasNoAutorizada) {
        this.$emit(
          'camposZonaNoAutorizadaEmpty',
          camposVaciosZonasNoAutorizada
        );
        this.$emit('changeValidaCamposZonas', false);
      } else {
        this.$emit('changeValidaCamposZonas', true);
      }
    }
  }

  validaCamposGrillaAlertaDetencion(listaVelZona: ZonaAlerta[]) {
    if (this.formFields.vehiculoIgnicion.value === 'conIgnicion') {
      const camposVaciosDetencion = listaVelZona.find(
        x =>
          x.eventos == 0 ||
          x.eventos == undefined ||
          x.temporalidad == 0 ||
          x.tiempoDetencion == 0
      );

      if (camposVaciosDetencion) {
        this.$emit('changeValidaCamposZonas', false);
        this.$emit('camposDetencionNoAutorizadaEmpty', camposVaciosDetencion);
      } else {
        this.$emit('changeValidaCamposZonas', true);
      }
    } else {
      const camposVaciosDetencionSinIgnicion = listaVelZona.find(
        x => x.tiempoDetencion == 0
      );

      if (camposVaciosDetencionSinIgnicion) {
        this.$emit('changeValidaCamposZonas', false);
        this.$emit(
          'camposDetencionNoAutorizadaEmpty',
          camposVaciosDetencionSinIgnicion
        );
      } else {
        this.$emit('changeValidaCamposZonas', true);
      }
    }
  }

  validaZonaAlerta(zona: any): boolean {
    if (zona.velocidad && zona.velocidad < 1) {
      this.$snotify.error('La velocidad no puede ser inferior a 1 km/h');
      return false;
    } else if (zona.velocidad && zona.velocidad > 240) {
      this.$snotify.error('La velocidad no puede ser superior a 240 km/h');
      return false;
    } else if (zona.tolerancia && zona.tolerancia < 0) {
      this.$snotify.error('La tolerancia no puede ser inferior a 0 km/h');
      return false;
    } else if (zona.tolerancia && zona.tolerancia > 99) {
      this.$snotify.error('La tolerancia no puede ser superior a 99 km/h');
      return false;
    } else if (
      (zona.eventos && zona.eventos.length > 2) ||
      (zona.temporalidad && zona.temporalidad.length > 3) ||
      (zona.tiempoDetencion && zona.tiempoDetencion.length > 3)
    ) {
      this.$snotify.error('Largo mayor al permitido');
    } else if (
      this.tipoBase == TipoAlertaBase.AlertaDetencionNoAutorizada &&
      !this.deshabilitaDetencionVelocidad &&
      !this.validaTemporalidadDetencion(zona.temporalidad, zona.tiempoDetencion)
    ) {
      this.$snotify.error(
        '* Temporalidad debe ser mayor a tiempo de detención'
      );
      this.$emit('changeValidaCamposZonas', false);
      return false;
    } else {
      return true;
    }
  }

  handlerChangeTipo(value: number, modoCarga?: boolean) {
    // reiniciar la validacion al cambiar tipo de alerta
    this.$validator.reset();
    this.errors.clear();

    if (!modoCarga) {
      this.resetTipoAlerta();
    }

    var alertaBase: AlertasBaseBackend = this.lstAlertasBase.find(
      ab => ab.id == value
    );

    this.tipoBase = alertaBase.baseTipo;
    this.esAcumulable = alertaBase.acumulable;
    this.$emit('showAsociarVehiculos', true);
    this.$emit('changeTipoBase', this.tipoBase, this.esAcumulable);
    switch (this.tipoBase) {
      case TipoAlertaBase.AlertaGenerica:
        this.mostrarAlertaGenerica(value);
        break;
      case TipoAlertaBase.AlertaZona:
        this.mostrarAlertaZona();
        break;
      case TipoAlertaBase.AlertaRuta:
        this.mostrarAlertaRuta();
        break;
      case TipoAlertaBase.AlertaUsoNoAutorizado:
        this.mostrarAlertaUsoNoAutorizado();
        break;
      case TipoAlertaBase.AlertaDetencionNoAutorizada:
        this.mostrarAlertaDetencionNoAutorizada();
        break;
      case TipoAlertaBase.AlertaMantencionVencida:
        this.mostrarAlertaMantencionVencida();
        break;
      case TipoAlertaBase.AlertaMantencionPorVencer:
        this.mostrarAlertaMantencionPorVencer();
        break;
    }
  }

  resetTipoAlerta() {
    this.lstCampos = [];
    this.lstUsoNoAutorizado = [];
    this.lstVelZona = [];
    this.muestraAlertaGenerica = false;
    this.muestraAlertaZona = false;
    this.muestraAlertaRuta = false;
    this.muestraAlertaUsoNoAutorizado = false;
    this.muestraAlertaDetencionNoAutorizada = false;
    this.muestraAlertaMantencionVencida = false;
    this.muestraAlertaMantencionPorVencer = false;
    this.$emit('changeValidaCampos', true);
    this.$emit('changeCamposDinamicos', this.lstCampos);
    this.$emit('changeUsoNoAutorizado', this.lstUsoNoAutorizado);
    this.$emit('changeDatosZonas', this.lstVelZona);
    this.limpiarParametrosGenerales();
  }

  limpiarParametrosGenerales() {
    this.formFields.velocidad.value = '';
    this.formFields.temporalidad.value = '';
    this.formFields.tolerancia.value = '';
    this.formFields.eventos.value = '';
    this.formFields.eventosDetencion.value = '';
    this.formFields.tiempoDetencion.value = '';

    this.lstZonas.forEach(z => {
      z.velocidad = null;
      z.tolerancia = null;
      z.eventos = null;
      z.temporalidad = null;
      z.tiempoDetencion = null;
    });

    this.setGridZonas();

    var zona: ZonaAlerta[] = [];

    this.$emit('changeDatosZonas', zona);
  }

  setParametrosGenerales() {
    this.deshabilitaParametrosGenerales = true;
    this.formFields.velocidad.value = '';
    this.formFields.temporalidad.value = '';
    this.formFields.tolerancia.value = '';
    this.formFields.eventos.value = '';
    this.formFields.eventosDetencion.value = '';
    this.formFields.tiempoDetencion.value = '';
  }

  handleTipoZonaChange(tipoZona: number) {
    this.tipo = tipoZona;
    if (this.tipoBase == TipoAlertaBase.AlertaZona)
      this.gridApiZonas.onFilterChanged();
    else if (this.tipoBase == TipoAlertaBase.AlertaRuta)
      this.gridApiZonasRutas.onFilterChanged();
    else if (this.tipoBase == TipoAlertaBase.AlertaDetencionNoAutorizada)
      this.gridApiZonasDetencion.onFilterChanged();
  }

  tipo: number = 0;
  isExternalFilterPresent() {
    return this.tipo != 0;
  }

  doesExternalFilterPass(node: any) {
    return node.data.tipoZonaId == this.tipo;
  }

  handleUnidadTiempo(unidadTiempo: number) {
    switch (unidadTiempo) {
      case 1:
        this.maximoTiempo = 365;
        break;
      case 2:
        this.maximoTiempo = 55;
        break;
      case 3:
        this.maximoTiempo = 12;
        break;
    }
  }

  /* Alerta generica */

  mostrarAlertaGenerica(value: number) {
    this.loadingService.showLoading();
    this.axios.http
      .get('Alerta/' + value + '/GetParamAlertaBase')
      .then(res => {
        if (res !== null && res !== undefined) {
          this.lstCampos = res.data;

          if (this.alertaSeleccionada) {
            this.alertaSeleccionada.campoDinamico.forEach(cd => {
              this.lstCampos.forEach(c => {
                if (cd.alertaCampoDinamicoId == c.id) {
                  c.valor = cd.valorCampoDinamico;
                }
              });
            });
          }

          this.muestraAlertaGenerica = true;
        }
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener los campos.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener los campos.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleCamposKeyUp(id: number, event: any) {
    var mensajeError = '';
    var valor = event.target.value;

    this.lstCampos.forEach(c => {
      if (c.id == id) {
        if (valor != '') {
          if (this.validaExpresionRegular(c.regExp, valor)) {
            this.$validator.errors.remove(c.descripcionCampo);
          } else {
            this.$validator.errors.add({
              field: c.descripcionCampo,
              msg: mensajeError,
            });

            return false;
          }
        } else {
          this.$validator.errors.remove(c.descripcionCampo);
        }
      }
    });
  }

  handleCamposChange(id: number, valor: string) {
    var lstCamposDinamico: CampoDinamico[] = [];
    var campoDinamico: CampoDinamico = {};
    var campoValido: boolean = true;
    var mensajeError = '';

    this.lstCampos.forEach(c => {
      campoDinamico = {};
      if (c.id == id) {
        if (valor != '') {
          if (this.validaExpresionRegular(c.regExp, valor)) {
            this.$validator.errors.remove(c.descripcionCampo);
            c.valor = valor;
          } else {
            mensajeError = c.mensajeErrorFormato
              ? c.mensajeErrorFormato
              : config.errorMensajes.regex;

            this.$validator.errors.add({
              field: c.descripcionCampo,
              msg: mensajeError,
            });

            this.$snotify.error(mensajeError);

            campoValido = false;
            return false;
          }
        } else {
          this.$validator.errors.remove(c.descripcionCampo);
          c.valor = valor;
        }
      }

      campoDinamico.alertaCampoDinamicoId = c.id;
      campoDinamico.valorCampoDinamico = c.valor;
      lstCamposDinamico.push(campoDinamico);
    });

    if (campoValido) {
      this.$emit('changeCamposDinamicos', lstCamposDinamico);
    } else {
      this.$emit('changeValidaCampos', false);
    }
  }

  validaExpresionRegular(regexp: string, valor: string) {
    var re: RegExp = new RegExp(regexp);
    return re.test(valor);
  }

  /* Alerta Zona */

  mostrarAlertaZona() {
    this.muestraAlertaZona = true;
  }

  /* Alerta ruta */

  mostrarAlertaRuta() {
    this.muestraAlertaRuta = true;
  }

  /* Alerta uso no autorizado */

  mostrarAlertaUsoNoAutorizado() {
    this.muestraAlertaUsoNoAutorizado = true;
  }

  handleClickDiaHora(dia: number, hora: string, modoVer: boolean) {
    if (modoVer) {
      return false;
    }

    var usoNoAutorizado: UsoNoAutorizado = {};
    var index = -1;
    var element = document.getElementById(dia + '_' + hora);

    if (element.className == 'selecciona') {
      element.classList.remove('selecciona');

      const parseHora = Number(hora.split(':')[0]).toString();

      index = this.lstUsoNoAutorizado.findIndex(
        u => u.dia == dia && u.horaInicio === parseHora
      );
      this.lstUsoNoAutorizado.splice(index, 1);
    } else {
      element.classList.add('selecciona');

      usoNoAutorizado = {
        dia: dia,
        horaInicio: Number(hora.split(':')[0]).toString(),
        horaFin: (Number(hora.split(':')[0]) + 1).toString(),
      };

      this.lstUsoNoAutorizado.push(usoNoAutorizado);
    }

    this.$emit('changeUsoNoAutorizado', this.lstUsoNoAutorizado);
  }

  /* Alerta detencion no autorizada */

  mostrarAlertaDetencionNoAutorizada() {
    this.muestraAlertaDetencionNoAutorizada = true;
  }

  handlerChangeIgnicion(value: string) {
    this.deshabilitaDetencionVelocidad = value == 'conIgnicion' ? false : true;

    this.setCamposAlertaDetencionNoAutorizada();
  }

  setCamposAlertaDetencionNoAutorizada() {
    if (
      this.muestraAlertaDetencionNoAutorizada === true &&
      this.formFields.vehiculoIgnicion.value === 'sinIgnicion'
    ) {
      this.showEventos = false;
      this.showTemporalidad = false;

      this.limpiarEventoTemporalidad();

      this.$validator.pause();
      this.$nextTick(() => {
        this.$validator.reset();
        this.$validator.resume();
      });
    } else {
      this.showEventos = true;
      this.showTemporalidad = true;
      this.formFields.tiempoDetencion.value = '';
      this.handleTiempoDetencionChange(null);
      this.$validator.reset();
      this.gridApiZonasDetencion.deselectAll();
    }
  }

  limpiarEventoTemporalidad() {
    this.$validator.reset();
    this.errors.clear();
    this.formFields.temporalidad.value = '';
    this.formFields.eventos.value = '';
    this.formFields.eventosDetencion.value = '';
    this.formFields.tiempoDetencion.value = '';
    this.handleTiempoDetencionChange(null);
    this.lstZonas.forEach(z => {
      z.eventos = 0;
      z.temporalidad = 0;
    });

    this.setGridZonas();
    this.gridApiZonasDetencion.deselectAll();
  }

  /*Alertas Mantencion */

  mostrarAlertaMantencionVencida() {
    this.muestraAlertaMantencionVencida = true;
    this.$emit('showAsociarVehiculos', false);
  }

  mostrarAlertaMantencionPorVencer() {
    this.muestraAlertaMantencionPorVencer = true;
    this.$emit('showAsociarVehiculos', false);
  }

  async handleGridReadyPlanes(event: GridReadyEvent) {
    this.gridApiPlanes = event.api;
    this.planes = (await this.fetchPlanes()) || [];
    await this.marcarPlanesSeleccionados();
  }

  async marcarPlanesSeleccionados() {
    if (this.idsPlanesSeleccionados.length === 0) {
      return;
    }
    setTimeout(() => {
      this.gridApiPlanes.forEachNode(node => {
        node.setSelected(
          this.idsPlanesSeleccionados.some(x => x === node.data.id)
        );
      });

      if (this.modoVer) {
        this.planes = this.gridApiPlanes.getSelectedRows();
      }
    });
  }

  onPlanesChange(event: SelectionChangedEvent) {
    const planes: number[] = this.gridApiPlanes
      .getSelectedNodes()
      .map(node => node.data.id);
    this.$emit('planesChange', planes);

    InformeEventBus.$emit(
      'selectionPlanesMantenimiento',
      event.api.getSelectedRows()
    );
  }

  handleFilterInputNumber(event: KeyboardEvent) {
    return event.keyCode === 8
      ? true
      : isNaN(Number(event.key))
      ? event.preventDefault()
      : false;
  }

  handleFilterInputNumberDecimal(event: KeyboardEvent) {
    return event.keyCode === 8
      ? true
      : isNaN(Number(event.key))
      ? event.keyCode == 46
        ? true
        : event.preventDefault()
      : false;
  }

  deselectedGrillaZonas() {
    if (this.tipoBase == TipoAlertaBase.AlertaZona) {
      this.gridApiZonas.deselectAll();
    } else if (this.tipoBase == TipoAlertaBase.AlertaRuta) {
      this.gridApiZonasRutas.deselectAll();
    } else {
      this.gridApiZonasDetencion.deselectAll();
    }
    this.clearSelectedZonas();
  }

  clearSelectedZonas() {
    var zona: ZonaAlerta[] = [];
    this.$emit('changeDatosZonas', zona);
  }
}
</script>
<style scoped>
#tDiasHoras {
  border-collapse: collapse;
  width: 100%;
}

#tDiasHoras td,
#tDiasHoras th {
  border: 1px solid #ddd;
  padding: 8px;
  font-weight: 500;
}

#tDiasHoras tr:nth-child(even) {
  background-color: #f2f2f2;
}

.selecciona {
  background-color: rgb(12, 3, 131);
}

#tDiasHoras th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.54);
}
</style>

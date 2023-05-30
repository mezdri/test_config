<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel">
      <v-tab
        v-if="showTabParametrosSistema"
        :href="`#tab-1`"
        to="/parametrosSistema"
        >Parámetros del Sistema</v-tab
      >
      <v-tab :href="`#tab-2`">Parámetros del Cliente</v-tab>
      <v-spacer></v-spacer>
      <v-btn
        v-if="accionEditar.visible"
        class="btn-grabar"
        :disabled="botonGuardarEnabled"
        @click="dialogConfirmacion = true"
        left
        depressed
        style="margin-right:20px;"
      >
        <span style="color: white;">Guardar Cambios</span>
      </v-btn>
    </v-tabs>
    <v-card>
      <v-card-text>
        <v-layout>
          <v-flex d-flex xs8 sm8 md8>Par&aacute;metro</v-flex>
          <v-flex d-flex xs2 sm2 md2>Valor</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Refrescar la visualizaci&oacute;n del mapa cada</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="
                !refrescarVisualizacionMapaConfigurableCliente ||
                  !accionEditar.visible
              "
              v-model="refrescoVisualizacionMapaSegundos"
              :items="segundos"
              menu-props="auto"
              :label="'Segundos'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Segundos</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Expiraci&oacute;n de las variables de sesi&oacute;n</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="
                !expiracionVariablesSesionConfigurableCliente ||
                  !accionEditar.visible
              "
              v-model="expiracionVariablesSesionHoras"
              :items="horasSesion"
              menu-props="auto"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de eliminaci&oacute;n de las notificaciones</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="
                !eliminacionNotificacionesConfigurableCliente ||
                  !accionEditar.visible
              "
              v-model="eliminacionNotificacionesDias"
              :items="dias"
              menu-props="auto"
              :label="'Días'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>D&iacute;as</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de eliminaci&oacute;n de las alertas</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="
                !eliminacionAlertasConfigurableCliente || !accionEditar.visible
              "
              v-model="eliminacionAlertasHoras"
              :items="horas"
              menu-props="auto"
              no-data-text="Sin resultados"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo en que los equipos no est&aacute;n transmitiendo</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <!-- Select Minutos -->
            <v-select
              v-if="idUnidadTiempo === 1"
              no-data-text="Sin resultados"
              v-model="actualizacionEstadoConexionGps"
              :items="unidadTiempoSeleccionadaMinutos"
              :label="labelUnidadTiempoSeleccionada"
              :disabled="
                !actualizacionEstadoConexionGpsConfigurableCliente ||
                  !accionEditar.visible
              "
            ></v-select>
            <!-- Select Horas -->
            <v-select
              v-if="idUnidadTiempo === 2"
              no-data-text="Sin resultados"
              v-model="actualizacionEstadoConexionGps"
              :items="unidadTiempoSeleccionadaHoras"
              :label="labelUnidadTiempoSeleccionada"
              :disabled="
                !actualizacionEstadoConexionGpsConfigurableCliente ||
                  !accionEditar.visible
              "
            ></v-select>
            <!-- Select Dias -->
            <v-select
              v-if="idUnidadTiempo === 3"
              no-data-text="Sin resultados"
              v-model="actualizacionEstadoConexionGps"
              :items="unidadTiempoSeleccionadaDias"
              :label="labelUnidadTiempoSeleccionada"
              :disabled="
                !actualizacionEstadoConexionGpsConfigurableCliente ||
                  !accionEditar.visible
              "
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="labelUnidadTiempoSeleccionada"
              @change="MostrarSelect()"
              menu-props="auto"
              :items="unidadTiempo"
              :label="labelUnidadTiempoSeleccionada"
              :disabled="
                !actualizacionEstadoConexionGpsConfigurableCliente ||
                  !accionEditar.visible
              "
            ></v-select>
          </v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de Visualización de las Notificaciones</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="!accionEditar.visible"
              v-model="tiempoVisualizacionNotificaciones"
              :items="horasNotificaciones"
              menu-props="auto"
              no-data-text="Sin resultados"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de Descanso en 24 Horas</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="!accionEditar.visible"
              v-model="tiempoDescanso"
              :items="horasDescanso"
              menu-props="auto"
              no-data-text="Sin resultados"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de Descanso cada "N" cantidad de horas</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-if="idUnidadTiempoDescanso === 0"
              no-data-text="Sin resultados"
              v-model="tiempoDescansoCada"
              :items="unidadTiempoSeleccionadaMinutosDescanso"
              :label="labelUnidadTiempoSeleccionadaDescanso"
            ></v-select>
            <v-select
              v-if="idUnidadTiempoDescanso === 1"
              no-data-text="Sin resultados"
              v-model="tiempoDescansoCada"
              :items="unidadTiempoSeleccionadaHorasDescanso"
              :label="labelUnidadTiempoSeleccionadaDescanso"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="labelUnidadTiempoSeleccionadaDescanso"
              @change="handleChangeUnidadTiempoDescanso()"
              menu-props="auto"
              :items="unidadTiempoDescanso"
              :label="labelUnidadTiempoSeleccionadaDescanso"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Cantidad de</v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="!accionEditar.visible"
              v-model="cadaTiempoDescanso"
              :items="cadaHorasDescanso"
              menu-props="auto"
              no-data-text="Sin resultados"
              :label="'Horas'"
            ></v-select>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de visualización en la campana</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="tiempoVisualizacionCampana"
              :items="horasCampana"
              menu-props="auto"
              :disabled="
                !tiempoVisualizacionCampanaConfigurableCliente ||
                  !accionEditar.visible
              "
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de visualización en el popup</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="tiempoVisualizacionPopup"
              :items="segundosPopUp"
              menu-props="auto"
              :disabled="
                !tiempoVisualizacionPopupConfigurableCliente ||
                  !accionEditar.visible
              "
              :label="'Segundos'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Segundos</v-flex>
        </v-layout>
        <v-divider></v-divider>
      </v-card-text>
    </v-card>
    <app-confirmacion
      :show="dialogConfirmacion"
      titulo="Editar Parámetros del Cliente"
      mensaje="¿Está seguro que desea guardar los cambios realizados?"
      v-on:modalConfirmationEmit="guardarCambios($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>
  </v-container>
</template>

<script lang="ts">
import config from '@/config/index';
import moment, { Duration } from 'moment';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { ParametroSistemaVm } from '@/interfaces/parametroSistema';
import { Funcionalidades } from '@/config/funcionalidades';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class ParametrosSistemaCliente extends ComponenteBase {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.ParametrosSistemaCliente;

  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.accionEditar];

  controller: string = 'ParametroSistema';
  tabModel: string = 'tab-2';
  segundos: number[] = Array.from(
    { length: (600 - 60) / 30 + 1 },
    (_, i) => 60 + i * 30
  );
  minutos: number[] = Array.from({ length: 60 }, (v, k) => k + 1);
  quinceDias: number[] = Array.from({ length: 15 }, (v, k) => k + 1);
  dias: number[] = Array.from({ length: 5 }, (v, k) => k + 1);
  horas: number[] = Array.from({ length: 24 }, (v, k) => k + 1);
  horasNotificaciones: number[] = Array.from({ length: 24 }, (v, k) => k + 1);
  horasDescanso: number[] = Array.from({ length: 24 }, (v, k) => k + 1);
  cadaHorasDescanso: number[] = Array.from({ length: 24 }, (v, k) => k + 1);
  horasSesion: number[] = Array.from({ length: 12 }, (v, k) => k + 1);
  horas2: number[] = Array.from({ length: 24 }, (v, k) => k + 1);
  intentos: number[] = Array.from({ length: 3 }, (v, k) => k + 1);
  unidadTiempo: string[] = ['Minutos', 'Horas', 'Días'];
  unidadTiempoDescanso: string[] = ['Minutos', 'Horas'];
  labelUnidadTiempoSeleccionada: string = 'Minutos';
  labelUnidadTiempoSeleccionadaDescanso: string = 'Minutos';
  unidadTiempoSeleccionada: number[] = [];
  unidadTiempoSeleccionadaMinutos: number[] = Array.from(
    { length: 60 },
    (v, k) => k + 1
  );
  unidadTiempoSeleccionadaHoras: number[] = Array.from(
    { length: 24 },
    (v, k) => k + 1
  );
  unidadTiempoSeleccionadaDias: number[] = Array.from(
    { length: 5 },
    (v, k) => k + 1
  );
  unidadTiempoSeleccionadaMinutosDescanso: number[] = Array.from(
    { length: 59 },
    (v, k) => k + 1
  );
  unidadTiempoSeleccionadaHorasDescanso: number[] = Array.from(
    { length: 24 },
    (v, k) => k + 1
  );
  segundosPopUp: number[] = Array.from({ length: 59 }, (v, k) => k + 1);
  horasCampana: number[] = Array.from({ length: 23 }, (v, k) => k + 1);
  idUnidadTiempo: number = 0;
  idUnidadTiempoDescanso: number = 0;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  $snotify: any;

  loadingService = new LoadingService();
  clienteId: number = config.getClienteSesion();
  showTabParametrosSistema: boolean = true;

  parametroSistemaLimites: ParametroSistemaVm = new ParametroSistemaVm();
  parametroSistema: ParametroSistemaVm = new ParametroSistemaVm();

  //modal
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();

  eliminacionNotificacionesDias: number = 0;
  eliminacionAlertasHoras: number = 0;
  actualizacionEstadoConexionGps: number = 0;
  actualizacionEstadoConexionGpsMinutos: number = 0;
  actualizacionEstadoConexionGpsHoras: number = 0;
  actualizacionEstadoConexionGpsDias: number = 0;
  refrescoVisualizacionMapaSegundos: number = 0;
  expiracionVariablesSesionHoras: number = 0;
  tiempoVisualizacionNotificaciones: number = 0;
  tiempoDescanso: number = 0;
  cadaTiempoDescanso: number = 0;
  tiempoDescansoCada: number = 0;
  tiempoVisualizacionCampanaConfigurableCliente?: boolean = false;
  tiempoVisualizacionPopupConfigurableCliente?: boolean = false;
  tiempoVisualizacionCampana: number = 0;
  tiempoVisualizacionPopup: number = 0;

  //Limites de parametros del sistema
  eliminacionNotificacionesDiasLimite: number = 0;
  eliminacionAlertasHorasLimite: number = 0;
  actualizacionEstadoConexionGpsLimite: number = 0;
  refrescoVisualizacionMapaSegundosLimite: number = 0;
  expiracionVariablesSesionHorasLimite: number = 0;

  botonGuardarEnabled: boolean = false;
  actualizacionEstadoConexionGpsConfigurableClienteSelect: boolean = true;
  eliminacionNotificacionesConfigurableCliente: boolean = false;
  eliminacionAlertasConfigurableCliente: boolean = false;
  actualizacionEstadoConexionGpsConfigurableCliente: boolean = false;
  refrescarVisualizacionMapaConfigurableCliente: boolean = false;
  expiracionVariablesSesionConfigurableCliente: boolean = false;

  mounted() {
    this.showTabParametrosSistema = config.chequeaPermisosTabs(
      Funcionalidades.ParametrosSistema,
      config.getClienteSesion()
    );
    this.loadingService.showLoading();
    this.obtenerParametrosSistema();
  }

  obtenerParametrosSistema() {
    return this.axios.http
      .get<ParametroSistemaVm>(`${this.controller}/${this.clienteId}/cliente`)
      .then(ps => {
        this.parametroSistema = ps.data;
        this.obtenerEstadoParametrosSistema(this.parametroSistema);
      })
      .catch(err => {
        if (err.response !== undefined) {
          if (err.response.status !== 401) {
            this.handleErrors.showError(err);
          }
        } else {
          this.handleErrors.showError(err);
        }
        this.loadingService.hideLoading();
      });
  }

  obtenerParametrosSistemaLimites() {
    return this.axios.http
      .get<ParametroSistemaVm>(`${this.controller}/sistema`)
      .then(ps => {
        this.parametroSistemaLimites = ps.data;
        this.obtenerEstadoParametrosSistemaLimites(
          this.parametroSistemaLimites
        );
        this.loadingService.hideLoading();
      })
      .catch(error => {
        this.loadingService.hideLoading();
      });
  }

  //Establezco los limites de los select de acuerdo a los parametros del sistema
  private obtenerEstadoParametrosSistemaLimites(
    parametroSistema: ParametroSistemaVm
  ) {
    this.refrescoVisualizacionMapaSegundosLimite = this.obtenerMoment(
      parametroSistema.refrescoVisualizacionMapaSegundos
    ).asSeconds();

    this.segundos = Array.from(
      { length: (this.refrescoVisualizacionMapaSegundosLimite - 60) / 30 + 1 },
      (_, i) => 60 + i * 30
    );

    this.expiracionVariablesSesionHorasLimite = this.obtenerMoment(
      parametroSistema.expiracionVariablesSesionHoras
    ).asHours();
    this.horasSesion = Array.from(
      { length: this.expiracionVariablesSesionHorasLimite },
      (v, k) => k + 1
    );

    this.eliminacionNotificacionesDiasLimite = this.obtenerMoment(
      parametroSistema.eliminacionNotificacionesDias
    ).asDays();
    this.dias = Array.from(
      { length: this.eliminacionNotificacionesDiasLimite },
      (v, k) => k + 1
    );

    this.eliminacionAlertasHorasLimite = this.obtenerMoment(
      parametroSistema.eliminacionAlertasHoras
    ).asHours();
    this.horas = Array.from(
      { length: this.eliminacionAlertasHorasLimite },
      (v, k) => k + 1
    );

    let timeSpanEstadoConexionGps: Duration;
    timeSpanEstadoConexionGps = this.obtenerMoment(
      parametroSistema.actualizacionEstadoConexionGps
    );

    let cantidadtimeSpanEstadoConexionGps = 0;
    if (
      timeSpanEstadoConexionGps.days() > 0 ||
      timeSpanEstadoConexionGps.months() > 0
    ) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asDays();
      this.establecerLimiteEquiposNoTransmitiendo(
        'Dias',
        cantidadtimeSpanEstadoConexionGps
      );
      // this.labelUnidadTiempoSeleccionada = "Días";
    } else if (timeSpanEstadoConexionGps.hours() > 0) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asHours();
      this.establecerLimiteEquiposNoTransmitiendo(
        'Horas',
        cantidadtimeSpanEstadoConexionGps
      );
      // this.labelUnidadTiempoSeleccionada = "Horas";
    } else if (timeSpanEstadoConexionGps.minutes() > 0) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asMinutes();
      // this.labelUnidadTiempoSeleccionada = "Minutos";
      this.establecerLimiteEquiposNoTransmitiendo(
        'Minutos',
        cantidadtimeSpanEstadoConexionGps
      );
    }
    this.actualizacionEstadoConexionGpsLimite = cantidadtimeSpanEstadoConexionGps;

    let tiempoVisualizacionPopupLimite = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionPopup
    ).asSeconds();

    this.segundosPopUp = Array.from(
      { length: tiempoVisualizacionPopupLimite },
      (v, k) => k + 1
    );

    let tiempoVisualizacionCampanaLimite = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionCampana
    ).asHours();

    this.horasCampana = Array.from(
      { length: tiempoVisualizacionCampanaLimite },
      (v, k) => k + 1
    );

    //this.unidadTiempoSeleccionada = Array.from({ length: this.actualizacionEstadoConexionGpsLimite }, (v, k) => k + 1);
  }

  establecerLimiteEquiposNoTransmitiendo(
    unidadTiempo: string,
    cantidadtimeSpanEstadoConexionGps: number
  ) {
    if (unidadTiempo == 'Dias') {
      this.unidadTiempo = ['Minutos', 'Horas', 'Días'];
      this.unidadTiempoSeleccionadaDias = Array.from(
        { length: cantidadtimeSpanEstadoConexionGps },
        (v, k) => k + 1
      );
      this.unidadTiempoSeleccionadaMinutos = Array.from(
        { length: 60 },
        (v, k) => k + 1
      );
      this.unidadTiempoSeleccionadaHoras = Array.from(
        { length: 24 },
        (v, k) => k + 1
      );
    } else if (unidadTiempo == 'Horas') {
      this.unidadTiempo = ['Minutos', 'Horas'];
      this.unidadTiempoSeleccionadaHoras = Array.from(
        { length: cantidadtimeSpanEstadoConexionGps },
        (v, k) => k + 1
      );
      this.unidadTiempoSeleccionadaMinutos = Array.from(
        { length: 60 },
        (v, k) => k + 1
      );
    } else if (unidadTiempo == 'Minutos') {
      this.unidadTiempo = ['Minutos'];
      this.unidadTiempoSeleccionadaMinutos = Array.from(
        { length: cantidadtimeSpanEstadoConexionGps },
        (v, k) => k + 1
      );
    }
  }

  handleChangeUnidadTiempoDescanso() {
    switch (this.labelUnidadTiempoSeleccionadaDescanso) {
      case 'Minutos':
        this.idUnidadTiempoDescanso = 0;
        break;
      case 'Horas':
        this.idUnidadTiempoDescanso = 1;
        break;
    }
  }

  MostrarSelect() {
    switch (this.labelUnidadTiempoSeleccionada) {
      case 'Minutos':
        this.idUnidadTiempo = 1;
        break;
      case 'Horas':
        this.idUnidadTiempo = 2;
        break;
      case 'Días':
        this.idUnidadTiempo = 3;
        break;
    }
  }

  //Establezco los valores de los select de acuerdo a los parametros del cliente
  private obtenerEstadoParametrosSistema(parametroSistema: ParametroSistemaVm) {
    this.refrescoVisualizacionMapaSegundos = this.obtenerMoment(
      parametroSistema.refrescoVisualizacionMapaSegundos
    ).asSeconds();

    if (this.refrescoVisualizacionMapaSegundos < 60) {
      this.refrescoVisualizacionMapaSegundos = 60;
    }

    this.expiracionVariablesSesionHoras = this.obtenerMoment(
      parametroSistema.expiracionVariablesSesionHoras
    ).asHours();
    this.eliminacionNotificacionesDias = this.obtenerMoment(
      parametroSistema.eliminacionNotificacionesDias
    ).asDays();

    this.eliminacionAlertasHoras = this.obtenerMoment(
      parametroSistema.eliminacionAlertasHoras
    ).asHours();

    let timeSpanEstadoConexionGps: Duration;
    timeSpanEstadoConexionGps = this.obtenerMoment(
      parametroSistema.actualizacionEstadoConexionGps
    );

    let cantidadtimeSpanEstadoConexionGps = 0;
    if (
      timeSpanEstadoConexionGps.days() > 0 ||
      timeSpanEstadoConexionGps.months() > 0
    ) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asDays();
      this.labelUnidadTiempoSeleccionada = 'Días';
      this.idUnidadTiempo = 3;
    } else if (timeSpanEstadoConexionGps.hours() > 0) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asHours();
      this.labelUnidadTiempoSeleccionada = 'Horas';
      this.idUnidadTiempo = 2;
    } else if (timeSpanEstadoConexionGps.minutes() > 0) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asMinutes();
      this.labelUnidadTiempoSeleccionada = 'Minutos';
      this.idUnidadTiempo = 1;
    }

    this.actualizacionEstadoConexionGps = cantidadtimeSpanEstadoConexionGps;

    this.eliminacionNotificacionesConfigurableCliente = this.parametroSistema.eliminacionNotificacionesConfigurableCliente;
    this.eliminacionAlertasConfigurableCliente = this.parametroSistema.eliminacionAlertasConfigurableCliente;
    this.actualizacionEstadoConexionGpsConfigurableCliente = this.parametroSistema.actualizacionEstadoConexionGpsConfigurableCliente;
    this.refrescarVisualizacionMapaConfigurableCliente = this.parametroSistema.refrescarVisualizacionMapaConfigurableCliente;
    this.expiracionVariablesSesionConfigurableCliente = this.parametroSistema.expiracionVariablesSesionConfigurableCliente;
    this.tiempoVisualizacionCampanaConfigurableCliente = this.parametroSistema.tiempoVisualizacionCampanaConfigurableCliente;
    this.tiempoVisualizacionPopupConfigurableCliente = this.parametroSistema.tiempoVisualizacionPopupConfigurableCliente;

    this.tiempoVisualizacionNotificaciones = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionNotificaciones
    ).asHours();

    this.tiempoDescanso = this.obtenerMoment(
      parametroSistema.tiempoDescanso
    ).asHours();
    this.cadaTiempoDescanso = this.obtenerMoment(
      parametroSistema.tiempoDescansoIntervalos
    ).asHours();

    let timeSpanDescansoConIntervalos: Duration;
    timeSpanDescansoConIntervalos = this.obtenerMoment(
      parametroSistema.tiempoDescansoConIntervalos
    );

    let cantidadtimeSpanDescansoConIntervalos = 0;
    if (
      timeSpanDescansoConIntervalos.days() > 0 ||
      timeSpanDescansoConIntervalos.hours() > 0
    ) {
      cantidadtimeSpanDescansoConIntervalos = timeSpanDescansoConIntervalos.asHours();
      this.labelUnidadTiempoSeleccionadaDescanso = 'Horas';
      this.idUnidadTiempo = 1;
    } else if (timeSpanDescansoConIntervalos.minutes() > 0) {
      cantidadtimeSpanDescansoConIntervalos = timeSpanDescansoConIntervalos.asMinutes();
      this.labelUnidadTiempoSeleccionadaDescanso = 'Minutos';
      this.idUnidadTiempo = 0;
    }
    this.handleChangeUnidadTiempoDescanso();
    this.tiempoDescansoCada = cantidadtimeSpanDescansoConIntervalos;

    this.tiempoVisualizacionPopup = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionPopup
    ).asSeconds();

    this.tiempoVisualizacionCampana = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionCampana
    ).asHours();

    this.obtenerParametrosSistemaLimites();
  }

  private obtenerMoment(valor: string): Duration {
    const regexHoras: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;
    const regexDias: RegExp = /^[0-9]?[0-9].[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;

    if (regexHoras.test(valor)) {
      return moment.duration(moment(valor, 'HH:mm:ss').format('HH:mm:ss'));
    }

    return moment.duration(moment(valor, 'DD.HH:mm:ss').format('DD.HH:mm:ss'));
  }

  valorTimeSpan(horas: number) {
    if (horas === 24) {
      return '1.00:00:00';
    } else if (horas > 24 && horas < 48) {
      const horasDias = horas - 24;
      return horasDias > 9 ? `01.${horasDias}:00:00` : `01.0${horasDias}:00:00`;
    } else {
      return '2.00:00:00';
    }
  }

  guardarCambios(value: boolean) {
    this.dialogConfirmacion = false;
    if (value) {
      this.loadingService.showLoading();

      var minutes = Math.floor(this.refrescoVisualizacionMapaSegundos / 60);
      var seconds = this.refrescoVisualizacionMapaSegundos - minutes * 60;
      seconds = parseInt(seconds > 9 ? `${seconds}` : `0${seconds}`);

      let refrescoVisualizacionMapaSegundos = `00:${minutes}:${seconds}`;

      let expiracionVariablesSesionHoras =
        this.expiracionVariablesSesionHoras > 9
          ? `${this.expiracionVariablesSesionHoras}:00:00`
          : `0${this.expiracionVariablesSesionHoras}:00:00`;

      expiracionVariablesSesionHoras =
        expiracionVariablesSesionHoras === '24:00:00'
          ? '01:00:00:00'
          : expiracionVariablesSesionHoras;

      let eliminacionNotificacionesDias = `${this.eliminacionNotificacionesDias}.00:00:00`;

      let eliminacionAlertasHoras = `${this.eliminacionAlertasHoras}:00:00`;

      eliminacionAlertasHoras =
        eliminacionAlertasHoras === '24:00:00'
          ? '1.00:00:00'
          : eliminacionAlertasHoras;

      let actualizacionEstadoConexionGps: string;
      switch (this.labelUnidadTiempoSeleccionada) {
        case 'Días': {
          const cantidadDias = moment.duration(
            this.actualizacionEstadoConexionGps,
            'days'
          );
          let cantidadH = cantidadDias.months() * 31 + cantidadDias.days();
          actualizacionEstadoConexionGps = `${cantidadH}.00:00:00`;
          break;
        }
        case 'Horas': {
          const cantidadHoras = moment.duration(
            this.actualizacionEstadoConexionGps,
            'hours'
          );

          actualizacionEstadoConexionGps =
            cantidadHoras.asHours() === 24
              ? '1.00:00:00'
              : `${cantidadHoras.hours()}:00:00`;
          break;
        }
        case 'Minutos': {
          const cantidadMinutos = moment.duration(
            this.actualizacionEstadoConexionGps,
            'minutes'
          );
          actualizacionEstadoConexionGps =
            cantidadMinutos.asMinutes() === 60
              ? '01:00:00'
              : `00:${cantidadMinutos.minutes()}:00`;
          break;
        }
      }

      /*Visualizacion notificaciones */
      let tiempoVisualizacionNotificaciones: string;
      const tiempoVisualizacionNotificacionesHoras = moment.duration(
        this.tiempoVisualizacionNotificaciones,
        'hours'
      );

      tiempoVisualizacionNotificaciones =
        tiempoVisualizacionNotificacionesHoras.asHours() === 24
          ? '1.00:00:00'
          : `${tiempoVisualizacionNotificacionesHoras.asHours()}:00:00`;

      /*Tiempo Descanso */
      let tiempoDescanso: string;
      const tiempoDescansoHoras = moment.duration(this.tiempoDescanso, 'hours');
      tiempoDescanso =
        tiempoDescansoHoras.asHours() > 23
          ? this.valorTimeSpan(tiempoDescansoHoras.asHours())
          : `${tiempoDescansoHoras.asHours()}:00:00`;

      /*Intervalos tiempo descanso */
      let cadaTiempoDescanso: string;
      const cadaTiempoDescansoHoras = moment.duration(
        this.cadaTiempoDescanso,
        'hours'
      );

      cadaTiempoDescanso =
        cadaTiempoDescansoHoras.asHours() === 24
          ? '1.00:00:00'
          : `${cadaTiempoDescansoHoras.asHours()}:00:00`;

      /*Cantidad de tiempo de descanso con intervalos */
      let tiempoDescansoConIntervalo: string;
      switch (this.labelUnidadTiempoSeleccionadaDescanso) {
        case 'Horas': {
          const cantidadHoras = moment.duration(
            this.tiempoDescansoCada,
            'hours'
          );

          tiempoDescansoConIntervalo =
            cantidadHoras.asHours() === 24
              ? '1.00:00:00'
              : `${cantidadHoras.hours()}:00:00`;
          break;
        }
        case 'Minutos': {
          const cantidadMinutos = moment.duration(
            this.tiempoDescansoCada,
            'minutes'
          );
          tiempoDescansoConIntervalo =
            cantidadMinutos.asMinutes() === 60
              ? '01:00:00'
              : `00:${cantidadMinutos.minutes()}:00`;
          break;
        }
      }

      var minutesPopUp = Math.floor(this.tiempoVisualizacionPopup / 60);
      var secondsPopUp = this.tiempoVisualizacionPopup - minutesPopUp * 60;
      secondsPopUp = parseInt(
        secondsPopUp > 9 ? `${secondsPopUp}` : `0${secondsPopUp}`
      );

      let tiempoVisualizacionPopup = `00:${minutesPopUp}:${secondsPopUp}`;

      let tiempoVisualizacionCampana = `${this.tiempoVisualizacionCampana}:00:00`;

      tiempoVisualizacionCampana =
        tiempoVisualizacionCampana === '24:00:00'
          ? '1.00:00:00'
          : tiempoVisualizacionCampana;

      this.parametroSistema.refrescoVisualizacionMapaSegundos = refrescoVisualizacionMapaSegundos;
      this.parametroSistema.expiracionVariablesSesionHoras = expiracionVariablesSesionHoras;
      this.parametroSistema.eliminacionNotificacionesDias = eliminacionNotificacionesDias;
      this.parametroSistema.eliminacionAlertasHoras = eliminacionAlertasHoras;
      this.parametroSistema.actualizacionEstadoConexionGps = actualizacionEstadoConexionGps;
      this.parametroSistema.tiempoVisualizacionPopup = tiempoVisualizacionPopup;
      this.parametroSistema.tiempoVisualizacionCampana = tiempoVisualizacionCampana;

      this.parametroSistema.eliminacionNotificacionesConfigurableCliente = this.eliminacionNotificacionesConfigurableCliente;
      this.parametroSistema.eliminacionAlertasConfigurableCliente = this.eliminacionAlertasConfigurableCliente;
      this.parametroSistema.actualizacionEstadoConexionGpsConfigurableCliente = this.actualizacionEstadoConexionGpsConfigurableCliente;
      this.parametroSistema.tiempoVisualizacionNotificaciones = tiempoVisualizacionNotificaciones;
      this.parametroSistema.tiempoDescanso = tiempoDescanso;
      this.parametroSistema.tiempoDescansoIntervalos = cadaTiempoDescanso;
      this.parametroSistema.tiempoDescansoConIntervalos = tiempoDescansoConIntervalo;

      this.axios.http
        .put<ParametroSistemaVm>(`${this.controller}`, this.parametroSistema)
        .then(parametroSistemaVm => {
          this.parametroSistema = parametroSistemaVm.data;
          this.loadingService.hideLoading();
          this.$snotify.success(
            'Los cambios han sido guardados de forma exitosa'
          );
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ocurrió un error al actualizar los parámetros del cliente.'
              );
            }
          } else {
            this.$snotify.error(
              'Ocurrió un error al actualizar los parámetros del cliente.'
            );
          }
        });
    }
  }
}
</script>

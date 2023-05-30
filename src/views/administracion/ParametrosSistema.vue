<template>
  <v-container fluid grid-list-xs>
    <v-tabs left v-model="tabModel">
      <v-tab :href="`#tab-1`">Parámetros del Sistema</v-tab>
      <v-tab
        v-if="showTabParametrosCliente"
        :href="`#tab-2`"
        to="/parametrosSistemaCliente"
        >Parámetros del Cliente</v-tab
      >
      <v-spacer></v-spacer>
      <v-btn
        v-if="accionEditar.visible"
        @click="dialogConfirmacion = true"
        left
        depressed
        class="btn-grabar"
        style="margin-right:20px;"
      >
        <span style="color:white;">Guardar Cambios</span>
      </v-btn>
    </v-tabs>
    <v-card>
      <v-card-text>
        <v-layout>
          <v-flex d-flex xs8 sm8 md8>Par&aacute;metro</v-flex>
          <v-flex d-flex xs2 sm2 md2>Valor</v-flex>
          <v-flex d-flex xs2 sm2 md2>Configurable por cliente</v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Refrescar la visualizaci&oacute;n del mapa cada</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="refrescoVisualizacionMapaSegundos"
              :items="segundos"
              menu-props="auto"
              :disabled="elementosDisabled"
              :label="'Segundos'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Segundos</v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              :disabled="elementosDisabled"
              v-model="refrescarVisualizacionMapaConfigurableCliente"
              color="success"
            ></v-switch>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Expiraci&oacute;n de las variables de sesi&oacute;n</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="expiracionVariablesSesionHoras"
              :items="horasSesion"
              :disabled="elementosDisabled"
              menu-props="auto"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              :disabled="elementosDisabled"
              v-model="expiracionVariablesSesionConfigurableCliente"
              color="success"
            ></v-switch>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de eliminaci&oacute;n de las notificaciones</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="elementosDisabled"
              v-model="eliminacionNotificacionesDias"
              menu-props="auto"
              :items="dias"
              :label="'Días'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>D&iacute;as</v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              :disabled="elementosDisabled"
              v-model="eliminacionNotificacionesConfigurableCliente"
              color="success"
            ></v-switch>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo de eliminaci&oacute;n de las alertas</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              :disabled="elementosDisabled"
              menu-props="auto"
              v-model="eliminacionAlertasHoras"
              :items="horas"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              :disabled="elementosDisabled"
              v-model="eliminacionAlertasConfigurableCliente"
              color="success"
            ></v-switch>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Nº de reintentos fallidos del ingreso de la
            contrase&ntilde;a</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="reintentosFallidosAutenticacion"
              :items="intentos"
              :disabled="elementosDisabled"
              menu-props="auto"
              :label="'Intentos'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Intentos</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo en que los equipos no est&aacute;n transmitiendo</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="actualizacionEstadoConexionGps"
              :items="unidadTiempoSeleccionada"
              :label="labelUnidadTiempoSeleccionada"
              menu-props="auto"
              :disabled="elementosDisabled"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="labelUnidadTiempoSeleccionada"
              @change="tiempoCaducidad()"
              :items="unidadTiempo"
              :label="labelUnidadTiempoSeleccionada"
              :disabled="elementosDisabled"
            ></v-select>
          </v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              v-model="actualizacionEstadoConexionGpsConfigurableCliente"
              :disabled="elementosDisabled"
              color="success"
            ></v-switch>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex s8 sm8 md8>
            Tiempo de caducidad del link de solicitud de cambio de
            contrase&ntilde;a
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="caducidadLinkSolicitudCambioContrasena"
              :items="horas"
              :label="'Horas'"
              menu-props="auto"
              :disabled="elementosDisabled"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex s8 sm8 md8
            >Tiempo de caducidad de contrase&ntilde;a</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-text-field
              v-model="caducidadContrasenaDias"
              type="number"
              max="9999"
              min="1"
              :label="'Días'"
              @keydown="estableceLimite"
              @blur="validaLimite"
              :disabled="elementosDisabled"
            ></v-text-field>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>D&iacute;as</v-flex>
          <v-flex d-flex xs2 sm2 md2></v-flex>
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
              :disabled="elementosDisabled"
              :label="'Horas'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Horas</v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              :disabled="elementosDisabled"
              v-model="tiempoVisualizacionCampanaConfigurableCliente"
              color="success"
            ></v-switch>
          </v-flex>
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
              :disabled="elementosDisabled"
              :label="'Segundos'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Segundos</v-flex>
          <v-flex d-flex xs2 sm2 md2>
            <v-switch
              :disabled="elementosDisabled"
              v-model="tiempoVisualizacionPopupConfigurableCliente"
              color="success"
            ></v-switch>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout>
          <v-flex align-center d-flex xs8 sm8 md8
            >Tiempo Almacenamiento Informe Programado</v-flex
          >
          <v-flex align-center d-flex xs1 sm1 md1>
            <v-select
              v-model="tiempAlmacenamientoInformeProgramado"
              :items="diasInformes"
              menu-props="auto"
              :disabled="elementosDisabled"
              :label="'Dias'"
            ></v-select>
          </v-flex>
          <v-flex align-center d-flex xs1 sm1 md1>Días</v-flex>
        </v-layout>
        <v-divider></v-divider>
      </v-card-text>
    </v-card>
    <app-confirmacion
      :show="dialogConfirmacion"
      titulo="Editar Parámetros del Sistema"
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
export default class ParametrosSistema extends ComponenteBase {
  controller: string = 'ParametroSistema';
  readonly funcionalidad: Funcionalidades = Funcionalidades.ParametrosSistema;

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

  tabModel: string = 'tab-1';
  segundos: number[] = Array.from(
    { length: (60 - 1) / 30 + 1 },
    (_, i) => 60 + i * 30
  );
  minutos: number[] = Array.from({ length: 60 }, (v, k) => k + 1);
  minutos2: number[] = Array.from({ length: 59 }, (v, k) => k + 1);
  dias: number[] = Array.from({ length: 5 }, (v, k) => k + 1);
  dias2: number[] = Array.from(
    { length: (360 - 30) / 30 + 1 },
    (_, i) => 30 + i * 30
  );
  horas: number[] = Array.from({ length: 24 }, (v, k) => k + 1);
  horasSesion: number[] = Array.from({ length: 12 }, (v, k) => k + 1);
  horas2: number[] = Array.from({ length: 23 }, (v, k) => k + 1);
  intentos: number[] = Array.from({ length: 3 }, (v, k) => k + 1);
  unidadTiempo: string[] = ['Minutos', 'Horas', 'Días'];
  labelUnidadTiempoSeleccionada: string = 'Minutos';
  unidadTiempoSeleccionada: number[] = [];
  segundosPopUp: number[] = Array.from({ length: 59 }, (v, k) => k + 1);
  horasCampana: number[] = Array.from({ length: 23 }, (v, k) => k + 1);
  diasInformes: number[] = Array.from({ length: 365 }, (v, k) => k + 1);

  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  $snotify: any;
  loadingService = new LoadingService();
  clienteId: number = config.getClienteSesion();
  showTabParametrosCliente: boolean = true;

  //modal
  dialogConfirmacion: boolean = false;

  //modelo:
  refrescoVisualizacionMapaSegundos: number = 0;
  expiracionVariablesSesionHoras: number = 0;
  eliminacionNotificacionesDias: number = 0;
  eliminacionAlertasHoras: number = 0;
  reintentosFallidosAutenticacion: number = 0;
  actualizacionEstadoConexionGps: number = 0;
  caducidadLinkSolicitudCambioContrasena: number = 0;
  caducidadContrasenaDias: number = 0; // expiracion de contrasena
  eliminacionNotificacionesConfigurableCliente: boolean = false;
  eliminacionAlertasConfigurableCliente: boolean = false;
  actualizacionEstadoConexionGpsConfigurableCliente: boolean = false;
  refrescarVisualizacionMapaConfigurableCliente: boolean = false;
  expiracionVariablesSesionConfigurableCliente: boolean = false;
  tiempoVisualizacionCampanaConfigurableCliente?: boolean = false;
  tiempoVisualizacionPopupConfigurableCliente?: boolean = false;
  tiempoVisualizacionCampana: number = 0;
  tiempoVisualizacionPopup: number = 0;
  tiempAlmacenamientoInformeProgramado: number = 0;

  parametroSistema: ParametroSistemaVm = new ParametroSistemaVm();
  parametroSistemaCliente: ParametroSistemaVm = new ParametroSistemaVm();

  elementosDisabled: boolean = false;

  mounted() {
    this.showTabParametrosCliente = config.chequeaPermisosTabs(
      Funcionalidades.ParametrosSistemaCliente,
      config.getClienteSesion()
    );
    this.elementosDisabled = !this.accionEditar.visible;

    this.loadingService.showLoading();
    this.obtenerParametrosSistemaCliente()
      .then(() => {
        return this.obtenerParametrosSistema();
      })
      .catch(error => {
        this.loadingService.hideLoading();
      });
  }

  tiempoCaducidad() {
    switch (this.labelUnidadTiempoSeleccionada) {
      case 'Minutos':
        this.unidadTiempoSeleccionada = this.minutos2;
        break;
      case 'Horas':
        this.unidadTiempoSeleccionada = this.horas2;
        break;
      case 'Días':
        this.unidadTiempoSeleccionada = this.dias;
        break;
    }
  }

  obtenerParametrosSistemaCliente() {
    return this.axios.http
      .get<ParametroSistemaVm>(`${this.controller}/${this.clienteId}/cliente`)
      .then(ps => {
        this.parametroSistemaCliente = ps.data;
      })
      .catch(error => {});
  }

  obtenerParametrosSistema() {
    return this.axios.http
      .get<ParametroSistemaVm>(`${this.controller}/sistema`)
      .then(ps => {
        this.parametroSistema = ps.data;
        this.obtenerEstadoParametrosSistema(this.parametroSistema);
        this.loadingService.hideLoading();
      })
      .catch(error => {
        this.loadingService.hideLoading();
      });
  }

  private obtenerEstadoParametrosSistema(parametroSistema: ParametroSistemaVm) {
    this.refrescoVisualizacionMapaSegundos = this.obtenerMoment(
      parametroSistema.refrescoVisualizacionMapaSegundos
    ).asSeconds();

    this.expiracionVariablesSesionHoras = this.obtenerMoment(
      parametroSistema.expiracionVariablesSesionHoras
    ).asHours();

    this.eliminacionNotificacionesDias = this.obtenerMoment(
      parametroSistema.eliminacionNotificacionesDias
    ).asDays();

    this.eliminacionAlertasHoras = this.obtenerMoment(
      parametroSistema.eliminacionAlertasHoras
    ).asHours();

    this.reintentosFallidosAutenticacion =
      parametroSistema.reintentosFallidosAutenticacion;

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
    } else if (timeSpanEstadoConexionGps.hours() > 0) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asHours();
      this.labelUnidadTiempoSeleccionada = 'Horas';
    } else if (timeSpanEstadoConexionGps.minutes() > 0) {
      cantidadtimeSpanEstadoConexionGps = timeSpanEstadoConexionGps.asMinutes();
      this.labelUnidadTiempoSeleccionada = 'Minutos';
    }

    this.tiempoCaducidad();
    this.actualizacionEstadoConexionGps = cantidadtimeSpanEstadoConexionGps;

    this.caducidadLinkSolicitudCambioContrasena = this.obtenerMoment(
      parametroSistema.caducidadLinkSolicitudCambioContrasena
    ).asHours();
    this.caducidadContrasenaDias = parametroSistema.caducidadContrasenaDias; // caducidad contrasena

    this.tiempoVisualizacionPopup = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionPopup
    ).asSeconds();

    this.tiempoVisualizacionCampana = this.obtenerMoment(
      parametroSistema.tiempoVisualizacionCampana
    ).asHours();

    this.tiempAlmacenamientoInformeProgramado =
      parametroSistema.tiempAlmacenamientoInformeProgramado;

    this.eliminacionNotificacionesConfigurableCliente = this.parametroSistemaCliente.eliminacionNotificacionesConfigurableCliente;
    this.eliminacionAlertasConfigurableCliente = this.parametroSistemaCliente.eliminacionAlertasConfigurableCliente;
    this.actualizacionEstadoConexionGpsConfigurableCliente = this.parametroSistemaCliente.actualizacionEstadoConexionGpsConfigurableCliente;
    this.refrescarVisualizacionMapaConfigurableCliente = this.parametroSistemaCliente.refrescarVisualizacionMapaConfigurableCliente;
    this.expiracionVariablesSesionConfigurableCliente = this.parametroSistemaCliente.expiracionVariablesSesionConfigurableCliente;
    this.tiempoVisualizacionCampanaConfigurableCliente = this.parametroSistemaCliente.tiempoVisualizacionCampanaConfigurableCliente;
    this.tiempoVisualizacionPopupConfigurableCliente = this.parametroSistemaCliente.tiempoVisualizacionPopupConfigurableCliente;
  }

  private obtenerMoment(valor: string): Duration {
    const regexHoras: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;

    if (regexHoras.test(valor)) {
      return moment.duration(moment(valor, 'HH:mm:ss').format('HH:mm:ss'));
    }

    return moment.duration(moment(valor, 'DD.HH:mm:ss').format('DD.HH:mm:ss'));
  }
  validaLimite() {
    if (this.caducidadContrasenaDias.toString().length < 1) {
      this.caducidadContrasenaDias = 1;
    }
    if (this.caducidadContrasenaDias == 0) {
      this.caducidadContrasenaDias = 1;
    }
  }
  estableceLimite(evt: any) {
    if (this.caducidadContrasenaDias.toString().length >= 4) {
      if (evt.keyCode >= 48 && evt.keyCode <= 57) {
        evt.preventDefault();
        return;
      }
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

      let caducidadLinkSolicitudCambioContrasena: string;
      const cantidadLinkHoras = moment.duration(
        this.caducidadLinkSolicitudCambioContrasena,
        'hours'
      );

      caducidadLinkSolicitudCambioContrasena =
        cantidadLinkHoras.asHours() === 24
          ? '1.00:00:00'
          : `${cantidadLinkHoras.asHours()}:00:00`;

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
      this.parametroSistema.caducidadLinkSolicitudCambioContrasena = caducidadLinkSolicitudCambioContrasena;
      this.parametroSistema.reintentosFallidosAutenticacion = this.reintentosFallidosAutenticacion;
      this.parametroSistema.caducidadContrasenaDias = this.caducidadContrasenaDias; // caducidad contrasena
      this.parametroSistema.tiempoVisualizacionPopup = tiempoVisualizacionPopup;
      this.parametroSistema.tiempoVisualizacionCampana = tiempoVisualizacionCampana;
      this.parametroSistema.tiempAlmacenamientoInformeProgramado = this.tiempAlmacenamientoInformeProgramado;

      this.parametroSistema.eliminacionAlertasConfigurableCliente = this.eliminacionAlertasConfigurableCliente;
      this.parametroSistema.eliminacionNotificacionesConfigurableCliente = this.eliminacionNotificacionesConfigurableCliente;
      this.parametroSistema.actualizacionEstadoConexionGpsConfigurableCliente = this.actualizacionEstadoConexionGpsConfigurableCliente;
      this.parametroSistema.refrescarVisualizacionMapaConfigurableCliente = this.refrescarVisualizacionMapaConfigurableCliente;
      this.parametroSistema.expiracionVariablesSesionConfigurableCliente = this.expiracionVariablesSesionConfigurableCliente;
      this.parametroSistema.tiempoVisualizacionCampanaConfigurableCliente = this.tiempoVisualizacionCampanaConfigurableCliente;
      this.parametroSistema.tiempoVisualizacionPopupConfigurableCliente = this.tiempoVisualizacionPopupConfigurableCliente;

      return this.axios.http
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
                'Ocurrió un error al actualizar los parámetros del sistema.'
              );
            }
          } else {
            this.$snotify.error(
              'Ocurrió un error al actualizar los parámetros del sistema.'
            );
          }
        });
    }
  }
}
</script>

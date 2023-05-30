<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear titulo="Crear Alerta" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        :estado-id="estadoId"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.configurarAlerta">
          <ConfigurarAlertaForm
            @change="handleFormChange"
            @changeTipoBase="handleTipoBaseChange"
            @changeParametroGeneral="handleParametroGeneral"
            @changeCamposDinamicos="handleCamposDinamicosChange"
            @changeValidaCampos="handleValidaCamposChange"
            @changeUsoNoAutorizado="handleUsoNoAutorizadoChange"
            @changeDatosZonas="handleDatosZonas"
            @planesChange="handlePlanesChange"
            @changeValidaCamposZonas="handleValidaCamposZonas"
            @camposZonaNoAutorizadaEmpty="handleCamposZonaNoAutorizadaEmpty"
            @camposZonaEmpty="handleCamposZonaEmpty"
            @camposDetencionNoAutorizadaEmpty="
              handlecamposDetencionNoAutorizadaEmpty
            "
            @showAsociarVehiculos="handleShowAsociarVehiculos"
            :lstAlertasBase="lstAlertasBase"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <v-flex v-if="showAsociarVehiculos">
            <AsociarFlotaEtiquetaVehiculo
              :col-def-vehiculo="vehiculoColDefs"
              @change="handleAsociacionesChange"
            />
          </v-flex>
          <v-flex v-if="!showAsociarVehiculos">
            <AsociarFlotaEtiquetaVehiculoXMantenimiento
              @change="handleAsociacionesChangeM"
            ></AsociarFlotaEtiquetaVehiculoXMantenimiento>
          </v-flex>
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.configurarNotificaciones">
          <ConfigurarNotificacionForm
            @change="handleFormNotificarChange"
            @distribucionSelect="handleDistribucionSelect"
            @calendarioSelect="handleCalendarioSelect"
            @tipoNotificacionSeleccionado="handledTipoNotificacion"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Alerta' })"
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      :items="itemsNoValidos"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
    <v-dialog v-model="showValidacionLineal" persistent max-width="380">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title
            style="font-size:17px;margin-left: 10px !important"
            >{{ tituloValidacion }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <span>Debe ingresar:</span>
          <br />
          <br />
          <ul>
            <li v-for="ce in camposZonaEmpty" :key="ce">{{ ce }}</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="showValidacionLineal = false"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </ModalMantenedor>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad, TipoAlertaBase } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Validator } from 'vee-validate';

import moment, { Duration } from 'moment';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';

import ConfigurarAlertaForm from '@/pantallas/Alertas/ConfigurarAlertaForm.vue';
import ConfigurarNotificacionForm from '@/pantallas/Alertas/ConfigurarNotificacionForm.vue';

import {
  AlertaBackend,
  CampoDinamico,
  UsoNoAutorizado,
  ZonaAlerta,
  ZonaAlertaGrillaDetencion,
} from '@/interfaces/Alertas';
import {
  typeConfigBase,
  typeNuevosCampo,
  AlertasBaseBackend,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';

import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';

import { ColDef } from 'ag-grid-community';

import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import AsociarFlotaEtiquetaVehiculoXMantenimiento from '@/pantallas/Informes/partes/AsociarFlotaEtiquetaVehiculoXMantenimiento.vue';

@Component({
  components: {
    Confirmation,
    ModalMantenedor,
    CabeceraModalCrear,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    ConfigurarAlertaForm,
    AsociarFlotaEtiquetaVehiculo,
    ConfigurarNotificacionForm,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoXMantenimiento,
  },
})
export default class CrearAlertaModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Alertas;
  permisosActuales: PermisoAccionVm[] = [];

  readonly pasos: PasosCrud = {
    configurarAlerta: {
      accion: 'Crear - Configurar Alerta',
      visible: true,
      step: 1,
      title: 'Configurar Alerta',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
      codigoSubAccion: 40,
      codigoAccionPadre: CodigoAccion.Crear,
    },
    asociarVehiculos: {
      accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 2,
      title: 'Asociar Vehículos',
      icon: 'directions_car',
      codigoSubAccion: 41,
      codigoAccionPadre: CodigoAccion.Crear,
    },
    configurarNotificaciones: {
      accion: 'Crear - Configurar Notificaciones',
      visible: true,
      step: 3,
      title: 'Configurar Notificación',
      icon: 'person',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
      codigoSubAccion: 42,
      codigoAccionPadre: CodigoAccion.Crear,
    },
  };

  asociaciones: AsociarFlotaEtiquetaVehiculoChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      lockPinned: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];

  // Variables Globales
  readonly $snotify: Snotify;
  pasoActivoIndex: number = 1;
  isValidCampos = true;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  loadingService = new LoadingService();
  tipoBase: number = -1;
  esAcumulable: boolean = false;

  alerta: AlertaBackend = {};

  /* validacion */
  showValidacion: boolean = false;
  showValidacionLineal: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  itemsNoValidos: string[] = [];
  isValidCamposZonas = true;
  showAsociarVehiculos = true;

  tipoNotificacionSeleccionado: number = 1;
  listaDistribucionSeleccionados: number[] = [];
  contactosSeleccionados: number[] = [];
  idsPlanesSeleccionados: number[] = [];
  usuariosSeleccionados: number[] = [];
  camposZonaEmpty: any = '';

  //controllers
  readonly Controller: string = 'Alerta';

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.permitirContinuarAsociarVehiculos;
    this.pasos.configurarNotificaciones.permitirContinuar = this.permitirContinuarConfigurarNotificaciones;
    this.pasos.configurarAlerta.permitirContinuar = this.permitirContinuarConfigurarAlerta;
  }

  created() {
    this.chequearPermisos();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.alerta = {};
    this.$validator.reset();
  }

  handleCerrar() {
    this.alerta = {};
    this.listaDistribucionSeleccionados = [];
    this.contactosSeleccionados = [];
    this.usuariosSeleccionados = [];
    this.idsPlanesSeleccionados = [];
    this.pasoActivoIndex = 1;
    this.$validator.reset();
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.configurarAlerta.formState.validator.validateAll();

    if (isValid) {
      this.handleEstadoSwitch(
        this.pasos.configurarAlerta.formState.entity.estado
      );
      this.dialogConfirmacionGuardar = true;
    }
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacion =
        'Al dejar como inactivo, no se permitirá recibir notificaciones de esta Alerta. ¿Esta seguro que desea crear la Alerta?';
    } else {
      this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
        entidad: 'la Alerta',
      });
    }
  }

  handleConfirmacionGuardar(val: boolean) {
    this.dialogConfirmacionGuardar = false;

    if (val) {
      this.loadingService.showLoading();
      var configurarAlertaForm = this.pasos.configurarAlerta.formState.entity;
      var notificarForm = this.pasos.configurarNotificaciones.formState.entity;

      this.alerta.nombre = configurarAlertaForm.nombre;
      this.alerta.alertaBaseId = configurarAlertaForm.alertaBaseId;
      this.alerta.color = configurarAlertaForm.color;
      this.alerta.estado = configurarAlertaForm.estado;

      this.alerta.parametroGeneral = configurarAlertaForm.parametroGeneral;

      if (this.alerta.parametroGeneral) {
        this.alerta.velMax = configurarAlertaForm.velMax;
        this.alerta.tolerancia = configurarAlertaForm.tolerancia;
      }

      this.alerta.eventos = configurarAlertaForm.eventos;
      this.alerta.temporalidad = configurarAlertaForm.temporalidad;
      //if (this.esAcumulable) {
      //this.alerta.eventos = configurarAlertaForm.eventos;
      //this.alerta.temporalidad = configurarAlertaForm.temporalidad;
      //}

      switch (this.tipoBase) {
        case TipoAlertaBase.AlertaZona:
        case TipoAlertaBase.AlertaRuta:
          this.alerta.desde = configurarAlertaForm.desde;
          this.alerta.hasta = configurarAlertaForm.hasta;
          break;
        case TipoAlertaBase.AlertaDetencionNoAutorizada:
          this.alerta.estadoIgnicion = configurarAlertaForm.estadoIgnicion;
          this.alerta.ignicionVelocidad =
            configurarAlertaForm.ignicionVelocidad;
          this.alerta.tiempoDetencion = configurarAlertaForm.tiempoDetencion;
          break;
        case TipoAlertaBase.AlertaUsoNoAutorizado:
          this.alerta.tolerancia = configurarAlertaForm.tolerancia;
          break;
        case TipoAlertaBase.AlertaMantencionPorVencer:
          this.alerta.horasMotorMenor = configurarAlertaForm.horasMotorMenor;
          this.alerta.kilometrosMenor = configurarAlertaForm.kilometrosMenor;
          this.alerta.tiempoMenor = configurarAlertaForm.tiempoMenor;
          this.alerta.unidadMedidaTiempo =
            configurarAlertaForm.unidadMedidaTiempo;
          this.alerta.planesMantenimientoId = this.idsPlanesSeleccionados;
          break;
        case TipoAlertaBase.AlertaMantencionVencida:
          this.alerta.planesMantenimientoId = this.idsPlanesSeleccionados;
          break;
      }

      this.alerta.flotasId = this.asociaciones.flotas.map((x: Flota) => x.id);
      this.alerta.etiquetasId = this.asociaciones.etiquetas.map(
        (x: Etiqueta) => x.id
      );
      this.alerta.vehiculosId = this.asociaciones.vehiculos.map(
        (x: Vehiculo) => x.id
      );

      this.alerta.notificaGps = notificarForm.notificaGps;
      this.alerta.notificaBrowser = notificarForm.notificaBrowser;
      this.alerta.notificaEmail = notificarForm.notificaEmail;

      this.axios.http
        .post(`${this.Controller}/${this.tipoBase}`, this.alerta)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Alerta',
              creadoA: 'creada',
            })
          );
          this.handleCerrar();
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'Alerta',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'Alerta',
              })
            );
          }
        });
    }
  }

  /* Configurar Alerta */

  handleFormChange(event: FormChangeEvent) {
    this.pasos.configurarAlerta.formState = event;
  }

  handleTipoBaseChange(tipoBase: number, esAcumulable: boolean) {
    this.tipoBase = tipoBase;
    this.esAcumulable = esAcumulable;
  }

  handleParametroGeneral(parametroGeneral: boolean) {
    this.alerta.parametroGeneral = parametroGeneral;
  }

  handleValidaCamposChange(isValid: boolean) {
    this.isValidCampos = isValid;
  }

  handleCamposDinamicosChange(lstCamposDinamico: CampoDinamico[]) {
    this.isValidCampos = true;
    this.alerta.campoDinamico = lstCamposDinamico;
  }

  handleUsoNoAutorizadoChange(lstUsoNoAutorizado: UsoNoAutorizado[]) {
    this.alerta.usoNoAutorizado = lstUsoNoAutorizado;
  }

  handleDatosZonas(lstZonas: ZonaAlerta[]) {
    this.isValidCampos = true;
    this.alerta.zonas = lstZonas;
  }

  handlePlanesChange(planes: number[]) {
    this.idsPlanesSeleccionados = planes;
  }

  handleValidaCamposZonas(isValidCamposZonas: boolean) {
    this.isValidCamposZonas = isValidCamposZonas;
  }

  handleCamposZonaEmpty(camposZonaEmpty: any) {
    this.camposZonaEmpty = [];
    if (
      this.tipoBase === TipoAlertaBase.AlertaZona ||
      this.tipoBase === TipoAlertaBase.AlertaRuta
    ) {
      camposZonaEmpty.velocidad == 0
        ? this.camposZonaEmpty.push('Velocidad en km/h')
        : '';

      camposZonaEmpty.tolerancia === 0 || camposZonaEmpty.tolerancia === ''
        ? this.camposZonaEmpty.push('Tolerancia en km/h')
        : '';

      (camposZonaEmpty.eventos == 0 || camposZonaEmpty.eventos == null) &&
      (camposZonaEmpty.temporalidad == 0 ||
        camposZonaEmpty.temporalidad == null)
        ? this.camposZonaEmpty.push('N° de Eventos o Temporalidad')
        : '';
    }
  }

  handleCamposZonaNoAutorizadaEmpty(camposZonaEmpty: any) {
    this.camposZonaEmpty = [];
    camposZonaEmpty.velocidad == 0
      ? this.camposZonaEmpty.push('Velocidad en Km/h')
      : '';

    camposZonaEmpty.tolerancia === 0 || camposZonaEmpty.tolerancia === ''
      ? this.camposZonaEmpty.push('Tolerancia en Km/h')
      : '';
    camposZonaEmpty.eventos == 0 && camposZonaEmpty.temporalidad == 0
      ? this.camposZonaEmpty.push('N° de Eventos o Temporalidad')
      : '';
  }

  handlecamposDetencionNoAutorizadaEmpty(
    camposDetencionEmpty: ZonaAlertaGrillaDetencion
  ) {
    this.camposZonaEmpty = [];
    const alertaForm = this.pasos.configurarAlerta.formState.entity;

    if (alertaForm.estadoIgnicion) {
      camposDetencionEmpty.eventos === 0 || camposDetencionEmpty.eventos === '0'
        ? this.camposZonaEmpty.push('N° de Eventos')
        : '';

      camposDetencionEmpty.temporalidad === 0 ||
      camposDetencionEmpty.temporalidad === '0'
        ? this.camposZonaEmpty.push('Temporalidad')
        : '';
      camposDetencionEmpty.tiempoDetencion === 0 ||
      camposDetencionEmpty.tiempoDetencion === '0'
        ? this.camposZonaEmpty.push('Tiempo de detención')
        : '';
    } else {
      camposDetencionEmpty.tiempoDetencion === 0 ||
      camposDetencionEmpty.tiempoDetencion === '0'
        ? this.camposZonaEmpty.push('Tiempo de detención')
        : '';
    }
  }

  handleShowAsociarVehiculos(showAsociarVehiculos: boolean) {
    this.showAsociarVehiculos = showAsociarVehiculos;
  }

  get estadoId() {
    const { entity } = this.pasos.configurarAlerta.formState;
    if (!entity) {
      return null;
    }
    return entity.estado;
  }

  /* Pestaña Asociar vehiculo  */

  handleAsociacionesChange(event: AsociarFlotaEtiquetaVehiculoChangeEvent) {
    this.asociaciones = event;
  }

  /* Pestaña Configurar notificacion  */

  handleDistribucionSelect(
    lstNotificacion: number[],
    tipoNotificacion: number
  ) {
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

  handleFormNotificarChange(event: FormChangeEvent) {
    this.pasos.configurarNotificaciones.formState = event;
  }

  handleCalendarioSelect(calendarios: number[]) {
    this.alerta.notificacionCalendario = calendarios;
  }

  handledTipoNotificacion(tipoNotificacion: number) {
    this.tipoNotificacionSeleccionado = tipoNotificacion;
  }

  /* Validacion */

  permitirContinuarAsociarVehiculos() {
    this.itemsNoValidos = [];
    this.mensajeValidacion = '';

    if (!this.asociaciones.vehiculos.length) {
      this.tituloValidacion = 'Seleccionar Vehículo';
      this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  permitirContinuarConfigurarNotificaciones() {
    this.tituloValidacion = 'Configurar Notificación';
    this.mensajeValidacion = 'Debe seleccionar:';
    this.itemsNoValidos = [];

    if (
      this.listaDistribucionSeleccionados.length ||
      this.contactosSeleccionados.length ||
      this.usuariosSeleccionados.length
    ) {
      //
    } else {
      this.itemsNoValidos.push('Lista de Distribución, Contacto o Usuario');
    }

    var notificarForm = this.pasos.configurarNotificaciones.formState.entity;

    if (
      !notificarForm.notificaGps &&
      !notificarForm.notificaBrowser &&
      !notificarForm.notificaEmail
    ) {
      this.itemsNoValidos.push('Medio de Notificación');
    }

    if (
      !this.alerta.notificacionCalendario ||
      this.alerta.notificacionCalendario.length == 0
    ) {
      this.itemsNoValidos.push('Calendario');
    }

    if (this.itemsNoValidos && this.itemsNoValidos.length > 0) {
      this.showValidacion = true;
      return false;
    }

    return true;
  }

  permitirContinuarConfigurarAlerta() {
    this.itemsNoValidos = [];
    this.mensajeValidacion = '';

    if (
      (this.tipoBase === TipoAlertaBase.AlertaMantencionPorVencer ||
        this.tipoBase === TipoAlertaBase.AlertaMantencionVencida) &&
      this.idsPlanesSeleccionados.length === 0
    ) {
      this.tituloValidacion = 'Seleccionar Plan de Mantenimiento';
      this.mensajeValidacion =
        'Debe seleccionar al menos un plan de mantenimiento.';
      this.showValidacion = true;
      return false;
    } else if (this.tipoBase === TipoAlertaBase.AlertaUsoNoAutorizado) {
      if (this.alerta.usoNoAutorizado.length === 0) {
        this.tituloValidacion = 'Configurar Alerta';
        this.mensajeValidacion =
          'Debe agregar al menos un rango de tiempo de detención.';
        this.showValidacion = true;
        return false;
      }
    } else if (
      this.tipoBase === TipoAlertaBase.AlertaZona ||
      this.tipoBase === TipoAlertaBase.AlertaRuta ||
      this.tipoBase === TipoAlertaBase.AlertaDetencionNoAutorizada
    ) {
      if (!this.isValidCampos) {
        this.tituloValidacion = 'Configurar Alerta';
        this.mensajeValidacion =
          'No se ha podido guardar la información ya que hay valores incorrectos en la grilla de zonas. Favor revisar los casos con atención.';
        this.showValidacion = true;
        //this.$snotify.error(this.mensajeValidacion);
        return;
      } else if (this.alerta.zonas.length === 0) {
        this.tituloValidacion = 'Configurar Alerta';
        this.mensajeValidacion = 'Debe seleccionar al menos una Zona.';
        this.showValidacion = true;
        return false;
      } else if (!this.isValidCamposZonas) {
        if (this.camposZonaEmpty.length > 0) {
          this.tituloValidacion = 'Configurar Alerta';
          this.mensajeValidacion = ``;
          // 'Debe completar al menos un campo de la tabla : - N° de eventos - Temporalidad - Tiempo de detención';
          this.showValidacionLineal = true;
          return false;
        }
      }
    } else if (this.tipoBase === TipoAlertaBase.AlertaGenerica) {
      if (!this.isValidCampos) return false;
    }

    return true;
  }

  handleAsociacionesChangeM(event: any) {
    this.asociaciones.vehiculos = event.vehiculos;
  }
}
</script>

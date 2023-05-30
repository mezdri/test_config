<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Alerta"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      entidad="Alerta"
      :nombreEntidad="alerta.nombre"
      :pasoActivoIndex="pasoActivoIndex"
      :estadoEntidad="estadoEntidad"
      :inactivoSinAsociacion="inactivoSinAsociacion"
      :mensajeInactivo="mensajeInactivo"
    ></CabeceraModalEditar>
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
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
        :alertaSeleccionada="alertaSeleccionada"
        :modoEditar="true"
        v-show="pasoActivoIndex === pasos.configurarAlerta.step"
      />
      <v-flex v-if="showAsociarVehiculos">
        <AsociarFlotaEtiquetaVehiculo
          :flotas-id-seleccionar="
            alertaSeleccionada && alertaSeleccionada.flotasId
          "
          :etiquetas-id-seleccionar="
            alertaSeleccionada && alertaSeleccionada.etiquetasId
          "
          :vehiculos-id-seleccionar="
            alertaSeleccionada && alertaSeleccionada.vehiculosId
          "
          :col-def-vehiculo="vehiculoColDefs"
          @change="handleAsociacionesChange"
          :esEditar="true"
          v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
        />
      </v-flex>
      <v-flex v-if="!showAsociarVehiculos">
        <AsociarFlotaEtiquetaVehiculoXMantenimiento
          @change="handleAsociacionesChangeM"
          v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
          :vehiculosIdSeleccionar="
            alertaSeleccionada && alertaSeleccionada.vehiculosId
          "
          :esEditar="true"
        ></AsociarFlotaEtiquetaVehiculoXMantenimiento>
      </v-flex>
      <ConfigurarNotificacionForm
        :modoEditar="true"
        @change="handleFormNotificarChange"
        @distribucionSelect="handleDistribucionSelect"
        @calendarioSelect="handleCalendarioSelect"
        @tipoNotificacionSeleccionado="handledTipoNotificacion"
        :alertaSeleccionada="alertaSeleccionada"
        v-show="pasoActivoIndex === pasos.configurarNotificaciones.step"
      />
    </ContenidoModal>
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
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad, TipoAlertaBase } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import config from '@/config/index';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import ConfigurarAlertaForm from '@/pantallas/Alertas/ConfigurarAlertaForm.vue';
import ConfigurarNotificacionForm from '@/pantallas/Alertas/ConfigurarNotificacionForm.vue';
import AsociarFlotaEtiquetaVehiculoXMantenimiento from '@/pantallas/Informes/partes/AsociarFlotaEtiquetaVehiculoXMantenimiento.vue';

import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';

import { ColDef } from 'ag-grid-community';

import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';

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
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModalEditar,
    ConfigurarAlertaForm,
    AsociarFlotaEtiquetaVehiculo,
    ConfigurarNotificacionForm,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoXMantenimiento,
  },
})
export default class EditarAlertaModal extends Vue {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];
  @Prop({ required: true }) alertaSeleccionada: AlertaBackend;

  readonly $snotify: Snotify;
  readonly Controller: string = 'Alerta';
  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  loadingService = new LoadingService();
  tipoBase: number = -1;
  esAcumulable: boolean = false;
  isValidCampos = true;
  dialogConfirmacionGuardar: boolean = false;
  alerta: AlertaBackend = {};
  camposZonaEmpty: any = '';
  showValidacionLineal: boolean = false;

  estadoEntidad: boolean = true;
  inactivoSinAsociacion: boolean = true;

  /* validacion */
  showValidacion: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  tipoNotificacionSeleccionado: number = 1;
  itemsNoValidos: string[] = [];
  mensajeInactivo: string =
    'Al dejar como inactivo, no se permitirá recibir notificaciones de esta Alerta.';

  idsPlanesSeleccionados: number[] = [];
  isValidCamposZonas: boolean = true;
  showAsociarVehiculos = true;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Alertas;

  pasoActivoIndex: number = 1;
  readonly pasos: PasosCrud = {
    configurarAlerta: {
      accion: 'Editar - Configurar Alerta',
      visible: true,
      step: 1,
      title: 'Configurar Alerta',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    asociarVehiculos: {
      accion: 'Editar - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 2,
      title: 'Asociar Vehículos',
      icon: 'directions_car',
    },
    configurarNotificaciones: {
      accion: 'Editar - Configurar Notificaciones',
      visible: true,
      step: 3,
      title: 'Configurar Notificación',
      icon: 'person',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
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

  constructor() {
    super();
    this.pasos.configurarAlerta.permitirContinuar = this.permitirContinuarConfigurarAlerta;
  }

  @Watch('alertaSeleccionada', { deep: true })
  handleAlertaSeleccionadaChange() {
    if (this.alertaSeleccionada) {
      this.alerta.id = this.alertaSeleccionada.id;
      this.alerta.alertaBaseId = this.alertaSeleccionada.alertaBaseId;
      this.alerta.alertaBaseTipo = this.alertaSeleccionada.alertaBaseTipo;
      this.alerta.alertaTipo = this.alertaSeleccionada.alertaTipo;
      this.alerta.nombre = this.alertaSeleccionada.nombre;
      this.alerta.color = this.alertaSeleccionada.color;
      this.alerta.temporalidad = this.alertaSeleccionada.temporalidad;
      this.alerta.eventos = this.alertaSeleccionada.eventos;
      this.alerta.estado = this.alertaSeleccionada.estado;
      this.alerta.campoDinamico = this.alertaSeleccionada.campoDinamico;
      this.alerta.usoNoAutorizado = this.alertaSeleccionada.usoNoAutorizado;
      this.alerta.zonas = this.alertaSeleccionada.zonas;
      this.alerta.desde = this.alertaSeleccionada.desde;
      this.alerta.hasta = this.alertaSeleccionada.hasta;
      this.alerta.parametroGeneral = this.alertaSeleccionada.parametroGeneral;
      this.alerta.velMax = this.alertaSeleccionada.velMax;
      this.alerta.estadoIgnicion = this.alertaSeleccionada.estadoIgnicion;
      this.alerta.ignicionVelocidad = this.alertaSeleccionada.ignicionVelocidad;
      this.alerta.tolerancia = this.alertaSeleccionada.tolerancia;
      this.alerta.vehiculosId = this.alertaSeleccionada.vehiculosId;
      this.alerta.flotasId = this.alertaSeleccionada.flotasId;
      this.alerta.etiquetasId = this.alertaSeleccionada.etiquetasId;
      this.alerta.notificaGps = this.alertaSeleccionada.notificaGps;
      this.alerta.notificaBrowser = this.alertaSeleccionada.notificaBrowser;
      this.alerta.notificaEmail = this.alertaSeleccionada.notificaEmail;
      this.alerta.notificacionListaDistribucion = this.alertaSeleccionada.notificacionListaDistribucion;
      this.alerta.notificacionContacto = this.alertaSeleccionada.notificacionContacto;
      this.alerta.notificacionCalendario = this.alertaSeleccionada.notificacionCalendario;
      this.alerta.notificacionUsuario = this.alertaSeleccionada.notificacionUsuario;
      this.alerta.hdopdesde = this.alertaSeleccionada.zonas[0].hdopdesde;
      this.alerta.hdophasta = this.alertaSeleccionada.zonas[0].hdophasta;
      this.alerta.nsatelites = this.alertaSeleccionada.zonas[0].nsatelites;
    }
  }

  handleCerrar() {
    this.alerta = {};
    this.pasoActivoIndex = 1;
    this.$emit('cerrar');
  }

  handleGuardar() {
    var configurarAlertaForm = this.pasos.configurarAlerta.formState.entity;
    var notificarForm = this.pasos.configurarNotificaciones.formState.entity;
    var isCamposValidos = true;

    this.alerta.nombre = configurarAlertaForm.nombre;
    this.alerta.alertaBaseId = configurarAlertaForm.alertaBaseId;
    this.alerta.color = configurarAlertaForm.color;
    this.alerta.estado = configurarAlertaForm.estado;

    this.alerta.parametroGeneral = configurarAlertaForm.parametroGeneral;

    this.alerta.velMax = configurarAlertaForm.velMax;
    this.alerta.tolerancia = configurarAlertaForm.tolerancia;

    this.alerta.eventos = configurarAlertaForm.eventos;
    this.alerta.temporalidad = configurarAlertaForm.temporalidad;
    //if (this.esAcumulable) {
    //this.alerta.eventos = configurarAlertaForm.eventos;
    //this.alerta.temporalidad = configurarAlertaForm.temporalidad;
    //}

    switch (this.tipoBase) {
      case TipoAlertaBase.AlertaZona:
        this.alerta.hdopdesde = configurarAlertaForm.hdopdesde;
        this.alerta.hdophasta = configurarAlertaForm.hdophasta;
        this.alerta.nsatelites = configurarAlertaForm.nsatelites;
        this.alerta.desde = configurarAlertaForm.desde;
        this.alerta.hasta = configurarAlertaForm.hasta;
        break;
      case TipoAlertaBase.AlertaRuta:
        this.alerta.desde = configurarAlertaForm.desde;
        this.alerta.hasta = configurarAlertaForm.hasta;

        break;
      case TipoAlertaBase.AlertaDetencionNoAutorizada:
        this.alerta.estadoIgnicion = configurarAlertaForm.estadoIgnicion;
        this.alerta.ignicionVelocidad = configurarAlertaForm.ignicionVelocidad;
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

    isCamposValidos = this.permitirContinuarConfigurarNotificaciones();

    if (isCamposValidos) {
      this.loadingService.showLoading();
      this.axios.http
        .put(`${this.Controller}/${this.tipoBase}`, this.alerta)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.editar', {
              entidad: 'Alerta',
              creadoA: 'guardada',
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
                this.$t('mensajes.mensajesError.editar', {
                  entidad: 'Alerta',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.editar', {
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

    this.estadoEntidad =
      this.pasos.configurarAlerta.formState.entity.estado ==
      EstadoEntidad.Activo
        ? true
        : false;
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
    } else if (tipoNotificacion == 2) {
      this.alerta.notificacionContacto = lstNotificacion;
    } else {
      this.alerta.notificacionUsuario = lstNotificacion;
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

  handleShowAsociarVehiculos(showAsociarVehiculos: boolean) {
    this.showAsociarVehiculos = showAsociarVehiculos;
  }

  /* Validacion */

  permitirContinuarConfigurarNotificaciones() {
    let nombre = this.pasos.configurarAlerta.formState.entity.nombre;
    this.tituloValidacion = 'Editar Alerta: ' + nombre;
    this.mensajeValidacion = 'Debe seleccionar:';
    this.itemsNoValidos = [];

    if (this.pasos.configurarAlerta.formState.entity.estado === 1) {
      if (!this.asociaciones.vehiculos.length && this.showAsociarVehiculos) {
        this.itemsNoValidos.push('Debe seleccionar al menos un Vehículo.');
      }

      if (
        this.alerta.notificacionListaDistribucion.length > 0 ||
        this.alerta.notificacionContacto.length > 0 ||
        this.alerta.notificacionUsuario.length > 0
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

      if (
        (this.tipoBase === 5 || this.tipoBase === 6) &&
        this.idsPlanesSeleccionados.length === 0
      ) {
        this.itemsNoValidos.push(
          'Debe seleccionar al menos un plan de mantenimiento.'
        );
      }

      if (this.itemsNoValidos.length > 0) {
        this.showValidacion = true;
        return false;
      }
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
        return false;
      } else if (this.alerta.zonas.length === 0) {
        this.tituloValidacion = 'Configurar Alerta';
        this.mensajeValidacion = 'Debe seleccionar al menos una Zona.';
        this.showValidacion = true;
        return false;
      } else if (!this.isValidCamposZonas) {
        if (this.camposZonaEmpty.length > 0) {
          this.tituloValidacion = 'Configurar Alerta';
          this.showValidacionLineal = true;
          return false;
        }
      }
    }

    return true;
  }

  handleAsociacionesChangeM(event: any) {
    this.asociaciones.vehiculos = event.vehiculos;
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

  handleCamposZonaEmpty(camposZonaEmpty: any) {
    this.camposZonaEmpty = [];
    if (
      this.tipoBase === TipoAlertaBase.AlertaZona ||
      this.tipoBase === TipoAlertaBase.AlertaRuta
    ) {
      camposZonaEmpty.velocidad == 0
        ? this.camposZonaEmpty.push('Velocidad en km/h')
        : '';

      camposZonaEmpty.tolerancia === 0 ||
      camposZonaEmpty.tolerancia === '' ||
      camposZonaEmpty.tolerancia === undefined
        ? this.camposZonaEmpty.push('Tolerancia en km/h')
        : '';

      (camposZonaEmpty.eventos == 0 || camposZonaEmpty.eventos === undefined) &&
      camposZonaEmpty.temporalidad == 0
        ? this.camposZonaEmpty.push('N° de Eventos o Temporalidad')
        : '';
    }
  }

  handlecamposDetencionNoAutorizadaEmpty(
    camposDetencionEmpty: ZonaAlertaGrillaDetencion
  ) {
    this.camposZonaEmpty = [];
    const alertaForm = this.pasos.configurarAlerta.formState.entity;

    if (alertaForm.estadoIgnicion) {
      camposDetencionEmpty.eventos === 0 ||
      camposDetencionEmpty.eventos === '0' ||
      camposDetencionEmpty.eventos === undefined
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
}
</script>

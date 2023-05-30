import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

// AlertaBasePostVm
export type typeConfigBase = {
  id?: number;
  nombre?: string;
  esAcumulable?: boolean;
  alertaBaseTipo?: number;
  mensaje?: string;
  scriptValidacionActividad?: string;
  scriptValidacionActividadExt?: string;
  htmlTemplate?: string;
  codigosActividad?: number[];
  codigosActividadExt?: number[];
  camposDinamico?: typeNuevosCampo[];
};

export type AlertasBaseBackend = {
  id?: number;
  nombre?: string;
  acumulable?: boolean;
  scriptActividad?: string;
  scriptActividadExt?: string;
  htmlBody?: string;
  mensaje?: string;
  estado?: number;
  estadoTxt?: string;
  baseTipo?: number;
  alertaCampoDinamico?: typeNuevosCampo[];
  alertaBaseCodigoActividad?: typeActividad[];
  alertaBaseDispositivo?: typeActividadEx[];
  usuarioCreadorTxt?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacionTxt?: string;
  fechaModificacion?: moment.Moment;
};

export type AlertasCliente = {
  id?: number;
  alertaId?: number;
  alertaConfigId?: number;
  parametroGeneral?: boolean;
  alertaBaseId?: number;
  color?: string;
  estado?: number;
  alertaBaseTipo?: number;
  fecha?: moment.Moment;
  fechaCreacion?: moment.Moment;
  tipoAlerta?: string;
  nombre?: string;
  mensaje?: string;
  desde?: moment.Moment;
  hasta?: moment.Moment;
  velMax?: number;
  tolerancia?: number;
  eventos?: number;
  temporalidad?: number;
  estadoIgnicion?: boolean;
  ignicionVelocidad?: number;
  //zonas?: ZonaAlerta[];
  //campoDinamico?: CampoDinamico[];
  //usoNoAutorizado?: UsoNoAutorizado[];
  flotasId?: number[];
  vehiculosId?: number[];
  etiquetasId?: number[];
  notificaGps?: boolean;
  notificaBrowser?: boolean;
  notificaEmail?: boolean;
  notificacionListaDistribucion?: number[];
  notificacionContacto?: number[];
  notificacionCalendario?: number[];
  kilometrosMenor?: number;
  horasMotorMenor?: number;
  tiempoMenor?: number;
  unidadMedidaTiempo?: number;
  planesMantenimientoId?: number[];
  tiempoDetencion?: number;
  notificacionUsuario?: number[];
  longitudInicioExceso?: number;
  longitudFinExceso?: number;
  latitudInicioExceso?: number;
  latitudFinExceso?: number;
  velocidadActual?: number;
  flota?: string;
  fechaActFin?: moment.Moment;
  horometro?: number;
  kmAcumulados?: number;
  minutos?: number;
  zona?: string;
  actividad?: {
    velocidadMaxima?: number;
    geocerca?: string;
    fechaActividad?: moment.Moment;
    distanciaAcumulada?: number;
    ubicacion?: string;
    heading?: number;
    conductor?: number;
  };
  conductor?: {
    id?: number;
    nombre?: string;
  };
  velocidadMaxima?: number;
};

// AlertaBase/GetTipoActividad
export type typeActividad = {
  id?: number;
  tipoEvento?: string;
  imagen?: string;
  usuarioCreadorId?: number;
  fechaCreacion?: string;
  usuarioModificacionId?: number;
  fechaModificacion?: string;
  actividades?: string[];
  alertaBaseId?: number;
  actividadTipoId?: number;
  actividadTipoTxt?: string;
  estado?: number;
};

// AlertaBase/GetTipoActividadExt
export type typeActividadEx = {
  id?: number;
  codigo?: number;
  tipoEvento?: string;
  fechaCreacion?: string;
  fechaModificacion?: number;
  alertaBaseId?: number;
  dispositivoId: number;
  dispositivoTxt: string;
  estado: number;
};

//GetTipoCampo
export type typeTipoCampo = {
  id?: number;
  campo?: string;
};

//  Nuevos campos
export type typeNuevosCampo = {
  id?: number;
  codigoCampo?: string;
  tipoCampo?: number;
  descripcionCampo?: string;
  regExp?: string;
  valor?: string;
  requerido?: boolean;
  mensajeErrorFormato?: string;
};

export const makepasosAlertasBaseCrear = (): PasosCrud => ({
  seleccionarCodigos: {
    accion: 'Crear - Seleccionar Códigos',
    visible: true,
    step: 1,
    title: 'Seleccionar Códigos',
    icon: '',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 59,
    codigoAccionPadre: 2,
  },
  agregarCampos: {
    accion: 'Crear - Agregar Campos',
    visible: true,
    step: 2,
    title: 'Agregar Campos',
    icon: '',
    codigoSubAccion: 60,
    codigoAccionPadre: 2,
  },
  scriptValidacionExtendida: {
    accion: 'Crear - Script Validacion Actividad Extendida',
    visible: true,
    step: 3,
    title: 'Script Validación',
    icon: '',
    codigoSubAccion: 62,
    codigoAccionPadre: 2,
  },
  htmlTemplate: {
    accion: 'Crear - HTML Template',
    visible: true,
    step: 4,
    title: 'HTML Template',
    icon: '',
    codigoSubAccion: 76,
    codigoAccionPadre: 2,
  },
});

export const makeAlertasBaseEditar = (): PasosCrud => ({
  seleccionarCodigos: {
    accion: 'Editar - Seleccionar Códigos',
    visible: true,
    step: 1,
    title: 'Seleccionar Código',
    icon: 'code',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 59,
    codigoAccionPadre: 3,
  },
  agregarCampos: {
    accion: 'Editar - Agregar Campos',
    visible: true,
    step: 2,
    title: 'Agregar Campos',
    icon: 'text_fields',
    codigoSubAccion: 60,
    codigoAccionPadre: 3,
  },
  scriptValidacionExtendida: {
    accion: 'Editar - Script Validacion Actividad Extendida',
    visible: true,
    step: 3,
    title: 'Script Validación',
    icon: 'spellcheck',
    codigoSubAccion: 62,
    codigoAccionPadre: 3,
  },
  htmlTemplateAccion: {
    accion: 'Editar - HTML Template',
    visible: true,
    step: 4,
    title: 'HTML Template',
    icon: 'description',
    codigoSubAccion: 76,
    codigoAccionPadre: 3,
  },
});

export const makeAlertasBaseVerDetalle = (): PasosCrud => ({
  seleccionarCodigos: {
    accion: 'Ver Detalle - Seleccionar Códigos',
    visible: true,
    step: 1,
    title: 'Seleccionar Código',
    icon: 'code',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 59,
    codigoAccionPadre: 4,
  },
  agregarCampos: {
    accion: 'Ver Detalle - Agregar Campos',
    visible: true,
    step: 2,
    title: 'Agregar Campos',
    icon: 'text_fields',
    codigoSubAccion: 60,
    codigoAccionPadre: 4,
  },
  scriptValidacionExtendida: {
    accion: 'Ver Detalle - Script Validacion Actividad Extendida',
    visible: true,
    step: 3,
    title: 'Script Validación',
    icon: 'spellcheck',
    codigoSubAccion: 62,
    codigoAccionPadre: 4,
  },
  htmlTemplateAccion: {
    accion: 'Ver Detalle - HTML Template',
    visible: true,
    step: 4,
    title: 'HTML Template',
    icon: 'description',
    codigoSubAccion: 76,
    codigoAccionPadre: 4,
  },
});

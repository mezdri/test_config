import moment from 'moment';
export type RouteViews = 'all' | 'completed' | 'active';

export interface AlertasInterface {
  id?: number;
  nombre?: string;
  estado?: number;
  color?: string;
  alertaTipoId?: number;
  alertaTipo?: any;

  flotaIds?: number[];
  etiquetaIds?: number[];
  vehiculoIds?: number[];
  zonaIds?: number[];

  alertaConfiguracionVelocidad?: VelocidadMaximaInterface;
  temporalidad?: number;
  tipoConfiguracion?: number;
  cantidadEventos?: number;

  clienteId?: number;
  cliente?: any;

  alertaConfiguracionEnvioEmail?: AlertaMailInterface;
  alertaConfiguracionNotificacionUsuarioIds?: number[];
}

export interface AlertaMailInterface {
  id?: number;
  emailEnvio?: string;
  alertaConfiguracionId?: number;
}

export interface VelocidadMaximaInterface {
  id?: number;
  velocidadMaxima?: number;
  tolerancia?: number;
}

export interface AlertaBackend {
  id?: number;
  alertaBaseId?: number;
  alertaBaseTipo?: number;
  alertaTipo?: string;
  nombre?: string;
  color?: string;
  temporalidad?: number;
  cantidadEventos?: string;
  eventos?: number;
  estado?: number;
  estadoTxt?: string;
  usuarioCreadorTxt?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacionTxt?: string;
  fechaModificacion?: moment.Moment;
  campoDinamico?: CampoDinamico[];
  usoNoAutorizado?: UsoNoAutorizado[];
  zonas?: ZonaAlerta[];
  desde?: moment.Moment;
  hasta?: moment.Moment;
  parametroGeneral?: boolean;
  velMax?: number;
  estadoIgnicion?: boolean;
  ignicionVelocidad?: number;
  tolerancia?: number;
  vehiculosId?: number[];
  flotasId?: number[];
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
  hdopdesde?: number;
  hdophasta?: number;
  nsatelites?: number;
}

export interface CampoDinamico {
  id?: number;
  alertaCampoDinamicoId?: number;
  valorCampoDinamico?: string;
  alertaConfigId?: number;
}

export interface UsoNoAutorizado {
  id?: number;
  dia?: number;
  horaInicio?: string;
  horaFin?: string;
}

export interface ZonaAlerta {
  id?: number;
  coordenadaId?: number;
  eventos?: number;
  temporalidad?: number;
  velocidad?: number;
  tolerancia?: number;
  tiempoDetencion?: number;
  hdopdesde?: number;
  hdophasta?: number;
  nsatelites?: number;
}

export interface ZonaRow {
  id: number;
  nombre: string;
  tipoZonaId: number;
  tipoZonaNombre: string;
  velocidad?: number;
  tolerancia?: number;
  eventos?: number;
  temporalidad?: number;
  tiempoDetencion?: number;
  hdopdesde?: number;
  hdophasta?: number;
  nsatelites?: number;
}

export interface TipoNotificacion {
  id: number;
  nombre: string;
  tipo: string;
}

export interface AlertaVehiculo {
  alertaId?: number;
  alertaConfigId?: number;
  alertaBaseId?: number;
  color?: string;
  fecha?: moment.Moment;
  fechaCreacion?: moment.Moment;
  tipoAlerta?: string;
  nombre?: string;
  mensaje?: string;
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
}

export interface ZonaAlertaGrillaDetencion {
  id?: number;
  coordenadaId?: number;
  eventos?: string | number;
  temporalidad?: string | number;
  velocidad?: number;
  tolerancia?: number;
  tiempoDetencion?: string | number;
}

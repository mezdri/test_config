import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

export interface ContratoProveedorBackend {
  id?: number;
  estado?: number;
  nombre?: string;
  proveedorId?: number;
  proveedor?: string;
  tiempoMin?: number;
  tiempoMax?: number;
  cantidadBloque?: number;
  reintentos?: number;
  endpoint?: string;
  estadoTxt?: string;
  actividadTipos?: number[];
  dispositivos?: number[];
  filtros?: ScriptValidacion[];
  mapeosColumna?: ScriptValidacion[];
  cabecerasHttp?: CabeceraHttp[];
  mapeosBody?: MapeosBody[];
  contratoRespuesta?: string;
  usuarioCreacion?: string;
  fechaCreacionTxt?: string;
  usuarioModificacion?: string;
  fechaModificacionTxt?: string;
}

export interface ScriptValidacion {
  id?: number;
  nombre?: string;
  script?: string;
}

export interface MapeosBody {
  id?: number;
  tipo?: string;
  script?: string;
}

export interface CabeceraHttp {
  id?: number;
  nombre?: string;
  script?: string;
}

/* Validacion Script */

export interface ScriptValidacionEndpoint {
  script: string;
  metadata: Metadata;
}

export interface Metadata {
  usuario: string;
  password: string;
  endpoint: string;
}

export interface ScriptValidacionCampos {
  nombre?: string;
  tipo?: string;
  script: string;
  ejemplos: string[];
}

export interface ScriptValidacionRespuesta {
  script: string;
  ejemplos: EjemplosValidacionRespuesta[];
}

export interface EjemplosValidacionRespuesta {
  status: string;
  headers?: Headers[];
  body?: string;
}

export interface Headers {
  nombre: string;
  valor?: string;
}

export interface EvaluacionScriptResponse {
  evaluaciones?: Evaluaciones[];
}

export interface Evaluaciones {
  estado?: string;
  respuesta?: string;
}

export const makePasos = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Configurar Alerta',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    //codigoSubAccion: 40,
    //codigoAccionPadre: CodigoAccion.Crear,
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
  tiposActividad: {
    accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 2,
    title: 'Tipos de Act.',
    icon: 'description',
    //codigoSubAccion: 41,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
  asociarDispositivos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 3,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    //codigoSubAccion: 42,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
  cabecerasHTTP: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 4,
    title: 'Cabeceras HTTP',
    icon: 'http',
    //codigoSubAccion: 42,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
  filtrosActividad: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 5,
    title: 'Filtro de Act.',
    icon: 'filter_list',
    //codigoSubAccion: 42,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
  mapeoColumna: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 6,
    title: 'Mapeo de Columna',
    icon: 'compare_arrows',
    //codigoSubAccion: 42,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
  configuracionMapeos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 7,
    title: 'Conf. de Mapeos',
    icon: 'settings_applications',
    //codigoSubAccion: 42,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
  mapeoRespuesta: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 8,
    title: 'Mapeo de Respuesta',
    icon: 'dvr',
    //codigoSubAccion: 42,
    //codigoAccionPadre: CodigoAccion.Crear,
  },
});

export const makePasosCrear = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Configurar Alerta',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
  tiposActividad: {
    accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 2,
    title: 'Tipos de Act.',
    icon: 'description',
    codigoSubAccion: 80,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  asociarDispositivos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 3,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    codigoSubAccion: 78,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  cabecerasHTTP: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 4,
    title: 'Cabeceras HTTP',
    icon: 'http',
    codigoSubAccion: 81,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  filtrosActividad: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 5,
    title: 'Filtro de Act.',
    icon: 'filter_list',
    codigoSubAccion: 82,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  mapeoColumna: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 6,
    title: 'Mapeo de Columna',
    icon: 'compare_arrows',
    codigoSubAccion: 83,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  configuracionMapeos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 7,
    title: 'Conf. de Mapeos',
    icon: 'settings_applications',
    codigoSubAccion: 84,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  mapeoRespuesta: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 8,
    title: 'Mapeo de Respuesta',
    icon: 'dvr',
    codigoSubAccion: 85,
    codigoAccionPadre: CodigoAccion.Crear,
  },
});

export const makePasosEditar = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Configurar Alerta',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
  tiposActividad: {
    accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 2,
    title: 'Tipos de Act.',
    icon: 'description',
    codigoSubAccion: 80,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  asociarDispositivos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 3,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    codigoSubAccion: 78,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  cabecerasHTTP: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 4,
    title: 'Cabeceras HTTP',
    icon: 'http',
    codigoSubAccion: 81,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  filtrosActividad: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 5,
    title: 'Filtro de Act.',
    icon: 'filter_list',
    codigoSubAccion: 82,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  mapeoColumna: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 6,
    title: 'Mapeo de Columna',
    icon: 'compare_arrows',
    codigoSubAccion: 83,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  configuracionMapeos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 7,
    title: 'Conf. de Mapeos',
    icon: 'settings_applications',
    codigoSubAccion: 84,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  mapeoRespuesta: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 8,
    title: 'Mapeo de Respuesta',
    icon: 'dvr',
    codigoSubAccion: 85,
    codigoAccionPadre: CodigoAccion.Editar,
  },
});

export const makePasosVerDetalle = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Configurar Alerta',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
  tiposActividad: {
    accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
    visible: true,
    step: 2,
    title: 'Tipos de Act.',
    icon: 'description',
    codigoSubAccion: 80,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  asociarDispositivos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 3,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    codigoSubAccion: 78,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  cabecerasHTTP: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 4,
    title: 'Cabeceras HTTP',
    icon: 'http',
    codigoSubAccion: 81,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  filtrosActividad: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 5,
    title: 'Filtro de Act.',
    icon: 'filter_list',
    codigoSubAccion: 82,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  mapeoColumna: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 6,
    title: 'Mapeo de Columna',
    icon: 'compare_arrows',
    codigoSubAccion: 83,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  configuracionMapeos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 7,
    title: 'Conf. de Mapeos',
    icon: 'settings_applications',
    codigoSubAccion: 84,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  mapeoRespuesta: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 8,
    title: 'Mapeo de Respuesta',
    icon: 'dvr',
    codigoSubAccion: 85,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
});

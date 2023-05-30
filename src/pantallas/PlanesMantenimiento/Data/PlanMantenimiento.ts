import { PautaActividadesMantenimiento } from '@/pantallas/ActividadesMantenimiento/ActividadMantenimiento';
import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { Calendario } from '@/pantallas/Calendarios/Calendario';
import { ListaDistribucion } from '@/pantallas/ListaDistribucion/ListaDistribucion';

export type PlanMantenimiento = {
  id: number;
  nombre: string;
  cantVehiculos: number;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  fechaCreacion: moment.Moment;
  usuarioCreacion: string;
  estado: boolean;
  estadoTxt: string;
  tipoMantenimientoId?: number;
  tipoMantenimientoNomb: string;
  totalAsociados: number;
  tipomantenimientotTxt: string;
};

export type PlanMantenimientoNueva = {
  id?: PlanMantenimiento['id'];
  nombre: PlanMantenimiento['nombre'];
  tipoMantenimientoId?: number;
  estado: PlanMantenimiento['estado'];
  notificaGps: boolean;
  notificaBrowser: boolean;
  notificaEmail: boolean;
  clienteId: number;
};

export type PautasPlanesMantenimiento = {
  id: number;
  frecuenciaKilometraje: number;
  frecuenciaHorasMotor: number;
  frecuenciaTiempo: number;
  tipoFrecuencia: number;
};

export type VehiculosPlanesMantenimiento = {
  id: number;
  unidad: string;
};

export type PlanMantenimientoAsociacion = PlanMantenimientoNueva & {
  idNotificacion?: number;
  pautas: PautasPlanesMantenimiento[];
  vehiculos: VehiculosPlanesMantenimiento[];
  contactos: number[];
  listasDistribucion: number[];
  usuarios: number[];
  calendarios: number[];
  medioNotificacion: number[];
};

export type PlanMantenimientoDetalle = {
  id: number;
  nombre: string;
  tipoMantenimientoId: number;
  tipoMantenimientoNomb: string;
  notificaGps: boolean;
  notificaBrowser: boolean;
  notificaEmail: boolean;
  pautas: PautasPlanesMantenimiento[];
  vehiculos: VehiculosPlanesMantenimiento[];
};

export type ListaDistribucionPlanMantenimiento = {
  id: number;
  nombre: string;
  tipo: string;
};

export type ContactosPlanMantenimiento = {
  id: number;
  nombre: string;
  tipo: string;
};

export type DistribucionPlanMantenimiento = {
  id: number;
  agGridId: string;
  nombre: string;
  tipo: string;
};

export type CalendarioPlanMantenimiento = {
  id: number;
  nombreCalendario: string;
  frecuencia: string;
  fechaInicio: moment.Moment;
  fechaFin: moment.Moment;
};

export type NotificacionPlanMantenimiento = {
  id?: number;
  idPlan?: number;
  contactos: number[];
  listaDistribuciones: number[];
  usuarios: number[];
  calendarios: number[];
};

export type NotificacionPlanMantenimientoDetalle = {
  id: number;
  contactos: ContactosPlanMantenimiento[];
  listaDistribuciones: ListaDistribucionPlanMantenimiento[];
  usuarios: any[];
  calendarios: Calendario[];
};

export const makePlanesPasosCrear = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 19,
    codigoAccionPadre: 2,
  },
  asociarPauta: {
    accion: 'Crear - Asociar Pauta y Frecuencia',
    visible: true,
    step: 2,
    title: 'Asociar Pauta y Frecuencia',
    icon: 'library_books',
    codigoSubAccion: 65,
    codigoAccionPadre: 2,
  },
  asociarFlotas: {
    accion: 'Crear - Asociar Flotas Etiquetas o Vehiculos',
    visible: true,
    step: 3,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 2,
  },
  configurarNotificacion: {
    accion: 'Crear - Configurar Notificación',
    visible: true,
    step: 4,
    title: 'Configurar Notificación',
    icon: 'notifications',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 66,
    codigoAccionPadre: 2,
  },
});

export const makePlanesPasosEditar = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 19,
    codigoAccionPadre: 3,
  },
  asociarPauta: {
    accion: 'Editar - Asociar Pauta y Frecuencia',
    visible: true,
    step: 2,
    title: 'Asociar Pauta y Frecuencia',
    icon: 'library_books',
    codigoSubAccion: 65,
    codigoAccionPadre: 3,
  },
  asociarFlotas: {
    accion: 'Editar - Asociar Flotas Etiquetas o Vehiculos',
    visible: true,
    step: 3,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 3,
  },
  configurarNotificacion: {
    accion: 'Editar - Configurar Notificación',
    visible: true,
    step: 4,
    title: 'Configurar Notificación',
    icon: 'notifications',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 66,
    codigoAccionPadre: 3,
  },
});

export const makePlanesPasosVerDetalle = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 19,
    codigoAccionPadre: 4,
  },
  asociarPauta: {
    accion: 'Ver Detalle - Asociar Pauta y Frecuencia',
    visible: true,
    step: 2,
    title: 'Asociar Pauta y Frecuencia',
    icon: 'library_books',
    codigoSubAccion: 65,
    codigoAccionPadre: 4,
  },
  asociarFlotas: {
    accion: 'Ver Detalle - Asociar Flotas Etiquetas o Vehiculos',
    visible: true,
    step: 3,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 4,
  },
  configurarNotificacion: {
    accion: 'Ver Detalle - Configurar Notificación',
    visible: true,
    step: 4,
    title: 'Configurar Notificación',
    icon: 'notifications',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 66,
    codigoAccionPadre: 4,
  },
});

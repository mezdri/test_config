import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export type Preventiva = {
  id: number;
  unidad: string;
  nombrePlanMantenimiento: string;
  estado: string;
  vehiculoMantenimientoId: number;
  tallerId: number;
  responsable: string;
  fechaIngreso: moment.Moment;
  fechaSalida: moment.Moment;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: moment.Moment;
  mantenimientoPlanMantenimientoId: number;
  mantenimientoPautaActividadId: number;
  mantenimientoActividadMantId?: number[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  nombreFlota?: string;
  nombrePautaActividad: string;
  estadoPlanMantenimientoText: string;
};

export type PreventivaNuevo = {
  id: number;
  vehiculoMantenimientoId: number;
  tallerId: number;
  responsable: string;
  fechaIngreso: moment.Moment;
  fechaSalida: moment.Moment;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: moment.Moment;
  mantenimientoPlanMantenimientoId: number;
  mantenimientoPautaActividadId: number;
  mantenimientoActividadMantId: number[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
};

export type Actividad = {
  id: number;
  nombre: string;
};

export const makePreventivaPasos = (): PasosCrud => ({
  seleccionarVehiculo: {
    accion: 'Crear - Seleccionar Vehículo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'directions_car',
  },
  registrarInformacion: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'assignment',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
  },
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 3,
    title: 'Asociar Actividades',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'library_books',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
  },
});

export const makePreventivaPasosCrear = (): PasosCrud => ({
  seleccionarVehiculo: {
    accion: 'Crear - Seleccionar Vehículo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: 'directions_car',
    codigoSubAccion: 73,
    codigoAccionPadre: 87,
  },
  registrarInformacion: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    icon: 'assignment',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
    codigoSubAccion: 74,
    codigoAccionPadre: 87,
  },
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 3,
    title: 'Asociar Actividades',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'library_books',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
    codigoSubAccion: 55,
    codigoAccionPadre: 87,
  },
});

export const makePreventivaPasosEditar = (): PasosCrud => ({
  registrarInformacion: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 1,
    title: 'Registrar Información',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'assignment',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
    codigoSubAccion: 74,
    codigoAccionPadre: 3,
  },
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 2,
    title: 'Asociar Actividades',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'library_books',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
    codigoSubAccion: 55,
    codigoAccionPadre: 3,
  },
});

export const makePreventivaPasosVerDetalle = (): PasosCrud => ({
  seleccionarVehiculo: {
    accion: 'Crear - Seleccionar Vehículo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: 'directions_car',
    codigoSubAccion: 73,
    codigoAccionPadre: 4,
  },
  registrarInformacion: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    icon: 'assignment',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
    codigoSubAccion: 74,
    codigoAccionPadre: 4,
  },
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 3,
    title: 'Asociar Actividades',
    icon: 'library_books',
    formState: {
      entity: null,
      validator: null,
      isDirty: null,
    },
    codigoSubAccion: 55,
    codigoAccionPadre: 4,
  },
});

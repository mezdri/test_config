import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export type CorrectivaGrid = {
  id: number;
  nombre: string;
  costoHH: number;
  costoInsum: number;
  unidad: string;
  flota: string;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  fechaCreacion: moment.Moment;
  usuarioCreacion: string;
  estado: string;
};

export type Correctiva = {
  id: number;
  nombre: string;
  vehiculoId: number;
  taller: number;
  responsable: number;
  fechaIngreso: moment.Moment;
  fechaSalida: moment.Moment;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: moment.Moment;
  actividades: ActividadesCorrectivas[];
  actividadesExtras: string;
  horasHombre: number;
  costoHoraHombre: number;
  costoInsumos: number;
};

export type ActividadesCorrectivas = {
  id: number;
  nombreActividad: string;
};

export type TallerCorrectivas = {};

export const makeCorrectivaPasos = (): PasosCrud => ({
  asociarVehiculos: {
    accion: 'Crear - Asociar Vehiculos',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: 'directions_car',
  },
  registrarMantenimientoCorrectivo: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    icon: 'description',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
});

export const makeCorrectivaPasosCrear = (): PasosCrud => ({
  asociarVehiculos: {
    accion: 'Crear - Asociar Vehiculos',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: 'directions_car',
    codigoSubAccion: 73,
    codigoAccionPadre: 87,
  },
  registrarMantenimientoCorrectivo: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    icon: 'description',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 75,
    codigoAccionPadre: 87,
  },
});

export const makeCorrectivaPasosEditar = (): PasosCrud => ({
  registrarMantenimientoCorrectivo: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    icon: 'description',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 75,
    codigoAccionPadre: 3,
  },
});

export const makeCorrectivaPasosVerDetalle = (): PasosCrud => ({
  asociarVehiculos: {
    accion: 'Crear - Asociar Vehiculos',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'directions_car',
    codigoSubAccion: 73,
    codigoAccionPadre: 4,
  },
  registrarMantenimientoCorrectivo: {
    accion: 'Crear - Registrar Información',
    visible: true,
    step: 2,
    title: 'Registrar Información',
    // TODO definir icono (usado en editar/ver detalle)
    icon: 'description',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 75,
    codigoAccionPadre: 4,
  },
});

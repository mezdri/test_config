import { PautasPlanesMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { PautaActividadesMantenimiento } from './../ActividadesMantenimiento/ActividadMantenimiento';
import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { EstadoInterface } from '@/interfaces/Estado';

export type PautaActividad = {
  id: number;
  nombrePauta: string;
  descripcion: string;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  fechaCreacion: moment.Moment;
  usuarioCreacion: string;
  estado: boolean;
  estadoTxt: string;
  tipoActividad: number;
};

export type PautaActividadDetalle = {
  id: number;
  nombrePauta: string;
  descripcion: string;
  estado: boolean;
  actividades: PautaActividadesMantenimiento[];
  planesMantenimiento: PautasPlanesMantenimiento[];
  existeUnicaPlanMant?: boolean;
  existeMant?: boolean;
};

export type PautaActividadDetalleGrid = {
  id: number;
  nombrePauta: string;
  descripcion: string;
  estado: boolean;
  actividades: PautaActividades[];
};

export type PautaActividades = {
  id: number;
  tipo: {
    id: number;
    nombre: string;
  };
};

export type PautaActividadNueva = {
  id?: PautaActividad['id'];
  nombrePauta: PautaActividad['nombrePauta'];
  descripcion: PautaActividad['descripcion'];
  estado: EstadoInterface;
  clienteId: number;
};

export type PautaActividadAsociacion = PautaActividadNueva & {
  actividades: PautaActividadesMantenimiento[];
  planes: PautasPlanesMantenimiento[];
};

export const makePautaPasosCrear = (): PasosCrud => ({
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
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 2,
    title: 'Asociar Actividades',
    icon: 'assignment',
    codigoSubAccion: 55,
    codigoAccionPadre: 2,
  },
  asociarPlanMantencion: {
    accion: 'Crear - Asociar plan de Mantención',
    visible: true,
    step: 3,
    title: 'Asociar Plan de Mantenimiento',
    icon: 'library_books',
    codigoSubAccion: 56,
    codigoAccionPadre: 2,
  },
});

export const makePautaPasosEditar = (): PasosCrud => ({
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
    codigoAccionPadre: 3,
  },
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 2,
    title: 'Asociar Actividades',
    icon: 'assignment',
    codigoSubAccion: 55,
    codigoAccionPadre: 3,
  },
  asociarPlanMantencion: {
    accion: 'Crear - Asociar plan de Mantención',
    visible: true,
    step: 3,
    title: 'Asociar Plan de Mantenimiento',
    icon: 'library_books',
    codigoSubAccion: 56,
    codigoAccionPadre: 3,
  },
});

export const makePautaPasosVerDetalle = (): PasosCrud => ({
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
    codigoAccionPadre: 4,
  },
  asociarActividades: {
    accion: 'Crear - Asociar Actividades',
    visible: true,
    step: 2,
    title: 'Asociar Actividades',
    icon: 'assignment',
    codigoSubAccion: 55,
    codigoAccionPadre: 4,
  },
  asociarPlanMantencion: {
    accion: 'Crear - Asociar plan de Mantención',
    visible: true,
    step: 3,
    title: 'Asociar Plan de Mantenimiento',
    icon: 'library_books',
    codigoSubAccion: 56,
    codigoAccionPadre: 4,
  },
});

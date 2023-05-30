import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import moment from 'moment';

export type FuncionGlobal = {
  id?: number;
  nombre: string;
  script: string;
  estado: string;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  usuarioCreador?: string;
  usuarioModifica?: string;
  estadoTxt: string;
};

export const makeFuncionGlobalPasosCrear = (): PasosCrud => ({
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
});

export const makeFuncionGlobalPasosEditar = (): PasosCrud => ({
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
});

export const makeFuncionGlobalPasosVerDetalle = (): PasosCrud => ({
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
});

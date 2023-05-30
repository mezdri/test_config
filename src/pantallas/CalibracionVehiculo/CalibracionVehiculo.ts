import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export type CalibracionVehiculo = {
  id?: number;
  unidadVehiculo?: string;
  fecha: moment.Moment;
  fechaS?: string;
  hora?: moment.Moment;
  odometro?: number;
  odometroPlataforma?: number;
  horasMotor?: number;
  horasMotorPlataforma?: number;
  vehiculoId?: number;
  usuarioCreador?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  estado?: number;
  fechaCreacionTxt?: string;
  fechaModificacionTxt?: string;
};

export type UltimaCalibracion = {
  fecha: moment.Moment;
  valor: number;
};

export const makeOdometroCrear = (): PasosCrud => ({
  buscarVehiculo: {
    accion: 'Crear - Buscar Vehiculo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: '',
    codigoSubAccion: 63,
    codigoAccionPadre: 86,
  },
  informacionRecalibracion: {
    accion: 'Crear - Informacion Recalibracion',
    visible: true,
    step: 2,
    title: 'Información Recalibración',
    icon: '',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 64,
    codigoAccionPadre: 86,
  },
});

export const makeHorometroCrear = (): PasosCrud => ({
  buscarVehiculo: {
    accion: 'Crear - Buscar Vehiculo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: '',
    codigoSubAccion: 63,
    codigoAccionPadre: 86,
  },
  informacionRecalibracion: {
    accion: 'Crear - Informacion Recalibracion',
    visible: true,
    step: 2,
    title: 'Información Recalibración',
    icon: '',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 64,
    codigoAccionPadre: 86,
  },
});

export const makeOdometroVerDetalle = (): PasosCrud => ({
  buscarVehiculo: {
    accion: 'Crear - Buscar Vehiculo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: 'directions_car',
    codigoSubAccion: 63,
    codigoAccionPadre: 4,
  },
  informacionRecalibracion: {
    accion: 'Crear - Informacion Recalibracion',
    visible: true,
    step: 2,
    title: 'Información Recalibración',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 64,
    codigoAccionPadre: 4,
  },
});

export const makeHorometroVerDetalle = (): PasosCrud => ({
  buscarVehiculo: {
    accion: 'Crear - Buscar Vehiculo',
    visible: true,
    step: 1,
    title: 'Seleccionar Vehículo',
    icon: 'directions_car',
    codigoSubAccion: 63,
    codigoAccionPadre: 4,
  },
  informacionRecalibracion: {
    accion: 'Crear - Informacion Recalibracion',
    visible: true,
    step: 2,
    title: 'Información Recalibración',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 64,
    codigoAccionPadre: 4,
  },
});

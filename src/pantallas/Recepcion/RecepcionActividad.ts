import moment from 'moment';
import { ProveedorGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { ClienteProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { EstadoEntidad } from '@/reusable/Data/EstadoEntidad';

export type RecepcionActividad = {
  id: number;
  proveedor: ProveedorGps;
  clienteProveedor: ClienteProveedorGps;
  login: string;
  password: string;
  passwordOfuscado?: string;
  fechaInicio: moment.Moment;
  fechaTermino: moment.Moment;
  intervaloTransmiciones: number;
  numeroRegistrosPorBloque: number;
  estado: EstadoEntidad;
  estadoTxt: string;
  usuarioCreacion: string;
  fechaCreacion: moment.Moment;
  usuarioModificacion: string;
  fechaModificacion: moment.Moment;
  nombreProveedorText?: string;
  nombreClienteProveedorText?: string;
};

export const makeRecepcionActividadPasosCrear = (): PasosCrud => ({
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
  asociarVehiculos: {
    accion: 'Crear - Asociar Vehículos',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 2,
  },
});

export const makeRecepcionActividadPasosEditar = (): PasosCrud => ({
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
  asociarVehiculos: {
    accion: 'Crear - Asociar Vehículos',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 3,
  },
});

export const makeRecepcionActividadPasosVerDetalle = (): PasosCrud => ({
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
  asociarVehiculos: {
    accion: 'Crear - Asociar Vehículos',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 4,
  },
});

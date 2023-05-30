import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import moment from 'moment';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

export interface Envio {
  id?: number;
  proveedor?: string;
  proveedorId?: number;
  clienteProveedor?: string;
  clienteProveedorId?: number;
  contratoNombre?: string;
  contratoId?: number;
  usuario?: string;
  password?: string;
  endpoint?: string;
  fechaIni?: moment.Moment;
  fechaFin?: moment.Moment;
  apiKey?: string;
  estado?: number;
  estadoTxt?: string;
  flotas?: number[];
  etiquetas?: number[];
  vehiculos?: number[];
  usuarioCreacion?: string;
  fechaCreacion?: moment.Moment;
  fechaCreacionTxt?: string;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  fechaModificacionTxt?: string;
  ultimoEnvio?: moment.Moment;
}

export interface EnvioBackend {
  id?: number;
  proveedor?: string;
  proveedorId?: number;
  clienteProveedor?: string;
  clienteProveedorId?: number;
  contratoNombre?: string;
  contratoId?: number;
  usuario?: string;
  password?: string;
  endpoint?: string;
  fechaIni?: string;
  fechaFin?: string;
  apiKey?: string;
  estado?: number;
  estadoTxt?: string;
  flotas?: number[];
  etiquetas?: number[];
  vehiculos?: number[];
  usuarioCreacion?: string;
  fechaCreacion?: moment.Moment;
  fechaCreacionTxt?: string;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  fechaModificacionTxt?: string;
  ultimoEnvio?: moment.Moment;
}

export const makePasos = (): PasosCrud => ({
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
  asociarVehiculos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 2,
    title: 'Asociar Vehiculos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.Crear,
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
  asociarVehiculos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
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
  asociarVehiculos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
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
  asociarVehiculos: {
    accion: 'Crear - Configurar Notificaciones',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
});

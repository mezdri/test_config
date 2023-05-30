import moment from 'moment';
import { Giro } from '@/pantallas/Proveedor/Giro';
import { Proveedor } from '@/pantallas/Proveedor/Proveedor';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

export type ClienteProveedor = {
  id?: number;
  rut?: string;
  nombre?: string;
  direccion?: string;
  comercialNombre?: string;
  comercialTelefono?: string;
  comercialEmail?: string;
  tecnicoNombre?: string;
  tecnicoTelefono?: string;
  tecnicoEmail?: string;
  estado?: number;
  idGiro?: number;
  giro?: Giro;
  usuarioCreador?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  proveedorVm?: Proveedor[];
  proveedorId?: number[];
};

export const makeClienteProveedorPasos = (): PasosCrud => ({
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
  },
  asociarClienteProveedor: {
    accion: 'Crear - Asociar Cliente Proveedor ',
    visible: true,
    step: 2,
    title: 'Asociar Proveedor de GPS',
    icon: 'group_add',
  },
});

export const makeClienteProveedorPasosEditar = (): PasosCrud => ({
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
    codigoAccionPadre: CodigoAccion.Editar,
  },
  asociarClienteProveedor: {
    accion: 'Crear - Asociar Cliente Proveedor ',
    visible: true,
    step: 2,
    title: 'Asociar Proveedor de GPS',
    icon: 'group_add',
    codigoSubAccion: 69,
    codigoAccionPadre: CodigoAccion.Editar,
  },
});

export const makeClienteProveedorPasosVerDetalle = (): PasosCrud => ({
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
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
  asociarClienteProveedor: {
    accion: 'Crear - Asociar Cliente Proveedor ',
    visible: true,
    step: 2,
    title: 'Asociar Proveedor de GPS',
    icon: 'group_add',
    codigoSubAccion: 69,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  },
});

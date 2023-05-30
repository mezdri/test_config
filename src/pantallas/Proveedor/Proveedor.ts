import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';
import moment from 'moment';
import { Giro } from '@/pantallas/Proveedor/Giro';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export type Proveedor = {
  id?: number;
  rut?: string;
  nombre?: string;
  giroId?: number;
  giroText?: string;
  direccion?: string;
  tecnicoNombre?: string;
  tecnicoTelefono?: string;
  tecnicoEmail?: string;
  comercialNombre?: string;
  comercialTelefono?: string;
  comercialEmail?: string;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  estadoTxt?: string;
  usuarioCreador?: string;
  fechaCreacionTxt?: string;
  usuarioModifica?: string;
  fechaModificacionTxt?: string;
  giro?: Giro;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  clienteProveedorVm?: ClienteProveedor[];
  clienteProveedorId?: number[];
};

export const makeProveedorPasosCrear = (): PasosCrud => ({
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
  asociarClienteProveedor: {
    accion: 'Crear - Asociar Proveedor ',
    visible: true,
    step: 2,
    title: 'Asociar Cliente Proveedor de GPS',
    icon: 'group_add',
    codigoSubAccion: 68,
    codigoAccionPadre: 2,
  },
});

export const makeProveedorEditar = (): PasosCrud => ({
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
  asociarProveedor: {
    accion: 'Editar - Asociar Proveedor ',
    visible: true,
    step: 2,
    title: 'Asociar Cliente Proveedor de GPS',
    icon: 'group_add',
    codigoSubAccion: 68,
    codigoAccionPadre: 3,
  },
});

export const makeProveedorVerDetalle = (): PasosCrud => ({
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
  asociarProveedor: {
    accion: 'Ver Detalle - Asociar Proveedor ',
    visible: true,
    step: 2,
    title: 'Asociar Cliente Proveedor de GPS',
    icon: 'group_add',
    codigoSubAccion: 68,
    codigoAccionPadre: 4,
  },
});

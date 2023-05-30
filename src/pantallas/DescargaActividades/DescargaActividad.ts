import {
  GenericPasoCrud,
  PasosCrud,
} from '@/reusable/Mantenedor/mantenedorUtils';
import { EstadoEntidad } from '@/reusable/Data/EstadoEntidad';
import { ProveedorGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { ClienteProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import moment from 'moment';
import { DescargaActividadForm } from '@/pantallas/DescargaActividades/crud/DescargaActividadForm';

export type DescargaActividad = {
  id: number;

  // Registro de Creación / Modificación
  creacion: {
    fecha: moment.Moment;
    usuario: string;
  };
  modificacion: {
    fecha: moment.Moment;
    usuario: string;
  };

  // Información general
  estado: EstadoEntidad;
  proveedor: Pick<ProveedorGps, 'id' | 'nombre'>;
  clienteProveedor: Pick<ClienteProveedorGps, 'id' | 'nombre'>;
  usuario: string;
  password: string;
  fechaInicio: moment.Moment;
  fechaTermino: moment.Moment;
  maximoPeticionesDia: number;
  maximoPeticionesHora: number;
  maximoRegistrosBloque: number;

  // Vehículos
  flotasId: number[];
  etiquetasId: number[];
  vehiculosId: number[];

  tiposActividadId: number[];
  dispositivosId: number[];
  camposId: number[];
};

export type DescargaActividadParcial = Pick<
  DescargaActividad,
  | 'proveedor'
  | 'clienteProveedor'
  | 'fechaInicio'
  | 'fechaTermino'
  | 'id'
  | 'maximoPeticionesDia'
  | 'maximoPeticionesHora'
  | 'maximoRegistrosBloque'
  | 'estado'
  | 'usuario'
  | 'creacion'
  | 'modificacion'
>;

export type DescargaActividadGrid = {
  id: number;
  fechaCreacion: moment.Moment;
  usuarioCreacion: string;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  estadoNombre: string;
  proveedorNombre: string;
  clienteProveedorNombre: string;
  usuario: string;
  password: string;
  fechaInicio: moment.Moment;
  fechaTermino: moment.Moment;
  maximoPeticionesDia: number;
  maximoPeticionesHora: number;
  maximoRegistrosBloque: number;
};

interface DescargaActividadPasosCrud extends PasosCrud {
  informacionGeneral: GenericPasoCrud<DescargaActividadForm>;
}

export const makeDescargaActividadPasosCrear = (): DescargaActividadPasosCrud => ({
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
      hasErrors: false,
    },
    codigoSubAccion: 19,
    codigoAccionPadre: 2,
  },
  asociarVehiculos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 2,
  },
  asociarActividades: {
    accion: 'Crear - Información General',
    visible: true,
    step: 3,
    title: 'Asociar Actividades',
    icon: 'library_books',
    codigoSubAccion: 55,
    codigoAccionPadre: 2,
  },
  asociarDispositivos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 4,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    codigoSubAccion: 78,
    codigoAccionPadre: 2,
  },
  seleccionarCampos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 5,
    title: 'Seleccionar Campos',
    icon: 'check',
    codigoSubAccion: 79,
    codigoAccionPadre: 2,
  },
});

export const makeDescargaActividadPasosEditar = (): DescargaActividadPasosCrud => ({
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
      hasErrors: false,
    },
    codigoSubAccion: 19,
    codigoAccionPadre: 3,
  },
  asociarVehiculos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 3,
  },
  asociarActividades: {
    accion: 'Crear - Información General',
    visible: true,
    step: 3,
    title: 'Asociar Actividades',
    icon: 'library_books',
    codigoSubAccion: 55,
    codigoAccionPadre: 3,
  },
  asociarDispositivos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 4,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    codigoSubAccion: 78,
    codigoAccionPadre: 3,
  },
  seleccionarCampos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 5,
    title: 'Seleccionar Campos',
    icon: 'check',
    codigoSubAccion: 79,
    codigoAccionPadre: 3,
  },
});

export const makeDescargaActividadPasosVerDetalle = (): DescargaActividadPasosCrud => ({
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
      hasErrors: false,
    },
    codigoSubAccion: 19,
    codigoAccionPadre: 4,
  },
  asociarVehiculos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 2,
    title: 'Asociar Vehículos',
    icon: 'directions_car',
    codigoSubAccion: 32,
    codigoAccionPadre: 4,
  },
  asociarActividades: {
    accion: 'Crear - Información General',
    visible: true,
    step: 3,
    title: 'Asociar Actividades',
    icon: 'library_books',
    codigoSubAccion: 55,
    codigoAccionPadre: 4,
  },
  asociarDispositivos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 4,
    title: 'Asociar Dispositivos',
    icon: 'smartphone',
    codigoSubAccion: 78,
    codigoAccionPadre: 4,
  },
  seleccionarCampos: {
    accion: 'Crear - Información General',
    visible: true,
    step: 5,
    title: 'Seleccionar Campos',
    icon: 'check',
    codigoSubAccion: 79,
    codigoAccionPadre: 4,
  },
});

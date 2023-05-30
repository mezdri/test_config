import { number } from 'yup';

export type RouteViews = 'all' | 'completed' | 'active';

export interface IConductor {
  id?: number;
  clienteId?: number;
  conductorGrupoId?: number;
  rut?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  referencia?: string;
  idElectroctonico?: string;
  email?: string;
  telefono?: string;
  foto?: string;
  fechaNacimiento?: Date;
  fechaVencimientoRut?: Date;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  cantidadVehiculosAsociados?: number;
  codigoConductor?: string;
  fechaRenovacionDocumento?: Date;
  horasDisponibleConduccion?: number;
}

export interface IConductorGrupo {
  id?: number;
  clienteId?: number;
  nombre?: string;
  descripcion?: string;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
}

export interface IConductorLicencia {
  id?: number;
  conductorId?: number;
  licenciaTipoId?: number;
  fechaRenovacionDocumento?: Date;
  estado?: number;
}
export interface IConductorVehiculo {
  id?: number;
  conductorId?: number;
  vehiculoId?: number;
  fechaInicialAsignacion?: string;
  fechaFinalAsignacion?: string;
}
export interface IConductorFile {
  id?: number;
  ConductorFile?: FormData;
}

export interface TipoNotificacion {
  id: number;
  nombre: string;
  tipo: string;
}

export interface IConductorCopiloto {
  id?: number;
  estado?: number;
  password?: string;
  sms?: boolean;
  email?: boolean;
  whatsApp?: boolean;
  usuarios?: number[];
  contactos?: number[];
  listaDistribucion?:number[];

}

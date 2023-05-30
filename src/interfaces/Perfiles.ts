import { RolesInterface } from '@/interfaces/Roles';
import { EstadoEntidad } from '../config/enums';

export type RouteViews = 'all' | 'completed' | 'active';

export interface PerfilesInterface {
  id?: number;
  nombre?: string;
  estado?: EstadoEntidad;
  clienteId?: number;
  perfilRoles?: PerfilRolInterface[];
  perfilUsuarios?: PerfilUsuarioInterface[];
  usuarios?: UsuariosInterface[];
  roles?: RolesInterface[];
  checked?: boolean;
  estadoTxt?: string;
}

export interface PerfilRolInterface {
  id?: number;
  perfilId?: number;
  rolId?: number;
  nombreRol?: string;
  fechaInicioAsociacion?: Date;
  fechaFinAsociacion?: Date;
}

export interface PerfilUsuarioInterface {
  id?: number;
  perfilId?: number;
  usuarioId?: number;
  fechaInicioAsociacion?: Date;
  fechaFinAsociacion?: Date;
}

export interface UsuariosInterface {
  id?: number;
  nombreUsuario?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rut?: string;
  email?: string;
  direccion?: string;
  telefono?: string;
  fechaNacimiento?: Date;
}

export interface RolInterface {
  id?: number;
  nombre?: string;
  estado?: string;
}

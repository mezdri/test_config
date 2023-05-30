export type RouteViews = 'all' | 'completed' | 'active';

export interface LoginInterface {
  email: string;
  password: string;
}

export interface RegistroInterface {
  id?: number;
  nombreUsuario?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rut?: string;
  email?: string;
  direccion?: string;
  telefono?: string;
  contrasena?: string;
  fechaNacimiento?: Date;
}

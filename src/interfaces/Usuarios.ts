import { EstadoEntidad, TipoUsuario } from '../config/enums';
export type RouteViews = 'all' | 'completed' | 'active';

export interface UsuariosInterface {
  id?: number;
  rut?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  direccion?: string;
  email?: string;
  fechaNacimiento?: Date;
  fechaInicioVigencia?: Date;
  telefonoFijo?: string;
  telefonoParticular?: string;
  estado?: EstadoEntidad;
  tipo?: TipoUsuario;
  checked?: boolean;
  NombreCompleto?: string;
  estadoTxt?: string;
  fechaNacimientoTxt?: string;
  fechaUltActualizacionContraseña?: Date;
  homePath?: string;
}

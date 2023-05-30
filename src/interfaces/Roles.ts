import { EstadoEntidad, TipoRol } from '../config/enums';
export type RouteViews = 'all' | 'completed' | 'active';

export interface RolesInterface {
  id?: number;
  name?: string;
  estado?: EstadoEntidad;
  tipo?: TipoRol;
  estadoTxt?: string;
  tipoTxt?: string;
  homes?: string;
}

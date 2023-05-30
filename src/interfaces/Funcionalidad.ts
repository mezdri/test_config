import { EstadoEntidad } from '@/config/enums';

export type RouteViews = 'all' | 'completed' | 'active';

export interface IFuncionalidad {
  id?: number;
  nombre?: string;
  descripcion?: string;
  estado?: EstadoEntidad;
  checked?: boolean;
  children?: any[];
  moduloId?: number;
  pantallaPrincipal?: number;
}

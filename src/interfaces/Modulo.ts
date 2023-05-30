import { EstadoEntidad } from '@/config/enums';

export type RouteViews = 'all' | 'completed' | 'active';

export interface IModulo {
  id?: number;
  nombre?: string;
  descripcion?: string;
  estado?: EstadoEntidad;
  checked?: boolean;
}

export interface AccionesCheck {
  id: number;
  nombre: string;
}

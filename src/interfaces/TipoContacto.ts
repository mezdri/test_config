export type RouteViews = 'all' | 'completed' | 'active';

export interface ITipoContacto {
  id?: number;
  nombre?: string;
  descripcion?: string;
  estado?: number;
  estadoTxt?: string;
}

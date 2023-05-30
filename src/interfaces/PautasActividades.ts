export type RouteViews = 'all' | 'completed' | 'active';

export interface IPautaActividadesInterface {
  id?: number;
  idActividadMantenimiento?: number;
  nombrePauta?: string;
  descripcion?: boolean;
  estado?: boolean;
  tipoActividadMant?: number;
}

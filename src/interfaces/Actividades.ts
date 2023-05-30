export type RouteViews = 'all' | 'completed' | 'active';

export interface IActividadesInterface {
  id?: number;
  nombreActividad?: string;
  descripcion?: string;
  estado?: number;
  fechaMod?: string;
  estadoTxt?: string;
}

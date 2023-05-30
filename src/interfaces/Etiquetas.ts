export type RouteViews = 'all' | 'completed' | 'active';

export interface IEtiqueta {
  id?: number;
  clienteId?: number;
  nombre?: string;
  descripcion?: string;
  estado?: number;
  cantidadVehiculosAsociados?: number;
  checked?: boolean;
}

export type RouteViews = 'all' | 'completed' | 'active';

export interface IInformes {
  tipoinforme?: number;
  fechaInicio?: string;
  fechaFin?: string;
  todasFlotas?: boolean;
  todasEtiquetas?: boolean;
  todosVehiculos?: boolean;
  flotasList?: any[];
  etiquetasList?: any[];
  vehiculosList?: any[];
  actividadList?: any[];
}

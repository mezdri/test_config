export type RouteViews = 'all' | 'completed' | 'active';

export interface ISim {
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  id?: number;
  clienteId?: number;
  numeroSIM?: string;
  tipoSim?: number;
  companiaTelecomunicaciones?: string;
  empresaTelcoId?: number;
  numeroTelefonico?: string;
  estado?: number;
}

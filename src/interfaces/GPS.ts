export type RouteViews = 'all' | 'completed' | 'active';

export interface IGPS {
  id?: number;
  clienteId?: number;
  numeroSerie?: string;
  marca?: number;
  imei?: string;
  estado?: number;
  gpsSims?: any[];
  gpsVehiculos?: any[];
  gpsGeoCerca?: any[];
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  gpsModeloId?: number;
  gpsCoordenada?: any[];
  checked?: boolean;
  listDispositivoId?: number[];
}

import { EstadoEntidad } from '../config/enums';
import { TipoGeometria } from '../config/enums';
import { EstadoEnvioGps } from '../config/enums';

export type RouteViews = 'all' | 'completed' | 'active';

export interface IZona {
  tipozona?: string;
  id?: number;
  cliente?: number;
  estado?: EstadoEntidad;
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  tipoGeometria?: TipoGeometria;
  formaJson?: string;
  notas?: string;
  tipolugar?: string;
  velocidadmax?: number;
  usuarioCreacionId?: number;
  fechaCreacion?: Date;
  tipoZonaId?: number;
  grupoId?: number;
  puntos?: number;
  circulos?: number;
  fechaInicioAsociacion?: string;
  fechaFinAsociacion?: string;
  fechaInicioAsociacionTxt?: string;
  fechaAsociacionFisicaTxt?: string;
  estadoEnvioGps?: number;
  estadoAsociacion?: number;
  velocidadMaxGeo?: number;
  warnPuntos?: boolean;
  warnCirculos?: boolean;
  warnGeocercas?: boolean;
  warnGps?: boolean;
  warnPuntosPorGeo?: boolean;
  warnSoportaCirculos?: boolean;
  fechaAsociacionFisica?: string;
  checked?: boolean;
  estadoAsociacionTxt?: string;
  tiempoEstadia?: number;
}

export interface ITipoLugar {
  id?: number;
  clienteId?: number;
  nombre?: string;
  tipoLugarAlcance?: number;
  descripcion?: string;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface ITipoZona {
  nombre: string;
  id?: number;
}

export interface ITipoLugarCliente {
  id?: number;
  grupoId?: number;
  clienteId?: number;
  fechaInicialAsignacion?: string;
  fechaFinalAsignacion?: string;
}

export interface ICoordenadaVehiculo {
  id?: number;
  coordenadaId?: number;
  vehiculoId?: number;
  gpspId?: number;
  vertices?: number;
  circulos?: number;
  estadoEnvioGps?: EstadoEnvioGps;
  fechaInicialAsignacion?: string;
  fechaFinalAsignacion?: string;
}

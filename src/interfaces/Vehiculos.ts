export type RouteViews = 'all' | 'completed' | 'active';

export interface IVehiculo {
  id?: number;
  vehiculoTipoId?: number;
  vehiculoModeloId?: number;
  vehiculoTipoCombustibleId?: number;
  vehiculoTipoPeajeId?: number;
  vehiculoTipoTransmisionId?: number;
  color?: string;
  ano?: string;
  patente?: string;
  referencia?: string;
  numeroMotor?: string;
  numeroChasis?: string;
  vin?: string;
  unidad?: string;
  poseeTag?: boolean;
  vehiculoTercero?: boolean;
  estado?: number;
  esCompartido?: boolean;
  clienteCompartioId?: number;
  selected?: boolean;
  flota?: number; //Para asociar vehiculos flotas y etiquetas
  etiquetas?: number[];
  checked?: boolean;
  estadoTxt?: string;
  valorRPM?: number;
  horasDisponible?: number;
}
export interface ITipoLicencia {
  id?: number;
  clienteId?: number;
  nombre?: string;
  descripcion?: string;
  claseLicencia?: string;
  clase?: string;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface ITipoVehiculo {
  id?: number;
  clienteId?: number;
  nombre?: string;
  descripcion?: string;
  icono?: string;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  cantidadVehiculos?: number;
}

export interface IMarca {
  id?: number;
  nombre?: string;
}
export interface IModelo {
  id?: number;
  ano?: number;
  marcaId?: number;
  nombre?: string;
  tipoCarroceria?: number;
  estado?: number;
}
export interface ITipoCombustible {
  id?: number;
  nombre?: string;
}
export interface ITipoPeaje {
  id?: number;
  nombre?: string;
  descripcion?: string;
}
export interface ITipoTransmision {
  id?: number;
  nombre?: string;
}
export interface IEtiqueta {
  id?: number;
  clienteId?: number;
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

export interface IVehiculoEtiquetaVehiculo {
  id?: number;
  vehiculoEtiquetaId?: number;
  vehiculoId?: number;
  fechaInicioAsociacion?: string;
  fechaFinAsociacion?: string;
}

export interface IVehiculoFlota {
  id?: number;
  vehiculoId?: number;
  flotaId?: number;
  fechaInicioAsociacion?: string;
  fechaFinAsociacion?: string;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface IVehiculoGPS {
  id?: number;
  nombre?: string;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  vehiculoId?: number;
  gpsId?: number;
  usuarioInstalacionId?: number;
  fechaInicioAsociacion?: Date;
  fechaFinAsociacion?: Date;
  fechaInstalacion?: Date;
  estado?: number;
}

export interface IVehiculoGeocerca {
  id?: number;
  vehiculoId?: number;
  tipoVehiculo?: string;
  gpsId?: number;
  patente?: string;
  vin?: string;
  estado?: number;
  imei?: string;
  modeloGps?: string;
  nroSerie?: string;
  nroSim?: string;
  limitePuntos?: number;
  limiteCirculos?: number;
  puntosAlmacenados?: number;
  circulosAlmacenados?: number;
  fechaInicioAsociacion?: string;
  fechaFinAsociacion?: string;
  estadoAsociacion?: number;
  esCompartido?: boolean;
  compartidoPor?: string;
  geocercasAlmacenadas?: number;
  limiteGeocercas?: number;
  limitePuntosPorGeocerca?: number;
  unidad?: string;
  warnPuntos?: boolean;
  warnCirculos?: boolean;
  warnGeocercas?: boolean;
  warnGps?: boolean;
  warnPuntosPorGeo?: boolean;
  warnSoportaCirculos?: boolean;
  fechaAsociacionFisica?: string;
  selected?: boolean;
  estadoTxt?: string;
}

import moment from 'moment';
export type RouteViews = 'all' | 'completed' | 'active';

export interface CertificadosInterface {
  id?: number;
  nombre?: string;
  estado?: number;
  tipoCertificadoId?: number;
  firmaCertificadoId?: number;
  tipoCertificado?: any;
  firmaCertificado?: any;
}

export interface CertificadosBackend {
  id?: number;
  nombre?: string;
  estado?: number;
  jsonConfig?: string;
  tipoCertificadoId?: number;
  tipoCertificado?: string;
  firmaCertificadoId?: number;
  firmaCertificado?: string;
  usuarioCreadorTxt?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacionTxt?: string;
  fechaModificacion?: moment.Moment;
  estadoTxt?: string;
}

export interface CertificadoBaseCliente {
  id?: number;
  nombre?: string;
  estado?: number;
  jsonConfig?: string;
  tipoCertificadoId?: number;
  firmaCertificadoId?: number;
  contenido?: Contenido;
}

export interface TiposCertificadosBackend {
  id?: number;
  nombre?: string;
}

export interface FirmasCertificadosBackend {
  id?: number;
  nombre?: string;
}

export interface InformacionVehiculo {
  visible?: boolean;
  marca?: Marca;
  modelo?: Modelo;
  anio?: Anio;
  tipoVehiculo?: TipoVehiculo;
}

export interface Marca {
  visible?: boolean;
  requerido?: boolean;
}

export interface Modelo {
  visible?: boolean;
  requerido?: boolean;
}

export interface Anio {
  visible?: boolean;
  requerido?: boolean;
}
export interface TipoVehiculo {
  visible?: boolean;
  requerido?: boolean;
}

export interface InformacionGps {
  visible?: boolean;
  serie?: Serie;
  tipoGps?: TipoGps;
}

export interface Serie {
  visible?: boolean;
  requerido?: boolean;
}

export interface TipoGps {
  visible?: boolean;
  requerido?: boolean;
}

export interface Anexo {
  visible?: boolean;
  contenido?: string;
}

export interface Texto {
  glosa?: string;
  activo?: boolean;
  anexo?: string;
}

export interface Gps {
  datosGps?: boolean;
  serieGps?: boolean;
  tipoGps?: boolean;
  datosVehiculo?: boolean;
  marca?: boolean;
  modelo?: boolean;
  anio?: boolean;
  tipovehiculo?: boolean;
}

export interface Contenido {
  informacionVehiculo?: InformacionVehiculo;
  informacionGps?: InformacionGps;
  anexo?: Anexo;
  codigoQr?: boolean;
  glosa?: string;
  fechaExpiracion?: boolean;
  logoTercero?: any;
}

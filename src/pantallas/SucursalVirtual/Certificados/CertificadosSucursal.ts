export interface FlotaI {
  data?: string[];
}

export interface PatentesI {
  id: string;
  nombre: string;
}

export interface TypesTemplatesI {
  templates?: Templates[];
}

export interface Templates {
  id: string;
  nombre: string;
}

export interface dataPatente {
  razon_social: string;
  rut: string;
  plataforma: string;
  patente: string;
  flota: string;
}

export interface SaveCertificadoI {
  data?: dataPatente[];
}

export interface DispositivoGpsI {
  dispositivo?: string;
}

export interface BaseTemplate {
  id: string;
  id_cliente: string;
  rut: string;
  nombre: string;
  descripcion: string;
  template: any;
}

export interface MSresponseSV<T> {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  templates: T[];
}

export interface MSresponseDispositivos {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  dispositivo: string;
}

export interface MSSaveCertificado {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  id_reporte: string;
}

export interface MSNameEmpresa<T> {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  data: T;
}

export interface NombreEmpresa {
  nombre: string;
}

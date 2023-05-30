export interface CamaraRelacionadaI {
  id_camara: string;
  patente: string;
  modelo: string;
  marca: string;
}

export interface FlotasI {
  cod_flota: string;
  nom_flota: string;
}

export interface Flotas {
  id: string;
  nombre: string;
}

export interface DataAsociadaDispositivoI {
  cod_flota: number;
  cod_vehiculo: string;
  nom_flota: string;
}

export interface EsquemaFlotaI {
  esquema_bd: string;
}

export interface DataClasificadaI {
  user_id: string;
  patente: string;
  id_camara: string;
}

export interface VehiculoRequestI {
  cod_flota: string;
  user_id: string;
  filter?: string;
}

export interface DataBitacoraI {
  user_id: string;
  fecha_modificacion?: object;
  funcionalidad?: string;
  accion?: string;
  tabla?: string;
}

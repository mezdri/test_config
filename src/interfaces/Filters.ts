import { string } from 'yup';

export interface FilterI {
  client?: ClientFilterI;
  flota?: FlotaFilterI;
  patente?: PatenteFilterI;
}

export interface ClientFilterI {
  id: string; // "2",
  rut: string; // "11067116-4",
  nombre: string; // "TEST"
}

export interface PatenteFilterI {
  nombre: string;
}

export interface FlotaFilterI {
  id: string; //"1";
  nombre: string; //"Flota Base";
  // clienteid: string; //"1";

  // check if we need it
  // responsableflotaid: string;//"1";
  // responsablemantenimientoflotaid: string;//"1";
  // descripcion: string;//"Flota Base";
  // estado: string;//"3";
  // usuariocreadorid: string;//"1";
  // fechacreacion: string;//"2019-11-27 12:11:59";
  // usuariomodificacionid: string;//"";
  // fechamodificacion: string;//"";
  // rowversion: string;//"142463;
  // padreid: string;//"";
}

export interface VehiculoFilterI {
  id: string;
  cod_vehiculo: string;
  cod_flota: string;
  patente_vehiculo: string;
}

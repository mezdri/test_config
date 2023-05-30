export interface ControlDispositivosInterface {
  id_dispositivo: string;
  tipo_dispositivo: string;
  marca: string;
}

export interface ControlVehiculoInfo {
  cod_vehiculo: string;
  __nom_flota: string;
  mandante: string;
  marca: string;
  patente_vehiculo: string;
  __desc_tipo_vehiculo: string;
  __desc_grupo_vehiculo: string;
  ignicion_ult_act: string;
  num_sat_ult_act: string;
  hdop_ult_act: string;
  fecha_actividad: string;
  date_diff: string;
  esquema_bd: string;
}

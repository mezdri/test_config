export interface ActivarIntegracionInterface {
  cod_vehiculo: string;
  cod_flota: string;
  patente_vehiculo: string;
  avl_chile: string;
  wisetrack_insertarposicion: string;
  cmp_btrack: string;
  log_solutions: string;
  int_samtech_cim: string;
  beetrack: string;
  owl: string;
  heligrafics: string;
  qanalytics: string;
  samtech_dch: string;
  int_codelco: string;
  int_camion_go: string;
}

export interface ConfigIntegracionInterface {
  avl_chile: boolean;
  wisetrack_insertarposicion: boolean;
  cmp_btrack: boolean;
  log_solutions: boolean;
  int_samtech_cim: boolean;
  beetrack: boolean;
  owl: boolean;
  heligrafics: boolean;
  qanalytics: boolean;
  samtech_dch: boolean;
  int_codelco: boolean;
  int_camion_go: boolean;
}

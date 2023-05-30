export interface ControlFlotasInterface {
  cod_flota: string; // "9763",
  __nom_flota: string; // "Pascual Pizarro",
  total_vehiculos: number;
  transm_today: number;
  transm_percent: number;
  nt_week: number;
  nt_week_percent: number;
  nt_month: number;
  nt_month_percent: number;
  nt_plusmonth: number;
  nt_plusmonth_percent: number;
  nt_never: number;
  nt_never_percent: number;
  uri: string;
}

export interface ControlVehiculosInterface {
  cod_vehiculo: string;
  patente_vehiculo: string;
  color: string;
  avl: string;
  activo: string;
  colorIndices: {
    red: number[];
    green: number[];
    yellow: number[];
  };
}

export interface HexagonCellData {
  cod_vehiculo: string;
  patente_vehiculo: string;
  color: string;
  avl: string;
  activo: string;
  colorIndices: {
    red: number[];
    green: number[];
    yellow: number[];
  };
}

export interface HexagonCellObj {
  index: number;
  row: number;
  col: number;
  hexagonClass: string | undefined;
  borderSize: number | undefined;
  borderColor: string | undefined;
  backgroundColor: string | undefined;
  backgroundImage: string | undefined;
  text: string | undefined;
  textStyle: object | undefined;
  data: HexagonCellData;
}

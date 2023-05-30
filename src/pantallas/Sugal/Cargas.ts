import moment from 'moment';
import { EstadoEntidad } from '@/config/enums';

export type ListaCargas = {
  cargas: Cargas[];
};

export type Cargas = {
  id_carga: string;
  id_estadia_sitio: string;
  cod_cosechadora: string;
  cod_planta: string;
  est_carga: string;
  cod_vehiculo: string;
  cod_tipo_sitio: string;
  cod_sitio: string;
  num_act_entrada: string;
  fec_hora_entrada: string;
  num_act_salida: string;
  fec_hora_salida: string;
  nro_tiempo_estadia: string;
};

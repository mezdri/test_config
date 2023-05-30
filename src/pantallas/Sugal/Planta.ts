import moment from 'moment';
import { EstadoEntidad } from '@/config/enums';

export type Plantas = {
  planta: Planta[];
  codigo_Respuesta: string;
  mensaje_Respuesta: string;
};

export type Planta = {
  cod_planta: number;
  nom_Planta: string;
  cod_sitio_cliente: number;
};
